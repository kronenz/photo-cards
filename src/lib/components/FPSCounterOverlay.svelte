<!--
  FPS Counter Overlay Component
  
  Feature: 002-integrated-holographic-platform
  Task: T049 [US5]
  
  Purpose: Development mode FPS counter overlay for performance monitoring
  - Real-time FPS display
  - Frame drop tracking
  - Performance budget validation
  - Color-coded status indicators
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { createFPSOverlay, type FPSOverlayOptions } from '$lib/utils/performance';
  import { dev } from '$app/environment';

  // Props
  export let enabled: boolean = dev; // Only show in development mode by default
  export let position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-right';
  export let updateInterval: number = 100; // Update every 100ms
  export let showDetails: boolean = true; // Show detailed metrics
  export let autoHide: boolean = false; // Auto-hide after 5 seconds
  export let autoHideDelay: number = 5000;

  // State
  let overlayElement: HTMLDivElement;
  let cleanup: (() => void) | null = null;
  let isVisible = true;

  // FPS data
  let currentFPS = 0;
  let minFPS = 0;
  let frameDrops = 0;
  let longTasks = 0;
  let avgFrameTime = 0;

  // Color coding based on performance
  $: statusColor = getStatusColor(currentFPS);
  $: statusText = getStatusText(currentFPS);

  function getStatusColor(fps: number): string {
    if (fps >= 55) return '#00ff00'; // Green - Good
    if (fps >= 45) return '#ffff00'; // Yellow - Warning
    return '#ff0000'; // Red - Poor
  }

  function getStatusText(fps: number): string {
    if (fps >= 55) return 'EXCELLENT';
    if (fps >= 45) return 'WARNING';
    return 'POOR';
  }

  function initializeOverlay() {
    if (!browser || !enabled || cleanup) return;

    const options: FPSOverlayOptions = {
      position,
      updateInterval
    };

    cleanup = createFPSOverlay(options);

    // Set up custom overlay with more details
    const overlay = document.getElementById('fps-overlay');
    if (overlay) {
      overlayElement = overlay as HTMLDivElement;
      
      // Enhanced styling
      overlayElement.style.cssText = `
        position: fixed;
        ${position.includes('top') ? 'top: 16px;' : 'bottom: 16px;'}
        ${position.includes('right') ? 'right: 16px;' : 'left: 16px;'}
        background: rgba(0, 0, 0, 0.85);
        color: ${statusColor};
        padding: 12px 16px;
        border-radius: 8px;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-size: 13px;
        font-weight: 600;
        z-index: 9999;
        pointer-events: none;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        min-width: 200px;
        transition: all 0.3s ease;
      `;

      // Start monitoring
      startMonitoring();
    }

    // Auto-hide if enabled
    if (autoHide) {
      setTimeout(() => {
        hideOverlay();
      }, autoHideDelay);
    }
  }

  function startMonitoring() {
    if (!overlayElement) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsHistory: number[] = [];
    let drops = 0;
    let longTaskCount = 0;

    function updateFPS() {
      if (!overlayElement || !isVisible) return;

      const now = performance.now();
      const delta = now - lastTime;
      
      if (delta > 0) {
        const fps = 1000 / delta;
        fpsHistory.push(fps);
        
        // Keep only last 60 frames for average
        if (fpsHistory.length > 60) {
          fpsHistory.shift();
        }

        // Calculate metrics
        currentFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
        minFPS = Math.min(...fpsHistory);
        avgFrameTime = delta;

        // Detect frame drops (FPS < 55)
        if (fps < 55) {
          drops++;
        }

        // Detect long tasks (>16.67ms for 60fps)
        if (delta > 16.67) {
          longTaskCount++;
        }

        frameDrops = drops;
        longTasks = longTaskCount;

        // Update display
        updateDisplay();
      }

      lastTime = now;
      frameCount++;
      requestAnimationFrame(updateFPS);
    }

    requestAnimationFrame(updateFPS);
  }

  function updateDisplay() {
    if (!overlayElement) return;

    const fpsText = currentFPS.toFixed(1);
    const minFpsText = minFPS.toFixed(1);
    const frameTimeText = avgFrameTime.toFixed(2);

    let content = `FPS: ${fpsText} (min: ${minFpsText})`;
    
    if (showDetails) {
      content += `\nFrame: ${frameTimeText}ms`;
      content += `\nDrops: ${frameDrops}`;
      content += `\nLong: ${longTasks}`;
      content += `\nStatus: ${statusText}`;
    }

    overlayElement.textContent = content;
    overlayElement.style.color = statusColor;
  }

  function hideOverlay() {
    isVisible = false;
    if (overlayElement) {
      overlayElement.style.opacity = '0';
      overlayElement.style.transform = 'translateY(-10px)';
    }
  }

  function showOverlay() {
    isVisible = true;
    if (overlayElement) {
      overlayElement.style.opacity = '1';
      overlayElement.style.transform = 'translateY(0)';
    }
  }

  function toggleOverlay() {
    if (isVisible) {
      hideOverlay();
    } else {
      showOverlay();
    }
  }

  // Keyboard shortcut to toggle overlay (Ctrl+Shift+F)
  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      toggleOverlay();
    }
  }

  onMount(() => {
    if (browser) {
      initializeOverlay();
      document.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
    if (browser) {
      document.removeEventListener('keydown', handleKeydown);
    }
  });

  // Reactive updates
  $: if (enabled && browser && !cleanup) {
    initializeOverlay();
  }

  $: if (!enabled && cleanup) {
    cleanup();
    cleanup = null;
  }
</script>

<!-- This component doesn't render anything visible - it creates an overlay programmatically -->
<!-- The overlay is created and managed via JavaScript in the script section -->

<style>
  /* No styles needed - overlay is created programmatically */
</style>
