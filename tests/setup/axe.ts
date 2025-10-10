/**
 * Accessibility Testing Setup
 * Feature: 003-navigation-ui-renewal
 * Tool: axe-core + Playwright
 */

import { test as base, expect as baseExpect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations, configureAxe } from 'axe-playwright';
import type { Page } from '@playwright/test';

/**
 * Extended Playwright test with axe-core injection
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		// Inject axe-core script into every page
		await injectAxe(page);
		await use(page);
	}
});

export { baseExpect as expect };

/**
 * Check accessibility violations on current page
 * @param page - Playwright page object
 * @param options - axe-core configuration options
 */
export async function checkPageAccessibility(
	page: Page,
	options?: {
		rules?: Record<string, { enabled: boolean }>;
		selector?: string;
		exclude?: string[];
	}
) {
	// Configure axe rules (WCAG 2.1 AA)
	await configureAxe(page, {
		rules: {
			// Enable WCAG 2.1 AA rules
			'color-contrast': { enabled: true },
			'aria-allowed-attr': { enabled: true },
			'aria-required-attr': { enabled: true },
			'button-name': { enabled: true },
			'label': { enabled: true },
			'link-name': { enabled: true },
			...(options?.rules || {})
		}
	});

	// Run accessibility check
	const violations = await getViolations(page, options?.selector, {
		exclude: options?.exclude || []
	});

	// Assert no violations
	if (violations.length > 0) {
		console.error('Accessibility violations found:');
		violations.forEach((violation) => {
			console.error(`- ${violation.id}: ${violation.description}`);
			console.error(`  Impact: ${violation.impact}`);
			console.error(`  Help: ${violation.helpUrl}`);
			violation.nodes.forEach((node) => {
				console.error(`  - ${node.html}`);
			});
		});
	}

	baseExpect(violations).toEqual([]);
}

/**
 * Check accessibility for specific element
 * @param page - Playwright page object
 * @param selector - CSS selector for target element
 */
export async function checkElementAccessibility(page: Page, selector: string) {
	await checkPageAccessibility(page, { selector });
}

/**
 * Ignore specific accessibility rules for a test
 * @param page - Playwright page object
 * @param rules - Rules to disable (e.g., ['color-contrast', 'link-name'])
 */
export async function ignoreA11yRules(page: Page, rules: string[]) {
	const rulesConfig = rules.reduce(
		(acc, rule) => {
			acc[rule] = { enabled: false };
			return acc;
		},
		{} as Record<string, { enabled: boolean }>
	);

	await configureAxe(page, { rules: rulesConfig });
}

/**
 * Helper: Check keyboard navigation
 * @param page - Playwright page object
 * @param selector - Start element selector
 * @param expectedFocusOrder - Array of expected focus selectors
 */
export async function checkKeyboardNavigation(page: Page, expectedFocusOrder: string[]) {
	for (let i = 0; i < expectedFocusOrder.length; i++) {
		await page.keyboard.press('Tab');
		const focusedElement = await page.evaluate(() => document.activeElement?.id);
		const expected = expectedFocusOrder[i].replace('#', '');
		baseExpect(focusedElement).toBe(expected);
	}
}

/**
 * Helper: Check screen reader labels
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns aria-label or aria-labelledby content
 */
export async function getScreenReaderLabel(page: Page, selector: string): Promise<string | null> {
	return await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		if (!element) return null;

		// Check aria-label
		const ariaLabel = element.getAttribute('aria-label');
		if (ariaLabel) return ariaLabel;

		// Check aria-labelledby
		const labelledBy = element.getAttribute('aria-labelledby');
		if (labelledBy) {
			const labelElement = document.getElementById(labelledBy);
			return labelElement?.textContent || null;
		}

		// Check associated <label> for inputs
		if (element instanceof HTMLInputElement) {
			const label = document.querySelector(`label[for="${element.id}"]`);
			return label?.textContent || null;
		}

		return null;
	}, selector);
}

/**
 * Helper: Check focus visible state
 * @param page - Playwright page object
 * @param selector - Element selector
 */
export async function checkFocusVisible(page: Page, selector: string) {
	await page.focus(selector);

	const hasFocusVisible = await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		if (!element) return false;

		const computedStyle = window.getComputedStyle(element);
		return computedStyle.outlineWidth !== '0px' || computedStyle.outlineStyle !== 'none';
	}, selector);

	baseExpect(hasFocusVisible).toBe(true);
}
