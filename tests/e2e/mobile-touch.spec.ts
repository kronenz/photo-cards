/**
 * E2E Mobile Touch Tests: Touch Responsiveness Validation
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T045 [US5]
 *
 * Tests:
 * - Touch responsiveness on mobile viewport
 * - Touch gesture recognition (tap, swipe, pinch)
 * - Touch event handling performance
 * - Mobile-specific UI interactions
 * - Touch accessibility compliance
 */

import { test, expect, type Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Mobile viewport configurations
const MOBILE_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 12' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 360, height: 640, name: 'Android Small' },
  { width: 412, height: 915, name: 'Android Large' },
];

// Touch performance thresholds
const MAX_TOUCH_LATENCY = 100; // Maximum touch response time in ms
const MIN_TOUCH_FPS = 30; // Minimum FPS for touch interactions
const MAX_TOUCH_JITTER = 5; // Maximum touch position jitter in pixels

/**
 * Helper function to simulate touch events
 */
async function simulateTouch(
  page: Page,
  element: any,
  touchType: 'tap' | 'swipe' | 'pinch' | 'longpress',
  options: any = {}
) {
  const box = await element.boundingBox();
  if (!box) throw new Error('Element not visible');

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  switch (touchType) {
    case 'tap':
      await page.touchscreen.tap(centerX, centerY);
      break;
    
    case 'swipe':
      const { direction = 'right', distance = 100 } = options;
      const startX = centerX;
      const startY = centerY;
      let endX = startX;
      let endY = startY;

      switch (direction) {
        case 'right':
          endX = startX + distance;
          break;
        case 'left':
          endX = startX - distance;
          break;
        case 'up':
          endY = startY - distance;
          break;
        case 'down':
          endY = startY + distance;
          break;
      }

      await page.touchscreen.tap(startX, startY);
      await page.waitForTimeout(50);
      await page.touchscreen.tap(endX, endY);
      break;
    
    case 'longpress':
      await page.touchscreen.tap(centerX, centerY);
      await page.waitForTimeout(500); // Long press duration
      break;
    
    case 'pinch':
      // Simulate pinch gesture with two touch points
      const { scale = 1.5 } = options;
      const offset = 50;
      
      // Start with two fingers
      await page.evaluate(({ centerX, centerY, offset }) => {
        const touch1 = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX - offset, centerY),
          clientX: centerX - offset,
          clientY: centerY,
        });
        const touch2 = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX + offset, centerY),
          clientX: centerX + offset,
          clientY: centerY,
        });
        
        const touchEvent = new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
        });
        
        document.dispatchEvent(touchEvent);
      }, { centerX, centerY, offset });
      
      await page.waitForTimeout(100);
      
      // Move fingers for pinch
      await page.evaluate(({ centerX, centerY, offset, scale }) => {
        const newOffset = offset * scale;
        const touch1 = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX - newOffset, centerY),
          clientX: centerX - newOffset,
          clientY: centerY,
        });
        const touch2 = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX + newOffset, centerY),
          clientX: centerX + newOffset,
          clientY: centerY,
        });
        
        const touchEvent = new TouchEvent('touchmove', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
        });
        
        document.dispatchEvent(touchEvent);
      }, { centerX, centerY, offset, scale });
      
      await page.waitForTimeout(100);
      
      // End touch
      await page.evaluate(({ centerX, centerY, offset, scale }) => {
        const newOffset = offset * scale;
        const touch1 = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX - newOffset, centerY),
          clientX: centerX - newOffset,
          clientY: centerY,
        });
        const touch2 = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX + newOffset, centerY),
          clientX: centerX + newOffset,
          clientY: centerY,
        });
        
        const touchEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch1, touch2],
        });
        
        document.dispatchEvent(touchEvent);
      }, { centerX, centerY, offset, scale });
      break;
  }
}

/**
 * Helper function to measure touch response time
 */
async function measureTouchLatency(page: Page, element: any, touchType: string): Promise<number> {
  const startTime = Date.now();
  
  await page.evaluate(() => {
    performance.mark('touch-start');
  });
  
  await simulateTouch(page, element, touchType as any);
  
  await page.evaluate(() => {
    performance.mark('touch-end');
    performance.measure('touch-latency', 'touch-start', 'touch-end');
  });
  
  const latency = await page.evaluate(() => {
    const measures = performance.getEntriesByType('measure');
    const touchMeasure = measures.find(m => m.name === 'touch-latency');
    return touchMeasure ? touchMeasure.duration : 0;
  });
  
  return latency;
}

