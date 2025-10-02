<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { spring } from 'svelte/motion';
  import LayerManager from './LayerManager.svelte';
  import EffectsPanel from './EffectsPanel.svelte';
  import AdvancedTextEditor from './AdvancedTextEditor.svelte';
  import StorytellingPanel from './StorytellingPanel.svelte';
  import ParticleEffects from './ParticleEffects.svelte';
  import CollageEditor from './CollageEditor.svelte';

  const dispatch = createEventDispatcher();

  // Editor state
  let canvas: HTMLDivElement;
  let selectedElement: any = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let elements: any[] = [];
  let currentTool = 'select';
  let showGrid = true;
  let snapToGrid = true;

  // Animation springs for smooth interactions
  const canvasTransform = spring({ x: 0, y: 0, scale: 1 }, {
    stiffness: 0.2,
    damping: 0.8
  });

  // Editor tools
  const tools = [
    { id: 'select', name: '선택', icon: '🔍' },
    { id: 'text', name: '텍스트', icon: '📝' },
    { id: 'image', name: '이미지', icon: '🖼️' },
    { id: 'shape', name: '도형', icon: '⭕' },
    { id: 'particle', name: '파티클', icon: '✨' },
    { id: 'collage', name: '콜라주', icon: '🎨' }
  ];

  // Element types for the editor
  interface EditorElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'particle' | 'collage';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    zIndex: number;
    locked: boolean;
    visible: boolean;
    data: any;
  }

  onMount(() => {
    setupCanvasInteractions();
    loadDefaultElements();
  });

  function setupCanvasInteractions() {
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('wheel', handleCanvasWheel);
  }

  function handleCanvasMouseDown(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on an element
    const clickedElement = findElementAtPosition(x, y);
    
    if (clickedElement) {
      selectElement(clickedElement);
      startDragging(event, clickedElement);
    } else {
      // Clicked on empty canvas
      if (currentTool !== 'select') {
        createNewElement(x, y);
      } else {
        deselectAll();
      }
    }
  }

  function handleCanvasMouseMove(event: MouseEvent) {
    if (!isDragging || !selectedElement) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - dragOffset.x;
    const y = event.clientY - rect.top - dragOffset.y;

    updateElementPosition(selectedElement.id, x, y);
  }

  function handleCanvasMouseUp() {
    isDragging = false;
    dragOffset = { x: 0, y: 0 };
  }

  function handleCanvasWheel(event: WheelEvent) {
    event.preventDefault();
    
    if (event.ctrlKey) {
      // Zoom with Ctrl+Wheel
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      canvasTransform.update(transform => ({
        ...transform,
        scale: Math.max(0.1, Math.min(5, transform.scale * zoomFactor))
      }));
    } else {
      // Pan with Wheel
      canvasTransform.update(transform => ({
        ...transform,
        x: transform.x - event.deltaX,
        y: transform.y - event.deltaY
      }));
    }
  }

  function findElementAtPosition(x: number, y: number): EditorElement | null {
    // Find topmost element at position (reverse order for z-index)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height) {
        return element;
      }
    }
    return null;
  }

  function selectElement(element: EditorElement) {
    selectedElement = element;
    dispatch('elementSelected', element);
  }

  function deselectAll() {
    selectedElement = null;
    dispatch('elementDeselected');
  }

  function startDragging(event: MouseEvent, element: EditorElement) {
    if (element.locked) return;
    
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    dragOffset = {
      x: event.clientX - rect.left - element.x,
      y: event.clientY - rect.top - element.y
    };
  }

  function createNewElement(x: number, y: number) {
    const newElement: EditorElement = {
      id: `element_${Date.now()}`,
      type: currentTool as any,
      x: snapToGrid ? Math.round(x / 20) * 20 : x,
      y: snapToGrid ? Math.round(y / 20) * 20 : y,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length,
      locked: false,
      visible: true,
      data: getDefaultElementData(currentTool)
    };

    elements = [...elements, newElement];
    selectElement(newElement);
    dispatch('elementCreated', newElement);
  }

  function getDefaultElementData(type: string) {
    switch (type) {
      case 'text':
        return {
          content: '텍스트를 입력하세요',
          fontSize: 24,
          fontFamily: 'Apple SD Gothic Neo',
          color: '#ffffff',
          fontWeight: 'normal',
          textAlign: 'left',
          lineHeight: 1.4
        };
      case 'image':
        return {
          src: '',
          alt: '',
          objectFit: 'cover',
          filter: 'none'
        };
      case 'shape':
        return {
          shape: 'rectangle',
          fill: '#6366f1',
          stroke: 'none',
          strokeWidth: 2,
          borderRadius: 8
        };
      case 'particle':
        return {
          type: 'sparkles',
          count: 50,
          color: '#ffd700',
          speed: 1,
          size: 3
        };
      case 'collage':
        return {
          images: [],
          layout: 'grid',
          spacing: 10,
          borderRadius: 8
        };
      default:
        return {};
    }
  }

  function updateElementPosition(elementId: string, x: number, y: number) {
    elements = elements.map(element => {
      if (element.id === elementId) {
        return {
          ...element,
          x: snapToGrid ? Math.round(x / 20) * 20 : x,
          y: snapToGrid ? Math.round(y / 20) * 20 : y
        };
      }
      return element;
    });
  }

  function updateElement(elementId: string, updates: Partial<EditorElement>) {
    elements = elements.map(element => {
      if (element.id === elementId) {
        return { ...element, ...updates };
      }
      return element;
    });
  }

  function deleteElement(elementId: string) {
    elements = elements.filter(element => element.id !== elementId);
    if (selectedElement?.id === elementId) {
      deselectAll();
    }
  }

  function duplicateElement(elementId: string) {
    const element = elements.find(e => e.id === elementId);
    if (element) {
      const duplicate = {
        ...element,
        id: `element_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: elements.length
      };
      elements = [...elements, duplicate];
    }
  }

  function loadDefaultElements() {
    // Load any default elements or templates
    elements = [];
  }

  function exportCanvas() {
    const canvasData = {
      elements,
      canvas: {
        width: 660,
        height: 921,
        background: '#000000'
      },
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    dispatch('canvasExported', canvasData);
    return canvasData;
  }

  // Keyboard shortcuts
  function handleKeyDown(event: KeyboardEvent) {
    if (!selectedElement) return;

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        deleteElement(selectedElement.id);
        break;
      case 'Escape':
        deselectAll();
        break;
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          duplicateElement(selectedElement.id);
        }
        break;
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="advanced-editor">
  <!-- Toolbar -->
  <div class="editor-toolbar">
    <div class="tool-group">
      {#each tools as tool}
        <button
          class="tool-button"
          class:active={currentTool === tool.id}
          on:click={() => currentTool = tool.id}
          title={tool.name}
        >
          <span class="tool-icon">{tool.icon}</span>
          <span class="tool-name">{tool.name}</span>
        </button>
      {/each}
    </div>

    <div class="view-controls">
      <button
        class="control-button"
        class:active={showGrid}
        on:click={() => showGrid = !showGrid}
        title="그리드 표시"
      >
        📐
      </button>
      <button
        class="control-button"
        class:active={snapToGrid}
        on:click={() => snapToGrid = !snapToGrid}
        title="그리드에 맞춤"
      >
        🧲
      </button>
      <button
        class="control-button"
        on:click={() => canvasTransform.set({ x: 0, y: 0, scale: 1 })}
        title="화면 맞춤"
      >
        🎯
      </button>
    </div>

    <div class="export-controls">
      <button class="export-button" on:click={exportCanvas}>
        💾 저장
      </button>
    </div>
  </div>

  <!-- Main Editor Area -->
  <div class="editor-main">
    <!-- Left Panel - Layers & Properties -->
    <div class="left-panel">
      <LayerManager
        {elements}
        {selectedElement}
        on:elementSelected={(e) => selectElement(e.detail)}
        on:elementUpdated={(e) => updateElement(e.detail.id, e.detail.updates)}
        on:elementDeleted={(e) => deleteElement(e.detail)}
        on:elementDuplicated={(e) => duplicateElement(e.detail)}
      />

      {#if selectedElement}
        <div class="properties-panel">
          <h3>속성</h3>
          
          {#if selectedElement.type === 'text'}
            <AdvancedTextEditor
              element={selectedElement}
              on:textUpdated={(e) => updateElement(selectedElement.id, { data: e.detail })}
            />
          {/if}

          <!-- Common properties -->
          <div class="property-group">
            <label>
              위치 X:
              <input
                type="number"
                bind:value={selectedElement.x}
                on:input={() => updateElement(selectedElement.id, { x: selectedElement.x })}
              />
            </label>
            <label>
              위치 Y:
              <input
                type="number"
                bind:value={selectedElement.y}
                on:input={() => updateElement(selectedElement.id, { y: selectedElement.y })}
              />
            </label>
          </div>

          <div class="property-group">
            <label>
              너비:
              <input
                type="number"
                bind:value={selectedElement.width}
                on:input={() => updateElement(selectedElement.id, { width: selectedElement.width })}
              />
            </label>
            <label>
              높이:
              <input
                type="number"
                bind:value={selectedElement.height}
                on:input={() => updateElement(selectedElement.id, { height: selectedElement.height })}
              />
            </label>
          </div>

          <div class="property-group">
            <label>
              회전:
              <input
                type="range"
                min="-180"
                max="180"
                bind:value={selectedElement.rotation}
                on:input={() => updateElement(selectedElement.id, { rotation: selectedElement.rotation })}
              />
              <span>{selectedElement.rotation}°</span>
            </label>
          </div>

          <div class="property-group">
            <label>
              투명도:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                bind:value={selectedElement.opacity}
                on:input={() => updateElement(selectedElement.id, { opacity: selectedElement.opacity })}
              />
              <span>{Math.round(selectedElement.opacity * 100)}%</span>
            </label>
          </div>
        </div>
      {/if}
    </div>

    <!-- Canvas Area -->
    <div class="canvas-container">
      <div
        class="canvas"
        bind:this={canvas}
        style="transform: translate({$canvasTransform.x}px, {$canvasTransform.y}px) scale({$canvasTransform.scale})"
      >
        <!-- Grid -->
        {#if showGrid}
          <div class="grid-overlay"></div>
        {/if}

        <!-- Card Background -->
        <div class="card-background">
          <!-- Elements -->
          {#each elements as element (element.id)}
            <div
              class="canvas-element"
              class:selected={selectedElement?.id === element.id}
              style="
                left: {element.x}px;
                top: {element.y}px;
                width: {element.width}px;
                height: {element.height}px;
                transform: rotate({element.rotation}deg);
                opacity: {element.opacity};
                z-index: {element.zIndex};
                display: {element.visible ? 'block' : 'none'};
              "
            >
              {#if element.type === 'text'}
                <div
                  class="text-element"
                  style="
                    font-size: {element.data.fontSize}px;
                    font-family: {element.data.fontFamily};
                    color: {element.data.color};
                    font-weight: {element.data.fontWeight};
                    text-align: {element.data.textAlign};
                    line-height: {element.data.lineHeight};
                  "
                >
                  {element.data.content}
                </div>
              {:else if element.type === 'image'}
                <img
                  src={element.data.src}
                  alt={element.data.alt}
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: {element.data.objectFit};
                    filter: {element.data.filter};
                  "
                />
              {:else if element.type === 'shape'}
                <div
                  class="shape-element"
                  style="
                    width: 100%;
                    height: 100%;
                    background: {element.data.fill};
                    border: {element.data.strokeWidth}px solid {element.data.stroke};
                    border-radius: {element.data.borderRadius}px;
                  "
                ></div>
              {:else if element.type === 'particle'}
                <ParticleEffects
                  type={element.data.type}
                  count={element.data.count}
                  color={element.data.color}
                  speed={element.data.speed}
                  size={element.data.size}
                />
              {:else if element.type === 'collage'}
                <CollageEditor
                  images={element.data.images}
                  layout={element.data.layout}
                  spacing={element.data.spacing}
                  borderRadius={element.data.borderRadius}
                />
              {/if}

              <!-- Selection handles -->
              {#if selectedElement?.id === element.id}
                <div class="selection-handles">
                  <div class="handle handle-nw"></div>
                  <div class="handle handle-ne"></div>
                  <div class="handle handle-sw"></div>
                  <div class="handle handle-se"></div>
                  <div class="handle handle-rotate"></div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Right Panel - Effects & Storytelling -->
    <div class="right-panel">
      <EffectsPanel
        on:effectApplied={(e) => {
          if (selectedElement) {
            updateElement(selectedElement.id, { data: { ...selectedElement.data, ...e.detail } });
          }
        }}
      />

      <StorytellingPanel
        on:storyElementAdded={(e) => {
          const storyElement = {
            ...e.detail,
            id: `story_${Date.now()}`,
            x: 50,
            y: 50,
            zIndex: elements.length
          };
          elements = [...elements, storyElement];
        }}
      />
    </div>
  </div>
</div>

<style>
  .advanced-editor {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0f0f23;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: rgba(28, 28, 30, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tool-group {
    display: flex;
    gap: 8px;
  }

  .tool-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tool-button:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .tool-button.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-color: #6366f1;
  }

  .tool-icon {
    font-size: 16px;
  }

  .tool-name {
    font-size: 14px;
    font-weight: 500;
  }

  .view-controls, .export-controls {
    display: flex;
    gap: 8px;
  }

  .control-button, .export-button {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button:hover, .export-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .control-button.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }

  .export-button {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: #10b981;
    font-weight: 600;
  }

  .editor-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .left-panel, .right-panel {
    width: 300px;
    background: rgba(28, 28, 30, 0.95);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    overflow-y: auto;
  }

  .right-panel {
    border-right: none;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
  }

  .properties-panel {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .properties-panel h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .property-group {
    margin-bottom: 16px;
  }

  .property-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #ebebf5;
  }

  .property-group input {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
  }

  .property-group input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .canvas-container {
    flex: 1;
    background: #1a1a2e;
    overflow: hidden;
    position: relative;
  }

  .canvas {
    width: 660px;
    height: 921px;
    margin: 50px auto;
    position: relative;
    transform-origin: center;
    transition: transform 0.2s ease;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  .card-background {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .canvas-element {
    position: absolute;
    cursor: move;
    user-select: none;
  }

  .canvas-element.selected {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  .text-element {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    word-wrap: break-word;
    overflow: hidden;
  }

  .shape-element {
    width: 100%;
    height: 100%;
  }

  .selection-handles {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    pointer-events: none;
  }

  .handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #6366f1;
    border: 2px solid #ffffff;
    border-radius: 50%;
    pointer-events: all;
    cursor: pointer;
  }

  .handle-nw { top: 0; left: 0; cursor: nw-resize; }
  .handle-ne { top: 0; right: 0; cursor: ne-resize; }
  .handle-sw { bottom: 0; left: 0; cursor: sw-resize; }
  .handle-se { bottom: 0; right: 0; cursor: se-resize; }
  .handle-rotate {
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    background: #10b981;
  }

  /* Responsive design */
  @media (max-width: 1200px) {
    .left-panel, .right-panel {
      width: 250px;
    }
  }

  @media (max-width: 768px) {
    .editor-main {
      flex-direction: column;
    }
    
    .left-panel, .right-panel {
      width: 100%;
      height: 200px;
    }
    
    .canvas {
      transform: scale(0.5);
    }
  }
</style>