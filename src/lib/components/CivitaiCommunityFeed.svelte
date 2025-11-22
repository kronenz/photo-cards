<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import HolographicCard from '$lib/holographic/HolographicCard.svelte';

  // Types
  interface CommunityCard {
    id: string;
    image: string;
    title: string;
    subtitle?: string;
    creator: {
      id: string;
      name: string;
      avatar?: string;
    };
    stats: {
      likes: number;
      comments: number;
      downloads: number;
      rating: number;
    };
    tags: string[];
    holographicType: 'basic' | 'cosmic' | 'rainbow' | 'aurora';
    team?: string;
    rarity: string;
    isLiked?: boolean;
    isBookmarked?: boolean;
  }

  interface MasonryItem {
    id: string;
    card: CommunityCard;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  }

  // Props
  export let filter: 'trending' | 'latest' | 'popular' | 'following' = 'trending';
  export let teamFilter: string | undefined = undefined;
  export let searchQuery: string = '';
  export let columns: number = 4;

  // State
  let cards: CommunityCard[] = [];
  let masonryLayout: MasonryItem[] = [];
  let containerWidth: number = 0;
  let containerHeight: number = 800;
  let scrollY: number = 0;
  let loading: boolean = false;
  let hasMore: boolean = true;

  // Responsive columns
  $: responsiveColumns =
    containerWidth < 640 ? 1 :
    containerWidth < 1024 ? 2 :
    containerWidth < 1440 ? 3 :
    columns;

  // Mock data - Replace with real API call
  function generateMockCards(count: number): CommunityCard[] {
    const types: Array<'basic' | 'cosmic' | 'rainbow' | 'aurora'> = ['basic', 'cosmic', 'rainbow', 'aurora'];
    const teams = ['LG', 'DOOSAN', 'KT', 'SAMSUNG', 'NC', 'KIA', 'LOTTE', 'SSG', 'HANWHA', 'KIWOOM'];
    const rarities = ['★', '★★', '★★★', '★★★★', '★★★★★'];

    return Array.from({ length: count }, (_, i) => ({
      id: `card-${Date.now()}-${i}`,
      image: `https://assets.codepen.io/13471/${['charizard-gx', 'pikachu-gx', 'mewtwo-gx'][i % 3]}.webp`,
      title: `포토카드 #${i + 1}`,
      subtitle: `${teams[i % teams.length]} ${['선수', '팀', '코치'][i % 3]}`,
      creator: {
        id: `creator-${i}`,
        name: `크리에이터 ${i + 1}`,
        avatar: undefined
      },
      stats: {
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        downloads: Math.floor(Math.random() * 500),
        rating: 3 + Math.random() * 2
      },
      tags: [teams[i % teams.length], '2024 시즌', '추억의 순간'],
      holographicType: types[i % types.length],
      team: teams[i % teams.length],
      rarity: rarities[i % rarities.length],
      isLiked: false,
      isBookmarked: false
    }));
  }

  // Masonry layout calculation
  function calculateMasonryLayout() {
    if (!cards.length || !containerWidth) return;

    const cols = responsiveColumns;
    const gap = 20;
    const cardWidth = (containerWidth - gap * (cols - 1)) / cols;
    const columnHeights = new Array(cols).fill(0);

    masonryLayout = cards.map((card) => {
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

      // Calculate card dimensions (60fps optimized - fixed aspect ratio)
      const height = cardWidth * 1.4; // 1:1.4 aspect ratio for cards

      const x = shortestColumnIndex * (cardWidth + gap);
      const y = columnHeights[shortestColumnIndex];

      // Update column height
      columnHeights[shortestColumnIndex] += height + gap;

      return {
        id: card.id,
        card,
        x,
        y,
        width: cardWidth,
        height,
        visible: true // Will be updated by scroll handler
      };
    });

    // Update container height
    containerHeight = Math.max(...columnHeights);
  }

  // Optimized scroll handler (60fps)
  let rafId: number | undefined;
  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (rafId !== undefined) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      scrollY = target.scrollTop;
      updateVisibleItems();

      // Infinite scroll
      if (hasMore && scrollY + target.clientHeight > containerHeight - 500) {
        loadMore();
      }
    });
  }

  function updateVisibleItems() {
    let hasChanges = false;
    const viewportTop = scrollY;
    const viewportBottom = scrollY + 1000; // Extended viewport for smooth scrolling

    for (let item of masonryLayout) {
      const shouldBeVisible =
        item.y < viewportBottom &&
        item.y + item.height > viewportTop - 200;

      if (item.visible !== shouldBeVisible) {
        item.visible = shouldBeVisible;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      masonryLayout = [...masonryLayout];
    }
  }

  // Load more cards (pagination)
  async function loadMore() {
    if (loading) return;

    loading = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCards = generateMockCards(20);
    cards = [...cards, ...newCards];

    loading = false;
    hasMore = cards.length < 100; // Stop at 100 for demo
  }

  // Card interactions
  async function handleLike(cardId: string) {
    cards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          isLiked: !card.isLiked,
          stats: {
            ...card.stats,
            likes: card.isLiked ? card.stats.likes - 1 : card.stats.likes + 1
          }
        };
      }
      return card;
    });
  }

  async function handleBookmark(cardId: string) {
    cards = cards.map(card =>
      card.id === cardId ? { ...card, isBookmarked: !card.isBookmarked } : card
    );
  }

  // Reactive layout recalculation
  $: if (cards.length || containerWidth) {
    calculateMasonryLayout();
  }

  // Initialize
  onMount(() => {
    cards = generateMockCards(20);
  });

  onDestroy(() => {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
  });
</script>

