import { signIn, signOut } from '@auth/sveltekit/client';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export interface User {
	id: string;
	email: string;
	name: string;
	image?: string;
	username?: string;
	displayName?: string;
	grade?: string;
}

export class AuthService {
	static async signInWithGitHub() {
		try {
			await signIn('github', { 
				callbackUrl: get(page).url.searchParams.get('callbackUrl') || '/' 
			});
		} catch (error) {
			console.error('GitHub sign in error:', error);
			throw error;
		}
	}

	static async signOut() {
		try {
			await signOut({ callbackUrl: '/' });
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		}
	}

	static async syncUserWithPocketBase(user: User) {
		// TODO: Implement PocketBase user sync
		console.log('Syncing user with PocketBase:', user);
	}
}