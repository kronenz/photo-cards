/**
 * Card Service Layer
 * Feature: 003-navigation-ui-renewal
 * Backend: PocketBase unified_cards collection
 */

import { pb, collections } from '$lib/pocketbase';
import { handlePocketBaseError } from '$lib/utils/errorHandler';
import type { UnifiedCard } from '$lib/types/collections';

export interface CardCreationData {
	title: string;
	description?: string;
	image: File;
	holographic_effect: string;
	holographic_intensity: number;
	photocard_rarity: string;
	community_is_public: boolean;
	community_tags?: string[];
	context: 'community' | 'collection';
}

/**
 * Create a new card
 * @param data - Card creation data with image file
 * @returns Created card record
 */
export async function createCard(data: CardCreationData): Promise<UnifiedCard> {
	try {
		// Step 1: Create card record without image
		const cardData = {
			title: data.title,
			description: data.description,
			holographic_effect: data.holographic_effect,
			holographic_intensity: data.holographic_intensity,
			holographic_animation_duration: 300,
			photocard_rarity: data.photocard_rarity,
			photocard_season: new Date().getFullYear().toString(),
			community_creator: pb.authStore.model?.id || '',
			community_is_public: data.community_is_public,
			community_tags: data.community_tags || [],
			context: data.context
		};

		const card = await collections.unifiedCards.create<UnifiedCard>(cardData);

		// Step 2: Upload image with card ID
		if (data.image) {
			const formData = new FormData();
			formData.append('holographic_image', data.image);
			await collections.unifiedCards.update(card.id, formData);
		}

		return card;
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Get cards for current user
 * @param options - Query options (filter, sort, page)
 * @returns List of cards
 */
export async function getUserCards(options?: {
	page?: number;
	perPage?: number;
	sort?: string;
}): Promise<{ items: UnifiedCard[]; totalPages: number; totalItems: number }> {
	try {
		const userId = pb.authStore.model?.id;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		const result = await collections.unifiedCards.getList<UnifiedCard>(
			options?.page || 1,
			options?.perPage || 30,
			{
				filter: `community_creator="${userId}"`,
				sort: options?.sort || '-created'
			}
		);

		return result;
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Get single card by ID
 * @param cardId - Card ID
 * @returns Card record
 */
export async function getCard(cardId: string): Promise<UnifiedCard> {
	try {
		return await collections.unifiedCards.getOne<UnifiedCard>(cardId);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Update existing card
 * @param cardId - Card ID
 * @param data - Updated fields
 * @returns Updated card
 */
export async function updateCard(
	cardId: string,
	data: Partial<CardCreationData>
): Promise<UnifiedCard> {
	try {
		const updateData: any = { ...data };

		// Handle image upload separately
		if (data.image) {
			const formData = new FormData();
			formData.append('holographic_image', data.image);
			Object.entries(updateData).forEach(([key, value]) => {
				if (key !== 'image') {
					formData.append(key, value as string);
				}
			});
			return await collections.unifiedCards.update<UnifiedCard>(cardId, formData);
		}

		return await collections.unifiedCards.update<UnifiedCard>(cardId, updateData);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}

/**
 * Delete card
 * @param cardId - Card ID
 */
export async function deleteCard(cardId: string): Promise<void> {
	try {
		await collections.unifiedCards.delete(cardId);
	} catch (error: any) {
		throw handlePocketBaseError(error);
	}
}