<div class="civitai-feed" bind:clientWidth={containerWidth}>
  <!-- Filter Bar -->
  <div class="filter-bar">
    <div class="filter-tabs">
      <button
        class="filter-tab"
        class:active={filter === 'trending'}
        on:click={() => filter = 'trending'}
      >
        🔥 Trending
      </button>
      <button
        class="filter-tab"
        class:active={filter === 'latest'}
        on:click={() => filter = 'latest'}
      >
        ⚡ Latest
      </button>
      <button
        class="filter-tab"
        class:active={filter === 'popular'}
        on:click={() => filter = 'popular'}
      >
        ⭐ Popular
      </button>
      <button
        class="filter-tab"
        class:active={filter === 'following'}
        on:click={() => filter = 'following'}
      >
        👥 Following
      </button>
    </div>

    <div class="filter-controls">
      <input
        type="search"
        placeholder="Search cards, creators, tags..."
        bind:value={searchQuery}
        class="search-input"
      />
    </div>
  </div>

  <!-- Masonry Grid -->
  <div
    class="masonry-container"
    on:scroll={handleScroll}
    style="height: 80vh; overflow-y: auto;"
  >
    <div
      class="masonry-grid"
      style="height: {containerHeight}px; position: relative;"
    >
      {#each masonryLayout as item (item.id)}
        {#if item.visible}
          <div
            class="masonry-item"
            style="
              position: absolute;
              left: {item.x}px;
              top: {item.y}px;
              width: {item.width}px;
              height: {item.height}px;
              transition: opacity 0.3s ease;
            "
            in:scale={{ duration: 300, easing: quintOut, start: 0.9 }}
          >
            <!-- Holographic Card with Hover Preview -->
            <div class="card-wrapper">
              <HolographicCard
                type={item.card.holographicType}
                image={item.card.image}
                title={item.card.title}
                subtitle={item.card.subtitle}
                rarity={item.card.rarity}
                team={item.card.team}
              />

              <!-- Hover Overlay with Stats -->
              <div class="hover-overlay">
                <div class="card-info">
                  <div class="creator-info">
                    <div class="creator-avatar">
                      {item.card.creator.name.charAt(0)}
                    </div>
                    <div class="creator-details">
                      <p class="creator-name">{item.card.creator.name}</p>
                      <p class="card-title-text">{item.card.title}</p>
                    </div>
                  </div>

                  <div class="card-stats">
                    <button
                      class="stat-btn"
                      class:active={item.card.isLiked}
                      on:click={() => handleLike(item.id)}
                    >
                      {item.card.isLiked ? '❤️' : '🤍'} {item.card.stats.likes}
                    </button>
                    <span class="stat">💬 {item.card.stats.comments}</span>
                    <span class="stat">⬇️ {item.card.stats.downloads}</span>
                    <span class="stat">⭐ {item.card.stats.rating.toFixed(1)}</span>
                  </div>

                  <div class="card-tags">
                    {#each item.card.tags.slice(0, 3) as tag}
                      <span class="tag">{tag}</span>
                    {/each}
                  </div>

                  <div class="card-actions">
                    <button
                      class="action-btn bookmark"
                      class:active={item.card.isBookmarked}
                      on:click={() => handleBookmark(item.id)}
                      aria-label="Bookmark"
                    >
                      {item.card.isBookmarked ? '🔖' : '📑'}
                    </button>
                    <button class="action-btn" aria-label="Share">
                      🔗
                    </button>
                    <button class="action-btn" aria-label="More">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}

      <!-- Loading indicator -->
      {#if loading}
        <div class="loading-indicator" in:fade>
          <div class="spinner"></div>
          <p>Loading more cards...</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .civitai-feed {
    width: 100%;
    max-width: 1920px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Filter Bar */
  .filter-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 16px 0;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .filter-tab {
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-tab:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .filter-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .filter-controls {
    display: flex;
    gap: 12px;
  }

  .search-input {
    flex: 1;
    padding: 12px 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  /* Masonry Grid */
  .masonry-container {
    border-radius: 16px;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }

  .masonry-container::-webkit-scrollbar {
    width: 8px;
  }

  .masonry-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .masonry-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .masonry-grid {
    position: relative;
    width: 100%;
  }

  .masonry-item {
    will-change: transform;
  }

  /* Card Wrapper */
  .card-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .card-wrapper:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }

  /* Hover Overlay */
  .hover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.7) 60%,
      rgba(0, 0, 0, 0.9) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 16px;
    pointer-events: none;
  }

  .card-wrapper:hover .hover-overlay {
    opacity: 1;
    pointer-events: all;
  }

  .card-info {
    color: white;
  }

  .creator-info {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .creator-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .creator-details {
    flex: 1;
    min-width: 0;
  }

  .creator-name {
    font-size: 12px;
    font-weight: 600;
    margin: 0 0 2px 0;
    opacity: 0.9;
  }

  .card-title-text {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-stats {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 13px;
    flex-wrap: wrap;
  }

  .stat-btn {
    background: none;
    border: none;
    color: white;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease;
  }

  .stat-btn:hover {
    transform: scale(1.1);
  }

  .stat-btn.active {
    color: #ff6b6b;
  }

  .stat {
    opacity: 0.9;
  }

  .card-tags {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 11px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    backdrop-filter: blur(10px);
  }

  .card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .action-btn.active {
    background: rgba(255, 215, 0, 0.3);
  }

  /* Loading */
  .loading-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 8px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .civitai-feed {
      padding: 0 12px;
    }

    .filter-tab {
      padding: 8px 16px;
      font-size: 13px;
    }

    .search-input {
      padding: 10px 16px;
    }
  }
</style>
