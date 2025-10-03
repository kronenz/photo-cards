<script lang="ts">
  import { onMount } from 'svelte';
  import type { Card, Collection, UserStats, CollectionProgress, CardRarity, CollectionType } from '$lib/types/collections';
  import { RARITY_CONFIG, COLLECTION_TYPE_CONFIG } from '$lib/types/collections';
  import CollectionProgressBar from './CollectionProgressBar.svelte';
  import CollectionCompletionCelebration from './CollectionCompletionCelebration.svelte';
  import CollectionCategoryFilter from './CollectionCategoryFilter.svelte';
  import CollectionCardGrid from './CollectionCardGrid.svelte';
  
  // Props
  export let userStats: UserStats;
  export let recentCards: Card[] = [];
  export let collectionProgress: CollectionProgress[] = [];
  export let onCardClick: ((card: Card) => void) | undefined = undefined;
  export let onCollectionClick: ((collection: CollectionProgress) => void) | undefined = undefined;
  
  let mounted = false;
  let selectedCategory: CollectionType | 'all' = 'all';
  let showCelebration = false;
  let celebrationCollection: Collection | null = null;
  
  onMount(() => {
    mounted = true;
  });
  
  // Calculate stats for display
  $: totalRareCards = (userStats.cardsByRarity?.rare || 0) + 
                     (userStats.cardsByRarity?.epic || 0) + 
                     (userStats.cardsByRarity?.legendary || 0) + 
                     (userStats.cardsByRarity?.mythic || 0);
  
  $: completionRate = collectionProgress.length > 0 
    ? Math.round(collectionProgress.reduce((sum, col) => sum + col.completionPercentage, 0) / collectionProgress.length)
    : 0;
  
  // Filter collections by category
  $: filteredCollections = selectedCategory === 'all' 
    ? collectionProgress 
    : collectionProgress.filter(col => col.theme === selectedCategory);
  
  // Get top collections by progress (filtered)
  $: topCollections = filteredCollections
    .sort((a, b) => b.completionPercentage - a.completionPercentage)
    .slice(0, 6);
  
  // Calculate collection counts by category
  $: collectionCounts = collectionProgress.reduce((counts, collection) => {
    counts.all = (counts.all || 0) + 1;
    counts[collection.theme as CollectionType] = (counts[collection.theme as CollectionType] || 0) + 1;
    return counts;
  }, {} as Record<CollectionType | 'all', number>);
  
  // Check for newly completed collections
  $: {
    const newlyCompleted = collectionProgress.find(col => 
      col.isCompleted && col.completionPercentage === 100
    );
    if (newlyCompleted && !showCelebration) {
      // Simulate showing celebration for completed collection
      // In real app, this would be triggered by a completion event
    }
  }
  
  function handleCardClick(card: Card) {
    if (onCardClick) {
      onCardClick(card);
    }
  }
  
  function handleCollectionClick(collection: CollectionProgress) {
    if (onCollectionClick) {
      onCollectionClick(collection);
    }
  }
  
  function handleCategoryChange(event: CustomEvent<CollectionType | 'all'>) {
    selectedCategory = event.detail;
  }
  
  function handleCelebrationClose() {
    showCelebration = false;
    celebrationCollection = null;
  }
  
  function handleViewCollection(event: CustomEvent<Collection>) {
    // Handle viewing the completed collection
    console.log('View collection:', event.detail);
    showCelebration = false;
  }
  
  function handleShareAchievement(event: CustomEvent<Collection>) {
    // Handle sharing the achievement
    console.log('Share achievement:', event.detail);
    showCelebration = false;
  }
  
  function getRarityConfig(rarity: CardRarity) {
    return RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  }
</script>

