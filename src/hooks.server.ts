import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const { handle: authHandle } = SvelteKitAuth({
	providers: [
		GitHub({
			clientId: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET,
		})
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			// TODO: Sync user data with PocketBase
			console.log('User signed in:', { user, account, profile });
			return true;
		},
		async session({ session, token }) {
			// Add custom fields to session
			if (session.user) {
				session.user.id = token.sub as string;
			}
			return session;
		},
		async jwt({ token, user, account, profile }) {
			// Persist user data in JWT token
			if (user) {
				token.id = user.id;
			}
			return token;
		}
	},
	pages: {
		signIn: '/auth/signin',
		error: '/auth/error'
	}
});

export const handle: Handle = authHandle;