<script lang="ts">
  import { onMount } from 'svelte';
  import HolographicCard from '$lib/holographic/HolographicCard.svelte';
  import type { HolographicType } from '$lib/holographic/HolographicEngine.js';
  import { deviceCapabilities } from '$lib/holographic/utils.js';
  import { browser } from '$app/environment';
  
  // 홀로그래픽 타입들
  const holographicTypes: { id: HolographicType; name: string; description: string }[] = [
    { id: 'basic', name: '베이직', description: '기본 무지개 홀로그래픽' },
    { id: 'cosmic', name: '코스믹', description: '우주 은하 효과' },
    { id: 'rainbow', name: '레인보우', description: '풀 스펙트럼 무지개' },
    { id: 'aurora', name: '오로라', description: '파스텔 오로라 효과' },
    { id: 'secret', name: '시크릿', description: '프리미엄 골드 효과' },
    { id: 'galaxy', name: '갤럭시', description: '깊은 우주 효과' }
  ];
  
  // KBO 구단들
  const kboTeams: { id: HolographicType; name: string; description: string }[] = [
    { id: 'lg', name: 'LG 트윈스', description: '레드&핑크 홀로그래픽' },
    { id: 'doosan', name: '두산 베어스', description: '네이비&블루 홀로그래픽' },
    { id: 'kt', name: 'KT 위즈', description: '블랙&레드 홀로그래픽' },
    { id: 'samsung', name: '삼성 라이온즈', description: '블루&라이트블루 홀로그래픽' },
    { id: 'lotte', name: '롯데 자이언츠', description: '네이비&레드 홀로그래픽' },
    { id: 'kia', name: 'KIA 타이거즈', description: '레드&블랙 홀로그래픽' },
    { id: 'nc', name: 'NC 다이노스', description: '블루&골드 홀로그래픽' },
    { id: 'hanwha', name: '한화 이글스', description: '오렌지&블랙 홀로그래픽' },
    { id: 'ssg', name: 'SSG 랜더스', description: '레드&골드 홀로그래픽' },
    { id: 'kiwoom', name: '키움 히어로즈', description: '버건디&골드 홀로그래픽' }
  ];
  
  // 상태 관리
  let selectedType: HolographicType = 'basic';
  let showPerformance = false;
  let optimizedMode = false;
  let disableEffects = false;
  
  // 샘플 카드 데이터
  const sampleCards = [
    {
      title: '홈런왕의 순간',
      subtitle: '역대 최고 홈런',
      rarity: '★★★★★',
      team: 'LG 트윈스'
    },
    {
      title: '완전경기 달성',
      subtitle: '역사적인 순간',
      rarity: '★★★★★',
      team: '두산 베어스'
    },
    {
      title: '끝내기 안타',
      subtitle: '드라마틱한 승부',
      rarity: '★★★★',
      team: 'KT 위즈'
    }
  ];
  
  let currentCardIndex = 0;
  
  onMount(() => {
    // 브라우저에서만 디바이스 성능 체크
    if (browser) {
      // 디바이스 성능에 따른 자동 최적화
      if (!deviceCapabilities.isHighPerformance || deviceCapabilities.isMobile) {
        optimizedMode = true;
      }
    }
    
    // 자동 카드 순환 (데모용)
    const interval = setInterval(() => {
      currentCardIndex = (currentCardIndex + 1) % sampleCards.length;
    }, 4000);
    
    return () => clearInterval(interval);
  });
  
  function handleTypeChange(type: HolographicType) {
    selectedType = type;
  }
</script>

<svelte:head>
  <title>홀로그래픽 엔진 데모 - KBO 카드 커뮤니티</title>
  <meta name="description" content="60fps 보장 프리미엄 홀로그래픽 효과 데모" />
</svelte:head>

