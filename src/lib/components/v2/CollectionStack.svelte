<script lang="ts">
  import { onMount } from 'svelte';
  import UnifiedCard from './UnifiedCard.svelte';

  export let title: string = "2024 시즌 레전드";
  export let description: string = "전설적인 선수들의 특별한 컬렉션";
  export let cards: Array<{
    image: string;
    title: string;
    subtitle: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    team: 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
    number: string;
  }> = [];
  export let progress: number = 0; // 0-100
  export let totalCards: number = cards.length;
  export let collectedCards: number = Math.floor(cards.length * (progress / 100));

  let isExpanded = false;
  let focusedCardIndex: number | null = null;

  onMount(() => {
    const handleGlobalEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && focusedCardIndex !== null) {
        unfocusCard();
      }
    };

    window.addEventListener('keydown', handleGlobalEscape);

    return () => {
      window.removeEventListener('keydown', handleGlobalEscape);
    };
  });

  function toggleExpand() {
    isExpanded = !isExpanded;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  }

  function focusCard(index: number, event: Event) {
    if (!isExpanded) return;
    event.stopPropagation();

    // 이미 포커스된 카드를 다시 클릭하면 닫기
    if (focusedCardIndex === index) {
      focusedCardIndex = null;
    } else {
      focusedCardIndex = index;
    }
  }

  function unfocusCard(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    focusedCardIndex = null;
  }

  function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && focusedCardIndex !== null) {
      unfocusCard();
    }
  }
</script>

