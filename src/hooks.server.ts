/**
 * SvelteKit Server Hooks
 * Feature: 004-production-service-integration
 * PocketBase authentication middleware with cookie-based sessions
 */

import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

const PB_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';

export const handle: Handle = async ({ event, resolve }) => {
	// Create a new PocketBase instance for each request
	event.locals.pb = new PocketBase(PB_URL);

	// Load auth state from cookie
	const cookie = event.request.headers.get('cookie') || '';
	event.locals.pb.authStore.loadFromCookie(cookie);

	// Try to refresh the auth token if it's valid but might be expiring
	if (event.locals.pb.authStore.isValid) {
		try {
			// Refresh the token to extend the session
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = event.locals.pb.authStore.model;
		} catch (err) {
			// Token is invalid or expired, clear the auth store
			event.locals.pb.authStore.clear();
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	// Add getSession function for compatibility
	event.locals.getSession = async () => {
		if (event.locals.pb.authStore.isValid && event.locals.user) {
			return {
				user: {
					id: event.locals.user.id,
					email: event.locals.user.email,
					name: event.locals.user.name
				}
			};
		}
		return null;
	};

	// Resolve the request
	const response = await resolve(event);

	// Set the auth cookie on the response
	// Cookie settings: httpOnly for security, 24-hour expiry
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax' as const,
		path: '/',
		maxAge: 60 * 60 * 24 // 24 hours
	};

	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie(cookieOptions));

	return response;
};
