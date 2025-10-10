<script lang="ts">
  import { onMount } from 'svelte';
  import type { GloryMomentTemplate, KBOTeam, EmotionIcon, FamousQuote, KBOCheerSound } from '$lib/data/kboTemplates.js';
  import { 
    GLORY_MOMENT_TEMPLATES, 
    KBO_TEAMS, 
    EMOTION_ICONS, 
    FAMOUS_QUOTES, 
    KBO_CHEER_SOUNDS 
  } from '$lib/data/kboTemplates.js';
  import KBOTemplateIntegration from '$lib/components/KBOTemplateIntegration.svelte';
  import TemplateSelector from '$lib/components/TemplateSelector.svelte';
  import EmotionOverlay from '$lib/components/EmotionOverlay.svelte';
  import SoundLibrary from '$lib/components/SoundLibrary.svelte';
  import KBOStatsCard from '$lib/components/KBOStatsCard.svelte';
  
  // 상태 관리
  let selectedTemplate: GloryMomentTemplate = GLORY_MOMENT_TEMPLATES[0];
  let selectedTeam: KBOTeam = KBO_TEAMS.lg;
  let selectedEmotion: EmotionIcon | null = EMOTION_ICONS[0];
  let selectedQuote: FamousQuote | null = FAMOUS_QUOTES[0];
  let selectedSound: KBOCheerSound | null = KBO_CHEER_SOUNDS[0];
  let currentDemo: 'integration' | 'templates' | 'emotions' | 'sounds' | 'stats' = 'integration';
  
  // 샘플 선수 데이터
  let playerData = {
    name: '김현수',
    number: '25',
    position: 'hitter' as 'hitter' | 'pitcher',
    stats: {
      avg: 0.325,
      homeRuns: 28,
      rbi: 95,
      hits: 156,
      runs: 82,
      sb: 12,
      ops: 0.945,
      era: 0.00,
      wins: 0,
      losses: 0,
      saves: 0,
      strikeouts: 0,
      innings: 0.0,
      whip: 0.00
    }
  };
  
  // 투수 데이터 샘플
  let pitcherData = {
    name: '양현종',
    number: '54',
    position: 'pitcher' as 'hitter' | 'pitcher',
    stats: {
      avg: 0.000,
      homeRuns: 0,
      rbi: 0,
      hits: 0,
      runs: 0,
      sb: 0,
      ops: 0.000,
      era: 2.45,
      wins: 17,
      losses: 6,
      saves: 0,
      strikeouts: 189,
      innings: 195.2,
      whip: 1.12
    }
  };
  
  // 현재 선수 데이터
  $: currentPlayerData = playerData.position === 'pitcher' ? pitcherData : playerData;
  
  // 데모 변경
  function changeDemo(demo: typeof currentDemo) {
    currentDemo = demo;
  }
  
  // 랜덤 데이터 생성
  function generateRandomData() {
    // 랜덤 템플릿
    selectedTemplate = GLORY_MOMENT_TEMPLATES[Math.floor(Math.random() * GLORY_MOMENT_TEMPLATES.length)];
    
    // 랜덤 팀
    const teams = Object.values(KBO_TEAMS);
    selectedTeam = teams[Math.floor(Math.random() * teams.length)];
    
    // 랜덤 감정
    selectedEmotion = EMOTION_ICONS[Math.floor(Math.random() * EMOTION_ICONS.length)];
    
    // 랜덤 명언
    selectedQuote = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
    
    // 랜덤 사운드
    const teamSounds = KBO_CHEER_SOUNDS.filter(sound => 
      sound.team === selectedTeam.id || sound.team === 'all'
    );
    selectedSound = teamSounds[Math.floor(Math.random() * teamSounds.length)];
    
    // 랜덤 스탯
    if (Math.random() > 0.5) {
      playerData.position = 'hitter';
      playerData.stats = {
        ...playerData.stats,
        avg: Math.random() * 0.2 + 0.25,
        homeRuns: Math.floor(Math.random() * 40),
        rbi: Math.floor(Math.random() * 100 + 50),
        ops: Math.random() * 0.5 + 0.7
      };
    } else {
      playerData.position = 'pitcher';
      pitcherData.stats = {
        ...pitcherData.stats,
        era: Math.random() * 3 + 2,
        wins: Math.floor(Math.random() * 20),
        strikeouts: Math.floor(Math.random() * 150 + 50),
        whip: Math.random() * 0.5 + 1
      };
    }
  }
  
  // 이벤트 핸들러
  function handleTemplateSelected(event: CustomEvent<GloryMomentTemplate>) {
    selectedTemplate = event.detail;
  }
  
  function handleEmotionSelected(event: CustomEvent<EmotionIcon>) {
    selectedEmotion = event.detail;
  }
  
  function handleQuoteSelected(event: CustomEvent<FamousQuote>) {
    selectedQuote = event.detail;
  }
  
  function handleSoundSelected(event: CustomEvent<KBOCheerSound>) {
    selectedSound = event.detail;
  }
