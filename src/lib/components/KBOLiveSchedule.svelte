<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { communityService } from '$lib/services/communityService';
  import { getTeamById } from '$lib/data/baseballTeams';

  // Props
  export let selectedTeamId: string | undefined = undefined;
  export let compact: boolean = false;

  // State
  let games: any[] = [];
  let liveGames: any[] = [];
  let teamStats: any = null;
  let loading = false;
  let updateInterval: any;

  // Reactive
  $: filteredGames = selectedTeamId 
    ? games.filter(game => game.homeTeam === selectedTeamId || game.awayTeam === selectedTeamId)
    : games;

  // Functions
  async function loadSchedule() {
    if (loading) return;
    
    loading = true;
    try {
      games = await communityService.getKBOSchedule();
      liveGames = games.filter(game => game.isLive);
      
      if (selectedTeamId) {
        teamStats = await communityService.getTeamLiveStats(selectedTeamId);
      }
    } catch (error) {
      console.error('Failed to load KBO schedule:', error);
    } finally {
      loading = false;
    }
  }

  function formatGameTime(time: string): string {
    return time.substring(0, 5); // "18:30:00" -> "18:30"
  }

  function getGameStatus(game: any): { text: string; color: string } {
    switch (game.status) {
      case 'live':
        return { text: 'LIVE', color: '#ef4444' };
      case 'finished':
        return { text: '경기종료', color: '#6b7280' };
      case 'postponed':
        return { text: '연기', color: '#f59e0b' };
      default:
        return { text: formatGameTime(game.time), color: '#3b82f6' };
    }
  }

  onMount(() => {
    loadSchedule();
    
    // 30초마다 실시간 업데이트
    updateInterval = setInterval(loadSchedule, 30000);
  });

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<div class="kbo-live-schedule" class:compact>
  {#if !compact}
    <div class="schedule-header">
      <h3>
        <span class="live-indicator">🔴</span>
        KBO 실시간 일정
      </h3>
      {#if liveGames.length > 0}
        <span class="live-count">{liveGames.length}경기 진행중</span>
      {/if}
    </div>
  {/if}

  <!-- 팀 통계 (선택된 팀이 있을 때) -->
  {#if teamStats && !compact}
    <div class="team-stats">
      <div class="stats-header">
        <div class="team-info">
          {#if selectedTeamId}
            {#if getTeamById(selectedTeamId)}
              {@const team = getTeamById(selectedTeamId)}
              {#if team}
                <div class="team-logo" style="background-color: {team.colors.primary}">
                  {team.name.charAt(0)}
                </div>
                <div class="team-details">
                  <h4>{team.name}</h4>
                  <p>{teamStats.currentRank}위 · {teamStats.winRate.toFixed(3)}</p>
                </div>
              {/if}
            {/if}
          {/if}
        </div>
        
        <div class="record">
          <span class="wins">{teamStats.wins}승</span>
          <span class="losses">{teamStats.losses}패</span>
          {#if teamStats.draws > 0}
            <span class="draws">{teamStats.draws}무</span>
          {/if}
        </div>
      </div>

      <!-- 최근 경기 결과 -->
      <div class="recent-form">
        <span class="form-label">최근 5경기</span>
        <div class="form-results">
          {#each teamStats.recentForm as result}
            <span class="form-result" class:win={result === 'W'} class:loss={result === 'L'}>
              {result}
            </span>
          {/each}
        </div>
      </div>

      <!-- 다음 경기 -->
      {#if teamStats.nextGame}
        <div class="next-game">
          <span class="next-label">다음 경기</span>
          <div class="next-details">
            {#if getTeamById(teamStats.nextGame.opponent)}
              {@const opponent = getTeamById(teamStats.nextGame.opponent)}
              <span class="opponent">
                vs {opponent?.name || '상대팀'}
                {teamStats.nextGame.isHome ? '(홈)' : '(원정)'}
              </span>
            {:else}
              <span class="opponent">
                vs 상대팀
                {teamStats.nextGame.isHome ? '(홈)' : '(원정)'}
              </span>
            {/if}
            <span class="next-date">
              {teamStats.nextGame.date.toLocaleDateString('ko-KR', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
              })}
            </span>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- 경기 일정 -->
  <div class="games-list">
    {#if loading}
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>일정 로딩 중...</span>
      </div>
    {:else if filteredGames.length === 0}
      <div class="no-games">
        <span class="no-games-icon">⚾</span>
        <p>오늘 예정된 경기가 없습니다</p>
      </div>
    {:else}
      {#each filteredGames as game (game.id)}
        {#if getTeamById(game.homeTeam) && getTeamById(game.awayTeam)}
          {@const homeTeam = getTeamById(game.homeTeam)}
          {@const awayTeam = getTeamById(game.awayTeam)}
          {@const status = getGameStatus(game)}
        
        <div class="game-card" class:live={game.isLive}>
          <div class="game-teams">
            <div class="team away-team">
              {#if awayTeam}
                <div class="team-logo small" style="background-color: {awayTeam.colors.primary}">
                  {awayTeam.name.charAt(0)}
                </div>
                <span class="team-name">{compact ? awayTeam.name.split(' ')[1] || awayTeam.name : awayTeam.name}</span>
              {/if}
              {#if game.score}
                <span class="score">{game.score.away}</span>
              {/if}
            </div>

            <div class="vs-divider">
              <span class="vs-text">VS</span>
            </div>

            <div class="team home-team">
              {#if game.score}
                <span class="score">{game.score.home}</span>
              {/if}
              {#if homeTeam}
                <span class="team-name">{compact ? homeTeam.name.split(' ')[1] || homeTeam.name : homeTeam.name}</span>
                <div class="team-logo small" style="background-color: {homeTeam.colors.primary}">
                  {homeTeam.name.charAt(0)}
                </div>
              {/if}
            </div>
          </div>

          <div class="game-info">
            <div class="game-status" style="color: {status.color}">
              {status.text}
            </div>
            {#if !compact}
              <div class="stadium">{game.stadium}</div>
            {/if}
          </div>

          {#if game.isLive}
            <div class="live-indicator-badge">
              <span class="live-dot"></span>
              LIVE
            </div>
          {/if}
        </div>
        {/if}
      {/each}
    {/if}
  </div>

  {#if !compact && games.length > filteredGames.length}
    <div class="view-all">
      <button class="view-all-btn" on:click={() => selectedTeamId = undefined}>
        전체 일정 보기 ({games.length}경기)
      </button>
    </div>
  {/if}
</div>

<style>
  .kbo-live-schedule {
    background: white;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .kbo-live-schedule.compact {
    padding: 16px;
    margin-bottom: 16px;
  }

  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color, #e1e5e9);
  }

  .schedule-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .live-indicator {
    animation: pulse 2s infinite;
  }

  .live-count {
    font-size: 14px;
    color: #ef4444;
    font-weight: 600;
    background: rgba(239, 68, 68, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
  }

  .team-stats {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    color: white;
  }

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .team-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .team-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 16px;
  }

  .team-logo.small {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .team-details h4 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
  }

  .team-details p {
    font-size: 14px;
    margin: 2px 0 0 0;
    opacity: 0.9;
  }

  .record {
    display: flex;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  .wins {
    color: #10b981;
  }

  .losses {
    color: #ef4444;
  }

  .draws {
    color: #f59e0b;
  }

  .recent-form {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .form-label {
    font-size: 14px;
    opacity: 0.9;
  }

  .form-results {
    display: flex;
    gap: 4px;
  }

  .form-result {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
  }

  .form-result.win {
    background: #10b981;
  }

  .form-result.loss {
    background: #ef4444;
  }

  .next-game {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .next-label {
    font-size: 14px;
    opacity: 0.9;
  }

  .next-details {
    text-align: right;
  }

  .opponent {
    display: block;
    font-size: 14px;
    font-weight: 600;
  }

  .next-date {
    font-size: 12px;
    opacity: 0.8;
  }

  .games-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    color: var(--text-secondary, #6b7280);
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color, #e1e5e9);
    border-top: 2px solid var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .no-games {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary, #6b7280);
  }

  .no-games-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
  }

  .game-card {
    background: var(--surface-secondary, #f8f9fa);
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    position: relative;
  }

  .game-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .game-card.live {
    border-color: #ef4444;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
  }

  .game-teams {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .team {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .away-team {
    justify-content: flex-start;
  }

  .home-team {
    justify-content: flex-end;
    flex-direction: row-reverse;
  }

  .team-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
  }

  .score {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
    min-width: 24px;
    text-align: center;
  }

  .vs-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 16px;
  }

  .vs-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
    background: var(--border-color, #e1e5e9);
    padding: 4px 8px;
    border-radius: 12px;
  }

  .game-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }

  .game-status {
    font-weight: 600;
  }

  .stadium {
    color: var(--text-secondary, #6b7280);
  }

  .live-indicator-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ef4444;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .view-all {
    text-align: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color, #e1e5e9);
  }

  .view-all-btn {
    background: none;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    color: var(--text-secondary, #6b7280);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .view-all-btn:hover {
    border-color: var(--primary-color, #3b82f6);
    color: var(--primary-color, #3b82f6);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .kbo-live-schedule {
      padding: 16px;
    }

    .schedule-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .team-stats {
      padding: 12px;
    }

    .stats-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .team-info {
      justify-content: center;
    }

    .record {
      justify-content: center;
    }

    .game-card {
      padding: 12px;
    }

    .vs-divider {
      margin: 0 8px;
    }

    .team-name {
      font-size: 13px;
    }

    .compact .team-name {
      display: none;
    }
  }
</style>