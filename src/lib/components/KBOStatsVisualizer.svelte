<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let playerName = '';
  export let season = '2024';
  export let stats = {
    avg: 0.000,
    homeRuns: 0,
    rbi: 0,
    ops: 0.000,
    era: 0.00,
    wins: 0,
    strikeouts: 0,
    whip: 0.00
  };
  export let position = 'hitter'; // 'hitter' | 'pitcher'
  export let teamColors = { primary: '#007AFF', secondary: '#34C759' };
  
  // 상태 관리
  let animationEnabled = true;
  let chartType: 'bar' | 'radar' | 'line' = 'bar';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    statsUpdated: typeof stats;
    exportRequested: { format: 'png' | 'svg' };
  }>();
  
  // 타자 통계 계산
  $: hitterStats = [
    { label: '타율', value: stats.avg, max: 0.400, format: '.3f' },
    { label: '홈런', value: stats.homeRuns, max: 50, format: 'd' },
    { label: 'RBI', value: stats.rbi, max: 130, format: 'd' },
    { label: 'OPS', value: stats.ops, max: 1.200, format: '.3f' }
  ];
  
  // 투수 통계 계산
  $: pitcherStats = [
    { label: 'ERA', value: stats.era, max: 6.00, format: '.2f', inverse: true },
    { label: '승수', value: stats.wins, max: 20, format: 'd' },
    { label: '탈삼진', value: stats.strikeouts, max: 200, format: 'd' },
    { label: 'WHIP', value: stats.whip, max: 2.00, format: '.2f', inverse: true }
  ];
  
  // 현재 통계 선택
  $: currentStats = position === 'hitter' ? hitterStats : pitcherStats;
  
  // 통계 바 너비 계산
  function getBarWidth(stat: any): number {
    if (stat.inverse) {
      // ERA, WHIP 같은 낮을수록 좋은 지표
      return Math.max(0, Math.min(100, (stat.max - stat.value) / stat.max * 100));
    }
    return Math.max(0, Math.min(100, stat.value / stat.max * 100));
  }
  
  // 통계 색상 계산
  function getStatColor(stat: any): string {
    const percentage = getBarWidth(stat);
    if (percentage >= 80) return teamColors.primary;
    if (percentage >= 60) return teamColors.secondary;
    if (percentage >= 40) return '#FF9500';
    return '#FF3B30';
  }
  
  // 값 포맷팅
  function formatValue(value: number, format: string): string {
    if (format === 'd') return value.toString();
    if (format === '.2f') return value.toFixed(2);
    if (format === '.3f') return value.toFixed(3);
    return value.toString();
  }
  
  // 등급 계산
  function getGrade(stat: any): string {
    const percentage = getBarWidth(stat);
    if (percentage >= 90) return 'S';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'D';
  }
  
  // 통계 업데이트
  function updateStats() {
    dispatch('statsUpdated', stats);
  }
  
  // 내보내기
  function exportChart(format: 'png' | 'svg') {
    dispatch('exportRequested', { format });
  }
</script>

