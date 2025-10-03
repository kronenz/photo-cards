/**
 * Basic Touch Integration Test
 * Tests core touch functionality for Enhanced Card
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchIntegrationHandler, createTouchIntegrationHandler, isTouchSupported } from '../touchIntegration';

describe('Touch Integration Basic Tests', () => {
	let handler: TouchIntegrationHandler;
	let mockElement: HTMLElement;
	let callbacks: any;

	beforeEach(() => {
		mockElement = document.createElement('div');
		mockElement.getBoundingClientRect = () => ({
			left: 100,
			top: 100,
			width: 200,
			height: 300,
			right: 300,
			bottom: 400,
			x: 100,
			y: 100,
			toJSON: () => ({})
		});

		handler = createTouchIntegrationHandler();
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

	it('should create handler successfully', () => {
		expect(handler).toBeDefined();
		expect(typeof handler.handleTouchStart).toBe('function');
		expect(typeof handler.handleTouchMove).toBe('function');
		expect(typeof handler.handleTouchEnd).toBe('function');
	});

	it('should detect touch support', () => {
		const isSupported = isTouchSupported();
		expect(typeof isSupported).toBe('boolean');
	});

	it('should handle basic touch events', () => {
		const mockTouch = {
			clientX: 150,
			clientY: 200,
			identifier: 0
		};

		const mockTouchEvent = {
			touches: [mockTouch],
			changedTouches: [mockTouch],
			preventDefault: vi.fn()
		} as any;

		// Test touch start
		handler.handleTouchStart(mockTouchEvent, mockElement);
		expect(callbacks.onTouchStart).toHaveBeenCalledWith({
			x: 50, // 150 - 100
			y: 100 // 200 - 100
		});

		// Test touch end
		handler.handleTouchEnd(mockTouchEvent, mockElement);
		expect(callbacks.onTouchEnd).toHaveBeenCalled();
	});

	it('should prevent mouse events during touch', () => {
		const mockTouchEvent = {
			touches: [{ clientX: 150, clientY: 200, identifier: 0 }],
			preventDefault: vi.fn()
		} as any;

		handler.handleTouchStart(mockTouchEvent, mockElement);
		expect(handler.shouldPreventMouseEvent()).toBe(true);
	});

	it('should handle touch move events', () => {
		const mockTouchEvent = {
			touches: [{ clientX: 160, clientY: 210, identifier: 0 }],
			preventDefault: vi.fn()
		} as any;

		handler.handleTouchStart(mockTouchEvent, mockElement);
		handler.handleTouchMove(mockTouchEvent, mockElement);
		
		expect(callbacks.onTouchMove).toHaveBeenCalled();
	});
});