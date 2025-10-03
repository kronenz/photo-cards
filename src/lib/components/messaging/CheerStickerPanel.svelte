<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { messagingService } from '$lib/services/messagingService';
  import type { CheerSticker } from '$lib/types/messaging';

  export let teamId: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  let stickers: CheerSticker[] = [];
  let activeCategory: string = 'all';
  let isLoading = true;

  const categories = [
    { id: 'all', name: '전체', icon: '🎯' },
    { id: 'cheer', name: '응원', icon: '📢' },
    { id: 'emotion', name: '감정', icon: '😊' },
    { id: 'player', name: '선수', icon: '⚾' },
    { id: 'action', name: '액션', icon: '🏃' }
  ];

  onMount(() => {
    loadStickers();
  });

  async function loadStickers() {
    try {
      isLoading = true;
      stickers = await messagingService.getCheerStickers(teamId);
    } catch (error) {
      console.error('Failed to load stickers:', error);
      // Use mock data on error
      stickers = getMockStickers();
    } finally {
      isLoading = false;
    }
  }

  function getMockStickers(): CheerSticker[] {
    return [
      // 응원 스티커
      {
        id: '1',
        name: '파이팅!',
        category: 'cheer',
        imageUrl: '/stickers/fighting.png',
        isAnimated: false,
        isPremium: false
      },
      {
        id: '2',
        name: '홈런!',
        category: 'action',
        imageUrl: '/stickers/homerun.gif',
        animationUrl: '/stickers/homerun.gif',
        soundUrl: '/sounds/homerun.mp3',
        isAnimated: true,
        isPremium: false
      },
      {
        id: '3',
        name: '응원',
        teamId: teamId,
        category: 'cheer',
        imageUrl: '/stickers/cheer.png',
        soundUrl: '/sounds/cheer.mp3',
        isAnimated: false,
        isPremium: true
      },
      {
        id: '4',
        name: '좋아요',
        category: 'emotion',
        imageUrl: '/stickers/thumbs-up.png',
        isAnimated: false,
        isPremium: false
      },
      {
        id: '5',
        name: '하트',
        category: 'emotion',
        imageUrl: '/stickers/heart.gif',
        animationUrl: '/stickers/heart.gif',
        isAnimated: true,
        isPremium: false
      },
      {
        id: '6',
        name: '박수',
        category: 'cheer',
        imageUrl: '/stickers/clap.gif',
        animationUrl: '/stickers/clap.gif',
        soundUrl: '/sounds/clap.mp3',
        isAnimated: true,
        isPremium: false
      },
      {
        id: '7',
        name: '슬라이딩',
        category: 'action',
        imageUrl: '/stickers/sliding.gif',
        animationUrl: '/stickers/sliding.gif',
        isAnimated: true,
        isPremium: true
      },
      {
        id: '8',
        name: '투수',
        category: 'player',
        imageUrl: '/stickers/pitcher.png',
        isAnimated: false,
        isPremium: false
      },
      {
        id: '9',
        name: '타자',
        category: 'player',
        imageUrl: '/stickers/batter.gif',
        animationUrl: '/stickers/batter.gif',
        isAnimated: true,
        isPremium: false
      },
      {
        id: '10',
        name: '승리',
        category: 'emotion',
        imageUrl: '/stickers/victory.gif',
        animationUrl: '/stickers/victory.gif',
        soundUrl: '/sounds/victory.mp3',
        isAnimated: true,
        isPremium: true
      }
    ];
  }

  $: filteredStickers = activeCategory === 'all' 
    ? stickers 
    : stickers.filter(sticker => sticker.category === activeCategory);

  function selectSticker(sticker: CheerSticker) {
    dispatch('selectSticker', sticker);
  }

  function closePanel() {
    dispatch('close');
  }

  function getStickerImageUrl(sticker: CheerSticker): string {
    // In a real app, this would return actual sticker URLs
    // For demo, we'll use placeholder images or emojis
    const placeholders: Record<string, string> = {
      '파이팅!': '💪',
      '홈런!': '⚾',
      '응원': '📢',
      '좋아요': '👍',
      '하트': '❤️',
      '박수': '👏',
      '슬라이딩': '🏃',
      '투수': '🤾',
      '타자': '🏏',
      '승리': '🏆'
    };
    
    return placeholders[sticker.name] || '😊';
  }
</script>