</script>

<svelte:head>
  <title>홀로그래픽 카드 데모 - 영광의 순간 템플릿</title>
  <meta name="description" content="특별한 순간을 담은 홀로그래픽 카드 템플릿 시스템을 체험해보세요." />
</svelte:head>

<div class="kbo-demo-page">
  <!-- 헤더 -->
  <header class="demo-header">
    <div class="header-content">
      <h1 class="demo-title">
        <span class="title-icon">⚾</span>
        홀로그래픽 카드 데모
      </h1>
      <p class="demo-subtitle">
        영광의 순간 템플릿 시스템으로 특별한 야구 카드를 만들어보세요
      </p>
      
      <div class="demo-actions">
        <button class="action-button primary" on:click={generateRandomData}>
          🎲 랜덤 데이터 생성
        </button>
        <button class="action-button secondary" on:click={() => changeDemo('integration')}>
          🎨 통합 미리보기
        </button>
      </div>
    </div>
  </header>
  
  <!-- 네비게이션 -->
  <nav class="demo-navigation">
    <div class="nav-content">
      <button 
        class="nav-button"
        class:active={currentDemo === 'integration'}
        on:click={() => changeDemo('integration')}
      >
        <span class="nav-icon">🎨</span>
        <span class="nav-label">통합 시스템</span>
      </button>
      
      <button 
        class="nav-button"
        class:active={currentDemo === 'templates'}
        on:click={() => changeDemo('templates')}
      >
        <span class="nav-icon">📋</span>
        <span class="nav-label">템플릿 선택</span>
      </button>
      
      <button 
        class="nav-button"
        class:active={currentDemo === 'emotions'}
        on:click={() => changeDemo('emotions')}
      >
        <span class="nav-icon">😊</span>
        <span class="nav-label">감정 & 명언</span>
      </button>
      
      <button 
        class="nav-button"
        class:active={currentDemo === 'sounds'}
        on:click={() => changeDemo('sounds')}
      >
        <span class="nav-icon">🎵</span>
        <span class="nav-label">사운드</span>
      </button>
      
      <button 
        class="nav-button"
        class:active={currentDemo === 'stats'}
        on:click={() => changeDemo('stats')}
      >
        <span class="nav-icon">📊</span>
        <span class="nav-label">통계 카드</span>
      </button>
    </div>
  </nav>
  
  <!-- 메인 콘텐츠 -->
  <main class="demo-content">
    {#if currentDemo === 'integration'}
      <!-- 통합 시스템 데모 -->
      <section class="demo-section">
        <div class="section-header">
          <h2 class="section-title">KBO 템플릿 통합 시스템</h2>
          <p class="section-description">
            모든 기능이 통합된 홀로그래픽 카드 제작 시스템을 체험해보세요
          </p>
        </div>
        
        <KBOTemplateIntegration
          template={selectedTemplate}
          {selectedTeam}
          {selectedEmotion}
          {selectedQuote}
          {selectedSound}
          {playerData}
          showPreview={true}
          showControls={true}
        />
      </section>
      
    {:else if currentDemo === 'templates'}
      <!-- 템플릿 선택 데모 -->
      <section class="demo-section">
        <div class="section-header">
          <h2 class="section-title">영광의 순간 템플릿</h2>
          <p class="section-description">
            KBO 야구의 특별한 순간들을 담는 다양한 템플릿을 선택하세요
          </p>
        </div>
        
        <TemplateSelector
          bind:selectedTemplate
          on:templateSelected={handleTemplateSelected}
          showSearch={true}
          showCategories={true}
          maxTemplates={20}
        />
        
        {#if selectedTemplate}
          <div class="selected-info">
            <h3>선택된 템플릿: {selectedTemplate.name}</h3>
            <p>{selectedTemplate.description}</p>
          </div>
        {/if}
      </section>
      
    {:else if currentDemo === 'emotions'}
      <!-- 감정 & 명언 데모 -->
      <section class="demo-section">
        <div class="section-header">
          <h2 class="section-title">감정 표현 & 명언 시스템</h2>
          <p class="section-description">
            카드에 감정과 의미를 더하는 오버레이 시스템
          </p>
        </div>
        
        <EmotionOverlay
          bind:selectedEmotion
          bind:selectedQuote
          teamFilter={selectedTeam?.id}
          showEmotions={true}
          showQuotes={true}
          on:emotionSelected={handleEmotionSelected}
          on:quoteSelected={handleQuoteSelected}
        />
      </section>
      
    {:else if currentDemo === 'sounds'}
      <!-- 사운드 라이브러리 데모 -->
      <section class="demo-section">
        <div class="section-header">
          <h2 class="section-title">KBO 사운드 라이브러리</h2>
          <p class="section-description">
            구단별 응원가와 야구 효과음으로 카드에 생동감을 더하세요
          </p>
        </div>
        
        <SoundLibrary
          bind:selectedSound
          selectedTeam={selectedTeam?.id}
          showTeamFilter={true}
          on:soundSelected={handleSoundSelected}
        />
      </section>
      
    {:else if currentDemo === 'stats'}
      <!-- 통계 카드 데모 -->
      <section class="demo-section">
        <div class="section-header">
          <h2 class="section-title">KBO 통계 카드</h2>
          <p class="section-description">
            선수의 성적을 아름답게 시각화하는 통계 카드 시스템
          </p>
        </div>
        
        <div class="stats-demo-grid">
          <!-- 타자 카드 -->
          <div class="stats-card-container">
            <h4>타자 통계 카드</h4>
            <KBOStatsCard
              playerName={playerData.name}
              playerNumber={playerData.number}
              position="hitter"
              team={selectedTeam}
              season="2024"
              stats={playerData.stats}
              cardStyle="modern"
              showAnimation={true}
            />
          </div>
          
          <!-- 투수 카드 -->
          <div class="stats-card-container">
            <h4>투수 통계 카드</h4>
            <KBOStatsCard
              playerName={pitcherData.name}
              playerNumber={pitcherData.number}
              position="pitcher"
              team={selectedTeam}
              season="2024"
              stats={pitcherData.stats}
              cardStyle="modern"
              showAnimation={true}
            />
          </div>
          
          <!-- 빈티지 스타일 -->
          <div class="stats-card-container">
            <h4>빈티지 스타일</h4>
            <KBOStatsCard
              playerName={currentPlayerData.name}
              playerNumber={currentPlayerData.number}
              position={currentPlayerData.position}
              team={selectedTeam}
              season="2024"
              stats={currentPlayerData.stats}
              cardStyle="vintage"
              showAnimation={true}
            />
          </div>
        </div>
      </section>
    {/if}
  </main>
  
  <!-- 현재 선택 상태 -->
  <aside class="selection-status">
    <h3 class="status-title">현재 선택 상태</h3>
    <div class="status-grid">
      <div class="status-item">
        <span class="status-label">템플릿</span>
        <span class="status-value">{selectedTemplate.name}</span>
      </div>
      <div class="status-item">
        <span class="status-label">구단</span>
        <span class="status-value" style="color: {selectedTeam.colors.primary}">
          {selectedTeam.name}
        </span>
      </div>
      {#if selectedEmotion}
        <div class="status-item">
          <span class="status-label">감정</span>
          <span class="status-value">
            {selectedEmotion.icon} {selectedEmotion.name}
          </span>
        </div>
      {/if}
      {#if selectedQuote}
        <div class="status-item">
          <span class="status-label">명언</span>
          <span class="status-value">"{selectedQuote.text.slice(0, 30)}..."</span>
        </div>
      {/if}
      {#if selectedSound}
        <div class="status-item">
          <span class="status-label">사운드</span>
          <span class="status-value">{selectedSound.name}</span>
        </div>
      {/if}
    </div>
  </aside>
</div>

<style>
  .kbo-demo-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  /* 헤더 */
  .demo-header {
    padding: 40px 20px;
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
  }
  
  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .demo-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .title-icon {
    font-size: 0.8em;
  }
  
  .demo-subtitle {
    font-size: 20px;
    margin: 0 0 32px;
    opacity: 0.9;
    line-height: 1.5;
  }
  
  .demo-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
  
  .action-button {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .action-button.primary {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .action-button.secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  /* 네비게이션 */
  .demo-navigation {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 20px;
  }
  
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 0;
  }
  
  .nav-button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 16px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    border-bottom: 3px solid transparent;
  }
  
  .nav-button:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .nav-button.active {
    color: white;
    border-bottom-color: var(--apple-accent-blue);
    background: rgba(255, 255, 255, 0.1);
  }
  
  .nav-icon {
    font-size: 24px;
  }
  
  .nav-label {
    font-size: 14px;
    font-weight: 500;
  }
  
  /* 메인 콘텐츠 */
  .demo-content {
    padding: 40px 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .demo-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 40px;
    color: var(--apple-text-primary);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .section-title {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
  }
  
  .section-description {
    font-size: 18px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
  
  .selected-info {
    margin-top: 32px;
    padding: 20px;
    background: var(--apple-surface-secondary);
    border-radius: 12px;
    text-align: center;
  }
  
  .selected-info h3 {
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .selected-info p {
    margin: 0;
    color: var(--apple-text-secondary);
  }
  
  /* 통계 데모 그리드 */
  .stats-demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    justify-items: center;
  }
  
  .stats-card-container {
    text-align: center;
  }
  
  .stats-card-container h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px;
    color: var(--apple-text-primary);
  }
  
  /* 선택 상태 */
  .selection-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 20px;
    min-width: 280px;
    max-width: 400px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .status-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px;
    color: white;
  }
  
  .status-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  
  .status-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
  
  .status-value {
    font-size: 12px;
    color: white;
    font-weight: 600;
    text-align: right;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .demo-content {
      padding: 24px 16px;
    }
    
    .demo-section {
      padding: 24px;
    }
    
    .selection-status {
      position: static;
      margin: 20px;
      width: auto;
    }
  }
  
  @media (max-width: 768px) {
    .demo-title {
      font-size: 36px;
    }
    
    .demo-subtitle {
      font-size: 16px;
    }
    
    .demo-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .nav-content {
      flex-wrap: wrap;
    }
    
    .nav-button {
      min-width: 120px;
    }
    
    .section-title {
      font-size: 24px;
    }
    
    .stats-demo-grid {
      grid-template-columns: 1fr;
    }
  }
</style>