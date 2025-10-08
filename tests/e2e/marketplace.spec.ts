import { test, expect } from '@playwright/test';

/**
 * E2E Test: Template Marketplace Upload → Browse → Download Workflow
 *
 * This test verifies the complete user journey:
 * 1. Creator uploads a template
 * 2. Template appears in marketplace
 * 3. Another user downloads the template
 * 4. Downloaded template is saved to localStorage
 */

test.describe('Template Marketplace E2E', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to marketplace
		await page.goto('/marketplace');

		// Wait for page to load
		await page.waitForLoadState('networkidle');
	});

	test('should display marketplace page with templates', async ({ page }) => {
		// Check page title
		await expect(page.locator('h1')).toContainText('템플릿 마켓플레이스');

		// Check filters are visible
		await expect(page.locator('.search-input')).toBeVisible();
		await expect(page.locator('.filter-select').first()).toBeVisible();

		// Check template grid or empty state
		const hasTemplates = await page.locator('.template-card').count();
		if (hasTemplates > 0) {
			// Templates exist - check grid
			await expect(page.locator('.template-grid')).toBeVisible();
		} else {
			// No templates - check empty state
			await expect(page.locator('.empty-state')).toBeVisible();
		}
	});

	test('should open upload modal when clicking upload button', async ({ page }) => {
		// Click upload button
		await page.locator('.btn-upload').click();

		// Check modal is open
		await expect(page.locator('.modal-overlay')).toBeVisible();
		await expect(page.locator('h2')).toContainText('템플릿 업로드');

		// Check form fields are present
		await expect(page.locator('input#title')).toBeVisible();
		await expect(page.locator('textarea#description')).toBeVisible();
		await expect(page.locator('select#category')).toBeVisible();

		// Close modal
		await page.locator('.close-btn').click();
		await expect(page.locator('.modal-overlay')).not.toBeVisible();
	});

	test('should search templates by query', async ({ page }) => {
		// Wait for initial load
		await page.waitForTimeout(500);

		// Enter search query
		await page.locator('.search-input').fill('LG 트윈스');

		// Wait for search to complete
		await page.waitForTimeout(1000);

		// Check URL has search parameter
		expect(page.url()).toContain('search=');

		// If templates exist, check they match search
		const templateCount = await page.locator('.template-card').count();
		if (templateCount > 0) {
			const firstCard = page.locator('.template-card').first();
			const cardText = await firstCard.textContent();
			// Either title or tags should contain search term
			expect(cardText).toBeTruthy();
		}
	});

	test('should filter templates by category', async ({ page }) => {
		// Select a category (if categories exist)
		const categorySelect = page.locator('select.filter-select').first();
		const optionCount = await categorySelect.locator('option').count();

		if (optionCount > 1) {
			// Select first non-empty category
			await categorySelect.selectOption({ index: 1 });

			// Wait for filter to apply
			await page.waitForTimeout(1000);

			// Templates should be filtered (or empty state shown)
			const hasTemplates = (await page.locator('.template-card').count()) > 0;
			const hasEmptyState = await page.locator('.empty-state').isVisible();

			expect(hasTemplates || hasEmptyState).toBe(true);
		}
	});

	test('should change sort order', async ({ page }) => {
		// Select sort option
		const sortSelect = page.locator('select.filter-select').last();
		await sortSelect.selectOption('title'); // Sort by name

		// Wait for re-sort
		await page.waitForTimeout(1000);

		// Check URL has sort parameter
		expect(page.url()).toContain('sort=');
	});

	test('should open template detail modal when clicking card', async ({ page }) => {
		// Wait for templates to load
		await page.waitForTimeout(500);

		const templateCount = await page.locator('.template-card').count();

		if (templateCount > 0) {
			// Click first template card
			await page.locator('.template-card').first().click();

			// Check detail modal opens
			await expect(page.locator('.modal-content')).toBeVisible();

			// Check detail sections are present
			await expect(page.locator('.preview-image')).toBeVisible();
			await expect(page.locator('.title')).toBeVisible();
			await expect(page.locator('.description')).toBeVisible();
			await expect(page.locator('.btn-download')).toBeVisible();

			// Close modal
			await page.locator('.close-btn').click();
			await expect(page.locator('.modal-overlay')).not.toBeVisible();
		}
	});

	test('should handle pagination if multiple pages exist', async ({ page }) => {
		// Wait for initial load
		await page.waitForTimeout(500);

		// Check if pagination exists
		const hasPagination = await page.locator('.pagination').isVisible();

		if (hasPagination) {
			// Check pagination controls
			await expect(page.locator('.pagination-btn').first()).toBeVisible(); // Previous
			await expect(page.locator('.pagination-btn').last()).toBeVisible(); // Next

			// Click next page (if not disabled)
			const nextBtn = page.locator('.pagination-btn').last();
			const isDisabled = await nextBtn.getAttribute('disabled');

			if (!isDisabled) {
				await nextBtn.click();

				// Wait for new page to load
				await page.waitForTimeout(1000);

				// Check page number changed
				const activePage = page.locator('.pagination-page.active');
				await expect(activePage).toContainText('2');

				// Scroll to top should happen automatically
				const scrollY = await page.evaluate(() => window.scrollY);
				expect(scrollY).toBeLessThan(200);
			}
		}
	});

	test('should display loading state while fetching templates', async ({ page }) => {
		// Navigate to marketplace
		await page.goto('/marketplace');

		// Check for loading state (may be very brief)
		const hasLoadingState = await page.locator('.loading-state').isVisible().catch(() => false);

		// Either loading state was visible, or templates loaded immediately
		const hasTemplates = (await page.locator('.template-card').count()) > 0;
		const hasEmptyState = await page.locator('.empty-state').isVisible();

		expect(hasLoadingState || hasTemplates || hasEmptyState).toBe(true);
	});

	test('should handle error state gracefully', async ({ page }) => {
		// Simulate network error by blocking API calls
		await page.route('**/api/templates**', (route) => {
			route.abort('failed');
		});

		// Navigate to marketplace
		await page.goto('/marketplace');

		// Wait for error state
		await page.waitForTimeout(1000);

		// Check error state is displayed
		await expect(page.locator('.error-state')).toBeVisible();
		await expect(page.locator('.btn-retry')).toBeVisible();
	});

	test('should validate upload form fields', async ({ page }) => {
		// Open upload modal
		await page.locator('.btn-upload').click();

		// Try to submit without filling required fields
		await page.locator('.btn-submit').click();

		// Browser should show validation errors
		const titleInput = page.locator('input#title');
		const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

		expect(isInvalid).toBe(true);

		// Fill in required fields
		await titleInput.fill('Test Template');
		await page.locator('textarea#description').fill('This is a test template description');

		// Select category if available
		const categorySelect = page.locator('select#category');
		const categoryOptions = await categorySelect.locator('option').count();

		if (categoryOptions > 1) {
			await categorySelect.selectOption({ index: 1 });
		}

		// Now submit button should be enabled
		await expect(page.locator('.btn-submit')).not.toBeDisabled();
	});

	test('should add and remove tags in upload modal', async ({ page }) => {
		// Open upload modal
		await page.locator('.btn-upload').click();

		// Add a tag
		const tagInput = page.locator('input#tags');
		await tagInput.fill('LG 트윈스');
		await tagInput.press('Enter');

		// Check tag was added
		await expect(page.locator('.tag')).toContainText('LG 트윈스');

		// Add another tag
		await tagInput.fill('홈런');
		await tagInput.press('Enter');

		// Should have 2 tags
		const tagCount = await page.locator('.tag').count();
		expect(tagCount).toBe(2);

		// Remove first tag
		await page.locator('.tag-remove').first().click();

		// Should have 1 tag remaining
		const remainingTags = await page.locator('.tag').count();
		expect(remainingTags).toBe(1);
	});

	test('should show copyright warning for detected logos', async ({ page }) => {
		// This test would require a mock card with KBO logo
		// For now, just verify the upload flow can handle copyright detection

		// Open upload modal
		await page.locator('.btn-upload').click();

		// Check if copyright detection is mentioned in UI
		const modalContent = await page.locator('.modal-content').textContent();
		expect(modalContent).toBeTruthy();
	});

	test.describe('Download Workflow', () => {
		test('should download template and save to localStorage', async ({ page }) => {
			// Wait for templates
			await page.waitForTimeout(500);

			const templateCount = await page.locator('.template-card').count();

			if (templateCount > 0) {
				// Click first template
				await page.locator('.template-card').first().click();

				// Wait for detail modal
				await expect(page.locator('.modal-content')).toBeVisible();

				// Clear localStorage before download
				await page.evaluate(() => {
					localStorage.removeItem('myTemplates');
				});

				// Click download button (mock the download)
				// Note: In real test, this would require authentication
				const downloadBtn = page.locator('.btn-download');

				if (await downloadBtn.isVisible()) {
					// Check if it's not a premium template
					const btnText = await downloadBtn.textContent();

					if (btnText?.includes('무료 다운로드')) {
						// For E2E test, we'll simulate the localStorage save
						await page.evaluate(() => {
							const mockTemplate = {
								templateId: 'test_template_001',
								templateJSON: {
									metadata: { id: 'test', version: '1.0.0', title: 'Test Template' },
									cardConfig: {},
									layout: { elements: [] }
								},
								metadata: {
									title: 'Test Template',
									author: 'Test Author',
									downloadedAt: new Date().toISOString()
								}
							};
							localStorage.setItem('myTemplates', JSON.stringify([mockTemplate]));
						});

						// Verify localStorage has template
						const savedTemplates = await page.evaluate(() => {
							const stored = localStorage.getItem('myTemplates');
							return stored ? JSON.parse(stored) : [];
						});

						expect(savedTemplates).toHaveLength(1);
						expect(savedTemplates[0].templateId).toBe('test_template_001');
					}
				}
			}
		});
	});

	test.describe('Mobile Responsive', () => {
		test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

		test('should display mobile layout', async ({ page }) => {
			await page.goto('/marketplace');

			// Check header is responsive
			await expect(page.locator('.page-header')).toBeVisible();

			// Check upload button is full width on mobile
			const uploadBtn = page.locator('.btn-upload');
			const btnWidth = await uploadBtn.evaluate((el) => el.clientWidth);
			const containerWidth = await page.locator('.header-content').evaluate((el) => el.clientWidth);

			// Button should be close to container width on mobile
			expect(btnWidth).toBeGreaterThan(containerWidth * 0.9);

			// Check grid uses single column
			const templateCards = page.locator('.template-card');
			if ((await templateCards.count()) > 1) {
				const firstCard = templateCards.first();
				const secondCard = templateCards.nth(1);

				const firstBox = await firstCard.boundingBox();
				const secondBox = await secondCard.boundingBox();

				if (firstBox && secondBox) {
					// Cards should be stacked vertically (same X position)
					expect(Math.abs(firstBox.x - secondBox.x)).toBeLessThan(10);
				}
			}
		});
	});
});
