import { get } from 'svelte/store';
import { currentUser, unifiedCards } from '$lib/stores/unified';
import type { UnifiedCard, UnifiedUser, CommunityPost, Notification } from '$lib/types/unified';

/**
 * Social Actions Utility
 *
 * Provides functions for like, comment, follow actions with:
 * - Store updates
 * - PocketBase synchronization
 * - Notification triggering
 * - Error handling
 */

// ============================================================================
// Like Actions
// ============================================================================

export async function likeCard(cardId: string): Promise<void> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to like cards');
  }

  const cards = get(unifiedCards);
  const card = cards.get(cardId);

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  // Update local state
  const updatedCard: UnifiedCard = {
    ...card,
    community: {
      ...card.community,
      metadata: {
        ...card.community.metadata,
        likes: card.community.metadata.likes + 1,
      },
    },
  };

  // Update store
  const updatedCards = new Map(cards);
  updatedCards.set(cardId, updatedCard);
  unifiedCards.set(updatedCards);

  // TODO: Sync to PocketBase
  // await pb.collection('cards').update(cardId, {
  //   'community.metadata.likes': updatedCard.community.metadata.likes
  // });

  // Trigger notification for creator
  await createNotification({
    recipientId: card.community.creator,
    type: 'card_like',
    actorId: user.id,
    actorName: user.username,
    cardId: cardId,
    cardTitle: card.title,
    message: `${user.username}님이 회원님의 카드를 좋아합니다`,
  });
}

export async function unlikeCard(cardId: string): Promise<void> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to unlike cards');
  }

  const cards = get(unifiedCards);
  const card = cards.get(cardId);

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  // Update local state
  const updatedCard: UnifiedCard = {
    ...card,
    community: {
      ...card.community,
      metadata: {
        ...card.community.metadata,
        likes: Math.max(0, card.community.metadata.likes - 1),
      },
    },
  };

  // Update store
  const updatedCards = new Map(cards);
  updatedCards.set(cardId, updatedCard);
  unifiedCards.set(updatedCards);

  // TODO: Sync to PocketBase
  // await pb.collection('cards').update(cardId, {
  //   'community.metadata.likes': updatedCard.community.metadata.likes
  // });
}

// ============================================================================
// Comment Actions
// ============================================================================

export interface CommentData {
  cardId: string;
  text: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

export async function addComment(data: CommentData): Promise<Comment> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to comment');
  }

  const cards = get(unifiedCards);
  const card = cards.get(data.cardId);

  if (!card) {
    throw new Error(`Card ${data.cardId} not found`);
  }

  // Create comment object
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    authorId: user.id,
    authorName: user.username,
    text: data.text,
    createdAt: new Date(),
  };

  // TODO: Save to PocketBase
  // await pb.collection('comments').create({
  //   cardId: data.cardId,
  //   authorId: user.id,
  //   text: data.text,
  // });

  // Trigger notification for creator
  if (card.community.creator !== user.id) {
    await createNotification({
      recipientId: card.community.creator,
      type: 'card_comment',
      actorId: user.id,
      actorName: user.username,
      cardId: data.cardId,
      cardTitle: card.title,
      message: `${user.username}님이 댓글을 남겼습니다: "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`,
    });
  }

  return comment;
}

// ============================================================================
// Follow Actions
// ============================================================================

export async function followUser(targetUserId: string): Promise<void> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to follow users');
  }

  if (user.id === targetUserId) {
    throw new Error('Cannot follow yourself');
  }

  // Update current user's following count
  const updatedUser: UnifiedUser = {
    ...user,
    creatorProfile: {
      ...user.creatorProfile,
      stats: {
        ...user.creatorProfile.stats,
        following: user.creatorProfile.stats.following + 1,
      },
    },
  };

  currentUser.set(updatedUser);

  // TODO: Sync to PocketBase
  // await pb.collection('users').update(user.id, {
  //   'creatorProfile.stats.following': updatedUser.creatorProfile.stats.following
  // });

  // TODO: Update target user's follower count
  // await pb.collection('users').update(targetUserId, {
  //   'creatorProfile.stats.followers+': 1
  // });

  // Trigger notification for target user
  await createNotification({
    recipientId: targetUserId,
    type: 'new_follower',
    actorId: user.id,
    actorName: user.username,
    message: `${user.username}님이 팔로우하기 시작했습니다`,
  });
}

