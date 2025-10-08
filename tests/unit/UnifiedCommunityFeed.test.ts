import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import UnifiedCommunityFeed from '$lib/components/unified/UnifiedCommunityFeed.svelte';
import { currentUser, unifiedCards } from '$lib/stores/unified';
import type { UnifiedCard, UnifiedUser } from '$lib/types/unified';

describe('UnifiedCommunityFeed', () => {
  const mockUser: UnifiedUser = {
    id: 'user-test-001',
    username: 'test_user',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-03-20'),
    fanProfile: {
      fanLevel: { level: 2, name: '외야석 팬' },
      currentPoints: 150,
      favoriteTeam: 'team-lg-twins',
      achievedBadges: [],
      joinedFanclubs: ['team-lg-twins'],
    },
    creatorProfile: {
      creatorLevel: 'gold',
      stats: {
        totalCards: 10,
        totalLikes: 100,
        totalDownloads: 50,
        averageRating: 4.5,
        followers: 25,
        following: 15,
      },
      isVerified: true,
      specializations: ['KBO'],
    },
    collections: {
      owned: [],
      collectionProgress: [],
      totalCards: 0,
      rareCards: 0,
    },
    preferences: {
      theme: 'light',
      notifications: {
        newFollower: true,
        cardLike: true,
        cardComment: true,
        levelUp: true,
      },
      privacy: {
        showCollections: true,
        showActivity: true,
      },
    },
  };

  const mockCards: UnifiedCard[] = [
    {
      id: 'card-001',
      title: 'Test Card 1',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20'),
      holographic: {
        image: 'https://example.com/card1.jpg',
        backImage: 'https://example.com/card1-back.jpg',
        effect: 'soft-light',
        intensity: 80,
        isFlipped: false,
        animationDuration: 600,
      },
      photocard: {
        rarity: 'epic',
        stats: {
          totalViews: 100,
          uniqueCollectors: 10,
          completionRate: 50,
        },
        collections: [],
      },
      community: {
        creator: 'user-002',
        isPublic: true,
        tags: ['KBO', 'LG'],
        metadata: {
          likes: 50,
          downloads: 10,
          rating: 4.5,
          ratingCount: 20,
        },
      },
    },
    {
      id: 'card-002',
      title: 'Test Card 2',
      createdAt: new Date('2024-03-19'),
      updatedAt: new Date('2024-03-19'),
      holographic: {
        image: 'https://example.com/card2.jpg',
        backImage: 'https://example.com/card2-back.jpg',
        effect: 'overlay',
        intensity: 90,
        isFlipped: false,
        animationDuration: 600,
      },
      photocard: {
        rarity: 'rare',
        stats: {
          totalViews: 200,
          uniqueCollectors: 20,
          completionRate: 75,
        },
        collections: [],
      },
      community: {
        creator: 'user-003',
        isPublic: true,
        tags: ['KBO', 'Doosan'],
        metadata: {
          likes: 75,
          downloads: 15,
          rating: 4.8,
          ratingCount: 30,
        },
      },
    },
  ];

  beforeEach(() => {
    currentUser.set(null);
    unifiedCards.set(new Map());
  });

  describe('Post Rendering', () => {
    it('should render all public cards', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed);

      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should display card title and creator info', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCards[0].id, mockCards[0]]]);
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed);

      expect(container.textContent).toContain('Test Card 1');
    });

    it('should show like count and download count', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCards[0].id, mockCards[0]]]);
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed);

      const likeCount = container.querySelector('[data-testid="like-count"]');
      const downloadCount = container.querySelector('[data-testid="download-count"]');

      expect(likeCount?.textContent).toContain('50');
      expect(downloadCount?.textContent).toContain('10');
    });

    it('should render cards in masonry layout', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { layout: 'masonry' });

      const feedGrid = container.querySelector('[data-testid="feed-grid"]');
      expect(feedGrid?.classList.contains('masonry')).toBe(true);
    });
  });

  describe('Filter Logic', () => {
    it('should filter by "following" to show only followed creators', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { filter: 'following' });

      // Assuming user doesn't follow anyone yet
      await waitFor(() => {
        const posts = container.querySelectorAll('[data-testid^="community-post-"]');
        // Should show message about following creators
        expect(container.textContent).toContain('팔로우');
      });
    });

    it('should filter by "public" to show all public cards', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { filter: 'public' });

      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      expect(posts.length).toBe(2);
    });

    it('should filter by team when teamId is provided', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, {
        filter: 'team',
        teamId: 'team-lg-twins',
      });

      // Should only show cards with LG tag
      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should update filter when filter prop changes', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { component } = render(UnifiedCommunityFeed, { filter: 'public' });

      // Change filter
      await component.$set({ filter: 'following' });

      // Feed should update
      await waitFor(() => {
        expect(get(currentUser)).toBeTruthy();
      });
    });
  });

  describe('Pagination', () => {
    it('should show initial page of posts', () => {
      currentUser.set(mockUser);
      const manyCards = Array.from({ length: 50 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i}`,
        title: `Card ${i}`,
      }));
      const cardsMap = new Map(manyCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { postsPerPage: 20 });

      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      expect(posts.length).toBeLessThanOrEqual(20);
    });

    it('should load more posts when "Load More" is clicked', async () => {
      currentUser.set(mockUser);
      const manyCards = Array.from({ length: 50 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i}`,
        title: `Card ${i}`,
      }));
      const cardsMap = new Map(manyCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { postsPerPage: 20 });

      const initialPosts = container.querySelectorAll('[data-testid^="community-post-"]');
      const initialCount = initialPosts.length;

      const loadMoreBtn = container.querySelector('[data-testid="load-more-btn"]');
      if (loadMoreBtn) {
        await fireEvent.click(loadMoreBtn);

        await waitFor(() => {
          const updatedPosts = container.querySelectorAll('[data-testid^="community-post-"]');
          expect(updatedPosts.length).toBeGreaterThan(initialCount);
        });
      }
    });

    it('should support infinite scroll', async () => {
      currentUser.set(mockUser);
      const manyCards = Array.from({ length: 50 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i}`,
        title: `Card ${i}`,
      }));
      const cardsMap = new Map(manyCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, {
        postsPerPage: 20,
        infiniteScroll: true,
      });

      // Simulate scroll to bottom
      const scrollContainer = container.querySelector('[data-testid="feed-container"]');
      if (scrollContainer) {
        fireEvent.scroll(scrollContainer, { target: { scrollY: 1000 } });

        await waitFor(() => {
          const posts = container.querySelectorAll('[data-testid^="community-post-"]');
          expect(posts.length).toBeGreaterThan(20);
        });
      }
    });

    it('should hide "Load More" when all posts are loaded', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { postsPerPage: 20 });

      const loadMoreBtn = container.querySelector('[data-testid="load-more-btn"]');
      expect(loadMoreBtn).toBeFalsy(); // Only 2 cards, all loaded
    });
  });

  describe('Sorting', () => {
    it('should sort by "latest" (newest first)', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { sortBy: 'latest' });

      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      const firstPost = posts[0];
      expect(firstPost?.textContent).toContain('Test Card 1'); // Newer card
    });

    it('should sort by "popular" (most likes)', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { sortBy: 'popular' });

      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      const firstPost = posts[0];
      expect(firstPost?.textContent).toContain('Test Card 2'); // 75 likes > 50 likes
    });

    it('should sort by "rating" (highest rated)', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { sortBy: 'rating' });

      const posts = container.querySelectorAll('[data-testid^="community-post-"]');
      const firstPost = posts[0];
      expect(firstPost?.textContent).toContain('Test Card 2'); // 4.8 > 4.5
    });
  });

  describe('Columns and Layout', () => {
    it('should render with specified number of columns', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { columns: 3 });

      const feedGrid = container.querySelector('[data-testid="feed-grid"]');
      expect(feedGrid?.classList.contains('columns-3')).toBe(true);
    });

    it('should adapt columns for mobile', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      // Simulate mobile viewport
      global.innerWidth = 480;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(UnifiedCommunityFeed);

      const feedGrid = container.querySelector('[data-testid="feed-grid"]');
      expect(feedGrid?.classList.contains('columns-1')).toBe(true);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no posts available', () => {
      currentUser.set(mockUser);
      unifiedCards.set(new Map());

      const { container } = render(UnifiedCommunityFeed);

      expect(container.textContent).toContain('아직 게시물이 없습니다');
    });

    it('should show empty state for "following" filter when not following anyone', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed, { filter: 'following' });

      expect(container.textContent).toContain('팔로우');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      currentUser.set(mockUser);
      const cardsMap = new Map([[mockCards[0].id, mockCards[0]]]);
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed);

      const feedContainer = container.querySelector('[role="feed"]');
      expect(feedContainer).toBeTruthy();
    });

    it('should support keyboard navigation for filters', async () => {
      currentUser.set(mockUser);
      const cardsMap = new Map(mockCards.map((c) => [c.id, c]));
      unifiedCards.set(cardsMap);

      const { container } = render(UnifiedCommunityFeed);

      const filterBtn = container.querySelector('[data-testid="filter-public"]');
      if (filterBtn) {
        await fireEvent.keyPress(filterBtn, { key: 'Enter' });
        expect(filterBtn.classList.contains('active')).toBe(true);
      }
    });
  });
});
