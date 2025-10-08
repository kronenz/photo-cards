<script lang="ts">
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import { writable } from 'svelte/store';
  import type { UnifiedCard } from '$lib/types/unified';
  import UnifiedHolographicCard from './UnifiedHolographicCard.svelte';

  // Props
  export let cards: UnifiedCard[];
  export let columns = 3;
  export let cardSize: 'small' | 'medium' | 'large' = 'small';
  export let onCardClick: ((card: UnifiedCard) => void) | undefined = undefined;

  let scrollElement: HTMLElement;
  let containerWidth = 0;

  // Calculate dynamic card dimensions based on container width
  $: cardDimensions = {
    small: { width: Math.floor((containerWidth - (columns + 1) * 16) / columns), height: 280 },
    medium: { width: Math.floor((containerWidth - (columns + 1) * 16) / columns), height: 420 },
    large: { width: Math.floor((containerWidth - (columns + 1) * 16) / columns), height: 560 }
  };

  $: estimatedCardHeight = cardDimensions[cardSize].height;

  // Create virtualizer for rows
  $: rowVirtualizer = createVirtualizer({
    get count() {
      return Math.ceil(cards.length / columns);
    },
    getScrollElement: () => scrollElement,
    estimateSize: () => estimatedCardHeight + 32, // Card height + gap
    overscan: 2 // Render 2 extra rows above and below
  });

  // Get cards for a specific row
  function getCardsForRow(rowIndex: number): UnifiedCard[] {
    const startIndex = rowIndex * columns;
    return cards.slice(startIndex, startIndex + columns);
  }

  function handleCardClick(card: UnifiedCard) {
    if (onCardClick) {
      onCardClick(card);
    }
  }
</script>

<div
  bind:this={scrollElement}
  bind:clientWidth={containerWidth}
  class="virtual-scroll-container"
  style="
    height: 600px;
    overflow-y: auto;
    contain: strict;
  "
>
  <div
    class="virtual-scroll-inner"
    style="
      height: {$rowVirtualizer.getTotalSize()}px;
      position: relative;
      width: 100%;
    "
  >
    {#each $rowVirtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
      {@const rowCards = getCardsForRow(virtualRow.index)}
      <div
        class="virtual-row"
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: {virtualRow.size}px;
          transform: translateY({virtualRow.start}px);
        "
      >
        <div
          class="card-grid"
          style="
            display: grid;
            grid-template-columns: repeat({columns}, 1fr);
            gap: 1rem;
            padding: 1rem;
          "
        >
          {#each rowCards as card (card.id)}
            <div class="card-wrapper">
              <UnifiedHolographicCard
                {card}
                context="community"
                size={cardSize}
                interactive={true}
                on:click={() => handleCardClick(card)}
              />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .virtual-scroll-container {
    /* Smooth scrolling */
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;

    /* Performance optimizations */
    will-change: scroll-position;
    contain: layout style paint;
  }

  .virtual-scroll-container::-webkit-scrollbar {
    width: 8px;
  }

  .virtual-scroll-container::-webkit-scrollbar-track {
    background: var(--apple-surface-secondary);
    border-radius: 4px;
  }

  .virtual-scroll-container::-webkit-scrollbar-thumb {
    background: var(--apple-surface-border);
    border-radius: 4px;
  }

  .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
    background: var(--apple-text-tertiary);
  }

  .virtual-row {
    /* GPU acceleration */
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  .card-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .virtual-scroll-container {
      height: 500px;
    }
  }

  @media (max-width: 640px) {
    .virtual-scroll-container {
      height: 400px;
    }
  }
</style>
