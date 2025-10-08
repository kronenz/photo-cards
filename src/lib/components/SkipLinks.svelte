<!--
  Skip Links Component
  
  Feature: 002-integrated-holographic-platform
  Task: T053 [US5]
  
  Purpose: Provide keyboard navigation shortcuts for main page sections
  - Skip to collection
  - Skip to feed
  - Skip to teams
  - Skip to main content
  - Accessibility compliance (WCAG 2.1 AA)
-->

<script lang="ts">
  import { onMount } from 'svelte';

  // Skip link targets
  const skipTargets = [
    {
      id: 'skip-to-collection',
      label: '컬렉션으로 건너뛰기',
      target: 'main-collection',
      description: '사용자의 카드 컬렉션 섹션으로 이동'
    },
    {
      id: 'skip-to-feed',
      label: '피드로 건너뛰기',
      target: 'main-feed',
      description: '커뮤니티 피드 섹션으로 이동'
    },
    {
      id: 'skip-to-teams',
      label: '팀 섹션으로 건너뛰기',
      target: 'main-teams',
      description: 'KBO 팀 선택 섹션으로 이동'
    },
    {
      id: 'skip-to-main',
      label: '메인 콘텐츠로 건너뛰기',
      target: 'main-content',
      description: '페이지의 주요 콘텐츠 영역으로 이동'
    }
  ];

  let isVisible = false;
  let focusedIndex = -1;

  // Show skip links on Tab key press
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab' && !isVisible) {
      isVisible = true;
    }
  }

  // Hide skip links when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (isVisible && !event.target?.closest('.skip-links')) {
      isVisible = false;
      focusedIndex = -1;
    }
  }

  // Handle skip link activation
  function handleSkipLink(event: Event, targetId: string) {
    event.preventDefault();
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Focus the target element
      targetElement.focus();
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Add visual focus indicator
      targetElement.classList.add('skip-target-focused');
      setTimeout(() => {
        targetElement.classList.remove('skip-target-focused');
      }, 2000);
    }
    
    // Hide skip links after activation
    isVisible = false;
    focusedIndex = -1;
  }

  // Handle keyboard navigation within skip links
  function handleSkipKeydown(event: KeyboardEvent, index: number) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, skipTargets.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSkipLink(event, skipTargets[index].target);
        break;
      case 'Escape':
        isVisible = false;
        focusedIndex = -1;
        break;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<!-- Skip Links Container -->
{#if isVisible}
  <div class="skip-links" role="navigation" aria-label="페이지 내 주요 섹션으로 건너뛰기">
    <div class="skip-links-content">
      <h2 class="skip-links-title">빠른 이동</h2>
      <ul class="skip-links-list" role="list">
        {#each skipTargets as target, index}
          <li class="skip-links-item">
            <a
              href="#{target.target}"
              class="skip-link"
              class:focused={focusedIndex === index}
              on:click={(e) => handleSkipLink(e, target.target)}
              on:keydown={(e) => handleSkipKeydown(e, index)}
              aria-describedby="skip-description-{index}"
            >
              {target.label}
            </a>
            <span 
              id="skip-description-{index}" 
              class="skip-description"
              aria-hidden="true"
            >
              {target.description}
            </span>
          </li>
        {/each}
      </ul>
      <button 
        class="skip-close"
        on:click={() => { isVisible = false; focusedIndex = -1; }}
        aria-label="건너뛰기 링크 닫기"
      >
        ✕
      </button>
    </div>
  </div>
{/if}

<style>
  .skip-links {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease-out;
  }

  .skip-links-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .skip-links-title {
    color: white;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
  }

  .skip-links-list {
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
    flex-wrap: wrap;
  }

  .skip-links-item {
    position: relative;
  }

  .skip-link {
    display: inline-block;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .skip-link:hover {
    background: linear-gradient(135deg, #0051d5 0%, #003d99 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }

  .skip-link:focus {
    outline: none;
    border-color: #ffd60a;
    box-shadow: 0 0 0 3px rgba(255, 214, 10, 0.3);
  }

  .skip-link.focused {
    background: linear-gradient(135deg, #ffd60a 0%, #ffcc00 100%);
    color: #000;
    border-color: #ffd60a;
    box-shadow: 0 0 0 3px rgba(255, 214, 10, 0.3);
  }

  .skip-description {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    z-index: 10001;
    white-space: nowrap;
  }

  .skip-link:hover .skip-description,
  .skip-link.focused .skip-description {
    opacity: 1;
    transform: translateY(0);
  }

  .skip-close {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    margin-left: auto;
  }

  .skip-close:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .skip-close:focus {
    outline: none;
    border-color: #ffd60a;
    box-shadow: 0 0 0 2px rgba(255, 214, 10, 0.3);
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Skip target focus styles */
  :global(.skip-target-focused) {
    outline: 3px solid #ffd60a !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 6px rgba(255, 214, 10, 0.3) !important;
    transition: all 0.3s ease !important;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .skip-links-content {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .skip-links-list {
      justify-content: center;
    }

    .skip-link {
      font-size: 0.8rem;
      padding: 0.625rem 1rem;
    }

    .skip-close {
      align-self: center;
      margin-left: 0;
    }
  }

  @media (max-width: 480px) {
    .skip-links-list {
      flex-direction: column;
      gap: 0.5rem;
    }

    .skip-link {
      text-align: center;
    }
  }
</style>
