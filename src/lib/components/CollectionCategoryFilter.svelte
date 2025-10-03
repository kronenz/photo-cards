<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CollectionType } from '$lib/types/collections';
  import { COLLECTION_TYPE_CONFIG } from '$lib/types/collections';
  
  // Props
  export let selectedCategory: CollectionType | 'all' = 'all';
  export let collectionCounts: Record<CollectionType | 'all', number> = {
    all: 0,
    season: 0,
    team: 0,
    player: 0,
    special_event: 0,
    user_custom: 0
  };
  export let showCounts: boolean = true;
  export let layout: 'horizontal' | 'vertical' = 'horizontal';
  
  const dispatch = createEventDispatcher<{
    categoryChange: CollectionType | 'all';
  }>();
  
  // Category options including 'all'
  const categories: Array<{ id: CollectionType | 'all'; name: string; koreanName: string; icon: string; color: string }> = [
    {
      id: 'all',
      name: 'All',
      koreanName: '전체',
      icon: '📚',
      color: '#6b7280'
    },
    ...Object.entries(COLLECTION_TYPE_CONFIG).map(([key, config]) => ({
      id: key as CollectionType,
      ...config
    }))
  ];
  
  function handleCategorySelect(categoryId: CollectionType | 'all') {
    selectedCategory = categoryId;
    dispatch('categoryChange', categoryId);
  }
  
  function handleKeydown(event: KeyboardEvent, categoryId: CollectionType | 'all') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategorySelect(categoryId);
    }
  }
</script>

<div class="collection-category-filter {layout}">
  <div class="filter-header">
    <h3 class="filter-title">컬렉션 카테고리</h3>
    <p class="filter-description">원하는 카테고리를 선택하여 컬렉션을 필터링하세요</p>
  </div>
  
  <div class="category-list">
    {#each categories as category (category.id)}
      <button
        class="category-item"
        class:active={selectedCategory === category.id}
        style="--category-color: {category.color}"
        on:click={() => handleCategorySelect(category.id)}
        on:keydown={(e) => handleKeydown(e, category.id)}
        aria-pressed={selectedCategory === category.id}
      >
        <div class="category-icon">
          {category.icon}
        </div>
        <div class="category-content">
          <div class="category-name">
            {category.koreanName}
          </div>
          {#if showCounts}
            <div class="category-count">
              {collectionCounts[category.id] || 0}개
            </div>
          {/if}
        </div>
        {#if selectedCategory === category.id}
          <div class="active-indicator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .collection-category-filter {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: var(--apple-radius-xl);
    padding: var(--apple-spacing-lg);
  }
  
  /* Filter Header */
  .filter-header {
    margin-bottom: var(--apple-spacing-lg);
    text-align: center;
  }
  
  .filter-title {
    font-size: var(--apple-font-size-headline);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 var(--apple-spacing-xs);
  }
  
  .filter-description {
    font-size: var(--apple-font-size-footnote);
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.4;
  }
  
  /* Category List */
  .category-list {
    display: flex;
    gap: var(--apple-spacing-sm);
  }
  
  .horizontal .category-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .vertical .category-list {
    flex-direction: column;
  }
  
  /* Category Item */
  .category-item {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
    padding: var(--apple-spacing-md);
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: var(--apple-radius-lg);
    cursor: pointer;
    transition: all var(--apple-transition-smooth);
    font-family: inherit;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  
  .horizontal .category-item {
    flex: 0 0 auto;
    min-width: 120px;
  }
  
  .vertical .category-item {
    width: 100%;
  }
  
  .category-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--category-color);
    transform: scaleX(0);
    transition: transform var(--apple-transition-smooth);
  }
  
  .category-item:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .category-item:hover::before {
    transform: scaleX(1);
  }
  
  .category-item:focus {
    outline: 2px solid var(--apple-accent-blue);
    outline-offset: 2px;
  }
  
  .category-item:active {
    transform: translateY(0) scale(0.98);
  }
  
  .category-item.active {
    background: color-mix(in srgb, var(--category-color) 10%, var(--apple-surface-secondary));
    border-color: var(--category-color);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--category-color) 20%, transparent);
  }
  
  .category-item.active::before {
    transform: scaleX(1);
  }
  
  /* Category Icon */
  .category-icon {
    font-size: var(--apple-font-size-title3);
    line-height: 1;
    flex-shrink: 0;
  }
  
  /* Category Content */
  .category-content {
    flex: 1;
    min-width: 0;
  }
  
  .category-name {
    font-size: var(--apple-font-size-callout);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: 2px;
  }
  
  .category-count {
    font-size: var(--apple-font-size-footnote);
    color: var(--apple-text-secondary);
  }
  
  .category-item.active .category-name {
    color: var(--category-color);
  }
  
  .category-item.active .category-count {
    color: color-mix(in srgb, var(--category-color) 80%, var(--apple-text-secondary));
  }
  
  /* Active Indicator */
  .active-indicator {
    width: 20px;
    height: 20px;
    color: var(--category-color);
    flex-shrink: 0;
    animation: check-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .active-indicator svg {
    width: 100%;
    height: 100%;
  }
  
  @keyframes check-in {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .horizontal .category-list {
      flex-direction: column;
    }
    
    .horizontal .category-item {
      min-width: auto;
      width: 100%;
    }
    
    .filter-header {
      text-align: left;
    }
  }
  
  @media (max-width: 480px) {
    .collection-category-filter {
      padding: var(--apple-spacing-md);
    }
    
    .category-item {
      padding: var(--apple-spacing-sm) var(--apple-spacing-md);
    }
    
    .category-icon {
      font-size: var(--apple-font-size-title2);
    }
    
    .category-name {
      font-size: var(--apple-font-size-subheadline);
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .category-item.active {
      background: color-mix(in srgb, var(--category-color) 15%, var(--apple-surface-secondary));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--category-color) 30%, transparent);
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .category-item {
      border-width: 2px;
    }
    
    .category-item.active {
      border-width: 3px;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .category-item {
      transition: none;
    }
    
    .category-item::before {
      transition: none;
    }
    
    .active-indicator {
      animation: none;
    }
  }
</style>