<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { spring, tweened } from 'svelte/motion';
  import { cubicOut, cubicInOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  
  export let card: any = null;
  export let isOpen = false;
  export let onClose: () => void = () => {};
  export let onEdit: (card: any) => void = () => {};
  export let onShare: (card: any) => void = () => {};
  export let onLike: (card: any) => void = () => {};
  export let onComment: (card: any, comment: string) => void = () => {};

  const dispatch = createEventDispatcher();

  // Animation states
  const scale = spring(0, { stiffness: 0.3, damping: 0.8 });
  const opacity = spring(0, { stiffness: 0.2, damping: 0.4 });
  const cardRotation = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.8 });
  const backgroundBlur = tweened(0, { duration: 300, easing: cubicOut });
  
  // Interactive states
  let isEditMode = false;
  let showStats = false;
  let showComments = false;
  let showShareMenu = false;
  let isLiked = false;
  let isBookmarked = false;
  
  // Mouse tracking for 3D effect
  let mouseX = 0;
  let mouseY = 0;
  let cardElement: HTMLElement;
  let containerElement: HTMLElement;
  
  // Comments
  let newComment = '';
  let comments = [
    { id: 1, user: '야구팬123', content: '정말 멋진 카드네요! 홀로그래픽 효과가 환상적입니다.', time: '2분 전', likes: 5 },
    { id: 2, user: 'KBO매니아', content: '이런 카드는 어떻게 만드나요? 튜토리얼 있나요?', time: '5분 전', likes: 2 },
    { id: 3, user: '카드수집가', content: '실물로도 제작 가능한가요?', time: '10분 전', likes: 8 }
  ];
  
  // Stats data
  let stats = {
    views: 1247,
    likes: 89,
    comments: 23,
    shares: 12,
    downloads: 45,
    bookmarks: 67
  };
  
  // Share options
  let shareOptions = [
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#4267B2' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
    { id: 'kakao', name: 'KakaoTalk', icon: '💬', color: '#FEE500' },
    { id: 'copy', name: 'Copy Link', icon: '🔗', color: '#6B7280' },
    { id: 'embed', name: 'Embed Code', icon: '📋', color: '#6B7280' }
  ];

  // Handle mouse movement for 3D effect
  function handleMouseMove(event: MouseEvent) {
    if (!cardElement || !containerElement) return;
    
    const rect = containerElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX = (event.clientX - centerX) / (rect.width / 2);
    mouseY = (event.clientY - centerY) / (rect.height / 2);
    
    // Apply 3D rotation
    cardRotation.set({
      x: mouseY * -10, // Invert Y for natural feel
      y: mouseX * 10
    });
  }

  // Reset card rotation
  function resetCardRotation() {
    cardRotation.set({ x: 0, y: 0 });
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'Escape':
        closeViewer();
        break;
      case 'e':
      case 'E':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          toggleEditMode();
        }
        break;
      case 'l':
      case 'L':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          handleLike();
        }
        break;
      case 's':
      case 'S':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          toggleShareMenu();
        }
        break;
    }
  }

  // Open viewer with animation
  function openViewer() {
    if (!card) return;
    
    isOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Animate in
    scale.set(1);
    opacity.set(1);
    backgroundBlur.set(20);
    
    // Load card stats
    loadCardStats();
  }

  // Close viewer with animation
  function closeViewer() {
    scale.set(0);
    opacity.set(0);
    backgroundBlur.set(0);
    
    setTimeout(() => {
      isOpen = false;
      document.body.style.overflow = '';
      onClose();
    }, 300);
  }

  // Toggle edit mode
  function toggleEditMode() {
    isEditMode = !isEditMode;
    
    if (isEditMode) {
      onEdit(card);
    }
  }

  // Handle like action
  function handleLike() {
    isLiked = !isLiked;
    stats.likes += isLiked ? 1 : -1;
    onLike(card);
    
    // Animate like button
    if (isLiked) {
      // Heart animation
      const heartScale = spring(1);
      heartScale.set(1.3);
      setTimeout(() => heartScale.set(1), 200);
    }
  }

  // Handle bookmark
  function handleBookmark() {
    isBookmarked = !isBookmarked;
    stats.bookmarks += isBookmarked ? 1 : -1;
  }

  // Toggle share menu
  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }

  // Handle share option
  function handleShare(option: any) {
    showShareMenu = false;
    
    switch (option.id) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(card.title)}&url=${encodeURIComponent(window.location.href)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        // Show toast notification
        break;
      case 'embed':
        const embedCode = `<iframe src="${window.location.href}/embed" width="400" height="600"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        break;
    }
    
    stats.shares += 1;
    onShare(card);
  }

  // Add comment
  function addComment() {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: 'You',
      content: newComment,
      time: 'Just now',
      likes: 0
    };
    
    comments = [comment, ...comments];
    stats.comments += 1;
    onComment(card, newComment);
    newComment = '';
  }

  // Load card statistics
  function loadCardStats() {
    // Simulate API call
    setTimeout(() => {
      stats = {
        ...stats,
        views: stats.views + 1
      };
    }, 100);
  }

  // Generate embed code
  function generateEmbedCode(): string {
    return `<div class="holographic-card-embed" data-card-id="${card.id}">
  <iframe 
    src="${window.location.origin}/embed/card/${card.id}" 
    width="400" 
    height="600" 
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>`;
  }

  onMount(() => {
    if (isOpen) {
      openViewer();
    }
    
    // Add global event listeners
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    };
  });

  // Reactive statements
  $: if (isOpen && card) {
    openViewer();
  }
  
  $: if (!isOpen) {
    closeViewer();
  }
</script>

<!-- Backdrop -->
{#if isOpen}
  <div 
    class="viewer-backdrop"
    style="backdrop-filter: blur({$backgroundBlur}px); opacity: {$opacity};"
    on:click={closeViewer}
    role="button"
    tabindex="-1"
    on:keydown={(e) => e.key === 'Enter' && closeViewer()}
  ></div>
{/if}

<!-- Main Viewer -->
{#if isOpen && card}
  <div 
    class="apple-card-viewer"
    bind:this={containerElement}
    style="transform: scale({$scale}); opacity: {$opacity};"
    on:mousemove={handleMouseMove}
    on:mouseleave={resetCardRotation}
    role="dialog"
    aria-modal="true"
    aria-labelledby="card-title"
  >
    <!-- Header Controls -->
    <div class="viewer-header">
      <div class="header-left">
        <button class="control-button" on:click={closeViewer} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <h1 id="card-title" class="card-title">{card.title || 'Untitled Card'}</h1>
      </div>
      
      <div class="header-right">
        <button 
          class="control-button"
          class:active={showStats}
          on:click={() => showStats = !showStats}
          aria-label="Toggle Statistics"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3v18h18"/>
            <path d="M7 16l4-4 4 4 6-6"/>
          </svg>
        </button>
        
        <button 
          class="control-button"
          class:active={isEditMode}
          on:click={toggleEditMode}
          aria-label="Edit Card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        
        <button 
          class="control-button"
          class:active={showShareMenu}
          on:click={toggleShareMenu}
          aria-label="Share Card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="viewer-content">
      <!-- Card Display -->
      <div class="card-display">
        <div 
          class="holographic-card-3d"
          bind:this={cardElement}
          style="transform: rotateX({$cardRotation.x}deg) rotateY({$cardRotation.y}deg);"
        >
          <!-- Card Image -->
          <div class="card-image-container">
            {#if card.imageUrl}
              <img 
                src={card.imageUrl} 
                alt={card.title}
                class="card-image"
                loading="eager"
              />
            {:else}
              <div class="placeholder-card">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <p>No Image</p>
              </div>
            {/if}
            
            <!-- Holographic Effect Overlay -->
            {#if card.holographicEffect}
              <div 
                class="holographic-effect-3d" 
                data-effect={card.holographicEffect}
                style="transform: rotateX({$cardRotation.x * 0.5}deg) rotateY({$cardRotation.y * 0.5}deg);"
              ></div>
            {/if}
            
            <!-- Interactive Hotspots -->
            {#if card.interactiveElements}
              {#each card.interactiveElements as element}
                <div 
                  class="interactive-hotspot"
                  style="left: {element.x}%; top: {element.y}%;"
                  on:click={() => dispatch('hotspotClick', element)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && dispatch('hotspotClick', element)}
                >
                  <div class="hotspot-pulse"></div>
                  <div class="hotspot-tooltip">{element.tooltip}</div>
                </div>
              {/each}
            {/if}
          </div>
          
          <!-- Card Info Overlay -->
          <div class="card-info-overlay">
            <div class="card-metadata">
              {#if card.description}
                <p class="card-description">{card.description}</p>
              {/if}
              
              {#if card.tags && card.tags.length > 0}
                <div class="card-tags">
                  {#each card.tags as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Side Panel -->
      <div class="side-panel">
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            class="action-button like-button"
            class:liked={isLiked}
            on:click={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{stats.likes}</span>
          </button>
          
          <button 
            class="action-button bookmark-button"
            class:bookmarked={isBookmarked}
            on:click={handleBookmark}
            aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{stats.bookmarks}</span>
          </button>
          
          <button 
            class="action-button comment-button"
            class:active={showComments}
            on:click={() => showComments = !showComments}
            aria-label="Toggle Comments"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{stats.comments}</span>
          </button>
        </div>

        <!-- Statistics Panel -->
        {#if showStats}
          <div class="stats-panel">
            <h3>Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{stats.views.toLocaleString()}</span>
                <span class="stat-label">Views</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{stats.likes}</span>
                <span class="stat-label">Likes</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{stats.comments}</span>
                <span class="stat-label">Comments</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{stats.shares}</span>
                <span class="stat-label">Shares</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{stats.downloads}</span>
                <span class="stat-label">Downloads</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{stats.bookmarks}</span>
                <span class="stat-label">Bookmarks</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Comments Panel -->
        {#if showComments}
          <div class="comments-panel">
            <h3>Comments</h3>
            
            <!-- Add Comment -->
            <div class="add-comment">
              <textarea
                bind:value={newComment}
                placeholder="Add a comment..."
                rows="3"
                class="comment-input"
              ></textarea>
              <button 
                class="post-comment-button"
                on:click={addComment}
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </div>
            
            <!-- Comments List -->
            <div class="comments-list">
              {#each comments as comment}
                <div class="comment-item">
                  <div class="comment-header">
                    <span class="comment-user">{comment.user}</span>
                    <span class="comment-time">{comment.time}</span>
                  </div>
                  <p class="comment-content">{comment.content}</p>
                  <div class="comment-actions">
                    <button class="comment-like">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {comment.likes}
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Share Menu -->
    {#if showShareMenu}
      <div class="share-menu">
        <div class="share-menu-content">
          <h3>Share this card</h3>
          <div class="share-options">
            {#each shareOptions as option}
              <button 
                class="share-option"
                style="--option-color: {option.color}"
                on:click={() => handleShare(option)}
              >
                <span class="share-icon">{option.icon}</span>
                <span class="share-name">{option.name}</span>
              </button>
            {/each}
          </div>
          
          {#if shareOptions.find(o => o.id === 'embed')}
            <div class="embed-section">
              <h4>Embed Code</h4>
              <textarea 
                readonly 
                value={generateEmbedCode()}
                class="embed-code"
                on:click={(e) => e.target.select()}
              ></textarea>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .viewer-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    cursor: pointer;
  }

  .apple-card-viewer {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    height: 90vh;
    max-width: 1200px;
    max-height: 800px;
    background: var(--viewer-bg, #1a1a1a);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(40px);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    /* GPU acceleration */
    will-change: transform, opacity;
    transform-origin: center;
  }

  .viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(20px);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .control-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .control-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  .control-button.active {
    background: #007AFF;
    border-color: #007AFF;
  }
  
  .card-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary, #fff);
    margin: 0;
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .viewer-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  
  .card-display {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    perspective: 1000px;
  }
  
  .holographic-card-3d {
    position: relative;
    width: 400px;
    height: 560px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    transition: transform 0.1s ease-out;
    transform-style: preserve-3d;
    cursor: grab;
  }
  
  .holographic-card-3d:active {
    cursor: grabbing;
  }
  
  .card-image-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .placeholder-card {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--card-placeholder-bg, #2a2a2a);
    color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  }
  
  .placeholder-card p {
    margin: 16px 0 0 0;
    font-size: 18px;
    font-weight: 500;
  }

  .holographic-effect-3d {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: holographic-3d-shimmer 4s ease-in-out infinite;
    mix-blend-mode: overlay;
  }
  
  @keyframes holographic-3d-shimmer {
    0%, 100% { 
      background-position: 0% 0%; 
      opacity: 0.3;
    }
    50% { 
      background-position: 100% 100%; 
      opacity: 0.7;
    }
  }

  .interactive-hotspot {
    position: absolute;
    width: 24px;
    height: 24px;
    cursor: pointer;
    z-index: 2;
  }
  
  .hotspot-pulse {
    width: 100%;
    height: 100%;
    background: #007AFF;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  .hotspot-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  .interactive-hotspot:hover .hotspot-tooltip {
    opacity: 1;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }

  .card-info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 40px 24px 24px;
    color: white;
  }
  
  .card-description {
    font-size: 16px;
    line-height: 1.5;
    margin: 0 0 16px 0;
    opacity: 0.9;
  }
  
  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(10px);
  }

  .side-panel {
    width: 320px;
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    font-weight: 500;
  }
  
  .action-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .action-button.liked {
    color: #FF3B30;
    border-color: #FF3B30;
    background: rgba(255, 59, 48, 0.1);
  }
  
  .action-button.bookmarked {
    color: #FF9500;
    border-color: #FF9500;
    background: rgba(255, 149, 0, 0.1);
  }
  
  .action-button.active {
    background: #007AFF;
    border-color: #007AFF;
  }

  .stats-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
  }
  
  .stats-panel h3 {
    color: var(--text-primary, #fff);
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary, #fff);
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .comments-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
  }
  
  .comments-panel h3 {
    color: var(--text-primary, #fff);
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  
  .add-comment {
    margin-bottom: 20px;
  }
  
  .comment-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    color: var(--text-primary, #fff);
    font-size: 14px;
    resize: vertical;
    margin-bottom: 8px;
  }
  
  .comment-input::placeholder {
    color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  }
  
  .post-comment-button {
    background: #007AFF;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .post-comment-button:hover:not(:disabled) {
    background: #0056CC;
  }
  
  .post-comment-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .comments-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .comment-item {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .comment-item:last-child {
    border-bottom: none;
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .comment-user {
    font-weight: 600;
    color: var(--text-primary, #fff);
    font-size: 14px;
  }
  
  .comment-time {
    font-size: 12px;
    color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  }
  
  .comment-content {
    color: var(--text-primary, #fff);
    font-size: 14px;
    line-height: 1.4;
    margin: 0 0 8px 0;
  }
  
  .comment-actions {
    display: flex;
    align-items: center;
  }
  
  .comment-like {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.2s ease;
  }
  
  .comment-like:hover {
    color: var(--text-primary, #fff);
  }

  .share-menu {
    position: absolute;
    top: 80px;
    right: 24px;
    width: 300px;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }
  
  .share-menu-content h3 {
    color: var(--text-primary, #fff);
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  
  .share-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
    font-weight: 500;
  }
  
  .share-option:hover {
    background: var(--option-color, rgba(255, 255, 255, 0.1));
    border-color: var(--option-color, rgba(255, 255, 255, 0.2));
    transform: translateY(-2px);
  }
  
  .share-icon {
    font-size: 24px;
  }
  
  .embed-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 16px;
  }
  
  .embed-section h4 {
    color: var(--text-primary, #fff);
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  .embed-code {
    width: 100%;
    height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px;
    color: var(--text-primary, #fff);
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 11px;
    resize: none;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .apple-card-viewer {
      width: 95vw;
      height: 95vh;
    }
    
    .viewer-content {
      flex-direction: column;
    }
    
    .card-display {
      padding: 20px;
    }
    
    .holographic-card-3d {
      width: 300px;
      height: 420px;
    }
    
    .side-panel {
      width: 100%;
      max-height: 300px;
    }
  }
  
  @media (max-width: 768px) {
    .viewer-header {
      padding: 16px 20px;
    }
    
    .card-title {
      font-size: 20px;
      max-width: 200px;
    }
    
    .holographic-card-3d {
      width: 250px;
      height: 350px;
    }
    
    .share-menu {
      right: 20px;
      width: 280px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .holographic-card-3d,
    .holographic-effect-3d,
    .control-button,
    .action-button {
      transition: none;
      animation: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .apple-card-viewer {
      border: 2px solid #fff;
    }
    
    .control-button,
    .action-button {
      border: 2px solid rgba(255, 255, 255, 0.5);
    }
  }
</style>