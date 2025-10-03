/**
 * Mobile Device Optimization Utilities
 * Optimizes touch interactions and performance for mobile devices
 * Requirements: 1.3 - Mobile device optimization and performance testing
 */

export interface DeviceCapabilities {
	isTouchDevice: boolean;
	isPrimaryTouch: boolean;
	supportsHover: boolean;
	devicePixelRatio: number;
	maxTouchPoints: number;
	isLowEndDevice: boolean;
	preferReducedMotion: boolean;
}

export interface PerformanceMetrics {
	fps: number;
	frameTime: number;
	memoryUsage?: number;
	touchLatency: number;
}

/**
 * Detect device capabilities for optimization
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	const isPrimaryTouch = isTouchDevice && (
		window.matchMedia('(pointer: coarse)').matches ||
		/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	);
	
	const supportsHover = window.matchMedia('(hover: hover)').matches;
	const devicePixelRatio = window.devicePixelRatio || 1;
	const maxTouchPoints = navigator.maxTouchPoints || 0;
	
	// Detect low-end devices based on various factors
	const isLowEndDevice = detectLowEndDevice();
	
	// Check for reduced motion preference
	const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	return {
		isTouchDevice,
		isPrimaryTouch,
		supportsHover,
		devicePixelRatio,
		maxTouchPoints,
		isLowEndDevice,
		preferReducedMotion
	};
}

/**
 * Detect low-end devices for performance optimization
 */
function detectLowEndDevice(): boolean {
	// Check for various indicators of low-end devices
	const hardwareConcurrency = navigator.hardwareConcurrency || 1;
	const deviceMemory = (navigator as any).deviceMemory || 1;
	const connection = (navigator as any).connection;
	
	// Low-end indicators
	const lowCpuCores = hardwareConcurrency <= 2;
	const lowMemory = deviceMemory <= 2;
	const slowConnection = connection && (
		connection.effectiveType === 'slow-2g' || 
		connection.effectiveType === '2g' ||
		connection.saveData === true
	);
	
	// User agent based detection for older devices
	const oldDevice = /Android [1-4]\.|iPhone OS [1-9]_|iPad.*OS [1-9]_/.test(navigator.userAgent);
	
	return lowCpuCores || lowMemory || slowConnection || oldDevice;
}

/**
 * Performance monitor for 60fps guarantee
 */
export class PerformanceMonitor {
	private frameCount = 0;
	private lastTime = 0;
	private fps = 60;
	private frameTime = 16.67;
	private touchStartTime = 0;
	private rafId: number | null = null;
	private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

	constructor() {
		this.startMonitoring();
	}

	/**
	 * Start performance monitoring
	 */
	private startMonitoring(): void {
		const monitor = (currentTime: number) => {
			if (this.lastTime > 0) {
				const deltaTime = currentTime - this.lastTime;
				this.frameTime = deltaTime;
				this.fps = 1000 / deltaTime;
				this.frameCount++;

				// Report metrics every 60 frames (1 second at 60fps)
				if (this.frameCount % 60 === 0) {
					this.reportMetrics();
				}
			}
			
			this.lastTime = currentTime;
			this.rafId = requestAnimationFrame(monitor);
		};

		this.rafId = requestAnimationFrame(monitor);
	}

	/**
	 * Record touch start for latency measurement
	 */
	recordTouchStart(): void {
		this.touchStartTime = performance.now();
	}

	/**
	 * Calculate touch latency
	 */
	calculateTouchLatency(): number {
		if (this.touchStartTime === 0) return 0;
		return performance.now() - this.touchStartTime;
	}

	/**
	 * Report current performance metrics
	 */
	private reportMetrics(): void {
		const metrics: PerformanceMetrics = {
			fps: Math.round(this.fps),
			frameTime: Math.round(this.frameTime * 100) / 100,
			touchLatency: this.calculateTouchLatency(),
			memoryUsage: this.getMemoryUsage()
		};

		this.callbacks.forEach(callback => callback(metrics));
	}

	/**
	 * Get memory usage if available
	 */
	private getMemoryUsage(): number | undefined {
		const memory = (performance as any).memory;
		if (memory) {
			return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100; // MB
		}
		return undefined;
	}

	/**
	 * Add performance callback
	 */
	onMetrics(callback: (metrics: PerformanceMetrics) => void): void {
		this.callbacks.push(callback);
	}

	/**
	 * Check if performance is acceptable (>= 50fps)
	 */
	isPerformanceAcceptable(): boolean {
		return this.fps >= 50;
	}

	/**
	 * Get performance grade
	 */
	getPerformanceGrade(): 'excellent' | 'good' | 'fair' | 'poor' {
		if (this.fps >= 58) return 'excellent';
		if (this.fps >= 50) return 'good';
		if (this.fps >= 30) return 'fair';
		return 'poor';
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
		}
		this.callbacks = [];
	}
}

