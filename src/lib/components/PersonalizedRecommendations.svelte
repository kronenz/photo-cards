<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import HolographicCard from '$lib/holographic/HolographicCard.svelte';

  // Types
  interface RecommendedCard {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    team: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    holographicType: 'basic' | 'cosmic' | 'rainbow' | 'aurora';
    reason: string; // Why recommended
    score: number; // 0-100 relevance score
    category: 'complete-collection' | 'similar-cards' | 'trending' | 'new-release' | 'team-based';
  }

  interface UserActivity {
    lastVisit?: Date;
    favoriteTeams: string[];
    collectedRarities: Record<string, number>;
    viewedCards: string[];
    likedCards: string[];
    completedSets: string[];
  }

  // Props
  export let userActivity: UserActivity = {
    favoriteTeams: ['lg', 'kia'],
    collectedRarities: { common: 45, rare: 12, epic: 5, legendary: 2 },
    viewedCards: [],
    likedCards: [],
    completedSets: []
  };
  export let showReturningUser: boolean = false;
  export let compact: boolean = false;

  // State
  let recommendations: RecommendedCard[] = [];
  let loading: boolean = true;
  let selectedCategory: string = 'all';

  // Mock recommendation engine
  function generateRecommendations(): RecommendedCard[] {
    const teams = ['lg', 'doosan', 'kt', 'samsung', 'nc', 'kia', 'lotte', 'ssg', 'hanwha', 'kiwoom'];
    const types: Array<'basic' | 'cosmic' | 'rainbow' | 'aurora'> = ['basic', 'cosmic', 'rainbow', 'aurora'];
    const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];

    const recs: RecommendedCard[] = [];

    // 1. Complete Your Collection (based on missing cards)
    if (userActivity.collectedRarities.legendary < 5) {
      recs.push({
        id: 'rec-legendary-1',
        image: 'https://assets.codepen.io/13471/charizard-gx.webp',
        title: '오지환',
        subtitle: 'LG 트윈스 내야수',
        team: 'lg',
        rarity: 'legendary',
        holographicType: 'cosmic',
        reason: '컬렉션 완성까지 레전더리 카드 3장 필요',
        score: 95,
        category: 'complete-collection'
      });
    }

    // 2. Team-based recommendations
    userActivity.favoriteTeams.forEach((team, idx) => {
      recs.push({
        id: `rec-team-${idx}`,
        image: `https://picsum.photos/400/560?random=${idx + 10}`,
        title: `${team.toUpperCase()} 스페셜 카드`,
        subtitle: '2024 시즌 하이라이트',
        team,
        rarity: idx % 2 === 0 ? 'epic' : 'rare',
        holographicType: types[idx % types.length],
        reason: `${team.toUpperCase()} 팬을 위한 추천`,
        score: 90 - idx * 5,
        category: 'team-based'
      });
    });

    // 3. Trending cards
    for (let i = 0; i < 3; i++) {
      recs.push({
        id: `rec-trending-${i}`,
        image: `https://picsum.photos/400/560?random=${i + 20}`,
        title: `트렌딩 카드 #${i + 1}`,
        subtitle: '지금 인기 상승중',
        team: teams[i % teams.length],
        rarity: rarities[i % rarities.length],
        holographicType: types[i % types.length],
        reason: '최근 7일간 조회수 300% 증가',
        score: 85 - i * 5,
        category: 'trending'
      });
    }

    // 4. New releases
    for (let i = 0; i < 2; i++) {
      recs.push({
        id: `rec-new-${i}`,
        image: `https://picsum.photos/400/560?random=${i + 30}`,
        title: `신규 카드 #${i + 1}`,
        subtitle: '방금 출시됨',
        team: teams[i % teams.length],
        rarity: i === 0 ? 'legendary' : 'epic',
        holographicType: 'aurora',
        reason: '24시간 이내 출시',
        score: 80,
        category: 'new-release'
      });
    }

    // 5. Similar to liked cards
    if (userActivity.likedCards.length > 0) {
      recs.push({
        id: 'rec-similar-1',
        image: 'https://assets.codepen.io/13471/mewtwo-gx.webp',
        title: '비슷한 카드 추천',
        subtitle: '좋아요 누른 카드 기반',
        team: 'samsung',
        rarity: 'epic',
        holographicType: 'rainbow',
        reason: '김도영 카드를 좋아하신 분께 추천',
        score: 88,
        category: 'similar-cards'
      });
    }

    // Sort by score
    return recs.sort((a, b) => b.score - a.score);
  }

  // Filter recommendations
  $: filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory);

  // Get returning user summary
  function getReturningUserSummary() {
    if (!showReturningUser || !userActivity.lastVisit) return null;

    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(userActivity.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      daysSinceLastVisit,
      newCards: 5, // Mock data - in real app, fetch from API
      missedEvents: 2,
      newAchievements: 1
    };
  }

  $: returningUserSummary = getReturningUserSummary();

  // Initialize
  onMount(() => {
    setTimeout(() => {
      recommendations = generateRecommendations();
      loading = false;
    }, 500);
  });
</script>

