// Social Service Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { UserProfile } from '$lib/types/auth';

// Mock PocketBase
const mockPb = {
	authStore: {
		model: { id: 'currentUser123' },
		isValid: true
	},
	collection: vi.fn(() => ({
		create: vi.fn(),
		delete: vi.fn(),
		getFirstListItem: vi.fn(),
		getList: vi.fn(),
		getFullList: vi.fn(),
		getOne: vi.fn(),
		update: vi.fn()
	})),
	files: {
		getUrl: vi.fn()
	}
};

vi.mock('$lib/pocketbase', () => ({
	pb: mockPb
}));

// Import after mocking
const { socialService } = await import('../socialService');

describe('SocialService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPb.authStore.model = { id: 'currentUser123' };
		mockPb.authStore.isValid = true;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Follow System', () => {
		it('should successfully follow a user', async () => {
			const targetUserId = 'targetUser456';
			
			const mockCollection = {
				getFirstListItem: vi.fn().mockRejectedValue(new Error('Not found')), // Not already following
				create: vi.fn().mockResolvedValue({ id: 'follow123' }),
				getList: vi.fn().mockResolvedValue({ totalItems: 1 }),
				update: vi.fn().mockResolvedValue({})
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.followUser(targetUserId);

			expect(result).toBe(true);
			expect(mockCollection.create).toHaveBeenCalledWith({
				follower: 'currentUser123',
				following: targetUserId
			});
		});

		it('should not follow if already following', async () => {
			const targetUserId = 'targetUser456';
			
			const mockCollection = {
				getFirstListItem: vi.fn().mockResolvedValue({ id: 'existingFollow' }) // Already following
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.followUser(targetUserId);

			expect(result).toBe(false);
		});

		it('should not allow following yourself', async () => {
			const targetUserId = 'currentUser123'; // Same as current user

			await expect(socialService.followUser(targetUserId))
				.rejects.toThrow('Cannot follow yourself');
		});

		it('should successfully unfollow a user', async () => {
			const targetUserId = 'targetUser456';
			
			const mockCollection = {
				getFirstListItem: vi.fn().mockResolvedValue({ id: 'follow123' }),
				delete: vi.fn().mockResolvedValue({}),
				getList: vi.fn().mockResolvedValue({ totalItems: 0 }),
				update: vi.fn().mockResolvedValue({})
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.unfollowUser(targetUserId);

			expect(result).toBe(true);
			expect(mockCollection.delete).toHaveBeenCalledWith('follow123');
		});

		it('should check if user is following another user', async () => {
			const targetUserId = 'targetUser456';
			
			const mockCollection = {
				getFirstListItem: vi.fn().mockResolvedValue({ id: 'follow123' })
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.isFollowing(targetUserId);

			expect(result).toBe(true);
			expect(mockCollection.getFirstListItem).toHaveBeenCalledWith(
				`follower="currentUser123" && following="${targetUserId}"`
			);
		});

		it('should return false if not following', async () => {
			const targetUserId = 'targetUser456';
			
			const mockCollection = {
				getFirstListItem: vi.fn().mockRejectedValue(new Error('Not found'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.isFollowing(targetUserId);

			expect(result).toBe(false);
		});
	});

	describe('Followers and Following Lists', () => {
		it('should get followers list', async () => {
			const userId = 'user123';
			const mockFollows = {
				items: [
					{
						id: 'follow1',
						created: '2024-01-01T00:00:00Z',
						expand: {
							follower: {
								id: 'follower1',
								displayName: 'Follower One',
								email: 'follower1@example.com',
								username: 'follower1'
							}
						}
					}
				]
			};

			const mockCollection = {
				getList: vi.fn().mockResolvedValue(mockFollows),
				getFullList: vi.fn().mockResolvedValue([])
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getFollowers(userId);

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
				filter: `following="${userId}"`,
				expand: 'follower',
				sort: '-created'
			});

			expect(result).toHaveLength(1);
			expect(result[0].user.displayName).toBe('Follower One');
			expect(result[0].followedAt).toBe('2024-01-01T00:00:00Z');
		});

		it('should get following list', async () => {
			const userId = 'user123';
			const mockFollows = {
				items: [
					{
						id: 'follow1',
						created: '2024-01-01T00:00:00Z',
						expand: {
							following: {
								id: 'following1',
								displayName: 'Following One',
								email: 'following1@example.com',
								username: 'following1'
							}
						}
					}
				]
			};

			const mockCollection = {
				getList: vi.fn().mockResolvedValue(mockFollows),
				getFullList: vi.fn().mockResolvedValue([])
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getFollowing(userId);

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
				filter: `follower="${userId}"`,
				expand: 'following',
				sort: '-created'
			});

			expect(result).toHaveLength(1);
			expect(result[0].user.displayName).toBe('Following One');
		});
	});

	describe('Personalized Feed', () => {
		it('should get personalized feed for user with follows', async () => {
			const mockFollowing = [
				{ following: 'user1' },
				{ following: 'user2' }
			];

			const mockFeedItems = {
				items: [
					{
						id: 'feed1',
						type: 'card_created',
						user: 'user1',
						content: { title: 'Test Card' },
						created: '2024-01-01T00:00:00Z',
						expand: {
							user: {
								id: 'user1',
								displayName: 'User One',
								email: 'user1@example.com'
							}
						}
					}
				]
			};

			const mockCollection = {
				getFullList: vi.fn().mockResolvedValue(mockFollowing),
				getList: vi.fn().mockResolvedValue(mockFeedItems)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getPersonalizedFeed();

			expect(result).toHaveLength(1);
			expect(result[0].type).toBe('card_created');
			expect(result[0].user.displayName).toBe('User One');
		});

		it('should return general feed if user follows no one', async () => {
			const mockCollection = {
				getFullList: vi.fn().mockResolvedValue([]), // No follows
				getList: vi.fn().mockResolvedValue({
					items: [
						{
							id: 'feed1',
							type: 'card_created',
							user: 'user1',
							content: { title: 'General Card' },
							created: '2024-01-01T00:00:00Z',
							expand: {
								user: {
									id: 'user1',
									displayName: 'General User'
								}
							}
						}
					]
				})
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getPersonalizedFeed();

			expect(result).toHaveLength(1);
			expect(result[0].user.displayName).toBe('General User');
		});
	});

	describe('User Recommendations', () => {
		it('should get user recommendations based on same team', async () => {
			const mockCurrentUser = {
				id: 'currentUser123',
				favoriteTeam: 'lg'
			};

			const mockSameTeamUsers = {
				items: [
					{
						id: 'teammate1',
						displayName: 'Teammate One',
						favoriteTeam: 'lg',
						stats: { gradePoints: 1000 }
					}
				]
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockCurrentUser),
				getList: vi.fn().mockResolvedValue(mockSameTeamUsers),
				getFirstListItem: vi.fn().mockRejectedValue(new Error('Not following'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getUserRecommendations(5);

			expect(result.length).toBeGreaterThan(0);
			expect(result[0].reason).toBe('same_team');
			expect(result[0].user.displayName).toBe('Teammate One');
		});

		it('should get recommendations for highly active users', async () => {
			const mockCurrentUser = {
				id: 'currentUser123',
				favoriteTeam: null
			};

			const mockActiveUsers = {
				items: [
					{
						id: 'active1',
						displayName: 'Active User',
						stats: { 
							gradePoints: 2000,
							monthlyActive: true
						}
					}
				]
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockCurrentUser),
				getList: vi.fn()
					.mockResolvedValueOnce({ items: [] }) // No same team users
					.mockResolvedValueOnce(mockActiveUsers), // Active users
				getFirstListItem: vi.fn().mockRejectedValue(new Error('Not following')),
				getFullList: vi.fn().mockResolvedValue([]) // No mutual connections
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getUserRecommendations(5);

			expect(result.length).toBeGreaterThan(0);
			expect(result.some(r => r.reason === 'high_activity')).toBe(true);
		});
	});

	describe('Team Fan Network', () => {
		it('should get team fan network', async () => {
			const teamId = 'lg';
			const mockTeamFans = {
				items: [
					{
						id: 'fan1',
						displayName: 'LG Fan One',
						favoriteTeam: 'lg',
						stats: { gradePoints: 1500 }
					},
					{
						id: 'fan2',
						displayName: 'LG Fan Two',
						favoriteTeam: 'lg',
						stats: { gradePoints: 1200 }
					}
				]
			};

			const mockCollection = {
				getList: vi.fn().mockResolvedValue(mockTeamFans),
				getFirstListItem: vi.fn().mockRejectedValue(new Error('Not following')),
				getFullList: vi.fn().mockResolvedValue([])
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getTeamFanNetwork(teamId);

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
				filter: `favoriteTeam="${teamId}"`,
				sort: '-stats.gradePoints'
			});

			expect(result).toHaveLength(2);
			expect(result[0].user.displayName).toBe('LG Fan One');
			expect(result[1].user.displayName).toBe('LG Fan Two');
		});
	});

	describe('Error Handling', () => {
		it('should handle authentication errors', async () => {
			mockPb.authStore.model = null;
			mockPb.authStore.isValid = false;

			await expect(socialService.followUser('user123'))
				.rejects.toThrow('User not authenticated');
		});

		it('should handle database errors gracefully', async () => {
			const mockCollection = {
				getFirstListItem: vi.fn().mockRejectedValue(new Error('Database error')),
				create: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			await expect(socialService.followUser('user123'))
				.rejects.toThrow('Database error');
		});

		it('should return empty arrays on list fetch errors', async () => {
			const mockCollection = {
				getList: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await socialService.getFollowers('user123');
			expect(result).toEqual([]);
		});
	});

	describe('Utility Functions', () => {
		it('should map database record to user profile', () => {
			const socialServiceInstance = socialService as any;
			
			const mockRecord = {
				id: 'user123',
				email: 'test@example.com',
				username: 'testuser',
				displayName: 'Test User',
				avatar: 'avatar.jpg',
				bio: 'Test bio'
			};

			mockPb.files.getUrl.mockReturnValue('https://example.com/avatar.jpg');

			const result = socialServiceInstance.mapToUserProfile(mockRecord);

			expect(result.id).toBe('user123');
			expect(result.email).toBe('test@example.com');
			expect(result.displayName).toBe('Test User');
			expect(result.avatar).toBe('https://example.com/avatar.jpg');
		});

		it('should map database record to feed item', () => {
			const socialServiceInstance = socialService as any;
			
			const mockRecord = {
				id: 'feed123',
				type: 'card_created',
				user: 'user123',
				content: { title: 'Test Card' },
				created: '2024-01-01T00:00:00Z',
				metadata: { test: true },
				expand: {
					user: {
						id: 'user123',
						displayName: 'Test User'
					}
				}
			};

			const result = socialServiceInstance.mapToFeedItem(mockRecord);

			expect(result.id).toBe('feed123');
			expect(result.type).toBe('card_created');
			expect(result.userId).toBe('user123');
			expect(result.content.title).toBe('Test Card');
			expect(result.timestamp).toBe('2024-01-01T00:00:00Z');
		});
	});
});