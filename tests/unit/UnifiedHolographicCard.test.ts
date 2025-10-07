/**
 * Unit Tests: UnifiedHolographicCard Component
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T015 [US1]
 *
 * Tests:
 * - Flip state transitions (click to flip, keyboard navigation)
 * - Holographic parameter calculations (mouse position → gradient position)
 * - Context prop behavior (test/main/gallery/community rendering)
 * - Size variants (small/medium/large/featured)
 * - Accessibility (ARIA attributes, keyboard events)
 * - Error handling (image load failures)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
import type { UnifiedCard } from '$lib/types/unified';

// Mock card data
const mockCard: UnifiedCard = {
  id: 'test-card-001',
  title: 'Test Player Card',
  holographic: {
    image: 'https://example.com/test-card.jpg',
    backImage: 'https://example.com/test-card-back.jpg',
    effect: 'soft-light',
    intensity: 80,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'legendary',
    season: '2025',
    stats: {
      totalViews: 1520,
      uniqueCollectors: 342,
      completionRate: 87.5,
    },
    collections: ['test-collection'],
  },
  community: {
    creator: 'test-user',
    isPublic: true,
    tags: ['test', 'unit-test'],
    metadata: {
      likes: 125,
      downloads: 89,
      rating: 4.8,
      ratingCount: 45,
    },
  },
  context: 'test',
};

describe('UnifiedHolographicCard - Flip State Transitions', () => {
  it('should initialize with isFlipped = false', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator).not.toHaveClass('flipped');
    expect(rotator?.getAttribute('aria-pressed')).toBe('false');
  });

  it('should flip card on click', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator).toBeTruthy();

    await fireEvent.click(rotator!);

    // Wait for flip animation to start
    await waitFor(() => {
      expect(rotator).toHaveClass('flipped');
      expect(rotator?.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('should flip back on second click', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');

    // First click - flip to back
    await fireEvent.click(rotator!);
    await waitFor(() => expect(rotator).toHaveClass('flipped'));

    // Second click - flip to front
    await fireEvent.click(rotator!);
    await waitFor(() => expect(rotator).not.toHaveClass('flipped'));
  });

  it('should flip on Enter key press', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');
    rotator?.focus();

    await fireEvent.keyPress(rotator!, { key: 'Enter' });

    await waitFor(() => {
      expect(rotator).toHaveClass('flipped');
    });
  });

  it('should flip on Space key press', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');
    rotator?.focus();

    await fireEvent.keyPress(rotator!, { key: ' ' });

    await waitFor(() => {
      expect(rotator).toHaveClass('flipped');
    });
  });

  it('should flip back on Escape key when flipped', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');

    // Flip to back
    await fireEvent.click(rotator!);
    await waitFor(() => expect(rotator).toHaveClass('flipped'));

    // Press Escape
    await fireEvent.keyPress(rotator!, { key: 'Escape' });

    await waitFor(() => {
      expect(rotator).not.toHaveClass('flipped');
    });
  });

  it('should not flip when enableFlip = false', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: false },
    });

    const rotator = container.querySelector('.card-rotator');
    await fireEvent.click(rotator!);

    // Should remain unflipped
    expect(rotator).not.toHaveClass('flipped');
  });

  it('should not flip when interactive = false', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: false, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');
    await fireEvent.click(rotator!);

    // Should remain unflipped
    expect(rotator).not.toHaveClass('flipped');
  });

  it('should set aria-busy during flip animation', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');
    await fireEvent.click(rotator!);

    // Check aria-busy is set
    expect(rotator?.getAttribute('aria-busy')).toBe('true');

    // Wait for animation to complete (600ms)
    await new Promise((resolve) => setTimeout(resolve, 650));

    // aria-busy should be false after animation
    expect(rotator?.getAttribute('aria-busy')).toBe('false');
  });
});

describe('UnifiedHolographicCard - Holographic Parameter Calculations', () => {
  it('should update holographic params on pointer move', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableHolographic: true },
    });

    const rotator = container.querySelector('.card-rotator');
    const holographicOverlay = container.querySelector('.holographic-overlay');

    expect(rotator).toBeTruthy();
    expect(holographicOverlay).toBeTruthy();

    // Simulate pointer move
    await fireEvent.pointerMove(rotator!, {
      clientX: 150,
      clientY: 200,
    });

    // Holographic gradient should update (check background style)
    await waitFor(() => {
      const style = holographicOverlay?.getAttribute('style');
      expect(style).toContain('background');
      expect(style).toContain('radial-gradient');
    });
  });

  it('should reset holographic params on pointer leave', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableHolographic: true },
    });

    const rotator = container.querySelector('.card-rotator');

    // Move pointer to activate holographic
    await fireEvent.pointerMove(rotator!, { clientX: 150, clientY: 200 });

    // Leave card area
    await fireEvent.pointerLeave(rotator!);

    // Check that holographic params reset to center (50%, 50%)
    const holographicOverlay = container.querySelector('.holographic-overlay');
    const style = holographicOverlay?.getAttribute('style');
    expect(style).toContain('50%');
  });

  it('should not apply holographic effects when enableHolographic = false', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test', interactive: true, enableHolographic: false },
    });

    const holographicOverlay = container.querySelector('.holographic-overlay');
    expect(holographicOverlay).toBeNull();
  });

  it('should apply correct blend mode from card.holographic.effect', () => {
    const cardWithOverlay: UnifiedCard = {
      ...mockCard,
      holographic: { ...mockCard.holographic, effect: 'overlay' },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithOverlay, context: 'test', enableHolographic: true },
    });

    const holographicOverlay = container.querySelector('.holographic-overlay');
    const style = holographicOverlay?.getAttribute('style');
    expect(style).toContain('overlay');
  });

  it('should apply correct intensity from card.holographic.intensity', () => {
    const cardWithIntensity: UnifiedCard = {
      ...mockCard,
      holographic: { ...mockCard.holographic, intensity: 100 },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithIntensity, context: 'test', enableHolographic: true },
    });

    const holographicOverlay = container.querySelector('.holographic-overlay');
    const style = holographicOverlay?.getAttribute('style');
    // Intensity 100 → opacity 100/100 = 1.0
    expect(style).toContain('opacity');
  });
});

describe('UnifiedHolographicCard - Context Prop Behavior', () => {
  it('should render with context="test"', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'test' },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
  });

  it('should render with context="main"', () => {
    const cardWithMainContext: UnifiedCard = { ...mockCard, context: 'main' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithMainContext, context: 'main' },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
  });

  it('should render with context="gallery"', () => {
    const cardWithGalleryContext: UnifiedCard = { ...mockCard, context: 'gallery' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithGalleryContext, context: 'gallery' },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
  });

  it('should render with context="community"', () => {
    const cardWithCommunityContext: UnifiedCard = { ...mockCard, context: 'community' };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithCommunityContext, context: 'community', showMetadata: true },
    });

    expect(container.querySelector('.unified-card')).toBeTruthy();
    // Metadata should be visible in community context
    expect(container.querySelector('.metadata-overlay')).toBeTruthy();
  });

  it('should show metadata when showMetadata = true', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'community', showMetadata: true },
    });

    const metadata = container.querySelector('.metadata-overlay');
    expect(metadata).toBeTruthy();
    expect(metadata?.textContent).toContain(mockCard.title);
  });

  it('should hide metadata when showMetadata = false', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, context: 'community', showMetadata: false },
    });

    const metadata = container.querySelector('.metadata-overlay');
    expect(metadata).toBeNull();
  });
});

describe('UnifiedHolographicCard - Size Variants', () => {
  it('should render with size="small"', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, size: 'small' },
    });

    const unifiedCard = container.querySelector('.unified-card');
    expect(unifiedCard?.getAttribute('data-size')).toBe('small');
  });

  it('should render with size="medium" (default)', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, size: 'medium' },
    });

    const unifiedCard = container.querySelector('.unified-card');
    expect(unifiedCard?.getAttribute('data-size')).toBe('medium');
  });

  it('should render with size="large"', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, size: 'large' },
    });

    const unifiedCard = container.querySelector('.unified-card');
    expect(unifiedCard?.getAttribute('data-size')).toBe('large');
  });

  it('should render with size="featured"', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, size: 'featured' },
    });

    const unifiedCard = container.querySelector('.unified-card');
    expect(unifiedCard?.getAttribute('data-size')).toBe('featured');
  });

  it('should apply correct CSS variables for size', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, size: 'large' },
    });

    const unifiedCard = container.querySelector('.unified-card') as HTMLElement;
    const style = unifiedCard?.getAttribute('style');
    expect(style).toContain('--card-width');
    expect(style).toContain('--card-height');
  });
});

describe('UnifiedHolographicCard - Accessibility', () => {
  it('should have role="button" when interactive', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, interactive: true },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator?.getAttribute('role')).toBe('button');
  });

  it('should have role="img" when not interactive', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, interactive: false },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator?.getAttribute('role')).toBe('img');
  });

  it('should have aria-label with card title and rarity', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, interactive: true },
    });

    const rotator = container.querySelector('.card-rotator');
    const ariaLabel = rotator?.getAttribute('aria-label');
    expect(ariaLabel).toContain(mockCard.title);
    expect(ariaLabel).toContain(mockCard.photocard.rarity);
  });

  it('should have tabindex=0 when interactive', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, interactive: true },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator?.getAttribute('tabindex')).toBe('0');
  });

  it('should have tabindex=-1 when not interactive', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, interactive: false },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator?.getAttribute('tabindex')).toBe('-1');
  });

  it('should update aria-pressed on flip', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard, interactive: true, enableFlip: true },
    });

    const rotator = container.querySelector('.card-rotator');
    expect(rotator?.getAttribute('aria-pressed')).toBe('false');

    await fireEvent.click(rotator!);

    await waitFor(() => {
      expect(rotator?.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('should have alt text on images', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard },
    });

    const frontImage = container.querySelector('.card-front img');
    expect(frontImage?.getAttribute('alt')).toBe(mockCard.title);
  });
});

describe('UnifiedHolographicCard - Rarity Variants', () => {
  const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = [
    'common',
    'rare',
    'epic',
    'legendary',
  ];

  rarities.forEach((rarity) => {
    it(`should render with rarity="${rarity}"`, () => {
      const rarityCard: UnifiedCard = {
        ...mockCard,
        photocard: { ...mockCard.photocard, rarity },
      };

      const { container } = render(UnifiedHolographicCard, {
        props: { card: rarityCard },
      });

      const unifiedCard = container.querySelector('.unified-card');
      expect(unifiedCard?.getAttribute('data-rarity')).toBe(rarity);
    });

    it(`should apply correct rarity border gradient for ${rarity}`, () => {
      const rarityCard: UnifiedCard = {
        ...mockCard,
        photocard: { ...mockCard.photocard, rarity },
      };

      const { container } = render(UnifiedHolographicCard, {
        props: { card: rarityCard },
      });

      const rarityBorder = container.querySelector('.rarity-border');
      expect(rarityBorder).toBeTruthy();
      expect(rarityBorder).toHaveClass('bg-gradient-to-r');
    });
  });

  it('should have legendary pulse animation for legendary rarity', () => {
    const legendaryCard: UnifiedCard = {
      ...mockCard,
      photocard: { ...mockCard.photocard, rarity: 'legendary' },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: legendaryCard },
    });

    const unifiedCard = container.querySelector('.unified-card');
    expect(unifiedCard?.getAttribute('data-rarity')).toBe('legendary');
  });
});

describe('UnifiedHolographicCard - Error Handling', () => {
  it('should show loading state initially', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: { card: mockCard },
    });

    // Loading placeholder should be visible initially
    const loadingPlaceholder = container.querySelector('.image-placeholder.loading');
    expect(loadingPlaceholder).toBeTruthy();
  });

  it('should handle front image load error', async () => {
    const cardWithBadImage: UnifiedCard = {
      ...mockCard,
      holographic: { ...mockCard.holographic, image: 'https://invalid-url.com/image.jpg' },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithBadImage },
    });

    const img = container.querySelector('.card-front img') as HTMLImageElement;

    // Simulate image error
    await fireEvent.error(img);

    await waitFor(() => {
      const errorPlaceholder = container.querySelector('.image-placeholder.error');
      expect(errorPlaceholder).toBeTruthy();
      expect(errorPlaceholder?.textContent).toContain('Failed to load');
    });
  });

  it('should show retry button on image error', async () => {
    const cardWithBadImage: UnifiedCard = {
      ...mockCard,
      holographic: { ...mockCard.holographic, image: 'https://invalid-url.com/image.jpg' },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithBadImage },
    });

    const img = container.querySelector('.card-front img') as HTMLImageElement;
    await fireEvent.error(img);

    await waitFor(() => {
      const retryButton = container.querySelector('.retry-button');
      expect(retryButton).toBeTruthy();
      expect(retryButton?.textContent).toContain('Retry');
    });
  });

  it('should retry image load on retry button click', async () => {
    const cardWithBadImage: UnifiedCard = {
      ...mockCard,
      holographic: { ...mockCard.holographic, image: 'https://invalid-url.com/image.jpg' },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithBadImage },
    });

    const img = container.querySelector('.card-front img') as HTMLImageElement;
    await fireEvent.error(img);

    await waitFor(() => {
      const retryButton = container.querySelector('.retry-button');
      expect(retryButton).toBeTruthy();
    });

    const retryButton = container.querySelector('.retry-button');
    await fireEvent.click(retryButton!);

    // Error placeholder should disappear, loading should show
    await waitFor(() => {
      const loadingPlaceholder = container.querySelector('.image-placeholder.loading');
      expect(loadingPlaceholder).toBeTruthy();
    });
  });

  it('should handle back image load error independently', async () => {
    const cardWithBadBackImage: UnifiedCard = {
      ...mockCard,
      holographic: {
        ...mockCard.holographic,
        backImage: 'https://invalid-url.com/back-image.jpg',
      },
    };

    const { container } = render(UnifiedHolographicCard, {
      props: { card: cardWithBadBackImage, enableFlip: true },
    });

    // Flip to back
    const rotator = container.querySelector('.card-rotator');
    await fireEvent.click(rotator!);

    await waitFor(() => expect(rotator).toHaveClass('flipped'));

    const backImg = container.querySelector('.card-back img') as HTMLImageElement;
    await fireEvent.error(backImg);

    await waitFor(() => {
      const errorPlaceholder = container.querySelector('.card-back .image-placeholder.error');
      expect(errorPlaceholder).toBeTruthy();
    });
  });
});
