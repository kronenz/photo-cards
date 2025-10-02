<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GloryMomentTemplate, TemplateElement, KBOTeam } from '../data/kboTemplates.js';
  import TemplateEditor from './TemplateEditor.svelte';
  import AdvancedTextEditor from './AdvancedTextEditor.svelte';
  import StorytellingPanel from './StorytellingPanel.svelte';
  import LayerManager from './LayerManager.svelte';
  import EffectsPanel from './EffectsPanel.svelte';
  
  // Props
  export let template: GloryMomentTemplate;
  export let selectedTeam: KBOTeam | null = null;
  export let userImage: string | null = null;
  
  // 상태 관리
  let editedTemplate = { ...template };
  let selectedElementId: string | null = null;
  let activePanel: 'story' | 'layers' | 'effects' | 'properties' = 'story';
  let storyData = {
    backgroundStory: '',
    playerQuote: '',
    historicalContext: '',
    emotionalTone: 'joy' as const,
    tags: []
  };
  let appliedEffects: Record<string, any> = {};
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    templateUpdated: GloryMomentTemplate;
    exportRequested: void;
    saveRequested: void;
  }>();
  
  onMount(() => {
    if (!browser) return;
    
    // 자동 저장 (5분마다)
    const autoSaveInterval = setInterval(() => {
      saveToLocalStorage();
    }, 5 * 60 * 1000);
    
    // 로컬 스토리지에서 복원
    loadFromLocalStorage();
    
    return () => {
      clearInterval(autoSaveInterval);
    };
  });
  
  // 로컬 스토리지 저장
  function saveToLocalStorage() {
    if (!browser) return;
    
    const saveData = {
      template: editedTemplate,
      storyData,
      appliedEffects,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`card-editor-${template.id}`, JSON.stringify(saveData));
  }
  
  // 로컬 스토리지 복원
  function loadFromLocalStorage() {
    if (!browser) return;
    
    const saved = localStorage.getItem(`card-editor-${template.id}`);
    if (saved) {
      try {
        const saveData = JSON.parse(saved);
        editedTemplate = saveData.template || editedTemplate;
        storyData = saveData.storyData || storyData;
        appliedEffects = saveData.appliedEffects || appliedEffects;
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    }
  }
  
  // 템플릿 업데이트 처리
  function handleTemplateUpdated(event: CustomEvent<GloryMomentTemplate>) {
    editedTemplate = event.detail;
    dispatch('templateUpdated', editedTemplate);
    saveToLocalStorage();
  }
  
  // 요소 선택 처리
  function handleElementSelected(event: CustomEvent<TemplateElement | null>) {
    selectedElementId = event.detail?.id || null;
  }
  
  // 스토리 업데이트 처리
  function handleStoryUpdate(event: CustomEvent) {
    storyData = event.detail;
    saveToLocalStorage();
  }
  
  // 스토리 요소 추가 처리
  function handleAddStoryElement(event: CustomEvent<{ type: string; content: any }>) {
    const { type, content } = event.detail;
    
    // 새 요소 생성
    const newElement: TemplateElement = {
      id: `story-${type}-${Date.now()}`,
      type: type === 'timeline' ? 'decoration' : type === 'stats' ? 'stats' : 'text',
      position: {
        x: 10 + Math.random() * 20,
        y: 10 + Math.random() * 20,
        width: type === 'quote-bubble' ? 60 : 40,
        height: type === 'timeline' ? 30 : 20
      },
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        zIndex: editedTemplate.layout.elements.length + 1
      },
      content: {
        text: type === 'quote-bubble' ? content.text : JSON.stringify(content),
        placeholder: `${type} 내용`,
        required: false
      },
      constraints: {
        editable: true,
        movable: true,
        resizable: true
      }
    };
    
    editedTemplate.layout.elements = [...editedTemplate.layout.elements, newElement];
    dispatch('templateUpdated', editedTemplate);
    saveToLocalStorage();
  }
  
  // 레이어 관리 이벤트 처리
  function handleElementReorder(event: CustomEvent<{ fromIndex: number; toIndex: number }>) {
    const { fromIndex, toIndex } = event.detail;
    const elements = [...editedTemplate.layout.elements];
    const [movedElement] = elements.splice(fromIndex, 1);
    elements.splice(toIndex, 0, movedElement);
    
    editedTemplate.layout.elements = elements;
    dispatch('templateUpdated', editedTemplate);
  }
  
  function handleElementToggleVisibility(event: CustomEvent<string>) {
    const elementId = event.detail;
    const element = editedTemplate.layout.elements.find(el => el.id === elementId);
    
    if (element && element.style) {
      element.style.opacity = element.style.opacity === 0 ? 1 : 0;
      editedTemplate = { ...editedTemplate };
      dispatch('templateUpdated', editedTemplate);
    }
  }
  
  function handleElementDuplicate(event: CustomEvent<string>) {
    const elementId = event.detail;
    const element = editedTemplate.layout.elements.find(el => el.id === elementId);
    
    if (element) {
      const duplicatedElement: TemplateElement = {
        ...element,
        id: `${element.id}-copy-${Date.now()}`,
        position: {
          ...element.position,
          x: element.position.x + 5,
          y: element.position.y + 5
        }
      };
      
      editedTemplate.layout.elements = [...editedTemplate.layout.elements, duplicatedElement];
      dispatch('templateUpdated', editedTemplate);
    }
  }
  
  function handleElementDelete(event: CustomEvent<string>) {
    const elementId = event.detail;
    editedTemplate.layout.elements = editedTemplate.layout.elements.filter(el => el.id !== elementId);
    
    if (selectedElementId === elementId) {
      selectedElementId = null;
    }
    
    dispatch('templateUpdated', editedTemplate);
  }
  
  function handleElementLock(event: CustomEvent<string>) {
    const elementId = event.detail;
    const element = editedTemplate.layout.elements.find(el => el.id === elementId);
    
    if (element && element.constraints) {
      element.constraints.movable = !element.constraints.movable;
      editedTemplate = { ...editedTemplate };
      dispatch('templateUpdated', editedTemplate);
    }
  }
  
  // 효과 적용 처리
  function handleEffectApply(event: CustomEvent<{ effectId: string; settings: Record<string, any> }>) {
    const { effectId, settings } = event.detail;
    
    if (selectedElementId) {
      appliedEffects[selectedElementId] = { effectId, settings };
      saveToLocalStorage();
      
      // 실제 효과 적용 로직은 여기에 구현
      console.log('Effect applied:', effectId, settings);
    }
  }
  
  function handleEffectRemove(event: CustomEvent<string>) {
    const effectId = event.detail;
    
    if (selectedElementId && appliedEffects[selectedElementId]) {
      delete appliedEffects[selectedElementId];
      appliedEffects = { ...appliedEffects };
      saveToLocalStorage();
    }
  }
  
  function handleEffectPreview(event: CustomEvent<{ effectId: string; settings: Record<string, any> }>) {
    const { effectId, settings } = event.detail;
    console.log('Effect preview:', effectId, settings);
    // 미리보기 로직 구현
  }
  
  // 내보내기 요청
  function requestExport() {
    dispatch('exportRequested');
  }
  
  // 저장 요청
  function requestSave() {
    saveToLocalStorage();
    dispatch('saveRequested');
  }
  
  // 패널 전환
  function switchPanel(panel: typeof activePanel) {
    activePanel = panel;
  }
  
  // 선택된 요소 정보
  $: selectedElement = selectedElementId 
    ? editedTemplate.layout.elements.find(el => el.id === selectedElementId)
    : null;
