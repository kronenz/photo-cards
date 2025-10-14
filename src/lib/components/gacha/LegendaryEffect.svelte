<script lang="ts">
  import { onMount } from 'svelte';

  export let active = false;
  export let duration = 2000; // ms

  let mounted = false;
  let showFlash = false;
  let showRays = false;
  let showZoom = false;

  onMount(() => {
    mounted = true;
  });

  // Trigger effects when active
  $: if (active && mounted) {
    triggerEffects();
  }

  async function triggerEffects() {
    // 1. Screen flash
    showFlash = true;
    setTimeout(() => {
      showFlash = false;
    }, 500);

    // 2. Golden rays appear
    setTimeout(() => {
      showRays = true;
    }, 200);

    // 3. Zoom effect
    setTimeout(() => {
      showZoom = true;
    }, 300);

    // 4. Cleanup after duration
    setTimeout(() => {
      showRays = false;
      showZoom = false;
    }, duration);
  }
</script>

{#if active && mounted}
  <!-- Screen Flash -->
  <div class="legendary-overlay">
    <div class="screen-flash" class:active={showFlash}></div>

    <!-- Golden Rays -->
    <div class="golden-rays" class:active={showRays}>
      {#each Array(16) as _, i}
        <div class="ray" style="--ray-index: {i}; --total-rays: 16;"></div>
      {/each}
    </div>

    <!-- Center Glow -->
    <div class="center-glow" class:active={showZoom}></div>

    <!-- Sparkles -->
    <div class="sparkles" class:active={showRays}>
      {#each Array(20) as _, i}
        <div
          class="sparkle"
          style="--sparkle-delay: {i * 0.1}s; --sparkle-x: {Math.random() * 100}%; --sparkle-y: {Math.random() * 100}%;"
        ></div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .legendary-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }

  /* Screen Flash */
  .screen-flash {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle,
      rgba(251, 191, 36, 0.8) 0%,
      rgba(251, 191, 36, 0.4) 30%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.2s ease-out;
  }

  .screen-flash.active {
    opacity: 1;
    animation: flash 0.5s ease-out;
  }

  @keyframes flash {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* Golden Rays */
  .golden-rays {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .golden-rays.active {
    opacity: 1;
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  .ray {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 50%;
    background: linear-gradient(
      to bottom,
      rgba(251, 191, 36, 0.8) 0%,
      rgba(251, 191, 36, 0.4) 50%,
      transparent 100%
    );
    transform-origin: top center;
    transform: rotate(calc(var(--ray-index) * (360deg / var(--total-rays)))) translateX(-50%);
    animation: rayPulse 2s ease-in-out infinite;
    animation-delay: calc(var(--ray-index) * 0.1s);
  }

  @keyframes rayPulse {
    0%,
    100% {
      opacity: 0.6;
      height: 50%;
    }
    50% {
      opacity: 1;
      height: 60%;
    }
  }

  /* Center Glow */
  .center-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%) scale(0);
    background: radial-gradient(
      circle,
      rgba(251, 191, 36, 0.6) 0%,
      rgba(251, 191, 36, 0.3) 30%,
      rgba(251, 191, 36, 0.1) 60%,
      transparent 100%
    );
    border-radius: 50%;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .center-glow.active {
    opacity: 1;
    transform: translate(-50%, -50%) scale(2);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0.6;
    }
    50% {
      transform: translate(-50%, -50%) scale(2.2);
      opacity: 1;
    }
  }

  /* Sparkles */
  .sparkles {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .sparkles.active {
    opacity: 1;
  }

  .sparkle {
    position: absolute;
    left: var(--sparkle-x);
    top: var(--sparkle-y);
    width: 4px;
    height: 4px;
    background: #fbbf24;
    border-radius: 50%;
    box-shadow: 0 0 10px #fbbf24, 0 0 20px #fbbf24;
    animation: sparkle 2s ease-in-out infinite;
    animation-delay: var(--sparkle-delay);
    opacity: 0;
  }

  @keyframes sparkle {
    0%,
    100% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    10% {
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }
    90% {
      opacity: 1;
      transform: scale(1) rotate(540deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .center-glow {
      width: 200px;
      height: 200px;
    }

    .ray {
      width: 3px;
    }

    .sparkle {
      width: 3px;
      height: 3px;
    }
  }
</style>
