/**
 * Performance Monitoring Utilities for 60fps Validation
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Monitor and enforce 60fps performance standard (NON-NEGOTIABLE)
 */

// ===== FPS MEASUREMENT =====

export interface FPSMeasurement {
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  frameDrops: number;
  longTasks: number; // Tasks > 50ms
  timestamp: Date;
}

/**
 * FPS Monitor using requestAnimationFrame
 */
export class FPSMonitor {
  private fps: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private frameDrops: number = 0;
  private longTasks: number = 0;
  private rafId: number | null = null;
  private isRunning: boolean = false;

  private readonly targetFPS = 60;
  private readonly targetFrameTime = 1000 / 60; // 16.67ms
  private readonly longTaskThreshold = 50; // >50ms is a long task

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.fps = [];
    this.frameCount = 0;
    this.frameDrops = 0;
    this.longTasks = 0;

    this.measureFrame();
  }

  stop(): FPSMeasurement {
    if (!this.isRunning) {
      throw new Error('FPSMonitor not running');
    }

    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    return this.getMeasurement();
  }

  private measureFrame = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;

    if (delta > 0) {
      const currentFPS = 1000 / delta;
      this.fps.push(currentFPS);
      this.frameCount++;

      // Detect frame drops (FPS < 55 is considered a drop)
      if (currentFPS < 55) {
        this.frameDrops++;
      }

      // Detect long tasks (frame time > 50ms)
      if (delta > this.longTaskThreshold) {
        this.longTasks++;
      }
    }

    this.lastFrameTime = now;
    this.rafId = requestAnimationFrame(this.measureFrame);
  };

  getMeasurement(): FPSMeasurement {
    if (this.fps.length === 0) {
      return {
        avgFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        frameDrops: 0,
        longTasks: 0,
        timestamp: new Date(),
      };
    }

    const avgFPS = this.fps.reduce((sum, fps) => sum + fps, 0) / this.fps.length;
    const minFPS = Math.min(...this.fps);
    const maxFPS = Math.max(...this.fps);

    return {
      avgFPS,
      minFPS,
      maxFPS,
      frameDrops: this.frameDrops,
      longTasks: this.longTasks,
      timestamp: new Date(),
    };
  }

  reset(): void {
    this.fps = [];
    this.frameCount = 0;
    this.frameDrops = 0;
    this.longTasks = 0;
  }
}

// ===== PERFORMANCE VALIDATION =====

export interface PerformanceReport {
  passed: boolean;
  avgFPS: number;
  minFPS: number;
  frameDropRate: number; // % of frames dropped
  longTaskRate: number; // % of frames with long tasks
  violations: string[];
}

/**
 * Validate FPS measurement against 60fps standard
 */
export function validateFPS(measurement: FPSMeasurement): PerformanceReport {
  const violations: string[] = [];
  let passed = true;

  // Rule 1: Average FPS must be ≥55 (allowing small variance)
  if (measurement.avgFPS < 55) {
    violations.push(`Average FPS ${measurement.avgFPS.toFixed(2)} is below 55 (target: 60)`);
    passed = false;
  }

  // Rule 2: Minimum FPS should be ≥30 (critical drops)
  if (measurement.minFPS < 30) {
    violations.push(`Minimum FPS ${measurement.minFPS.toFixed(2)} is below 30 (critical drop)`);
    passed = false;
  }

  // Rule 3: Frame drop rate should be <5%
  const totalFrames = measurement.avgFPS * 1; // Approximate total frames
  const frameDropRate = (measurement.frameDrops / totalFrames) * 100;
  if (frameDropRate > 5) {
    violations.push(
      `Frame drop rate ${frameDropRate.toFixed(2)}% exceeds 5% (${measurement.frameDrops} drops)`
    );
    passed = false;
  }

  // Rule 4: Long tasks should be 0 (NON-NEGOTIABLE for 60fps)
  if (measurement.longTasks > 0) {
    violations.push(`${measurement.longTasks} long tasks detected (>50ms frame time)`);
    passed = false;
  }

  return {
    passed,
    avgFPS: measurement.avgFPS,
    minFPS: measurement.minFPS,
    frameDropRate,
    longTaskRate: (measurement.longTasks / totalFrames) * 100,
    violations,
  };
}

