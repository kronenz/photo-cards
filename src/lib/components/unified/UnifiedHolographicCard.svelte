<script lang="ts">
  /**
   * UnifiedHolographicCard Component
   *
   * Feature: 002-integrated-holographic-platform
   * Purpose: Unified card component integrating v2-prototype advanced effects with Phase 1, 2, 4 data models
   *
   * Integrates:
   * - v2-prototype's sophisticated holographic effects and 3D rotations
   * - Phase 1: Enhanced Card Interaction (overlay/soft-light effects)
   * - Phase 2: Photocard data (rarity, collections, stats)
   * - Phase 4: Community features (likes, ratings, creator)
   *
   * Key Features:
   * - Advanced holographic effects with 3D rotation (±15deg tilt)
   * - Y-axis card flip animation (180deg)
   * - Unified pointer events (mouse + touch)
   * - Context-aware rendering (test/main/gallery/community)
   * - Size variants (small/medium/large/featured)
   * - Accessibility (WCAG 2.1 AA, keyboard navigation)
   * - 60fps performance (CSS transforms only)
   */

  import { setContext, onMount } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import type { UnifiedCard, CardContext } from '$lib/types/unified';
  import { throttle } from '$lib/utils/mobileOptimization';

  // ===== PROPS =====

  export let card: UnifiedCard;
  export let context: CardContext = 'main';
  export let size: 'small' | 'medium' | 'large' | 'featured' = 'medium';
  export let interactive: boolean = true;
  export let showMetadata: boolean = context === 'community';
  export let enableHolographic: boolean = true;
  export let enableFlip: boolean = true;

  let className: string = '';
  export { className as class };

  // ===== LOCAL STATE =====

  const isFlipped: Writable<boolean> = writable(card.holographic.isFlipped);
  const isAnimating: Writable<boolean> = writable(false);
  const holographicParams: Writable<{ x: number; y: number }> = writable({ x: 50, y: 50 });

  let cardRotator: HTMLDivElement;
  let isInteracting = false;

  // Mouse/Touch 3D rotation values
  let rotateX = 0;
  let rotateY = 0;

  // Throttled mouse handler for 60fps performance
  let throttledPointerMove: ((e: PointerEvent) => void) | null = null;

  // Image error handling state
  let frontImageError = false;
  let backImageError = false;
  let frontImageLoading = true;
  let backImageLoading = true;

  // ===== CONTEXT API =====

  setContext('card-context', {
    isFlipped,
    isAnimating,
    holographicParams,
    flip: () => {
      if (!enableFlip || $isAnimating) return;
      $isAnimating = true;
      $isFlipped = !$isFlipped;
      setTimeout(() => ($isAnimating = false), card.holographic.animationDuration);
    },
    reset: () => {
      $isFlipped = false;
      isInteracting = false;
      rotateX = 0;
      rotateY = 0;
    },
  });

  // ===== SIZE CONFIGURATIONS =====

  const sizeConfig = {
    small: { width: 200, height: 280, fontSize: 'text-sm' },
    medium: { width: 300, height: 420, fontSize: 'text-base' },
    large: { width: 400, height: 560, fontSize: 'text-lg' },
    featured: { width: 600, height: 840, fontSize: 'text-xl' },
  };

  $: currentSize = sizeConfig[size];

  // ===== EVENT HANDLERS (v2-prototype advanced effects) =====

  // Initialize throttled pointer move handler
  function initializeThrottledHandler() {
    if (throttledPointerMove) return;
    
    throttledPointerMove = throttle((e: PointerEvent) => {
      if (!interactive || !enableHolographic || !cardRotator) return;

      const rect = cardRotator.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized position (0-100%)
      const posX = (x / rect.width) * 100;
      const posY = (y / rect.height) * 100;
      $holographicParams = { x: posX, y: posY };

      // 3D rotation effect (±15 degrees)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      rotateY = ((x - centerX) / centerX) * 15;
      rotateX = ((centerY - y) / centerY) * 15;

      isInteracting = true;
    }, 16); // 16ms throttle for 60fps performance
  }

  function handlePointerMove(e: PointerEvent) {
    // Initialize throttled handler if not already done
    if (!throttledPointerMove) {
      initializeThrottledHandler();
    }
    
    // Use throttled version
    throttledPointerMove!(e);
  }

  function handlePointerLeave() {
    if (!interactive || !enableHolographic) return;

    $holographicParams = { x: 50, y: 50 };
    rotateX = 0;
    rotateY = 0;
    isInteracting = false;
  }

  function handleClick() {
    if (!interactive || !enableFlip || $isAnimating) return;

    $isAnimating = true;
    $isFlipped = !$isFlipped;

    setTimeout(() => ($isAnimating = false), card.holographic.animationDuration);
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (!interactive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape' && $isFlipped) {
      e.preventDefault();
      $isFlipped = false;
    }
  }

  // ===== IMAGE ERROR HANDLING =====

  function handleFrontImageLoad() {
    frontImageLoading = false;
    frontImageError = false;
  }

  function handleFrontImageError(e: Event) {
    console.error('Failed to load front image:', card.holographic.image);
    frontImageLoading = false;
    frontImageError = true;
  }

  function handleBackImageLoad() {
    backImageLoading = false;
    backImageError = false;
  }

  function handleBackImageError(e: Event) {
    console.error('Failed to load back image:', card.holographic.backImage);
    backImageLoading = false;
    backImageError = true;
  }

  function retryImageLoad(side: 'front' | 'back') {
    if (side === 'front') {
      frontImageError = false;
      frontImageLoading = true;
      // Trigger image reload by forcing component re-render
      card = card;
    } else {
      backImageError = false;
      backImageLoading = true;
      card = card;
    }
  }

  // ===== COMPUTED VALUES =====

  $: rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 via-orange-500 to-red-600',
  };

  $: rarityGlow = {
    common: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
    rare: 'shadow-[0_0_30px_rgba(96,165,250,0.5)]',
    epic: 'shadow-[0_0_40px_rgba(168,85,247,0.6)]',
    legendary: 'shadow-[0_0_50px_rgba(251,191,36,0.8)]',
  };

  $: holographicGradient = `
    radial-gradient(
      circle at ${$holographicParams.x}% ${$holographicParams.y}%,
      rgba(255, 255, 255, ${card.holographic.intensity / 200}) 0%,
      transparent 50%
    )
  `;

  $: transformStyle = isInteracting && !$isFlipped
    ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    : $isFlipped
    ? 'rotateY(180deg)'
    : 'rotateY(0deg)';

  $: ariaLabel = `${card.title}, ${card.photocard.rarity} rarity card${
    card.community.creator !== 'system' ? `, created by ${card.community.creator}` : ''
  }`;

  // ===== LIFECYCLE =====
  
  onMount(() => {
    // Initialize throttled pointer move handler for 60fps performance
    initializeThrottledHandler();
  });
