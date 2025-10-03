<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import MediaPreview from './MediaPreview.svelte';
  import type { ProcessedMediaFile } from '../services/multimediaService.js';
  
  // Props
  export let mediaFiles: ProcessedMediaFile[] = [];
  export let columns: number = 3;
  export let gap: number = 16;
  export let aspectRatio: number = 3/4; // 카드 비율
  export let showMetadata = true;
  export let showControls = true;
  export let selectable = false;
  export let selectedFiles: ProcessedMediaFile[] = [];
  export let sortBy: 'name' | 'date' | 'size' | 'type' = 'date';
  export let sortOrder: 'asc' | 'desc' = 'desc';
  export let filterType: 'all' | 'image' | 'video' | 'audio' = 'all';
  export let searchQuery = '';
  
  // 상태 관리
  let galleryContainer: HTMLElement;
  let selectedFile: ProcessedMediaFile | null = null;
  let isModalOpen = false;
  let viewMode: 'grid' | 'list' = 'grid';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    fileSelect: ProcessedMediaFile;
    fileDeselect: ProcessedMediaFile;
    selectionChange: ProcessedMediaFile[];
    fileDelete: ProcessedMediaFile;
    fileEdit: ProcessedMediaFile;
    modalOpen: ProcessedMediaFile;
    modalClose: void;
  }>();
  
  // 필터링 및 정렬된 파일 목록
  $: filteredFiles = mediaFiles
    .filter(file => {
      // 타입 필터
      if (filterType !== 'all' && file.type !== filterType) {
        return false;
      }
      
      // 검색 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return file.name.toLowerCase().includes(query);
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.originalFile.lastModified).getTime() - new Date(b.originalFile.lastModified).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // 파일 선택 토글
  function toggleFileSelection(file: ProcessedMediaFile) {
    if (!selectable) return;
    
    const isSelected = selectedFiles.includes(file);
    
    if (isSelected) {
      selectedFiles = selectedFiles.filter(f => f.id !== file.id);
      dispatch('fileDeselect', file);
    } else {
      selectedFiles = [...selectedFiles, file];
      dispatch('fileSelect', file);
    }
    
    dispatch('selectionChange', selectedFiles);
  }
  
  // 파일 상세 보기
  function openFileModal(file: ProcessedMediaFile) {
    selectedFile = file;
    isModalOpen = true;
    dispatch('modalOpen', file);
    
    // 모달 열릴 때 스크롤 방지
    if (browser) {
      document.body.style.overflow = 'hidden';
    }
  }
  
  // 모달 닫기
  function closeModal() {
    selectedFile = null;
    isModalOpen = false;
    dispatch('modalClose');
    
    // 스크롤 복원
    if (browser) {
      document.body.style.overflow = '';
    }
  }
  
  // 키보드 이벤트 처리
  function handleKeydown(event: KeyboardEvent) {
    if (isModalOpen) {
      if (event.key === 'Escape') {
        closeModal();
      } else if (event.key === 'ArrowLeft') {
        navigateModal(-1);
      } else if (event.key === 'ArrowRight') {
        navigateModal(1);
      }
    }
  }
  
  // 모달 네비게이션
  function navigateModal(direction: number) {
    if (!selectedFile) return;
    
    const currentIndex = filteredFiles.findIndex(f => f.id === selectedFile!.id);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < filteredFiles.length) {
      selectedFile = filteredFiles[newIndex];
    }
  }
  
  // 파일 크기 포맷팅
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 시간 포맷팅
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 날짜 포맷팅
  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 전체 선택/해제
  function toggleSelectAll() {
    if (selectedFiles.length === filteredFiles.length) {
      // 전체 해제
      selectedFiles = [];
      filteredFiles.forEach(file => dispatch('fileDeselect', file));
    } else {
      // 전체 선택
      selectedFiles = [...filteredFiles];
      filteredFiles.forEach(file => dispatch('fileSelect', file));
    }
    dispatch('selectionChange', selectedFiles);
  }
  
  // 키보드 이벤트 리스너 등록
  onMount(() => {
    if (browser) {
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
</script>

<div class="media-gallery">
  <!-- 갤러리 헤더 -->
  <div class="gallery-header">
    <div class="gallery-info">
      <h3 class="gallery-title">
        미디어 갤러리
        <span class="file-count">({filteredFiles.length})</span>
      </h3>
      
      {#if selectable && selectedFiles.length > 0}
        <div class="selection-info">
          {selectedFiles.length}개 선택됨
        </div>
      {/if}
    </div>
    
    <div class="gallery-controls">
      <!-- 보기 모드 -->
      <div class="view-mode-toggle">
        <button
          class="view-button"
          class:active={viewMode === 'grid'}
          on:click={() => viewMode = 'grid'}
          title="그리드 보기"
        >
          ⊞
        </button>
        <button
          class="view-button"
          class:active={viewMode === 'list'}
          on:click={() => viewMode = 'list'}
          title="목록 보기"
        >
          ☰
        </button>
      </div>
      
      <!-- 정렬 옵션 -->
      <select bind:value={sortBy} class="sort-select">
        <option value="date">날짜순</option>
        <option value="name">이름순</option>
        <option value="size">크기순</option>
        <option value="type">타입순</option>
      </select>
      
      <button
        class="sort-order-button"
        on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
        title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
      
      <!-- 필터 -->
      <select bind:value={filterType} class="filter-select">
        <option value="all">전체</option>
        <option value="image">이미지</option>
        <option value="video">비디오</option>
        <option value="audio">오디오</option>
      </select>
      
      <!-- 전체 선택 (선택 모드일 때) -->
      {#if selectable}
        <button
          class="select-all-button"
          on:click={toggleSelectAll}
          title="전체 선택/해제"
        >
          {selectedFiles.length === filteredFiles.length ? '☑️' : '☐'}
        </button>
      {/if}
    </div>
  </div>
  
  <!-- 갤러리 콘텐츠 -->
  <div 
    class="gallery-content"
    class:grid-view={viewMode === 'grid'}
    class:list-view={viewMode === 'list'}
    bind:this={galleryContainer}
    style:--columns={columns}
    style:--gap="{gap}px"
    style:--aspect-ratio={aspectRatio}
  >
    {#each filteredFiles as file (file.id)}
      <div 
        class="media-item"
        class:selected={selectedFiles.includes(file)}
        class:processing={file.status === 'processing'}
        class:error={file.status === 'error'}
      >
        <!-- 미디어 미리보기 -->
        <div 
          class="media-preview-container"
          on:click={() => openFileModal(file)}
          on:keydown={(e) => e.key === 'Enter' && openFileModal(file)}
          role="button"
          tabindex="0"
          aria-label="Open {file.name} in modal"
        >
          <MediaPreview
            file={file.originalFile}
            type={file.type}
            src={file.preview}
            thumbnail={file.thumbnail ? URL.createObjectURL(file.thumbnail) : null}
            duration={'duration' in file.metadata ? file.metadata.duration : null}
            waveform={file.waveform}
            controls={false}
            className="gallery-preview"
          />
          
          <!-- 상태 오버레이 -->
          {#if file.status === 'processing'}
            <div class="status-overlay processing">
              <div class="spinner"></div>
              <span>처리 중... {file.progress}%</span>
            </div>
          {:else if file.status === 'error'}
            <div class="status-overlay error">
              <span>❌</span>
              <span>처리 실패</span>
            </div>
          {/if}
          
          <!-- 타입 배지 -->
          <div class="type-badge">
            {#if file.type === 'image'}📷
            {:else if file.type === 'video'}🎬
            {:else if file.type === 'audio'}🎵
            {/if}
          </div>
          
          <!-- 선택 체크박스 -->
          {#if selectable}
            <div 
              class="selection-checkbox"
              on:click|stopPropagation={() => toggleFileSelection(file)}
              on:keydown={(e) => e.key === 'Enter' && toggleFileSelection(file)}
              role="checkbox"
              tabindex="0"
              aria-checked={selectedFiles.includes(file)}
              aria-label="Select {file.name}"
            >
              {selectedFiles.includes(file) ? '☑️' : '☐'}
            </div>
          {/if}
        </div>
        
        <!-- 파일 정보 -->
        {#if showMetadata}
          <div class="media-info">
            <div class="file-name" title={file.name}>
              {file.name}
            </div>
            
            <div class="file-meta">
              <span class="file-size">{formatFileSize(file.size)}</span>
              
              {#if 'duration' in file.metadata && file.metadata.duration}
                <span class="duration">{formatDuration(file.metadata.duration)}</span>
              {/if}
              
              {#if 'width' in file.metadata && 'height' in file.metadata}
                <span class="dimensions">
                  {file.metadata.width}×{file.metadata.height}
                </span>
              {/if}
            </div>
            
            {#if viewMode === 'list'}
              <div class="file-date">
                {formatDate(file.originalFile.lastModified)}
              </div>
            {/if}
          </div>
        {/if}
        
        <!-- 액션 버튼 -->
        {#if showControls}
          <div class="media-actions">
            <button
              class="action-button"
              on:click|stopPropagation={() => dispatch('fileEdit', file)}
              title="편집"
            >
              ✏️
            </button>
            <button
              class="action-button delete"
              on:click|stopPropagation={() => dispatch('fileDelete', file)}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  <!-- 빈 상태 -->
  {#if filteredFiles.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📁</div>
      <h4>파일이 없습니다</h4>
      <p>
        {#if searchQuery}
          "{searchQuery}"에 대한 검색 결과가 없습니다.
        {:else if filterType !== 'all'}
          {filterType} 파일이 없습니다.
        {:else}
          업로드된 미디어 파일이 없습니다.
        {/if}
      </p>
    </div>
  {/if}
</div>

<!-- 모달 -->
{#if isModalOpen && selectedFile}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h3 class="modal-title">{selectedFile.name}</h3>
        <div class="modal-controls">
          <button class="modal-nav-button" on:click={() => navigateModal(-1)}>
            ←
          </button>
          <button class="modal-nav-button" on:click={() => navigateModal(1)}>
            →
          </button>
          <button class="modal-close-button" on:click={closeModal}>
            ✕
          </button>
        </div>
      </div>
      
      <!-- 모달 미디어 -->
      <div class="modal-media">
        <MediaPreview
          file={selectedFile.originalFile}
          type={selectedFile.type}
          src={selectedFile.preview}
          thumbnail={selectedFile.thumbnail ? URL.createObjectURL(selectedFile.thumbnail) : null}
          duration={'duration' in selectedFile.metadata ? selectedFile.metadata.duration : null}
          waveform={selectedFile.waveform}
          controls={true}
          autoplay={false}
          className="modal-preview"
        />
      </div>
      
      <!-- 모달 정보 -->
      <div class="modal-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">크기:</span>
            <span class="info-value">{formatFileSize(selectedFile.size)}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">타입:</span>
            <span class="info-value">{selectedFile.mimeType}</span>
          </div>
          
          {#if 'width' in selectedFile.metadata && 'height' in selectedFile.metadata}
            <div class="info-item">
              <span class="info-label">해상도:</span>
              <span class="info-value">
                {selectedFile.metadata.width}×{selectedFile.metadata.height}
              </span>
            </div>
          {/if}
          
          {#if 'duration' in selectedFile.metadata && selectedFile.metadata.duration}
            <div class="info-item">
              <span class="info-label">길이:</span>
              <span class="info-value">
                {formatDuration(selectedFile.metadata.duration)}
              </span>
            </div>
          {/if}
          
          <div class="info-item">
            <span class="info-label">업로드:</span>
            <span class="info-value">
              {formatDate(selectedFile.originalFile.lastModified)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .media-gallery {
    width: 100%;
  }
  
  /* 갤러리 헤더 */
  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 0 4px;
  }
  
  .gallery-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .gallery-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .file-count {
    font-size: 16px;
    font-weight: 400;
    color: var(--apple-text-secondary);
  }
  
  .selection-info {
    background: var(--apple-accent-blue);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .gallery-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .view-mode-toggle {
    display: flex;
    background: var(--apple-surface-secondary);
    border-radius: 8px;
    padding: 2px;
  }
  
  .view-button {
    background: none;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    color: var(--apple-text-secondary);
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .view-button.active {
    background: var(--apple-surface-primary);
    color: var(--apple-text-primary);
    box-shadow: var(--apple-shadow-sm);
  }
  
  .sort-select,
  .filter-select {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    color: var(--apple-text-primary);
    cursor: pointer;
  }
  
  .sort-order-button,
  .select-all-button {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 16px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .sort-order-button:hover,
  .select-all-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  /* 갤러리 콘텐츠 */
  .gallery-content.grid-view {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: var(--gap);
  }
  
  .gallery-content.list-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  /* 미디어 아이템 */
  .media-item {
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    overflow: hidden;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
    position: relative;
  }
  
  .media-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-lg);
    border-color: var(--apple-accent-blue);
  }
  
  .media-item.selected {
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  }
  
  .media-item.processing {
    opacity: 0.7;
  }
  
  .media-item.error {
    border-color: var(--apple-accent-red);
  }
  
  .list-view .media-item {
    display: flex;
    align-items: center;
    padding: 12px;
  }
  
  .list-view .media-preview-container {
    width: 80px;
    height: 60px;
    flex-shrink: 0;
    margin-right: 16px;
  }
  
  /* 미디어 미리보기 컨테이너 */
  .media-preview-container {
    position: relative;
    aspect-ratio: var(--aspect-ratio);
    cursor: pointer;
    overflow: hidden;
  }
  
  .grid-view .media-preview-container {
    width: 100%;
  }
  
  /* 상태 오버레이 */
  .status-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: white;
    font-size: 14px;
    z-index: 2;
  }
  
  .status-overlay.processing {
    background: rgba(0, 122, 255, 0.9);
  }
  
  .status-overlay.error {
    background: rgba(255, 59, 48, 0.9);
  }
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 타입 배지 */
  .type-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    z-index: 1;
  }
  
  /* 선택 체크박스 */
  .selection-checkbox {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    z-index: 1;
  }
  
  /* 미디어 정보 */
  .media-info {
    padding: 12px;
  }
  
  .list-view .media-info {
    flex: 1;
    padding: 0;
  }
  
  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .file-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--apple-text-secondary);
    flex-wrap: wrap;
  }
  
  .file-date {
    font-size: 12px;
    color: var(--apple-text-tertiary);
    margin-top: 4px;
  }
  
  /* 액션 버튼 */
  .media-actions {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .media-item:hover .media-actions {
    opacity: 1;
  }
  
  .list-view .media-actions {
    position: static;
    opacity: 1;
    margin-left: auto;
  }
  
  .action-button {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  
  .action-button.delete:hover {
    background: var(--apple-accent-red);
  }
  
  /* 빈 상태 */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--apple-text-secondary);
  }
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-state h4 {
    font-size: 20px;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .empty-state p {
    font-size: 16px;
    margin: 0;
  }
  
  /* 모달 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .modal-content {
    background: var(--apple-surface-primary);
    border-radius: 16px;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
  }
  
  .modal-controls {
    display: flex;
    gap: 8px;
  }
  
  .modal-nav-button,
  .modal-close-button {
    background: var(--apple-surface-secondary);
    border: none;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: var(--apple-text-primary);
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .modal-nav-button:hover,
  .modal-close-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .modal-media {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background: var(--apple-surface-secondary);
  }
  
  .modal-info {
    padding: 20px;
    border-top: 1px solid var(--apple-surface-border);
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .info-label {
    font-size: 14px;
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  .info-value {
    font-size: 14px;
    color: var(--apple-text-primary);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .gallery-content.grid-view {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .gallery-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    
    .gallery-controls {
      justify-content: space-between;
    }
    
    .gallery-content.grid-view {
      grid-template-columns: 1fr;
    }
    
    .modal-content {
      max-width: 95vw;
      max-height: 95vh;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>