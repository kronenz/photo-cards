<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GloryMomentTemplate, KBOTeam, EmotionIcon, FamousQuote, KBOCheerSound } from '../data/kboTemplates.js';
  import { KBO_TEAMS, GLORY_MOMENT_TEMPLATES } from '../data/kboTemplates.js';
  import TemplateSelector from './TemplateSelector.svelte';
  import MediaUploader from './MediaUploader.svelte';
  import EmotionOverlay from './EmotionOverlay.svelte';
  import SoundLibrary from './SoundLibrary.svelte';
  import AdvancedCardEditor from './AdvancedCardEditor.svelte';
  
  // Props
  export let initialTemplate: GloryMomentTemplate | null = null;
  export let initialTeam: string | null = null;
  
  // 상태 관리
  let currentStep: 'template' | 'team' | 'media' | 'customize' | 'edit' = 'template';
  let selectedTemplate: GloryMomentTemplate | null = initialTemplate;
  let selectedTeam: KBOTeam | null = initialTeam ? KBO_TEAMS[initialTeam] : null;
  let uploadedMedia: any[] = [];
  let selectedEmotion: EmotionIcon | null = null;
  let selectedQuote: FamousQuote | null = null;
  let selectedSound: KBOCheerSound | null = null;
  let userImage: string | null = null;
  let showSuccessMessage = false;
  let successMessage = '';
  let isProcessing = false;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    cardCreated: {
      template: GloryMomentTemplate;
      team: KBOTeam | null;
      media: any[];
      emotion: EmotionIcon | null;
      quote: FamousQuote | null;
      sound: KBOCheerSound | null;
    };
    stepChanged: string;
  }>();
  
  onMount(() => {
    // URL 파라미터에서 초기 설정 복원
    if (browser) {
      const params = new URLSearchParams(window.location.search);
      const templateId = params.get('template');
      const teamId = params.get('team');
      
      if (templateId) {
        const template = GLORY_MOMENT_TEMPLATES.find(t => t.id === templateId);
        if (template) {
          selectedTemplate = template;
          currentStep = 'team';
        }
      }
      
      if (teamId && KBO_TEAMS[teamId]) {
        selectedTeam = KBO_TEAMS[teamId];
        if (selectedTemplate) {
          currentStep = 'media';
        }
      }
    }
  });
  
  // 단계 변경
  function changeStep(step: typeof currentStep) {
    currentStep = step;
    dispatch('stepChanged', step);
    
    // URL 업데이트
    if (browser) {
      const params = new URLSearchParams();
      if (selectedTemplate) params.set('template', selectedTemplate.id);
      if (selectedTeam) params.set('team', selectedTeam.id);
      
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }
  
  // 성공 메시지 표시
  function showMessage(message: string) {
    successMessage = message;
    showSuccessMessage = true;
    
    setTimeout(() => {
      showSuccessMessage = false;
    }, 3000);
  }
  
  // 템플릿 선택 처리
  function handleTemplateSelected(event: CustomEvent<GloryMomentTemplate>) {
    selectedTemplate = event.detail;
    changeStep('team');
    showMessage(`${event.detail.name} 템플릿이 선택되었습니다!`);
  }
  
  // 팀 선택 처리
  function handleTeamSelected(team: KBOTeam) {
    selectedTeam = team;
    changeStep('media');
    showMessage(`${team.name}이 선택되었습니다!`);
  }
  
  // 미디어 업로드 처리
  function handleMediaUploaded(event: CustomEvent) {
    uploadedMedia = event.detail;
    showMessage(`${uploadedMedia.length}개의 미디어 파일이 업로드되었습니다!`);
    
    // 첫 번째 이미지를 사용자 이미지로 설정
    const firstImage = uploadedMedia.find(media => media.type === 'image');
    if (firstImage && firstImage.preview) {
      userImage = firstImage.preview;
    }
  }
  
  // 감정 선택 처리
  function handleEmotionSelected(event: CustomEvent<EmotionIcon>) {
    selectedEmotion = event.detail;
    showMessage(`${event.detail.name} 감정이 선택되었습니다!`);
  }
  
  // 명언 선택 처리
  function handleQuoteSelected(event: CustomEvent<FamousQuote>) {
    selectedQuote = event.detail;
    showMessage(`명언이 선택되었습니다!`);
  }
  
  // 사운드 선택 처리
  function handleSoundSelected(event: CustomEvent<KBOCheerSound>) {
    selectedSound = event.detail;
    showMessage(`${event.detail.name} 사운드가 선택되었습니다!`);
  }
  
  // 카드 생성 완료
  function handleCardCreated() {
    if (!selectedTemplate) return;
    
    isProcessing = true;
    
    // 카드 데이터 생성
    const cardData = {
      template: selectedTemplate,
      team: selectedTeam,
      media: uploadedMedia,
      emotion: selectedEmotion,
      quote: selectedQuote,
      sound: selectedSound
    };
    
    // 로컬 스토리지에 저장
    if (browser) {
      const savedCards = JSON.parse(localStorage.getItem('kbo-cards') || '[]');
      savedCards.push({
        ...cardData,
        id: `card-${Date.now()}`,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('kbo-cards', JSON.stringify(savedCards));
    }
    
    setTimeout(() => {
      isProcessing = false;
      dispatch('cardCreated', cardData);
      showMessage('카드가 성공적으로 생성되었습니다! 🎉');
    }, 1500);
  }
  
  // 단계별 진행률 계산
  $: progress = {
    template: currentStep !== 'template' ? 100 : 0,
    team: currentStep === 'media' || currentStep === 'customize' || currentStep === 'edit' ? 100 : 
          currentStep === 'team' ? 50 : 0,
    media: currentStep === 'customize' || currentStep === 'edit' ? 100 : 
           currentStep === 'media' && uploadedMedia.length > 0 ? 75 : 0,
    customize: currentStep === 'edit' ? 100 : 
               currentStep === 'customize' ? 50 : 0
  };
  
  // 다음 단계 가능 여부
  $: canProceed = {
    template: selectedTemplate !== null,
    team: selectedTeam !== null,
    media: uploadedMedia.length > 0,
    customize: true // 커스터마이징은 선택사항
  };
</script>

<div class="kbo-card-creator">
  <!-- 성공 메시지 -->
  {#if showSuccessMessage}
    <div class="success-message">
      <div class="message-content">
        <span class="message-icon">✅</span>
        <span class="message-text">{successMessage}</span>
      </div>
    </div>
  {/if}
  
  <!-- 진행률 표시 -->
  <div class="progress-header">
    <h1 class="creator-title">
      <span class="title-icon">⚾</span>
      홀로그래픽 카드 제작
    </h1>
    
    <div class="progress-steps">
      <div class="step" class:active={currentStep === 'template'} class:completed={progress.template === 100}>
        <div class="step-circle">
          <span class="step-number">1</span>
          {#if progress.template === 100}
            <span class="step-check">✓</span>
          {/if}
        </div>
        <span class="step-label">템플릿</span>
      </div>
      
      <div class="step-connector" class:completed={progress.team > 0}></div>
      
      <div class="step" class:active={currentStep === 'team'} class:completed={progress.team === 100}>
        <div class="step-circle">
          <span class="step-number">2</span>
          {#if progress.team === 100}
            <span class="step-check">✓</span>
          {/if}
        </div>
        <span class="step-label">구단</span>
      </div>
      
      <div class="step-connector" class:completed={progress.media > 0}></div>
      
      <div class="step" class:active={currentStep === 'media'} class:completed={progress.media === 100}>
        <div class="step-circle">
          <span class="step-number">3</span>
          {#if progress.media === 100}
            <span class="step-check">✓</span>
          {/if}
        </div>
        <span class="step-label">미디어</span>
      </div>
      
      <div class="step-connector" class:completed={progress.customize > 0}></div>
      
      <div class="step" class:active={currentStep === 'customize'} class:completed={progress.customize === 100}>
        <div class="step-circle">
          <span class="step-number">4</span>
          {#if progress.customize === 100}
            <span class="step-check">✓</span>
          {/if}
        </div>
        <span class="step-label">커스터마이징</span>
      </div>
      
      <div class="step-connector" class:completed={currentStep === 'edit'}></div>
      
      <div class="step" class:active={currentStep === 'edit'}>
        <div class="step-circle">
          <span class="step-number">5</span>
        </div>
        <span class="step-label">편집</span>
      </div>
    </div>
  </div>
  
  <!-- 메인 콘텐츠 -->
  <div class="creator-content">
    <!-- 1단계: 템플릿 선택 -->
    {#if currentStep === 'template'}
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">영광의 순간 템플릿 선택</h2>
          <p class="step-description">
            야구의 특별한 순간을 담을 템플릿을 선택하세요
          </p>
        </div>
        
        <TemplateSelector
          on:templateSelected={handleTemplateSelected}
          maxTemplates={12}
        />
        
        {#if selectedTemplate}
          <div class="step-actions">
            <button 
              class="next-button"
              on:click={() => changeStep('team')}
            >
              구단 선택하기 →
            </button>
          </div>
        {/if}
      </div>
    
    <!-- 2단계: 구단 선택 -->
    {:else if currentStep === 'team'}
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">응원하는 구단 선택</h2>
          <p class="step-description">
            카드에 적용할 구단을 선택하세요. 구단 컬러와 로고가 자동으로 적용됩니다.
          </p>
        </div>
        
        <div class="team-grid">
          {#each Object.values(KBO_TEAMS) as team (team.id)}
            <button
              class="team-card"
              class:selected={selectedTeam?.id === team.id}
              style="--team-primary: {team.colors.primary}; --team-secondary: {team.colors.secondary}"
              on:click={() => handleTeamSelected(team)}
            >
              <div class="team-header">
                <div class="team-logo">⚾</div>
                <div class="team-info">
                  <h3 class="team-name">{team.name}</h3>
                  <p class="team-city">{team.city}</p>
                </div>
              </div>
              
              <div class="team-details">
                <div class="team-stat">
                  <span class="stat-label">창단</span>
                  <span class="stat-value">{team.founded}년</span>
                </div>
                <div class="team-stat">
                  <span class="stat-label">홈구장</span>
                  <span class="stat-value">{team.stadium}</span>
                </div>
                <div class="team-stat">
                  <span class="stat-label">우승</span>
                  <span class="stat-value">{team.championships.length}회</span>
                </div>
              </div>
              
              <div class="team-colors">
                <div class="color-swatch" style="background: {team.colors.primary}"></div>
                <div class="color-swatch" style="background: {team.colors.secondary}"></div>
              </div>
            </button>
          {/each}
        </div>
        
        <div class="step-actions">
          <button 
            class="back-button"
            on:click={() => changeStep('template')}
          >
            ← 템플릿 다시 선택
          </button>
          
          {#if selectedTeam}
            <button 
              class="next-button"
              on:click={() => changeStep('media')}
            >
              미디어 업로드 →
            </button>
          {/if}
        </div>
      </div>
    
    <!-- 3단계: 미디어 업로드 -->
    {:else if currentStep === 'media'}
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">미디어 업로드</h2>
          <p class="step-description">
            카드에 사용할 사진, 동영상, 오디오 파일을 업로드하세요
          </p>
        </div>
        
        <MediaUploader
          acceptedTypes="all"
          allowMultiple={true}
          maxFileSize={50 * 1024 * 1024}
          maxVideoDuration={10}
          on:filesUploaded={handleMediaUploaded}
        />
        
        <div class="step-actions">
          <button 
            class="back-button"
            on:click={() => changeStep('team')}
          >
            ← 구단 다시 선택
          </button>
          
          {#if canProceed.media}
            <button 
              class="next-button"
              on:click={() => changeStep('customize')}
            >
              커스터마이징 →
            </button>
          {/if}
        </div>
      </div>
    
    <!-- 4단계: 커스터마이징 -->
    {:else if currentStep === 'customize'}
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">감정 & 사운드 커스터마이징</h2>
          <p class="step-description">
            카드에 감정 표현과 응원 사운드를 추가하여 더욱 생동감 있게 만들어보세요
          </p>
        </div>
        
        <div class="customize-grid">
          <div class="customize-panel">
            <EmotionOverlay
              bind:selectedEmotion
              bind:selectedQuote
              teamFilter={selectedTeam?.id}
              on:emotionSelected={handleEmotionSelected}
              on:quoteSelected={handleQuoteSelected}
            />
          </div>
          
          <div class="customize-panel">
            <SoundLibrary
              bind:selectedSound
              selectedTeam={selectedTeam?.id}
              on:soundSelected={handleSoundSelected}
            />
          </div>
        </div>
        
        <div class="step-actions">
          <button 
            class="back-button"
            on:click={() => changeStep('media')}
          >
            ← 미디어 다시 선택
          </button>
          
          <button 
            class="next-button"
            on:click={() => changeStep('edit')}
          >
            고급 편집 →
          </button>
        </div>
      </div>
    
    <!-- 5단계: 고급 편집 -->
    {:else if currentStep === 'edit'}
      <div class="step-content full-editor">
        {#if selectedTemplate}
          <AdvancedCardEditor
            template={selectedTemplate}
            {selectedTeam}
            {userImage}
            on:templateUpdated={(e) => selectedTemplate = e.detail}
            on:exportRequested={handleCardCreated}
            on:saveRequested={handleCardCreated}
          />
        {/if}
        
        <div class="editor-actions">
          <button 
            class="back-button"
            on:click={() => changeStep('customize')}
          >
            ← 커스터마이징으로 돌아가기
          </button>
          
          <button 
            class="create-button"
            class:processing={isProcessing}
            on:click={handleCardCreated}
            disabled={isProcessing}
          >
            {#if isProcessing}
              <span class="spinner"></span>
              카드 생성 중...
            {:else}
              🎯 카드 생성 완료
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .kbo-card-creator {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }
  
  /* 성공 메시지 */
  .success-message {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--apple-accent-green);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: var(--apple-shadow-lg);
    animation: slideIn 0.3s ease-out;
  }
  
  .message-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .message-icon {
    font-size: 16px;
  }
  
  .message-text {
    font-size: 14px;
    font-weight: 500;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  /* 진행률 헤더 */
  .progress-header {
    max-width: 1200px;
    margin: 0 auto 40px;
    text-align: center;
  }
  
  .creator-title {
    font-size: 36px;
    font-weight: 700;
    color: white;
    margin: 0 0 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 50px;
    padding: 20px 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.5;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .step.active,
  .step.completed {
    opacity: 1;
  }
  
  .step-circle {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .step.active .step-circle {
    background: var(--apple-accent-blue);
    box-shadow: 0 0 20px rgba(0, 122, 255, 0.5);
  }
  
  .step.completed .step-circle {
    background: var(--apple-accent-green);
  }
  
  .step-number {
    font-size: 16px;
    font-weight: 600;
    color: white;
  }
  
  .step-check {
    position: absolute;
    font-size: 14px;
    color: white;
  }
  
  .step-label {
    font-size: 14px;
    font-weight: 500;
    color: white;
    text-align: center;
  }
  
  .step-connector {
    width: 60px;
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 20px;
    transition: background var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .step-connector.completed {
    background: var(--apple-accent-green);
  }
  
  /* 메인 콘텐츠 */
  .creator-content {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .step-content {
    background: var(--apple-surface-primary);
    border-radius: 20px;
    padding: 40px;
    box-shadow: var(--apple-shadow-xl);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .step-content.full-editor {
    padding: 0;
    overflow: hidden;
  }
  
  .step-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .step-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 12px;
  }
  
  .step-description {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
  
  /* 팀 그리드 */
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .team-card {
    background: var(--apple-surface-secondary);
    border: 3px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  
  .team-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--team-primary), var(--team-secondary));
    opacity: 0;
    transition: opacity var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
    border-color: var(--team-primary);
  }
  
  .team-card:hover::before {
    opacity: 1;
  }
  
  .team-card.selected {
    border-color: var(--team-primary);
    background: linear-gradient(135deg, 
      rgba(var(--team-primary-rgb, 0, 122, 255), 0.1), 
      rgba(var(--team-secondary-rgb, 0, 122, 255), 0.05)
    );
    box-shadow: 0 8px 32px rgba(var(--team-primary-rgb, 0, 122, 255), 0.3);
  }
  
  .team-card.selected::before {
    opacity: 1;
  }
  
  .team-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .team-logo {
    width: 48px;
    height: 48px;
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
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 4px;
  }
  
  .team-city {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0;
  }
  
  .team-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .team-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--apple-text-secondary);
  }
  
  .stat-value {
    font-size: 13px;
    font-weight: 500;
    color: var(--apple-text-primary);
  }
  
  .team-colors {
    display: flex;
    gap: 8px;
  }
  
  .color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  /* 커스터마이징 그리드 */
  .customize-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }
  
  .customize-panel {
    min-height: 400px;
  }
  
  /* 단계 액션 */
  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-top: 40px;
  }
  
  .editor-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 20px 40px;
    background: var(--apple-surface-secondary);
    border-top: 1px solid var(--apple-surface-border);
  }
  
  .back-button,
  .next-button,
  .create-button {
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .back-button {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    border: 1px solid var(--apple-surface-border);
  }
  
  .back-button:hover {
    background: var(--apple-surface-border);
    transform: translateY(-1px);
  }
  
  .next-button,
  .create-button {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .next-button:hover,
  .create-button:hover:not(:disabled) {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }
  
  .create-button.processing {
    background: var(--apple-accent-orange);
    cursor: not-allowed;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .progress-steps {
      padding: 16px 24px;
    }
    
    .step-connector {
      width: 40px;
      margin: 0 12px;
    }
    
    .customize-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .team-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
  }
  
  @media (max-width: 768px) {
    .kbo-card-creator {
      padding: 16px;
    }
    
    .creator-title {
      font-size: 28px;
    }
    
    .progress-steps {
      flex-wrap: wrap;
      gap: 16px;
      padding: 20px;
    }
    
    .step-connector {
      display: none;
    }
    
    .step-content {
      padding: 24px;
    }
    
    .step-title {
      font-size: 24px;
    }
    
    .team-grid {
      grid-template-columns: 1fr;
    }
    
    .step-actions,
    .editor-actions {
      flex-direction: column;
      gap: 12px;
    }
    
    .step-actions button,
    .editor-actions button {
      width: 100%;
    }
  }
</style>