<div class="personalized-recommendations">
  <!-- Returning User Welcome -->
  {#if returningUserSummary}
    <div class="returning-user-banner" in:fly={{ y: -20, duration: 600 }}>
      <div class="banner-content">
        <h3 class="banner-title">
          🎉 다시 오신 것을 환영합니다!
        </h3>
        <p class="banner-subtitle">
          {returningUserSummary.daysSinceLastVisit}일 동안 놓치신 소식이 있어요
        </p>
        <div class="banner-stats">
          <div class="stat">
            <span class="stat-number">{returningUserSummary.newCards}</span>
            <span class="stat-label">신규 카드</span>
          </div>
          <div class="stat">
            <span class="stat-number">{returningUserSummary.missedEvents}</span>
            <span class="stat-label">놓친 이벤트</span>
          </div>
          <div class="stat">
            <span class="stat-number">{returningUserSummary.newAchievements}</span>
            <span class="stat-label">새 업적</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Header -->
  <div class="recommendations-header">
    <div class="header-text">
      <h2 class="section-title">
        <span class="title-icon">✨</span>
        당신을 위한 추천
      </h2>
      <p class="section-subtitle">
        취향과 컬렉션 진행도를 분석한 개인화 추천
      </p>
    </div>
  </div>

  <!-- Category Filters -->
  <div class="category-filters">
    <button
      class="category-btn"
      class:active={selectedCategory === 'all'}
      on:click={() => selectedCategory = 'all'}
    >
      🎯 전체 추천
    </button>
    <button
      class="category-btn"
      class:active={selectedCategory === 'complete-collection'}
      on:click={() => selectedCategory = 'complete-collection'}
    >
      📦 컬렉션 완성
    </button>
    <button
      class="category-btn"
      class:active={selectedCategory === 'team-based'}
      on:click={() => selectedCategory = 'team-based'}
    >
      ⚾ 내 팀 기반
    </button>
    <button
      class="category-btn"
      class:active={selectedCategory === 'trending'}
      on:click={() => selectedCategory = 'trending'}
    >
      🔥 트렌딩
    </button>
    <button
      class="category-btn"
      class:active={selectedCategory === 'new-release'}
      on:click={() => selectedCategory = 'new-release'}
    >
      🆕 신규 출시
    </button>
  </div>

  <!-- Recommendations Grid -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>AI가 당신의 취향을 분석중...</p>
    </div>
  {:else if filteredRecommendations.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🎴</div>
      <p>추천할 카드가 없습니다</p>
    </div>
  {:else}
    <div class="recommendations-grid" class:compact>
      {#each filteredRecommendations as card, i (card.id)}
        <div
          class="recommendation-card"
          in:scale={{ duration: 400, delay: i * 50, start: 0.9 }}
        >
          <!-- Recommendation Badge -->
          <div class="recommendation-badge">
            <div class="badge-score">{card.score}% 매치</div>
            {#if card.category === 'complete-collection'}
              <div class="badge-category complete">컬렉션 완성</div>
            {:else if card.category === 'trending'}
              <div class="badge-category trending">트렌딩</div>
            {:else if card.category === 'new-release'}
              <div class="badge-category new">NEW</div>
            {:else if card.category === 'team-based'}
              <div class="badge-category team">내 팀</div>
            {:else}
              <div class="badge-category similar">유사</div>
            {/if}
          </div>

          <!-- Card Preview -->
          <div class="card-preview">
            <HolographicCard
              type={card.holographicType}
              image={card.image}
              title={card.title}
              subtitle={card.subtitle}
              rarity={card.rarity}
              team={card.team}
            />
          </div>

          <!-- Card Info -->
          <div class="card-info">
            <h4 class="card-title">{card.title}</h4>
            <p class="card-subtitle">{card.subtitle}</p>
            <div class="recommendation-reason">
              <span class="reason-icon">💡</span>
              <span class="reason-text">{card.reason}</span>
            </div>

            <!-- Action Buttons -->
            <div class="card-actions">
              <button class="action-btn primary">
                ⭐ 획득하기
              </button>
              <button class="action-btn secondary">
                🔍 상세보기
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .personalized-recommendations {
    width: 100%;
  }

  /* Returning User Banner */
  .returning-user-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    color: white;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }

  .banner-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .banner-subtitle {
    font-size: 16px;
    margin: 0 0 20px 0;
    opacity: 0.95;
  }

  .banner-stats {
    display: flex;
    gap: 24px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-number {
    font-size: 32px;
    font-weight: 700;
  }

  .stat-label {
    font-size: 13px;
    opacity: 0.9;
  }

  /* Header */
  .recommendations-header {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-icon {
    font-size: 28px;
  }

  .section-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  /* Category Filters */
  .category-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .category-btn {
    padding: 10px 20px;
    border: 2px solid #e5e7eb;
    border-radius: 20px;
    background: white;
    color: #4b5563;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .category-btn:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-1px);
  }

  .category-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  /* Loading & Empty States */
  .loading-state,
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  /* Recommendations Grid */
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .recommendations-grid.compact {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .recommendation-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 16px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .recommendation-card:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  /* Recommendation Badge */
  .recommendation-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
  }

  .badge-score {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    backdrop-filter: blur(10px);
  }

  .badge-category {
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .badge-category.complete {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  .badge-category.trending {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .badge-category.new {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }

  .badge-category.team {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  .badge-category.similar {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
  }

  /* Card Preview */
  .card-preview {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
  }

  /* Card Info */
  .card-info {
    text-align: center;
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #1f2937;
  }

  .card-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
  }

  .recommendation-reason {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    background: #f3f4f6;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .reason-icon {
    font-size: 16px;
  }

  .reason-text {
    font-size: 13px;
    color: #4b5563;
    font-weight: 500;
  }

  /* Action Buttons */
  .card-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .action-btn.secondary {
    background: white;
    border: 2px solid #e5e7eb;
    color: #4b5563;
  }

  .action-btn.secondary:hover {
    border-color: #667eea;
    color: #667eea;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .recommendations-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }

    .banner-stats {
      flex-direction: column;
      gap: 16px;
    }

    .category-filters {
      overflow-x: auto;
      flex-wrap: nowrap;
      -webkit-overflow-scrolling: touch;
    }

    .category-btn {
      white-space: nowrap;
    }
  }
</style>
