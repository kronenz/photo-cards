/**
 * Holographic Card Engine - Core utilities and physics
 * Task 1.2 Implementation
 * 
 * Based on Pokemon Cards CSS holographic effects with enhanced browser compatibility
 * Implements blend mode fallbacks and isolation contexts for Edge/Firefox support
 */

export interface HolographicConfig {
	intensity: number;
	interactive: boolean;
	effect: HolographicEffect;
	reducedMotion: boolean;
	mobile: boolean;
	// Edge 호환성을 위한 추가 옵션
	useBlendFallback?: boolean;
	isolationContext?: boolean;
}

export type HolographicEffect = 
	| 'basic' 
	| 'cosmic' 
	| 'rainbow' 
	| 'aurora' 
	| 'neon' 
	| 'secret' 
	| 'galaxy' 
	| 'prism' 
	| 'reverse';

export interface PointerData {
	x: number;
	y: number;
	fromCenter: number;
	fromTop: number;
	fromLeft: number;
}

export interface TransformData {
	rotateX: number;
	rotateY: number;
	scale: number;
	translateX: number;
	translateY: number;
}

/**
 * Calculate pointer position and distance metrics
 */
export function calculatePointerData(
	clientX: number,
	clientY: number,
	rect: DOMRect
): PointerData {
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	// Calculate pointer position as percentage
	const x = ((clientX - rect.left) / rect.width) * 100;
	const y = ((clientY - rect.top) / rect.height) * 100;

	// Calculate distance from center (0 to 1)
	const deltaX = (clientX - centerX) / (rect.width / 2);
	const deltaY = (clientY - centerY) / (rect.height / 2);
	const fromCenter = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);

	return {
		x: Math.max(0, Math.min(100, x)),
		y: Math.max(0, Math.min(100, y)),
		fromCenter,
		fromTop: y / 100,
		fromLeft: x / 100
	};
}

/**
 * Calculate 3D transform values based on pointer position - Enhanced for realistic card physics
 */
export function calculateTransform(
	pointerData: PointerData,
	rect: DOMRect,
	config: HolographicConfig
): TransformData {
	// Convert pointer position back to delta values (-1 to 1)
	const deltaX = (pointerData.x - 50) / 50;
	const deltaY = (pointerData.y - 50) / 50;

	// Real card physics: stronger rotation based on distance from center
	const maxRotation = config.mobile ? 20 : 35; // Increased for more realistic effect
	
	// Enhanced rotation calculation for realistic card tilt
	// Cards naturally tilt more when mouse is further from center
	const distanceMultiplier = Math.pow(pointerData.fromCenter, 0.7); // Non-linear scaling
	const rotationIntensity = 0.8 + (distanceMultiplier * 0.4); // 0.8 to 1.2 range
	
	// Calculate rotations with realistic physics
	const rotateX = deltaY * -1 * maxRotation * rotationIntensity * config.intensity;
	const rotateY = deltaX * maxRotation * rotationIntensity * config.intensity;

	// Enhanced translation for realistic card lifting effect
	const maxTranslate = config.mobile ? 6 : 12; // Increased for more dramatic effect
	const translateX = deltaX * maxTranslate * config.intensity;
	const translateY = deltaY * maxTranslate * config.intensity;

	// Dynamic scale based on interaction intensity
	const baseScale = config.interactive ? 1.02 : 1;
	const scaleBoost = pointerData.fromCenter * 0.06; // Additional scale based on distance
	const scale = baseScale + scaleBoost;

	return {
		rotateX: config.reducedMotion ? 0 : rotateX,
		rotateY: config.reducedMotion ? 0 : rotateY,
		scale: config.reducedMotion ? 1 : scale,
		translateX: config.reducedMotion ? 0 : translateX,
		translateY: config.reducedMotion ? 0 : translateY
	};
}

/**
 * Calculate realistic card spin animation for Y-axis rotation
 */
export function calculateSpinPhysics(
	currentRotation: number,
	targetRotation: number,
	velocity: number,
	damping: number = 0.92
): { rotation: number; velocity: number; isComplete: boolean } {
	// Enhanced spin physics for more realistic deceleration
	const newVelocity = velocity * damping;
	const newRotation = currentRotation + newVelocity;
	
	// Consider spin complete when velocity is very low
	const isComplete = Math.abs(newVelocity) < 0.5;
	
	return {
		rotation: newRotation,
		velocity: newVelocity,
		isComplete
	};
}

/**
 * Get optimal spring configuration based on device and preferences
 */
export function getSpringConfig(mobile: boolean, reducedMotion: boolean) {
	if (reducedMotion) {
		return { stiffness: 1, damping: 1 };
	}
	
	if (mobile) {
		return { stiffness: 0.2, damping: 0.9 }; // Faster, less bouncy on mobile
	}
	
	return { stiffness: 0.1, damping: 0.8 }; // Smooth and bouncy on desktop
}

/**
 * Get effect-specific configuration
 */
export function getEffectConfig(effect: HolographicEffect): Partial<HolographicConfig> {
	const configs: Record<HolographicEffect, Partial<HolographicConfig>> = {
		basic: { intensity: 0.8 },
		cosmic: { intensity: 1.0 },
		rainbow: { intensity: 1.2 },
		aurora: { intensity: 0.9 },
		neon: { intensity: 1.3 },
		secret: { intensity: 1.1 },
		galaxy: { intensity: 1.0 },
		prism: { intensity: 1.2 },
		reverse: { intensity: 0.7 }
	};

	return configs[effect] || { intensity: 0.8 };
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
	private frameCount = 0;
	private lastTime = 0;
	private fps = 0;

	updateFPS() {
		const now = performance.now();
		this.frameCount++;
		
		if (now - this.lastTime >= 1000) {
			this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
			this.frameCount = 0;
			this.lastTime = now;
		}
		
		return this.fps;
	}

	getFPS() {
		return this.fps;
	}

	shouldReduceQuality() {
		return this.fps < 30; // Reduce quality if FPS drops below 30
	}
}

