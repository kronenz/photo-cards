<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale, fly } from 'svelte/transition';
  import { quintOut, backOut } from 'svelte/easing';

  // Props
  export let isOpen: boolean = false;
  export let postId: string;
  export let postTitle: string = '';
  export let postImage: string = '';
  export let postUrl: string = '';

  // Events
  const dispatch = createEventDispatcher<{
    close: void;
    share: { platform: string; success: boolean };
    copy: { success: boolean };
  }>();

  // State
  let copySuccess = false;
  let copyTimeout: number;

  // Social platforms configuration
  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'twitter',
      color: '#1da1f2',
      shareUrl: (url: string, title: string) => 
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'facebook',
      color: '#1877f2',
      shareUrl: (url: string) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'instagram',
      color: '#e4405f',
      shareUrl: () => '' // Instagram doesn't support direct URL sharing
    },
    {
      id: 'kakao',
      name: 'KakaoTalk',
      icon: 'kakao',
      color: '#fee500',
      shareUrl: (url: string, title: string) => 
        `https://story.kakao.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      id: 'line',
      name: 'LINE',
      icon: 'line',
      color: '#00c300',
      shareUrl: (url: string, title: string) => 
        `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'telegram',
      color: '#0088cc',
      shareUrl: (url: string, title: string) => 
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    }
  ];

  // Functions
  function handleShare(platform: typeof platforms[0]) {
    try {
      if (platform.id === 'instagram') {
        // Instagram requires special handling
        handleInstagramShare();
        return;
      }

      const shareUrl = platform.shareUrl(postUrl, postTitle);
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        dispatch('share', { platform: platform.id, success: true });
      }
    } catch (error) {
      console.error(`Failed to share to ${platform.name}:`, error);
      dispatch('share', { platform: platform.id, success: false });
    }
  }

  function handleInstagramShare() {
    // Instagram doesn't support direct URL sharing
    // Show instructions for manual sharing
    if ('share' in navigator && navigator.share) {
      navigator.share({
        title: postTitle,
        text: postTitle,
        url: postUrl
      }).then(() => {
        dispatch('share', { platform: 'instagram', success: true });
      }).catch(() => {
        // Fallback to copy URL
        copyToClipboard();
      });
    } else {
      // Fallback to copy URL with instructions
      copyToClipboard();
      alert('링크가 복사되었습니다. Instagram 앱에서 스토리나 게시물에 붙여넣기 하세요.');
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(postUrl);
      copySuccess = true;
      
      // Clear previous timeout
      if (copyTimeout) clearTimeout(copyTimeout);
      
      // Reset success state after 2 seconds
      copyTimeout = setTimeout(() => {
        copySuccess = false;
      }, 2000);

      dispatch('copy', { success: true });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = postUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copySuccess = true;
        copyTimeout = setTimeout(() => {
          copySuccess = false;
        }, 2000);

        dispatch('copy', { success: true });
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        dispatch('copy', { success: false });
      }
    }
  }

  function handleNativeShare() {
    if ('share' in navigator && navigator.share) {
      navigator.share({
        title: postTitle,
        text: postTitle,
        url: postUrl
      }).then(() => {
        dispatch('share', { platform: 'native', success: true });
        close();
      }).catch((error) => {
        console.error('Native share failed:', error);
      });
    }
  }

  function close() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  onMount(() => {
    return () => {
      if (copyTimeout) clearTimeout(copyTimeout);
    };
  });
</script>

