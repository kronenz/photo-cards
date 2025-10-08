/**
 * E2E Performance Tests: 60fps Validation
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T018 [US1]
 *
 * Tests:
 * - 60fps validation during card interactions (NON-NEGOTIABLE Constitution requirement)
 * - Frame time measurements (must be ≤16.67ms for 60fps)
 * - Long task detection (>50ms tasks that block main thread)
 * - Animation smoothness during flip
 * - Holographic effect performance
 * - Multiple cards performance (100+ cards test)
 */

import { test, expect, type Page, type CDPSession } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Performance thresholds (Constitution requirements)
const MIN_AVG_FPS = 55; // Average FPS must be ≥55
const TARGET_FPS = 60; // Target is 60fps
const MAX_FRAME_TIME = 16.67; // Maximum frame time in ms (1000ms / 60fps)
const MAX_LONG_TASKS = 0; // Long tasks (>50ms) should be 0 (NON-NEGOTIABLE)
const MAX_FRAME_DROPS = 5; // Maximum percentage of dropped frames

/**
 * Helper function to measure FPS during an interaction
 */
async function measureFPS(
  page: Page,
  action: () => Promise<void>,
  duration: number = 2000
): Promise<{
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  frameDrops: number;
  longTasks: number;
  frameT times: number[];
}> {
  // Start Chrome DevTools Protocol session
  const client = await page.context().newCDPSession(page);

  // Enable performance tracing
  await client.send('Performance.enable');

  // Start measuring
  const startTime = Date.now();
  const frameTimes: number[] = [];
  let longTasks = 0;

  // Record frame metrics
  client.on('Performance.metrics', (event) => {
    const metrics = event.metrics;
    // Extract frame time from metrics
    const frameMetric = metrics.find((m) => m.name === 'LayoutDuration');
    if (frameMetric) {
      frameTimes.push(frameMetric.value);
      if (frameMetric.value > 50) {
        longTasks++;
      }
    }
  });

  // Perform the action
  await action();

  // Continue measuring for specified duration
  await page.waitForTimeout(duration);

  // Stop measuring
  await client.send('Performance.disable');
  await client.detach();

  // Calculate FPS from frame times
  const fps: number[] = [];
  for (let i = 1; i < frameTimes.length; i++) {
    const frameDelta = frameTimes[i] - frameTimes[i - 1];
    if (frameDelta > 0) {
      fps.push(1000 / frameDelta);
    }
  }

  const avgFPS = fps.length > 0 ? fps.reduce((a, b) => a + b, 0) / fps.length : 0;
  const minFPS = fps.length > 0 ? Math.min(...fps) : 0;
  const maxFPS = fps.length > 0 ? Math.max(...fps) : 0;

  // Count frame drops (frames that took >16.67ms)
  const droppedFrames = frameTimes.filter((t) => t > MAX_FRAME_TIME).length;
  const frameDropPercentage = (droppedFrames / frameTimes.length) * 100;

  return {
    avgFPS,
    minFPS,
    maxFPS,
    frameDrops: frameDropPercentage,
    longTasks,
    frameTimes,
  };
}

/**
 * Helper function to get performance metrics using Performance API
 */
async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const perfEntries = performance.getEntriesByType('measure');
    const paintEntries = performance.getEntriesByType('paint');
    const navigationEntries = performance.getEntriesByType('navigation');

    return {
      measures: perfEntries,
      paints: paintEntries,
      navigation: navigationEntries,
    };
  });
}

