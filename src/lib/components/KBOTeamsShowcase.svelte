<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import HolographicCard from '$lib/holographic/HolographicCard.svelte';

  // Types
  interface KBOTeam {
    id: string;
    name: string;
    shortName: string;
    city: string;
    color: string;
    secondary: string;
    stadium: string;
    founded: number;
    championships: number;
    logo?: string;
    slogan: string;
  }

  interface TodayGame {
    id: string;
    homeTeam: string;
    awayTeam: string;
    time: string;
    stadium: string;
    status: 'scheduled' | 'live' | 'finished';
    score?: {
      home: number;
      away: number;
    };
    inning?: string;
  }

  interface SpecialEvent {
    id: string;
    type: 'korean-series' | 'all-star' | 'opening-day' | 'playoffs';
    title: string;
    subtitle: string;
    date: string;
    teams?: string[];
    image?: string;
  }

  // Props
  export let selectedTeam: string | null = null;
  export let onTeamSelect: (teamId: string) => void = () => {};
  export let showGames: boolean = true;
  export let showEvents: boolean = true;

  // KBO 10 Teams Data
  const teams: KBOTeam[] = [
    {
      id: 'lg',
      name: 'LG 트윈스',
      shortName: 'LG',
      city: '서울 (잠실)',
      color: '#C30452',
      secondary: '#8B0036',
      stadium: '잠실야구장',
      founded: 1982,
      championships: 2,
      slogan: '승리의 쌍둥이'
    },
    {
      id: 'doosan',
      name: '두산 베어스',
      shortName: '두산',
      city: '서울 (잠실)',
      color: '#131230',
      secondary: '#1C1C3A',
      stadium: '잠실야구장',
      founded: 1982,
      championships: 6,
      slogan: '베어스 왕국'
    },
    {
      id: 'kt',
      name: 'KT 위즈',
      shortName: 'KT',
      city: '수원',
      color: '#000000',
      secondary: '#444444',
      stadium: '수원 KT 위즈 파크',
      founded: 2015,
      championships: 0,
      slogan: '마법사들의 반란'
    },
    {
      id: 'samsung',
      name: '삼성 라이온즈',
      shortName: '삼성',
      city: '대구',
      color: '#074CA1',
      secondary: '#053A7A',
      stadium: '대구 삼성 라이온즈 파크',
      founded: 1982,
      championships: 8,
      slogan: '라이온의 후예'
    },
    {
      id: 'nc',
      name: 'NC 다이노스',
      shortName: 'NC',
      city: '창원',
      color: '#B0976D',
      secondary: '#8B7355',
      stadium: 'NC 파크',
      founded: 2011,
      championships: 0,
      slogan: '공룡의 시대'
    },
    {
      id: 'kia',
      name: 'KIA 타이거즈',
      shortName: 'KIA',
      city: '광주',
      color: '#EA0029',
      secondary: '#B8001F',
      stadium: '광주-기아 챔피언스 필드',
      founded: 1982,
      championships: 11,
      slogan: '호랑이의 기백'
    },
    {
      id: 'lotte',
      name: '롯데 자이언츠',
      shortName: '롯데',
      city: '부산',
      color: '#041E42',
      secondary: '#002A54',
      stadium: '사직야구장',
      founded: 1982,
      championships: 2,
      slogan: '바다의 거인'
    },
    {
      id: 'ssg',
      name: 'SSG 랜더스',
      shortName: 'SSG',
      city: '인천',
      color: '#CE0E2D',
      secondary: '#A00B24',
      stadium: 'SSG 랜더스 필드',
      founded: 2000,
      championships: 1,
      slogan: '새로운 전설'
    },
    {
      id: 'hanwha',
      name: '한화 이글스',
      shortName: '한화',
      city: '대전',
      color: '#FF6600',
      secondary: '#CC5200',
      stadium: '한화생명 이글스 파크',
      founded: 1986,
      championships: 1,
      slogan: '불굴의 독수리'
    },
    {
      id: 'kiwoom',
      name: '키움 히어로즈',
      shortName: '키움',
      city: '서울 (고척)',
      color: '#820024',
      secondary: '#5C001A',
      stadium: '고척 스카이돔',
      founded: 2008,
      championships: 0,
      slogan: '서울의 영웅'
    }
  ];

  // Mock Today's Games
  let todayGames: TodayGame[] = [
    {
      id: 'game-1',
      homeTeam: 'lg',
      awayTeam: 'doosan',
      time: '18:30',
      stadium: '잠실야구장',
      status: 'scheduled'
    },
    {
      id: 'game-2',
      homeTeam: 'kia',
      awayTeam: 'samsung',
      time: '18:30',
      stadium: '광주-기아 챔피언스 필드',
      status: 'live',
      score: { home: 4, away: 2 },
      inning: '6회말'
    },
    {
      id: 'game-3',
      homeTeam: 'lotte',
      awayTeam: 'hanwha',
      time: '18:30',
      stadium: '사직야구장',
      status: 'finished',
      score: { home: 7, away: 5 }
    }
  ];

  // Mock Special Events
  let specialEvents: SpecialEvent[] = [
    {
      id: 'event-1',
      type: 'korean-series',
      title: '2024 한국시리즈',
      subtitle: 'KIA vs SSG - 역대급 대결',
      date: '2024.11.02 - 11.10',
      teams: ['kia', 'ssg']
    }
  ];

  // State
  let hoveredTeam: string | null = null;

  function handleTeamClick(teamId: string) {
    if (selectedTeam === teamId) {
      selectedTeam = null;
      onTeamSelect('');
    } else {
      selectedTeam = teamId;
      onTeamSelect(teamId);
    }
  }

  function getTeamById(id: string) {
    return teams.find(t => t.id === id);
  }

  function getGameStatus(game: TodayGame) {
    if (game.status === 'live') {
      return {
        label: '진행중',
        color: '#ef4444',
        pulse: true
      };
    } else if (game.status === 'finished') {
      return {
        label: '경기종료',
        color: '#6b7280',
        pulse: false
      };
    } else {
      return {
        label: game.time,
        color: '#3b82f6',
        pulse: false
      };
    }
  }

  onMount(() => {
    // In real app, fetch today's games from API
    // fetchTodayGames();
  });
