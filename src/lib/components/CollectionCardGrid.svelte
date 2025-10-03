<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import HolographicCardV2 from './HolographicCardV2.svelte';
  import type { Card, CardRarity } from '$lib/types/collections';
  import { RARITY_CONFIG, CardType } from '$lib/types/collections';

  // Props
  export let cards: Card[] = [];
  export let title: string = '';
  export let showTitle: boolean = true;
  export let gridCols: number = 4;
  export let maxCards: number = 0; // 0 means show all
  export let enableFlip: boolean = true;
  export let animationSpeed: number = 600;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Computed
  $: displayCards = maxCards > 0 ? cards.slice(0, maxCards) : cards;
  $: gridClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(gridCols, 4)} lg:grid-cols-${gridCols}`;

  // Convert Card type to HolographicCardV2 props
  function getCardRarity(rarity: CardRarity): string {
    const rarityMap: Record<CardRarity, string> = {
      'common': 'common',
      'uncommon': 'uncommon', 
      'rare': 'rare holo',
      'epic': 'rare holo v',
      'legendary': 'rare rainbow',
      'mythic': 'rare holo galaxy'
    };
    return rarityMap[rarity] || 'rare holo';
  }

  function getTeamIdFromMetadata(card: Card): string | undefined {
    // Extract team ID from card metadata
    if (card.metadata.team) {
      const teamNameToId: Record<string, string> = {
        'LG 트윈스': 'lg-twins',
        '두산 베어스': 'doosan-bears', 
        'KIA 타이거즈': 'kia-tigers',
        '삼성 라이온즈': 'samsung-lions',
        '롯데 자이언츠': 'lotte-giants',
        '한화 이글스': 'hanwha-eagles',
        'SSG 랜더스': 'ssg-landers',
        'KT 위즈': 'kt-wiz',
        'NC 다이노스': 'nc-dinos',
        '키움 히어로즈': 'kiwoom-heroes'
      };
      return teamNameToId[card.metadata.team];
    }
    return undefined;
  }

  function handleCardHover(card: Card, event: CustomEvent) {
    dispatch('cardHover', { card, ...event.detail });
  }

  function handleCardClick(card: Card, event: CustomEvent) {
    dispatch('cardClick', { card, ...event.detail });
  }

  function handleCardFlip(card: Card) {
    dispatch('cardFlip', { card });
  }
</script>

{#if showTitle && title}
  <div class="collection-header apple-m-lg">
    <h3 class="apple-text-title2">{title}</h3>
    {#if maxCards > 0 && cards.length > maxCards}
      <button class="view-all-btn apple-btn apple-btn-secondary apple-btn-small">
        전체 보기 ({cards.length})
      </button>
    {/if}
  </div>
{/if}

<div class="card-grid apple-grid {gridClass} apple-spacing-lg">
  {#each displayCards as card (card.id)}
    <div class="card-wrapper">
      <HolographicCardV2
        frontImage={card.image}
        title={card.title}
        rarity={getCardRarity(card.rarity)}
        teamId={getTeamIdFromMetadata(card)}
        cardType={card.type === CardType.PLAYER ? 'player' : 
                 card.type === CardType.STADIUM ? 'stadium' : 
                 card.type === CardType.MOMENT ? 'moment' : 
                 card.type === CardType.SPECIAL ? 'achievement' : 'player'}
        {enableFlip}
        {animationSpeed}
        on:hover={(e) => handleCardHover(card, e)}
        on:click={(e) => handleCardClick(card, e)}
        on:flip={() => handleCardFlip(card)}
      />
      
      <!-- Card Info Overlay -->
      <div class="card-info">
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-icon">❤️</span>
            <span class="stat-value">{card.stats.likes}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">👁️</span>
            <span class="stat-value">{card.stats.views}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">{card.stats.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div class="card-rarity-badge" 
             style="background-color: {RARITY_CONFIG[card.rarity].bgColor}; 
                    color: {RARITY_CONFIG[card.rarity].color};
                    border-color: {RARITY_CONFIG[card.rarity].borderColor};">
          {RARITY_CONFIG[card.rarity].koreanName}
        </div>
      </div>
    </div>
  {/each}
</div>

{#if displayCards.length === 0}
  <div class="empty-state">
    <div class="empty-icon">📦</div>
    <h4 class="apple-text-headline">카드가 없습니다</h4>
    <p class="apple-text-callout apple-text-secondary">
      첫 번째 홀로그래픽 카드를 만들어보세요!
    </p>
    <button class="apple-btn apple-btn-primary" on:click={() => dispatch('createCard')}>
      카드 만들기
    </button>
  </div>
{/if}

<style>
  .collection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--apple-spacing-lg);
  }

  .card-wrapper {
    position: relative;
    transition: transform var(--apple-transition-smooth);
  }

  .card-wrapper:hover {
    transform: translateY(-4px);
  }

  .card-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: var(--apple-spacing-lg) var(--apple-spacing-md) var(--apple-spacing-md);
    border-radius: 0 0 var(--apple-radius-lg) var(--apple-radius-lg);
    opacity: 0;
    transition: opacity var(--apple-transition-smooth);
    pointer-events: none;
  }

  .card-wrapper:hover .card-info {
    opacity: 1;
  }

  .card-stats {
    display: flex;
    gap: var(--apple-spacing-md);
    margin-bottom: var(--apple-spacing-sm);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-xs);
    color: white;
    font-size: var(--apple-font-size-caption1);
  }

  .stat-icon {
    font-size: 12px;
  }

  .stat-value {
    font-weight: var(--apple-font-weight-medium);
  }

  .card-rarity-badge {
    display: inline-block;
    padding: var(--apple-spacing-xs) var(--apple-spacing-sm);
    border-radius: var(--apple-radius-sm);
    font-size: var(--apple-font-size-caption1);
    font-weight: var(--apple-font-weight-semibold);
    border: 1px solid;
    backdrop-filter: blur(10px);
  }

  .empty-state {
    text-align: center;
    padding: var(--apple-spacing-4xl) var(--apple-spacing-lg);
    background: var(--apple-surface-secondary);
    border-radius: var(--apple-radius-xl);
    border: 2px dashed var(--apple-surface-border);
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: var(--apple-spacing-lg);
    opacity: 0.6;
  }

  .empty-state h4 {
    margin: 0 0 var(--apple-spacing-sm);
    color: var(--apple-text-primary);
  }

  .empty-state p {
    margin: 0 0 var(--apple-spacing-lg);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: var(--apple-spacing-md);
    }
    
    .collection-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--apple-spacing-sm);
    }
  }

  @media (max-width: 480px) {
    .card-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>