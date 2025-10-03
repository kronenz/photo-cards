/**
 * Complete Touch Integration Test Suite
 * Tests all aspects of touch event integration for Enhanced Card
 * Requirements: 1.3 - Touch event integration with mouse event duplication prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchIntegrationHandler, createTouchIntegrationHandler, isTouchSupported, isPrimaryTouchDevice } from '../touchIntegration';
import type { TouchPosition, TouchGesture } from '../touchIntegration';

// Mock DOM elements and events
class MockTouchEvent extends Event {
	touches: Touch[];
	changedTouches: Touch[];
	
	constructor(type: string, touches: Touch[] = [], changedTouches: Touch[] = []) {
		super(type);
		this.touches = touches;
		this.changedTouches = changedTouches;
	}
}

class MockTouch implements Touch {
	identifier: number;
	target: EventTarget;
	screenX: number;
	screenY: number;
	clientX: number;
	clientY: number;
	pageX: number;
	pageY: number;
	radiusX: number;
	radiusY: number;
	rotationAngle: number;
	force: number;
	
	constructor(clientX: number, clientY: number, identifier = 0) {
		this.identifier = identifier;
		this.target = document.createElement('div');
		this.screenX = clientX;
		this.screenY = clientY;
		this.clientX = clientX;
		this.clientY = clientY;
		this.pageX = clientX;
		this.pageY = clientY;
		this.radiusX = 1;
		this.radiusY = 1;
		this.rotationAngle = 0;
		this.force = 1;
	}
}

describe('Touch Integration Complete Test Suite', () => {
	let handler: TouchIntegrationHandler;
	let mockElement: HTMLElement;
	let callbacks: {
		onTouchStart: vi.Mock;
		onTouchMove: vi.Mock;
		onTouchEnd: vi.Mock;
		onTouchHold: vi.Mock;
		onTap: vi.Mock;
	};

	beforeEach(() => {
		// Create mock element with getBoundingClientRect
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

		// Create handler with test configuration
		handler = createTouchIntegrationHandler({
			tapTimeThreshold: 300,
			moveThreshold: 10,
			holdThreshold: 150,
			preventMouseDelay: 100
		});

		// Setup callbacks
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

	describe('Touch Event Processing', () => {
		it('should handle touch start correctly', () => {
			const touch = new MockTouch(150, 200);
			const touchEvent = new MockTouchEvent('touchstart', [touch]);
			
			handler.handleTouchStart(touchEvent, mockElement);
			
			expect(callbacks.onTouchStart).toHaveBeenCalledWith({
				x: 50, // 150 - 100 (element left)
				y: 100 // 200 - 100 (element top)
			});
			
			expect(handler.shouldPreventMouseEvent()).toBe(true);
		});

		it('should handle touch move with holographic effect updates', () => {
			// Start touch
			const startTouch = new MockTouch(150, 200);
			const startEvent = new MockTouchEvent('touchstart', [startTouch]);
			handler.handleTouchStart(startEvent, mockElement);

			// Move touch
			const moveTouch = new MockTouch(160, 210);
			const moveEvent = new MockTouchEvent('touchmove', [moveTouch]);
			handler.handleTouchMove(moveEvent, mockElement);

			expect(callbacks.onTouchMove).toHaveBeenCalledWith(
				{ x: 60, y: 110 }, // New position
				expect.any(Number) // Distance
			);
		});

		it('should detect tap gesture correctly', async () => {
			const touch = new MockTouch(150, 200);
			
			// Start touch
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			handler.handleTouchStart(startEvent, mockElement);
			
			// End touch quickly (tap)
			await new Promise(resolve => setTimeout(resolve, 100)); // Less than tapTimeThreshold
			const endEvent = new MockTouchEvent('touchend', [], [touch]);
			handler.handleTouchEnd(endEvent, mockElement);

			expect(callbacks.onTap).toHaveBeenCalledWith(
				{ x: 50, y: 100 },
				expect.any(Number)
			);
			
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'tap',
					duration: expect.any(Number),
					distance: 0
				})
			);
		});

		it('should detect hold gesture correctly', async () => {
			const touch = new MockTouch(150, 200);
			
			// Start touch
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			handler.handleTouchStart(startEvent, mockElement);
			
			// Wait for hold threshold
			await new Promise(resolve => setTimeout(resolve, 160));
			
			expect(callbacks.onTouchHold).toHaveBeenCalledWith({
				x: 50,
				y: 100
			});
		});

		it('should prevent mouse events during touch processing', async () => {
			const touch = new MockTouch(150, 200);
			const touchEvent = new MockTouchEvent('touchstart', [touch]);
			
			// Start touch
			handler.handleTouchStart(touchEvent, mockElement);
			expect(handler.shouldPreventMouseEvent()).toBe(true);
			
			// End touch
			const endEvent = new MockTouchEvent('touchend', [], [touch]);
			handler.handleTouchEnd(endEvent, mockElement);
			
			// Should still prevent mouse events for delay period
			expect(handler.shouldPreventMouseEvent()).toBe(true);
			
			// After delay, should allow mouse events
			await new Promise(resolve => setTimeout(resolve, 110));
			expect(handler.shouldPreventMouseEvent()).toBe(false);
		});
	});

	describe('Mobile Device Optimization', () => {
		it('should handle multi-touch scenarios gracefully', () => {
			const touch1 = new MockTouch(150, 200, 1);
			const touch2 = new MockTouch(250, 300, 2);
			
			// Start with multiple touches - should only process first
			const startEvent = new MockTouchEvent('touchstart', [touch1, touch2]);
			handler.handleTouchStart(startEvent, mockElement);
			
			expect(callbacks.onTouchStart).toHaveBeenCalledTimes(1);
			expect(callbacks.onTouchStart).toHaveBeenCalledWith({
				x: 50, // Only first touch processed
				y: 100
			});
		});

		it('should handle touch cancel events', () => {
			const touch = new MockTouch(150, 200);
			
			// Start touch
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			handler.handleTouchStart(startEvent, mockElement);
			
			// Cancel touch
			handler.handleTouchCancel();
			
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'cancel'
				})
			);
		});

		it('should optimize performance for 60fps on mobile', () => {
			const startTime = performance.now();
			
			// Simulate rapid touch moves
			const touch = new MockTouch(150, 200);
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			handler.handleTouchStart(startEvent, mockElement);
			
			// Rapid moves (simulating 60fps)
			for (let i = 0; i < 60; i++) {
				const moveTouch = new MockTouch(150 + i, 200 + i);
				const moveEvent = new MockTouchEvent('touchmove', [moveTouch]);
				handler.handleTouchMove(moveEvent, mockElement);
			}
			
			const endTime = performance.now();
			const duration = endTime - startTime;
			
			// Should complete within reasonable time (less than 16ms for 60fps)
			expect(duration).toBeLessThan(100); // Generous threshold for test environment
		});
	});

	describe('Cross-browser Compatibility', () => {
		it('should work with different touch event implementations', () => {
			// Test with minimal touch event (some browsers)
			const minimalTouch = {
				clientX: 150,
				clientY: 200,
				identifier: 0
			} as Touch;
			
			const minimalEvent = {
				type: 'touchstart',
				touches: [minimalTouch],
				changedTouches: [],
				preventDefault: vi.fn()
			} as unknown as TouchEvent;
			
			expect(() => {
				handler.handleTouchStart(minimalEvent, mockElement);
			}).not.toThrow();
			
			expect(callbacks.onTouchStart).toHaveBeenCalled();
		});
	});

	describe('Utility Functions', () => {
		it('should detect touch support correctly', () => {
			// Mock touch support
			Object.defineProperty(window, 'ontouchstart', {
				value: null,
				configurable: true
			});
			
			expect(isTouchSupported()).toBe(true);
			
			// Mock no touch support
			delete (window as any).ontouchstart;
			Object.defineProperty(navigator, 'maxTouchPoints', {
				value: 0,
				configurable: true
			});
			
			expect(isTouchSupported()).toBe(false);
		});

		it('should detect primary touch devices correctly', () => {
			// Mock touch device
			Object.defineProperty(window, 'ontouchstart', {
				value: null,
				configurable: true
			});
			
			// Mock coarse pointer (touch)
			Object.defineProperty(window, 'matchMedia', {
				value: vi.fn(() => ({ matches: true })),
				configurable: true
			});
			
			expect(isPrimaryTouchDevice()).toBe(true);
		});
	});

	describe('Performance and Memory Management', () => {
		it('should clean up resources properly', () => {
			const touch = new MockTouch(150, 200);
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			
			handler.handleTouchStart(startEvent, mockElement);
			
			// Verify state before cleanup
			expect(handler.shouldPreventMouseEvent()).toBe(true);
			
			// Cleanup
			handler.destroy();
			
			// Verify cleanup
			expect(handler.shouldPreventMouseEvent()).toBe(false);
		});

		it('should handle rapid touch events without memory leaks', async () => {
			const initialState = handler.getState();
			
			// Simulate rapid touch events
			for (let i = 0; i < 100; i++) {
				const touch = new MockTouch(150 + i, 200 + i);
				const startEvent = new MockTouchEvent('touchstart', [touch]);
				const endEvent = new MockTouchEvent('touchend', [], [touch]);
				
				handler.handleTouchStart(startEvent, mockElement);
				handler.handleTouchEnd(endEvent, mockElement);
			}
			
			// Wait for all async operations to complete
			await new Promise(resolve => setTimeout(resolve, 150));
			
			// State should be reset after all operations complete
			const finalState = handler.getState();
			expect(finalState.isProcessingTouch).toBe(false);
		});
	});

	describe('Integration with Enhanced Card', () => {
		it('should provide correct position data for holographic effects', () => {
			const touch = new MockTouch(175, 250); // Center of mock element
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			
			handler.handleTouchStart(startEvent, mockElement);
			
			// Should provide normalized position for holographic calculations
			expect(callbacks.onTouchStart).toHaveBeenCalledWith({
				x: 75, // 175 - 100 (element left)
				y: 150 // 250 - 100 (element top)
			});
		});

		it('should support card flip on tap gesture', async () => {
			const touch = new MockTouch(150, 200);
			
			// Quick tap
			const startEvent = new MockTouchEvent('touchstart', [touch]);
			handler.handleTouchStart(startEvent, mockElement);
			
			// Wait for a short time (less than tap threshold)
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const endEvent = new MockTouchEvent('touchend', [], [touch]);
			handler.handleTouchEnd(endEvent, mockElement);
			
			// Should trigger tap callback for card flip
			expect(callbacks.onTap).toHaveBeenCalled();
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'tap'
				})
			);
		});
	});
});