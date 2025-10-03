<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { KBOCheerSound } from '../data/kboTemplates.js';
  import { KBO_CHEER_SOUNDS, KBO_TEAMS } from '../data/kboTemplates.js';
  
  // Props
  export let selectedTeam: string | null = null;
  export let autoPlay = false;
  export let showVisualizer = true;
  export let showPlaylist = true;
  
  // 상태 관리
  let currentAudio: HTMLAudioElement | null = null;
  let currentSound: KBOCheerSound | null = null;
  let isPlaying = false;
  let isPaused = false;
  let currentTime = 0;
  let duration = 0;
  let volume = 0.7;
  let isMuted = false;
  let playlist: KBOCheerSound[] = [];
  let currentIndex = 0;
  let isLooping = false;
  let isShuffling = false;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array<ArrayBuffer> | null = null;
  let animationFrame: number | null = null;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    soundChanged: KBOCheerSound | null;
    playStateChanged: boolean;
    volumeChanged: number;
    playlistUpdated: KBOCheerSound[];
  }>();
  
  // 필터링된 사운드 목록
  $: filteredSounds = KBO_CHEER_SOUNDS.filter(sound => 
    !selectedTeam || sound.team === selectedTeam || sound.team === 'all'
  );
  
  // 플레이리스트 초기화
  $: if (filteredSounds.length > 0 && playlist.length === 0) {
    playlist = [...filteredSounds];
    dispatch('playlistUpdated', playlist);
  }
  
  onMount(() => {
    // Web Audio API 초기화
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;
    }
  });
  
  onDestroy(() => {
    cleanup();
  });
  
  // 정리 함수
  function cleanup() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (audioContext) {
      audioContext.close();
    }
  }
  
  // 사운드 로드
  async function loadSound(sound: KBOCheerSound) {
    if (currentAudio) {
      currentAudio.pause();
    }
    
    currentSound = sound;
    currentAudio = new Audio(sound.audioUrl);
    currentAudio.volume = isMuted ? 0 : volume;
    
    // Web Audio API 연결
    if (audioContext && analyser) {
      const source = audioContext.createMediaElementSource(currentAudio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    
    // 이벤트 리스너 설정
    currentAudio.addEventListener('loadedmetadata', () => {
      duration = currentAudio?.duration || 0;
    });
    
    currentAudio.addEventListener('timeupdate', () => {
      currentTime = currentAudio?.currentTime || 0;
    });
    
    currentAudio.addEventListener('ended', handleSoundEnded);
    
    currentAudio.addEventListener('error', (e) => {
      console.error('오디오 로드 실패:', e);
      handleSoundEnded();
    });
    
    dispatch('soundChanged', sound);
    
    if (autoPlay) {
      await playSound();
    }
  }
  
  // 사운드 재생
  async function playSound() {
    if (!currentAudio) return;
    
    try {
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }
      
      await currentAudio.play();
      isPlaying = true;
      isPaused = false;
      
      if (showVisualizer) {
        startVisualization();
      }
      
      dispatch('playStateChanged', true);
    } catch (error) {
      console.error('재생 실패:', error);
    }
  }
  
  // 사운드 일시정지
  function pauseSound() {
    if (currentAudio) {
      currentAudio.pause();
      isPlaying = false;
      isPaused = true;
      dispatch('playStateChanged', false);
    }
  }
  
  // 사운드 정지
  function stopSound() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      isPlaying = false;
      isPaused = false;
      currentTime = 0;
      dispatch('playStateChanged', false);
    }
  }
  
  // 사운드 종료 처리
  function handleSoundEnded() {
    isPlaying = false;
    isPaused = false;
    currentTime = 0;
    
    if (isLooping && currentSound) {
      loadSound(currentSound);
      return;
    }
    
    // 다음 곡 재생
    if (playlist.length > 1) {
      playNext();
    }
    
    dispatch('playStateChanged', false);
  }
  
  // 다음 곡
  function playNext() {
    if (playlist.length === 0) return;
    
    if (isShuffling) {
      currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
      currentIndex = (currentIndex + 1) % playlist.length;
    }
    
    loadSound(playlist[currentIndex]);
  }
  
  // 이전 곡
  function playPrevious() {
    if (playlist.length === 0) return;
    
    if (isShuffling) {
      currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
      currentIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }
    
    loadSound(playlist[currentIndex]);
  }
  
  // 볼륨 변경
  function changeVolume(newVolume: number) {
    volume = newVolume;
    if (currentAudio) {
      currentAudio.volume = isMuted ? 0 : volume;
    }
    dispatch('volumeChanged', volume);
  }
  
  // 음소거 토글
  function toggleMute() {
    isMuted = !isMuted;
    if (currentAudio) {
      currentAudio.volume = isMuted ? 0 : volume;
    }
  }
  
  // 시간 이동
  function seekTo(time: number) {
    if (currentAudio) {
      currentAudio.currentTime = time;
      currentTime = time;
    }
  }
  
  // 플레이리스트에 추가
  function addToPlaylist(sound: KBOCheerSound) {
    if (!playlist.find(s => s.id === sound.id)) {
      playlist = [...playlist, sound];
      dispatch('playlistUpdated', playlist);
    }
  }
  
  // 플레이리스트에서 제거
  function removeFromPlaylist(soundId: string) {
    playlist = playlist.filter(s => s.id !== soundId);
    if (currentIndex >= playlist.length) {
      currentIndex = 0;
    }
    dispatch('playlistUpdated', playlist);
  }
  
  // 시각화 시작
  function startVisualization() {
    if (!analyser || !dataArray) return;
    
    function animate() {
      if (!isPlaying) return;
      
      analyser!.getByteFrequencyData(dataArray!);
      animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
  }
  
  // 시간 포맷팅
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 플레이리스트에서 선택
  function selectFromPlaylist(index: number) {
    currentIndex = index;
    loadSound(playlist[index]);
  }
  
  // 이벤트 핸들러들
  function handleSeekInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target) {
      seekTo(parseFloat(target.value));
    }
  }
  
  function handleVolumeInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target) {
      changeVolume(parseFloat(target.value));
    }
  }