</script>

<div class="kbo-teams-showcase">
  <!-- Special Events Banner -->
  {#if showEvents && specialEvents.length > 0}
    <div class="events-banner" in:fly={{ y: -20, duration: 600 }}>
      {#each specialEvents as event}
        <div
          class="event-card"
          style="background: linear-gradient(135deg, {getTeamById(
            event.teams?.[0] || 'lg'
          )?.color} 0%, {getTeamById(event.teams?.[1] || 'doosan')?.color} 100%);"
        >
          <div class="event-content">
            <div class="event-badge">
              {#if event.type === 'korean-series'}🏆{:else if event.type === 'all-star'}⭐{:else if event.type === 'playoffs'}🎯{:else}⚾{/if}
            </div>
            <h3 class="event-title">{event.title}</h3>
            <p class="event-subtitle">{event.subtitle}</p>
            <p class="event-date">{event.date}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Today's Games -->
  {#if showGames && todayGames.length > 0}
    <div class="todays-games" in:fade={{ duration: 400, delay: 200 }}>
      <h3 class="section-title">
        <span class="title-icon">⚾</span>
        오늘의 경기
      </h3>
      <div class="games-grid">
        {#each todayGames as game}
          {@const homeTeam = getTeamById(game.homeTeam)}
          {@const awayTeam = getTeamById(game.awayTeam)}
          {@const status = getGameStatus(game)}

          <div class="game-card" in:scale={{ duration: 300, delay: 100 }}>
            <div class="game-status" style="color: {status.color}">
              {#if status.pulse}
                <span class="live-dot"></span>
              {/if}
              {status.label}
              {#if game.inning}
                <span class="inning">{game.inning}</span>
              {/if}
            </div>

            <div class="game-matchup">
              <!-- Away Team -->
              <div class="game-team">
                <div
                  class="team-logo-small"
                  style="background: {awayTeam?.color}20"
                >
                  <span style="color: {awayTeam?.color}; font-weight: 700;">
                    {awayTeam?.shortName}
                  </span>
                </div>
                {#if game.score}
                  <span class="score">{game.score.away}</span>
                {/if}
              </div>

              <span class="vs">VS</span>

              <!-- Home Team -->
              <div class="game-team">
                {#if game.score}
                  <span class="score">{game.score.home}</span>
                {/if}
                <div
                  class="team-logo-small"
                  style="background: {homeTeam?.color}20"
                >
                  <span style="color: {homeTeam?.color}; font-weight: 700;">
                    {homeTeam?.shortName}
                  </span>
                </div>
              </div>
            </div>

            <div class="game-stadium">
              📍 {game.stadium}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- 10 Teams Grid -->
  <div class="teams-header">
    <h3 class="section-title">
      <span class="title-icon">🏟️</span>
      KBO 10개 구단
    </h3>
    <p class="section-subtitle">구단을 선택하면 테마가 적용됩니다</p>
  </div>

  <div class="teams-grid">
    {#each teams as team, i}
      {@const isSelected = selectedTeam === team.id}
      {@const isHovered = hoveredTeam === team.id}

      <button
        class="team-card"
        class:selected={isSelected}
        class:hovered={isHovered}
        style="--team-color: {team.color}; --team-secondary: {team.secondary}"
        on:click={() => handleTeamClick(team.id)}
        on:mouseenter={() => (hoveredTeam = team.id)}
        on:mouseleave={() => (hoveredTeam = null)}
        in:scale={{ duration: 400, delay: i * 50, start: 0.9 }}
      >
        <div class="team-card-inner">
          <!-- Team Badge -->
          <div class="team-badge">
            <div
              class="badge-circle"
              style="background: linear-gradient(135deg, {team.color} 0%, {team.secondary} 100%)"
            >
              <span class="team-initial">{team.shortName.charAt(0)}</span>
            </div>
          </div>

          <!-- Team Info -->
          <div class="team-info">
            <h4 class="team-name">{team.name}</h4>
            <p class="team-city">{team.city}</p>
            <p class="team-slogan">{team.slogan}</p>
          </div>

          <!-- Team Stats -->
          <div class="team-stats">
            <div class="stat">
              <span class="stat-value">{team.championships}</span>
              <span class="stat-label">우승</span>
            </div>
            <div class="stat">
              <span class="stat-value">{team.founded}</span>
              <span class="stat-label">창단</span>
            </div>
          </div>

          <!-- Selected Indicator -->
          {#if isSelected}
            <div class="selected-badge" in:scale={{ duration: 200 }}>✓</div>
          {/if}

          <!-- Hover Effect -->
          {#if isHovered}
            <div class="hover-overlay" transition:fade={{ duration: 200 }}>
              <p class="hover-text">클릭하여 테마 적용</p>
              <div class="hover-stadium">📍 {team.stadium}</div>
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .kbo-teams-showcase {
    width: 100%;
  }

  /* Events Banner */
  .events-banner {
    margin-bottom: 32px;
  }

  .event-card {
    padding: 24px;
    border-radius: 16px;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .event-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
  }

  .event-content {
    position: relative;
    z-index: 1;
  }

  .event-badge {
    display: inline-block;
    font-size: 32px;
    margin-bottom: 8px;
  }

  .event-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .event-subtitle {
    font-size: 16px;
    margin: 0 0 8px 0;
    opacity: 0.95;
  }

  .event-date {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }

  /* Today's Games */
  .todays-games {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-icon {
    font-size: 24px;
  }

  .section-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0 16px 0;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .game-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .game-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  .game-status {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .inning {
    margin-left: 4px;
    font-weight: 400;
    opacity: 0.8;
  }

  .game-matchup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .game-team {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .team-logo-small {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .vs {
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
  }

  .score {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  .game-stadium {
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }

  /* Teams Header */
  .teams-header {
    margin-bottom: 24px;
  }

  /* Teams Grid */
  .teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .team-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .team-card:hover {
    transform: translateY(-4px);
    border-color: var(--team-color);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .team-card.selected {
    border-color: var(--team-color);
    border-width: 3px;
    box-shadow: 0 0 0 4px var(--team-color)20, 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .team-card-inner {
    padding: 20px;
    position: relative;
  }

  .team-badge {
    margin-bottom: 16px;
  }

  .badge-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .team-initial {
    color: white;
    font-size: 28px;
    font-weight: 700;
  }

  .team-info {
    margin-bottom: 16px;
  }

  .team-name {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #1f2937;
  }

  .team-city {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 4px 0;
  }

  .team-slogan {
    font-size: 12px;
    color: var(--team-color);
    font-weight: 600;
    margin: 0;
  }

  .team-stats {
    display: flex;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--team-color);
  }

  .stat-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .selected-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    background: var(--team-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .hover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      var(--team-color) 0%,
      var(--team-secondary) 100%
    );
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 20px;
  }

  .hover-text {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .hover-stadium {
    font-size: 13px;
    opacity: 0.9;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .games-grid {
      grid-template-columns: 1fr;
    }

    .teams-grid {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
    }

    .team-card-inner {
      padding: 16px;
    }

    .badge-circle {
      width: 48px;
      height: 48px;
    }

    .team-initial {
      font-size: 20px;
    }

    .team-name {
      font-size: 16px;
    }
  }
</style>
