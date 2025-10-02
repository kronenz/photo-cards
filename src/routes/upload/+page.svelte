<script lang="ts">
  import { onMount } from 'svelte';
  import MediaUpload from '$lib/components/MediaUpload.svelte';
  import type { UploadResult } from '$lib/services/uploadService.js';
  
  // 상태 관리
  let uploadedFiles: UploadResult[] = [];
  let isUploading = false;
  let uploadProgress = 0;
  
  // 업로드 이벤트 핸들러
  function handleFilesAdded(event: CustomEvent) {
    const files = event.detail;
    console.log('Files added:', files);
  }
  
  function handleFileRemoved(event: CustomEvent) {
    const file = event.detail;
    console.log('File removed:', file);
  }
  
  function handleUploadProgress(event: CustomEvent) {
    const { file, progress } = event.detail;
    uploadProgress = progress;
    console.log(`Upload progress for ${file.file.name}: ${progress}%`);
  }
  
  function handleUploadComplete(event: CustomEvent) {
    const file = event.detail;
    console.log('Upload completed:', file);
    
    // 실제 구현에서는 서버 응답을 처리
    const result: UploadResult = {
      id: crypto.randomUUID(),
      filename: file.file.name,
      url: URL.createObjectURL(file.file),
      size: file.file.size,
      type: file.file.type
    };
    
    uploadedFiles = [...uploadedFiles, result];
  }
  
  function handleUploadError(event: CustomEvent) {
    const { file, error } = event.detail;
    console.error(`Upload error for ${file.file.name}:`, error);
  }
  
  // 업로드된 파일 제거
  function removeUploadedFile(fileToRemove: UploadResult) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileToRemove.id);
    // URL 정리
    if (fileToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url);
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
</script>

<svelte:head>
  <title>미디어 업로드 - KBO 홀로그래픽 카드</title>
  <meta name="description" content="Apple Photos 스타일 드래그 앤 드롭 미디어 업로드" />
</svelte:head>