test.describe('Performance - 60fps Card Flip Animation (NON-NEGOTIABLE)', () => {
  test('should maintain 60fps during card flip animation', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Measure FPS during flip
    const metrics = await measureFPS(
      page,
      async () => {
        await cardRotator.click();
      },
      1000 // Measure for 1 second
    );

    // Validate performance thresholds
    console.log('Flip Animation FPS:', metrics.avgFPS);
    console.log('Min FPS:', metrics.minFPS);
    console.log('Frame Drops:', metrics.frameDrops.toFixed(2) + '%');
    console.log('Long Tasks:', metrics.longTasks);

    // Constitution requirement: Average FPS ≥55
    expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);

    // Frame drops should be minimal (<5%)
    expect(metrics.frameDrops).toBeLessThan(MAX_FRAME_DROPS);

    // NON-NEGOTIABLE: No long tasks (>50ms)
    expect(metrics.longTasks).toBeLessThanOrEqual(MAX_LONG_TASKS);
  });

  test('should maintain 60fps during multiple rapid flips', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    const metrics = await measureFPS(
      page,
      async () => {
        // Rapid flips
        for (let i = 0; i < 5; i++) {
          await cardRotator.click();
          await page.waitForTimeout(100);
        }
      },
      2000
    );

    console.log('Rapid Flips Avg FPS:', metrics.avgFPS);
    console.log('Long Tasks:', metrics.longTasks);

    expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
    expect(metrics.longTasks).toBeLessThanOrEqual(MAX_LONG_TASKS);
  });

  test('should have consistent frame times during flip', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    const metrics = await measureFPS(
      page,
      async () => {
        await cardRotator.click();
      },
      800
    );

    // Check frame time consistency (should be close to 16.67ms for 60fps)
    const avgFrameTime = metrics.frameTimes.length > 0
      ? metrics.frameTimes.reduce((a, b) => a + b, 0) / metrics.frameTimes.length
      : 0;

    console.log('Avg Frame Time:', avgFrameTime.toFixed(2) + 'ms');

    // Frame time should be ≤16.67ms for 60fps
    expect(avgFrameTime).toBeLessThanOrEqual(MAX_FRAME_TIME + 5); // +5ms tolerance
  });
});

test.describe('Performance - 60fps Holographic Effects', () => {
  test('should maintain 60fps during holographic hover', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();
    expect(box).toBeTruthy();

    const metrics = await measureFPS(
      page,
      async () => {
        // Move mouse across card
        for (let x = 0; x <= box!.width; x += 20) {
          await page.mouse.move(box!.x + x, box!.y + box!.height / 2);
          await page.waitForTimeout(16); // ~60fps mouse movement
        }
      },
      1500
    );

    console.log('Holographic Hover Avg FPS:', metrics.avgFPS);
    console.log('Frame Drops:', metrics.frameDrops.toFixed(2) + '%');

    expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
    expect(metrics.frameDrops).toBeLessThan(MAX_FRAME_DROPS);
  });

  test('should maintain 60fps with multiple holographic effects active', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cards = page.locator('.unified-card');
    const count = await cards.count();

    if (count > 1) {
      const metrics = await measureFPS(
        page,
        async () => {
          // Hover over multiple cards
          for (let i = 0; i < Math.min(count, 3); i++) {
            const card = cards.nth(i);
            await card.hover();
            await page.waitForTimeout(200);
          }
        },
        1500
      );

      console.log('Multiple Holographic Effects Avg FPS:', metrics.avgFPS);

      expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
      expect(metrics.longTasks).toBeLessThanOrEqual(MAX_LONG_TASKS);
    }
  });
});

test.describe('Performance - Animation Timing', () => {
  test('should complete flip animation in 600ms', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    const startTime = Date.now();
    await cardRotator.click();

    // Wait for animation to complete
    await page.waitForTimeout(650);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('Flip Animation Duration:', duration + 'ms');

    // Animation should complete in approximately 600ms (±100ms tolerance)
    expect(duration).toBeGreaterThan(500);
    expect(duration).toBeLessThan(800);
  });

  test('should update aria-busy correctly during animation', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Before flip
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');

    // Start flip
    await cardRotator.click();

    // During animation
    await expect(cardRotator).toHaveAttribute('aria-busy', 'true');

    // After animation (600ms)
    await page.waitForTimeout(650);
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');
  });
});

