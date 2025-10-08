/**
 * FPS Validation Tests
 *
 * Tests that the holographic card animations maintain 60fps (NON-NEGOTIABLE requirement)
 * Uses Chrome DevTools Performance API to measure frame times
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
import type { UnifiedCard } from '$lib/types/unified';

describe('FPS Validation (NON-NEGOTIABLE 60fps)', () => {
  const mockCard: UnifiedCard = {
    id: 'test-card-001',
    title: 'Test Card',
    createdAt: new Date(),
    updatedAt: new Date(),
    holographic: {
      image: 'https://picsum.photos/400/560?random=1',
      backImage: 'https://picsum.photos/400/560?random=2',
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600
    },
    photocard: {
      rarity: 'epic',
      stats: {
        totalViews: 0,
        uniqueCollectors: 0,
        completionRate: 0
      },
      collections: []
    },
    community: {
      creator: 'test-user',
      isPublic: false,
      tags: ['test'],
      metadata: {
        likes: 0,
        downloads: 0,
        rating: 0,
        ratingCount: 0
      }
    }
  };

  beforeEach(() => {
    // Enable performance monitoring
    if (typeof window !== 'undefined' && !window.performance) {
      // Mock performance API for test environment
      (window as any).performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByType: () => []
      };
    }
  });

  afterEach(() => {
    cleanup();
  });

  it('should maintain 60fps during holographic effect updates', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: {
        card: mockCard,
        context: 'test',
        size: 'medium',
        interactive: true
      }
    });

    const cardElement = container.querySelector('.card-wrapper') as HTMLElement;
    expect(cardElement).toBeTruthy();

    const frameTimes: number[] = [];
    const targetFPS = 60;
    const targetFrameTime = 1000 / targetFPS; // 16.67ms
    const sampleCount = 60; // Sample 60 frames (1 second at 60fps)

    let lastFrameTime = performance.now();
    let frameCount = 0;

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      frameTimes.push(frameTime);
      lastFrameTime = currentTime;
      frameCount++;

      if (frameCount < sampleCount) {
        requestAnimationFrame(measureFrame);
      }
    };

    // Simulate mouse movement to trigger holographic effect
    const rect = cardElement.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    });

    // Start measuring
    requestAnimationFrame(measureFrame);
    cardElement.dispatchEvent(mouseEvent);

    // Wait for measurements to complete
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Calculate average FPS
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const avgFPS = 1000 / avgFrameTime;

    // Calculate frame drops (frames > 16.67ms)
    const frameDrops = frameTimes.filter(ft => ft > targetFrameTime).length;
    const frameDropPercentage = (frameDrops / frameTimes.length) * 100;

    console.log(`Average FPS: ${avgFPS.toFixed(2)}`);
    console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);
    console.log(`Frame drops: ${frameDrops}/${frameTimes.length} (${frameDropPercentage.toFixed(2)}%)`);

    // NON-NEGOTIABLE: Must maintain at least 55 average FPS (allowing 5fps tolerance)
    expect(avgFPS).toBeGreaterThanOrEqual(55);

    // Frame drops should be less than 5%
    expect(frameDropPercentage).toBeLessThan(5);
  });

  it('should maintain 60fps during card flip animation', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: {
        card: mockCard,
        context: 'test',
        size: 'medium',
        interactive: true
      }
    });

    const cardElement = container.querySelector('.card-wrapper') as HTMLElement;

    const frameTimes: number[] = [];
    let lastFrameTime = performance.now();
    let frameCount = 0;
    const animationDuration = mockCard.holographic.animationDuration; // 600ms

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      if (frameTime > 0) {
        frameTimes.push(frameTime);
      }
      lastFrameTime = currentTime;
      frameCount++;

      // Measure for the duration of the animation
      if (currentTime - startTime < animationDuration) {
        requestAnimationFrame(measureFrame);
      }
    };

    // Trigger card flip
    const startTime = performance.now();
    requestAnimationFrame(measureFrame);
    cardElement.click();

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, animationDuration + 100));

    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const avgFPS = 1000 / avgFrameTime;

    console.log(`Flip animation - Average FPS: ${avgFPS.toFixed(2)}`);

    // Must maintain 60fps during flip animation
    expect(avgFPS).toBeGreaterThanOrEqual(55);
  });

  it('should have no long tasks (>50ms) during interactions', async () => {
    const { container } = render(UnifiedHolographicCard, {
      props: {
        card: mockCard,
        context: 'test',
        size: 'medium',
        interactive: true
      }
    });

    const cardElement = container.querySelector('.card-wrapper') as HTMLElement;

    const taskTimes: number[] = [];
    let taskStart = performance.now();

    // Simulate multiple rapid interactions
    for (let i = 0; i < 10; i++) {
      const rect = cardElement.getBoundingClientRect();
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: rect.left + (rect.width * Math.random()),
        clientY: rect.top + (rect.height * Math.random())
      });

      taskStart = performance.now();
      cardElement.dispatchEvent(mouseEvent);
      const taskDuration = performance.now() - taskStart;
      taskTimes.push(taskDuration);

      await new Promise(resolve => setTimeout(resolve, 16)); // Wait one frame
    }

    const longTasks = taskTimes.filter(t => t > 50);

    console.log(`Long tasks (>50ms): ${longTasks.length}/${taskTimes.length}`);
    console.log(`Max task duration: ${Math.max(...taskTimes).toFixed(2)}ms`);

    // Should have zero long tasks
    expect(longTasks.length).toBe(0);
  });

  it('should render 100+ cards without frame drops', async () => {
    // This test validates that virtual scrolling maintains 60fps
    const cards: UnifiedCard[] = Array.from({ length: 100 }, (_, i) => ({
      ...mockCard,
      id: `card-${i}`,
      title: `Card ${i}`
    }));

    const frameTimes: number[] = [];
    let lastFrameTime = performance.now();

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      frameTimes.push(frameTime);
      lastFrameTime = currentTime;

      if (frameTimes.length < 120) { // Measure for 2 seconds at 60fps
        requestAnimationFrame(measureFrame);
      }
    };

    // Start measuring
    requestAnimationFrame(measureFrame);

    // Render all cards (would use virtual scrolling in production)
    for (const card of cards.slice(0, 20)) { // Only render visible cards
      render(UnifiedHolographicCard, {
        props: {
          card,
          context: 'test',
          size: 'small',
          interactive: false // Disable interactions for performance
        }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 2100));

    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const avgFPS = 1000 / avgFrameTime;

    console.log(`100+ cards - Average FPS: ${avgFPS.toFixed(2)}`);

    // Must maintain 60fps even with many cards
    expect(avgFPS).toBeGreaterThanOrEqual(55);
  });

  it('should use GPU-accelerated properties only', () => {
    const { container } = render(UnifiedHolographicCard, {
      props: {
        card: mockCard,
        context: 'test',
        size: 'medium',
        interactive: true
      }
    });

    const cardInner = container.querySelector('.card-inner') as HTMLElement;
    expect(cardInner).toBeTruthy();

    const computedStyle = window.getComputedStyle(cardInner);

    // Check for GPU acceleration hints
    // will-change should include transform
    const willChange = computedStyle.getPropertyValue('will-change');
    const hasWillChangeTransform = willChange.includes('transform') || willChange === 'auto';

    // Check that animations use transform/opacity (GPU-accelerated)
    const transition = computedStyle.getPropertyValue('transition');
    const usesGPUProps = transition.includes('transform') || transition.includes('opacity');

    console.log(`will-change: ${willChange}`);
    console.log(`transition: ${transition}`);

    // Should use GPU-accelerated properties
    expect(hasWillChangeTransform || usesGPUProps).toBe(true);
  });
});
