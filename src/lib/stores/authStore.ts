/**
 * Auth Store - Centralized authentication state management
 * Feature: 004-production-service-integration
 * Syncs with PocketBase authStore
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { pb } from '$lib/pocketbase';
import type { User } from '$lib/types/models';

// ============================================
// Store State
// ============================================

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isInitialized: false
};

// Create the main auth store
const authState = writable<AuthState>(initialState);

// ============================================
// Derived Stores
// ============================================

export const user = derived(authState, ($state) => $state.user);
export const isAuthenticated = derived(authState, ($state) => !!$state.user && !!$state.token);
export const isLoading = derived(authState, ($state) => $state.isLoading);
export const isInitialized = derived(authState, ($state) => $state.isInitialized);

// ============================================
// Store Actions
// ============================================

/**
 * Initialize auth state from PocketBase authStore
 * Call this once on app mount
 */
export function initializeAuth(): void {
  if (!browser) return;

  // Load from PocketBase authStore
  const isValid = pb.authStore.isValid;
  const model = pb.authStore.model;
  const token = pb.authStore.token;

  authState.update((state) => ({
    ...state,
    user: isValid && model ? (model as unknown as User) : null,
    token: isValid ? token : null,
    isLoading: false,
    isInitialized: true
  }));

  // Subscribe to auth changes
  pb.authStore.onChange((newToken, newModel) => {
    authState.update((state) => ({
      ...state,
      user: newModel ? (newModel as unknown as User) : null,
      token: newToken || null
    }));
  });
}

/**
 * Set user after login/signup
 */
export function setUser(userData: User, token: string): void {
  authState.update((state) => ({
    ...state,
    user: userData,
    token,
    isLoading: false
  }));
}

/**
 * Clear user on logout
 */
export function clearUser(): void {
  authState.update((state) => ({
    ...state,
    user: null,
    token: null
  }));
}

/**
 * Update user data (e.g., after profile edit)
 */
export function updateUser(updates: Partial<User>): void {
  authState.update((state) => ({
    ...state,
    user: state.user ? { ...state.user, ...updates } : null
  }));
}

/**
 * Set loading state
 */
export function setLoading(loading: boolean): void {
  authState.update((state) => ({
    ...state,
    isLoading: loading
  }));
}

/**
 * Get current user synchronously
 */
export function getCurrentUser(): User | null {
  return get(authState).user;
}

/**
 * Check if user is authenticated synchronously
 */
export function checkIsAuthenticated(): boolean {
  const state = get(authState);
  return !!state.user && !!state.token;
}

// ============================================
// Export Store
// ============================================

export const authStore = {
  subscribe: authState.subscribe,
  initialize: initializeAuth,
  setUser,
  clearUser,
  updateUser,
  setLoading,
  getCurrentUser,
  checkIsAuthenticated
};

export default authStore;