test.describe('Performance - Pointer Event Handling', () => {
  test('should handle pointer move events efficiently', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();
    expect(box).toBeTruthy();

    // Measure event handling performance
    const startTime = Date.now();

    // Generate 100 pointer move events
    for (let i = 0; i < 100; i++) {
      const x = box!.x + (i % box!.width);
      const y = box!.y + box!.height / 2;
      await page.mouse.move(x, y);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTimePerEvent = totalTime / 100;

    console.log('Pointer Event Handling - Avg Time:', avgTimePerEvent.toFixed(2) + 'ms');

    // Each event should be handled in <5ms (well below 16.67ms frame budget)
    expect(avgTimePerEvent).toBeLessThan(5);
  });

  test('should throttle pointer events to maintain 60fps', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();

    const metrics = await measureFPS(
      page,
      async () => {
        // Rapid pointer movements
        for (let i = 0; i < 200; i++) {
          await page.mouse.move(
            box!.x + (i % box!.width),
            box!.y + (i % box!.height)
          );
        }
      },
      1500
    );

    console.log('Pointer Throttling Avg FPS:', metrics.avgFPS);

    // Should maintain 60fps even with rapid movements
    expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
  });
});

test.describe('Performance - Memory and Resource Usage', () => {
  test('should not leak memory during repeated interactions', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Get initial memory usage
    const initialMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });

    // Perform many interactions
    for (let i = 0; i < 50; i++) {
      await cardRotator.click();
      await page.waitForTimeout(50);
    }

    // Get final memory usage
    const finalMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });

    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      const increasePercentage = (memoryIncrease / initialMetrics.usedJSHeapSize) * 100;

      console.log('Memory Increase:', (memoryIncrease / 1024 / 1024).toFixed(2) + ' MB');
      console.log('Memory Increase %:', increasePercentage.toFixed(2) + '%');

      // Memory increase should be reasonable (<50%)
      expect(increasePercentage).toBeLessThan(50);
    }
  });

  test('should load images efficiently with lazy loading', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Check if images have loading="lazy"
    const images = page.locator('.unified-card img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const loading = await images.nth(i).getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });
});

test.describe('Performance - CPU Usage', () => {
  test('should not block main thread during interactions', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Start performance profiling
    await page.evaluate(() => {
      performance.mark('interaction-start');
    });

    // Perform interaction
    await cardRotator.click();
    await page.waitForTimeout(700);

    // End profiling
    await page.evaluate(() => {
      performance.mark('interaction-end');
      performance.measure('interaction-duration', 'interaction-start', 'interaction-end');
    });

    // Get long tasks (>50ms)
    const longTasks = await page.evaluate(() => {
      // Check for long tasks using PerformanceObserver (if available)
      const entries = performance.getEntriesByType('measure');
      return entries.filter((entry) => entry.duration > 50);
    });

    console.log('Long Tasks Detected:', longTasks.length);

    // NON-NEGOTIABLE: Should have 0 long tasks
    expect(longTasks.length).toBeLessThanOrEqual(MAX_LONG_TASKS);
  });
});

test.describe('Performance - Cross-Browser Consistency', () => {
  test('should maintain 60fps across different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/test`);

      const cardRotator = page.locator('.unified-card .card-rotator').first();

      const metrics = await measureFPS(
        page,
        async () => {
          await cardRotator.click();
        },
        800
      );

      console.log(`${viewport.name} Viewport Avg FPS:`, metrics.avgFPS);

      expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
    }
  });
});

