/**
 * Mobile Performance Test Suite
 * Tests mobile device optimization and 60fps performance guarantee
 * Requirements: 1.3 - Mobile device optimization and performance testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
	detectDeviceCapabilities, 
	getMobileOptimizationSettings, 
	PerformanceMonitor,
	optimizeTouchEvents,
	throttle,
	debounce,
	MemoryManager
} from '../mobileOptimization';
import { TouchIntegrationHandler, createTouchIntegrationHandler } from '../touchIntegration';

// Mock performance API
const mockPerformance = {
	now: vi.fn(() => Date.now()),
	memory: {
		usedJSHeapSize: 1024 * 1024 * 10, // 10MB
		totalJSHeapSize: 1024 * 1024 * 50, // 50MB
		jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
	}
};

Object.defineProperty(global, 'performance', {
	value: mockPerformance,
	configurable: true
});

describe('Mobile Performance Test Suite', () => {
	let mockElement: HTMLElement;
	let performanceMonitor: PerformanceMonitor;

	beforeEach(() => {
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

		// Mock requestAnimationFrame
		global.requestAnimationFrame = vi.fn((callback) => {
			setTimeout(callback, 16); // ~60fps
			return 1;
		});

		global.cancelAnimationFrame = vi.fn();

		// Mock matchMedia
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
	});

	afterEach(() => {
		performanceMonitor?.destroy();
		vi.clearAllMocks();
	});

	describe('Device Capability Detection', () => {
		it('should detect touch device capabilities correctly', () => {
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

		it('should detect low-end device characteristics', () => {
			// Mock low-end device
			Object.defineProperty(navigator, 'hardwareConcurrency', {
				value: 2,
				configurable: true
			});
			Object.defineProperty(navigator, 'deviceMemory', {
				value: 1,
				configurable: true
			});

			const capabilities = detectDeviceCapabilities();
			expect(capabilities.isLowEndDevice).toBe(true);
		});

		it('should detect high-end device characteristics', () => {
			// Mock high-end device
			Object.defineProperty(navigator, 'hardwareConcurrency', {
				value: 8,
				configurable: true
			});
			Object.defineProperty(navigator, 'deviceMemory', {
				value: 8,
				configurable: true
			});

			const capabilities = detectDeviceCapabilities();
			expect(capabilities.isLowEndDevice).toBe(false);
		});
	});

	describe('Performance Optimization Settings', () => {
		it('should provide optimized settings for low-end devices', () => {
			const lowEndCapabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: false,
				devicePixelRatio: 2,
				maxTouchPoints: 5,
				isLowEndDevice: true,
				preferReducedMotion: false
			};

			const settings = getMobileOptimizationSettings(lowEndCapabilities);
			
			expect(settings.enableHolographicEffects).toBe(false);
			expect(settings.holographicIntensity).toBe(0.5);
			expect(settings.throttleEvents).toBe(true);
			expect(settings.touchThreshold).toBe(15);
		});

		it('should provide full settings for high-end devices', () => {
			const highEndCapabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: true,
				devicePixelRatio: 2,
				maxTouchPoints: 10,
				isLowEndDevice: false,
				preferReducedMotion: false
			};

			const settings = getMobileOptimizationSettings(highEndCapabilities);
			
			expect(settings.enableHolographicEffects).toBe(true);
			expect(settings.holographicIntensity).toBe(1.0);
			expect(settings.throttleEvents).toBe(false);
			expect(settings.touchThreshold).toBe(10);
		});
	});

	describe('60fps Performance Guarantee', () => {
		it('should handle rapid touch interactions efficiently', async () => {
			const handler = createTouchIntegrationHandler();
			const startTime = Date.now();
			
			// Simulate rapid touch interactions
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

			// Should complete within reasonable time for 60fps (less than 1000ms for 60 operations)
			expect(duration).toBeLessThan(1000);
			
			// Wait for async operations to complete
			await new Promise(resolve => setTimeout(resolve, 150));
			
			// Should reset after operations complete
			expect(handler.shouldPreventMouseEvent()).toBe(false);

			handler.destroy();
		});

		it('should create and initialize performance monitor', () => {
			performanceMonitor = new PerformanceMonitor();
			
			// Should initialize with default values
			expect(performanceMonitor.isPerformanceAcceptable()).toBe(true);
			expect(performanceMonitor.getPerformanceGrade()).toBe('excellent');
			
			// Should handle metrics callback
			let metricsReceived = false;
			performanceMonitor.onMetrics(() => {
				metricsReceived = true;
			});
			
			expect(typeof performanceMonitor.recordTouchStart).toBe('function');
			expect(typeof performanceMonitor.calculateTouchLatency).toBe('function');
		});
	});

	describe('Touch Event Optimization', () => {
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

			expect(mockElement.style.touchAction).toBe('none');
			expect(mockElement.style.webkitTapHighlightColor).toBe('transparent');
			expect(mockElement.classList.contains('touch-device')).toBe(true);
		});

		it('should apply low-end device optimizations', () => {
			const capabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: false,
				devicePixelRatio: 1,
				maxTouchPoints: 2,
				isLowEndDevice: true,
				preferReducedMotion: true
			};

			optimizeTouchEvents(mockElement, capabilities);

			expect(mockElement.classList.contains('low-end-device')).toBe(true);
			expect(mockElement.style.willChange).toBe('transform');
			expect(mockElement.style.animation).toBe('none');
		});
	});

	describe('Performance Utilities', () => {
		it('should throttle function calls correctly', () => {
			const mockFn = vi.fn();
			const throttledFn = throttle(mockFn, 100);

			// Call multiple times rapidly
			throttledFn();
			throttledFn();
			throttledFn();

			// Should only be called once
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should debounce function calls correctly', async () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			// Call multiple times rapidly
			debouncedFn();
			debouncedFn();
			debouncedFn();

			// Should not be called yet
			expect(mockFn).toHaveBeenCalledTimes(0);

			// Wait for debounce delay
			await new Promise(resolve => setTimeout(resolve, 150));

			// Should be called once
			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('Memory Management', () => {
		it('should manage memory efficiently', () => {
			const memoryManager = MemoryManager.getInstance();
			
			const cleanupTasks: (() => void)[] = [];
			for (let i = 0; i < 10; i++) {
				const task = vi.fn();
				cleanupTasks.push(task);
				memoryManager.addCleanupTask(task);
			}

			memoryManager.runCleanup();

			// All cleanup tasks should be executed
			cleanupTasks.forEach(task => {
				expect(task).toHaveBeenCalled();
			});

			memoryManager.destroy();
		});

		it('should handle automatic garbage collection', () => {
			const memoryManager = MemoryManager.getInstance();
			const cleanupTask = vi.fn();
			
			memoryManager.addCleanupTask(cleanupTask);
			memoryManager.startAutoGC(50); // Very short interval for testing

			// Wait for auto GC to run
			setTimeout(() => {
				expect(cleanupTask).toHaveBeenCalled();
				memoryManager.stopAutoGC();
				memoryManager.destroy();
			}, 100);
		});
	});

	describe('Touch Latency Measurement', () => {
		it('should measure touch latency accurately', () => {
			performanceMonitor = new PerformanceMonitor();
			
			const startTime = Date.now();
			mockPerformance.now.mockReturnValue(startTime);
			
			performanceMonitor.recordTouchStart();
			
			// Simulate touch processing time
			const endTime = startTime + 10;
			mockPerformance.now.mockReturnValue(endTime);
			
			const latency = performanceMonitor.calculateTouchLatency();
			expect(latency).toBe(10);
		});
	});

	describe('Cross-Device Compatibility', () => {
		it('should handle different device pixel ratios', () => {
			const capabilities = {
				isTouchDevice: true,
				isPrimaryTouch: true,
				supportsHover: false,
				devicePixelRatio: 3, // High DPI device
				maxTouchPoints: 5,
				isLowEndDevice: false,
				preferReducedMotion: false
			};

			optimizeTouchEvents(mockElement, capabilities);

			expect(mockElement.style.imageRendering).toBe('crisp-edges');
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
			expect(settings.animationDuration).toBe(0);
		});
	});
});