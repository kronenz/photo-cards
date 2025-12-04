// Social Graph and Follow System Service

import { pb } from '$lib/pocketbase';
import { writable, type Writable } from 'svelte/store';
import type { UserProfile } from '$lib/types/auth';

export interface FollowRelationship {
	id: string;
	followerId: string;
	followingId: string;
	created: string;
}

export interface SocialStats {
	followers: number;
	following: number;
	mutualFollows: number;
}

export interface UserConnection {
	user: UserProfile;
	relationship: 'following' | 'follower' | 'mutual' | 'none';
	followedAt?: string;
	mutualConnections: number;
}

export interface FeedItem {
	id: string;
	type: 'card_created' | 'card_liked' | 'user_followed' | 'grade_upgraded' | 'achievement_earned';
	userId: string;
	user: UserProfile;
	content: any;
	timestamp: string;
	metadata?: Record<string, any>;
}

export interface SocialRecommendation {
	user: UserProfile;
	reason: 'same_team' | 'similar_interests' | 'mutual_connections' | 'high_activity' | 'new_user';
	score: number;
	description: string;
}

class SocialService {
	// Reactive stores
	public followers: Writable<UserProfile[]> = writable([]);
	public following: Writable<UserProfile[]> = writable([]);
	public socialStats: Writable<SocialStats> = writable({ followers: 0, following: 0, mutualFollows: 0 });
	public personalizedFeed: Writable<FeedItem[]> = writable([]);
	public recommendations: Writable<SocialRecommendation[]> = writable([]);

	/**
	 * Follow a user
	 */
	async followUser(targetUserId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		const currentUserId = pb.authStore.model.id;
		
		if (currentUserId === targetUserId) {
			throw new Error('Cannot follow yourself');
		}

		try {
			// Check if already following
			const existingFollow = await pb.collection('follows').getFirstListItem(
				`follower="${currentUserId}" && following="${targetUserId}"`
			).catch(() => null);

			if (existingFollow) {
				return false; // Already following
			}

			// Create follow relationship
			await pb.collection('follows').create({
				follower: currentUserId,
				following: targetUserId
			});

			// Update follower count for target user
			await this.updateFollowerCount(targetUserId);
			
			// Update following count for current user
			await this.updateFollowingCount(currentUserId);

			// Refresh social data
			await this.refreshSocialData(currentUserId);

			// Create feed item
			await this.createFeedItem({
				type: 'user_followed',
				userId: currentUserId,
				content: { targetUserId },
				metadata: { action: 'follow' }
			});

			return true;
		} catch (error) {
			console.error('Failed to follow user:', error);
			throw error;
		}
	}

	/**
	 * Unfollow a user
	 */
	async unfollowUser(targetUserId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		const currentUserId = pb.authStore.model.id;

		try {
			// Find and delete follow relationship
			const followRecord = await pb.collection('follows').getFirstListItem(
				`follower="${currentUserId}" && following="${targetUserId}"`
			);

			if (followRecord) {
				await pb.collection('follows').delete(followRecord.id);

				// Update counts
				await this.updateFollowerCount(targetUserId);
				await this.updateFollowingCount(currentUserId);

				// Refresh social data
				await this.refreshSocialData(currentUserId);

				return true;
			}

			return false; // Wasn't following
		} catch (error) {
			console.error('Failed to unfollow user:', error);
			throw error;
		}
	}

	/**
	 * Check if current user is following target user
	 */
	async isFollowing(targetUserId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			return false;
		}

		const currentUserId = pb.authStore.model.id;

