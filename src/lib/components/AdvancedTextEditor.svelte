<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let element: any;

  let textData = element?.data || {
    content: '텍스트를 입력하세요',
    fontSize: 24,
    fontFamily: 'Apple SD Gothic Neo',
    color: '#ffffff',
    fontWeight: 'normal',
    textAlign: 'left',
    lineHeight: 1.4,
    letterSpacing: 0,
    textDecoration: 'none',
    textTransform: 'none',
    textShadow: 'none',
    background: 'transparent',
    padding: 0,
    borderRadius: 0,
    animation: 'none'
  };

  let activeTab = 'text';
  let showColorPicker = false;
  let showBackgroundPicker = false;

  // Font families available
  const fontFamilies = [
    { name: 'Apple SD Gothic Neo', value: 'Apple SD Gothic Neo, sans-serif' },
    { name: 'SF Pro Display', value: '"SF Pro Display", -apple-system, sans-serif' },
    { name: 'Pretendard', value: 'Pretendard, -apple-system, sans-serif' },
    { name: 'Noto Sans KR', value: '"Noto Sans KR", sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
    { name: 'Nanum Gothic', value: '"Nanum Gothic", sans-serif' },
    { name: 'Nanum Myeongjo', value: '"Nanum Myeongjo", serif' },
    { name: 'Jua', value: 'Jua, cursive' }
  ];

  // Font weights
  const fontWeights = [
    { name: '얇게', value: '100' },
    { name: '가늘게', value: '200' },
    { name: '보통', value: '300' },
    { name: '일반', value: '400' },
    { name: '중간', value: '500' },
    { name: '반굵게', value: '600' },
    { name: '굵게', value: '700' },
    { name: '매우굵게', value: '800' },
    { name: '가장굵게', value: '900' }
  ];

  // Text alignment options
  const textAlignments = [
    { name: '왼쪽', value: 'left', icon: '⬅️' },
    { name: '가운데', value: 'center', icon: '↔️' },
    { name: '오른쪽', value: 'right', icon: '➡️' },
    { name: '양쪽', value: 'justify', icon: '📐' }
  ];

  // Text transform options
  const textTransforms = [
    { name: '없음', value: 'none' },
    { name: '대문자', value: 'uppercase' },
    { name: '소문자', value: 'lowercase' },
    { name: '첫글자대문자', value: 'capitalize' }
  ];

  // Animation presets
  const animations = [
    { name: '없음', value: 'none' },
    { name: '페이드인', value: 'fadeIn 1s ease-in-out' },
    { name: '슬라이드업', value: 'slideUp 0.8s ease-out' },
    { name: '타이핑', value: 'typing 2s steps(40) infinite' },
    { name: '글로우', value: 'glow 2s ease-in-out infinite alternate' },
    { name: '바운스', value: 'bounce 1s ease-in-out infinite' },
    { name: '펄스', value: 'pulse 1.5s ease-in-out infinite' },
    { name: '흔들기', value: 'shake 0.5s ease-in-out infinite' }
  ];

  // Color presets
  const colorPresets = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#ffd700', '#c0c0c0'
  ];

  onMount(() => {
    // Initialize with element data if available
    if (element?.data) {
      textData = { ...textData, ...element.data };
    }
  });

  function updateText() {
    dispatch('textUpdated', textData);
  }

  function handleInputChange(property: string, value: any) {
    textData[property] = value;
    textData = textData;
    updateText();
  }

  function applyPreset(preset: string) {
    switch (preset) {
      case 'title':
        textData = {
          ...textData,
          fontSize: 48,
          fontWeight: '700',
          textAlign: 'center',
          color: '#ffffff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        };
        break;
      case 'subtitle':
        textData = {
          ...textData,
          fontSize: 32,
          fontWeight: '500',
          textAlign: 'center',
          color: '#ebebf5'
        };
        break;
      case 'body':
        textData = {
          ...textData,
          fontSize: 18,
          fontWeight: '400',
          textAlign: 'left',
          lineHeight: 1.6,
          color: '#ffffff'
        };
        break;
      case 'caption':
        textData = {
          ...textData,
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'center',
          color: '#86868b'
        };
        break;
      case 'neon':
        textData = {
          ...textData,
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
          fontWeight: '600'
        };
        break;
      case 'gold':
        textData = {
          ...textData,
          color: '#ffd700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px #ffd700',
          fontWeight: '700'
        };
        break;
    }
    textData = textData;
    updateText();
  }

  function generateTextShadow(x: number, y: number, blur: number, color: string) {
    return `${x}px ${y}px ${blur}px ${color}`;
  }
</script>

<div class="text-editor">
  <!-- Tab Navigation -->
  <div class="tab-nav">
    <button
      class="tab-btn"
      class:active={activeTab === 'text'}
      on:click={() => activeTab = 'text'}
    >
      📝 텍스트
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'style'}
      on:click={() => activeTab = 'style'}
    >
      🎨 스타일
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'effects'}
      on:click={() => activeTab = 'effects'}
    >
      ✨ 효과
    </button>
  </div>

  <!-- Text Content Tab -->
  {#if activeTab === 'text'}
    <div class="tab-content" transition:slide={{ duration: 200 }}>
      <!-- Text Input -->
      <div class="input-group">
        <label>텍스트 내용</label>
        <textarea
          bind:value={textData.content}
          on:input={() => updateText()}
          placeholder="텍스트를 입력하세요..."
          rows="4"
        ></textarea>
      </div>

      <!-- Font Family -->
      <div class="input-group">
        <label>폰트</label>
        <select
          bind:value={textData.fontFamily}
          on:change={() => updateText()}
        >
          {#each fontFamilies as font}
            <option value={font.value}>{font.name}</option>
          {/each}
        </select>
      </div>

      <!-- Font Size -->
      <div class="input-group">
        <label>크기: {textData.fontSize}px</label>
        <input
          type="range"
          min="8"
          max="120"
          bind:value={textData.fontSize}
          on:input={() => updateText()}
        />
        <input
          type="number"
          min="8"
          max="120"
          bind:value={textData.fontSize}
          on:input={() => updateText()}
        />
      </div>

      <!-- Font Weight -->
      <div class="input-group">
        <label>굵기</label>
        <select
          bind:value={textData.fontWeight}
          on:change={() => updateText()}
        >
          {#each fontWeights as weight}
            <option value={weight.value}>{weight.name}</option>
          {/each}
        </select>
      </div>

      <!-- Text Alignment -->
      <div class="input-group">
        <label>정렬</label>
        <div class="button-group">
          {#each textAlignments as align}
            <button
              class="align-btn"
              class:active={textData.textAlign === align.value}
              on:click={() => handleInputChange('textAlign', align.value)}
              title={align.name}
            >
              {align.icon}
            </button>
          {/each}
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="input-group">
        <label>빠른 스타일</label>
        <div class="preset-grid">
          <button class="preset-btn" on:click={() => applyPreset('title')}>
            제목
          </button>
          <button class="preset-btn" on:click={() => applyPreset('subtitle')}>
            부제목
          </button>
          <button class="preset-btn" on:click={() => applyPreset('body')}>
            본문
          </button>
          <button class="preset-btn" on:click={() => applyPreset('caption')}>
            캡션
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Style Tab -->
  {#if activeTab === 'style'}
    <div class="tab-content" transition:slide={{ duration: 200 }}>
      <!-- Text Color -->
      <div class="input-group">
        <label>텍스트 색상</label>
        <div class="color-input">
          <input
            type="color"
            bind:value={textData.color}
            on:input={() => updateText()}
          />
          <input
            type="text"
            bind:value={textData.color}
            on:input={() => updateText()}
            placeholder="#ffffff"
          />
        </div>
        <div class="color-presets">
          {#each colorPresets as color}
            <button
              class="color-preset"
              style="background-color: {color}"
              on:click={() => handleInputChange('color', color)}
            ></button>
          {/each}
        </div>
      </div>

      <!-- Line Height -->
      <div class="input-group">
        <label>줄 간격: {textData.lineHeight}</label>
        <input
          type="range"
          min="0.8"
          max="3"
          step="0.1"
          bind:value={textData.lineHeight}
          on:input={() => updateText()}
        />
      </div>

      <!-- Letter Spacing -->
      <div class="input-group">
        <label>자간: {textData.letterSpacing}px</label>
        <input
          type="range"
          min="-5"
          max="20"
          step="0.5"
          bind:value={textData.letterSpacing}
          on:input={() => updateText()}
        />
      </div>

      <!-- Text Transform -->
      <div class="input-group">
        <label>대소문자</label>
        <select
          bind:value={textData.textTransform}
          on:change={() => updateText()}
        >
          {#each textTransforms as transform}
            <option value={transform.value}>{transform.name}</option>
          {/each}
        </select>
      </div>

      <!-- Text Decoration -->
      <div class="input-group">
        <label>텍스트 장식</label>
        <div class="button-group">
          <button
            class="decoration-btn"
            class:active={textData.textDecoration.includes('underline')}
            on:click={() => {
              const decorations = textData.textDecoration.split(' ').filter((d: string) => d !== 'underline');
              if (!textData.textDecoration.includes('underline')) {
                decorations.push('underline');
              }
              handleInputChange('textDecoration', decorations.join(' ') || 'none');
            }}
          >
            U̲
          </button>
          <button
            class="decoration-btn"
            class:active={textData.textDecoration.includes('line-through')}
            on:click={() => {
              const decorations = textData.textDecoration.split(' ').filter((d: string) => d !== 'line-through');
              if (!textData.textDecoration.includes('line-through')) {
                decorations.push('line-through');
              }
              handleInputChange('textDecoration', decorations.join(' ') || 'none');
            }}
          >
            S̶
          </button>
          <button
            class="decoration-btn"
            class:active={textData.textDecoration.includes('overline')}
            on:click={() => {
              const decorations = textData.textDecoration.split(' ').filter((d: string) => d !== 'overline');
              if (!textData.textDecoration.includes('overline')) {
                decorations.push('overline');
              }
              handleInputChange('textDecoration', decorations.join(' ') || 'none');
            }}
          >
            O̅
          </button>
        </div>
      </div>

      <!-- Background -->
      <div class="input-group">
        <label>배경</label>
        <div class="color-input">
          <input
            type="color"
            bind:value={textData.background}
            on:input={() => updateText()}
          />
          <input
            type="text"
            bind:value={textData.background}
            on:input={() => updateText()}
            placeholder="transparent"
          />
        </div>
      </div>

      <!-- Padding -->
      <div class="input-group">
        <label>여백: {textData.padding}px</label>
        <input
          type="range"
          min="0"
          max="50"
          bind:value={textData.padding}
          on:input={() => updateText()}
        />
      </div>

      <!-- Border Radius -->
      <div class="input-group">
        <label>모서리: {textData.borderRadius}px</label>
        <input
          type="range"
          min="0"
          max="50"
          bind:value={textData.borderRadius}
          on:input={() => updateText()}
        />
      </div>
    </div>
  {/if}

  <!-- Effects Tab -->
  {#if activeTab === 'effects'}
    <div class="tab-content" transition:slide={{ duration: 200 }}>
      <!-- Text Shadow -->
      <div class="input-group">
        <label>텍스트 그림자</label>
        <input
          type="text"
          bind:value={textData.textShadow}
          on:input={() => updateText()}
          placeholder="2px 2px 4px rgba(0,0,0,0.8)"
        />
        
        <!-- Shadow Presets -->
        <div class="shadow-presets">
          <button
            class="shadow-btn"
            on:click={() => handleInputChange('textShadow', 'none')}
          >
            없음
          </button>
          <button
            class="shadow-btn"
            on:click={() => handleInputChange('textShadow', '2px 2px 4px rgba(0,0,0,0.8)')}
          >
            기본
          </button>
          <button
            class="shadow-btn"
            on:click={() => handleInputChange('textShadow', '0 0 10px #00ffff, 0 0 20px #00ffff')}
          >
            네온
          </button>
          <button
            class="shadow-btn"
            on:click={() => handleInputChange('textShadow', '0 0 10px #ffd700, 2px 2px 4px rgba(0,0,0,0.8)')}
          >
            골드
          </button>
        </div>
      </div>

      <!-- Animation -->
      <div class="input-group">
        <label>애니메이션</label>
        <select
          bind:value={textData.animation}
          on:change={() => updateText()}
        >
          {#each animations as animation}
            <option value={animation.value}>{animation.name}</option>
          {/each}
        </select>
      </div>

      <!-- Special Effects Presets -->
      <div class="input-group">
        <label>특수 효과</label>
        <div class="effect-grid">
          <button
            class="effect-btn neon"
            on:click={() => applyPreset('neon')}
          >
            네온
          </button>
          <button
            class="effect-btn gold"
            on:click={() => applyPreset('gold')}
          >
            골드
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Live Preview -->
  <div class="preview-section">
    <label>미리보기</label>
    <div class="text-preview">
      <div
        class="preview-text"
        style="
          font-size: {textData.fontSize}px;
          font-family: {textData.fontFamily};
          font-weight: {textData.fontWeight};
          color: {textData.color};
          text-align: {textData.textAlign};
          line-height: {textData.lineHeight};
          letter-spacing: {textData.letterSpacing}px;
          text-decoration: {textData.textDecoration};
          text-transform: {textData.textTransform};
          text-shadow: {textData.textShadow};
          background: {textData.background};
          padding: {textData.padding}px;
          border-radius: {textData.borderRadius}px;
          animation: {textData.animation};
        "
      >
        {textData.content}
      </div>
    </div>
  </div>
</div>

<style>
  .text-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    color: #ffffff;
  }

  .tab-nav {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tab-btn {
    flex: 1;
    padding: 12px 8px;
    background: transparent;
    border: none;
    color: #86868b;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
  }

  .tab-btn.active {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
  }

  .tab-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #ebebf5;
  }

  .input-group input,
  .input-group select,
  .input-group textarea {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
  }

  .input-group input:focus,
  .input-group select:focus,
  .input-group textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .input-group textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .color-input {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-input input[type="color"] {
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .color-input input[type="text"] {
    flex: 1;
  }

  .color-presets {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    margin-top: 8px;
  }

  .color-preset {
    width: 30px;
    height: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .color-preset:hover {
    transform: scale(1.1);
  }

  .button-group {
    display: flex;
    gap: 4px;
  }

  .align-btn,
  .decoration-btn {
    flex: 1;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .align-btn:hover,
  .decoration-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .align-btn.active,
  .decoration-btn.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }

  .preset-grid,
  .effect-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .preset-btn,
  .effect-btn {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .preset-btn:hover,
  .effect-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .shadow-presets {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
    margin-top: 8px;
  }

  .shadow-btn {
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s ease;
  }

  .shadow-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .effect-btn.neon {
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
  }

  .effect-btn.gold {
    color: #ffd700;
    text-shadow: 0 0 10px #ffd700;
  }

  .preview-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .text-preview {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    margin-top: 8px;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-text {
    max-width: 100%;
    word-wrap: break-word;
  }

  /* Component-specific styles only */

  /* Scrollbar styling */
  .tab-content::-webkit-scrollbar {
    width: 6px;
  }

  .tab-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .tab-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .tab-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>