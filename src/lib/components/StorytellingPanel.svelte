<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GloryMomentTemplate } from '../data/kboTemplates.js';
  
  // Props
  export let template: GloryMomentTemplate;
  export let storyData: StoryData = {
    backgroundStory: '',
    playerQuote: '',
    historicalContext: '',
    emotionalTone: 'joy',
    tags: []
  };
  
  // 스토리텔링 데이터 타입
  interface StoryData {
    backgroundStory: string;
    playerQuote: string;
    historicalContext: string;
    emotionalTone: 'joy' | 'triumph' | 'nostalgia' | 'excitement' | 'pride' | 'determination';
    tags: string[];
  }
  
  // 감정 톤 옵션
  const emotionalTones = [
    { value: 'joy', label: '기쁨', icon: '😊', color: '#FFD700' },
    { value: 'triumph', label: '승리', icon: '🏆', color: '#FF6B35' },
    { value: 'nostalgia', label: '그리움', icon: '🌅', color: '#667eea' },
    { value: 'excitement', label: '흥분', icon: '⚡', color: '#FF6B6B' },
    { value: 'pride', label: '자부심', icon: '💪', color: '#4ECDC4' },
    { value: 'determination', label: '의지', icon: '🔥', color: '#e74c3c' }
  ];
  
  // KBO 관련 태그 제안
  const suggestedTags = [
    '홈런', '끝내기', '역전', '완봉', '노히터', '사이클링히트',
    '신인왕', 'MVP', '골든글러브', '최다승', '최다세이브',
    '한국시리즈', '플레이오프', '올스타', '개막전', '마지막경기',
    '감동', '눈물', '환호', '응원', '팬사랑', '가족',
    '도전', '극복', '성장', '꿈', '열정', '우정'
  ];
  
  // 명언 템플릿
  const quoteTemplates = [
    '야구는 실패의 스포츠다. 하지만 그 실패를 극복하는 것이 진정한 승리다.',
    '팬들의 응원이 있기에 우리는 더 강해질 수 있습니다.',
    '이 순간을 위해 얼마나 많은 땀을 흘렸는지 모릅니다.',
    '야구장에서의 모든 순간이 소중한 추억이 됩니다.',
    '동료들과 함께라면 어떤 어려움도 이겨낼 수 있습니다.',
    '팬 여러분께 보답하고 싶은 마음뿐입니다.',
    '매 경기가 새로운 도전이고, 새로운 기회입니다.',
    '야구를 사랑하는 마음만큼은 누구에게도 지지 않습니다.'
  ];
  
  // 상태 관리
  let newTag = '';
  let showQuoteTemplates = false;
  let selectedQuoteTemplate = '';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    storyUpdate: StoryData;
    addStoryElement: { type: string; content: any };
  }>();
  
  // 스토리 데이터 업데이트
  function updateStoryData() {
    dispatch('storyUpdate', storyData);
  }
  
  // 태그 추가
  function addTag(tag: string) {
    if (tag && !storyData.tags.includes(tag)) {
      storyData.tags = [...storyData.tags, tag];
      newTag = '';
      updateStoryData();
    }
  }
  
  // 태그 제거
  function removeTag(tagToRemove: string) {
    storyData.tags = storyData.tags.filter(tag => tag !== tagToRemove);
    updateStoryData();
  }
  
  // 명언 템플릿 적용
  function applyQuoteTemplate(quote: string) {
    storyData.playerQuote = quote;
    selectedQuoteTemplate = quote;
    showQuoteTemplates = false;
    updateStoryData();
  }
  
  // 스토리 요소 추가
  function addStoryElement(type: string) {
    let content = {};
    
    switch (type) {
      case 'timeline':
        content = {
          events: [
            { time: '1회초', event: '경기 시작' },
            { time: '9회말', event: '결정적 순간' }
          ]
        };
        break;
      case 'stats':
        content = {
          title: '경기 통계',
          data: [
            { label: '타율', value: '.350' },
            { label: '홈런', value: '25' },
            { label: 'RBI', value: '80' }
          ]
        };
        break;
      case 'quote-bubble':
        content = {
          text: storyData.playerQuote || '선수의 한마디',
          speaker: '선수명',
          style: 'speech-bubble'
        };
        break;
    }
    
    dispatch('addStoryElement', { type, content });
  }
  
  // 감정 톤 변경
  function changeEmotionalTone(tone: string) {
    storyData.emotionalTone = tone as any;
    updateStoryData();
  }
  
  // 현재 감정 톤 정보
  $: currentTone = emotionalTones.find(tone => tone.value === storyData.emotionalTone);
