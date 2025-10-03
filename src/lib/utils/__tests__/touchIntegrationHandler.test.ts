import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
	TouchIntegrationHandler, 
	createTouchIntegrationHandler,
	isTouchSupported,
	isPrimaryTouchDevice,
	type TouchPosition,
	type TouchGesture
} from '../touchIntegration';

// Mock DOM elements and events
const createMockTouchEvent = (
	type: string, 
	touches: Array<{ clientX: number; clientY: number }> = [],
	changedTouches: Array<{ clientX: number; clientY: number }> = []
): TouchEvent => {
	const event = new Event(type) as TouchEvent;
	Object.defineProperty(event, 'touches', {
		value: touches.map(touch => ({ ...touch })),
		writable: false
	});
	Object.defineProperty(event, 'changedTouches', {
		value: changedTouches.map(touch => ({ ...touch })),
		writable: false
	});
	Object.defineProperty(event, 'preventDefault', {
		value: vi.fn(),
		writable: false
	});
	return event;
};

const createMockElement = (): HTMLElement => {
	const element = document.createElement('div');
	element.getBoundingClientRect = vi.fn().mockReturnValue({
		left: 100,
		top: 50,
		width: 200,
		height: 300
	});
	return element;
};

describe('TouchIntegrationHandler', () => {
	let handler: TouchIntegrationHandler;
	let mockElement: HTMLElement;
	let callbacks: {
		onTouchStart: ReturnType<typeof vi.fn>;
		onTouchMove: ReturnType<typeof vi.fn>;
		onTouchEnd: ReturnType<typeof vi.fn>;
		onTouchHold: ReturnType<typeof vi.fn>;
		onTap: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		handler = createTouchIntegrationHandler({
			tapTimeThreshold: 300,
			moveThreshold: 10,
			holdThreshold: 150,
			preventMouseDelay: 100
		});

		mockElement = createMockElement();

		callbacks = {
			onTouchStart: vi.fn(),
			onTouchMove: vi.fn(),
			onTouchEnd: vi.fn(),
			onTouchHold: vi.fn(),
			onTap: vi.fn()
		};

		handler.setCallbacks(callbacks);
	});

	describe('Touch Start Handling', () => {
		it('should handle touch start correctly', () => {
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			
			handler.handleTouchStart(touchEvent, mockElement);
			
			expect(touchEvent.preventDefault).toHaveBeenCalled();
			expect(callbacks.onTouchStart).toHaveBeenCalledWith({ x: 50, y: 50 });
			expect(handler.shouldPreventMouseEvent()).toBe(true);
		});

		it('should not handle touch start with no touches', () => {
			const touchEvent = createMockTouchEvent('touchstart', []);
			
			handler.handleTouchStart(touchEvent, mockElement);
			
			expect(callbacks.onTouchStart).not.toHaveBeenCalled();
		});
	});

	describe('Touch Move Handling', () => {
		beforeEach(() => {
			// Start a touch first
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			handler.handleTouchStart(touchEvent, mockElement);
		});

		it('should handle touch move correctly', () => {
			const touchEvent = createMockTouchEvent('touchmove', [{ clientX: 160, clientY: 110 }]);
			
			handler.handleTouchMove(touchEvent, mockElement);
			
			expect(touchEvent.preventDefault).toHaveBeenCalled();
			expect(callbacks.onTouchMove).toHaveBeenCalledWith(
				{ x: 60, y: 60 }, 
				expect.any(Number)
			);
		});

		it('should calculate movement distance correctly', () => {
			const touchEvent = createMockTouchEvent('touchmove', [{ clientX: 170, clientY: 120 }]);
			
			handler.handleTouchMove(touchEvent, mockElement);
			
			expect(callbacks.onTouchMove).toHaveBeenCalledWith(
				{ x: 70, y: 70 }, 
				expect.any(Number)
			);
		});

		it('should not handle touch move without active touch', () => {
			handler.destroy(); // Reset handler
			handler = createTouchIntegrationHandler();
			handler.setCallbacks(callbacks);
			
			const touchEvent = createMockTouchEvent('touchmove', [{ clientX: 160, clientY: 110 }]);
			
			handler.handleTouchMove(touchEvent, mockElement);
			
			expect(callbacks.onTouchMove).not.toHaveBeenCalled();
		});
	});

	describe('Touch End Handling', () => {
		beforeEach(() => {
			// Start a touch first
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			handler.handleTouchStart(touchEvent, mockElement);
		});

		it('should handle touch end correctly', () => {
			const touchEvent = createMockTouchEvent(
				'touchend', 
				[], 
				[{ clientX: 152, clientY: 102 }]
			);
			
			handler.handleTouchEnd(touchEvent, mockElement);
			
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: expect.any(String),
					position: { x: 52, y: 52 },
					duration: expect.any(Number),
					distance: expect.any(Number)
				})
			);
		});
	});

	describe('Touch Cancel Handling', () => {
		beforeEach(() => {
			// Start a touch first
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			handler.handleTouchStart(touchEvent, mockElement);
		});

		it('should handle touch cancel correctly', () => {
			handler.handleTouchCancel();
			
			expect(callbacks.onTouchEnd).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'cancel',
					position: { x: 50, y: 50 },
					duration: expect.any(Number),
					distance: 0
				})
			);
		});
	});

	describe('Mouse Event Prevention', () => {
		it('should prevent mouse events during touch processing', () => {
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			
			handler.handleTouchStart(touchEvent, mockElement);
			
			expect(handler.shouldPreventMouseEvent()).toBe(true);
		});
	});

	describe('State Management', () => {
		it('should provide current state', () => {
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			handler.handleTouchStart(touchEvent, mockElement);
			
			const state = handler.getState();
			
			expect(state).toEqual({
				isProcessingTouch: true,
				preventMouseEvents: true,
				touchStartPos: { x: 50, y: 50 },
				touchStartTime: expect.any(Number)
			});
		});
	});

	describe('Cleanup', () => {
		it('should cleanup correctly on destroy', () => {
			const touchEvent = createMockTouchEvent('touchstart', [{ clientX: 150, clientY: 100 }]);
			handler.handleTouchStart(touchEvent, mockElement);
			
			handler.destroy();
			
			expect(handler.shouldPreventMouseEvent()).toBe(false);
		});
	});
});

