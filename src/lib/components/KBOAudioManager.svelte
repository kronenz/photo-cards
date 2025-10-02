<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { KBOCheerSound } from '../data/kboTemplates.js';
  import { KBO_CHEER_SOUNDS, KBO_TEAMS } from '../data/kboTemplates.js';
  
  // Props
  export let selectedTeam: string | null = null;
  export let autoPlay = false;
  export let volume = 0.7;
  export let showVisualizer = true;
  export let showPlaylist = true;
  
  // 오디오 상태 관리
  let currentAudio: HTMLAudioElement | null = null;
  let currentSound: KBOCheerSound | null = null;
  let isPlaying = false;
  let currentTime = 0;
  let duration = 0;
  let isLoading = false;
  let playlist: KBOCheerSound[] = [];
  let currentIndex = 0;
  let repeatMode: 'none' | 'one' | 'all' = 'none';
  let shuffleMode = false;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let animationFrame: number;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    soundChanged: KBOCheerSound | null;
    playStateChanged: boolean;
    volumeChanged: number;
    timeUpdate: { current: number; duration: number };
  }>();
  
  onMount(() => {
    if (!browser) return;
    
    // 초기 플레이리스트 설정
    updatePlaylist();
    
    // 오디오 컨텍스트 초기화 (사용자 상호작용 후)
    const initAudioContext = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array;
      }
    };
    
    document.addEventListener('click', initAudioContext, { once: true });
    
    return () => {
      cleanup();
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
  
  onDestroy(() => {
    cleanup();
  });
  
  // 플레이리스트 업데이트
  function updatePlaylist() {
    playlist = selectedTeam 
      ? KBO_CHEER_SOUNDS.filter(sound => sound.team === selectedTeam || sound.team === 'all')
      : KBO_CHEER_SOUNDS;
  }
  
  // 오디오 정리
  function cleanup() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
      currentAudio.removeEventListener('ended', handleEnded);
      currentAudio.removeEventListener('error', handleError);
      currentAudio = null;
    }
    
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }
  
  // 사운드 재생
  async function playSound(sound: KBOCheerSound, index?: number) {
    try {
      isLoading = true;
      
      // 기존 오디오 정리
      if (currentAudio) {
        currentAudio.pause();
      }
      
      // 새 오디오 생성
      currentAudio = new Audio(sound.audioUrl);
      currentAudio.volume = volume;
      currentSound = sound;
      
      if (typeof index === 'number') {
        currentIndex = index;
      }
      
      // 이벤트 리스너 추가
      currentAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
      currentAudio.addEventListener('timeupdate', handleTimeUpdate);
      currentAudio.addEventListener('ended', handleEnded);
      currentAudio.addEventListener('error', handleError);
      
      // 오디오 컨텍스트 연결 (시각화용)
      if (audioContext && analyser) {
        const source = audioContext.createMediaElementSource(currentAudio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      
      await currentAudio.play();
      isPlaying = true;
      isLoading = false;
      
      dispatch('soundChanged', sound);
      dispatch('playStateChanged', true);
      
      // 시각화 시작
      if (showVisualizer) {
        startVisualization();
      }
      
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      isLoading = false;
      isPlaying = false;
    }
  }
  
  // 재생/일시정지 토글
  function togglePlayPause() {
    if (!currentAudio) {
      if (playlist.length > 0) {
        playSound(playlist[0], 0);
      }
      return;
    }
    
    if (isPlaying) {
      currentAudio.pause();
      isPlaying = false;
    } else {
      currentAudio.play();
      isPlaying = true;
    }
    
    dispatch('playStateChanged', isPlaying);
  }
  
  // 정지
  function stopSound() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      isPlaying = false;
      currentTime = 0;
      
      dispatch('playStateChanged', false);
    }
  }
  
  // 다음 곡
  function nextSound() {
    if (playlist.length === 0) return;
    
    let nextIndex;
    
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    playSound(playlist[nextIndex], nextIndex);
  }
  
  // 이전 곡
  function previousSound() {
    if (playlist.length === 0) return;
    
    let prevIndex;
    
    if (shuffleMode) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }
    
    playSound(playlist[prevIndex], prevIndex);
  }
  
  // 볼륨 변경
  function changeVolume(newVolume: number) {
    volume = newVolume;
    if (currentAudio) {
      currentAudio.volume = volume;
    }
    dispatch('volumeChanged', volume);
  }
  
  // 시간 이동
  function seekTo(time: number) {
    if (currentAudio) {
      currentAudio.currentTime = time;
      currentTime = time;
    }
  }
  
  // 반복 모드 변경
  function toggleRepeatMode() {
    switch (repeatMode) {
      case 'none':
        repeatMode = 'one';
        break;
      case 'one':
        repeatMode = 'all';
        break;
      case 'all':
        repeatMode = 'none';
        break;
    }
  }
  
  // 셔플 모드 토글
  function toggleShuffleMode() {
    shuffleMode = !shuffleMode;
  }
  
  // 오디오 이벤트 핸들러
  function handleLoadedMetadata() {
    if (currentAudio) {
      duration = currentAudio.duration;
    }
  }
  
  function handleTimeUpdate() {
    if (currentAudio) {
      currentTime = currentAudio.currentTime;
      dispatch('timeUpdate', { current: currentTime, duration });
    }
  }
  
  function handleEnded() {
    isPlaying = false;
    dispatch('playStateChanged', false);
    
    switch (repeatMode) {
      case 'one':
        if (currentAudio) {
          currentAudio.currentTime = 0;
          currentAudio.play();
          isPlaying = true;
        }
        break;
      case 'all':
        nextSound();
        break;
      default:
        if (currentIndex < playlist.length - 1) {
          nextSound();
        }
        break;
    }
  }
  
  function handleError() {
    console.error('오디오 로딩 오류');
    isLoading = false;
    isPlaying = false;
  }
  
  // 시각화 시작
  function startVisualization() {
    if (!analyser || !dataArray) return;
    
    const animate = () => {
      if (isPlaying && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  // 시간 포맷팅
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 반응형 처리
  $: if (selectedTeam !== null) {
    updatePlaylist();
  }
  
  // 자동 재생
  $: if (autoPlay && playlist.length > 0 && !currentSound) {
    playSound(playlist[0], 0);
  }
</script>

<div class="kbo-audio-manager">
  <!-- 메인 플레이어 -->
  <div class="main-player">
    <div class="player-info">
      {#if currentSound}
        <div class="sound-artwork">
          <div class="artwork-placeholder">
            {#if selectedTeam && KBO_TEAMS[selectedTeam]}
              <span style="color: {KBO_TEAMS[selectedTeam].colors.primary}">
                ⚾
              </span>
            {:else}
              🎵
            {/if}
          </div>
          
          {#if showVisualizer && isPlaying}
            <div class="audio-visualizer">
              {#each Array(8) as _, i}
                <div 
                  class="visualizer-bar"
                  style="animation-delay: {i * 0.1}s"
                ></div>
              {/each}
            </div>
          {/if}
        </div>
        
        <div class="sound-details">
          <h3 class="sound-title">{currentSound.name}</h3>
          <p class="sound-description">{currentSound.description}</p>
          {#if selectedTeam && KBO_TEAMS[selectedTeam]}
            <p class="team-name">{KBO_TEAMS[selectedTeam].name}</p>
          {/if}
        </div>
      {:else}
        <div class="no-sound">
          <div class="no-sound-icon">🎵</div>
          <p>재생할 사운드를 선택하세요</p>
        </div>
      {/if}
    </div>
    
    <!-- 진행률 바 -->
    <div class="progress-container">
      <span class="time-display">{formatTime(currentTime)}</span>
      <div class="progress-bar">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          on:input={(e) => seekTo(parseFloat(e.currentTarget.value))}
          class="progress-slider"
          disabled={!currentAudio}
        />
      </div>
      <span class="time-display">{formatTime(duration)}</span>
    </div>
    
    <!-- 플레이어 컨트롤 -->
    <div class="player-controls">
      <button
        class="control-button shuffle"
        class:active={shuffleMode}
        on:click={toggleShuffleMode}
        title="셔플"
      >
        🔀
      </button>
      
      <button
        class="control-button"
        on:click={previousSound}
        disabled={playlist.length === 0}
        title="이전"
      >
        ⏮️
      </button>
      
      <button
        class="control-button play-pause"
        class:loading={isLoading}
        on:click={togglePlayPause}
        disabled={isLoading}
        title={isPlaying ? '일시정지' : '재생'}
      >
        {#if isLoading}
          <div class="spinner"></div>
        {:else if isPlaying}
          ⏸️
        {:else}
          ▶️
        {/if}
      </button>
      
      <button
        class="control-button"
        on:click={nextSound}
        disabled={playlist.length === 0}
        title="다음"
      >
        ⏭️
      </button>
      
      <button
        class="control-button repeat"
        class:active={repeatMode !== 'none'}
        on:click={toggleRepeatMode}
        title="반복: {repeatMode}"
      >
        {#if repeatMode === 'one'}
          🔂
        {:else if repeatMode === 'all'}
          🔁
        {:else}
          🔁
        {/if}
      </button>
    </div>
    
    <!-- 볼륨 컨트롤 -->
    <div class="volume-control">
      <span class="volume-icon">🔊</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        bind:value={volume}
        on:input={(e) => changeVolume(parseFloat(e.currentTarget.value))}
        class="volume-slider"
      />
      <span class="volume-value">{Math.round(volume * 100)}%</span>
    </div>
  </div>
  
  <!-- 플레이리스트 -->
  {#if showPlaylist}
    <div class="playlist-container">
      <div class="playlist-header">
        <h4 class="playlist-title">
          {#if selectedTeam && KBO_TEAMS[selectedTeam]}
            {KBO_TEAMS[selectedTeam].name} 응원가
          {:else}
            KBO 사운드 라이브러리
          {/if}
        </h4>
        <span class="playlist-count">{playlist.length}곡</span>
      </div>
      
      <div class="playlist-items">
        {#each playlist as sound, index (sound.id)}
          <div
            class="playlist-item"
            class:active={currentSound?.id === sound.id}
            class:playing={currentSound?.id === sound.id && isPlaying}
            on:click={() => playSound(sound, index)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && playSound(sound, index)}
          >
            <div class="item-info">
              <div class="item-icon">
                {#if currentSound?.id === sound.id && isPlaying}
                  <div class="playing-indicator">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                  </div>
                {:else}
                  🎵
                {/if}
              </div>
              
              <div class="item-details">
                <h5 class="item-title">{sound.name}</h5>
                <p class="item-description">{sound.description}</p>
                <div class="item-meta">
                  <span class="item-type">{sound.type}</span>
                  <span class="item-duration">{formatTime(sound.duration)}</span>
                </div>
              </div>
            </div>
            
            <div class="item-actions">
              <button
                class="action-button"
                on:click|stopPropagation={() => playSound(sound, index)}
                title="재생"
              >
                ▶️
              </button>
            </div>
          </div>
        {/each}
        
        {#if playlist.length === 0}
          <div class="empty-playlist">
            <div class="empty-icon">🎵</div>
            <p>사용 가능한 사운드가 없습니다</p>
            {#if selectedTeam}
              <p>다른 구단을 선택해보세요</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .kbo-audio-manager {
    width: 100%;
    max-width: 500px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
  }
  
  /* 메인 플레이어 */
  .main-player {
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .player-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .sound-artwork {
    position: relative;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    backdrop-filter: blur(10px);
  }
  
  .artwork-placeholder {
    z-index: 2;
  }
  
  .audio-visualizer {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
    z-index: 1;
  }
  
  .visualizer-bar {
    width: 3px;
    height: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 2px;
    animation: visualize 1s ease-in-out infinite alternate;
  }
  
  @keyframes visualize {
    0% { height: 4px; }
    100% { height: 16px; }
  }
  
  .sound-details {
    flex: 1;
    min-width: 0;
  }
  
  .sound-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px;
    color: white;
  }
  
  .sound-description {
    font-size: 14px;
    margin: 0 0 4px;
    opacity: 0.9;
    line-height: 1.3;
  }
  
  .team-name {
    font-size: 12px;
    margin: 0;
    opacity: 0.8;
    font-weight: 500;
  }
  
  .no-sound {
    text-align: center;
    padding: 20px;
    opacity: 0.7;
  }
  
  .no-sound-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .no-sound p {
    margin: 0;
    font-size: 14px;
  }
  
  /* 진행률 바 */
  .progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .time-display {
    font-size: 12px;
    font-weight: 500;
    min-width: 35px;
    text-align: center;
  }
  
  .progress-bar {
    flex: 1;
  }
  
  .progress-slider {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  
  .progress-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .progress-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  /* 플레이어 컨트롤 */
  .player-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .control-button {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    backdrop-filter: blur(10px);
  }
  
  .control-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .control-button.play-pause {
    width: 56px;
    height: 56px;
    font-size: 20px;
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
  }
  
  .control-button.active {
    background: rgba(255, 255, 255, 0.4);
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 볼륨 컨트롤 */
  .volume-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .volume-icon {
    font-size: 16px;
  }
  
  .volume-slider {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .volume-value {
    font-size: 12px;
    font-weight: 500;
    min-width: 35px;
    text-align: right;
  }
  
  /* 플레이리스트 */
  .playlist-container {
    background: var(--apple-surface-primary);
  }
  
  .playlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .playlist-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
  }
  
  .playlist-count {
    font-size: 12px;
    color: var(--apple-text-secondary);
    background: var(--apple-surface-tertiary);
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  .playlist-items {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .playlist-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid var(--apple-surface-border);
    cursor: pointer;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .playlist-item:hover {
    background: var(--apple-surface-secondary);
  }
  
  .playlist-item.active {
    background: rgba(102, 126, 234, 0.1);
    border-left: 3px solid #667eea;
  }
  
  .item-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  
  .item-icon {
    width: 40px;
    height: 40px;
    background: var(--apple-surface-tertiary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .playing-indicator {
    display: flex;
    gap: 2px;
    align-items: end;
  }
  
  .wave {
    width: 3px;
    height: 12px;
    background: #667eea;
    border-radius: 2px;
    animation: wave 1s ease-in-out infinite alternate;
  }
  
  .wave:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .wave:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes wave {
    0% { height: 6px; }
    100% { height: 16px; }
  }
  
  .item-details {
    flex: 1;
    min-width: 0;
  }
  
  .item-title {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 2px;
    color: var(--apple-text-primary);
  }
  
  .item-description {
    font-size: 12px;
    color: var(--apple-text-secondary);
    margin: 0 0 4px;
    line-height: 1.3;
  }
  
  .item-meta {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: var(--apple-text-tertiary);
  }
  
  .item-type {
    background: var(--apple-surface-tertiary);
    padding: 1px 4px;
    border-radius: 3px;
  }
  
  .item-actions {
    display: flex;
    gap: 4px;
  }
  
  .action-button {
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  /* 빈 플레이리스트 */
  .empty-playlist {
    text-align: center;
    padding: 40px 20px;
    color: var(--apple-text-secondary);
  }
  
  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .empty-playlist p {
    margin: 0 0 4px;
    font-size: 14px;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .main-player {
      padding: 20px;
    }
    
    .player-info {
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }
    
    .sound-artwork {
      width: 100px;
      height: 100px;
      font-size: 40px;
    }
    
    .player-controls {
      gap: 12px;
    }
    
    .control-button {
      width: 44px;
      height: 44px;
      font-size: 16px;
    }
    
    .control-button.play-pause {
      width: 52px;
      height: 52px;
      font-size: 18px;
    }
  }
</style>