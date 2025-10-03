<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { messagingService, chats, activeChat, messages, isConnected } from '$lib/services/messagingService';
  import { authService } from '$lib/services/authService';
  import ChatSidebar from './ChatSidebar.svelte';
  import ChatWindow from './ChatWindow.svelte';
  import CheerPanel from './CheerPanel.svelte';
  import type { Chat, ChatType } from '$lib/types/messaging';

  export let initialChatId: string | undefined = undefined;
  export let showCheerPanel: boolean = true;

  let selectedChat: Chat | null = null;
  let isMobile = false;
  let showSidebar = true;

  // Reactive subscriptions
  $: if ($activeChat) {
    selectedChat = $activeChat;
  }

  onMount(() => {
    // Check if mobile
    isMobile = window.innerWidth < 768;
    
    // Handle window resize
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) {
        showSidebar = true;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Load initial chat if provided
    if (initialChatId) {
      loadInitialChat(initialChatId);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  async function loadInitialChat(chatId: string) {
    try {
      const chat = $chats.find(c => c.id === chatId);
      if (chat) {
        await selectChat(chat);
      }
    } catch (error) {
      console.error('Failed to load initial chat:', error);
    }
  }

  async function selectChat(chat: Chat) {
    selectedChat = chat;
    activeChat.set(chat);
    
    // Load messages for the chat
    await messagingService.loadMessages(chat.id);
    
    // Mark as read
    await messagingService.markAsRead(chat.id);
    
    // Hide sidebar on mobile after selection
    if (isMobile) {
      showSidebar = false;
    }
  }

  function toggleSidebar() {
    showSidebar = !showSidebar;
  }

  function handleBackToChats() {
    if (isMobile) {
      showSidebar = true;
      selectedChat = null;
      activeChat.set(null);
    }
  }
</script>

<div class="chat-interface">
  <!-- Connection Status -->
  {#if !$isConnected}
    <div class="connection-banner">
      <div class="connection-status">
        <div class="status-indicator offline"></div>
        <span>연결 중...</span>
      </div>
    </div>
  {/if}

  <div class="chat-container" class:mobile={isMobile}>
    <!-- Chat Sidebar -->
    <div 
      class="sidebar-container" 
      class:hidden={isMobile && !showSidebar}
    >
      <ChatSidebar 
        {selectedChat}
        on:selectChat={(e) => selectChat(e.detail)}
        on:toggleSidebar={toggleSidebar}
      />
    </div>

    <!-- Main Chat Area -->
    <div 
      class="main-container"
      class:hidden={isMobile && showSidebar}
    >
      {#if selectedChat}
        <ChatWindow 
          chat={selectedChat}
          on:backToChats={handleBackToChats}
        />
      {:else}
        <div class="no-chat-selected">
          <div class="welcome-message">
            <h2>⚾ KBO 팬 채팅</h2>
            <p>채팅방을 선택하여 다른 야구팬들과 대화해보세요!</p>
            <div class="features">
              <div class="feature">
                <span class="icon">💬</span>
                <span>실시간 채팅</span>
              </div>
              <div class="feature">
                <span class="icon">🎺</span>
                <span>응원 스티커</span>
              </div>
              <div class="feature">
                <span class="icon">🃏</span>
                <span>카드 공유</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Cheer Panel (Desktop only) -->
    {#if showCheerPanel && !isMobile && selectedChat?.type === 'game_live'}
      <div class="cheer-panel-container">
        <CheerPanel chatId={selectedChat.id} />
      </div>
    {/if}
  </div>
</div>

<style>
  .chat-interface {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .connection-banner {
    background: var(--warning-bg);
    border-bottom: 1px solid var(--warning-border);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--warning-text);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color);
  }

  .status-indicator.offline {
    background: var(--warning-color);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .chat-container {
    flex: 1;
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
  }

  .chat-container.mobile {
    grid-template-columns: 1fr;
  }

  .sidebar-container {
    border-right: 1px solid var(--border-color);
    background: var(--bg-secondary);
    overflow: hidden;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .cheer-panel-container {
    width: 280px;
    border-left: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .hidden {
    display: none;
  }

  .no-chat-selected {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .welcome-message {
    text-align: center;
    max-width: 400px;
  }

  .welcome-message h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  .welcome-message p {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 32px;
    line-height: 1.5;
  }

  .features {
    display: flex;
    gap: 24px;
    justify-content: center;
  }

  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-radius: 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
  }

  .feature .icon {
    font-size: 24px;
  }

  .feature span:last-child {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .chat-container {
      grid-template-columns: 1fr;
    }
    
    .features {
      flex-direction: column;
      gap: 16px;
    }
    
    .feature {
      flex-direction: row;
      justify-content: flex-start;
      text-align: left;
    }
  }

  /* Dark theme adjustments */
  :global(.dark) .chat-interface {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #3a3a3a;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --border-color: #404040;
    --warning-bg: #2d1b1b;
    --warning-border: #4a2c2c;
    --warning-text: #ff9999;
    --warning-color: #ff6b6b;
    --success-color: #51cf66;
  }

  /* Light theme */
  :global(.light) .chat-interface {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #f1f3f4;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --border-color: #e1e5e9;
    --warning-bg: #fff3cd;
    --warning-border: #ffeaa7;
    --warning-text: #856404;
    --warning-color: #ffc107;
    --success-color: #28a745;
  }
</style>