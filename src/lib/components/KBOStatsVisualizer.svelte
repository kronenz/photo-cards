<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let playerName = '';
  export let stats: PlayerStats = {
    batting: { avg: 0, hr: 0, rbi: 0, sb: 0 },
    pitching: { era: 0, wins: 0, saves: 0, so: 0 },
    fielding: { po: 0, a: 0, e: 0, dp: 0 }
  };
  export let visualType: 'radar' | 'bar' | 'line' | 'donut' = 'radar';
  export let teamColor = '#007AFF';
  export let animated = true;
  export let showLabels = true;
  
  // 통계 데이터 타입
  interface PlayerStats {
    batting: {
      avg: number;    // 타율
      hr: number;     // 홈런
      rbi: number;    // 타점
      sb: number;     // 도루
    };
    pitching: {
      era: number;    // 평균자책점
      wins: number;   // 승수
      saves: number;  // 세이브
      so: number;     // 삼진
    };
    fielding: {
      po: number;     // 자살
      a: number;      // 어시스트
      e: number;      // 에러
      dp: number;     // 병살
    };
  }
  
  // 상태 관리
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number;
  let animationProgress = 0;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    statsUpdated: PlayerStats;
    visualTypeChanged: string;
  }>();
  
  onMount(() => {
    if (!browser || !canvas) return;
    
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 크기 설정
    resizeCanvas();
    
    // 애니메이션 시작
    if (animated) {
      startAnimation();
    } else {
      drawVisualization();
    }
    
    // 리사이즈 이벤트 리스너
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
  
  // 캔버스 크기 조정
  function resizeCanvas() {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    drawVisualization();
  }
  
  // 애니메이션 시작
  function startAnimation() {
    animationProgress = 0;
    
    const animate = () => {
      animationProgress += 0.02;
      
      if (animationProgress >= 1) {
        animationProgress = 1;
      }
      
      drawVisualization();
      
      if (animationProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  // 시각화 그리기
  function drawVisualization() {
    if (!ctx || !canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);
    
    switch (visualType) {
      case 'radar':
        drawRadarChart(width, height);
        break;
      case 'bar':
        drawBarChart(width, height);
        break;
      case 'line':
        drawLineChart(width, height);
        break;
      case 'donut':
        drawDonutChart(width, height);
        break;
    }
  }
  
  // 레이더 차트 그리기
  function drawRadarChart(width: number, height: number) {
    if (!ctx) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    // 타격 스탯 정규화 (0-1 범위)
    const normalizedStats = [
      Math.min(stats.batting.avg / 0.4, 1),      // 타율 (최대 0.400)
      Math.min(stats.batting.hr / 50, 1),       // 홈런 (최대 50개)
      Math.min(stats.batting.rbi / 150, 1),     // 타점 (최대 150개)
      Math.min(stats.batting.sb / 50, 1),       // 도루 (최대 50개)
      Math.min((5 - stats.pitching.era) / 5, 1), // ERA (낮을수록 좋음)
      Math.min(stats.pitching.wins / 20, 1)     // 승수 (최대 20승)
    ];
    
    const labels = ['타율', '홈런', '타점', '도루', 'ERA', '승수'];
    const angles = labels.map((_, i) => (i * 2 * Math.PI) / labels.length - Math.PI / 2);
    
    // 배경 그리드 그리기
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const gridRadius = (radius * i) / 5;
      
      angles.forEach((angle, index) => {
        const x = centerX + Math.cos(angle) * gridRadius;
        const y = centerY + Math.sin(angle) * gridRadius;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.stroke();
    }
    
    // 축 그리기
    angles.forEach(angle => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    });
    
    // 데이터 영역 그리기
    ctx.fillStyle = teamColor + '40';
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    normalizedStats.forEach((value, index) => {
      const animatedValue = animated ? value * animationProgress : value;
      const x = centerX + Math.cos(angles[index]) * radius * animatedValue;
      const y = centerY + Math.sin(angles[index]) * radius * animatedValue;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 데이터 포인트 그리기
    normalizedStats.forEach((value, index) => {
      const animatedValue = animated ? value * animationProgress : value;
      const x = centerX + Math.cos(angles[index]) * radius * animatedValue;
      const y = centerY + Math.sin(angles[index]) * radius * animatedValue;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = teamColor;
      ctx.fill();
    });
    
    // 라벨 그리기
    if (showLabels) {
      ctx.fillStyle = '#333';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      
      labels.forEach((label, index) => {
        const labelRadius = radius + 20;
        const x = centerX + Math.cos(angles[index]) * labelRadius;
        const y = centerY + Math.sin(angles[index]) * labelRadius;
        
        ctx.fillText(label, x, y + 4);
      });
    }
  }
  
  // 바 차트 그리기
  function drawBarChart(width: number, height: number) {
    if (!ctx) return;
    
    const margin = 40;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;
    
    const battingStats = [
      { label: '타율', value: stats.batting.avg, max: 0.4 },
      { label: '홈런', value: stats.batting.hr, max: 50 },
      { label: '타점', value: stats.batting.rbi, max: 150 },
      { label: '도루', value: stats.batting.sb, max: 50 }
    ];
    
    const barWidth = chartWidth / battingStats.length - 10;
    
    battingStats.forEach((stat, index) => {
      const x = margin + index * (barWidth + 10);
      const normalizedValue = Math.min(stat.value / stat.max, 1);
      const animatedValue = animated ? normalizedValue * animationProgress : normalizedValue;
      const barHeight = chartHeight * animatedValue;
      const y = margin + chartHeight - barHeight;
      
      // 바 그리기
      ctx.fillStyle = teamColor;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // 값 표시
      if (showLabels) {
        ctx.fillStyle = '#333';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        
        // 라벨
        ctx.fillText(stat.label, x + barWidth / 2, height - 10);
        
        // 값
        ctx.fillText(
          stat.value.toString(),
          x + barWidth / 2,
          y - 5
        );
      }
    });
  }
  
  // 라인 차트 그리기
  function drawLineChart(width: number, height: number) {
    if (!ctx) return;
    
    const margin = 40;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;
    
    // 시즌별 데이터 (예시)
    const seasonData = [
      { season: '2020', avg: 0.280, hr: 15 },
      { season: '2021', avg: 0.295, hr: 22 },
      { season: '2022', avg: 0.315, hr: 28 },
      { season: '2023', avg: stats.batting.avg, hr: stats.batting.hr }
    ];
    
    const stepX = chartWidth / (seasonData.length - 1);
    
    // 타율 라인
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    seasonData.forEach((data, index) => {
      const x = margin + index * stepX;
      const y = margin + chartHeight - (data.avg / 0.4) * chartHeight;
      const animatedY = animated ? 
        margin + chartHeight - (margin + chartHeight - y) * animationProgress : y;
      
      if (index === 0) {
        ctx.moveTo(x, animatedY);
      } else {
        ctx.lineTo(x, animatedY);
      }
    });
    
    ctx.stroke();
    
    // 데이터 포인트
    seasonData.forEach((data, index) => {
      const x = margin + index * stepX;
      const y = margin + chartHeight - (data.avg / 0.4) * chartHeight;
      const animatedY = animated ? 
        margin + chartHeight - (margin + chartHeight - y) * animationProgress : y;
      
      ctx.beginPath();
      ctx.arc(x, animatedY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = teamColor;
      ctx.fill();
    });
    
    // 라벨
    if (showLabels) {
      ctx.fillStyle = '#333';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      
      seasonData.forEach((data, index) => {
        const x = margin + index * stepX;
        ctx.fillText(data.season, x, height - 10);
      });
    }
  }
  
  // 도넛 차트 그리기
  function drawDonutChart(width: number, height: number) {
    if (!ctx) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.6;
    
    const data = [
      { label: '안타', value: stats.batting.avg * 100, color: teamColor },
      { label: '홈런', value: stats.batting.hr, color: teamColor + 'CC' },
      { label: '타점', value: stats.batting.rbi / 2, color: teamColor + '99' },
      { label: '도루', value: stats.batting.sb, color: teamColor + '66' }
    ];
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;
    
    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const animatedAngle = animated ? sliceAngle * animationProgress : sliceAngle;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + animatedAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + animatedAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = item.color;
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
    
    // 중앙 텍스트
    if (showLabels) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(playerName || '선수', centerX, centerY - 5);
      
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('통계', centerX, centerY + 15);
    }
  }
  
  // 시각화 타입 변경
  function changeVisualType(type: typeof visualType) {
    visualType = type;
    dispatch('visualTypeChanged', type);
    
    if (animated) {
      startAnimation();
    } else {
      drawVisualization();
    }
  }
  
  // 통계 업데이트
  function updateStats(newStats: Partial<PlayerStats>) {
    stats = { ...stats, ...newStats };
    dispatch('statsUpdated', stats);
    
    if (animated) {
      startAnimation();
    } else {
      drawVisualization();
    }
  }
  
  // 반응형 처리
  $: if (browser && canvas) {
    drawVisualization();
  }
</script>

<div class="kbo-stats-visualizer">
  <!-- 컨트롤 패널 -->
  <div class="controls-panel">
    <div class="control-group">
      <label class="control-label">시각화 타입</label>
      <div class="visual-type-buttons">
        <button
          class="type-button"
          class:active={visualType === 'radar'}
          on:click={() => changeVisualType('radar')}
          title="레이더 차트"
        >
          🕸️
        </button>
        <button
          class="type-button"
          class:active={visualType === 'bar'}
          on:click={() => changeVisualType('bar')}
          title="바 차트"
        >
          📊
        </button>
        <button
          class="type-button"
          class:active={visualType === 'line'}
          on:click={() => changeVisualType('line')}
          title="라인 차트"
        >
          📈
        </button>
        <button
          class="type-button"
          class:active={visualType === 'donut'}
          on:click={() => changeVisualType('donut')}
          title="도넛 차트"
        >
          🍩
        </button>
      </div>
    </div>
    
    <div class="control-group">
      <label class="control-label">
        <input
          type="checkbox"
          bind:checked={animated}
          on:change={() => animated && startAnimation()}
        />
        애니메이션
      </label>
      
      <label class="control-label">
        <input
          type="checkbox"
          bind:checked={showLabels}
          on:change={drawVisualization}
        />
        라벨 표시
      </label>
    </div>
  </div>
  
  <!-- 캔버스 -->
  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      class="stats-canvas"
    ></canvas>
  </div>
  
  <!-- 통계 입력 패널 -->
  <div class="stats-input-panel">
    <h4 class="panel-title">선수 통계 입력</h4>
    
    <div class="stats-grid">
      <div class="stat-category">
        <h5 class="category-title">타격</h5>
        <div class="stat-inputs">
          <label class="stat-input">
            <span>타율</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.001"
              bind:value={stats.batting.avg}
              on:input={() => updateStats({ batting: stats.batting })}
            />
          </label>
          <label class="stat-input">
            <span>홈런</span>
            <input
              type="number"
              min="0"
              bind:value={stats.batting.hr}
              on:input={() => updateStats({ batting: stats.batting })}
            />
          </label>
          <label class="stat-input">
            <span>타점</span>
            <input
              type="number"
              min="0"
              bind:value={stats.batting.rbi}
              on:input={() => updateStats({ batting: stats.batting })}
            />
          </label>
          <label class="stat-input">
            <span>도루</span>
            <input
              type="number"
              min="0"
              bind:value={stats.batting.sb}
              on:input={() => updateStats({ batting: stats.batting })}
            />
          </label>
        </div>
      </div>
      
      <div class="stat-category">
        <h5 class="category-title">투구</h5>
        <div class="stat-inputs">
          <label class="stat-input">
            <span>ERA</span>
            <input
              type="number"
              min="0"
              step="0.01"
              bind:value={stats.pitching.era}
              on:input={() => updateStats({ pitching: stats.pitching })}
            />
          </label>
          <label class="stat-input">
            <span>승수</span>
            <input
              type="number"
              min="0"
              bind:value={stats.pitching.wins}
              on:input={() => updateStats({ pitching: stats.pitching })}
            />
          </label>
          <label class="stat-input">
            <span>세이브</span>
            <input
              type="number"
              min="0"
              bind:value={stats.pitching.saves}
              on:input={() => updateStats({ pitching: stats.pitching })}
            />
          </label>
          <label class="stat-input">
            <span>삼진</span>
            <input
              type="number"
              min="0"
              bind:value={stats.pitching.so}
              on:input={() => updateStats({ pitching: stats.pitching })}
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .kbo-stats-visualizer {
    width: 100%;
    max-width: 600px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
  }
  
  /* 컨트롤 패널 */
  .controls-panel {
    padding: 16px 20px;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .control-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .control-label {
    font-size: 14px;
    color: var(--apple-text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .visual-type-buttons {
    display: flex;
    gap: 4px;
  }
  
  .type-button {
    width: 36px;
    height: 36px;
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .type-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .type-button.active {
    background: var(--apple-accent-blue);
    border-color: var(--apple-accent-blue);
    color: white;
  }
  
  /* 캔버스 */
  .canvas-container {
    position: relative;
    width: 100%;
    height: 300px;
    background: var(--apple-surface-primary);
  }
  
  .stats-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  /* 통계 입력 패널 */
  .stats-input-panel {
    padding: 20px;
    background: var(--apple-surface-secondary);
    border-top: 1px solid var(--apple-surface-border);
  }
  
  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 16px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .stat-category {
    background: var(--apple-surface-primary);
    border-radius: 12px;
    padding: 16px;
  }
  
  .category-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 12px;
  }
  
  .stat-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: var(--apple-text-secondary);
  }
  
  .stat-input span {
    flex: 1;
  }
  
  .stat-input input {
    width: 80px;
    padding: 4px 8px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 4px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 13px;
    text-align: right;
  }
  
  .stat-input input:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .controls-panel {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .canvas-container {
      height: 250px;
    }
  }
</style>