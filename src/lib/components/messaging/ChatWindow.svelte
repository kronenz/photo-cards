<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import { messagingService, messages, typingUsers } from '$lib/services/messagingService';
  import { authService } from '$lib/services/authService';
  import MessageBubble from './MessageBubble.svelte';
  import MessageInput from './MessageInput.svelte';
  import CheerStickerPanel from './CheerStickerPanel.svelte';
  import type { Chat, ChatMessage, SendMessageRequest, MessageType } from '$lib/types/messaging';

  export let chat: Chat;

  const dispatch = createEventDispatcher();

  let messagesContainer: HTMLElement;
  let chatMessages: ChatMessage[] = [];
  let showStickerPanel = false;
  let isLoadingMessages = false;
  let hasMoreMessages = true;
  let typingTimeout: ReturnType<typeof setTimeout>;

  // Reactive subscriptions
  $: if (chat && $messages[chat.id]) {
    chatMessages = $messages[chat.id];
    scrollToBottom();
  }

  $: currentTypingUsers = $typingUsers[chat?.id] || [];

  onMount(() => {
    loadInitialMessages();
    
    // Auto-scroll to bottom when new messages arrive
    const unsubscribe = messages.subscribe(() => {
      if (chat && $messages[chat.id]) {
        tick().then(() => scrollToBottom());
      }
    });

    return unsubscribe;
  });

  onDestroy(() => {
    // Clear typing indicator when leaving
    if (chat) {
      messagingService.stopTyping(chat.id);
    }
  });

  async function loadInitialMessages() {
    if (!chat || isLoadingMessages) return;
    
    isLoadingMessages = true;
    try {
      await messagingService.loadMessages(chat.id);
      await tick();
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      isLoadingMessages = false;
    }
  }

  async function loadMoreMessages() {
    if (!chat || isLoadingMessages || !hasMoreMessages) return;
    
    isLoadingMessages = true;
    const currentScrollHeight = messagesContainer.scrollHeight;
    
    try {
      const currentMessageCount = chatMessages.length;
      const page = Math.floor(currentMessageCount / 50) + 1;
      
      const newMessages = await messagingService.loadMessages(chat.id, page);
      
      if (newMessages.length === 0) {
        hasMoreMessages = false;
      } else {
        await tick();
        // Maintain scroll position
        const newScrollHeight = messagesContainer.scrollHeight;
        messagesContainer.scrollTop = newScrollHeight - currentScrollHeight;
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      isLoadingMessages = false;
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function handleScroll() {
    if (messagesContainer.scrollTop === 0 && hasMoreMessages) {
      loadMoreMessages();
    }
  }

  async function sendMessage(request: SendMessageRequest) {
    try {
      await messagingService.sendMessage(chat.id, request);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  async function sendCheerMessage(cheerType: string, content: string, intensity: number = 3) {
    try {
      await messagingService.sendCheerMessage(
        chat.id, 
        cheerType as any, 
        content, 
        chat.teamId, 
        intensity
      );
    } catch (error) {
      console.error('Failed to send cheer message:', error);
    }
  }

  async function shareCard(cardId: string, message?: string) {
    try {
      await messagingService.shareCard(chat.id, cardId, message);
    } catch (error) {
      console.error('Failed to share card:', error);
    }
  }

  async function sendSticker(sticker: any) {
    try {
      await messagingService.sendSticker(chat.id, sticker);
      showStickerPanel = false;
    } catch (error) {
      console.error('Failed to send sticker:', error);
    }
  }

  function handleTyping() {
    if (chat) {
      messagingService.startTyping(chat.id);
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeout = setTimeout(() => {
        messagingService.stopTyping(chat.id);
      }, 3000);
    }
  }

  function getChatTitle(): string {
    if (chat.name) return chat.name;
    
    if (chat.type === 'direct') {
      const currentUser = authService.getCurrentUser();
      const otherParticipant = chat.participants.find(p => p.userId !== currentUser?.id);
      return otherParticipant?.userName || '알 수 없는 사용자';
    }
    
    return '채팅방';
  }

  function getChatSubtitle(): string {
    const participantCount = chat.participants.length;
    
    if (chat.type === 'direct') {
      const otherParticipant = chat.participants.find(p => p.userId !== authService.getCurrentUser()?.id);
      return otherParticipant?.isOnline ? '온라인' : '오프라인';
    }
    
    if (chat.type === 'team_fanclub') {
      return `${participantCount}명의 팬`;
    }
    
    if (chat.type === 'game_live') {
      return '실시간 경기 응원';
    }
    
    return `${participantCount}명 참여 중`;
  }

  function groupMessagesByDate(messages: ChatMessage[]): Array<{date: string, messages: ChatMessage[]}> {
    const groups: Array<{date: string, messages: ChatMessage[]}> = [];
    let currentDate = '';
    let currentGroup: ChatMessage[] = [];

    messages.forEach(message => {
      const messageDate = message.createdAt.toDateString();
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }

  function formatDateHeader(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
</script>

<div class="chat-window">
  <!-- Chat Header -->
  <div class="chat-header">
    <button 
      class="back-btn mobile-only"
      on:click={() => dispatch('backToChats')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>

    <div class="chat-info">
      <h2 class="chat-title">{getChatTitle()}</h2>
      <p class="chat-subtitle">{getChatSubtitle()}</p>
    </div>

    <div class="chat-actions">
      {#if chat.type === 'game_live' || chat.type === 'team_fanclub'}
        <button 
          class="action-btn"
          class:active={showStickerPanel}
          on:click={() => showStickerPanel = !showStickerPanel}
          title="응원 스티커"
        >
          🎺
        </button>
      {/if}
      
      <button class="action-btn" title="채팅방 정보">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Messages Area -->
  <div 
    class="messages-container"
    bind:this={messagesContainer}
    on:scroll={handleScroll}
  >
    {#if isLoadingMessages && chatMessages.length === 0}
      <div class="loading-messages">
        <div class="loading-spinner"></div>
        <p>메시지를 불러오는 중...</p>
      </div>
    {/if}

    {#if hasMoreMessages && chatMessages.length > 0}
      <div class="load-more">
        <button 
          class="load-more-btn"
          on:click={loadMoreMessages}
          disabled={isLoadingMessages}
        >
          {isLoadingMessages ? '불러오는 중...' : '이전 메시지 보기'}
        </button>
      </div>
    {/if}

    {#each groupMessagesByDate(chatMessages) as group (group.date)}
      <div class="message-group">
        <div class="date-header">
          <span>{formatDateHeader(group.date)}</span>
        </div>
        
        {#each group.messages as message (message.id)}
          <MessageBubble 
            {message}
            isOwn={message.senderId === authService.getCurrentUser()?.id}
            showAvatar={message.senderId !== authService.getCurrentUser()?.id}
          />
        {/each}
      </div>
    {/each}

    <!-- Typing Indicators -->
    {#if currentTypingUsers.length > 0}
      <div class="typing-indicator">
        <div class="typing-avatar">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <span class="typing-text">
          {currentTypingUsers.join(', ')}님이 입력 중...
        </span>
      </div>
    {/if}
  </div>

  <!-- Sticker Panel -->
  {#if showStickerPanel}
    <div class="sticker-panel">
      <CheerStickerPanel 
        teamId={chat.teamId}
        on:selectSticker={(e) => sendSticker(e.detail)}
        on:close={() => showStickerPanel = false}
      />
    </div>
  {/if}

  <!-- Message Input -->
  <div class="input-container">
    <MessageInput 
      {chat}
      on:sendMessage={(e) => sendMessage(e.detail)}
      on:sendCheer={(e) => sendCheerMessage(e.detail.type, e.detail.content, e.detail.intensity)}
      on:shareCard={(e) => shareCard(e.detail.cardId, e.detail.message)}
      on:typing={handleTyping}
    />
  </div>
</div>

<style>
  .chat-window {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .back-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: var(--bg-quaternary);
  }

  .chat-info {
    flex: 1;
    min-width: 0;
  }

  .chat-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-actions {
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

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    scroll-behavior: smooth;
  }

  .loading-messages {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .load-more {
    text-align: center;
    padding: 16px 20px;
  }

  .load-more-btn {
    padding: 8px 16px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .load-more-btn:hover:not(:disabled) {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .message-group {
    margin-bottom: 24px;
  }

  .date-header {
    text-align: center;
    margin: 16px 0;
  }

  .date-header span {
    display: inline-block;
    padding: 4px 12px;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    border-radius: 12px;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .typing-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .typing-dots {
    display: flex;
    gap: 2px;
  }

  .typing-dots span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text-secondary);
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }

  .sticker-panel {
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .input-container {
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .mobile-only {
      display: flex !important;
    }

    .chat-header {
      padding: 12px 16px;
    }

    .messages-container {
      padding: 12px 0;
    }
  }

  /* Scrollbar styling */
  .messages-container::-webkit-scrollbar {
    width: 4px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  .messages-container::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
</style>