<div class="collection-container">
  <!-- Collection Header -->
  <div class="collection-header">
    <div class="collection-info">
      <h3 class="collection-title">{title}</h3>
      <p class="collection-description">{description}</p>
      <div class="collection-stats">
        <div class="stat">
          <span class="stat-value">{collectedCards}/{totalCards}</span>
          <span class="stat-label">카드</span>
        </div>
        <div class="stat">
          <span class="stat-value">{progress}%</span>
          <span class="stat-label">완성도</span>
        </div>
      </div>
    </div>
    <div class="progress-ring">
      <svg viewBox="0 0 120 120" class="progress-svg">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          stroke-width="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#gradient)"
          stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray="339.292"
          stroke-dashoffset={339.292 - (339.292 * progress) / 100}
          transform="rotate(-90 60 60)"
          class="progress-circle"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00f0ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
      <div class="progress-text">{progress}%</div>
    </div>
  </div>

  <!-- Card Stack -->
  <div
    class="card-stack"
    class:expanded={isExpanded}
    on:click={toggleExpand}
    on:keydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-label={isExpanded ? '컬렉션 접기' : '컬렉션 펼치기'}
    aria-expanded={isExpanded}
  >
    {#each cards as card, i}
      <div
        class="card-wrapper"
        style="--index: {i}; --total: {cards.length}"
        class:active={isExpanded}
        class:focused={focusedCardIndex === i}
        on:click={(e) => focusCard(i, e)}
        on:keydown={(e) => {
          if (e.key === 'Enter' && isExpanded) {
            focusCard(i, e);
          }
        }}
      >
        <UnifiedCard
          image={card.image}
          title={card.title}
          subtitle={card.subtitle}
          rarity={card.rarity}
          team={card.team}
          number={card.number}
          size={focusedCardIndex === i ? "featured" : "medium"}
        />
      </div>
    {/each}

    <!-- Expand Button Overlay -->
    {#if !isExpanded}
      <div class="expand-overlay">
        <div class="expand-button">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>컬렉션 보기</span>
        </div>
      </div>
    {/if}
  </div>
</div>


<style>
  .collection-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .collection-container:hover {
    border-color: rgba(0, 240, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 240, 255, 0.1);
  }

  /* Collection Header */
  .collection-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 2rem;
  }

  .collection-info {
    flex: 1;
  }

  .collection-title {
    font-family: 'Pretendard Variable', 'Gmarket Sans Bold', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, #00f0ff, #a855f7);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .collection-description {
    font-size: 1rem;
    color: #b4b4be;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .collection-stats {
    display: flex;
    gap: 2rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #00f0ff;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #777785;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Progress Ring */
  .progress-ring {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }

  .progress-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 12px rgba(0, 240, 255, 0.3));
  }

  .progress-circle {
    transition: stroke-dashoffset 1s ease;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  /* Card Stack */
  .card-stack {
    position: relative;
    min-height: 450px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: min-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-stack.expanded {
    min-height: 500px;
    cursor: default;
  }

  .card-wrapper {
    position: absolute;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    cursor: pointer;
  }

  .card-wrapper.focused {
    z-index: 10000 !important;
    transform: translateX(0) translateY(-30px) scale(1.35) !important;
    pointer-events: auto;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8));
  }

  .card-stack.expanded .card-wrapper:hover {
    transform: translateX(var(--hover-x, 0)) translateY(-10px) rotate(0deg) scale(1.05);
    z-index: 1000;
  }

  .card-stack.expanded .card-wrapper:nth-child(1):hover {
    --hover-x: -420px;
  }
  .card-stack.expanded .card-wrapper:nth-child(2):hover {
    --hover-x: -280px;
  }
  .card-stack.expanded .card-wrapper:nth-child(3):hover {
    --hover-x: -140px;
  }
  .card-stack.expanded .card-wrapper:nth-child(4):hover {
    --hover-x: 0px;
  }
  .card-stack.expanded .card-wrapper:nth-child(5):hover {
    --hover-x: 140px;
  }
  .card-stack.expanded .card-wrapper:nth-child(6):hover {
    --hover-x: 280px;
  }
  .card-stack.expanded .card-wrapper:nth-child(7):hover {
    --hover-x: 420px;
  }

  /* Stacked State */
  .card-stack:not(.expanded) .card-wrapper {
    transform:
      translateX(calc(var(--index) * 8px))
      translateY(calc(var(--index) * -8px))
      rotate(calc(var(--index) * 2deg))
      scale(calc(1 - var(--index) * 0.03));
    z-index: calc(var(--total) - var(--index));
  }

  .card-stack:not(.expanded) .card-wrapper:nth-child(1) {
    filter: brightness(1);
  }

  .card-stack:not(.expanded) .card-wrapper:nth-child(2) {
    filter: brightness(0.95);
  }

  .card-stack:not(.expanded) .card-wrapper:nth-child(3) {
    filter: brightness(0.9);
  }

  .card-stack:not(.expanded) .card-wrapper:nth-child(n+4) {
    filter: brightness(0.85);
  }

  /* Hover Effect on Stack */
  .card-stack:not(.expanded):hover .card-wrapper {
    transform:
      translateX(calc(var(--index) * 12px))
      translateY(calc(var(--index) * -10px))
      rotate(calc(var(--index) * 3deg))
      scale(calc(1 - var(--index) * 0.02));
  }

  /* Expanded State - Fan Layout */
  .card-stack.expanded .card-wrapper {
    pointer-events: auto;
    z-index: calc(var(--total) - var(--index));
  }

  .card-stack.expanded .card-wrapper:nth-child(1) {
    transform: translateX(-420px) translateY(0) rotate(0deg);
  }

  .card-stack.expanded .card-wrapper:nth-child(2) {
    transform: translateX(-280px) translateY(0) rotate(0deg);
  }

  .card-stack.expanded .card-wrapper:nth-child(3) {
    transform: translateX(-140px) translateY(0) rotate(0deg);
  }

  .card-stack.expanded .card-wrapper:nth-child(4) {
    transform: translateX(0px) translateY(0) rotate(0deg);
  }

  .card-stack.expanded .card-wrapper:nth-child(5) {
    transform: translateX(140px) translateY(0) rotate(0deg);
  }

  .card-stack.expanded .card-wrapper:nth-child(6) {
    transform: translateX(280px) translateY(0) rotate(0deg);
  }

  .card-stack.expanded .card-wrapper:nth-child(7) {
    transform: translateX(420px) translateY(0) rotate(0deg);
  }

  /* Expand Overlay */
  .expand-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card-stack:not(.expanded):hover .expand-overlay {
    opacity: 1;
  }

  .expand-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 2rem;
    background: rgba(0, 240, 255, 0.9);
    color: #0a0a0f;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 1.125rem;
    box-shadow:
      0 8px 32px rgba(0, 240, 255, 0.4),
      0 0 0 3px rgba(0, 240, 255, 0.2);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow:
        0 8px 32px rgba(0, 240, 255, 0.4),
        0 0 0 3px rgba(0, 240, 255, 0.2);
    }
    50% {
      box-shadow:
        0 8px 48px rgba(0, 240, 255, 0.6),
        0 0 0 6px rgba(0, 240, 255, 0.4);
    }
  }

  .expand-button svg {
    animation: rotate-pulse 2s ease-in-out infinite;
  }

  @keyframes rotate-pulse {
    0%, 100% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(90deg) scale(1.1);
    }
  }

  /* Responsive */
  @media (max-width: 1400px) {
    .card-stack.expanded .card-wrapper:nth-child(1) {
      transform: translateX(-350px) translateY(0) rotate(0deg);
    }
    .card-stack.expanded .card-wrapper:nth-child(2) {
      transform: translateX(-233px) translateY(0) rotate(0deg);
    }
    .card-stack.expanded .card-wrapper:nth-child(3) {
      transform: translateX(-116px) translateY(0) rotate(0deg);
    }
    .card-stack.expanded .card-wrapper:nth-child(5) {
      transform: translateX(116px) translateY(0) rotate(0deg);
    }
    .card-stack.expanded .card-wrapper:nth-child(6) {
      transform: translateX(233px) translateY(0) rotate(0deg);
    }
    .card-stack.expanded .card-wrapper:nth-child(7) {
      transform: translateX(350px) translateY(0) rotate(0deg);
    }
  }

  @media (max-width: 1200px) {
    .card-stack.expanded {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      min-height: auto;
    }

    .card-stack.expanded .card-wrapper {
      position: relative;
      transform: none !important;
    }
  }

  @media (max-width: 768px) {
    .collection-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .collection-stats {
      justify-content: center;
    }

    .card-stack.expanded {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .card-stack.expanded {
      grid-template-columns: 1fr;
    }
  }

  /* Accessibility */
  .card-stack:focus-visible {
    outline: 3px solid #00f0ff;
    outline-offset: 4px;
    border-radius: 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-wrapper {
      transition: none !important;
    }

    .expand-button {
      animation: none !important;
    }

    .expand-button svg {
      animation: none !important;
    }
  }

  /* Focused Card - Dimmed background for other cards */
  .card-stack.expanded .card-wrapper:not(.focused) {
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-stack.expanded:has(.card-wrapper.focused) .card-wrapper:not(.focused) {
    opacity: 0.3;
    filter: brightness(0.5);
    pointer-events: none;
  }
</style>
