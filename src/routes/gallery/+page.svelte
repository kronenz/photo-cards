<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import HolographicCard from '$lib/components/HolographicCard.svelte';
  import HolographicCardV2 from '$lib/components/HolographicCardV2.svelte';
  import CommunityFeed from '$lib/components/CommunityFeed.svelte';
  import KBOLiveSchedule from '$lib/components/KBOLiveSchedule.svelte';
  
  // Type definitions
  interface CardStats {
    likes: number;
    views: number;
    comments: number;
    shares: number;
    downloads: number;
    bookmarks: number;
  }
  
  interface InteractiveElement {
    x: number;
    y: number;
    tooltip: string;
    type: string;
  }
  
  interface Card {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    holographicEffect: string;
    aspectRatio: number;
    tags: string[];
    category: string;
    isPublic: boolean;
    createdAt: string;
    stats: CardStats;
    hasVideo: boolean;
    hasAudio: boolean;
    hasMultipleImages: boolean;
    rating: number;
    interactiveElements?: InteractiveElement[];
  }
  
  // Gallery state
  let cards = writable<Card[]>([]);
  let filteredCards = writable<Card[]>([]);
  let loading = false;
  let hasMore = true;
  let currentPage = 1;
  let showCommunity = false;
  let selectedTeamId: string | undefined = undefined;
  

  
  // Mock data for demonstration
  const mockCards: Card[] = [
    {
      id: '1',
      title: '이승엽 홈런왕 기념 카드 (V1)',
      description: '2003년 시즌 56홈런으로 아시아 신기록을 세운 역사적 순간',
      imageUrl: 'https://assets.codepen.io/13471/charizard-gx.webp',
      holographicEffect: 'rainbow',
      aspectRatio: 1.4,
      tags: ['이승엽', 'KBO', '홈런왕', '삼성 라이온즈', '역사'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-15T10:30:00Z',
      stats: {
        likes: 234,
        views: 1567,
        comments: 45,
        shares: 23,
        downloads: 89,
        bookmarks: 156
      },
      hasVideo: false,
      hasAudio: true,
      hasMultipleImages: false,
      rating: 4.8,
      interactiveElements: [
        { x: 30, y: 40, tooltip: '홈런 궤적', type: 'trajectory' },
        { x: 70, y: 60, tooltip: '관중 반응', type: 'crowd' }
      ]
    },
    {
      id: '1v2',
      title: '이승엽 홈런왕 기념 카드 (V2)',
      description: '2003년 시즌 56홈런으로 아시아 신기록을 세운 역사적 순간 - Pokemon 스타일 홀로그래픽',
      imageUrl: 'https://assets.codepen.io/13471/charizard-gx.webp',
      holographicEffect: 'rare holo',
      aspectRatio: 1.4,
      tags: ['이승엽', 'KBO', '홈런왕', '삼성 라이온즈', '역사', 'V2'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-15T10:30:00Z',
      stats: {
        likes: 234,
        views: 1567,
        comments: 45,
        shares: 23,
        downloads: 89,
        bookmarks: 156
      },
      hasVideo: false,
      hasAudio: true,
      hasMultipleImages: false,
      rating: 4.8,
      interactiveElements: [
        { x: 30, y: 40, tooltip: '홈런 궤적', type: 'trajectory' },
        { x: 70, y: 60, tooltip: '관중 반응', type: 'crowd' }
      ]
    },
    {
      id: '2',
      title: '박찬호 메이저리그 진출 기념 (V1)',
      description: '한국인 최초 메이저리그 진출의 감동적인 순간',
      imageUrl: 'https://assets.codepen.io/13471/pikachu-gx.webp',
      holographicEffect: 'metallic',
      aspectRatio: 1.5,
      tags: ['박찬호', '메이저리그', 'MLB', '한국인 최초', '감동'],
      category: 'mlb',
      isPublic: true,
      createdAt: '2024-01-14T15:20:00Z',
      stats: {
        likes: 189,
        views: 2341,
        comments: 67,
        shares: 34,
        downloads: 123,
        bookmarks: 201
      },
      hasVideo: true,
      hasAudio: false,
      hasMultipleImages: true,
      rating: 4.9
    },
    {
      id: '2v2',
      title: '박찬호 메이저리그 진출 기념 (V2)',
      description: '한국인 최초 메이저리그 진출의 감동적인 순간 - Galaxy 홀로그래픽',
      imageUrl: 'https://assets.codepen.io/13471/pikachu-gx.webp',
      holographicEffect: 'rare holo galaxy',
      aspectRatio: 1.5,
      tags: ['박찬호', '메이저리그', 'MLB', '한국인 최초', '감동', 'V2'],
      category: 'mlb',
      isPublic: true,
      createdAt: '2024-01-14T15:20:00Z',
      stats: {
        likes: 189,
        views: 2341,
        comments: 67,
        shares: 34,
        downloads: 123,
        bookmarks: 201
      },
      hasVideo: true,
      hasAudio: false,
      hasMultipleImages: true,
      rating: 4.9
    },
    {
      id: '3',
      title: 'LG 트윈스 우승 기념 카드 (V1)',
      description: '29년 만의 한국시리즈 우승! 팬들의 눈물과 환희',
      imageUrl: 'https://assets.codepen.io/13471/eevee-gx.webp',
      holographicEffect: 'prismatic',
      aspectRatio: 1.45,
      tags: ['LG 트윈스', '한국시리즈', '우승', '29년만', '환희'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-13T20:45:00Z',
      stats: {
        likes: 456,
        views: 3892,
        comments: 123,
        shares: 78,
        downloads: 234,
        bookmarks: 345
      },
      hasVideo: true,
      hasAudio: true,
      hasMultipleImages: false,
      rating: 5.0
    },
    {
      id: '3v2',
      title: 'LG 트윈스 우승 기념 카드 (V2)',
      description: '29년 만의 한국시리즈 우승! 팬들의 눈물과 환희 - Rainbow 홀로그래픽',
      imageUrl: 'https://assets.codepen.io/13471/eevee-gx.webp',
      holographicEffect: 'rare rainbow',
      aspectRatio: 1.45,
      tags: ['LG 트윈스', '한국시리즈', '우승', '29년만', '환희', 'V2'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-13T20:45:00Z',
      stats: {
        likes: 456,
        views: 3892,
        comments: 123,
        shares: 78,
        downloads: 234,
        bookmarks: 345
      },
      hasVideo: true,
      hasAudio: true,
      hasMultipleImages: false,
      rating: 5.0
    }
  ];

  // Load initial cards
  async function loadInitialCards() {
    loading = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const initialCards = mockCards;
    cards.set(initialCards);
    filteredCards.set(initialCards);
    
    loading = false;
  }

  // Load more cards (infinite scroll)
  async function loadMoreCards() {
    if (!hasMore || loading) return;
    
    loading = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate more mock cards (both V1 and V2)
    const moreCards: Card[] = [];
    
    for (let i = 0; i < 3; i++) {
      const baseId = currentPage * 3 + i + 1;
      const images = ['https://assets.codepen.io/13471/mewtwo-gx.webp', 'https://assets.codepen.io/13471/charizard-gx.webp', 'https://assets.codepen.io/13471/pikachu-gx.webp'];
      const v1Effects = ['rainbow', 'metallic', 'prismatic'];
      const v2Effects = ['rare holo', 'rare holo galaxy', 'rare rainbow'];
      
      // V1 card
      moreCards.push({
        id: `${baseId}`,
        title: `Generated Card ${baseId} (V1)`,
        description: `This is a generated V1 card for demonstration purposes`,
        imageUrl: images[i % 3],
        holographicEffect: v1Effects[i % 3],
        aspectRatio: 1.3 + (i * 0.1),
        tags: ['Generated', 'Demo', 'Test'],
        category: 'general',
        isPublic: true,
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
        stats: {
          likes: Math.floor(Math.random() * 500),
          views: Math.floor(Math.random() * 3000),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50),
          downloads: Math.floor(Math.random() * 200),
          bookmarks: Math.floor(Math.random() * 300)
        },
        hasVideo: Math.random() > 0.5,
        hasAudio: Math.random() > 0.7,
        hasMultipleImages: Math.random() > 0.8,
        rating: 3 + Math.random() * 2
      });
      
      // V2 card
      moreCards.push({
        id: `${baseId}v2`,
        title: `Generated Card ${baseId} (V2)`,
        description: `This is a generated V2 Pokemon-style card for demonstration purposes`,
        imageUrl: images[i % 3],
        holographicEffect: v2Effects[i % 3],
        aspectRatio: 1.3 + (i * 0.1),
        tags: ['Generated', 'Demo', 'Test', 'V2'],
        category: 'general',
        isPublic: true,
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
        stats: {
          likes: Math.floor(Math.random() * 500),
          views: Math.floor(Math.random() * 3000),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50),
          downloads: Math.floor(Math.random() * 200),
          bookmarks: Math.floor(Math.random() * 300)
        },
        hasVideo: Math.random() > 0.5,
        hasAudio: Math.random() > 0.7,
        hasMultipleImages: Math.random() > 0.8,
        rating: 3 + Math.random() * 2
      });
    }
    
    cards.update(current => [...current, ...moreCards]);
    filteredCards.update(current => [...current, ...moreCards]);
    
    currentPage++;
    
    // Stop loading more after 3 pages for demo
    if (currentPage >= 3) {
      hasMore = false;
    }
    
    loading = false;
  }



  // Handle card click
  function handleCardClick(card: Card) {
    console.log('Card clicked:', card.title);
    alert(`카드 클릭됨: ${card.title}`);
  }

  onMount(() => {
    loadInitialCards();
  });
</script>

<svelte:head>
  <title>Holographic Cards Gallery & Community</title>
  <meta name="description" content="Holographic card showcase and KBO community" />
</svelte:head>

<div class="gallery-page">
  <!-- Navigation Tabs -->
  <div class="page-tabs">
    <button 
      class="tab-button" 
      class:active={!showCommunity}
      on:click={() => showCommunity = false}
    >
      <span class="tab-icon">🎴</span>
      카드 갤러리
    </button>
    <button 
      class="tab-button" 
      class:active={showCommunity}
      on:click={() => showCommunity = true}
    >
      <span class="tab-icon">⚾</span>
      KBO 커뮤니티
    </button>
  </div>

  {#if showCommunity}
    <!-- Community Section -->
    <div class="community-section">
      <div class="community-layout">
        <!-- Sidebar with KBO Schedule -->
        <aside class="community-sidebar">
          <KBOLiveSchedule {selectedTeamId} compact={false} />
        </aside>
        
        <!-- Main Community Feed -->
        <main class="community-main">
          <CommunityFeed 
            {selectedTeamId}
            showTeamSelector={true}
            showPostComposer={true}
            on:teamSelect={(e) => selectedTeamId = e.detail}
          />
        </main>
      </div>
    </div>
  {:else}
    <!-- Cards Gallery Section -->
    <div class="cards-section">
      {#if loading && $filteredCards.length === 0}
        <div class="loading-state">
          <div class="loading-spinner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
          <p>Loading cards...</p>
        </div>
      {:else}
        <div class="cards-grid">
          {#each $filteredCards as card (card.id)}
            <div 
              class="card-item"
              on:click={() => handleCardClick(card)}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(card);
                }
              }}
              role="button"
              tabindex="0"
            >
              <!-- Holographic Card Component -->
              <div class="holographic-card-container">
                {#if card.tags.includes('V2')}
                  <!-- V2 Pokemon-style holographic card -->
                  <HolographicCardV2
                    frontImage={card.imageUrl}
                    title={card.title}
                    rarity={card.holographicEffect}
                    subtypes=""
                    supertype="pokémon"
                    gallery={false}
                    enableFlip={false}
                    animationSpeed={400}
                    on:hover={(e) => console.log('Card V2 hover:', e.detail)}
                    on:click={() => handleCardClick(card)}
                  />
                {:else}
                  <!-- Original holographic card -->
                  <HolographicCard
                    frontImage={card.imageUrl}
                    title={card.title}
                    holographicStyle={card.holographicEffect === 'rainbow' ? 'rainbow' : 
                                     card.holographicEffect === 'metallic' ? 'cosmic' :
                                     card.holographicEffect === 'prismatic' ? 'aurora' :
                                     card.holographicEffect === 'chrome' ? 'galaxy' : 'rainbow'}
                    enableFlip={false}
                    animationSpeed={400}
                    on:hover={(e) => console.log('Card hover:', e.detail)}
                    on:click={() => handleCardClick(card)}
                  />
                {/if}
              </div>
            </div>
          {/each}
        </div>
        
        {#if hasMore}
          <div class="load-more-section">
            <button 
              class="load-more-button"
              on:click={loadMoreCards}
              disabled={loading}
            >
              {#if loading}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Loading...
              {:else}
                Load More Cards
              {/if}
            </button>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .gallery-page {
    min-height: 100vh;
    background: var(--bg-primary);
    transition: background-color 0.3s ease;
  }

  .page-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color, #e1e5e9);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: none;
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .tab-button:hover {
    color: var(--text-primary, #1a1a1a);
    background: rgba(59, 130, 246, 0.1);
  }

  .tab-button.active {
    color: var(--primary-color, #3b82f6);
    border-color: var(--primary-color, #3b82f6);
    background: rgba(59, 130, 246, 0.1);
  }

  .tab-icon {
    font-size: 20px;
  }

  .community-section {
    padding: 24px;
  }

  .community-layout {
    display: flex;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .community-sidebar {
    width: 320px;
    flex-shrink: 0;
  }

  .community-main {
    flex: 1;
    min-width: 0;
  }

  .cards-section {
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .cards-only-page {
    min-height: 100vh;
    background: var(--bg-primary);
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    transition: background-color 0.3s ease;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: var(--text-primary);
    position: relative;
    z-index: 1;
  }
  
  .loading-spinner svg {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    stroke: var(--text-primary);
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    max-width: 1600px;
    width: 100%;
    margin-bottom: 40px;
    justify-items: center;
    position: relative;
    z-index: 1;
  }

  .card-item {
    position: relative;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
    overflow: visible;
    padding: 12px;
    width: 100%;
    max-width: 320px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .card-item:hover {
    transform: translateY(-12px) scale(1.02);
    filter: drop-shadow(0 20px 40px var(--shadow-color));
  }
  
  .card-item {
    cursor: pointer;
  }

  .holographic-card-container {
    width: 100%;
  }

  /* Holographic Card specific styles */
  :global(.holographic-card-container .holographic-card) {
    width: 100%;
    height: 100%;
  }

  .load-more-section {
    display: flex;
    justify-content: center;
    padding: 40px 0;
    position: relative;
    z-index: 1;
  }
  
  .load-more-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    background: var(--button-bg);
    border: 2px solid var(--button-border);
    border-radius: 16px;
    color: var(--button-text);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .load-more-button:hover:not(:disabled) {
    background: var(--button-bg-hover);
    border-color: var(--button-border-hover);
    transform: translateY(-4px);
    box-shadow: 0 8px 32px var(--button-shadow);
  }
  
  .load-more-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .load-more-button svg {
    animation: spin 1s linear infinite;
    stroke: var(--button-text);
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .cards-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 28px;
      max-width: 1200px;
    }
  }

  @media (max-width: 1024px) {
    .cards-grid {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    
    .card-item {
      max-width: 280px;
    }
  }
  
  @media (max-width: 768px) {
    .cards-only-page {
      padding: 24px 16px;
    }
    
    .cards-grid {
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }
    
    .card-item {
      max-width: 260px;
      padding: 8px;
    }
  }
  
  @media (max-width: 480px) {
    .cards-only-page {
      padding: 20px 12px;
    }
    
    .cards-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      max-width: 300px;
    }
    
    .card-item {
      max-width: 280px;
      padding: 6px;
    }
    
    .card-item:hover {
      transform: translateY(-8px) scale(1.01);
    }
  }

  /* Theme Variables */
  :root {
    /* Light theme (default) */
    --bg-primary: #ffffff;
    --text-primary: rgba(0, 0, 0, 0.87);
    --text-secondary: rgba(0, 0, 0, 0.6);
    --shadow-color: rgba(0, 0, 0, 0.15);
    --button-bg: #f8f9fa;
    --button-border: #e9ecef;
    --button-text: #495057;
    --button-bg-hover: #e9ecef;
    --button-border-hover: #dee2e6;
    --button-shadow: rgba(0, 0, 0, 0.1);
  }

  /* Dark theme */
  @media (prefers-color-scheme: dark) {
    :root {
      --bg-primary: #0d1117;
      --text-primary: rgba(255, 255, 255, 0.87);
      --text-secondary: rgba(255, 255, 255, 0.6);
      --shadow-color: rgba(0, 0, 0, 0.4);
      --button-bg: #21262d;
      --button-border: #30363d;
      --button-text: #f0f6fc;
      --button-bg-hover: #30363d;
      --button-border-hover: #484f58;
      --button-shadow: rgba(0, 0, 0, 0.3);
    }
  }

  /* Manual theme classes for theme toggle */
  .cards-only-page.light-theme {
    --bg-primary: #ffffff;
    --text-primary: rgba(0, 0, 0, 0.87);
    --text-secondary: rgba(0, 0, 0, 0.6);
    --shadow-color: rgba(0, 0, 0, 0.15);
    --button-bg: #f8f9fa;
    --button-border: #e9ecef;
    --button-text: #495057;
    --button-bg-hover: #e9ecef;
    --button-border-hover: #dee2e6;
    --button-shadow: rgba(0, 0, 0, 0.1);
  }

  .cards-only-page.dark-theme {
    --bg-primary: #0d1117;
    --text-primary: rgba(255, 255, 255, 0.87);
    --text-secondary: rgba(255, 255, 255, 0.6);
    --shadow-color: rgba(0, 0, 0, 0.4);
    --button-bg: #21262d;
    --button-border: #30363d;
    --button-text: #f0f6fc;
    --button-bg-hover: #30363d;
    --button-border-hover: #484f58;
    --button-shadow: rgba(0, 0, 0, 0.3);
  }

  /* Community responsive design */
  @media (max-width: 1024px) {
    .community-layout {
      flex-direction: column;
      gap: 16px;
    }

    .community-sidebar {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .page-tabs {
      padding: 16px;
    }

    .tab-button {
      padding: 10px 20px;
      font-size: 14px;
    }

    .tab-icon {
      font-size: 18px;
    }

    .community-section {
      padding: 16px;
    }

    .cards-section {
      padding: 24px 16px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .card-item {
      transition: none;
      animation: none;
    }
  }
</style>