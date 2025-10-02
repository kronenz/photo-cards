<script lang="ts">
  import { onMount } from 'svelte';
  import MediaUploader from '$lib/components/MediaUploader.svelte';
  import MediaGallery from '$lib/components/MediaGallery.svelte';
  import type { ProcessedMediaFile } from '$lib/services/multimediaService.js';
  
  // 상태 관리
  let uploadedFiles: ProcessedMediaFile[] = [];
  let selectedFiles: ProcessedMediaFile[] = [];
  let isUploading = false;
  let uploadProgress = 0;
  let searchQuery = '';
  let filterType: 'all' | 'image' | 'video' | 'audio' = 'all';
  let sortBy: 'name' | 'date' | 'size' | 'type' = 'date';
  let sortOrder: 'asc' | 'desc' = 'desc';
  let viewMode: 'grid' | 'list' = 'grid';
  let columns = 3;
  
  // 통계
  $: stats = {
    total: uploadedFiles.length,
    images: uploadedFiles.filter(f => f.type === 'image').length,
    videos: uploadedFiles.filter(f => f.type === 'video').length,
    audios: uploadedFiles.filter(f => f.type === 'audio').length,
    totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
  };
  
  // 파일 업로드 완료 처리
  function handleFilesUploaded(event: CustomEvent) {
    const newFiles = event.detail;
    console.log('Files uploaded:', newFiles);
    
    // 실제 구현에서는 여기서 서버에 업로드하고 ProcessedMediaFile로 변환
    // 현재는 시뮬레이션을 위해 기본 구조만 생성
    const processedFiles: ProcessedMediaFile[] = newFiles.map((file: any) => ({
      id: file.id,
      originalFile: file.file,
      type: file.type,
      name: file.file.name,
      size: file.file.size,
      mimeType: file.file.type,
      preview: file.preview,
      thumbnail: file.thumbnail ? file.thumbnail : undefined,
      metadata: {
        width: file.type === 'image' ? 1920 : undefined,
        height: file.type === 'image' ? 1080 : undefined,
        duration: file.duration || undefined,
        aspectRatio: file.type === 'image' ? 16/9 : undefined
      },
      waveform: file.type === 'audio' ? file.preview : undefined,
      status: 'completed' as const,
      progress: 100
    }));
    
    uploadedFiles = [...uploadedFiles, ...processedFiles];
  }
  
  // 파일 처리 완료
  function handleFileProcessed(event: CustomEvent) {
    console.log('File processed:', event.detail);
  }
  
  // 업로드 진행률
  function handleUploadProgress(event: CustomEvent) {
    uploadProgress = event.detail.progress;
    isUploading = uploadProgress < 100;
  }
  
  // 업로드 에러
  function handleUploadError(event: CustomEvent) {
    console.error('Upload error:', event.detail);
    isUploading = false;
  }
  
  // 파일 선택 변경
  function handleSelectionChange(event: CustomEvent) {
    selectedFiles = event.detail;
  }
  
  // 파일 삭제
  function handleFileDelete(event: CustomEvent) {
    const fileToDelete = event.detail;
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileToDelete.id);
    selectedFiles = selectedFiles.filter(f => f.id !== fileToDelete.id);
  }
  
  // 파일 편집
  function handleFileEdit(event: CustomEvent) {
    const fileToEdit = event.detail;
    console.log('Edit file:', fileToEdit);
    // 편집 모달 열기 등의 로직
  }
  
  // 선택된 파일 삭제
  function deleteSelectedFiles() {
    if (selectedFiles.length === 0) return;
    
    if (confirm(`선택된 ${selectedFiles.length}개 파일을 삭제하시겠습니까?`)) {
      const selectedIds = selectedFiles.map(f => f.id);
      uploadedFiles = uploadedFiles.filter(f => !selectedIds.includes(f.id));
      selectedFiles = [];
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
  
  // 컬럼 수 조정
  function adjustColumns(delta: number) {
    columns = Math.max(1, Math.min(6, columns + delta));
  }
  
  // 모든 파일 삭제
  function clearAllFiles() {
    if (uploadedFiles.length === 0) return;
    
    if (confirm('모든 파일을 삭제하시겠습니까?')) {
      uploadedFiles = [];
      selectedFiles = [];
    }
  }
  
  // 샘플 데이터 로드 (테스트용)
  function loadSampleData() {
    // 실제 구현에서는 서버에서 데이터를 가져옴
    console.log('Loading sample data...');
  }
</script>

<svelte:head>
  <title>멀티미디어 업로드 테스트 - KBO 홀로그래픽 카드</title>
  <meta name="description" content="KBO 홀로그래픽 카드 멀티미디어 업로드 시스템 테스트 페이지" />
</svelte:head>

<div class="multimedia-test-page">
  <!-- 페이지 헤더 -->
  <header class="page-header">
    <div class="header-content">
      <h1 class="page-title">
        <span class="title-icon">🎬</span>
        멀티미디어 업로드 시스템
      </h1>
      <p class="page-subtitle">
        KBO 야구 카드를 위한 고급 미디어 처리 및 관리 시스템
      </p>
    </div>
    
    <!-- 통계 대시보드 -->
    <div class="stats-dashboard">
      <div class="stat-card">
        <div class="stat-value">{stats.total}</div>
        <div class="stat-label">전체 파일</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{stats.images}</div>
        <div class="stat-label">📷 이미지</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{stats.videos}</div>
        <div class="stat-label">🎬 비디오</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{stats.audios}</div>
        <div class="stat-label">🎵 오디오</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{formatFileSize(stats.totalSize)}</div>
        <div class="stat-label">총 크기</div>
      </div>
    </div>
  </header>
  
  <!-- 메인 콘텐츠 -->
  <main class="main-content">
    <!-- 업로드 섹션 -->
    <section class="upload-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">☁️</span>
          파일 업로드
        </h2>
        <div class="section-actions">
          <button class="action-button" on:click={loadSampleData}>
            샘플 데이터 로드
          </button>
        </div>
      </div>
      
      <div class="upload-container">
        <MediaUploader
          acceptedTypes="all"
          maxFileSize={100 * 1024 * 1024}
          maxVideoDuration={15}
          allowMultiple={true}
          on:filesUploaded={handleFilesUploaded}
          on:fileProcessed={handleFileProcessed}
          on:uploadProgress={handleUploadProgress}
          on:uploadError={handleUploadError}
        />
        
        {#if isUploading}
          <div class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: {uploadProgress}%"></div>
            </div>
            <div class="progress-text">업로드 중... {uploadProgress}%</div>
          </div>
        {/if}
      </div>
    </section>
    
    <!-- 갤러리 섹션 -->
    <section class="gallery-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🖼️</span>
          미디어 갤러리
        </h2>
        
        <div class="section-controls">
          <!-- 검색 -->
          <div class="search-container">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="파일 검색..."
              class="search-input"
            />
            <div class="search-icon">🔍</div>
          </div>
          
          <!-- 필터 및 정렬 -->
          <div class="filter-controls">
            <select bind:value={filterType} class="filter-select">
              <option value="all">전체 타입</option>
              <option value="image">이미지</option>
              <option value="video">비디오</option>
              <option value="audio">오디오</option>
            </select>
            
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
          </div>
          
          <!-- 보기 옵션 -->
          <div class="view-controls">
            <div class="columns-control">
              <button class="column-button" on:click={() => adjustColumns(-1)}>-</button>
              <span class="column-count">{columns}</span>
              <button class="column-button" on:click={() => adjustColumns(1)}>+</button>
            </div>
          </div>
          
          <!-- 선택된 파일 액션 -->
          {#if selectedFiles.length > 0}
            <div class="selection-actions">
              <span class="selection-count">{selectedFiles.length}개 선택</span>
              <button class="delete-selected-button" on:click={deleteSelectedFiles}>
                선택 삭제
              </button>
            </div>
          {/if}
          
          <!-- 전체 삭제 -->
          {#if uploadedFiles.length > 0}
            <button class="clear-all-button" on:click={clearAllFiles}>
              전체 삭제
            </button>
          {/if}
        </div>
      </div>
      
      <div class="gallery-container">
        <MediaGallery
          mediaFiles={uploadedFiles}
          {columns}
          gap={16}
          aspectRatio={3/4}
          showMetadata={true}
          showControls={true}
          selectable={true}
          bind:selectedFiles
          {sortBy}
          {sortOrder}
          {filterType}
          {searchQuery}
          on:selectionChange={handleSelectionChange}
          on:fileDelete={handleFileDelete}
          on:fileEdit={handleFileEdit}
        />
      </div>
    </section>
  </main>
</div>

<style>
  .multimedia-test-page {
    min-height: 100vh;
    background: var(--apple-background-primary);
    color: var(--apple-text-primary);
  }
  
  /* 페이지 헤더 */
  .page-header {
    background: var(--apple-surface-primary);
    border-bottom: 1px solid var(--apple-surface-border);
    padding: 32px 24px;
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    margin-bottom: 32px;
  }
  
  .page-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .page-subtitle {
    font-size: 18px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
  
  /* 통계 대시보드 */
  .stats-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .stat-card {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--apple-accent-blue);
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  /* 메인 콘텐츠 */
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
  }
  
  /* 섹션 공통 */
  .upload-section,
  .gallery-section {
    margin-bottom: 48px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 24px;
  }
  
  .section-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .section-icon {
    font-size: 0.9em;
  }
  
  .section-actions,
  .section-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  /* 업로드 섹션 */
  .upload-container {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
  }
  
  .upload-progress {
    margin-top: 16px;
    padding: 16px;
    background: var(--apple-surface-secondary);
    border-radius: 12px;
  }
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--apple-surface-tertiary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--apple-accent-blue);
    border-radius: 4px;
    transition: width var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .progress-text {
    font-size: 14px;
    color: var(--apple-text-secondary);
    text-align: center;
  }
  
  /* 갤러리 섹션 */
  .gallery-container {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
  }
  
  /* 컨트롤 요소들 */
  .search-container {
    position: relative;
    min-width: 200px;
  }
  
  .search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--apple-text-secondary);
    font-size: 14px;
  }
  
  .filter-controls {
    display: flex;
    gap: 8px;
  }
  
  .filter-select,
  .sort-select {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    color: var(--apple-text-primary);
    cursor: pointer;
  }
  
  .sort-order-button {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 16px;
    cursor: pointer;
    color: var(--apple-text-primary);
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .sort-order-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .view-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .columns-control {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--apple-surface-secondary);
    border-radius: 8px;
    padding: 4px;
  }
  
  .column-button {
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    color: var(--apple-text-primary);
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .column-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .column-count {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
    min-width: 20px;
    text-align: center;
  }
  
  .selection-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--apple-accent-blue);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
  }
  
  .selection-count {
    font-size: 14px;
    font-weight: 500;
  }
  
  .delete-selected-button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .delete-selected-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .action-button,
  .clear-all-button {
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    color: var(--apple-text-primary);
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button:hover,
  .clear-all-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .clear-all-button {
    color: var(--apple-accent-red);
    border-color: var(--apple-accent-red);
  }
  
  .clear-all-button:hover {
    background: rgba(255, 59, 48, 0.1);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .section-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .section-controls {
      justify-content: space-between;
    }
  }
  
  @media (max-width: 768px) {
    .page-header {
      padding: 24px 16px;
    }
    
    .main-content {
      padding: 24px 16px;
    }
    
    .page-title {
      font-size: 28px;
    }
    
    .stats-dashboard {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .section-controls {
      flex-direction: column;
      gap: 12px;
    }
    
    .filter-controls {
      width: 100%;
      justify-content: space-between;
    }
    
    .search-container {
      min-width: auto;
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .stats-dashboard {
      grid-template-columns: 1fr;
    }
    
    .page-title {
      font-size: 24px;
      flex-direction: column;
      gap: 8px;
    }
  }
</style>