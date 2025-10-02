<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let value = '';
  export let placeholder = '텍스트를 입력하세요';
  export let fontSize = 16;
  export let fontWeight = 'normal';
  export let fontFamily = 'Pretendard';
  export let textAlign: 'left' | 'center' | 'right' = 'left';
  export let color = '#000000';
  export let lineHeight = 1.4;
  export let letterSpacing = 0;
  export let textShadow = 'none';
  export let maxLength = 1000;
  export let multiline = true;
  export let editable = true;
  
  // 상태 관리
  let editor: HTMLElement;
  let isEditing = false;
  let selection: Selection | null = null;
  let currentFormat: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  } = {
    bold: false,
    italic: false,
    underline: false
  };
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    change: string;
    formatChange: typeof currentFormat;
    focus: void;
    blur: void;
  }>();
  
  onMount(() => {
    if (!browser || !editable) return;
    
    // 선택 영역 변경 감지
    const handleSelectionChange = () => {
      if (document.activeElement === editor) {
        updateFormatState();
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  });
  
  // 포맷 상태 업데이트
  function updateFormatState() {
    if (!browser) return;
    
    currentFormat = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    };
    
    dispatch('formatChange', currentFormat);
  }
  
  // 텍스트 포맷 적용
  function applyFormat(command: string, value?: string) {
    if (!editable || !browser) return;
    
    document.execCommand(command, false, value);
    updateFormatState();
    handleInput();
  }
  
  // 입력 처리
  function handleInput() {
    if (!editor) return;
    
    const newValue = editor.innerText || '';
    
    // 최대 길이 제한
    if (maxLength && newValue.length > maxLength) {
      editor.innerText = newValue.substring(0, maxLength);
      return;
    }
    
    value = newValue;
    dispatch('change', value);
  }
  
  // 포커스 처리
  function handleFocus() {
    isEditing = true;
    dispatch('focus');
  }
  
  // 블러 처리
  function handleBlur() {
    isEditing = false;
    dispatch('blur');
  }
  
  // 키보드 단축키 처리
  function handleKeyDown(event: KeyboardEvent) {
    if (!editable) return;
    
    // Ctrl/Cmd + B (Bold)
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      applyFormat('bold');
    }
    
    // Ctrl/Cmd + I (Italic)
    if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
      event.preventDefault();
      applyFormat('italic');
    }
    
    // Ctrl/Cmd + U (Underline)
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
      event.preventDefault();
      applyFormat('underline');
    }
    
    // Enter 처리 (단일 라인 모드)
    if (!multiline && event.key === 'Enter') {
      event.preventDefault();
      editor.blur();
    }
  }
  
  // 스타일 계산
  $: editorStyle = `
    font-size: ${fontSize}px;
    font-weight: ${fontWeight};
    font-family: ${fontFamily};
    text-align: ${textAlign};
    color: ${color};
    line-height: ${lineHeight};
    letter-spacing: ${letterSpacing}px;
    text-shadow: ${textShadow};
  `;
</script>

<div class="advanced-text-editor" class:editing={isEditing}>
  <!-- 편집 가능한 텍스트 영역 -->
  <div
    bind:this={editor}
    class="editor-content"
    class:multiline
    class:editable
    contenteditable={editable}
    style={editorStyle}
    on:input={handleInput}
    on:focus={handleFocus}
    on:blur={handleBlur}
    on:keydown={handleKeyDown}
    role="textbox"
    aria-label={placeholder}
    data-placeholder={value ? '' : placeholder}
  >
    {value}
  </div>
  
  <!-- 포맷 도구바 -->
  {#if editable && isEditing}
    <div class="format-toolbar">
      <div class="format-group">
        <button
          class="format-button"
          class:active={currentFormat.bold}
          on:click={() => applyFormat('bold')}
          title="굵게 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        
        <button
          class="format-button"
          class:active={currentFormat.italic}
          on:click={() => applyFormat('italic')}
          title="기울임 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        
        <button
          class="format-button"
          class:active={currentFormat.underline}
          on:click={() => applyFormat('underline')}
          title="밑줄 (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>
      
      <div class="format-group">
        <button
          class="format-button"
          class:active={textAlign === 'left'}
          on:click={() => applyFormat('justifyLeft')}
          title="왼쪽 정렬"
        >
          ⬅️
        </button>
        
        <button
          class="format-button"
          class:active={textAlign === 'center'}
          on:click={() => applyFormat('justifyCenter')}
          title="가운데 정렬"
        >
          ↔️
        </button>
        
        <button
          class="format-button"
          class:active={textAlign === 'right'}
          on:click={() => applyFormat('justifyRight')}
          title="오른쪽 정렬"
        >
          ➡️
        </button>
      </div>
      
      <div class="format-group">
        <input
          type="color"
          class="color-picker"
          bind:value={color}
          title="텍스트 색상"
        />
      </div>
    </div>
  {/if}
  
  <!-- 글자 수 표시 -->
  {#if editable && maxLength}
    <div class="character-count">
      {value.length}/{maxLength}
    </div>
  {/if}
</div>

<style>
  .advanced-text-editor {
    position: relative;
    width: 100%;
  }
  
  .editor-content {
    width: 100%;
    min-height: 40px;
    padding: 12px;
    border: 2px solid transparent;
    border-radius: 8px;
    background: transparent;
    outline: none;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .editor-content.editable {
    cursor: text;
  }
  
  .editor-content.editable:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .editor-content.editable:focus {
    background: var(--apple-surface-primary);
    border-color: var(--apple-accent-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
  
  .editor-content:not(.multiline) {
    white-space: nowrap;
    overflow: hidden;
  }
  
  .editor-content.multiline {
    white-space: pre-wrap;
  }
  
  .editor-content:empty::before {
    content: attr(data-placeholder);
    color: var(--apple-text-tertiary);
    pointer-events: none;
  }
  
  /* 포맷 도구바 */
  .format-toolbar {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 12px;
    box-shadow: var(--apple-shadow-lg);
    z-index: 1000;
    animation: slideDown 0.2s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  .format-group {
    display: flex;
    gap: 4px;
    padding: 0 4px;
    border-right: 1px solid var(--apple-surface-border);
  }
  
  .format-group:last-child {
    border-right: none;
  }
  
  .format-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--apple-text-secondary);
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .format-button:hover {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
  }
  
  .format-button.active {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .color-picker {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
  }
  
  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
    border: none;
    border-radius: 6px;
  }
  
  .color-picker::-webkit-color-swatch {
    border: 2px solid var(--apple-surface-border);
    border-radius: 4px;
  }
  
  /* 글자 수 표시 */
  .character-count {
    position: absolute;
    bottom: -20px;
    right: 0;
    font-size: 11px;
    color: var(--apple-text-tertiary);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .format-toolbar {
      position: fixed;
      top: auto;
      bottom: 20px;
      left: 20px;
      right: 20px;
      transform: none;
      justify-content: center;
    }
    
    .format-group {
      padding: 0 8px;
    }
    
    .format-button {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }
  }
</style>