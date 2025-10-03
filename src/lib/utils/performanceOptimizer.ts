/**
 * Performance Optimization System for Enhanced Card Interactions
 * Task 10 Implementation - 성능 최적화 및 브라우저 호환성 구현
 * 
 * Implements:
 * - Animation performance optimization (will-change, transform3d)
 * - Low-end device effect reduction
 * - Browser-specific CSS fallbacks
 * - Requirements: 4.1, 4.2, 4.3
 */

import { detectDeviceCapabilities, PerformanceMonitor } from '../holographic-engine';

export interface PerformanceConfig {
  enableWillChange: boolean;
  useTransform3d: boolean;
  enableGPUAcceleration: boolean;
  maxAnimationLayers: number;
  animationDuration: number;
  enableSparkles: boolean;
  enableComplexEffects: boolean;
  frameRateTarget: number;
  memoryThreshold: number;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  supportsGPU: boolean;
  isLowEndDevice: boolean;
  deviceMemory: number;
  hardwareConcurrency: number;
  supportsWillChange: boolean;
  supportsTransform3d: boolean;
  supportsBackfaceVisibility: boolean;
  supportsPerspective: boolean;
}

export interface BrowserSupport {
  supportsOverlay: boolean;
  supportsSoftLight: boolean;
  supportsColorDodge: boolean;
  supportsTransformStyle: boolean;
  supportsPerspective: boolean;
  supportsBackfaceVisibility: boolean;
  supportsWillChange: boolean;
  isWebKit: boolean;
  isGecko: boolean;
  isChromium: boolean;
}

/**
 * Enhanced device capability detection with performance metrics
 */
export function detectEnhancedCapabilities(): DeviceCapabilities {
  const baseCapabilities = detectDeviceCapabilities();
  
  if (typeof window === 'undefined') {
    return {
      ...baseCapabilities,
      supportsWillChange: true,
      supportsTransform3d: true,
      supportsBackfaceVisibility: true,
      supportsPerspective: true
    };
  }

  try {
    const supportsWillChange = CSS.supports('will-change', 'transform');
    const supportsTransform3d = CSS.supports('transform', 'translate3d(0,0,0)');
    const supportsBackfaceVisibility = CSS.supports('backface-visibility', 'hidden');
    const supportsPerspective = CSS.supports('perspective', '1000px');

    return {
      ...baseCapabilities,
      supportsWillChange,
      supportsTransform3d,
      supportsBackfaceVisibility,
      supportsPerspective
    };
  } catch (error) {
    console.warn('Enhanced capability detection failed:', error);
    return {
      ...baseCapabilities,
      supportsWillChange: false,
      supportsTransform3d: false,
      supportsBackfaceVisibility: false,
      supportsPerspective: false
    };
  }
}

/**
 * Browser support detection for CSS features
 */
export function detectBrowserSupport(): BrowserSupport {
  if (typeof window === 'undefined') {
    return {
      supportsOverlay: true,
      supportsSoftLight: true,
      supportsColorDodge: true,
      supportsTransformStyle: true,
      supportsPerspective: true,
      supportsBackfaceVisibility: true,
      supportsWillChange: true,
      isWebKit: false,
      isGecko: false,
      isChromium: false
    };
  }

  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const isWebKit = /webkit/.test(userAgent) && !/chrome/.test(userAgent);
    const isGecko = /gecko/.test(userAgent) && !/webkit/.test(userAgent);
    const isChromium = /chrome/.test(userAgent) || /chromium/.test(userAgent);

    return {
      supportsOverlay: CSS.supports('mix-blend-mode', 'overlay'),
      supportsSoftLight: CSS.supports('mix-blend-mode', 'soft-light'),
      supportsColorDodge: CSS.supports('mix-blend-mode', 'color-dodge'),
      supportsTransformStyle: CSS.supports('transform-style', 'preserve-3d'),
      supportsPerspective: CSS.supports('perspective', '1000px'),
      supportsBackfaceVisibility: CSS.supports('backface-visibility', 'hidden'),
      supportsWillChange: CSS.supports('will-change', 'transform'),
      isWebKit,
      isGecko,
      isChromium
    };
  } catch (error) {
    console.warn('Browser support detection failed:', error);
    return {
      supportsOverlay: false,
      supportsSoftLight: false,
      supportsColorDodge: false,
      supportsTransformStyle: false,
      supportsPerspective: false,
      supportsBackfaceVisibility: false,
      supportsWillChange: false,
      isWebKit: false,
      isGecko: false,
      isChromium: false
    };
  }
}

