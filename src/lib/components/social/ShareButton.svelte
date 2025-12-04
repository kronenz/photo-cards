<!--
  Share Button Component
  Feature: 004-production-service-integration (T047)

  Provides share/unshare functionality for cards to gallery
-->
<script lang="ts">
  import { socialService } from '$lib/services/socialService';
  import { createEventDispatcher } from 'svelte';

  export let cardId: string;
  export let isShared: boolean = false;
  export let isOwner: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'default' | 'icon-only' = 'default';

  const dispatch = createEventDispatcher<{
    share: { cardId: string; shared: boolean };
  }>();

  let isLoading = false;
  let error = '';

  const sizeClasses = {
    sm: 'share-btn-sm',
    md: 'share-btn-md',
    lg: 'share-btn-lg'
  };

  async function handleClick() {
    if (isLoading) return;

    isLoading = true;
    error = '';

    try {
      if (isOwner) {
        // Toggle share status
        if (isShared) {
          await socialService.unshareCard(cardId);
          isShared = false;
        } else {
          await socialService.shareCard(cardId);
          isShared = true;
        }
        dispatch('share', { cardId, shared: isShared });
      } else {
        // Share to clipboard or external
        await shareExternal();
      }
    } catch (err: any) {
      error = err.message || '공유에 실패했습니다.';
    } finally {
      isLoading = false;
    }
  }

  async function shareExternal() {
    const shareUrl = `${window.location.origin}/gallery/${cardId}`;
    const shareData = {
      title: '홀로그래픽 카드',
      text: '이 카드를 확인해보세요!',
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // Show toast notification would go here
        alert('링크가 클립보드에 복사되었습니다.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        throw err;
      }
    }
  }
</script>

<button
  type="button"
  class="share-btn {sizeClasses[size]}"
  class:shared={isShared && isOwner}
  class:icon-only={variant === 'icon-only'}
  class:loading={isLoading}
  on:click={handleClick}
  disabled={isLoading}
  title={isOwner ? (isShared ? '공유 취소' : '갤러리에 공유') : '공유하기'}
>
  <span class="share-icon">
    {#if isOwner && isShared}
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
      </svg>
    {/if}
  </span>
  {#if variant !== 'icon-only'}
    <span class="share-text">
      {#if isOwner}
        {isShared ? '공유됨' : '공유하기'}
      {:else}
        공유
      {/if}
    </span>
  {/if}
</button>

{#if error}
  <div class="error-tooltip">{error}</div>
{/if}

<style>
  .share-btn {
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

  .share-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(102, 126, 234, 0.5);
    color: #fff;
  }

  .share-btn.shared {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    color: #667eea;
  }

  .share-btn.loading {
    opacity: 0.7;
    cursor: wait;
  }

  .share-btn:disabled {
    cursor: not-allowed;
  }

  .share-btn.icon-only {
    padding: 8px;
  }

  /* Sizes */
  .share-btn-sm {
    padding: 4px 8px;
    font-size: 12px;
  }

  .share-btn-sm .share-icon svg {
    width: 14px;
    height: 14px;
  }

  .share-btn-md {
    padding: 8px 12px;
    font-size: 14px;
  }

  .share-btn-md .share-icon svg {
    width: 18px;
    height: 18px;
  }

  .share-btn-lg {
    padding: 10px 16px;
    font-size: 16px;
  }

  .share-btn-lg .share-icon svg {
    width: 22px;
    height: 22px;
  }

  .share-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .share-text {
    font-weight: 500;
  }

  .error-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
    padding: 6px 12px;
    background: rgba(255, 59, 48, 0.9);
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
</style>
