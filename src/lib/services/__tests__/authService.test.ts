// Authentication Service Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import type { UserProfile, UserStats, UserPreferences } from '$lib/types/auth';

// Mock PocketBase before importing authService
vi.mock('$lib/pocketbase', () => {
	const mockPb = {
		authStore: {
			model: null,
			isValid: false,
			clear: vi.fn(),
			loadFromCookie: vi.fn(),
			exportToCookie: vi.fn()
		},
		collection: vi.fn(() => ({
			authWithOAuth2: vi.fn(),
			authRefresh: vi.fn(),
			getOne: vi.fn(),
			update: vi.fn()
		})),
		files: {
			getUrl: vi.fn()
		}
	};
	return { pb: mockPb };
});

vi.mock('$app/environment', () => ({
	browser: true
}));

// Import after mocking
const { authService } = await import('../authService');

describe('AuthService', () => {
	let mockPb: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		
		// Get the mocked pb instance
		const { pb } = await import('$lib/pocketbase');
		mockPb = pb;
		
		// Reset stores
		authService.user.set(null);
		authService.isAuthenticated.set(false);
		authService.isLoading.set(false);
		authService.error.set(null);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('OAuth Sign In', () => {
		it('should successfully sign in with GitHub OAuth', async () => {
			const mockAuthData = {
				record: {
					id: 'user123',
					email: 'test@example.com',
					username: 'testuser',
					displayName: 'Test User',
					grade: 'rookie',
					stats: {
						cardsCreated: 0,
						totalLikes: 0,
						totalViews: 0,
						followers: 0,
						following: 0,
						gradePoints: 0,
						commentsReceived: 0,
						featuredCards: 0,
						monthlyActive: true,
						joinDate: new Date().toISOString(),
						lastActive: new Date().toISOString()
					},
					preferences: {
						emailNotifications: true,
						pushNotifications: true,
						publicProfile: true,
						showStats: true,
						theme: 'dark',
						language: 'ko',
						holographicQuality: 'high',
						autoSave: true
					},
					created: new Date().toISOString(),
					updated: new Date().toISOString()
				},
				meta: {
					name: 'Test User',
					avatarUrl: 'https://example.com/avatar.jpg'
				}
			};

			const mockCollection = {
				authWithOAuth2: vi.fn().mockResolvedValue(mockAuthData)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await authService.signInWithOAuth('github');

			expect(mockCollection.authWithOAuth2).toHaveBeenCalledWith({
				provider: 'github',
				createData: expect.objectContaining({
					displayName: '',
					bio: '',
					grade: 'rookie'
				})
			});

			expect(result).toBeTruthy();
			expect(result?.id).toBe('user123');
			expect(result?.email).toBe('test@example.com');
			expect(get(authService.isAuthenticated)).toBe(true);
			expect(get(authService.user)).toBeTruthy();
		});

		it('should handle OAuth sign in failure', async () => {
			const mockCollection = {
				authWithOAuth2: vi.fn().mockRejectedValue(new Error('OAuth failed'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await authService.signInWithOAuth('github');

			expect(result).toBeNull();
			expect(get(authService.error)).toBeTruthy();
			expect(get(authService.isAuthenticated)).toBe(false);
		});
	});

	describe('Profile Management', () => {
		beforeEach(() => {
			mockPb.authStore.model = { id: 'user123' };
			mockPb.authStore.isValid = true;
		});

		it('should update user profile successfully', async () => {
			const mockUpdatedRecord = {
				id: 'user123',
				email: 'test@example.com',
				displayName: 'Updated Name',
				bio: 'Updated bio',
				grade: 'fan',
				stats: {},
				preferences: {},
				created: new Date().toISOString(),
				updated: new Date().toISOString()
			};

			const mockCollection = {
				update: vi.fn().mockResolvedValue(mockUpdatedRecord)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const updates: Partial<UserProfile> = {
				displayName: 'Updated Name',
				bio: 'Updated bio'
			};

			const result = await authService.updateProfile(updates);

			expect(mockCollection.update).toHaveBeenCalledWith('user123', expect.objectContaining({
				displayName: 'Updated Name',
				bio: 'Updated bio'
			}));

			expect(result?.displayName).toBe('Updated Name');
			expect(result?.bio).toBe('Updated bio');
		});

		it('should handle profile update failure', async () => {
			const mockCollection = {
				update: vi.fn().mockRejectedValue(new Error('Update failed'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const updates: Partial<UserProfile> = {
				displayName: 'Updated Name'
			};

			await expect(authService.updateProfile(updates)).rejects.toThrow('Update failed');
		});

		it('should update user avatar', async () => {
			const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
			const mockUpdatedRecord = {
				id: 'user123',
				avatar: 'avatar_filename.jpg'
			};

			const mockCollection = {
				update: vi.fn().mockResolvedValue(mockUpdatedRecord)
			};
			mockPb.collection.mockReturnValue(mockCollection);
			mockPb.files.getUrl.mockReturnValue('https://example.com/avatar.jpg');

			const result = await authService.updateAvatar(mockFile);

			expect(mockCollection.update).toHaveBeenCalledWith('user123', expect.any(FormData));
			expect(result).toBe('https://example.com/avatar.jpg');
		});
	});

	describe('Grade Management', () => {
		beforeEach(() => {
			mockPb.authStore.model = { id: 'user123' };
		});

		it('should calculate and update user grade', async () => {
			const mockUser = {
				id: 'user123',
				stats: {
					cardsCreated: 5,
					totalLikes: 50,
					totalViews: 500,
					followers: 10,
					following: 15,
					gradePoints: 0,
					commentsReceived: 20,
					featuredCards: 1,
					monthlyActive: true,
					joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
					lastActive: new Date().toISOString()
				}
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockUser),
				update: vi.fn().mockResolvedValue(mockUser)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await authService.updateUserGrade('user123');

			expect(mockCollection.getOne).toHaveBeenCalledWith('user123');
			expect(mockCollection.update).toHaveBeenCalledWith('user123', expect.objectContaining({
				grade: expect.any(String),
				'stats.gradePoints': expect.any(Number)
			}));

			expect(result.level).toBeDefined();
			expect(result.points).toBeGreaterThan(0);
		});

		it('should handle grade calculation for new user', async () => {
			const mockUser = {
				id: 'user123',
				stats: {
					cardsCreated: 0,
					totalLikes: 0,
					totalViews: 0,
					followers: 0,
					following: 0,
					gradePoints: 0,
					commentsReceived: 0,
					featuredCards: 0,
					monthlyActive: true,
					joinDate: new Date().toISOString(),
					lastActive: new Date().toISOString()
				}
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockUser),
				update: vi.fn().mockResolvedValue(mockUser)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await authService.updateUserGrade('user123');

			expect(result.level).toBe('rookie');
			expect(result.koreanName).toBe('야구 입문자');
		});
	});

	describe('Sign Out', () => {
		it('should clear authentication state on sign out', async () => {
			// Set up authenticated state
			authService.user.set({
				id: 'user123',
				email: 'test@example.com'
			} as UserProfile);
			authService.isAuthenticated.set(true);

			await authService.signOut();

			expect(mockPb.authStore.clear).toHaveBeenCalled();
			expect(get(authService.user)).toBeNull();
			expect(get(authService.isAuthenticated)).toBe(false);
			expect(get(authService.error)).toBeNull();
		});
	});

	describe('User Profile Retrieval', () => {
		it('should get user profile by ID', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				username: 'testuser',
				displayName: 'Test User',
				grade: 'fan',
				stats: {},
				preferences: {},
				created: new Date().toISOString(),
				updated: new Date().toISOString()
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockUser)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await authService.getUserProfile('user123');

			expect(mockCollection.getOne).toHaveBeenCalledWith('user123', {
				expand: 'favoriteTeam'
			});
			expect(result?.id).toBe('user123');
			expect(result?.email).toBe('test@example.com');
		});

		it('should return null for non-existent user', async () => {
			const mockCollection = {
				getOne: vi.fn().mockRejectedValue(new Error('User not found'))
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await authService.getUserProfile('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('Default Data Generation', () => {
		it('should generate default user stats', () => {
			const authServiceInstance = authService as any;
			const defaultStats = authServiceInstance.getDefaultStats();

			expect(defaultStats).toEqual({
				cardsCreated: 0,
				totalLikes: 0,
				totalViews: 0,
				followers: 0,
				following: 0,
				gradePoints: 0,
				commentsReceived: 0,
				featuredCards: 0,
				monthlyActive: true,
				joinDate: expect.any(String),
				lastActive: expect.any(String)
			});
		});

		it('should generate default user preferences', () => {
			const authServiceInstance = authService as any;
			const defaultPreferences = authServiceInstance.getDefaultPreferences();

			expect(defaultPreferences).toEqual({
				emailNotifications: true,
				pushNotifications: true,
				publicProfile: true,
				showStats: true,
				theme: 'dark',
				language: 'ko',
				holographicQuality: 'high',
				autoSave: true
			});
		});
	});
});