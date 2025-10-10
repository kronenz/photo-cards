/**
 * Lighthouse CI Configuration
 * Feature: 003-navigation-ui-renewal
 * Performance Budget & Accessibility Monitoring
 */

module.exports = {
	ci: {
		collect: {
			// Test these URLs
			url: [
				'http://localhost:5173/', // Home
				'http://localhost:5173/create', // Card Create
				'http://localhost:5173/collections', // Collections
				'http://localhost:5173/login', // Auth
				'http://localhost:5173/marketplace' // Template Marketplace
			],
			// Run 3 times and use median
			numberOfRuns: 3,
			// Start dev server automatically
			startServerCommand: 'npm run preview',
			startServerReadyPattern: 'Local:',
			startServerReadyTimeout: 30000
		},
		assert: {
			preset: 'lighthouse:recommended',
			assertions: {
				// Performance Budget (FR-010)
				'categories:performance': ['error', { minScore: 0.9 }],

				// Accessibility (FR-008 - WCAG 2.1 AA)
				'categories:accessibility': ['error', { minScore: 1.0 }],

				// Best Practices
				'categories:best-practices': ['warn', { minScore: 0.9 }],

				// SEO
				'categories:seo': ['warn', { minScore: 0.85 }],

				// Performance Metrics
				'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // 2s
				'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
				'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
				'total-blocking-time': ['warn', { maxNumericValue: 300 }], // 300ms

				// Navigation Specific (FR-007)
				'interactive': ['error', { maxNumericValue: 3000 }], // 3s (spec.md)

				// Bundle Size (FR-010)
				'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB
				'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB

				// Accessibility Specific
				'color-contrast': 'error',
				'aria-allowed-attr': 'error',
				'aria-required-attr': 'error',
				'button-name': 'error',
				'link-name': 'error',
				'label': 'error',
				'tabindex': 'error'
			}
		},
		upload: {
			// Upload to Lighthouse CI server (optional)
			target: 'temporary-public-storage'
		}
	}
};
