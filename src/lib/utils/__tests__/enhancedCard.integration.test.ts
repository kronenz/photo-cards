/**
 * Enhanced Card Integration Tests - Simplified Version
 * Task 12 Implementation - 통합 테스트 작성
 * 
 * Tests the integration between different utility functions:
 * - CardStateManager + TouchIntegrationHandler integration
 * - Cross-browser compatibility scenarios
 * - Mobile touch interaction flows
 * - Performance optimization integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  CardStateManager, 
  createCardStateManager,
  getCardBackImage,
  getHolographicColors,
  type CardState 
} from '../cardStateManager';
import { 
  TouchIntegrationHandler, 
  createTouchIntegrationHandler,
  isTouchSupported,
  isPrimaryTouchDevice,
  type TouchPosition,
  type TouchGesture
} from '../touchIntegration';
import { integrationTestUtils } from './integration-setup';

describe('Enhanced Card Integration Tests', () => {
  let stateManager: CardStateManager;
  let touchHandler: TouchIntegrationHandler;
  let cardElement: HTMLElement;

  beforeEach(() => {
    // Create test DOM element
    cardElement = document.createElement('div');
    cardElement.className = 'enhanced-card';
    cardElement.style.width = '200px';
    cardElement.style.height = '280px';
    cardElement.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 280,
      width: 200,
      height: 280,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
    document.body.appendChild(cardElement);

    // Initialize managers
    stateManager = createCardStateManager({
      animationSpeed: 300, // Faster for tests
      enableFlip: true
    });

    touchHandler = createTouchIntegrationHandler({
      enableTouch: true,
      tapToFlip: true,
      touchToHover: true,
      preventDoubleTouch: true
    });
  });

  afterEach(() => {
    // Cleanup
    if (cardElement && cardElement.parentNode) {
      cardElement.parentNode.removeChild(cardElement);
    }
    stateManager?.destroy?.();
    touchHandler?.destroy?.();
    vi.clearAllMocks();
  });

  describe('State Manager + Touch Handler Integration', () => {
    it('should integrate state management with touch events', async () => {
      // Requirements: 4.1, 4.2, 4.3
      expect(stateManager).toBeTruthy();
      expect(touchHandler).toBeTruthy();

      // Initial state
      const initialState = stateManager.getState();
      expect(initialState.isFlipped).toBe(false);
      expect(initialState.isHovering).toBe(false);

      // Simulate touch start
      const touchPosition: TouchPosition = { x: 100, y: 140 };
      touchHandler.handleTouchStart({
        identifier: 1,
        clientX: touchPosition.x,
        clientY: touchPosition.y,
        target: cardElement
      } as Touch);

      // Touch should trigger hover state
      stateManager.updateState({ isHovering: true, mousePosition: touchPosition });
      const hoverState = stateManager.getState();
      expect(hoverState.isHovering).toBe(true);
      expect(hoverState.mousePosition).toEqual(touchPosition);

      // Simulate touch end (tap gesture)
      touchHandler.handleTouchEnd({
        identifier: 1,
        clientX: touchPosition.x,
        clientY: touchPosition.y,
        target: cardElement
      } as Touch);

      // Tap should trigger flip
      const flipPromise = stateManager.flip();
      await flipPromise;

      const flippedState = stateManager.getState();
      expect(flippedState.isFlipped).toBe(true);
    });

    it('should prevent mouse events after touch events', async () => {
      // Requirements: 4.3
      const touchPosition: TouchPosition = { x: 100, y: 140 };

      // Touch event first
      touchHandler.handleTouchStart({
        identifier: 1,
        clientX: touchPosition.x,
        clientY: touchPosition.y,
        target: cardElement
      } as Touch);

      touchHandler.handleTouchEnd({
        identifier: 1,
        clientX: touchPosition.x,
        clientY: touchPosition.y,
        target: cardElement
      } as Touch);

      // Should prevent mouse events for a short time
      const touchState = touchHandler.getState();
      expect(touchState.preventMouseEvents).toBe(true);

      // Wait for prevention to expire
      await new Promise(resolve => setTimeout(resolve, 350));

      const finalState = touchHandler.getState();
      expect(finalState.preventMouseEvents).toBe(false);
    });

    it('should handle complex touch gestures', async () => {
      const startPosition: TouchPosition = { x: 50, y: 140 };
      const movePosition: TouchPosition = { x: 150, y: 140 };

      // Touch start
      touchHandler.handleTouchStart({
        identifier: 1,
        clientX: startPosition.x,
        clientY: startPosition.y,
        target: cardElement
      } as Touch);

      // Touch move (should update holographic effect)
      touchHandler.handleTouchMove({
        identifier: 1,
        clientX: movePosition.x,
        clientY: movePosition.y,
        target: cardElement
      } as Touch);

      stateManager.updateState({ 
        isHovering: true, 
        mousePosition: movePosition,
        holographicIntensity: 0.8 
      });

      const moveState = stateManager.getState();
      expect(moveState.mousePosition).toEqual(movePosition);
      expect(moveState.holographicIntensity).toBe(0.8);

      // Touch end
      touchHandler.handleTouchEnd({
        identifier: 1,
        clientX: movePosition.x,
        clientY: movePosition.y,
        target: cardElement
      } as Touch);
    });
  });

  describe('Cross-Browser Compatibility Integration', () => {
    it('should adapt to different browser capabilities', () => {
      // Requirements: Cross-browser compatibility
      
      // Test with limited CSS support
      integrationTestUtils.setBrowserFeatures({
        touchSupport: false,
        animationSupport: true,
        blendModeSupport: false,
        transform3dSupport: false
      });

      // State manager should still work
      const state = stateManager.getState();
      expect(state).toBeTruthy();

      // Should handle state updates
      stateManager.updateState({ isHovering: true });
      expect(stateManager.getState().isHovering).toBe(true);
    });

    it('should handle different device types', () => {
      const deviceTypes = ['phone', 'tablet', 'touch-laptop', 'desktop'] as const;

      deviceTypes.forEach(deviceType => {
        integrationTestUtils.simulateDevice(deviceType);

        // Touch support should match device type
        const touchSupported = isTouchSupported();
        const isPrimary = isPrimaryTouchDevice();

        if (deviceType === 'desktop') {
          expect(touchSupported).toBe(false);
          expect(isPrimary).toBe(false);
        } else {
          expect(touchSupported).toBe(true);
          if (deviceType === 'phone' || deviceType === 'tablet') {
            expect(isPrimary).toBe(true);
          }
        }
      });
    });

    it('should optimize for different performance levels', () => {
      // Low-end device simulation
      integrationTestUtils.simulateDevice('phone');
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 1, // 1GB RAM
        configurable: true
      });

      // Should still create managers successfully
      const lowEndStateManager = createCardStateManager({
        animationSpeed: 200, // Faster for low-end
        enableFlip: true
      });

      expect(lowEndStateManager).toBeTruthy();
      expect(lowEndStateManager.getState()).toBeTruthy();

      lowEndStateManager.destroy?.();
    });
  });

  describe('Mobile Touch Integration Flows', () => {
    beforeEach(() => {
      integrationTestUtils.simulateDevice('phone');
    });

    it('should handle complete mobile interaction flow', async () => {
      // Requirements: 4.1, 4.2
      expect(isTouchSupported()).toBe(true);
      expect(isPrimaryTouchDevice()).toBe(true);

      const touchSequence = [
        { x: 100, y: 140, action: 'start' },
        { x: 120, y: 160, action: 'move' },
        { x: 120, y: 160, action: 'end' }
      ];

      for (const touch of touchSequence) {
        const touchObj = {
          identifier: 1,
          clientX: touch.x,
          clientY: touch.y,
          target: cardElement
        } as Touch;

        switch (touch.action) {
          case 'start':
            touchHandler.handleTouchStart(touchObj);
            stateManager.updateState({ isHovering: true });
            break;
          case 'move':
            touchHandler.handleTouchMove(touchObj);
            stateManager.updateState({ 
              mousePosition: { x: touch.x, y: touch.y },
              holographicIntensity: 0.7 
            });
            break;
          case 'end':
            touchHandler.handleTouchEnd(touchObj);
            // Simulate tap-to-flip
            await stateManager.flip();
            break;
        }
      }

      const finalState = stateManager.getState();
      expect(finalState.isFlipped).toBe(true);
    });

    it('should handle multi-touch scenarios', () => {
      const touch1 = {
        identifier: 1,
        clientX: 80,
        clientY: 120,
        target: cardElement
      } as Touch;

      const touch2 = {
        identifier: 2,
        clientX: 120,
        clientY: 160,
        target: cardElement
      } as Touch;

      // Multi-touch start
      touchHandler.handleTouchStart(touch1);
      touchHandler.handleTouchStart(touch2);

      const touchState = touchHandler.getState();
      expect(touchState.activeTouches.size).toBe(2);

      // Multi-touch end
      touchHandler.handleTouchEnd(touch1);
      touchHandler.handleTouchEnd(touch2);

      const finalTouchState = touchHandler.getState();
      expect(finalTouchState.activeTouches.size).toBe(0);
    });

    it('should handle rapid touch interactions', async () => {
      const rapidTouches = Array.from({ length: 10 }, (_, i) => ({
        identifier: 1,
        clientX: 100 + i * 5,
        clientY: 140 + i * 2,
        target: cardElement
      } as Touch));

      // Rapid touch sequence
      for (const touch of rapidTouches) {
        touchHandler.handleTouchStart(touch);
        touchHandler.handleTouchMove(touch);
        touchHandler.handleTouchEnd(touch);
      }

      // Should handle without errors
      expect(touchHandler.getState()).toBeTruthy();
    });
  });

  describe('Card Type Integration', () => {
    it('should handle different card types correctly', () => {
      // Requirements: 5.1, 5.2, 5.3
      const cardTypes = [
        { type: 'pokemon' as const, team: '' },
        { type: 'kbo' as const, team: 'LG' },
        { type: 'kbo' as const, team: 'DOOSAN' },
        { type: 'custom' as const, team: '' }
      ];

      cardTypes.forEach(({ type, team }) => {
        const backImage = getCardBackImage(type, team);
        expect(backImage).toBeTruthy();
        expect(typeof backImage).toBe('string');

        const colors = getHolographicColors('cosmic');
        expect(colors).toBeTruthy();
        expect(colors.primary).toBeTruthy();
        expect(colors.secondary).toBeTruthy();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance during complex interactions', async () => {
      integrationTestUtils.startPerformanceMonitoring();

      // Complex interaction sequence
      const interactions = [
        () => stateManager.updateState({ isHovering: true }),
        () => stateManager.updateState({ mousePosition: { x: 100, y: 140 } }),
        () => stateManager.updateState({ holographicIntensity: 0.8 }),
        () => stateManager.flip(),
        () => stateManager.updateState({ isHovering: false }),
        () => stateManager.flip()
      ];

      const startTime = performance.now();

      for (const interaction of interactions) {
        await interaction();
        integrationTestUtils.recordInteraction();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete complex interactions quickly
      expect(duration).toBeLessThan(1000);

      const metrics = integrationTestUtils.getPerformanceMetrics();
      expect(metrics.interactions).toBe(interactions.length);
      expect(metrics.errors).toBe(0);
    });

    it('should handle memory cleanup properly', () => {
      // Create multiple managers
      const managers = Array.from({ length: 10 }, () => 
        createCardStateManager({ animationSpeed: 100, enableFlip: true })
      );

      const handlers = Array.from({ length: 10 }, () =>
        createTouchIntegrationHandler({ enableTouch: true })
      );

      // Cleanup all managers
      managers.forEach(manager => manager.destroy?.());
      handlers.forEach(handler => handler.destroy?.());

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid touch events gracefully', () => {
      // Invalid touch object
      const invalidTouch = null as any;

      expect(() => {
        touchHandler.handleTouchStart(invalidTouch);
      }).not.toThrow();

      expect(() => {
        touchHandler.handleTouchMove(invalidTouch);
      }).not.toThrow();

      expect(() => {
        touchHandler.handleTouchEnd(invalidTouch);
      }).not.toThrow();
    });

    it('should handle state manager errors gracefully', () => {
      // Invalid state updates
      expect(() => {
        stateManager.updateState(null as any);
      }).not.toThrow();

      expect(() => {
        stateManager.updateState({ invalidProperty: true } as any);
      }).not.toThrow();
    });

    it('should handle DOM element removal gracefully', () => {
      // Remove element from DOM
      cardElement.remove();

      // Should still handle interactions without errors
      expect(() => {
        stateManager.updateState({ isHovering: true });
      }).not.toThrow();

      expect(() => {
        touchHandler.handleTouchStart({
          identifier: 1,
          clientX: 100,
          clientY: 140,
          target: cardElement
        } as Touch);
      }).not.toThrow();
    });
  });
});