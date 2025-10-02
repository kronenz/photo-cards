<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // 지원되는 파일 타입
  const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const SUPPORTED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg'];
  
  // Props
  export let maxFileSize = 50 * 1024 * 1024; // 50MB
  export let maxVideoDuration = 10; // 10초
  export let allowMultiple = true;
  export let acceptedTypes: 'image' | 'video' | 'audio' | 'all' = 'all';
  
  // 상태 관리
  let isDragOver = false;
  let uploadedFiles: Array<{
    id: string;
    file: File;
    type: 'image' | 'video' | 'audio';
    preview?: string;
    thumbnail?: string;
    duration?: number;
    size: number;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    progress: number;
    error?: string;
  }> = [];
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    filesUploaded: Array<typeof uploadedFiles[0]>;
    fileProcessed: typeof uploadedFiles[0];
    uploadProgress: { fileId: string; progress: number };
    uploadError: { fileId: string; error: string };
  }>();
  
  // 파일 타입 확인
  function getFileType(file: File): 'image' | 'video' | 'audio' | null {
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) return 'image';
    if (SUPPORTED_VIDEO_TYPES.includes(file.type)) return 'video';
    if (SUPPORTED_AUDIO_TYPES.includes(file.type)) return 'audio';
    return null;
  }
  
  // 허용된 파일 타입 확인
  function isFileTypeAllowed(fileType: string): boolean {
    if (acceptedTypes === 'all') return true;
    if (acceptedTypes === 'image') return SUPPORTED_IMAGE_TYPES.includes(fileType);
    if (acceptedTypes === 'video') return SUPPORTED_VIDEO_TYPES.includes(fileType);
    if (acceptedTypes === 'audio') return SUPPORTED_AUDIO_TYPES.includes(fileType);
    return false;
  }
  
  // 파일 검증
  function validateFile(file: File): { valid: boolean; error?: string } {
    // 파일 타입 확인
    if (!isFileTypeAllowed(file.type)) {
      return { valid: false, error: '지원되지 않는 파일 형식입니다.' };
    }
    
    // 파일 크기 확인
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return { valid: false, error: `파일 크기가 ${maxSizeMB}MB를 초과합니다.` };
    }
    
    return { valid: true };
  }
  
  // 이미지 미리보기 생성
  function createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // 비디오 미리보기 및 썸네일 생성
  function createVideoPreview(file: File): Promise<{ preview: string; thumbnail: string; duration: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // 비디오 길이 확인
        if (video.duration > maxVideoDuration) {
          reject(new Error(`비디오 길이가 ${maxVideoDuration}초를 초과합니다.`));
          return;
        }
        
        // 썸네일 생성 (1초 지점)
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.oncanplay = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        const preview = URL.createObjectURL(file);
        
        resolve({
          preview,
          thumbnail,
          duration: video.duration
        });
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }
  
  // 오디오 미리보기 생성
  function createAudioPreview(file: File): Promise<{ preview: string; duration: number }> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      
      audio.onloadedmetadata = () => {
        resolve({
          preview: URL.createObjectURL(file),
          duration: audio.duration
        });
      };
      
      audio.onerror = reject;
      audio.src = URL.createObjectURL(file);
    });
  }
  
  // 파일 처리 (향상된 멀티미디어 서비스 사용)
  async function processFile(file: File): Promise<typeof uploadedFiles[0]> {
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileType = getFileType(file);
    
    if (!fileType) {
      throw new Error('지원되지 않는 파일 형식입니다.');
    }
    
    const fileData: typeof uploadedFiles[0] = {
      id: fileId,
      file,
      type: fileType,
      size: file.size,
      status: 'processing',
      progress: 0
    };
    
    try {
      // 멀티미디어 서비스를 사용한 고급 처리
      const { multimediaService, KBO_PROCESSING_PRESETS } = await import('../services/multimediaService.js');
      
      // KBO 특화 처리 옵션 선택
      let processingOptions = KBO_PROCESSING_PRESETS.homerun; // 기본값
      
      if (fileType === 'video') {
        processingOptions = KBO_PROCESSING_PRESETS.homerun;
      } else if (fileType === 'audio') {
        processingOptions = KBO_PROCESSING_PRESETS.cheer;
      }
      
      // 진행률 콜백 설정
      const onProgress = (id: string, progress: number) => {
        fileData.progress = progress;
        uploadedFiles = uploadedFiles; // 반응성 트리거
      };
      
      // 파일 처리 실행
      const processedFile = await multimediaService.processFile(file, {
        ...processingOptions,
        onProgress
      });
      
      // 결과를 기존 형식에 맞게 변환
      if (processedFile.preview) {
        fileData.preview = processedFile.preview;
      }
      
      if (processedFile.thumbnail) {
        fileData.thumbnail = URL.createObjectURL(processedFile.thumbnail);
      }
      
      // 비디오/오디오 길이 정보
      if ('duration' in processedFile.metadata) {
        fileData.duration = processedFile.metadata.duration;
      }
      
      fileData.status = 'completed';
      fileData.progress = 100;
      
      return fileData;
    } catch (error) {
      fileData.status = 'error';
      fileData.error = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';
      throw error;
    }
  }
  
  // 파일 업로드 처리
  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        console.error(`파일 검증 실패: ${file.name} - ${validation.error}`);
        continue;
      }
      
      try {
        const processedFile = await processFile(file);
        uploadedFiles = [...uploadedFiles, processedFile];
        dispatch('fileProcessed', processedFile);
      } catch (error) {
        console.error(`파일 처리 실패: ${file.name}`, error);
        dispatch('uploadError', {
          fileId: `error-${Date.now()}`,
          error: error instanceof Error ? error.message : '파일 처리 실패'
        });
      }
    }
    
    dispatch('filesUploaded', uploadedFiles);
  }
  
  // 드래그 앤 드롭 이벤트
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }
  
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }
  
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }
  
  // 파일 선택 이벤트
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // 입력 초기화 (같은 파일 재선택 가능)
    input.value = '';
  }
  
  // 파일 제거
  function removeFile(fileId: string) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    dispatch('filesUploaded', uploadedFiles);
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
  
  // 허용된 파일 타입 문자열 생성
  function getAcceptString(): string {
    if (acceptedTypes === 'image') return SUPPORTED_IMAGE_TYPES.join(',');
    if (acceptedTypes === 'video') return SUPPORTED_VIDEO_TYPES.join(',');
    if (acceptedTypes === 'audio') return SUPPORTED_AUDIO_TYPES.join(',');
    return [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES, ...SUPPORTED_AUDIO_TYPES].join(',');
  }
