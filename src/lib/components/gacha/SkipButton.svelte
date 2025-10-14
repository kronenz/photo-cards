<script lang="ts">
  import { onMount } from 'svelte';
  import { gachaState, gachaActions } from '$lib/stores/gachaStore';

  export let visible = false;

  let mounted = false;

  function handleSkip() {
    gachaActions.skipAnimation();
  }

  onMount(() => {
    mounted = true;

    // Handle keyboard shortcuts
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.key === ' ') {
        if ($gachaState.canSkip && !$gachaState.isSkipping) {
          event.preventDefault();
          handleSkip();
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  $: canSkip = $gachaState.canSkip;
  $: isSkipping = $gachaState.isSkipping;
</script>

{#if visible && canSkip && mounted}
  <button
    class="skip-button"
    class:skipping={isSkipping}
    on:click={handleSkip}
    disabled={isSkipping}
  >
    <span class="skip-icon">⏩</span>
    <span class="skip-text">{isSkipping ? '스킵 중...' : '스킵'}</span>
    <span class="skip-hint">ESC / Space</span>
  </button>
{/if}

<style>
  .skip-button {
    position: fixed;
    bottom: 40px;
    right: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 28px;
    background: linear-gradient(135deg,
      rgba(30, 30, 40, 0.95) 0%,
      rgba(20, 20, 30, 0.98) 100%
    );
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(102, 126, 234, 0.3);
    backdrop-filter: blur(12px);
    z-index: 100;
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .skip-button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    border-color: rgba(102, 126, 234, 0.6);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(102, 126, 234, 0.5);
  }

  .skip-button:active:not(:disabled) {
    transform: translateY(0) scale(1);
  }

  .skip-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skip-button.skipping {
    animation: skipping 0.8s ease-in-out infinite;
  }

  @keyframes skipping {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .skip-icon {
    font-size: 20px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .skip-text {
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .skip-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-weight: 500;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .skip-button {
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      font-size: 14px;
    }

    .skip-icon {
      font-size: 18px;
    }

    .skip-hint {
      display: none;
    }
  }
</style>
