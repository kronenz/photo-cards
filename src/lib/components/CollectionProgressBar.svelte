<script lang="ts">
  import { onMount } from 'svelte';
  import type { CollectionProgress, CollectionType } from '$lib/types/collections';
  import { COLLECTION_TYPE_CONFIG } from '$lib/types/collections';
  
  // Props
  export let collection: CollectionProgress;
  export let showDetails: boolean = true;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let animated: boolean = true;
  export let onClick: ((collection: CollectionProgress) => void) | undefined = undefined;
  
  let mounted = false;
  let progressElement: HTMLDivElement;
  
  onMount(() => {
    mounted = true;
    
    if (animated && progressElement) {
      // Animate progress bar on mount
      setTimeout(() => {
        progressElement.style.setProperty('--progress', `${collection.completionPercentage}%`);
      }, 100);
    }
  });
  
  $: typeConfig = COLLECTION_TYPE_CONFIG[collection.theme as CollectionType] || COLLECTION_TYPE_CONFIG.season;
  
  $: progressColor = collection.isCompleted 
    ? 'var(--apple-accent-green)' 
    : collection.completionPercentage >= 75 
      ? 'var(--apple-accent-orange)'
      : 'var(--apple-accent-blue)';
  
  function handleClick() {
    if (onClick) {
      onClick(collection);
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div 
  class="collection-progress-bar {size}"
  class:mounted
  class:clickable={onClick}
  class:completed={collection.isCompleted}
  role={onClick ? 'button' : undefined}
  tabindex={onClick ? 0 : undefined}
  on:click={onClick ? handleClick : undefined}
  on:keydown={onClick ? handleKeydown : undefined}
>
  {#if showDetails}
    <div class="progress-header">
      <div class="collection-info">
        <div class="collection-name-row">
          <span class="collection-icon">{typeConfig.icon}</span>
          <h4 class="collection-name">{collection.name}</h4>
          {#if collection.isCompleted}
            <div class="completion-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
          {/if}
        </div>
        <div class="collection-stats">
          <span class="card-count">{collection.ownedCards} / {collection.totalCards} 카드</span>
          <span class="collection-type" style="--type-color: {typeConfig.color}">
            {typeConfig.koreanName}
          </span>
        </div>
      </div>
      <div class="progress-percentage">
        {collection.completionPercentage}%
      </div>
    </div>
  {/if}
  
  <div class="progress-track">
    <div 
      class="progress-fill"
      bind:this={progressElement}
      style="--progress-color: {progressColor}; --progress: {animated ? '0%' : collection.completionPercentage + '%'}"
    >
      {#if collection.isCompleted}
        <div class="completion-sparkle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/>
          </svg>
        </div>
      {/if}
    </div>
    
    <!-- Milestone markers -->
    <div class="milestone-markers">
      <div class="milestone" style="left: 25%">
        <div class="milestone-dot" class:reached={collection.completionPercentage >= 25}></div>
      </div>
      <div class="milestone" style="left: 50%">
        <div class="milestone-dot" class:reached={collection.completionPercentage >= 50}></div>
      </div>
      <div class="milestone" style="left: 75%">
        <div class="milestone-dot" class:reached={collection.completionPercentage >= 75}></div>
      </div>
    </div>
  </div>
  
  {#if showDetails && collection.recentlyAdded && collection.recentlyAdded.length > 0}
    <div class="recent-additions">
      <span class="recent-label">최근 추가:</span>
      <div class="recent-cards">
        {#each collection.recentlyAdded.slice(0, 3) as card}
          <div class="recent-card-thumb">
            <img src={card.image} alt={card.title} loading="lazy" />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .collection-progress-bar {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: var(--apple-radius-xl);
    padding: var(--apple-spacing-lg);
    transition: all var(--apple-transition-smooth);
    opacity: 0;
    transform: translateY(10px);
  }
  
  .collection-progress-bar.mounted {
    opacity: 1;
    transform: translateY(0);
  }
  
  .collection-progress-bar.clickable {
    cursor: pointer;
  }
  
  .collection-progress-bar.clickable:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .collection-progress-bar.clickable:focus {
    outline: 2px solid var(--apple-accent-blue);
    outline-offset: 2px;
  }
  
  .collection-progress-bar.completed {
    background: linear-gradient(135deg, 
      var(--apple-surface-primary) 0%, 
      rgba(52, 199, 89, 0.05) 100%);
    border-color: var(--apple-accent-green);
  }
  
  /* Size variants */
  .collection-progress-bar.small {
    padding: var(--apple-spacing-md);
  }
  
  .collection-progress-bar.large {
    padding: var(--apple-spacing-xl);
  }
  
  /* Progress Header */
  .progress-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--apple-spacing-md);
  }
  
  .collection-info {
    flex: 1;
  }
  
  .collection-name-row {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
    margin-bottom: var(--apple-spacing-xs);
  }
  
  .collection-icon {
    font-size: var(--apple-font-size-title3);
    line-height: 1;
  }
  
  .collection-name {
    font-size: var(--apple-font-size-headline);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0;
    flex: 1;
  }
  
  .small .collection-name {
    font-size: var(--apple-font-size-callout);
  }
  
  .large .collection-name {
    font-size: var(--apple-font-size-title3);
  }
  
  .completion-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--apple-accent-green);
    color: white;
    border-radius: var(--apple-radius-full);
    animation: completion-pulse 2s infinite;
  }
  
  .completion-badge svg {
    width: 14px;
    height: 14px;
  }
  
  @keyframes completion-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  .collection-stats {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
  }
  
  .card-count {
    font-size: var(--apple-font-size-callout);
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  .small .card-count {
    font-size: var(--apple-font-size-footnote);
  }
  
  .collection-type {
    font-size: var(--apple-font-size-footnote);
    color: var(--type-color);
    background: color-mix(in srgb, var(--type-color) 10%, transparent);
    padding: 2px 8px;
    border-radius: var(--apple-radius-sm);
    font-weight: 500;
  }
  
  .progress-percentage {
    font-size: var(--apple-font-size-title2);
    font-weight: 700;
    color: var(--apple-accent-blue);
    line-height: 1;
  }
  
  .small .progress-percentage {
    font-size: var(--apple-font-size-headline);
  }
  
  .large .progress-percentage {
    font-size: var(--apple-font-size-title1);
  }
  
  .completed .progress-percentage {
    color: var(--apple-accent-green);
  }
  
  /* Progress Track */
  .progress-track {
    position: relative;
    width: 100%;
    height: 8px;
    background: var(--apple-surface-secondary);
    border-radius: var(--apple-radius-sm);
    overflow: hidden;
    margin-bottom: var(--apple-spacing-sm);
  }
  
  .small .progress-track {
    height: 6px;
  }
  
  .large .progress-track {
    height: 12px;
  }
  
  .progress-fill {
    height: 100%;
    width: var(--progress);
    background: var(--progress-color);
    border-radius: var(--apple-radius-sm);
    transition: width 1.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    position: relative;
    overflow: hidden;
  }
  
  .progress-fill::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.3), 
      transparent);
    animation: progress-shimmer 2s infinite;
  }
  
  @keyframes progress-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .completion-sparkle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    animation: sparkle 1.5s infinite;
  }
  
  .completion-sparkle svg {
    width: 16px;
    height: 16px;
  }
  
  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
    50% { opacity: 0.7; transform: translateY(-50%) scale(1.2); }
  }
  
  /* Milestone Markers */
  .milestone-markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .milestone {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  
  .milestone-dot {
    width: 12px;
    height: 12px;
    border: 2px solid var(--apple-surface-primary);
    border-radius: var(--apple-radius-full);
    background: var(--apple-surface-border);
    transition: all var(--apple-transition-smooth);
  }
  
  .milestone-dot.reached {
    background: var(--apple-accent-blue);
    border-color: white;
    box-shadow: 0 0 0 2px var(--apple-accent-blue);
  }
  
  .completed .milestone-dot.reached {
    background: var(--apple-accent-green);
    box-shadow: 0 0 0 2px var(--apple-accent-green);
  }
  
  /* Recent Additions */
  .recent-additions {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
    margin-top: var(--apple-spacing-md);
    padding-top: var(--apple-spacing-md);
    border-top: 1px solid var(--apple-surface-border);
  }
  
  .recent-label {
    font-size: var(--apple-font-size-footnote);
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  .recent-cards {
    display: flex;
    gap: var(--apple-spacing-xs);
  }
  
  .recent-card-thumb {
    width: 32px;
    height: 40px;
    border-radius: var(--apple-radius-sm);
    overflow: hidden;
    border: 1px solid var(--apple-surface-border);
  }
  
  .recent-card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .progress-header {
      flex-direction: column;
      gap: var(--apple-spacing-sm);
    }
    
    .collection-stats {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--apple-spacing-xs);
    }
    
    .recent-additions {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--apple-spacing-xs);
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .collection-progress-bar.completed {
      background: linear-gradient(135deg, 
        var(--apple-surface-primary) 0%, 
        rgba(52, 199, 89, 0.1) 100%);
    }
    
    .progress-fill::before {
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.2), 
        transparent);
    }
    
    .milestone-dot {
      border-color: var(--apple-surface-primary);
      background: var(--apple-surface-tertiary);
    }
    
    .milestone-dot.reached {
      border-color: var(--apple-surface-primary);
    }
  }
</style>