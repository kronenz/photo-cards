/**
 * Auth Guard Utilities for Server-Side Route Protection
 * Feature: 004-production-service-integration
 *
 * Usage in +page.server.ts:
 * ```
 * import { requireAuth } from '$lib/server/authGuard';
 *
 * export const load = requireAuth(async ({ locals }) => {
 *   // Your page data loading logic
 *   return { ... };
 * });
 * ```
 */

import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { RecordModel } from 'pocketbase';

/**
 * Higher-order function that wraps a load function with auth protection
 * Redirects to /auth/signin if user is not authenticated
 */
export function requireAuth<T>(
  loadFn?: (event: RequestEvent & { user: RecordModel }) => Promise<T> | T
) {
  return async (event: RequestEvent) => {
    const { locals, url } = event;

    // Check if user is authenticated
    if (!locals.user) {
      // Redirect to signin with return URL
      const redirectTo = encodeURIComponent(url.pathname + url.search);
      throw redirect(302, `/auth/signin?redirectTo=${redirectTo}`);
    }

    // If a load function is provided, call it with the user
    if (loadFn) {
      return loadFn({ ...event, user: locals.user } as RequestEvent & { user: RecordModel });
    }

    // Default return with user data
    return {
      user: locals.user
    };
  };
}

/**
 * Check if user is authenticated without redirecting
 * Returns user or null
 */
export function getAuthUser(event: RequestEvent): RecordModel | null {
  return event.locals.user || null;
}

/**
 * Get user data for page that optionally uses auth
 * Does not redirect, just returns user if available
 */
export function optionalAuth<T>(
  loadFn?: (event: RequestEvent & { user: RecordModel | null }) => Promise<T> | T
) {
  return async (event: RequestEvent) => {
    const user = event.locals.user || null;

    if (loadFn) {
      return loadFn({ ...event, user } as RequestEvent & { user: RecordModel | null });
    }

    return { user };
  };
}
