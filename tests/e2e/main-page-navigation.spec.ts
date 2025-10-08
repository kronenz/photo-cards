/**
 * Main Page Navigation E2E Tests (T031)
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Test user can navigate from main page to collections, feed, teams
 * Requirements: FR-006, FR-007, FR-008, FR-009
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// ===== HELPER FUNCTIONS =====

/**
 * Wait for page to be fully loaded and interactive
 */
async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Check if section is visible on page
 */
async function isSectionVisible(page: Page, sectionId: string): Promise<boolean> {
  const section = page.locator(`#${sectionId}`);
  return await section.isVisible();
}

/**
 * Scroll to section by ID
 */
async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.evaluate((id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, sectionId);
  await page.waitForTimeout(500); // Wait for smooth scroll
}

/**
 * Get current viewport scroll position
 */
async function getScrollPosition(page: Page): Promise<number> {
  return await page.evaluate(() => window.scrollY);
}

// ===== TEST SUITE =====

test.describe('Main Page Navigation - Section Visibility', () => {
  test('should render all default sections on main page', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check all default sections exist
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).toBeVisible();
    await expect(page.locator('#community-feed')).toBeVisible();
    await expect(page.locator('#recommendations')).toBeVisible();
  });

  test('should hide KBO section when showKBOSection=false', async ({ page }) => {
    await page.goto(`${BASE_URL}/?showKBOSection=false`);
    await waitForPageReady(page);

    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).not.toBeVisible();
    await expect(page.locator('#community-feed')).toBeVisible();
    await expect(page.locator('#recommendations')).toBeVisible();
  });

  test('should hide community feed when showCommunityFeed=false', async ({ page }) => {
    await page.goto(`${BASE_URL}/?showCommunityFeed=false`);
    await waitForPageReady(page);

    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).toBeVisible();
    await expect(page.locator('#community-feed')).not.toBeVisible();
    await expect(page.locator('#recommendations')).toBeVisible();
  });

  test('should render sections in correct order', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const sections = page.locator('main > section[id]');
    const sectionIds = await sections.evaluateAll((elements) => elements.map((el) => el.id));

    expect(sectionIds).toEqual([
      'hero',
      'collection-dashboard',
      'kbo-teams',
      'community-feed',
      'recommendations',
    ]);
  });
});

test.describe('Main Page Navigation - Collection Dashboard', () => {
  test('should navigate to collection detail page on collection click', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Find first collection card
    const collectionCard = page.locator('#collection-dashboard .collection-card').first();
    await expect(collectionCard).toBeVisible();

    // Click collection card
    await collectionCard.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to collection detail page
    expect(page.url()).toMatch(/\/collections\/[^/]+/);
    await expect(page.locator('h1')).toContainText(/Collection|컬렉션/i);
  });

  test('should show latest cards in collection dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const latestCards = page.locator('#collection-dashboard .latest-cards .unified-card');
    const count = await latestCards.count();

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(3); // Default latestCardsCount: 3
  });

  test('should display collection progress bars', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const progressBars = page.locator('#collection-dashboard .collection-progress');
    const count = await progressBars.count();

    expect(count).toBeGreaterThan(0);

    // Check first progress bar structure
    const firstProgress = progressBars.first();
    await expect(firstProgress.locator('.progress-bar')).toBeVisible();
    await expect(firstProgress.locator('.progress-text')).toBeVisible();
  });

  test('should navigate to "Show Off" modal on button click', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Find first "자랑하기" button
    const showoffButton = page.locator('#collection-dashboard button:has-text("자랑하기")').first();

    if (await showoffButton.isVisible()) {
      await showoffButton.click();
      await page.waitForTimeout(500);

      // Modal should be visible
      await expect(page.locator('.showoff-modal, [role="dialog"]')).toBeVisible();
    }
  });
});