/**
 * Device capability detection
 */
export function detectDeviceCapabilities() {
	// Check if we're in browser environment
	if (typeof window === 'undefined') {
		return {
			isMobile: false,
			isReducedMotion: false,
			isHighContrast: false,
			supportsGPU: true,
			isLowEndDevice: false,
			deviceMemory: 4,
			hardwareConcurrency: 4
		};
	}

	try {
		const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
		const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
		const supportsGPU = !!window.CSS?.supports?.('transform', 'translateZ(0)');
		
		// Estimate device performance based on various factors
		const deviceMemory = (navigator as any).deviceMemory || 4;
		const hardwareConcurrency = navigator.hardwareConcurrency || 4;
		const isLowEndDevice = deviceMemory <= 2 || hardwareConcurrency <= 2;

		return {
			isMobile,
			isReducedMotion,
			isHighContrast,
			supportsGPU,
			isLowEndDevice,
			deviceMemory,
			hardwareConcurrency
		};
	} catch (error) {
		console.warn('Device capability detection failed:', error);
		return {
			isMobile: false,
			isReducedMotion: false,
			isHighContrast: false,
			supportsGPU: true,
			isLowEndDevice: false,
			deviceMemory: 4,
			hardwareConcurrency: 4
		};
	}
}

/**
 * Adaptive quality settings based on device capabilities
 */
export function getAdaptiveQuality() {
	const capabilities = detectDeviceCapabilities();
	
	if (capabilities.isLowEndDevice || capabilities.isMobile) {
		return {
			enableSparkles: false,
			enableComplexAnimations: false,
			maxLayers: 3,
			animationDuration: 6000, // Slower animations
			springStiffness: 0.3 // Less bouncy
		};
	}
	
	return {
		enableSparkles: true,
		enableComplexAnimations: true,
		maxLayers: 6,
		animationDuration: 3000,
		springStiffness: 0.1
	};
}

/**
 * CSS variable updater with batching for performance
 * Enhanced with blend mode compatibility checks
 */
export class CSSVariableUpdater {
	private element: HTMLElement;
	private pendingUpdates: Map<string, string> = new Map();
	private updateScheduled = false;
	private blendModeSupport: BlendModeSupport;

	constructor(element: HTMLElement) {
		this.element = element;
		this.blendModeSupport = detectBlendModeSupport();
		this.initializeBlendContext();
	}

	private initializeBlendContext() {
		// how2effect.md 가이드: 불투명한 배경 + isolation으로 블렌드 컨텍스트 보장
		if (!this.element.style.backgroundColor) {
			this.element.style.backgroundColor = '#000';
		}
		this.element.style.isolation = 'isolate';
	}

	set(property: string, value: string) {
		this.pendingUpdates.set(property, value);
		this.scheduleUpdate();
	}

	private scheduleUpdate() {
		if (this.updateScheduled) return;
		
		this.updateScheduled = true;
		requestAnimationFrame(() => {
			this.flushUpdates();
			this.updateScheduled = false;
		});
	}

	private flushUpdates() {
		for (const [property, value] of this.pendingUpdates) {
			this.element.style.setProperty(property, value);
		}
		this.pendingUpdates.clear();
	}

	getBlendModeSupport() {
		return this.blendModeSupport;
	}
}

/**
 * Blend mode support detection for Edge compatibility
 */
interface BlendModeSupport {
	colorDodge: boolean;
	plusLighter: boolean;
	screen: boolean;
	multiply: boolean;
}

export function detectBlendModeSupport(): BlendModeSupport {
	if (typeof window === 'undefined' || !window.CSS?.supports) {
		return {
			colorDodge: false,
			plusLighter: false,
			screen: true,
			multiply: true
		};
	}

	return {
		colorDodge: CSS.supports('mix-blend-mode', 'color-dodge'),
		plusLighter: CSS.supports('mix-blend-mode', 'plus-lighter'),
		screen: CSS.supports('mix-blend-mode', 'screen'),
		multiply: CSS.supports('mix-blend-mode', 'multiply')
	};
}

/**
 * Get optimal blend mode based on browser support
 */
export function getOptimalBlendMode(preferredMode: string = 'color-dodge'): string {
	const support = detectBlendModeSupport();
	
	switch (preferredMode) {
		case 'color-dodge':
			if (support.colorDodge) return 'color-dodge';
			if (support.plusLighter) return 'plus-lighter';
			return 'screen';
		
		case 'plus-lighter':
			if (support.plusLighter) return 'plus-lighter';
			if (support.colorDodge) return 'color-dodge';
			return 'screen';
		
		default:
			return support.screen ? 'screen' : 'normal';
	}
}

/**
 * Holographic effect presets
 */
export const HOLOGRAPHIC_PRESETS = {
	subtle: { intensity: 0.5, interactive: true },
	normal: { intensity: 0.8, interactive: true },
	dramatic: { intensity: 1.2, interactive: true },
	showcase: { intensity: 1.5, interactive: true },
	static: { intensity: 0.3, interactive: false }
} as const;

export type HolographicPreset = keyof typeof HOLOGRAPHIC_PRESETS;