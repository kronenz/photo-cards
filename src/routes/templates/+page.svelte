<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import KBOCardCreator from '$lib/components/KBOCardCreator.svelte';
  import type { GloryMomentTemplate, KBOTeam, EmotionIcon, FamousQuote, KBOCheerSound } from '$lib/data/kboTemplates.js';
  
  // 상태 관리
  let showSuccessMessage = false;
  let successMessage = '';
  let createdCards: any[] = [];
  
  // 카드 생성 완료 처리
  function handleCardCreated(event: CustomEvent) {
    const cardData = event.detail;
    createdCards = [...createdCards, cardData];
    showMessage('🎉 홀로그래픽 카드가 성공적으로 생성되었습니다!');
    
    // 로컬 스토리지에 저장
    if (browser) {
      localStorage.setItem('kbo-created-cards', JSON.stringify(createdCards));
    }
  }
  
  // 단계 변경 처리
  function handleStepChanged(event: CustomEvent<string>) {
    console.log('Current step:', event.detail);
  }
  
  // 성공 메시지 표시
  function showMessage(message: string) {
    successMessage = message;
    showSuccessMessage = true;
    
    setTimeout(() => {
      showSuccessMessage = false;
    }, 4000);
  }
  
  // 로컬 스토리지에서 생성된 카드 복원
  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem('kbo-created-cards');
      if (saved) {
        try {
          createdCards = JSON.parse(saved);
        } catch (error) {
          console.error('Failed to load created cards:', error);
        }
      }
    }
  });
</script>

<svelte:head>
  <title>영광의 순간 템플릿 - KBO 홀로그래픽 카드</title>
  <meta name="description" content="KBO 야구의 특별한 순간을 홀로그래픽 카드로 만들어보세요. 우승, 끝내기, 데뷔 등 다양한 템플릿을 제공합니다." />
</svelte:head>

<!-- 성공 메시지 -->
{#if showSuccessMessage}
  <div class="success-message">
    <div class="message-content">
      <span class="message-icon">✅</span>
      <span class="message-text">{successMessage}</span>
    </div>
  </div>
{/if}

<!-- KBO 카드 크리에이터 -->
<KBOCardCreator
  on:cardCreated={handleCardCreated}
  on:stepChanged={handleStepChanged}
/>

<!-- 생성된 카드 갤러리 -->
{#if createdCards.length > 0}
  <div class="created-cards-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-icon">🎨</span>
        생성된 카드 ({createdCards.length})
      </h2>
      <p class="section-description">
        지금까지 생성한 홀로그래픽 카드들을 확인하세요
      </p>
    </div>
    
    <div class="cards-grid">
      {#each createdCards as card, index (index)}
        <div class="card-preview">
          <div class="card-thumbnail">
            <div 
              class="thumbnail-background"
              style="background: {card.template.style.background.value};"
            >
              <div class="thumbnail-overlay">
                <h4>{card.template.name}</h4>
                {#if card.team}
                  <p style="color: {card.team.colors.primary}">{card.team.name}</p>
                {/if}
              </div>
            </div>
          </div>
          
          <div class="card-info">
            <h5 class="card-title">{card.template.name}</h5>
            <div class="card-meta">
              {#if card.team}
                <span class="meta-item" style="color: {card.team.colors.primary}">
                  {card.team.name}
                </span>
              {/if}
              {#if card.media.length > 0}
                <span class="meta-item">
                  📁 {card.media.length}개 파일
                </span>
              {/if}
              {#if card.emotion}
                <span class="meta-item">
                  {card.emotion.icon} {card.emotion.name}
                </span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  /* 성공 메시지 */
  .success-message {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--apple-accent-green);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: var(--apple-shadow-lg);
    animation: slideIn 0.3s ease-out;
  }
  
  .message-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .message-icon {
    font-size: 16px;
  }
  
  .message-text {
    font-size: 14px;
    font-weight: 500;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  /* 생성된 카드 섹션 */
  .created-cards-section {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .section-description {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0;
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  /* 큰 화면에서 적절한 카드 크기 유지 */
  @media (min-width: 1400px) {
    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
  }
  
  .card-preview {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
    cursor: pointer;
  }
  
  .card-preview:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .card-thumbnail {
    aspect-ratio: 3/4;
    overflow: hidden;
  }
  
  .thumbnail-background {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .thumbnail-overlay {
    text-align: center;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    padding: 20px;
  }
  
  .thumbnail-overlay h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
  }
  
  .thumbnail-overlay p {
    font-size: 14px;
    margin: 0;
    font-weight: 500;
  }
  
  .card-info {
    padding: 16px;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 8px;
  }
  
  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .meta-item {
    font-size: 12px;
    background: var(--apple-surface-secondary);
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .created-cards-section {
      padding: 0 16px;
    }
    
    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .section-title {
      font-size: 24px;
    }
  }

</style>