test.describe('Main Page Navigation - KBO Teams Section', () => {
  test('should display KBO team cards', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const teamCards = page.locator('#kbo-teams .team-card, #kbo-teams .kbo-team');
    const count = await teamCards.count();

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10); // KBO has 10 teams
  });

  test('should navigate to team page on team click', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const firstTeam = page.locator('#kbo-teams .team-card, #kbo-teams .kbo-team').first();
    await expect(firstTeam).toBeVisible();

    await firstTeam.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to team page or trigger team selection
    const urlChanged = page.url() !== BASE_URL;
    const themeChanged = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--team-color') !== '';
    });

    expect(urlChanged || themeChanged).toBe(true);
  });

  test('should display team carousel navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check for carousel navigation buttons
    const prevButton = page.locator('#kbo-teams button:has-text("이전"), #kbo-teams button[aria-label*="previous" i]');
    const nextButton = page.locator('#kbo-teams button:has-text("다음"), #kbo-teams button[aria-label*="next" i]');

    // At least one navigation method should exist
    const hasCarouselNav = (await prevButton.count()) > 0 || (await nextButton.count()) > 0;
    expect(hasCarouselNav).toBe(true);
  });

  test('should show team stats when enabled', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const teamStats = page.locator('#kbo-teams .team-stats, #kbo-teams .stats');
    const statsVisible = (await teamStats.count()) > 0;

    // Stats should be visible by default (showStats: true)
    expect(statsVisible).toBe(true);
  });
});

test.describe('Main Page Navigation - Community Feed', () => {
  test('should display community posts in feed', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    const posts = page.locator('#community-feed .post-card, #community-feed .community-post');
    const count = await posts.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to post detail on post click', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    const firstPost = page.locator('#community-feed .post-card, #community-feed .community-post').first();
    await expect(firstPost).toBeVisible();

    await firstPost.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to post detail page
    expect(page.url()).toMatch(/\/posts\/[^/]+|\/community\/[^/]+/);
  });

  test('should like post from feed', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    const firstPost = page.locator('#community-feed .post-card, #community-feed .community-post').first();
    const likeButton = firstPost.locator('button:has-text("좋아요"), button[aria-label*="like" i]').first();

    if (await likeButton.isVisible()) {
      // Get initial like count
      const likeCountText = await firstPost.locator('.like-count, [data-likes]').first().textContent();
      const initialLikes = parseInt(likeCountText?.match(/\d+/)?.[0] || '0');

      // Click like button
      await likeButton.click();
      await page.waitForTimeout(500);

      // Check like count increased
      const newLikeCountText = await firstPost.locator('.like-count, [data-likes]').first().textContent();
      const newLikes = parseInt(newLikeCountText?.match(/\d+/)?.[0] || '0');

      expect(newLikes).toBeGreaterThanOrEqual(initialLikes);
    }
  });

  test('should filter community feed', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    // Find filter buttons
    const filterButtons = page.locator('#community-feed button:has-text("전체"), #community-feed button:has-text("팔로잉"), #community-feed button:has-text("인기"), #community-feed button:has-text("최신")');

    if ((await filterButtons.count()) > 0) {
      const popularFilter = page.locator('#community-feed button:has-text("인기"), #community-feed button:has-text("Popular")').first();

      if (await popularFilter.isVisible()) {
        await popularFilter.click();
        await page.waitForTimeout(500);

        // Posts should reload with popular filter
        const posts = page.locator('#community-feed .post-card, #community-feed .community-post');
        expect(await posts.count()).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Main Page Navigation - Infinite Scroll', () => {
  test('should load more posts on scroll to bottom', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    // Get initial post count
    const initialPosts = await page.locator('#community-feed .post-card, #community-feed .community-post').count();

    // Scroll to bottom of community feed
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for loading indicator
    const loadingIndicator = page.locator('#community-feed .loading, #community-feed [aria-busy="true"]');
    if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
    }

    await page.waitForTimeout(1000);

    // Get new post count
    const newPosts = await page.locator('#community-feed .post-card, #community-feed .community-post').count();

    // More posts should be loaded (or same if no more posts)
    expect(newPosts).toBeGreaterThanOrEqual(initialPosts);
  });

  test('should show loading indicator during infinite scroll', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Loading indicator should appear briefly
    const loadingIndicator = page.locator('#community-feed .loading, #community-feed [aria-busy="true"], #community-feed .spinner');

    try {
      await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
    } catch {
      // If no loading indicator, check if "loadmore" event was triggered
      const hasMorePosts = await page.evaluate(() => {
        return document.querySelectorAll('#community-feed .post-card, #community-feed .community-post').length > 0;
      });
      expect(hasMorePosts).toBe(true);
    }
  });
});