{#if isOpen}
  <div 
    class="modal-overlay"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 150 }}
    on:click={handleOverlayClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="share-modal-title"
    tabindex="-1"
  >
    <div 
      class="modal-content"
      in:scale={{ duration: 200, start: 0.9, easing: backOut }}
      out:scale={{ duration: 150, start: 0.9, easing: quintOut }}
    >
      <!-- Header -->
      <div class="modal-header">
        <h2 id="share-modal-title">공유하기</h2>
        <button
          class="close-btn"
          on:click={close}
          aria-label="닫기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Post Preview -->
      {#if postTitle || postImage}
        <div class="post-preview">
          {#if postImage}
            <div class="preview-image">
              <img src={postImage} alt="포스트 미리보기" />
            </div>
          {/if}
          {#if postTitle}
            <div class="preview-text">
              <p>{postTitle}</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Native Share (Mobile) -->
      {#if typeof navigator !== 'undefined' && 'share' in navigator}
        <div class="native-share" in:fly={{ y: 20, duration: 200, delay: 100 }}>
          <button
            class="share-option native"
            on:click={handleNativeShare}
          >
            <div class="option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </div>
            <div class="option-content">
              <span class="option-name">기기 공유</span>
              <span class="option-description">설치된 앱으로 공유</span>
            </div>
          </button>
        </div>
      {/if}

      <!-- Social Platforms -->
      <div class="platforms-grid">
        {#each platforms as platform, index}
          <button
            class="share-option platform"
            style="--platform-color: {platform.color}"
            on:click={() => handleShare(platform)}
            in:fly={{ y: 20, duration: 200, delay: 150 + (index * 50) }}
          >
            <div class="option-icon">
              {#if platform.icon === 'twitter'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              {:else if platform.icon === 'facebook'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              {:else if platform.icon === 'instagram'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              {:else if platform.icon === 'kakao'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.486 3 2 6.486 2 10.5c0 2.57 1.67 4.83 4.19 6.31L5.5 20.5c-.19.38.11.81.53.81.14 0 .27-.06.36-.16L9.5 18.31c.82.12 1.66.19 2.5.19 5.514 0 10-3.486 10-7.5S17.514 3 12 3z"/>
                </svg>
              {:else if platform.icon === 'line'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              {:else if platform.icon === 'telegram'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              {/if}
            </div>
            <span class="option-name">{platform.name}</span>
          </button>
        {/each}
      </div>

      <!-- Copy Link -->
      <div class="copy-section" in:fly={{ y: 20, duration: 200, delay: 500 }}>
        <div class="copy-input-group">
          <input
            type="text"
            value={postUrl}
            readonly
            class="url-input"
            aria-label="포스트 URL"
          />
          <button
            class="copy-btn"
            class:success={copySuccess}
            on:click={copyToClipboard}
            aria-label="링크 복사"
          >
            {#if copySuccess}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              복사됨!
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              링크 복사
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    padding: 24px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  /* Header */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .modal-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: #f5f5f5;
    color: #333;
  }

  /* Post Preview */
  .post-preview {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .preview-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-text {
    flex: 1;
    min-width: 0;
  }

  .preview-text p {
    font-size: 14px;
    color: #333;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Native Share */
  .native-share {
    margin-bottom: 20px;
  }

  .share-option.native {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .share-option.native:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }

  .share-option.native .option-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .option-description {
    font-size: 12px;
    opacity: 0.8;
  }

  /* Platforms Grid */
  .platforms-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .share-option.platform {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    color: var(--platform-color);
  }

  .share-option.platform:hover {
    border-color: var(--platform-color);
    background: rgba(var(--platform-color-rgb, 0, 0, 0), 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .option-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(var(--platform-color-rgb, 0, 0, 0), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--platform-color);
    transition: all 0.2s ease;
  }

  .share-option.platform:hover .option-icon {
    background: var(--platform-color);
    color: white;
    transform: scale(1.1);
  }

  .share-option.native .option-icon {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .option-name {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    color: #333;
  }

  .share-option.platform:hover .option-name {
    color: var(--platform-color);
  }

  .share-option.native .option-name {
    color: white;
    font-size: 14px;
  }

  /* Copy Section */
  .copy-section {
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
  }

  .copy-input-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .url-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    background: #f8f9fa;
    color: #666;
    min-width: 0;
  }

  .url-input:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: inherit;
  }

  .copy-btn:hover:not(.success) {
    background: #0056cc;
    transform: translateY(-1px);
  }

  .copy-btn.success {
    background: #34c759;
    transform: scale(1.05);
  }

  /* Platform-specific color variables */
  .share-option.platform:nth-child(1) { --platform-color-rgb: 29, 161, 242; } /* Twitter */
  .share-option.platform:nth-child(2) { --platform-color-rgb: 24, 119, 242; } /* Facebook */
  .share-option.platform:nth-child(3) { --platform-color-rgb: 228, 64, 95; } /* Instagram */
  .share-option.platform:nth-child(4) { --platform-color-rgb: 254, 229, 0; } /* Kakao */
  .share-option.platform:nth-child(5) { --platform-color-rgb: 0, 195, 0; } /* LINE */
  .share-option.platform:nth-child(6) { --platform-color-rgb: 0, 136, 204; } /* Telegram */

  /* Responsive Design */
  @media (max-width: 480px) {
    .modal-content {
      margin: 20px;
      padding: 20px;
      border-radius: 16px;
    }

    .platforms-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .share-option.platform {
      padding: 12px 8px;
    }

    .option-icon {
      width: 36px;
      height: 36px;
    }

    .option-name {
      font-size: 11px;
    }

    .copy-input-group {
      flex-direction: column;
      gap: 12px;
    }

    .url-input {
      width: 100%;
    }

    .copy-btn {
      width: 100%;
      justify-content: center;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .modal-content {
      background: #1c1c1e;
      color: white;
    }

    .modal-header h2 {
      color: white;
    }

    .close-btn {
      color: #8e8e93;
    }

    .close-btn:hover {
      background: #2c2c2e;
      color: white;
    }

    .post-preview {
      background: #2c2c2e;
    }

    .preview-text p {
      color: white;
    }

    .share-option.platform {
      background: #2c2c2e;
      border-color: #38383a;
    }

    .share-option.platform:hover {
      background: rgba(var(--platform-color-rgb, 0, 0, 0), 0.1);
    }

    .option-name {
      color: white;
    }

    .copy-section {
      border-color: #38383a;
    }

    .url-input {
      background: #2c2c2e;
      border-color: #38383a;
      color: #8e8e93;
    }

    .url-input:focus {
      border-color: #0a84ff;
      box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .share-option,
    .copy-btn,
    .option-icon {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .share-option.platform {
      border-width: 2px;
    }

    .url-input {
      border-width: 2px;
    }
  }
</style>