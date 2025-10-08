<script lang="ts">
  import { onMount } from 'svelte';
  import type { FanLevel } from '$lib/data/fan-levels';
  import { getLevelMilestone, badgeGradients } from '$lib/data/fan-levels';
  import { fly, scale, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Props
  export let newLevel: FanLevel;
  export let onClose: () => void;
  export let autoClose: boolean = true;
  export let duration: number = 5000;

  // State
  let visible = false;
  let confettiElements: Array<{ id: number; x: number; y: number; rotation: number; color: string }> = [];

  // Get milestone info
  const milestone = getLevelMilestone(newLevel.level);
  const gradient = badgeGradients[newLevel.level as keyof typeof badgeGradients];

  // Generate confetti
  function generateConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#FFD700', '#FF6B6B'];
    confettiElements = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }

  onMount(() => {
    visible = true;
    generateConfetti();

    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  });

  function handleClose() {
    visible = false;
    setTimeout(onClose, 300); // Wait for exit animation
  }
</script>

{#if visible}
  <!-- Overlay -->
  <div
    class="notification-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    transition:fade={{ duration: 300 }}
    on:click={handleClose}
    on:keypress={(e) => e.key === 'Escape' && handleClose()}
    role="dialog"
    aria-labelledby="level-up-title"
    aria-modal="true"
    data-testid="level-up-notification"
  >
    <!-- Notification Card -->
    <div
      class="notification-card relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full mx-4"
      transition:scale={{ duration: 500, easing: quintOut, start: 0.5 }}
      on:click|stopPropagation
      on:keypress|stopPropagation
      role="presentation"
    >
      <!-- Confetti Animation -->
      <div class="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
        {#each confettiElements as confetti (confetti.id)}
          <div
            class="confetti"
            style="
              left: {confetti.x + 50}%;
              top: -{confetti.y}%;
              background-color: {confetti.color};
              transform: rotate({confetti.rotation}deg);
            "
          />
        {/each}
      </div>

      <!-- Header with Gradient -->
      <div
        class="notification-header relative p-8 text-center bg-gradient-to-br {gradient} text-white"
      >
        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
          on:click={handleClose}
          aria-label="닫기"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Icon -->
        {#if milestone}
          <div class="text-6xl mb-4 animate-bounce" in:scale={{ delay: 200, duration: 600 }}>
            {milestone.icon}
          </div>
        {/if}

        <!-- Title -->
        <h2
          id="level-up-title"
          class="text-3xl font-bold mb-2"
          in:fly={{ y: 20, delay: 300, duration: 400 }}
        >
          레벨 업!
        </h2>

        <!-- New Level -->
        <p class="text-xl font-semibold" in:fly={{ y: 20, delay: 400, duration: 400 }}>
          {newLevel.name}
        </p>
        <p class="text-sm opacity-90 mt-1" in:fly={{ y: 20, delay: 500, duration: 400 }}>
          레벨 {newLevel.level}
        </p>
      </div>

      <!-- Body -->
      <div class="notification-body p-8">
        <!-- Level Badge -->
        <div class="flex justify-center mb-6" in:scale={{ delay: 600, duration: 500 }}>
          <div class="relative">
            <img
              src={newLevel.badgeIcon}
              alt="{newLevel.name} 배지"
              class="w-24 h-24 object-contain"
              on:error={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div
              class="absolute inset-0 rounded-full bg-gradient-to-br {gradient} opacity-20 blur-xl"
            />
          </div>
        </div>

        <!-- Description -->
        <p
          class="text-center text-gray-700 mb-6 leading-relaxed"
          in:fly={{ y: 20, delay: 700, duration: 400 }}
        >
          {newLevel.description}
        </p>

        <!-- Milestone Message -->
        {#if milestone}
          <div
            class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6"
            in:fly={{ y: 20, delay: 800, duration: 400 }}
          >
            <p class="text-sm text-gray-700 text-center">{milestone.message}</p>
          </div>
        {/if}

        <!-- Unlocked Perks -->
        <div class="perks-section" in:fly={{ y: 20, delay: 900, duration: 400 }}>
          <h3 class="text-sm font-semibold text-gray-600 mb-3 text-center">🎁 새로운 혜택</h3>
          <ul class="space-y-2">
            {#each newLevel.perks as perk, i}
              <li
                class="flex items-start space-x-2 text-sm"
                in:fly={{ x: -20, delay: 1000 + i * 100, duration: 400 }}
              >
                <span class="text-green-500 mt-0.5">✓</span>
                <span class="text-gray-700">{perk}</span>
              </li>
            {/each}
          </ul>
        </div>

        <!-- Action Button -->
        <div class="mt-8" in:scale={{ delay: 1200, duration: 400 }}>
          <button
            class="w-full py-3 px-6 rounded-xl bg-gradient-to-r {gradient} text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            on:click={handleClose}
          >
            계속하기 →
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .notification-overlay {
    animation: overlay-fadein 0.3s ease-out;
  }

  @keyframes overlay-fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .notification-card {
    animation: card-slidein 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes card-slidein {
    from {
      transform: scale(0.5) translateY(50px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  /* Confetti Animation */
  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    animation: confetti-fall 3s linear forwards;
    opacity: 0.9;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  /* Pulse animation for badge */
  .notification-body img {
    animation: badge-pulse 2s ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  /* Responsive Design */
  @media (max-width: 480px) {
    .notification-card {
      margin: 1rem;
    }

    .notification-header {
      padding: 2rem 1.5rem;
    }

    .notification-body {
      padding: 1.5rem;
    }

    .notification-header h2 {
      font-size: 1.75rem;
    }

    .notification-header .text-6xl {
      font-size: 3rem;
    }
  }
</style>