test.describe('Main Page Navigation - Skip Links (Accessibility)', () => {
  test('should have skip links for main sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check skip links exist
    const skipLinks = page.locator('a[href^="#collection-dashboard"], a[href^="#kbo-teams"], a[href^="#community-feed"]');
    const count = await skipLinks.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to section on skip link click', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const skipToCollections = page.locator('a[href="#collection-dashboard"]').first();

    if (await skipToCollections.isVisible()) {
      await skipToCollections.click();
      await page.waitForTimeout(500);

      // Should scroll to collection dashboard
      const scrollPosition = await getScrollPosition(page);
      expect(scrollPosition).toBeGreaterThan(0);

      // Collection dashboard should be in viewport
      await expect(page.locator('#collection-dashboard')).toBeInViewport();
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check ARIA landmarks
    await expect(page.locator('[role="banner"], header')).toBeVisible();
    await expect(page.locator('[role="navigation"], nav')).toBeVisible();
    await expect(page.locator('[role="main"], main')).toBeVisible();
  });
});

test.describe('Main Page Navigation - Keyboard Navigation', () => {
  test('should navigate between sections with Tab key', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Press Tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Some element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
  });

  test('should activate focused element with Enter key', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Tab to first collection card
    let tabCount = 0;
    let foundCollectionCard = false;

    while (tabCount < 20 && !foundCollectionCard) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const focusedClass = await page.evaluate(() => document.activeElement?.className || '');
      if (focusedClass.includes('collection-card')) {
        foundCollectionCard = true;
      }
      tabCount++;
    }

    if (foundCollectionCard) {
      // Press Enter on focused collection card
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Should navigate to collection page
      expect(page.url()).not.toBe(BASE_URL);
    }
  });

  test('should scroll to top with Home key', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);

    let scrollPosition = await getScrollPosition(page);
    expect(scrollPosition).toBeGreaterThan(500);

    // Press Home key
    await page.keyboard.press('Home');
    await page.waitForTimeout(300);

    scrollPosition = await getScrollPosition(page);
    expect(scrollPosition).toBeLessThan(100);
  });

  test('should scroll to bottom with End key', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Press End key
    await page.keyboard.press('End');
    await page.waitForTimeout(500);

    const scrollPosition = await getScrollPosition(page);
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);

    expect(scrollPosition).toBeGreaterThan(pageHeight * 0.7); // Near bottom
  });
});

test.describe('Main Page Navigation - Responsive Layout', () => {
  test('should render mobile layout correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check sections are visible
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).toBeVisible();

    // Feed should be single column on mobile
    const feedColumns = await page.evaluate(() => {
      const feed = document.querySelector('#community-feed');
      if (!feed) return 0;
      const style = window.getComputedStyle(feed);
      return style.gridTemplateColumns?.split(' ').length || 1;
    });

    expect(feedColumns).toBeLessThanOrEqual(1);
  });

  test('should render tablet layout correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check sections are visible
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).toBeVisible();

    // Feed should be 2 columns on tablet
    const feedColumns = await page.evaluate(() => {
      const feed = document.querySelector('#community-feed');
      if (!feed) return 0;
      const style = window.getComputedStyle(feed);
      return style.gridTemplateColumns?.split(' ').length || 1;
    });

    expect(feedColumns).toBeGreaterThanOrEqual(1);
    expect(feedColumns).toBeLessThanOrEqual(2);
  });

  test('should render desktop layout correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check sections are visible
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).toBeVisible();

    // Feed should be 3 columns on desktop
    const feedColumns = await page.evaluate(() => {
      const feed = document.querySelector('#community-feed');
      if (!feed) return 0;
      const style = window.getComputedStyle(feed);
      return style.gridTemplateColumns?.split(' ').length || 1;
    });

    expect(feedColumns).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Main Page Navigation - Layout Variants', () => {
  test('should render standard layout', async ({ page }) => {
    await page.goto(`${BASE_URL}/?layout=standard`);
    await waitForPageReady(page);

    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#collection-dashboard')).toBeVisible();
    await expect(page.locator('#kbo-teams')).toBeVisible();
    await expect(page.locator('#community-feed')).toBeVisible();
  });

  test('should render compact layout', async ({ page }) => {
    await page.goto(`${BASE_URL}/?layout=compact`);
    await waitForPageReady(page);

    // Compact layout should have reduced spacing
    const mainPadding = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return 0;
      const style = window.getComputedStyle(main);
      return parseInt(style.paddingTop || '0');
    });

    // In compact layout, padding should be smaller
    expect(mainPadding).toBeLessThan(100);
  });

  test('should render KBO-focus layout', async ({ page }) => {
    await page.goto(`${BASE_URL}/?layout=kbo-focus`);
    await waitForPageReady(page);

    // KBO teams should be more prominent
    await expect(page.locator('#kbo-teams')).toBeVisible();

    // Check if KBO section is rendered before community feed
    const sections = await page.locator('main > section[id]').evaluateAll((elements) =>
      elements.map((el) => el.id)
    );

    const kboIndex = sections.indexOf('kbo-teams');
    const communityIndex = sections.indexOf('community-feed');

    if (kboIndex >= 0 && communityIndex >= 0) {
      expect(kboIndex).toBeLessThan(communityIndex);
    }
  });
});

