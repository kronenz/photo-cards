<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EmotionIcon, FamousQuote } from '../data/kboTemplates.js';
  import { EMOTION_ICONS, FAMOUS_QUOTES } from '../data/kboTemplates.js';
  
  // Props
  export let selectedEmotion: EmotionIcon | null = null;
  export let selectedQuote: FamousQuote | null = null;
  export let showEmotions = true;
  export let showQuotes = true;
  export let teamFilter: string | null = null;
  
  // 상태 관리
  let activeTab: 'emotions' | 'quotes' = 'emotions';
  let customQuoteText = '';
  let customQuoteAuthor = '';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    emotionSelected: EmotionIcon;
    quoteSelected: FamousQuote;
    customQuoteAdded: { text: string; author: string };
    overlayRemoved: { type: 'emotion' | 'quote' };
  }>();
  
  // 필터링된 명언 목록
  $: filteredQuotes = FAMOUS_QUOTES.filter(quote => 
    !teamFilter || quote.team === teamFilter || quote.team === undefined
  );
  
  // 감정 선택
  function selectEmotion(emotion: EmotionIcon) {
    selectedEmotion = emotion;
    dispatch('emotionSelected', emotion);
  }
  
  // 명언 선택
  function selectQuote(quote: FamousQuote) {
    selectedQuote = quote;
    dispatch('quoteSelected', quote);
  }
  
  // 커스텀 명언 추가
  function addCustomQuote() {
    if (customQuoteText.trim() && customQuoteAuthor.trim()) {
      const customQuote: FamousQuote = {
        id: `custom-${Date.now()}`,
        text: customQuoteText.trim(),
        author: customQuoteAuthor.trim(),
        context: '사용자 추가 명언',
        category: 'fan',
        team: teamFilter || undefined
      };
      
      selectedQuote = customQuote;
      dispatch('customQuoteAdded', {
        text: customQuoteText.trim(),
        author: customQuoteAuthor.trim()
      });
      
      // 입력 필드 초기화
      customQuoteText = '';
      customQuoteAuthor = '';
    }
  }
  
  // 오버레이 제거
  function removeOverlay(type: 'emotion' | 'quote') {
    if (type === 'emotion') {
      selectedEmotion = null;
    } else {
      selectedQuote = null;
    }
    dispatch('overlayRemoved', { type });
  }
  
  // 감정 카테고리별 그룹화
  const emotionsByCategory = EMOTION_ICONS.reduce((acc, emotion) => {
    if (!acc[emotion.category]) {
      acc[emotion.category] = [];
    }
    acc[emotion.category].push(emotion);
    return acc;
  }, {} as Record<string, EmotionIcon[]>);
</script>

