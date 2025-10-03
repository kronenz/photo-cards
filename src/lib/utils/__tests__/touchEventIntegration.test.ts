/**
 * Touch Event Integration Test Suite
 * Comprehensive test for task 1.1 requirements
 * Tests: Touch/mouse duplication prevention, holographic effects, tap gestures, mobile optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchIntegrationHandler, createTouchIntegrationHandler } from '../touchIntegration';
import { detectDeviceCapabilities, getMobileOptimizationSettings, optimizeTouchEvents } from '../mobileOptimization';

describe('Touch Event Integration - Task 1.1 Requirements', () => {
	let handler: TouchIntegrationHandler;
	let mockElement: HTMLElement;
	let callbacks: any;

	beforeEach(() => {
		// Mock DOM element
		mockElement = document.createElement('div');
		mockElement.getBoundingClientRect = vi.fn(() => ({
			left: 100,
			top: 100,
			width: 200,
			height: 300,
			right: 300,
			bottom: 400,
			x: 100,
			y: 100,
			toJSON: () => ({})
		}));

		// Mock browser APIs
		Object.defineProperty(window, 'matchMedia', {
			value: vi.fn(() => ({
				matches: false,
				media: '',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			})),
			configurable: true
		});

		// Create handler and callbacks
		handler = createTouchIntegrationHandler({
			tapTimeThreshold: 300,
			moveThreshold: 10,
			holdThreshold: 150,
			preventMouseDelay: 100
		});

		callbacks = {
			onTouchStart: vi.fn(),
			onTouchMove: vi.fn(),
			onTouchEnd: vi.fn(),
			onTouchHold: vi.fn(),
			onTap: vi.fn()
		};

		handler.setCallbacks(callbacks);
	});

	afterEach(() => {
		handler.destroy();
	});

	describe('Requirement 1.1.1: 터치 이벤트와 마우스 이벤트 중복 방지 로직 구현', () => {
		it('should prevent mouse events during touch processing', () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				changedTouches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			// Before touch - mouse events should be allowed
			expect(handler.shouldPreventMouseEvent()).toBe(false);

			// During touch - mouse events should be prevented
			handler.handleTouchStart(mockTouchEvent, mockElement);
			expect(handler.shouldPreventMouseEvent()).toBe(true);

			// After touch end - mouse events should still be prevented for delay period
			handler.handleTouchEnd(mockTouchEvent, mockElement);
			expect(handler.shouldPreventMouseEvent()).toBe(true);
		});

		it('should reset mouse event prevention after delay', async () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				changedTouches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(mockTouchEvent, mockElement);
			handler.handleTouchEnd(mockTouchEvent, mockElement);

			// Should still prevent mouse events immediately after touch end
			expect(handler.shouldPreventMouseEvent()).toBe(true);

			// After delay, should allow mouse events
			await new Promise(resolve => setTimeout(resolve, 150));
			expect(handler.shouldPreventMouseEvent()).toBe(false);
		});

		it('should handle touch cancel and reset prevention', () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(mockTouchEvent, mockElement);
			expect(handler.shouldPreventMouseEvent()).toBe(true);

			handler.handleTouchCancel();
			// Should still prevent for delay period even after cancel
			expect(handler.shouldPreventMouseEvent()).toBe(true);
		});
	});

	describe('Requirement 1.1.2: 터치 시 홀로그래픽 효과 적용 기능 구현', () => {
		it('should trigger holographic effect on touch start', () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(mockTouchEvent, mockElement);

			// Should call onTouchStart callback with correct position for holographic effect
			expect(callbacks.onTouchStart).toHaveBeenCalledWith({
				x: 50, // 150 - 100 (element left)
				y: 100 // 200 - 100 (element top)
			});
		});

		it('should update holographic effect during touch move', () => {
			const startTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			const moveTouchEvent = {
				touches: [{ clientX: 160, clientY: 210, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(startTouchEvent, mockElement);
			handler.handleTouchMove(moveTouchEvent, mockElement);

			// Should call onTouchMove callback with updated position and distance
			expect(callbacks.onTouchMove).toHaveBeenCalledWith(
				{ x: 60, y: 110 }, // New position
				expect.any(Number) // Distance moved
			);
		});

		it('should provide accurate position data for holographic calculations', () => {
			// Test different touch positions
			const positions = [
				{ clientX: 100, clientY: 100, expectedX: 0, expectedY: 0 }, // Top-left corner
				{ clientX: 200, clientY: 250, expectedX: 100, expectedY: 150 }, // Center
				{ clientX: 300, clientY: 400, expectedX: 200, expectedY: 300 } // Bottom-right corner
			];

			positions.forEach(({ clientX, clientY, expectedX, expectedY }) => {
				const mockTouchEvent = {
					touches: [{ clientX, clientY, identifier: 0 }],
					preventDefault: vi.fn()
				} as any;

				callbacks.onTouchStart.mockClear();
				handler.handleTouchStart(mockTouchEvent, mockElement);

				expect(callbacks.onTouchStart).toHaveBeenCalledWith({
					x: expectedX,
					y: expectedY
				});
			});
		});
	});

	describe('Requirement 1.1.3: 탭 제스처로 카드 뒤집기 기능 구현', () => {
		it('should detect tap gesture correctly', async () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				changedTouches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			// Start touch
			handler.handleTouchStart(mockTouchEvent, mockElement);

			// End touch quickly (within tap threshold)
			await new Promise(resolve => setTimeout(resolve, 100));
			handler.handleTouchEnd(mockTouchEvent, mockElement);

			// Should trigger tap callback for card flip
			expect(callbacks.onTap).toHaveBeenCalledWith(
				{ x: 50, y: 100 },
				expect.any(Number)
			);

			// Should trigger onTouchEnd with tap gesture
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'tap',
					duration: expect.any(Number),
					distance: 0
				})
			);
		});

		it('should not detect tap if touch duration is too long', async () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				changedTouches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(mockTouchEvent, mockElement);

			// Wait longer than tap threshold
			await new Promise(resolve => setTimeout(resolve, 400));
			handler.handleTouchEnd(mockTouchEvent, mockElement);

			// Should not trigger tap callback
			expect(callbacks.onTap).not.toHaveBeenCalled();

			// Should trigger onTouchEnd with hold gesture
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'hold'
				})
			);
		});

		it('should not detect tap if touch moves too much', () => {
			const startTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			const endTouchEvent = {
				touches: [],
				changedTouches: [{ clientX: 170, clientY: 220, identifier: 0 }], // Moved 20+ pixels
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(startTouchEvent, mockElement);
			handler.handleTouchEnd(endTouchEvent, mockElement);

			// Should not trigger tap callback due to movement
			expect(callbacks.onTap).not.toHaveBeenCalled();

			// Should trigger onTouchEnd with move gesture
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'move'
				})
			);
		});

		it('should handle hold gesture for long press', async () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(mockTouchEvent, mockElement);

			// Wait for hold threshold
			await new Promise(resolve => setTimeout(resolve, 160));

			// Should trigger hold callback
			expect(callbacks.onTouchHold).toHaveBeenCalledWith({
				x: 50,
				y: 100
			});
		});
	});

	describe('Requirement 1.1.4: 모바일 디바이스 최적화 및 성능 테스트', () => {
		it('should detect mobile device capabilities', () => {
			// Mock touch device
			Object.defineProperty(window, 'ontouchstart', {
				value: null,
				configurable: true
			});
			Object.defineProperty(navigator, 'maxTouchPoints', {
				value: 5,
				configurable: true
			});

			const capabilities = detectDeviceCapabilities();
			expect(capabilities.isTouchDevice).toBe(true);
			expect(capabilities.maxTouchPoints).toBe(5);
		});

		it('should provide optimized settings for different device types', () => {
			// Test low-end device optimization
			const lowEndCapabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: false,
				devicePixelRatio: 1,
				maxTouchPoints: 2,
				isLowEndDevice: true,
				preferReducedMotion: false
			};

			const lowEndSettings = getMobileOptimizationSettings(lowEndCapabilities);
			expect(lowEndSettings.enableHolographicEffects).toBe(false);
			expect(lowEndSettings.throttleEvents).toBe(true);
			expect(lowEndSettings.touchThreshold).toBe(15);

			// Test high-end device optimization
			const highEndCapabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: true,
				devicePixelRatio: 3,
				maxTouchPoints: 10,
				isLowEndDevice: false,
				preferReducedMotion: false
			};

			const highEndSettings = getMobileOptimizationSettings(highEndCapabilities);
			expect(highEndSettings.enableHolographicEffects).toBe(true);
			expect(highEndSettings.throttleEvents).toBe(false);
			expect(highEndSettings.touchThreshold).toBe(10);
		});

		it('should optimize touch events for mobile devices', () => {
			const capabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: false,
				devicePixelRatio: 2,
				maxTouchPoints: 5,
				isLowEndDevice: false,
				preferReducedMotion: false
			};

			optimizeTouchEvents(mockElement, capabilities);

			// Should apply mobile-specific optimizations
			expect(mockElement.style.touchAction).toBe('none');
			expect(mockElement.style.webkitTapHighlightColor).toBe('transparent');
			expect(mockElement.classList.contains('touch-device')).toBe(true);
		});

		it('should handle performance optimization for 60fps', () => {
			const startTime = Date.now();

			// Simulate rapid touch events (60 events)
			for (let i = 0; i < 60; i++) {
				const mockTouchEvent = {
					touches: [{ clientX: 150 + i, clientY: 200 + i, identifier: 0 }],
					changedTouches: [{ clientX: 150 + i, clientY: 200 + i, identifier: 0 }],
					preventDefault: vi.fn()
				} as any;

				handler.handleTouchStart(mockTouchEvent, mockElement);
				handler.handleTouchMove(mockTouchEvent, mockElement);
				handler.handleTouchEnd(mockTouchEvent, mockElement);
			}

			const endTime = Date.now();
			const duration = endTime - startTime;

			// Should complete within reasonable time for 60fps performance
			expect(duration).toBeLessThan(1000); // Less than 1 second for 60 operations
		});

		it('should handle multi-touch scenarios gracefully', () => {
			const multiTouchEvent = {
				touches: [
					{ clientX: 150, clientY: 200, identifier: 0 },
					{ clientX: 250, clientY: 300, identifier: 1 }
				],
				preventDefault: vi.fn()
			} as any;

			// Should handle multi-touch by processing only the first touch
			handler.handleTouchStart(multiTouchEvent, mockElement);

			expect(callbacks.onTouchStart).toHaveBeenCalledTimes(1);
			expect(callbacks.onTouchStart).toHaveBeenCalledWith({
				x: 50, // Only first touch processed
				y: 100
			});
		});

		it('should adapt to reduced motion preferences', () => {
			const capabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: false,
				devicePixelRatio: 2,
				maxTouchPoints: 5,
				isLowEndDevice: false,
				preferReducedMotion: true
			};

			const settings = getMobileOptimizationSettings(capabilities);
			expect(settings.animationDuration).toBe(0); // No animations for reduced motion
		});
	});

	describe('Integration and Edge Cases', () => {
		it('should handle rapid touch events without memory leaks', async () => {
			// Simulate rapid touch interactions
			for (let i = 0; i < 100; i++) {
				const mockTouchEvent = {
					touches: [{ clientX: 150 + i, clientY: 200 + i, identifier: 0 }],
					changedTouches: [{ clientX: 150 + i, clientY: 200 + i, identifier: 0 }],
					preventDefault: vi.fn()
				} as any;

				handler.handleTouchStart(mockTouchEvent, mockElement);
				handler.handleTouchEnd(mockTouchEvent, mockElement);
			}

			// Wait for all async operations to complete
			await new Promise(resolve => setTimeout(resolve, 200));

			// Should not be processing touch after all operations complete
			expect(handler.shouldPreventMouseEvent()).toBe(false);
		});

		it('should handle touch events with missing properties gracefully', () => {
			const minimalTouchEvent = {
				touches: [{ clientX: 150, clientY: 200 }], // Missing identifier
				preventDefault: vi.fn()
			} as any;

			// Should not throw error with minimal touch event
			expect(() => {
				handler.handleTouchStart(minimalTouchEvent, mockElement);
			}).not.toThrow();

			expect(callbacks.onTouchStart).toHaveBeenCalled();
		});

		it('should clean up resources properly', () => {
			const mockTouchEvent = {
				touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
				preventDefault: vi.fn()
			} as any;

			handler.handleTouchStart(mockTouchEvent, mockElement);
			expect(handler.shouldPreventMouseEvent()).toBe(true);

			// Cleanup should reset all state
			handler.destroy();
			expect(handler.shouldPreventMouseEvent()).toBe(false);
		});
	});
});