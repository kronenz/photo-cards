/**
 * Integration Test Setup
 * Task 12 Implementation - 통합 테스트 작성
 * 
 * Additional setup specifically for integration tests:
 * - Extended browser API mocks
 * - Performance monitoring utilities
 * - Cross-browser compatibility helpers
 * - Mobile device simulation
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Performance monitoring utilities
const performanceMetrics = {
  startTime: 0,
  endTime: 0,
  interactions: 0,
  errors: 0
};

// Browser compatibility detection
const browserFeatures = {
  touchSupport: false,
  animationSupport: false,
  blendModeSupport: false,
  transform3dSupport: false
};

// Mobile device simulation state
let currentDeviceType: 'desktop' | 'phone' | 'tablet' | 'touch-laptop' = 'desktop';

// Extended browser API mocks for integration tests
beforeAll(() => {
  console.log('🔧 Setting up integration test environment...');
  
  // Enhanced CSS.supports mock with comprehensive feature detection
  Object.defineProperty(window, 'CSS', {
    value: {
      supports: vi.fn((property: string, value?: string) => {
        const supportMatrix: Record<string, boolean | Record<string, boolean>> = {
          'transform': true,
          'transform-style': {
            'preserve-3d': browserFeatures.transform3dSupport
          },
          'perspective': browserFeatures.transform3dSupport,
          'animation': browserFeatures.animationSupport,
          'will-change': true,
          'filter': true,
          'backdrop-filter': false, // Limited support
          'mix-blend-mode': browserFeatures.blendModeSupport ? {
            'normal': true,
            'overlay': true,
            'soft-light': true,
            'color-dodge': browserFeatures.blendModeSupport,
            'plus-lighter': false
          } : false,
          // Vendor prefixes
          '-webkit-transform': true,
          '-webkit-filter': true,
          '-webkit-backdrop-filter': true,
          '-moz-transform': true,
          '-ms-transform': true
        };

        if (value) {
          const propertySupport = supportMatrix[property];
          if (typeof propertySupport === 'object') {
            return propertySupport[value] ?? false;
          }
          return propertySupport ?? false;
        }

        return supportMatrix[property] ?? false;
      })
    },
    configurable: true
  });

  // Enhanced Performance API mock
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => {
        return Date.now() + Math.random() * 16.67; // Simulate frame timing
      }),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      timing: {
        navigationStart: Date.now() - 1000,
        loadEventEnd: Date.now() - 500
      }
    },
    configurable: true
  });

  // Enhanced RequestAnimationFrame mock with frame timing
  let frameId = 0;
  global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    frameId++;
    setTimeout(() => {
      callback(performance.now());
    }, 16.67); // 60fps
    return frameId;
  });

  global.cancelAnimationFrame = vi.fn((id: number) => {
    // Mock implementation
  });

  // Enhanced Navigator mock for device detection
  Object.defineProperty(navigator, 'userAgent', {
    get: () => {
      const userAgents = {
        desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        phone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        tablet: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        'touch-laptop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Touch) AppleWebKit/537.36'
      };
      return userAgents[currentDeviceType];
    },
    configurable: true
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    get: () => {
      const touchPoints = {
        desktop: 0,
        phone: 5,
        tablet: 10,
        'touch-laptop': 10
      };
      return touchPoints[currentDeviceType];
    },
    configurable: true
  });

  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => {
      const memory = {
        desktop: 8,
        phone: 2,
        tablet: 4,
        'touch-laptop': 8
      };
      return memory[currentDeviceType];
    },
    configurable: true
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => {
      const cores = {
        desktop: 8,
        phone: 4,
        tablet: 6,
        'touch-laptop': 8
      };
      return cores[currentDeviceType];
    },
    configurable: true
  });

  // Vibration API mock
  Object.defineProperty(navigator, 'vibrate', {
    value: vi.fn((pattern: number | number[]) => {
      return currentDeviceType === 'phone' || currentDeviceType === 'tablet';
    }),
    configurable: true
  });

  // Enhanced Touch Event mock
  global.TouchEvent = class TouchEvent extends Event {
    touches: TouchList;
    changedTouches: TouchList;
    targetTouches: TouchList;
    
    constructor(type: string, eventInitDict?: TouchEventInit) {
      super(type, eventInitDict);
      this.touches = (eventInitDict?.touches || []) as any;
      this.changedTouches = (eventInitDict?.changedTouches || []) as any;
      this.targetTouches = (eventInitDict?.targetTouches || []) as any;
    }
  } as any;

  // Pointer Event mock for unified input handling
  global.PointerEvent = class PointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    
    constructor(type: string, eventInitDict?: PointerEventInit) {
      super(type, eventInitDict);
      this.pointerId = eventInitDict?.pointerId || 1;
      this.pointerType = eventInitDict?.pointerType || 'mouse';
    }
  } as any;

  // Media Query mock for responsive testing
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    configurable: true
  });

  // Intersection Observer mock
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: []
  }));

  // Resize Observer mock
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));

  console.log('✅ Integration test environment ready');
});

beforeEach(() => {
  // Reset performance metrics
  performanceMetrics.startTime = performance.now();
  performanceMetrics.interactions = 0;
  performanceMetrics.errors = 0;

  // Reset browser features to defaults
  browserFeatures.touchSupport = currentDeviceType !== 'desktop';
  browserFeatures.animationSupport = true;
  browserFeatures.blendModeSupport = true;
  browserFeatures.transform3dSupport = true;

  // Clear DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Reset all mocks
  vi.clearAllMocks();
});

afterEach(() => {
  // Record performance metrics
  performanceMetrics.endTime = performance.now();
  const testDuration = performanceMetrics.endTime - performanceMetrics.startTime;

  // Log performance warnings if test is slow
  if (testDuration > 5000) {
    console.warn(`⚠️ Slow integration test: ${testDuration}ms`);
  }

  // Clean up any remaining timers
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

afterAll(() => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // Final cleanup
  vi.restoreAllMocks();
  
  console.log('✅ Integration test cleanup complete');
});

// Utility functions for integration tests
export const integrationTestUtils = {
  // Device simulation
  simulateDevice: (deviceType: typeof currentDeviceType) => {
    currentDeviceType = deviceType;
  },

  // Browser feature simulation
  setBrowserFeatures: (features: Partial<typeof browserFeatures>) => {
    Object.assign(browserFeatures, features);
  },

  // Performance monitoring
  startPerformanceMonitoring: () => {
    performanceMetrics.startTime = performance.now();
    performanceMetrics.interactions = 0;
    performanceMetrics.errors = 0;
  },

  recordInteraction: () => {
    performanceMetrics.interactions++;
  },

  recordError: () => {
    performanceMetrics.errors++;
  },

  getPerformanceMetrics: () => ({ ...performanceMetrics }),

  // Touch event creation
  createTouch: (id: number, x: number, y: number, target: Element): Touch => ({
    identifier: id,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    target,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  } as Touch),

  // Animation frame utilities
  waitForAnimationFrame: (): Promise<void> => {
    return new Promise(resolve => {
      requestAnimationFrame(() => resolve());
    });
  },

  waitForAnimationFrames: (count: number): Promise<void> => {
    return new Promise(resolve => {
      let remaining = count;
      const frame = () => {
        remaining--;
        if (remaining <= 0) {
          resolve();
        } else {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    });
  },

  // CSS feature testing
  testCSSFeature: (property: string, value?: string): boolean => {
    return window.CSS.supports(property, value);
  },

  // Viewport simulation
  setViewportSize: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      value: width,
      configurable: true
    });
    Object.defineProperty(window, 'innerHeight', {
      value: height,
      configurable: true
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  },

  // Media query simulation
  setMediaQuery: (query: string, matches: boolean) => {
    (window.matchMedia as any).mockImplementation((q: string) => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
};

// Export current state for test inspection
export const getTestEnvironmentState = () => ({
  currentDeviceType,
  browserFeatures: { ...browserFeatures },
  performanceMetrics: { ...performanceMetrics }
});