<div class="sticker-panel">
  <!-- Header -->
  <div class="panel-header">
    <h3>응원 스티커</h3>
    <button class="close-btn" on:click={closePanel}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <!-- Categories -->
  <div class="categories">
    {#each categories as category}
      <button 
        class="category-btn"
        class:active={activeCategory === category.id}
        on:click={() => activeCategory = category.id}
      >
        <span class="category-icon">{category.icon}</span>
        <span class="category-name">{category.name}</span>
      </button>
    {/each}
  </div>

  <!-- Stickers Grid -->
  <div class="stickers-container">
    {#if isLoading}
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>스티커를 불러오는 중...</p>
      </div>
    {:else if filteredStickers.length === 0}
      <div class="no-stickers">
        <p>스티커가 없습니다</p>
        <span>다른 카테고리를 선택해보세요</span>
      </div>
    {:else}
      <div class="stickers-grid">
        {#each filteredStickers as sticker (sticker.id)}
          <button 
            class="sticker-item"
            class:premium={sticker.isPremium}
            on:click={() => selectSticker(sticker)}
            title={sticker.name}
          >
            <div class="sticker-image">
              {#if sticker.imageUrl.startsWith('http') || sticker.imageUrl.startsWith('/')}
                <img 
                  src={sticker.imageUrl} 
                  alt={sticker.name}
                  class:animated={sticker.isAnimated}
                />
              {:else}
                <span class="emoji-sticker">{getStickerImageUrl(sticker)}</span>
              {/if}
              
              {#if sticker.isAnimated}
                <div class="animated-indicator">GIF</div>
              {/if}
              
              {#if sticker.soundUrl}
                <div class="sound-indicator">🔊</div>
              {/if}
              
              {#if sticker.isPremium}
                <div class="premium-badge">⭐</div>
              {/if}
            </div>
            
            <span class="sticker-name">{sticker.name}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Team Stickers Section -->
  {#if teamId}
    <div class="team-section">
      <h4>팀 전용 스티커</h4>
      <div class="team-stickers">
        {#each stickers.filter(s => s.teamId === teamId) as sticker (sticker.id)}
          <button 
            class="sticker-item team-sticker"
            on:click={() => selectSticker(sticker)}
          >
            <div class="sticker-image">
              <span class="emoji-sticker">{getStickerImageUrl(sticker)}</span>
              <div class="team-badge">팀</div>
            </div>
            <span class="sticker-name">{sticker.name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Premium Notice -->
  <div class="premium-notice">
    <div class="notice-content">
      <span class="notice-icon">⭐</span>
      <div class="notice-text">
        <p>프리미엄 스티커</p>
        <span>시즌권 홀더 이상 사용 가능</span>
      </div>
    </div>
  </div>
</div>

<style>
  .sticker-panel {
    height: 400px;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .panel-header h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .close-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .categories {
    display: flex;
    padding: 12px 20px;
    gap: 8px;
    border-bottom: 1px solid var(--border-color);
    overflow-x: auto;
  }

  .category-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
    flex-shrink: 0;
  }

  .category-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .category-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .category-icon {
    font-size: 16px;
  }

  .category-name {
    font-size: 11px;
    font-weight: 500;
  }

  .stickers-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .no-stickers {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-secondary);
    text-align: center;
  }

  .no-stickers p {
    font-size: 16px;
    margin: 0 0 8px 0;
  }

  .no-stickers span {
    font-size: 14px;
    opacity: 0.7;
  }

  .stickers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }

  .sticker-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .sticker-item:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  .sticker-item.premium {
    border-color: #ffd700;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, #fff9e6 100%);
  }

  .sticker-item.team-sticker {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-bg) 100%);
  }

  .sticker-image {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sticker-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .emoji-sticker {
    font-size: 32px;
  }

  .animated-indicator {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff6b6b;
    color: white;
    font-size: 8px;
    font-weight: 600;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .sound-indicator {
    position: absolute;
    bottom: -4px;
    right: -4px;
    font-size: 12px;
  }

  .premium-badge {
    position: absolute;
    top: -4px;
    left: -4px;
    font-size: 12px;
  }

  .team-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--primary-color);
    color: white;
    font-size: 8px;
    font-weight: 600;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .sticker-name {
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.2;
  }

  .team-section {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .team-section h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }

  .team-stickers {
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }

  .team-stickers .sticker-item {
    min-width: 70px;
    flex-shrink: 0;
  }

  .premium-notice {
    padding: 12px 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .notice-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .notice-icon {
    font-size: 16px;
  }

  .notice-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .notice-text p {
    font-size: 12px;
    font-weight: 500;
    margin: 0;
    color: var(--text-primary);
  }

  .notice-text span {
    font-size: 11px;
    color: var(--text-secondary);
  }

  /* Scrollbar styling */
  .categories::-webkit-scrollbar,
  .stickers-container::-webkit-scrollbar,
  .team-stickers::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }

  .categories::-webkit-scrollbar-track,
  .stickers-container::-webkit-scrollbar-track,
  .team-stickers::-webkit-scrollbar-track {
    background: transparent;
  }

  .categories::-webkit-scrollbar-thumb,
  .stickers-container::-webkit-scrollbar-thumb,
  .team-stickers::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .sticker-panel {
      height: 350px;
    }

    .stickers-grid {
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: 8px;
    }

    .sticker-item {
      padding: 8px 6px;
    }

    .sticker-image {
      width: 40px;
      height: 40px;
    }

    .emoji-sticker {
      font-size: 24px;
    }
  }
</style>