</script>

<div class="media-uploader">
  <!-- 드래그 앤 드롭 영역 -->
  <div 
    class="drop-zone"
    class:drag-over={isDragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
  >
    <div class="drop-zone-content">
      <div class="upload-icon">
        {#if acceptedTypes === 'image'}
          📷
        {:else if acceptedTypes === 'video'}
          🎬
        {:else if acceptedTypes === 'audio'}
          🎵
        {:else}
          📁
        {/if}
      </div>
      
      <h3 class="upload-title">
        {#if acceptedTypes === 'image'}
          이미지 업로드
        {:else if acceptedTypes === 'video'}
          동영상 업로드
        {:else if acceptedTypes === 'audio'}
          오디오 업로드
        {:else}
          미디어 파일 업로드
        {/if}
      </h3>
      
      <p class="upload-description">
        파일을 드래그하여 놓거나 클릭하여 선택하세요
      </p>
      
      <div class="upload-specs">
        {#if acceptedTypes === 'image'}
          <span>JPG, PNG, WebP, AVIF</span>
        {:else if acceptedTypes === 'video'}
          <span>MP4, WebM, MOV (최대 {maxVideoDuration}초)</span>
        {:else if acceptedTypes === 'audio'}
          <span>MP3, WAV, AAC, OGG</span>
        {:else}
          <span>이미지, 동영상, 오디오 파일</span>
        {/if}
        <span>최대 {Math.round(maxFileSize / (1024 * 1024))}MB</span>
      </div>
      
      <button class="upload-button" type="button">
        파일 선택
      </button>
    </div>
    
    <!-- 숨겨진 파일 입력 -->
    <input
      type="file"
      accept={getAcceptString()}
      multiple={allowMultiple}
      on:change={handleFileSelect}
      style="display: none;"
    />
  </div>
  
  <!-- 업로드된 파일 목록 -->
  {#if uploadedFiles.length > 0}
    <div class="uploaded-files">
      <h4 class="files-title">업로드된 파일 ({uploadedFiles.length})</h4>
      
      <div class="files-grid">
        {#each uploadedFiles as file (file.id)}
          <div class="file-item" class:error={file.status === 'error'}>
            <!-- 파일 미리보기 -->
            <div class="file-preview">
              {#if file.type === 'image' && file.preview}
                <img src={file.preview} alt={file.file.name} />
              {:else if file.type === 'video' && file.thumbnail}
                <img src={file.thumbnail} alt={file.file.name} />
                <div class="video-overlay">
                  <div class="play-icon">▶️</div>
                  {#if file.duration}
                    <div class="duration">{formatDuration(file.duration)}</div>
                  {/if}
                </div>
              {:else if file.type === 'audio'}
                <div class="audio-preview">
                  <div class="audio-icon">🎵</div>
                  {#if file.duration}
                    <div class="duration">{formatDuration(file.duration)}</div>
                  {/if}
                </div>
              {/if}
              
              <!-- 상태 오버레이 -->
              {#if file.status === 'processing'}
                <div class="status-overlay">
                  <div class="spinner"></div>
                  <span>처리 중...</span>
                </div>
              {:else if file.status === 'error'}
                <div class="status-overlay error">
                  <span>❌</span>
                  <span>오류</span>
                </div>
              {/if}
            </div>
            
            <!-- 파일 정보 -->
            <div class="file-info">
              <div class="file-name" title={file.file.name}>
                {file.file.name}
              </div>
              <div class="file-meta">
                <span class="file-size">{formatFileSize(file.size)}</span>
                <span class="file-type">{file.type.toUpperCase()}</span>
              </div>
              
              {#if file.status === 'error' && file.error}
                <div class="error-message">{file.error}</div>
              {/if}
            </div>
            
            <!-- 제거 버튼 -->
            <button 
              class="remove-button"
              on:click={() => removeFile(file.id)}
              title="파일 제거"
            >
              ✕
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
<style>

  .media-uploader {
    width: 100%;
  }
  
  /* 드래그 앤 드롭 영역 */
  .drop-zone {
    position: relative;
    border: 2px dashed var(--apple-surface-border);
    border-radius: 16px;
    background: var(--apple-surface-secondary);
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .drop-zone:hover,
  .drop-zone.drag-over {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.05);
    transform: translateY(-2px);
  }
  
  .drop-zone-content {
    pointer-events: none;
  }
  
  .upload-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .upload-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .upload-description {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0 0 16px;
  }
  
  .upload-specs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    color: var(--apple-text-tertiary);
    margin-bottom: 20px;
  }
  
  .upload-button {
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    pointer-events: auto;
  }
  
  .upload-button:hover {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }
  
  /* 업로드된 파일 목록 */
  .uploaded-files {
    margin-top: 32px;
  }
  
  .files-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px;
    color: var(--apple-text-primary);
  }
  
  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  /* 파일 아이템 */
  .file-item {
    position: relative;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    overflow: hidden;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .file-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .file-item.error {
    border-color: var(--apple-accent-red);
  }
  
  /* 파일 미리보기 */
  .file-preview {
    position: relative;
    aspect-ratio: 16/9;
    background: var(--apple-surface-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .file-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .file-item:hover .video-overlay {
    opacity: 1;
  }
  
  .play-icon {
    font-size: 24px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .audio-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--apple-text-secondary);
  }
  
  .audio-icon {
    font-size: 32px;
  }
  
  /* 상태 오버레이 */
  .status-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
  }
  
  .status-overlay.error {
    background: rgba(255, 59, 48, 0.1);
    color: var(--apple-accent-red);
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--apple-surface-border);
    border-top: 2px solid var(--apple-accent-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 파일 정보 */
  .file-info {
    padding: 12px;
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
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  .file-type {
    background: var(--apple-surface-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .error-message {
    margin-top: 8px;
    font-size: 12px;
    color: var(--apple-accent-red);
    background: rgba(255, 59, 48, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  /* 제거 버튼 */
  .remove-button {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .file-item:hover .remove-button {
    opacity: 1;
  }
  
  .remove-button:hover {
    background: var(--apple-accent-red);
    transform: scale(1.1);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .drop-zone {
      padding: 24px 16px;
    }
    
    .upload-icon {
      font-size: 36px;
    }
    
    .upload-title {
      font-size: 18px;
    }
    
    .files-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .files-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>