<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Chat, SendMessageRequest } from '$lib/types/messaging';
  import { MessageType, CheerType } from '$lib/types/messaging';

  export let chat: Chat;

  const dispatch = createEventDispatcher();

  let messageInput: HTMLTextAreaElement;
  let message = '';
  let isComposing = false;
  let showCheerMenu = false;
  let showCardPicker = false;

  const cheerTypes = [
    { type: 'chant', name: '응원가', icon: '🎵', description: '팀 응원가로 응원하기' },
    { type: 'rally', name: '랠리', icon: '📢', description: '랠리 응원으로 분위기 띄우기' },
    { type: 'celebration', name: '축하', icon: '🎉', description: '득점이나 좋은 플레이 축하' },
    { type: 'support', name: '응원', icon: '👏', description: '선수 개인 응원' },
    { type: 'defense', name: '수비', icon: '🛡️', description: '수비 응원' }
  ];

  onMount(() => {
    // Auto-resize textarea
    const resizeTextarea = () => {
      if (messageInput) {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
      }
    };

    messageInput?.addEventListener('input', resizeTextarea);
    return () => messageInput?.removeEventListener('input', resizeTextarea);
  });

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleInput() {
    dispatch('typing');
  }

  function sendMessage() {
    if (!message.trim()) return;

    const request: SendMessageRequest = {
      content: message.trim(),
      type: 'text' as MessageType
    };

    dispatch('sendMessage', request);
    message = '';
    
    // Reset textarea height
    if (messageInput) {
      messageInput.style.height = 'auto';
    }
  }

  function sendCheerMessage(cheerType: CheerType, intensity: number = 3) {
    if (!message.trim()) return;

    dispatch('sendCheer', {
      type: cheerType,
      content: message.trim(),
      intensity
    });

    message = '';
    showCheerMenu = false;
    
    if (messageInput) {
      messageInput.style.height = 'auto';
    }
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.type.startsWith('image/')) {
        // Handle image upload
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          
          const request: SendMessageRequest = {
            content: message.trim() || '이미지를 공유했습니다',
            type: 'image' as MessageType,
            attachments: [{
              type: 'image',
              url: imageUrl
            }]
          };
          
          dispatch('sendMessage', request);
          message = '';
        };
        reader.readAsDataURL(file);
      }
    }
    
    // Reset file input
    target.value = '';
  }

  function insertCheerText(cheerType: string) {
    const cheerTexts = {
      chant: '🎵 응원가를 불러요! ',
      rally: '📢 모두 함께 응원해요! ',
      celebration: '🎉 축하합니다! ',
      support: '👏 파이팅! ',
      defense: '🛡️ 수비 화이팅! '
    };
    
    message = (cheerTexts[cheerType as keyof typeof cheerTexts] || '') + message;
    messageInput?.focus();
  }

  function toggleCheerMenu() {
    showCheerMenu = !showCheerMenu;
    showCardPicker = false;
  }

  function toggleCardPicker() {
    showCardPicker = !showCardPicker;
    showCheerMenu = false;
  }
</script>

