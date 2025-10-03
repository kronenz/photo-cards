<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { KBOTeam } from '../data/kboTemplates.js';
  import { KBO_TEAMS } from '../data/kboTemplates.js';
  
  // Props
  export let playerName = '';
  export let playerNumber = '';
  export let position = 'hitter'; // 'hitter' | 'pitcher'
  export let team: KBOTeam | null = null;
  export let season = '2024';
  export let stats = {
    // 타자 스탯
    avg: 0.000,
    homeRuns: 0,
    rbi: 0,
    hits: 0,
    runs: 0,
    sb: 0,
    ops: 0.000,
    
    // 투수 스탯
    era: 0.00,
    wins: 0,
    losses: 0,
    saves: 0,
    strikeouts: 0,
    innings: 0.0,
    whip: 0.00
  };
  export let cardStyle: 'classic' | 'modern' | 'vintage' = 'modern';
  export let showAnimation = true;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    statsUpdated: typeof stats;
    cardStyleChanged: string;
  }>();
  
  // 타자 주요 스탯
  $: hitterMainStats = [
    { label: '타율', value: stats.avg, format: '.3f', icon: '🎯' },
    { label: '홈런', value: stats.homeRuns, format: 'd', icon: '⚾' },
    { label: 'RBI', value: stats.rbi, format: 'd', icon: '🏃' },
    { label: 'OPS', value: stats.ops, format: '.3f', icon: '📊' }
  ];
  
  // 투수 주요 스탯
  $: pitcherMainStats = [
    { label: 'ERA', value: stats.era, format: '.2f', icon: '🎯' },
    { label: '승수', value: stats.wins, format: 'd', icon: '🏆' },
    { label: '탈삼진', value: stats.strikeouts, format: 'd', icon: '⚡' },
    { label: 'WHIP', value: stats.whip, format: '.2f', icon: '📊' }
  ];
  
  // 현재 포지션에 따른 스탯
  $: currentStats = position === 'hitter' ? hitterMainStats : pitcherMainStats;
  
  // 값 포맷팅
  function formatValue(value: number, format: string): string {
    if (format === 'd') return value.toString();
    if (format === '.2f') return value.toFixed(2);
    if (format === '.3f') return value.toFixed(3);
    return value.toString();
  }
  
  // 스탯 등급 계산
  function getStatGrade(stat: any): string {
    if (position === 'hitter') {
      if (stat.label === '타율') {
        if (stat.value >= 0.350) return 'S';
        if (stat.value >= 0.320) return 'A';
        if (stat.value >= 0.290) return 'B';
        if (stat.value >= 0.260) return 'C';
        return 'D';
      } else if (stat.label === '홈런') {
        if (stat.value >= 40) return 'S';
        if (stat.value >= 30) return 'A';
        if (stat.value >= 20) return 'B';
        if (stat.value >= 10) return 'C';
        return 'D';
      } else if (stat.label === 'RBI') {
        if (stat.value >= 120) return 'S';
        if (stat.value >= 100) return 'A';
        if (stat.value >= 80) return 'B';
        if (stat.value >= 60) return 'C';
        return 'D';
      } else if (stat.label === 'OPS') {
        if (stat.value >= 1.000) return 'S';
        if (stat.value >= 0.900) return 'A';
        if (stat.value >= 0.800) return 'B';
        if (stat.value >= 0.700) return 'C';
        return 'D';
      }
    } else {
      if (stat.label === 'ERA') {
        if (stat.value <= 2.50) return 'S';
        if (stat.value <= 3.50) return 'A';
        if (stat.value <= 4.50) return 'B';
        if (stat.value <= 5.50) return 'C';
        return 'D';
      } else if (stat.label === '승수') {
        if (stat.value >= 20) return 'S';
        if (stat.value >= 15) return 'A';
        if (stat.value >= 10) return 'B';
        if (stat.value >= 5) return 'C';
        return 'D';
      } else if (stat.label === '탈삼진') {
        if (stat.value >= 200) return 'S';
        if (stat.value >= 150) return 'A';
        if (stat.value >= 100) return 'B';
        if (stat.value >= 50) return 'C';
        return 'D';
      } else if (stat.label === 'WHIP') {
        if (stat.value <= 1.00) return 'S';
        if (stat.value <= 1.20) return 'A';
        if (stat.value <= 1.40) return 'B';
        if (stat.value <= 1.60) return 'C';
        return 'D';
      }
    }
    return 'C';
  }
  
  // 등급별 색상
  function getGradeColor(grade: string): string {
    switch (grade) {
      case 'S': return '#FF6B35';
      case 'A': return '#4ECDC4';
      case 'B': return '#45B7D1';
      case 'C': return '#96CEB4';
      case 'D': return '#FFEAA7';
      default: return '#DDD6FE';
    }
  }
</script>

