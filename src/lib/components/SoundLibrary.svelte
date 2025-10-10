<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { KBOCheerSound } from '../data/kboTemplates.js';
  import { KBO_CHEER_SOUNDS, KBO_TEAMS } from '../data/kboTemplates.js';
  
  // Props
  export let selectedSound: KBOCheerSound | null = null;
  export let selectedTeam: string | null = null;
  export let showTeamFilter = true;
  
  // 상태 관리
  let isPlaying = false;
  let currentAudio: HTMLAudioElement | null = null;
  let playingSound: string | null = null;
  let volume = 0.7;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    soundSelected: KBOCheerSound;
    soundRemoved: void;
    volumeChanged: number;
  }>();
  
  // 필터링된 사운드 목록
  $: filteredSounds = KBO_CHEER_SOUNDS.filter(sound => 
    !selectedTeam || sound.team === selectedTeam || sound.team === 'all'
  );
  
  // 사운드 타입별 그룹화
  $: soundsByType = filteredSounds.reduce((acc, sound) => {
    if (!acc[sound.type]) {
      acc[sound.type] = [];
    }
    acc[sound.type].push(sound);
    return acc;
  }, {} as Record<string, KBOCheerSound[]>);
  
  // 사운드 재생
  function playSound(sound: KBOCheerSound) {
    // 기존 오디오 정지
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    // 새 오디오 생성 및 재생
    currentAudio = new Audio(sound.audioUrl);
    currentAudio.volume = volume;
    playingSound = sound.id;
    isPlaying = true;
    
    currentAudio.play().catch(error => {
      console.error('사운드 재생 실패:', error);
      isPlaying = false;
      playingSound = null;
    });
    
    currentAudio.onended = () => {
      isPlaying = false;
      playingSound = null;
      currentAudio = null;
    };
  }
  
  // 사운드 정지
  function stopSound() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    isPlaying = false;
    playingSound = null;
  }
  
  // 사운드 선택
  function selectSound(sound: KBOCheerSound) {
    selectedSound = sound;
    dispatch('soundSelected', sound);
  }
  
  // 사운드 제거
  function removeSound() {
    selectedSound = null;
    stopSound();
    dispatch('soundRemoved');
  }
  
  // 볼륨 변경
  function changeVolume(newVolume: number) {
    volume = newVolume;
    if (currentAudio) {
      currentAudio.volume = volume;
    }
    dispatch('volumeChanged', volume);
  }
  
  // 볼륨 변경 이벤트 핸들러
  function handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    changeVolume(parseFloat(target.value));
  }
  
  // 사운드 타입 이름 변환
  function getSoundTypeName(type: string): string {
    switch (type) {
      case 'cheer': return '응원가';
      case 'fight_song': return '파이팅송';
      case 'victory': return '승리송';
      case 'sound_effect': return '효과음';
      default: return type;
    }
  }
  
  // 사운드 타입 아이콘
  function getSoundTypeIcon(type: string): string {
    switch (type) {
      case 'cheer': return '📣';
      case 'fight_song': return '🎵';
      case 'victory': return '🎉';
      case 'sound_effect': return '🔊';
      default: return '🎶';
    }
  }
  
  // 시간 포맷팅
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 컴포넌트 정리
  function cleanup() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  }
  
  // 컴포넌트 언마운트 시 정리
  import { onDestroy } from 'svelte';
  onDestroy(cleanup);
</script>

