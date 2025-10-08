/**
 * Unified State Management Stores
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Global state for unified platform (cards, users, theme)
 */

import { writable, derived, type Readable } from 'svelte/store';
import type { UnifiedCard, UnifiedUser, Collection } from '$lib/types/unified';

// ===== GLOBAL STORES =====

/**
 * Global card store - Map for O(1) lookups
 */
export const unifiedCards = writable<Map<string, UnifiedCard>>(new Map());

/**
 * Current authenticated user
 */
export const currentUser = writable<UnifiedUser | null>(null);

/**
 * Collections store
 */
export const collections = writable<Map<string, Collection>>(new Map());

// ===== DERIVED STORES =====

/**
 * Team theme based on user's favorite team
 */
export const teamTheme: Readable<{
  color: string | undefined;
  teamId: string;
} | null> = derived(currentUser, ($user) => {
  if (!$user || $user.preferences.theme !== 'kbo-team') return null;

  return {
    color: $user.preferences.teamThemeColor,
    teamId: $user.fanProfile.favoriteTeam,
  };
});

/**
 * Completed collections (100% progress)
 */
export const completedCollections: Readable<Collection[]> = derived(
  [currentUser, collections],
  ([$user, $collections]) => {
    if (!$user) return [];

    return Array.from($collections.values()).filter((col) => {
      const progress = $user.collections.collectionProgress.find((p) => p.collectionId === col.id);
      return progress && progress.progress === 100;
    });
  }
);

/**
 * User's owned cards (array for rendering)
 */
export const ownedCards: Readable<UnifiedCard[]> = derived(
  [currentUser, unifiedCards],
  ([$user, $cards]) => {
    if (!$user) return [];

    return $user.collections.owned
      .map((cardId) => $cards.get(cardId))
      .filter((card): card is UnifiedCard => card !== undefined);
  }
);

/**
 * User's rare cards (rare, epic, legendary)
 */
export const rareCards: Readable<UnifiedCard[]> = derived(ownedCards, ($owned) => {
  return $owned.filter((card) => ['rare', 'epic', 'legendary'].includes(card.photocard.rarity));
});

/**
 * Latest acquired cards (last 3)
 */
export const latestCards: Readable<UnifiedCard[]> = derived(ownedCards, ($owned) => {
  return $owned
    .filter((card) => card.photocard.acquiredAt)
    .sort(
      (a, b) =>
        (b.photocard.acquiredAt?.getTime() || 0) - (a.photocard.acquiredAt?.getTime() || 0)
    )
    .slice(0, 3);
});

// ===== STORE ACTIONS =====

/**
 * Add or update a card in the store
 */
export function upsertCard(card: UnifiedCard): void {
  unifiedCards.update(($cards) => {
    $cards.set(card.id, card);
    return $cards;
  });
}

/**
 * Get a single card by ID (returns a derived store)
 */
export function getCard(id: string): Readable<UnifiedCard | undefined> {
  return derived(unifiedCards, ($cards) => $cards.get(id));
}

/**
 * Remove a card from the store
 */
export function removeCard(id: string): void {
  unifiedCards.update(($cards) => {
    $cards.delete(id);
    return $cards;
  });
}

/**
 * Update user's favorite team and theme
 */
export function updateUserTeam(teamId: string, teamColor: string): void {
  currentUser.update(($user) => {
    if (!$user) return $user;

    return {
      ...$user,
      fanProfile: {
        ...$user.fanProfile,
        favoriteTeam: teamId,
      },
      preferences: {
        ...$user.preferences,
        theme: 'kbo-team',
        teamThemeColor: teamColor,
      },
    };
  });
}

/**
 * Add a collection to the store
 */
export function upsertCollection(collection: Collection): void {
  collections.update(($collections) => {
    $collections.set(collection.id, collection);
    return $collections;
  });
}

/**
 * Update collection progress for current user
 */
export function updateCollectionProgress(
  collectionId: string,
  ownedCards: number,
  totalCards: number
): void {
  currentUser.update(($user) => {
    if (!$user) return $user;

    const progress = (ownedCards / totalCards) * 100;
    const existingIndex = $user.collections.collectionProgress.findIndex(
      (p) => p.collectionId === collectionId
    );

    if (existingIndex >= 0) {
      $user.collections.collectionProgress[existingIndex] = {
        collectionId,
        totalCards,
        ownedCards,
        progress,
      };
    } else {
      $user.collections.collectionProgress.push({
        collectionId,
        totalCards,
        ownedCards,
        progress,
      });
    }

    return $user;
  });
}

/**
 * Like a card (increment likes, add user to likers)
 */
export function likeCard(cardId: string, userId: string): void {
  unifiedCards.update(($cards) => {
    const card = $cards.get(cardId);
    if (!card) return $cards;

    card.community.metadata.likes++;
    $cards.set(cardId, { ...card });
    return $cards;
  });
}

/**
 * Unlike a card (decrement likes, remove user from likers)
 */
export function unlikeCard(cardId: string, userId: string): void {
  unifiedCards.update(($cards) => {
    const card = $cards.get(cardId);
    if (!card) return $cards;

    card.community.metadata.likes = Math.max(0, card.community.metadata.likes - 1);
    $cards.set(cardId, { ...card });
    return $cards;
  });
}

/**
 * Increment card view count
 */
export function incrementCardViews(cardId: string): void {
  unifiedCards.update(($cards) => {
    const card = $cards.get(cardId);
    if (!card) return $cards;

    card.photocard.stats.totalViews++;
    $cards.set(cardId, { ...card });
    return $cards;
  });
}

/**
 * Update card rating
 */
export function rateCard(cardId: string, rating: number): void {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  unifiedCards.update(($cards) => {
    const card = $cards.get(cardId);
    if (!card) return $cards;

    const currentTotal = card.community.metadata.rating * card.community.metadata.ratingCount;
    card.community.metadata.ratingCount++;
    card.community.metadata.rating = (currentTotal + rating) / card.community.metadata.ratingCount;

    $cards.set(cardId, { ...card });
    return $cards;
  });
}

// ===== FILTERS & QUERIES =====

/**
 * Get cards by context
 */
export function getCardsByContext(context: UnifiedCard['context']): Readable<UnifiedCard[]> {
  return derived(unifiedCards, ($cards) => {
    return Array.from($cards.values()).filter((card) => card.context === context);
  });
}

/**
 * Get cards by rarity
 */
export function getCardsByRarity(rarity: UnifiedCard['photocard']['rarity']): Readable<UnifiedCard[]> {
  return derived(unifiedCards, ($cards) => {
    return Array.from($cards.values()).filter((card) => card.photocard.rarity === rarity);
  });
}

/**
 * Get cards by creator
 */
export function getCardsByCreator(creatorId: string): Readable<UnifiedCard[]> {
  return derived(unifiedCards, ($cards) => {
    return Array.from($cards.values()).filter((card) => card.community.creator === creatorId);
  });
}

/**
 * Get public cards (for community feed)
 */
export const publicCards: Readable<UnifiedCard[]> = derived(unifiedCards, ($cards) => {
  return Array.from($cards.values()).filter((card) => card.community.isPublic);
});

/**
 * Get trending cards (high likes in last 24h)
 */
export const trendingCards: Readable<UnifiedCard[]> = derived(unifiedCards, ($cards) => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  return Array.from($cards.values())
    .filter((card) => card.createdAt >= oneDayAgo && card.community.metadata.likes > 0)
    .sort((a, b) => b.community.metadata.likes - a.community.metadata.likes)
    .slice(0, 10);
});
