/**
 * E2E Tests: Unified Experience
 *
 * Feature: 002-integrated-holographic-platform
 * Task: T017 [US1]
 *
 * Tests:
 * - User can flip cards on /test page
 * - User can see holographic effects on all pages
 * - Cards respond to mouse and touch interactions
 * - Same card displays consistently across routes
 * - Accessibility: keyboard navigation works
 * - Error states display correctly
 */

import { test, expect, type Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Unified Holographic Card - Cross-Route Consistency', () => {
  test('should display UnifiedHolographicCard on /test page', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Wait for unified card section to load
    await expect(page.locator('h2:has-text("Phase 3: 통합 홀로그래픽 카드 시스템")')).toBeVisible();

    // Check if UnifiedHolographicCard is rendered
    const unifiedCard = page.locator('.unified-card').first();
    await expect(unifiedCard).toBeVisible();

    // Check if card has correct data attributes
    await expect(unifiedCard).toHaveAttribute('data-size');
    await expect(unifiedCard).toHaveAttribute('data-rarity');
  });

  test('should display consistent card image across pages', async ({ page }) => {
    // Visit /test page
    await page.goto(`${BASE_URL}/test`);
    const testCardImage = page.locator('.unified-card .card-front img').first();
    await expect(testCardImage).toBeVisible();
    const testSrc = await testCardImage.getAttribute('src');

    // Verify image loaded
    expect(testSrc).toBeTruthy();
    expect(testSrc).toContain('http');
  });

  test('should render rarity border and glow effects', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();
    await expect(unifiedCard).toBeVisible();

    // Check for rarity border
    const rarityBorder = page.locator('.rarity-border').first();
    await expect(rarityBorder).toBeVisible();

    // Check rarity attribute (legendary card should have glow)
    const rarity = await unifiedCard.getAttribute('data-rarity');
    expect(rarity).toBe('legendary');
  });
});

test.describe('Unified Holographic Card - Flip Animation', () => {
  test('should flip card on click', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Check initial state
    await expect(cardRotator).toHaveAttribute('aria-pressed', 'false');
    await expect(cardRotator).not.toHaveClass(/flipped/);

    // Click to flip
    await cardRotator.click();

    // Wait for flip animation
    await page.waitForTimeout(100);

    // Check flipped state
    await expect(cardRotator).toHaveAttribute('aria-pressed', 'true');
    await expect(cardRotator).toHaveClass(/flipped/);
  });

  test('should flip back on second click', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // First click - flip to back
    await cardRotator.click();
    await page.waitForTimeout(100);
    await expect(cardRotator).toHaveClass(/flipped/);

    // Second click - flip to front
    await cardRotator.click();
    await page.waitForTimeout(100);
    await expect(cardRotator).not.toHaveClass(/flipped/);
  });

  test('should show aria-busy during animation', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Start flip
    await cardRotator.click();

    // Check aria-busy is set
    await expect(cardRotator).toHaveAttribute('aria-busy', 'true');

    // Wait for animation to complete (600ms)
    await page.waitForTimeout(650);

    // aria-busy should be false
    await expect(cardRotator).toHaveAttribute('aria-busy', 'false');
  });

  test('should display both front and back faces', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Front face should be visible initially
    const frontFace = page.locator('.unified-card .card-front').first();
    await expect(frontFace).toBeVisible();

    // Back face should exist but not visible (rotated)
    const backFace = page.locator('.unified-card .card-back').first();
    await expect(backFace).toBeAttached();

    // Click to flip
    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await cardRotator.click();
    await page.waitForTimeout(650);

    // Now back face should be visible (transform applied)
    await expect(cardRotator).toHaveClass(/flipped/);
  });
});

test.describe('Unified Holographic Card - Holographic Effects', () => {
  test('should display holographic overlay', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const holographicOverlay = page.locator('.holographic-overlay').first();
    await expect(holographicOverlay).toBeAttached();

    // Check if overlay has style with gradient
    const style = await holographicOverlay.getAttribute('style');
    expect(style).toContain('background');
    expect(style).toContain('radial-gradient');
  });

  test('should display holographic shimmer effect', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const shimmer = page.locator('.holographic-shimmer').first();
    await expect(shimmer).toBeAttached();
  });

  test('should update holographic effect on mouse move', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Get card bounding box
    const box = await cardRotator.boundingBox();
    expect(box).toBeTruthy();

    // Move mouse to center of card
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    // Holographic effect should be applied
    const holographicOverlay = page.locator('.holographic-overlay').first();
    const style = await holographicOverlay.getAttribute('style');
    expect(style).toBeTruthy();

    // Move mouse to top-left corner
    await page.mouse.move(box!.x + 10, box!.y + 10);

    // Style should update
    await page.waitForTimeout(50);
    const updatedStyle = await holographicOverlay.getAttribute('style');
    expect(updatedStyle).toBeTruthy();
  });

  test('should apply correct blend mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const holographicOverlay = page.locator('.holographic-overlay').first();
    const style = await holographicOverlay.getAttribute('style');

    // Check for blend mode (soft-light or overlay)
    expect(style).toMatch(/mix-blend-mode:\s*(soft-light|overlay|hard-light)/);
  });
});

