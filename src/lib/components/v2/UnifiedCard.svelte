<script lang="ts">
  import { onMount } from 'svelte';
  import CardFront from './CardFront.svelte';
  import CardBack from './CardBack.svelte';

  // Card Props
  export let image: string = "https://picsum.photos/400/560?random=1";
  export let title: string = "손흥민";
  export let subtitle: string = "외야수";
  export let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'legendary';
  export let team: 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom' = 'lg';
  export let number: string = "7";
  export let size: 'small' | 'medium' | 'large' | 'featured' = 'large';
  export let effectType: string = ''; // 홀로그래픽 효과 타입 (옵션)

  let cardContainer: HTMLDivElement;
  let cardRotator: HTMLDivElement;
  let isFlipped = false;
  let isInteracting = false;

  // Mouse/Touch position tracking
  let posX = 50;
  let posY = 50;

  function handleMouseMove(e: MouseEvent) {
    if (!cardRotator) return;

    const rect = cardRotator.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    posX = (x / rect.width) * 100;
    posY = (y / rect.height) * 100;

    // Calculate rotation (±15 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = ((centerY - y) / centerY) * 15;

    cardRotator.style.setProperty('--rx', `${rotateY}deg`);
    cardRotator.style.setProperty('--ry', `${rotateX}deg`);
    cardRotator.style.setProperty('--posx', `${posX}%`);
    cardRotator.style.setProperty('--posy', `${posY}%`);

    isInteracting = true;
  }

  function handleMouseLeave() {
    if (!cardRotator) return;

    cardRotator.style.removeProperty('--rx');
    cardRotator.style.removeProperty('--ry');
    cardRotator.style.removeProperty('--posx');
    cardRotator.style.removeProperty('--posy');

    isInteracting = false;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!cardRotator || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = cardRotator.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    posX = (x / rect.width) * 100;
    posY = (y / rect.height) * 100;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = ((centerY - y) / centerY) * 15;

    cardRotator.style.setProperty('--rx', `${rotateY}deg`);
    cardRotator.style.setProperty('--ry', `${rotateX}deg`);
    cardRotator.style.setProperty('--posx', `${posX}%`);
    cardRotator.style.setProperty('--posy', `${posY}%`);

    isInteracting = true;
  }

  function handleTouchEnd() {
    handleMouseLeave();
  }

  function handleClick() {
    isFlipped = !isFlipped;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isFlipped = !isFlipped;
    }
  }
</script>

<div
  class="card"
  class:interacting={isInteracting}
  data-size={size}
  bind:this={cardContainer}
>
  <div class="card__translater">
    <div
      class="card__rotator"
      class:flipped={isFlipped}
      bind:this={cardRotator}
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
      on:click={handleClick}
      on:keydown={handleKeyDown}
      role="button"
      tabindex="0"
      aria-label="{title} 카드 (클릭하여 뒤집기)"
    >
      <!-- Front Face -->
      <CardFront
        {image}
        {title}
        {subtitle}
        {rarity}
        {team}
        {number}
        {effectType}
      />

      <!-- Back Face -->
      <CardBack {team} />
    </div>
  </div>
</div>

<style>
  /* Card Container */
  .card {
    --radius: 4.55% / 3.5%;
    z-index: 10;
    transform: translate3d(0, 0, 0.1px);
    will-change: transform, visibility;
    transform-style: preserve-3d;
    position: relative;
  }

  .card.interacting {
    z-index: 20;
  }

  /* Card Translater - handles scale/position */
  .card__translater {
    width: auto;
    position: relative;
    transform: translate3d(0, 0, 0) scale(1);
    display: grid;
    perspective: 600px;
    transform-origin: center;
    will-change: transform;
  }

  /* Card Rotator - handles 3D rotation */
  .card__rotator {
    --glow-color: #69d1e9;
    --rx: 0deg;
    --ry: 0deg;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    transform: rotateY(var(--rx)) rotateX(var(--ry));
    transform-style: preserve-3d;
    border-radius: var(--radius);
    outline: none;
    cursor: pointer;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;

    box-shadow:
      0 10px 30px -5px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .card__rotator:hover {
    box-shadow:
      0 20px 40px 0px rgba(0, 0, 0, 0.6),
      0 0 20px 0px var(--glow-color);
  }

  .card.interacting .card__rotator {
    box-shadow:
      0 20px 40px 0px rgba(0, 0, 0, 0.6),
      0 0 10px 2px var(--glow-color),
      0 0 30px 0px var(--glow-color);
  }

  .card__rotator:focus-visible {
    outline: 3px solid var(--glow-color);
    outline-offset: 4px;
  }

  /* Flip Animation */
  .card__rotator.flipped {
    transform: rotateY(calc(var(--rx) + 180deg)) rotateX(var(--ry));
  }

  /* All children in same grid cell */
  .card__rotator :global(*) {
    grid-area: 1/1;
    border-radius: var(--radius);
    transform-style: preserve-3d;
  }

  /* Card Sizes */
  .card[data-size="small"] .card__rotator {
    width: 200px;
    height: 280px;
  }

  .card[data-size="medium"] .card__rotator {
    width: 280px;
    height: 392px;
  }

  .card[data-size="large"] .card__rotator {
    width: 360px;
    height: 504px;
  }

  .card[data-size="featured"] .card__rotator {
    width: 480px;
    height: 672px;
  }

  /* GPU Acceleration */
  .card,
  .card__translater,
  .card__rotator {
    transform: translateZ(0);
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .card__rotator {
      transition: none !important;
    }

    .card__rotator:not(.flipped) {
      transform: none !important;
    }

    .card__rotator.flipped {
      transform: rotateY(180deg) !important;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .card[data-size="large"] .card__rotator {
      width: 280px;
      height: 392px;
    }

    .card[data-size="featured"] .card__rotator {
      width: 320px;
      height: 448px;
    }
  }

  @media (max-width: 480px) {
    .card[data-size="medium"] .card__rotator,
    .card[data-size="large"] .card__rotator {
      width: 240px;
      height: 336px;
    }

    .card[data-size="featured"] .card__rotator {
      width: 280px;
      height: 392px;
    }
  }
</style>