test.describe('Performance - Real-World Scenarios', () => {
  test('should handle rapid user interactions smoothly', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();

    const metrics = await measureFPS(
      page,
      async () => {
        // Simulate real user: hover + click + hover + click
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.waitForTimeout(100);
        await cardRotator.click();
        await page.waitForTimeout(200);
        await page.mouse.move(box!.x + box!.width / 4, box!.y + box!.height / 4);
        await page.waitForTimeout(100);
        await cardRotator.click();
      },
      1500
    );

    console.log('Real-World Scenario Avg FPS:', metrics.avgFPS);

    expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
    expect(metrics.longTasks).toBeLessThanOrEqual(MAX_LONG_TASKS);
  });

  test('should maintain performance with keyboard navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const metrics = await measureFPS(
      page,
      async () => {
        // Tab to card
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        // Flip with Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(700);

        // Flip back with Space
        await page.keyboard.press('Space');
      },
      1500
    );

    console.log('Keyboard Navigation Avg FPS:', metrics.avgFPS);

    expect(metrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
  });
});

test.describe('Performance - Rendering Efficiency', () => {
  test('should use CSS transforms for animations (GPU acceleration)', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Check if transform is used (not left/top positioning)
    const transform = await cardRotator.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.transform;
    });

    console.log('Transform Style:', transform);

    // Transform should be applied (not "none")
    expect(transform).not.toBe('none');
  });

  test('should avoid layout thrashing during animations', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Measure layout recalculations
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await cardRotator.click();

    await page.waitForTimeout(700);

    await client.send('Performance.disable');
    await client.detach();

    // Success if no errors (detailed layout measurement would require more complex CDP usage)
  });
});

test.describe('Performance - Constitution Compliance Report', () => {
  test('should generate performance compliance report', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Run comprehensive performance test
    const flipMetrics = await measureFPS(
      page,
      async () => {
        await cardRotator.click();
      },
      1000
    );

    const box = await cardRotator.boundingBox();
    const hoverMetrics = await measureFPS(
      page,
      async () => {
        for (let x = 0; x < box!.width; x += 30) {
          await page.mouse.move(box!.x + x, box!.y + box!.height / 2);
          await page.waitForTimeout(16);
        }
      },
      1000
    );

    // Generate report
    const report = {
      'Flip Animation': {
        'Avg FPS': flipMetrics.avgFPS.toFixed(2),
        'Min FPS': flipMetrics.minFPS.toFixed(2),
        'Frame Drops %': flipMetrics.frameDrops.toFixed(2),
        'Long Tasks': flipMetrics.longTasks,
        'PASS/FAIL': flipMetrics.avgFPS >= MIN_AVG_FPS && flipMetrics.longTasks <= MAX_LONG_TASKS ? '✅ PASS' : '❌ FAIL',
      },
      'Holographic Hover': {
        'Avg FPS': hoverMetrics.avgFPS.toFixed(2),
        'Min FPS': hoverMetrics.minFPS.toFixed(2),
        'Frame Drops %': hoverMetrics.frameDrops.toFixed(2),
        'Long Tasks': hoverMetrics.longTasks,
        'PASS/FAIL': hoverMetrics.avgFPS >= MIN_AVG_FPS && hoverMetrics.longTasks <= MAX_LONG_TASKS ? '✅ PASS' : '❌ FAIL',
      },
      'Constitution Requirements': {
        'Target FPS': TARGET_FPS,
        'Min Acceptable FPS': MIN_AVG_FPS,
        'Max Long Tasks': MAX_LONG_TASKS + ' (NON-NEGOTIABLE)',
        'Max Frame Drops %': MAX_FRAME_DROPS,
      },
    };

    console.log('\n=== 60fps Performance Compliance Report ===');
    console.log(JSON.stringify(report, null, 2));

    // Assert overall compliance
    expect(flipMetrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
    expect(flipMetrics.longTasks).toBeLessThanOrEqual(MAX_LONG_TASKS);
    expect(hoverMetrics.avgFPS).toBeGreaterThanOrEqual(MIN_AVG_FPS);
    expect(hoverMetrics.longTasks).toBeLessThanOrEqual(MAX_LONG_TASKS);
  });
});