<div class="collection-dashboard" class:mounted>
  <!-- Dashboard Header -->
  <div class="dashboard-header">
    <h2 class="dashboard-title">내 컬렉션</h2>
    <p class="dashboard-subtitle">포토카드 수집 현황을 한눈에 확인하세요</p>
  </div>
  
  <!-- Stats Overview -->
  <div class="stats-grid">
    <!-- Total Cards -->
    <div class="stat-card total-cards">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{userStats.totalCards.toLocaleString()}</div>
        <div class="stat-label">총 카드 수</div>
      </div>
    </div>
    
    <!-- Rare Cards -->
    <div class="stat-card rare-cards">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{totalRareCards.toLocaleString()}</div>
        <div class="stat-label">희귀 카드</div>
      </div>
    </div>
    
    <!-- Completed Collections -->
    <div class="stat-card completed-collections">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{userStats.completedCollections}</div>
        <div class="stat-label">완성된 컬렉션</div>
      </div>
    </div>
    
    <!-- Average Completion -->
    <div class="stat-card completion-rate">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{completionRate}%</div>
        <div class="stat-label">평균 완성도</div>
      </div>
    </div>
  </div>
  
  <!-- Recent Cards Section -->
  <div class="recent-cards-section">
    <CollectionCardGrid
      cards={recentCards}
      title="최근 획득 카드"
      gridCols={3}
      maxCards={3}
      enableFlip={true}
      animationSpeed={600}
      on:cardClick={(e) => handleCardClick(e.detail.card)}
      on:cardHover={(e) => console.log('Card hover:', e.detail)}
      on:cardFlip={(e) => console.log('Card flip:', e.detail)}
      on:createCard={() => console.log('Create card clicked')}
    />
  </div>
  
  <!-- Collection Category Filter -->
  <div class="collection-filter-section">
    <CollectionCategoryFilter
      bind:selectedCategory
      {collectionCounts}
      on:categoryChange={handleCategoryChange}
    />
  </div>
  
  <!-- Collection Progress Section -->
  <div class="collection-progress-section">
    <div class="section-header">
      <h3 class="section-title">
        컬렉션 진행 현황
        {#if selectedCategory !== 'all'}
          <span class="category-indicator">
            ({COLLECTION_TYPE_CONFIG[selectedCategory]?.koreanName || selectedCategory})
          </span>
        {/if}
      </h3>
      <button class="view-all-btn" type="button">
        전체 보기
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      </button>
    </div>
    
    <div class="collection-progress-list">
      {#each topCollections as collection (collection.id)}
        <CollectionProgressBar
          {collection}
          showDetails={true}
          size="medium"
          animated={true}
          onClick={handleCollectionClick}
        />
      {:else}
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <folder x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M3 9h18"/>
            </svg>
          </div>
          <p class="empty-text">
            {selectedCategory === 'all' 
              ? '진행 중인 컬렉션이 없습니다' 
              : `${COLLECTION_TYPE_CONFIG[selectedCategory]?.koreanName || selectedCategory} 컬렉션이 없습니다`}
          </p>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Completion Celebration Modal -->
  {#if celebrationCollection}
    <CollectionCompletionCelebration
      collection={celebrationCollection}
      show={showCelebration}
      on:close={handleCelebrationClose}
      on:viewCollection={handleViewCollection}
      on:shareAchievement={handleShareAchievement}
    />
  {/if}
</div>

<style>
  .collection-dashboard {
    width: 100%;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .collection-dashboard.mounted {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Dashboard Header */
  .dashboard-header {
    text-align: center;
    margin-bottom: var(--apple-spacing-2xl);
  }
  
  .dashboard-title {
    font-size: var(--apple-font-size-title1);
    font-weight: 700;
    color: var(--apple-text-primary);
    margin: 0 0 var(--apple-spacing-sm);
    letter-spacing: -0.02em;
  }
  
  .dashboard-subtitle {
    font-size: var(--apple-font-size-body);
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
  
  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--apple-spacing-lg);
    margin-bottom: var(--apple-spacing-2xl);
  }
  
  .stat-card {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: var(--apple-radius-xl);
    padding: var(--apple-spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
    transition: all var(--apple-transition-smooth);
    position: relative;
    overflow: hidden;
  }
  
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--apple-accent-blue), var(--apple-accent-purple));
    opacity: 0;
    transition: opacity var(--apple-transition-fast);
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .stat-card:hover::before {
    opacity: 1;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    background: var(--apple-surface-secondary);
    border-radius: var(--apple-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--apple-accent-blue);
    flex-shrink: 0;
  }
  
  .stat-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-number {
    font-size: var(--apple-font-size-title2);
    font-weight: 700;
    color: var(--apple-text-primary);
    line-height: 1.2;
    margin-bottom: 2px;
  }
  
  .stat-label {
    font-size: var(--apple-font-size-callout);
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  /* Section Styling */
  .recent-cards-section,
  .collection-progress-section {
    margin-bottom: var(--apple-spacing-2xl);
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--apple-spacing-lg);
  }
  
  .section-title {
    font-size: var(--apple-font-size-title3);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0;
  }
  
  .view-all-btn {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-xs);
    font-size: var(--apple-font-size-callout);
    color: var(--apple-accent-blue);
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--apple-transition-fast);
    font-weight: 500;
  }
  
  .view-all-btn:hover {
    color: var(--apple-accent-blue-dark);
    transform: translateX(2px);
  }
  
  .view-all-btn svg {
    width: 16px;
    height: 16px;
    transition: transform var(--apple-transition-fast);
  }
  
  .view-all-btn:hover svg {
    transform: translateX(2px);
  }
  

  
  /* Collection Progress List */
  .collection-progress-list {
    display: flex;
    flex-direction: column;
    gap: var(--apple-spacing-md);
  }
  
  /* Collection Filter Section */
  .collection-filter-section {
    margin-bottom: var(--apple-spacing-xl);
  }
  
  /* Category Indicator */
  .category-indicator {
    font-size: var(--apple-font-size-callout);
    font-weight: 500;
    color: var(--apple-text-secondary);
  }
  
  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--apple-spacing-2xl);
    text-align: center;
    grid-column: 1 / -1;
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
    background: var(--apple-surface-secondary);
    border-radius: var(--apple-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--apple-text-tertiary);
    margin-bottom: var(--apple-spacing-md);
  }
  
  .empty-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .empty-text {
    font-size: var(--apple-font-size-body);
    color: var(--apple-text-secondary);
    margin: 0;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--apple-spacing-md);
    }
    

    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--apple-spacing-sm);
    }
    

  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .stat-card {
      padding: var(--apple-spacing-md);
    }
    

  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .stat-card::before {
      background: linear-gradient(90deg, var(--apple-accent-blue), var(--apple-accent-purple));
    }
    
    .stat-icon {
      background: var(--apple-surface-secondary);
      color: var(--apple-accent-blue);
    }
    

    

  }
</style>