/**
 * Generate adaptive performance configuration based on device capabilities
 */
export function generatePerformanceConfig(
  capabilities: DeviceCapabilities,
  browserSupport: BrowserSupport
): PerformanceConfig {
  // Base configuration for high-end devices
  let config: PerformanceConfig = {
    enableWillChange: true,
    useTransform3d: true,
    enableGPUAcceleration: true,
    maxAnimationLayers: 6,
    animationDuration: 600,
    enableSparkles: true,
    enableComplexEffects: true,
    frameRateTarget: 60,
    memoryThreshold: 100
  };

  // Adjust for low-end devices
  if (capabilities.isLowEndDevice) {
    config = {
      ...config,
      maxAnimationLayers: 3,
      animationDuration: 400,
      enableSparkles: false,
      enableComplexEffects: false,
      frameRateTarget: 30,
      memoryThreshold: 50
    };
  }

  // Adjust for mobile devices
  if (capabilities.isMobile) {
    config = {
      ...config,
      maxAnimationLayers: Math.min(config.maxAnimationLayers, 4),
      animationDuration: Math.min(config.animationDuration, 400),
      frameRateTarget: Math.min(config.frameRateTarget, 45)
    };
  }

  // Adjust for reduced motion preference
  if (capabilities.isReducedMotion) {
    config = {
      ...config,
      animationDuration: 200,
      enableSparkles: false,
      enableComplexEffects: false,
      maxAnimationLayers: 2
    };
  }

  // Disable features based on browser support
  if (!browserSupport.supportsWillChange) {
    config.enableWillChange = false;
  }

  if (!capabilities.supportsTransform3d) {
    config.useTransform3d = false;
    config.enableGPUAcceleration = false;
  }

  return config;
}

/**
 * Performance optimizer class for managing card animations
 */
export class CardPerformanceOptimizer {
  private performanceMonitor: PerformanceMonitor;
  private capabilities: DeviceCapabilities;
  private browserSupport: BrowserSupport;
  private config: PerformanceConfig;
  private activeElements: Set<HTMLElement> = new Set();
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.capabilities = detectEnhancedCapabilities();
    this.browserSupport = detectBrowserSupport();
    this.config = generatePerformanceConfig(this.capabilities, this.browserSupport);
    