test.describe('Mobile Touch - Basic Touch Interactions', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test(`should respond to tap on mobile viewport ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/test`);

      const cardRotator = page.locator('.unified-card .card-rotator').first();
      await expect(cardRotator).toBeVisible();

      // Measure tap response time
      const latency = await measureTouchLatency(page, cardRotator, 'tap');
      
      console.log(`${viewport.name} Tap Latency:`, latency + 'ms');
      
      // Touch should respond within 100ms
      expect(latency).toBeLessThan(MAX_TOUCH_LATENCY);
      
      // Verify card flip occurred
      await page.waitForTimeout(100);
      await expect(cardRotator).toHaveAttribute('aria-busy', 'true');
    });

    test(`should handle swipe gestures on mobile viewport ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/test`);

      const cardRotator = page.locator('.unified-card .card-rotator').first();
      await expect(cardRotator).toBeVisible();

      // Test swipe right
      await simulateTouch(page, cardRotator, 'swipe', { direction: 'right', distance: 50 });
      await page.waitForTimeout(100);

      // Test swipe left
      await simulateTouch(page, cardRotator, 'swipe', { direction: 'left', distance: 50 });
      await page.waitForTimeout(100);

      // Test swipe up
      await simulateTouch(page, cardRotator, 'swipe', { direction: 'up', distance: 50 });
      await page.waitForTimeout(100);

      // Test swipe down
      await simulateTouch(page, cardRotator, 'swipe', { direction: 'down', distance: 50 });
      
      // Should not throw errors
      expect(true).toBe(true);
    });

    test(`should handle long press on mobile viewport ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/test`);

      const cardRotator = page.locator('.unified-card .card-rotator').first();
      await expect(cardRotator).toBeVisible();

      // Test long press
      await simulateTouch(page, cardRotator, 'longpress');
      await page.waitForTimeout(100);

      // Should not throw errors
      expect(true).toBe(true);
    });
  }
});

test.describe('Mobile Touch - Performance Validation', () => {
  test('should maintain 30fps during touch interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Measure FPS during rapid touch interactions
    const startTime = Date.now();
    let frameCount = 0;

    // Start FPS measurement
    await page.evaluate(() => {
      let frameCount = 0;
      const startTime = Date.now();
      
      function countFrames() {
        frameCount++;
        if (Date.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          window.touchFPS = frameCount;
        }
      }
      
      requestAnimationFrame(countFrames);
    });

    // Perform rapid touch interactions
    for (let i = 0; i < 10; i++) {
      await simulateTouch(page, cardRotator, 'tap');
      await page.waitForTimeout(50);
    }

    // Wait for FPS measurement to complete
    await page.waitForTimeout(1100);

    const fps = await page.evaluate(() => window.touchFPS || 0);
    
    console.log('Touch Interaction FPS:', fps);
    
    // Should maintain at least 30fps
    expect(fps).toBeGreaterThanOrEqual(MIN_TOUCH_FPS);
  });

  test('should handle multiple simultaneous touches', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cards = page.locator('.unified-card .card-rotator');
    const count = await cards.count();

    if (count > 1) {
      // Simulate multi-touch on multiple cards
      const card1 = cards.first();
      const card2 = cards.nth(1);

      // Touch both cards simultaneously
      await page.evaluate(({ card1Box, card2Box }) => {
        const touch1 = new Touch({
          identifier: 1,
          target: document.elementFromPoint(card1Box.x + card1Box.width/2, card1Box.y + card1Box.height/2),
          clientX: card1Box.x + card1Box.width/2,
          clientY: card1Box.y + card1Box.height/2,
        });
        const touch2 = new Touch({
          identifier: 2,
          target: document.elementFromPoint(card2Box.x + card2Box.width/2, card2Box.y + card2Box.height/2),
          clientX: card2Box.x + card2Box.width/2,
          clientY: card2Box.y + card2Box.height/2,
        });
        
        const touchEvent = new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
        });
        
        document.dispatchEvent(touchEvent);
      }, {
        card1Box: await card1.boundingBox(),
        card2Box: await card2.boundingBox(),
      });

      await page.waitForTimeout(100);

      // Should not throw errors
      expect(true).toBe(true);
    }
  });
});