<div class="upload-page">
  <!-- 헤더 -->
  <header class="page-header">
    <div class="container">
      <h1 class="page-title">
        <span class="title-icon">📁</span>
        미디어 업로드
      </h1>
      <p class="page-subtitle">
        Apple Photos 스타일의 드래그 앤 드롭으로 이미지, 비디오, 오디오 파일을 업로드하세요
      </p>
    </div>
  </header>
  
  <!-- 메인 콘텐츠 -->
  <main class="page-main">
    <div class="container">
      <!-- 업로드 섹션 -->
      <section class="upload-section">
        <div class="section-header">
          <h2 class="section-title">파일 업로드</h2>
          <p class="section-description">
            이미지, 비디오, 오디오 파일을 드래그하여 업로드하거나 클릭하여 파일을 선택하세요
          </p>
        </div>
        
        <MediaUpload
          accept="image/*,video/*,audio/*"
          maxFiles={10}
          maxSize={50 * 1024 * 1024}
          multiple={true}
          on:filesAdded={handleFilesAdded}
          on:fileRemoved={handleFileRemoved}
          on:uploadProgress={handleUploadProgress}
          on:uploadComplete={handleUploadComplete}
          on:uploadError={handleUploadError}
        />
      </section>
      
      <!-- 업로드된 파일 갤러리 -->
      {#if uploadedFiles.length > 0}
        <section class="gallery-section">
          <div class="section-header">
            <h2 class="section-title">업로드된 파일 ({uploadedFiles.length})</h2>
            <p class="section-description">
              성공적으로 업로드된 파일들입니다
            </p>
          </div>
          
          <div class="file-gallery">
            {#each uploadedFiles as file (file.id)}
              <div class="gallery-item">
                <div class="gallery-preview">
                  {#if file.type.startsWith('image/')}
                    <img src={file.url} alt={file.filename} />
                  {:else if file.type.startsWith('video/')}
                    <video src={file.url} controls>
                      <track kind="captions" />
                    </video>
                  {:else if file.type.startsWith('audio/')}
                    <div class="audio-preview">
                      <div class="audio-icon">🎵</div>
                      <audio src={file.url} controls></audio>
                    </div>
                  {:else}
                    <div class="file-preview">
                      <div class="file-icon">📄</div>
                    </div>
                  {/if}
                </div>
                
                <div class="gallery-info">
                  <div class="file-name">{file.filename}</div>
                  <div class="file-meta">
                    <span class="file-size">{formatFileSize(file.size)}</span>
                    <span class="file-type">{file.type.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
                
                <div class="gallery-actions">
                  <button
                    class="btn-ghost-small"
                    on:click={() => removeUploadedFile(file)}
                    aria-label="파일 제거"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}
      
      <!-- 사용법 안내 -->
      <section class="help-section">
        <div class="section-header">
          <h2 class="section-title">사용법 안내</h2>
        </div>
        
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon">🖱️</div>
            <h3>드래그 앤 드롭</h3>
            <p>파일을 드래그하여 업로드 영역에 놓으세요</p>
          </div>
          
          <div class="help-item">
            <div class="help-icon">📁</div>
            <h3>파일 선택</h3>
            <p>업로드 영역을 클릭하여 파일을 선택하세요</p>
          </div>
          
          <div class="help-item">
            <div class="help-icon">🎨</div>
            <h3>자동 최적화</h3>
            <p>이미지는 자동으로 최적화되어 업로드됩니다</p>
          </div>
          
          <div class="help-item">
            <div class="help-icon">⚡</div>
            <h3>빠른 처리</h3>
            <p>60fps 보장 부드러운 업로드 경험</p>
          </div>
        </div>
      </section>
      
      <!-- 지원 포맷 -->
      <section class="formats-section">
        <div class="section-header">
          <h2 class="section-title">지원 포맷</h2>
        </div>
        
        <div class="formats-grid">
          <div class="format-category">
            <h3>이미지</h3>
            <div class="format-list">
              <span class="format-tag">JPEG</span>
              <span class="format-tag">PNG</span>
              <span class="format-tag">WebP</span>
              <span class="format-tag">AVIF</span>
              <span class="format-tag">GIF</span>
            </div>
          </div>
          
          <div class="format-category">
            <h3>비디오</h3>
            <div class="format-list">
              <span class="format-tag">MP4</span>
              <span class="format-tag">WebM</span>
              <span class="format-tag">MOV</span>
              <span class="format-tag">AVI</span>
            </div>
          </div>
          
          <div class="format-category">
            <h3>오디오</h3>
            <div class="format-list">
              <span class="format-tag">MP3</span>
              <span class="format-tag">WAV</span>
              <span class="format-tag">OGG</span>
              <span class="format-tag">M4A</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</div>

<style>
  .upload-page {
    min-height: 100vh;
    background: var(--apple-bg-primary);
    color: var(--apple-text-primary);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  /* 헤더 */
  .page-header {
    padding: 60px 0 40px;
    text-align: center;
    background: linear-gradient(135deg, var(--apple-bg-primary), var(--apple-bg-secondary));
  }
  
  .page-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .title-icon {
    font-size: 0.8em;
    animation: bounce 2s ease-in-out infinite;
  }
  
  .page-subtitle {
    font-size: 20px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
  
  /* 메인 콘텐츠 */
  .page-main {
    padding: 40px 0 80px;
  }
  
  /* 섹션 공통 스타일 */
  .upload-section,
  .gallery-section,
  .help-section,
  .formats-section {
    margin-bottom: 80px;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .section-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
  }
  
  .section-description {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
  }
  
  /* 갤러리 */
  .file-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  
  .gallery-item {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .gallery-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .gallery-preview {
    aspect-ratio: 16/9;
    overflow: hidden;
    background: var(--apple-surface-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .gallery-preview img,
  .gallery-preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .audio-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }
  
  .audio-icon {
    font-size: 48px;
    opacity: 0.7;
  }
  
  .file-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .file-icon {
    font-size: 48px;
    opacity: 0.7;
  }
  
  .gallery-info {
    padding: 16px 20px;
  }
  
  .file-name {
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .file-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  .file-type {
    background: var(--apple-surface-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .gallery-actions {
    padding: 0 20px 16px;
    display: flex;
    justify-content: flex-end;
  }
  
  .btn-ghost-small {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    font-size: 16px;
  }
  
  .btn-ghost-small:hover {
    background: var(--apple-surface-secondary);
  }
  
  /* 도움말 섹션 */
  .help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 32px;
  }
  
  .help-item {
    text-align: center;
    padding: 32px 24px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .help-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .help-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .help-item h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .help-item p {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
  
  /* 포맷 섹션 */
  .formats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
  }
  
  .format-category {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
  }
  
  .format-category h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px;
    color: var(--apple-text-primary);
  }
  
  .format-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  
  .format-tag {
    background: var(--apple-accent-blue);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
  }
  
  /* 애니메이션 */
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }
    
    .page-header {
      padding: 40px 0 32px;
    }
    
    .page-main {
      padding: 32px 0 60px;
    }
    
    .upload-section,
    .gallery-section,
    .help-section,
    .formats-section {
      margin-bottom: 60px;
    }
    
    .file-gallery {
      grid-template-columns: 1fr;
    }
    
    .help-grid,
    .formats-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    
    .help-item,
    .format-category {
      padding: 24px 20px;
    }
  }
</style>