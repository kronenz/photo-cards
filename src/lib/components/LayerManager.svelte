<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TemplateElement } from '../data/kboTemplates.js';
  
  // Props
  export let elements: TemplateElement[] = [];
  export let selectedElementId: string | null = null;
  
  // 레이어 타입 아이콘 매핑
  const typeIcons: Record<string, string> = {
    text: '📝',
    image: '🖼️',
    logo: '🏆',
    decoration: '✨',
    stats: '📊'
  };
  
  // 레이어 타입 이름 매핑
  const typeNames: Record<string, string> = {
    text: '텍스트',
    image: '이미지',
    logo: '로고',
    decoration: '장식',
    stats: '통계'
  };
  
  // 상태 관리
  let draggedElement: TemplateElement | null = null;
  let dragOverIndex = -1;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    elementSelect: string;
    elementReorder: { fromIndex: number; toIndex: number };
    elementToggleVisibility: string;
    elementDuplicate: string;
    elementDelete: string;
    elementLock: string;
  }>();
  
  // 요소 선택
  function selectElement(elementId: string) {
    dispatch('elementSelect', elementId);
  }
  
  // 드래그 시작
  function handleDragStart(event: DragEvent, element: TemplateElement, index: number) {
    if (!event.dataTransfer) return;
    
    draggedElement = element;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', element.id);
    
    // 드래그 이미지 커스터마이징
    const dragImage = event.target as HTMLElement;
    dragImage.style.opacity = '0.5';
  }
  
  // 드래그 오버
  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    
    event.dataTransfer.dropEffect = 'move';
    dragOverIndex = index;
  }
  
  // 드래그 리브
  function handleDragLeave() {
    dragOverIndex = -1;
  }
  
  // 드롭
  function handleDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    
    if (!draggedElement) return;
    
    const dragIndex = elements.findIndex(el => el.id === draggedElement!.id);
    
    if (dragIndex !== -1 && dragIndex !== dropIndex) {
      dispatch('elementReorder', { fromIndex: dragIndex, toIndex: dropIndex });
    }
    
    // 상태 초기화
    draggedElement = null;
    dragOverIndex = -1;
    
    // 드래그 이미지 복원
    const draggedEl = event.target as HTMLElement;
    draggedEl.style.opacity = '1';
  }
  
  // 드래그 종료
  function handleDragEnd(event: DragEvent) {
    const draggedEl = event.target as HTMLElement;
    draggedEl.style.opacity = '1';
    draggedElement = null;
    dragOverIndex = -1;
  }
  
  // 가시성 토글
  function toggleVisibility(elementId: string) {
    dispatch('elementToggleVisibility', elementId);
  }
  
  // 요소 복제
  function duplicateElement(elementId: string) {
    dispatch('elementDuplicate', elementId);
  }
  
  // 요소 삭제
  function deleteElement(elementId: string) {
    dispatch('elementDelete', elementId);
  }
  
  // 요소 잠금
  function lockElement(elementId: string) {
    dispatch('elementLock', elementId);
  }
  
  // Z-Index 기준으로 정렬된 요소들
  $: sortedElements = [...elements].sort((a, b) => (b.style?.zIndex || 0) - (a.style?.zIndex || 0));
</script>

