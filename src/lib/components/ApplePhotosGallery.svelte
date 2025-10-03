<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { spring } from 'svelte/motion';
  import { writable } from 'svelte/store';
  import EnhancedCard from '$lib/components/EnhancedCard.svelte';
  
  export let cards: any[] = [];
  export let loading = false;
  export let hasMore = true;
  export let onLoadMore: () => Promise<void> = async () => {};
  export let onCardClick: (card: any) => void = () => {};
  export let onCardSelect: (card: any, selected: boolean) => void = () => {};
  export let selectionMode = false;
  export let selectedCards: Set<string> = new Set();

  // Responsive grid configuration
  let containerWidth = 0;
  let containerHeight = 0;
  let columns = 4;
  let itemWidth = 200;
  let gap = 8; // 적절한 간격 유지
  
  // Virtual scrolling
  let scrollContainer: HTMLElement;
  let scrollY = 0;
  let visibleRange = { start: 0, end: 50 };
  let itemHeight = 280; // Base height for cards
  
  // Loading states
  let isLoadingMore = false;
  let observer: IntersectionObserver;
  
  // Animation springs
  const cardScale = spring(1, { stiffness: 0.3, damping: 0.8 });
  const loadingOpacity = spring(0, { stiffness: 0.2, damping: 0.4 });
  
  // Masonry layout calculation
  let masonryLayout: Array<{
    card: any;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  }> = [];
  
  // Column heights for masonry
  let columnHeights: number[] = [];

  // Calculate responsive columns
  function calculateColumns(width: number): number {
    if (width < 480) return 1; // 모바일에서 1열
    if (width < 768) return 2; // 태블릿에서 2열
    if (width < 1024) return 3; // 작은 데스크톱에서 3열
    if (width < 1400) return 4; // 중간 데스크톱에서 4열
    if (width < 1800) return 5; // 큰 데스크톱에서 5열
    return 6; // 매우 큰 화면에서만 6열
  }

  // Calculate item dimensions
  function calculateItemDimensions(containerWidth: number, columns: number) {
    const totalGap = gap * (columns - 1);
    const availableWidth = containerWidth - totalGap;
    itemWidth = Math.floor(availableWidth / columns);
  }

  // Calculate masonry layout
  function calculateMasonryLayout() {
    if (!cards.length || !containerWidth) return;
    
    columns = calculateColumns(containerWidth);
    calculateItemDimensions(containerWidth, columns);
    
    // Initialize column heights
    columnHeights = new Array(columns).fill(0);
    masonryLayout = [];
    
    cards.forEach((card, index) => {
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Calculate card dimensions (aspect ratio based)
      const aspectRatio = card.aspectRatio || 1.4; // Default card aspect ratio
      const cardHeight = Math.floor(itemWidth * aspectRatio);
      
      // Position calculation
      const x = shortestColumnIndex * (itemWidth + gap);
      const y = columnHeights[shortestColumnIndex];
      
      // Check if item is in visible range
      const visible = y < scrollY + containerHeight + 500 && y + cardHeight > scrollY - 500;
      
      masonryLayout.push({
        card,
        x,
        y,
        width: itemWidth,
        height: cardHeight,
        visible
      });
      
      // Update column height
      columnHeights[shortestColumnIndex] += cardHeight + gap;
    });
    
    // Update container height
    containerHeight = Math.max(...columnHeights);
  }

  // Handle scroll for virtual scrolling
  function handleScroll() {
    if (!scrollContainer) return;
    
    scrollY = scrollContainer.scrollTop;
    
    // Update visible range
    const buffer = 500;
    visibleRange.start = Math.max(0, Math.floor((scrollY - buffer) / itemHeight) * columns);
    visibleRange.end = Math.min(cards.length, Math.ceil((scrollY + containerHeight + buffer) / itemHeight) * columns);
    
    // Recalculate visible items
    masonryLayout = masonryLayout.map(item => ({
      ...item,
      visible: item.y < scrollY + containerHeight + buffer && item.y + item.height > scrollY - buffer
    }));
    
    // Load more if near bottom
    if (hasMore && !isLoadingMore && scrollY + containerHeight > containerHeight - 1000) {
      loadMore();
    }
  }

  // Load more cards
  async function loadMore() {
    if (isLoadingMore || !hasMore) return;
    
    isLoadingMore = true;
    loadingOpacity.set(1);
    
    try {
      await onLoadMore();
    } finally {
      isLoadingMore = false;
      loadingOpacity.set(0);
    }
  }

  // Handle card interaction
  function handleCardClick(item: any, event: MouseEvent) {
    if (selectionMode) {
      event.preventDefault();
      const isSelected = selectedCards.has(item.card.id);
      onCardSelect(item.card, !isSelected);
    } else {
      onCardClick(item.card);
    }
  }

  // Handle card hover
  function handleCardHover(hovering: boolean) {
    cardScale.set(hovering ? 1.05 : 1);
  }

  // Setup intersection observer for infinite scroll
  function setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  // Resize handler
  function handleResize() {
    if (scrollContainer) {
      containerWidth = scrollContainer.clientWidth;
      calculateMasonryLayout();
    }
  }

  onMount(() => {
    if (scrollContainer) {
      containerWidth = scrollContainer.clientWidth;
      calculateMasonryLayout();
    }
    
    setupIntersectionObserver();
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  });

  afterUpdate(() => {
    calculateMasonryLayout();
  });

  // Reactive statements
  $: if (cards.length && containerWidth) {
    calculateMasonryLayout();
  }
