<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide, fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let images: string[] = [];
  export let layout = 'grid';
  export let spacing = 10;
  export let borderRadius = 8;

  let draggedIndex = -1;
  let dragOverIndex = -1;
  let fileInput: HTMLInputElement;

  // Layout options
  const layouts = [
    { id: 'grid', name: '그리드', icon: '⊞' },
    { id: 'masonry', name: '메이슨리', icon: '⊟' },
    { id: 'collage', name: '콜라주', icon: '⊡' },
    { id: 'polaroid', name: '폴라로이드', icon: '📷' },
    { id: 'film-strip', name: '필름 스트립', icon: '🎞️' },
    { id: 'circular', name: '원형', icon: '⭕' }
  ];

  // Predefined collage templates
  const collageTemplates = [
    {
      id: 'hero-split',
      name: '히어로 분할',
      positions: [
        { x: 0, y: 0, width: 60, height: 100 },
        { x: 65, y: 0, width: 35, height: 48 },
        { x: 65, y: 52, width: 35, height: 48 }
      ]
    },
    {
      id: 'triple-vertical',
      name: '세로 3분할',
      positions: [
        { x: 0, y: 0, width: 32, height: 100 },
        { x: 34, y: 0, width: 32, height: 100 },
        { x: 68, y: 0, width: 32, height: 100 }
      ]
    },
    {
      id: 'quad-grid',
      name: '4분할 그리드',
      positions: [
        { x: 0, y: 0, width: 48, height: 48 },
        { x: 52, y: 0, width: 48, height: 48 },
        { x: 0, y: 52, width: 48, height: 48 },
        { x: 52, y: 52, width: 48, height: 48 }
      ]
    },
    {
      id: 'magazine',
      name: '매거진 스타일',
      positions: [
        { x: 0, y: 0, width: 100, height: 35 },
        { x: 0, y: 40, width: 48, height: 25 },
        { x: 52, y: 40, width: 48, height: 25 },
        { x: 0, y: 70, width: 100, height: 30 }
      ]
    },
    {
      id: 'pinterest',
      name: '핀터레스트',
      positions: [
        { x: 0, y: 0, width: 48, height: 60 },
        { x: 52, y: 0, width: 48, height: 35 },
        { x: 52, y: 40, width: 48, height: 25 },
        { x: 0, y: 65, width: 48, height: 35 }
      ]
    }
  ];

  function handleFileUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          images = [...images, imageUrl];
          updateCollage();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function removeImage(index: number) {
    images = images.filter((_, i) => i !== index);
    updateCollage();
  }

  function moveImage(fromIndex: number, toIndex: number) {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    images = newImages;
    updateCollage();
  }

  function handleDragStart(event: DragEvent, index: number) {
    draggedIndex = index;
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

  function handleDrop(event: DragEvent, index: number) {
    event.preventDefault();
    
    if (draggedIndex !== -1 && draggedIndex !== index) {
      moveImage(draggedIndex, index);
    }
    
    draggedIndex = -1;
    dragOverIndex = -1;
  }

  function applyTemplate(template: any) {
    // Ensure we have enough images for the template
    while (images.length < template.positions.length) {
      images = [...images, ''];
    }
    updateCollage();
  }

  function updateCollage() {
    dispatch('collageUpdated', {
      images,
      layout,
      spacing,
      borderRadius
    });
  }

  function getLayoutStyle(): string {
    switch (layout) {
      case 'grid':
        return getGridStyle();
      case 'masonry':
        return getMasonryStyle();
      case 'collage':
        return getCollageStyle();
      case 'polaroid':
        return getPolaroidStyle();
      case 'film-strip':
        return getFilmStripStyle();
      case 'circular':
        return getCircularStyle();
      default:
        return getGridStyle();
    }
  }

  function getGridStyle(): string {
    const cols = Math.ceil(Math.sqrt(images.length));
    return `
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      gap: ${spacing}px;
    `;
  }

  function getMasonryStyle(): string {
    return `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: ${spacing}px;
      grid-auto-rows: 100px;
    `;
  }

  function getCollageStyle(): string {
    return `
      position: relative;
      width: 100%;
      height: 100%;
    `;
  }

  function getPolaroidStyle(): string {
    return `
      display: flex;
      flex-wrap: wrap;
      gap: ${spacing}px;
      justify-content: center;
      align-items: center;
    `;
  }

  function getFilmStripStyle(): string {
    return `
      display: flex;
      gap: ${spacing}px;
      overflow-x: auto;
      padding: ${spacing}px 0;
    `;
  }

  function getCircularStyle(): string {
    return `
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    `;
  }

  function getImageStyle(index: number): string {
    const baseStyle = `
      border-radius: ${borderRadius}px;
      object-fit: cover;
      transition: all 0.3s ease;
    `;

    switch (layout) {
      case 'masonry':
        const heights = [100, 150, 120, 180, 110, 160];
        return baseStyle + `
          height: ${heights[index % heights.length]}px;
          width: 100%;
        `;
      
      case 'collage':
        if (collageTemplates[0] && collageTemplates[0].positions[index]) {
          const pos = collageTemplates[0].positions[index];
          return baseStyle + `
            position: absolute;
            left: ${pos.x}%;
            top: ${pos.y}%;
            width: ${pos.width}%;
            height: ${pos.height}%;
          `;
        }
        return baseStyle + `width: 100%; height: 100%;`;
      
      case 'polaroid':
        const rotations = [-5, 3, -2, 7, -4, 2, -6, 4];
        return baseStyle + `
          width: 120px;
          height: 140px;
          padding: 10px 10px 30px 10px;
          background: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transform: rotate(${rotations[index % rotations.length]}deg);
        `;
      
      case 'film-strip':
        return baseStyle + `
          width: 100px;
          height: 80px;
          flex-shrink: 0;
          border: 2px solid #333;
        `;
      
      case 'circular':
        const angle = (index / images.length) * 360;
        const radius = 40;
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        return baseStyle + `
          position: absolute;
          left: ${x}%;
          top: ${y}%;
          width: 60px;
          height: 60px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
        `;
      
      default:
        return baseStyle + `width: 100%; height: 100%;`;
    }
  }

  // Reactive updates
  $: updateCollage();
</script>

<div class="collage-editor">
  <!-- Layout Controls -->
  <div class="layout-controls">
    <h4>레이아웃</h4>
    <div class="layout-grid">
      {#each layouts as layoutOption}
        <button
          class="layout-btn"
          class:active={layout === layoutOption.id}
          on:click={() => { layout = layoutOption.id; updateCollage(); }}
          title={layoutOption.name}
        >
          <span class="layout-icon">{layoutOption.icon}</span>
          <span class="layout-name">{layoutOption.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Template Selection -->
  {#if layout === 'collage'}
    <div class="template-section" transition:slide={{ duration: 200 }}>
      <h4>템플릿</h4>
      <div class="template-grid">
        {#each collageTemplates as template}
          <button
            class="template-btn"
            on:click={() => applyTemplate(template)}
            title={template.name}
          >
            <div class="template-preview">
              {#each template.positions as position, i}
                <div
                  class="template-box"
                  style="
                    left: {position.x}%;
                    top: {position.y}%;
                    width: {position.width}%;
                    height: {position.height}%;
                  "
                ></div>
              {/each}
            </div>
            <span class="template-name">{template.name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Settings -->
  <div class="settings-section">
    <h4>설정</h4>
    
    <div class="setting-group">
      <label>간격: {spacing}px</label>
      <input
        type="range"
        min="0"
        max="50"
        bind:value={spacing}
        on:input={updateCollage}
      />
    </div>

    <div class="setting-group">
      <label>모서리: {borderRadius}px</label>
      <input
        type="range"
        min="0"
        max="30"
        bind:value={borderRadius}
        on:input={updateCollage}
      />
    </div>
  </div>

  <!-- Image Management -->
  <div class="image-management">
    <h4>이미지 관리</h4>
    
    <button class="upload-btn" on:click={() => fileInput.click()}>
      📁 이미지 추가
    </button>
    
    <input
      type="file"
      bind:this={fileInput}
      on:change={handleFileUpload}
      multiple
      accept="image/*"
      style="display: none;"
    />

    {#if images.length > 0}
      <div class="image-list">
        {#each images as image, index (index)}
          <div
            class="image-item"
            class:drag-over={dragOverIndex === index}
            draggable="true"
            on:dragstart={(e) => handleDragStart(e, index)}
            on:dragover={(e) => handleDragOver(e, index)}
            on:dragleave={handleDragLeave}
            on:drop={(e) => handleDrop(e, index)}
          >
            {#if image}
              <img src={image} alt="Collage item {index + 1}" />
            {:else}
              <div class="empty-slot">
                <span>빈 슬롯</span>
              </div>
            {/if}
            
            <div class="image-controls">
              <button
                class="control-btn"
                on:click={() => removeImage(index)}
                title="삭제"
              >
                🗑️
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Preview -->
  <div class="preview-section">
    <h4>미리보기</h4>
    <div class="collage-preview" style={getLayoutStyle()}>
      {#each images as image, index}
        {#if image}
          <img
            src={image}
            alt="Preview {index + 1}"
            style={getImageStyle(index)}
            class="preview-image"
          />
        {:else}
          <div
            class="preview-placeholder"
            style={getImageStyle(index)}
          >
            {index + 1}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  .collage-editor {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px;
    color: #ffffff;
    max-height: 100%;
    overflow-y: auto;
  }

  .layout-controls,
  .template-section,
  .settings-section,
  .image-management,
  .preview-section {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px;
  }

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #ebebf5;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .layout-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .layout-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .layout-btn.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }

  .layout-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .layout-name {
    font-size: 12px;
    font-weight: 500;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .template-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .template-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .template-preview {
    position: relative;
    width: 60px;
    height: 40px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    margin-bottom: 6px;
    overflow: hidden;
  }

  .template-box {
    position: absolute;
    background: rgba(99, 102, 241, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.8);
  }

  .template-name {
    font-size: 11px;
    text-align: center;
  }

  .setting-group {
    margin-bottom: 16px;
  }

  .setting-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #ebebf5;
  }

  .setting-group input[type="range"] {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }

  .setting-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #6366f1;
    border-radius: 50%;
    cursor: pointer;
  }

  .upload-btn {
    width: 100%;
    padding: 12px 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-bottom: 16px;
  }

  .upload-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .image-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .image-item {
    position: relative;
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
    cursor: move;
    transition: all 0.2s ease;
  }

  .image-item:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .image-item.drag-over {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
  }

  .image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .empty-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #86868b;
    font-size: 12px;
  }

  .image-controls {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 2px;
  }

  .control-btn {
    padding: 4px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 3px;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 69, 58, 0.8);
  }

  .collage-preview {
    width: 100%;
    height: 200px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  .preview-image {
    transition: all 0.3s ease;
  }

  .preview-image:hover {
    transform: scale(1.05);
    z-index: 10;
  }

  .preview-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    color: #86868b;
    font-size: 14px;
    font-weight: 600;
  }

  /* Scrollbar styling */
  .collage-editor::-webkit-scrollbar {
    width: 6px;
  }

  .collage-editor::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .collage-editor::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .collage-editor::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>