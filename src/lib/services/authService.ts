// Authentication Service with OAuth and PocketBase Integration

import { pb } from '$lib/pocketbase';
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { page } from '$app/stores';
import { signIn, signOut as authSignOut } from '@auth/sveltekit/client';
import type { 
	UserProfile, 
	UserGrade, 
	UserStats, 
	UserPreferences,
	AuthError
} from '$lib/types/auth';
import { USER_GRADES } from '$lib/types/auth';
import { KBO_TEAMS } from '$lib/data/kboTeams';

class AuthService {
	// Reactive stores
	public user: Writable<UserProfile | null> = writable(null);
	public isAuthenticated: Writable<boolean> = writable(false);
	public isLoading: Writable<boolean> = writable(true);
	public error: Writable<AuthError | null> = writable(null);

	constructor() {
		if (browser) {
			this.initializeAuth();
		}
	}

	/**
	 * Get current authenticated user
	 */
	getCurrentUser(): UserProfile | null {
		let currentUser: UserProfile | null = null;
		this.user.subscribe(user => currentUser = user)();
		return currentUser;
	}

	/**
	 * Initialize authentication state from session
	 */
	private async initializeAuth(): Promise<void> {
		this.isLoading.set(true);
		
		try {
			// Wait for page store to be available
			if (browser) {
				const unsubscribe = page.subscribe(async ($page) => {
					if ($page.data?.session?.user) {
						const sessionUser = $page.data.session.user;
						
						// Get full user profile from PocketBase
						if ((sessionUser as any).pbUser) {
							const userProfile = this.mapRecordToProfile((sessionUser as any).pbUser);
							this.user.set(userProfile);
							this.isAuthenticated.set(true);
						} else if (sessionUser.email) {
							// Fallback: get user by email
							try {
								const pbUser = await pb.collection('users').getFirstListItem(`email="${sessionUser.email}"`);
								const userProfile = this.mapRecordToProfile(pbUser);
								this.user.set(userProfile);
								this.isAuthenticated.set(true);
							} catch (error) {
								console.error('Failed to get user profile:', error);
							}
						}
					} else {
						this.user.set(null);
						this.isAuthenticated.set(false);
					}
					this.isLoading.set(false);
				});
				
				// Clean up subscription after initial load
				setTimeout(() => unsubscribe(), 1000);
			}
		} catch (error) {
			console.error('Auth initialization failed:', error);
			this.isLoading.set(false);
		}
	}

