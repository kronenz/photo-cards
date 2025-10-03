<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { 
    GloryMomentTemplate, 
    KBOTeam, 
    EmotionIcon, 
    FamousQuote, 
    KBOCheerSound,
    GloryMomentCategory 
  } from '../data/kboTemplates.js';
  import { 
    KBO_TEAMS, 
    GLORY_MOMENT_TEMPLATES, 
    EMOTION_ICONS, 
    FAMOUS_QUOTES, 
    KBO_CHEER_SOUNDS,
    CATEGORY_METADATA,
    getTemplatesByCategory,
    getRecommendedTemplates
  } from '../data/kboTemplates.js';
  import KBOTemplateIntegration from './KBOTemplateIntegration.svelte';
  import SoundLibrary from './SoundLibrary.svelte';
  import EmotionOverlay from './EmotionOverlay.svelte';
  import KBOStatsVisualizer from './KBOStatsVisualizer.svelte';

  // Props
  export let selectedTemplate: GloryMomentTemplate | null = null;
  export let selectedTeam: KBOTeam | null = null;
  export let playerData = {
    name: '선수명',
    number: '00',
    position: 'hitter' as 'hitter' | 'pitcher',
    stats: {
      avg: 0.285,
      homeRuns: 25,
      rbi: 78,
      hits: 142,
      runs: 89,
      sb: 15,
      ops: 0.845,
      era: 3.45,
      wins: 12,
      losses: 8,
      saves: 0,
      strikeouts: 156,
      innings: 180.1,
      whip: 1.25
    }
  };

  // 상태 관리
  let currentStep: 'category' | 'template' | 'team' | 'customize' | 'preview' = 'category';
  let selectedCategory: GloryMomentCategory | null = null;
  let selectedEmotion: EmotionIcon | null = null;
  let selectedQuote: FamousQuote | null = null;
  let selectedSound: KBOCheerSound | null = null;
  let customStory = {
    title: '',
    description: '',
    context: '',
    moment: ''
  };

  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    cardCreated: {
      template: GloryMomentTemplate;
      team: KBOTeam;
      emotion?: EmotionIcon;
      quote?: FamousQuote;
      sound?: KBOCheerSound;
      story: typeof customStory;
      playerData: typeof playerData;
    };
    stepChanged: string;
  }>();

  // 카테고리별 템플릿 목록
  $: categoryTemplates = selectedCategory ? getTemplatesByCategory(selectedCategory) : [];
  $: recommendedTemplates = getRecommendedTemplates(selectedCategory, 6);

  // 단계 진행
  function nextStep() {
    switch (currentStep) {
      case 'category':
        if (selectedCategory) currentStep = 'template';
        break;
      case 'template':
        if (selectedTemplate) currentStep = 'team';
        break;
      case 'team':
        if (selectedTeam) currentStep = 'customize';
        break;
      case 'customize':
        currentStep = 'preview';
        break;
    }
    dispatch('stepChanged', currentStep);
  }

  function prevStep() {
    switch (currentStep) {
      case 'template':
        currentStep = 'category';
        break;
      case 'team':
        currentStep = 'template';
        break;
      case 'customize':
        currentStep = 'team';
        break;
      case 'preview':
        currentStep = 'customize';
        break;
    }
    dispatch('stepChanged', currentStep);
  }

  // 카테고리 선택
  function selectCategory(category: GloryMomentCategory) {
    selectedCategory = category;
    selectedTemplate = null; // 카테고리 변경 시 템플릿 초기화
  }

  // 템플릿 선택
  function selectTemplate(template: GloryMomentTemplate) {
    selectedTemplate = template;
  }

  // 팀 선택
  function selectTeam(team: KBOTeam) {
    selectedTeam = team;
  }

  // 카드 생성 완료
  function createCard() {
    if (!selectedTemplate || !selectedTeam) return;

    const cardData = {
      template: selectedTemplate,
      team: selectedTeam,
      emotion: selectedEmotion,
      quote: selectedQuote,
      sound: selectedSound,
      story: customStory,
      playerData
    };

    dispatch('cardCreated', cardData);
  }

  // 진행률 계산
  $: progress = (() => {
    switch (currentStep) {
      case 'category': return 20;
      case 'template': return 40;
      case 'team': return 60;
      case 'customize': return 80;
      case 'preview': return 100;
      default: return 0;
    }
  })();

  // 완료 가능 여부
  $: canComplete = selectedTemplate && selectedTeam && (
    customStory.title.trim() || 
    selectedEmotion || 
    selectedQuote || 
    selectedSound
  );
