import PocketBase from 'pocketbase';
import { config } from './config.js';
import { browser } from '$app/environment';

// Create PocketBase instance
export const pb = new PocketBase(config.pocketbaseUrl);

// Disable auto cancellation for better UX
pb.autoCancellation(false);

// Initialize auth store from localStorage in browser
if (browser) {
	pb.authStore.loadFromCookie(document.cookie);
}

// Types for our collections
export interface User {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatar?: string;
	grade: 'general' | 'photographer' | 'journalist' | 'master';
	bio?: string;
	stats: {
		cardsCreated: number;
		totalLikes: number;
		followers: number;
		following: number;
		gradePoints: number;
	};
	preferences: {
		emailNotifications: boolean;
		publicProfile: boolean;
	};
	created: string;
	updated: string;
}

export interface Card {
	id: string;
	userId: string;
	title: string;
	description?: string;
	imageUrl: string;
	holographicEffect: {
		type: string;
		intensity: number;
		colorShift: number;
		reflectionAngle: number;
		animationSpeed: number;
	};
	elements: Array<{
		id: string;
		type: 'text' | 'sticker' | 'shape';
		content: string;
		position: { x: number; y: number };
		style: Record<string, any>;
		zIndex: number;
	}>;
	isPublic: boolean;
	tags: string[];
	likes: number;
	views: number;
	created: string;
	updated: string;
}

export interface Comment {
	id: string;
	cardId: string;
	userId: string;
	content: string;
	parentId?: string;
	likes: number;
	created: string;
	updated: string;
}

// Helper functions for common operations
export class PocketBaseService {
	static async getCurrentUser(): Promise<User | null> {
		if (!pb.authStore.isValid) {
			return null;
		}
		
		try {
			const user = await pb.collection('users').getOne<User>(pb.authStore.model?.id);
			return user;
		} catch (error) {
			console.error('Failed to get current user:', error);
			return null;
		}
	}

	static async createUser(userData: Partial<User>): Promise<User> {
		return await pb.collection('users').create<User>(userData);
	}

	static async updateUser(id: string, userData: Partial<User>): Promise<User> {
		return await pb.collection('users').update<User>(id, userData);
	}

	static async getCards(filter?: string, sort?: string): Promise<Card[]> {
		return await pb.collection('cards').getFullList<Card>({
			filter,
			sort: sort || '-created',
		});
	}

	static async createCard(cardData: Partial<Card>): Promise<Card> {
		return await pb.collection('cards').create<Card>(cardData);
	}

	static async updateCard(id: string, cardData: Partial<Card>): Promise<Card> {
		return await pb.collection('cards').update<Card>(id, cardData);
	}

	static async deleteCard(id: string): Promise<void> {
		await pb.collection('cards').delete(id);
	}
}

export default pb;