<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';
  import { fade, slide } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let elements: any[] = [];
  export let selectedElement: any = null;

  let draggedElement: any = null;
  let dragOverIndex = -1;

  // Sort elements by z-index for display
  $: sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  function selectElement(element: any) {
    dispatch('elementSelected', element);
  }

  function toggleVisibility(element: any) {
    dispatch('elementUpdated', {
      id: element.id,
      updates: { visible: !element.visible }
    });
  }

  function toggleLock(element: any) {
    dispatch('elementUpdated', {
      id: element.id,
      updates: { locked: !element.locked }
    });
  }

  function deleteElement(element: any) {
    dispatch('elementDeleted', element.id);
  }

  function duplicateElement(element: any) {
    dispatch('elementDuplicated', element.id);
  }

  function moveLayer(element: any, direction: 'up' | 'down' | 'top' | 'bottom') {
    let newZIndex = element.zIndex;
    
    switch (direction) {
      case 'up':
        newZIndex = Math.min(elements.length - 1, element.zIndex + 1);
        break;
      case 'down':
        newZIndex = Math.max(0, element.zIndex - 1);
        break;
      case 'top':
        newZIndex = elements.length - 1;
        break;
      case 'bottom':
        newZIndex = 0;
        break;
    }

    // Adjust other elements' z-index
    const updatedElements = elements.map(el => {
      if (el.id === element.id) {
        return { ...el, zIndex: newZIndex };
      } else if (direction === 'up' && el.zIndex === newZIndex) {
        return { ...el, zIndex: el.zIndex - 1 };
      } else if (direction === 'down' && el.zIndex === newZIndex) {
        return { ...el, zIndex: el.zIndex + 1 };
      }
      return el;
    });

    dispatch('elementUpdated', {
      id: element.id,
      updates: { zIndex: newZIndex }
    });
  }

  // Drag and drop functionality
  function handleDragStart(event: DragEvent, element: any) {
    draggedElement = element;
    event.dataTransfer!.effectAllowed = 'move';
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    dragOverIndex = index;
  }

  function handleDragLeave() {
    dragOverIndex = -1;
  }

  function handleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    
    if (!draggedElement) return;

    const sourceIndex = sortedElements.findIndex(el => el.id === draggedElement.id);
    
    if (sourceIndex !== targetIndex) {
      // Reorder elements
      const newElements = [...sortedElements];
      const [movedElement] = newElements.splice(sourceIndex, 1);
      newElements.splice(targetIndex, 0, movedElement);

      // Update z-index for all elements
      newElements.forEach((element, index) => {
        dispatch('elementUpdated', {
          id: element.id,
          updates: { zIndex: newElements.length - 1 - index }
        });
      });
    }

    draggedElement = null;
    dragOverIndex = -1;
  }

  function getElementIcon(type: string): string {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'shape': return '⭕';
      case 'particle': return '✨';
      case 'collage': return '🎨';
      default: return '📄';
    }
  }

  function getElementName(element: any): string {
    switch (element.type) {
      case 'text':
        return element.data.content?.substring(0, 20) + (element.data.content?.length > 20 ? '...' : '') || '텍스트';
      case 'image':
        return element.data.alt || '이미지';
      case 'shape':
        return element.data.shape || '도형';
      case 'particle':
        return element.data.type || '파티클';
      case 'collage':
        return '콜라주';
      default:
        return element.type;
    }
  }
</script>

