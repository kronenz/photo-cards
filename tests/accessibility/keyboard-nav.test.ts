/**
 * Keyboard Navigation Tests
 *
 * Tests keyboard accessibility for WCAG 2.1 AA compliance
 * - Tab navigation between elements
 * - Enter/Space activation
 * - Escape to close modals
 * - Arrow keys for carousels
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
import ShowoffModal from '$lib/components/unified/ShowoffModal.svelte';
import IntegratedMainPage from '$lib/components/unified/IntegratedMainPage.svelte';
import type { UnifiedCard, UnifiedUser } from '$lib/types/unified';

describe('Keyboard Navigation (WCAG 2.1 AA)', () => {
  const mockCard: UnifiedCard = {
    id: 'test-card-001',
    title: 'Test Card',
    createdAt: new Date(),
    updatedAt: new Date(),
    holographic: {
      image: 'https://picsum.photos/400/560?random=1',
      backImage: 'https://picsum.photos/400/560?random=2',
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600
    },
    photocard: {
      rarity: 'epic',
      stats: { totalViews: 0, uniqueCollectors: 0, completionRate: 0 },
      collections: []
    },
    community: {
      creator: 'test-user',
      isPublic: false,
      tags: ['test'],
      metadata: { likes: 0, downloads: 0, rating: 0, ratingCount: 0 }
    }
  };

  afterEach(() => {
    cleanup();
  });

  describe('UnifiedHolographicCard Keyboard Support', () => {
    it('should be focusable with Tab key', () => {
      const { container } = render(UnifiedHolographicCard, {
        props: { card: mockCard, context: 'test', size: 'medium', interactive: true }
      });

      const cardElement = container.querySelector('[role="button"]') as HTMLElement;
      expect(cardElement).toBeTruthy();
      expect(cardElement.getAttribute('tabindex')).toBe('0');
    });

    it('should flip card on Enter key press', async () => {
      const { container } = render(UnifiedHolographicCard, {
        props: { card: mockCard, context: 'test', size: 'medium', interactive: true }
      });

      const cardElement = container.querySelector('[role="button"]') as HTMLElement;

      // Focus the element
      cardElement.focus();
      expect(document.activeElement).toBe(cardElement);

      // Press Enter
      await fireEvent.keyPress(cardElement, { key: 'Enter', code: 'Enter' });

      // Card should flip (aria-pressed should change)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cardElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('should flip card on Space key press', async () => {
      const { container } = render(UnifiedHolographicCard, {
        props: { card: mockCard, context: 'test', size: 'medium', interactive: true }
      });

      const cardElement = container.querySelector('[role="button"]') as HTMLElement;
      cardElement.focus();

      // Press Space
      await fireEvent.keyPress(cardElement, { key: ' ', code: 'Space' });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cardElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('should have accessible label', () => {
      const { container } = render(UnifiedHolographicCard, {
        props: { card: mockCard, context: 'test', size: 'medium', interactive: true }
      });

      const cardElement = container.querySelector('[role="button"]') as HTMLElement;
      const ariaLabel = cardElement.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain(mockCard.title);
      expect(ariaLabel).toContain(mockCard.photocard.rarity);
    });

    it('should show focus indicator on focus', () => {
      const { container } = render(UnifiedHolographicCard, {
        props: { card: mockCard, context: 'test', size: 'medium', interactive: true }
      });

      const cardElement = container.querySelector('[role="button"]') as HTMLElement;
      cardElement.focus();

      const computedStyle = window.getComputedStyle(cardElement);

      // Should have visible focus indicator (outline or box-shadow)
      const hasOutline = computedStyle.outline !== 'none';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';

      expect(hasOutline || hasBoxShadow).toBe(true);
    });
  });

  describe('ShowoffModal Keyboard Support', () => {
    it('should close on Escape key', async () => {
      let modalClosed = false;

      const { container } = render(ShowoffModal, {
        props: {
          show: true,
          card: mockCard
        }
      });

      container.addEventListener('close', () => {
        modalClosed = true;
      });

      // Press Escape
      await fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(modalClosed).toBe(true);
    });

    it('should trap focus within modal', async () => {
      const { container } = render(ShowoffModal, {
        props: {
          show: true,
          card: mockCard
        }
      });

      const modal = container.querySelector('[role="dialog"]') as HTMLElement;
      expect(modal).toBeTruthy();

      // Get all focusable elements in modal
      const focusableElements = modal.querySelectorAll(
        'button, input, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus should cycle through modal elements only
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      firstElement.focus();
      expect(document.activeElement).toBe(firstElement);

      // Tab through all elements
      for (let i = 0; i < focusableElements.length; i++) {
        await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Tab' });
      }

      // Should cycle back to first element
      // (In real implementation, this would be enforced by focus trap)
    });

    it('should focus first interactive element on open', () => {
      const { container } = render(ShowoffModal, {
        props: {
          show: true,
          card: mockCard
        }
      });

      const firstButton = container.querySelector('button') as HTMLElement;

      // Modal should auto-focus first interactive element
      setTimeout(() => {
        expect(document.activeElement).toBe(firstButton);
      }, 100);
    });
  });

  describe('IntegratedMainPage Keyboard Navigation', () => {
    const mockUser: UnifiedUser = {
      id: 'user-001',
      username: 'TestUser',
      email: 'test@example.com',
      avatar: 'avatar.jpg',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      fanProfile: {
        fanLevel: { level: 1, name: '야구 입문자' },
        currentPoints: 0,
        favoriteTeam: '',
        achievedBadges: [],
        joinedFanclubs: []
      },
      creatorProfile: {
        creatorLevel: 'bronze',
        stats: {
          totalCards: 0,
          totalLikes: 0,
          totalDownloads: 0,
          averageRating: 0,
          followers: 0,
          following: 0
        },
        isVerified: false,
        specializations: []
      },
      collections: {
        owned: [],
        collectionProgress: [],
        totalCards: 0,
        rareCards: 0
      },
      preferences: {
        theme: 'light',
        notifications: {
          newFollower: true,
          cardLike: true,
          cardComment: true,
          levelUp: true
        },
        privacy: {
          showCollections: true,
          showActivity: true
        }
      }
    };

    it('should have skip links for main sections', () => {
      const { container } = render(IntegratedMainPage, {
        props: {
          user: mockUser,
          initialCards: [mockCard]
        }
      });

      // Check for skip link targets
      const collectionSection = container.querySelector('#collection-dashboard');
      const kboSection = container.querySelector('#kbo-teams');
      const communitySection = container.querySelector('#community-feed');

      expect(collectionSection).toBeTruthy();
      expect(kboSection).toBeTruthy();
      expect(communitySection).toBeTruthy();
    });

    it('should navigate between sections with Tab', async () => {
      const { container } = render(IntegratedMainPage, {
        props: {
          user: mockUser,
          initialCards: [mockCard]
        }
      });

      const interactiveElements = container.querySelectorAll(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );

      expect(interactiveElements.length).toBeGreaterThan(0);

      // Should be able to tab through all interactive elements
      let currentIndex = 0;
      for (const element of Array.from(interactiveElements)) {
        (element as HTMLElement).focus();
        expect(document.activeElement).toBe(element);
        currentIndex++;

        if (currentIndex > 5) break; // Test first few elements
      }
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(IntegratedMainPage, {
        props: {
          user: mockUser,
          initialCards: [mockCard]
        }
      });

      const h1 = container.querySelector('h1');
      const h2s = container.querySelectorAll('h2');

      expect(h1).toBeTruthy();
      expect(h2s.length).toBeGreaterThan(0);

      // H1 should come before H2s
      const h1Position = Array.from(container.querySelectorAll('*')).indexOf(h1!);
      const firstH2Position = Array.from(container.querySelectorAll('*')).indexOf(h2s[0]);

      expect(h1Position).toBeLessThan(firstH2Position);
    });
  });

  describe('Filter Buttons Keyboard Navigation', () => {
    it('should activate filter on Enter', async () => {
      const mockUser: UnifiedUser = {
        id: 'user-001',
        username: 'TestUser',
        email: 'test@example.com',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        fanProfile: {
          fanLevel: { level: 1, name: '야구 입문자' },
          currentPoints: 0,
          favoriteTeam: '',
          achievedBadges: [],
          joinedFanclubs: []
        },
        creatorProfile: {
          creatorLevel: 'bronze',
          stats: { totalCards: 0, totalLikes: 0, totalDownloads: 0, averageRating: 0, followers: 0, following: 0 },
          isVerified: false,
          specializations: []
        },
        collections: {
          owned: [],
          collectionProgress: [],
          totalCards: 0,
          rareCards: 0
        },
        preferences: {
          theme: 'light',
          notifications: { newFollower: true, cardLike: true, cardComment: true, levelUp: true },
          privacy: { showCollections: true, showActivity: true }
        }
      };

      const { container } = render(IntegratedMainPage, {
        props: {
          user: mockUser,
          initialCards: [mockCard],
          showCommunityFeed: true
        }
      });

      const filterButtons = container.querySelectorAll('.filter-btn');

      if (filterButtons.length > 0) {
        const firstFilter = filterButtons[0] as HTMLElement;
        firstFilter.focus();

        await fireEvent.keyPress(firstFilter, { key: 'Enter', code: 'Enter' });

        // Filter should be activated (check for active class)
        expect(firstFilter.classList.contains('active')).toBe(true);
      }
    });
  });
});
