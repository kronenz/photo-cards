<!--
  Loading Overlay Component
  Feature: 004-production-service-integration (T062)

  Full-screen or container loading overlay with spinner
-->
<script lang="ts">
  export let message: string = '로딩 중...';
  export let fullscreen: boolean = false;
  export let transparent: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<div
  class="loading-overlay"
  class:fullscreen
  class:transparent
  role="status"
  aria-live="polite"
>
  <div class="loading-content">
    <div class="spinner {size}">
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
    {#if message}
      <p class="loading-message">{message}</p>
    {/if}
  </div>
</div>

<style>
  .loading-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    background: rgba(10, 10, 15, 0.9);
    backdrop-filter: blur(4px);
    border-radius: 16px;
  }

  .loading-overlay.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    border-radius: 0;
    background: rgba(10, 10, 15, 0.95);
  }

  .loading-overlay.transparent {
    background: transparent;
    backdrop-filter: none;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .spinner {
    color: #667eea;
  }

  .spinner.sm {
    width: 32px;
    height: 32px;
  }

  .spinner.md {
    width: 48px;
    height: 48px;
  }

  .spinner.lg {
    width: 64px;
    height: 64px;
  }

  .spinner svg {
    width: 100%;
    height: 100%;
    animation: spin 1s linear infinite;
  }

  .spinner circle {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }

  .loading-message {
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
