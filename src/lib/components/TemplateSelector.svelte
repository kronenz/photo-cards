<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GloryMomentTemplate, GloryMomentCategory } from '../data/kboTemplates.js';
  import { 
    GLORY_MOMENT_TEMPLATES, 
    POPULAR_TEMPLATES, 
    CATEGORY_METADATA,
    getTemplatesByCategory,
    searchTemplates
  } from '../data/kboTemplates.js';
  
  // Props
  export let selectedTemplate: GloryMomentTemplate | null = null;
  export let showSearch = true;
  export let showCategories = true;
  export let maxTemplates = 20;
  
  // 상태 관리
  let searchQuery = '';
  let selectedCategory: GloryMomentCategory | 'all' | 'popular' = 'all';
  let filteredTemplates: GloryMomentTemplate[] = GLORY_MOMENT_TEMPLATES;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    templateSelected: GloryMomentTemplate;
    templatePreview: GloryMomentTemplate;
  }>();
  
  // 반응형 필터링
  $: {
    let templates = GLORY_MOMENT_TEMPLATES;
    
    // 카테고리 필터
    if (selectedCategory === 'popular') {
      templates = POPULAR_TEMPLATES;
    } else if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }
    
    // 검색 필터
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery).filter(template => 
        selectedCategory === 'all' || 
        selectedCategory === 'popular' ||
        template.category === selectedCategory
      );
    }
    
    // 최대 개수 제한
    filteredTemplates = templates.slice(0, maxTemplates);
  }
  
  // 템플릿 선택
  function selectTemplate(template: GloryMomentTemplate) {
    selectedTemplate = template;
    dispatch('templateSelected', template);
  }
  
  // 템플릿 미리보기
  function previewTemplate(template: GloryMomentTemplate) {
    dispatch('templatePreview', template);
  }
  
  // 난이도 표시
  function getDifficultyIcon(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐';
    }
  }
  
  // 인기도 표시
  function getPopularityIcon(popularity: number): string {
    if (popularity >= 90) return '🔥';
    if (popularity >= 80) return '👍';
    if (popularity >= 70) return '👌';
    return '💫';
  }
  
  // 카테고리 선택 핸들러
  function selectCategory(category: string) {
    selectedCategory = category as GloryMomentCategory | 'all' | 'popular';
  }
</script>

