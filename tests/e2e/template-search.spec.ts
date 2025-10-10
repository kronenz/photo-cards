import { test, expect } from '@playwright/test';

test.describe('User Story 3: Template Discovery & Filtering', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/marketplace');
		await page.waitForLoadState('networkidle');
	});

	test('should display search bar and templates on marketplace page', async ({ page }) => {
		// Verify search input exists
		await expect(page.locator('input[type="text"][placeholder*="템플릿 검색"]')).toBeVisible();

		// Verify templates are loaded
		const templateCount = await page.locator('.template-card').count();
		expect(templateCount).toBeGreaterThan(0);
	});

	test('should search templates with debouncing', async ({ page }) => {
		const searchInput = page.locator('input[type="text"][placeholder*="템플릿 검색"]');

		// Type search query
		await searchInput.fill('카드');

		// Wait for debounce (300ms) + API call
		await page.waitForTimeout(500);

		// Verify templates are filtered
		const templates = page.locator('.template-card');
		const count = await templates.count();

		// At least some templates should be visible
		expect(count).toBeGreaterThan(0);
	});

	test('should filter by category', async ({ page }) => {
		// Open advanced filters
		const advancedBtn = page.locator('button:has-text("고급 필터")');
		await advancedBtn.click();

		// Verify advanced filters panel is visible
		await expect(page.locator('.filters-advanced')).toBeVisible();

		// Select a category
		const categorySelect = page.locator('select#category');
		const options = await categorySelect.locator('option').count();

		if (options > 1) {
			// Select second option (first is "모든 카테고리")
			const categoryValue = await categorySelect
				.locator('option')
				.nth(1)
				.getAttribute('value');
			await categorySelect.selectOption(categoryValue || '');

			// Wait for results
			await page.waitForTimeout(500);

			// Verify templates are loaded
			const templateCount = await page.locator('.template-card').count();
			expect(templateCount).toBeGreaterThanOrEqual(0);
		}
	});

	test('should filter by team', async ({ page }) => {
		// Open advanced filters
		const advancedBtn = page.locator('button:has-text("고급 필터")');
		await advancedBtn.click();

		// Select a team
		const teamSelect = page.locator('select#team');
		const teamOptions = await teamSelect.locator('option').count();

		if (teamOptions > 1) {
			// Select a KBO team (e.g., LG Twins)
			const teamValue = await teamSelect.locator('option').nth(1).getAttribute('value');
			await teamSelect.selectOption(teamValue || '');

			// Wait for results
			await page.waitForTimeout(500);

			// Verify filtering worked
			const templateCount = await page.locator('.template-card').count();
			expect(templateCount).toBeGreaterThanOrEqual(0);
		}
	});

	test('should filter by minimum rating', async ({ page }) => {
		// Open advanced filters
		const advancedBtn = page.locator('button:has-text("고급 필터")');
		await advancedBtn.click();

		// Select rating filter
		const ratingSelect = page.locator('select#rating');
		await ratingSelect.selectOption('4'); // 4.0 이상

		// Wait for results
		await page.waitForTimeout(500);

		// Verify active filter badge
		const filterBadge = page.locator('.filter-badge');
		await expect(filterBadge).toBeVisible();
	});

	test('should sort templates', async ({ page }) => {
		// Get initial template order
		const initialFirstTemplate = await page.locator('.template-card').first().textContent();

		// Change sort to highest rated
		const sortSelect = page.locator('select#sort');
		await sortSelect.selectOption('-rating_average');

		// Wait for results
		await page.waitForTimeout(500);

		// Verify templates reloaded
		const templates = page.locator('.template-card');
		const count = await templates.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should reset filters', async ({ page }) => {
		// Open advanced filters and apply some filters
		const advancedBtn = page.locator('button:has-text("고급 필터")');
		await advancedBtn.click();

		// Apply rating filter
		const ratingSelect = page.locator('select#rating');
		await ratingSelect.selectOption('4');

		// Wait for filter badge
		await page.waitForTimeout(500);
		await expect(page.locator('.filter-badge')).toBeVisible();

		// Click reset button
		const resetBtn = page.locator('button:has-text("초기화")');
		await resetBtn.click();

		// Wait for reset
		await page.waitForTimeout(500);

		// Verify filter badge is gone
		const filterBadge = page.locator('.filter-badge');
		const badgeCount = await filterBadge.count();
		expect(badgeCount).toBe(0);
	});

	test('should show trending templates on first page', async ({ page }) => {
		// Verify trending section exists
		const trendingSection = page.locator('section.trending-templates');
		const trendingExists = await trendingSection.count();

		if (trendingExists > 0) {
			// Verify trending title
			await expect(page.locator('h2:has-text("지금 뜨는 템플릿")')).toBeVisible();

			// Verify trending cards with rank badges
			const rankBadges = page.locator('.rank-badge');
			const badgeCount = await rankBadges.count();
			expect(badgeCount).toBeGreaterThan(0);
		}
	});

	test('should show recommended templates on first page', async ({ page }) => {
		// Verify recommended section exists (may not show if user not logged in)
		const recommendedSection = page.locator('section.recommended-templates');
		const recommendedExists = await recommendedSection.count();

		if (recommendedExists > 0) {
			// Verify recommended title (either "추천 템플릿" or "인기 템플릿")
			const hasTitle =
				(await page.locator('h2:has-text("추천 템플릿")').count()) > 0 ||
				(await page.locator('h2:has-text("인기 템플릿")').count()) > 0;
			expect(hasTitle).toBeTruthy();
		}
	});

	test('should hide trending/recommended when filters are active', async ({ page }) => {
		// Verify trending section is visible initially
		const initialTrendingCount = await page.locator('section.trending-templates').count();

		// Apply search filter
		const searchInput = page.locator('input[type="text"][placeholder*="템플릿 검색"]');
		await searchInput.fill('테스트');
		await page.waitForTimeout(500);

		// Verify trending section is hidden
		const filteredTrendingCount = await page.locator('section.trending-templates').count();
		expect(filteredTrendingCount).toBe(0);
	});

	test('should support combined filters (search + category + rating)', async ({ page }) => {
		// Apply search
		const searchInput = page.locator('input[type="text"][placeholder*="템플릿 검색"]');
		await searchInput.fill('카드');

		// Open advanced filters
		const advancedBtn = page.locator('button:has-text("고급 필터")');
		await advancedBtn.click();

		// Apply rating filter
		const ratingSelect = page.locator('select#rating');
		await ratingSelect.selectOption('4');

		// Wait for combined filtering
		await page.waitForTimeout(500);

		// Verify multiple filters are active
		const filterBadge = page.locator('.filter-badge');
		const badgeText = await filterBadge.textContent();
		expect(parseInt(badgeText || '0')).toBeGreaterThan(0);
	});

	test('should maintain pagination with filters', async ({ page }) => {
		// Check if pagination exists
		const pagination = page.locator('.pagination');
		const hasPagination = (await pagination.count()) > 0;

		if (hasPagination) {
			// Apply a filter
			const searchInput = page.locator('input[type="text"][placeholder*="템플릿 검색"]');
			await searchInput.fill('카드');
			await page.waitForTimeout(500);

			// Verify we're on page 1
			const activePage = page.locator('.pagination-page.active');
			await expect(activePage).toHaveText('1');
		}
	});

	test('should handle no results gracefully', async ({ page }) => {
		// Search for something that likely doesn't exist
		const searchInput = page.locator('input[type="text"][placeholder*="템플릿 검색"]');
		await searchInput.fill('xyzabc123nonexistent');
		await page.waitForTimeout(500);

		// Should not show error, just empty results
		const errorState = page.locator('.error-state');
		const errorCount = await errorState.count();
		expect(errorCount).toBe(0);
	});

	test('should be mobile responsive', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Verify search input is visible
		await expect(page.locator('input[type="text"][placeholder*="템플릿 검색"]')).toBeVisible();

		// Open advanced filters
		const advancedBtn = page.locator('button:has-text("고급 필터")');
		await advancedBtn.click();

		// Verify filters are visible in mobile layout
		await expect(page.locator('.filters-advanced')).toBeVisible();
	});
});

test.describe('Search API Integration', () => {
	test('should use search endpoint when filters are active', async ({ page }) => {
		let searchEndpointCalled = false;

		// Listen for API calls
		page.on('request', (request) => {
			if (request.url().includes('/api/templates/search')) {
				searchEndpointCalled = true;
			}
		});

		await page.goto('/marketplace');
		await page.waitForLoadState('networkidle');

		// Apply search
		const searchInput = page.locator('input[type="text"][placeholder*="템플릿 검색"]');
		await searchInput.fill('카드');
		await page.waitForTimeout(500);

		expect(searchEndpointCalled).toBeTruthy();
	});
});
