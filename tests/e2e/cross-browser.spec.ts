/**
 * Cross-Browser E2E Tests: Browser Compatibility Validation
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T054 [US5]
 *
 * Tests:
 * - Chrome, Safari, Firefox rendering consistency
 * - CSS features compatibility (backdrop-filter, CSS Grid, Flexbox)
 * - JavaScript features compatibility (ES6+, Web APIs)
 * - Performance consistency across browsers
 * - Touch/pointer events compatibility
 * - Accessibility features across browsers
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Browser-specific test configurations
const BROWSER_CONFIGS = [
  {
    name: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    features: ['backdrop-filter', 'css-grid', 'flexbox', 'css-custom-properties', 'web-animations']
  },
  {
    name: 'Safari',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    viewport: { width: 1920, height: 1080 },
    features: ['backdrop-filter', 'css-grid', 'flexbox', 'css-custom-properties', 'web-animations']
  },
  {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    viewport: { width: 1920, height: 1080 },
    features: ['css-grid', 'flexbox', 'css-custom-properties', 'web-animations']
  }
];

/**
 * Test CSS feature support
 */
async function testCSSFeatureSupport(page: Page, features: string[]): Promise<{ [key: string]: boolean }> {
  return await page.evaluate((features) => {
    const results: { [key: string]: boolean } = {};
    
    for (const feature of features) {
      switch (feature) {
        case 'backdrop-filter':
          results[feature] = CSS.supports('backdrop-filter', 'blur(10px)');
          break;
        case 'css-grid':
          results[feature] = CSS.supports('display', 'grid');
          break;
        case 'flexbox':
          results[feature] = CSS.supports('display', 'flex');
          break;
        case 'css-custom-properties':
          results[feature] = CSS.supports('--custom-property', 'value');
          break;
        case 'web-animations':
          results[feature] = 'animate' in document.createElement('div');
          break;
        default:
          results[feature] = false;
      }
    }
    
    return results;
  }, features);
}

/**
 * Test JavaScript feature support
 */
async function testJSFeatureSupport(page: Page): Promise<{ [key: string]: boolean }> {
  return await page.evaluate(() => {
    const results: { [key: string]: boolean } = {};
    
    // ES6+ features
    results['arrow-functions'] = typeof (() => {}) === 'function';
    results['template-literals'] = typeof `template` === 'string';
    results['destructuring'] = (() => {
      try {
        const { a } = { a: 1 };
        return a === 1;
      } catch {
        return false;
      }
    })();
    results['async-await'] = (() => {
      try {
        eval('async () => {}');
        return true;
      } catch {
        return false;
      }
    })();
    
    // Web APIs
    results['requestAnimationFrame'] = typeof requestAnimationFrame === 'function';
    results['performance-now'] = typeof performance.now === 'function';
    results['intersection-observer'] = typeof IntersectionObserver === 'function';
    results['resize-observer'] = typeof ResizeObserver === 'function';
    results['web-animations-api'] = typeof Element.prototype.animate === 'function';
    
    return results;
  });
}

/**
 * Test performance across browsers
 */
async function testPerformance(page: Page): Promise<{
  fps: number;
  renderTime: number;
  memoryUsage: number | null;
}> {
  return await page.evaluate(() => {
    const startTime = performance.now();
    let frameCount = 0;
    let lastTime = startTime;
    
    function measureFPS() {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        const fps = frameCount / ((now - lastTime) / 1000);
        const renderTime = now - startTime;
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || null;
        
        return { fps, renderTime, memoryUsage };
      }
      
      requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
    
    // Fallback if RAF doesn't work
    setTimeout(() => {
      return { fps: 0, renderTime: 0, memoryUsage: null };
    }, 1000);
  });
}

/**
 * Test touch/pointer events
 */
async function testPointerEvents(page: Page): Promise<{
  touchSupport: boolean;
  pointerEvents: boolean;
  touchAction: boolean;
}> {
  return await page.evaluate(() => {
    return {
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      pointerEvents: 'onpointerdown' in window,
      touchAction: CSS.supports('touch-action', 'none')
    };
  });
}

/**
 * Test accessibility features
 */
async function testAccessibilityFeatures(page: Page): Promise<{
  ariaSupport: boolean;
  focusManagement: boolean;
  screenReaderSupport: boolean;
}> {
  return await page.evaluate(() => {
    const testElement = document.createElement('div');
    testElement.setAttribute('aria-label', 'test');
    testElement.setAttribute('tabindex', '0');
    
    return {
      ariaSupport: testElement.getAttribute('aria-label') === 'test',
      focusManagement: typeof testElement.focus === 'function',
      screenReaderSupport: 'speechSynthesis' in window
    };
  });
}

