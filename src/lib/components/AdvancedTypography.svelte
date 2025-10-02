<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let text: string = '';
  export let fontFamily: string = 'Pretendard';
  export let fontSize: number = 16;
  export let fontWeight: string = 'normal';
  export let lineHeight: number = 1.4;
  export let letterSpacing: number = 0;
  export let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';
  export let color: string = '#000000';
  export let backgroundColor: string = 'transparent';
  export let textShadow: string = 'none';
  export let textStroke: string = 'none';
  export let gradient: string = '';
  export let animation: string = 'none';
  export let editable: boolean = true;
  export let maxLength: number = 1000;
  
  // 고급 타이포그래피 옵션
  interface TypographyStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    textTransform: string;
    lineHeight: number;
    letterSpacing: number;
    wordSpacing: number;
    textAlign: string;
    color: string;
    backgroundColor: string;
    textShadow: string;
    textStroke: string;
    gradient: string;
    animation: string;
    writingMode: string;
    textOrientation: string;
  }
  
  // 프리셋 스타일
  const presetStyles = [
    {
      name: '제목 (대형)',
      style: {
        fontSize: 48,
        fontWeight: 'bold',
        lineHeight: 1.2,
        letterSpacing: -1,
        textAlign: 'center'
      }
    },
    {
      name: '제목 (중형)',
      style: {
        fontSize: 32,
        fontWeight: '600',
        lineHeight: 1.3,
        letterSpacing: -0.5,
        textAlign: 'center'
      }
    },
    {
      name: '부제목',
      style: {
        fontSize: 24,
        fontWeight: '500',
        lineHeight: 1.4,
        letterSpacing: 0,
        textAlign: 'center'
      }
    },
    {
      name: '본문',
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 1.6,
        letterSpacing: 0,
        textAlign: 'left'
      }
    },
    {
      name: '캡션',
      style: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 1.4,
        letterSpacing: 0.5,
        textAlign: 'center'
      }
    }
  ];
  
  // 폰트 패밀리 옵션
  const fontFamilies = [
    { name: 'Pretendard', value: 'Pretendard, -apple-system, sans-serif' },
    { name: 'Noto Sans KR', value: '"Noto Sans KR", sans-serif' },
    { name: 'Apple SD Gothic Neo', value: '"Apple SD Gothic Neo", sans-serif' },
    { name: 'Malgun Gothic', value: '"Malgun Gothic", sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'SF Pro Display', value: '"SF Pro Display", -apple-system, sans-serif' },
    { name: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Monaco', value: 'Monaco, monospace' },
    { name: 'Courier New', value: '"Courier New", monospace' }
  ];
  
  // 텍스트 효과
  const textEffects = [
    { name: '없음', value: 'none' },
    { name: '그림자', value: '2px 2px 4px rgba(0,0,0,0.3)' },
    { name: '글로우', value: '0 0 10px currentColor' },
    { name: '네온', value: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
    { name: '엠보스', value: '1px 1px 0px rgba(255,255,255,0.3), -1px -1px 0px rgba(0,0,0,0.3)' },
    { name: '인그레이브', value: 'inset 1px 1px 2px rgba(0,0,0,0.3)' }
  ];
  
  // 그라디언트 프리셋
  const gradientPresets = [
    { name: '없음', value: '' },
    { name: '선셋', value: 'linear-gradient(45deg, #ff6b6b, #ffa500)' },
    { name: '오션', value: 'linear-gradient(45deg, #667eea, #764ba2)' },
    { name: '골드', value: 'linear-gradient(45deg, #ffd700, #ffed4e)' },
    { name: '실버', value: 'linear-gradient(45deg, #c0c0c0, #e8e8e8)' },
    { name: '레인보우', value: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff0080)' },
    { name: '네온 핑크', value: 'linear-gradient(45deg, #ff006e, #fb5607)' },
    { name: '사이버', value: 'linear-gradient(45deg, #00ffff, #ff00ff)' }
  ];
  
  // 애니메이션 프리셋
  const animationPresets = [
    { name: '없음', value: 'none' },
    { name: '페이드인', value: 'fadeIn 1s ease-in' },
    { name: '슬라이드업', value: 'slideUp 0.8s ease-out' },
    { name: '타이핑', value: 'typing 2s steps(40) infinite' },
    { name: '반짝임', value: 'sparkle 2s ease-in-out infinite' },
    { name: '펄스', value: 'pulse 2s ease-in-out infinite' },
    { name: '바운스', value: 'bounce 1s ease-in-out infinite' },
    { name: '흔들림', value: 'shake 0.5s ease-in-out infinite' },
    { name: '회전', value: 'rotate 2s linear infinite' }
  ];
  
  // 상태 관리
  let textElement: HTMLElement;
  let isEditing = false;
  let showStylePanel = false;
  let currentStyle: Partial<TypographyStyle> = {};
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    textChange: string;
    styleChange: Partial<TypographyStyle>;
    editStart: void;
    editEnd: void;
  }>();
  
  onMount(() => {
    updateCurrentStyle();
  });
  
  // 현재 스타일 업데이트
  function updateCurrentStyle() {
    currentStyle = {
      fontFamily,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
      textAlign,
      color,
      backgroundColor,
      textShadow,
      textStroke,
      gradient,
      animation
    };
  }
  
  // 프리셋 스타일 적용
  function applyPresetStyle(preset: any) {
    Object.assign(currentStyle, preset.style);
    
    fontSize = preset.style.fontSize || fontSize;
    fontWeight = preset.style.fontWeight || fontWeight;
    lineHeight = preset.style.lineHeight || lineHeight;
    letterSpacing = preset.style.letterSpacing || letterSpacing;
    textAlign = preset.style.textAlign || textAlign;
    
    updateCurrentStyle();
    dispatch('styleChange', currentStyle);
  }
  
  // 폰트 패밀리 변경
  function changeFontFamily(newFontFamily: string) {
    fontFamily = newFontFamily;
    updateCurrentStyle();
    dispatch('styleChange', currentStyle);
  }
  
  // 텍스트 효과 적용
  function applyTextEffect(effect: string) {
    textShadow = effect;
    updateCurrentStyle();
    dispatch('styleChange', currentStyle);
  }
  
  // 그라디언트 적용
  function applyGradient(gradientValue: string) {
    gradient = gradientValue;
    updateCurrentStyle();
    dispatch('styleChange', currentStyle);
  }
  
  // 애니메이션 적용
  function applyAnimation(animationValue: string) {
    animation = animationValue;
    updateCurrentStyle();
    dispatch('styleChange', currentStyle);
  }
  
  // 텍스트 편집 시작
  function startEditing() {
    if (!editable) return;
    
    isEditing = true;
    dispatch('editStart');
    
    // 텍스트 요소에 포커스
    if (textElement) {
      textElement.focus();
    }
  }
  
  // 텍스트 편집 종료
  function endEditing() {
    isEditing = false;
    dispatch('editEnd');
  }
  
  // 텍스트 변경 처리
  function handleTextChange() {
    if (textElement) {
      const newText = textElement.innerText || '';
      
      // 최대 길이 제한
      if (maxLength && newText.length > maxLength) {
        textElement.innerText = newText.substring(0, maxLength);
        return;
      }
      
      text = newText;
      dispatch('textChange', text);
    }
  }
  
  // 키보드 단축키 처리
  function handleKeyDown(event: KeyboardEvent) {
    if (!editable || !isEditing) return;
    
    // Ctrl/Cmd + B (Bold)
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      fontWeight = fontWeight === 'bold' ? 'normal' : 'bold';
      updateCurrentStyle();
      dispatch('styleChange', currentStyle);
    }
    
    // Ctrl/Cmd + I (Italic)
    if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
      event.preventDefault();
      // 이탤릭 토글 로직
    }
    
    // Enter 키 처리
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      endEditing();
    }
  }
  
  // 스타일 계산
  $: computedStyle = `
    font-family: ${fontFamily};
    font-size: ${fontSize}px;
    font-weight: ${fontWeight};
    line-height: ${lineHeight};
    letter-spacing: ${letterSpacing}px;
    text-align: ${textAlign};
    color: ${gradient ? 'transparent' : color};
    background-color: ${backgroundColor};
    text-shadow: ${textShadow};
    -webkit-text-stroke: ${textStroke};
    background: ${gradient};
    -webkit-background-clip: ${gradient ? 'text' : 'initial'};
    background-clip: ${gradient ? 'text' : 'initial'};
    animation: ${animation};
  `;
