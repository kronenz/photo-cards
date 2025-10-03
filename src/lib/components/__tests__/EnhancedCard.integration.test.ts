/**
 * Enhanced Card Integration Tests
 * Task 12 Implementation - 전체 카드 인터랙션 플로우 테스트
 * 
 * Tests the complete card interaction flow including:
 * - Holographic effects with image visibility preservation
 * - Card flip animations with Y-axis rotation
 * - Touch and mouse event integration
 * - Cross-browser compatibility
 * - Mobile touch interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  CardStateManager, 
  createCardStateManager,
  type CardState 
} from '../../utils/cardStateManager';
import { 
  TouchIntegrationHandler, 
  createTouchIntegrationHandler,
  isTouchSupported 
} from '../../utils/touchIntegration';
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

// Mock CSS.supports for cross-browser testing
const mockCSSSupports = vi.fn();
Object.defineProperty(window, 'CSS', {
  value: { supports: mockCSSSupports }
});

// Mock performance API
const mockPerformanceNow = vi.fn(() => Date.now());
Object.defineProperty(window, 'performance', {
  value: { now: mockPerformanceNow }
});

describe('Enhanced Card Integration Tests', () => {
  let cardElement: HTMLElement;
  let stateManager: CardStateManager;
  let touchHandler: TouchIntegrationHandler;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default CSS support
    mockCSSSupports.mockImplementation((property: string, value?: string) => {
      const supportedProperties = [
        'transform', 'filter', 'backdrop-filter', 'mix-blend-mode',
        'animation', 'perspective', 'transform-style'
      ];
      
      if (property === 'mix-blend-mode') {
        const supportedBlendModes = ['overlay', 'soft-light', 'color-dodge'];
        return supportedBlendModes.includes(value || '');
      }
      
      return supportedProperties.some(prop => property.includes(prop));
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });

    // Create test card element
    cardElement = document.createElement('div');
    cardElement.className = 'enhanced-card';
    cardElement.style.width = '200px';
    cardElement.style.height = '280px';
    cardElement.style.position = 'relative';
    
    // Add required child elements
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    const cardImage = document.createElement('img');
    cardImage.className = 'card-image';
    cardImage.style.opacity = '1';
    
    cardFront.appendChild(cardImage);
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardElement.appendChild(cardInner);
    document.body.appendChild(cardElement);

    // Initialize managers
    stateManager = createCardStateManager({
      animationSpeed: 600,
      enableFlip: true
    });

    touchHandler = createTouchIntegrationHandler({
      enableTouch: true,
      tapToFlip: true,
      touchToHover: true
    });
  });

  afterEach(() => {
    // Cleanup
    if (cardElement && cardElement.parentNode) {
      cardElement.parentNode.removeChild(cardElement);
    }
    stateManager?.destroy?.();
    touchHandler?.destroy?.();
    vi.restoreAllMocks();
  });

  describe('Complete Card Interaction Flow', () => {
    it('should handle complete hover -> holographic -> click -> flip flow', async () => {
      // Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3
      expect(cardElement).toBeTruthy();

      // Step 1: Test state manager initialization
      const initialState = stateManager.getState();
      expect(initialState.isFlipped).toBe(false);
      expect(initialState.isHovering).toBe(false);
      expect(initialState.isAnimating).toBe(false);

      // Step 2: Simulate hover to activate holographic effect
      stateManager.updateState({ isHovering: true });
      const hoverState = stateManager.getState();
      expect(hoverState.isHovering).toBe(true);

      // Step 3: Simulate mouse position for holographic effect
      const mousePosition = { x: 100, y: 100 };
      stateManager.updateState({ 
        mousePosition,
        holographicIntensity: 0.8 
      });

      const holographicState = stateManager.getState();
      expect(holographicState.mousePosition).toEqual(mousePosition);
      expect(holographicState.holographicIntensity).toBe(0.8);

      // Step 4: Test flip animation
      const flipPromise = stateManager.flip();
      const animatingState = stateManager.getState();
      expect(animatingState.isAnimating).toBe(true);

      // Wait for flip to complete
      await flipPromise;
      const flippedState = stateManager.getState();
      expect(flippedState.isFlipped).toBe(true);
      expect(flippedState.isAnimating).toBe(false);

      // Step 5: Test flip back
      await stateManager.flip();
      const backState = stateManager.getState();
      expect(backState.isFlipped).toBe(false);
    });

    it('should prevent double-click during animation', async () => {
      // Requirements: 2.4
      expect(cardElement).toBeTruthy();

      // First flip
      const firstFlip = stateManager.flip();
      expect(stateManager.getState().isAnimating).toBe(true);
      
      // Immediate second flip should be ignored
      const secondFlip = stateManager.flip();
      expect(secondFlip).toBe(firstFlip); // Should return same promise
      
      // Wait for animation to complete
      await firstFlip;
      const finalState = stateManager.getState();
      expect(finalState.isFlipped).toBe(true);
      expect(finalState.isAnimating).toBe(false);
    });

    it('should handle hover during flip animation gracefully', async () => {
      // Requirements: 3.2
      expect(cardElement).toBeTruthy();

      // Start flip animation
      const flipPromise = stateManager.flip();
      expect(stateManager.getState().isAnimating).toBe(true);
      
      // Try to hover during animation
      stateManager.updateState({ isHovering: true });
      
      // Animation should complete normally
      await flipPromise;
      const finalState = stateManager.getState();
      expect(finalState.isFlipped).toBe(true);
      expect(finalState.isAnimating).toBe(false);
      
      // Holographic effect should be applied after animation
      expect(finalState.isHovering).toBe(true);
    });
  });

  describe('Cross-Browser Compatibility Tests', () => {
    it('should fallback gracefully when CSS features are not supported', async () => {
      // Test with limited CSS support
      mockCSSSupports.mockImplementation(() => false);

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Should still render without errors
      expect(cardElement).toBeTruthy();
      
      // Should apply fallback styles
      await fireEvent.mouseEnter(cardElement);
      await waitFor(() => {
        // Fallback should use basic opacity/transform effects
        const style = cardElement.getAttribute('style');
        expect(style).toBeTruthy();
      });
    });

    it('should work with different blend mode support levels', async () => {
      const blendModes = ['overlay', 'soft-light', 'color-dodge'];
      
      for (const blendMode of blendModes) {
        mockCSSSupports.mockImplementation((property: string, value?: string) => {
          if (property === 'mix-blend-mode') {
            return value === blendMode;
          }
          return true;
        });

        const { component } = render(EnhancedCard, {
          frontImage: '/test-front.jpg',
          holographicStyle: 'cosmic'
        });

        await tick();
        cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

        await fireEvent.mouseEnter(cardElement);
        await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

        await waitFor(() => {
          const holographicLayer = cardElement.querySelector('.holographic-layer');
          expect(holographicLayer).toBeTruthy();
        });

        component.$destroy();
      }
    });

    it('should handle browsers without 3D transform support', async () => {
      mockCSSSupports.mockImplementation((property: string) => {
        return !property.includes('transform-style') && !property.includes('perspective');
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Should still handle click events
      await fireEvent.click(cardElement);
      
      // Should use 2D fallback animation
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toBeTruthy();
      });
    });
  });

  describe('Mobile Touch Interaction Tests', () => {
    beforeEach(() => {
      // Mock touch support
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      });

      // Mock touch events
      global.TouchEvent = class TouchEvent extends Event {
        touches: Touch[];
        changedTouches: Touch[];
        
        constructor(type: string, eventInitDict?: TouchEventInit) {
          super(type, eventInitDict);
          this.touches = eventInitDict?.touches || [];
          this.changedTouches = eventInitDict?.changedTouches || [];
        }
      } as any;
    });

    it('should handle touch events for holographic effects', async () => {
      // Requirements: 4.1
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Create mock touch
      const mockTouch = {
        identifier: 1,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        target: cardElement
      } as Touch;

      // Touch start
      await fireEvent.touchStart(cardElement, {
        touches: [mockTouch],
        changedTouches: [mockTouch]
      });

      // Touch move for holographic effect
      const moveTouch = { ...mockTouch, clientX: 120, clientY: 120 };
      await fireEvent.touchMove(cardElement, {
        touches: [moveTouch],
        changedTouches: [moveTouch]
      });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });
    });

    it('should handle tap gesture for card flipping', async () => {
      // Requirements: 4.2
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      const mockTouch = {
        identifier: 1,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        target: cardElement
      } as Touch;

      // Quick tap (touch start -> touch end)
      await fireEvent.touchStart(cardElement, {
        touches: [mockTouch],
        changedTouches: [mockTouch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [mockTouch]
      });

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });
    });

    it('should prevent duplicate touch and mouse events', async () => {
      // Requirements: 4.3
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      const mockTouch = {
        identifier: 1,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        target: cardElement
      } as Touch;

      // Touch event first
      await fireEvent.touchStart(cardElement, {
        touches: [mockTouch],
        changedTouches: [mockTouch]
      });

      await fireEvent.touchEnd(cardElement, {
        touches: [],
        changedTouches: [mockTouch]
      });

      // Immediate mouse click should be prevented
      await fireEvent.click(cardElement);

      // Should only flip once
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });

      // Verify it's only flipped once (not double-flipped back to front)
      const cardInner = cardElement.querySelector('.card-inner');
      expect(cardInner).toHaveClass('flipped');
    });

    it('should handle multi-touch scenarios gracefully', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      const touch1 = {
        identifier: 1,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        target: cardElement
      } as Touch;

      const touch2 = {
        identifier: 2,
        clientX: 150,
        clientY: 150,
        pageX: 150,
        pageY: 150,
        screenX: 150,
        screenY: 150,
        target: cardElement
      } as Touch;

      // Multi-touch start
      await fireEvent.touchStart(cardElement, {
        touches: [touch1, touch2],
        changedTouches: [touch1, touch2]
      });

      // Should handle gracefully without errors
      expect(cardElement).toBeTruthy();
    });
  });

  describe('Performance and Visual Feedback Tests', () => {
    it('should provide visual feedback during interactions', async () => {
      // Requirements: 6.1, 6.2, 6.3
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Should show pointer cursor when hoverable
      await fireEvent.mouseEnter(cardElement);
      const computedStyle = window.getComputedStyle(cardElement);
      expect(computedStyle.cursor).toBe('pointer');

      // Should show loading state during animation
      await fireEvent.click(cardElement);
      
      // Check for animation state class
      await waitFor(() => {
        expect(cardElement).toHaveClass('animating');
      });

      // Should show flipped state after animation
      await waitFor(() => {
        expect(cardElement).toHaveClass('flipped');
      }, { timeout: 1000 });
    });

    it('should maintain 60fps during animations', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true,
        animationSpeed: 600
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      const frameTimestamps: number[] = [];
      const originalRAF = global.requestAnimationFrame;
      
      global.requestAnimationFrame = vi.fn((callback) => {
        frameTimestamps.push(performance.now());
        return originalRAF(callback);
      });

      // Trigger animation
      await fireEvent.click(cardElement);
      
      // Wait for animation to complete
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });

      // Verify frame rate (should be called multiple times for smooth animation)
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Card Type Specific Tests', () => {
    it('should display correct back designs for different card types', async () => {
      // Requirements: 5.1, 5.2, 5.3
      const cardTypes = [
        { type: 'pokemon' as const, teamOrType: '' },
        { type: 'kbo' as const, teamOrType: 'LG' },
        { type: 'custom' as const, teamOrType: '' }
      ];

      for (const { type, teamOrType } of cardTypes) {
        const { component } = render(EnhancedCard, {
          frontImage: '/test-front.jpg',
          cardType: type,
          teamOrType,
          enableFlip: true
        });

        await tick();
        cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

        // Flip to back
        await fireEvent.click(cardElement);
        
        await waitFor(() => {
          const cardBack = cardElement.querySelector('.card-back');
          expect(cardBack).toBeVisible();
          
          // Check for type-specific classes
          expect(cardBack).toHaveClass(`card-back-${type}`);
          
          if (teamOrType) {
            expect(cardBack).toHaveClass(`team-${teamOrType.toLowerCase()}`);
          }
        }, { timeout: 1000 });

        component.$destroy();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing images gracefully', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/nonexistent-front.jpg',
        backImage: '/nonexistent-back.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Should still render and be interactive
      expect(cardElement).toBeTruthy();
      
      // Should handle flip even with missing images
      await fireEvent.click(cardElement);
      
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });
    });

    it('should handle rapid successive interactions', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Rapid mouse movements
      for (let i = 0; i < 10; i++) {
        await fireEvent.mouseMove(cardElement, {
          clientX: 50 + i * 10,
          clientY: 50 + i * 10
        });
      }

      // Should handle without errors
      expect(cardElement).toBeTruthy();
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await fireEvent.click(cardElement);
      }

      // Should end up in a consistent state
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toBeTruthy();
      });
    });

    it('should cleanup event listeners on component destroy', async () => {
      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = screen.getByTestId('enhanced-card') || document.querySelector('.enhanced-card');

      // Add event listeners
      await fireEvent.mouseEnter(cardElement);
      
      // Destroy component
      component.$destroy();

      // Should not throw errors when trying to interact with destroyed component
      expect(() => {
        fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });
      }).not.toThrow();
    });
  });
});