</script>

<div class="advanced-card-editor">
  <!-- 에디터 헤더 -->
  <div class="editor-header">
    <div class="header-left">
      <h2 class="editor-title">
        <span class="title-icon">🎨</span>
        고급 카드 편집기
      </h2>
      <div class="template-info">
        <span class="template-name">{editedTemplate.name}</span>
        {#if selectedTeam}
          <span class="team-badge" style="color: {selectedTeam.colors.primary}">
            {selectedTeam.name}
          </span>
        {/if}
      </div>
    </div>
    
    <div class="header-actions">
      <button class="action-button save" on:click={requestSave}>
        💾 저장
      </button>
      <button class="action-button export" on:click={requestExport}>
        📤 내보내기
      </button>
    </div>
  </div>
  
  <!-- 메인 편집 영역 -->
  <div class="editor-main">
    <!-- 템플릿 편집기 -->
    <div class="editor-canvas">
      <TemplateEditor
        template={editedTemplate}
        {selectedTeam}
        {userImage}
        on:templateUpdated={handleTemplateUpdated}
        on:elementSelected={handleElementSelected}
        on:exportRequested={requestExport}
      />
    </div>
    
    <!-- 사이드 패널 -->
    <div class="editor-sidebar">
      <!-- 패널 탭 -->
      <div class="panel-tabs">
        <button
          class="panel-tab"
          class:active={activePanel === 'story'}
          on:click={() => switchPanel('story')}
          title="스토리텔링"
        >
          📖
        </button>
        <button
          class="panel-tab"
          class:active={activePanel === 'layers'}
          on:click={() => switchPanel('layers')}
          title="레이어 관리"
        >
          📚
        </button>
        <button
          class="panel-tab"
          class:active={activePanel === 'effects'}
          on:click={() => switchPanel('effects')}
          title="특수 효과"
        >
          🎪
        </button>
        <button
          class="panel-tab"
          class:active={activePanel === 'properties'}
          on:click={() => switchPanel('properties')}
          title="속성"
        >
          ⚙️
        </button>
      </div>
      
      <!-- 패널 콘텐츠 -->
      <div class="panel-content">
        {#if activePanel === 'story'}
          <StorytellingPanel
            template={editedTemplate}
            {storyData}
            on:storyUpdate={handleStoryUpdate}
            on:addStoryElement={handleAddStoryElement}
          />
        
        {:else if activePanel === 'layers'}
          <LayerManager
            elements={editedTemplate.layout.elements}
            {selectedElementId}
            on:elementSelect={(e) => selectedElementId = e.detail}
            on:elementReorder={handleElementReorder}
            on:elementToggleVisibility={handleElementToggleVisibility}
            on:elementDuplicate={handleElementDuplicate}
            on:elementDelete={handleElementDelete}
            on:elementLock={handleElementLock}
          />
        
        {:else if activePanel === 'effects'}
          <EffectsPanel
            {selectedElementId}
            on:effectApply={handleEffectApply}
            on:effectRemove={handleEffectRemove}
            on:effectPreview={handleEffectPreview}
          />
        
        {:else if activePanel === 'properties'}
          <div class="properties-panel">
            <h3 class="panel-title">
              <span class="title-icon">⚙️</span>
              속성
            </h3>
            
            {#if selectedElement}
              <div class="property-sections">
                <!-- 위치 및 크기 -->
                <div class="property-section">
                  <h4 class="section-title">위치 및 크기</h4>
                  
                  <div class="property-grid">
                    <div class="property-item">
                      <label>X 위치</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        bind:value={selectedElement.position.x}
                        on:input={() => dispatch('templateUpdated', editedTemplate)}
                      />
                    </div>
                    
                    <div class="property-item">
                      <label>Y 위치</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        bind:value={selectedElement.position.y}
                        on:input={() => dispatch('templateUpdated', editedTemplate)}
                      />
                    </div>
                    
                    <div class="property-item">
                      <label>너비</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        bind:value={selectedElement.position.width}
                        on:input={() => dispatch('templateUpdated', editedTemplate)}
                      />
                    </div>
                    
                    <div class="property-item">
                      <label>높이</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        bind:value={selectedElement.position.height}
                        on:input={() => dispatch('templateUpdated', editedTemplate)}
                      />
                    </div>
                  </div>
                </div>
                
                <!-- 텍스트 스타일 (텍스트 요소인 경우) -->
                {#if selectedElement.type === 'text' && selectedElement.style}
                  <div class="property-section">
                    <h4 class="section-title">텍스트 스타일</h4>
                    
                    <div class="property-list">
                      <div class="property-item">
                        <label>폰트 크기</label>
                        <input
                          type="number"
                          min="8"
                          max="72"
                          bind:value={selectedElement.style.fontSize}
                          on:input={() => dispatch('templateUpdated', editedTemplate)}
                        />
                      </div>
                      
                      <div class="property-item">
                        <label>폰트 굵기</label>
                        <select
                          bind:value={selectedElement.style.fontWeight}
                          on:change={() => dispatch('templateUpdated', editedTemplate)}
                        >
                          <option value="normal">보통</option>
                          <option value="bold">굵게</option>
                          <option value="lighter">얇게</option>
                        </select>
                      </div>
                      
                      <div class="property-item">
                        <label>텍스트 색상</label>
                        <input
                          type="color"
                          bind:value={selectedElement.style.color}
                          on:input={() => dispatch('templateUpdated', editedTemplate)}
                        />
                      </div>
                      
                      <div class="property-item">
                        <label>정렬</label>
                        <select
                          bind:value={selectedElement.style.textAlign}
                          on:change={() => dispatch('templateUpdated', editedTemplate)}
                        >
                          <option value="left">왼쪽</option>
                          <option value="center">가운데</option>
                          <option value="right">오른쪽</option>
                        </select>
                      </div>
                    </div>
                  </div>
                {/if}
                
                <!-- 레이어 설정 -->
                <div class="property-section">
                  <h4 class="section-title">레이어</h4>
                  
                  <div class="property-list">
                    <div class="property-item">
                      <label>Z-Index</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        bind:value={selectedElement.style.zIndex}
                        on:input={() => dispatch('templateUpdated', editedTemplate)}
                      />
                    </div>
                    
                    <div class="property-item">
                      <label>투명도</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        bind:value={selectedElement.style.opacity}
                        on:input={() => dispatch('templateUpdated', editedTemplate)}
                      />
                      <span class="range-value">{Math.round((selectedElement.style.opacity || 1) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="no-selection">
                <div class="no-selection-icon">🎯</div>
                <p>요소를 선택하여 속성을 편집하세요</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .advanced-card-editor {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--apple-surface-primary);
  }
  
  /* 에디터 헤더 */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .editor-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .template-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .template-name {
    font-size: 14px;
    color: var(--apple-text-secondary);
  }
  
  .team-badge {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
  
  .action-button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button.save {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    border: 1px solid var(--apple-surface-border);
  }
  
  .action-button.save:hover {
    background: var(--apple-accent-green);
    color: white;
  }
  
  .action-button.export {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .action-button.export:hover {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }
  
  /* 메인 편집 영역 */
  .editor-main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  
  .editor-canvas {
    flex: 1;
    padding: 24px;
    overflow: auto;
  }
  
  .editor-sidebar {
    width: 350px;
    background: var(--apple-surface-secondary);
    border-left: 1px solid var(--apple-surface-border);
    display: flex;
    flex-direction: column;
  }
  
  /* 패널 탭 */
  .panel-tabs {
    display: flex;
    background: var(--apple-surface-tertiary);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .panel-tab {
    flex: 1;
    padding: 12px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    border-bottom: 3px solid transparent;
  }
  
  .panel-tab:hover {
    background: var(--apple-surface-secondary);
  }
  
  .panel-tab.active {
    background: var(--apple-surface-primary);
    border-bottom-color: var(--apple-accent-blue);
  }
  
  /* 패널 콘텐츠 */
  .panel-content {
    flex: 1;
    overflow: hidden;
  }
  
  /* 속성 패널 */
  .properties-panel {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  .panel-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .property-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .property-section {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    padding: 16px;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
  }
  
  .property-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .property-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .property-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .property-item label {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .property-item input,
  .property-item select {
    padding: 8px 12px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  .property-item input[type="color"] {
    height: 32px;
    padding: 2px;
    cursor: pointer;
  }
  
  .property-item input[type="range"] {
    flex: 1;
  }
  
  .range-value {
    font-size: 12px;
    color: var(--apple-text-secondary);
    text-align: right;
  }
  
  /* 선택된 요소 없음 */
  .no-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
    color: var(--apple-text-secondary);
  }
  
  .no-selection-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .no-selection p {
    font-size: 14px;
    margin: 0;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .editor-main {
      flex-direction: column;
    }
    
    .editor-sidebar {
      width: 100%;
      height: 400px;
    }
    
    .panel-tabs {
      justify-content: center;
    }
    
    .panel-tab {
      min-width: 60px;
    }
  }
  
  @media (max-width: 768px) {
    .editor-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .editor-canvas {
      padding: 16px;
    }
    
    .properties-panel {
      padding: 16px;
    }
    
    .property-grid {
      grid-template-columns: 1fr;
    }
  }
</style>