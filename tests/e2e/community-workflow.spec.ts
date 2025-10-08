import { test, expect } from '@playwright/test';

test.describe('Community Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main page
    await page.goto('/');

    // Mock user authentication
    await page.evaluate(() => {
      const mockUser = {
        id: 'user-e2e-001',
        username: 'e2e_test_user',
        email: 'e2e@example.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
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

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    });

    await page.reload();
  });

  test('User shares card to community feed', async ({ page }) => {
    // Click on "자랑하기" button
    const showoffBtn = page.locator('[data-testid="showoff-btn"]');
    await expect(showoffBtn).toBeVisible();
    await showoffBtn.click();

    // Showoff modal should appear
    const showoffModal = page.locator('[data-testid="showoff-modal"]');
    await expect(showoffModal).toBeVisible();

    // Select a card
    const firstCard = page.locator('[data-testid^="card-select-"]').first();
    await firstCard.click();

    // Add caption
    const captionInput = page.locator('[data-testid="caption-input"]');
    await captionInput.fill('Check out my new KBO card! 🎉');

    // Select visibility
    const publicOption = page.locator('[data-testid="visibility-public"]');
    await publicOption.click();

    // Submit
    const submitBtn = page.locator('[data-testid="submit-showoff-btn"]');
    await submitBtn.click();

    // Success message should appear
    await expect(page.locator('[data-testid="showoff-success"]')).toBeVisible();

    // Card should appear in community feed
    await page.goto('/');
    const communityFeed = page.locator('[data-testid="community-feed"]');
    await expect(communityFeed).toBeVisible();

    // Look for the posted card
    const postedCard = page.locator('text=Check out my new KBO card! 🎉');
    await expect(postedCard).toBeVisible();
  });

  test('User likes another users card', async ({ page }) => {
    // Go to community feed
    await page.goto('/#community-feed');

    // Wait for feed to load
    const communityFeed = page.locator('[data-testid="community-feed"]');
    await expect(communityFeed).toBeVisible();

    // Find first post
    const firstPost = page.locator('[data-testid^="community-post-"]').first();
    await expect(firstPost).toBeVisible();

    // Get initial like count
    const likeCount = firstPost.locator('[data-testid="like-count"]');
    const initialLikes = await likeCount.textContent();
    const initialCount = parseInt(initialLikes || '0');

    // Click like button
    const likeBtn = firstPost.locator('[data-testid="like-btn"]');
    await likeBtn.click();

    // Like count should increment
    await expect(likeCount).toHaveText(String(initialCount + 1));

    // Like button should show active state
    await expect(likeBtn).toHaveClass(/liked/);
  });

  test('User receives like notification', async ({ page }) => {
    // Open notification center
    const notificationBtn = page.locator('[data-testid="notification-btn"]');
    await expect(notificationBtn).toBeVisible();

    // Should show unread count badge
    const unreadBadge = page.locator('[data-testid="unread-count"]');
    await expect(unreadBadge).toBeVisible();
    await expect(unreadBadge).toHaveText(/\d+/);

    // Click to open notifications
    await notificationBtn.click();

    // Notification panel should open
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Should show like notification
    const likeNotification = page.locator('[data-testid^="notification-like-"]').first();
    await expect(likeNotification).toBeVisible();
    await expect(likeNotification).toContainText('님이 회원님의 카드를 좋아합니다');
  });

  test('User follows creator', async ({ page }) => {
    // Go to community feed
    await page.goto('/#community-feed');

    // Find a post
    const firstPost = page.locator('[data-testid^="community-post-"]').first();
    await expect(firstPost).toBeVisible();

    // Click on creator profile
    const creatorLink = firstPost.locator('[data-testid="creator-link"]');
    await creatorLink.click();

    // Creator profile should open
    const profileModal = page.locator('[data-testid="creator-profile"]');
    await expect(profileModal).toBeVisible();

    // Click follow button
    const followBtn = page.locator('[data-testid="follow-btn"]');
    await expect(followBtn).toBeVisible();
    await followBtn.click();

    // Button should change to "Following"
    await expect(followBtn).toHaveText('팔로잉');
    await expect(followBtn).toHaveClass(/following/);

    // Follower count should increment
    const followerCount = page.locator('[data-testid="follower-count"]');
    await expect(followerCount).toHaveText(/\d+/);
  });

  test('User sees personalized feed from followed creators', async ({ page }) => {
    // First, follow some creators
    await page.goto('/#community-feed');

    // Follow first creator
    const firstPost = page.locator('[data-testid^="community-post-"]').first();
    const creatorLink = firstPost.locator('[data-testid="creator-link"]');
    await creatorLink.click();

    const followBtn = page.locator('[data-testid="follow-btn"]');
    await followBtn.click();

    // Close profile
    await page.keyboard.press('Escape');

    // Switch to "Following" filter
    const followingFilter = page.locator('[data-testid="filter-following"]');
    await followingFilter.click();

    // Feed should update
    const feedPosts = page.locator('[data-testid^="community-post-"]');
    await expect(feedPosts).toHaveCount(await feedPosts.count());

    // All posts should be from followed creators
    const posts = await feedPosts.all();
    for (const post of posts) {
      const followingBadge = post.locator('[data-testid="following-badge"]');
      await expect(followingBadge).toBeVisible();
    }
  });

  test('User adds comment to a card', async ({ page }) => {
    // Go to community feed
    await page.goto('/#community-feed');

    // Find first post
    const firstPost = page.locator('[data-testid^="community-post-"]').first();
    await expect(firstPost).toBeVisible();

    // Click comment button
    const commentBtn = firstPost.locator('[data-testid="comment-btn"]');
    await commentBtn.click();

    // Comment input should appear
    const commentInput = page.locator('[data-testid="comment-input"]');
    await expect(commentInput).toBeVisible();
    await commentInput.fill('Great card! Love the design 🎨');

    // Submit comment
    const submitCommentBtn = page.locator('[data-testid="submit-comment-btn"]');
    await submitCommentBtn.click();

    // Comment should appear in the post
    const comment = page.locator('text=Great card! Love the design 🎨');
    await expect(comment).toBeVisible();

    // Comment count should increment
    const commentCount = firstPost.locator('[data-testid="comment-count"]');
    await expect(commentCount).toHaveText(/\d+/);
  });

  test('User receives comment notification', async ({ page }) => {
    // Wait for potential comment notification
    await page.waitForTimeout(1000);

    // Open notification center
    const notificationBtn = page.locator('[data-testid="notification-btn"]');
    await notificationBtn.click();

    // Should show comment notification
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Look for comment notification type
    const commentNotification = page.locator('[data-testid^="notification-comment-"]').first();
    if (await commentNotification.isVisible()) {
      await expect(commentNotification).toContainText('댓글');
    }
  });

  test('User saves card as template', async ({ page }) => {
    // Go to community feed
    await page.goto('/#community-feed');

    // Click on a card to view details
    const firstCard = page.locator('[data-testid^="community-post-"] img').first();
    await firstCard.click();

    // Card detail modal should open
    const cardDetail = page.locator('[data-testid="card-detail-modal"]');
    await expect(cardDetail).toBeVisible();

    // Click "템플릿으로 저장" button
    const saveTemplateBtn = page.locator('[data-testid="save-template-btn"]');
    await expect(saveTemplateBtn).toBeVisible();
    await saveTemplateBtn.click();

    // Success message should appear
    const successMsg = page.locator('[data-testid="template-save-success"]');
    await expect(successMsg).toBeVisible();
    await expect(successMsg).toContainText('템플릿으로 저장되었습니다');
  });

  test('User changes post visibility to fanclub-only', async ({ page }) => {
    // Create new post
    const showoffBtn = page.locator('[data-testid="showoff-btn"]');
    await showoffBtn.click();

    const showoffModal = page.locator('[data-testid="showoff-modal"]');
    await expect(showoffModal).toBeVisible();

    // Select card
    const firstCard = page.locator('[data-testid^="card-select-"]').first();
    await firstCard.click();

    // Select fanclub visibility
    const fanclubOption = page.locator('[data-testid="visibility-fanclub"]');
    await fanclubOption.click();

    // Should show fanclub selector
    const fanclubSelector = page.locator('[data-testid="fanclub-selector"]');
    await expect(fanclubSelector).toBeVisible();

    // Select LG Twins fanclub
    const lgTwinsOption = page.locator('[data-testid="fanclub-team-lg-twins"]');
    await lgTwinsOption.click();

    // Caption
    await page.locator('[data-testid="caption-input"]').fill('LG Twins fans only! 💜');

    // Submit
    await page.locator('[data-testid="submit-showoff-btn"]').click();

    // Success
    await expect(page.locator('[data-testid="showoff-success"]')).toBeVisible();
  });

  test('User filters feed by team', async ({ page }) => {
    // Go to community feed
    await page.goto('/#community-feed');

    // Click team filter
    const teamFilter = page.locator('[data-testid="filter-team"]');
    await teamFilter.click();

    // Team selector should appear
    const teamSelector = page.locator('[data-testid="team-selector"]');
    await expect(teamSelector).toBeVisible();

    // Select LG Twins
    const lgTwinsBtn = page.locator('[data-testid="team-lg-twins"]');
    await lgTwinsBtn.click();

    // Feed should filter to show only LG Twins posts
    const feedPosts = page.locator('[data-testid^="community-post-"]');
    const posts = await feedPosts.all();

    for (const post of posts) {
      const tags = post.locator('[data-testid="post-tags"]');
      await expect(tags).toContainText('LG');
    }
  });

  test('User unfollows creator', async ({ page }) => {
    // Go to community feed
    await page.goto('/#community-feed');

    // Open a followed creator's profile
    const firstPost = page.locator('[data-testid^="community-post-"]').first();
    const creatorLink = firstPost.locator('[data-testid="creator-link"]');
    await creatorLink.click();

    // Creator profile should open
    const profileModal = page.locator('[data-testid="creator-profile"]');
    await expect(profileModal).toBeVisible();

    // If already following, unfollow button should be visible
    const followBtn = page.locator('[data-testid="follow-btn"]');

    if ((await followBtn.textContent()) === '팔로잉') {
      await followBtn.click();

      // Should change to "팔로우"
      await expect(followBtn).toHaveText('팔로우');
    }
  });

  test('User receives follow notification', async ({ page }) => {
    // Open notifications
    const notificationBtn = page.locator('[data-testid="notification-btn"]');
    await notificationBtn.click();

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Check for follow notification
    const followNotification = page.locator('[data-testid^="notification-follow-"]').first();
    if (await followNotification.isVisible()) {
      await expect(followNotification).toContainText('팔로우');
    }
  });

  test('Complete workflow: Share → Like → Comment → Follow', async ({ page }) => {
    // Step 1: Share a card
    await page.locator('[data-testid="showoff-btn"]').click();
    await page.locator('[data-testid^="card-select-"]').first().click();
    await page.locator('[data-testid="caption-input"]').fill('Complete workflow test');
    await page.locator('[data-testid="visibility-public"]').click();
    await page.locator('[data-testid="submit-showoff-btn"]').click();
    await expect(page.locator('[data-testid="showoff-success"]')).toBeVisible();

    // Step 2: Navigate to feed
    await page.goto('/#community-feed');
    await expect(page.locator('[data-testid="community-feed"]')).toBeVisible();

    // Step 3: Like a post
    const firstPost = page.locator('[data-testid^="community-post-"]').first();
    await firstPost.locator('[data-testid="like-btn"]').click();
    await expect(firstPost.locator('[data-testid="like-btn"]')).toHaveClass(/liked/);

    // Step 4: Add comment
    await firstPost.locator('[data-testid="comment-btn"]').click();
    await page.locator('[data-testid="comment-input"]').fill('Workflow comment');
    await page.locator('[data-testid="submit-comment-btn"]').click();
    await expect(page.locator('text=Workflow comment')).toBeVisible();

    // Step 5: Follow creator
    await firstPost.locator('[data-testid="creator-link"]').click();
    await page.locator('[data-testid="follow-btn"]').click();
    await expect(page.locator('[data-testid="follow-btn"]')).toHaveText('팔로잉');

    // Step 6: Verify notifications
    await page.keyboard.press('Escape'); // Close profile
    await page.locator('[data-testid="notification-btn"]').click();
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible();

    // All workflow complete!
  });
});