<div class="layer-manager">
  <div class="layer-header">
    <h3>레이어</h3>
    <div class="layer-controls">
      <button
        class="control-btn"
        title="모든 레이어 표시"
        on:click={() => {
          elements.forEach(element => {
            if (!element.visible) {
              dispatch('elementUpdated', {
                id: element.id,
                updates: { visible: true }
              });
            }
          });
        }}
      >
        👁️
      </button>
      <button
        class="control-btn"
        title="모든 레이어 숨김"
        on:click={() => {
          elements.forEach(element => {
            if (element.visible) {
              dispatch('elementUpdated', {
                id: element.id,
                updates: { visible: false }
              });
            }
          });
        }}
      >
        🙈
      </button>
    </div>
  </div>

  <div class="layer-list">
    {#each sortedElements as element, index (element.id)}
      <div
        class="layer-item"
        class:selected={selectedElement?.id === element.id}
        class:drag-over={dragOverIndex === index}
        draggable="true"
        animate:flip={{ duration: 300 }}
        transition:slide={{ duration: 200 }}
        on:click={() => selectElement(element)}
        on:dragstart={(e) => handleDragStart(e, element)}
        on:dragover={(e) => handleDragOver(e, index)}
        on:dragleave={handleDragLeave}
        on:drop={(e) => handleDrop(e, index)}
      >
        <div class="layer-content">
          <div class="layer-info">
            <span class="layer-icon">{getElementIcon(element.type)}</span>
            <span class="layer-name">{getElementName(element)}</span>
            {#if element.locked}
              <span class="lock-indicator">🔒</span>
            {/if}
          </div>

          <div class="layer-actions">
            <button
              class="action-btn"
              class:active={element.visible}
              title={element.visible ? '숨기기' : '표시'}
              on:click|stopPropagation={() => toggleVisibility(element)}
            >
              {element.visible ? '👁️' : '🙈'}
            </button>
            
            <button
              class="action-btn"
              class:active={element.locked}
              title={element.locked ? '잠금 해제' : '잠금'}
              on:click|stopPropagation={() => toggleLock(element)}
            >
              {element.locked ? '🔒' : '🔓'}
            </button>

            <div class="dropdown">
              <button class="action-btn dropdown-toggle" title="더보기">
                ⋮
              </button>
              <div class="dropdown-menu">
                <button on:click|stopPropagation={() => duplicateElement(element)}>
                  📋 복제
                </button>
                <button on:click|stopPropagation={() => moveLayer(element, 'top')}>
                  ⬆️ 맨 앞으로
                </button>
                <button on:click|stopPropagation={() => moveLayer(element, 'up')}>
                  ↗️ 앞으로
                </button>
                <button on:click|stopPropagation={() => moveLayer(element, 'down')}>
                  ↘️ 뒤로
                </button>
                <button on:click|stopPropagation={() => moveLayer(element, 'bottom')}>
                  ⬇️ 맨 뒤로
                </button>
                <hr>
                <button 
                  class="delete-btn"
                  on:click|stopPropagation={() => deleteElement(element)}
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Layer properties preview -->
        {#if selectedElement?.id === element.id}
          <div class="layer-properties" transition:slide={{ duration: 200 }}>
            <div class="property-row">
              <span>위치:</span>
              <span>{Math.round(element.x)}, {Math.round(element.y)}</span>
            </div>
            <div class="property-row">
              <span>크기:</span>
              <span>{Math.round(element.width)} × {Math.round(element.height)}</span>
            </div>
            <div class="property-row">
              <span>회전:</span>
              <span>{element.rotation}°</span>
            </div>
            <div class="property-row">
              <span>투명도:</span>
              <span>{Math.round(element.opacity * 100)}%</span>
            </div>
          </div>
        {/if}
      </div>
    {/each}

    {#if elements.length === 0}
      <div class="empty-state" transition:fade>
        <div class="empty-icon">📄</div>
        <p>레이어가 없습니다</p>
        <p class="empty-hint">캔버스에 요소를 추가해보세요</p>
      </div>
    {/if}
  </div>

  <!-- Layer statistics -->
  <div class="layer-stats">
    <div class="stat-item">
      <span class="stat-label">총 레이어:</span>
      <span class="stat-value">{elements.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">표시:</span>
      <span class="stat-value">{elements.filter(e => e.visible).length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">잠금:</span>
      <span class="stat-value">{elements.filter(e => e.locked).length}</span>
    </div>
  </div>
</div>

<style>
  .layer-manager {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(28, 28, 30, 0.95);
    color: #ffffff;
  }

  .layer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .layer-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .layer-controls {
    display: flex;
    gap: 4px;
  }

  .control-btn {
    padding: 4px 8px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .layer-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .layer-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    margin-bottom: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .layer-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .layer-item.selected {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
  }

  .layer-item.drag-over {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
    border-style: dashed;
  }

  .layer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
  }

  .layer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .layer-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .layer-name {
    font-size: 14px;
    font-weight: 500;
    color: #ebebf5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lock-indicator {
    font-size: 12px;
    opacity: 0.7;
  }

  .layer-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    padding: 4px 6px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #86868b;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .action-btn.active {
    color: #6366f1;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-toggle {
    font-size: 14px;
    font-weight: bold;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(28, 28, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px;
    min-width: 120px;
    z-index: 1000;
    display: none;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .dropdown:hover .dropdown-menu {
    display: block;
  }

  .dropdown-menu button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #ebebf5;
    cursor: pointer;
    font-size: 12px;
    text-align: left;
    transition: background 0.2s ease;
  }

  .dropdown-menu button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .dropdown-menu .delete-btn {
    color: #ff453a;
  }

  .dropdown-menu .delete-btn:hover {
    background: rgba(255, 69, 58, 0.1);
  }

  .dropdown-menu hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 4px 0;
  }

  .layer-properties {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.2);
  }

  .property-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .property-row span:first-child {
    color: #86868b;
  }

  .property-row span:last-child {
    color: #ebebf5;
    font-weight: 500;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: #86868b;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state p {
    margin: 4px 0;
    font-size: 14px;
  }

  .empty-hint {
    font-size: 12px !important;
    opacity: 0.7;
  }

  .layer-stats {
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.2);
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .stat-label {
    color: #86868b;
  }

  .stat-value {
    color: #ebebf5;
    font-weight: 600;
  }

  /* Scrollbar styling */
  .layer-list::-webkit-scrollbar {
    width: 6px;
  }

  .layer-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .layer-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .layer-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>