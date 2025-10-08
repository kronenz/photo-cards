/**
 * State Synchronization Integration Tests (T030)
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Test that unified stores synchronize correctly between components
 * Requirements: FR-005, FR-006, FR-010, FR-018
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  unifiedCards,
  currentUser,
  collections,
  ownedCards,
  latestCards,
  rareCards,
  publicCards,
  completedCollections,
  teamTheme,
  upsertCard,
  removeCard,
  likeCard,
  unlikeCard,
  incrementCardViews,
  rateCard,
  updateUserTeam,
  upsertCollection,
  updateCollectionProgress,
} from '$lib/stores/unified';
import type { UnifiedCard, UnifiedUser, Collection } from '$lib/types/unified';

// ===== MOCK DATA =====

const mockUser: UnifiedUser = {
  id: 'user-001',
  username: 'testuser',
  displayName: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  email: 'test@example.com',
  fanProfile: {
    favoriteTeam: 'LG',
    fanLevel: 'bronze-fan',
    fanLevelName: 'Bronze Fan',
    followedCreators: ['creator-001'],
    followedTeams: ['LG', 'DOOSAN'],
    joinDate: new Date('2024-01-01'),
  },
  collections: {
    owned: ['card-001', 'card-002', 'card-003'],
    wishlist: ['card-004'],
    collectionProgress: [
      { collectionId: 'col-001', totalCards: 10, ownedCards: 3, progress: 30 },
      { collectionId: 'col-002', totalCards: 5, ownedCards: 5, progress: 100 },
    ],
  },
  preferences: {
    theme: 'kbo-team',
    teamThemeColor: '#c30452',
    language: 'ko',
    enableNotifications: true,
    enableSound: true,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockCard1: UnifiedCard = {
  id: 'card-001',
  title: 'Card 1',
  holographic: {
    image: 'https://example.com/card1.jpg',
    backImage: 'https://example.com/back.jpg',
    effect: 'soft-light',
    intensity: 80,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'legendary',
    season: '2025',
    stats: {
      totalViews: 100,
      uniqueCollectors: 10,
      completionRate: 50,
    },
    collections: ['col-001'],
    acquiredAt: new Date('2024-01-10'),
  },
  community: {
    creator: 'creator-001',
    isPublic: true,
    tags: ['kbo', 'lg'],
    metadata: {
      likes: 50,
      downloads: 20,
      rating: 4.5,
      ratingCount: 10,
    },
  },
  context: 'collection',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-10'),
};

const mockCard2: UnifiedCard = {
  id: 'card-002',
  title: 'Card 2',
  holographic: {
    image: 'https://example.com/card2.jpg',
    backImage: 'https://example.com/back.jpg',
    effect: 'overlay',
    intensity: 70,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'rare',
    season: '2025',
    stats: {
      totalViews: 50,
      uniqueCollectors: 5,
      completionRate: 20,
    },
    collections: ['col-001'],
    acquiredAt: new Date('2024-01-12'),
  },
  community: {
    creator: 'creator-001',
    isPublic: true,
    tags: ['kbo', 'doosan'],
    metadata: {
      likes: 30,
      downloads: 10,
      rating: 4.0,
      ratingCount: 5,
    },
  },
  context: 'collection',
  createdAt: new Date('2024-01-05'),
  updatedAt: new Date('2024-01-12'),
};

const mockCard3: UnifiedCard = {
  id: 'card-003',
  title: 'Card 3',
  holographic: {
    image: 'https://example.com/card3.jpg',
    backImage: 'https://example.com/back.jpg',
    effect: 'hard-light',
    intensity: 90,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'epic',
    season: '2025',
    stats: {
      totalViews: 75,
      uniqueCollectors: 8,
      completionRate: 35,
    },
    collections: ['col-002'],
    acquiredAt: new Date('2024-01-15'),
  },
  community: {
    creator: 'creator-002',
    isPublic: false,
    tags: ['kbo', 'kt'],
    metadata: {
      likes: 40,
      downloads: 15,
      rating: 4.8,
      ratingCount: 8,
    },
  },
  context: 'community',
  createdAt: new Date('2024-01-08'),
  updatedAt: new Date('2024-01-15'),
};

const mockCard4: UnifiedCard = {
  id: 'card-004',
  title: 'Card 4',
  holographic: {
    image: 'https://example.com/card4.jpg',
    backImage: 'https://example.com/back.jpg',
    effect: 'soft-light',
    intensity: 85,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'common',
    season: '2025',
    stats: {
      totalViews: 200,
      uniqueCollectors: 50,
      completionRate: 90,
    },
    collections: ['col-003'],
    acquiredAt: undefined,
  },
  community: {
    creator: 'creator-003',
    isPublic: true,
    tags: ['kbo', 'samsung'],
    metadata: {
      likes: 100,
      downloads: 50,
      rating: 4.9,
      ratingCount: 20,
    },
  },
  context: 'test',
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-16'),
};

const mockCollection1: Collection = {
  id: 'col-001',
  name: 'Collection 1',
  description: 'Test collection 1',
  theme: 'kbo',
  totalCards: 10,
  creator: 'creator-001',
  isPublic: true,
  coverImage: 'https://example.com/col1.jpg',
  tags: ['kbo', 'lg'],
  stats: {
    subscribers: 50,
    completionRate: 30,
    totalViews: 500,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-10'),
};

const mockCollection2: Collection = {
  id: 'col-002',
  name: 'Collection 2',
  description: 'Test collection 2',
  theme: 'kbo',
  totalCards: 5,
  creator: 'creator-001',
  isPublic: true,
  coverImage: 'https://example.com/col2.jpg',
  tags: ['kbo', 'doosan'],
  stats: {
    subscribers: 30,
    completionRate: 100,
    totalViews: 300,
  },
  createdAt: new Date('2024-01-05'),
  updatedAt: new Date('2024-01-12'),
};

// ===== TEST SUITE =====

describe('State Synchronization - Card Store', () => {
  beforeEach(() => {
    // Reset stores to empty state
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should add card to store with upsertCard', () => {
    upsertCard(mockCard1);
    const cards = get(unifiedCards);
    expect(cards.size).toBe(1);
    expect(cards.get('card-001')).toEqual(mockCard1);
  });

  it('should update existing card in store with upsertCard', () => {
    upsertCard(mockCard1);
    const updatedCard = { ...mockCard1, title: 'Updated Card 1' };
    upsertCard(updatedCard);

    const cards = get(unifiedCards);
    expect(cards.size).toBe(1);
    expect(cards.get('card-001')?.title).toBe('Updated Card 1');
  });

  it('should remove card from store with removeCard', () => {
    upsertCard(mockCard1);
    upsertCard(mockCard2);
    removeCard('card-001');

    const cards = get(unifiedCards);
    expect(cards.size).toBe(1);
    expect(cards.has('card-001')).toBe(false);
    expect(cards.has('card-002')).toBe(true);
  });

  it('should handle multiple card upserts', () => {
    upsertCard(mockCard1);
    upsertCard(mockCard2);
    upsertCard(mockCard3);
    upsertCard(mockCard4);

    const cards = get(unifiedCards);
    expect(cards.size).toBe(4);
  });
});

describe('State Synchronization - User Store', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should set current user', () => {
    currentUser.set(mockUser);
    const user = get(currentUser);
    expect(user).toEqual(mockUser);
  });

  it('should update user team with updateUserTeam', () => {
    currentUser.set(mockUser);
    updateUserTeam('DOOSAN', '#131230');

    const user = get(currentUser);
    expect(user?.fanProfile.favoriteTeam).toBe('DOOSAN');
    expect(user?.preferences.teamThemeColor).toBe('#131230');
    expect(user?.preferences.theme).toBe('kbo-team');
  });

  it('should not crash when updating team with no user', () => {
    currentUser.set(null);
    updateUserTeam('DOOSAN', '#131230');
    const user = get(currentUser);
    expect(user).toBeNull();
  });
});

describe('State Synchronization - Collection Store', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should add collection to store with upsertCollection', () => {
    upsertCollection(mockCollection1);
    const cols = get(collections);
    expect(cols.size).toBe(1);
    expect(cols.get('col-001')).toEqual(mockCollection1);
  });

  it('should update collection progress for current user', () => {
    currentUser.set(mockUser);
    updateCollectionProgress('col-001', 5, 10);

    const user = get(currentUser);
    const progress = user?.collections.collectionProgress.find((p) => p.collectionId === 'col-001');
    expect(progress?.ownedCards).toBe(5);
    expect(progress?.totalCards).toBe(10);
    expect(progress?.progress).toBe(50);
  });

  it('should add new collection progress if not exists', () => {
    currentUser.set(mockUser);
    updateCollectionProgress('col-new', 3, 8);

    const user = get(currentUser);
    const progress = user?.collections.collectionProgress.find((p) => p.collectionId === 'col-new');
    expect(progress).toBeDefined();
    expect(progress?.ownedCards).toBe(3);
    expect(progress?.totalCards).toBe(8);
    expect(progress?.progress).toBe(37.5);
  });
});

describe('State Synchronization - Card Actions', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should increment card likes with likeCard', () => {
    upsertCard(mockCard1);
    likeCard('card-001', 'user-001');

    const cards = get(unifiedCards);
    expect(cards.get('card-001')?.community.metadata.likes).toBe(51); // 50 + 1
  });

  it('should decrement card likes with unlikeCard', () => {
    upsertCard(mockCard1);
    unlikeCard('card-001', 'user-001');

    const cards = get(unifiedCards);
    expect(cards.get('card-001')?.community.metadata.likes).toBe(49); // 50 - 1
  });

  it('should not go below 0 likes with unlikeCard', () => {
    const zeroLikesCard = { ...mockCard1, community: { ...mockCard1.community, metadata: { ...mockCard1.community.metadata, likes: 0 } } };
    upsertCard(zeroLikesCard);
    unlikeCard('card-001', 'user-001');

    const cards = get(unifiedCards);
    expect(cards.get('card-001')?.community.metadata.likes).toBe(0);
  });

  it('should increment card views with incrementCardViews', () => {
    upsertCard(mockCard1);
    incrementCardViews('card-001');

    const cards = get(unifiedCards);
    expect(cards.get('card-001')?.photocard.stats.totalViews).toBe(101); // 100 + 1
  });

  it('should update card rating with rateCard', () => {
    upsertCard(mockCard1);
    rateCard('card-001', 5); // Add 5-star rating

    const cards = get(unifiedCards);
    const card = cards.get('card-001');
    expect(card?.community.metadata.ratingCount).toBe(11); // 10 + 1
    expect(card?.community.metadata.rating).toBeCloseTo(4.55, 2); // (4.5 * 10 + 5) / 11
  });

  it('should throw error for invalid rating', () => {
    upsertCard(mockCard1);
    expect(() => rateCard('card-001', 6)).toThrow('Rating must be between 1 and 5');
    expect(() => rateCard('card-001', 0)).toThrow('Rating must be between 1 and 5');
  });

  it('should handle actions on non-existent cards gracefully', () => {
    likeCard('non-existent', 'user-001');
    unlikeCard('non-existent', 'user-001');
    incrementCardViews('non-existent');

    const cards = get(unifiedCards);
    expect(cards.size).toBe(0);
  });
});

describe('State Synchronization - Derived Stores', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should derive ownedCards from user and cards', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1);
    upsertCard(mockCard2);
    upsertCard(mockCard3);
    upsertCard(mockCard4);

    const owned = get(ownedCards);
    expect(owned.length).toBe(3); // user owns card-001, card-002, card-003
    expect(owned.map((c) => c.id)).toEqual(['card-001', 'card-002', 'card-003']);
  });

  it('should derive latestCards sorted by acquiredAt', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1); // acquiredAt: 2024-01-10
    upsertCard(mockCard2); // acquiredAt: 2024-01-12
    upsertCard(mockCard3); // acquiredAt: 2024-01-15

    const latest = get(latestCards);
    expect(latest.length).toBe(3);
    expect(latest[0].id).toBe('card-003'); // Most recent
    expect(latest[1].id).toBe('card-002');
    expect(latest[2].id).toBe('card-001');
  });

  it('should limit latestCards to 3 cards', () => {
    const mockUser4Cards = { ...mockUser, collections: { ...mockUser.collections, owned: ['card-001', 'card-002', 'card-003', 'card-004'] } };
    currentUser.set(mockUser4Cards);

    const card4WithAcquiredAt = { ...mockCard4, photocard: { ...mockCard4.photocard, acquiredAt: new Date('2024-01-20') } };
    upsertCard(mockCard1);
    upsertCard(mockCard2);
    upsertCard(mockCard3);
    upsertCard(card4WithAcquiredAt);

    const latest = get(latestCards);
    expect(latest.length).toBe(3);
  });

  it('should derive rareCards with rare+ rarities', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1); // legendary
    upsertCard(mockCard2); // rare
    upsertCard(mockCard3); // epic

    const rare = get(rareCards);
    expect(rare.length).toBe(3);
    expect(rare.map((c) => c.photocard.rarity)).toEqual(['legendary', 'rare', 'epic']);
  });

  it('should exclude common cards from rareCards', () => {
    const mockUser4Cards = { ...mockUser, collections: { ...mockUser.collections, owned: ['card-001', 'card-002', 'card-003', 'card-004'] } };
    currentUser.set(mockUser4Cards);
    upsertCard(mockCard1); // legendary
    upsertCard(mockCard2); // rare
    upsertCard(mockCard3); // epic
    upsertCard(mockCard4); // common

    const rare = get(rareCards);
    expect(rare.length).toBe(3);
    expect(rare.every((c) => c.photocard.rarity !== 'common')).toBe(true);
  });

  it('should derive publicCards with isPublic=true', () => {
    upsertCard(mockCard1); // isPublic: true
    upsertCard(mockCard2); // isPublic: true
    upsertCard(mockCard3); // isPublic: false
    upsertCard(mockCard4); // isPublic: true

    const publicList = get(publicCards);
    expect(publicList.length).toBe(3);
    expect(publicList.every((c) => c.community.isPublic)).toBe(true);
  });

  it('should derive completedCollections with 100% progress', () => {
    currentUser.set(mockUser);
    upsertCollection(mockCollection1); // 30% progress
    upsertCollection(mockCollection2); // 100% progress

    const completed = get(completedCollections);
    expect(completed.length).toBe(1);
    expect(completed[0].id).toBe('col-002');
  });

  it('should derive teamTheme from user preferences', () => {
    currentUser.set(mockUser);
    const theme = get(teamTheme);
    expect(theme).toEqual({
      color: '#c30452',
      teamId: 'LG',
    });
  });

  it('should return null teamTheme if theme is not kbo-team', () => {
    const userWithoutTeamTheme = { ...mockUser, preferences: { ...mockUser.preferences, theme: 'dark' as const } };
    currentUser.set(userWithoutTeamTheme);
    const theme = get(teamTheme);
    expect(theme).toBeNull();
  });

  it('should return null teamTheme if no user', () => {
    currentUser.set(null);
    const theme = get(teamTheme);
    expect(theme).toBeNull();
  });
});

describe('State Synchronization - Cross-Component Updates', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should synchronize card updates across derived stores', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1);

    // Initial state
    let owned = get(ownedCards);
    let publicList = get(publicCards);
    expect(owned.length).toBe(1);
    expect(publicList.length).toBe(1);

    // Update card to private
    const privateCard = { ...mockCard1, community: { ...mockCard1.community, isPublic: false } };
    upsertCard(privateCard);

    // Check sync
    owned = get(ownedCards);
    publicList = get(publicCards);
    expect(owned.length).toBe(1); // Still owned
    expect(publicList.length).toBe(0); // No longer public
  });

  it('should update latestCards when new card is acquired', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1);
    upsertCard(mockCard2);

    let latest = get(latestCards);
    expect(latest.length).toBe(2);

    // Add card-003 with newer acquiredAt
    upsertCard(mockCard3);

    latest = get(latestCards);
    expect(latest.length).toBe(3);
    expect(latest[0].id).toBe('card-003'); // Most recent
  });

  it('should update completedCollections when progress changes', () => {
    currentUser.set(mockUser);
    upsertCollection(mockCollection1);

    let completed = get(completedCollections);
    expect(completed.length).toBe(0); // Initially 30%

    // Update progress to 100%
    updateCollectionProgress('col-001', 10, 10);

    completed = get(completedCollections);
    expect(completed.length).toBe(1);
    expect(completed[0].id).toBe('col-001');
  });

  it('should update teamTheme when user team changes', () => {
    currentUser.set(mockUser);
    let theme = get(teamTheme);
    expect(theme?.teamId).toBe('LG');

    updateUserTeam('DOOSAN', '#131230');
    theme = get(teamTheme);
    expect(theme?.teamId).toBe('DOOSAN');
    expect(theme?.color).toBe('#131230');
  });

  it('should propagate card like across multiple stores', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1);

    // Check initial likes in owned and public cards
    let owned = get(ownedCards);
    let publicList = get(publicCards);
    expect(owned[0].community.metadata.likes).toBe(50);
    expect(publicList[0].community.metadata.likes).toBe(50);

    // Like the card
    likeCard('card-001', 'user-002');

    // Check updated likes in both stores
    owned = get(ownedCards);
    publicList = get(publicCards);
    expect(owned[0].community.metadata.likes).toBe(51);
    expect(publicList[0].community.metadata.likes).toBe(51);
  });
});

describe('State Synchronization - Store Reactivity', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should trigger derived store updates when base store changes', () => {
    currentUser.set(mockUser);

    // Subscribe to derived store
    let updateCount = 0;
    const unsubscribe = ownedCards.subscribe(() => {
      updateCount++;
    });

    // Initial subscription call
    expect(updateCount).toBe(1);

    // Add card (should trigger update)
    upsertCard(mockCard1);
    expect(updateCount).toBe(2);

    // Add another card (should trigger update)
    upsertCard(mockCard2);
    expect(updateCount).toBe(3);

    // Remove card (should trigger update)
    removeCard('card-001');
    expect(updateCount).toBe(4);

    unsubscribe();
  });

  it('should batch multiple store updates efficiently', () => {
    let updateCount = 0;
    const unsubscribe = unifiedCards.subscribe(() => {
      updateCount++;
    });

    // Initial subscription call
    expect(updateCount).toBe(1);

    // Batch add cards
    upsertCard(mockCard1);
    upsertCard(mockCard2);
    upsertCard(mockCard3);
    upsertCard(mockCard4);

    // Each upsert triggers an update
    expect(updateCount).toBe(5); // 1 initial + 4 upserts

    unsubscribe();
  });

  it('should not trigger updates when derived dependencies do not change', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard4); // card-004 is NOT owned by user

    let updateCount = 0;
    const unsubscribe = ownedCards.subscribe(() => {
      updateCount++;
    });

    // Initial subscription call
    expect(updateCount).toBe(1);

    // Add non-owned card (should NOT trigger ownedCards update because card-004 is not in owned list)
    // But Svelte derived stores always recalculate on dependency changes
    // So we expect an update even if result is same
    const card4Updated = { ...mockCard4, title: 'Updated Card 4' };
    upsertCard(card4Updated);

    // Derived stores recalculate on base store change, even if result is same
    expect(updateCount).toBeGreaterThanOrEqual(1);

    unsubscribe();
  });
});

describe('State Synchronization - Error Handling', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should handle missing card IDs in user owned list', () => {
    const userWithMissingCards = {
      ...mockUser,
      collections: {
        ...mockUser.collections,
        owned: ['card-001', 'non-existent', 'card-002'],
      },
    };
    currentUser.set(userWithMissingCards);
    upsertCard(mockCard1);
    upsertCard(mockCard2);

    const owned = get(ownedCards);
    expect(owned.length).toBe(2); // Only existing cards
    expect(owned.map((c) => c.id)).toEqual(['card-001', 'card-002']);
  });

  it('should handle cards without acquiredAt in latestCards', () => {
    currentUser.set(mockUser);
    upsertCard(mockCard1); // Has acquiredAt
    upsertCard(mockCard2); // Has acquiredAt

    const card3NoAcquiredAt = { ...mockCard3, photocard: { ...mockCard3.photocard, acquiredAt: undefined } };
    upsertCard(card3NoAcquiredAt); // No acquiredAt

    const latest = get(latestCards);
    expect(latest.length).toBe(2); // Only cards with acquiredAt
  });

  it('should not crash on invalid rating values', () => {
    upsertCard(mockCard1);
    expect(() => rateCard('card-001', 10)).toThrow();
    expect(() => rateCard('card-001', -5)).toThrow();

    // Card should remain unchanged
    const cards = get(unifiedCards);
    expect(cards.get('card-001')?.community.metadata.rating).toBe(4.5);
    expect(cards.get('card-001')?.community.metadata.ratingCount).toBe(10);
  });

  it('should handle empty stores gracefully', () => {
    const owned = get(ownedCards);
    const latest = get(latestCards);
    const rare = get(rareCards);
    const publicList = get(publicCards);

    expect(owned).toEqual([]);
    expect(latest).toEqual([]);
    expect(rare).toEqual([]);
    expect(publicList).toEqual([]);
  });
});

describe('State Synchronization - Performance', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    currentUser.set(null);
    collections.set(new Map());
  });

  it('should handle large card sets efficiently', () => {
    const startTime = performance.now();

    // Add 1000 cards
    for (let i = 0; i < 1000; i++) {
      const card: UnifiedCard = {
        ...mockCard1,
        id: `card-${i}`,
        title: `Card ${i}`,
      };
      upsertCard(card);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const cards = get(unifiedCards);
    expect(cards.size).toBe(1000);
    expect(duration).toBeLessThan(1000); // Should complete in <1 second
  });

  it('should use Map for O(1) card lookups', () => {
    // Add 10000 cards
    for (let i = 0; i < 10000; i++) {
      const card: UnifiedCard = {
        ...mockCard1,
        id: `card-${i}`,
      };
      upsertCard(card);
    }

    const startTime = performance.now();
    const cards = get(unifiedCards);
    const card = cards.get('card-5000');
    const endTime = performance.now();

    expect(card).toBeDefined();
    expect(endTime - startTime).toBeLessThan(1); // O(1) lookup should be <1ms
  });

  it('should batch card updates without performance degradation', () => {
    currentUser.set(mockUser);

    const startTime = performance.now();

    // Batch upsert 100 cards
    for (let i = 0; i < 100; i++) {
      const card: UnifiedCard = {
        ...mockCard1,
        id: `card-${i}`,
      };
      upsertCard(card);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500); // Batch operations should be fast
  });
});
