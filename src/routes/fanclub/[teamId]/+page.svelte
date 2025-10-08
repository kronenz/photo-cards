<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { currentUser } from '$lib/stores/unified';
  import { getTeamById, type KBOTeam } from '$lib/data/kbo-teams';
  import { getCurrentUserLevel } from '$lib/utils/fan-level';
  import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
  import type { UnifiedCard } from '$lib/types/unified';

  // Get team ID from URL parameter
  $: teamId = $page.params.teamId;
  $: team = getTeamById(teamId);

  // State
  let mounted = false;
  let teamCards: UnifiedCard[] = [];
  let fanRankings: Array<{ rank: number; username: string; points: number; avatar: string }> = [];
  let isJoinedFanclub = false;
  let loading = true;

  // Reactive statements
  $: if ($currentUser && team) {
    isJoinedFanclub = $currentUser.fanProfile.joinedFanclubs.includes(team.id);
  }

  $: fanLevelInfo = getCurrentUserLevel();

  // Functions
  async function loadTeamData() {
    if (!team) return;

    loading = true;

    try {
      // In production, fetch from API
      // For now, use mock data
      teamCards = await fetchTeamCards(team.id);
      fanRankings = await fetchFanRankings(team.id);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      loading = false;
    }
  }

  async function fetchTeamCards(teamId: string): Promise<UnifiedCard[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock team cards
    return Array.from({ length: 6 }, (_, i) => ({
      id: `card-${teamId}-${i}`,
      title: `${team?.name} Card ${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      holographic: {
        image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=600&fit=crop`,
        backImage: `https://images.unsplash.com/photo-${1600000000000 + i}?w=400&h=600&fit=crop`,
        effect: 'soft-light' as const,
        intensity: 80,
        isFlipped: false,
        animationDuration: 600,
      },
      photocard: {
        rarity: (['common', 'rare', 'epic', 'legendary'] as const)[i % 4],
        stats: {
          totalViews: Math.floor(Math.random() * 1000),
          uniqueCollectors: Math.floor(Math.random() * 100),
          completionRate: Math.random() * 100,
        },
        collections: [`collection-${teamId}`],
      },
      community: {
        creator: `user-${i}`,
        isPublic: true,
        tags: [team?.name || '', 'KBO', '2024'],
        metadata: {
          likes: Math.floor(Math.random() * 500),
          downloads: Math.floor(Math.random() * 100),
          rating: 4 + Math.random(),
          ratingCount: Math.floor(Math.random() * 50),
        },
      },
    }));
  }

  async function fetchFanRankings(teamId: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock fan rankings
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      username: `팬${i + 1}`,
      points: 10000 - i * 1000,
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    }));
  }

  async function handleJoinFanclub() {
    if (!$currentUser || !team) return;

    currentUser.update((user) => {
      if (!user) return user;

      const alreadyJoined = user.fanProfile.joinedFanclubs.includes(team.id);

      return {
        ...user,
        fanProfile: {
          ...user.fanProfile,
          joinedFanclubs: alreadyJoined
            ? user.fanProfile.joinedFanclubs.filter((id) => id !== team.id)
            : [...user.fanProfile.joinedFanclubs, team.id],
        },
      };
    });
  }

  onMount(() => {
    mounted = true;
    if (team) {
      loadTeamData();

      // Apply team theme
      document.documentElement.style.setProperty('--team-primary-color', team.color);
      document.documentElement.style.setProperty(
        '--team-secondary-color',
        team.secondaryColor || team.color
      );
    }

    return () => {
      // Cleanup theme
      document.documentElement.style.removeProperty('--team-primary-color');
      document.documentElement.style.removeProperty('--team-secondary-color');
    };
  });
</script>

<svelte:head>
  <title>{team?.name} 팬클럽 | KBO 홀로그래픽 카드</title>
  <meta
    name="description"
    content="{team?.name} 팬클럽 - 팀 카드, 팬 랭킹, 커뮤니티"
  />
</svelte:head>

