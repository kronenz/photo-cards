<!--
  Like Button Component
  Feature: 004-production-service-integration (T045)

  Provides like/unlike functionality with optimistic update
-->
<script lang="ts">
  import { socialService } from '$lib/services/socialService';
  import { onMount, onDestroy } from 'svelte';

  export let cardId: string;
  export let initialLiked: boolean = false;
  export let initialCount: number = 0;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showCount: boolean = true;

  let liked = initialLiked;
  let likeCount = initialCount;
  let isLoading = false;
  let unsubscribe: (() => void) | null = null;

  const sizeClasses = {
    sm: 'like-btn-sm',
    md: 'like-btn-md',
    lg: 'like-btn-lg'
  };

  onMount(async () => {
    // Check initial like status
    liked = await socialService.hasLiked(cardId);

    // Subscribe to real-time like updates
    unsubscribe = socialService.subscribeToCardLikes(cardId, (newCount) => {
      likeCount = newCount;
    });
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  async function handleClick() {
    if (isLoading) return;

    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    liked = !liked;
    likeCount = liked ? likeCount + 1 : Math.max(0, likeCount - 1);

    isLoading = true;

    try {
      const result = await socialService.toggleLike(cardId);
      liked = result.liked;
      likeCount = result.likeCount;
    } catch (err) {
      // Revert on error
      liked = prevLiked;
      likeCount = prevCount;
    } finally {
      isLoading = false;
    }
  }
</script>

<button
  type="button"
  class="like-btn {sizeClasses[size]}"
  class:liked
  class:loading={isLoading}
  on:click={handleClick}
  disabled={isLoading}
  title={liked ? '좋아요 취소' : '좋아요'}
>
  <span class="heart-icon" class:animate={liked}>
    {#if liked}
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    {/if}
  </span>
  {#if showCount}
    <span class="like-count">{likeCount}</span>
  {/if}
</button>

<style>
  .like-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .like-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 59, 48, 0.5);
  }

  .like-btn.liked {
    background: rgba(255, 59, 48, 0.1);
    border-color: rgba(255, 59, 48, 0.3);
    color: #ff3b30;
  }

  .like-btn.loading {
    opacity: 0.7;
    cursor: wait;
  }

  .like-btn:disabled {
    cursor: not-allowed;
  }

  /* Sizes */
  .like-btn-sm {
    padding: 4px 8px;
    font-size: 12px;
  }

  .like-btn-sm .heart-icon svg {
    width: 14px;
    height: 14px;
  }

  .like-btn-md {
    padding: 8px 12px;
    font-size: 14px;
  }

  .like-btn-md .heart-icon svg {
    width: 18px;
    height: 18px;
  }

  .like-btn-lg {
    padding: 10px 16px;
    font-size: 16px;
  }

  .like-btn-lg .heart-icon svg {
    width: 22px;
    height: 22px;
  }

  .heart-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .heart-icon.animate {
    animation: heartPop 0.3s ease;
  }

  @keyframes heartPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .like-count {
    font-weight: 500;
  }
</style>