</script>

<div class="audio-manager">
  <!-- 메인 플레이어 -->
  <div class="main-player">
    <!-- 현재 재생 중인 사운드 정보 -->
    {#if currentSound}
      <div class="now-playing">
        <div class="sound-info">
          <div class="sound-title">{currentSound.name}</div>
          <div class="sound-meta">
            {#if currentSound.team !== 'all'}
              <span class="team-name" style="color: {KBO_TEAMS[currentSound.team]?.colors.primary}">
                {KBO_TEAMS[currentSound.team]?.name}
              </span>
            {:else}
              <span class="team-name">공통</span>
            {/if}
            <span class="duration">{formatTime(duration)}</span>
          </div>
        </div>
        
        {#if showVisualizer && isPlaying}
          <div class="visualizer">
            <div class="visualizer-bars">
              {#each Array(8) as _, i}
                <div 
                  class="bar"
                  style="animation-delay: {i * 0.1}s"
                ></div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="no-sound">
        <div class="no-sound-icon">🎵</div>
        <div class="no-sound-text">사운드를 선택하세요</div>
      </div>
    {/if}
    
    <!-- 진행률 바 -->
    <div class="progress-container">
      <span class="time-current">{formatTime(currentTime)}</span>
      <div class="progress-bar">
        <input
          type="range"
          min="0"
          max={duration || 100}
          bind:value={currentTime}
          on:input={handleSeekInput}
          class="progress-slider"
        />
        <div 
          class="progress-fill"
          style="width: {duration ? (currentTime / duration) * 100 : 0}%"
        ></div>
      </div>
      <span class="time-total">{formatTime(duration)}</span>
    </div>
    
    <!-- 컨트롤 버튼 -->
    <div class="controls">
      <button 
        class="control-btn"
        on:click={playPrevious}
        disabled={playlist.length <= 1}
        title="이전 곡"
      >
        ⏮️
      </button>
      
      <button 
        class="control-btn play-btn"
        on:click={isPlaying ? pauseSound : playSound}
        disabled={!currentSound}
        title={isPlaying ? '일시정지' : '재생'}
      >
        {#if isPlaying}
          ⏸️
        {:else}
          ▶️
        {/if}
      </button>
      
      <button 
        class="control-btn"
        on:click={stopSound}
        disabled={!currentSound}
        title="정지"
      >
        ⏹️
      </button>
      
      <button 
        class="control-btn"
        on:click={playNext}
        disabled={playlist.length <= 1}
        title="다음 곡"
      >
        ⏭️
      </button>
      
      <div class="volume-control">
        <button 
          class="control-btn volume-btn"
          on:click={toggleMute}
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {#if isMuted}
            🔇
          {:else if volume > 0.5}
            🔊
          {:else if volume > 0}
            🔉
          {:else}
            🔈
          {/if}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          bind:value={volume}
          on:input={handleVolumeInput}
          class="volume-slider"
        />
      </div>
      
      <button 
        class="control-btn"
        class:active={isLooping}
        on:click={() => isLooping = !isLooping}
        title="반복 재생"
      >
        🔁
      </button>
      
      <button 
        class="control-btn"
        class:active={isShuffling}
        on:click={() => isShuffling = !isShuffling}
        title="셔플"
      >
        🔀
      </button>
    </div>
  </div>
  
  <!-- 사운드 라이브러리 -->
  <div class="sound-library">
    <h4 class="library-title">사운드 라이브러리</h4>
    
    <div class="sound-grid">
      {#each filteredSounds as sound (sound.id)}
        <button
          class="sound-item"
          class:playing={currentSound?.id === sound.id && isPlaying}
          class:selected={currentSound?.id === sound.id}
          on:click={() => loadSound(sound)}
        >
          <div class="sound-icon">
            {#if sound.type === 'cheer'}
              📣
            {:else if sound.type === 'fight_song'}
              🎵
            {:else if sound.type === 'victory'}
              🎉
            {:else}
              🔊
            {/if}
          </div>
          
          <div class="sound-details">
            <div class="sound-name">{sound.name}</div>
            <div class="sound-duration">{formatTime(sound.duration)}</div>
          </div>
          
          <button
            class="add-to-playlist-btn"
            on:click|stopPropagation={() => addToPlaylist(sound)}
            title="플레이리스트에 추가"
          >
            ➕
          </button>
        </button>
      {/each}
    </div>
  </div>
  
  <!-- 플레이리스트 -->
  {#if showPlaylist && playlist.length > 0}
    <div class="playlist">
      <h4 class="playlist-title">
        플레이리스트 ({playlist.length})
      </h4>
      
      <div class="playlist-items">
        {#each playlist as sound, index (sound.id)}
          <div 
            class="playlist-item"
            class:current={index === currentIndex}
            class:playing={currentSound?.id === sound.id && isPlaying}
          >
            <button
              class="playlist-play-btn"
              on:click={() => selectFromPlaylist(index)}
            >
              {#if currentSound?.id === sound.id && isPlaying}
                ⏸️
              {:else}
                ▶️
              {/if}
            </button>
            
            <div class="playlist-info">
              <div class="playlist-name">{sound.name}</div>
              <div class="playlist-meta">
                {#if sound.team !== 'all'}
                  <span style="color: {KBO_TEAMS[sound.team]?.colors.primary}">
                    {KBO_TEAMS[sound.team]?.name}
                  </span>
                {:else}
                  <span>공통</span>
                {/if}
                • {formatTime(sound.duration)}
              </div>
            </div>
            
            <button
              class="playlist-remove-btn"
              on:click={() => removeFromPlaylist(sound.id)}
              title="플레이리스트에서 제거"
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
  .audio-manager {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* 메인 플레이어 */
  .main-player {
    background: var(--apple-surface-secondary);
    border-radius: 12px;
    padding: 20px;
  }
  
  .now-playing {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .sound-info {
    flex: 1;
  }
  
  .sound-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: 4px;
  }
  
  .sound-meta {
    display: flex;
    gap: 12px;
    font-size: 14px;
    color: var(--apple-text-secondary);
  }
  
  .team-name {
    font-weight: 500;
  }
  
  .no-sound {
    text-align: center;
    padding: 40px 20px;
    color: var(--apple-text-secondary);
  }
  
  .no-sound-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .no-sound-text {
    font-size: 16px;
  }
  
  /* 시각화 */
  .visualizer {
    width: 80px;
    height: 40px;
  }
  
  .visualizer-bars {
    display: flex;
    align-items: end;
    gap: 2px;
    height: 100%;
  }
  
  .bar {
    flex: 1;
    background: linear-gradient(to top, #007AFF, #34C759);
    border-radius: 1px;
    animation: audioWave 1s ease-in-out infinite alternate;
  }
  
  @keyframes audioWave {
    0% { height: 20%; }
    100% { height: 100%; }
  }
  
  /* 진행률 바 */
  .progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .time-current,
  .time-total {
    font-size: 12px;
    color: var(--apple-text-secondary);
    min-width: 35px;
    text-align: center;
  }
  
  .progress-bar {
    flex: 1;
    position: relative;
    height: 4px;
    background: var(--apple-surface-border);
    border-radius: 2px;
  }
  
  .progress-slider {
    position: absolute;
    top: -6px;
    left: 0;
    right: 0;
    height: 16px;
    background: transparent;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .progress-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--apple-accent-blue);
    border-radius: 50%;
    cursor: pointer;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--apple-accent-blue);
    border-radius: 2px;
    transition: width 0.1s ease;
  }
  
  /* 컨트롤 */
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  .control-btn {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .control-btn:hover:not(:disabled) {
    background: var(--apple-accent-blue);
    color: white;
    transform: scale(1.05);
  }
  
  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .control-btn.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
    font-size: 24px;
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .volume-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .volume-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .volume-slider {
    width: 80px;
    height: 4px;
    background: var(--apple-surface-border);
    border-radius: 2px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--apple-accent-blue);
    border-radius: 50%;
    cursor: pointer;
  }
  
  /* 사운드 라이브러리 */
  .library-title,
  .playlist-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 16px;
  }
  
  .sound-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  
  .sound-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    text-align: left;
  }
  
  .sound-item:hover {
    background: var(--apple-surface-tertiary);
    border-color: var(--apple-accent-blue);
  }
  
  .sound-item.selected {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.1);
  }
  
  .sound-item.playing {
    border-color: var(--apple-accent-green);
    background: rgba(52, 199, 89, 0.1);
  }
  
  .sound-icon {
    font-size: 24px;
    width: 40px;
    text-align: center;
  }
  
  .sound-details {
    flex: 1;
  }
  
  .sound-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
    margin-bottom: 2px;
  }
  
  .sound-duration {
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  .add-to-playlist-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .add-to-playlist-btn:hover {
    background: var(--apple-accent-green);
    color: white;
    transform: scale(1.1);
  }
  
  /* 플레이리스트 */
  .playlist {
    background: var(--apple-surface-secondary);
    border-radius: 12px;
    padding: 16px;
  }
  
  .playlist-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .playlist-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 6px;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .playlist-item:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .playlist-item.current {
    background: rgba(0, 122, 255, 0.1);
  }
  
  .playlist-item.playing {
    background: rgba(52, 199, 89, 0.1);
  }
  
  .playlist-play-btn,
  .playlist-remove-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .playlist-play-btn:hover {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .playlist-remove-btn:hover {
    background: var(--apple-accent-red);
    color: white;
  }
  
  .playlist-info {
    flex: 1;
  }
  
  .playlist-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
    margin-bottom: 2px;
  }
  
  .playlist-meta {
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .audio-manager {
      padding: 16px;
    }
    
    .controls {
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .volume-control {
      order: 1;
      width: 100%;
      justify-content: center;
    }
    
    .volume-slider {
      width: 120px;
    }
    
    .sound-grid {
      grid-template-columns: 1fr;
    }
    
    .now-playing {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
</style>