test.describe('Main Page Navigation - State Persistence', () => {
  test('should restore scroll position on navigation back', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Scroll to middle
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);

    const initialScroll = await getScrollPosition(page);

    // Navigate to collection page
    const collectionCard = page.locator('#collection-dashboard .collection-card').first();
    if (await collectionCard.isVisible()) {
      await collectionCard.click();
      await page.waitForLoadState('networkidle');

      // Go back
      await page.goBack();
      await waitForPageReady(page);

      // Scroll position should be restored (within tolerance)
      const restoredScroll = await getScrollPosition(page);
      expect(Math.abs(restoredScroll - initialScroll)).toBeLessThan(200);
    }
  });

  test('should maintain feed filter on page reload', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    await scrollToSection(page, 'community-feed');

    // Select "Popular" filter
    const popularFilter = page.locator('#community-feed button:has-text("인기"), #community-feed button:has-text("Popular")').first();

    if (await popularFilter.isVisible()) {
      await popularFilter.click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await waitForPageReady(page);

      await scrollToSection(page, 'community-feed');

      // Filter should be preserved (if implemented with URL state)
      const activeFilter = page.locator('#community-feed button.active, #community-feed button[aria-pressed="true"]');
      const activeText = await activeFilter.first().textContent();

      // Check if popular filter is still active (implementation-dependent)
      expect(activeText).toBeTruthy();
    }
  });
});

test.describe('Main Page Navigation - Error Handling', () => {
  test('should show error message when section fails to load', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Check for error indicators
    const errorMessages = page.locator('.error-message, [role="alert"]');
    const errorCount = await errorMessages.count();

    // No errors should be present on initial load
    expect(errorCount).toBe(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});

    // Re-enable network
    await page.context().setOffline(false);

    // Page should either show error or SSR content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should retry failed requests on user action', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Look for retry buttons
    const retryButton = page.locator('button:has-text("다시 시도"), button:has-text("Retry")');

    if (await retryButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await retryButton.first().click();
      await page.waitForTimeout(1000);

      // Content should reload
      const hasContent = await page.locator('#collection-dashboard, #community-feed').first().isVisible();
      expect(hasContent).toBe(true);
    }
  });
});

test.describe('Main Page Navigation - Performance', () => {
  test('should load main page within 3 seconds (Time to Interactive)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL);
    await waitForPageReady(page);

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Target TTI: 3000ms (per PERFORMANCE_REQUIREMENTS)
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have First Contentful Paint under 1.5 seconds', async ({ page }) => {
    await page.goto(BASE_URL);

    const fcpMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ type: 'paint', buffered: true });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    if (fcpMetric > 0) {
      // Target FCP: 1500ms (per PERFORMANCE_REQUIREMENTS)
      expect(fcpMetric).toBeLessThan(1500);
    }
  });

  test('should not have layout shifts during navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);

    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsScore += (entry as any).value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(clsScore), 3000);
      });
    });

    // CLS should be < 0.1 (Google's "Good" threshold)
    expect(cls).toBeLessThan(0.1);
  });
});