	/**
	 * Sign in with OAuth provider using @auth/sveltekit
	 */
	async signInWithOAuth(provider: 'github' | 'google'): Promise<void> {
		this.isLoading.set(true);
		this.error.set(null);

		try {
			await signIn(provider, { 
				redirectTo: '/auth/callback' 
			});
		} catch (error) {
			const authError: AuthError = {
				code: 'OAUTH_ERROR',
				message: error instanceof Error ? error.message : 'OAuth sign in failed',
				details: error
			};
			
			this.error.set(authError);
			console.error('OAuth sign in error:', error);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Sign out user
	 */
	async signOut(): Promise<void> {
		try {
			await authSignOut({ redirectTo: '/' });
			this.user.set(null);
			this.isAuthenticated.set(false);
			this.error.set(null);
		} catch (error) {
			console.error('Sign out error:', error);
		}
	}

	/**
	 * Get user profile by ID
	 */
	async getUserProfile(userId: string): Promise<UserProfile | null> {
		try {
			const record = await pb.collection('users').getOne(userId);
			return this.mapRecordToProfile(record);
		} catch (error) {
			console.error('Failed to get user profile:', error);
			return null;
		}
	}

	/**
	 * Update user profile
	 */
	async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
		const currentUser = this.getCurrentUser();
		if (!currentUser) {
			throw new Error('User not authenticated');
		}

		try {
			const record = await pb.collection('users').update(currentUser.id, {
				displayName: updates.displayName,
				bio: updates.bio,
				location: updates.location,
				website: updates.website,
				favoriteTeam: updates.favoriteTeam?.id,
				fanSince: updates.fanSince,
				favoritePlayer: updates.favoritePlayer,
				preferences: updates.preferences,
				stadiumVisits: updates.stadiumVisits
			});

			const updatedProfile = this.mapRecordToProfile(record);
			this.user.set(updatedProfile);
			
			return updatedProfile;
		} catch (error) {
			console.error('Failed to update profile:', error);
			throw error;
		}
	}

	/**
	 * Upload and update user avatar
	 */
	async updateAvatar(file: File): Promise<string | null> {
		const currentUser = this.getCurrentUser();
		if (!currentUser) {
			throw new Error('User not authenticated');
		}

		try {
			const formData = new FormData();
			formData.append('avatar', file);

			const record = await pb.collection('users').update(currentUser.id, formData);
			const avatarUrl = pb.files.getUrl(record, record.avatar);
			
			// Update current user store
			this.user.update(user => {
				if (user) {
					return { ...user, avatar: avatarUrl };
				}
				return user;
			});

			return avatarUrl;
		} catch (error) {
			console.error('Failed to update avatar:', error);
			throw error;
		}
	}

	/**
	 * Calculate and update user grade based on activity
	 */
	async updateUserGrade(userId?: string): Promise<UserGrade> {
		const currentUser = this.getCurrentUser();
		const targetUserId = userId || currentUser?.id;
		if (!targetUserId) {
			throw new Error('User ID required');
		}

		try {
			// Get current user stats
			const user = await pb.collection('users').getOne(targetUserId);
			const stats: UserStats = user.stats || this.getDefaultStats();
			
			// Calculate grade points based on activity
			const gradePoints = this.calculateGradePoints(stats);
			
			// Determine new grade
			const newGrade = this.getGradeByPoints(gradePoints);
			
			// Update user record
			await pb.collection('users').update(targetUserId, {
				grade: newGrade.level,
				'stats.gradePoints': gradePoints
			});

			// Update current user if it's the authenticated user
			if (targetUserId === currentUser?.id) {
				this.user.update(user => {
					if (user) {
						return {
							...user,
							grade: newGrade,
							stats: { ...user.stats, gradePoints }
						};
					}
					return user;
				});
			}

			return newGrade;
		} catch (error) {
			console.error('Failed to update user grade:', error);
			throw error;
		}
	}

	/**
	 * Sync user profile with OAuth data
	 */
	private async syncUserProfile(record: any, meta?: any): Promise<UserProfile> {
		const updates: any = {};
		
		// Update display name if empty
		if (!record.displayName && meta?.name) {
			updates.displayName = meta.name;
		}
		
		// Update avatar if empty
		if (!record.avatar && meta?.avatarUrl) {
			// TODO: Download and store avatar from OAuth provider
		}

		// Apply updates if any
		if (Object.keys(updates).length > 0) {
			const updatedRecord = await pb.collection('users').update(record.id, updates);
			return this.mapRecordToProfile(updatedRecord);
		}

		return this.mapRecordToProfile(record);
	}

	/**
	 * Map PocketBase record to UserProfile
	 */
	private mapRecordToProfile(record: any): UserProfile {
		const favoriteTeam = record.favoriteTeam ? 
			KBO_TEAMS.find(team => team.id === record.favoriteTeam) : undefined;

		return {
			id: record.id,
			email: record.email,
			username: record.username || record.email.split('@')[0],
			displayName: record.displayName || record.name || record.username,
			avatar: record.avatar ? pb.files.getUrl(record, record.avatar) : undefined,
			bio: record.bio || '',
			location: record.location || '',
			website: record.website || '',
			
			favoriteTeam,
			fanSince: record.fanSince || '',
			stadiumVisits: record.stadiumVisits || [],
			favoritePlayer: record.favoritePlayer || '',
			
			grade: USER_GRADES[record.grade as keyof typeof USER_GRADES] || USER_GRADES.rookie,
			stats: record.stats || this.getDefaultStats(),
			preferences: record.preferences || this.getDefaultPreferences(),
			
			isVerified: record.isVerified || false,
			badges: record.badges || [],
			achievements: record.achievements || [],
			
			created: record.created,
			updated: record.updated
		};
	}

	/**
	 * Calculate grade points based on user activity
	 */
	private calculateGradePoints(stats: UserStats): number {
		let points = 0;
		
		// Base points for activity
		points += stats.cardsCreated * 10;
		points += stats.totalLikes * 2;
		points += stats.totalViews * 0.1;
		points += stats.followers * 5;
		points += stats.commentsReceived * 3;
		points += stats.featuredCards * 50;
		
		// Bonus for consistent activity
		if (stats.monthlyActive) {
			points += 20;
		}
		
		// Time-based bonus (longer membership)
		const joinDate = new Date(stats.joinDate);
		const monthsSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
		points += Math.floor(monthsSinceJoin) * 5;
		
		return Math.floor(points);
	}

	/**
	 * Get grade by points
	 */
	private getGradeByPoints(points: number): UserGrade {
		const grades = Object.values(USER_GRADES);
		
		for (let i = grades.length - 1; i >= 0; i--) {
			if (points >= grades[i].minPoints) {
				return grades[i];
			}
		}
		
		return USER_GRADES.rookie;
	}

	/**
	 * Get default user stats
	 */
	private getDefaultStats(): UserStats {
		return {
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
		};
	}

	/**
	 * Get default user preferences
	 */
	private getDefaultPreferences(): UserPreferences {
		return {
			emailNotifications: true,
			pushNotifications: true,
			publicProfile: true,
			showStats: true,
			theme: 'dark',
			language: 'ko',
			holographicQuality: 'high',
			autoSave: true
		};
	}
}

// Export singleton instance
export const authService = new AuthService();

// Export stores for reactive usage
export const { user, isAuthenticated, isLoading, error } = authService;