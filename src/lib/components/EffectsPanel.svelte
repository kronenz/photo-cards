<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let selectedElementId: string | null = null;
  
  // 특수 효과 타입
  interface Effect {
    id: string;
    name: string;
    icon: string;
    category: 'particle' | 'glow' | 'animation' | 'filter';
    description: string;
    preview: string;
    settings: EffectSetting[];
  }
  
  interface EffectSetting {
    key: string;
    label: string;
    type: 'range' | 'color' | 'select' | 'toggle';
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string; label: string }[];
    defaultValue: any;
  }
  
  // 특수 효과 데이터
  const effects: Effect[] = [
    {
      id: 'particle-sparkles',
      name: '반짝이 파티클',
      icon: '✨',
      category: 'particle',
      description: '반짝이는 파티클 효과',
      preview: 'sparkles-preview',
      settings: [
        { key: 'count', label: '개수', type: 'range', min: 10, max: 100, step: 5, defaultValue: 30 },
        { key: 'size', label: '크기', type: 'range', min: 1, max: 10, step: 0.5, defaultValue: 3 },
        { key: 'color', label: '색상', type: 'color', defaultValue: '#FFD700' },
        { key: 'speed', label: '속도', type: 'range', min: 0.1, max: 2, step: 0.1, defaultValue: 1 }
      ]
    },
    {
      id: 'particle-fireworks',
      name: '불꽃 효과',
      icon: '🎆',
      category: 'particle',
      description: '폭발하는 불꽃 파티클',
      preview: 'fireworks-preview',
      settings: [
        { key: 'intensity', label: '강도', type: 'range', min: 1, max: 10, step: 1, defaultValue: 5 },
        { key: 'color1', label: '색상 1', type: 'color', defaultValue: '#FF6B6B' },
        { key: 'color2', label: '색상 2', type: 'color', defaultValue: '#4ECDC4' },
        { key: 'duration', label: '지속시간', type: 'range', min: 1, max: 5, step: 0.5, defaultValue: 2 }
      ]
    },
    {
      id: 'particle-lightning',
      name: '번개 효과',
      icon: '⚡',
      category: 'particle',
      description: '번개 모양 파티클',
      preview: 'lightning-preview',
      settings: [
        { key: 'branches', label: '가지 수', type: 'range', min: 3, max: 15, step: 1, defaultValue: 8 },
        { key: 'color', label: '색상', type: 'color', defaultValue: '#00BFFF' },
        { key: 'thickness', label: '두께', type: 'range', min: 1, max: 5, step: 0.5, defaultValue: 2 },
        { key: 'flicker', label: '깜빡임', type: 'toggle', defaultValue: true }
      ]
    },
    {
      id: 'glow-neon',
      name: '네온 글로우',
      icon: '💫',
      category: 'glow',
      description: '네온사인 같은 발광 효과',
      preview: 'neon-preview',
      settings: [
        { key: 'intensity', label: '강도', type: 'range', min: 0, max: 20, step: 1, defaultValue: 10 },
        { key: 'color', label: '색상', type: 'color', defaultValue: '#00FFFF' },
        { key: 'blur', label: '블러', type: 'range', min: 0, max: 20, step: 1, defaultValue: 5 },
        { key: 'pulse', label: '맥동', type: 'toggle', defaultValue: false }
      ]
    },
    {
      id: 'glow-holographic',
      name: '홀로그래픽 글로우',
      icon: '🌈',
      category: 'glow',
      description: '무지개 홀로그래픽 효과',
      preview: 'holographic-preview',
      settings: [
        { key: 'intensity', label: '강도', type: 'range', min: 0, max: 15, step: 1, defaultValue: 8 },
        { key: 'speed', label: '속도', type: 'range', min: 0.1, max: 3, step: 0.1, defaultValue: 1 },
        { key: 'saturation', label: '채도', type: 'range', min: 0, max: 100, step: 5, defaultValue: 80 }
      ]
    },
    {
      id: 'animation-float',
      name: '떠오르기',
      icon: '🎈',
      category: 'animation',
      description: '부드럽게 떠오르는 애니메이션',
      preview: 'float-preview',
      settings: [
        { key: 'distance', label: '거리', type: 'range', min: 5, max: 50, step: 5, defaultValue: 20 },
        { key: 'duration', label: '주기', type: 'range', min: 1, max: 10, step: 0.5, defaultValue: 3 },
        { key: 'easing', label: '이징', type: 'select', options: [
          { value: 'ease-in-out', label: '부드럽게' },
          { value: 'ease-in', label: '가속' },
          { value: 'ease-out', label: '감속' },
          { value: 'linear', label: '일정' }
        ], defaultValue: 'ease-in-out' }
      ]
    },
    {
      id: 'animation-pulse',
      name: '맥동',
      icon: '💓',
      category: 'animation',
      description: '심장박동 같은 맥동 효과',
      preview: 'pulse-preview',
      settings: [
        { key: 'scale', label: '크기 변화', type: 'range', min: 1.1, max: 2, step: 0.1, defaultValue: 1.3 },
        { key: 'duration', label: '주기', type: 'range', min: 0.5, max: 3, step: 0.1, defaultValue: 1.5 },
        { key: 'infinite', label: '무한 반복', type: 'toggle', defaultValue: true }
      ]
    },
    {
      id: 'filter-vintage',
      name: '빈티지 필터',
      icon: '📷',
      category: 'filter',
      description: '오래된 사진 같은 빈티지 효과',
      preview: 'vintage-preview',
      settings: [
        { key: 'sepia', label: '세피아', type: 'range', min: 0, max: 100, step: 5, defaultValue: 60 },
        { key: 'contrast', label: '대비', type: 'range', min: 50, max: 150, step: 5, defaultValue: 110 },
        { key: 'brightness', label: '밝기', type: 'range', min: 50, max: 150, step: 5, defaultValue: 90 },
        { key: 'vignette', label: '비네팅', type: 'range', min: 0, max: 100, step: 5, defaultValue: 30 }
      ]
    }
  ];
  
  // 상태 관리
  let selectedCategory: string = 'all';
  let selectedEffect: Effect | null = null;
  let effectSettings: Record<string, any> = {};
  let previewMode = false;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    effectApply: { effectId: string; settings: Record<string, any> };
    effectRemove: string;
    effectPreview: { effectId: string; settings: Record<string, any> };
  }>();
  
  // 카테고리별 효과 필터링
  $: filteredEffects = selectedCategory === 'all' 
    ? effects 
    : effects.filter(effect => effect.category === selectedCategory);
  
  // 효과 선택
  function selectEffect(effect: Effect) {
    selectedEffect = effect;
    
    // 기본 설정값 초기화
    effectSettings = {};
    effect.settings.forEach(setting => {
      effectSettings[setting.key] = setting.defaultValue;
    });
  }
  
  // 효과 적용
  function applyEffect() {
    if (!selectedEffect || !selectedElementId) return;
    
    dispatch('effectApply', {
      effectId: selectedEffect.id,
      settings: { ...effectSettings }
    });
    
    // 패널 닫기
    selectedEffect = null;
  }
  
  // 효과 미리보기
  function previewEffect() {
    if (!selectedEffect || !selectedElementId) return;
    
    previewMode = true;
    dispatch('effectPreview', {
      effectId: selectedEffect.id,
      settings: { ...effectSettings }
    });
    
    // 3초 후 미리보기 종료
    setTimeout(() => {
      previewMode = false;
    }, 3000);
  }
  
  // 효과 제거
  function removeEffect(effectId: string) {
    dispatch('effectRemove', effectId);
  }
  
  // 설정값 업데이트
  function updateSetting(key: string, value: any) {
    effectSettings[key] = value;
    effectSettings = { ...effectSettings };
  }
  
  // 카테고리 정보
  const categories = [
    { id: 'all', name: '전체', icon: '🎨' },
    { id: 'particle', name: '파티클', icon: '✨' },
    { id: 'glow', name: '글로우', icon: '💫' },
    { id: 'animation', name: '애니메이션', icon: '🎬' },
    { id: 'filter', name: '필터', icon: '🎭' }
  ];
