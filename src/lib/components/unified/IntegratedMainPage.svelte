<script lang="ts">
  import { onMount } from 'svelte';
  import { currentUser, teamTheme } from '$lib/stores/unified';
  import type { UnifiedCard, UnifiedUser } from '$lib/types/unified';
  import type {
    IntegratedMainPageProps,
    CollectionDashboardConfig,
    CommunityFeedConfig,
    MainPageState
  } from '../../../specs/002-integrated-holographic-platform/contracts/IntegratedMainPage.interface';

  import CollectionDashboard from '$lib/components/CollectionDashboard.svelte';
  import ShowoffModal from './ShowoffModal.svelte';
  import TodayGameBanner from './TodayGameBanner.svelte';
  import KBOTeamsSection from './KBOTeamsSection.svelte';
  import VirtualCardGrid from './VirtualCardGrid.svelte';
  import UnifiedCommunityFeed from './UnifiedCommunityFeed.svelte';
  import CreatorProfileModal from './CreatorProfileModal.svelte';
  import CardDetailModal from './CardDetailModal.svelte';

  // Props
  export let user: UnifiedUser;
  export let initialCards: UnifiedCard[] = [];
  export let layout: 'standard' | 'compact' | 'kbo-focus' = 'standard';
  export let showKBOSection = true;
  export let showCommunityFeed = true;
  export let showTodayGame = true;
  export let specialEvent: { type: 'korean-series' | 'all-star' | null; title?: string; description?: string } | null = null;

  let className = '';
  export { className as class };

  // Collection Dashboard Configuration
  const dashboardConfig: CollectionDashboardConfig = {
    latestCardsCount: 3,
    showProgress: true,
    showStats: true,
    maxCollections: 5
  };

  // Community Feed Configuration
  const feedConfig: CommunityFeedConfig = {
    layout: 'masonry',
    columns: 3,
    postsPerPage: 20,
    filter: 'following',
    infiniteScroll: true
  };

  // Local state
  let mounted = false;
  let loadingMore = false;
  let scrollPosition = 0;
  let showCreatorProfile = false;
  let selectedCreatorId: string | undefined;
  let showCardDetail = false;
  let selectedCard: UnifiedCard | null = null;

  // Component state
  const state: MainPageState = {
    selectedTeam: null,
    feedFilter: 'following',
    unreadCollections: [],
    showoffModalOpen: false,
    scrollPosition: 0,
    loadingMore: false
  };

  // Update store when user prop changes
  $: if (user) {
    currentUser.set(user);
  }

  // Apply team theme when it changes
  $: if ($teamTheme) {
    applyTeamTheme($teamTheme.color);
  }

  // Responsive breakpoints
  let screenWidth: number;
  $: isMobile = screenWidth < 640;
  $: isTablet = screenWidth >= 640 && screenWidth < 1024;
  $: isDesktop = screenWidth >= 1024;

  $: feedColumns = isMobile ? 1 : isTablet ? 2 : 3;

  onMount(() => {
    mounted = true;
    screenWidth = window.innerWidth;

    const handleResize = () => {
      screenWidth = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function applyTeamTheme(color: string | undefined) {
    if (!color) return;
    document.documentElement.style.setProperty('--team-primary-color', color);
  }

  // Prepare data for CollectionDashboard
  $: userStats = {
    totalCards: user.collections.totalCards,
    completedCollections: user.collections.collectionProgress.filter(c => c.progress === 100).length,
    cardsByRarity: {
      common: 0,
      rare: user.collections.rareCards,
      epic: 0,
      legendary: 0,
      mythic: 0
    }
  };

  $: recentCards = initialCards
    .filter(card => card.photocard.acquiredAt)
    .sort((a, b) => {
      const dateA = a.photocard.acquiredAt?.getTime() || 0;
      const dateB = b.photocard.acquiredAt?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, dashboardConfig.latestCardsCount)
    .map(card => ({
      id: card.id,
      title: card.title,
      imageUrl: card.holographic.image,
      backImageUrl: card.holographic.backImage,
      rarity: card.photocard.rarity,
      acquiredAt: card.photocard.acquiredAt || new Date(),
      createdAt: card.createdAt,
      description: `${card.community.tags.join(', ')}`,
      stats: {
        views: card.photocard.stats.totalViews,
        likes: card.community.metadata.likes,
        downloads: card.community.metadata.downloads
      },
      holographicEffect: card.holographic.effect,
      holographicIntensity: card.holographic.intensity,
      isNew: false,
      isLocked: false
    }));

  $: collectionProgress = user.collections.collectionProgress
    .slice(0, dashboardConfig.maxCollections)
    .map(progress => ({
      id: progress.collectionId,
      name: `Collection ${progress.collectionId}`,
      description: '',
      theme: 'kbo' as const,
      totalCards: progress.totalCards,
      ownedCards: progress.ownedCards,
      completionPercentage: progress.progress,
      isCompleted: progress.progress === 100,
      thumbnailUrl: '',
      rarity: 'rare' as const,
      rewardBadge: '',
      rewardPoints: 0
    }));

  function handleCardClick(card: any) {
    console.log('Card clicked:', card);
  }

  function handleCollectionClick(collection: any) {
    console.log('Collection clicked:', collection);
  }

  function handleShowoff() {
    state.showoffModalOpen = true;
  }

  function handleShowoffClose() {
    state.showoffModalOpen = false;
  }

  function handleShowoffSubmit(event: CustomEvent) {
    console.log('Post submitted:', event.detail);
    state.showoffModalOpen = false;
  }

  function handleLoadMore() {
    if (loadingMore) return;
    loadingMore = true;
    // Emit loadmore event
    setTimeout(() => {
      loadingMore = false;
    }, 1000);
  }

  // Get selected card for showoff modal
  $: selectedCardForShowoff = recentCards.length > 0 ? initialCards[0] : null;
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="integrated-main-page {className} layout-{layout}" class:mounted data-testid="integrated-main-page">
  <!-- Hero Section -->
  <section id="hero" class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        안녕하세요, <span class="username">{user.username}</span>님!
      </h1>
      <p class="hero-subtitle">
        {#if user.fanProfile.favoriteTeam}
          {user.fanProfile.fanLevel.name} | {user.collections.totalCards}개 카드 보유
        {:else}
          포토카드 컬렉션을 시작해보세요
        {/if}
      </p>

      <!-- Special Event Banner (T067) -->
      {#if specialEvent && specialEvent.type}
        <div class="special-event-banner" data-testid="special-event-banner">
          {#if specialEvent.type === 'korean-series'}
            <div class="event-card korean-series">
              <div class="event-icon">🏆</div>
              <div class="event-content">
                <h3 class="event-title">{specialEvent.title || '한국시리즈 개막!'}</h3>
                <p class="event-description">
                  {specialEvent.description || 'KBO 리그의 정점을 가리는 한국시리즈가 시작됩니다'}
                </p>
              </div>
              <a href="/events/korean-series" class="event-cta">자세히 보기 →</a>
            </div>
          {:else if specialEvent.type === 'all-star'}
            <div class="event-card all-star">
              <div class="event-icon">⭐</div>
              <div class="event-content">
                <h3 class="event-title">{specialEvent.title || 'KBO 올스타전'}</h3>
                <p class="event-description">
                  {specialEvent.description || '팬들이 선택한 최고의 선수들이 한자리에 모입니다'}
                </p>
              </div>
              <a href="/events/all-star" class="event-cta">투표하기 →</a>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Today's Game Banner (T066) -->
      {#if showTodayGame && user.fanProfile.favoriteTeam}
        <div class="today-game-section">
          <TodayGameBanner />
        </div>
      {/if}
    </div>
  </section>

  <!-- Collection Dashboard Section -->
  <section id="collection-dashboard" class="section collection-section">
    <CollectionDashboard
      {userStats}
      {recentCards}
      {collectionProgress}
      {onCardClick}
      {onCollectionClick}
    />

    {#if dashboardConfig.showStats}
      <div class="showoff-action">
        <button
          class="showoff-btn"
          type="button"
          on:click={handleShowoff}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          자랑하기
        </button>
      </div>
    {/if}
  </section>

  <!-- KBO Teams Section -->
  {#if showKBOSection}
    <section id="kbo-teams" class="section kbo-section">
      <div class="section-header">
        <h2 class="section-title">응원 구단</h2>
      </div>
      <KBOTeamsSection />
    </section>
  {/if}

  <!-- Community Feed Section -->
  {#if showCommunityFeed}
    <section id="community-feed" class="section community-section" data-testid="community-feed">
      <div class="section-header">
        <h2 class="section-title">커뮤니티 피드</h2>
      </div>
      <UnifiedCommunityFeed
        filter="public"
        layout="grid"
        columns={feedColumns}
        sortBy="latest"
        postsPerPage={feedConfig.postsPerPage}
        infiniteScroll={feedConfig.infiniteScroll}
      />
    </section>
  {/if}

  <!-- Recommendations Section -->
  <section id="recommendations" class="section recommendations-section">
    <div class="section-header">
      <h2 class="section-title">추천 카드</h2>
    </div>
    <div class="recommendations-placeholder">
      <p>추천 카드 (구현 예정)</p>
    </div>
  </section>
</div>

<!-- Showoff Modal -->
<ShowoffModal
  show={state.showoffModalOpen}
  on:close={handleShowoffClose}
  on:submit={handleShowoffSubmit}
/>

<!-- Creator Profile Modal -->
<CreatorProfileModal
  isOpen={showCreatorProfile}
  creatorId={selectedCreatorId}
  on:close={() => {
    showCreatorProfile = false;
    selectedCreatorId = undefined;
  }}
/>

<!-- Card Detail Modal -->
<CardDetailModal
  isOpen={showCardDetail}
  card={selectedCard}
  on:close={() => {
    showCardDetail = false;
    selectedCard = null;
  }}
  on:template-saved={() => {
    console.log('Template saved successfully');
  }}
/>

<style>
  .integrated-main-page {
    width: 100%;
    max-width: 1920px;
    margin: 0 auto;
    padding: var(--apple-spacing-xl) var(--apple-spacing-lg);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .integrated-main-page.mounted {
    opacity: 1;
    transform: translateY(0);
  }

  /* Hero Section */
  .hero-section {
    margin-bottom: var(--apple-spacing-2xl);
    text-align: center;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: var(--apple-font-size-title1);
    font-weight: 700;
    color: var(--apple-text-primary);
    margin: 0 0 var(--apple-spacing-md);
    letter-spacing: -0.02em;
  }

  .username {
    color: var(--team-primary-color, var(--apple-accent-blue));
  }

  .hero-subtitle {
    font-size: var(--apple-font-size-title3);
    color: var(--apple-text-secondary);
    margin: 0 0 var(--apple-spacing-xl);
  }

  /* Special Event Banner */
  .special-event-banner {
    margin: var(--apple-spacing-xl) 0;
  }

  .event-card {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-lg);
    padding: var(--apple-spacing-xl);
    border-radius: var(--apple-radius-2xl);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all var(--apple-transition-smooth);
  }

  .event-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-xl);
  }

  .event-card.korean-series {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
    border-color: rgba(255, 215, 0, 0.3);
  }

  .event-card.all-star {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 179, 255, 0.1));
    border-color: rgba(102, 126, 234, 0.3);
  }

  .event-icon {
    font-size: 3rem;
    flex-shrink: 0;
  }

  .event-content {
    flex: 1;
  }

  .event-title {
    font-size: var(--apple-font-size-title2);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 var(--apple-spacing-sm);
  }

  .event-description {
    font-size: var(--apple-font-size-body);
    color: var(--apple-text-secondary);
    margin: 0;
  }

  .event-cta {
    flex-shrink: 0;
    padding: var(--apple-spacing-md) var(--apple-spacing-lg);
    background: var(--team-primary-color, var(--apple-accent-blue));
    color: white;
    border-radius: var(--apple-radius-full);
    text-decoration: none;
    font-weight: 600;
    transition: all var(--apple-transition-fast);
  }

  .event-cta:hover {
    transform: scale(1.05);
    box-shadow: var(--apple-shadow-lg);
  }

  /* Today's Game Section */
  .today-game-section {
    margin: var(--apple-spacing-xl) 0;
  }

  /* Sections */
  .section {
    margin-bottom: var(--apple-spacing-3xl);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--apple-spacing-xl);
  }

  .section-title {
    font-size: var(--apple-font-size-title2);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0;
  }

  /* Showoff Action */
  .showoff-action {
    margin-top: var(--apple-spacing-xl);
    text-align: center;
  }

  .showoff-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
    padding: var(--apple-spacing-md) var(--apple-spacing-xl);
    background: var(--team-primary-color, var(--apple-accent-blue));
    color: white;
    border: none;
    border-radius: var(--apple-radius-full);
    font-size: var(--apple-font-size-body);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--apple-transition-smooth);
  }

  .showoff-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-lg);
  }

  .showoff-btn svg {
    width: 20px;
    height: 20px;
  }

  /* Feed Filters */
  .feed-filters {
    display: flex;
    gap: var(--apple-spacing-sm);
  }

  .filter-btn {
    padding: var(--apple-spacing-sm) var(--apple-spacing-md);
    background: var(--apple-surface-secondary);
    color: var(--apple-text-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: var(--apple-radius-md);
    font-size: var(--apple-font-size-callout);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-transition-fast);
  }

  .filter-btn:hover {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
  }

  .filter-btn.active {
    background: var(--team-primary-color, var(--apple-accent-blue));
    color: white;
    border-color: transparent;
  }

  /* Feed Grid */
  .feed-grid {
    display: grid;
    gap: var(--apple-spacing-lg);
  }

  .feed-grid.columns-1 {
    grid-template-columns: 1fr;
  }

  .feed-grid.columns-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .feed-grid.columns-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Placeholders */
  .kbo-placeholder,
  .feed-placeholder,
  .recommendations-placeholder {
    padding: var(--apple-spacing-2xl);
    background: var(--apple-surface-secondary);
    border: 2px dashed var(--apple-surface-border);
    border-radius: var(--apple-radius-xl);
    text-align: center;
    color: var(--apple-text-secondary);
  }

  /* Loading Indicator */
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--apple-spacing-md);
    padding: var(--apple-spacing-xl);
    color: var(--apple-text-secondary);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--apple-surface-border);
    border-top-color: var(--team-primary-color, var(--apple-accent-blue));
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .load-more-trigger {
    text-align: center;
    margin-top: var(--apple-spacing-xl);
  }

  .load-more-btn {
    padding: var(--apple-spacing-md) var(--apple-spacing-xl);
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: var(--apple-radius-full);
    font-size: var(--apple-font-size-body);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-transition-smooth);
  }

  .load-more-btn:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
  }

  /* Layout Variants */
  .layout-compact .section {
    margin-bottom: var(--apple-spacing-xl);
  }

  .layout-kbo-focus .kbo-section {
    order: -1;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .integrated-main-page {
      padding: var(--apple-spacing-lg) var(--apple-spacing-md);
    }

    .feed-filters {
      flex-wrap: wrap;
    }

    .event-card {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 640px) {
    .integrated-main-page {
      padding: var(--apple-spacing-md);
    }

    .hero-title {
      font-size: var(--apple-font-size-title2);
    }

    .hero-subtitle {
      font-size: var(--apple-font-size-body);
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--apple-spacing-sm);
    }

    .event-icon {
      font-size: 2rem;
    }

    .event-title {
      font-size: var(--apple-font-size-title3);
    }

    .event-description {
      font-size: var(--apple-font-size-callout);
    }
  }
</style>
