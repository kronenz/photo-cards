<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { Collection, CollectionType } from '$lib/types/collections';
  import { COLLECTION_TYPE_CONFIG } from '$lib/types/collections';
  
  // Props
  export let collection: Collection;
  export let show: boolean = false;
  export let autoHide: boolean = true;
  export let duration: number = 5000;
  
  const dispatch = createEventDispatcher<{
    close: void;
    viewCollection: Collection;
    shareAchievement: Collection;
  }>();
  
  let celebrationElement: HTMLDivElement;
  let confettiContainer: HTMLDivElement;
  let mounted = false;
  
  onMount(() => {
    mounted = true;
    
    if (show) {
      startCelebration();
    }
    
    return () => {
      // Cleanup any running animations
    };
  });
  
  $: if (show && mounted) {
    startCelebration();
  }
  
  $: typeConfig = COLLECTION_TYPE_CONFIG[collection.type as CollectionType] || COLLECTION_TYPE_CONFIG.season;
  
  function startCelebration() {
    if (!celebrationElement) return;
    
    // Create confetti effect
    createConfetti();
    
    // Auto-hide after duration
    if (autoHide) {
      setTimeout(() => {
        handleClose();
      }, duration);
    }
  }
  
  function createConfetti() {
    if (!confettiContainer) return;
    
    // Clear existing confetti
    confettiContainer.innerHTML = '';
    
    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      
      // Random colors
      const colors = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#5856d6', '#ff2d92'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random properties
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 3;
      const animationDuration = 3 + Math.random() * 2;
      
      confetti.style.cssText = `
        left: ${left}%;
        background-color: ${color};
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
      `;
      
      confettiContainer.appendChild(confetti);
    }
  }
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleViewCollection() {
    dispatch('viewCollection', collection);
  }
  
  function handleShareAchievement() {
    dispatch('shareAchievement', collection);
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if show}
  <!-- Backdrop -->
  <div 
    class="celebration-backdrop"
    on:click={handleClose}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
  ></div>
  
  <!-- Celebration Modal -->
  <div 
    class="celebration-modal"
    bind:this={celebrationElement}
    role="dialog"
    aria-labelledby="celebration-title"
    aria-describedby="celebration-description"
  >
    <!-- Confetti Container -->
    <div class="confetti-container" bind:this={confettiContainer}></div>
    
    <!-- Close Button -->
    <button 
      class="close-button"
      on:click={handleClose}
      aria-label="축하 메시지 닫기"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    
    <!-- Celebration Content -->
    <div class="celebration-content">
      <!-- Trophy Icon -->
      <div class="trophy-container">
        <div class="trophy-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="trophy-glow"></div>
      </div>
      
      <!-- Collection Badge -->
      <div class="collection-badge" style="--type-color: {typeConfig.color}">
        <span class="collection-icon">{typeConfig.icon}</span>
        <span class="collection-type">{typeConfig.koreanName}</span>
      </div>
      
      <!-- Celebration Text -->
      <div class="celebration-text">
        <h2 id="celebration-title" class="celebration-title">
          축하합니다! 🎉
        </h2>
        <p id="celebration-description" class="celebration-description">
          <strong>{collection.name}</strong> 컬렉션을 완성했습니다!
        </p>
        <div class="collection-stats">
          <div class="stat-item">
            <span class="stat-number">{collection.totalCards}</span>
            <span class="stat-label">카드 수집</span>
          </div>
          <div class="stat-divider">•</div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">완성도</span>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="celebration-actions">
        <button 
          class="action-button primary"
          on:click={handleViewCollection}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          컬렉션 보기
        </button>
        
        <button 
          class="action-button secondary"
          on:click={handleShareAchievement}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          자랑하기
        </button>
      </div>
      
      <!-- Achievement Badge Preview -->
      <div class="achievement-preview">
        <div class="achievement-badge">
          <div class="badge-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/>
            </svg>
          </div>
          <div class="badge-text">
            <div class="badge-title">컬렉션 마스터</div>
            <div class="badge-subtitle">{collection.name}</div>
          </div>
        </div>
        <p class="achievement-description">
          새로운 배지를 획득했습니다!
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Backdrop */
  .celebration-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    animation: backdrop-fade-in 0.3s ease-out;
  }
  
  @keyframes backdrop-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  /* Celebration Modal */
  .celebration-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 480px;
    background: var(--apple-surface-primary);
    border-radius: var(--apple-radius-2xl);
    box-shadow: var(--apple-shadow-2xl);
    z-index: 1001;
    overflow: hidden;
    animation: modal-slide-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  @keyframes modal-slide-in {
    from { 
      opacity: 0; 
      transform: translate(-50%, -50%) scale(0.8) translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1) translateY(0); 
    }
  }
  
  /* Confetti */
  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }
  
  :global(.confetti-piece) {
    position: absolute;
    width: 8px;
    height: 8px;
    top: -10px;
    animation: confetti-fall linear infinite;
  }
  
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  
  /* Close Button */
  .close-button {
    position: absolute;
    top: var(--apple-spacing-md);
    right: var(--apple-spacing-md);
    width: 32px;
    height: 32px;
    background: var(--apple-surface-secondary);
    border: none;
    border-radius: var(--apple-radius-full);
    color: var(--apple-text-secondary);
    cursor: pointer;
    transition: all var(--apple-transition-fast);
    z-index: 10;
  }
  
  .close-button:hover {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
    transform: scale(1.1);
  }
  
  .close-button svg {
    width: 16px;
    height: 16px;
  }
  
  /* Celebration Content */
  .celebration-content {
    padding: var(--apple-spacing-2xl);
    text-align: center;
    position: relative;
  }
  
  /* Trophy */
  .trophy-container {
    position: relative;
    display: inline-block;
    margin-bottom: var(--apple-spacing-lg);
  }
  
  .trophy-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    border-radius: var(--apple-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b8860b;
    animation: trophy-bounce 2s infinite;
    position: relative;
    z-index: 2;
  }
  
  .trophy-icon svg {
    width: 40px;
    height: 40px;
  }
  
  .trophy-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent);
    border-radius: var(--apple-radius-full);
    animation: trophy-glow 2s infinite alternate;
  }
  
  @keyframes trophy-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes trophy-glow {
    0% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
  }
  
  /* Collection Badge */
  .collection-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--apple-spacing-xs);
    background: color-mix(in srgb, var(--type-color) 10%, transparent);
    color: var(--type-color);
    padding: var(--apple-spacing-xs) var(--apple-spacing-md);
    border-radius: var(--apple-radius-full);
    font-size: var(--apple-font-size-callout);
    font-weight: 600;
    margin-bottom: var(--apple-spacing-lg);
    border: 1px solid color-mix(in srgb, var(--type-color) 20%, transparent);
  }
  
  .collection-icon {
    font-size: var(--apple-font-size-headline);
  }
  
  /* Celebration Text */
  .celebration-title {
    font-size: var(--apple-font-size-title1);
    font-weight: 700;
    color: var(--apple-text-primary);
    margin: 0 0 var(--apple-spacing-md);
    letter-spacing: -0.02em;
  }
  
  .celebration-description {
    font-size: var(--apple-font-size-body);
    color: var(--apple-text-secondary);
    margin: 0 0 var(--apple-spacing-lg);
    line-height: 1.5;
  }
  
  .celebration-description strong {
    color: var(--apple-text-primary);
    font-weight: 600;
  }
  
  /* Collection Stats */
  .collection-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--apple-spacing-md);
    margin-bottom: var(--apple-spacing-xl);
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  
  .stat-number {
    font-size: var(--apple-font-size-title2);
    font-weight: 700;
    color: var(--apple-accent-blue);
  }
  
  .stat-label {
    font-size: var(--apple-font-size-footnote);
    color: var(--apple-text-secondary);
  }
  
  .stat-divider {
    color: var(--apple-text-tertiary);
    font-size: var(--apple-font-size-title2);
  }
  
  /* Action Buttons */
  .celebration-actions {
    display: flex;
    gap: var(--apple-spacing-md);
    margin-bottom: var(--apple-spacing-xl);
  }
  
  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--apple-spacing-xs);
    padding: var(--apple-spacing-md) var(--apple-spacing-lg);
    border-radius: var(--apple-radius-md);
    font-size: var(--apple-font-size-callout);
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all var(--apple-transition-fast);
    font-family: inherit;
  }
  
  .action-button svg {
    width: 18px;
    height: 18px;
  }
  
  .action-button.primary {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .action-button.primary:hover {
    background: var(--apple-accent-blue-dark);
    transform: translateY(-1px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .action-button.secondary {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    border: 1px solid var(--apple-surface-border);
  }
  
  .action-button.secondary:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-1px);
  }
  
  .action-button:active {
    transform: scale(0.95);
  }
  
  /* Achievement Preview */
  .achievement-preview {
    padding-top: var(--apple-spacing-lg);
    border-top: 1px solid var(--apple-surface-border);
  }
  
  .achievement-badge {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
    background: var(--apple-surface-secondary);
    padding: var(--apple-spacing-md);
    border-radius: var(--apple-radius-lg);
    margin-bottom: var(--apple-spacing-sm);
  }
  
  .badge-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--apple-accent-purple), var(--apple-accent-pink));
    border-radius: var(--apple-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .badge-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .badge-text {
    flex: 1;
    text-align: left;
  }
  
  .badge-title {
    font-size: var(--apple-font-size-callout);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: 2px;
  }
  
  .badge-subtitle {
    font-size: var(--apple-font-size-footnote);
    color: var(--apple-text-secondary);
  }
  
  .achievement-description {
    font-size: var(--apple-font-size-footnote);
    color: var(--apple-text-tertiary);
    margin: 0;
    text-align: center;
  }
  
  /* Responsive Design */
  @media (max-width: 480px) {
    .celebration-modal {
      width: 95%;
      margin: 0 auto;
    }
    
    .celebration-content {
      padding: var(--apple-spacing-xl) var(--apple-spacing-lg);
    }
    
    .trophy-icon {
      width: 64px;
      height: 64px;
    }
    
    .trophy-icon svg {
      width: 32px;
      height: 32px;
    }
    
    .celebration-title {
      font-size: var(--apple-font-size-title2);
    }
    
    .celebration-actions {
      flex-direction: column;
    }
    
    .collection-stats {
      gap: var(--apple-spacing-sm);
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .celebration-backdrop {
      background: rgba(0, 0, 0, 0.8);
    }
    
    .trophy-glow {
      background: radial-gradient(circle, rgba(255, 215, 0, 0.2), transparent);
    }
    
    .action-button.secondary {
      background: var(--apple-surface-secondary);
      border-color: var(--apple-surface-border);
    }
    
    .achievement-badge {
      background: var(--apple-surface-secondary);
    }
  }
  
  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .celebration-modal {
      animation: none;
    }
    
    .trophy-icon {
      animation: none;
    }
    
    .trophy-glow {
      animation: none;
    }
    
    :global(.confetti-piece) {
      animation: none;
    }
  }
</style>