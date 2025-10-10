/**
 * Collections Service Layer
 * Feature: 003-navigation-ui-renewal
 * Backend: PocketBase collections collection
 */

import { pb, collections } from '$lib/pocketbase';
import { handlePocketBaseError } from '$lib/utils/errorHandler';
import type { Collection } from '$lib/types/collections';

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
