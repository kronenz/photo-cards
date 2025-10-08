<script lang="ts">
  import { currentUser } from '$lib/stores/unified';
  import { getTeamById, type KBOTeam } from '$lib/data/kbo-teams';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // Game data interface
  interface GameInfo {
    id: string;
    homeTeam: KBOTeam;
    awayTeam: KBOTeam;
    gameTime: Date;
    stadium: string;
    status: 'scheduled' | 'live' | 'finished';
    score?: {
      home: number;
      away: number;
    };
    inning?: string;
    broadcaster?: string;
  }

  // Props
  export let compact: boolean = false;
  export let showBroadcaster: boolean = true;

  // State
  let todayGame: GameInfo | null = null;
  let favoriteTeam: KBOTeam | null = null;
  let isUserTeamPlaying: boolean = false;
  let loading: boolean = true;

  // Reactive statements
  $: if ($currentUser?.fanProfile.favoriteTeam) {
    favoriteTeam = getTeamById($currentUser.fanProfile.favoriteTeam) || null;
    loadTodayGame();
  }

  // Functions
  async function loadTodayGame() {
    loading = true;

    try {
      // In production, this would fetch from KBO API
      // For now, we'll use mock data
      const mockGame = await fetchTodayGame(favoriteTeam?.id);

      if (mockGame) {
        todayGame = mockGame;
        isUserTeamPlaying =
          mockGame.homeTeam.id === favoriteTeam?.id ||
          mockGame.awayTeam.id === favoriteTeam?.id;
      } else {
        todayGame = null;
        isUserTeamPlaying = false;
      }
    } catch (error) {
      console.error('Failed to load today\'s game:', error);
      todayGame = null;
    } finally {
      loading = false;
    }
  }

  // Mock API call - replace with actual KBO API integration
  async function fetchTodayGame(teamId?: string): Promise<GameInfo | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!teamId) return null;

    // Mock game data
    const team = getTeamById(teamId);
    if (!team) return null;

    // Simulate a game for the user's team
    const opponents = [
      'team-doosan-bears',
      'team-kia-tigers',
      'team-samsung-lions',
      'team-lotte-giants',
    ];
    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
    const opponentTeam = getTeamById(randomOpponent);

    if (!opponentTeam) return null;

    const now = new Date();
    const gameTime = new Date(now);
    gameTime.setHours(18, 30, 0, 0); // 6:30 PM game time

    // Determine game status
    let status: 'scheduled' | 'live' | 'finished' = 'scheduled';
    let score: { home: number; away: number } | undefined;
    let inning: string | undefined;

    const currentHour = now.getHours();
    if (currentHour >= 18 && currentHour < 21) {
      status = 'live';
      score = {
        home: Math.floor(Math.random() * 8),
        away: Math.floor(Math.random() * 8),
      };
      inning = `${Math.floor(Math.random() * 9) + 1}회`;
    } else if (currentHour >= 21) {
      status = 'finished';
      score = {
        home: Math.floor(Math.random() * 10),
        away: Math.floor(Math.random() * 10),
      };
    }

    return {
      id: `game-${now.toISOString().split('T')[0]}`,
      homeTeam: team,
      awayTeam: opponentTeam,
      gameTime,
      stadium: team.stadium,
      status,
      score,
      inning,
      broadcaster: 'SPOTV',
    };
  }

  function formatGameTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  function getStatusBadge(status: string): { text: string; color: string } {
    switch (status) {
      case 'live':
        return { text: 'LIVE', color: 'bg-red-500' };
      case 'finished':
        return { text: '경기종료', color: 'bg-gray-500' };
      default:
        return { text: '경기예정', color: 'bg-blue-500' };
    }
  }

  onMount(() => {
    if (favoriteTeam) {
      loadTodayGame();
    } else {
      loading = false;
    }
  });
</script>

