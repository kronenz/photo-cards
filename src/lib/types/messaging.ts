// Real-time Messaging and Cheering Chat System Types

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderGrade: UserGrade;
  content: string;
  type: MessageType;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: string; // 답장 대상 메시지 ID
  // Cheer-specific properties
  cheerType?: CheerType;
  teamId?: string;
  intensity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  CARD_SHARE = 'card_share',
  CHEER = 'cheer',
  STICKER = 'sticker',
  SYSTEM = 'system',
  GAME_UPDATE = 'game_update'
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'card' | 'sticker';
  url: string;
  metadata?: {
    cardId?: string;
    stickerId?: string;
    width?: number;
    height?: number;
  };
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  description?: string;
  avatar?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  settings: ChatSettings;
  teamId?: string; // For team-specific chats
  createdAt: Date;
  updatedAt: Date;
}

export enum ChatType {
  DIRECT = 'direct',           // 1:1 개인 메시지
  GROUP = 'group',             // 그룹 채팅
  TEAM_FANCLUB = 'team_fanclub', // 구단별 팬클럽 채팅
  GAME_LIVE = 'game_live',     // 경기 실시간 응원 채팅
  GENERAL = 'general'          // 전체 커뮤니티 채팅
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  userGrade: UserGrade;
  role: ParticipantRole;
  joinedAt: Date;
  lastReadAt?: Date;
  isOnline: boolean;
}

export enum ParticipantRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export interface ChatSettings {
  isPublic: boolean;
  allowInvites: boolean;
  allowFileSharing: boolean;
  allowCardSharing: boolean;
  moderationLevel: 'none' | 'basic' | 'strict';
  maxParticipants?: number;
}

// KBO 응원 전용 기능
export interface CheerMessage extends ChatMessage {
  cheerType: CheerType;
  teamId?: string;
  intensity: number; // 1-5 응원 강도
}

export enum CheerType {
  CHANT = 'chant',           // 응원가
  RALLY = 'rally',           // 랠리 응원
  CELEBRATION = 'celebration', // 득점 축하
  SUPPORT = 'support',       // 선수 응원
  DEFENSE = 'defense'        // 수비 응원
}

export interface CheerSticker {
  id: string;
  name: string;
  teamId?: string;
  category: 'cheer' | 'emotion' | 'player' | 'action';
  imageUrl: string;
  animationUrl?: string;
  soundUrl?: string;
  isAnimated: boolean;
  isPremium: boolean;
}

export interface GameLiveChat {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  chatId: string;
  currentInning: number;
  gameStatus: 'pre_game' | 'in_progress' | 'post_game';
  score: {
    home: number;
    away: number;
  };
  activeCheerCount: number;
  topCheers: CheerMessage[];
}

// 실시간 알림
export interface ChatNotification {
  id: string;
  chatId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  MENTION = 'mention',
  GAME_START = 'game_start',
  CHEER_RALLY = 'cheer_rally',
  CHAT_INVITE = 'chat_invite'
}

// 사용자 등급 (기존 auth.ts와 동일하지만 메시징 컨텍스트용)
export enum UserGrade {
  ROOKIE = '야구 입문자',
  OUTFIELD_FAN = '외야석 팬',
  CHEER_MEMBER = '응원단 멤버',
  SEASON_HOLDER = '시즌권 홀더',
  TEAM_LEGEND = '구단 레전드'
}

// 메시징 통계
export interface MessagingStats {
  totalChats: number;
  activeChats: number;
  messagesPerDay: number;
  topCheerTeams: {
    teamId: string;
    cheerCount: number;
  }[];
  popularStickers: CheerSticker[];
}

// 채팅방 생성/수정 요청
export interface CreateChatRequest {
  type: ChatType;
  name?: string;
  description?: string;
  participants: string[];
  settings: Partial<ChatSettings>;
  teamId?: string; // 팀 채팅방인 경우
}

export interface UpdateChatRequest {
  name?: string;
  description?: string;
  settings?: Partial<ChatSettings>;
}

// 메시지 전송 요청
export interface SendMessageRequest {
  content: string;
  type: MessageType;
  attachments?: Omit<MessageAttachment, 'id'>[];
  replyTo?: string;
  cheerType?: CheerType;
  teamId?: string;
  intensity?: number;
}

// 실시간 이벤트
export interface ChatEvent {
  type: ChatEventType;
  chatId: string;
  data: any;
  timestamp: Date;
}

export enum ChatEventType {
  MESSAGE_SENT = 'message_sent',
  MESSAGE_EDITED = 'message_edited',
  MESSAGE_DELETED = 'message_deleted',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  USER_TYPING = 'user_typing',
  CHEER_RALLY = 'cheer_rally',
  GAME_UPDATE = 'game_update'
}