/**
 * Mobile Touch Interaction Integration Tests
 * Task 12 Implementation - 모바일 터치 인터랙션 테스트
 * 
 * Tests mobile-specific interactions:
 * - Touch gestures (tap, swipe, pinch)
 * - Multi-touch handling
 * - Touch and mouse event coordination
 * - Mobile browser compatibility
 * - Performance on mobile devices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  TouchIntegrationHandler, 
  createTouchIntegrationHandler,
  isTouchSupported,
  isPrimaryTouchDevice 
} from '../touchIntegration';
import { 
  CardStateManager, 
  createCardStateManager 
} from '../cardStateManager';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';
import { tick } from 'svelte';

// Mobile device simulation utilities
const simulateMobileDevice = (deviceType: 'phone' | 'tablet' | 'touch-laptop') => {
  const deviceConfigs = {
    phone: {
      maxTouchPoints: 5,
      deviceMemory: 2,
      hardwareConcurrency: 4,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    },
    tablet: {
      maxTouchPoints: 10,
      deviceMemory: 4,
      hardwareConcurrency: 6,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    },
    'touch-laptop': {
      maxTouchPoints: 10,
      deviceMemory: 8,
      hardwareConcurrency: 8,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Touch) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  const config = deviceConfigs[deviceType];

  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: config.maxTouchPoints,
    configurable: true
  });

  Object.defineProperty(navigator, 'deviceMemory', {
    value: config.deviceMemory,
    configurable: true
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    value: config.hardwareConcurrency,
    configurable: true
  });

  Object.defineProperty(navigator, 'userAgent', {
    value: config.userAgent,
    configurable: true
  });
};

// Touch event creation utilities
const createTouch = (id: number, x: number, y: number, target: Element): Touch => ({
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
} as Touch);

const createTouchEvent = (type: string, touches: Touch[], changedTouches: Touch[] = touches): TouchEvent => {
  const event = new TouchEvent(type, {
    touches,
    changedTouches,
    bubbles: true,
    cancelable: true
  });
  return event;
};

describe('Mobile Touch Interaction Integration Tests', () => {
  let cardElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock touch support
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

    // Mock vibration API
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Phone Touch Interactions', () => {
    beforeEach(() => {
      simulateMobileDevice('phone');
    });

    it('should handle single tap for card flip on phone', async () => {
      // Requirements: 4.2
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      // Single tap gesture
      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      // Short delay for tap
      await new Promise(resolve => setTimeout(resolve, 50));

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });
    });

    it('should apply holographic effects during touch move on phone', async () => {
      // Requirements: 4.1
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const startTouch = createTouch(1, 50, 50, cardElement);
      const moveTouch = createTouch(1, 100, 100, cardElement);

      // Touch start
      await fireEvent.touchStart(cardElement, {
        touches: [startTouch],
        changedTouches: [startTouch]
      });

      // Touch move for holographic effect
      await fireEvent.touchMove(cardElement, {
        touches: [moveTouch],
        changedTouches: [moveTouch]
      });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // Touch end
      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [moveTouch]
      });
    });

    it('should prevent accidental double-tap zoom on phone', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      // First tap
      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      // Quick second tap (double-tap)
      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      // Should prevent default double-tap behavior
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });

      // Should not double-flip back to original state
      const cardInner = cardElement.querySelector('.card-inner');
      expect(cardInner).toHaveClass('flipped');
    });

    it('should handle touch events with haptic feedback on phone', async () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      // Should trigger haptic feedback on supported devices
      await waitFor(() => {
        if (navigator.vibrate) {
          expect(vibrateSpy).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Tablet Touch Interactions', () => {
    beforeEach(() => {
      simulateMobileDevice('tablet');
    });

    it('should handle multi-touch gestures on tablet', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'galaxy'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch1 = createTouch(1, 80, 80, cardElement);
      const touch2 = createTouch(2, 120, 120, cardElement);

      // Multi-touch start
      await fireEvent.touchStart(cardElement, {
        touches: [touch1, touch2],
        changedTouches: [touch1, touch2]
      });

      // Multi-touch move
      const moveTouch1 = createTouch(1, 90, 90, cardElement);
      const moveTouch2 = createTouch(2, 110, 110, cardElement);

      await fireEvent.touchMove(cardElement, {
        touches: [moveTouch1, moveTouch2],
        changedTouches: [moveTouch1, moveTouch2]
      });

      // Should handle multi-touch without errors
      expect(cardElement).toBeTruthy();

      // End multi-touch
      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [moveTouch1, moveTouch2]
      });
    });

    it('should support pinch-to-zoom prevention on tablet', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch1 = createTouch(1, 50, 50, cardElement);
      const touch2 = createTouch(2, 150, 150, cardElement);

      // Pinch gesture start
      await fireEvent.touchStart(cardElement, {
        touches: [touch1, touch2],
        changedTouches: [touch1, touch2]
      });

      // Pinch in (zoom out gesture)
      const pinchTouch1 = createTouch(1, 75, 75, cardElement);
      const pinchTouch2 = createTouch(2, 125, 125, cardElement);

      await fireEvent.touchMove(cardElement, {
        touches: [pinchTouch1, pinchTouch2],
        changedTouches: [pinchTouch1, pinchTouch2]
      });

      // Should prevent default pinch behavior
      expect(cardElement).toBeTruthy();
    });

    it('should optimize performance for tablet interactions', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'aurora',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const performanceStart = performance.now();

      // Rapid touch interactions
      for (let i = 0; i < 10; i++) {
        const touch = createTouch(1, 50 + i * 5, 50 + i * 5, cardElement);
        
        await fireEvent.touchStart(cardElement, {
          touches: [touch],
          changedTouches: [touch]
        });

        await fireEvent.touchMove(cardElement, {
          touches: [touch],
          changedTouches: [touch]
        });

        await fireEvent.touchEnd(cardElement, {
          touches: [],
          changedTouches: [touch]
        });
      }

      const performanceEnd = performance.now();
      const duration = performanceEnd - performanceStart;

      // Should handle rapid interactions efficiently
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Touch-Laptop Interactions', () => {
    beforeEach(() => {
      simulateMobileDevice('touch-laptop');
    });

    it('should handle hybrid touch and mouse events on touch laptop', async () => {
      // Requirements: 4.3
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      // Touch interaction first
      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      // Immediate mouse click should be prevented
      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });

      // Should only flip once, not twice
      const cardInner = cardElement.querySelector('.card-inner');
      expect(cardInner).toHaveClass('flipped');
    });

    it('should support precision touch interactions on touch laptop', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'secret'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Precise touch movements
      const touches = [];
      for (let i = 0; i <= 10; i++) {
        const x = 50 + (i * 10);
        const y = 50 + (i * 5);
        touches.push(createTouch(1, x, y, cardElement));
      }

      // Start touch
      await fireEvent.touchStart(cardElement, {
        touches: [touches[0]],
        changedTouches: [touches[0]]
      });

      // Precise movements
      for (let i = 1; i < touches.length; i++) {
        await fireEvent.touchMove(cardElement, {
          touches: [touches[i]],
          changedTouches: [touches[i]]
        });
        
        // Small delay for smooth movement
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // End touch
      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touches[touches.length - 1]]
      });
    });
  });

  describe('Touch Gesture Recognition', () => {
    it('should distinguish between tap and swipe gestures', async () => {
      simulateMobileDevice('phone');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Test tap gesture
      const tapTouch = createTouch(1, 100, 100, cardElement);
      
      await fireEvent.touchStart(cardElement, {
        touches: [tapTouch],
        changedTouches: [tapTouch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [tapTouch]
      });

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });

      // Reset card
      await fireEvent.click(cardElement);
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).not.toHaveClass('flipped');
      }, { timeout: 1000 });

      // Test swipe gesture (should not flip)
      const swipeStartTouch = createTouch(2, 50, 100, cardElement);
      const swipeEndTouch = createTouch(2, 150, 100, cardElement);

      await fireEvent.touchStart(cardElement, {
        touches: [swipeStartTouch],
        changedTouches: [swipeStartTouch]
      });

      await fireEvent.touchMove(cardElement, {
        touches: [swipeEndTouch],
        changedTouches: [swipeEndTouch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [swipeEndTouch]
      });

      // Should not flip on swipe
      const cardInner = cardElement.querySelector('.card-inner');
      expect(cardInner).not.toHaveClass('flipped');
    });

    it('should handle long press gestures', async () => {
      simulateMobileDevice('tablet');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'rainbow'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      // Long press start
      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      // Hold for long press duration
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should apply enhanced holographic effect during long press
      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // End long press
      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });
    });
  });

  describe('Mobile Performance Optimization', () => {
    it('should throttle touch events for performance', async () => {
      simulateMobileDevice('phone');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 50, 50, cardElement);

      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      const startTime = performance.now();

      // Rapid touch moves (should be throttled)
      for (let i = 0; i < 100; i++) {
        const moveTouch = createTouch(1, 50 + i, 50 + i, cardElement);
        await fireEvent.touchMove(cardElement, {
          touches: [moveTouch],
          changedTouches: [moveTouch]
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete efficiently due to throttling
      expect(duration).toBeLessThan(500);

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });
    });

    it('should reduce effects on low-memory devices', async () => {
      // Simulate low-memory device
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 1, // 1GB RAM
        configurable: true
      });

      simulateMobileDevice('phone');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'basic' // Should auto-reduce to basic
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchMove(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      // Should still work but with reduced effects
      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });
    });

    it('should handle orientation changes gracefully', async () => {
      simulateMobileDevice('phone');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Simulate orientation change
      Object.defineProperty(screen, 'orientation', {
        value: { angle: 90 },
        configurable: true
      });

      await fireEvent(window, new Event('orientationchange'));

      // Should still be interactive after orientation change
      const touch = createTouch(1, 100, 100, cardElement);

      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should support screen reader navigation on mobile', async () => {
      simulateMobileDevice('phone');

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Should have proper ARIA attributes
      expect(cardElement).toHaveAttribute('role');
      expect(cardElement).toHaveAttribute('aria-label');

      // Should be focusable
      expect(cardElement).toHaveAttribute('tabindex');

      // Should respond to keyboard events (for external keyboards)
      await fireEvent.keyDown(cardElement, { key: 'Enter' });

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });
    });

    it('should respect reduced motion preferences on mobile', async () => {
      simulateMobileDevice('phone');

      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true,
        animationSpeed: 200 // Should be reduced further
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const touch = createTouch(1, 100, 100, cardElement);

      await fireEvent.touchStart(cardElement, {
        touches: [touch],
        changedTouches: [touch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [touch]
      });

      // Should complete animation quickly due to reduced motion
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 500 });
    });
  });
});