</script>

<div class="kbo-glory-creator">
  <!-- 진행률 표시 -->
  <div class="progress-header">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
    <div class="step-indicator">
      <span class="step-text">
        {#if currentStep === 'category'}
          1단계: 카테고리 선택
        {:else if currentStep === 'template'}
          2단계: 템플릿 선택
        {:else if currentStep === 'team'}
          3단계: 구단 선택
        {:else if currentStep === 'customize'}
          4단계: 스토리 커스터마이징
        {:else if currentStep === 'preview'}
          5단계: 미리보기 및 완성
        {/if}
      </span>
      <span class="progress-text">{progress}% 완료</span>
    </div>
  </div>

  <!-- 단계별 콘텐츠 -->
  <div class="creator-content">
    {#if currentStep === 'category'}
      <!-- 카테고리 선택 -->
      <div class="category-selection">
        <h2 class="section-title">
          <span class="title-icon">🏆</span>
          어떤 영광의 순간을 담고 싶으신가요?
        </h2>
        <p class="section-description">
          KBO 야구의 특별한 순간들 중 하나를 선택해주세요
        </p>

        <div class="category-grid">
          {#each Object.entries(CATEGORY_METADATA) as [categoryId, categoryInfo]}
            <button
              class="category-card"
              class:selected={selectedCategory === categoryId}
              on:click={() => selectCategory(categoryId)}
            >
              <div class="category-icon" style="color: {categoryInfo.color}">
                {categoryInfo.icon}
              </div>
              <div class="category-info">
                <h3 class="category-name">{categoryInfo.name}</h3>
                <p class="category-description">{categoryInfo.description}</p>
              </div>
              <div class="category-count">
                {getTemplatesByCategory(categoryId).length}개 템플릿
              </div>
            </button>
          {/each}
        </div>
      </div>

    {:else if currentStep === 'template'}
      <!-- 템플릿 선택 -->
      <div class="template-selection">
        <h2 class="section-title">
          <span class="title-icon">{CATEGORY_METADATA[selectedCategory]?.icon}</span>
          {CATEGORY_METADATA[selectedCategory]?.name} 템플릿 선택
        </h2>
        <p class="section-description">
          {CATEGORY_METADATA[selectedCategory]?.description}
        </p>

        {#if recommendedTemplates.length > 0}
          <div class="recommended-section">
            <h3 class="subsection-title">추천 템플릿</h3>
            <div class="template-grid">
              {#each recommendedTemplates as template (template.id)}
                <button
                  class="template-card"
                  class:selected={selectedTemplate?.id === template.id}
                  on:click={() => selectTemplate(template)}
                >
                  <div class="template-preview">
                    <div 
                      class="template-background"
                      style="background: {template.style.background.value}"
                    ></div>
                    <div class="template-overlay">
                      <div class="template-name">{template.name}</div>
                      <div class="template-difficulty">
                        {#if template.metadata.difficulty === 'easy'}
                          ⭐ 쉬움
                        {:else if template.metadata.difficulty === 'medium'}
                          ⭐⭐ 보통
                        {:else}
                          ⭐⭐⭐ 어려움
                        {/if}
                      </div>
                    </div>
                  </div>
                  <div class="template-info">
                    <div class="template-description">{template.description}</div>
                    <div class="template-popularity">인기도 {template.metadata.popularity}%</div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        {#if categoryTemplates.length > 0}
          <div class="all-templates-section">
            <h3 class="subsection-title">전체 템플릿</h3>
            <div class="template-list">
              {#each categoryTemplates as template (template.id)}
                <button
                  class="template-item"
                  class:selected={selectedTemplate?.id === template.id}
                  on:click={() => selectTemplate(template)}
                >
                  <div class="template-thumbnail">
                    <div 
                      class="thumbnail-bg"
                      style="background: {template.style.background.value}"
                    ></div>
                  </div>
                  <div class="template-details">
                    <h4 class="template-title">{template.name}</h4>
                    <p class="template-desc">{template.description}</p>
                    <div class="template-meta">
                      <span class="meta-item">
                        {template.metadata.difficulty === 'easy' ? '⭐' : 
                         template.metadata.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                      </span>
                      <span class="meta-item">{template.metadata.popularity}% 인기</span>
                      <span class="meta-item">{template.layout.type}</span>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    {:else if currentStep === 'team'}
      <!-- 구단 선택 -->
      <div class="team-selection">
        <h2 class="section-title">
          <span class="title-icon">⚾</span>
          응원하는 구단을 선택해주세요
        </h2>
        <p class="section-description">
          선택한 구단의 컬러와 테마가 카드에 적용됩니다
        </p>

        <div class="team-grid">
          {#each Object.values(KBO_TEAMS) as team (team.id)}
            <button
              class="team-card"
              class:selected={selectedTeam?.id === team.id}
              style="--team-primary: {team.colors.primary}; --team-secondary: {team.colors.secondary}"
              on:click={() => selectTeam(team)}
            >
              <div class="team-logo">
                <div class="logo-circle">⚾</div>
              </div>
              <div class="team-info">
                <h3 class="team-name">{team.name}</h3>
                <p class="team-english">{team.englishName}</p>
                <div class="team-details">
                  <span class="team-city">{team.city}</span>
                  <span class="team-stadium">{team.stadium}</span>
                </div>
                <div class="team-achievements">
                  <span class="mascot">마스코트: {team.mascot}</span>
                  {#if team.championships.length > 0}
                    <span class="championships">우승 {team.championships.length}회</span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

    {:else if currentStep === 'customize'}
      <!-- 커스터마이징 -->
      <div class="customize-section">
        <h2 class="section-title">
          <span class="title-icon">✨</span>
          스토리와 감정을 추가해주세요
        </h2>
        <p class="section-description">
          카드에 담을 스토리, 감정, 명언, 사운드를 선택하거나 직접 입력하세요
        </p>

        <div class="customize-panels">
          <!-- 스토리 입력 -->
          <div class="customize-panel">
            <h3 class="panel-title">
              <span class="panel-icon">📝</span>
              스토리 작성
            </h3>
            <div class="story-form">
              <div class="form-group">
                <label for="story-title">제목</label>
                <input
                  id="story-title"
                  type="text"
                  bind:value={customStory.title}
                  placeholder="예: 2023년 한국시리즈 우승의 순간"
                  maxlength="50"
                />
              </div>
              <div class="form-group">
                <label for="story-description">설명</label>
                <textarea
                  id="story-description"
                  bind:value={customStory.description}
                  placeholder="이 순간에 대한 설명을 입력하세요..."
                  rows="3"
                  maxlength="200"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="story-context">배경 상황</label>
                <input
                  id="story-context"
                  type="text"
                  bind:value={customStory.context}
                  placeholder="예: 9회말 2아웃 만루 상황"
                  maxlength="100"
                />
              </div>
              <div class="form-group">
                <label for="story-moment">결정적 순간</label>
                <input
                  id="story-moment"
                  type="text"
                  bind:value={customStory.moment}
                  placeholder="예: 끝내기 만루홈런으로 우승 확정"
                  maxlength="100"
                />
              </div>
            </div>
          </div>

          <!-- 감정 및 명언 선택 -->
          <div class="customize-panel">
            <EmotionOverlay
              bind:selectedEmotion
              bind:selectedQuote
              teamFilter={selectedTeam?.id}
            />
          </div>

          <!-- 사운드 선택 -->
          <div class="customize-panel">
            <SoundLibrary
              bind:selectedSound
              selectedTeam={selectedTeam?.id}
            />
          </div>

          <!-- 선수 데이터 입력 -->
          <div class="customize-panel">
            <h3 class="panel-title">
              <span class="panel-icon">👤</span>
              선수 정보
            </h3>
            <div class="player-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="player-name">선수명</label>
                  <input
                    id="player-name"
                    type="text"
                    bind:value={playerData.name}
                    placeholder="선수명"
                  />
                </div>
                <div class="form-group">
                  <label for="player-number">등번호</label>
                  <input
                    id="player-number"
                    type="text"
                    bind:value={playerData.number}
                    placeholder="00"
                    maxlength="2"
                  />
                </div>
                <div class="form-group">
                  <label for="player-position">포지션</label>
                  <select id="player-position" bind:value={playerData.position}>
                    <option value="hitter">타자</option>
                    <option value="pitcher">투수</option>
                  </select>
                </div>
              </div>

              {#if playerData.position === 'hitter'}
                <div class="stats-grid">
                  <div class="stat-group">
                    <label>타율</label>
                    <input type="number" bind:value={playerData.stats.avg} step="0.001" min="0" max="1" />
                  </div>
                  <div class="stat-group">
                    <label>홈런</label>
                    <input type="number" bind:value={playerData.stats.homeRuns} min="0" />
                  </div>
                  <div class="stat-group">
                    <label>타점</label>
                    <input type="number" bind:value={playerData.stats.rbi} min="0" />
                  </div>
                  <div class="stat-group">
                    <label>안타</label>
                    <input type="number" bind:value={playerData.stats.hits} min="0" />
                  </div>
                </div>
              {:else}
                <div class="stats-grid">
                  <div class="stat-group">
                    <label>평균자책점</label>
                    <input type="number" bind:value={playerData.stats.era} step="0.01" min="0" />
                  </div>
                  <div class="stat-group">
                    <label>승</label>
                    <input type="number" bind:value={playerData.stats.wins} min="0" />
                  </div>
                  <div class="stat-group">
                    <label>패</label>
                    <input type="number" bind:value={playerData.stats.losses} min="0" />
                  </div>
                  <div class="stat-group">
                    <label>삼진</label>
                    <input type="number" bind:value={playerData.stats.strikeouts} min="0" />
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

    {:else if currentStep === 'preview'}
      <!-- 미리보기 -->
      <div class="preview-section">
        <h2 class="section-title">
          <span class="title-icon">👀</span>
          미리보기 및 최종 확인
        </h2>
        <p class="section-description">
          완성된 카드를 확인하고 필요시 수정하세요
        </p>

        {#if selectedTemplate && selectedTeam}
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
        {/if}

        <!-- 선택된 요소 요약 -->
        <div class="selection-summary">
          <h3 class="summary-title">선택된 요소</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">카테고리</span>
              <span class="summary-value">
                {CATEGORY_METADATA[selectedCategory]?.icon} {CATEGORY_METADATA[selectedCategory]?.name}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">템플릿</span>
              <span class="summary-value">{selectedTemplate?.name}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">구단</span>
              <span class="summary-value">⚾ {selectedTeam?.name}</span>
            </div>
            {#if customStory.title}
              <div class="summary-item">
                <span class="summary-label">스토리</span>
                <span class="summary-value">📝 {customStory.title}</span>
              </div>
            {/if}
            {#if selectedEmotion}
              <div class="summary-item">
                <span class="summary-label">감정</span>
                <span class="summary-value">{selectedEmotion.icon} {selectedEmotion.name}</span>
              </div>
            {/if}
            {#if selectedQuote}
              <div class="summary-item">
                <span class="summary-label">명언</span>
                <span class="summary-value">💬 {selectedQuote.author}</span>
              </div>
            {/if}
            {#if selectedSound}
              <div class="summary-item">
                <span class="summary-label">사운드</span>
                <span class="summary-value">🎵 {selectedSound.name}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- 네비게이션 버튼 -->
  <div class="navigation-buttons">
    {#if currentStep !== 'category'}
      <button class="nav-button secondary" on:click={prevStep}>
        ← 이전 단계
      </button>
    {/if}

    <div class="nav-spacer"></div>

    {#if currentStep === 'preview'}
      <button 
        class="nav-button primary"
        disabled={!canComplete}
        on:click={createCard}
      >
        🎨 카드 생성 완료
      </button>
    {:else}
      <button 
        class="nav-button primary"
        disabled={
          (currentStep === 'category' && !selectedCategory) ||
          (currentStep === 'template' && !selectedTemplate) ||
          (currentStep === 'team' && !selectedTeam)
        }
        on:click={nextStep}
      >
        다음 단계 →
      </button>
    {/if}
  </div>
</div>

<style>
  .kbo-glory-creator {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: var(--apple-surface-primary);
    border-radius: 20px;
    min-height: 80vh;
  }

  /* 진행률 헤더 */
  .progress-header {
    margin-bottom: 32px;
    padding: 20px;
    background: var(--apple-surface-secondary);
    border-radius: 16px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--apple-surface-border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--apple-accent-blue), var(--apple-accent-purple));
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .step-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .step-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
  }

  .progress-text {
    font-size: 14px;
    color: var(--apple-text-secondary);
  }

  /* 섹션 공통 스타일 */
  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--apple-text-primary);
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon {
    font-size: 28px;
  }

  .section-description {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0 0 32px;
    line-height: 1.5;
  }

  .subsection-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 16px;
  }

  /* 카테고리 선택 */
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .category-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 16px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    text-align: left;
  }

  .category-card:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }

  .category-card.selected {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.1);
  }

  .category-icon {
    font-size: 32px;
    min-width: 40px;
  }

  .category-info {
    flex: 1;
  }

  .category-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 4px;
  }

  .category-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .category-count {
    font-size: 12px;
    color: var(--apple-text-tertiary);
    background: var(--apple-surface-tertiary);
    padding: 4px 8px;
    border-radius: 8px;
  }

  /* 템플릿 선택 */
  .recommended-section {
    margin-bottom: 40px;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .template-card {
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }

  .template-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
  }

  .template-card.selected {
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2);
  }

  .template-preview {
    position: relative;
    height: 160px;
    overflow: hidden;
  }

  .template-background {
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }

  .template-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 16px;
    color: white;
  }

  .template-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .template-difficulty {
    font-size: 12px;
    opacity: 0.9;
  }

  .template-info {
    padding: 16px;
  }

  .template-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .template-popularity {
    font-size: 12px;
    color: var(--apple-text-tertiary);
  }

  /* 템플릿 리스트 */
  .template-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .template-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    text-align: left;
  }

  .template-item:hover {
    background: var(--apple-surface-tertiary);
  }

  .template-item.selected {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.1);
  }

  .template-thumbnail {
    width: 60px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
  }

  .thumbnail-bg {
    width: 100%;
    height: 100%;
  }

  .template-details {
    flex: 1;
  }

  .template-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 4px;
  }

  .template-desc {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0 0 8px;
    line-height: 1.4;
  }

  .template-meta {
    display: flex;
    gap: 12px;
  }

  .meta-item {
    font-size: 12px;
    color: var(--apple-text-tertiary);
    background: var(--apple-surface-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
  }

  /* 팀 선택 */
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .team-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 16px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    text-align: left;
  }

  .team-card:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }

  .team-card.selected {
    border-color: var(--team-primary);
    background: color-mix(in srgb, var(--team-primary) 10%, transparent);
  }

  .team-logo {
    min-width: 60px;
  }

  .logo-circle {
    width: 60px;
    height: 60px;
    background: var(--team-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
  }

  .team-info {
    flex: 1;
  }

  .team-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--apple-text-primary);
    margin: 0 0 4px;
  }

  .team-english {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0 0 8px;
  }

  .team-details {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .team-city,
  .team-stadium {
    font-size: 12px;
    color: var(--apple-text-tertiary);
    background: var(--apple-surface-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .team-achievements {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mascot,
  .championships {
    font-size: 12px;
    color: var(--apple-text-secondary);
  }

  /* 커스터마이징 */
  .customize-panels {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .customize-panel {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .panel-icon {
    font-size: 16px;
  }

  /* 폼 스타일 */
  .story-form,
  .player-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 12px;
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    color: var(--apple-text-primary);
    font-size: 14px;
    font-family: inherit;
    transition: border-color var(--apple-duration-fast) var(--apple-easing-smooth);
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .stat-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-group label {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
  }

  .stat-group input {
    padding: 8px;
    font-size: 13px;
  }

  /* 선택 요약 */
  .selection-summary {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
    margin-top: 32px;
  }

  .summary-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 16px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--apple-surface-primary);
    border-radius: 8px;
  }

  .summary-label {
    font-size: 12px;
    color: var(--apple-text-secondary);
    font-weight: 500;
  }

  .summary-value {
    font-size: 14px;
    color: var(--apple-text-primary);
    font-weight: 600;
  }

  /* 네비게이션 버튼 */
  .navigation-buttons {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--apple-surface-border);
  }

  .nav-spacer {
    flex: 1;
  }

  .nav-button {
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

  .nav-button.primary {
    background: var(--apple-accent-blue);
    color: white;
  }

  .nav-button.primary:hover:not(:disabled) {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }

  .nav-button.primary:disabled {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-secondary);
    cursor: not-allowed;
  }

  .nav-button.secondary {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    border: 2px solid var(--apple-surface-border);
  }

  .nav-button.secondary:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-1px);
  }

  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .category-grid,
    .team-grid {
      grid-template-columns: 1fr;
    }

    .template-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .kbo-glory-creator {
      padding: 16px;
    }

    .section-title {
      font-size: 20px;
    }

    .template-grid {
      grid-template-columns: 1fr;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .navigation-buttons {
      flex-direction: column;
      gap: 12px;
    }

    .nav-spacer {
      display: none;
    }

    .nav-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>