<div class="emotion-overlay">
  <!-- 탭 네비게이션 -->
  <div class="tab-navigation">
    {#if showEmotions}
      <button 
        class="tab-button"
        class:active={activeTab === 'emotions'}
        on:click={() => activeTab = 'emotions'}
      >
        <span class="tab-icon">😊</span>
        <span class="tab-label">감정 표현</span>
      </button>
    {/if}
    
    {#if showQuotes}
      <button 
        class="tab-button"
        class:active={activeTab === 'quotes'}
        on:click={() => activeTab = 'quotes'}
      >
        <span class="tab-icon">💬</span>
        <span class="tab-label">명언</span>
      </button>
    {/if}
  </div>
  
  <!-- 감정 표현 탭 -->
  {#if activeTab === 'emotions' && showEmotions}
    <div class="emotions-panel">
      <h3 class="panel-title">
        <span class="title-icon">😊</span>
        감정 표현 선택
      </h3>
      <p class="panel-description">
        카드에 담고 싶은 감정을 선택하세요
      </p>
      
      <!-- 선택된 감정 표시 -->
      {#if selectedEmotion}
        <div class="selected-emotion">
          <div class="emotion-preview">
            <span class="emotion-icon" style="color: {selectedEmotion.color}">
              {selectedEmotion.icon}
            </span>
            <div class="emotion-info">
              <div class="emotion-name">{selectedEmotion.name}</div>
              <div class="emotion-description">{selectedEmotion.description}</div>
            </div>
            <button 
              class="remove-button"
              on:click={() => removeOverlay('emotion')}
              title="감정 제거"
            >
              ✕
            </button>
          </div>
        </div>
      {/if}
      
      <!-- 감정 카테고리별 목록 -->
      <div class="emotions-grid">
        {#each Object.entries(emotionsByCategory) as [category, emotions]}
          <div class="emotion-category">
            <h4 class="category-title">{category}</h4>
            <div class="emotion-items">
              {#each emotions as emotion (emotion.id)}
                <button
                  class="emotion-item"
                  class:selected={selectedEmotion?.id === emotion.id}
                  on:click={() => selectEmotion(emotion)}
                  title={emotion.description}
                >
                  <span class="emotion-icon" style="color: {emotion.color}">
                    {emotion.icon}
                  </span>
                  <span class="emotion-label">{emotion.name}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- 명언 탭 -->
  {#if activeTab === 'quotes' && showQuotes}
    <div class="quotes-panel">
      <h3 class="panel-title">
        <span class="title-icon">💬</span>
        명언 선택
      </h3>
      <p class="panel-description">
        카드에 추가할 명언을 선택하거나 직접 입력하세요
      </p>
      
      <!-- 선택된 명언 표시 -->
      {#if selectedQuote}
        <div class="selected-quote">
          <div class="quote-preview">
            <div class="quote-text">"{selectedQuote.text}"</div>
            <div class="quote-author">- {selectedQuote.author}</div>
            <button 
              class="remove-button"
              on:click={() => removeOverlay('quote')}
              title="명언 제거"
            >
              ✕
            </button>
          </div>
        </div>
      {/if}
      
      <!-- 커스텀 명언 입력 -->
      <div class="custom-quote-section">
        <h4 class="section-title">직접 입력</h4>
        <div class="custom-quote-form">
          <textarea
            bind:value={customQuoteText}
            placeholder="명언을 입력하세요..."
            class="quote-input"
            rows="3"
            maxlength="200"
          ></textarea>
          <input
            bind:value={customQuoteAuthor}
            placeholder="작성자"
            class="author-input"
            maxlength="50"
          />
          <button 
            class="add-quote-button"
            on:click={addCustomQuote}
            disabled={!customQuoteText.trim() || !customQuoteAuthor.trim()}
          >
            명언 추가
          </button>
        </div>
      </div>
      
      <!-- 기존 명언 목록 -->
      <div class="quotes-list">
        <h4 class="section-title">추천 명언</h4>
        <div class="quote-items">
          {#each filteredQuotes as quote (quote.id)}
            <button
              class="quote-item"
              class:selected={selectedQuote?.id === quote.id}
              on:click={() => selectQuote(quote)}
            >
              <div class="quote-content">
                <div class="quote-text">"{quote.text}"</div>
                <div class="quote-meta">
                  <span class="quote-author">- {quote.author}</span>
                  <span class="quote-context">{quote.context}</span>
                </div>
              </div>
              <div class="quote-category">
                {#if quote.category === 'player'}
                  ⚾
                {:else if quote.category === 'coach'}
                  👨‍🏫
                {:else if quote.category === 'commentator'}
                  🎙️
                {:else}
                  👥
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .emotion-overlay {
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
  }
  
  /* 탭 네비게이션 */
  .tab-navigation {
    display: flex;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: none;
    border: none;
    color: var(--apple-text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .tab-button:hover {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
  }
  
  .tab-button.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  /* 패널 공통 스타일 */
  .emotions-panel,
  .quotes-panel {
    padding: 24px;
  }
  
  .panel-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 18px;
  }
  
  .panel-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0 0 24px;
    line-height: 1.5;
  }
  
  /* 선택된 항목 표시 */
  .selected-emotion,
  .selected-quote {
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-accent-blue);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .emotion-preview {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .emotion-preview .emotion-icon {
    font-size: 32px;
  }
  
  .emotion-info {
    flex: 1;
  }
  
  .emotion-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: 4px;
  }
  
  .emotion-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
  }
  
  .quote-preview {
    position: relative;
  }
  
  .quote-text {
    font-size: 16px;
    font-style: italic;
    color: var(--apple-text-primary);
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .quote-author {
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    text-align: right;
  }
  
  .remove-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--apple-accent-red);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .remove-button:hover {
    transform: scale(1.1);
  }
  
  /* 감정 그리드 */
  .emotions-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .emotion-category {
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    padding: 16px;
    background: var(--apple-surface-secondary);
  }
  
  .category-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 12px;
    text-transform: capitalize;
  }
  
  .emotion-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .emotion-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .emotion-item:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
  }
  
  .emotion-item.selected {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.1);
  }
  
  .emotion-item .emotion-icon {
    font-size: 24px;
  }
  
  .emotion-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-primary);
    text-align: center;
  }
  
  /* 커스텀 명언 섹션 */
  .custom-quote-section {
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0 0 12px;
  }
  
  .custom-quote-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .quote-input,
  .author-input {
    padding: 12px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: border-color var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .quote-input:focus,
  .author-input:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
  }
  
  .quote-input {
    min-height: 80px;
  }
  
  .add-quote-button {
    padding: 12px 20px;
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .add-quote-button:hover:not(:disabled) {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }
  
  .add-quote-button:disabled {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-secondary);
    cursor: not-allowed;
  }
  
  /* 명언 목록 */
  .quotes-list {
    border-top: 1px solid var(--apple-surface-border);
    padding-top: 24px;
  }
  
  .quote-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .quote-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .quote-item:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-1px);
  }
  
  .quote-item.selected {
    border-color: var(--apple-accent-blue);
    background: rgba(0, 122, 255, 0.1);
  }
  
  .quote-content {
    flex: 1;
  }
  
  .quote-item .quote-text {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .quote-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .quote-item .quote-author {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-primary);
  }
  
  .quote-context {
    font-size: 11px;
    color: var(--apple-text-tertiary);
  }
  
  .quote-category {
    font-size: 16px;
    opacity: 0.7;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .emotions-panel,
    .quotes-panel {
      padding: 16px;
    }
    
    .emotion-items {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
    
    .tab-button {
      padding: 12px;
      font-size: 13px;
    }
    
    .tab-label {
      display: none;
    }
  }
</style>