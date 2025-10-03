<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GloryMomentTemplate, KBOTeam } from '../data/kboTemplates.js';
  import { KBO_TEAMS, getTemplateById } from '../data/kboTemplates.js';
  import TemplateSelector from './TemplateSelector.svelte';
  import TemplateEditor from './TemplateEditor.svelte';
  
  // Props
  export let initialTemplateId: string | null = null;
  export let initialTeamId: string | null = null;
  export let userImage: string | null = null;
  
  // 상태 관리
  let currentStep: 'select' | 'edit' | 'preview' = 'select';
  let selectedTemplate: GloryMomentTemplate | null = null;
  let selectedTeam: KBOTeam | null = null;
  let editedTemplate: GloryMomentTemplate | null = null;
  let previewTemplate: GloryMomentTemplate | null = null;
  let isExporting = false;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    cardCreated: { template: GloryMomentTemplate; team: KBOTeam | null };
    cardExported: { template: GloryMomentTemplate; format: string };
    stepChanged: string;
  }>();
  
  onMount(() => {
    // 초기 템플릿 설정
    if (initialTemplateId) {
      const template = getTemplateById(initialTemplateId);
      if (template) {
        selectedTemplate = template;
        editedTemplate = { ...template };
        currentStep = 'edit';
      }
    }
    
    // 초기 팀 설정
    if (initialTeamId && KBO_TEAMS[initialTeamId]) {
      selectedTeam = KBO_TEAMS[initialTeamId];
    }
  });
  
  // 템플릿 선택 처리
  function handleTemplateSelected(event: CustomEvent<GloryMomentTemplate>) {
    selectedTemplate = event.detail;
    editedTemplate = { ...event.detail };
    currentStep = 'edit';
    dispatch('stepChanged', currentStep);
  }
  
  // 템플릿 미리보기 처리
  function handleTemplatePreview(event: CustomEvent<GloryMomentTemplate>) {
    previewTemplate = event.detail;
  }
  
  // 템플릿 업데이트 처리
  function handleTemplateUpdated(event: CustomEvent<GloryMomentTemplate>) {
    editedTemplate = event.detail;
  }
  
  // 팀 선택 처리
  function handleTeamSelected(teamId: string) {
    selectedTeam = KBO_TEAMS[teamId] || null;
  }
  
  // 단계 변경
  function changeStep(step: 'select' | 'edit' | 'preview') {
    currentStep = step;
    dispatch('stepChanged', step);
  }
  
  // 카드 내보내기
  async function handleExportRequested() {
    if (!editedTemplate) return;
    
    isExporting = true;
    
    try {
      // 실제 구현에서는 서버에서 카드 이미지 생성
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
      
      dispatch('cardExported', { 
        template: editedTemplate, 
        format: 'png' 
      });
      
      // 성공 피드백
      showSuccessMessage('카드가 성공적으로 내보내졌습니다!');
      
    } catch (error) {
      console.error('Export failed:', error);
      showErrorMessage('카드 내보내기에 실패했습니다.');
    } finally {
      isExporting = false;
    }
  }
  
  // 카드 저장
  function saveCard() {
    if (!editedTemplate) return;
    
    dispatch('cardCreated', { 
      template: editedTemplate, 
      team: selectedTeam 
    });
    
    showSuccessMessage('카드가 저장되었습니다!');
  }
  
  // 성공 메시지 표시
  function showSuccessMessage(message: string) {
    // 실제 구현에서는 토스트 알림 시스템 사용
    console.log('Success:', message);
  }
  
  // 에러 메시지 표시
  function showErrorMessage(message: string) {
    // 실제 구현에서는 토스트 알림 시스템 사용
    console.error('Error:', message);
  }
  
  // 진행률 계산
  function getProgress(): number {
    switch (currentStep) {
      case 'select': return 33;
      case 'edit': return 66;
      case 'preview': return 100;
      default: return 0;
    }
  }
  
  // 단계 제목 가져오기
  function getStepTitle(): string {
    switch (currentStep) {
      case 'select': return '템플릿 선택';
      case 'edit': return '카드 편집';
      case 'preview': return '미리보기 및 내보내기';
      default: return '';
    }
  }
</script>