<div class="fanclub-page" class:mounted data-testid="fanclub-page-{teamId}">
  {#if team}
    <!-- Hero Section with Team Branding -->
    <section class="fanclub-hero" style="background: linear-gradient(135deg, {team.color}20, {team.color}05)">
      <div class="hero-content">
        <!-- Team Logo -->
        <div class="team-logo-section">
          <img src={team.logo} alt="{team.name} 로고" class="team-logo" />
        </div>

        <!-- Team Info -->
        <div class="team-info">
          <h1 class="team-name" style="color: {team.color}">{team.name}</h1>
          <p class="team-subtitle">{team.nameEn} | {team.city}</p>
          <div class="team-stats">
            <div class="stat-item">
              <span class="stat-value">{team.championships}</span>
              <span class="stat-label">우승</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{team.fanCount.toLocaleString()}</span>
              <span class="stat-label">팬</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{team.founded}</span>
              <span class="stat-label">창단</span>
            </div>
          </div>
        </div>

        <!-- Join Button -->
        <div class="join-section">
          {#if isJoinedFanclub}
            <button
              class="join-btn joined"
              style="background: {team.color}; border-color: {team.color}"
              on:click={handleJoinFanclub}
            >
              ✓ 가입완료
            </button>
          {:else}
            <button
              class="join-btn"
              style="border-color: {team.color}; color: {team.color}"
              on:click={handleJoinFanclub}
            >
              팬클럽 가입
            </button>
          {/if}
        </div>
      </div>
    </section>

    <!-- Fan Rankings Section -->
    <section class="section rankings-section">
      <div class="section-header">
        <h2 class="section-title">팬 랭킹</h2>
        <p class="section-subtitle">이번 시즌 최고의 팬들</p>
      </div>

      <div class="rankings-grid">
        {#if loading}
          {#each Array(3) as _, i}
            <div class="ranking-card skeleton">
              <div class="rank-badge skeleton-element"></div>
              <div class="fan-info skeleton-element"></div>
            </div>
          {/each}
        {:else}
          {#each fanRankings.slice(0, 10) as fan, i}
            <div
              class="ranking-card"
              class:top-rank={i < 3}
              style="border-color: {i < 3 ? team.color + '40' : 'transparent'}"
            >
              <div
                class="rank-badge"
                class:gold={i === 0}
                class:silver={i === 1}
                class:bronze={i === 2}
                style="{i < 3 ? '' : `color: ${team.color}`}"
              >
                {#if i === 0}
                  🥇
                {:else if i === 1}
                  🥈
                {:else if i === 2}
                  🥉
                {:else}
                  {fan.rank}
                {/if}
              </div>

              <div class="fan-info">
                <img src={fan.avatar} alt={fan.username} class="fan-avatar" />
                <div class="fan-details">
                  <p class="fan-username">{fan.username}</p>
                  <p class="fan-points" style="color: {team.color}">
                    {fan.points.toLocaleString()} pts
                  </p>
                </div>
              </div>

              {#if $currentUser && fan.username === $currentUser.username}
                <span class="you-badge">You</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </section>

    <!-- Team Cards Section -->
    <section class="section cards-section">
      <div class="section-header">
        <h2 class="section-title">팀 카드 컬렉션</h2>
        <p class="section-subtitle">{team.name} 전용 카드</p>
      </div>

      <div class="cards-grid">
        {#if loading}
          {#each Array(6) as _, i}
            <div class="card-placeholder skeleton">
              <div class="skeleton-element" style="height: 400px"></div>
            </div>
          {/each}
        {:else}
          {#each teamCards as card}
            <div class="card-wrapper">
              <UnifiedHolographicCard {card} context="community" size="medium" />
            </div>
          {/each}
        {/if}
      </div>
    </section>

    <!-- Stadium Info Section -->
    <section class="section stadium-section">
      <div class="section-header">
        <h2 class="section-title">홈구장</h2>
      </div>

      <div class="stadium-card" style="border-color: {team.color}30">
        <div class="stadium-icon" style="color: {team.color}">
          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="stadium-info">
          <h3 class="stadium-name">{team.stadium}</h3>
          <p class="stadium-location">{team.city}</p>
        </div>
      </div>
    </section>
  {:else}
    <!-- Team Not Found -->
    <div class="error-state">
      <h1>팀을 찾을 수 없습니다</h1>
      <p>요청하신 팀을 찾을 수 없습니다.</p>
      <a href="/" class="back-btn">홈으로 돌아가기</a>
    </div>
  {/if}
</div>

<style>
  .fanclub-page {
    min-height: 100vh;
    padding: var(--apple-spacing-xl) var(--apple-spacing-lg);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .fanclub-page.mounted {
    opacity: 1;
    transform: translateY(0);
  }

  /* Hero Section */
  .fanclub-hero {
    padding: var(--apple-spacing-3xl) var(--apple-spacing-xl);
    border-radius: var(--apple-radius-2xl);
    margin-bottom: var(--apple-spacing-3xl);
  }

  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--apple-spacing-xl);
  }

  .team-logo-section {
    width: 150px;
    height: 150px;
    background: white;
    border-radius: var(--apple-radius-2xl);
    padding: var(--apple-spacing-lg);
    box-shadow: var(--apple-shadow-lg);
  }

  .team-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .team-info {
    flex: 1;
  }

  .team-name {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 var(--apple-spacing-sm);
  }

  .team-subtitle {
    font-size: var(--apple-font-size-title3);
    color: var(--apple-text-secondary);
    margin: 0 0 var(--apple-spacing-lg);
  }

  .team-stats {
    display: flex;
    gap: var(--apple-spacing-2xl);
    justify-content: center;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--apple-text-primary);
  }

  .stat-label {
    font-size: var(--apple-font-size-callout);
    color: var(--apple-text-secondary);
  }

  .join-section {
    margin-top: var(--apple-spacing-lg);
  }

  .join-btn {
    padding: var(--apple-spacing-md) var(--apple-spacing-2xl);
    border-radius: var(--apple-radius-full);
    font-size: var(--apple-font-size-body);
    font-weight: 600;
    border: 2px solid;
    background: transparent;
    cursor: pointer;
    transition: all var(--apple-transition-smooth);
  }

  .join-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-lg);
  }

  .join-btn.joined {
    color: white;
    border-color: transparent;
  }

  /* Section Styles */
  .section {
    max-width: 1200px;
    margin: 0 auto var(--apple-spacing-3xl);
  }

  .section-header {
    margin-bottom: var(--apple-spacing-xl);
  }

  .section-title {
    font-size: var(--apple-font-size-title2);
    font-weight: 600;
    margin: 0 0 var(--apple-spacing-sm);
  }

  .section-subtitle {
    color: var(--apple-text-secondary);
    margin: 0;
  }

  /* Rankings Grid */
  .rankings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--apple-spacing-lg);
  }

  .ranking-card {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
    padding: var(--apple-spacing-lg);
    background: var(--apple-surface-primary);
    border: 2px solid transparent;
    border-radius: var(--apple-radius-xl);
    transition: all var(--apple-transition-smooth);
  }

  .ranking-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }

  .ranking-card.top-rank {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent);
  }

  .rank-badge {
    font-size: 1.5rem;
    font-weight: 700;
    min-width: 40px;
    text-align: center;
  }

  .rank-badge.gold {
    font-size: 2rem;
  }

  .fan-info {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
    flex: 1;
  }

  .fan-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  .fan-details {
    flex: 1;
  }

  .fan-username {
    font-weight: 600;
    margin: 0 0 4px;
  }

  .fan-points {
    font-size: var(--apple-font-size-callout);
    margin: 0;
  }

  .you-badge {
    padding: 4px 12px;
    background: var(--team-primary-color, var(--apple-accent-blue));
    color: white;
    border-radius: var(--apple-radius-full);
    font-size: var(--apple-font-size-caption2);
    font-weight: 600;
  }

  /* Cards Grid */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--apple-spacing-xl);
  }

  .card-wrapper {
    display: flex;
    justify-content: center;
  }

  /* Stadium Section */
  .stadium-card {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-lg);
    padding: var(--apple-spacing-xl);
    background: var(--apple-surface-primary);
    border: 2px solid;
    border-radius: var(--apple-radius-xl);
  }

  .stadium-icon {
    font-size: 3rem;
  }

  .stadium-name {
    font-size: var(--apple-font-size-title3);
    font-weight: 600;
    margin: 0 0 var(--apple-spacing-sm);
  }

  .stadium-location {
    color: var(--apple-text-secondary);
    margin: 0;
  }

  /* Skeleton Loading */
  .skeleton {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .skeleton-element {
    background: var(--apple-surface-tertiary);
    border-radius: var(--apple-radius-md);
  }

  /* Error State */
  .error-state {
    text-align: center;
    padding: var(--apple-spacing-3xl);
  }

  .error-state h1 {
    font-size: var(--apple-font-size-title1);
    margin: 0 0 var(--apple-spacing-md);
  }

  .error-state p {
    color: var(--apple-text-secondary);
    margin: 0 0 var(--apple-spacing-xl);
  }

  .back-btn {
    display: inline-block;
    padding: var(--apple-spacing-md) var(--apple-spacing-xl);
    background: var(--apple-accent-blue);
    color: white;
    text-decoration: none;
    border-radius: var(--apple-radius-full);
    font-weight: 600;
    transition: all var(--apple-transition-smooth);
  }

  .back-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-lg);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .fanclub-page {
      padding: var(--apple-spacing-lg) var(--apple-spacing-md);
    }

    .team-name {
      font-size: 2rem;
    }

    .team-stats {
      gap: var(--apple-spacing-lg);
    }

    .rankings-grid {
      grid-template-columns: 1fr;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .stadium-card {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
