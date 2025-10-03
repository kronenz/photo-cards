<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // 타입 정의
  interface MediaFile {
    id: string;
    file: File;
    type: 'image' | 'video' | 'audio';
    preview?: string;
    progress?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
  }
  
  // Props
  export let accept = 'image/*,video/*,audio/*';
  export let maxFiles = 10;
  export let maxSize = 50 * 1024 * 1024; // 50MB
  export let multiple = true;
  export let disabled = false;
  
  // 상태 관리
  let files: MediaFile[] = [];
  let dragActive = false;
  let fileInput: HTMLInputElement;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    filesAdded: MediaFile[];
    fileRemoved: MediaFile;
    uploadProgress: { file: MediaFile; progress: number };
    uploadComplete: MediaFile;
    uploadError: { file: MediaFile; error: string };
  }>();
  
  onMount(() => {
    if (!browser) return;
    
    // 전역 드래그 앤 드롭 이벤트 방지
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, preventDefaults, false);
    });
    
    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.removeEventListener(eventName, preventDefaults, false);
      });
    };
  });
  
  // 파일 타입 검증
  function getFileType(file: File): 'image' | 'video' | 'audio' | null {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return null;
  }
  
  // 파일 크기 포맷팅
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 미리보기 생성
  async function createPreview(file: File, type: 'image' | 'video' | 'audio'): Promise<string | undefined> {
    if (type === 'image') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (type === 'video') {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          video.currentTime = 1; // 1초 지점에서 썸네일 생성
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      });
    }
    return undefined;
  }
  
  // 파일 처리
  async function processFiles(fileList: FileList | File[]) {
    const newFiles: MediaFile[] = [];
    
    for (const file of Array.from(fileList)) {
      // 파일 타입 검증
      const type = getFileType(file);
      if (!type) {
        console.warn(`지원하지 않는 파일 타입: ${file.type}`);
        continue;
      }
      
      // 파일 크기 검증
      if (file.size > maxSize) {
        console.warn(`파일 크기가 너무 큽니다: ${formatFileSize(file.size)}`);
        continue;
      }
      
      // 최대 파일 수 검증
      if (files.length + newFiles.length >= maxFiles) {
        console.warn(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        break;
      }
      
      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        file,
        type,
        status: 'pending'
      };
      
      // 미리보기 생성
      try {
        mediaFile.preview = await createPreview(file, type);
      } catch (error) {
        console.warn('미리보기 생성 실패:', error);
      }
      
      newFiles.push(mediaFile);
    }
    
    if (newFiles.length > 0) {
      files = [...files, ...newFiles];
      dispatch('filesAdded', newFiles);
    }
  }
  
  // 드래그 앤 드롭 이벤트 핸들러
  function handleDragEnter(e: DragEvent) {
    if (disabled) return;
    dragActive = true;
  }
  
  function handleDragLeave(e: DragEvent) {
    if (disabled) return;
    // 드롭존을 완전히 벗어났을 때만 비활성화
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      dragActive = false;
    }
  }
  
  function handleDragOver(e: DragEvent) {
    if (disabled) return;
    e.preventDefault();
  }
  
  function handleDrop(e: DragEvent) {
    if (disabled) return;
    e.preventDefault();
    dragActive = false;
    
    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }
  
  // 파일 선택 핸들러
  function handleFileSelect(e: Event) {
    if (disabled) return;
    const target = e.target as HTMLInputElement;
    const selectedFiles = target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // 입력 초기화 (같은 파일 재선택 가능)
    target.value = '';
  }
  
  // 파일 제거
  function removeFile(fileToRemove: MediaFile) {
    files = files.filter(f => f.id !== fileToRemove.id);
    dispatch('fileRemoved', fileToRemove);
  }
  
  // 파일 선택 트리거
  function triggerFileSelect() {
    if (disabled) return;
    fileInput?.click();
  }
  
  // 업로드 시뮬레이션 (실제 구현에서는 실제 업로드 로직으로 교체)
  async function uploadFile(mediaFile: MediaFile) {
    mediaFile.status = 'uploading';
    mediaFile.progress = 0;
    
    // 진행률 시뮬레이션
    const interval = setInterval(() => {
      if (mediaFile.progress! < 100) {
        mediaFile.progress! += Math.random() * 20;
        dispatch('uploadProgress', { file: mediaFile, progress: mediaFile.progress! });
        files = files; // 반응성 트리거
      } else {
        clearInterval(interval);
        mediaFile.status = 'completed';
        mediaFile.progress = 100;
        dispatch('uploadComplete', mediaFile);
        files = files; // 반응성 트리거
      }
    }, 200);
  }
  
  // 모든 파일 업로드
  function uploadAllFiles() {
    files.forEach(file => {
      if (file.status === 'pending') {
        uploadFile(file);
      }
    });
  }
  
  // 모든 파일 제거
  function clearAllFiles() {
    files = [];
  }
