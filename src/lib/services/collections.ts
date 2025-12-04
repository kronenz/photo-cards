/**
 * Collections Service Layer
 * Feature: 003-navigation-ui-renewal, 004-production-service-integration
 * Backend: PocketBase collections collection
 */

import { pb, collections } from '$lib/pocketbase';
import { handlePocketBaseError } from '$lib/utils/errorHandler';
import type { Collection } from '$lib/types/collections';
import type { Team, Rarity } from '$lib/types/models';

export interface CollectionCreationData {
	name: string;
	description?: string;
	is_public: boolean;
	tags?: string[];
}

/**
 * Get all collections for current user
 * @param options - Query options
 * @returns List of collections
 */
export async function getUserCollections(options?: {
	page?: number;
	perPage?: number;
	sort?: string;
}): Promise<{ items: Collection[]; totalPages: number; totalItems: number }> {
	try {
		const userId = pb.authStore.model?.id;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		const result = await collections.collections.getList<Collection>(
			options?.page || 1,
			options?.perPage || 30,
			{
				filter: `user="${userId}"`,
				sort: options?.sort || '-created',
				expand: 'cards'
			}
		);

		return result;
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Create new collection
 * @param data - Collection data
 * @returns Created collection
 */
export async function createCollection(data: CollectionCreationData): Promise<Collection> {
	try {
		const userId = pb.authStore.model?.id;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		return await collections.collections.create<Collection>({
			...data,
			user: userId,
			cards: []
		});
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Update collection
 * @param collectionId - Collection ID
 * @param data - Updated fields
 * @returns Updated collection
 */
export async function updateCollection(
	collectionId: string,
	data: Partial<CollectionCreationData>
): Promise<Collection> {
	try {
		return await collections.collections.update<Collection>(collectionId, data);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Delete collection
 * @param collectionId - Collection ID
 */
export async function deleteCollection(collectionId: string): Promise<void> {
	try {
		await collections.collections.delete(collectionId);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Add card to collection
 * @param collectionId - Collection ID
 * @param cardId - Card ID
 */
export async function addCardToCollection(collectionId: string, cardId: string): Promise<void> {
	try {
		const collection = await collections.collections.getOne<Collection>(collectionId);
		const updatedCards = [...(collection.cards || []), cardId];

		await collections.collections.update(collectionId, {
			cards: updatedCards
		});
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Remove card from collection
 * @param collectionId - Collection ID
 * @param cardId - Card ID
 */
export async function removeCardFromCollection(
	collectionId: string,
	cardId: string
): Promise<void> {
	try {
		const collection = await collections.collections.getOne<Collection>(collectionId);
		const updatedCards = (collection.cards || []).filter((id) => id !== cardId);

		await collections.collections.update(collectionId, {
			cards: updatedCards
		});
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

// ============================================
// Feature: 004-production-service-integration
// User Story 3: Card Collection Management
// ============================================

export interface UserCard {
	id: string;
	user: string;
	card: string;
	is_favorite: boolean;
	count: number;
	obtained_via: string;
	created: string;
	updated: string;
	expand?: {
		card?: {
			id: string;
			title: string;
			subtitle: string;
			team: Team;
			rarity: Rarity;
			image_url: string;
			thumb_url: string;
			number?: string;
		};
	};
}

export interface CollectionFilters {
	team?: Team;
	rarity?: Rarity;
	favorite?: boolean;
}

export interface CollectionSort {
	field: 'created' | 'rarity' | 'team' | 'title';
	direction: 'asc' | 'desc';
}

export interface CollectionStats {
	totalCards: number;
	byTeam: Record<Team, number>;
	byRarity: Record<Rarity, number>;
	favoriteCount: number;
}

/**
 * Get user's card collection with filters and sorting
 * Feature: 004-production-service-integration
 */
export async function getUserCollection(options?: {
	page?: number;
	perPage?: number;
	filters?: CollectionFilters;
	sort?: CollectionSort;
}): Promise<{ items: UserCard[]; totalPages: number; totalItems: number }> {
	try {
		const userId = pb.authStore.model?.id;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		// Build filter string
		const filterParts: string[] = [`user="${userId}"`];

		if (options?.filters?.favorite !== undefined) {
			filterParts.push(`is_favorite=${options.filters.favorite}`);
		}

		// Build sort string
		let sortString = '-created';
		if (options?.sort) {
			const prefix = options.sort.direction === 'asc' ? '' : '-';
			if (options.sort.field === 'created') {
				sortString = `${prefix}created`;
			} else {
				sortString = `${prefix}expand.card.${options.sort.field}`;
			}
		}

		const result = await pb.collection('user_cards').getList<UserCard>(
			options?.page || 1,
			options?.perPage || 30,
			{
				filter: filterParts.join(' && '),
				sort: sortString,
				expand: 'card'
			}
		);

		// Apply client-side filters for expanded card data
		let filteredItems = result.items;

		if (options?.filters?.team) {
			filteredItems = filteredItems.filter(
				(item) => item.expand?.card?.team === options.filters?.team
			);
		}

		if (options?.filters?.rarity) {
			filteredItems = filteredItems.filter(
				(item) => item.expand?.card?.rarity === options.filters?.rarity
			);
		}

		return {
			items: filteredItems,
			totalPages: result.totalPages,
			totalItems: result.totalItems
		};
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Get collection statistics
 * Feature: 004-production-service-integration
 */
export async function getCollectionStats(): Promise<CollectionStats> {
	try {
		const userId = pb.authStore.model?.id;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		// Get all user cards to calculate stats
		const result = await pb.collection('user_cards').getFullList<UserCard>({
			filter: `user="${userId}"`,
			expand: 'card'
		});

		const stats: CollectionStats = {
			totalCards: result.length,
			byTeam: {
				lg: 0, doosan: 0, kt: 0, samsung: 0, nc: 0,
				kia: 0, lotte: 0, ssg: 0, hanwha: 0, kiwoom: 0
			},
			byRarity: { common: 0, rare: 0, epic: 0, legendary: 0 },
			favoriteCount: 0
		};

		for (const item of result) {
			if (item.is_favorite) {
				stats.favoriteCount++;
			}

			const card = item.expand?.card;
			if (card) {
				if (card.team && stats.byTeam[card.team] !== undefined) {
					stats.byTeam[card.team]++;
				}
				if (card.rarity && stats.byRarity[card.rarity] !== undefined) {
					stats.byRarity[card.rarity]++;
				}
			}
		}

		return stats;
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Toggle favorite status for a user card
 * Feature: 004-production-service-integration
 */
export async function toggleFavorite(userCardId: string): Promise<boolean> {
	try {
		const userCard = await pb.collection('user_cards').getOne<UserCard>(userCardId);
		const newFavoriteStatus = !userCard.is_favorite;

		await pb.collection('user_cards').update(userCardId, {
			is_favorite: newFavoriteStatus
		});

		return newFavoriteStatus;
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}