<div class="glory-moment-creator">
  <!-- 헤더 -->
  <div class="creator-header">
    <div class="header-content">
      <h2 class="creator-title">
        <span class="title-icon">⚾</span>
        영광의 순간 카드 제작
      </h2>
      <p class="creator-subtitle">
        KBO 야구의 특별한 순간을 홀로그래픽 카드로 만들어보세요
      </p>
    </div>
    
    <!-- 진행률 표시 -->
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          style="width: {getProgress()}%"
        ></div>
      </div>
      <div class="step-info">
        <span class="step-title">{getStepTitle()}</span>
        <span class="step-counter">{currentStep === 'select' ? 1 : currentStep === 'edit' ? 2 : 3}/3</span>
      </div>
    </div>
  </div>
  
  <!-- 팀 선택 -->
  {#if currentStep !== 'select'}
    <div class="team-selector">
      <h3 class="section-title">구단 선택</h3>
      <div class="team-grid">
        {#each Object.values(KBO_TEAMS) as team (team.id)}
          <button
            class="team-card"
            class:selected={selectedTeam?.id === team.id}
            style="--team-primary: {team.colors.primary}; --team-secondary: {team.colors.secondary};"
            on:click={() => handleTeamSelected(team.id)}
          >
            <div class="team-colors">
              <div class="color-primary" style="background: {team.colors.primary}"></div>
              <div class="color-secondary" style="background: {team.colors.secondary}"></div>
            </div>
            <div class="team-info">
              <div class="team-name">{team.name}</div>
              <div class="team-city">{team.city}</div>
            </div>
            {#if selectedTeam?.id === team.id}
              <div class="selection-check">✓</div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- 메인 콘텐츠 -->
  <div class="creator-content">
    {#if currentStep === 'select'}
      <!-- 템플릿 선택 단계 -->
      <div class="step-container">
        <TemplateSelector
          bind:selectedTemplate
          on:templateSelected={handleTemplateSelected}
          on:templatePreview={handleTemplatePreview}
        />
        
        <!-- 미리보기 패널 -->
        {#if previewTemplate}
          <div class="preview-panel">
            <h4 class="preview-title">미리보기</h4>
            <div class="preview-card">
              <div class="preview-info">
                <h5>{previewTemplate.name}</h5>
                <p>{previewTemplate.description}</p>
                <div class="preview-meta">
                  <span class="difficulty">난이도: {previewTemplate.metadata.difficulty}</span>
                  <span class="popularity">인기도: {previewTemplate.metadata.popularity}%</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
      
    {:else if currentStep === 'edit'}
      <!-- 편집 단계 -->
      <div class="step-container">
        {#if selectedTemplate}
          <TemplateEditor
            template={editedTemplate || selectedTemplate}
            {selectedTeam}
            {userImage}
            on:templateUpdated={handleTemplateUpdated}
            on:exportRequested={handleExportRequested}
          />
        {/if}
      </div>
      
    {:else if currentStep === 'preview'}
      <!-- 미리보기 단계 -->
      <div class="step-container">
        <div class="preview-section">
          <h3 class="section-title">최종 미리보기</h3>
          {#if editedTemplate}
            <div class="final-preview">
              <!-- 최종 카드 미리보기 -->
              <div class="card-preview">
                <p>최종 카드 미리보기가 여기에 표시됩니다.</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- 액션 버튼 -->
  <div class="creator-actions">
    <div class="action-buttons">
      {#if currentStep !== 'select'}
        <button 
          class="action-button secondary"
          on:click={() => changeStep(currentStep === 'edit' ? 'select' : 'edit')}
        >
          ← 이전
        </button>
      {/if}
      
      {#if currentStep === 'select'}
        <button 
          class="action-button primary"
          disabled={!selectedTemplate}
          on:click={() => changeStep('edit')}
        >
          편집하기 →
        </button>
      {:else if currentStep === 'edit'}
        <div class="edit-actions">
          <button 
            class="action-button secondary"
            on:click={saveCard}
            disabled={!editedTemplate}
          >
            💾 저장
          </button>
          <button 
            class="action-button primary"
            disabled={!editedTemplate || isExporting}
            on:click={handleExportRequested}
          >
            {#if isExporting}
              <span class="loading-spinner"></span>
              내보내는 중...
            {:else}
              📤 내보내기
            {/if}
          </button>
        </div>
      {:else if currentStep === 'preview'}
        <button 
          class="action-button primary"
          on:click={() => changeStep('select')}
        >
          새 카드 만들기
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .glory-moment-creator {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }
  
  /* 헤더 */
  .creator-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .header-content {
    margin-bottom: 24px;
  }
  
  .creator-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .creator-subtitle {
    font-size: 18px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
  
  /* 진행률 */
  .progress-container {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--apple-surface-tertiary);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--apple-accent-blue), var(--apple-accent-green));
    border-radius: 3px;
    transition: width var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .step-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }
  
  .step-title {
    font-weight: 600;
    color: var(--apple-text-primary);
  }
  
  .step-counter {
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  /* 팀 선택 */
  .team-selector {
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px;
    color: var(--apple-text-primary);
    text-align: center;
  }
  
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .team-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    position: relative;
  }
  
  .team-card:hover {
    border-color: var(--team-primary);
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .team-card.selected {
    border-color: var(--team-primary);
    background: linear-gradient(135deg, 
      rgba(var(--team-primary-rgb, 0, 122, 255), 0.1), 
      rgba(var(--team-secondary-rgb, 0, 122, 255), 0.05)\n    );\n  }\n  \n  .team-colors {\n    display: flex;\n    gap: 4px;\n  }\n  \n  .color-primary,\n  .color-secondary {\n    width: 16px;\n    height: 16px;\n    border-radius: 50%;\n    border: 2px solid rgba(255, 255, 255, 0.3);\n  }\n  \n  .team-info {\n    flex: 1;\n    text-align: left;\n  }\n  \n  .team-name {\n    font-size: 14px;\n    font-weight: 600;\n    color: var(--apple-text-primary);\n    margin-bottom: 2px;\n  }\n  \n  .team-city {\n    font-size: 12px;\n    color: var(--apple-text-secondary);\n  }\n  \n  .selection-check {\n    position: absolute;\n    top: -6px;\n    right: -6px;\n    width: 20px;\n    height: 20px;\n    background: var(--apple-accent-green);\n    color: white;\n    border-radius: 50%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 12px;\n    font-weight: bold;\n  }\n  \n  /* 메인 콘텐츠 */\n  .creator-content {\n    margin-bottom: 32px;\n  }\n  \n  .step-container {\n    display: flex;\n    gap: 24px;\n    align-items: flex-start;\n  }\n  \n  /* 미리보기 패널 */\n  .preview-panel {\n    width: 300px;\n    background: var(--apple-surface-primary);\n    border: 1px solid var(--apple-surface-border);\n    border-radius: 12px;\n    padding: 20px;\n    position: sticky;\n    top: 20px;\n  }\n  \n  .preview-title {\n    font-size: 16px;\n    font-weight: 600;\n    margin: 0 0 16px;\n    color: var(--apple-text-primary);\n  }\n  \n  .preview-card {\n    background: var(--apple-surface-secondary);\n    border-radius: 8px;\n    padding: 16px;\n  }\n  \n  .preview-info h5 {\n    font-size: 14px;\n    font-weight: 600;\n    margin: 0 0 8px;\n    color: var(--apple-text-primary);\n  }\n  \n  .preview-info p {\n    font-size: 12px;\n    color: var(--apple-text-secondary);\n    margin: 0 0 12px;\n    line-height: 1.4;\n  }\n  \n  .preview-meta {\n    display: flex;\n    justify-content: space-between;\n    font-size: 11px;\n    color: var(--apple-text-secondary);\n  }\n  \n  /* 최종 미리보기 */\n  .preview-section {\n    text-align: center;\n  }\n  \n  .final-preview {\n    max-width: 600px;\n    margin: 0 auto;\n  }\n  \n  .card-preview {\n    aspect-ratio: 3/4;\n    background: var(--apple-surface-secondary);\n    border-radius: 16px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: var(--apple-text-secondary);\n    font-size: 16px;\n  }\n  \n  /* 액션 버튼 */\n  .creator-actions {\n    display: flex;\n    justify-content: center;\n    padding-top: 24px;\n    border-top: 1px solid var(--apple-surface-border);\n  }\n  \n  .action-buttons {\n    display: flex;\n    gap: 16px;\n    align-items: center;\n  }\n  \n  .edit-actions {\n    display: flex;\n    gap: 12px;\n  }\n  \n  .action-button {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    padding: 12px 24px;\n    border: none;\n    border-radius: 12px;\n    font-size: 16px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);\n    min-width: 120px;\n    justify-content: center;\n  }\n  \n  .action-button.primary {\n    background: var(--apple-accent-blue);\n    color: white;\n  }\n  \n  .action-button.primary:hover:not(:disabled) {\n    background: var(--apple-accent-blue-hover);\n    transform: translateY(-2px);\n    box-shadow: var(--apple-shadow-lg);\n  }\n  \n  .action-button.secondary {\n    background: var(--apple-surface-secondary);\n    color: var(--apple-text-primary);\n    border: 1px solid var(--apple-surface-border);\n  }\n  \n  .action-button.secondary:hover {\n    background: var(--apple-surface-tertiary);\n    transform: translateY(-1px);\n  }\n  \n  .action-button:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n    transform: none;\n  }\n  \n  /* 로딩 스피너 */\n  .loading-spinner {\n    width: 16px;\n    height: 16px;\n    border: 2px solid rgba(255, 255, 255, 0.3);\n    border-top: 2px solid white;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n  \n  @keyframes spin {\n    0% { transform: rotate(0deg); }\n    100% { transform: rotate(360deg); }\n  }\n  \n  /* 반응형 디자인 */\n  @media (max-width: 1024px) {\n    .step-container {\n      flex-direction: column;\n    }\n    \n    .preview-panel {\n      width: 100%;\n      position: static;\n    }\n    \n    .team-grid {\n      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n    }\n  }\n  \n  @media (max-width: 768px) {\n    .glory-moment-creator {\n      padding: 16px;\n    }\n    \n    .creator-title {\n      font-size: 28px;\n    }\n    \n    .creator-subtitle {\n      font-size: 16px;\n    }\n    \n    .team-grid {\n      grid-template-columns: 1fr;\n    }\n    \n    .action-buttons {\n      flex-direction: column;\n      width: 100%;\n    }\n    \n    .edit-actions {\n      flex-direction: column;\n      width: 100%;\n    }\n    \n    .action-button {\n      width: 100%;\n    }\n  }\n</style>