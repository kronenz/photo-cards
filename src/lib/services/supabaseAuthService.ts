// Supabase Authentication Service
import { supabase, type Database } from '$lib/supabase';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import type {
	UserProfile,
	UserGrade,
	UserStats,
	UserPreferences,
	AuthError
} from '$lib/types/auth';
import { USER_GRADES } from '$lib/types/auth';
import { BASEBALL_TEAMS } from '$lib/data/baseballTeams';

type DbUser = Database['public']['Tables']['users']['Row'];

class SupabaseAuthService {
	// Reactive stores
	public user: Writable<UserProfile | null> = writable(null);
	public session: Writable<Session | null> = writable(null);
	public isAuthenticated: Writable<boolean> = writable(false);
	public isLoading: Writable<boolean> = writable(true);
	public error: Writable<AuthError | null> = writable(null);

	constructor() {
		if (browser) {
			this.initializeAuth();
		}
	}

	/**
	 * Initialize authentication state
	 */
	private async initializeAuth(): Promise<void> {
		this.isLoading.set(true);

		try {
			// Get initial session
			const {
				data: { session },
				error
			} = await supabase.auth.getSession();

			if (error) {
				console.error('Failed to get session:', error);
				this.isLoading.set(false);
				return;
			}

			if (session) {
				this.session.set(session);
				await this.loadUserProfile(session.user.id);
			}

			// Listen for auth changes
			supabase.auth.onAuthStateChange(async (event, session) => {
				console.log('Auth state changed:', event, session?.user?.email);

				this.session.set(session);

				if (session) {
					this.isAuthenticated.set(true);
					await this.loadUserProfile(session.user.id);
				} else {
					this.isAuthenticated.set(false);
					this.user.set(null);
				}
			});
		} catch (error) {
			console.error('Auth initialization failed:', error);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Load user profile from database
	 */
	private async loadUserProfile(userId: string): Promise<void> {
		try {
			console.log('[SupabaseAuth] Loading profile for user:', userId);

			const { data, error } = await supabase
				.from('users')
				.select('*')
				.eq('id', userId)
				.maybeSingle();

			console.log('[SupabaseAuth] Profile query result:', {
				hasData: !!data,
				error: error?.message
			});

			if (error) {
				console.error('[SupabaseAuth] Failed to load user profile:', error);
				return;
			}

			if (data) {
				console.log('[SupabaseAuth] Profile loaded successfully');
				const userProfile = this.mapDbUserToProfile(data);
				this.user.set(userProfile);
				console.log('[SupabaseAuth] User profile set in store');
			} else {
				console.warn('[SupabaseAuth] No profile data found for user:', userId);
			}
		} catch (error) {
			console.error('[SupabaseAuth] Exception loading user profile:', error);
		}
	}

	/**
	 * Sign up with email and password
	 */
	async signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserProfile | null> {
		this.isLoading.set(true);
		this.error.set(null);

		try {
			console.log('[SupabaseAuth] Starting signUp for:', email);

			// Create auth user
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						display_name: displayName || email.split('@')[0]
					}
				}
			});

			console.log('[SupabaseAuth] SignUp response:', {
				hasUser: !!authData?.user,
				userId: authData?.user?.id,
				error: authError?.message
			});

			if (authError) {
				console.error('[SupabaseAuth] SignUp error:', authError);

				// Check if user already exists
				let errorMessage = authError.message;
				if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
					errorMessage = '이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요.';
				}

