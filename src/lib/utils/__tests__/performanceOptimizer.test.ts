/**
 * Performance Optimizer Tests
 * Task 10 Implementation - 성능 최적화 및 브라우저 호환성 구현
 * 
 * Tests for performance optimization system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CardPerformanceOptimizer,
  detectEnhancedCapabilities,
  detectBrowserSupport,
  generatePerformanceConfig,
  generateCSSFallbacks
} from '../performanceOptimizer';
import {
  CardPerformanceManager,
  optimizeCard,
  unoptimizeCard,
  getPerformanceMetrics,
  initializeCardPerformance
} from '../cardPerformanceIntegration';

// Mock browser APIs
const mockCSS = {
  supports: vi.fn()
};

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceMemory: 8,
  hardwareConcurrency: 8
};

const mockMatchMedia = vi.fn();

// Setup global mocks
beforeEach(() => {
  global.CSS = mockCSS as any;
  global.navigator = mockNavigator as any;
  global.matchMedia = mockMatchMedia;
  
  // Default CSS.supports responses
  mockCSS.supports.mockImplementation((property: string, value: string) => {
    const supportMap: Record<string, boolean> = {
      'will-change': true,
      'transform': true,
      'translate3d(0,0,0)': true,
      'backface-visibility': true,
      'perspective': true,
      'mix-blend-mode': true,
      'overlay': true,
      'soft-light': true,
      'color-dodge': true,
      'transform-style': true,
      'preserve-3d': true
    };
    
    return supportMap[value] || supportMap[property] || false;
  });

  // Default matchMedia responses
  mockMatchMedia.mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? false : 
             query.includes('max-width: 768px') ? false : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Performance Optimizer', () => {
  describe('Device Capability Detection', () => {
    it('should detect enhanced capabilities correctly', () => {
      const capabilities = detectEnhancedCapabilities();
      
      expect(capabilities).toHaveProperty('supportsWillChange');
      expect(capabilities).toHaveProperty('supportsTransform3d');
      expect(capabilities).toHaveProperty('supportsBackfaceVisibility');
      expect(capabilities).toHaveProperty('supportsPerspective');
      expect(capabilities).toHaveProperty('deviceMemory');
      expect(capabilities).toHaveProperty('hardwareConcurrency');
    });

    it('should detect low-end devices correctly', () => {
      // Mock low-end device
      global.navigator = {
        ...mockNavigator,
        deviceMemory: 1,
        hardwareConcurrency: 2
      } as any;

      const capabilities = detectEnhancedCapabilities();
      expect(capabilities.isLowEndDevice).toBe(true);
    });

    it('should detect high-end devices correctly', () => {
      const capabilities = detectEnhancedCapabilities();
      expect(capabilities.isLowEndDevice).toBe(false);
      expect(capabilities.deviceMemory).toBe(8);
      expect(capabilities.hardwareConcurrency).toBe(8);
    });
  });

  describe('Browser Support Detection', () => {
    it('should detect browser support correctly', () => {
      const support = detectBrowserSupport();
      
      expect(support).toHaveProperty('supportsOverlay');
      expect(support).toHaveProperty('supportsSoftLight');
      expect(support).toHaveProperty('supportsColorDodge');
      expect(support).toHaveProperty('supportsTransformStyle');
      expect(support).toHaveProperty('supportsPerspective');
      expect(support).toHaveProperty('supportsBackfaceVisibility');
      expect(support).toHaveProperty('supportsWillChange');
    });

    it('should detect WebKit browsers', () => {
      global.navigator = {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      } as any;

      const support = detectBrowserSupport();
      expect(support.isWebKit).toBe(true);
      expect(support.isChromium).toBe(false);
      expect(support.isGecko).toBe(false);
    });

    it('should detect Chromium browsers', () => {
      global.navigator = {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      } as any;

      const support = detectBrowserSupport();
      expect(support.isChromium).toBe(true);
      expect(support.isWebKit).toBe(false);
      expect(support.isGecko).toBe(false);
    });

    it('should detect Firefox browsers', () => {
      global.navigator = {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      } as any;

      const support = detectBrowserSupport();
      expect(support.isGecko).toBe(true);
      expect(support.isWebKit).toBe(false);
      expect(support.isChromium).toBe(false);
    });
  });

  describe('Performance Configuration Generation', () => {
    it('should generate optimal config for high-end devices', () => {
      const capabilities = {
        isMobile: false,
        isReducedMotion: false,
        isLowEndDevice: false,
        deviceMemory: 8,
        hardwareConcurrency: 8,
        supportsWillChange: true,
        supportsTransform3d: true,
        supportsBackfaceVisibility: true,
        supportsPerspective: true,
        isHighContrast: false,
        supportsGPU: true
      };

      const browserSupport = {
        supportsOverlay: true,
        supportsSoftLight: true,
        supportsColorDodge: true,
        supportsTransformStyle: true,
        supportsPerspective: true,
        supportsBackfaceVisibility: true,
        supportsWillChange: true,
        isWebKit: false,
        isGecko: false,
        isChromium: true
      };

      const config = generatePerformanceConfig(capabilities, browserSupport);
      
      expect(config.enableWillChange).toBe(true);
      expect(config.useTransform3d).toBe(true);
      expect(config.enableGPUAcceleration).toBe(true);
      expect(config.maxAnimationLayers).toBe(6);
      expect(config.enableSparkles).toBe(true);
      expect(config.enableComplexEffects).toBe(true);
      expect(config.frameRateTarget).toBe(60);
    });

    it('should generate reduced config for low-end devices', () => {
      const capabilities = {
        isMobile: false,
        isReducedMotion: false,
        isLowEndDevice: true,
        deviceMemory: 2,
        hardwareConcurrency: 2,
        supportsWillChange: true,
        supportsTransform3d: true,
        supportsBackfaceVisibility: true,
        supportsPerspective: true,
        isHighContrast: false,
        supportsGPU: true
      };

      const browserSupport = {
        supportsOverlay: true,
        supportsSoftLight: true,
        supportsColorDodge: true,
        supportsTransformStyle: true,
        supportsPerspective: true,
        supportsBackfaceVisibility: true,
        supportsWillChange: true,
        isWebKit: false,
        isGecko: false,
        isChromium: true
      };

      const config = generatePerformanceConfig(capabilities, browserSupport);
      
      expect(config.maxAnimationLayers).toBe(3);
      expect(config.enableSparkles).toBe(false);
      expect(config.enableComplexEffects).toBe(false);
      expect(config.frameRateTarget).toBe(30);
    });

    it('should generate mobile-optimized config', () => {
      const capabilities = {
        isMobile: true,
        isReducedMotion: false,
        isLowEndDevice: false,
        deviceMemory: 4,
        hardwareConcurrency: 4,
        supportsWillChange: true,
        supportsTransform3d: true,
        supportsBackfaceVisibility: true,
        supportsPerspective: true,
        isHighContrast: false,
        supportsGPU: true
      };

      const browserSupport = {
        supportsOverlay: true,
        supportsSoftLight: true,
        supportsColorDodge: true,
        supportsTransformStyle: true,
        supportsPerspective: true,
        supportsBackfaceVisibility: true,
        supportsWillChange: true,
        isWebKit: false,
        isGecko: false,
        isChromium: true
      };

      const config = generatePerformanceConfig(capabilities, browserSupport);
      
      expect(config.maxAnimationLayers).toBeLessThanOrEqual(4);
      expect(config.animationDuration).toBeLessThanOrEqual(400);
      expect(config.frameRateTarget).toBeLessThanOrEqual(45);
    });

    it('should respect reduced motion preferences', () => {
      const capabilities = {
        isMobile: false,
        isReducedMotion: true,
        isLowEndDevice: false,
        deviceMemory: 8,
        hardwareConcurrency: 8,
        supportsWillChange: true,
        supportsTransform3d: true,
        supportsBackfaceVisibility: true,
        supportsPerspective: true,
        isHighContrast: false,
        supportsGPU: true
      };

      const browserSupport = {
        supportsOverlay: true,
        supportsSoftLight: true,
        supportsColorDodge: true,
        supportsTransformStyle: true,
        supportsPerspective: true,
        supportsBackfaceVisibility: true,
        supportsWillChange: true,
        isWebKit: false,
        isGecko: false,
        isChromium: true
      };

      const config = generatePerformanceConfig(capabilities, browserSupport);
      
      expect(config.animationDuration).toBe(200);
      expect(config.enableSparkles).toBe(false);
      expect(config.enableComplexEffects).toBe(false);
      expect(config.maxAnimationLayers).toBe(2);
    });
  });

  describe('CSS Fallback Generation', () => {
    it('should generate fallbacks for unsupported features', () => {
      const browserSupport = {
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

      const fallbacks = generateCSSFallbacks(browserSupport);
      
      expect(fallbacks).toContain('@supports not (transform-style: preserve-3d)');
      expect(fallbacks).toContain('@supports not (perspective: 1000px)');
      expect(fallbacks).toContain('@supports not (backface-visibility: hidden)');
      expect(fallbacks).toContain('@supports not (mix-blend-mode: overlay)');
      expect(fallbacks).toContain('@supports not (mix-blend-mode: soft-light)');
    });

    it('should not generate fallbacks for supported features', () => {
      const browserSupport = {
        supportsOverlay: true,
        supportsSoftLight: true,
        supportsColorDodge: true,
        supportsTransformStyle: true,
        supportsPerspective: true,
        supportsBackfaceVisibility: true,
        supportsWillChange: true,
        isWebKit: false,
        isGecko: false,
        isChromium: true
      };

      const fallbacks = generateCSSFallbacks(browserSupport);
      
      expect(fallbacks).toBe('');
    });
  });

  describe('CardPerformanceOptimizer', () => {
    let optimizer: CardPerformanceOptimizer;
    let element: HTMLElement;

    beforeEach(() => {
      optimizer = new CardPerformanceOptimizer();
      element = document.createElement('div');
      element.className = 'card-container';
      document.body.appendChild(element);
    });

    afterEach(() => {
      optimizer.destroy();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should optimize element correctly', () => {
      optimizer.optimizeElement(element);
      
      expect(element.style.willChange).toBe('transform, opacity, filter');
      expect(element.style.isolation).toBe('isolate');
    });

    it('should unoptimize element correctly', () => {
      optimizer.optimizeElement(element);
      optimizer.unoptimizeElement(element);
      
      expect(element.style.willChange).toBe('auto');
      expect(element.style.isolation).toBe('');
    });

    it('should track performance metrics', () => {
      const fps = optimizer.getFPS();
      expect(typeof fps).toBe('number');
      expect(fps).toBeGreaterThanOrEqual(0);
    });

    it('should provide performance configuration', () => {
      const config = optimizer.getConfig();
      
      expect(config).toHaveProperty('enableWillChange');
      expect(config).toHaveProperty('useTransform3d');
      expect(config).toHaveProperty('enableGPUAcceleration');
      expect(config).toHaveProperty('maxAnimationLayers');
      expect(config).toHaveProperty('frameRateTarget');
    });
  });

  describe('CardPerformanceManager', () => {
    let manager: CardPerformanceManager;
    let element: HTMLElement;

    beforeEach(() => {
      manager = new CardPerformanceManager();
      element = document.createElement('div');
      element.className = 'card-container';
      document.body.appendChild(element);
    });

    afterEach(() => {
      manager.destroy();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should optimize card correctly', () => {
      manager.optimizeCard(element);
      
      expect(element.getAttribute('data-performance-managed')).toBe('true');
      expect(element.hasAttribute('data-fps')).toBe(true);
    });

    it('should unoptimize card correctly', () => {
      manager.optimizeCard(element);
      manager.unoptimizeCard(element);
      
      expect(element.hasAttribute('data-performance-managed')).toBe(false);
      expect(element.hasAttribute('data-fps')).toBe(false);
    });

    it('should provide performance metrics', () => {
      const metrics = manager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('isPerformanceAcceptable');
      expect(metrics).toHaveProperty('config');
      expect(metrics).toHaveProperty('managedElementsCount');
    });

    it('should handle quality reduction', () => {
      manager.optimizeCard(element);
      manager.reduceQuality();
      
      expect(element.classList.contains('performance-reduced')).toBe(true);
    });

    it('should handle quality restoration', () => {
      manager.optimizeCard(element);
      manager.reduceQuality();
      manager.restoreQuality();
      
      expect(element.classList.contains('performance-optimal')).toBe(true);
      expect(element.classList.contains('performance-reduced')).toBe(false);
    });
  });

  describe('Integration Functions', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      element.className = 'card-container';
      document.body.appendChild(element);
    });

    afterEach(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should optimize card with utility function', () => {
      optimizeCard(element);
      
      expect(element.getAttribute('data-performance-managed')).toBe('true');
    });

    it('should unoptimize card with utility function', () => {
      optimizeCard(element);
      unoptimizeCard(element);
      
      expect(element.hasAttribute('data-performance-managed')).toBe(false);
    });

    it('should get performance metrics', () => {
      const metrics = getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('isPerformanceAcceptable');
    });

    it('should initialize container performance', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="card-container"></div>
        <div class="enhanced-card"></div>
      `;
      document.body.appendChild(container);

      const manager = initializeCardPerformance(container);
      
      const cards = container.querySelectorAll('.card-container, .enhanced-card');
      cards.forEach(card => {
        expect((card as HTMLElement).getAttribute('data-performance-managed')).toBe('true');
      });

      manager.destroy();
      document.body.removeChild(container);
    });
  });
});