</script>

<div 
  class="apple-photos-gallery"
  bind:this={scrollContainer}
  on:scroll={handleScroll}
  style="--container-width: {containerWidth}px; --item-width: {itemWidth}px; --gap: {gap}px;"
>
  <!-- Masonry Container -->
  <div 
    class="masonry-container"
    style="height: {Math.max(...columnHeights)}px; position: relative;"
  >
    {#each masonryLayout as item, index (item.card.id)}
      {#if item.visible}
        <div
          class="masonry-item"
          class:selected={selectedCards.has(item.card.id)}
          class:selection-mode={selectionMode}
          style="
            transform: translate3d({item.x}px, {item.y}px, 0);
            width: {item.width}px;
            height: {item.height}px;
            scale: {$cardScale};
          "
          on:click={(e) => handleCardClick(item, e)}
          on:mouseenter={() => handleCardHover(true)}
          on:mouseleave={() => handleCardHover(false)}
          role="button"
          tabindex="0"
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCardClick(item, e);
            }
          }}
        >
          <!-- Enhanced Card Component -->
          <div class="enhanced-card-wrapper">
            <EnhancedCard
              frontImage={item.card.imageUrl || '/api/placeholder/400/560'}
              cardType={item.card.category === 'kbo' ? 'kbo' : 'custom'}
              teamOrType={item.card.tags?.find(tag => ['LG 트윈스', '두산 베어스', 'KT 위즈', '삼성 라이온즈', '롯데 자이언츠', '한화 이글스', 'NC 다이노스', 'KIA 타이거즈', 'SSG 랜더스', '키움 히어로즈'].includes(tag)) || 'custom'}
              holographicStyle={item.card.holographicEffect === 'rainbow' ? 'rainbow' : 
                               item.card.holographicEffect === 'metallic' ? 'cosmic' :
                               item.card.holographicEffect === 'prismatic' ? 'aurora' :
                               item.card.holographicEffect === 'chrome' ? 'galaxy' : 'basic'}
              enableFlip={false}
              animationSpeed={400}
              on:hover={(e) => console.log('Card hover:', e.detail)}
            >
              <!-- Card Info Overlay -->
              <div slot="front-content" class="card-info-overlay">
                <!-- Selection Indicator -->
                {#if selectionMode}
                  <div class="selection-indicator">
                    <div class="selection-circle" class:selected={selectedCards.has(item.card.id)}>
                      {#if selectedCards.has(item.card.id)}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      {/if}
                    </div>
                  </div>
                {/if}
                
                <!-- Card Info -->
                <div class="card-info">
                  <h3 class="card-title">{item.card.title || 'Untitled'}</h3>
                  {#if item.card.stats}
                    <div class="card-stats">
                      <span class="stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {item.card.stats.likes || 0}
                      </span>
                      <span class="stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {item.card.stats.views || 0}
                      </span>
                    </div>
                  {/if}
                </div>
              </div>
            </EnhancedCard>
          </div>
          
          <!-- Loading Skeleton -->
          {#if loading}
            <div class="loading-skeleton">
              <div class="skeleton-image"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
  
  <!-- Loading More Indicator -->
  {#if isLoadingMore}
    <div class="loading-more" style="opacity: {$loadingOpacity}">
      <div class="loading-spinner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      </div>
      <span>Loading more cards...</span>
    </div>
  {/if}
  
  <!-- Infinite Scroll Trigger -->
  <div class="scroll-trigger" bind:this={observer?.observe}></div>
</div>

<style>
  .apple-photos-gallery {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--bg-primary, #000);
    padding: var(--gap);
    
    /* Smooth scrolling */
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    
    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }
  
  .apple-photos-gallery::-webkit-scrollbar {
    width: 8px;
  }
  
  .apple-photos-gallery::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .apple-photos-gallery::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  .apple-photos-gallery::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .masonry-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
  }

  .masonry-item {
    position: absolute;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--card-bg, #1a1a1a);
    border: 2px solid transparent;
    
    /* GPU acceleration */
    will-change: transform, scale;
    transform-origin: center;
    backface-visibility: hidden;
  }
  
  .masonry-item:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  .masonry-item.selected {
    border-color: #007AFF;
    box-shadow: 
      0 0 0 3px rgba(0, 122, 255, 0.3),
      0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  .masonry-item.selection-mode {
    cursor: default;
  }

  .enhanced-card-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .card-info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    z-index: 10;
  }

  .selection-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
  }
  
  .selection-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.6);
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .selection-circle.selected {
    background: #007AFF;
    border-color: #007AFF;
    color: white;
  }

  .card-info {
    padding: 12px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    backdrop-filter: blur(20px);
    margin-top: auto;
    pointer-events: none;
  }
  
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #fff);
    margin: 0 0 8px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .card-stats {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  }
  
  .stat svg {
    width: 14px;
    height: 14px;
    stroke-width: 1.5;
  }

  .loading-skeleton {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--card-bg, #1a1a1a);
    display: flex;
    flex-direction: column;
    padding: 12px;
  }
  
  .skeleton-image {
    flex: 1;
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  
  .skeleton-text {
    height: 16px;
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  .skeleton-text.short {
    width: 60%;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: 14px;
  }
  
  .loading-spinner svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .scroll-trigger {
    height: 1px;
    width: 100%;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .apple-photos-gallery {
      padding: 4px;
    }
    
    .card-info {
      padding: 8px;
    }
    
    .card-title {
      font-size: 13px;
    }
    
    .stat {
      font-size: 11px;
    }
  }
  
  @media (max-width: 480px) {
    .apple-photos-gallery {
      padding: 2px;
    }
    
    .masonry-item {
      border-radius: 8px;
    }
  }

  /* High DPI displays */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .card-image img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .masonry-item,
    .card-image img,
    .holographic-overlay {
      transition: none;
      animation: none;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .apple-photos-gallery {
      --bg-primary: #000;
      --card-bg: #1a1a1a;
      --card-image-bg: #2a2a2a;
      --card-info-bg: rgba(26, 26, 26, 0.9);
      --text-primary: #fff;
      --text-secondary: rgba(255, 255, 255, 0.7);
    }
  }
  
  @media (prefers-color-scheme: light) {
    .apple-photos-gallery {
      --bg-primary: #f5f5f5;
      --card-bg: #fff;
      --card-image-bg: #f0f0f0;
      --card-info-bg: rgba(255, 255, 255, 0.9);
      --text-primary: #000;
      --text-secondary: rgba(0, 0, 0, 0.7);
    }
  }
</style>