		try {
			const followRecord = await pb.collection('follows').getFirstListItem(
				`follower="${currentUserId}" && following="${targetUserId}"`
			).catch(() => null);

			return !!followRecord;
		} catch (error) {
			console.error('Failed to check follow status:', error);
			return false;
		}
	}

	/**
	 * Get followers list
	 */
	async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<UserConnection[]> {
		try {
			const follows = await pb.collection('follows').getList(page, limit, {
				filter: `following="${userId}"`,
				expand: 'follower',
				sort: '-created'
			});

			const connections: UserConnection[] = [];
			
			for (const follow of follows.items) {
				if (follow.expand?.follower) {
					const user = this.mapToUserProfile(follow.expand.follower);
					const mutualConnections = await this.getMutualConnectionsCount(user.id, userId);
					
					connections.push({
						user,
						relationship: await this.getRelationshipType(user.id, userId),
						followedAt: follow.created,
						mutualConnections
					});
				}
			}

			return connections;
		} catch (error) {
			console.error('Failed to get followers:', error);
			return [];
		}
	}

	/**
	 * Get following list
	 */
	async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<UserConnection[]> {
		try {
			const follows = await pb.collection('follows').getList(page, limit, {
				filter: `follower="${userId}"`,
				expand: 'following',
				sort: '-created'
			});

			const connections: UserConnection[] = [];
			
			for (const follow of follows.items) {
				if (follow.expand?.following) {
					const user = this.mapToUserProfile(follow.expand.following);
					const mutualConnections = await this.getMutualConnectionsCount(userId, user.id);
					
					connections.push({
						user,
						relationship: await this.getRelationshipType(userId, user.id),
						followedAt: follow.created,
						mutualConnections
					});
				}
			}

			return connections;
		} catch (error) {
			console.error('Failed to get following:', error);
			return [];
		}
	}

	/**
	 * Get personalized feed
	 */
	async getPersonalizedFeed(page: number = 1, limit: number = 20): Promise<FeedItem[]> {
		if (!pb.authStore.model?.id) {
			return [];
		}

		const currentUserId = pb.authStore.model.id;

		try {
			// Get users that current user follows
			const following = await pb.collection('follows').getFullList({
				filter: `follower="${currentUserId}"`,
				fields: 'following'
			});

			const followingIds = following.map(f => f.following);
			
			if (followingIds.length === 0) {
				// If not following anyone, return general feed
				return this.getGeneralFeed(page, limit);
			}

			// Get feed items from followed users
			const feedItems = await pb.collection('feed_items').getList(page, limit, {
				filter: followingIds.map(id => `user="${id}"`).join(' || '),
				expand: 'user',
				sort: '-created'
			});

			return feedItems.items.map(item => this.mapToFeedItem(item));
		} catch (error) {
			console.error('Failed to get personalized feed:', error);
			return [];
		}
	}

	/**
	 * Get user recommendations
	 */
	async getUserRecommendations(limit: number = 10): Promise<SocialRecommendation[]> {
		if (!pb.authStore.model?.id) {
			return [];
		}

		const currentUserId = pb.authStore.model.id;
		const currentUser = await pb.collection('users').getOne(currentUserId);

		try {
			const recommendations: SocialRecommendation[] = [];

			// Get users with same favorite team
			if (currentUser.favoriteTeam) {
				const sameTeamUsers = await pb.collection('users').getList(1, 5, {
					filter: `favoriteTeam="${currentUser.favoriteTeam}" && id!="${currentUserId}"`,
					sort: '-stats.gradePoints'
				});

				for (const user of sameTeamUsers.items) {
					if (!(await this.isFollowing(user.id))) {
						recommendations.push({
							user: this.mapToUserProfile(user),
							reason: 'same_team',
							score: 0.8,
							description: `같은 ${user.favoriteTeam} 팬입니다`
						});
					}
				}
			}

			// Get users with mutual connections
			const mutualUsers = await this.findUsersWithMutualConnections(currentUserId, 3);
			for (const { user, mutualCount } of mutualUsers) {
				if (!(await this.isFollowing(user.id))) {
					recommendations.push({
						user,
						reason: 'mutual_connections',
						score: 0.7 + (mutualCount * 0.1),
						description: `${mutualCount}명의 공통 팔로우가 있습니다`
					});
				}
			}

			// Get highly active users
			const activeUsers = await pb.collection('users').getList(1, 3, {
				filter: `id!="${currentUserId}" && stats.monthlyActive=true`,
				sort: '-stats.gradePoints'
			});

			for (const user of activeUsers.items) {
				if (!(await this.isFollowing(user.id))) {
					recommendations.push({
						user: this.mapToUserProfile(user),
						reason: 'high_activity',
						score: 0.6,
						description: `활발한 카드 크리에이터입니다`
					});
				}
			}

			// Sort by score and return top recommendations
			return recommendations
				.sort((a, b) => b.score - a.score)
				.slice(0, limit);
		} catch (error) {
			console.error('Failed to get user recommendations:', error);
			return [];
		}
	}

	/**
	 * Get team-based fan network
	 */
	async getTeamFanNetwork(teamId: string, page: number = 1, limit: number = 20): Promise<UserConnection[]> {
		try {
			const teamFans = await pb.collection('users').getList(page, limit, {
				filter: `favoriteTeam="${teamId}"`,
				sort: '-stats.gradePoints'
			});

			const connections: UserConnection[] = [];
			const currentUserId = pb.authStore.model?.id;

			for (const fan of teamFans.items) {
				if (fan.id !== currentUserId) {
					const user = this.mapToUserProfile(fan);
					const relationship = currentUserId ? await this.getRelationshipType(currentUserId, fan.id) : 'none';
					const mutualConnections = currentUserId ? await this.getMutualConnectionsCount(currentUserId, fan.id) : 0;

					connections.push({
						user,
						relationship,
						mutualConnections
					});
				}
			}

			return connections;
		} catch (error) {
			console.error('Failed to get team fan network:', error);
			return [];
		}
	}

	/**
	 * Update follower count for user
	 */
	private async updateFollowerCount(userId: string): Promise<void> {
		try {
			const followerCount = await pb.collection('follows').getList(1, 1, {
				filter: `following="${userId}"`,
				fields: 'id'
			});

			await pb.collection('users').update(userId, {
				'stats.followers': followerCount.totalItems
			});
		} catch (error) {
			console.error('Failed to update follower count:', error);
		}
	}

	/**
	 * Update following count for user
	 */
	private async updateFollowingCount(userId: string): Promise<void> {
		try {
			const followingCount = await pb.collection('follows').getList(1, 1, {
				filter: `follower="${userId}"`,
				fields: 'id'
			});

			await pb.collection('users').update(userId, {
				'stats.following': followingCount.totalItems
			});
		} catch (error) {
			console.error('Failed to update following count:', error);
		}
	}

	/**
	 * Get relationship type between two users
	 */
	private async getRelationshipType(userId1: string, userId2: string): Promise<'following' | 'follower' | 'mutual' | 'none'> {
		try {
			const [isFollowing, isFollower] = await Promise.all([
				this.checkFollowRelationship(userId1, userId2),
				this.checkFollowRelationship(userId2, userId1)
			]);

			if (isFollowing && isFollower) return 'mutual';
			if (isFollowing) return 'following';
			if (isFollower) return 'follower';
			return 'none';
		} catch (error) {
			console.error('Failed to get relationship type:', error);
			return 'none';
		}
	}

	/**
	 * Check if user1 follows user2
	 */
	private async checkFollowRelationship(followerId: string, followingId: string): Promise<boolean> {
		try {
			const follow = await pb.collection('follows').getFirstListItem(
				`follower="${followerId}" && following="${followingId}"`
			).catch(() => null);

			return !!follow;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Get mutual connections count
	 */
	private async getMutualConnectionsCount(userId1: string, userId2: string): Promise<number> {
		try {
			// Get users that userId1 follows
			const user1Following = await pb.collection('follows').getFullList({
				filter: `follower="${userId1}"`,
				fields: 'following'
			});

			// Get users that userId2 follows
			const user2Following = await pb.collection('follows').getFullList({
				filter: `follower="${userId2}"`,
				fields: 'following'
			});

			const user1FollowingIds = new Set(user1Following.map(f => f.following));
			const user2FollowingIds = new Set(user2Following.map(f => f.following));

			// Count mutual follows
			let mutualCount = 0;
			for (const id of user1FollowingIds) {
				if (user2FollowingIds.has(id)) {
					mutualCount++;
				}
			}

			return mutualCount;
		} catch (error) {
			console.error('Failed to get mutual connections count:', error);
			return 0;
		}
	}

	/**
	 * Find users with mutual connections
	 */
	private async findUsersWithMutualConnections(userId: string, limit: number): Promise<Array<{user: UserProfile, mutualCount: number}>> {
		try {
			// This is a simplified implementation
			// In a real app, you'd want to optimize this with proper database queries
			const allUsers = await pb.collection('users').getList(1, 50, {
				filter: `id!="${userId}"`,
				sort: '-stats.gradePoints'
			});

			const results: Array<{user: UserProfile, mutualCount: number}> = [];

			for (const user of allUsers.items) {
				const mutualCount = await this.getMutualConnectionsCount(userId, user.id);
				if (mutualCount > 0) {
					results.push({
						user: this.mapToUserProfile(user),
						mutualCount
					});
				}
			}

			return results
				.sort((a, b) => b.mutualCount - a.mutualCount)
				.slice(0, limit);
		} catch (error) {
			console.error('Failed to find users with mutual connections:', error);
			return [];
		}
	}

	/**
	 * Create feed item
	 */
	private async createFeedItem(item: Partial<FeedItem>): Promise<void> {
		try {
			await pb.collection('feed_items').create({
				type: item.type,
				user: item.userId,
				content: item.content,
				metadata: item.metadata || {}
			});
		} catch (error) {
			console.error('Failed to create feed item:', error);
		}
	}

	/**
	 * Get general feed for users with no follows
	 */
	private async getGeneralFeed(page: number, limit: number): Promise<FeedItem[]> {
		try {
			const feedItems = await pb.collection('feed_items').getList(page, limit, {
				expand: 'user',
				sort: '-created'
			});

			return feedItems.items.map(item => this.mapToFeedItem(item));
		} catch (error) {
			console.error('Failed to get general feed:', error);
			return [];
		}
	}

	/**
	 * Refresh social data for user
	 */
	private async refreshSocialData(userId: string): Promise<void> {
		try {
			const [followersData, followingData] = await Promise.all([
				this.getFollowers(userId),
				this.getFollowing(userId)
			]);

			this.followers.set(followersData.map(c => c.user));
			this.following.set(followingData.map(c => c.user));

			const mutualFollows = followersData.filter(f => f.relationship === 'mutual').length;
			
			this.socialStats.set({
				followers: followersData.length,
				following: followingData.length,
				mutualFollows
			});
		} catch (error) {
			console.error('Failed to refresh social data:', error);
		}
	}

	/**
	 * Map database record to UserProfile
	 */
	private mapToUserProfile(record: any): UserProfile {
		// This would use the same mapping logic as in authService
		// For brevity, returning a simplified version
		return {
			id: record.id,
			email: record.email,
			username: record.username,
			displayName: record.displayName || record.name,
			avatar: record.avatar ? pb.files.getUrl(record, record.avatar) : undefined,
			bio: record.bio || '',
			// ... other fields
		} as UserProfile;
	}

	/**
	 * Map database record to FeedItem
	 */
	private mapToFeedItem(record: any): FeedItem {
		return {
			id: record.id,
			type: record.type,
			userId: record.user,
			user: record.expand?.user ? this.mapToUserProfile(record.expand.user) : {} as UserProfile,
			content: record.content,
			timestamp: record.created,
			metadata: record.metadata
		};
	}

	// ============================================
	// Card Social Functions (T043 additions)
	// ============================================

	/**
	 * Share a card to the gallery
	 */
	async shareCard(cardId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		try {
			const card = await pb.collection('cards').getOne(cardId);

			// Verify ownership
			if (card.creator !== pb.authStore.model.id) {
				throw new Error('이 카드를 공유할 권한이 없습니다.');
			}

			await pb.collection('cards').update(cardId, {
				is_shared: true,
				share_count: (card.share_count || 0) + 1
			});

			// Create feed item
			await this.createFeedItem({
				type: 'card_created',
				userId: pb.authStore.model.id,
				content: { cardId, action: 'shared' }
			});

			return true;
		} catch (error) {
			console.error('Failed to share card:', error);
			throw error;
		}
	}

	/**
	 * Unshare a card from the gallery
	 */
	async unshareCard(cardId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		try {
			const card = await pb.collection('cards').getOne(cardId);

			// Verify ownership
			if (card.creator !== pb.authStore.model.id) {
				throw new Error('이 카드를 수정할 권한이 없습니다.');
			}

			await pb.collection('cards').update(cardId, {
				is_shared: false
			});

			return true;
		} catch (error) {
			console.error('Failed to unshare card:', error);
			throw error;
		}
	}

	/**
	 * Toggle like on a card (optimistic-friendly)
	 */
	async toggleLike(cardId: string): Promise<{ liked: boolean; likeCount: number }> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		const userId = pb.authStore.model.id;

		try {
			// Check if already liked
			const existingLike = await pb.collection('likes').getFirstListItem(
				`user="${userId}" && card="${cardId}"`
			).catch(() => null);

			const card = await pb.collection('cards').getOne(cardId);

			if (existingLike) {
				// Unlike
				await pb.collection('likes').delete(existingLike.id);
				const newCount = Math.max(0, (card.like_count || 0) - 1);
				await pb.collection('cards').update(cardId, {
					like_count: newCount
				});
				return { liked: false, likeCount: newCount };
			} else {
				// Like
				await pb.collection('likes').create({
					user: userId,
					card: cardId
				});
				const newCount = (card.like_count || 0) + 1;
				await pb.collection('cards').update(cardId, {
					like_count: newCount
				});

				// Create notification for card owner (if not self)
				if (card.creator !== userId) {
					await this.createLikeNotification(card.creator, userId, cardId, card.title);
				}

				return { liked: true, likeCount: newCount };
			}
		} catch (error) {
			console.error('Failed to toggle like:', error);
			throw error;
		}
	}

	/**
	 * Check if user has liked a card
	 */
	async hasLiked(cardId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			return false;
		}

		try {
			const like = await pb.collection('likes').getFirstListItem(
				`user="${pb.authStore.model.id}" && card="${cardId}"`
			).catch(() => null);
			return !!like;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Add a comment to a card
	 */
	async addComment(cardId: string, content: string): Promise<CommentWithUser> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		if (!content.trim()) {
			throw new Error('댓글 내용을 입력해주세요.');
		}

		if (content.length > 500) {
			throw new Error('댓글은 500자 이내로 작성해주세요.');
		}

		const userId = pb.authStore.model.id;

		try {
			const comment = await pb.collection('comments').create({
				user: userId,
				card: cardId,
				content: content.trim()
			}, { expand: 'user' });

			// Update card comment count
			const card = await pb.collection('cards').getOne(cardId);
			await pb.collection('cards').update(cardId, {
				comment_count: (card.comment_count || 0) + 1
			});

			// Create notification for card owner (if not self)
			if (card.creator !== userId) {
				await this.createCommentNotification(
					card.creator,
					userId,
					cardId,
					card.title,
					content.trim()
				);
			}

			return this.mapToCommentWithUser(comment);
		} catch (error) {
			console.error('Failed to add comment:', error);
			throw error;
		}
	}

	/**
	 * Delete a comment
	 */
	async deleteComment(commentId: string): Promise<boolean> {
		if (!pb.authStore.model?.id) {
			throw new Error('User not authenticated');
		}

		try {
			const comment = await pb.collection('comments').getOne(commentId);

			// Verify ownership
			if (comment.user !== pb.authStore.model.id) {
				throw new Error('이 댓글을 삭제할 권한이 없습니다.');
			}

			await pb.collection('comments').delete(commentId);

			// Update card comment count
			const card = await pb.collection('cards').getOne(comment.card);
			await pb.collection('cards').update(comment.card, {
				comment_count: Math.max(0, (card.comment_count || 0) - 1)
			});

			return true;
		} catch (error) {
			console.error('Failed to delete comment:', error);
			throw error;
		}
	}

	/**
	 * Get comments for a card
	 */
	async getComments(cardId: string, page: number = 1, limit: number = 20): Promise<{
		items: CommentWithUser[];
		totalItems: number;
		totalPages: number;
	}> {
		try {
			const result = await pb.collection('comments').getList(page, limit, {
				filter: `card="${cardId}"`,
				expand: 'user',
				sort: '-created'
			});

			return {
				items: result.items.map(item => this.mapToCommentWithUser(item)),
				totalItems: result.totalItems,
				totalPages: result.totalPages
			};
		} catch (error) {
			console.error('Failed to get comments:', error);
			return { items: [], totalItems: 0, totalPages: 0 };
		}
	}

	/**
	 * Get shared cards for gallery
	 */
	async getSharedCards(options?: {
		page?: number;
		perPage?: number;
		sort?: string;
	}): Promise<{ items: any[]; totalItems: number; totalPages: number }> {
		try {
			const result = await pb.collection('cards').getList(
				options?.page || 1,
				options?.perPage || 30,
				{
					filter: 'is_shared=true',
					expand: 'creator',
					sort: options?.sort || '-created'
				}
			);

			return {
				items: result.items,
				totalItems: result.totalItems,
				totalPages: result.totalPages
			};
		} catch (error) {
			console.error('Failed to get shared cards:', error);
			return { items: [], totalItems: 0, totalPages: 0 };
		}
	}

	/**
	 * Subscribe to real-time like count updates for a card
	 */
	subscribeToCardLikes(cardId: string, callback: (likeCount: number) => void): () => void {
		pb.collection('cards').subscribe(cardId, (e) => {
			if (e.action === 'update' && e.record.like_count !== undefined) {
				callback(e.record.like_count);
			}
		});

		return () => {
			pb.collection('cards').unsubscribe(cardId);
		};
	}

	/**
	 * Create like notification (helper)
	 */
	private async createLikeNotification(ownerId: string, likerId: string, cardId: string, cardTitle: string): Promise<void> {
		try {
			const liker = await pb.collection('users').getOne(likerId);
			await pb.collection('notifications').create({
				user: ownerId,
				type: 'like',
				data: {
					card_id: cardId,
					card_title: cardTitle,
					liker_id: likerId,
					liker_name: liker.name || liker.username || 'Unknown'
				},
				is_read: false
			});
		} catch (error) {
			console.error('Failed to create like notification:', error);
		}
	}

	/**
	 * Create comment notification (helper)
	 */
	private async createCommentNotification(
		ownerId: string,
		commenterId: string,
		cardId: string,
		cardTitle: string,
		commentPreview: string
	): Promise<void> {
		try {
			const commenter = await pb.collection('users').getOne(commenterId);
			await pb.collection('notifications').create({
				user: ownerId,
				type: 'comment',
				data: {
					card_id: cardId,
					card_title: cardTitle,
					commenter_id: commenterId,
					commenter_name: commenter.name || commenter.username || 'Unknown',
					comment_preview: commentPreview.substring(0, 100)
				},
				is_read: false
			});
		} catch (error) {
			console.error('Failed to create comment notification:', error);
		}
	}

	/**
	 * Map comment record to CommentWithUser
	 */
	private mapToCommentWithUser(record: any): CommentWithUser {
		return {
			id: record.id,
			user: record.user,
			card: record.card,
			content: record.content,
			created: record.created,
			updated: record.updated,
			expand: record.expand?.user ? {
				user: {
					id: record.expand.user.id,
					name: record.expand.user.name || record.expand.user.username,
					avatar: record.expand.user.avatar ? pb.files.getUrl(record.expand.user, record.expand.user.avatar) : undefined
				}
			} : undefined
		};
	}
}

// Export types
export interface CommentWithUser {
	id: string;
	user: string;
	card: string;
	content: string;
	created: string;
	updated: string;
	expand?: {
		user?: {
			id: string;
			name: string;
			avatar?: string;
		};
	};
}

// Export singleton instance
export const socialService = new SocialService();