</script>

<div
  class="unified-card {className}"
  class:interactive
  class:interacting={isInteracting}
  data-size={size}
  data-rarity={card.photocard.rarity}
  style="
    --card-width: {currentSize.width}px;
    --card-height: {currentSize.height}px;
  "
>
  <div class="card-perspective">
    <div
      class="card-rotator {rarityGlow[card.photocard.rarity]}"
      class:flipped={$isFlipped}
      bind:this={cardRotator}
      style="
        transform: {transformStyle};
        transition: transform {$isFlipped ? card.holographic.animationDuration : 200}ms ease-out;
      "
      on:pointermove={handlePointerMove}
      on:pointerleave={handlePointerLeave}
      on:click={handleClick}
      on:keypress={handleKeyPress}
      role={interactive ? 'button' : 'img'}
      tabindex={interactive ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={$isFlipped}
      aria-busy={$isAnimating}
    >
      <!-- FRONT FACE -->
      <div class="card-face card-front">
        <!-- Main Image -->
        {#if frontImageLoading && !frontImageError}
          <div class="image-placeholder loading">
            <div class="spinner-ring"></div>
            <p class="text-sm text-gray-400">Loading...</p>
          </div>
        {/if}

        {#if frontImageError}
          <div class="image-placeholder error">
            <svg class="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-400 mb-2">Failed to load image</p>
            <button
              class="retry-button"
              on:click|stopPropagation={() => retryImageLoad('front')}
              aria-label="Retry loading front image"
            >
              Retry
            </button>
          </div>
        {:else}
          <img
            src={card.holographic.image}
            alt={card.title}
            class="card-image"
            class:hidden={frontImageLoading}
            loading="lazy"
            on:load={handleFrontImageLoad}
            on:error={handleFrontImageError}
          />
        {/if}

        <!-- Holographic Overlay (v2-prototype style) -->
        {#if enableHolographic && interactive}
          <div
            class="holographic-overlay"
            style="
              background: {holographicGradient};
              mix-blend-mode: {card.holographic.effect};
              opacity: {card.holographic.intensity / 100};
            "
          />

          <!-- Rainbow shimmer effect -->
          <div
            class="holographic-shimmer"
            style="
              background: linear-gradient(
                115deg,
                transparent 0%,
                rgba(255,255,255,0.3) 40%,
                rgba(255,255,255,0.8) 50%,
                rgba(255,255,255,0.3) 60%,
                transparent 100%
              );
              background-position: {$holographicParams.x}% {$holographicParams.y}%;
              background-size: 300% 300%;
            "
          />
        {/if}

        <!-- Rarity Border -->
        <div class="rarity-border bg-gradient-to-r {rarityColors[card.photocard.rarity]}" />

        <!-- Front Overlay Slot -->
        <slot name="front-overlay" />

        <!-- Metadata Overlay -->
        {#if showMetadata}
          <div class="metadata-overlay {currentSize.fontSize}">
            <h3 class="card-title">{card.title}</h3>
            <div class="card-meta">
              <span class="rarity-badge capitalize">{card.photocard.rarity}</span>
              {#if card.community.metadata.likes > 0}
                <span class="meta-item">❤️ {card.community.metadata.likes}</span>
              {/if}
              {#if card.community.metadata.rating > 0}
                <span class="meta-item">★ {card.community.metadata.rating.toFixed(1)}</span>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <!-- BACK FACE -->
      <div class="card-face card-back">
        {#if $$slots['back-content']}
          <slot name="back-content" {card} />
        {:else}
          <!-- Default Back Design -->
          {#if backImageLoading && !backImageError && card.holographic.backImage}
            <div class="image-placeholder loading">
              <div class="spinner-ring"></div>
              <p class="text-sm text-gray-400">Loading...</p>
            </div>
          {/if}

          {#if backImageError}
            <div class="image-placeholder error">
              <svg class="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-400 mb-2">Failed to load back image</p>
              <button
                class="retry-button"
                on:click|stopPropagation={() => retryImageLoad('back')}
                aria-label="Retry loading back image"
              >
                Retry
              </button>
            </div>
          {:else if card.holographic.backImage}
            <img
              src={card.holographic.backImage}
              alt="{card.title} - back"
              class="card-image"
              class:hidden={backImageLoading}
              loading="lazy"
              on:load={handleBackImageLoad}
              on:error={handleBackImageError}
            />

            <!-- Holographic on back -->
            {#if enableHolographic && interactive}
              <div
                class="holographic-overlay"
                style="
                  background: {holographicGradient};
                  mix-blend-mode: {card.holographic.effect};
                  opacity: {card.holographic.intensity / 100};
                "
              />
            {/if}

            <!-- Back Info -->
            <div class="back-info {currentSize.fontSize}">
              <h3 class="back-title">{card.title}</h3>
              <p class="back-rarity">{card.photocard.rarity}</p>

              {#if card.photocard.stats.totalViews > 0}
                <div class="back-stats">
                  <p>{card.photocard.stats.totalViews} views</p>
                  <p>{card.photocard.stats.uniqueCollectors} collectors</p>
                </div>
              {/if}

              {#if card.community.tags.length > 0}
                <div class="back-tags">
                  {#each card.community.tags.slice(0, 3) as tag}
                    <span class="tag">#{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <!-- Actions Slot -->
  {#if $$slots.actions}
    <div class="card-actions mt-2">
      <slot name="actions" {card} />
    </div>
  {/if}
</div>

<style>
  .unified-card {
    --radius: 4.55% / 3.5%;
    position: relative;
    display: inline-block;
    width: var(--card-width);
    height: var(--card-height);
  }

  .card-perspective {
    perspective: 1000px;
    transform-style: preserve-3d;
    width: 100%;
    height: 100%;
  }

  .card-rotator {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform-origin: center center;
    will-change: transform;
    /* GPU acceleration hints */
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: var(--radius);
    overflow: hidden;
    transform: translateZ(0);
  }

  .card-front {
    transform: rotateY(0deg);
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }

  /* Holographic Effects */
  .holographic-overlay,
  .holographic-shimmer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: background 16ms linear;
    /* GPU acceleration for smooth animations */
    will-change: opacity, transform;
    transform: translateZ(0);
  }

  .holographic-shimmer {
    mix-blend-mode: overlay;
    opacity: 0.6;
  }

  /* Rarity Border */
  .rarity-border {
    position: absolute;
    inset: 0;
    padding: 2px;
    border-radius: var(--radius);
    opacity: 0.8;
    pointer-events: none;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }

  /* Metadata Overlay */
  .metadata-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    color: white;
  }

  .card-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .rarity-badge {
    padding: 0.125rem 0.5rem;
    background: rgba(255,255,255,0.2);
    border-radius: 0.25rem;
    font-weight: 500;
  }

  /* Back Info */
  .back-info {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    color: white;
    text-align: center;
  }

  .back-title {
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .back-rarity {
    font-size: 0.875rem;
    opacity: 0.8;
    text-transform: capitalize;
  }

  .back-stats {
    margin-top: 1rem;
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .back-tags {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: center;
  }

  .tag {
    padding: 0.25rem 0.5rem;
    background: rgba(255,255,255,0.2);
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  /* Interactive States */
  .unified-card.interactive .card-rotator {
    cursor: pointer;
  }

  .unified-card.interactive:hover .card-rotator {
    transform: translateY(-4px) scale(1.02);
    transition: all 0.2s ease-out;
  }

  .unified-card.interacting {
    z-index: 20;
  }

  /* Accessibility */
  .card-rotator:focus {
    outline: 2px solid #007aff;
    outline-offset: 4px;
  }

  .card-rotator[aria-busy="true"] {
    pointer-events: none;
  }

  /* Size-specific adjustments */
  [data-size="small"] .metadata-overlay {
    padding: 0.5rem;
  }

  [data-size="featured"] .metadata-overlay {
    padding: 2rem;
  }

  /* Rarity-specific glows */
  [data-rarity="legendary"] .card-rotator {
    animation: legendary-pulse 3s ease-in-out infinite;
  }

  @keyframes legendary-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.1); }
  }

  /* Image Error Handling Styles */
  .image-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(50, 50, 70, 0.95) 100%);
    backdrop-filter: blur(10px);
    z-index: 5;
  }

  .image-placeholder.loading {
    background: linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(40, 40, 60, 0.98) 100%);
  }

  .image-placeholder.error {
    background: linear-gradient(135deg, rgba(60, 20, 20, 0.95) 0%, rgba(80, 30, 30, 0.95) 100%);
  }

  .spinner-ring {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .retry-button {
    padding: 0.5rem 1.5rem;
    background: linear-gradient(135deg, #007aff 0%, #005fcc 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
  }

  .retry-button:hover {
    background: linear-gradient(135deg, #0066ff 0%, #0052b3 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  }

  .retry-button:active {
    transform: translateY(0);
  }

  .card-image.hidden {
    display: none;
  }
</style>
