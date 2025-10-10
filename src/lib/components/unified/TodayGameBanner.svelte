<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  // Props
  export let className: string = '';
  export let compact: boolean = false;
  export let showBroadcaster: boolean = true;

  // State
  let loading = true;
  let todayGame: any = null;
  let favoriteTeam: any = null;

  // Mock data for testing
  const mockTodayGame = {
    id: 'game-001',
    status: 'live',
    inning: '9회 초',
    broadcaster: 'KBSN',
    homeTeam: {
      name: '삼성 라이온즈',
      logo: '/static/images/kbo/samsung.webp',
      color: '#1E3A8A'
    },
    awayTeam: {
      name: 'LG 트윈스',
      logo: '/static/images/kbo/lg.webp',
      color: '#DC2626'
    },
    score: {
      home: 5,
      away: 3
    },
    stadium: '대구 삼성 라이온즈 파크',
    gameTime: new Date()
  };

  const mockFavoriteTeam = {
    name: '삼성 라이온즈',
    color: '#1E3A8A',
    logo: '/static/images/kbo/samsung.webp'
  };

  // Functions
  function getStatusBadge(status: string) {
    switch (status) {
      case 'live':
        return { text: 'LIVE', color: 'bg-red-500' };
      case 'scheduled':
        return { text: '예정', color: 'bg-blue-500' };
      case 'finished':
        return { text: '종료', color: 'bg-gray-500' };
      default:
        return { text: '알 수 없음', color: 'bg-gray-500' };
    }
  }

  function formatGameTime(gameTime: Date) {
    return gameTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Lifecycle
  onMount(() => {
    // Simulate loading
    setTimeout(() => {
      todayGame = mockTodayGame;
      favoriteTeam = mockFavoriteTeam;
      loading = false;
    }, 1000);
  });
</script>

<div
  class="today-game-banner {className}"
  class:compact
  transition:fly={{ y: -20, duration: 400 }}
  data-testid="today-game-banner"
>
  {#if loading}
    <div class="banner-container rounded-2xl overflow-hidden shadow-lg bg-gray-100 animate-pulse">
      <div class="p-4">
        <div class="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div class="h-8 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  {:else if todayGame}
    <div
      class="banner-container rounded-2xl overflow-hidden shadow-lg"
      style="background: linear-gradient(135deg, {favoriteTeam?.color}15 0%, {favoriteTeam?.color}05 100%); border: 2px solid {favoriteTeam?.color}30"
    >
      <!-- Status Badge -->
      <div class="banner-header flex items-center justify-between p-4 pb-2">
        <div class="flex items-center space-x-2">
          <span class="status-badge px-3 py-1 rounded-full text-xs font-bold text-white {getStatusBadge(todayGame.status).color} animate-pulse">
            {getStatusBadge(todayGame.status).text}
          </span>
          {#if todayGame.status === 'live' && todayGame.inning}
            <span class="text-sm font-medium text-gray-600">{todayGame.inning}</span>
          {/if}
        </div>

        {#if showBroadcaster && todayGame.broadcaster}
          <div class="flex items-center space-x-1 text-xs text-gray-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
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
              style="background: linear-gradient(135deg, {favoriteTeam?.color}, {favoriteTeam?.color}dd)"
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
  {:else if !loading && !todayGame && favoriteTeam}
    <!-- No Game Today -->
    <div
      class="no-game-banner p-4 rounded-2xl text-center"
      style="background: linear-gradient(135deg, {favoriteTeam?.color}10 0%, {favoriteTeam?.color}05 100%); border: 2px solid {favoriteTeam?.color}20"
      transition:fade
      data-testid="no-game-banner"
    >
      <div class="text-4xl mb-2">⚾</div>
      <h3 class="text-lg font-bold mb-1" style="color: {favoriteTeam?.color}">
        오늘은 경기가 없습니다
      </h3>
      <p class="text-sm text-gray-600">
        {favoriteTeam?.name}의 다음 경기를 기다려주세요
      </p>
    </div>
  {:else}
    <!-- No Favorite Team -->
    <div
      class="no-team-banner p-4 rounded-2xl text-center bg-gray-100"
      transition:fade
      data-testid="no-team-banner"
    >
      <div class="text-4xl mb-2">🏟️</div>
      <h3 class="text-lg font-bold mb-1 text-gray-700">
        좋아하는 팀을 설정해주세요
      </h3>
      <p class="text-sm text-gray-600">
        오늘의 경기 정보를 받아보세요
      </p>
    </div>
  {/if}
</div>

<style>
  .today-game-banner {
    @apply w-full;
  }

  .today-game-banner.compact {
    @apply text-sm;
  }

  .banner-container {
    @apply relative overflow-hidden;
  }

  .banner-header {
    @apply border-b border-gray-200;
  }

  .status-badge {
    @apply inline-flex items-center;
  }

  .team-info {
    @apply min-h-0;
  }

  .team-name {
    @apply truncate;
  }

  .team-score {
    @apply leading-none;
  }

  .vs-divider {
    @apply flex flex-col justify-center;
  }

  .stadium-info {
    @apply border-t border-gray-200 pt-2;
  }

  .action-button {
    @apply border-t border-gray-200 pt-2;
  }

  .action-button a,
  .action-button button {
    @apply transition-all duration-200;
  }

  .action-button a:hover,
  .action-button button:hover {
    @apply transform scale-105;
  }

  .no-game-banner,
  .no-team-banner {
    @apply transition-all duration-300;
  }

  .no-game-banner:hover,
  .no-team-banner:hover {
    @apply transform scale-105;
  }
</style>