</script>

<!-- 파일 입력 (숨김) -->
<input
  bind:this={fileInput}
  type="file"
  {accept}
  {multiple}
  on:change={handleFileSelect}
  style="display: none;"
/>

<!-- 메인 업로드 영역 -->
<div class="media-upload">
  <!-- 드롭존 -->
  <div
    class="drop-zone"
    class:active={dragActive}
    class:disabled
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
    on:click={triggerFileSelect}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Enter' && triggerFileSelect()}
  >
    <div class="drop-zone-content">
      {#if dragActive}
        <div class="drop-active">
          <div class="drop-icon">📁</div>
          <h3>파일을 여기에 놓으세요</h3>
          <p>이미지, 비디오, 오디오 파일을 지원합니다</p>
        </div>
      {:else}
        <div class="drop-inactive">
          <div class="upload-icon">☁️</div>
          <h3>파일을 드래그하거나 클릭하여 업로드</h3>
          <p>
            최대 {maxFiles}개 파일, 파일당 최대 {formatFileSize(maxSize)}
          </p>
          <button class="select-button" type="button">
            파일 선택
          </button>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- 파일 목록 -->
  {#if files.length > 0}
    <div class="file-list">
      <div class="file-list-header">
        <h4>업로드할 파일 ({files.length})</h4>
        <div class="file-list-actions">
          <button
            class="btn-secondary"
            on:click={uploadAllFiles}
            disabled={files.every(f => f.status !== 'pending')}
          >
            모두 업로드
          </button>
          <button class="btn-ghost" on:click={clearAllFiles}>
            모두 제거
          </button>
        </div>
      </div>
      
      <div class="file-items">
        {#each files as file (file.id)}
          <div class="file-item" class:uploading={file.status === 'uploading'}>
            <!-- 미리보기 -->
            <div class="file-preview">
              {#if file.preview}
                {#if file.type === 'image'}
                  <img src={file.preview} alt={file.file.name} />
                {:else if file.type === 'video'}
                  <div class="video-preview">
                    <img src={file.preview} alt={file.file.name} />
                    <div class="video-overlay">▶️</div>
                  </div>
                {/if}
              {:else}
                <div class="file-icon">
                  {#if file.type === 'image'}🖼️
                  {:else if file.type === 'video'}🎬
                  {:else if file.type === 'audio'}🎵
                  {:else}📄{/if}
                </div>
              {/if}
            </div>
            
            <!-- 파일 정보 -->
            <div class="file-info">
              <div class="file-name">{file.file.name}</div>
              <div class="file-meta">
                <span class="file-size">{formatFileSize(file.file.size)}</span>
                <span class="file-type">{file.type.toUpperCase()}</span>
              </div>
              
              <!-- 진행률 바 -->
              {#if file.status === 'uploading' && file.progress !== undefined}
                <div class="progress-bar">
                  <div class="progress-fill" style="width: {file.progress}%"></div>
                </div>
                <div class="progress-text">{Math.round(file.progress)}%</div>
              {:else if file.status === 'completed'}
                <div class="status-completed">✅ 업로드 완료</div>
              {:else if file.status === 'error'}
                <div class="status-error">❌ {file.error || '업로드 실패'}</div>
              {/if}
            </div>
            
            <!-- 액션 버튼 -->
            <div class="file-actions">
              {#if file.status === 'pending'}
                <button
                  class="btn-primary-small"
                  on:click={() => uploadFile(file)}
                >
                  업로드
                </button>
              {/if}
              <button
                class="btn-ghost-small"
                on:click={() => removeFile(file)}
                disabled={file.status === 'uploading'}
              >
                제거
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .media-upload {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
  
  /* 드롭존 스타일 */
  .drop-zone {
    border: 2px dashed var(--apple-surface-border);
    border-radius: 16px;
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
    background: var(--apple-surface-secondary);
    position: relative;
    overflow: hidden;
  }
  
  .drop-zone:hover:not(.disabled) {
    border-color: var(--apple-accent-blue);
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
  }
  
  .drop-zone.active {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.1);
    transform: scale(1.02);
  }
  
  .drop-zone.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .drop-zone-content {
    position: relative;
    z-index: 1;
  }
  
  .drop-active,
  .drop-inactive {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .drop-icon,
  .upload-icon {
    font-size: 48px;
    opacity: 0.7;
  }
  
  .drop-zone h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--apple-text-primary);
  }
  
  .drop-zone p {
    margin: 0;
    color: var(--apple-text-secondary);
    font-size: 14px;
  }
  
  .select-button {
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .select-button:hover {
    background: color-mix(in srgb, var(--apple-accent-blue) 90%, black);
    transform: translateY(-1px);
  }
  
  /* 파일 목록 스타일 */
  .file-list {
    margin-top: 32px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .file-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .file-list-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
  }
  
  .file-list-actions {
    display: flex;
    gap: 8px;
  }
  
  .file-items {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--apple-surface-border);
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .file-item:last-child {
    border-bottom: none;
  }
  
  .file-item:hover {
    background: var(--apple-surface-secondary);
  }
  
  .file-item.uploading {
    background: rgba(0, 122, 255, 0.05);
  }
  
  /* 파일 미리보기 */
  .file-preview {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--apple-surface-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .file-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .video-preview {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .video-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  
  .file-icon {
    font-size: 24px;
  }
  
  /* 파일 정보 */
  .file-info {
    flex: 1;
    min-width: 0;
  }
  
  .file-name {
    font-weight: 500;
    color: var(--apple-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
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
  
  /* 진행률 바 */
  .progress-bar {
    width: 100%;
    height: 4px;
    background: var(--apple-surface-tertiary);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 8px;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--apple-accent-blue);
    border-radius: 2px;
    transition: width var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .progress-text {
    font-size: 12px;
    color: var(--apple-text-secondary);
    margin-top: 4px;
  }
  
  .status-completed {
    color: var(--apple-accent-green);
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
  }
  
  .status-error {
    color: var(--apple-accent-red);
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
  }
  
  /* 액션 버튼 */
  .file-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  
  .btn-primary-small,
  .btn-secondary,
  .btn-ghost,
  .btn-ghost-small {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    border: none;
  }
  
  .btn-primary-small {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .btn-primary-small:hover {
    background: color-mix(in srgb, var(--apple-accent-blue) 90%, black);
  }
  
  .btn-secondary {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    border: 1px solid var(--apple-surface-border);
  }
  
  .btn-secondary:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .btn-ghost,
  .btn-ghost-small {
    background: transparent;
    color: var(--apple-text-secondary);
  }
  
  .btn-ghost:hover,
  .btn-ghost-small:hover {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
  }
  
  .btn-secondary:disabled,
  .btn-ghost:disabled,
  .btn-ghost-small:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .drop-zone {
      padding: 32px 16px;
    }
    
    .file-list-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    
    .file-list-actions {
      justify-content: center;
    }
    
    .file-item {
      padding: 12px 16px;
    }
    
    .file-preview {
      width: 40px;
      height: 40px;
    }
  }
</style>