<div class="layer-manager">
  <!-- 헤더 -->
  <div class="manager-header">
    <h3 class="manager-title">
      <span class="title-icon">📚</span>
      레이어 관리
    </h3>
    <div class="layer-count">
      {elements.length}개 레이어
    </div>
  </div>
  
  <!-- 레이어 목록 -->
  <div class="layer-list">
    {#each sortedElements as element, index (element.id)}
      <div
        class="layer-item"
        class:selected={selectedElementId === element.id}
        class:drag-over={dragOverIndex === index}
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, element, index)}
        on:dragover={(e) => handleDragOver(e, index)}
        on:dragleave={handleDragLeave}
        on:drop={(e) => handleDrop(e, index)}
        on:dragend={handleDragEnd}
        on:click={() => selectElement(element.id)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && selectElement(element.id)}
      >
        <!-- 드래그 핸들 -->
        <div class="drag-handle">
          <div class="drag-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        
        <!-- 레이어 정보 -->
        <div class="layer-info">
          <div class="layer-main">
            <span class="layer-icon">
              {typeIcons[element.type] || '📄'}
            </span>
            <div class="layer-details">
              <div class="layer-name">
                {typeNames[element.type] || element.type}
                {#if element.content?.text}
                  <span class="layer-preview">
                    "{element.content.text.substring(0, 20)}{element.content.text.length > 20 ? '...' : ''}"
                  </span>
                {/if}
              </div>
              <div class="layer-meta">
                Z: {element.style?.zIndex || 0}
                • {Math.round(element.position.width)}×{Math.round(element.position.height)}
              </div>
            </div>
          </div>
          
          <!-- 레이어 컨트롤 -->
          <div class="layer-controls">
            <button
              class="control-button visibility"
              class:hidden={element.style?.opacity === 0}
              on:click|stopPropagation={() => toggleVisibility(element.id)}
              title={element.style?.opacity === 0 ? '보이기' : '숨기기'}
            >
              {element.style?.opacity === 0 ? '👁️‍🗨️' : '👁️'}
            </button>
            
            <button
              class="control-button lock"
              class:locked={!element.constraints?.movable}
              on:click|stopPropagation={() => lockElement(element.id)}
              title={element.constraints?.movable ? '잠금' : '잠금 해제'}
            >
              {element.constraints?.movable ? '🔓' : '🔒'}
            </button>
            
            <div class="control-dropdown">
              <button class="control-button more" title="더보기">
                ⋯
              </button>
              <div class="dropdown-menu">
                <button
                  class="dropdown-item"
                  on:click|stopPropagation={() => duplicateElement(element.id)}
                >
                  <span class="item-icon">📋</span>
                  복제
                </button>
                <button
                  class="dropdown-item delete"
                  on:click|stopPropagation={() => deleteElement(element.id)}
                >
                  <span class="item-icon">🗑️</span>
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 선택 표시 -->
        {#if selectedElementId === element.id}
          <div class="selection-indicator"></div>
        {/if}
      </div>
    {/each}
    
    <!-- 빈 상태 -->
    {#if elements.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <div class="empty-text">레이어가 없습니다</div>
        <div class="empty-subtitle">요소를 추가하여 시작하세요</div>
      </div>
    {/if}
  </div>
  
  <!-- 레이어 액션 -->
  <div class="layer-actions">
    <div class="action-group">
      <button class="action-button" title="모든 레이어 보이기">
        👁️ 모두 보이기
      </button>
      <button class="action-button" title="모든 레이어 숨기기">
        👁️‍🗨️ 모두 숨기기
      </button>
    </div>
    
    <div class="action-group">
      <button class="action-button" title="레이어 정렬">
        📊 정렬
      </button>
      <button class="action-button" title="레이어 그룹화">
        📁 그룹화
      </button>
    </div>
  </div>
</div>

<style>
  .layer-manager {
    width: 100%;
    max-width: 300px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    overflow: hidden;
  }
  
  /* 헤더 */
  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .manager-title {
    font-size: 16px;
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
  
  .layer-count {
    font-size: 12px;
    color: var(--apple-text-secondary);
    background: var(--apple-surface-tertiary);
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  /* 레이어 목록 */
  .layer-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .layer-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--apple-surface-border);
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    user-select: none;
  }
  
  .layer-item:hover {
    background: var(--apple-surface-secondary);
  }
  
  .layer-item.selected {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .layer-item.selected .layer-meta {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .layer-item.drag-over {
    background: var(--apple-accent-green);
    transform: scale(1.02);
  }
  
  /* 드래그 핸들 */
  .drag-handle {
    margin-right: 12px;
    cursor: grab;
  }
  
  .drag-handle:active {
    cursor: grabbing;
  }
  
  .drag-dots {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
    width: 12px;
    height: 12px;
  }
  
  .dot {
    width: 2px;
    height: 2px;
    background: var(--apple-text-tertiary);
    border-radius: 50%;
  }
  
  .layer-item.selected .dot {
    background: rgba(255, 255, 255, 0.6);
  }
  
  /* 레이어 정보 */
  .layer-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 0;
  }
  
  .layer-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  
  .layer-icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .layer-details {
    flex: 1;
    min-width: 0;
  }
  
  .layer-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .layer-item.selected .layer-name {
    color: white;
  }
  
  .layer-preview {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.7;
    font-style: italic;
  }
  
  .layer-meta {
    font-size: 11px;
    color: var(--apple-text-tertiary);
  }
  
  /* 레이어 컨트롤 */
  .layer-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .control-button {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .control-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .layer-item.selected .control-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .control-button.hidden {
    opacity: 0.5;
  }
  
  .control-button.locked {
    color: var(--apple-accent-red);
  }
  
  /* 드롭다운 */
  .control-dropdown {
    position: relative;
  }
  
  .control-dropdown:hover .dropdown-menu {
    display: block;
  }
  
  .dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    box-shadow: var(--apple-shadow-lg);
    z-index: 1000;
    min-width: 120px;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    font-size: 13px;
    color: var(--apple-text-primary);
    cursor: pointer;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .dropdown-item:hover {
    background: var(--apple-surface-secondary);
  }
  
  .dropdown-item.delete {
    color: var(--apple-accent-red);
  }
  
  .dropdown-item.delete:hover {
    background: var(--apple-accent-red);
    color: white;
  }
  
  .item-icon {
    font-size: 12px;
  }
  
  /* 선택 표시 */
  .selection-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--apple-accent-blue);
  }
  
  /* 빈 상태 */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--apple-text-secondary);
  }
  
  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--apple-text-primary);
  }
  
  .empty-subtitle {
    font-size: 14px;
  }
  
  /* 레이어 액션 */
  .layer-actions {
    padding: 16px;
    background: var(--apple-surface-secondary);
    border-top: 1px solid var(--apple-surface-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .action-group {
    display: flex;
    gap: 8px;
  }
  
  .action-button {
    flex: 1;
    padding: 8px 12px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button:hover {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .layer-manager {
      max-width: 100%;
    }
    
    .layer-item {
      padding: 16px 12px;
    }
    
    .layer-name {
      font-size: 16px;
    }
    
    .control-button {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }
  }
</style>