export async function unfollowUser(targetUserId: string): Promise<void> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to unfollow users');
  }

  // Update current user's following count
  const updatedUser: UnifiedUser = {
    ...user,
    creatorProfile: {
      ...user.creatorProfile,
      stats: {
        ...user.creatorProfile.stats,
        following: Math.max(0, user.creatorProfile.stats.following - 1),
      },
    },
  };

  currentUser.set(updatedUser);

  // TODO: Sync to PocketBase
  // await pb.collection('users').update(user.id, {
  //   'creatorProfile.stats.following': updatedUser.creatorProfile.stats.following
  // });

  // TODO: Update target user's follower count
  // await pb.collection('users').update(targetUserId, {
  //   'creatorProfile.stats.followers-': 1
  // });
}

// ============================================================================
// Notification System
// ============================================================================

interface NotificationPayload {
  recipientId: string;
  type: 'card_like' | 'card_comment' | 'new_follower' | 'level_up';
  actorId: string;
  actorName: string;
  cardId?: string;
  cardTitle?: string;
  message: string;
}

async function createNotification(payload: NotificationPayload): Promise<void> {
  // TODO: Create notification in PocketBase
  // await pb.collection('notifications').create({
  //   recipientId: payload.recipientId,
  //   type: payload.type,
  //   actorId: payload.actorId,
  //   actorName: payload.actorName,
  //   cardId: payload.cardId,
  //   cardTitle: payload.cardTitle,
  //   message: payload.message,
  //   read: false,
  //   createdAt: new Date().toISOString(),
  // });

  // For now, just log
  console.log('Notification created:', payload);
}

// ============================================================================
// Card Sharing
// ============================================================================

export interface ShareCardData {
  cardId: string;
  caption: string;
  visibility: 'public' | 'fanclub' | 'followers';
  fanclubId?: string;
}

export async function shareCard(data: ShareCardData): Promise<CommunityPost> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to share cards');
  }

  const cards = get(unifiedCards);
  const card = cards.get(data.cardId);

  if (!card) {
    throw new Error(`Card ${data.cardId} not found`);
  }

  // Create community post
  const post: CommunityPost = {
    id: `post-${Date.now()}`,
    cardId: data.cardId,
    creatorId: user.id,
    creatorName: user.username,
    creatorAvatar: user.avatar,
    caption: data.caption,
    visibility: data.visibility,
    fanclubId: data.fanclubId,
    likes: 0,
    comments: [],
    createdAt: new Date(),
  };

  // TODO: Save to PocketBase
  // await pb.collection('community_posts').create({
  //   cardId: data.cardId,
  //   creatorId: user.id,
  //   caption: data.caption,
  //   visibility: data.visibility,
  //   fanclubId: data.fanclubId,
  // });

  return post;
}

// ============================================================================
// Template Saving
// ============================================================================

export async function saveAsTemplate(cardId: string): Promise<void> {
  const user = get(currentUser);
  if (!user) {
    throw new Error('User must be authenticated to save templates');
  }

  const cards = get(unifiedCards);
  const card = cards.get(cardId);

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  // TODO: Create template in PocketBase
  // await pb.collection('templates').create({
  //   originalCardId: cardId,
  //   userId: user.id,
  //   title: card.title,
  //   holographic: card.holographic,
  //   createdAt: new Date().toISOString(),
  // });

  console.log('Template saved:', cardId);
}
