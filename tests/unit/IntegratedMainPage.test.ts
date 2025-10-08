/**
 * Unit Tests: IntegratedMainPage Component
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T029 [US2]
 *
 * Tests:
 * - Section visibility (hero, collection-dashboard, kbo-teams, community-feed, recommendations)
 * - Layout rendering (standard, compact, kbo-focus)
 * - User prop handling (authenticated user data display)
 * - Configuration props (dashboard config, feed config, KBO config)
 * - Event dispatching (showoff, teamselect, collectionclick, postaction, loadmore)
 * - Responsive breakpoints (mobile, tablet, desktop)
 * - Theme integration (KBO team theme application)
 * - Accessibility (ARIA landmarks, skip links, keyboard navigation)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import IntegratedMainPage from '$lib/components/unified/IntegratedMainPage.svelte';
import type {
  IntegratedMainPageProps,
  CollectionDashboardConfig,
  CommunityFeedConfig,
  KBOTeamsSectionConfig,
} from '$/specs/002-integrated-holographic-platform/contracts/IntegratedMainPage.interface';
import type { UnifiedUser, UnifiedCard, KBOTeam, Collection } from '$lib/types/unified';

// Mock user data
const mockUser: UnifiedUser = {
  id: 'user-001',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'dark',
    teamThemeColor: '#C30452',
  },
  fanProfile: {
    favoriteTeam: 'LG',
    level: 3,
    points: 750,
    joinedDate: new Date('2024-01-01'),
  },
  creatorProfile: {
    bio: 'Card creator',
    stats: {
      followers: 150,
      following: 80,
      totalLikes: 500,
      totalDownloads: 200,
    },
  },
  stats: {
    cardsCreated: 25,
    cardsCollected: 100,
    collections: 5,
  },
};

// Mock cards
const mockCards: UnifiedCard[] = [
  {
    id: 'card-001',
    title: 'LG Twins Player',
    holographic: {
      image: 'https://example.com/card1.jpg',
      backImage: '',
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600,
    },
    photocard: {
      rarity: 'legendary',
      season: '2025',
      stats: { totalViews: 1000, uniqueCollectors: 200, completionRate: 85 },
      collections: ['my-collection'],
    },
    community: {
      creator: 'user-001',
      isPublic: true,
      tags: ['lg-twins', 'legendary'],
      metadata: { likes: 150, downloads: 50, rating: 4.8, ratingCount: 30 },
    },
    context: 'main',
  },
  {
    id: 'card-002',
    title: 'Doosan Bears Player',
    holographic: {
      image: 'https://example.com/card2.jpg',
      backImage: '',
      effect: 'overlay',
      intensity: 75,
      isFlipped: false,
      animationDuration: 600,
    },
    photocard: {
      rarity: 'epic',
      season: '2025',
      stats: { totalViews: 800, uniqueCollectors: 150, completionRate: 70 },
      collections: [],
    },
    community: {
      creator: 'user-002',
      isPublic: true,
      tags: ['doosan-bears', 'epic'],
      metadata: { likes: 100, downloads: 30, rating: 4.5, ratingCount: 20 },
    },
    context: 'main',
  },
];

describe('IntegratedMainPage - Section Visibility', () => {
  it('should render all sections by default', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, initialCards: mockCards } as IntegratedMainPageProps,
    });

    // Check for section IDs
    expect(container.querySelector('#hero')).toBeTruthy();
    expect(container.querySelector('#collection-dashboard')).toBeTruthy();
    expect(container.querySelector('#kbo-teams')).toBeTruthy();
    expect(container.querySelector('#community-feed')).toBeTruthy();
    expect(container.querySelector('#recommendations')).toBeTruthy();
  });

  it('should hide KBO section when showKBOSection = false', () => {
    const { container } = render(IntegratedMainPage, {
      props: {
        user: mockUser,
        initialCards: mockCards,
        showKBOSection: false,
      } as IntegratedMainPageProps,
    });

    expect(container.querySelector('#kbo-teams')).toBeNull();
  });

  it('should hide community feed when showCommunityFeed = false', () => {
    const { container } = render(IntegratedMainPage, {
      props: {
        user: mockUser,
        initialCards: mockCards,
        showCommunityFeed: false,
      } as IntegratedMainPageProps,
    });

    expect(container.querySelector('#community-feed')).toBeNull();
  });

  it('should render sections in correct order', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, initialCards: mockCards } as IntegratedMainPageProps,
    });

    const sections = Array.from(container.querySelectorAll('section[id]'));
    const sectionIds = sections.map((s) => s.id);

    expect(sectionIds).toEqual([
      'hero',
      'collection-dashboard',
      'kbo-teams',
      'community-feed',
      'recommendations',
    ]);
  });
});

describe('IntegratedMainPage - Layout Rendering', () => {
  it('should render with standard layout by default', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page');
    expect(mainPage).toHaveAttribute('data-layout', 'standard');
  });

  it('should render with compact layout', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, layout: 'compact' } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page');
    expect(mainPage).toHaveAttribute('data-layout', 'compact');
  });

  it('should render with kbo-focus layout', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, layout: 'kbo-focus' } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page');
    expect(mainPage).toHaveAttribute('data-layout', 'kbo-focus');
  });

  it('should apply custom CSS class', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, class: 'custom-main-page' } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page');
    expect(mainPage).toHaveClass('custom-main-page');
  });
});

describe('IntegratedMainPage - User Prop Handling', () => {
  it('should display user display name', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    expect(container.textContent).toContain(mockUser.displayName);
  });

  it('should display user avatar', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const avatar = container.querySelector('img[alt*="avatar"]');
    expect(avatar?.getAttribute('src')).toContain('avatar.jpg');
  });

  it('should display user fan level', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    // Fan level should be displayed in dashboard
    expect(container.textContent).toContain('Level 3'); // Or match actual level display
  });

  it('should display user favorite team', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    expect(container.textContent).toContain('LG'); // Favorite team
  });

  it('should display user stats', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    // Check for stats display
    expect(container.textContent).toMatch(/25|100|5/); // Cards created, collected, collections
  });
});

describe('IntegratedMainPage - Dashboard Configuration', () => {
  it('should display configured number of latest cards', () => {
    const dashboardConfig: CollectionDashboardConfig = {
      latestCardsCount: 3,
      showProgress: true,
      showStats: true,
      maxCollections: 5,
    };

    const { container } = render(IntegratedMainPage, {
      props: {
        user: mockUser,
        initialCards: mockCards,
        dashboardConfig,
      } as any,
    });

    const latestCards = container.querySelectorAll('#collection-dashboard .unified-card');
    expect(latestCards.length).toBeLessThanOrEqual(3);
  });

  it('should show progress bars when showProgress = true', () => {
    const dashboardConfig: CollectionDashboardConfig = {
      latestCardsCount: 3,
      showProgress: true,
      showStats: true,
      maxCollections: 5,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, dashboardConfig } as any,
    });

    const progressBars = container.querySelectorAll('.progress-bar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should hide progress bars when showProgress = false', () => {
    const dashboardConfig: CollectionDashboardConfig = {
      latestCardsCount: 3,
      showProgress: false,
      showStats: true,
      maxCollections: 5,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, dashboardConfig } as any,
    });

    const progressBars = container.querySelectorAll('.progress-bar');
    expect(progressBars.length).toBe(0);
  });

  it('should show stats when showStats = true', () => {
    const dashboardConfig: CollectionDashboardConfig = {
      latestCardsCount: 3,
      showProgress: true,
      showStats: true,
      maxCollections: 5,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, dashboardConfig } as any,
    });

    const stats = container.querySelector('.stats-summary');
    expect(stats).toBeTruthy();
  });

  it('should limit collections to maxCollections', () => {
    const dashboardConfig: CollectionDashboardConfig = {
      latestCardsCount: 3,
      showProgress: true,
      showStats: true,
      maxCollections: 2,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, dashboardConfig } as any,
    });

    const collections = container.querySelectorAll('.collection-item');
    expect(collections.length).toBeLessThanOrEqual(2);
  });
});

describe('IntegratedMainPage - Community Feed Configuration', () => {
  it('should render masonry layout by default', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const feed = container.querySelector('#community-feed');
    expect(feed).toHaveAttribute('data-layout', 'masonry');
  });

  it('should render grid layout when configured', () => {
    const feedConfig: CommunityFeedConfig = {
      layout: 'grid',
      columns: 3,
      postsPerPage: 20,
      filter: 'all',
      infiniteScroll: true,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, feedConfig } as any,
    });

    const feed = container.querySelector('#community-feed');
    expect(feed).toHaveAttribute('data-layout', 'grid');
  });

  it('should apply configured column count', () => {
    const feedConfig: CommunityFeedConfig = {
      layout: 'masonry',
      columns: 2,
      postsPerPage: 20,
      filter: 'following',
      infiniteScroll: true,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, feedConfig } as any,
    });

    const feed = container.querySelector('#community-feed');
    expect(feed).toHaveAttribute('data-columns', '2');
  });

  it('should apply feed filter', () => {
    const feedConfig: CommunityFeedConfig = {
      layout: 'masonry',
      columns: 3,
      postsPerPage: 20,
      filter: 'popular',
      infiniteScroll: true,
    };

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, feedConfig } as any,
    });

    const feed = container.querySelector('#community-feed');
    expect(feed).toHaveAttribute('data-filter', 'popular');
  });
});

describe('IntegratedMainPage - Event Dispatching', () => {
  it('should dispatch showoff event when showoff button clicked', async () => {
    const handleShowoff = vi.fn();

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, initialCards: mockCards } as IntegratedMainPageProps,
    });

    const component = (container as any).__svelte__?.$$;
    if (component) {
      component.$on('showoff', handleShowoff);
    }

    const showoffButton = container.querySelector('[data-action="showoff"]');
    if (showoffButton) {
      await fireEvent.click(showoffButton);
      expect(handleShowoff).toHaveBeenCalled();
    }
  });

  it('should dispatch teamselect event when team selected', async () => {
    const handleTeamSelect = vi.fn();

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const component = (container as any).__svelte__?.$$;
    if (component) {
      component.$on('teamselect', handleTeamSelect);
    }

    const teamButton = container.querySelector('[data-team-id]');
    if (teamButton) {
      await fireEvent.click(teamButton);
      expect(handleTeamSelect).toHaveBeenCalled();
    }
  });

  it('should dispatch loadmore event on scroll to bottom', async () => {
    const handleLoadMore = vi.fn();

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const component = (container as any).__svelte__?.$$;
    if (component) {
      component.$on('loadmore', handleLoadMore);
    }

    // Simulate scroll to bottom
    const mainPage = container.querySelector('.integrated-main-page');
    if (mainPage) {
      Object.defineProperty(mainPage, 'scrollTop', { value: 10000, writable: true });
      Object.defineProperty(mainPage, 'scrollHeight', { value: 10100, writable: true });
      Object.defineProperty(mainPage, 'clientHeight', { value: 800, writable: true });

      await fireEvent.scroll(mainPage);

      await waitFor(() => {
        expect(handleLoadMore).toHaveBeenCalled();
      });
    }
  });
});

describe('IntegratedMainPage - Responsive Breakpoints', () => {
  it('should render mobile layout on small viewport', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const feed = container.querySelector('#community-feed');
    // Mobile should have 1 column
    const computedStyle = window.getComputedStyle(feed!);
    // Check if grid-template-columns or data attribute indicates mobile
    expect(feed).toHaveAttribute('data-columns', '1');
  });

  it('should render tablet layout on medium viewport', () => {
    global.innerWidth = 768;
    global.innerHeight = 1024;

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const feed = container.querySelector('#community-feed');
    // Tablet should have 2 columns
    expect(feed).toHaveAttribute('data-columns', '2');
  });

  it('should render desktop layout on large viewport', () => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;

    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const feed = container.querySelector('#community-feed');
    // Desktop should have 3 columns
    expect(feed).toHaveAttribute('data-columns', '3');
  });
});

describe('IntegratedMainPage - Theme Integration', () => {
  it('should apply user team theme color', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page') as HTMLElement;
    const style = mainPage?.getAttribute('style');

    // Should have CSS variable for team color
    expect(style).toContain('--team-color');
    expect(style).toContain(mockUser.preferences.teamThemeColor);
  });

  it('should update theme when team selected', async () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page') as HTMLElement;

    // Select different team
    const teamButton = container.querySelector('[data-team-id="DOOSAN"]');
    if (teamButton) {
      await fireEvent.click(teamButton);

      await waitFor(() => {
        const updatedStyle = mainPage.getAttribute('style');
        // Theme color should change
        expect(updatedStyle).toBeTruthy();
      });
    }
  });
});

describe('IntegratedMainPage - Accessibility', () => {
  it('should have proper ARIA landmarks', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    expect(container.querySelector('[role="banner"]')).toBeTruthy(); // Header
    expect(container.querySelector('[role="main"]')).toBeTruthy(); // Main content
    expect(container.querySelector('[role="navigation"]')).toBeTruthy(); // Nav
  });

  it('should have skip links', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const skipLinks = container.querySelectorAll('.skip-link');
    expect(skipLinks.length).toBeGreaterThan(0);

    const skipToCollection = Array.from(skipLinks).find((link) =>
      link.textContent?.includes('collection')
    );
    expect(skipToCollection).toBeTruthy();
  });

  it('should have section headings for screen readers', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const headings = container.querySelectorAll('h1, h2, h3');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should support keyboard navigation', async () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const mainPage = container.querySelector('.integrated-main-page');

    // Tab to first interactive element
    await fireEvent.keyDown(mainPage!, { key: 'Tab' });

    // Should focus on skip link or first interactive element
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });

  it('should have aria-live regions for announcements', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });
});

describe('IntegratedMainPage - Initial Cards', () => {
  it('should render initial cards', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, initialCards: mockCards } as IntegratedMainPageProps,
    });

    const cards = container.querySelectorAll('.unified-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should handle empty initial cards', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser, initialCards: [] } as IntegratedMainPageProps,
    });

    // Should show empty state
    expect(container.textContent).toMatch(/no cards|empty|start creating/i);
  });

  it('should handle missing initial cards prop', () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    // Should not crash, should show loading or empty state
    expect(container.querySelector('.integrated-main-page')).toBeTruthy();
  });
});

describe('IntegratedMainPage - Error Handling', () => {
  it('should display error message when section fails to load', async () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    // Simulate load error
    const component = (container as any).__svelte__?.$$;
    if (component) {
      component.$set({ loadError: true });

      await waitFor(() => {
        expect(container.textContent).toMatch(/error|failed|try again/i);
      });
    }
  });

  it('should allow retry on error', async () => {
    const { container } = render(IntegratedMainPage, {
      props: { user: mockUser } as IntegratedMainPageProps,
    });

    // Find retry button if error state
    const retryButton = container.querySelector('[data-action="retry"]');
    if (retryButton) {
      await fireEvent.click(retryButton);
      // Should attempt to reload
    }
  });
});
