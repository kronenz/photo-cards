<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GloryMomentTemplate, TemplateElement, KBOTeam } from '../data/kboTemplates.js';
  import AdvancedTextEditor from './AdvancedTextEditor.svelte';
  
  // Props
  export let template: GloryMomentTemplate;
  export let selectedTeam: KBOTeam | null = null;
  export let userImage: string | null = null;
  
  // 상태 관리
  let canvasElement: HTMLElement;
  let selectedElementId: string | null = null;
  let isDragging = false;
  let isResizing = false;
  let dragStartPos = { x: 0, y: 0 };
  let elementStartPos = { x: 0, y: 0 };
  let resizeHandle = '';
  let canvasRect: DOMRect;
  let scale = 1;
  let showGrid = true;
  let snapToGrid = true;
  let gridSize = 10;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    templateUpdated: GloryMomentTemplate;
    elementSelected: TemplateElement | null;
    exportRequested: void;
  }>();
  
  onMount(() => {
    if (!browser) return;
    
    updateCanvasRect();
    window.addEventListener('resize', updateCanvasRect);
    
    return () => {
      window.removeEventListener('resize', updateCanvasRect);
    };
  });
  
  // 캔버스 크기 업데이트
  function updateCanvasRect() {
    if (canvasElement) {
      canvasRect = canvasElement.getBoundingClientRect();
    }
  }
  
  // 요소 선택
  function selectElement(elementId: string | null) {
    selectedElementId = elementId;
    const element = elementId ? template.layout.elements.find(el => el.id === elementId) : null;
    dispatch('elementSelected', element);
  }
  
  // 마우스 다운 (드래그 시작)
  function handleMouseDown(event: MouseEvent, elementId: string) {
    if (!canvasRect) updateCanvasRect();
    
    event.preventDefault();
    event.stopPropagation();
    
    selectElement(elementId);
    
    const target = event.target as HTMLElement;
    const isResizeHandle = target.classList.contains('resize-handle');
    
    if (isResizeHandle) {
      isResizing = true;
      resizeHandle = target.dataset.handle || '';
    } else {
      isDragging = true;
    }
    
    dragStartPos = {
      x: event.clientX,
      y: event.clientY
    };
    
    const element = template.layout.elements.find(el => el.id === elementId);
    if (element) {
      elementStartPos = {
        x: element.position.x,
        y: element.position.y
      };
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // 마우스 이동 (드래그/리사이즈)
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging && !isResizing) return;
    if (!selectedElementId || !canvasRect) return;
    
    const element = template.layout.elements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    const deltaX = event.clientX - dragStartPos.x;
    const deltaY = event.clientY - dragStartPos.y;
    
    if (isDragging) {
      // 드래그 처리
      const newX = elementStartPos.x + (deltaX / canvasRect.width) * 100;
      const newY = elementStartPos.y + (deltaY / canvasRect.height) * 100;
      
      element.position.x = snapToGrid ? Math.round(newX / gridSize) * gridSize : newX;
      element.position.y = snapToGrid ? Math.round(newY / gridSize) * gridSize : newY;
      
      // 경계 제한
      element.position.x = Math.max(0, Math.min(100 - element.position.width, element.position.x));
      element.position.y = Math.max(0, Math.min(100 - element.position.height, element.position.y));
      
    } else if (isResizing) {
      // 리사이즈 처리
      const deltaWidthPercent = (deltaX / canvasRect.width) * 100;
      const deltaHeightPercent = (deltaY / canvasRect.height) * 100;
      
      switch (resizeHandle) {
        case 'se': // 남동쪽
          element.position.width = Math.max(5, element.position.width + deltaWidthPercent);
          element.position.height = Math.max(5, element.position.height + deltaHeightPercent);
          break;
        case 'sw': // 남서쪽
          element.position.width = Math.max(5, element.position.width - deltaWidthPercent);
          element.position.height = Math.max(5, element.position.height + deltaHeightPercent);
          element.position.x = Math.max(0, element.position.x + deltaWidthPercent);
          break;
        case 'ne': // 북동쪽
          element.position.width = Math.max(5, element.position.width + deltaWidthPercent);
          element.position.height = Math.max(5, element.position.height - deltaHeightPercent);
          element.position.y = Math.max(0, element.position.y + deltaHeightPercent);
          break;
        case 'nw': // 북서쪽
          element.position.width = Math.max(5, element.position.width - deltaWidthPercent);
          element.position.height = Math.max(5, element.position.height - deltaHeightPercent);
          element.position.x = Math.max(0, element.position.x + deltaWidthPercent);
          element.position.y = Math.max(0, element.position.y + deltaHeightPercent);
          break;
        case 'e': // 동쪽
          element.position.width = Math.max(5, element.position.width + deltaWidthPercent);
          break;
        case 'w': // 서쪽
          element.position.width = Math.max(5, element.position.width - deltaWidthPercent);
          element.position.x = Math.max(0, element.position.x + deltaWidthPercent);
          break;
        case 'n': // 북쪽
          element.position.height = Math.max(5, element.position.height - deltaHeightPercent);
          element.position.y = Math.max(0, element.position.y + deltaHeightPercent);
          break;
        case 's': // 남쪽
          element.position.height = Math.max(5, element.position.height + deltaHeightPercent);
          break;
      }
      
      // 경계 제한
      if (element.position.x + element.position.width > 100) {
        element.position.width = 100 - element.position.x;
      }
      if (element.position.y + element.position.height > 100) {
        element.position.height = 100 - element.position.y;
      }
    }
    
    // 템플릿 업데이트
    template = { ...template };
    dispatch('templateUpdated', template);
  }
  
  // 마우스 업 (드래그/리사이즈 종료)
  function handleMouseUp() {
    isDragging = false;
    isResizing = false;
    resizeHandle = '';
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  // 캔버스 클릭 (요소 선택 해제)
  function handleCanvasClick(event: MouseEvent) {
    if (event.target === canvasElement) {
      selectElement(null);
    }
  }
  
  // 요소 더블클릭 (편집 모드)
  function handleElementDoubleClick(elementId: string) {
    const element = template.layout.elements.find(el => el.id === elementId);
    if (element && element.type === 'text') {
      // 텍스트 편집 모드 활성화
      console.log('텍스트 편집 모드:', elementId);
    }
  }
  
  // 키보드 단축키
  function handleKeyDown(event: KeyboardEvent) {
    if (!selectedElementId) return;
    
    const element = template.layout.elements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    let moved = false;
    const step = event.shiftKey ? 10 : 1;
    
    switch (event.key) {
      case 'ArrowLeft':
        element.position.x = Math.max(0, element.position.x - step);
        moved = true;
        break;
      case 'ArrowRight':
        element.position.x = Math.min(100 - element.position.width, element.position.x + step);
        moved = true;
        break;
      case 'ArrowUp':
        element.position.y = Math.max(0, element.position.y - step);
        moved = true;
        break;
      case 'ArrowDown':
        element.position.y = Math.min(100 - element.position.height, element.position.y + step);
        moved = true;
        break;
      case 'Delete':
      case 'Backspace':
        // 요소 삭제
        template.layout.elements = template.layout.elements.filter(el => el.id !== selectedElementId);
        selectElement(null);
        moved = true;
        break;
    }
    
    if (moved) {
      event.preventDefault();
      template = { ...template };
      dispatch('templateUpdated', template);
    }
  }
  
  // 새 요소 추가
  function addElement(type: string) {
    const newElement: TemplateElement = {
      id: `element-${Date.now()}`,
      type: type as any,
      position: {
        x: 20 + Math.random() * 20,
        y: 20 + Math.random() * 20,
        width: type === 'text' ? 30 : 25,
        height: type === 'text' ? 10 : 20
      },
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        color: selectedTeam?.colors.primary || '#FFFFFF',
        textAlign: 'center',
        zIndex: template.layout.elements.length + 1,
        opacity: 1
      },
      content: {
        text: type === 'text' ? '새 텍스트' : '',
        placeholder: `${type} 내용`,
        required: false
      },
      constraints: {
        editable: true,
        movable: true,
        resizable: true
      }
    };
    
    template.layout.elements = [...template.layout.elements, newElement];
    selectElement(newElement.id);
    dispatch('templateUpdated', template);
  }
  
  // 줌 조절
  function adjustZoom(delta: number) {
    scale = Math.max(0.25, Math.min(2, scale + delta));
  }
  
  // 그리드 토글
  function toggleGrid() {
    showGrid = !showGrid;
  }
  
  // 스냅 토글
  function toggleSnap() {
    snapToGrid = !snapToGrid;
  }
  
  // 내보내기
  function exportTemplate() {
    dispatch('exportRequested');
  }
  
  // 선택된 요소
  $: selectedElement = selectedElementId 
    ? template.layout.elements.find(el => el.id === selectedElementId)
    : null;
  
  // 캔버스 스타일
  $: canvasStyle = `
    background: ${template.style.background.value};
    transform: scale(${scale});
    border: ${template.style.border.width}px ${template.style.border.style} ${selectedTeam?.colors.primary || template.style.border.color};
  `;
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="template-editor">
  <!-- 도구바 -->
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="tool-button" on:click={() => addElement('text')} title="텍스트 추가">
        📝 텍스트
      </button>
      <button class="tool-button" on:click={() => addElement('image')} title="이미지 추가">
        🖼️ 이미지
      </button>
      <button class="tool-button" on:click={() => addElement('logo')} title="로고 추가">
        🏆 로고
      </button>
      <button class="tool-button" on:click={() => addElement('decoration')} title="장식 추가">
        ✨ 장식
      </button>
    </div>
    
    <div class="toolbar-group">
      <button 
        class="tool-button"
        class:active={showGrid}
        on:click={toggleGrid}
        title="그리드 표시"
      >
        📐 그리드
      </button>
      <button 
        class="tool-button"
        class:active={snapToGrid}
        on:click={toggleSnap}
        title="그리드에 맞춤"
      >
        🧲 스냅
      </button>
    </div>
    
    <div class="toolbar-group">
      <button class="tool-button" on:click={() => adjustZoom(-0.25)} title="축소">
        🔍➖
      </button>
      <span class="zoom-level">{Math.round(scale * 100)}%</span>
      <button class="tool-button" on:click={() => adjustZoom(0.25)} title="확대">
        🔍➕
      </button>
    </div>
    
    <div class="toolbar-group">
      <button class="tool-button export" on:click={exportTemplate} title="내보내기">
        📤 내보내기
      </button>
    </div>
  </div>
  
  <!-- 캔버스 컨테이너 -->
  <div class="canvas-container">
    <div class="canvas-wrapper">
      <!-- 캔버스 -->
      <div
        bind:this={canvasElement}
        class="canvas"
        class:show-grid={showGrid}
        style={canvasStyle}
        on:click={handleCanvasClick}
        role="application"
        aria-label="카드 편집 캔버스"
      >
        <!-- 그리드 -->
        {#if showGrid}
          <div class="grid-overlay" style="--grid-size: {gridSize}px"></div>
        {/if}
        
        <!-- 템플릿 요소들 -->
        {#each template.layout.elements as element (element.id)}
          <div
            class="template-element"
            class:selected={selectedElementId === element.id}
            class:dragging={isDragging && selectedElementId === element.id}
            style="
              left: {element.position.x}%;
              top: {element.position.y}%;
              width: {element.position.width}%;
              height: {element.position.height}%;
              z-index: {element.style?.zIndex || 1};
              opacity: {element.style?.opacity || 1};
            "
            on:mousedown={(e) => handleMouseDown(e, element.id)}
            on:dblclick={() => handleElementDoubleClick(element.id)}
            role="button"
            tabindex="0"
            aria-label={`${element.type} 요소`}
          >
            <!-- 요소 내용 -->
            <div class="element-content">
              {#if element.type === 'text'}
                <AdvancedTextEditor
                  bind:value={element.content.text}
                  placeholder={element.content?.placeholder || '텍스트 입력'}
                  fontSize={element.style?.fontSize || 16}
                  fontWeight={element.style?.fontWeight || 'normal'}
                  textAlign={element.style?.textAlign || 'center'}
                  color={element.style?.color || '#FFFFFF'}
                  editable={element.constraints?.editable !== false}
                  multiline={true}
                  on:change={() => dispatch('templateUpdated', template)}
                />
              {:else if element.type === 'image'}
                <div class="image-placeholder">
                  {#if userImage}
                    <img src={userImage} alt="사용자 이미지" class="element-image" />
                  {:else}
                    <div class="placeholder-content">
                      <span class="placeholder-icon">🖼️</span>
                      <span class="placeholder-text">이미지</span>
                    </div>
                  {/if}
                </div>
              {:else if element.type === 'logo' && selectedTeam}
                <div class="logo-element">
                  <div 
                    class="team-logo-circle"
                    style="background: {selectedTeam.colors.primary}"
                  >
                    ⚾
                  </div>
                  <div class="team-name">{selectedTeam.name}</div>
                </div>
              {:else if element.type === 'decoration'}
                <div class="decoration-element">
                  <span class="decoration-icon">✨</span>
                </div>
              {:else}
                <div class="placeholder-content">
                  <span class="placeholder-icon">📄</span>
                  <span class="placeholder-text">{element.type}</span>
                </div>
              {/if}
            </div>
            
            <!-- 선택 표시 및 리사이즈 핸들 -->
            {#if selectedElementId === element.id && element.constraints?.resizable !== false}
              <div class="selection-outline"></div>
              
              <!-- 리사이즈 핸들 -->
              <div class="resize-handle nw" data-handle="nw"></div>
              <div class="resize-handle n" data-handle="n"></div>
              <div class="resize-handle ne" data-handle="ne"></div>
              <div class="resize-handle e" data-handle="e"></div>
              <div class="resize-handle se" data-handle="se"></div>
              <div class="resize-handle s" data-handle="s"></div>
              <div class="resize-handle sw" data-handle="sw"></div>
              <div class="resize-handle w" data-handle="w"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .template-editor {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--apple-surface-secondary);
  }
  
  /* 도구바 */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    background: var(--apple-surface-primary);
    border-bottom: 1px solid var(--apple-surface-border);
    flex-wrap: wrap;
  }
  
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    border-right: 1px solid var(--apple-surface-border);
  }
  
  .toolbar-group:last-child {
    border-right: none;
  }
  
  .tool-button {
    padding: 8px 12px;
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    color: var(--apple-text-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    white-space: nowrap;
  }
  
  .tool-button:hover {
    background: var(--apple-surface-tertiary);
    border-color: var(--apple-accent-blue);
  }
  
  .tool-button.active {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
  }
  
  .tool-button.export {
    background: var(--apple-accent-green);
    color: white;
    border-color: var(--apple-accent-green);
  }
  
  .tool-button.export:hover {
    background: var(--apple-accent-green-hover);
  }
  
  .zoom-level {
    font-size: 13px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    min-width: 40px;
    text-align: center;
  }
  
  /* 캔버스 컨테이너 */
  .canvas-container {
    flex: 1;
    overflow: auto;
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .canvas-wrapper {
    position: relative;
  }
  
  /* 캔버스 */
  .canvas {
    position: relative;
    width: 400px;
    height: 560px;
    border-radius: 20px;
    overflow: hidden;
    cursor: default;
    transform-origin: center;
    transition: transform var(--apple-duration-normal) var(--apple-easing-smooth);
    box-shadow: var(--apple-shadow-xl);
  }
  
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: var(--grid-size) var(--grid-size);
    pointer-events: none;
    z-index: 1;
  }
  
  /* 템플릿 요소 */
  .template-element {
    position: absolute;
    cursor: move;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    z-index: 2;
  }
  
  .template-element:hover {
    outline: 2px solid rgba(0, 122, 255, 0.3);
    outline-offset: -2px;
  }
  
  .template-element.selected {
    outline: 2px solid var(--apple-accent-blue);
    outline-offset: -2px;
  }
  
  .template-element.dragging {
    cursor: grabbing;
    transform: scale(1.02);
    z-index: 1000;
  }
  
  .element-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  /* 요소 타입별 스타일 */
  .image-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .element-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
  
  .logo-element {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: white;
  }
  
  .team-logo-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
  }
  
  .team-name {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }
  
  .decoration-element {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  .decoration-icon {
    font-size: 24px;
    animation: sparkle 2s infinite;
  }
  
  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }
  
  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .placeholder-icon {
    font-size: 24px;
    opacity: 0.7;
  }
  
  .placeholder-text {
    font-size: 12px;
    font-weight: 500;
  }
  
  /* 선택 표시 */
  .selection-outline {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid var(--apple-accent-blue);
    border-radius: 4px;
    pointer-events: none;
  }
  
  /* 리사이즈 핸들 */
  .resize-handle {
    position: absolute;
    background: var(--apple-accent-blue);
    border: 2px solid white;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    z-index: 1001;
  }
  
  .resize-handle.nw { top: -6px; left: -6px; cursor: nw-resize; }
  .resize-handle.n { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
  .resize-handle.ne { top: -6px; right: -6px; cursor: ne-resize; }
  .resize-handle.e { top: 50%; right: -6px; transform: translateY(-50%); cursor: e-resize; }
  .resize-handle.se { bottom: -6px; right: -6px; cursor: se-resize; }
  .resize-handle.s { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
  .resize-handle.sw { bottom: -6px; left: -6px; cursor: sw-resize; }
  .resize-handle.w { top: 50%; left: -6px; transform: translateY(-50%); cursor: w-resize; }
  
  .resize-handle:hover {
    background: var(--apple-accent-blue-hover);
    transform: scale(1.2);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .canvas-container {
      padding: 20px;
    }
    
    .canvas {
      width: 300px;
      height: 420px;
    }
  }
  
  @media (max-width: 768px) {
    .toolbar {
      padding: 8px 12px;
      gap: 8px;
    }
    
    .toolbar-group {
      gap: 4px;
      padding: 0 4px;
    }
    
    .tool-button {
      padding: 6px 8px;
      font-size: 12px;
    }
    
    .canvas-container {
      padding: 16px;
    }
    
    .canvas {
      width: 250px;
      height: 350px;
    }
  }
</style>