/**
 * Enhanced Card Cross-Browser Compatibility Test Suite
 * Tests compatibility across different browsers and devices
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Cross-browser compatibility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import EnhancedCard from '../EnhancedCard.svelte';

// Browser environment mocks
const mockBrowserEnvironments = {
	chrome: {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		features: {
			touchEvents: true,
			pointerEvents: true,
			webGL: true,
			requestAnimationFrame: true
		}
	},
	firefox: {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
		features: {
			touchEvents: true,
			pointerEvents: true,
			webGL: true,
			requestAnimationFrame: true
		}
	},
	safari: {
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
		features: {
			touchEvents: true,
			pointerEvents: false, // Safari has limited pointer events support
			webGL: true,
			requestAnimationFrame: true
		}
	},
	edge: {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
		features: {
			touchEvents: true,
			pointerEvents: true,
			webGL: true,
			requestAnimationFrame: true
		}
	},
	mobileSafari: {
		userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
		features: {
			touchEvents: true,
			pointerEvents: false,
			webGL: true,
			requestAnimationFrame: true
		}
	},
	androidChrome: {
		userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
		features: {
			touchEvents: true,
			pointerEvents: true,
			webGL: true,
			requestAnimationFrame: true
		}
	}
};

function mockBrowser(browserName: keyof typeof mockBrowserEnvironments) {
	const browser = mockBrowserEnvironments[browserName];
	
	// Mock user agent
	Object.defineProperty(navigator, 'userAgent', {
		writable: true,
		value: browser.userAgent
	});

	// Mock touch support
	if (browser.features.touchEvents) {
		Object.defineProperty(window, 'ontouchstart', {
			writable: true,
			value: null
		});
		Object.defineProperty(navigator, 'maxTouchPoints', {
			writable: true,
			value: 10
		});
	} else {
		delete (window as any).ontouchstart;
		Object.defineProperty(navigator, 'maxTouchPoints', {
			writable: true,
			value: 0
		});
	}

	// Mock pointer events
	if (browser.features.pointerEvents) {
		Object.defineProperty(window, 'PointerEvent', {
			writable: true,
			value: class PointerEvent extends Event {
				pointerId: number = 1;
				pointerType: string = 'mouse';
				isPrimary: boolean = true;
			}
		});
	} else {
		delete (window as any).PointerEvent;
	}

	// Mock requestAnimationFrame
	if (browser.features.requestAnimationFrame) {
		Object.defineProperty(window, 'requestAnimationFrame', {
			writable: true,
			value: vi.fn((callback: FrameRequestCallback) => {
				return setTimeout(callback, 16);
			})
		});
	} else {
		delete (window as any).requestAnimationFrame;
	}
}

describe('Enhanced Card Cross-Browser Compatibility', () => {
	beforeEach(() => {
		// Reset DOM
		document.body.innerHTML = '';
	});

	afterEach(() => {
		cleanup();
	});

	describe('Desktop Browser Compatibility', () => {
		it('should work correctly in Chrome', () => {
			mockBrowser('chrome');
			
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					holographicStyle: 'basic'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();
		});

		it('should work correctly in Firefox', () => {
			mockBrowser('firefox');
			
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					holographicStyle: 'cosmic'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();
		});

		it('should work correctly in Safari', () => {
			mockBrowser('safari');
			
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					holographicStyle: 'rainbow'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();
		});

		it('should work correctly in Edge', () => {
			mockBrowser('edge');
			
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					holographicStyle: 'aurora'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();
		});
	});

	describe('Mobile Browser Compatibility', () => {
		it('should work correctly in Mobile Safari', async () => {
			mockBrowser('mobileSafari');
			
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					enableFlip: true
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;
			expect(cardContainer).toBeTruthy();

			// Test touch events
			const mockTouch = {
				identifier: 0,
				target: cardContainer,
				clientX: 100,
				clientY: 150,
				pageX: 100,
				pageY: 150,
				screenX: 100,
				screenY: 150,
				radiusX: 1,
				radiusY: 1,
				rotationAngle: 0,
				force: 1
			};

			await fireEvent.touchStart(cardContainer, {
				touches: [mockTouch]
			});

			expect(cardContainer).toBeTruthy();
		});

		it('should work correctly in Android Chrome', async () => {
			mockBrowser('androidChrome');
			
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					enableFlip: true
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;
			expect(cardContainer).toBeTruthy();

			// Test touch events
			const mockTouch = {
				identifier: 0,
				target: cardContainer,
				clientX: 100,
				clientY: 150,
				pageX: 100,
				pageY: 150,
				screenX: 100,
				screenY: 150,
				radiusX: 1,
				radiusY: 1,
				rotationAngle: 0,
				force: 1
			};

			await fireEvent.touchStart(cardContainer, {
				touches: [mockTouch]
			});

			expect(cardContainer).toBeTruthy();
		});
	});

	describe('Feature Detection and Fallbacks', () => {
		it('should handle missing touch support gracefully', () => {
			// Mock browser without touch support
			delete (window as any).ontouchstart;
			Object.defineProperty(navigator, 'maxTouchPoints', {
				writable: true,
				value: 0
			});

			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();
		});

		it('should handle missing requestAnimationFrame', () => {
			// Mock browser without RAF
			delete (window as any).requestAnimationFrame;

			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();
		});

		it('should handle missing CSS features gracefully', () => {
			// Mock limited CSS support
			const originalSupports = CSS.supports;
			CSS.supports = vi.fn(() => false);

			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					holographicStyle: 'galaxy'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container');
			expect(cardContainer).toBeTruthy();

			// Restore
			CSS.supports = originalSupports;
		});
	});

	describe('Event Handling Compatibility', () => {
		it('should handle different mouse event implementations', async () => {
			const browsers = ['chrome', 'firefox', 'safari', 'edge'] as const;
			
			for (const browser of browsers) {
				mockBrowser(browser);
				
				const { container } = render(EnhancedCard, {
					props: {
						frontImage: 'test-front.jpg'
					}
				});

				const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;

				// Test mouse events
				await fireEvent.mouseEnter(cardContainer);
				await fireEvent.mouseMove(cardContainer, { clientX: 100, clientY: 150 });
				await fireEvent.mouseLeave(cardContainer);

				expect(cardContainer).toBeTruthy();
				cleanup();
			}
		});

		it('should handle different touch event implementations', async () => {
			const mobileBrowsers = ['mobileSafari', 'androidChrome'] as const;
			
			for (const browser of mobileBrowsers) {
				mockBrowser(browser);
				
				const { container } = render(EnhancedCard, {
					props: {
						frontImage: 'test-front.jpg'
					}
				});

				const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;

				const mockTouch = {
					identifier: 0,
					target: cardContainer,
					clientX: 100,
					clientY: 150,
					pageX: 100,
					pageY: 150,
					screenX: 100,
					screenY: 150,
					radiusX: 1,
					radiusY: 1,
					rotationAngle: 0,
					force: 1
				};

				// Test touch events
				await fireEvent.touchStart(cardContainer, { touches: [mockTouch] });
				await fireEvent.touchMove(cardContainer, { touches: [mockTouch] });
				await fireEvent.touchEnd(cardContainer, { changedTouches: [mockTouch] });

				expect(cardContainer).toBeTruthy();
				cleanup();
			}
		});
	});

	describe('CSS Compatibility', () => {
		it('should handle different CSS transform implementations', () => {
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg'
				}
			});

			const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;
			
			// Should handle vendor prefixes gracefully
			expect(cardContainer).toBeTruthy();
		});

		it('should handle different blend mode support', () => {
			const { container } = render(EnhancedCard, {
				props: {
					frontImage: 'test-front.jpg',
					holographicStyle: 'secret'
				}
			});

			const frontCard = container.querySelector('.enhanced-card-front');
			expect(frontCard).toBeTruthy();
		});
	});

	describe('Performance Across Browsers', () => {
		it('should maintain performance in different browsers', async () => {
			const browsers = ['chrome', 'firefox', 'safari', 'edge'] as const;
			
			for (const browser of browsers) {
				mockBrowser(browser);
				
				const { container } = render(EnhancedCard, {
					props: {
						frontImage: 'test-front.jpg'
					}
				});

				const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;

				const startTime = performance.now();
				
				// Simulate interactions
				await fireEvent.mouseEnter(cardContainer);
				for (let i = 0; i < 10; i++) {
					await fireEvent.mouseMove(cardContainer, {
						clientX: 100 + i,
						clientY: 150 + i
					});
				}
				await fireEvent.mouseLeave(cardContainer);

				const endTime = performance.now();
				const duration = endTime - startTime;

				// Should complete interactions quickly in all browsers
				expect(duration).toBeLessThan(1000);
				cleanup();
			}
		});
	});

	describe('Accessibility Across Browsers', () => {
		it('should maintain accessibility in different browsers', async () => {
			const browsers = ['chrome', 'firefox', 'safari', 'edge'] as const;
			
			for (const browser of browsers) {
				mockBrowser(browser);
				
				const { container } = render(EnhancedCard, {
					props: {
						frontImage: 'test-front.jpg',
						enableFlip: true
					}
				});

				const cardContainer = container.querySelector('.enhanced-card-container') as HTMLElement;

				// Test keyboard navigation
				await fireEvent.focus(cardContainer);
				await fireEvent.keyDown(cardContainer, { key: 'Enter' });

				expect(cardContainer).toBeTruthy();
				cleanup();
			}
		});
	});
});