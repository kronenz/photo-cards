/**
 * Authentication Service Layer
 * Feature: 003-navigation-ui-renewal
 * Backend: PocketBase users collection
 */

import { pb } from '$lib/pocketbase';
import { goto } from '$app/navigation';
import { handlePocketBaseError } from '$lib/utils/errorHandler';
import type { User } from '$lib/types/collections';

export interface AuthResponse {
	token: string;
	record: User;
}

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @returns Auth token and user record
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
	try {
		const authData = await pb.collection('users').authWithPassword(email, password);
		return {
			token: authData.token,
			record: authData.record as User
		};
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Sign up new user
 * @param email - User email
 * @param password - User password
 * @param passwordConfirm - Password confirmation
 * @param name - Display name
 * @returns Auth token and user record
 */
export async function signup(
	email: string,
	password: string,
	passwordConfirm: string,
	name: string
): Promise<AuthResponse> {
	try {
		// Create user account
		const user = await pb.collection('users').create({
			email,
			password,
			passwordConfirm,
			name,
			emailVisibility: true
		});

		// Auto-login after signup
		const authData = await pb.collection('users').authWithPassword(email, password);

		return {
			token: authData.token,
			record: authData.record as User
		};
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
	pb.authStore.clear();
	await goto('/login');
}

/**
 * Check if user is authenticated
 * @returns true if valid token exists
 */
export function isAuthenticated(): boolean {
	return pb.authStore.isValid;
}

/**
 * Get current authenticated user
 * @returns User record or null
 */
export function getCurrentUser(): User | null {
	return pb.authStore.model as User | null;
}

/**
 * Request password reset email
 * @param email - User email
 */
export async function requestPasswordReset(email: string): Promise<void> {
	try {
		await pb.collection('users').requestPasswordReset(email);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Confirm password reset with token
 * @param token - Reset token from email
 * @param password - New password
 * @param passwordConfirm - Password confirmation
 */
export async function confirmPasswordReset(
	token: string,
	password: string,
	passwordConfirm: string
): Promise<void> {
	try {
		await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * OAuth login with Google
 */
export async function loginWithGoogle(): Promise<void> {
	try {
		await pb.collection('users').authWithOAuth2({ provider: 'google' });
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * OAuth login with GitHub
 */
export async function loginWithGitHub(): Promise<void> {
	try {
		await pb.collection('users').authWithOAuth2({ provider: 'github' });
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}