</script>

<div class="advanced-typography">
  <!-- 텍스트 요소 -->
  <div
    bind:this={textElement}
    class="typography-text"
    class:editing={isEditing}
    class:editable
    contenteditable={editable}
    style={computedStyle}
    on:click={startEditing}
    on:blur={endEditing}
    on:input={handleTextChange}
    on:keydown={handleKeyDown}
    role="textbox"
    aria-label="편집 가능한 텍스트"
  >
    {text || '텍스트를 입력하세요'}
  </div>
  
  <!-- 스타일 패널 토글 버튼 -->
  {#if editable}
    <button
      class="style-panel-toggle"
      class:active={showStylePanel}
      on:click={() => showStylePanel = !showStylePanel}
      title="스타일 패널"
    >
      🎨
    </button>
  {/if}
  
  <!-- 스타일 패널 -->
  {#if showStylePanel && editable}
    <div class="style-panel">
      <!-- 프리셋 스타일 -->
      <div class="style-section">
        <h4 class="section-title">프리셋 스타일</h4>
        <div class="preset-grid">
          {#each presetStyles as preset}
            <button
              class="preset-button"
              on:click={() => applyPresetStyle(preset)}
            >
              {preset.name}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- 폰트 패밀리 -->
      <div class="style-section">
        <h4 class="section-title">폰트</h4>
        <select
          class="font-select"
          bind:value={fontFamily}
          on:change={(e) => changeFontFamily(e.currentTarget.value)}
        >
          {#each fontFamilies as font}
            <option value={font.value}>{font.name}</option>
          {/each}
        </select>
      </div>
      
      <!-- 크기 및 간격 -->
      <div class="style-section">
        <h4 class="section-title">크기 및 간격</h4>
        <div class="control-grid">
          <div class="control-item">
            <label>크기</label>
            <input
              type="range"
              min="8"
              max="72"
              bind:value={fontSize}
              on:input={updateCurrentStyle}
            />
            <span>{fontSize}px</span>
          </div>
          
          <div class="control-item">
            <label>줄 간격</label>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.1"
              bind:value={lineHeight}
              on:input={updateCurrentStyle}
            />
            <span>{lineHeight}</span>
          </div>
          
          <div class="control-item">
            <label>자간</label>
            <input
              type="range"
              min="-5"
              max="10"
              step="0.5"
              bind:value={letterSpacing}
              on:input={updateCurrentStyle}
            />
            <span>{letterSpacing}px</span>
          </div>
        </div>
      </div>
      
      <!-- 정렬 및 굵기 -->
      <div class="style-section">
        <h4 class="section-title">정렬 및 굵기</h4>
        <div class="button-group">
          <button
            class="align-button"
            class:active={textAlign === 'left'}
            on:click={() => { textAlign = 'left'; updateCurrentStyle(); }}
          >
            ⬅️
          </button>
          <button
            class="align-button"
            class:active={textAlign === 'center'}
            on:click={() => { textAlign = 'center'; updateCurrentStyle(); }}
          >
            ↔️
          </button>
          <button
            class="align-button"
            class:active={textAlign === 'right'}
            on:click={() => { textAlign = 'right'; updateCurrentStyle(); }}
          >
            ➡️
          </button>
          <button
            class="align-button"
            class:active={textAlign === 'justify'}
            on:click={() => { textAlign = 'justify'; updateCurrentStyle(); }}
          >
            ⬌
          </button>
        </div>
        
        <div class="button-group">
          <button
            class="weight-button"
            class:active={fontWeight === 'normal'}
            on:click={() => { fontWeight = 'normal'; updateCurrentStyle(); }}
          >
            일반
          </button>
          <button
            class="weight-button"
            class:active={fontWeight === '500'}
            on:click={() => { fontWeight = '500'; updateCurrentStyle(); }}
          >
            중간
          </button>
          <button
            class="weight-button"
            class:active={fontWeight === 'bold'}
            on:click={() => { fontWeight = 'bold'; updateCurrentStyle(); }}
          >
            굵게
          </button>
        </div>
      </div>
      
      <!-- 색상 -->
      <div class="style-section">
        <h4 class="section-title">색상</h4>
        <div class="color-controls">
          <div class="color-item">
            <label>텍스트</label>
            <input
              type="color"
              bind:value={color}
              on:input={updateCurrentStyle}
              class="color-input"
            />
          </div>
          <div class="color-item">
            <label>배경</label>
            <input
              type="color"
              bind:value={backgroundColor}
              on:input={updateCurrentStyle}
              class="color-input"
            />
          </div>
        </div>
      </div>
      
      <!-- 텍스트 효과 -->
      <div class="style-section">
        <h4 class="section-title">텍스트 효과</h4>
        <div class="effect-grid">
          {#each textEffects as effect}
            <button
              class="effect-button"
              class:active={textShadow === effect.value}
              on:click={() => applyTextEffect(effect.value)}
            >
              {effect.name}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- 그라디언트 -->
      <div class="style-section">
        <h4 class="section-title">그라디언트</h4>
        <div class="gradient-grid">
          {#each gradientPresets as gradientPreset}
            <button
              class="gradient-button"
              class:active={gradient === gradientPreset.value}
              style="background: {gradientPreset.value || '#f0f0f0'}"
              on:click={() => applyGradient(gradientPreset.value)}
            >
              {gradientPreset.name}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- 애니메이션 -->
      <div class="style-section">
        <h4 class="section-title">애니메이션</h4>
        <div class="animation-grid">
          {#each animationPresets as animationPreset}
            <button
              class="animation-button"
              class:active={animation === animationPreset.value}
              on:click={() => applyAnimation(animationPreset.value)}
            >
              {animationPreset.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .advanced-typography {
    position: relative;
    width: 100%;
  }
  
  /* 텍스트 요소 */
  .typography-text {
    width: 100%;
    min-height: 40px;
    padding: 8px;
    border: 2px solid transparent;
    border-radius: 4px;
    outline: none;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .typography-text.editable {
    cursor: text;
  }
  
  .typography-text.editable:hover {
    border-color: rgba(0, 122, 255, 0.3);
  }
  
  .typography-text.editing {
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
  
  /* 스타일 패널 토글 */
  .style-panel-toggle {
    position: absolute;
    top: -40px;
    right: 0;
    width: 32px;
    height: 32px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .style-panel-toggle:hover {
    background: var(--apple-surface-secondary);
  }
  
  .style-panel-toggle.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  /* 스타일 패널 */
  .style-panel {
    position: absolute;
    top: -8px;
    right: 40px;
    width: 320px;
    max-height: 500px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    box-shadow: var(--apple-shadow-xl);
    z-index: 1000;
    overflow-y: auto;
    padding: 16px;
  }
  
  .style-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .style-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--apple-text-primary);
  }
  
  /* 프리셋 그리드 */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .preset-button {
    padding: 8px 12px;
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .preset-button:hover {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  /* 폰트 선택 */
  .font-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    font-size: 14px;
  }
  
  /* 컨트롤 그리드 */
  .control-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .control-item label {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    min-width: 50px;
  }
  
  .control-item input[type="range"] {
    flex: 1;
    height: 4px;
    background: var(--apple-surface-border);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
  }
  
  .control-item input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--apple-accent-blue);
    border-radius: 50%;
    cursor: pointer;
  }
  
  .control-item span {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    min-width: 40px;
    text-align: right;
  }
  
  /* 버튼 그룹 */
  .button-group {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }
  
  .align-button,
  .weight-button {
    flex: 1;
    padding: 8px;
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .align-button:hover,
  .weight-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .align-button.active,
  .weight-button.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  /* 색상 컨트롤 */
  .color-controls {
    display: flex;
    gap: 12px;
  }
  
  .color-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .color-item label {
    font-size: 12px;
    font-weight: 500;
    color: var(--apple-text-secondary);
  }
  
  .color-input {
    width: 100%;
    height: 32px;
    border: 1px solid var(--apple-surface-border);
    border-radius: 6px;
    cursor: pointer;
  }
  
  /* 효과 그리드 */
  .effect-grid,
  .gradient-grid,
  .animation-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .effect-button,
  .gradient-button,
  .animation-button {
    padding: 6px 8px;
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .effect-button:hover,
  .gradient-button:hover,
  .animation-button:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .effect-button.active,
  .gradient-button.active,
  .animation-button.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .gradient-button {
    color: #333;
    font-weight: 500;
  }
  
  /* 애니메이션 키프레임 */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes sparkle {
    0%, 100% { text-shadow: 0 0 5px currentColor; }
    50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .style-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 320px;
      max-height: 80vh;
    }
    
    .preset-grid,
    .effect-grid,
    .gradient-grid,
    .animation-grid {
      grid-template-columns: 1fr;
    }
  }
</style>