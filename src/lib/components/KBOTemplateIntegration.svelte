<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GloryMomentTemplate, KBOTeam, EmotionIcon, FamousQuote, KBOCheerSound } from '../data/kboTemplates.js';
  import { KBO_TEAMS, CATEGORY_METADATA } from '../data/kboTemplates.js';
  import KBOStatsCard from './KBOStatsCard.svelte';
  import KBOAudioManager from './KBOAudioManager.svelte';
  import KBOStatsVisualizer from './KBOStatsVisualizer.svelte';
  
  // Props
  export let template: GloryMomentTemplate;
  export let selectedTeam: KBOTeam | null = null;
  export let selectedEmotion: EmotionIcon | null = null;
  export let selectedQuote: FamousQuote | null = null;
  export let selectedSound: KBOCheerSound | null = null;
  export let playerData = {
    name: '',
    number: '',
    position: 'hitter' as 'hitter' | 'pitcher',
    stats: {
      avg: 0.000,
      homeRuns: 0,
      rbi: 0,
      hits: 0,
      runs: 0,
      sb: 0,
      ops: 0.000,
      era: 0.00,
      wins: 0,
      losses: 0,
      saves: 0,
      strikeouts: 0,
      innings: 0.0,
      whip: 0.00
    }
  };
  export let showPreview = true;
  export let showControls = true;
  
  // 상태 관리
  let previewMode: 'card' | 'stats' | 'audio' = 'card';
  let isAnimating = false;
  let cardElement: HTMLElement;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    templateUpdated: GloryMomentTemplate;
    previewModeChanged: string;
    cardExported: { format: 'png' | 'svg' | 'pdf' };
  }>();
  
  // 템플릿 카테고리 정보
  $: categoryInfo = CATEGORY_METADATA[template.category];
  
  // 팀 컬러 적용
  $: teamColors = selectedTeam ? {
    primary: selectedTeam.colors.primary,
    secondary: selectedTeam.colors.secondary,
    accent: selectedTeam.colors.accent || selectedTeam.colors.primary
  } : {
    primary: '#007AFF',
    secondary: '#34C759',
    accent: '#007AFF'
  };
  
  // 홀로그래픽 효과 스타일
  $: holographicStyle = `
    background: ${template.style.background.value};
    border: ${template.style.border.width}px ${template.style.border.style} ${teamColors.primary};
    color: ${template.style.typography.accentColor};
    --team-primary: ${teamColors.primary};
    --team-secondary: ${teamColors.secondary};
    --team-accent: ${teamColors.accent};
  `;
  
  // 애니메이션 트리거
  function triggerAnimation() {
    isAnimating = true;
    setTimeout(() => {
      isAnimating = false;
    }, 1000);
  }
  
  // 미리보기 모드 변경
  function changePreviewMode(mode: typeof previewMode) {
    previewMode = mode;
    triggerAnimation();
    dispatch('previewModeChanged', mode);
  }
  
  // 카드 내보내기
  function exportCard(format: 'png' | 'svg' | 'pdf') {
    dispatch('cardExported', { format });
  }
  
  // 템플릿 요소 렌더링
  function renderTemplateElement(element: any) {
    const style = `
      position: absolute;
      left: ${element.position.x}%;
      top: ${element.position.y}%;
      width: ${element.position.width}%;
      height: ${element.position.height}%;
      font-size: ${element.style?.fontSize || 16}px;
      font-weight: ${element.style?.fontWeight || 'normal'};
      color: ${element.style?.color || teamColors.accent};
      text-align: ${element.style?.textAlign || 'left'};
      z-index: ${element.style?.zIndex || 1};
      opacity: ${element.style?.opacity || 1};
      transform: rotate(${element.style?.rotation || 0}deg);
    `;
    
    return { style, element };
  }
  
  // 실시간 홀로그래픽 효과
  function handleMouseMove(event: MouseEvent) {
    if (!cardElement) return;
    
    const rect = cardElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    cardElement.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      translateZ(20px)
    `;
  }
  
  function handleMouseLeave() {
    if (!cardElement) return;
    
    cardElement.style.transform = `
      perspective(1000px) 
      rotateX(0deg) 
      rotateY(0deg) 
      translateZ(0px)
    `;
  }
</script>

<div class="kbo-template-integration">
  <!-- 컨트롤 패널 -->
  {#if showControls}
    <div class="control-panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <span class="category-icon">{categoryInfo?.icon || '📝'}</span>
          {template.name}
        </h3>
        <div class="panel-badges">
          <span class="category-badge" style="background: {categoryInfo?.color}">
            {categoryInfo?.name}
          </span>
          {#if selectedTeam}
            <span class="team-badge" style="background: {teamColors.primary}">
              {selectedTeam.name}
            </span>
          {/if}
        </div>
      </div>
      
      <div class="preview-modes">
        <button
          class="mode-button"
          class:active={previewMode === 'card'}
          on:click={() => changePreviewMode('card')}
        >
          🎨 카드 미리보기
        </button>
        <button
          class="mode-button"
          class:active={previewMode === 'stats'}
          on:click={() => changePreviewMode('stats')}
        >
          📊 통계 시각화
        </button>
        <button
          class="mode-button"
          class:active={previewMode === 'audio'}
          on:click={() => changePreviewMode('audio')}
        >
          🎵 오디오 관리
        </button>
      </div>
      
      <div class="export-actions">
        <button class="export-button" on:click={() => exportCard('png')}>
          📸 PNG 저장
        </button>
        <button class="export-button" on:click={() => exportCard('svg')}>
          🎨 SVG 저장
        </button>
        <button class="export-button" on:click={() => exportCard('pdf')}>
          📄 PDF 저장
        </button>
      </div>
    </div>
  {/if}
  
  <!-- 미리보기 영역 -->
  {#if showPreview}
    <div class="preview-area" class:animating={isAnimating}>
      {#if previewMode === 'card'}
        <!-- 홀로그래픽 카드 미리보기 -->
        <div 
          class="holographic-card"
          bind:this={cardElement}
          style={holographicStyle}
          on:mousemove={handleMouseMove}
          on:mouseleave={handleMouseLeave}
          role="img"
          aria-label="홀로그래픽 카드 미리보기"
        >
          <!-- 홀로그래픽 오버레이 -->
          <div class="holo-overlay"></div>
          
          <!-- 템플릿 요소들 -->
          {#each template.layout.elements as element (element.id)}
            {@const rendered = renderTemplateElement(element)}
            <div class="template-element element-{element.type}" style={rendered.style}>
              {#if element.type === 'text'}
                <div class="text-content">
                  {element.content?.text || element.content?.placeholder || ''}
                </div>
              {:else if element.type === 'image'}
                <div class="image-placeholder">
                  <span class="placeholder-icon">🖼️</span>
                  <span class="placeholder-text">이미지 영역</span>
                </div>
              {:else if element.type === 'logo' && selectedTeam}
                <div class="team-logo">
                  <div class="logo-circle" style="background: {teamColors.primary}">
                    ⚾
                  </div>
                  <div class="logo-text">{selectedTeam.name}</div>
                </div>
              {:else if element.type === 'stats'}
                <div class="stats-placeholder">
                  <KBOStatsCard
                    playerName={playerData.name}
                    playerNumber={playerData.number}
                    position={playerData.position}
                    team={selectedTeam}
                    stats={playerData.stats}
                    cardStyle="modern"
                    showAnimation={false}
                  />
                </div>
              {/if}
            </div>
          {/each}
          
          <!-- 감정 오버레이 -->
          {#if selectedEmotion}
            <div class="emotion-overlay">
              <span class="emotion-icon" style="color: {selectedEmotion.color}">
                {selectedEmotion.icon}
              </span>
              <span class="emotion-text">{selectedEmotion.name}</span>
            </div>
          {/if}
          
          <!-- 명언 오버레이 -->
          {#if selectedQuote}
            <div class="quote-overlay">
              <div class="quote-text">"{selectedQuote.text}"</div>
              <div class="quote-author">- {selectedQuote.author}</div>
            </div>
          {/if}
          
          <!-- 홀로그래픽 효과 표시 -->
          {#if template.style.effects.holographic}
            <div class="holo-effects">
              <div class="holo-shine"></div>
              <div class="holo-sparkles">
                {#each Array(6) as _, i}
                  <div class="sparkle" style="animation-delay: {i * 0.2}s"></div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
      {:else if previewMode === 'stats'}
        <!-- 통계 시각화 -->
        <div class="stats-visualization">
          <KBOStatsVisualizer
            playerName={playerData.name}
            season="2024"
            stats={playerData.stats}
            position={playerData.position}
            teamColors={teamColors}
          />
        </div>
        
      {:else if previewMode === 'audio'}
        <!-- 오디오 관리 -->
        <div class="audio-management">
          <KBOAudioManager
            selectedTeam={selectedTeam?.id}
            autoPlay={false}
            showVisualizer={true}
            showPlaylist={true}
          />
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- 템플릿 정보 -->
  <div class="template-info">
    <div class="info-section">
      <h4 class="info-title">템플릿 정보</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">카테고리</span>
          <span class="info-value">{categoryInfo?.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">난이도</span>
          <span class="info-value">
            {#if template.metadata.difficulty === 'easy'}⭐{:else if template.metadata.difficulty === 'medium'}⭐⭐{:else}⭐⭐⭐{/if}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">인기도</span>
          <span class="info-value">{template.metadata.popularity}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">레이아웃</span>
          <span class="info-value">{template.layout.type}</span>
        </div>
      </div>
    </div>
    
    <div class="info-section">
      <h4 class="info-title">선택된 요소</h4>
      <div class="selected-elements">
        {#if selectedTeam}
          <div class="element-chip team-chip" style="background: {teamColors.primary}">
            ⚾ {selectedTeam.name}
          </div>
        {/if}
        {#if selectedEmotion}
          <div class="element-chip emotion-chip" style="background: {selectedEmotion.color}">
            {selectedEmotion.icon} {selectedEmotion.name}
          </div>
        {/if}
        {#if selectedQuote}
          <div class="element-chip quote-chip">
            💬 명언 추가됨
          </div>
        {/if}
        {#if selectedSound}
          <div class="element-chip sound-chip">
            🎵 {selectedSound.name}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .kbo-template-integration {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* 컨트롤 패널 */
  .control-panel {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 20px;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .panel-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .category-icon {
    font-size: 18px;
  }
  
  .panel-badges {
    display: flex;
    gap: 8px;
  }
  
  .category-badge,
  .team-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  .preview-modes {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    background: var(--apple-surface-secondary);
    border-radius: 12px;
    padding: 4px;
  }
  
  .mode-button {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: 8px;
    color: var(--apple-text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .mode-button:hover {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
  }
  
  .mode-button.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .export-actions {
    display: flex;
    gap: 8px;
  }
  
  .export-button {
    padding: 8px 16px;
    background: var(--apple-surface-tertiary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    color: var(--apple-text-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .export-button:hover {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
    transform: translateY(-1px);
  }
  
  /* 미리보기 영역 */
  .preview-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    background: var(--apple-surface-secondary);
    border-radius: 16px;
    padding: 40px;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .preview-area.animating {
    transform: scale(0.98);
    opacity: 0.8;
  }
  
  /* 홀로그래픽 카드 */
  .holographic-card {
    position: relative;
    width: 300px;
    height: 420px;
    border-radius: 20px;
    overflow: hidden;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
    cursor: pointer;
    transform-style: preserve-3d;
  }
  
  .holo-overlay {
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
    pointer-events: none;
    animation: holoShimmer 3s ease-in-out infinite;
  }
  
  @keyframes holoShimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }
  
  .template-element {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .text-content {
    font-family: var(--apple-font-primary);
    line-height: 1.4;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  .image-placeholder {
    background: rgba(255, 255, 255, 0.1);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;
  }
  
  .placeholder-icon {
    font-size: 24px;
    opacity: 0.7;
  }
  
  .placeholder-text {
    font-size: 12px;
    opacity: 0.7;
  }
  
  .team-logo {
    text-align: center;
  }
  
  .logo-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    margin: 0 auto 8px;
  }
  
  .logo-text {
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  .stats-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 오버레이 */
  .emotion-overlay {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.7);
    padding: 8px 12px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }
  
  .emotion-icon {
    font-size: 20px;
  }
  
  .emotion-text {
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  .quote-overlay {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    padding: 16px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }
  
  .quote-text {
    font-size: 14px;
    font-style: italic;
    color: white;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  
  .quote-author {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    text-align: right;
  }
  
  /* 홀로그래픽 효과 */
  .holo-effects {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .holo-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: holoRotate 4s linear infinite;
  }
  
  @keyframes holoRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .holo-sparkles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    animation: sparkleFloat 2s ease-in-out infinite;
  }
  
  .sparkle:nth-child(1) { top: 20%; left: 20%; }
  .sparkle:nth-child(2) { top: 40%; right: 30%; }
  .sparkle:nth-child(3) { bottom: 30%; left: 40%; }
  .sparkle:nth-child(4) { top: 60%; left: 70%; }
  .sparkle:nth-child(5) { bottom: 20%; right: 20%; }
  .sparkle:nth-child(6) { top: 80%; left: 60%; }
  
  @keyframes sparkleFloat {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
  }
  
  /* 통계 및 오디오 영역 */
  .stats-visualization,
  .audio-management {
    width: 100%;
    max-width: 800px;
  }
  
  /* 템플릿 정보 */
  .template-info {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .info-label {
    font-size: 12px;
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  .info-value {
    font-size: 14px;
    color: var(--apple-text-primary);
    font-weight: 600;
  }
  
  .selected-elements {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .element-chip {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .team-chip {
    background: var(--apple-accent-blue);
  }
  
  .emotion-chip {
    background: var(--apple-accent-green);
  }
  
  .quote-chip {
    background: var(--apple-accent-purple);
  }
  
  .sound-chip {
    background: var(--apple-accent-orange);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .template-info {
      grid-template-columns: 1fr;
    }
    
    .preview-modes {
      flex-direction: column;
    }
    
    .export-actions {
      flex-wrap: wrap;
    }
  }
  
  @media (max-width: 768px) {
    .kbo-template-integration {
      gap: 16px;
    }
    
    .control-panel,
    .template-info {
      padding: 16px;
    }
    
    .panel-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .holographic-card {
      width: 250px;
      height: 350px;
    }
    
    .preview-area {
      padding: 20px;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>