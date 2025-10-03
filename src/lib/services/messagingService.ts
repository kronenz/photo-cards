// Real-time Messaging Service with PocketBase WebSocket Integration

import { pb } from '$lib/pocketbase';
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import type {
  Chat,
  ChatMessage,
  SendMessageRequest,
  CreateChatRequest,
  UpdateChatRequest,
  ChatEvent,
  ChatNotification,
  CheerSticker,
  GameLiveChat,
  MessagingStats
} from '$lib/types/messaging';
import {
  ChatType,
  MessageType,
  CheerType,
  NotificationType,
  ChatEventType
} from '$lib/types/messaging';
import { authService } from './authService';

class MessagingService {
  // Reactive stores
  public chats: Writable<Chat[]> = writable([]);
  public activeChat: Writable<Chat | null> = writable(null);
  public messages: Writable<Record<string, ChatMessage[]>> = writable({});
  public notifications: Writable<ChatNotification[]> = writable([]);
  public onlineUsers: Writable<string[]> = writable([]);
  public typingUsers: Writable<Record<string, string[]>> = writable({});
  public isConnected: Writable<boolean> = writable(false);

  private subscriptions: Map<string, () => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    if (browser) {
      this.initializeMessaging();
    }
  }

  /**
   * Initialize messaging system
   */
  private async initializeMessaging(): Promise<void> {
    try {
      // Wait for authentication
      const unsubscribe = authService.isAuthenticated.subscribe(async (isAuth) => {
        if (isAuth) {
          await this.connectToRealtime();
          await this.loadUserChats();
          unsubscribe();
        }
      });
    } catch (error) {
      console.error('Failed to initialize messaging:', error);
    }
  }

  /**
   * Connect to PocketBase real-time updates
   */
  private async connectToRealtime(): Promise<void> {
    try {
      // Subscribe to chat messages
      const messageUnsubscribe = await pb.collection('chat_messages').subscribe('*', (e) => {
        this.handleMessageEvent(e);
      });
      this.subscriptions.set('messages', messageUnsubscribe);

      // Subscribe to chat updates
      const chatUnsubscribe = await pb.collection('chats').subscribe('*', (e) => {
        this.handleChatEvent(e);
      });
      this.subscriptions.set('chats', chatUnsubscribe);

      // Subscribe to user presence
      const presenceUnsubscribe = await pb.collection('user_presence').subscribe('*', (e) => {
        this.handlePresenceEvent(e);
      });
      this.subscriptions.set('presence', presenceUnsubscribe);

      this.isConnected.set(true);
      this.reconnectAttempts = 0;
      
      console.log('Connected to real-time messaging');
    } catch (error) {
      console.error('Failed to connect to real-time messaging:', error);
      this.handleReconnection();
    }
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connectToRealtime();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.isConnected.set(false);
    }
  }

  /**
   * Load user's chats
   */
  async loadUserChats(): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const records = await pb.collection('chats').getFullList({
        filter: `participants ~ "${currentUser.id}"`,
        expand: 'participants,lastMessage',
        sort: '-updated'
      });

      const chats = records.map(record => this.mapRecordToChat(record));
      this.chats.set(chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }

  /**
   * Create new chat
   */
  async createChat(request: CreateChatRequest): Promise<Chat> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const chatData = {
        type: request.type,
        name: request.name,
        description: request.description,
        participants: [currentUser.id, ...request.participants],
        settings: {
          isPublic: request.settings.isPublic || false,
          allowInvites: request.settings.allowInvites || true,
          allowFileSharing: request.settings.allowFileSharing || true,
          allowCardSharing: request.settings.allowCardSharing || true,
          moderationLevel: request.settings.moderationLevel || 'basic',
          maxParticipants: request.settings.maxParticipants
        },
        teamId: request.teamId,
        createdBy: currentUser.id
      };

      const record = await pb.collection('chats').create(chatData);
      const chat = this.mapRecordToChat(record);

      // Add to local store
      this.chats.update(chats => [chat, ...chats]);

      return chat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  }

  /**
   * Join existing chat
   */
  async joinChat(chatId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const chat = await pb.collection('chats').getOne(chatId);
      const participants = chat.participants || [];
      
      if (!participants.includes(currentUser.id)) {
        await pb.collection('chats').update(chatId, {
          participants: [...participants, currentUser.id]
        });

        // Send system message
        await this.sendSystemMessage(chatId, `${currentUser.displayName}님이 채팅방에 참여했습니다.`);
      }
    } catch (error) {
      console.error('Failed to join chat:', error);
      throw error;
    }
  }

  /**
   * Leave chat
   */
  async leaveChat(chatId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const chat = await pb.collection('chats').getOne(chatId);
      const participants = chat.participants || [];
      
      const updatedParticipants = participants.filter((id: string) => id !== currentUser.id);
      
      await pb.collection('chats').update(chatId, {
        participants: updatedParticipants
      });

      // Send system message
      await this.sendSystemMessage(chatId, `${currentUser.displayName}님이 채팅방을 나갔습니다.`);

      // Remove from local store
      this.chats.update(chats => chats.filter(c => c.id !== chatId));
    } catch (error) {
      console.error('Failed to leave chat:', error);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(chatId: string, request: SendMessageRequest): Promise<ChatMessage> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const messageData = {
        chatId,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        senderAvatar: currentUser.avatar,
        senderGrade: currentUser.grade.koreanName,
        content: request.content,
        type: request.type,
        attachments: request.attachments || [],
        replyTo: request.replyTo,
        cheerType: request.cheerType,
        teamId: request.teamId,
        intensity: request.intensity || 1
      };

      const record = await pb.collection('chat_messages').create(messageData);
      
      // Update chat's last message
      await pb.collection('chats').update(chatId, {
        lastMessage: record.id,
        updated: new Date().toISOString()
      });

      return this.mapRecordToMessage(record);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send cheer message (KBO specific)
   */
  async sendCheerMessage(
    chatId: string, 
    cheerType: CheerType, 
    content: string, 
    teamId?: string,
    intensity: number = 3
  ): Promise<ChatMessage> {
    return this.sendMessage(chatId, {
      content,
      type: MessageType.CHEER,
      cheerType,
      teamId,
      intensity
    });
  }

  /**
   * Send card share message
   */
  async shareCard(chatId: string, cardId: string, message?: string): Promise<ChatMessage> {
    return this.sendMessage(chatId, {
      content: message || '카드를 공유했습니다',
      type: MessageType.CARD_SHARE,
      attachments: [{
        type: 'card',
        url: `/cards/${cardId}`,
        metadata: { cardId }
      }]
    });
  }

  /**
   * Send sticker message
   */
  async sendSticker(chatId: string, sticker: CheerSticker): Promise<ChatMessage> {
    return this.sendMessage(chatId, {
      content: '',
      type: MessageType.STICKER,
      attachments: [{
        type: 'sticker',
        url: sticker.imageUrl,
        metadata: { stickerId: sticker.id }
      }]
    });
  }

  /**
   * Load messages for chat
   */
  async loadMessages(chatId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const records = await pb.collection('chat_messages').getList(page, limit, {
        filter: `chatId = "${chatId}"`,
        sort: '-created'
      });

      const messages = records.items.map(record => this.mapRecordToMessage(record));
      
      // Update local store
      this.messages.update(msgs => ({
        ...msgs,
        [chatId]: [...(msgs[chatId] || []), ...messages.reverse()]
      }));

      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      await pb.collection('chat_participants').update(`${chatId}_${currentUser.id}`, {
        lastReadAt: new Date().toISOString()
      });

      // Update local unread count
      this.chats.update(chats => 
        chats.map(chat => 
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  /**
   * Start typing indicator
   */
  async startTyping(chatId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      await pb.collection('typing_indicators').create({
        chatId,
        userId: currentUser.id,
        userName: currentUser.displayName,
        expiresAt: new Date(Date.now() + 5000).toISOString() // 5초 후 만료
      });
    } catch (error) {
      // Typing indicators are not critical, so we don't throw
      console.warn('Failed to send typing indicator:', error);
    }
  }

  /**
   * Stop typing indicator
   */
  async stopTyping(chatId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      await pb.collection('typing_indicators').delete(`${chatId}_${currentUser.id}`);
    } catch (error) {
      // Typing indicators are not critical
      console.warn('Failed to stop typing indicator:', error);
    }
  }

  /**
   * Get available cheer stickers
   */
  async getCheerStickers(teamId?: string): Promise<CheerSticker[]> {
    try {
      const filter = teamId ? `teamId = "${teamId}" || teamId = ""` : 'teamId = ""';
      const records = await pb.collection('cheer_stickers').getFullList({
        filter,
        sort: 'category,name'
      });

      return records.map(record => ({
        id: record.id,
        name: record.name,
        teamId: record.teamId,
        category: record.category,
        imageUrl: pb.files.getUrl(record, record.image),
        animationUrl: record.animation ? pb.files.getUrl(record, record.animation) : undefined,
        soundUrl: record.sound ? pb.files.getUrl(record, record.sound) : undefined,
        isAnimated: !!record.animation,
        isPremium: record.isPremium || false
      }));
    } catch (error) {
      console.error('Failed to load cheer stickers:', error);
      return this.getMockCheerStickers(teamId);
    }
  }

  /**
   * Create game live chat
   */
  async createGameLiveChat(gameId: string, homeTeamId: string, awayTeamId: string): Promise<GameLiveChat> {
    try {
      const chat = await this.createChat({
        type: ChatType.GAME_LIVE,
        name: `${homeTeamId} vs ${awayTeamId} 실시간 응원`,
        description: '경기 실시간 응원 채팅방',
        participants: [],
        settings: {
          isPublic: true,
          allowInvites: true,
          allowCardSharing: true,
          moderationLevel: 'basic'
        }
      });

      const gameLiveChat: GameLiveChat = {
        gameId,
        homeTeamId,
        awayTeamId,
        chatId: chat.id,
        currentInning: 1,
        gameStatus: 'pre_game',
        score: { home: 0, away: 0 },
        activeCheerCount: 0,
        topCheers: []
      };

      return gameLiveChat;
    } catch (error) {
      console.error('Failed to create game live chat:', error);
      throw error;
    }
  }

  /**
   * Get messaging statistics
   */
  async getMessagingStats(): Promise<MessagingStats> {
    try {
      // This would be implemented with proper analytics
      return {
        totalChats: 1250,
        activeChats: 89,
        messagesPerDay: 3420,
        topCheerTeams: [
          { teamId: 'lg-twins', cheerCount: 456 },
          { teamId: 'doosan-bears', cheerCount: 389 },
          { teamId: 'kia-tigers', cheerCount: 321 }
        ],
        popularStickers: await this.getCheerStickers()
      };
    } catch (error) {
      console.error('Failed to get messaging stats:', error);
      throw error;
    }
  }

  /**
   * Send system message
   */
  private async sendSystemMessage(chatId: string, content: string): Promise<void> {
    try {
      await pb.collection('chat_messages').create({
        chatId,
        senderId: 'system',
        senderName: 'System',
        content,
        type: MessageType.SYSTEM
      });
    } catch (error) {
      console.error('Failed to send system message:', error);
    }
  }

  /**
   * Handle real-time message events
   */
  private handleMessageEvent(event: any): void {
    const message = this.mapRecordToMessage(event.record);
    
    if (event.action === 'create') {
      this.messages.update(msgs => ({
        ...msgs,
        [message.chatId]: [...(msgs[message.chatId] || []), message]
      }));

      // Update chat's last message
      this.chats.update(chats =>
        chats.map(chat =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message, unreadCount: chat.unreadCount + 1 }
            : chat
        )
      );

      // Create notification if not from current user
      const currentUser = authService.getCurrentUser();
      if (currentUser && message.senderId !== currentUser.id) {
        this.createNotification({
          chatId: message.chatId,
          type: NotificationType.NEW_MESSAGE,
          title: message.senderName,
          message: message.content
        });
      }
    }
  }

  /**
   * Handle real-time chat events
   */
  private handleChatEvent(event: any): void {
    const chat = this.mapRecordToChat(event.record);
    
    if (event.action === 'create') {
      this.chats.update(chats => [chat, ...chats]);
    } else if (event.action === 'update') {
      this.chats.update(chats =>
        chats.map(c => c.id === chat.id ? chat : c)
      );
    } else if (event.action === 'delete') {
      this.chats.update(chats => chats.filter(c => c.id !== chat.id));
    }
  }

  /**
   * Handle user presence events
   */
  private handlePresenceEvent(event: any): void {
    if (event.action === 'create' || event.action === 'update') {
      this.onlineUsers.update(users => {
        const newUsers = [...users];
        if (!newUsers.includes(event.record.userId)) {
          newUsers.push(event.record.userId);
        }
        return newUsers;
      });
    } else if (event.action === 'delete') {
      this.onlineUsers.update(users => 
        users.filter(id => id !== event.record.userId)
      );
    }
  }

  /**
   * Create notification
   */
  private createNotification(data: Omit<ChatNotification, 'id' | 'isRead' | 'createdAt'>): void {
    const notification: ChatNotification = {
      id: Date.now().toString(),
      ...data,
      isRead: false,
      createdAt: new Date()
    };

    this.notifications.update(notifications => [notification, ...notifications]);
  }

  /**
   * Map PocketBase record to Chat
   */
  private mapRecordToChat(record: any): Chat {
    return {
      id: record.id,
      type: record.type,
      name: record.name,
      description: record.description,
      avatar: record.avatar ? pb.files.getUrl(record, record.avatar) : undefined,
      participants: record.expand?.participants || [],
      lastMessage: record.expand?.lastMessage ? this.mapRecordToMessage(record.expand.lastMessage) : undefined,
      unreadCount: 0, // This would be calculated based on lastReadAt
      isActive: true,
      settings: record.settings || {},
      createdAt: new Date(record.created),
      updatedAt: new Date(record.updated)
    };
  }

  /**
   * Map PocketBase record to ChatMessage
   */
  private mapRecordToMessage(record: any): ChatMessage {
    return {
      id: record.id,
      chatId: record.chatId,
      senderId: record.senderId,
      senderName: record.senderName,
      senderAvatar: record.senderAvatar,
      senderGrade: record.senderGrade,
      content: record.content,
      type: record.type,
      attachments: record.attachments || [],
      reactions: record.reactions || [],
      isEdited: record.isEdited || false,
      editedAt: record.editedAt ? new Date(record.editedAt) : undefined,
      replyTo: record.replyTo,
      createdAt: new Date(record.created),
      updatedAt: new Date(record.updated)
    };
  }

  /**
   * Mock cheer stickers for development
   */
  private getMockCheerStickers(teamId?: string): CheerSticker[] {
    return [
      {
        id: '1',
        name: '파이팅!',
        category: 'cheer',
        imageUrl: '/stickers/fighting.png',
        isAnimated: false,
        isPremium: false
      },
      {
        id: '2',
        name: '홈런!',
        category: 'action',
        imageUrl: '/stickers/homerun.gif',
        isAnimated: true,
        isPremium: false
      },
      {
        id: '3',
        name: '응원',
        teamId: teamId,
        category: 'cheer',
        imageUrl: '/stickers/cheer.png',
        soundUrl: '/sounds/cheer.mp3',
        isAnimated: false,
        isPremium: true
      }
    ];
  }

  /**
   * Cleanup subscriptions
   */
  destroy(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const messagingService = new MessagingService();

// Export stores for reactive usage
export const { 
  chats, 
  activeChat, 
  messages, 
  notifications, 
  onlineUsers, 
  typingUsers, 
  isConnected 
} = messagingService;