{#if !loading && todayGame && isUserTeamPlaying}
  <div
    class="today-game-banner"
    class:compact
    transition:fly={{ y: -20, duration: 400 }}
    data-testid="today-game-banner"
  >
    <div
      class="banner-container rounded-2xl overflow-hidden shadow-lg"
      style="background: linear-gradient(135deg, {favoriteTeam?.color}15 0%, {favoriteTeam
        ?.color}05 100%); border: 2px solid {favoriteTeam?.color}30"
    >
      <!-- Status Badge -->
      {@const statusBadge = getStatusBadge(todayGame.status)}
      <div class="banner-header flex items-center justify-between p-4 pb-2">
        <div class="flex items-center space-x-2">
          <span
            class="status-badge px-3 py-1 rounded-full text-xs font-bold text-white {statusBadge.color} animate-pulse"
          >
            {statusBadge.text}
          </span>
          {#if todayGame.status === 'live' && todayGame.inning}
            <span class="text-sm font-medium text-gray-600">{todayGame.inning}</span>
          {/if}
        </div>

        {#if showBroadcaster && todayGame.broadcaster}
          <div class="flex items-center space-x-1 text-xs text-gray-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path
                d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
              />
            </svg>
            <span>{todayGame.broadcaster}</span>
          </div>
        {/if}
      </div>

      <!-- Game Info -->
      <div class="banner-body p-4 pt-2">
        <div class="game-matchup flex items-center justify-between">
          <!-- Home Team -->
          <div class="team-info flex-1 text-center">
            <img
              src={todayGame.homeTeam.logo}
              alt="{todayGame.homeTeam.name} 로고"
              class="w-16 h-16 mx-auto mb-2 object-contain"
              loading="lazy"
            />
            <p class="team-name font-bold text-sm" style="color: {todayGame.homeTeam.color}">
              {todayGame.homeTeam.name}
            </p>
            {#if todayGame.score}
              <p class="team-score text-3xl font-bold mt-2" style="color: {todayGame.homeTeam.color}">
                {todayGame.score.home}
              </p>
            {/if}
          </div>

          <!-- VS Divider -->
          <div class="vs-divider flex-shrink-0 mx-4 text-center">
            <div class="text-2xl font-bold text-gray-400">VS</div>
            {#if todayGame.status === 'scheduled'}
              <div class="text-xs text-gray-500 mt-1">{formatGameTime(todayGame.gameTime)}</div>
            {/if}
          </div>

          <!-- Away Team -->
          <div class="team-info flex-1 text-center">
            <img
              src={todayGame.awayTeam.logo}
              alt="{todayGame.awayTeam.name} 로고"
              class="w-16 h-16 mx-auto mb-2 object-contain"
              loading="lazy"
            />
            <p class="team-name font-bold text-sm" style="color: {todayGame.awayTeam.color}">
              {todayGame.awayTeam.name}
            </p>
            {#if todayGame.score}
              <p class="team-score text-3xl font-bold mt-2" style="color: {todayGame.awayTeam.color}">
                {todayGame.score.away}
              </p>
            {/if}
          </div>
        </div>

        <!-- Stadium Info -->
        {#if !compact}
          <div class="stadium-info mt-4 text-center">
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{todayGame.stadium}</span>
            </div>
          </div>
        {/if}

        <!-- Action Button -->
        {#if todayGame.status === 'live'}
          <div class="action-button mt-4">
            <a
              href="/game/{todayGame.id}"
              class="block w-full py-2 px-4 rounded-lg text-center font-semibold text-white transition-all hover:shadow-lg"
              style="background: linear-gradient(135deg, {favoriteTeam?.color}, {favoriteTeam
                ?.color}dd)"
            >
              실시간 중계 보기 →
            </a>
          </div>
        {:else if todayGame.status === 'scheduled'}
          <div class="action-button mt-4">
            <button
              class="w-full py-2 px-4 rounded-lg text-center font-semibold transition-all hover:shadow-lg"
              style="background: {favoriteTeam?.color}20; color: {favoriteTeam?.color}; border: 2px solid {favoriteTeam?.color}40"
            >
              알림 설정
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else if !loading && !todayGame && favoriteTeam}
  <!-- No Game Today -->
  <div
    class="no-game-banner p-4 rounded-2xl text-center"
    style="background: linear-gradient(135deg, {favoriteTeam?.color}10 0%, {favoriteTeam
      ?.color}05 100%); border: 2px solid {favoriteTeam?.color}20"
    transition:fade
    data-testid="no-game-banner"
  >
    <p class="text-sm text-gray-600">
      오늘은 {favoriteTeam.name}의 경기가 없습니다
    </p>
    <p class="text-xs text-gray-500 mt-1">다음 경기를 기대해주세요! ⚾</p>
  </div>
{:else if loading}
  <!-- Loading State -->
  <div class="loading-banner p-8 rounded-2xl bg-gray-100 animate-pulse" data-testid="loading-banner">
    <div class="flex items-center justify-center space-x-4">
      <div class="w-16 h-16 bg-gray-300 rounded-full"></div>
      <div class="text-2xl font-bold text-gray-400">VS</div>
      <div class="w-16 h-16 bg-gray-300 rounded-full"></div>
    </div>
  </div>
{/if}

<style>
  .today-game-banner {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .today-game-banner.compact {
    max-width: 400px;
  }

  .team-info {
    transition: transform 0.2s ease;
  }

  .team-info:hover {
    transform: translateY(-2px);
  }

  .status-badge {
    animation: pulse-badge 2s ease-in-out infinite;
  }

  @keyframes pulse-badge {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .team-score {
    animation: score-update 0.5s ease-out;
  }

  @keyframes score-update {
    0% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Responsive Design */
  @media (max-width: 480px) {
    .team-info img {
      width: 48px;
      height: 48px;
    }

    .team-name {
      font-size: 0.75rem;
    }

    .team-score {
      font-size: 1.5rem;
    }

    .vs-divider {
      font-size: 1.25rem;
      margin: 0 0.5rem;
    }
  }
</style>
