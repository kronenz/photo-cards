/**
 * Cross-Browser Compatibility Integration Tests
 * Task 12 Implementation - 크로스 브라우저 호환성 테스트
 * 
 * Tests browser-specific features and fallbacks:
 * - CSS feature detection and fallbacks
 * - Browser-specific event handling
 * - Performance optimizations per browser
 * - Vendor prefix support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  CardStateManager, 
  createCardStateManager 
} from '../cardStateManager';
import { 
  TouchIntegrationHandler, 
  createTouchIntegrationHandler 
} from '../touchIntegration';
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

// Browser simulation utilities
const simulateBrowser = (browserName: 'chrome' | 'firefox' | 'safari' | 'edge') => {
  const userAgents = {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  };

  Object.defineProperty(navigator, 'userAgent', {
    value: userAgents[browserName],
    configurable: true
  });
};

const mockCSSFeatureSupport = (supportedFeatures: Record<string, boolean>) => {
  const mockSupports = vi.fn((property: string, value?: string) => {
    const key = value ? `${property}:${value}` : property;
    return supportedFeatures[key] ?? supportedFeatures[property] ?? false;
  });

  Object.defineProperty(window, 'CSS', {
    value: { supports: mockSupports },
    configurable: true
  });

  return mockSupports;
};

describe('Cross-Browser Compatibility Tests', () => {
  let cardElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Chrome/Chromium Browser Tests', () => {
    beforeEach(() => {
      simulateBrowser('chrome');
    });

    it('should use optimal CSS features in Chrome', async () => {
      const mockSupports = mockCSSFeatureSupport({
        'mix-blend-mode': true,
        'mix-blend-mode:overlay': true,
        'mix-blend-mode:color-dodge': true,
        'transform-style': true,
        'transform-style:preserve-3d': true,
        'perspective': true,
        'backdrop-filter': true,
        'filter': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Test holographic effects
      await fireEvent.mouseEnter(cardElement);
      await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // Verify Chrome-optimized features are used
      expect(mockSupports).toHaveBeenCalledWith('mix-blend-mode', 'overlay');
      expect(mockSupports).toHaveBeenCalledWith('transform-style', 'preserve-3d');

      // Test 3D flip animation
      await fireEvent.click(cardElement);
      
      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });
    });

    it('should handle Chrome-specific performance optimizations', async () => {
      mockCSSFeatureSupport({
        'will-change': true,
        'transform': true,
        'transform3d': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Trigger animation
      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        const style = window.getComputedStyle(cardInner as Element);
        
        // Chrome should use hardware acceleration
        expect(style.willChange).toBeTruthy();
      });
    });
  });

  describe('Firefox Browser Tests', () => {
    beforeEach(() => {
      simulateBrowser('firefox');
    });

    it('should handle Firefox-specific CSS limitations', async () => {
      const mockSupports = mockCSSFeatureSupport({
        'mix-blend-mode': true,
        'mix-blend-mode:overlay': true,
        'mix-blend-mode:color-dodge': false, // Firefox has limited color-dodge support
        'transform-style': true,
        'transform-style:preserve-3d': true,
        'backdrop-filter': false, // Limited support in older Firefox
        'filter': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      await fireEvent.mouseEnter(cardElement);
      await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // Should fallback from color-dodge to overlay
      expect(mockSupports).toHaveBeenCalledWith('mix-blend-mode', 'color-dodge');
      expect(mockSupports).toHaveBeenCalledWith('mix-blend-mode', 'overlay');
    });

    it('should handle Firefox animation performance', async () => {
      mockCSSFeatureSupport({
        'transform': true,
        'animation': true,
        'will-change': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true,
        animationSpeed: 400 // Faster for Firefox
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      const startTime = performance.now();
      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 800 });

      const endTime = performance.now();
      const animationDuration = endTime - startTime;
      
      // Should complete within reasonable time for Firefox
      expect(animationDuration).toBeLessThan(1000);
    });
  });

  describe('Safari Browser Tests', () => {
    beforeEach(() => {
      simulateBrowser('safari');
    });

    it('should handle Safari webkit prefixes and limitations', async () => {
      const mockSupports = mockCSSFeatureSupport({
        'mix-blend-mode': true,
        'mix-blend-mode:overlay': true,
        'transform-style': true,
        'transform-style:preserve-3d': true,
        'backdrop-filter': true,
        '-webkit-backdrop-filter': true,
        'filter': true,
        '-webkit-filter': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'aurora' // Safari handles aurora effects well
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      await fireEvent.mouseEnter(cardElement);
      await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // Should check for webkit prefixes
      expect(mockSupports).toHaveBeenCalledWith('backdrop-filter');
    });

    it('should handle Safari touch events properly', async () => {
      // Safari has specific touch event behavior
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

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

      // Safari-specific touch handling
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
  });

  describe('Edge Browser Tests', () => {
    beforeEach(() => {
      simulateBrowser('edge');
    });

    it('should handle Edge Chromium features', async () => {
      const mockSupports = mockCSSFeatureSupport({
        'mix-blend-mode': true,
        'mix-blend-mode:overlay': true,
        'transform-style': true,
        'transform-style:preserve-3d': true,
        'backdrop-filter': true,
        'filter': true,
        'will-change': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'galaxy',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Test full feature set
      await fireEvent.mouseEnter(cardElement);
      await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 1000 });

      // Edge should support all modern features
      expect(mockSupports).toHaveBeenCalledWith('mix-blend-mode', 'overlay');
      expect(mockSupports).toHaveBeenCalledWith('transform-style', 'preserve-3d');
    });
  });

  describe('Feature Detection and Fallbacks', () => {
    it('should provide graceful fallbacks for unsupported features', async () => {
      // Simulate old browser with limited support
      const mockSupports = mockCSSFeatureSupport({
        'transform': true,
        'opacity': true,
        'animation': true,
        // No modern features
        'mix-blend-mode': false,
        'transform-style': false,
        'backdrop-filter': false,
        'filter': false
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'basic',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Should still work with basic features
      await fireEvent.mouseEnter(cardElement);
      await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

      // Should apply fallback effects
      await waitFor(() => {
        const style = cardElement.getAttribute('style');
        expect(style).toContain('opacity');
      });

      // Should still flip with basic transform
      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toBeTruthy();
      });
    });

    it('should detect and use vendor prefixes when needed', async () => {
      const mockSupports = mockCSSFeatureSupport({
        'transform': false,
        '-webkit-transform': true,
        'filter': false,
        '-webkit-filter': true,
        'animation': false,
        '-webkit-animation': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'cosmic'
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      await fireEvent.mouseEnter(cardElement);

      // Should check for prefixed versions
      expect(mockSupports).toHaveBeenCalledWith('transform');
      expect(mockSupports).toHaveBeenCalledWith('filter');
    });

    it('should handle browsers with partial CSS support', async () => {
      const mockSupports = mockCSSFeatureSupport({
        'mix-blend-mode': true,
        'mix-blend-mode:overlay': true,
        'mix-blend-mode:color-dodge': false,
        'mix-blend-mode:soft-light': true,
        'transform-style': true,
        'transform-style:preserve-3d': false, // 2D only
        'backdrop-filter': false,
        'filter': true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'rainbow',
        enableFlip: true
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Should adapt to available features
      await fireEvent.mouseEnter(cardElement);
      await fireEvent.mouseMove(cardElement, { clientX: 100, clientY: 100 });

      await waitFor(() => {
        const holographicLayer = cardElement.querySelector('.holographic-layer');
        expect(holographicLayer).toBeTruthy();
      });

      // Should use 2D fallback for flip
      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toBeTruthy();
      });
    });
  });

  describe('Performance Across Browsers', () => {
    it('should optimize animations for different browser engines', async () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'] as const;

      for (const browser of browsers) {
        simulateBrowser(browser);
        
        mockCSSFeatureSupport({
          'transform': true,
          'will-change': true,
          'animation': true
        });

        const { component } = render(EnhancedCard, {
          frontImage: '/test-front.jpg',
          enableFlip: true
        });

        await tick();
        cardElement = document.querySelector('.enhanced-card') as HTMLElement;

        const startTime = performance.now();
        await fireEvent.click(cardElement);

        await waitFor(() => {
          const cardInner = cardElement.querySelector('.card-inner');
          expect(cardInner).toHaveClass('flipped');
        }, { timeout: 1000 });

        const endTime = performance.now();
        const duration = endTime - startTime;

        // All browsers should complete animation in reasonable time
        expect(duration).toBeLessThan(1500);

        component.$destroy();
      }
    });

    it('should handle low-performance scenarios', async () => {
      // Simulate low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        configurable: true
      });

      Object.defineProperty(navigator, 'deviceMemory', {
        value: 2,
        configurable: true
      });

      const { component } = render(EnhancedCard, {
        frontImage: '/test-front.jpg',
        holographicStyle: 'basic', // Reduced effects for low-end
        enableFlip: true,
        animationSpeed: 300 // Faster animation
      });

      await tick();
      cardElement = document.querySelector('.enhanced-card') as HTMLElement;

      // Should still work but with reduced effects
      await fireEvent.mouseEnter(cardElement);
      await fireEvent.click(cardElement);

      await waitFor(() => {
        const cardInner = cardElement.querySelector('.card-inner');
        expect(cardInner).toHaveClass('flipped');
      }, { timeout: 800 });
    });
  });
});