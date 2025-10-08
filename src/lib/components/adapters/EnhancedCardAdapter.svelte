<script lang="ts">
  /**
   * EnhancedCardAdapter Component
   *
   * Feature: 002-integrated-holographic-platform
   * Purpose: Adapter for Phase 1 Enhanced Card → UnifiedHolographicCard
   *
   * Provides backward compatibility for existing /test page and Phase 1 code
   * Migrates LegacyEnhancedCard props to UnifiedCard format on-the-fly
   */

  import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
  import { migrateEnhancedCard } from '$lib/utils/migration';
  import type { LegacyEnhancedCard, UnifiedCard } from '$lib/types/unified';

  // ===== LEGACY PHASE 1 PROPS =====

  export let id: string;
  export let title: string;
  export let image: string;
  export let backImage: string;
  export let holographicEffect: 'overlay' | 'soft-light' | 'hard-light' = 'soft-light';

  // Optional props for enhanced compatibility
  export let size: 'small' | 'medium' | 'large' | 'featured' = 'medium';
  export let interactive: boolean = true;

  // ===== MIGRATION =====

  // Create legacy card object
  $: legacyCard: LegacyEnhancedCard = {
    id,
    title,
    image,
    backImage,
    holographicEffect,
  };

  // Migrate to unified format
  $: unifiedCard: UnifiedCard = migrateEnhancedCard(legacyCard);

  // ===== FORWARD EVENTS =====

  function handleClick(event: CustomEvent) {
    // Bubble up click events for legacy compatibility
    const detail = event.detail;
    const clickEvent = new CustomEvent('cardClick', { detail });
    dispatchEvent(clickEvent);
  }
</script>

<!--
  Adapter Pattern:
  - Accepts Phase 1 props (id, title, image, backImage, holographicEffect)
  - Migrates to UnifiedCard format
  - Renders using UnifiedHolographicCard
  - Maintains context='test' for Phase 1 cards
-->
<UnifiedHolographicCard
  card={unifiedCard}
  context="test"
  {size}
  {interactive}
  enableHolographic={true}
  enableFlip={true}
  showMetadata={false}
  on:click={handleClick}
>
  <!-- Forward slots if needed -->
  <slot name="front-overlay" slot="front-overlay" />
  <slot name="back-content" slot="back-content" />
  <slot name="actions" slot="actions" />
</UnifiedHolographicCard>
