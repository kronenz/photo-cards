<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let file: File | null = null;
  export let src: string | null = null;
  export let type: 'image' | 'video' | 'audio' = 'image';
  export let thumbnail: string | null = null;
  export let duration: number | null = null;
  export let waveform: string | null = null;
  export let autoplay = false;
  export let controls = true;
  export let muted = true;
  export let loop = false;
  export let width: number | null = null;
  export let height: number | null = null;
  export let className = '';
  
  // 상태 관리
  let mediaElement: HTMLImageElement | HTMLVideoElement | HTMLAudioElement;
  let isLoading = true;
  let isPlaying = false;
  let currentTime = 0;
  let volume = 1;
  let isFullscreen = false;
  let error: string | null = null;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    load: void;
    play: void;
    pause: void;
    ended: void;
    timeupdate: { currentTime: number; duration: number };
    volumechange: { volume: number };
    error: { error: string };
    fullscreen: { isFullscreen: boolean };
  }>();
  
  // 미디어 URL 계산
  $: mediaUrl = src || (file ? URL.createObjectURL(file) : null);
  
  // 컴포넌트 정리
  onDestroy(() => {
    if (file && mediaUrl && mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }
  });
  
  // 미디어 로드 완료
  function handleLoad() {
    isLoading = false;
    error = null;
    dispatch('load');
  }
  
  // 재생 시작
  function handlePlay() {
    isPlaying = true;
    dispatch('play');
  }
  
  // 재생 일시정지
  function handlePause() {
    isPlaying = false;
    dispatch('pause');
  }
  
  // 재생 종료
  function handleEnded() {
    isPlaying = false;
    dispatch('ended');
  }
  
  // 시간 업데이트
  function handleTimeUpdate() {
    if (mediaElement && 'currentTime' in mediaElement && 'duration' in mediaElement) {
      currentTime = mediaElement.currentTime;
      dispatch('timeupdate', {
        currentTime: mediaElement.currentTime,
        duration: mediaElement.duration
      });
    }
  }
  
  // 볼륨 변경
  function handleVolumeChange() {
    if (mediaElement && 'volume' in mediaElement) {
      volume = mediaElement.volume;
      dispatch('volumechange', { volume });
    }
  }
  
  // 에러 처리
  function handleError(event: Event) {
    isLoading = false;
    error = '미디어를 로드할 수 없습니다.';
    dispatch('error', { error });
  }
  
  // 재생/일시정지 토글
  function togglePlay() {
    if (mediaElement && 'play' in mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    }
  }
  
  // 전체화면 토글
  function toggleFullscreen() {
    if (!browser) return;
    
    if (!isFullscreen) {
      if (mediaElement.requestFullscreen) {
        mediaElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  // 전체화면 상태 변경 감지
  onMount(() => {
    if (!browser) return;
    
    const handleFullscreenChange = () => {
      isFullscreen = !!document.fullscreenElement;
      dispatch('fullscreen', { isFullscreen });
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  });
  
  // 시간 포맷팅
  function formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 키보드 단축키
  function handleKeydown(event: KeyboardEvent) {
    if (!mediaElement) return;
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        togglePlay();
        break;
      case 'KeyF':
        event.preventDefault();
        toggleFullscreen();
        break;
      case 'KeyM':
        event.preventDefault();
        if ('muted' in mediaElement) {
          mediaElement.muted = !mediaElement.muted;
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if ('currentTime' in mediaElement) {
          mediaElement.currentTime = Math.max(0, mediaElement.currentTime - 10);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if ('currentTime' in mediaElement && 'duration' in mediaElement) {
          mediaElement.currentTime = Math.min(mediaElement.duration, mediaElement.currentTime + 10);
        }
        break;
    }
  }
</script>

<div 
  class="media-preview {className}"
  class:loading={isLoading}
  class:error={!!error}
  style:width={width ? `${width}px` : null}
  style:height={height ? `${height}px` : null}
  on:keydown={handleKeydown}
  tabindex="0"
  role="application"
  aria-label="Media preview with keyboard controls"
>
  {#if error}
    <!-- 에러 상태 -->
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{error}</div>
      <button class="retry-button" on:click={() => { error = null; isLoading = true; }}>
        다시 시도
      </button>
    </div>
  {:else if type === 'image'}
    <!-- 이미지 미리보기 -->
    <div class="image-container">
      {#if mediaUrl}
        <img
          bind:this={mediaElement}
          src={mediaUrl}
          alt={file?.name || 'Image preview'}
          on:load={handleLoad}
          on:error={handleError}
          class="media-image"
          class:loaded={!isLoading}
        />
      {/if}
      
      {#if isLoading}
        <div class="loading-overlay">
          <div class="spinner"></div>
          <span>이미지 로딩 중...</span>
        </div>
      {/if}
    </div>
  {:else if type === 'video'}
    <!-- 비디오 미리보기 -->
    <div class="video-container">
      {#if mediaUrl}
        <video
          bind:this={mediaElement}
          src={mediaUrl}
          {autoplay}
          {controls}
          {muted}
          {loop}
          preload="metadata"
          on:loadeddata={handleLoad}
          on:play={handlePlay}
          on:pause={handlePause}
          on:ended={handleEnded}
          on:timeupdate={handleTimeUpdate}
          on:volumechange={handleVolumeChange}
          on:error={handleError}
          class="media-video"
        >
          <track kind="captions" />
        </video>
      {/if}
      
      <!-- 비디오 썸네일 (로딩 중일 때) -->
      {#if isLoading && thumbnail}
        <div class="video-thumbnail">
          <img src={thumbnail} alt="Video thumbnail" />
          <div class="play-overlay">
            <div class="play-button">▶️</div>
          </div>
        </div>
      {/if}
      
      <!-- 커스텀 컨트롤 (필요시) -->
      {#if !controls && !isLoading}
        <div class="custom-controls">
          <button class="control-button" on:click={togglePlay}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          {#if duration}
            <div class="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          {/if}
          
          <button class="control-button" on:click={toggleFullscreen}>
            {isFullscreen ? '🗗' : '🗖'}
          </button>
        </div>
      {/if}
      
      {#if isLoading}
        <div class="loading-overlay">
          <div class="spinner"></div>
          <span>비디오 로딩 중...</span>
        </div>
      {/if}
    </div>
  {:else if type === 'audio'}
    <!-- 오디오 미리보기 -->
    <div class="audio-container">
      {#if mediaUrl}
        <audio
          bind:this={mediaElement}
          src={mediaUrl}
          {autoplay}
          {controls}
          {loop}
          preload="metadata"
          on:loadeddata={handleLoad}
          on:play={handlePlay}
          on:pause={handlePause}
          on:ended={handleEnded}
          on:timeupdate={handleTimeUpdate}
          on:volumechange={handleVolumeChange}
          on:error={handleError}
          class="media-audio"
        />
      {/if}
      
      <!-- 오디오 시각화 -->
      <div class="audio-visualization">
        {#if waveform}
          <div class="waveform-container">
            <img src={waveform} alt="Audio waveform" class="waveform" />
            {#if !isLoading}
              <div class="waveform-overlay">
                <button class="play-button-large" on:click={togglePlay}>
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <div class="audio-placeholder">
            <div class="audio-icon">🎵</div>
            <div class="audio-info">
              <div class="file-name">{file?.name || 'Audio file'}</div>
              {#if duration}
                <div class="duration">{formatTime(duration)}</div>
              {/if}
            </div>
            {#if !isLoading}
              <button class="play-button-large" on:click={togglePlay}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            {/if}
          </div>
        {/if}
      </div>
      
      {#if isLoading}
        <div class="loading-overlay">
          <div class="spinner"></div>
          <span>오디오 로딩 중...</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .media-preview {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: var(--apple-surface-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
  }
  
  .media-preview:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
  }
  
  /* 공통 컨테이너 */
  .image-container,
  .video-container,
  .audio-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 미디어 요소 */
  .media-image,
  .media-video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    opacity: 0;
    transition: opacity var(--apple-duration-normal) var(--apple-easing-smooth);
  }
  
  .media-image.loaded,
  .media-video {
    opacity: 1;
  }
  
  .media-audio {
    width: 100%;
    max-width: 400px;
  }
  
  /* 로딩 오버레이 */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: white;
    font-size: 14px;
    z-index: 2;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 에러 상태 */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px;
    text-align: center;
    color: var(--apple-text-secondary);
  }
  
  .error-icon {
    font-size: 48px;
    opacity: 0.5;
  }
  
  .error-message {
    font-size: 16px;
    color: var(--apple-accent-red);
  }
  
  .retry-button {
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .retry-button:hover {
    background: color-mix(in srgb, var(--apple-accent-blue) 90%, black);
  }
  
  /* 비디오 썸네일 */
  .video-thumbnail {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .video-thumbnail img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }
  
  .play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .play-overlay:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  .play-button {
    font-size: 24px;
    color: white;
    margin-left: 4px; /* 시각적 중앙 정렬 */
  }
  
  /* 커스텀 컨트롤 */
  .custom-controls {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    opacity: 0;
    transition: opacity var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .video-container:hover .custom-controls {
    opacity: 1;
  }
  
  .control-button {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .control-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .time-display {
    font-size: 12px;
    font-weight: 500;
    flex: 1;
    text-align: center;
  }
  
  /* 오디오 시각화 */
  .audio-visualization {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .waveform-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .waveform {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .waveform-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .audio-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    text-align: center;
    width: 100%;
  }
  
  .audio-icon {
    font-size: 48px;
    opacity: 0.7;
  }
  
  .audio-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .file-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--apple-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  
  .duration {
    font-size: 14px;
    color: var(--apple-text-secondary);
  }
  
  .play-button-large {
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .play-button-large:hover {
    background: color-mix(in srgb, var(--apple-accent-blue) 90%, black);
    transform: scale(1.05);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .custom-controls {
      opacity: 1; /* 모바일에서는 항상 표시 */
    }
    
    .audio-placeholder {
      padding: 16px;
    }
    
    .audio-icon {
      font-size: 36px;
    }
    
    .file-name {
      font-size: 14px;
      max-width: 150px;
    }
  }
</style>