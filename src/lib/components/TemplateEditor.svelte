<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GloryMomentTemplate, TemplateElement, KBOTeam } from '../data/kboTemplates.js';
  import { KBO_TEAMS } from '../data/kboTemplates.js';
  
  // Props
  export let template: GloryMomentTemplate;
  export let selectedTeam: KBOTeam | null = null;
  export let userImage: string | null = null;
  export let editable = true;
  
  // 상태 관리
  let editorContainer: HTMLDivElement;
  let selectedElement: TemplateElement | null = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let templateData = { ...template };
  let elementValues: Record<string, string> = {};
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    templateUpdated: GloryMomentTemplate;
    elementSelected: TemplateElement | null;
    exportRequested: void;
  }>();
  
  onMount(() => {
    if (!browser) return;
    
    // 초기 요소 값 설정
    templateData.layout.elements.forEach(element => {
      if (element.content?.text) {
        elementValues[element.id] = element.content.text;
      }
    });
    
    // 키보드 이벤트 리스너
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement && selectedElement.constraints?.editable) {
        deleteElement(selectedElement);
      }
      if (e.key === 'Escape') {
        selectedElement = null;
        dispatch('elementSelected', null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
  
  // 요소 선택
  function selectElement(element: TemplateElement, event?: MouseEvent) {
    if (!editable) return;
    
    selectedElement = element;
    dispatch('elementSelected', element);
    
    if (event) {
      event.stopPropagation();
    }
  }
  
  // 요소 드래그 시작
  function startDrag(element: TemplateElement, event: MouseEvent) {
    if (!editable || !element.constraints?.movable) return;
    
    isDragging = true;
    selectedElement = element;
    
    const rect = editorContainer.getBoundingClientRect();
    const elementRect = (event.target as HTMLElement).getBoundingClientRect();
    
    dragOffset = {
      x: event.clientX - elementRect.left,
      y: event.clientY - elementRect.top
    };
    
    event.preventDefault();
  }
  
  // 드래그 중
  function handleDrag(event: MouseEvent) {
    if (!isDragging || !selectedElement || !editorContainer) return;
    
    const rect = editorContainer.getBoundingClientRect();
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    // 경계 체크
    const clampedX = Math.max(0, Math.min(100 - selectedElement.position.width, x));
    const clampedY = Math.max(0, Math.min(100 - selectedElement.position.height, y));
    
    // 요소 위치 업데이트
    selectedElement.position.x = clampedX;
    selectedElement.position.y = clampedY;
    
    // 반응성을 위해 템플릿 데이터 업데이트
    templateData = { ...templateData };
    dispatch('templateUpdated', templateData);
  }
  
  // 드래그 종료
  function endDrag() {
    isDragging = false;
  }
  
  // 텍스트 요소 값 변경
  function updateElementText(elementId: string, value: string) {
    const element = templateData.layout.elements.find(el => el.id === elementId);
    if (element && element.content) {
      element.content.text = value;
      elementValues[elementId] = value;
      templateData = { ...templateData };
      dispatch('templateUpdated', templateData);
    }
  }
  
  // 요소 삭제
  function deleteElement(element: TemplateElement) {
    if (!element.constraints?.editable) return;
    
    templateData.layout.elements = templateData.layout.elements.filter(el => el.id !== element.id);
    selectedElement = null;
    templateData = { ...templateData };
    dispatch('templateUpdated', templateData);
    dispatch('elementSelected', null);
  }
  
  // 이미지 업로드 처리
  function handleImageUpload(element: TemplateElement, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // 실제 구현에서는 서버에 업로드하고 URL을 받아야 함
        console.log('Image uploaded for element:', element.id, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // 팀 로고 자동 설정
  function setTeamLogo() {
    if (!selectedTeam) return;
    
    const logoElement = templateData.layout.elements.find(el => el.type === 'logo');
    if (logoElement) {
      // 실제 구현에서는 팀 로고 이미지 URL 설정
      console.log('Setting team logo for:', selectedTeam.name);
    }
  }
  
  // 팀 컬러 적용
  function applyTeamColors() {
    if (!selectedTeam) return;
    
    // 배경과 테두리에 팀 컬러 적용
    templateData.style.background.value = `linear-gradient(135deg, ${selectedTeam.colors.primary}, ${selectedTeam.colors.secondary})`;
    templateData.style.border.color = selectedTeam.colors.primary;
    
    templateData = { ...templateData };
    dispatch('templateUpdated', templateData);
  }
  
  // 내보내기 요청
  function requestExport() {
    dispatch('exportRequested');
  }
  
  // 요소 스타일 계산
  function getElementStyle(element: TemplateElement): string {
    const baseStyle = `
      position: absolute;
      left: ${element.position.x}%;
      top: ${element.position.y}%;
      width: ${element.position.width}%;
      height: ${element.position.height}%;
      z-index: ${element.style?.zIndex || 1};
    `;
    
    const textStyle = element.type === 'text' ? `
      font-size: ${element.style?.fontSize || 16}px;
      font-weight: ${element.style?.fontWeight || 'normal'};
      color: ${element.style?.color || '#000000'};
      text-align: ${element.style?.textAlign || 'left'};
    ` : '';
    
    const interactionStyle = editable && selectedElement?.id === element.id ? `
      outline: 2px solid var(--apple-accent-blue);
      outline-offset: 2px;
    ` : '';
    
    return baseStyle + textStyle + interactionStyle;
  }
  
  // 컨테이너 스타일 계산
  function getContainerStyle(): string {
    const background = templateData.style.background;
    let backgroundStyle = '';
    
    switch (background.type) {
      case 'gradient':
        backgroundStyle = `background: ${background.value};`;
        break;
      case 'pattern':
        backgroundStyle = `background: ${background.value};`;
        break;
      case 'image':
        backgroundStyle = `background-image: url(${background.value}); background-size: cover; background-position: center;`;
        break;
    }
    
    if (background.overlay) {
      backgroundStyle += `background-image: ${background.overlay}, ${backgroundStyle.replace('background:', '').replace(';', '')};`;
    }
    
    const borderStyle = `
      border: ${templateData.style.border.width}px ${templateData.style.border.style} ${templateData.style.border.color};
      border-radius: 16px;
    `;
    
    return backgroundStyle + borderStyle;
  }
  
  // 반응형 처리
  $: aspectRatio = templateData.layout.type === 'portrait' ? '3/4' : 
                   templateData.layout.type === 'landscape' ? '4/3' : '1/1';
</script>

<svelte:window 
  on:mousemove={handleDrag}
  on:mouseup={endDrag}
/>

<div class="template-editor">
  <!-- 편집기 헤더 -->
  <div class="editor-header">
    <div class="template-info">
      <h3 class="template-title">{templateData.name}</h3>
      <p class="template-description">{templateData.description}</p>
    </div>
    
    <div class="editor-actions">
      {#if selectedTeam}
        <button 
          class="action-button team-colors"
          on:click={applyTeamColors}
          title="팀 컬러 적용"
        >
          <span class="team-color-preview" style="background: {selectedTeam.colors.primary}"></span>
          팀 컬러 적용
        </button>
      {/if}
      
      <button 
        class="action-button export"
        on:click={requestExport}
        title="카드 내보내기"
      >
        📤 내보내기
      </button>
    </div>
  </div>
  
  <!-- 메인 편집 영역 -->
  <div class="editor-main">
    <!-- 템플릿 캔버스 -->
    <div class="template-canvas">
      <div 
        bind:this={editorContainer}
        class="template-container"
        class:portrait={templateData.layout.type === 'portrait'}
        class:landscape={templateData.layout.type === 'landscape'}
        class:square={templateData.layout.type === 'square'}
        style="{getContainerStyle()}; aspect-ratio: {aspectRatio};"
        on:click={() => {
          selectedElement = null;
          dispatch('elementSelected', null);
        }}
        role="button"
        tabindex="0"
        on:keydown={() => {}}
      >
        <!-- 템플릿 요소들 -->
        {#each templateData.layout.elements as element (element.id)}
          <div
            class="template-element element-{element.type}"
            class:selected={selectedElement?.id === element.id}
            class:editable={element.constraints?.editable}
            class:movable={element.constraints?.movable}
            style={getElementStyle(element)}
            on:click={(e) => selectElement(element, e)}
            on:mousedown={(e) => startDrag(element, e)}
            role="button"
            tabindex="0"
            on:keydown={() => {}}
          >
            {#if element.type === 'text'}
              {#if editable && element.constraints?.editable}
                <textarea
                  class="text-input"
                  value={elementValues[element.id] || element.content?.text || ''}
                  placeholder={element.content?.placeholder || '텍스트를 입력하세요'}
                  maxlength={element.content?.maxLength}
                  on:input={(e) => updateElementText(element.id, e.currentTarget.value)}
                  on:click={(e) => e.stopPropagation()}
                ></textarea>
              {:else}
                <div class="text-display">
                  {elementValues[element.id] || element.content?.text || element.content?.placeholder || ''}
                </div>
              {/if}
            
            {:else if element.type === 'image'}
              <div class="image-container">
                {#if userImage}
                  <img src={userImage} alt="사용자 이미지" class="user-image" />
                {:else if editable}
                  <label class="image-upload">
                    <input 
                      type="file" 
                      accept="image/*" 
                      on:change={(e) => handleImageUpload(element, e)}
                      style="display: none;"
                    />
                    <div class="upload-placeholder">
                      <div class="upload-icon">📷</div>
                      <div class="upload-text">이미지 업로드</div>
                    </div>
                  </label>
                {:else}
                  <div class="image-placeholder">
                    <div class="placeholder-icon">🖼️</div>
                  </div>
                {/if}
              </div>
            
            {:else if element.type === 'logo'}
              <div class="logo-container">
                {#if selectedTeam}
                  <div class="team-logo" style="color: {selectedTeam.colors.primary}">
                    {selectedTeam.name}
                  </div>
                {:else}
                  <div class="logo-placeholder">🏆</div>
                {/if}
              </div>
            
            {:else if element.type === 'stats'}
              <div class="stats-container">
                {#if editable && element.constraints?.editable}
                  <textarea
                    class="stats-input"
                    value={elementValues[element.id] || element.content?.text || ''}
                    placeholder={element.content?.placeholder || '통계 정보'}
                    on:input={(e) => updateElementText(element.id, e.currentTarget.value)}
                    on:click={(e) => e.stopPropagation()}
                  ></textarea>
                {:else}
                  <div class="stats-display">
                    {elementValues[element.id] || element.content?.text || '📊'}
                  </div>
                {/if}
              </div>
            
            {:else if element.type === 'decoration'}
              <div class="decoration-element">✨</div>
            {/if}
            
            <!-- 선택된 요소 컨트롤 -->
            {#if editable && selectedElement?.id === element.id}
              <div class="element-controls">
                {#if element.constraints?.editable}
                  <button 
                    class="control-button delete"
                    on:click={() => deleteElement(element)}
                    title="삭제"
                  >
                    🗑️
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    
    <!-- 속성 패널 -->
    {#if editable && selectedElement}
      <div class="properties-panel">
        <h4 class="panel-title">요소 속성</h4>
        
        <div class="property-group">
          <label class="property-label">요소 타입</label>
          <div class="property-value">{selectedElement.type}</div>
        </div>
        
        <div class="property-group">
          <label class="property-label">위치</label>
          <div class="position-controls">
            <input 
              type="number" 
              min="0" 
              max="100" 
              step="1"
              bind:value={selectedElement.position.x}
              on:input={() => {
                templateData = { ...templateData };
                dispatch('templateUpdated', templateData);
              }}
            />
            <span>%</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              step="1"
              bind:value={selectedElement.position.y}
              on:input={() => {
                templateData = { ...templateData };
                dispatch('templateUpdated', templateData);
              }}
            />
            <span>%</span>
          </div>
        </div>
        
        <div class="property-group">
          <label class="property-label">크기</label>
          <div class="size-controls">
            <input 
              type="number" 
              min="1" 
              max="100" 
              step="1"
              bind:value={selectedElement.position.width}
              on:input={() => {
                templateData = { ...templateData };
                dispatch('templateUpdated', templateData);
              }}
            />
            <span>%</span>
            <input 
              type="number" 
              min="1" 
              max="100" 
              step="1"
              bind:value={selectedElement.position.height}
              on:input={() => {
                templateData = { ...templateData };
                dispatch('templateUpdated', templateData);
              }}
            />
            <span>%</span>
          </div>
        </div>
        
        {#if selectedElement.type === 'text' && selectedElement.style}
          <div class="property-group">
            <label class="property-label">폰트 크기</label>
            <input 
              type="number" 
              min="8" 
              max="72" 
              bind:value={selectedElement.style.fontSize}
              on:input={() => {
                templateData = { ...templateData };
                dispatch('templateUpdated', templateData);
              }}
            />
          </div>
          
          <div class="property-group">
            <label class="property-label">텍스트 색상</label>
            <input 
              type="color" 
              bind:value={selectedElement.style.color}
              on:input={() => {
                templateData = { ...templateData };
                dispatch('templateUpdated', templateData);
              }}
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- 편집 가이드 -->
  {#if editable}
    <div class="editor-guide">
      <div class="guide-item">
        <span class="guide-icon">🖱️</span>
        <span class="guide-text">요소를 클릭하여 선택하고 드래그하여 이동</span>
      </div>
      <div class="guide-item">
        <span class="guide-icon">⌨️</span>
        <span class="guide-text">Delete 키로 선택된 요소 삭제, Esc로 선택 해제</span>
      </div>
      <div class="guide-item">
        <span class="guide-icon">🎨</span>
        <span class="guide-text">오른쪽 패널에서 선택된 요소의 속성 조정</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .template-editor {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    background: var(--apple-surface-primary);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--apple-shadow-lg);
  }
  
  /* 편집기 헤더 */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .template-info {
    flex: 1;
  }
  
  .template-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px;
    color: var(--apple-text-primary);
  }
  
  .template-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0;
  }
  
  .editor-actions {
    display: flex;
    gap: 12px;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button:hover {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }
  
  .action-button.team-colors {
    background: var(--apple-accent-green);
  }
  
  .action-button.team-colors:hover {
    background: var(--apple-accent-green-hover);
  }
  
  .team-color-preview {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  /* 메인 편집 영역 */
  .editor-main {
    display: flex;
    min-height: 600px;
  }
  
  .template-canvas {
    flex: 1;
    padding: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--apple-surface-tertiary);
  }
  
  .template-container {
    position: relative;
    max-width: 400px;
    width: 100%;
    background: white;
    overflow: hidden;
    cursor: default;
    user-select: none;
  }
  
  .template-container.portrait {
    max-width: 300px;
  }
  
  .template-container.landscape {
    max-width: 500px;
  }
  
  .template-container.square {
    max-width: 400px;
  }
  
  /* 템플릿 요소 */
  .template-element {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: outline var(--apple-duration-fast) var(--apple-easing-smooth);
    border-radius: 4px;
  }
  
  .template-element.editable {
    cursor: pointer;
  }
  
  .template-element.movable {
    cursor: move;
  }
  
  .template-element.selected {
    outline: 2px solid var(--apple-accent-blue);
    outline-offset: 2px;
  }
  
  .template-element:hover.editable {
    outline: 1px solid var(--apple-accent-blue);
    outline-offset: 1px;
  }
  
  /* 텍스트 요소 */
  .text-input,
  .stats-input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    text-align: inherit;
    line-height: 1.2;
    padding: 4px;
  }
  
  .text-display,
  .stats-display {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.2;
    white-space: pre-line;
    word-break: break-word;
  }
  
  /* 이미지 요소 */
  .image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--apple-surface-secondary);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .user-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-upload {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .image-upload:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .upload-placeholder {
    text-align: center;
    color: var(--apple-text-secondary);
  }
  
  .upload-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
  
  .upload-text {
    font-size: 12px;
    font-weight: 500;
  }
  
  .image-placeholder,
  .logo-placeholder {
    font-size: 32px;
    opacity: 0.5;
  }
  
  /* 로고 요소 */
  .logo-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .team-logo {
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
  }
  
  /* 통계 요소 */
  .stats-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  /* 장식 요소 */
  .decoration-element {
    font-size: 24px;
    opacity: 0.8;
  }
  
  /* 요소 컨트롤 */
  .element-controls {
    position: absolute;
    top: -12px;
    right: -12px;
    display: flex;
    gap: 4px;
  }
  
  .control-button {
    width: 24px;
    height: 24px;
    background: var(--apple-accent-red);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .control-button:hover {
    transform: scale(1.1);
  }
  
  /* 속성 패널 */
  .properties-panel {
    width: 280px;
    background: var(--apple-surface-secondary);
    border-left: 1px solid var(--apple-surface-border);
    padding: 20px;
    overflow-y: auto;
  }
  
  .panel-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 20px;
    color: var(--apple-text-primary);
  }
  
  .property-group {
    margin-bottom: 16px;
  }
  
  .property-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .property-value {
    font-size: 14px;
    color: var(--apple-text-primary);
    padding: 8px 12px;
    background: var(--apple-surface-tertiary);
    border-radius: 6px;
  }
  
  .position-controls,
  .size-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .position-controls input,
  .size-controls input,
  .property-group input[type="number"],
  .property-group input[type="color"] {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    background: var(--apple-surface-primary);
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  .property-group input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 2px;
    cursor: pointer;
  }
  
  .position-controls span,
  .size-controls span {
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  /* 편집 가이드 */
  .editor-guide {
    padding: 16px 24px;
    background: var(--apple-surface-secondary);
    border-top: 1px solid var(--apple-surface-border);
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .guide-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  .guide-icon {
    font-size: 14px;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .editor-main {
      flex-direction: column;
    }
    
    .properties-panel {
      width: 100%;
      max-height: 300px;
    }
    
    .template-canvas {
      padding: 16px;
    }
  }
  
  @media (max-width: 768px) {
    .editor-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
    
    .editor-actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .template-container {
      max-width: 280px;
    }
    
    .editor-guide {
      flex-direction: column;
      gap: 12px;
    }
  }
</style>