</script>

<div class="effects-panel">
  <!-- 패널 헤더 -->
  <div class="panel-header">
    <h3 class="panel-title">
      <span class="title-icon">🎪</span>
      특수 효과
    </h3>
    {#if !selectedElementId}
      <p class="panel-subtitle">요소를 선택하여 효과를 적용하세요</p>
    {:else}
      <p class="panel-subtitle">선택된 요소에 특수 효과를 추가하세요</p>
    {/if}
  </div>
  
  {#if selectedElementId}
    <!-- 카테고리 탭 -->
    <div class="category-tabs">
      {#each categories as category}
        <button
          class="category-tab"
          class:active={selectedCategory === category.id}
          on:click={() => selectedCategory = category.id}
        >
          <span class="tab-icon">{category.icon}</span>
          <span class="tab-label">{category.name}</span>
        </button>
      {/each}
    </div>
    
    {#if !selectedEffect}
      <!-- 효과 목록 -->
      <div class="effects-grid">
        {#each filteredEffects as effect}
          <div
            class="effect-card"
            on:click={() => selectEffect(effect)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && selectEffect(effect)}
          >
            <div class="effect-preview">
              <div class="preview-icon">{effect.icon}</div>
              <div class="preview-animation {effect.preview}"></div>
            </div>
            
            <div class="effect-info">
              <h4 class="effect-name">{effect.name}</h4>
              <p class="effect-description">{effect.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- 효과 설정 -->
      <div class="effect-settings">
        <div class="settings-header">
          <button
            class="back-button"
            on:click={() => selectedEffect = null}
            title="뒤로가기"
          >
            ← 뒤로
          </button>
          <h4 class="settings-title">
            {selectedEffect.icon} {selectedEffect.name}
          </h4>
        </div>
        
        <div class="settings-list">
          {#each selectedEffect.settings as setting}
            <div class="setting-item">
              <label class="setting-label">{setting.label}</label>
              
              {#if setting.type === 'range'}
                <div class="range-control">
                  <input
                    type="range"
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    value={effectSettings[setting.key]}
                    on:input={(e) => updateSetting(setting.key, parseFloat(e.currentTarget.value))}
                    class="range-input"
                  />
                  <span class="range-value">{effectSettings[setting.key]}</span>
                </div>
              
              {:else if setting.type === 'color'}
                <input
                  type="color"
                  value={effectSettings[setting.key]}
                  on:input={(e) => updateSetting(setting.key, e.currentTarget.value)}
                  class="color-input"
                />
              
              {:else if setting.type === 'select'}
                <select
                  value={effectSettings[setting.key]}
                  on:change={(e) => updateSetting(setting.key, e.currentTarget.value)}
                  class="select-input"
                >
                  {#each setting.options || [] as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              
              {:else if setting.type === 'toggle'}
                <label class="toggle-control">
                  <input
                    type="checkbox"
                    checked={effectSettings[setting.key]}
                    on:change={(e) => updateSetting(setting.key, e.currentTarget.checked)}
                    class="toggle-input"
                  />
                  <span class="toggle-slider"></span>
                </label>
              {/if}
            </div>
          {/each}
        </div>
        
        <!-- 액션 버튼 -->
        <div class="settings-actions">
          <button
            class="action-button preview"
            class:active={previewMode}
            on:click={previewEffect}
            disabled={previewMode}
          >
            {previewMode ? '미리보기 중...' : '👁️ 미리보기'}
          </button>
          
          <button
            class="action-button apply"
            on:click={applyEffect}
          >
            ✨ 적용하기
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <!-- 선택된 요소 없음 -->
    <div class="no-selection">
      <div class="no-selection-icon">🎯</div>
      <h4>요소를 선택하세요</h4>
      <p>특수 효과를 적용할 요소를 먼저 선택해주세요</p>
    </div>
  {/if}
</div>

<style>
  .effects-panel {
    width: 100%;
    max-width: 350px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 16px;
    overflow: hidden;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  /* 패널 헤더 */
  .panel-header {
    padding: 20px;
    background: var(--apple-surface-secondary);
    border-bottom: 1px solid var(--apple-surface-border);
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
  
  /* 카테고리 탭 */
  .category-tabs {
    display: flex;
    padding: 16px;
    gap: 8px;
    overflow-x: auto;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .category-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    white-space: nowrap;
    min-width: 60px;
  }
  
  .category-tab:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .category-tab.active {
    background: var(--apple-accent-blue);
    color: white;
    border-color: var(--apple-accent-blue);
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  .tab-label {
    font-size: 11px;
    font-weight: 500;
  }
  
  /* 효과 그리드 */
  .effects-grid {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    overflow-y: auto;
    flex: 1;
  }
  
  .effect-card {
    background: var(--apple-surface-secondary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    text-align: center;
  }
  
  .effect-card:hover {
    background: var(--apple-surface-tertiary);
    border-color: var(--apple-accent-blue);
    transform: translateY(-2px);
  }
  
  .effect-preview {
    position: relative;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
  }
  
  .preview-icon {
    font-size: 24px;
    z-index: 2;
  }
  
  .preview-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
  }
  
  /* 미리보기 애니메이션 */
  .sparkles-preview {
    background: radial-gradient(circle at 20% 30%, #FFD700 2px, transparent 2px),
                radial-gradient(circle at 80% 70%, #FFD700 1px, transparent 1px),
                radial-gradient(circle at 60% 20%, #FFD700 1px, transparent 1px);
    animation: sparkle 2s infinite;
  }
  
  .fireworks-preview {
    background: radial-gradient(circle at center, #FF6B6B 0%, transparent 70%);
    animation: explode 1.5s infinite;
  }
  
  .lightning-preview {
    background: linear-gradient(45deg, transparent 40%, #00BFFF 50%, transparent 60%);
    animation: flash 1s infinite;
  }
  
  .neon-preview {
    background: linear-gradient(90deg, #00FFFF, #FF00FF, #00FFFF);
    animation: neonGlow 2s infinite;
  }
  
  .holographic-preview {
    background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff0080);
    animation: rainbow 3s infinite;
  }
  
  .float-preview {
    background: linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
    animation: float 2s infinite ease-in-out;
  }
  
  .pulse-preview {
    background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
    animation: pulse 1.5s infinite;
  }
  
  .vintage-preview {
    background: linear-gradient(135deg, #8B4513, #D2691E);
    filter: sepia(50%) contrast(120%);
  }
  
  @keyframes sparkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
  
  @keyframes explode {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  @keyframes flash {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  
  @keyframes neonGlow {
    0%, 100% { filter: brightness(1) blur(0px); }
    50% { filter: brightness(1.5) blur(2px); }
  }
  
  @keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  
  .effect-info {
    text-align: center;
  }
  
  .effect-name {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px;
    color: var(--apple-text-primary);
  }
  
  .effect-description {
    font-size: 11px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.3;
  }
  
  /* 효과 설정 */
  .effect-settings {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .settings-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .back-button {
    background: none;
    border: none;
    color: var(--apple-accent-blue);
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .back-button:hover {
    background: var(--apple-surface-secondary);
  }
  
  .settings-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
  }
  
  .settings-list {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  .setting-item {
    margin-bottom: 20px;
  }
  
  .setting-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-primary);
    margin-bottom: 8px;
  }
  
  /* 컨트롤 스타일 */
  .range-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .range-input {
    flex: 1;
    height: 6px;
    background: var(--apple-surface-tertiary);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }
  
  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: var(--apple-accent-blue);
    border-radius: 50%;
    cursor: pointer;
  }
  
  .range-value {
    font-size: 13px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    min-width: 40px;
    text-align: right;
  }
  
  .color-input {
    width: 100%;
    height: 40px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    cursor: pointer;
  }
  
  .select-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid var(--apple-surface-border);
    border-radius: 8px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  .toggle-control {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }
  
  .toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--apple-surface-tertiary);
    border-radius: 24px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .toggle-input:checked + .toggle-slider {
    background: var(--apple-accent-blue);
  }
  
  .toggle-input:checked + .toggle-slider:before {
    transform: translateX(26px);
  }
  
  /* 액션 버튼 */
  .settings-actions {
    padding: 20px;
    border-top: 1px solid var(--apple-surface-border);
    display: flex;
    gap: 12px;
  }
  
  .action-button {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .action-button.preview {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    border: 2px solid var(--apple-surface-border);
  }
  
  .action-button.preview:hover:not(:disabled) {
    background: var(--apple-surface-tertiary);
  }
  
  .action-button.preview.active {
    background: var(--apple-accent-orange);
    color: white;
    border-color: var(--apple-accent-orange);
  }
  
  .action-button.apply {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .action-button.apply:hover {
    background: var(--apple-accent-blue-hover);
    transform: translateY(-1px);
  }
  
  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  /* 선택된 요소 없음 */
  .no-selection {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--apple-text-secondary);
  }
  
  .no-selection-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .no-selection h4 {
    font-size: 18px;
    margin: 0 0 8px;
    color: var(--apple-text-primary);
  }
  
  .no-selection p {
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .effects-panel {
      max-width: 100%;
    }
    
    .effects-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .category-tabs {
      padding: 12px;
    }
    
    .settings-actions {
      flex-direction: column;
    }
  }
</style>