				this.error.set({
					code: 'SIGNUP_ERROR',
					message: errorMessage,
					details: authError
				});
				return null;
			}

			if (!authData.user) {
				console.error('[SupabaseAuth] No user in response');
				this.error.set({
					code: 'SIGNUP_ERROR',
					message: 'User creation failed'
				});
				return null;
			}

			// Wait for trigger to create user profile, then fetch it
			// The trigger (handle_new_user) automatically creates the profile
			console.log('[SupabaseAuth] Waiting 500ms for trigger to create profile...');
			await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms for trigger

			console.log('[SupabaseAuth] Fetching user profile from database...');
			const { data: dbUser, error: dbError } = await supabase
				.from('users')
				.select()
				.eq('id', authData.user.id)
				.maybeSingle();

			console.log('[SupabaseAuth] Profile fetch result:', {
				hasData: !!dbUser,
				error: dbError?.message
			});

			if (dbError || !dbUser) {
				console.error('[SupabaseAuth] Failed to fetch user profile:', dbError);
				// Profile might not exist yet, but user can still login
				// Return basic user info
				const basicProfile: UserProfile = {
					id: authData.user.id,
					email: authData.user.email || email,
					username: email.split('@')[0],
					displayName: displayName || email.split('@')[0],
					avatarUrl: null,
					bio: null,
					location: null,
					website: null,
					favoriteTeam: null,
					fanSince: null,
					favoritePlayer: null,
					grade: 'rookie' as UserGrade,
					isVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					stats: {
						cardsOwned: 0,
						cardsCreated: 0,
						followers: 0,
						following: 0
					},
					preferences: {
						theme: 'dark',
						notifications: {
							email: true,
							push: true,
							inApp: true
						},
						privacy: {
							showEmail: false,
							showProfile: true,
							allowMessages: true
						}
					}
				};
				this.user.set(basicProfile);
				this.isAuthenticated.set(true);
				return basicProfile;
			}

			console.log('[SupabaseAuth] Mapping profile data...');
			const userProfile = this.mapDbUserToProfile(dbUser);
			this.user.set(userProfile);
			this.isAuthenticated.set(true);

			console.log('[SupabaseAuth] SignUp completed successfully, returning profile');
			return userProfile;
		} catch (error) {
			console.error('[SupabaseAuth] SignUp exception:', error);
			const authError: AuthError = {
				code: 'SIGNUP_ERROR',
				message: error instanceof Error ? error.message : 'Sign up failed',
				details: error
			};
			this.error.set(authError);
			return null;
		} finally {
			console.log('[SupabaseAuth] SignUp finally block - setting isLoading to false');
			this.isLoading.set(false);
		}
	}

	/**
	 * Sign in with email and password
	 */
	async signInWithEmail(email: string, password: string): Promise<UserProfile | null> {
		this.isLoading.set(true);
		this.error.set(null);

		try {
			console.log('[SupabaseAuth] Starting signIn for:', email);

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			console.log('[SupabaseAuth] SignIn response:', {
				hasUser: !!data?.user,
				hasSession: !!data?.session,
				error: error?.message
			});

			if (error) {
				console.error('[SupabaseAuth] SignIn error:', error);

				let errorMessage = error.message;
				if (error.message.includes('Invalid login credentials')) {
					errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
				}

				this.error.set({
					code: 'SIGNIN_ERROR',
					message: errorMessage,
					details: error
				});
				return null;
			}

			if (data.user) {
				console.log('[SupabaseAuth] Loading user profile for:', data.user.id);

				// Try to load profile, but don't block login if it fails
				try {
					await this.loadUserProfile(data.user.id);
				} catch (profileError) {
					console.error('[SupabaseAuth] Profile loading failed, but continuing login:', profileError);
				}

				// Set authenticated state regardless of profile loading
				this.isAuthenticated.set(true);

				let currentUser: UserProfile | null = null;
				this.user.subscribe((u) => (currentUser = u))();

				// If profile didn't load, create a minimal one
				if (!currentUser) {
					console.warn('[SupabaseAuth] No profile loaded, creating minimal profile');
					currentUser = {
						id: data.user.id,
						email: data.user.email || '',
						username: data.user.email?.split('@')[0] || 'user',
						displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'User',
						avatar: undefined,
						bio: '',
						location: '',
						website: '',
						favoriteTeam: undefined,
						fanSince: '',
						stadiumVisits: [],
						favoritePlayer: '',
						grade: USER_GRADES.rookie,
						stats: this.getDefaultStats(),
						preferences: this.getDefaultPreferences(),
						isVerified: false,
						badges: [],
						achievements: [],
						created: data.user.created_at || new Date().toISOString(),
						updated: data.user.updated_at || new Date().toISOString()
					};
					this.user.set(currentUser);
				}

				console.log('[SupabaseAuth] SignIn complete, user:', currentUser?.email);
				return currentUser;
			}

			console.warn('[SupabaseAuth] No user in signIn response');
			return null;
		} catch (error) {
			console.error('[SupabaseAuth] SignIn exception:', error);
			const authError: AuthError = {
				code: 'SIGNIN_ERROR',
				message: error instanceof Error ? error.message : 'Sign in failed',
				details: error
			};
			this.error.set(authError);
			return null;
		} finally {
			console.log('[SupabaseAuth] SignIn finally block - setting loading to false');
			this.isLoading.set(false);
		}
	}

	/**
	 * Sign in with OAuth provider
	 */
	async signInWithOAuth(provider: 'google' | 'kakao' | 'naver'): Promise<void> {
		this.isLoading.set(true);
		this.error.set(null);

		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (error) {
				this.error.set({
					code: 'OAUTH_ERROR',
					message: error.message,
					details: error
				});
			}
		} catch (error) {
			const authError: AuthError = {
				code: 'OAUTH_ERROR',
				message: error instanceof Error ? error.message : 'OAuth sign in failed',
				details: error
			};
			this.error.set(authError);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Sign out
	 */
	async signOut(): Promise<void> {
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error('Sign out error:', error);
				return;
			}

			this.user.set(null);
			this.session.set(null);
			this.isAuthenticated.set(false);
			this.error.set(null);
		} catch (error) {
			console.error('Sign out error:', error);
		}
	}

	/**
	 * Reset password
	 */
	async resetPassword(email: string): Promise<boolean> {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`
			});

			if (error) {
				this.error.set({
					code: 'RESET_PASSWORD_ERROR',
					message: error.message,
					details: error
				});
				return false;
			}

			return true;
		} catch (error) {
			const authError: AuthError = {
				code: 'RESET_PASSWORD_ERROR',
				message: error instanceof Error ? error.message : 'Password reset failed',
				details: error
			};
			this.error.set(authError);
			return false;
		}
	}

	/**
	 * Update password
	 */
	async updatePassword(newPassword: string): Promise<boolean> {
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) {
				this.error.set({
					code: 'UPDATE_PASSWORD_ERROR',
					message: error.message,
					details: error
				});
				return false;
			}

			return true;
		} catch (error) {
			const authError: AuthError = {
				code: 'UPDATE_PASSWORD_ERROR',
				message: error instanceof Error ? error.message : 'Password update failed',
				details: error
			};
			this.error.set(authError);
			return false;
		}
	}

	/**
	 * Get current user
	 */
	getCurrentUser(): UserProfile | null {
		let currentUser: UserProfile | null = null;
		this.user.subscribe((user) => (currentUser = user))();
		return currentUser;
	}

	/**
	 * Update user profile
	 */
	async updateProfile(updates: Partial<DbUser>): Promise<UserProfile | null> {
		const currentUser = this.getCurrentUser();
		if (!currentUser) {
			throw new Error('User not authenticated');
		}

		try {
			console.log('[SupabaseAuth] Updating profile for user:', currentUser.id, 'with updates:', updates);

			const { data, error } = await supabase
				.from('users')
				.update(updates)
				.eq('id', currentUser.id)
				.select()
				.maybeSingle();

			console.log('[SupabaseAuth] Update profile result:', {
				hasData: !!data,
				error: error?.message
			});

			if (error) {
				console.error('[SupabaseAuth] Failed to update profile:', error);
				throw error;
			}

			if (!data) {
				console.error('[SupabaseAuth] No data returned from update');
				throw new Error('Failed to update profile - no data returned');
			}

			const updatedProfile = this.mapDbUserToProfile(data);
			this.user.set(updatedProfile);

			return updatedProfile;
		} catch (error) {
			console.error('[SupabaseAuth] Exception updating profile:', error);
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
			// Upload to Supabase Storage
			const fileExt = file.name.split('.').pop();
			const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
			const filePath = `avatars/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, file);

			if (uploadError) {
				console.error('Failed to upload avatar:', uploadError);
				throw uploadError;
			}

			// Get public URL
			const {
				data: { publicUrl }
			} = supabase.storage.from('avatars').getPublicUrl(filePath);

			// Update user profile
			await this.updateProfile({
				avatar_url: publicUrl
			});

			return publicUrl;
		} catch (error) {
			console.error('Failed to update avatar:', error);
			throw error;
		}
	}

	/**
	 * Map database user to UserProfile
	 */
	private mapDbUserToProfile(dbUser: DbUser): UserProfile {
		try {
			const favoriteTeam = dbUser.favorite_team
				? BASEBALL_TEAMS.find((team) => team.id === dbUser.favorite_team)
				: undefined;

			return {
				id: dbUser.id,
				email: dbUser.email,
				username: dbUser.username,
				displayName: dbUser.display_name || dbUser.username,
				avatar: dbUser.avatar_url || undefined,
				bio: dbUser.bio || '',
				location: dbUser.location || '',
				website: dbUser.website || '',

				favoriteTeam,
				fanSince: dbUser.fan_since || '',
				stadiumVisits: [],
				favoritePlayer: dbUser.favorite_player || '',

				grade: USER_GRADES[dbUser.grade as keyof typeof USER_GRADES] || USER_GRADES.rookie,
				stats: this.getDefaultStats(),
				preferences: this.getDefaultPreferences(),

				isVerified: dbUser.is_verified,
				badges: [],
				achievements: [],

				created: dbUser.created_at,
				updated: dbUser.updated_at
			};
		} catch (error) {
			console.error('[SupabaseAuth] Error mapping user profile:', error);
			// Return minimal profile on error
			return {
				id: dbUser.id,
				email: dbUser.email,
				username: dbUser.username,
				displayName: dbUser.display_name || dbUser.username,
				avatar: undefined,
				bio: '',
				location: '',
				website: '',
				favoriteTeam: undefined,
				fanSince: '',
				stadiumVisits: [],
				favoritePlayer: '',
				grade: USER_GRADES.rookie,
				stats: this.getDefaultStats(),
				preferences: this.getDefaultPreferences(),
				isVerified: false,
				badges: [],
				achievements: [],
				created: dbUser.created_at,
				updated: dbUser.updated_at
			};
		}
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
export const supabaseAuthService = new SupabaseAuthService();

// Export stores for reactive usage
export const {
	user: supabaseUser,
	session: supabaseSession,
	isAuthenticated: isSupabaseAuthenticated,
	isLoading: isSupabaseLoading,
	error: supabaseAuthError
} = supabaseAuthService;