// ===== CHROME DEVTOOLS INTEGRATION =====

/**
 * Measure performance using Chrome Performance API
 */
export function measureInteractionPerformance(
  interactionName: string,
  callback: () => void | Promise<void>
): void {
  if (typeof performance === 'undefined' || !performance.mark) {
    console.warn('Performance API not available');
    callback();
    return;
  }

  const startMark = `${interactionName}-start`;
  const endMark = `${interactionName}-end`;
  const measureName = `${interactionName}-measure`;

  performance.mark(startMark);

  const result = callback();

  if (result instanceof Promise) {
    result.finally(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      console.log(`[Performance] ${interactionName}: ${measure.duration.toFixed(2)}ms`);

      // Clean up
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    });
  } else {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`[Performance] ${interactionName}: ${measure.duration.toFixed(2)}ms`);

    // Clean up
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  }
}

// ===== FPS OVERLAY (DEV MODE) =====

export interface FPSOverlayOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  updateInterval?: number; // ms
}

/**
 * Create FPS overlay for development mode
 */
export function createFPSOverlay(options: FPSOverlayOptions = {}): () => void {
  const { position = 'top-right', updateInterval = 100 } = options;

  const overlay = document.createElement('div');
  overlay.id = 'fps-overlay';
  overlay.style.cssText = `
    position: fixed;
    ${position.includes('top') ? 'top: 16px;' : 'bottom: 16px;'}
    ${position.includes('right') ? 'right: 16px;' : 'left: 16px;'}
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'SF Mono', 'Monaco', monospace;
    font-size: 14px;
    z-index: 9999;
    pointer-events: none;
    backdrop-filter: blur(8px);
  `;

  document.body.appendChild(overlay);

  const monitor = new FPSMonitor();
  monitor.start();

  const intervalId = setInterval(() => {
    const measurement = monitor.getMeasurement();
    const avgFPS = measurement.avgFPS.toFixed(1);
    const minFPS = measurement.minFPS.toFixed(1);

    // Color coding: green (≥55), yellow (45-55), red (<45)
    const color =
      measurement.avgFPS >= 55 ? '#00ff00' : measurement.avgFPS >= 45 ? '#ffff00' : '#ff0000';

    overlay.style.color = color;
    overlay.textContent = `FPS: ${avgFPS} (min: ${minFPS}) | Drops: ${measurement.frameDrops}`;
  }, updateInterval);

  // Return cleanup function
  return () => {
    monitor.stop();
    clearInterval(intervalId);
    overlay.remove();
  };
}

// ===== PERFORMANCE BUDGET =====

export interface PerformanceBudget {
  targetFPS: number; // 60
  maxFrameTime: number; // 16.67ms
  maxLongTasks: number; // 0
  maxFrameDropRate: number; // 5%
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  targetFPS: 60,
  maxFrameTime: 16.67,
  maxLongTasks: 0,
  maxFrameDropRate: 5,
};

/**
 * Check if performance meets budget requirements
 */
export function checkPerformanceBudget(
  measurement: FPSMeasurement,
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (measurement.avgFPS < budget.targetFPS - 5) {
    violations.push(`Average FPS ${measurement.avgFPS} below target ${budget.targetFPS}`);
  }

  if (measurement.longTasks > budget.maxLongTasks) {
    violations.push(`${measurement.longTasks} long tasks (max: ${budget.maxLongTasks})`);
  }

  const frameDropRate = (measurement.frameDrops / measurement.avgFPS) * 100;
  if (frameDropRate > budget.maxFrameDropRate) {
    violations.push(`Frame drop rate ${frameDropRate.toFixed(2)}% (max: ${budget.maxFrameDropRate}%)`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
