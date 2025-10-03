<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { messagingService, chats, notifications } from '$lib/services/messagingService';
  import { authService } from '$lib/services/authService';
  import { KBO_TEAMS } from '$lib/data/kboTeams';
  import type { Chat, ChatType, CreateChatRequest } from '$lib/types/messaging';
  import { ChatType as ChatTypeEnum } from '$lib/types/messaging';

  export let selectedChat: Chat | null = null;

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let showCreateModal = false;
  let activeTab: 'all' | 'direct' | 'teams' | 'live' = 'all';
  let filteredChats: Chat[] = [];

  // Filter chats based on search and tab
  $: {
    let filtered = $chats;
    
    // Filter by tab
    if (activeTab !== 'all') {
      const typeMap: Record<string, ChatType> = {
        direct: ChatTypeEnum.DIRECT,
        teams: ChatTypeEnum.TEAM_FANCLUB,
        live: ChatTypeEnum.GAME_LIVE
      };
      if (typeMap[activeTab]) {
        filtered = filtered.filter(chat => chat.type === typeMap[activeTab]);
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chat => 
        chat.name?.toLowerCase().includes(query) ||
        chat.participants.some(p => p.userName.toLowerCase().includes(query))
      );
    }
    
    filteredChats = filtered;
  }

  function selectChat(chat: Chat) {
    dispatch('selectChat', chat);
  }

  function formatLastMessageTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분`;
    if (hours < 24) return `${hours}시간`;
    if (days < 7) return `${days}일`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  function getTeamInfo(teamId: string) {
    return KBO_TEAMS.find(team => team.id === teamId);
  }

  function getChatDisplayName(chat: Chat): string {
    if (chat.name) return chat.name;
    
    if (chat.type === ChatTypeEnum.DIRECT) {
      const currentUser = authService.getCurrentUser();
      const otherParticipant = chat.participants.find(p => p.userId !== currentUser?.id);
      return otherParticipant?.userName || '알 수 없는 사용자';
    }
    
    return '채팅방';
  }

  function getChatAvatar(chat: Chat): string | undefined {
    if (chat.avatar) return chat.avatar;
    
    if (chat.type === ChatTypeEnum.DIRECT) {
      const currentUser = authService.getCurrentUser();
      const otherParticipant = chat.participants.find(p => p.userId !== currentUser?.id);
      return otherParticipant?.userAvatar;
    }
    
    return undefined;
  }

  async function createQuickChat(type: 'team' | 'general') {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      let request: CreateChatRequest;
      
      if (type === 'team' && currentUser.favoriteTeam) {
        const team = currentUser.favoriteTeam;
        request = {
          type: ChatTypeEnum.TEAM_FANCLUB,
          name: `${team.name} 팬클럽`,
          description: `${team.name} 팬들의 채팅방`,
          participants: [],
          settings: {
            isPublic: true,
            allowInvites: true,
            allowCardSharing: true,
            moderationLevel: 'basic'
          },
          teamId: team.id
        };
      } else {
        request = {
          type: ChatTypeEnum.GENERAL,
          name: '전체 채팅',
          description: '모든 야구팬들의 채팅방',
          participants: [],
          settings: {
            isPublic: true,
            allowInvites: true,
            allowCardSharing: true,
            moderationLevel: 'basic'
          }
        };
      }

      const newChat = await messagingService.createChat(request);
      selectChat(newChat);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  }
</script>

<div class="chat-sidebar">
  <!-- Header -->
  <div class="sidebar-header">
    <h2>채팅</h2>
    <button 
      class="create-btn"
      on:click={() => showCreateModal = true}
      title="새 채팅"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
  </div>

  <!-- Search -->
  <div class="search-container">
    <div class="search-input">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input 
        type="text" 
        placeholder="채팅방 검색..."
        bind:value={searchQuery}
      />
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <button 
      class="tab"
      class:active={activeTab === 'all'}
      on:click={() => activeTab = 'all'}
    >
      전체
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'direct'}
      on:click={() => activeTab = 'direct'}
    >
      개인
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'teams'}
      on:click={() => activeTab = 'teams'}
    >
      팀
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'live'}
      on:click={() => activeTab = 'live'}
    >
      실시간
    </button>
  </div>

  <!-- Quick Actions -->
  {#if filteredChats.length === 0 && !searchQuery}
    <div class="quick-actions">
      <button 
        class="quick-action"
        on:click={() => createQuickChat('general')}
      >
        <span class="icon">💬</span>
        <span>전체 채팅 참여</span>
      </button>
      
      {#if authService.getCurrentUser()?.favoriteTeam}
        <button 
          class="quick-action"
          on:click={() => createQuickChat('team')}
        >
          <span class="icon">⚾</span>
          <span>{authService.getCurrentUser()?.favoriteTeam?.name} 팬클럽</span>
        </button>
      {/if}
    </div>
  {/if}

  <!-- Chat List -->
  <div class="chat-list">
    {#each filteredChats as chat (chat.id)}
      <button 
        class="chat-item"
        class:selected={selectedChat?.id === chat.id}
        on:click={() => selectChat(chat)}
      >
        <div class="chat-avatar">
          {#if getChatAvatar(chat)}
            <img src={getChatAvatar(chat)} alt="" />
          {:else if chat.type === ChatTypeEnum.TEAM_FANCLUB}
            <div class="team-avatar" style="background: {getTeamInfo(chat.teamId || '')?.colors.primary}">
              ⚾
            </div>
          {:else if chat.type === ChatTypeEnum.GAME_LIVE}
            <div class="live-avatar">
              🔴
            </div>
          {:else}
            <div class="default-avatar">
              💬
            </div>
          {/if}
          
          {#if chat.unreadCount > 0}
            <div class="unread-badge">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </div>
          {/if}
        </div>

        <div class="chat-info">
          <div class="chat-header">
            <h3 class="chat-name">{getChatDisplayName(chat)}</h3>
            {#if chat.lastMessage}
              <span class="last-time">
                {formatLastMessageTime(chat.lastMessage.createdAt)}
              </span>
            {/if}
          </div>
          
          <div class="chat-preview">
            {#if chat.lastMessage}
              <span class="last-message">
                {#if chat.lastMessage.type === 'sticker'}
                  스티커를 보냈습니다
                {:else if chat.lastMessage.type === 'card_share'}
                  카드를 공유했습니다
                {:else if chat.lastMessage.type === 'cheer'}
                  🎺 {chat.lastMessage.content}
                {:else}
                  {chat.lastMessage.content}
                {/if}
              </span>
            {:else}
              <span class="no-messages">메시지가 없습니다</span>
            {/if}
          </div>
        </div>

        {#if chat.type === ChatTypeEnum.GAME_LIVE}
          <div class="live-indicator">
            <div class="live-dot"></div>
            <span>LIVE</span>
          </div>
        {/if}
      </button>
    {/each}

    {#if filteredChats.length === 0 && searchQuery}
      <div class="no-results">
        <p>검색 결과가 없습니다</p>
        <span>다른 키워드로 검색해보세요</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .chat-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .create-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .create-btn:hover {
    background: var(--primary-hover);
    transform: scale(1.05);
  }

  .search-container {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .search-input {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input svg {
    position: absolute;
    left: 12px;
    color: var(--text-secondary);
    z-index: 1;
  }

  .search-input input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
  }

  .search-input input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .tabs {
    display: flex;
    padding: 0 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .tab {
    flex: 1;
    padding: 12px 8px;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .tab:hover {
    color: var(--text-primary);
  }

  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  .quick-actions {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .quick-action {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .quick-action:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
  }

  .quick-action .icon {
    font-size: 18px;
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .chat-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: none;
    background: none;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
  }

  .chat-item:hover {
    background: var(--bg-tertiary);
  }

  .chat-item.selected {
    background: var(--primary-bg);
    border-right: 3px solid var(--primary-color);
  }

  .chat-avatar {
    position: relative;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .chat-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .team-avatar,
  .live-avatar,
  .default-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: var(--bg-tertiary);
  }

  .live-avatar {
    background: linear-gradient(45deg, #ff4757, #ff6b7a);
    animation: pulse 2s infinite;
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    background: var(--primary-color);
    color: white;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }

  .chat-info {
    flex: 1;
    min-width: 0;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .chat-name {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .last-time {
    font-size: 12px;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .chat-preview {
    font-size: 14px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #ff4757;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff4757;
    animation: pulse 2s infinite;
  }

  .no-results {
    padding: 40px 20px;
    text-align: center;
  }

  .no-results p {
    font-size: 16px;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }

  .no-results span {
    font-size: 14px;
    color: var(--text-secondary);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Scrollbar styling */
  .chat-list::-webkit-scrollbar {
    width: 4px;
  }

  .chat-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  .chat-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
</style>