<div class="stats-visualizer" style="--team-primary: {teamColors.primary}; --team-secondary: {teamColors.secondary}">
  <!-- 헤더 -->
  <div class="visualizer-header">
    <div class="player-info">
      <h3 class="player-name">{playerName || '선수명'}</h3>
      <div class="season-info">
        <span class="season-year">{season} 시즌</span>
        <span class="position-badge" class:hitter={position === 'hitter'} class:pitcher={position === 'pitcher'}>
          {position === 'hitter' ? '타자' : '투수'}
        </span>
      </div>
    </div>
    
    <div class="controls">
      <div class="chart-type-selector">
        <button 
          class="chart-type-btn"
          class:active={chartType === 'bar'}
          on:click={() => chartType = 'bar'}
          title="막대 차트"
        >
          📊
        </button>
        <button 
          class="chart-type-btn"
          class:active={chartType === 'radar'}
          on:click={() => chartType = 'radar'}
          title="레이더 차트"
        >
          🎯
        </button>
      </div>
      
      <button 
        class="animation-toggle"
        class:active={animationEnabled}
        on:click={() => animationEnabled = !animationEnabled}
        title="애니메이션 토글"
      >
        {animationEnabled ? '⏸️' : '▶️'}
      </button>
    </div>
  </div>
  
  <!-- 통계 차트 -->
  <div class="chart-container">
    {#if chartType === 'bar'}
      <div class="bar-chart" class:animated={animationEnabled}>
        {#each currentStats as stat, index}
          <div class="stat-row">
            <div class="stat-label">
              <span class="label-text">{stat.label}</span>
              <span class="grade-badge" style="background: {getStatColor(stat)}">
                {getGrade(stat)}
              </span>
            </div>
            
            <div class="stat-bar-container">
              <div 
                class="stat-bar"
                style="
                  width: {getBarWidth(stat)}%;
                  background: linear-gradient(90deg, {getStatColor(stat)}, {getStatColor(stat)}88);
                  animation-delay: {index * 0.1}s;
                "
              ></div>
              <div class="stat-value">
                {formatValue(stat.value, stat.format)}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if chartType === 'radar'}
      <div class="radar-chart">
        <svg viewBox="0 0 200 200" class="radar-svg">
          <!-- 배경 그리드 -->
          {#each [20, 40, 60, 80, 100] as radius}
            <circle 
              cx="100" 
              cy="100" 
              r={radius} 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.1)" 
              stroke-width="1"
            />
          {/each}
          
          <!-- 축선 -->
          {#each currentStats as stat, index}
            {@const angle = (index * 360 / currentStats.length - 90) * Math.PI / 180}
            {@const x2 = 100 + Math.cos(angle) * 100}
            {@const y2 = 100 + Math.sin(angle) * 100}
            <line 
              x1="100" 
              y1="100" 
              x2={x2} 
              y2={y2} 
              stroke="rgba(255, 255, 255, 0.2)" 
              stroke-width="1"
            />
          {/each}
          
          <!-- 데이터 폴리곤 -->
          <polygon
            points={currentStats.map((stat, index) => {
              const angle = (index * 360 / currentStats.length - 90) * Math.PI / 180;
              const radius = getBarWidth(stat);
              const x = 100 + Math.cos(angle) * radius;
              const y = 100 + Math.sin(angle) * radius;
              return `${x},${y}`;
            }).join(' ')}
            fill={`${teamColors.primary}33`}
            stroke={teamColors.primary}
            stroke-width="2"
            class:animated={animationEnabled}
          />
          
          <!-- 데이터 포인트 -->
          {#each currentStats as stat, index}
            {@const angle = (index * 360 / currentStats.length - 90) * Math.PI / 180}
            {@const radius = getBarWidth(stat)}
            {@const x = 100 + Math.cos(angle) * radius}
            {@const y = 100 + Math.sin(angle) * radius}
            <circle 
              cx={x} 
              cy={y} 
              r="3" 
              fill={teamColors.primary}
              class:animated={animationEnabled}
              style="animation-delay: {index * 0.1}s"
            />
          {/each}
          
          <!-- 라벨 -->
          {#each currentStats as stat, index}
            {@const angle = (index * 360 / currentStats.length - 90) * Math.PI / 180}
            {@const x = 100 + Math.cos(angle) * 120}
            {@const y = 100 + Math.sin(angle) * 120}
            <text 
              x={x} 
              y={y} 
              text-anchor="middle" 
              dominant-baseline="middle"
              fill="white"
              font-size="10"
              font-weight="500"
            >
              {stat.label}
            </text>
          {/each}
        </svg>
      </div>
    {/if}
  </div>
  
  <!-- 통계 요약 -->
  <div class="stats-summary">
    <div class="summary-grid">
      {#each currentStats as stat}
        <div class="summary-item">
          <div class="summary-label">{stat.label}</div>
          <div class="summary-value" style="color: {getStatColor(stat)}">
            {formatValue(stat.value, stat.format)}
          </div>
          <div class="summary-grade">
            등급: {getGrade(stat)}
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- 액션 버튼 -->
  <div class="actions">
    <button class="action-btn" on:click={() => exportChart('png')}>
      📸 PNG 저장
    </button>
    <button class="action-btn" on:click={() => exportChart('svg')}>
      🎨 SVG 저장
    </button>
    <button class="action-btn" on:click={updateStats}>
      🔄 통계 업데이트
    </button>
  </div>
</div>

<style>
  .stats-visualizer {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
    color: var(--apple-text-primary);
  }
  
  /* 헤더 */
  .visualizer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  
  .player-info {
    flex: 1;
  }
  
  .player-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .season-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .season-year {
    font-size: 16px;
    color: var(--apple-text-secondary);
  }
  
  .position-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  .position-badge.hitter {
    background: var(--team-primary);
  }
  
  .position-badge.pitcher {
    background: var(--team-secondary);
  }
  
  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .chart-type-selector {
    display: flex;
    background: var(--apple-surface-secondary);
    border-radius: 8px;
    padding: 2px;
  }
  
  .chart-type-btn {
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .chart-type-btn:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .chart-type-btn.active {
    background: var(--team-primary);
  }
  
  .animation-toggle {
    padding: 8px;
    background: var(--apple-surface-secondary);
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .animation-toggle:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .animation-toggle.active {
    background: var(--team-secondary);
  }
  
  /* 차트 컨테이너 */
  .chart-container {
    margin-bottom: 24px;
    min-height: 300px;
  }
  
  /* 막대 차트 */
  .bar-chart {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .stat-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .stat-label {
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  
  .label-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
  }
  
  .grade-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
  }
  
  .stat-bar-container {
    flex: 1;
    position: relative;
    height: 32px;
    background: var(--apple-surface-secondary);
    border-radius: 16px;
    overflow: hidden;
  }
  
  .stat-bar {
    height: 100%;
    border-radius: 16px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .bar-chart.animated .stat-bar {
    animation: barGrow 1s ease-out forwards;
  }
  
  .stat-value {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 600;
    color: var(--apple-text-primary);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  /* 레이더 차트 */
  .radar-chart {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }
  
  .radar-svg {
    width: 100%;
    max-width: 300px;
    height: 100%;
  }
  
  .radar-svg polygon.animated {
    animation: radarGrow 1s ease-out forwards;
  }
  
  .radar-svg circle.animated {
    animation: pointPop 0.5s ease-out forwards;
  }
  
  /* 통계 요약 */
  .stats-summary {
    background: var(--apple-surface-secondary);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
  }
  
  .summary-item {
    text-align: center;
  }
  
  .summary-label {
    font-size: 12px;
    color: var(--apple-text-secondary);
    margin-bottom: 4px;
  }
  
  .summary-value {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .summary-grade {
    font-size: 11px;
    color: var(--apple-text-tertiary);
  }
  
  /* 액션 버튼 */
  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .action-btn {
    padding: 10px 16px;
    background: var(--apple-surface-tertiary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    color: var(--apple-text-primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-btn:hover {
    background: var(--team-primary);
    color: white;
    border-color: var(--team-primary);
    transform: translateY(-1px);
  }
  
  /* 애니메이션 */
  @keyframes barGrow {
    from {
      width: 0%;
    }
    to {
      width: var(--final-width, 100%);
    }
  }
  
  @keyframes radarGrow {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes pointPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    80% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .stats-visualizer {
      padding: 16px;
    }
    
    .visualizer-header {
      flex-direction: column;
      gap: 16px;
    }
    
    .stat-row {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
    
    .stat-label {
      min-width: auto;
    }
    
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .actions {
      flex-direction: column;
    }
  }
</style>