</script>

<div class="storytelling-panel">
  <!-- 패널 헤더 -->
  <div class="panel-header">
    <h3 class="panel-title">
      <span class="title-icon">📖</span>
      스토리텔링
    </h3>
    <p class="panel-subtitle">
      카드에 감동적인 이야기를 추가하세요
    </p>
  </div>
  
  <!-- 배경 스토리 -->
  <div class="story-section">
    <h4 class="section-title">
      <span class="section-icon">🎬</span>
      배경 스토리
    </h4>
    <textarea
      bind:value={storyData.backgroundStory}
      on:input={updateStoryData}
      placeholder="이 순간의 배경과 상황을 설명해주세요..."
      class="story-textarea"
      maxlength="500"
    ></textarea>
    <div class="character-count">
      {storyData.backgroundStory.length}/500
    </div>
  </div>
  
  <!-- 선수 명언 -->
  <div class="story-section">
    <h4 class="section-title">
      <span class="section-icon">💬</span>
      선수 명언
    </h4>
    
    <div class="quote-input-group">
      <textarea
        bind:value={storyData.playerQuote}
        on:input={updateStoryData}
        placeholder="선수의 인상적인 말이나 인터뷰 내용..."
        class="story-textarea"
        maxlength="200"
      ></textarea>
      
      <button
        class="template-button"
        on:click={() => showQuoteTemplates = !showQuoteTemplates}
        title="명언 템플릿"
      >
        💡 템플릿
      </button>
    </div>
    
    {#if showQuoteTemplates}
      <div class="quote-templates">
        <h5>명언 템플릿</h5>
        <div class="template-list">
          {#each quoteTemplates as quote}
            <button
              class="template-item"
              class:selected={selectedQuoteTemplate === quote}
              on:click={() => applyQuoteTemplate(quote)}
            >
              "{quote}"
            </button>
          {/each}
        </div>
      </div>
    {/if}
    
    <div class="character-count">
      {storyData.playerQuote.length}/200
    </div>
  </div>
  
  <!-- 역사적 맥락 -->
  <div class="story-section">
    <h4 class="section-title">
      <span class="section-icon">📅</span>
      역사적 맥락
    </h4>
    <textarea
      bind:value={storyData.historicalContext}
      on:input={updateStoryData}
      placeholder="경기 날짜, 상황, 의미 등을 설명해주세요..."
      class="story-textarea"
      maxlength="300"
    ></textarea>
    <div class="character-count">
      {storyData.historicalContext.length}/300
    </div>
  </div>
  
  <!-- 감정 톤 -->
  <div class="story-section">
    <h4 class="section-title">
      <span class="section-icon">🎭</span>
      감정 표현
    </h4>
    
    <div class="emotion-selector">
      {#each emotionalTones as tone}
        <button
          class="emotion-button"
          class:selected={storyData.emotionalTone === tone.value}
          style="--emotion-color: {tone.color}"
          on:click={() => changeEmotionalTone(tone.value)}
          title={tone.label}
        >
          <span class="emotion-icon">{tone.icon}</span>
          <span class="emotion-label">{tone.label}</span>
        </button>
      {/each}
    </div>
    
    {#if currentTone}
      <div class="current-emotion">
        <span class="current-icon">{currentTone.icon}</span>
        <span class="current-label">현재 감정: {currentTone.label}</span>
      </div>
    {/if}
  </div>
  
  <!-- 태그 -->
  <div class="story-section">
    <h4 class="section-title">
      <span class="section-icon">🏷️</span>
      태그
    </h4>
    
    <div class="tag-input-group">
      <input
        type="text"
        bind:value={newTag}
        on:keydown={(e) => e.key === 'Enter' && addTag(newTag)}
        placeholder="태그 입력..."
        class="tag-input"
        maxlength="20"
      />
      <button
        class="add-tag-button"
        on:click={() => addTag(newTag)}
        disabled={!newTag.trim()}
      >
        추가
      </button>
    </div>
    
    <!-- 제안 태그 -->
    <div class="suggested-tags">
      <h5>제안 태그</h5>
      <div class="tag-suggestions">
        {#each suggestedTags as tag}
          <button
            class="suggested-tag"
            class:added={storyData.tags.includes(tag)}
            on:click={() => addTag(tag)}
            disabled={storyData.tags.includes(tag)}
          >
            {tag}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- 현재 태그 -->
    {#if storyData.tags.length > 0}
      <div class="current-tags">
        <h5>현재 태그</h5>
        <div class="tag-list">
          {#each storyData.tags as tag}
            <span class="tag">
              {tag}
              <button
                class="remove-tag"
                on:click={() => removeTag(tag)}
                title="태그 제거"
              >
                ✕
              </button>
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- 스토리 요소 추가 -->
  <div class="story-section">
    <h4 class="section-title">
      <span class="section-icon">🎨</span>
      스토리 요소 추가
    </h4>
    
    <div class="story-elements">
      <button
        class="element-button"
        on:click={() => addStoryElement('timeline')}
        title="타임라인 추가"
      >
        <span class="element-icon">⏰</span>
        <span class="element-label">타임라인</span>
      </button>
      
      <button
        class="element-button"
        on:click={() => addStoryElement('stats')}
        title="통계 차트 추가"
      >
        <span class="element-icon">📊</span>
        <span class="element-label">통계</span>
      </button>
      
      <button
        class="element-button"
        on:click={() => addStoryElement('quote-bubble')}
        title="말풍선 추가"
      >
        <span class="element-icon">💭</span>
        <span class="element-label">말풍선</span>
      </button>
    </div>
  </div>
</div>

<style>
  .storytelling-panel {
    width: 100%;
    max-width: 400px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    padding: 20px;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  /* 패널 헤더 */
  .panel-header {
    margin-bottom: 24px;
    text-align: center;
  }
  
  .panel-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .panel-subtitle {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0;
  }
  
  /* 스토리 섹션 */
  .story-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .story-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .section-icon {
    font-size: 0.9em;
  }
  
  /* 텍스트 영역 */
  .story-textarea {
    width: 100%;
    min-height: 80px;
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
  
  .story-textarea:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
  
  .character-count {
    text-align: right;
    font-size: 11px;
    color: var(--apple-text-tertiary);
    margin-top: 4px;
  }
  
  /* 명언 입력 그룹 */
  .quote-input-group {
    position: relative;
  }
  
  .template-button {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .template-button:hover {
    background: var(--apple-accent-blue-hover);
  }
  
  /* 명언 템플릿 */
  .quote-templates {
    margin-top: 12px;
    padding: 12px;
    background: var(--apple-surface-secondary);
    border-radius: 8px;
  }
  
  .quote-templates h5 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .template-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .template-item {
    padding: 8px 12px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    text-align: left;
    font-size: 13px;
    color: var(--apple-text-secondary);
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .template-item:hover {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-primary);
  }
  
  .template-item.selected {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
  }
  
  /* 감정 선택기 */
  .emotion-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .emotion-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .emotion-button:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
  }
  
  .emotion-button.selected {
    background: var(--emotion-color);
    color: white;
    border-color: var(--emotion-color);
    box-shadow: 0 4px 12px rgba(var(--emotion-color-rgb, 0, 122, 255), 0.3);
  }
  
  .emotion-icon {
    font-size: 20px;
  }
  
  .emotion-label {
    font-size: 12px;
    font-weight: 500;
  }
  
  .current-emotion {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--apple-surface-secondary);
    border-radius: 6px;
    font-size: 14px;
    color: var(--apple-text-primary);
  }
  
  .current-icon {
    font-size: 16px;
  }
  
  /* 태그 입력 */
  .tag-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .tag-input {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 6px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  .tag-input:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
  }
  
  .add-tag-button {
    padding: 8px 16px;
    background: var(--apple-accent-blue);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .add-tag-button:hover:not(:disabled) {
    background: var(--apple-accent-blue-hover);
  }
  
  .add-tag-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 제안 태그 */
  .suggested-tags h5,
  .current-tags h5 {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--apple-text-secondary);
  }
  
  .tag-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  
  .suggested-tag {
    padding: 4px 8px;
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    font-size: 12px;
    color: var(--apple-text-secondary);
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .suggested-tag:hover:not(:disabled) {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .suggested-tag.added {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-tertiary);
    cursor: not-allowed;
  }
  
  /* 현재 태그 */
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--apple-accent-blue);
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .remove-tag {
    background: none;
    border: none;
    color: white;
    font-size: 10px;
    cursor: pointer;
    padding: 0;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .remove-tag:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  /* 스토리 요소 */
  .story-elements {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .element-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .element-button:hover {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
    transform: translateY(-2px);
  }
  
  .element-icon {
    font-size: 18px;
  }
  
  .element-label {
    font-size: 11px;
    font-weight: 500;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .storytelling-panel {
      max-width: 100%;
      padding: 16px;
    }
    
    .emotion-selector {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .story-elements {
      grid-template-columns: 1fr;
    }
  }
</style>