    this.startPerformanceMonitoring();
  }

  /**
   * Optimize element for card animations
   */
  optimizeElement(element: HTMLElement): void {
    this.activeElements.add(element);
    this.applyPerformanceOptimizations(element);
  }

  /**
   * Remove optimizations from element
   */
  unoptimizeElement(element: HTMLElement): void {
    this.activeElements.delete(element);
    this.removePerformanceOptimizations(element);
  }

  /**
   * Apply performance optimizations to element
   */
  private applyPerformanceOptimizations(element: HTMLElement): void {
    const style = element.style;

    // Apply will-change for GPU acceleration
    if (this.config.enableWillChange) {
      style.willChange = 'transform, opacity, filter';
    }

    // Apply transform3d for GPU layer creation
    if (this.config.useTransform3d) {
      style.transform = style.transform || 'translate3d(0,0,0)';
    }

    // Apply isolation for blend mode context
    style.isolation = 'isolate';

    // Apply backface-visibility for 3D optimizations
    if (this.capabilities.supportsBackfaceVisibility) {
      style.backfaceVisibility = 'hidden';
    }

    // Apply browser-specific optimizations
    this.applyBrowserSpecificOptimizations(element);
  }

  /**
   * Remove performance optimizations from element
   */
  private removePerformanceOptimizations(element: HTMLElement): void {
    const style = element.style;
    
    style.willChange = 'auto';
    style.isolation = '';
    style.backfaceVisibility = '';
    
    // Remove browser-specific optimizations
    this.removeBrowserSpecificOptimizations(element);
  }

  /**
   * Apply browser-specific optimizations
   */
  private applyBrowserSpecificOptimizations(element: HTMLElement): void {
    const style = element.style;

    if (this.browserSupport.isWebKit) {
      // WebKit-specific optimizations
      (style as any).webkitTransformStyle = 'preserve-3d';
      (style as any).webkitBackfaceVisibility = 'hidden';
    }

    if (this.browserSupport.isGecko) {
      // Firefox-specific optimizations
      style.transformStyle = 'preserve-3d';
      // Firefox performs better with explicit layer creation
      style.transform = style.transform || 'translateZ(0)';
    }

    if (this.browserSupport.isChromium) {
      // Chromium-specific optimizations
      style.transformStyle = 'preserve-3d';
      // Chromium benefits from explicit GPU layer hints
      (style as any).webkitTransform = style.transform || 'translateZ(0)';
    }
  }

  /**
   * Remove browser-specific optimizations
   */
  private removeBrowserSpecificOptimizations(element: HTMLElement): void {
    const style = element.style;

    (style as any).webkitTransformStyle = '';
    (style as any).webkitBackfaceVisibility = '';
    (style as any).webkitTransform = '';
    style.transformStyle = '';
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    const monitor = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (deltaTime >= 16.67) { // ~60fps
        this.frameCount++;
        this.lastFrameTime = currentTime;
        
        const fps = this.performanceMonitor.updateFPS();
        
        // Adjust quality based on performance
        if (fps < this.config.frameRateTarget * 0.8) {
          this.reduceQuality();
        } else if (fps > this.config.frameRateTarget * 0.95) {
          this.restoreQuality();
        }
      }
      
      this.animationFrameId = requestAnimationFrame(monitor);
    };
    
    this.animationFrameId = requestAnimationFrame(monitor);
  }

  /**
   * Reduce quality for better performance
   */
  private reduceQuality(): void {
    this.config = {
      ...this.config,
      maxAnimationLayers: Math.max(2, this.config.maxAnimationLayers - 1),
      enableSparkles: false,
      enableComplexEffects: false
    };

    // Apply reduced quality to active elements
    this.activeElements.forEach(element => {
      this.applyReducedQuality(element);
    });
  }

  /**
   * Restore quality when performance improves
   */
  private restoreQuality(): void {
    const originalConfig = generatePerformanceConfig(this.capabilities, this.browserSupport);
    
    this.config = {
      ...this.config,
      maxAnimationLayers: Math.min(originalConfig.maxAnimationLayers, this.config.maxAnimationLayers + 1),
      enableSparkles: originalConfig.enableSparkles,
      enableComplexEffects: originalConfig.enableComplexEffects
    };

    // Apply restored quality to active elements
    this.activeElements.forEach(element => {
      this.applyRestoredQuality(element);
    });
  }

  /**
   * Apply reduced quality settings to element
   */
  private applyReducedQuality(element: HTMLElement): void {
    const beforeElements = element.querySelectorAll(':before, :after');
    beforeElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        htmlEl.style.animationDuration = '6s';
        htmlEl.style.filter = 'brightness(0.9) contrast(1.05)';
      }
    });
  }

  /**
   * Apply restored quality settings to element
   */
  private applyRestoredQuality(element: HTMLElement): void {
    const beforeElements = element.querySelectorAll(':before, :after');
    beforeElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        htmlEl.style.animationDuration = '';
        htmlEl.style.filter = '';
      }
    });
  }

  /**
   * Get current performance configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.performanceMonitor.getFPS();
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    return this.performanceMonitor.getFPS() >= this.config.frameRateTarget * 0.8;
  }

  /**
   * Destroy optimizer and clean up resources
   */
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clean up all active elements
    this.activeElements.forEach(element => {
      this.unoptimizeElement(element);
    });
    
    this.activeElements.clear();
  }
}

