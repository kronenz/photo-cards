import { test, expect } from '@playwright/test';

test.describe('Fan Level Progression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Mock user authentication
    await page.evaluate(() => {
      const mockUser = {
        id: 'user-e2e-001',
        username: 'e2e_test_fan',
        email: 'e2e@example.com',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date('2024-03-20'),
        fanProfile: {
          fanLevel: { level: 1, name: '야구 입문자' },
          currentPoints: 0,
          favoriteTeam: '',
          achievedBadges: [],
          joinedFanclubs: [],
        },
        creatorProfile: {
          creatorLevel: 'bronze',
          stats: {
            totalCards: 0,
            totalLikes: 0,
            totalDownloads: 0,
            averageRating: 0,
            followers: 0,
            following: 0,
          },
          isVerified: false,
          specializations: [],
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

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    });

    await page.reload();
  });

  test('should display initial fan level (야구 입문자)', async ({ page }) => {
    // Navigate to KBO Teams section
    const fanLevelDisplay = page.locator('[data-testid="fan-level-display"]');

    await expect(fanLevelDisplay).toContainText('야구 입문자');
    await expect(fanLevelDisplay).toContainText('레벨 1');
  });

  test('should show current points and next level requirement', async ({ page }) => {
    const pointsDisplay = page.locator('[data-testid="fan-points-display"]');
    const nextLevelDisplay = page.locator('[data-testid="next-fan-level"]');

    await expect(pointsDisplay).toContainText('0');
    await expect(nextLevelDisplay).toContainText('외야석 팬');
    await expect(nextLevelDisplay).toContainText('100'); // Points needed
  });

  test('should increase points after user activity (card creation)', async ({ page }) => {
    // Create a new card (simulates user activity that earns points)
    await page.click('[data-testid="create-card-button"]');

    // Fill in card details
    await page.fill('[data-testid="card-title-input"]', 'My First KBO Card');
    await page.fill('[data-testid="card-image-url"]', 'https://example.com/card.jpg');
    await page.click('[data-testid="submit-card-button"]');

    // Wait for card creation success
    await expect(page.locator('[data-testid="card-creation-success"]')).toBeVisible();

    // Check that points increased
    const pointsDisplay = page.locator('[data-testid="fan-points-display"]');
    await expect(pointsDisplay).toContainText('10'); // Earned 10 points for card creation
  });

  test('should show level-up notification when threshold is reached', async ({ page }) => {
    // Set user to just below level-up threshold
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.currentPoints = 95;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    // Perform activity that earns 10 points
    await page.click('[data-testid="create-card-button"]');
    await page.fill('[data-testid="card-title-input"]', 'Level Up Card');
    await page.fill('[data-testid="card-image-url"]', 'https://example.com/card2.jpg');
    await page.click('[data-testid="submit-card-button"]');

    // Level-up notification should appear
    const levelUpNotification = page.locator('[data-testid="level-up-notification"]');
    await expect(levelUpNotification).toBeVisible();
    await expect(levelUpNotification).toContainText('레벨 업!');
    await expect(levelUpNotification).toContainText('외야석 팬');

    // Check celebration animation
    await expect(levelUpNotification).toHaveClass(/animate-/);
  });

  test('should update fan level display after level-up', async ({ page }) => {
    // Set user to level 2
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 2, name: '외야석 팬' };
      currentUser.fanProfile.currentPoints = 100;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    const fanLevelDisplay = page.locator('[data-testid="fan-level-display"]');
    await expect(fanLevelDisplay).toContainText('외야석 팬');
    await expect(fanLevelDisplay).toContainText('레벨 2');
  });

  test('should show new perks after level-up', async ({ page }) => {
    // Set user to level 2
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 2, name: '외야석 팬' };
      currentUser.fanProfile.currentPoints = 150;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    // Click on fan level to see perks
    await page.click('[data-testid="fan-level-display"]');

    // Perks modal should appear
    const perksModal = page.locator('[data-testid="fan-perks-modal"]');
    await expect(perksModal).toBeVisible();

    // Check level 2 perks
    await expect(perksModal).toContainText('희귀 카드 생성');
    await expect(perksModal).toContainText('커뮤니티 게시물 핀');
    await expect(perksModal).toContainText('프로필 배지');
  });

  test('should display progress bar to next level', async ({ page }) => {
    // Set user to level 2 with 150 points (need 500 for level 3)
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 2, name: '외야석 팬' };
      currentUser.fanProfile.currentPoints = 150;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    const progressBar = page.locator('[data-testid="fan-level-progress"]');
    await expect(progressBar).toBeVisible();

    // Progress should be (150-100)/(500-100) = 50/400 = 12.5%
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(Math.round(Number(progressValue))).toBe(13); // Rounded
  });

  test('should show all 5 fan levels in progression overview', async ({ page }) => {
    // Open fan level progression modal
    await page.click('[data-testid="fan-level-display"]');
    await page.click('[data-testid="view-all-levels-button"]');

    const levelsModal = page.locator('[data-testid="fan-levels-overview"]');
    await expect(levelsModal).toBeVisible();

    // Check all 5 levels are displayed
    await expect(levelsModal.locator('[data-testid="fan-level-1"]')).toContainText('야구 입문자');
    await expect(levelsModal.locator('[data-testid="fan-level-2"]')).toContainText('외야석 팬');
    await expect(levelsModal.locator('[data-testid="fan-level-3"]')).toContainText('응원단 멤버');
    await expect(levelsModal.locator('[data-testid="fan-level-4"]')).toContainText('시즌권 홀더');
    await expect(levelsModal.locator('[data-testid="fan-level-5"]')).toContainText('구단 레전드');
  });

  test('should highlight current level and lock future levels', async ({ page }) => {
    // Set user to level 2
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 2, name: '외야석 팬' };
      currentUser.fanProfile.currentPoints = 150;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    await page.click('[data-testid="fan-level-display"]');
    await page.click('[data-testid="view-all-levels-button"]');

    // Level 1 should be completed
    const level1 = page.locator('[data-testid="fan-level-1"]');
    await expect(level1).toHaveClass(/completed/);

    // Level 2 should be current
    const level2 = page.locator('[data-testid="fan-level-2"]');
    await expect(level2).toHaveClass(/current/);

    // Levels 3-5 should be locked
    const level3 = page.locator('[data-testid="fan-level-3"]');
    await expect(level3).toHaveClass(/locked/);
  });

  test('should show visual feedback during level progression', async ({ page }) => {
    // Set user close to level-up
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 1, name: '야구 입문자' };
      currentUser.fanProfile.currentPoints = 90;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    // Initial progress bar state
    const progressBar = page.locator('[data-testid="fan-level-progress"]');
    const initialValue = await progressBar.getAttribute('aria-valuenow');

    // Perform activity to earn points
    await page.click('[data-testid="create-card-button"]');
    await page.fill('[data-testid="card-title-input"]', 'Progress Test Card');
    await page.fill('[data-testid="card-image-url"]', 'https://example.com/card3.jpg');
    await page.click('[data-testid="submit-card-button"]');

    // Wait for points to update
    await page.waitForTimeout(500);

    // Progress bar should have animated to new value
    const newValue = await progressBar.getAttribute('aria-valuenow');
    expect(Number(newValue)).toBeGreaterThan(Number(initialValue));

    // Progress bar should have animation class
    await expect(progressBar).toHaveClass(/transition/);
  });

  test('should earn points from multiple activities', async ({ page }) => {
    const initialPoints = 0;

    // Activity 1: Create card (+10 points)
    await page.click('[data-testid="create-card-button"]');
    await page.fill('[data-testid="card-title-input"]', 'Activity Card 1');
    await page.fill('[data-testid="card-image-url"]', 'https://example.com/card1.jpg');
    await page.click('[data-testid="submit-card-button"]');

    await expect(page.locator('[data-testid="fan-points-display"]')).toContainText('10');

    // Activity 2: Like a post (+2 points)
    await page.click('[data-testid="community-feed-tab"]');
    await page.click('[data-testid^="post-like-button-"]').first();

    await expect(page.locator('[data-testid="fan-points-display"]')).toContainText('12');

    // Activity 3: Comment on post (+5 points)
    await page.click('[data-testid^="post-comment-button-"]').first();
    await page.fill('[data-testid="comment-input"]', 'Great card!');
    await page.click('[data-testid="submit-comment-button"]');

    await expect(page.locator('[data-testid="fan-points-display"]')).toContainText('17');
  });

  test('should persist fan level across page reloads', async ({ page }) => {
    // Level up user
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 3, name: '응원단 멤버' };
      currentUser.fanProfile.currentPoints = 600;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    // Fan level should persist
    const fanLevelDisplay = page.locator('[data-testid="fan-level-display"]');
    await expect(fanLevelDisplay).toContainText('응원단 멤버');
    await expect(fanLevelDisplay).toContainText('레벨 3');

    const pointsDisplay = page.locator('[data-testid="fan-points-display"]');
    await expect(pointsDisplay).toContainText('600');
  });

  test('should celebrate reaching max level (구단 레전드)', async ({ page }) => {
    // Set user to just below max level
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.fanLevel = { level: 4, name: '시즌권 홀더' };
      currentUser.fanProfile.currentPoints = 9990;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    // Earn enough points to reach level 5
    await page.click('[data-testid="create-card-button"]');
    await page.fill('[data-testid="card-title-input"]', 'Legend Card');
    await page.fill('[data-testid="card-image-url"]', 'https://example.com/legend.jpg');
    await page.click('[data-testid="submit-card-button"]');

    // Special celebration for max level
    const maxLevelCelebration = page.locator('[data-testid="max-level-celebration"]');
    await expect(maxLevelCelebration).toBeVisible();
    await expect(maxLevelCelebration).toContainText('구단 레전드');
    await expect(maxLevelCelebration).toContainText('축하합니다!');

    // Check for special badge
    const legendBadge = page.locator('[data-testid="legend-badge"]');
    await expect(legendBadge).toBeVisible();
  });

  test('should show earned badges in profile', async ({ page }) => {
    // Award some badges
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.fanProfile.achievedBadges = [
        'badge-first-card',
        'badge-100-cards',
        'badge-lg-super-fan',
      ];
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });

    await page.reload();

    // Open profile
    await page.click('[data-testid="user-profile-button"]');

    // Badges should be displayed
    const badgesSection = page.locator('[data-testid="badges-section"]');
    await expect(badgesSection).toBeVisible();
    await expect(badgesSection.locator('[data-testid^="badge-"]')).toHaveCount(3);
  });
});