<div class="sound-library">
  <!-- 헤더 -->
  <div class="library-header">
    <h3 class="library-title">
      <span class="title-icon">🎵</span>
      사운드 라이브러리
    </h3>
    <p class="library-description">
      구단별 응원가와 야구 효과음을 선택하여 카드에 생동감을 더하세요
    </p>
  </div>
  
  <!-- 팀 필터 -->
  {#if showTeamFilter}
    <div class="team-filter">
      <h4 class="filter-title">구단 선택</h4>
      <div class="team-buttons">
        <button
          class="team-button"
          class:active={!selectedTeam}
          on:click={() => selectedTeam = null}
        >
          전체
        </button>
        {#each Object.values(KBO_TEAMS) as team (team.id)}
          <button
            class="team-button"
            class:active={selectedTeam === team.id}
            style="--team-color: {team.colors.primary}"
            on:click={() => selectedTeam = team.id}
          >
            {team.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- 선택된 사운드 표시 -->
  {#if selectedSound}
    <div class="selected-sound">
      <div class="sound-preview">
        <div class="sound-info">
          <div class="sound-name">{selectedSound.name}</div>
          <div class="sound-meta">
            <span class="sound-type">
              {getSoundTypeIcon(selectedSound.type)} {getSoundTypeName(selectedSound.type)}
            </span>
            <span class="sound-duration">{formatDuration(selectedSound.duration)}</span>
          </div>
          <div class="sound-description">{selectedSound.description}</div>
        </div>
        
        <div class="sound-controls">
          <button
            class="play-button"
            class:playing={selectedSound && playingSound === selectedSound.id}
            on:click={() => selectedSound && (playingSound === selectedSound.id ? stopSound() : playSound(selectedSound))}
          >
            {#if playingSound === selectedSound.id}
              ⏸️
            {:else}
              ▶️
            {/if}
          </button>
          
          <button
            class="remove-button"
            on:click={removeSound}
            title="사운드 제거"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- 볼륨 컨트롤 -->
  <div class="volume-control">
    <div class="volume-label">
      <span class="volume-icon">🔊</span>
      <span class="volume-text">볼륨</span>
    </div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      bind:value={volume}
      on:input={handleVolumeChange}
      class="volume-slider"
    />
    <span class="volume-value">{Math.round(volume * 100)}%</span>
  </div>
  
  <!-- 사운드 목록 -->
  <div class="sounds-grid">
    {#each Object.entries(soundsByType) as [type, sounds]}
      <div class="sound-category">
        <h4 class="category-title">
          <span class="category-icon">{getSoundTypeIcon(type)}</span>
          {getSoundTypeName(type)}
        </h4>
        
        <div class="sound-items">
          {#each sounds as sound (sound.id)}
            <div class="sound-item" class:selected={selectedSound?.id === sound.id}>
              <div class="sound-card">
                <div class="sound-header">
                  <div class="sound-title">{sound.name}</div>
                  <div class="sound-team">
                    {#if sound.team !== 'all'}
                      <span style="color: {KBO_TEAMS[sound.team]?.colors.primary}">
                        {KBO_TEAMS[sound.team]?.name}
                      </span>
                    {:else}
                      공통
                    {/if}
                  </div>
                </div>
                
                <div class="sound-body">
                  <div class="sound-description">{sound.description}</div>
                  <div class="sound-duration">{formatDuration(sound.duration)}</div>
                </div>
                
                <div class="sound-actions">
                  <button
                    class="preview-button"
                    class:playing={playingSound === sound.id}
                    on:click={() => playingSound === sound.id ? stopSound() : playSound(sound)}
                    title="미리 듣기"
                  >
                    {#if playingSound === sound.id}
                      ⏸️
                    {:else}
                      ▶️
                    {/if}
                  </button>
                  
                  <button
                    class="select-button"
                    on:click={() => selectSound(sound)}
                    class:selected={selectedSound?.id === sound.id}
                  >
                    {#if selectedSound?.id === sound.id}
                      선택됨 ✓
                    {:else}
                      선택
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  
  <!-- 사운드가 없을 때 -->
  {#if filteredSounds.length === 0}
    <div class="no-sounds">
      <div class="no-sounds-icon">🎵</div>
      <h4>사운드가 없습니다</h4>
      <p>선택한 구단의 사운드가 준비 중입니다.</p>
    </div>
  {/if}
</div>

<style>
  .sound-library {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 24px;
  }
  
  /* 헤더 */
  .library-header {
    margin-bottom: 24px;
  }
  
  .library-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 18px;
  }
  
  .library-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
  
  /* 팀 필터 */
  .team-filter {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .filter-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 12px;
  }
  
  .team-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .team-button {
    padding: 8px 16px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 20px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    white-space: nowrap;
  }
  
  .team-button:hover {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
  }
  
  .team-button.active {
    background: var(--team-color, var(--apple-accent-blue));
    color: white;
    border-color: var(--team-color, var(--apple-accent-blue));
  }
  
  /* 선택된 사운드 */
  .selected-sound {
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-accent-blue);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .sound-preview {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .sound-info {
    flex: 1;
  }
  
  .sound-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: 4px;
  }
  
  .sound-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  .sound-type,
  .sound-duration {
    font-size: 12px;
    color: var(--apple-text-secondary);
    background: var(--apple-surface-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .sound-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    line-height: 1.4;
  }
  
  .sound-controls {
    display: flex;
    gap: 8px;
  }
  
  .play-button,
  .remove-button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .play-button {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .play-button:hover {
    background: var(--apple-accent-blue-hover);
    transform: scale(1.05);
  }
  
  .play-button.playing {
    background: var(--apple-accent-orange);
  }
  
  .remove-button {
    background: var(--apple-accent-red);
    color: white;
  }
  
  .remove-button:hover {
    background: var(--apple-accent-red-hover);
    transform: scale(1.05);
  }
  
  /* 볼륨 컨트롤 */
  .volume-control {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--apple-surface-secondary);
    border-radius: 12px;
  }
  
  .volume-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
  }
  
  .volume-icon {
    font-size: 16px;
  }
  
  .volume-slider {
    flex: 1;
    height: 4px;
    background: var(--apple-surface-border);
    border-radius: 2px;
    outline: none;
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
  
  .volume-slider::-moz-range-thumb {
    -moz-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--apple-accent-blue);
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
  
  .volume-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    min-width: 35px;
    text-align: right;
  }
  
  /* 사운드 그리드 */
  .sounds-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .sound-category {
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    padding: 16px;
    background: var(--apple-surface-secondary);
  }
  
  .category-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .category-icon {
    font-size: 16px;
  }
  
  .sound-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  
  .sound-item {
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .sound-item.selected {
    transform: translateY(-2px);
  }
  
  .sound-card {
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    padding: 12px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .sound-item:hover .sound-card {
    border-color: var(--apple-accent-blue);
    box-shadow: var(--apple-shadow-sm);
  }
  
  .sound-item.selected .sound-card {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.05);
  }
  
  .sound-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .sound-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--apple-text-primary);
    line-height: 1.3;
  }
  
  .sound-team {
    font-size: 11px;
    font-weight: 500;
    background: var(--apple-surface-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }
  
  .sound-body {
    margin-bottom: 12px;
  }
  
  .sound-card .sound-description {
    font-size: 12px;
    color: var(--apple-text-secondary);
    margin-bottom: 4px;
    line-height: 1.3;
  }
  
  .sound-card .sound-duration {
    font-size: 11px;
    color: var(--apple-text-tertiary);
  }
  
  .sound-actions {
    display: flex;
    gap: 8px;
  }
  
  .preview-button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .preview-button:hover {
    background: var(--apple-accent-blue);
    color: white;
    transform: scale(1.05);
  }
  
  .preview-button.playing {
    background: var(--apple-accent-orange);
    color: white;
  }
  
  .select-button {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .select-button:hover {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
  }
  
  .select-button.selected {
    background: var(--apple-accent-green);
    color: white;
    border-color: var(--apple-accent-green);
  }
  
  /* 사운드 없음 */
  .no-sounds {
    text-align: center;
    padding: 40px 20px;
    color: var(--apple-text-secondary);
  }
  
  .no-sounds-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .no-sounds h4 {
    font-size: 18px;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .no-sounds p {
    font-size: 14px;
    margin: 0;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .sound-library {
      padding: 16px;
    }
    
    .team-buttons {
      gap: 6px;
    }
    
    .team-button {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    .sound-items {
      grid-template-columns: 1fr;
    }
    
    .sound-preview {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .sound-controls {
      align-self: flex-end;
    }
  }
</style>