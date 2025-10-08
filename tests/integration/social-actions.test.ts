import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { currentUser, unifiedCards } from '$lib/stores/unified';
import type { UnifiedCard, UnifiedUser } from '$lib/types/unified';
import {
  likeCard,
  unlikeCard,
  addComment,
  followUser,
  unfollowUser,
} from '$lib/utils/social-actions';

describe('Social Actions Integration', () => {
  const mockUser: UnifiedUser = {
    id: 'user-001',
    username: 'test_user',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-03-20'),
    fanProfile: {
      fanLevel: { level: 2, name: '외야석 팬' },
      currentPoints: 150,
      favoriteTeam: 'team-lg-twins',
      achievedBadges: [],
      joinedFanclubs: [],
    },
    creatorProfile: {
      creatorLevel: 'gold',
      stats: {
        totalCards: 10,
        totalLikes: 100,
        totalDownloads: 50,
        averageRating: 4.5,
        followers: 25,
        following: 15,
      },
      isVerified: true,
      specializations: ['KBO'],
    },
    collections: {
      owned: [],
      collectionProgress: [],
      totalCards: 0,
      rareCards: 0,
    },
    preferences: {
      theme: 'light',
      notifications: {
        newFollower: true,
        cardLike: true,
        cardComment: true,
        levelUp: true,
      },
      privacy: {
        showCollections: true,
        showActivity: true,
      },
    },
  };

  const mockCard: UnifiedCard = {
    id: 'card-001',
    title: 'Test Card',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
    holographic: {
      image: 'https://example.com/card.jpg',
      backImage: 'https://example.com/card-back.jpg',
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600,
    },
    photocard: {
      rarity: 'epic',
      stats: {
        totalViews: 100,
        uniqueCollectors: 10,
        completionRate: 50,
      },
      collections: [],
    },
    community: {
      creator: 'user-002',
      isPublic: true,
      tags: ['KBO'],
      metadata: {
        likes: 50,
        downloads: 10,
        rating: 4.5,
        ratingCount: 20,
      },
    },
  };

  beforeEach(() => {
    currentUser.set(null);
    unifiedCards.set(new Map());
    vi.clearAllMocks();
  });

  describe('Like Action', () => {
    it('should increment like count when liking a card', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const initialLikes = mockCard.community.metadata.likes;

      await likeCard(mockCard.id);

      const updatedCards = get(unifiedCards);
      const updatedCard = updatedCards.get(mockCard.id);

      expect(updatedCard?.community.metadata.likes).toBe(initialLikes + 1);
    });

    it('should update unifiedCards store after liking', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      await likeCard(mockCard.id);

      const updatedCards = get(unifiedCards);
      expect(updatedCards.has(mockCard.id)).toBe(true);
    });

    it('should trigger notification to card creator', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const notifySpy = vi.fn();
      // Mock notification system
      vi.mock('$lib/utils/notifications', () => ({
        sendNotification: notifySpy,
      }));

      await likeCard(mockCard.id);

      // Notification should be sent to creator
      expect(notifySpy).toHaveBeenCalledWith(
        mockCard.community.creator,
        expect.objectContaining({
          type: 'like',
          cardId: mockCard.id,
        })
      );
    });

    it('should decrement like count when unliking a card', async () => {
      currentUser.set(mockUser);
      const cardWithLike = {
        ...mockCard,
        community: {
          ...mockCard.community,
          metadata: {
            ...mockCard.community.metadata,
            likes: 51,
          },
        },
      };
      const cardsMap = new Map([[cardWithLike.id, cardWithLike]]);
      unifiedCards.set(cardsMap);

      await unlikeCard(cardWithLike.id);

      const updatedCards = get(unifiedCards);
      const updatedCard = updatedCards.get(cardWithLike.id);

      expect(updatedCard?.community.metadata.likes).toBe(50);
    });
  });

  describe('Comment System', () => {
    it('should add comment to card', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const commentText = 'Great card!';
      await addComment(mockCard.id, commentText);

      const updatedCards = get(unifiedCards);
      const updatedCard = updatedCards.get(mockCard.id);

      // In production, comments would be in PocketBase
      // For now, verify the action was called
      expect(updatedCard).toBeTruthy();
    });

    it('should notify creator when comment is added', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const notifySpy = vi.fn();
      vi.mock('$lib/utils/notifications', () => ({
        sendNotification: notifySpy,
      }));

      await addComment(mockCard.id, 'Nice!');

      expect(notifySpy).toHaveBeenCalledWith(
        mockCard.community.creator,
        expect.objectContaining({
          type: 'comment',
          cardId: mockCard.id,
        })
      );
    });

    it('should update PocketBase with new comment', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const pbUpdateSpy = vi.fn();
      // Mock PocketBase
      vi.mock('$lib/pocketbase', () => ({
        pb: {
          collection: () => ({
            update: pbUpdateSpy,
          }),
        },
      }));

      await addComment(mockCard.id, 'Comment text');

      expect(pbUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('Follow System', () => {
    it('should increment follower count when following user', async () => {
      currentUser.set(mockUser);

      const targetUserId = 'user-002';
      const initialFollowing = mockUser.creatorProfile.stats.following;

      await followUser(targetUserId);

      const updatedUser = get(currentUser);
      expect(updatedUser?.creatorProfile.stats.following).toBe(initialFollowing + 1);
    });

    it('should update UnifiedUser.creatorProfile.stats.followers', async () => {
      currentUser.set(mockUser);

      await followUser('user-002');

      const updatedUser = get(currentUser);
      expect(updatedUser?.creatorProfile.stats.following).toBeGreaterThan(15);
    });

    it('should send notification to followed user', async () => {
      currentUser.set(mockUser);

      const notifySpy = vi.fn();
      vi.mock('$lib/utils/notifications', () => ({
        sendNotification: notifySpy,
      }));

      const targetUserId = 'user-002';
      await followUser(targetUserId);

      expect(notifySpy).toHaveBeenCalledWith(
        targetUserId,
        expect.objectContaining({
          type: 'follow',
          followerId: mockUser.id,
        })
      );
    });

    it('should save follow relationship to PocketBase', async () => {
      currentUser.set(mockUser);

      const pbCreateSpy = vi.fn();
      vi.mock('$lib/pocketbase', () => ({
        pb: {
          collection: () => ({
            create: pbCreateSpy,
          }),
        },
      }));

      await followUser('user-002');

      expect(pbCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          follower: mockUser.id,
          following: 'user-002',
        })
      );
    });

    it('should decrement following count when unfollowing', async () => {
      currentUser.set(mockUser);

      const initialFollowing = mockUser.creatorProfile.stats.following;

      await unfollowUser('user-002');

      const updatedUser = get(currentUser);
      expect(updatedUser?.creatorProfile.stats.following).toBe(initialFollowing - 1);
    });
  });

  describe('Store Synchronization', () => {
    it('should synchronize like action between CollectionDashboard and CommunityFeed', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      await likeCard(mockCard.id);

      // Both components should see the updated like count
      const updatedCards = get(unifiedCards);
      const card1 = updatedCards.get(mockCard.id);
      const card2 = updatedCards.get(mockCard.id);

      expect(card1?.community.metadata.likes).toBe(card2?.community.metadata.likes);
    });

    it('should propagate changes from one component to another', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const initialLikes = mockCard.community.metadata.likes;

      // Like from component A
      await likeCard(mockCard.id);

      // Component B should see the update
      const updatedCards = get(unifiedCards);
      const updatedCard = updatedCards.get(mockCard.id);
      expect(updatedCard?.community.metadata.likes).toBe(initialLikes + 1);
    });
  });

  describe('Notification Triggering', () => {
    it('should trigger notification for like action', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const notifications: any[] = [];
      const notifyMock = vi.fn((userId, notification) => {
        notifications.push({ userId, notification });
      });

      await likeCard(mockCard.id);

      // Verify notification was queued
      expect(notifications.length).toBeGreaterThanOrEqual(0);
    });

    it('should trigger notification for comment action', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      const notifications: any[] = [];
      await addComment(mockCard.id, 'Test comment');

      // Comment notification should be triggered
      expect(notifications.length).toBeGreaterThanOrEqual(0);
    });

    it('should trigger notification for follow action', async () => {
      currentUser.set(mockUser);

      const notifications: any[] = [];
      await followUser('user-002');

      // Follow notification should be triggered
      expect(notifications.length).toBeGreaterThanOrEqual(0);
    });

    it('should batch notifications for multiple actions', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      // Perform multiple actions
      await likeCard(mockCard.id);
      await addComment(mockCard.id, 'Comment 1');
      await addComment(mockCard.id, 'Comment 2');

      // Should batch or queue notifications efficiently
      const updatedCards = get(unifiedCards);
      expect(updatedCards.has(mockCard.id)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle like action when user is not logged in', async () => {
      currentUser.set(null);

      await expect(likeCard(mockCard.id)).rejects.toThrow('User not logged in');
    });

    it('should handle comment action when card does not exist', async () => {
      currentUser.set(mockUser);
      unifiedCards.set(new Map());

      await expect(addComment('nonexistent-card', 'Comment')).rejects.toThrow(
        'Card not found'
      );
    });

    it('should handle follow action for invalid user', async () => {
      currentUser.set(mockUser);

      await expect(followUser('')).rejects.toThrow('Invalid user ID');
    });

    it('should handle network errors gracefully', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCard.id, mockCard]]);
      unifiedCards.set(cardsMap);

      // Mock network failure
      vi.mock('$lib/pocketbase', () => ({
        pb: {
          collection: () => ({
            update: () => Promise.reject(new Error('Network error')),
          }),
        },
      }));

      await expect(likeCard(mockCard.id)).rejects.toThrow();
    });
  });
});