/**
 * Mobile-specific touch optimization settings
 */
export function getMobileOptimizationSettings(capabilities: DeviceCapabilities) {
	const settings = {
		// Touch event settings
		touchThreshold: capabilities.isLowEndDevice ? 15 : 10, // Larger threshold for low-end devices
		tapTimeout: capabilities.isLowEndDevice ? 400 : 300, // Longer timeout for low-end devices
		holdTimeout: capabilities.isLowEndDevice ? 200 : 150, // Longer hold timeout
		
		// Animation settings
		animationDuration: capabilities.preferReducedMotion ? 0 : 
						  capabilities.isLowEndDevice ? 400 : 300, // Shorter animations for low-end
		enableHolographicEffects: !capabilities.isLowEndDevice, // Disable on low-end devices
		holographicIntensity: capabilities.isLowEndDevice ? 0.5 : 1.0, // Reduced intensity
		
		// Performance settings
		throttleEvents: capabilities.isLowEndDevice, // Throttle events on low-end devices
		eventThrottleMs: 16, // ~60fps
		usePassiveListeners: true, // Always use passive listeners for better performance
		
		// Visual settings
		enableShadows: !capabilities.isLowEndDevice, // Disable shadows on low-end
		enableBlur: !capabilities.isLowEndDevice, // Disable blur effects
		maxParticles: capabilities.isLowEndDevice ? 10 : 50, // Fewer particles
		
		// Memory management
		enableMemoryOptimization: capabilities.isLowEndDevice,
		gcInterval: capabilities.isLowEndDevice ? 5000 : 10000, // More frequent GC
	};

	return settings;
}

/**
 * Optimize touch event handling for mobile
 */
export function optimizeTouchEvents(element: HTMLElement, capabilities: DeviceCapabilities): void {
	const settings = getMobileOptimizationSettings(capabilities);
	
	// Set touch-action for better performance
	element.style.touchAction = 'none';
	
	// Optimize for touch devices
	if (capabilities.isPrimaryTouch) {
		// Disable hover effects on touch devices
		element.classList.add('touch-device');
		
		// Add touch-specific optimizations
		element.style.webkitTapHighlightColor = 'transparent';
		element.style.webkitTouchCallout = 'none';
		element.style.webkitUserSelect = 'none';
		element.style.userSelect = 'none';
	}
	
	// Optimize for high DPI displays
	if (capabilities.devicePixelRatio > 1) {
		element.style.imageRendering = 'crisp-edges';
	}
	
	// Apply low-end device optimizations
	if (capabilities.isLowEndDevice) {
		element.classList.add('low-end-device');
		
		// Disable expensive CSS properties
		element.style.willChange = 'transform'; // Only transform, not filter
		element.style.backfaceVisibility = 'hidden';
		
		// Reduce animation complexity
		if (capabilities.preferReducedMotion) {
			element.style.animation = 'none';
			element.style.transition = 'none';
		}
	}
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return function(this: any, ...args: Parameters<T>) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: number;
	return function(this: any, ...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => func.apply(this, args), delay);
	};
}

/**
 * Request idle callback polyfill for better performance
 */
export function requestIdleCallback(callback: () => void, timeout = 5000): number {
	if ('requestIdleCallback' in window) {
		return window.requestIdleCallback(callback, { timeout });
	} else {
		// Polyfill for browsers that don't support requestIdleCallback
		return window.setTimeout(callback, 1);
	}
}

/**
 * Memory management utilities
 */
export class MemoryManager {
	private static instance: MemoryManager;
	private cleanupTasks: (() => void)[] = [];
	private gcInterval: number | null = null;

	static getInstance(): MemoryManager {
		if (!MemoryManager.instance) {
			MemoryManager.instance = new MemoryManager();
		}
		return MemoryManager.instance;
	}

	/**
	 * Start automatic garbage collection
	 */
	startAutoGC(interval = 10000): void {
		if (this.gcInterval) {
			clearInterval(this.gcInterval);
		}

		this.gcInterval = window.setInterval(() => {
			this.runCleanup();
		}, interval);
	}

	/**
	 * Add cleanup task
	 */
	addCleanupTask(task: () => void): void {
		this.cleanupTasks.push(task);
	}

	/**
	 * Run cleanup tasks
	 */
	runCleanup(): void {
		this.cleanupTasks.forEach(task => {
			try {
				task();
			} catch (error) {
				console.warn('Cleanup task failed:', error);
			}
		});

		// Force garbage collection if available (development only)
		if (typeof window !== 'undefined' && (window as any).gc) {
			(window as any).gc();
		}
	}

	/**
	 * Stop automatic garbage collection
	 */
	stopAutoGC(): void {
		if (this.gcInterval) {
			clearInterval(this.gcInterval);
			this.gcInterval = null;
		}
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		this.stopAutoGC();
		this.cleanupTasks = [];
	}
}