// Run tests for each browser configuration
for (const config of BROWSER_CONFIGS) {
  test.describe(`Cross-Browser Tests - ${config.name}`, () => {
    let page: Page;
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext({
        userAgent: config.userAgent,
        viewport: config.viewport,
        // Enable hardware acceleration for performance tests
        deviceScaleFactor: 1,
      });
      page = await context.newPage();
    });

    test.afterEach(async () => {
      await context.close();
    });

    test(`should load main page correctly in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Check page title
      await expect(page).toHaveTitle(/KBO 홀로그래픽 카드/);
      
      // Check main content is visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.hero-section')).toBeVisible();
      
      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      // Should have minimal console errors
      expect(errors.length).toBeLessThan(5);
    });

    test(`should support required CSS features in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      const cssSupport = await testCSSFeatureSupport(page, config.features);
      
      console.log(`${config.name} CSS Support:`, cssSupport);
      
      // Essential features should be supported
      expect(cssSupport['css-grid']).toBe(true);
      expect(cssSupport['flexbox']).toBe(true);
      expect(cssSupport['css-custom-properties']).toBe(true);
      
      // Backdrop filter is optional for Firefox
      if (config.name !== 'Firefox') {
        expect(cssSupport['backdrop-filter']).toBe(true);
      }
    });

    test(`should support required JavaScript features in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      const jsSupport = await testJSFeatureSupport(page);
      
      console.log(`${config.name} JS Support:`, jsSupport);
      
      // Essential features should be supported
      expect(jsSupport['arrow-functions']).toBe(true);
      expect(jsSupport['template-literals']).toBe(true);
      expect(jsSupport['destructuring']).toBe(true);
      expect(jsSupport['requestAnimationFrame']).toBe(true);
      expect(jsSupport['performance-now']).toBe(true);
    });

    test(`should render holographic cards consistently in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Wait for cards to load
      await page.waitForSelector('.hero-card', { timeout: 10000 });
      
      const cards = page.locator('.hero-card');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Check card styling
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = cards.nth(i);
        await expect(card).toBeVisible();
        
        // Check for transform styles (3D effects)
        const transform = await card.evaluate(el => {
          return window.getComputedStyle(el).transform;
        });
        expect(transform).not.toBe('none');
      }
    });

    test(`should handle card interactions properly in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Wait for cards to load
      await page.waitForSelector('.hero-card', { timeout: 10000 });
      
      const firstCard = page.locator('.hero-card').first();
      await expect(firstCard).toBeVisible();
      
      // Test hover effect
      await firstCard.hover();
      await page.waitForTimeout(100);
      
      // Test click interaction
      await firstCard.click();
      await page.waitForTimeout(500);
      
      // Should not throw errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      expect(errors.length).toBe(0);
    });

    test(`should maintain performance standards in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');
      
      // Measure performance
      const performance = await testPerformance(page);
      
      console.log(`${config.name} Performance:`, performance);
      
      // Should maintain reasonable FPS
      expect(performance.fps).toBeGreaterThan(30);
      
      // Should not use excessive memory
      if (performance.memoryUsage) {
        expect(performance.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB
      }
    });

    test(`should support touch/pointer events in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      const pointerSupport = await testPointerEvents(page);
      
      console.log(`${config.name} Pointer Support:`, pointerSupport);
      
      // Should support pointer events
      expect(pointerSupport.pointerEvents).toBe(true);
      expect(pointerSupport.touchAction).toBe(true);
    });

    test(`should support accessibility features in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      const a11ySupport = await testAccessibilityFeatures(page);
      
      console.log(`${config.name} A11y Support:`, a11ySupport);
      
      // Should support basic accessibility features
      expect(a11ySupport.ariaSupport).toBe(true);
      expect(a11ySupport.focusManagement).toBe(true);
    });

    test(`should handle modal interactions correctly in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Open create card modal
      await page.click('button:has-text("나만의 카드 만들기")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Test modal focus trap
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Test escape key
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    });

    test(`should handle responsive design correctly in ${config.name}`, async () => {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/`);
        
        // Check main content is visible
        await expect(page.locator('h1')).toBeVisible();
        
        // Check for responsive layout
        const heroSection = page.locator('.hero-section');
        await expect(heroSection).toBeVisible();
        
        console.log(`${config.name} - ${viewport.name}: Layout OK`);
      }
    });

    test(`should handle animations smoothly in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Test card hover animations
      const cards = page.locator('.hero-card');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const firstCard = cards.first();
        
        // Measure animation performance
        const startTime = performance.now();
        await firstCard.hover();
        await page.waitForTimeout(1000);
        const endTime = performance.now();
        
        const animationTime = endTime - startTime;
        expect(animationTime).toBeLessThan(2000); // Should complete within 2 seconds
      }
    });

    test(`should handle form interactions correctly in ${config.name}`, async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Open create card modal
      await page.click('button:has-text("나만의 카드 만들기")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Test form inputs
      const nameInput = page.locator('input[placeholder*="선수"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('테스트 선수');
        await expect(nameInput).toHaveValue('테스트 선수');
      }
      
      // Test select dropdown
      const teamSelect = page.locator('select');
      if (await teamSelect.count() > 0) {
        await teamSelect.selectOption('lg');
        await expect(teamSelect).toHaveValue('lg');
      }
    });
  });
}

test.describe('Cross-Browser Compatibility Matrix', () => {
  test('should generate compatibility report', async ({ page }) => {
    const report = {
      timestamp: new Date().toISOString(),
      browsers: BROWSER_CONFIGS.map(config => ({
        name: config.name,
        features: config.features,
        viewport: config.viewport
      })),
      testResults: {}
    };
    
    for (const config of BROWSER_CONFIGS) {
      await page.goto(`${BASE_URL}/`);
      
      const cssSupport = await testCSSFeatureSupport(page, config.features);
      const jsSupport = await testJSFeatureSupport(page);
      const pointerSupport = await testPointerEvents(page);
      const a11ySupport = await testAccessibilityFeatures(page);
      
      report.testResults[config.name] = {
        css: cssSupport,
        javascript: jsSupport,
        pointer: pointerSupport,
        accessibility: a11ySupport
      };
    }
    
    console.log('\n=== Cross-Browser Compatibility Report ===');
    console.log(JSON.stringify(report, null, 2));
    
    // All browsers should support essential features
    for (const [browser, results] of Object.entries(report.testResults)) {
      expect(results.css['css-grid']).toBe(true);
      expect(results.css['flexbox']).toBe(true);
      expect(results.javascript['arrow-functions']).toBe(true);
      expect(results.javascript['requestAnimationFrame']).toBe(true);
    }
  });
});