<div class="message-input-container">
  <!-- Cheer Menu -->
  {#if showCheerMenu}
    <div class="cheer-menu">
      <div class="cheer-header">
        <h4>응원 메시지 보내기</h4>
        <button class="close-btn" on:click={() => showCheerMenu = false}>×</button>
      </div>
      
      <div class="cheer-types">
        {#each cheerTypes as cheer}
          <button 
            class="cheer-type"
            on:click={() => insertCheerText(cheer.type)}
          >
            <span class="cheer-icon">{cheer.icon}</span>
            <div class="cheer-info">
              <span class="cheer-name">{cheer.name}</span>
              <span class="cheer-desc">{cheer.description}</span>
            </div>
          </button>
        {/each}
      </div>
      
      {#if message.trim()}
        <div class="cheer-intensity">
          <span>응원 강도:</span>
          <div class="intensity-buttons">
            {#each [1, 2, 3, 4, 5] as intensity}
              <button 
                class="intensity-btn"
                on:click={() => sendCheerMessage(CheerType.CHANT, intensity)}
              >
{#each new Array(intensity).fill(0) as _}⭐{/each}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Card Picker -->
  {#if showCardPicker}
    <div class="card-picker">
      <div class="picker-header">
        <h4>카드 공유하기</h4>
        <button class="close-btn" on:click={() => showCardPicker = false}>×</button>
      </div>
      
      <div class="recent-cards">
        <p>최근 제작한 카드</p>
        <!-- This would show user's recent cards -->
        <div class="card-grid">
          <div class="card-item">
            <div class="card-thumbnail">🃏</div>
            <span>홈런 카드</span>
          </div>
          <div class="card-item">
            <div class="card-thumbnail">⚾</div>
            <span>응원 카드</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Input Area -->
  <div class="input-area">
    <!-- Action Buttons -->
    <div class="input-actions">
      <input 
        type="file" 
        id="file-upload" 
        accept="image/*" 
        style="display: none;"
        on:change={handleFileUpload}
      />
      
      <button 
        class="action-btn"
        on:click={() => document.getElementById('file-upload')?.click()}
        title="이미지 첨부"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
      </button>

      {#if chat.type === 'game_live' || chat.type === 'team_fanclub'}
        <button 
          class="action-btn cheer-btn"
          class:active={showCheerMenu}
          on:click={toggleCheerMenu}
          title="응원 메시지"
        >
          🎺
        </button>
      {/if}

      {#if chat.settings.allowCardSharing}
        <button 
          class="action-btn"
          class:active={showCardPicker}
          on:click={toggleCardPicker}
          title="카드 공유"
        >
          🃏
        </button>
      {/if}
    </div>

    <!-- Text Input -->
    <div class="text-input-container">
      <textarea
        bind:this={messageInput}
        bind:value={message}
        placeholder={chat.type === 'game_live' ? '응원 메시지를 입력하세요...' : '메시지를 입력하세요...'}
        rows="1"
        on:keydown={handleKeyDown}
        on:input={handleInput}
        on:compositionstart={() => isComposing = true}
        on:compositionend={() => isComposing = false}
      ></textarea>
      
      <button 
        class="send-btn"
        class:active={message.trim()}
        disabled={!message.trim()}
        on:click={sendMessage}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Quick Reactions (for game live chats) -->
  {#if chat.type === 'game_live'}
    <div class="quick-reactions">
      <button class="quick-reaction" on:click={() => sendCheerMessage(CheerType.CELEBRATION)}>
        🎉 득점!
      </button>
      <button class="quick-reaction" on:click={() => sendCheerMessage(CheerType.SUPPORT)}>
        👏 파이팅!
      </button>
      <button class="quick-reaction" on:click={() => sendCheerMessage(CheerType.RALLY)}>
        📢 응원!
      </button>
      <button class="quick-reaction" on:click={() => sendCheerMessage(CheerType.DEFENSE)}>
        🛡️수비!
      </button>
    </div>
  {/if}
</div>

<style>
  .message-input-container {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
  }

  .cheer-menu,
  .card-picker {
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-primary);
    max-height: 300px;
    overflow-y: auto;
  }

  .cheer-header,
  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .cheer-header h4,
  .picker-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .cheer-types {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cheer-type {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .cheer-type:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
  }

  .cheer-icon {
    font-size: 20px;
  }

  .cheer-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cheer-name {
    font-weight: 500;
    font-size: 14px;
  }

  .cheer-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .cheer-intensity {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cheer-intensity span {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .intensity-buttons {
    display: flex;
    gap: 8px;
  }

  .intensity-btn {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .intensity-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .recent-cards {
    padding: 16px 20px;
  }

  .recent-cards p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }

  .card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .card-item:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
  }

  .card-thumbnail {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: var(--bg-tertiary);
    border-radius: 6px;
  }

  .card-item span {
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
  }

  .input-area {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 16px 20px;
  }

  .input-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
  }

  .action-btn:hover {
    background: var(--bg-quaternary);
    color: var(--text-primary);
  }

  .action-btn.active {
    background: var(--primary-color);
    color: white;
  }

  .cheer-btn {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .text-input-container {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 8px 12px;
    transition: all 0.2s ease;
  }

  .text-input-container:focus-within {
    border-color: var(--primary-color);
  }

  textarea {
    flex: 1;
    border: none;
    background: none;
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.4;
    resize: none;
    outline: none;
    min-height: 20px;
    max-height: 120px;
    font-family: inherit;
  }

  textarea::placeholder {
    color: var(--text-secondary);
  }

  .send-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: var(--text-secondary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.5;
  }

  .send-btn.active {
    background: var(--primary-color);
    opacity: 1;
    transform: scale(1.05);
  }

  .send-btn:disabled {
    cursor: not-allowed;
  }

  .quick-reactions {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-primary);
    overflow-x: auto;
  }

  .quick-reaction {
    flex-shrink: 0;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .quick-reaction:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .input-area {
      padding: 12px 16px;
      gap: 8px;
    }

    .input-actions {
      flex-direction: column;
      gap: 4px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
    }

    .quick-reactions {
      padding: 8px 16px;
      gap: 6px;
    }

    .quick-reaction {
      font-size: 11px;
      padding: 4px 8px;
    }
  }

  /* Scrollbar styling */
  .cheer-menu::-webkit-scrollbar,
  .card-picker::-webkit-scrollbar,
  .quick-reactions::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }

  .cheer-menu::-webkit-scrollbar-track,
  .card-picker::-webkit-scrollbar-track,
  .quick-reactions::-webkit-scrollbar-track {
    background: transparent;
  }

  .cheer-menu::-webkit-scrollbar-thumb,
  .card-picker::-webkit-scrollbar-thumb,
  .quick-reactions::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
</style>