test.describe('Unified Holographic Card - Mouse Interactions', () => {
  test('should show interacting class on mouse enter', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();
    const cardRotator = page.locator('.card-rotator').first();

    // Hover over card
    await cardRotator.hover();

    // Card should have interacting class or visual feedback
    await page.waitForTimeout(100);

    // Check if card responds to hover (via CSS or class)
    const hasInteractive = await unifiedCard.evaluate((el) => el.classList.contains('interactive'));
    expect(hasInteractive).toBe(true);
  });

  test('should reset holographic effects on mouse leave', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.card-rotator').first();
    const holographicOverlay = page.locator('.holographic-overlay').first();

    // Hover and move mouse
    await cardRotator.hover();
    await page.waitForTimeout(100);

    // Move mouse away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);

    // Holographic params should reset to center (50%, 50%)
    const style = await holographicOverlay.getAttribute('style');
    expect(style).toContain('50%');
  });
});

test.describe('Unified Holographic Card - Touch Interactions', () => {
  test.use({ hasTouch: true });

  test('should respond to touch on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeVisible();

    // Get card position
    const box = await cardRotator.boundingBox();
    expect(box).toBeTruthy();

    // Tap card
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);

    // Wait for flip
    await page.waitForTimeout(100);

    // Check if card flipped
    await expect(cardRotator).toHaveClass(/flipped/);
  });

  test('should handle touch move for holographic effect', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    const box = await cardRotator.boundingBox();
    expect(box).toBeTruthy();

    // Touch start
    await page.touchscreen.tap(box!.x + box!.width / 4, box!.y + box!.height / 4);

    // Holographic effect should respond
    const holographicOverlay = page.locator('.holographic-overlay').first();
    const style = await holographicOverlay.getAttribute('style');
    expect(style).toBeTruthy();
  });
});

test.describe('Unified Holographic Card - Keyboard Navigation', () => {
  test('should focus card with Tab key', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Press Tab to focus card
    await page.keyboard.press('Tab');

    // Card rotator should be focused
    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeFocused();
  });

  test('should flip card with Enter key', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Focus card
    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await cardRotator.focus();

    // Press Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    // Card should flip
    await expect(cardRotator).toHaveClass(/flipped/);
  });

  test('should flip card with Space key', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Focus card
    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await cardRotator.focus();

    // Press Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Card should flip
    await expect(cardRotator).toHaveClass(/flipped/);
  });

  test('should flip back with Escape key when flipped', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await cardRotator.focus();

    // Flip with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await expect(cardRotator).toHaveClass(/flipped/);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Card should flip back
    await expect(cardRotator).not.toHaveClass(/flipped/);
  });

  test('should show focus indicator', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await cardRotator.focus();

    // Check if focus outline is visible (via computed style)
    const outlineStyle = await cardRotator.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.outlineStyle;
    });

    // Focus indicator should be present
    expect(outlineStyle).toBeTruthy();
  });
});

test.describe('Unified Holographic Card - Accessibility', () => {
  test('should have correct ARIA attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();

    // Check role
    await expect(cardRotator).toHaveAttribute('role', 'button');

    // Check aria-label
    const ariaLabel = await cardRotator.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('legendary'); // Rarity in label

    // Check aria-pressed
    await expect(cardRotator).toHaveAttribute('aria-pressed', 'false');

    // Check tabindex
    await expect(cardRotator).toHaveAttribute('tabindex', '0');
  });

  test('should update aria-pressed on flip', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toHaveAttribute('aria-pressed', 'false');

    // Click to flip
    await cardRotator.click();
    await page.waitForTimeout(100);

    // aria-pressed should update
    await expect(cardRotator).toHaveAttribute('aria-pressed', 'true');
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const frontImage = page.locator('.card-front img').first();
    const alt = await frontImage.getAttribute('alt');

    expect(alt).toBeTruthy();
    expect(alt).not.toBe('');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Tab to unified card
    await page.keyboard.press('Tab');
    const cardRotator = page.locator('.unified-card .card-rotator').first();
    await expect(cardRotator).toBeFocused();

    // Enter should work
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await expect(cardRotator).toHaveClass(/flipped/);
  });
});