<div class="template-selector">
  <!-- 헤더 -->
  <div class="selector-header">
    <h3 class="selector-title">
      <span class="title-icon">🎨</span>
      영광의 순간 템플릿
    </h3>
    <p class="selector-subtitle">
      KBO 야구 문화를 반영한 특별한 순간들을 담을 수 있는 템플릿을 선택하세요
    </p>
  </div>
  
  <!-- 검색 및 필터 -->
  <div class="selector-controls">
    {#if showSearch}
      <div class="search-box">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="템플릿 검색..."
          class="search-input"
        />
        <div class="search-icon">🔍</div>
      </div>
    {/if}
    
    {#if showCategories}
      <div class="category-tabs">
        <button
          class="category-tab"
          class:active={selectedCategory === 'all'}
          on:click={() => selectedCategory = 'all'}
        >
          전체
        </button>
        <button
          class="category-tab"
          class:active={selectedCategory === 'popular'}
          on:click={() => selectedCategory = 'popular'}
        >
          🔥 인기
        </button>
        {#each Object.entries(CATEGORY_METADATA) as [category, meta]}
          <button
            class="category-tab"
            class:active={selectedCategory === category}
            on:click={() => selectCategory(category)}
            style="--category-color: {meta.color}"
          >
            {meta.icon} {meta.name}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- 템플릿 그리드 -->
  <div class="template-grid">
    {#each filteredTemplates as template (template.id)}
      <div 
        class="template-card"
        class:selected={selectedTemplate?.id === template.id}
        on:click={() => selectTemplate(template)}
        on:mouseenter={() => previewTemplate(template)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && selectTemplate(template)}
      >
        <!-- 템플릿 미리보기 -->
        <div class="template-preview">
          <div 
            class="preview-background"
            style="background: {template.style.background.value};"
          >
            {#if template.style.background.overlay}
              <div 
                class="preview-overlay"
                style="background: {template.style.background.overlay};"
              ></div>
            {/if}
            
            <!-- 템플릿 요소들 미리보기 -->
            {#each template.layout.elements as element}
              <div 
                class="preview-element preview-{element.type}"
                style="
                  left: {element.position.x}%;
                  top: {element.position.y}%;
                  width: {element.position.width}%;
                  height: {element.position.height}%;
                  font-size: {(element.style?.fontSize || 16) * 0.3}px;
                  color: {element.style?.color || '#000'};
                  text-align: {element.style?.textAlign || 'left'};
                  font-weight: {element.style?.fontWeight || 'normal'};
                  z-index: {element.style?.zIndex || 1};
                "
              >
                {#if element.type === 'text'}
                  {element.content?.text || element.content?.placeholder || ''}
                {:else if element.type === 'image'}
                  <div class="preview-image-placeholder">🖼️</div>
                {:else if element.type === 'logo'}
                  <div class="preview-logo-placeholder">🏆</div>
                {:else if element.type === 'stats'}
                  <div class="preview-stats-placeholder">📊</div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
        
        <!-- 템플릿 정보 -->
        <div class="template-info">
          <div class="template-header">
            <h4 class="template-name">{template.name}</h4>
            <div class="template-badges">
              <span class="difficulty-badge" title="난이도">
                {getDifficultyIcon(template.metadata.difficulty)}
              </span>
              <span class="popularity-badge" title="인기도 {template.metadata.popularity}%">
                {getPopularityIcon(template.metadata.popularity)}
              </span>
            </div>
          </div>
          
          <p class="template-description">{template.description}</p>
          
          <div class="template-meta">
            <div class="template-category">
              <span class="category-icon">
                {CATEGORY_METADATA[template.category]?.icon || '📝'}
              </span>
              <span class="category-name">
                {CATEGORY_METADATA[template.category]?.name || template.category}
              </span>
            </div>
            
            <div class="template-tags">
              {#each template.metadata.tags.slice(0, 3) as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
        </div>
        
        <!-- 선택 표시 -->
        {#if selectedTemplate?.id === template.id}
          <div class="selection-indicator">
            <div class="selection-icon">✓</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  <!-- 결과 없음 -->
  {#if filteredTemplates.length === 0}
    <div class="no-results">
      <div class="no-results-icon">🔍</div>
      <h4>검색 결과가 없습니다</h4>
      <p>다른 검색어나 카테고리를 시도해보세요</p>
    </div>
  {/if}
</div>

<style>
  .template-selector {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* 헤더 */
  .selector-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .selector-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  .title-icon {
    font-size: 0.9em;
  }
  
  .selector-subtitle {
    font-size: 16px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
    max-width: 600px;
    margin: 0 auto;
  }
  
  /* 컨트롤 */
  .selector-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
  }
  
  .search-box {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    background: var(--apple-surface-primary);
    color: var(--apple-text-primary);
    font-size: 16px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--apple-text-secondary);
    font-size: 16px;
  }
  
  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  
  .category-tab {
    padding: 8px 16px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 20px;
    background: var(--apple-surface-primary);
    color: var(--apple-text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    white-space: nowrap;
  }
  
  .category-tab:hover {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
  }
  
  .category-tab.active {
    background: var(--category-color, var(--apple-accent-blue));
    color: white;
    border-color: var(--category-color, var(--apple-accent-blue));
  }
  
  /* 템플릿 그리드 */
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  
  .template-card {
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all var(--apple-duration-normal) var(--apple-easing-smooth);
    position: relative;
  }
  
  .template-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
    border-color: var(--apple-accent-blue);
  }
  
  .template-card.selected {
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  }
  
  /* 템플릿 미리보기 */
  .template-preview {
    aspect-ratio: 3/4;
    overflow: hidden;
    background: var(--apple-surface-secondary);
    position: relative;
  }
  
  .preview-background {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .preview-element {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    line-height: 1.2;
    overflow: hidden;
  }
  
  .preview-text {
    white-space: pre-line;
  }
  
  .preview-image-placeholder,
  .preview-logo-placeholder,
  .preview-stats-placeholder {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 16px;
    opacity: 0.7;
  }
  
  /* 템플릿 정보 */
  .template-info {
    padding: 16px;
  }
  
  .template-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .template-name {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
    line-height: 1.3;
  }
  
  .template-badges {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  
  .difficulty-badge,
  .popularity-badge {
    font-size: 14px;
    padding: 2px;
  }
  
  .template-description {
    font-size: 14px;
    color: var(--apple-text-secondary);
    margin: 0 0 12px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .template-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
  }
  
  .template-category {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--apple-text-secondary);
  }
  
  .category-icon {
    font-size: 14px;
  }
  
  .template-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .tag {
    background: var(--apple-surface-tertiary);
    color: var(--apple-text-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }
  
  /* 선택 표시 */
  .selection-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    background: var(--apple-accent-blue);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--apple-shadow-md);
  }
  
  .selection-icon {
    color: white;
    font-size: 16px;
    font-weight: bold;
  }
  
  /* 결과 없음 */
  .no-results {
    text-align: center;
    padding: 60px 20px;
    color: var(--apple-text-secondary);
  }
  
  .no-results-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .no-results h4 {
    font-size: 20px;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .no-results p {
    font-size: 16px;
    margin: 0;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .template-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .selector-controls {
      gap: 16px;
    }
    
    .category-tabs {
      gap: 6px;
    }
    
    .category-tab {
      padding: 6px 12px;
      font-size: 13px;
    }
    
    .template-info {
      padding: 12px;
    }
    
    .template-name {
      font-size: 16px;
    }
  }
  
  @media (max-width: 480px) {
    .template-grid {
      grid-template-columns: 1fr;
    }
    
    .selector-header {
      margin-bottom: 24px;
    }
    
    .selector-title {
      font-size: 24px;
    }
    
    .category-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 8px;
    }
  }
</style>