/**
 * Global performance optimizer instance
 */
let globalOptimizer: CardPerformanceOptimizer | null = null;

/**
 * Get or create global performance optimizer
 */
export function getPerformanceOptimizer(): CardPerformanceOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new CardPerformanceOptimizer();
  }
  return globalOptimizer;
}

/**
 * Utility function to optimize a card element
 */
export function optimizeCardElement(element: HTMLElement): void {
  const optimizer = getPerformanceOptimizer();
  optimizer.optimizeElement(element);
}

/**
 * Utility function to unoptimize a card element
 */
export function unoptimizeCardElement(element: HTMLElement): void {
  const optimizer = getPerformanceOptimizer();
  optimizer.unoptimizeElement(element);
}

/**
 * Generate CSS fallback rules for unsupported features
 */
export function generateCSSFallbacks(browserSupport: BrowserSupport): string {
  let css = '';

  // 3D transform fallbacks
  if (!browserSupport.supportsTransformStyle) {
    css += `
      @supports not (transform-style: preserve-3d) {
        .card-inner {
          transform-style: flat;
        }
        .card-inner.flipped {
          transform: scaleX(-1);
        }
        .card-back {
          transform: scaleX(-1) rotateY(0deg);
          display: none;
        }
        .card-inner.flipped .card-back {
          display: flex;
        }
        .card-inner.flipped .enhanced-card {
          display: none;
        }
      }
    `;
  }

  // Perspective fallbacks
  if (!browserSupport.supportsPerspective) {
    css += `
      @supports not (perspective: 1000px) {
        .card-container {
          perspective: none;
        }
        .card-inner {
          transition: opacity 0.3s ease;
        }
        .card-inner.flipped {
          transform: none;
        }
      }
    `;
  }

  // Backface visibility fallbacks
  if (!browserSupport.supportsBackfaceVisibility) {
    css += `
      @supports not (backface-visibility: hidden) {
        .card-face {
          -webkit-backface-visibility: visible;
          backface-visibility: visible;
        }
        .card-inner.flipped .enhanced-card {
          opacity: 0;
          pointer-events: none;
        }
        .card-inner:not(.flipped) .card-back {
          opacity: 0;
          pointer-events: none;
        }
      }
    `;
  }

  // Blend mode fallbacks
  if (!browserSupport.supportsOverlay) {
    css += `
      @supports not (mix-blend-mode: overlay) {
        .enhanced-card:before,
        .card-back:before {
          mix-blend-mode: multiply;
          opacity: 0.3;
          filter: brightness(1.2) contrast(1.3);
        }
      }
    `;
  }

  if (!browserSupport.supportsSoftLight) {
    css += `
      @supports not (mix-blend-mode: soft-light) {
        .enhanced-card:after,
        .card-back:after {
          mix-blend-mode: screen;
          opacity: 0.5;
          filter: brightness(0.9) contrast(1.1);
        }
      }
    `;
  }

  // Final fallback for no blend mode support
  if (!browserSupport.supportsOverlay && !browserSupport.supportsSoftLight) {
    css += `
      @supports not (mix-blend-mode: screen) {
        .enhanced-card:before,
        .enhanced-card:after,
        .card-back:before,
        .card-back:after {
          mix-blend-mode: normal;
          opacity: 0.3;
          filter: saturate(150%) contrast(120%) brightness(110%) hue-rotate(var(--hue-shift, 0deg));
        }
      }
    `;
  }

  return css;
}