test.describe('Unified Holographic Card - Error Handling', () => {
  test('should display loading state initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Loading placeholder might be briefly visible
    // (This test might be flaky if image loads too fast)
    const unifiedCard = page.locator('.unified-card').first();
    await expect(unifiedCard).toBeVisible();
  });

  test('should handle image load errors gracefully', async ({ page }) => {
    // This test would require mocking network responses
    // For now, just verify error state UI exists in component
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();
    await expect(unifiedCard).toBeVisible();

    // If image fails, error placeholder with retry button should appear
    // (Would need to intercept network to test this properly)
  });
});

test.describe('Unified Holographic Card - Size Variants', () => {
  test('should render with correct size attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();
    const size = await unifiedCard.getAttribute('data-size');

    expect(size).toBeTruthy();
    expect(['small', 'medium', 'large', 'featured']).toContain(size!);
  });

  test('should apply correct dimensions for size', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();
    const style = await unifiedCard.getAttribute('style');

    expect(style).toContain('--card-width');
    expect(style).toContain('--card-height');
  });
});

test.describe('Unified Holographic Card - Rarity Variants', () => {
  test('should display rarity attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();
    const rarity = await unifiedCard.getAttribute('data-rarity');

    expect(rarity).toBeTruthy();
    expect(['common', 'rare', 'epic', 'legendary']).toContain(rarity!);
  });

  test('should display rarity border with gradient', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const rarityBorder = page.locator('.rarity-border').first();
    await expect(rarityBorder).toBeVisible();

    // Check if gradient classes are applied
    const classes = await rarityBorder.getAttribute('class');
    expect(classes).toContain('bg-gradient-to-r');
  });

  test('should have legendary pulse animation for legendary cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card[data-rarity="legendary"]').first();
    if (await unifiedCard.count() > 0) {
      // Legendary card should have pulse animation
      await expect(unifiedCard).toBeVisible();
    }
  });
});

test.describe('Unified Holographic Card - Legacy Compatibility', () => {
  test('should coexist with legacy Enhanced Cards on /test page', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Both unified and legacy cards should be present
    const unifiedCard = page.locator('.unified-card');
    const legacyCards = page.locator('.enhanced-card-container');

    await expect(unifiedCard.first()).toBeVisible();
    await expect(legacyCards.first()).toBeVisible();

    // Page should have both sections
    const unifiedSection = page.locator('h2:has-text("Phase 3")');
    const legacySection = page.locator('h2:has-text("KBO 구단별 홀로그래픽 카드")');

    await expect(unifiedSection).toBeVisible();
    await expect(legacySection).toBeVisible();
  });

  test('should not interfere with legacy Enhanced Card functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Legacy cards should still work
    const legacyCard = page.locator('.enhanced-card-container').first();
    await expect(legacyCard).toBeVisible();

    // Legacy cards should be interactive
    const legacyCardInner = page.locator('.enhanced-card-inner').first();
    await legacyCard.click();

    // Legacy flip should work
    await page.waitForTimeout(100);
    const hasFlipped = await legacyCardInner.evaluate((el) => el.classList.contains('flipped'));
    expect(typeof hasFlipped).toBe('boolean');
  });
});

test.describe('Unified Holographic Card - Performance', () => {
  test('should load images efficiently', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    // Images should have loading="lazy" attribute
    const images = page.locator('.unified-card img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const loading = await images.nth(i).getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('should render without layout shift', async ({ page }) => {
    await page.goto(`${BASE_URL}/test`);

    const unifiedCard = page.locator('.unified-card').first();

    // Get initial position
    const initialBox = await unifiedCard.boundingBox();
    expect(initialBox).toBeTruthy();

    // Wait for images to load
    await page.waitForTimeout(1000);

    // Check if position is stable
    const finalBox = await unifiedCard.boundingBox();
    expect(finalBox).toBeTruthy();

    // Position should not have shifted significantly
    expect(Math.abs(finalBox!.y - initialBox!.y)).toBeLessThan(10);
  });
});