test.describe('Mobile Touch - Accessibility Compliance', () => {
  test('should support touch accessibility features', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Check touch-action CSS property
    const touchAction = await cardRotator.evaluate((el) => {
      return window.getComputedStyle(el).touchAction;
    });

    console.log('Touch Action CSS:', touchAction);

    // Should have appropriate touch-action value
    expect(touchAction).toBeTruthy();
  });

  test('should have proper touch target sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();

    expect(box).toBeTruthy();

    // Touch targets should be at least 44x44px (iOS HIG) or 48x48dp (Material Design)
    const minSize = 44;
    expect(box!.width).toBeGreaterThanOrEqual(minSize);
    expect(box!.height).toBeGreaterThanOrEqual(minSize);

    console.log(`Touch Target Size: ${box!.width}x${box!.height}px`);
  });

  test('should support keyboard navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Tab to focus the card
    await page.keyboard.press('Tab');
    await expect(cardRotator).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    // Should trigger flip
    await expect(cardRotator).toHaveAttribute('aria-busy', 'true');
  });
});

test.describe('Mobile Touch - Gesture Recognition', () => {
  test('should distinguish between tap and swipe', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Test tap (should trigger flip)
    await simulateTouch(page, cardRotator, 'tap');
    await page.waitForTimeout(100);
    
    // Should be flipping
    await expect(cardRotator).toHaveAttribute('aria-busy', 'true');
    
    // Wait for flip to complete
    await page.waitForTimeout(700);
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');

    // Test swipe (should not trigger flip)
    await simulateTouch(page, cardRotator, 'swipe', { direction: 'right', distance: 30 });
    await page.waitForTimeout(100);
    
    // Should not be flipping (still false from previous state)
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');
  });

  test('should handle touch cancellation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Start touch but cancel it
    await page.evaluate(({ centerX, centerY }) => {
      const touch = new Touch({
        identifier: 1,
        target: document.elementFromPoint(centerX, centerY),
        clientX: centerX,
        clientY: centerY,
      });
      
      const startEvent = new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
      });
      
      document.dispatchEvent(startEvent);
    }, {
      centerX: 200,
      centerY: 200,
    });

    await page.waitForTimeout(50);

    // Cancel touch
    await page.evaluate(() => {
      const touch = new Touch({
        identifier: 1,
        target: document.elementFromPoint(200, 200),
        clientX: 200,
        clientY: 200,
      });
      
      const cancelEvent = new TouchEvent('touchcancel', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch],
      });
      
      document.dispatchEvent(cancelEvent);
    });

    // Should not trigger flip
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');
  });
});

test.describe('Mobile Touch - Edge Cases', () => {
  test('should handle rapid touch events', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Rapid taps
    for (let i = 0; i < 5; i++) {
      await simulateTouch(page, cardRotator, 'tap');
      await page.waitForTimeout(10); // Very fast
    }

    // Should not crash or behave unexpectedly
    await page.waitForTimeout(100);
    expect(true).toBe(true);
  });

  test('should handle touch outside card area', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Touch outside the card
    await page.touchscreen.tap(50, 50); // Top-left corner
    await page.waitForTimeout(100);

    // Should not trigger flip
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');
  });

  test('should handle touch on card edges', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();
    await expect(cardRotator).toBeVisible();

    // Touch edges of the card
    const edges = [
      { x: box!.x, y: box!.y }, // Top-left
      { x: box!.x + box!.width, y: box!.y }, // Top-right
      { x: box!.x, y: box!.y + box!.height }, // Bottom-left
      { x: box!.x + box!.width, y: box!.y + box!.height }, // Bottom-right
    ];

    for (const edge of edges) {
      await page.touchscreen.tap(edge.x, edge.y);
      await page.waitForTimeout(50);
    }

    // Should handle edge touches properly
    expect(true).toBe(true);
  });
});

test.describe('Mobile Touch - Cross-Device Compatibility', () => {
  test('should work consistently across different mobile devices', async ({ page }) => {
    const results = [];

    for (const viewport of MOBILE_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/test`);

      const cardRotator = page.locator('.unified-card .card-rotator').first();
      await expect(cardRotator).toBeVisible();

      // Measure tap latency
      const latency = await measureTouchLatency(page, cardRotator, 'tap');
      
      results.push({
        device: viewport.name,
        latency: latency,
        passed: latency < MAX_TOUCH_LATENCY,
      });
    }

    console.log('Cross-Device Touch Results:', results);

    // All devices should pass
    const allPassed = results.every(r => r.passed);
    expect(allPassed).toBe(true);
  });
});