<div class="kbo-stats-card" class:animated={showAnimation} data-style={cardStyle}>
  <!-- 카드 헤더 -->
  <div class="card-header" style="--team-primary: {team?.colors.primary || '#007AFF'}; --team-secondary: {team?.colors.secondary || '#34C759'}">
    <div class="player-info">
      <div class="player-number">#{playerNumber || '00'}</div>
      <div class="player-details">
        <h3 class="player-name">{playerName || '선수명'}</h3>
        <div class="player-meta">
          <span class="position-badge" class:hitter={position === 'hitter'} class:pitcher={position === 'pitcher'}>
            {position === 'hitter' ? '타자' : '투수'}
          </span>
          <span class="season-badge">{season}</span>
        </div>
      </div>
    </div>
    
    {#if team}
      <div class="team-logo">
        <div class="logo-circle" style="background: {team.colors.primary}">
          ⚾
        </div>
        <div class="team-name">{team.name}</div>
      </div>
    {/if}
  </div>
  
  <!-- 주요 스탯 그리드 -->
  <div class="stats-grid">
    {#each currentStats as stat, index (stat.label)}
      <div 
        class="stat-item"
        style="animation-delay: {index * 0.1}s"
      >
        <div class="stat-icon">{stat.icon}</div>
        <div class="stat-content">
          <div class="stat-label">{stat.label}</div>
          <div class="stat-value">{formatValue(stat.value, stat.format)}</div>
        </div>
        <div 
          class="stat-grade"
          style="background: {getGradeColor(getStatGrade(stat))}"
        >
          {getStatGrade(stat)}
        </div>
      </div>
    {/each}
  </div>
  
  <!-- 상세 스탯 (접을 수 있는 섹션) -->
  <details class="detailed-stats">
    <summary class="stats-toggle">
      <span class="toggle-text">상세 기록 보기</span>
      <span class="toggle-icon">▼</span>
    </summary>
    
    <div class="detailed-content">
      {#if position === 'hitter'}
        <div class="stat-row">
          <span class="detail-label">안타</span>
          <span class="detail-value">{stats.hits}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">득점</span>
          <span class="detail-value">{stats.runs}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">도루</span>
          <span class="detail-value">{stats.sb}</span>
        </div>
      {:else}
        <div class="stat-row">
          <span class="detail-label">패배</span>
          <span class="detail-value">{stats.losses}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">세이브</span>
          <span class="detail-value">{stats.saves}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">이닝</span>
          <span class="detail-value">{stats.innings.toFixed(1)}</span>
        </div>
      {/if}
    </div>
  </details>
  
  <!-- 카드 푸터 -->
  <div class="card-footer">
    <div class="kbo-branding">
      <span class="kbo-logo">⚾</span>
      <span class="kbo-text">KBO 리그</span>
    </div>
    
    <div class="holographic-indicator">
      <div class="holo-shine"></div>
      <span class="holo-text">HOLOGRAPHIC</span>
    </div>
  </div>
</div>

<style>
  .kbo-stats-card {
    width: 100%;
    max-width: 320px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 20px;
    padding: 20px;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .kbo-stats-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  .kbo-stats-card:hover::before {
    transform: translateX(100%);
  }
  
  .kbo-stats-card.animated {
    animation: cardEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes cardEntrance {
    0% {
      opacity: 0;
      transform: translateY(30px) rotateX(15deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }
  
  /* 카드 헤더 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .player-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .player-number {
    width: 40px;
    height: 40px;
    background: var(--team-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: white;
  }
  
  .player-details {
    flex: 1;
  }
  
  .player-name {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px;
    color: white;
  }
  
  .player-meta {
    display: flex;
    gap: 8px;
  }
  
  .position-badge,
  .season-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .position-badge.hitter {
    background: var(--team-primary);
    color: white;
  }
  
  .position-badge.pitcher {
    background: var(--team-secondary);
    color: white;
  }
  
  .season-badge {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .team-logo {
    text-align: center;
  }
  
  .logo-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin: 0 auto 4px;
  }
  
  .team-name {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }
  
  /* 스탯 그리드 */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .stat-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .kbo-stats-card.animated .stat-item {
    animation: statItemSlide 0.6s ease forwards;
    opacity: 0;
    transform: translateX(-20px);
  }
  
  @keyframes statItemSlide {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .stat-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  .stat-icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2px;
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 16px;
    font-weight: 700;
    color: white;
  }
  
  .stat-grade {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  /* 상세 스탯 */
  .detailed-stats {
    margin-bottom: 16px;
  }
  
  .stats-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  .stats-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .toggle-icon {
    transition: transform 0.3s ease;
  }
  
  .detailed-stats[open] .toggle-icon {
    transform: rotate(180deg);
  }
  
  .detailed-content {
    padding: 12px 0 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }
  
  .detail-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
  
  .detail-value {
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  /* 카드 푸터 */
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .kbo-branding {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }
  
  .kbo-logo {
    font-size: 12px;
  }
  
  .holographic-indicator {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .holo-shine {
    width: 8px;
    height: 8px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
    border-radius: 50%;
    animation: holoShine 2s ease-in-out infinite;
  }
  
  @keyframes holoShine {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  /* 카드 스타일 변형 */
  .kbo-stats-card[data-style="classic"] {
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border-radius: 12px;
  }
  
  .kbo-stats-card[data-style="vintage"] {
    background: linear-gradient(135deg, #8b4513, #a0522d);
    border-radius: 8px;
    border: 2px solid #daa520;
  }
  
  .kbo-stats-card[data-style="vintage"] .stat-item {
    background: rgba(218, 165, 32, 0.1);
    border-color: rgba(218, 165, 32, 0.3);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 480px) {
    .kbo-stats-card {
      max-width: 100%;
      padding: 16px;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .player-name {
      font-size: 16px;
    }
    
    .stat-value {
      font-size: 14px;
    }
  }
</style>