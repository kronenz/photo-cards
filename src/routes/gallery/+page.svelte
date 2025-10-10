<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
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
  
  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
  type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

  interface Card {
    id: string;
    title: string;
    subtitle: string;
    number: string;
    description: string;
    imageUrl: string;
    team: TeamId;
    rarity: RarityType;
    tags: string[];
    category: string;
    isPublic: boolean;
    createdAt: string;
    stats: CardStats;
    rating: number;
  }
  
  // Gallery state
  let cards = writable<Card[]>([]);
  let filteredCards = writable<Card[]>([]);
  let loading = false;
  let hasMore = true;
  let currentPage = 1;

  // Tab state
  type GalleryTab = 'all' | 'popular' | 'recent' | 'legendary' | 'kbo' | 'mlb' | 'mine';
  let activeTab: GalleryTab = 'all';

  // Modal state
  let selectedCard: Card | null = null;

  // Mock data
  const mockCards: Card[] = [
    {
      id: '1',
      title: '이승엽',
      subtitle: '외야수',
      number: '36',
      description: '2003년 시즌 56홈런으로 아시아 신기록을 세운 역사적 순간',
      imageUrl: 'https://assets.codepen.io/13471/charizard-gx.webp',
      team: 'samsung',
      rarity: 'legendary',
      tags: ['#이승엽', '#홈런왕', '#삼성라이온즈'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-15T10:30:00Z',
      stats: { likes: 234, views: 1567, comments: 45, shares: 23, downloads: 89, bookmarks: 156 },
      rating: 4.8
    },
    {
      id: '2',
      title: '박찬호',
      subtitle: '투수',
      number: '61',
      description: '한국인 최초 메이저리그 진출의 감동적인 순간',
      imageUrl: 'https://assets.codepen.io/13471/pikachu-gx.webp',
      team: 'hanwha',
      rarity: 'epic',
      tags: ['#박찬호', '#메이저리그', '#MLB'],
      category: 'mlb',
      isPublic: true,
      createdAt: '2024-01-14T15:20:00Z',
      stats: { likes: 189, views: 2341, comments: 67, shares: 34, downloads: 123, bookmarks: 201 },
      rating: 4.9
    },
    {
      id: '3',
      title: '류현진',
      subtitle: '투수',
      number: '99',
      description: '29년 만의 한국시리즈 우승! 팬들의 눈물과 환희',
      imageUrl: 'https://assets.codepen.io/13471/eevee-gx.webp',
      team: 'lg',
      rarity: 'rare',
      tags: ['#LG트윈스', '#한국시리즈', '#우승'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-13T20:45:00Z',
      stats: { likes: 456, views: 3892, comments: 123, shares: 78, downloads: 234, bookmarks: 345 },
      rating: 5.0
    },
    {
      id: '4',
      title: '김도영',
      subtitle: '내야수',
      number: '5',
      description: 'KBO 최연소 트리플크라운 달성',
      imageUrl: 'https://assets.codepen.io/13471/mewtwo-gx.webp',
      team: 'kia',
      rarity: 'legendary',
      tags: ['#김도영', '#트리플크라운', '#KIA'],
      category: 'kbo',
      isPublic: true,
      createdAt: '2024-01-12T10:00:00Z',
      stats: { likes: 567, views: 4123, comments: 89, shares: 45, downloads: 178, bookmarks: 432 },
      rating: 4.9
    }
  ];

  // Load initial cards
  async function loadInitialCards() {
    loading = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    const initialCards = mockCards;
    cards.set(initialCards);
    filteredCards.set(initialCards);
    loading = false;
  }

  // Load more cards
  async function loadMoreCards() {
    if (!hasMore || loading) return;
    loading = true;
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const teams: TeamId[] = ['lg', 'doosan', 'kt', 'samsung', 'nc', 'kia', 'lotte', 'ssg', 'hanwha', 'kiwoom'];
    const rarities: RarityType[] = ['common', 'rare', 'epic', 'legendary'];
    const images = [
      'https://assets.codepen.io/13471/charizard-gx.webp',
      'https://assets.codepen.io/13471/pikachu-gx.webp',
      'https://assets.codepen.io/13471/eevee-gx.webp',
      'https://assets.codepen.io/13471/mewtwo-gx.webp'
    ];
    
    const moreCards: Card[] = [];
    for (let i = 0; i < 4; i++) {
      const baseId = currentPage * 4 + i + 1;
      moreCards.push({
        id: `gen-${baseId}`,
        title: `선수 ${baseId}`,
        subtitle: i % 2 === 0 ? '투수' : '타자',
        number: `${Math.floor(Math.random() * 99) + 1}`,
        description: `생성된 카드 #${baseId}`,
        imageUrl: images[i % 4],
        team: teams[i % 10],
        rarity: rarities[i % 4],
        tags: ['#Generated', '#Demo'],
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
        rating: 3 + Math.random() * 2
      });
    }
    
    cards.update(current => [...current, ...moreCards]);
    filteredCards.update(current => [...current, ...moreCards]);
    currentPage++;
    
    if (currentPage >= 3) hasMore = false;
    loading = false;
  }

  // Filter cards based on active tab
  function filterCards(tab: GalleryTab) {
    activeTab = tab;
    const allCards = $cards;

    let filtered: Card[] = [];

    switch (tab) {
      case 'all':
        filtered = allCards;
        break;
      case 'popular':
        filtered = [...allCards].sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'recent':
        filtered = [...allCards].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'legendary':
        filtered = allCards.filter(card => card.rarity === 'legendary');
        break;
      case 'kbo':
        filtered = allCards.filter(card => card.category === 'kbo');
        break;
      case 'mlb':
        filtered = allCards.filter(card => card.category === 'mlb');
        break;
      case 'mine':
        // TODO: 실제로는 사용자 ID로 필터링
        filtered = allCards.slice(0, 2);
        break;
      default:
        filtered = allCards;
    }

    filteredCards.set(filtered);
  }

  function handleCardClick(card: Card) {
    selectedCard = card;
  }

  function closeModal() {
    selectedCard = null;
  }

  // Watch for tab changes
  $: if (activeTab) {
    filterCards(activeTab);
  }

  onMount(() => {
    loadInitialCards();
  });
</script>

<svelte:head>
  <title>Holographic Cards Gallery & Community</title>
  <meta name="description" content="Holographic card showcase and community" />
</svelte:head>

<div class="gallery-page">
  <!-- Navigation Tabs -->
  <div class="page-tabs">
    <button class="tab-button" class:active={activeTab === 'all'} on:click={() => filterCards('all')}>
      <span class="tab-icon">🔥</span>
      <span class="tab-label">전체</span>
    </button>
    <button class="tab-button" class:active={activeTab === 'popular'} on:click={() => filterCards('popular')}>
      <span class="tab-icon">⭐</span>
      <span class="tab-label">인기</span>
    </button>
    <button class="tab-button" class:active={activeTab === 'recent'} on:click={() => filterCards('recent')}>
      <span class="tab-icon">🆕</span>
      <span class="tab-label">최신</span>
    </button>
    <button class="tab-button" class:active={activeTab === 'legendary'} on:click={() => filterCards('legendary')}>
      <span class="tab-icon">🏆</span>
      <span class="tab-label">레전더리</span>
    </button>
    <button class="tab-button" class:active={activeTab === 'kbo'} on:click={() => filterCards('kbo')}>
      <span class="tab-icon">⚾</span>
      <span class="tab-label">KBO</span>
    </button>
    <button class="tab-button" class:active={activeTab === 'mlb'} on:click={() => filterCards('mlb')}>
      <span class="tab-icon">🌎</span>
      <span class="tab-label">MLB</span>
    </button>
    <button class="tab-button" class:active={activeTab === 'mine'} on:click={() => filterCards('mine')}>
      <span class="tab-icon">💎</span>
      <span class="tab-label">내 컬렉션</span>
    </button>
  </div>
    <!-- Cards Gallery Section -->
    <div class="cards-section">
      {#if loading && $filteredCards.length === 0}
        <div class="loading-state">
          <div class="loading-spinner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
          <p>카드 로딩중...</p>
        </div>
      {:else}
        <div class="cards-grid">
          {#each $filteredCards as card (card.id)}
            <div class="card-item" on:click={() => handleCardClick(card)} on:keydown={(e) => e.key === 'Enter' && handleCardClick(card)} role="button" tabindex="0">
              <UnifiedCard
                title={card.title}
                subtitle={card.subtitle}
                number={card.number}
                team={card.team}
                rarity={card.rarity}
                image={card.imageUrl}
                size="medium"
              />
            </div>
          {/each}
        </div>
        
        {#if hasMore}
          <div class="load-more-section">
            <button class="load-more-button" on:click={loadMoreCards} disabled={loading}>
              {#if loading}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                로딩중...
              {:else}
                더 보기
              {/if}
            </button>
          </div>
        {/if}
      {/if}
    </div>
</div>

<!-- Card Detail Modal -->
{#if selectedCard}
  <div class="modal-overlay" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()} role="button" tabindex="0">
    <div class="modal-content" on:click|stopPropagation role="dialog">
      <button class="modal-close" on:click={closeModal}>✕</button>
      
      <div class="modal-layout">
        <!-- Left: Card -->
        <div class="modal-card">
          <UnifiedCard
            title={selectedCard.title}
            subtitle={selectedCard.subtitle}
            number={selectedCard.number}
            team={selectedCard.team}
            rarity={selectedCard.rarity}
            image={selectedCard.imageUrl}
            size="large"
          />
        </div>

        <!-- Right: Details -->
        <div class="modal-details">
          <h2 class="modal-title">{selectedCard.title}</h2>
          <p class="modal-subtitle">{selectedCard.subtitle} #{selectedCard.number}</p>
          
          <div class="modal-stats">
            <div class="stat-item">
              <span class="stat-icon">❤️</span>
              <span class="stat-value">{selectedCard.stats.likes}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">👁️</span>
              <span class="stat-value">{selectedCard.stats.views}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💬</span>
              <span class="stat-value">{selectedCard.stats.comments}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🔖</span>
              <span class="stat-value">{selectedCard.stats.bookmarks}</span>
            </div>
          </div>

          <div class="modal-description">
            <h3>설명</h3>
            <p>{selectedCard.description}</p>
          </div>

          <div class="modal-tags">
            {#each selectedCard.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>

          <div class="modal-actions">
            <button class="action-btn primary">
              <span>❤️</span> 좋아요
            </button>
            <button class="action-btn">
              <span>🔖</span> 저장
            </button>
            <button class="action-btn">
              <span>📤</span> 공유
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .gallery-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  }

  .page-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 20px 16px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .page-tabs::-webkit-scrollbar {
    height: 4px;
  }

  .page-tabs::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  .tab-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
    font-family: inherit;
    white-space: nowrap;
    min-width: 80px;
  }

  .tab-button:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .tab-button.active {
    color: #fff;
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .tab-icon {
    font-size: 24px;
  }

  .tab-label {
    font-size: 12px;
    font-weight: 600;
  }


  .cards-section {
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: #fff;
  }
  
  .loading-spinner svg {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    stroke: #667eea;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 32px;
    max-width: 1600px;
    width: 100%;
    margin-bottom: 40px;
  }

  .card-item {
    cursor: pointer;
    transition: transform 0.3s ease;
    display: flex;
    justify-content: center;
  }
  
  .card-item:hover {
    transform: translateY(-8px);
  }

  .load-more-section {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }
  
  .load-more-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .load-more-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
  }
  
  .load-more-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .load-more-button svg {
    animation: spin 1s linear infinite;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    padding: 40px;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  .modal-layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 40px;
  }

  .modal-card {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .modal-details {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .modal-title {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin: 0;
  }

  .modal-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .modal-stats {
    display: flex;
    gap: 24px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
  }

  .stat-icon {
    font-size: 20px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
  }

  .modal-description h3 {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px 0;
  }

  .modal-description p {
    font-size: 16px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    padding: 6px 12px;
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.4);
    border-radius: 16px;
    color: #667eea;
    font-size: 14px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    flex: 1;
    padding: 14px 24px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: #667eea;
  }

  .action-btn.primary:hover {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .modal-layout {
      grid-template-columns: 1fr;
    }

    .modal-card {
      order: 2;
    }

    .modal-details {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 24px;
    }

    .page-tabs {
      padding: 16px 8px;
      gap: 6px;
      justify-content: flex-start;
    }

    .tab-button {
      padding: 8px 12px;
      min-width: 70px;
    }

    .tab-icon {
      font-size: 20px;
    }

    .tab-label {
      font-size: 11px;
    }

    .modal-content {
      padding: 24px;
    }

    .modal-title {
      font-size: 24px;
    }
  }

  @media (max-width: 480px) {
    .cards-grid {
      grid-template-columns: 1fr;
      max-width: 320px;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
</style>
