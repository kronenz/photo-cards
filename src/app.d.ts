// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type PocketBase from 'pocketbase';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: PocketBase;
			user?: {
				id: string;
				email: string;
				username: string;
				displayName: string;
				avatar?: string;
				grade: string;
			};
			getSession: () => Promise<any>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};