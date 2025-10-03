<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade, scale, fly } from 'svelte/transition';
  import { quintOut, backOut } from 'svelte/easing';
  
  // Props
  export let postId: string;
  export let likes: number = 0;
  export let comments: number = 0;
  export let shares: number = 0;
  export let isLiked: boolean = false;
  export let isBookmarked: boolean = false;
  export let showCounts: boolean = true;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let theme: 'light' | 'dark' = 'light';

  // Events
  const dispatch = createEventDispatcher<{
    like: void;
    comment: void;
    share: { platform?: string };
    bookmark: void;
    hapticFeedback: { type: 'light' | 'medium' | 'heavy' };
  }>();

  // Animation states
  let likeAnimation = spring(0, { stiffness: 0.3, damping: 0.8 });
  let bookmarkAnimation = spring(0, { stiffness: 0.3, damping: 0.8 });
  let shareMenuOpen = false;
  let showLikeParticles = false;
  let particleCount = 0;

  // Reactive styles
  $: buttonSize = {
    small: { width: '32px', height: '32px', fontSize: '14px' },
    medium: { width: '40px', height: '40px', fontSize: '16px' },
    large: { width: '48px', height: '48px', fontSize: '18px' }
  }[size];

  // Functions
  function handleLike() {
    const wasLiked = isLiked;
    
    // Trigger haptic feedback
    triggerHapticFeedback('medium');
    
    // Animate like button
    likeAnimation.set(1).then(() => likeAnimation.set(0));
    
    // Show particles for new likes
    if (!wasLiked) {
      showLikeParticles = true;
      particleCount = Math.floor(Math.random() * 5) + 3;
      setTimeout(() => {
        showLikeParticles = false;
      }, 1000);
    }
    
    dispatch('like');
  }

  function handleComment() {
    triggerHapticFeedback('light');
    dispatch('comment');
  }

  function handleShare(platform?: string) {
    triggerHapticFeedback('light');
    shareMenuOpen = false;
    dispatch('share', { platform });
  }

  function handleBookmark() {
    triggerHapticFeedback('medium');
    bookmarkAnimation.set(1).then(() => bookmarkAnimation.set(0));
    dispatch('bookmark');
  }

  function toggleShareMenu() {
    triggerHapticFeedback('light');
    shareMenuOpen = !shareMenuOpen;
  }

  function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy') {
    // Dispatch event for parent to handle haptic feedback
    dispatch('hapticFeedback', { type });
    
    // Web Vibration API fallback
    if ('vibrator' in navigator || 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      navigator.vibrate?.(patterns[type]);
    }
  }

  // Keyboard accessibility
  function handleKeydown(event: KeyboardEvent, action: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }

  onMount(() => {
    // Close share menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuOpen && !(event.target as Element)?.closest('.share-menu-container')) {
        shareMenuOpen = false;
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="apple-social-interactions" class:dark={theme === 'dark'}>
  <!-- Like Button with Particles -->
  <div class="interaction-group">
    <button
      class="interaction-btn like-btn"
      class:active={isLiked}
      style="width: {buttonSize.width}; height: {buttonSize.height}; font-size: {buttonSize.fontSize}"
      on:click={handleLike}
      on:keydown={(e) => handleKeydown(e, handleLike)}
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
      aria-pressed={isLiked}
    >
      <!-- Heart Icon with Animation -->
      <div 
        class="icon-container"
        style="transform: scale({1 + $likeAnimation * 0.3}) rotate({$likeAnimation * 10}deg)"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="heart-icon">
          <path 
            d="M10 17.5L8.825 16.4C4.5 12.5 1.5 9.8 1.5 6.5C1.5 4.1 3.4 2.5 5.5 2.5C6.74 2.5 7.94 3.09 8.75 4C9.56 3.09 10.76 2.5 12 2.5C14.1 2.5 16 4.1 16 6.5C16 9.8 13 12.5 8.675 16.4L10 17.5Z" 
            fill={isLiked ? '#ff3b30' : 'none'}
            stroke="currentColor" 
            stroke-width="1.5"
            class="heart-path"
          />
        </svg>
      </div>

      <!-- Like Particles -->
      {#if showLikeParticles}
        {#each Array(particleCount) as _, i}
          <div 
            class="like-particle"
            style="--delay: {i * 0.1}s; --angle: {(360 / particleCount) * i}deg"
            in:scale={{ duration: 300, delay: i * 100, easing: backOut }}
            out:fade={{ duration: 200 }}
          >
            ❤️
          </div>
        {/each}
      {/if}
    </button>
    
    {#if showCounts && likes > 0}
      <span class="count" in:fly={{ y: -10, duration: 200 }}>{likes}</span>
    {/if}
  </div>

  <!-- Comment Button -->
  <div class="interaction-group">
    <button
      class="interaction-btn comment-btn"
      style="width: {buttonSize.width}; height: {buttonSize.height}; font-size: {buttonSize.fontSize}"
      on:click={handleComment}
      on:keydown={(e) => handleKeydown(e, handleComment)}
      aria-label="댓글"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path 
          d="M2 10C2 14.4183 5.58172 18 10 18C11.2 18 12.3 17.7 13.3 17.2L18 18L16.8 13.3C17.3 12.3 17.6 11.2 17.6 10C17.6 5.58172 14.0183 2 9.6 2C5.18172 2 2 5.58172 2 10Z" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linejoin="round"
        />
      </svg>
    </button>
    
    {#if showCounts && comments > 0}
      <span class="count" in:fly={{ y: -10, duration: 200 }}>{comments}</span>
    {/if}
  </div>

  <!-- Share Button with Menu -->
  <div class="interaction-group share-menu-container">
    <button
      class="interaction-btn share-btn"
      style="width: {buttonSize.width}; height: {buttonSize.height}; font-size: {buttonSize.fontSize}"
      on:click={toggleShareMenu}
      on:keydown={(e) => handleKeydown(e, toggleShareMenu)}
      aria-label="공유"
      aria-expanded={shareMenuOpen}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path 
          d="M15 13L10 8L5 13" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <path 
          d="M10 8V18" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round"
        />
        <path 
          d="M3 3H17" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round"
        />
      </svg>
    </button>

    <!-- Share Menu -->
    {#if shareMenuOpen}
      <div 
        class="share-menu"
        in:scale={{ duration: 200, start: 0.8, easing: backOut }}
        out:scale={{ duration: 150, start: 0.8, easing: quintOut }}
      >
        <button 
          class="share-option twitter"
          on:click={() => handleShare('twitter')}
          aria-label="Twitter에 공유"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <span>Twitter</span>
        </button>

        <button 
          class="share-option instagram"
          on:click={() => handleShare('instagram')}
          aria-label="Instagram에 공유"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>Instagram</span>
        </button>

        <button 
          class="share-option facebook"
          on:click={() => handleShare('facebook')}
          aria-label="Facebook에 공유"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>

        <button 
          class="share-option copy"
          on:click={() => handleShare('copy')}
          aria-label="링크 복사"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>
          </svg>
          <span>링크 복사</span>
        </button>
      </div>
    {/if}
    
    {#if showCounts && shares > 0}
      <span class="count" in:fly={{ y: -10, duration: 200 }}>{shares}</span>
    {/if}
  </div>

  <!-- Bookmark Button -->
  <div class="interaction-group">
    <button
      class="interaction-btn bookmark-btn"
      class:active={isBookmarked}
      style="width: {buttonSize.width}; height: {buttonSize.height}; font-size: {buttonSize.fontSize}"
      on:click={handleBookmark}
      on:keydown={(e) => handleKeydown(e, handleBookmark)}
      aria-label={isBookmarked ? '북마크 해제' : '북마크'}
      aria-pressed={isBookmarked}
    >
      <div 
        class="icon-container"
        style="transform: scale({1 + $bookmarkAnimation * 0.2}) rotate({$bookmarkAnimation * 5}deg)"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path 
            d="M4 4V16L10 12L16 16V4C16 3.44772 15.5523 3 15 3H5C4.44772 3 4 3.44772 4 4Z" 
            fill={isBookmarked ? '#007aff' : 'none'}
            stroke="currentColor" 
            stroke-width="1.5"
            class="bookmark-path"
          />
        </svg>
      </div>
    </button>
  </div>
</div>

<style>
  .apple-social-interactions {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 0;
  }

  .interaction-group {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
  }

  .interaction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: #666;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: relative;
    overflow: visible;
  }

  .interaction-btn:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .interaction-btn:active {
    transform: translateY(0) scale(0.95);
  }

  .interaction-btn:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }

  /* Like Button Styles */
  .like-btn.active {
    background: rgba(255, 59, 48, 0.1);
    border-color: #ff3b30;
    color: #ff3b30;
  }

  .like-btn.active:hover {
    background: rgba(255, 59, 48, 0.15);
  }

  .heart-path {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .like-btn.active .heart-path {
    fill: #ff3b30;
    stroke: #ff3b30;
  }

  /* Like Particles */
  .like-particle {
    position: absolute;
    font-size: 12px;
    pointer-events: none;
    animation: particle-float 1s ease-out forwards;
    animation-delay: var(--delay);
    transform: rotate(var(--angle));
  }

  @keyframes particle-float {
    0% {
      opacity: 1;
      transform: rotate(var(--angle)) translateY(0) scale(0.5);
    }
    100% {
      opacity: 0;
      transform: rotate(var(--angle)) translateY(-30px) scale(1);
    }
  }

  /* Bookmark Button Styles */
  .bookmark-btn.active {
    background: rgba(0, 122, 255, 0.1);
    border-color: #007aff;
    color: #007aff;
  }

  .bookmark-btn.active:hover {
    background: rgba(0, 122, 255, 0.15);
  }

  .bookmark-path {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bookmark-btn.active .bookmark-path {
    fill: #007aff;
    stroke: #007aff;
  }

  /* Share Menu */
  .share-menu-container {
    position: relative;
  }

  .share-menu {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    margin-bottom: 8px;
  }

  .share-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    transition: all 0.2s ease;
    text-align: left;
    font-family: inherit;
  }

  .share-option:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .share-option.twitter {
    color: #1da1f2;
  }

  .share-option.instagram {
    color: #e4405f;
  }

  .share-option.facebook {
    color: #1877f2;
  }

  .share-option.copy {
    color: #666;
  }

  /* Count Display */
  .count {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    min-width: 20px;
    text-align: center;
  }

  /* Dark Theme */
  .dark .interaction-btn {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ccc;
  }

  .dark .interaction-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .dark .share-menu {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .dark .share-option {
    color: #ccc;
  }

  .dark .share-option:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .dark .count {
    color: #999;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .apple-social-interactions {
      gap: 12px;
    }

    .interaction-group {
      gap: 4px;
    }

    .share-menu {
      min-width: 120px;
    }

    .share-option {
      padding: 6px 10px;
      font-size: 13px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .interaction-btn,
    .heart-path,
    .bookmark-path {
      transition: none;
    }

    .like-particle {
      animation: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .interaction-btn {
      border-width: 2px;
    }

    .like-btn.active {
      background: #ff3b30;
      color: white;
    }

    .bookmark-btn.active {
      background: #007aff;
      color: white;
    }
  }
</style>