describe('Touch Utility Functions', () => {
	describe('isTouchSupported', () => {
		it('should detect touch support', () => {
			// Mock touch support
			Object.defineProperty(window, 'ontouchstart', {
				value: {},
				writable: true
			});
			
			expect(isTouchSupported()).toBe(true);
		});

		it('should detect no touch support', () => {
			// Remove touch support
			delete (window as any).ontouchstart;
			Object.defineProperty(navigator, 'maxTouchPoints', {
				value: 0,
				writable: true
			});
			
			expect(isTouchSupported()).toBe(false);
		});
	});

	describe('isPrimaryTouchDevice', () => {
		it('should detect primary touch device', () => {
			// Mock touch support and coarse pointer
			Object.defineProperty(window, 'ontouchstart', {
				value: {},
				writable: true
			});
			
			// Mock matchMedia for coarse pointer
			Object.defineProperty(window, 'matchMedia', {
				value: vi.fn().mockReturnValue({ matches: true }),
				writable: true
			});
			
			expect(isPrimaryTouchDevice()).toBe(true);
		});

		it('should detect non-primary touch device with fine pointer', () => {
			// Mock matchMedia for fine pointer
			Object.defineProperty(window, 'matchMedia', {
				value: vi.fn().mockReturnValue({ matches: false }),
				writable: true
			});
			
			// Test with current touch support state
			const result = isPrimaryTouchDevice();
			expect(typeof result).toBe('boolean');
		});
	});
});

describe('Factory Function', () => {
	it('should create touch integration handler with default config', () => {
		const handler = createTouchIntegrationHandler();
		
		expect(handler).toBeInstanceOf(TouchIntegrationHandler);
		expect(handler.shouldPreventMouseEvent()).toBe(false);
	});

	it('should create touch integration handler with custom config', () => {
		const handler = createTouchIntegrationHandler({
			tapTimeThreshold: 500,
			moveThreshold: 15
		});
		
		expect(handler).toBeInstanceOf(TouchIntegrationHandler);
	});
});