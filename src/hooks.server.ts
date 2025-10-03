// Simple handle function for now - OAuth integration will be added later
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Add getSession function to locals for compatibility
	event.locals.getSession = async () => {
		// Return null session for now - OAuth integration will be added later
		return null;
	};

	// For now, just pass through requests
	// OAuth integration will be implemented when environment variables are properly configured
	return resolve(event);
};