<div class="demo-page">
  <!-- 헤더 -->
  <header class="demo-header">
    <div class="container">
      <h1 class="demo-title">
        <span class="title-icon">✨</span>
        홀로그래픽 엔진 데모
      </h1>
      <p class="demo-subtitle">
        60fps 보장 Apple 수준 프리미엄 홀로그래픽 효과
      </p>
    </div>
  </header>
  
  <!-- 메인 데모 영역 -->
  <main class="demo-main">
    <div class="container">
      <!-- 카드 데모 섹션 -->
      <section class="card-demo-section">
        <div class="demo-card-container">
          <HolographicCard
            type={selectedType}
            title={sampleCards[currentCardIndex].title}
            subtitle={sampleCards[currentCardIndex].subtitle}
            rarity={sampleCards[currentCardIndex].rarity}
            team={sampleCards[currentCardIndex].team}
            animated={true}
            showPerformance={showPerformance}
          />
        </div>
        
        <!-- 카드 정보 -->
        <div class="card-info">
          <h3 class="card-info-title">{sampleCards[currentCardIndex].title}</h3>
          <p class="card-info-subtitle">{sampleCards[currentCardIndex].subtitle}</p>
          <div class="card-info-meta">
            <span class="team-badge">{sampleCards[currentCardIndex].team}</span>
            <span class="rarity-badge">{sampleCards[currentCardIndex].rarity}</span>
          </div>
        </div>
      </section>
      
      <!-- 컨트롤 패널 -->
      <section class="control-panel">
        <div class="panel-header">
          <h2 class="panel-title">홀로그래픽 효과 컨트롤</h2>
          <p class="panel-description">
            다양한 홀로그래픽 효과를 실시간으로 체험해보세요
          </p>
        </div>
        
        <!-- 기본 홀로그래픽 효과 -->
        <div class="control-group">
          <h3 class="group-title">기본 홀로그래픽 효과</h3>
          <div class="type-grid">
            {#each holographicTypes as type}
              <button
                class="type-button"
                class:active={selectedType === type.id}
                on:click={() => handleTypeChange(type.id)}
              >
                <div class="type-preview holographic-{type.id}"></div>
                <div class="type-info">
                  <span class="type-name">{type.name}</span>
                  <span class="type-desc">{type.description}</span>
                </div>
              </button>
            {/each}
          </div>
        </div>
        
        <!-- KBO 구단별 효과 -->
        <div class="control-group">
          <h3 class="group-title">KBO 구단별 홀로그래픽</h3>
          <div class="team-grid">
            {#each kboTeams as team}
              <button
                class="team-button"
                class:active={selectedType === team.id}
                on:click={() => handleTypeChange(team.id)}
              >
                <div class="team-logo">⚾</div>
                <div class="team-info">
                  <span class="team-name">{team.name}</span>
                  <span class="team-desc">{team.description}</span>
                </div>
              </button>
            {/each}
          </div>
        </div>
        
        <!-- 설정 옵션 -->
        <div class="control-group">
          <h3 class="group-title">설정 옵션</h3>
          <div class="settings-grid">
            <label class="setting-item">
              <input
                type="checkbox"
                bind:checked={showPerformance}
              />
              <span class="setting-label">성능 모니터링 표시</span>
              <span class="setting-desc">FPS 및 프레임 시간 표시</span>
            </label>
            
            <label class="setting-item">
              <input
                type="checkbox"
                bind:checked={optimizedMode}
              />
              <span class="setting-label">최적화 모드</span>
              <span class="setting-desc">저사양 기기용 최적화</span>
            </label>
            
            <label class="setting-item">
              <input
                type="checkbox"
                bind:checked={disableEffects}
              />
              <span class="setting-label">효과 비활성화</span>
              <span class="setting-desc">홀로그래픽 효과 완전 비활성화</span>
            </label>
          </div>
        </div>
      </section>
      
      <!-- 디바이스 정보 (브라우저에서만 표시) -->
      {#if browser}
        <section class="device-info">
          <h3 class="info-title">디바이스 성능 정보</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">고성능 디바이스:</span>
              <span class="info-value" class:positive={deviceCapabilities.isHighPerformance}>
                {deviceCapabilities.isHighPerformance ? '예' : '아니오'}
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">블렌드 모드 지원:</span>
              <span class="info-value" class:positive={deviceCapabilities.supportsBlendModes}>
                {deviceCapabilities.supportsBlendModes ? '예' : '아니오'}
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">백드롭 필터 지원:</span>
              <span class="info-value" class:positive={deviceCapabilities.supportsBackdropFilter}>
                {deviceCapabilities.supportsBackdropFilter ? '예' : '아니오'}
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">모바일 디바이스:</span>
              <span class="info-value" class:negative={deviceCapabilities.isMobile}>
                {deviceCapabilities.isMobile ? '예' : '아니오'}
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">디바이스 픽셀 비율:</span>
              <span class="info-value">
                {deviceCapabilities.devicePixelRatio}x
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">최대 텍스처 크기:</span>
              <span class="info-value">
                {deviceCapabilities.maxTextureSize}px
              </span>
            </div>
          </div>
        </section>
      {/if}
    </div>
  </main>
</div>

<style>
  /* how2code.md 스타일 데모 페이지 */
  .demo-page {
    min-height: 100vh;
    background-color: #333844;
    color: white;
    font-family: "Heebo", sans-serif;
    text-align: center;
    padding: 0 0 80px;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  /* 헤더 */
  .demo-header {
    padding: 60px 0 40px;
    text-align: center;
  }
  
  .demo-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .title-icon {
    font-size: 0.8em;
    animation: sparkle 2s ease-in-out infinite;
  }
  
  .demo-subtitle {
    font-size: 20px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
  
  /* 메인 데모 영역 */
  .demo-main {
    display: flex;
    flex-direction: column;
    gap: 60px;
  }
  
  /* 카드 데모 섹션 */
  .card-demo-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  
  .demo-card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    /* how2code.md 완벽 구현 - 카드 컨테이너 */
    perspective: 750px;
    isolation: isolate;
    transform: translate3d(0.1px, 0.1px, 0.1px);
  }
  
  .card-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .card-info-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    color: var(--apple-text-primary);
  }
  
  .card-info-subtitle {
    font-size: 18px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
  
  .card-info-meta {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .team-badge {
    background: var(--apple-accent-blue);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
  }
  
  .rarity-badge {
    color: #ffd700;
    font-size: 18px;
    font-weight: 600;
  }
  
  /* 컨트롤 패널 */
  .control-panel {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 20px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  
  .panel-header {
    text-align: center;
  }
  
  .panel-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
  }
  
  .panel-description {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
  
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .group-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
  }
  
  /* 타입 그리드 */
  .type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .type-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms var(--apple-easing-smooth);
  }
  
  .type-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .type-button.active {
    border-color: var(--apple-accent-blue);
    background: var(--apple-surface-tertiary);
  }
  
  .type-preview {
    width: 60px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    position: relative;
    overflow: hidden;
  }
  
  .type-preview::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.5) 50%, 
      transparent 70%);
    animation: shimmer 2s ease-in-out infinite;
  }
  
  .type-info {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .type-name {
    font-weight: 600;
    color: var(--apple-text-primary);
  }
  
  .type-desc {
    font-size: 12px;
    color: var(--apple-text-tertiary);
  }
  
  /* 팀 그리드 */
  .team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .team-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms var(--apple-easing-smooth);
    text-align: left;
  }
  
  .team-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .team-button.active {
    border-color: var(--apple-accent-blue);
    background: var(--apple-surface-tertiary);
  }
  
  .team-logo {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--apple-surface-tertiary);
    border-radius: 8px;
  }
  
  .team-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .team-name {
    font-weight: 600;
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  .team-desc {
    font-size: 12px;
    color: var(--apple-text-tertiary);
  }
  
  /* 설정 그리드 */
  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .setting-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--apple-surface-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: background 200ms var(--apple-easing-smooth);
  }
  
  .setting-item:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .setting-item input[type="checkbox"] {
    margin: 0;
    width: 18px;
    height: 18px;
    accent-color: var(--apple-accent-blue);
  }
  
  .setting-label {
    font-weight: 600;
    color: var(--apple-text-primary);
    display: block;
    margin-bottom: 4px;
  }
  
  .setting-desc {
    font-size: 14px;
    color: var(--apple-text-secondary);
    display: block;
  }
  
  /* 디바이스 정보 */
  .device-info {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 32px;
  }
  
  .info-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px;
    color: var(--apple-text-primary);
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--apple-surface-secondary);
    border-radius: 8px;
  }
  
  .info-label {
    font-weight: 500;
    color: var(--apple-text-secondary);
  }
  
  .info-value {
    font-weight: 600;
    color: var(--apple-text-primary);
  }
  
  .info-value.positive {
    color: var(--apple-accent-green);
  }
  
  .info-value.negative {
    color: var(--apple-accent-orange);
  }
  
  /* 애니메이션 */
  @keyframes sparkle {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 0.8;
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .card-demo-section {
      grid-template-columns: 1fr;
      gap: 40px;
      text-align: center;
    }
    
    .type-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .team-grid {
      grid-template-columns: 1fr;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .control-panel {
      padding: 24px;
    }
    
    .container {
      padding: 0 16px;
    }
  }
  
  @media (max-width: 480px) {
    .type-grid {
      grid-template-columns: 1fr;
    }
    
    .demo-title {
      font-size: 2rem;
    }
    
    .card-info-title {
      font-size: 24px;
    }
  }
</style>