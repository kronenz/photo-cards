<script lang="ts">
  import { onMount } from 'svelte';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
  import { scrollFadeUp, scrollFadeLeft, scrollScale } from '$lib/transitions/scroll-animations';

  // Types
  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
  type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

  interface Card {
    id: string;
    title: string;
    subtitle: string;
    number: string;
    team: TeamId;
    rarity: RarityType;
    image: string;
    createdAt: string;
    stats: {
      likes: number;
      views: number;
    };
    isFavorite: boolean;
    albumId?: string;
  }

  interface Album {
    id: string;
    name: string;
    icon: string;
    count: number;
    color: string;
  }

  // State
  let cards: Card[] = [];
  let filteredCards: Card[] = [];
  let selectedAlbum: string = 'all';
  let selectedTeam: TeamId | null = null;
  let selectedRarity: RarityType | null = null;
  let searchQuery = '';
  let sortBy: 'recent' | 'name' | 'rarity' | 'likes' = 'recent';
  let selectedCard: Card | null = null;

  // Albums
  const albums: Album[] = [
    { id: 'all', name: '모든 카드', icon: '📁', count: 0, color: '#667eea' },
    { id: 'favorites', name: '즐겨찾기', icon: '⭐', count: 0, color: '#fbbf24' },
    { id: 'legendary', name: '레전더리', icon: '🏆', count: 0, color: '#f59e0b' },
    { id: 'kbo2024', name: 'KBO 2024', icon: '📕', count: 0, color: '#ef4444' },
    { id: 'allstar', name: '올스타', icon: '📗', count: 0, color: '#10b981' },
    { id: 'memories', name: '추억의 선수', icon: '📘', count: 0, color: '#3b82f6' }
  ];

  // Teams
  const teams = [
    { id: 'lg', name: 'LG', color: '#C30452' },
    { id: 'doosan', name: '두산', color: '#131230' },
    { id: 'kt', name: 'KT', color: '#000000' },
    { id: 'samsung', name: '삼성', color: '#074CA1' },
    { id: 'nc', name: 'NC', color: '#1D467F' },
    { id: 'kia', name: 'KIA', color: '#EA0029' },
    { id: 'lotte', name: '롯데', color: '#041E42' },
    { id: 'ssg', name: 'SSG', color: '#CE0E2D' },
    { id: 'hanwha', name: '한화', color: '#FF6600' },
    { id: 'kiwoom', name: '키움', color: '#570514' }
  ];

  // Mock cards
  const mockCards: Card[] = [
    {
      id: '1',
      title: '김도영',
      subtitle: '내야수',
      number: '5',
      team: 'kia',
      rarity: 'legendary',
      image: 'https://assets.codepen.io/13471/charizard-gx.webp',
      createdAt: '2024-01-10T10:30:00Z',
      stats: { likes: 567, views: 2341 },
      isFavorite: true,
      albumId: 'kbo2024'
    },
    {
      id: '2',
      title: '이승엽',
      subtitle: '외야수',
      number: '36',
      team: 'samsung',
      rarity: 'legendary',
      image: 'https://assets.codepen.io/13471/pikachu-gx.webp',
      createdAt: '2024-01-09T15:20:00Z',
      stats: { likes: 456, views: 1890 },
      isFavorite: true,
      albumId: 'memories'
    },
    {
      id: '3',
      title: '류현진',
      subtitle: '투수',
      number: '99',
      team: 'lg',
      rarity: 'epic',
      image: 'https://assets.codepen.io/13471/eevee-gx.webp',
      createdAt: '2024-01-08T12:00:00Z',
      stats: { likes: 342, views: 1567 },
      isFavorite: false,
      albumId: 'kbo2024'
    },
    {
      id: '4',
      title: '박찬호',
      subtitle: '투수',
      number: '61',
      team: 'hanwha',
      rarity: 'legendary',
      image: 'https://assets.codepen.io/13471/mewtwo-gx.webp',
      createdAt: '2024-01-07T09:15:00Z',
      stats: { likes: 389, views: 2100 },
      isFavorite: false,
      albumId: 'memories'
    },
    {
      id: '5',
      title: '손아섭',
      subtitle: '투수',
      number: '18',
      team: 'lotte',
      rarity: 'rare',
      image: 'https://assets.codepen.io/13471/charizard-gx.webp',
      createdAt: '2024-01-06T14:30:00Z',
      stats: { likes: 234, views: 987 },
      isFavorite: true,
      albumId: 'allstar'
    },
    {
      id: '6',
      title: '강백호',
      subtitle: '외야수',
      number: '50',
      team: 'kt',
      rarity: 'epic',
      image: 'https://assets.codepen.io/13471/pikachu-gx.webp',
      createdAt: '2024-01-05T11:00:00Z',
      stats: { likes: 298, views: 1234 },
      isFavorite: false,
      albumId: 'kbo2024'
    }
  ];

  // Load cards
  function loadCards() {
    cards = mockCards;
    applyFilters();
  }

  // Apply filters
  function applyFilters() {
    let result = [...cards];

    // Album filter
    if (selectedAlbum === 'favorites') {
      result = result.filter(c => c.isFavorite);
    } else if (selectedAlbum === 'legendary') {
      result = result.filter(c => c.rarity === 'legendary');
    } else if (selectedAlbum !== 'all') {
      result = result.filter(c => c.albumId === selectedAlbum);
    }

    // Team filter
    if (selectedTeam) {
      result = result.filter(c => c.team === selectedTeam);
    }

    // Rarity filter
    if (selectedRarity) {
      result = result.filter(c => c.rarity === selectedRarity);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rarity':
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        result.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        break;
      case 'likes':
        result.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    filteredCards = result;
  }

  // Toggle favorite
  function toggleFavorite(cardId: string) {
    cards = cards.map(c =>
      c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c
    );
    applyFilters();
  }

  // Calculate stats
  $: totalCards = cards.length;
  $: favoriteCount = cards.filter(c => c.isFavorite).length;
  $: legendaryCount = cards.filter(c => c.rarity === 'legendary').length;
  $: epicCount = cards.filter(c => c.rarity === 'epic').length;
  $: rareCount = cards.filter(c => c.rarity === 'rare').length;
  $: commonCount = cards.filter(c => c.rarity === 'common').length;
  $: completion = totalCards > 0 ? Math.round((legendaryCount + epicCount) / totalCards * 100) : 0;

  // Watch filters
  $: if (selectedAlbum || selectedTeam || selectedRarity || searchQuery || sortBy) {
    applyFilters();
  }

  onMount(() => {
    loadCards();
  });
</script>

<svelte:head>
  <title>내 컬렉션 - Baseball 홀로그래픽 카드</title>
  <meta name="description" content="카드 컬렉션을 관리하세요" />
</svelte:head>

<div class="collections-page">
  <!-- Left Sidebar - Albums -->
  <aside class="albums-sidebar">
    <div class="sidebar-header">
      <h3>앨범</h3>
    </div>

    <nav class="albums-list">
      {#each albums as album, i}
        <button
          class="album-item"
          class:active={selectedAlbum === album.id}
          on:click={() => selectedAlbum = album.id}
          use:scrollFadeLeft={{ duration: 500, delay: i * 60 }}
        >
          <span class="album-icon">{album.icon}</span>
          <span class="album-name">{album.name}</span>
          <span class="album-count">
            {#if album.id === 'all'}
              {totalCards}
            {:else if album.id === 'favorites'}
              {favoriteCount}
            {:else if album.id === 'legendary'}
              {legendaryCount}
            {:else}
              {cards.filter(c => c.albumId === album.id).length}
            {/if}
          </span>
        </button>
      {/each}

      <button class="album-item new-album" use:scrollFadeLeft={{ duration: 500, delay: albums.length * 60 }}>
        <span class="album-icon">➕</span>
        <span class="album-name">새 앨범</span>
      </button>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Header -->
    <header class="content-header" use:scrollFadeUp={{ duration: 600 }}>
      <div class="header-left">
        <h1 class="page-title">
          {albums.find(a => a.id === selectedAlbum)?.name || '내 컬렉션'}
        </h1>
        <div class="page-stats">
          <span>{filteredCards.length}장</span>
          <span class="divider">•</span>
          <span>완성도 {completion}%</span>
        </div>
      </div>
      <a href="/create" class="create-btn">
        ➕ 새 카드 만들기
      </a>
    </header>

    <!-- Filters & Sort -->
    <div class="filter-bar" use:scrollFadeUp={{ duration: 500, delay: 100 }}>
      <!-- Search -->
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="카드 검색..."
          bind:value={searchQuery}
          class="search-input"
        />
      </div>

      <!-- Team Filter -->
      <select bind:value={selectedTeam} class="filter-select">
        <option value={null}>모든 팀</option>
        {#each teams as team}
          <option value={team.id}>{team.name}</option>
        {/each}
      </select>

      <!-- Rarity Filter -->
      <select bind:value={selectedRarity} class="filter-select">
        <option value={null}>모든 희귀도</option>
        <option value="legendary">Legendary</option>
        <option value="epic">Epic</option>
        <option value="rare">Rare</option>
        <option value="common">Common</option>
      </select>

      <!-- Sort -->
      <select bind:value={sortBy} class="filter-select">
        <option value="recent">최신순</option>
        <option value="name">이름순</option>
        <option value="rarity">희귀도순</option>
        <option value="likes">인기순</option>
      </select>
    </div>

    <!-- Cards Grid -->
    <div class="cards-grid">
      {#each filteredCards as card, i (card.id)}
        <div class="card-wrapper" use:scrollScale={{ duration: 600, delay: Math.min(i * 50, 400) }}>
          <button
            class="card-container"
            on:click={() => selectedCard = card}
          >
            <UnifiedCard
              title={card.title}
              subtitle={card.subtitle}
              number={card.number}
              team={card.team}
              rarity={card.rarity}
              image={card.image}
              size="medium"
            />
          </button>

          <div class="card-actions">
            <button
              class="action-icon-btn"
              class:active={card.isFavorite}
              on:click|stopPropagation={() => toggleFavorite(card.id)}
            >
              {card.isFavorite ? '⭐' : '☆'}
            </button>
            <span class="card-likes">❤️ {card.stats.likes}</span>
          </div>
        </div>
      {/each}
    </div>

    {#if filteredCards.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>카드가 없습니다</h3>
        <p>필터를 변경하거나 새 카드를 만들어보세요</p>
      </div>
    {/if}
  </main>

  <!-- Right Sidebar - Stats -->
  <aside class="stats-sidebar">
    <!-- Collection Stats -->
    <div class="widget" use:scrollFadeUp={{ duration: 500, delay: 100 }}>
      <h3 class="widget-title">컬렉션 현황</h3>
      <div class="stats-list">
        <div class="stat-item">
          <span class="stat-label">총 카드</span>
          <span class="stat-value">{totalCards}장</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">완성도</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: {completion}%"></div>
          </div>
          <span class="stat-value">{completion}%</span>
        </div>
      </div>
    </div>

    <!-- Rarity Distribution -->
    <div class="widget" use:scrollFadeUp={{ duration: 500, delay: 200 }}>
      <h3 class="widget-title">희귀도 분포</h3>
      <div class="rarity-list">
        <div class="rarity-item legendary">
          <span class="rarity-label">🏆 Legendary</span>
          <span class="rarity-count">{legendaryCount}</span>
        </div>
        <div class="rarity-item epic">
          <span class="rarity-label">💎 Epic</span>
          <span class="rarity-count">{epicCount}</span>
        </div>
        <div class="rarity-item rare">
          <span class="rarity-label">💙 Rare</span>
          <span class="rarity-count">{rareCount}</span>
        </div>
        <div class="rarity-item common">
          <span class="rarity-label">⚪ Common</span>
          <span class="rarity-count">{commonCount}</span>
        </div>
      </div>
    </div>

    <!-- Team Distribution -->
    <div class="widget" use:scrollFadeUp={{ duration: 500, delay: 300 }}>
      <h3 class="widget-title">팀별 현황</h3>
      <div class="team-list">
        {#each teams.slice(0, 5) as team}
          {@const teamCount = cards.filter(c => c.team === team.id).length}
          <div class="team-item">
            <span class="team-name">{team.name}</span>
            <div class="team-bar">
              <div class="team-fill" style="width: {teamCount / totalCards * 100}%; background: {team.color}"></div>
            </div>
            <span class="team-count">{teamCount}</span>
          </div>
        {/each}
      </div>
    </div>
  </aside>
</div>

<!-- Card Detail Modal -->
{#if selectedCard}
  <div class="modal-overlay" on:click={() => selectedCard = null} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (selectedCard = null)}>
    <div class="modal-content" on:click|stopPropagation role="dialog">
      <button class="modal-close" on:click={() => selectedCard = null}>✕</button>

      <div class="modal-layout">
        <!-- Card Preview -->
        <div class="modal-card">
          <UnifiedCard
            title={selectedCard.title}
            subtitle={selectedCard.subtitle}
            number={selectedCard.number}
            team={selectedCard.team}
            rarity={selectedCard.rarity}
            image={selectedCard.image}
            size="large"
          />
        </div>

        <!-- Card Info -->
        <div class="modal-info">
          <h2 class="modal-title">{selectedCard.title}</h2>
          <p class="modal-subtitle">{selectedCard.subtitle} #{selectedCard.number}</p>

          <div class="modal-stats">
            <div class="modal-stat">
              <span>❤️</span>
              <span>{selectedCard.stats.likes}</span>
            </div>
            <div class="modal-stat">
              <span>👁️</span>
              <span>{selectedCard.stats.views}</span>
            </div>
            <div class="modal-stat">
              <span class:active={selectedCard.isFavorite}>{selectedCard.isFavorite ? '⭐' : '☆'}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-action-btn primary" on:click={() => toggleFavorite(selectedCard.id)}>
              {selectedCard.isFavorite ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기'}
            </button>
            <button class="modal-action-btn">📤 공유</button>
            <button class="modal-action-btn">✏️ 편집</button>
            <button class="modal-action-btn danger">🗑️ 삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .collections-page {
    display: grid;
    grid-template-columns: 280px 1fr 340px;
    gap: 24px;
    max-width: 1920px;
    margin: 0 auto;
    padding: 24px 40px;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  }

  /* Albums Sidebar */
  .albums-sidebar {
    position: sticky;
    top: 24px;
    height: fit-content;
  }

  .sidebar-header {
    margin-bottom: 16px;
  }

  .sidebar-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .albums-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .album-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .album-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .album-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    border-color: #667eea;
    color: #fff;
  }

  .album-item.new-album {
    margin-top: 12px;
    border-style: dashed;
  }

  .album-icon {
    font-size: 20px;
  }

  .album-name {
    flex: 1;
    font-weight: 600;
  }

  .album-count {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
  }

  /* Main Content */
  .main-content {
    min-width: 0;
  }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 36px;
    font-weight: 800;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .page-stats {
    display: flex;
    gap: 8px;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
  }

  .divider {
    color: rgba(255, 255, 255, 0.3);
  }

  .create-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 200px;
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.08);
  }

  .filter-select {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    cursor: pointer;
    min-width: 140px;
  }

  .filter-select:focus {
    outline: none;
    border-color: #667eea;
  }

  /* Cards Grid */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
  }

  .card-wrapper {
    position: relative;
  }

  .card-container {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
    transition: transform 0.3s ease;
  }

  .card-container:hover {
    transform: translateY(-8px);
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding: 0 8px;
  }

  .action-icon-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    filter: grayscale(1);
  }

  .action-icon-btn:hover,
  .action-icon-btn.active {
    filter: grayscale(0);
    transform: scale(1.2);
  }

  .card-likes {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 80px 20px;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 24px;
    margin: 0 0 8px 0;
    color: #fff;
  }

  /* Stats Sidebar */
  .stats-sidebar {
    position: sticky;
    top: 24px;
    height: fit-content;
  }

  .widget {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .widget-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 16px 0;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #667eea;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin: 0 12px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }

  .rarity-list,
  .team-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rarity-item,
  .team-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .rarity-label,
  .team-name {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .rarity-count,
  .team-count {
    font-weight: 600;
    color: #fff;
  }

  .team-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    margin: 0 12px;
    overflow: hidden;
  }

  .team-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  /* Modal */
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
    max-width: 1000px;
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
  }

  .modal-title {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .modal-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 24px 0;
  }

  .modal-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 32px;
  }

  .modal-stat {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    color: #fff;
  }

  .modal-stat .active {
    filter: grayscale(0);
  }

  .modal-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .modal-action-btn {
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .modal-action-btn.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: #667eea;
  }

  .modal-action-btn.danger {
    border-color: #ef4444;
    color: #ef4444;
  }

  /* Responsive */
  @media (max-width: 1400px) {
    .collections-page {
      grid-template-columns: 240px 1fr 300px;
      gap: 20px;
      padding: 20px;
    }
  }

  @media (max-width: 1200px) {
    .collections-page {
      grid-template-columns: 1fr;
    }

    .albums-sidebar,
    .stats-sidebar {
      display: none;
    }

    .modal-layout {
      grid-template-columns: 1fr;
    }

    .modal-card {
      order: 2;
    }

    .modal-info {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    .collections-page {
      padding: 12px;
    }

    .page-title {
      font-size: 28px;
    }

    .content-header {
      flex-direction: column;
      align-items: stretch;
    }

    .create-btn {
      width: 100%;
      text-align: center;
    }

    .filter-bar {
      flex-direction: column;
    }

    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .modal-actions {
      grid-template-columns: 1fr;
    }
  }
</style>
