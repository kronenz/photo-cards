/**
 * Integration Tests: Phase Integration
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T016 [US1]
 *
 * Tests:
 * - UnifiedHolographicCard renders consistently across /test, /, /gallery routes
 * - Phase 1 (Enhanced Card) data migrates correctly to UnifiedCard format
 * - Phase 2 (Photocard) data integrates without conflicts
 * - Phase 4 (Community) features work alongside unified card
 * - Data synchronization between routes (same card ID shows same data)
 * - Backward compatibility (legacy components still work)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
import EnhancedCardAdapter from '$lib/components/adapters/EnhancedCardAdapter.svelte';
import {
  unifiedCards,
  currentUser,
  upsertCard,
  deleteCard,
  likeCard,
  getCardById,
} from '$lib/stores/unified';
import {
  migrateEnhancedCard,
  migratePhotocardData,
  migrateCommunityCard,
  migrateEnhancedCardsBatch,
} from '$lib/utils/migration';
import type { UnifiedCard, LegacyEnhancedCard, LegacyPhotocardData, LegacyCommunityCard } from '$lib/types/unified';

// Mock cards for different phases
const mockLegacyEnhancedCard: LegacyEnhancedCard = {
  id: 'enhanced-001',
  title: 'Legacy Enhanced Card',
  image: 'https://example.com/enhanced.jpg',
  backImage: 'https://example.com/enhanced-back.jpg',
  holographicEffect: 'soft-light',
};

const mockLegacyPhotocardData: LegacyPhotocardData = {
  id: 'photocard-001',
  title: 'Legacy Photocard',
  imageUrl: 'https://example.com/photocard.jpg',
  rarity: 'rare',
  season: '2024',
  stats: {
    views: 500,
    collectors: 120,
  },
  collections: ['my-collection'],
};

const mockLegacyCommunityCard: LegacyCommunityCard = {
  id: 'community-001',
  title: 'Legacy Community Card',
  imageUrl: 'https://example.com/community.jpg',
  creator: 'community-user',
  tags: ['kbo', 'lg-twins'],
  likes: 250,
  downloads: 80,
  isPublic: true,
};

const mockUnifiedCard: UnifiedCard = {
  id: 'unified-001',
  title: 'Unified Test Card',
  holographic: {
    image: 'https://example.com/unified.jpg',
    backImage: 'https://example.com/unified-back.jpg',
    effect: 'overlay',
    intensity: 75,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'epic',
    season: '2025',
    stats: {
      totalViews: 1000,
      uniqueCollectors: 200,
      completionRate: 75.5,
    },
    collections: ['test-collection'],
  },
  community: {
    creator: 'test-creator',
    isPublic: true,
    tags: ['test', 'integration'],
    metadata: {
      likes: 100,
      downloads: 50,
      rating: 4.5,
      ratingCount: 20,
    },
  },
  context: 'main',
};

describe('Phase Integration - Data Migration', () => {
  beforeEach(() => {
    // Clear stores
    unifiedCards.set(new Map());
    currentUser.set(null);
  });

  it('should migrate Phase 1 Enhanced Card to UnifiedCard format', () => {
    const migratedCard = migrateEnhancedCard(mockLegacyEnhancedCard);

    expect(migratedCard.id).toBe(mockLegacyEnhancedCard.id);
    expect(migratedCard.title).toBe(mockLegacyEnhancedCard.title);
    expect(migratedCard.holographic.image).toBe(mockLegacyEnhancedCard.image);
    expect(migratedCard.holographic.backImage).toBe(mockLegacyEnhancedCard.backImage);
    expect(migratedCard.holographic.effect).toBe(mockLegacyEnhancedCard.holographicEffect);
    expect(migratedCard.context).toBe('test'); // Default context for Phase 1
  });

  it('should migrate Phase 2 Photocard to UnifiedCard format', () => {
    const migratedCard = migratePhotocardData(mockLegacyPhotocardData);

    expect(migratedCard.id).toBe(mockLegacyPhotocardData.id);
    expect(migratedCard.title).toBe(mockLegacyPhotocardData.title);
    expect(migratedCard.holographic.image).toBe(mockLegacyPhotocardData.imageUrl);
    expect(migratedCard.photocard.rarity).toBe(mockLegacyPhotocardData.rarity);
    expect(migratedCard.photocard.season).toBe(mockLegacyPhotocardData.season);
    expect(migratedCard.photocard.collections).toEqual(mockLegacyPhotocardData.collections);
  });

  it('should migrate Phase 4 Community Card to UnifiedCard format', () => {
    const migratedCard = migrateCommunityCard(mockLegacyCommunityCard);

    expect(migratedCard.id).toBe(mockLegacyCommunityCard.id);
    expect(migratedCard.title).toBe(mockLegacyCommunityCard.title);
    expect(migratedCard.holographic.image).toBe(mockLegacyCommunityCard.imageUrl);
    expect(migratedCard.community.creator).toBe(mockLegacyCommunityCard.creator);
    expect(migratedCard.community.tags).toEqual(mockLegacyCommunityCard.tags);
    expect(migratedCard.community.metadata.likes).toBe(mockLegacyCommunityCard.likes);
    expect(migratedCard.community.metadata.downloads).toBe(mockLegacyCommunityCard.downloads);
    expect(migratedCard.community.isPublic).toBe(mockLegacyCommunityCard.isPublic);
  });

  it('should batch migrate multiple Enhanced Cards', async () => {
    const legacyCards: LegacyEnhancedCard[] = [
      mockLegacyEnhancedCard,
      { ...mockLegacyEnhancedCard, id: 'enhanced-002', title: 'Card 2' },
      { ...mockLegacyEnhancedCard, id: 'enhanced-003', title: 'Card 3' },
    ];

    const result = await migrateEnhancedCardsBatch(legacyCards);

    expect(result.success).toBe(true);
    expect(result.migrated).toHaveLength(3);
    expect(result.failed).toHaveLength(0);
    expect(result.migrated[0].id).toBe('enhanced-001');
    expect(result.migrated[1].id).toBe('enhanced-002');
    expect(result.migrated[2].id).toBe('enhanced-003');
  });

  it('should handle migration errors gracefully', async () => {
    const invalidCards: any[] = [
      mockLegacyEnhancedCard,
      { id: 'invalid', title: null }, // Missing required fields
      { ...mockLegacyEnhancedCard, id: 'enhanced-003' },
    ];

    const result = await migrateEnhancedCardsBatch(invalidCards);

    expect(result.success).toBe(false); // Some cards failed
    expect(result.migrated.length).toBe(2); // Two valid cards migrated
    expect(result.failed.length).toBe(1); // One invalid card failed
  });

  it('should preserve all Phase 1 holographic properties during migration', () => {
    const enhancedCard: LegacyEnhancedCard = {
      id: 'enhanced-detail-001',
      title: 'Detailed Card',
      image: 'https://example.com/detail.jpg',
      backImage: 'https://example.com/detail-back.jpg',
      holographicEffect: 'hard-light',
    };

    const migratedCard = migrateEnhancedCard(enhancedCard);

    expect(migratedCard.holographic.effect).toBe('hard-light');
    expect(migratedCard.holographic.intensity).toBeGreaterThan(0);
    expect(migratedCard.holographic.isFlipped).toBe(false);
    expect(migratedCard.holographic.animationDuration).toBe(600);
  });
});

describe('Phase Integration - Store Synchronization', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
  });

  it('should upsert card into unified store', () => {
    upsertCard(mockUnifiedCard);

    const cards = get(unifiedCards);
    expect(cards.size).toBe(1);
    expect(cards.get(mockUnifiedCard.id)).toEqual(mockUnifiedCard);
  });

  it('should retrieve card by ID from store', () => {
    upsertCard(mockUnifiedCard);

    const card = getCardById(mockUnifiedCard.id);
    expect(card).toEqual(mockUnifiedCard);
  });

  it('should delete card from store', () => {
    upsertCard(mockUnifiedCard);
    expect(get(unifiedCards).size).toBe(1);

    deleteCard(mockUnifiedCard.id);
    expect(get(unifiedCards).size).toBe(0);
  });

  it('should update card likes and synchronize across components', () => {
    upsertCard(mockUnifiedCard);

    const userId = 'test-user-001';
    likeCard(mockUnifiedCard.id, userId);

    const updatedCard = getCardById(mockUnifiedCard.id);
    expect(updatedCard?.community.metadata.likes).toBe(mockUnifiedCard.community.metadata.likes + 1);
  });

  it('should maintain card identity across multiple upserts', () => {
    upsertCard(mockUnifiedCard);

    const updatedCard: UnifiedCard = {
      ...mockUnifiedCard,
      community: {
        ...mockUnifiedCard.community,
        metadata: {
          ...mockUnifiedCard.community.metadata,
          likes: 150,
        },
      },
    };

    upsertCard(updatedCard);

    const cards = get(unifiedCards);
    expect(cards.size).toBe(1); // Still only 1 card
    expect(cards.get(mockUnifiedCard.id)?.community.metadata.likes).toBe(150);
  });

  it('should support multiple cards in store simultaneously', () => {
    const card1 = { ...mockUnifiedCard, id: 'card-001' };
    const card2 = { ...mockUnifiedCard, id: 'card-002' };
    const card3 = { ...mockUnifiedCard, id: 'card-003' };

    upsertCard(card1);
    upsertCard(card2);
    upsertCard(card3);

    const cards = get(unifiedCards);
    expect(cards.size).toBe(3);
    expect(getCardById('card-001')).toEqual(card1);
    expect(getCardById('card-002')).toEqual(card2);
    expect(getCardById('card-003')).toEqual(card3);
  });
});

describe('Phase Integration - Consistent Rendering Across Routes', () => {
  beforeEach(() => {
    unifiedCards.set(new Map());
    upsertCard(mockUnifiedCard);
  });

  it('should render same card consistently in test context', () => {
    const testCard: UnifiedCard = { ...mockUnifiedCard, context: 'test' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: testCard, context: 'test' },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
    expect(container.querySelector('.card-front img')?.getAttribute('src')).toBe(testCard.holographic.image);
  });

  it('should render same card consistently in main context', () => {
    const mainCard: UnifiedCard = { ...mockUnifiedCard, context: 'main' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: mainCard, context: 'main' },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
    expect(container.querySelector('.card-front img')?.getAttribute('src')).toBe(mainCard.holographic.image);
  });

  it('should render same card consistently in gallery context', () => {
    const galleryCard: UnifiedCard = { ...mockUnifiedCard, context: 'gallery' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: galleryCard, context: 'gallery' },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
    expect(container.querySelector('.card-front img')?.getAttribute('src')).toBe(galleryCard.holographic.image);
  });

  it('should render same card consistently in community context with metadata', () => {
    const communityCard: UnifiedCard = { ...mockUnifiedCard, context: 'community' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: communityCard, context: 'community', showMetadata: true },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
    expect(container.querySelector('.metadata-overlay')).toBeTruthy();
    expect(container.querySelector('.metadata-overlay')?.textContent).toContain(communityCard.title);
  });

  it('should maintain holographic effect consistency across contexts', () => {
    const contexts: Array<'test' | 'main' | 'gallery' | 'community'> = ['test', 'main', 'gallery', 'community'];

    contexts.forEach((context) => {
      const card: UnifiedCard = { ...mockUnifiedCard, context };
      const { container } = render(UnifiedHolographicCard, {
        props: { card, context, enableHolographic: true },
      });

      const holographicOverlay = container.querySelector('.holographic-overlay');
      expect(holographicOverlay).toBeTruthy();

      const style = holographicOverlay?.getAttribute('style');
      expect(style).toContain('mix-blend-mode');
      expect(style).toContain(card.holographic.effect);
    });
  });

  it('should maintain flip animation consistency across contexts', async () => {
    const contexts: Array<'test' | 'main' | 'gallery' | 'community'> = ['test', 'main', 'gallery', 'community'];

    for (const context of contexts) {
      const card: UnifiedCard = { ...mockUnifiedCard, context };
      const { container } = render(UnifiedHolographicCard, {
        props: { card, context, enableFlip: true, interactive: true },
      });

      const rotator = container.querySelector('.card-rotator');
      expect(rotator?.getAttribute('aria-pressed')).toBe('false');

      // Flip should work the same in all contexts
      const flipPromise = import('@testing-library/svelte').then(({ fireEvent }) =>
        fireEvent.click(rotator!)
      );

      await flipPromise;

      await waitFor(() => {
        expect(rotator).toHaveClass('flipped');
        expect(rotator?.getAttribute('aria-pressed')).toBe('true');
      });
    }
  });
});

describe('Phase Integration - Backward Compatibility', () => {
  it('should render EnhancedCardAdapter with legacy props', () => {
    const { container } = render(EnhancedCardAdapter, {
      props: {
        id: 'adapter-001',
        title: 'Adapter Test Card',
        image: 'https://example.com/adapter.jpg',
        backImage: 'https://example.com/adapter-back.jpg',
        holographicEffect: 'soft-light',
        size: 'medium',
        interactive: true,
      },
    });

    // Adapter should render UnifiedHolographicCard internally
    expect(container.querySelector('.unified-card')).toBeTruthy();
  });

  it('should migrate legacy Enhanced Card props automatically in adapter', () => {
    const { container } = render(EnhancedCardAdapter, {
      props: {
        id: 'legacy-001',
        title: 'Legacy Card',
        image: 'https://example.com/legacy.jpg',
        backImage: '',
        holographicEffect: 'overlay',
      },
    });

    const img = container.querySelector('.card-front img');
    expect(img?.getAttribute('src')).toBe('https://example.com/legacy.jpg');
  });

  it('should preserve legacy Enhanced Card behavior through adapter', async () => {
    const { container } = render(EnhancedCardAdapter, {
      props: {
        id: 'legacy-flip-001',
        title: 'Legacy Flip Card',
        image: 'https://example.com/legacy-flip.jpg',
        backImage: 'https://example.com/legacy-flip-back.jpg',
        holographicEffect: 'soft-light',
        interactive: true,
      },
    });

    const rotator = container.querySelector('.card-rotator');
    const { fireEvent } = await import('@testing-library/svelte');

    await fireEvent.click(rotator!);

    await waitFor(() => {
      expect(rotator).toHaveClass('flipped');
    });
  });
});

describe('Phase Integration - Data Integrity', () => {
  it('should not lose Phase 1 holographic data during integration', () => {
    const migratedCard = migrateEnhancedCard(mockLegacyEnhancedCard);

    expect(migratedCard.holographic.image).toBe(mockLegacyEnhancedCard.image);
    expect(migratedCard.holographic.backImage).toBe(mockLegacyEnhancedCard.backImage);
    expect(migratedCard.holographic.effect).toBe(mockLegacyEnhancedCard.holographicEffect);
  });

  it('should not lose Phase 2 photocard data during integration', () => {
    const migratedCard = migratePhotocardData(mockLegacyPhotocardData);

    expect(migratedCard.photocard.rarity).toBe(mockLegacyPhotocardData.rarity);
    expect(migratedCard.photocard.season).toBe(mockLegacyPhotocardData.season);
    expect(migratedCard.photocard.collections).toEqual(mockLegacyPhotocardData.collections);
  });

  it('should not lose Phase 4 community data during integration', () => {
    const migratedCard = migrateCommunityCard(mockLegacyCommunityCard);

    expect(migratedCard.community.creator).toBe(mockLegacyCommunityCard.creator);
    expect(migratedCard.community.tags).toEqual(mockLegacyCommunityCard.tags);
    expect(migratedCard.community.metadata.likes).toBe(mockLegacyCommunityCard.likes);
    expect(migratedCard.community.isPublic).toBe(mockLegacyCommunityCard.isPublic);
  });

  it('should handle missing optional fields during migration', () => {
    const minimalEnhancedCard: LegacyEnhancedCard = {
      id: 'minimal-001',
      title: 'Minimal Card',
      image: 'https://example.com/minimal.jpg',
      backImage: '',
      holographicEffect: 'soft-light',
    };

    const migratedCard = migrateEnhancedCard(minimalEnhancedCard);

    expect(migratedCard.holographic.backImage).toBe('');
    expect(migratedCard.photocard.rarity).toBe('common'); // Default value
    expect(migratedCard.community.tags).toContain('legacy'); // Auto-tagged
  });
});

describe('Phase Integration - Cross-Phase Feature Compatibility', () => {
  it('should support Phase 1 holographic effects with Phase 2 rarity system', () => {
    const card: UnifiedCard = {
      ...mockUnifiedCard,
      holographic: { ...mockUnifiedCard.holographic, effect: 'overlay', intensity: 90 },
      photocard: { ...mockUnifiedCard.photocard, rarity: 'legendary' },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card, enableHolographic: true },
    });

    expect(container.querySelector('.holographic-overlay')).toBeTruthy();
    expect(container.querySelector('.unified-card')?.getAttribute('data-rarity')).toBe('legendary');
  });

  it('should support Phase 1 flip animation with Phase 4 community metadata', async () => {
    const card: UnifiedCard = {
      ...mockUnifiedCard,
      holographic: { ...mockUnifiedCard.holographic, isFlipped: false },
      community: {
        ...mockUnifiedCard.community,
        metadata: { likes: 500, downloads: 200, rating: 4.9, ratingCount: 100 },
      },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card, context: 'community', showMetadata: true, enableFlip: true, interactive: true },
    });

    // Metadata should be visible
    const metadata = container.querySelector('.metadata-overlay');
    expect(metadata).toBeTruthy();
    expect(metadata?.textContent).toContain('500'); // Likes

    // Flip should still work
    const rotator = container.querySelector('.card-rotator');
    const { fireEvent } = await import('@testing-library/svelte');
    await fireEvent.click(rotator!);

    await waitFor(() => {
      expect(rotator).toHaveClass('flipped');
    });
  });

  it('should support Phase 2 collections with Phase 4 social features', () => {
    const card: UnifiedCard = {
      ...mockUnifiedCard,
      photocard: { ...mockUnifiedCard.photocard, collections: ['my-cards', 'favorites', 'kbo-2025'] },
      community: {
        ...mockUnifiedCard.community,
        metadata: { likes: 300, downloads: 150, rating: 4.7, ratingCount: 75 },
      },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card, context: 'community', showMetadata: true },
    });

    const metadata = container.querySelector('.metadata-overlay');
    expect(metadata).toBeTruthy();

    // Both Phase 2 and Phase 4 data should be accessible
    expect(card.photocard.collections).toHaveLength(3);
    expect(card.community.metadata.likes).toBe(300);
  });
});
