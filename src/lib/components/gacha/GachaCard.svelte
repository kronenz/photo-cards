<script lang="ts">
  import { onMount } from 'svelte';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
  import ParticleSystem from './ParticleSystem.svelte';
  import type { GachaCard as GachaCardType } from '$lib/gacha/types';

  export let card: GachaCardType;
  export let revealed = false;
  export let index = 0;
  export let onReveal: (() => void) | null = null;

  let flipped = false;
  let mounted = false;
  let showParticles = false;

  // Reveal animation with delay based on index
  $: if (revealed && !flipped && mounted) {
    const delay = index * 150; // Stagger by 150ms
    setTimeout(() => {
      flipped = true;

      // Trigger particles on flip
      setTimeout(() => {
        showParticles = true;
        // Stop particles after animation
        setTimeout(() => {
          showParticles = false;
        }, 2000);
      }, 400); // Start particles mid-flip

      if (onReveal) {
        setTimeout(onReveal, 800); // Call after flip animation
      }
    }, delay);
  }

  onMount(() => {
    mounted = true;
  });

  // Rarity colors
  const rarityColors = {
    common: 'rgba(156, 163, 175, 0.8)',
    rare: 'rgba(59, 130, 246, 0.8)',
    epic: 'rgba(168, 85, 247, 0.8)',
    legendary: 'rgba(251, 191, 36, 0.8)'
  };

  const rarityGlows = {
    common: '0 0 20px rgba(156, 163, 175, 0.3)',
    rare: '0 0 30px rgba(59, 130, 246, 0.5)',
    epic: '0 0 40px rgba(168, 85, 247, 0.6)',
    legendary: '0 0 60px rgba(251, 191, 36, 0.8), 0 0 100px rgba(251, 191, 36, 0.4)'
  };

  $: rarityColor = rarityColors[card.rarity] || rarityColors.common;
  $: rarityGlow = rarityGlows[card.rarity] || rarityGlows.common;
</script>

<div class="gacha-card-wrapper">
  <div class="gacha-card" class:flipped style="--reveal-delay: {index * 150}ms;">
    <!-- Front: Mystery Card -->
    <div class="card-face card-front" style="box-shadow: {rarityGlow};">
      <div class="mystery-background">
        <div class="mystery-circles">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
        <div class="mystery-icon">?</div>
        <div class="mystery-shine"></div>
      </div>
      <div class="rarity-indicator" style="background: {rarityColor};">
        {card.rarity.toUpperCase()}
      </div>
    </div>

    <!-- Back: Revealed Card -->
    <div class="card-face card-back">
      <div class="unified-card-wrapper">
        <UnifiedCard
          image={card.image || 'https://picsum.photos/400/560?random=1'}
          title={card.title}
          subtitle={card.subtitle || '선수'}
          team={card.teamId || 'lg'}
          number={card.number || '0'}
          rarity={card.rarity}
          size="medium"
        />
      </div>
      {#if card.isNew}
        <div class="new-badge">NEW!</div>
      {/if}
      {#if card.guaranteeType}
        <div class="guarantee-badge">
          {card.guaranteeType === 'pity' ? '천장 보장' : '보너스'}
        </div>
      {/if}
    </div>
  </div>

  <!-- Particle System -->
  <ParticleSystem rarity={card.rarity} active={showParticles} x={50} y={50} />
</div>

<style>
  .gacha-card-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 2.5 / 3.5;
    max-width: 280px;
  }

  .gacha-card {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.33, 1, 0.68, 1);
    animation: cardEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: var(--reveal-delay);
  }

  @keyframes cardEntrance {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(30px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .gacha-card.flipped {
    transform: rotateY(180deg);
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 20px;
    overflow: hidden;
  }

  .card-front {
    background: linear-gradient(
      135deg,
      rgba(26, 26, 46, 0.95) 0%,
      rgba(15, 15, 30, 0.98) 100%
    );
    border: 2px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .mystery-background {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mystery-circles {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(102, 126, 234, 0.3) 0%,
      transparent 70%
    );
    animation: float 6s ease-in-out infinite;
  }

  .circle-1 {
    width: 150px;
    height: 150px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 100px;
    height: 100px;
    bottom: 15%;
    right: 15%;
    animation-delay: 2s;
  }

  .circle-3 {
    width: 80px;
    height: 80px;
    top: 50%;
    right: 10%;
    animation-delay: 4s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-20px) scale(1.1);
      opacity: 0.5;
    }
  }

  .mystery-icon {
    font-size: 120px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 0 40px rgba(102, 126, 234, 0.8), 0 0 80px rgba(118, 75, 162, 0.6);
    animation: pulse 2s ease-in-out infinite;
    z-index: 2;
    position: relative;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .mystery-shine {
    position: absolute;
    inset: -50%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: translateX(-100%) rotate(45deg);
    animation: shine 3s ease-in-out infinite;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) rotate(45deg);
    }
    50%,
    100% {
      transform: translateX(200%) rotate(45deg);
    }
  }

  .rarity-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    color: white;
    letter-spacing: 1px;
    backdrop-filter: blur(8px);
    z-index: 3;
    animation: rarityPulse 2s ease-in-out infinite;
  }

  @keyframes rarityPulse {
    0%,
    100% {
      box-shadow: 0 0 10px currentColor;
    }
    50% {
      box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
    }
  }

  .card-back {
    transform: rotateY(180deg);
    position: relative;
  }

  .unified-card-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .unified-card-wrapper :global(.unified-card) {
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
  }

  .unified-card-wrapper :global(.card-container) {
    width: 100% !important;
    height: 100% !important;
  }

  .unified-card-wrapper :global(.holographic-card) {
    width: 100% !important;
    height: 100% !important;
  }

  .new-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    animation: newBadgePulse 1.5s ease-in-out infinite;
    z-index: 10;
  }

  @keyframes newBadgePulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .guarantee-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    z-index: 10;
  }

  /* Legendary special effects */
  .gacha-card.flipped :global(.card-back) {
    animation: revealGlow 1s ease-out;
  }

  @keyframes revealGlow {
    0% {
      box-shadow: 0 0 0 rgba(251, 191, 36, 0);
    }
    50% {
      box-shadow: 0 0 60px rgba(251, 191, 36, 0.8);
    }
    100% {
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .gacha-card-wrapper {
      max-width: 160px;
    }

    .mystery-icon {
      font-size: 80px;
    }

    .rarity-indicator {
      font-size: 11px;
      padding: 6px 14px;
      bottom: 12px;
    }
  }

  @media (max-width: 480px) {
    .gacha-card-wrapper {
      max-width: 140px;
    }

    .mystery-icon {
      font-size: 60px;
    }
  }
</style>
