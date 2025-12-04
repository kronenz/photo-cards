/**
 * Core Data Models for Production Service Integration
 * Feature: 004-production-service-integration
 * Based on data-model.md specification
 */

// ============================================
// Enums
// ============================================

export type Team = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ObtainedVia = 'create' | 'gacha' | 'trade';

export type NotificationType = 'like' | 'comment' | 'follow' | 'gacha' | 'system';

// ============================================
// User Entity
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verified: boolean;
  emailVisibility?: boolean;
  created: string;
  updated: string;
}

// ============================================
// Card Entity
// ============================================

export interface CardStats {
  batting?: number;
  pitching?: number;
  defense?: number;
  speed?: number;
  power?: number;
}

export interface Card {
  id: string;
  title: string;
  subtitle: string;
  team: Team;
  number: string;
  rarity: Rarity;
  image_url: string;
  thumb_url?: string;
  medium_url?: string;
  creator: string;
  is_shared: boolean;
  share_count: number;
  like_count: number;
  comment_count: number;
  stats?: CardStats;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    creator?: User;
  };
}

// ============================================
// UserCard Entity (Collection)
// ============================================

export interface UserCard {
  id: string;
  user: string;
  card: string;
  count: number;
  is_favorite: boolean;
  obtained_at: string;
  obtained_via: ObtainedVia;
  created: string;
  // Expanded relations
  expand?: {
    card?: Card;
    user?: User;
  };
}

// ============================================
// Like Entity
// ============================================

export interface Like {
  id: string;
  user: string;
  card: string;
  created: string;
  // Expanded relations
  expand?: {
    user?: User;
    card?: Card;
  };
}

// ============================================
// Comment Entity
// ============================================

export interface Comment {
  id: string;
  user: string;
  card: string;
  content: string;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    user?: User;
  };
}

// ============================================
// GachaHistory Entity
// ============================================

export interface GachaResult {
  card_id: string;
  rarity: Rarity;
  is_duplicate: boolean;
}

export interface GachaHistory {
  id: string;
  user: string;
  cards: GachaResult[];
  pull_count: 1 | 10;
  timestamp: string;
  created: string;
}

// ============================================
// Notification Entity
// ============================================

export interface LikeNotificationData {
  card_id: string;
  card_title: string;
  liker_id: string;
  liker_name: string;
}

export interface CommentNotificationData {
  card_id: string;
  card_title: string;
  commenter_id: string;
  commenter_name: string;
  comment_preview: string;
}

export interface FollowNotificationData {
  follower_id: string;
  follower_name: string;
}

export interface GachaNotificationData {
  pull_count: number;
  legendary_count: number;
  epic_count: number;
}

export interface SystemNotificationData {
  title: string;
  message: string;
  action_url?: string;
}

export type NotificationData =
  | LikeNotificationData
  | CommentNotificationData
  | FollowNotificationData
  | GachaNotificationData
  | SystemNotificationData;

export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  data: NotificationData;
  is_read: boolean;
  created: string;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CollectionStats {
  totalCards: number;
  totalCount: number;
  byTeam: Record<Team, number>;
  byRarity: Record<Rarity, number>;
  favorites: number;
}

export interface GachaStats {
  totalPulls: number;
  byRarity: Record<Rarity, number>;
  legendaryRate: number;
  pityCounter: number;
  lastLegendary: string | null;
}

// ============================================
// Request Types
// ============================================

export interface CreateCardRequest {
  title: string;
  subtitle?: string;
  team: Team;
  number?: string;
  rarity: Rarity;
  image_url: string;
  thumb_url?: string;
  medium_url?: string;
  stats?: CardStats;
}

export interface UpdateCardRequest {
  title?: string;
  subtitle?: string;
  is_shared?: boolean;
}

export interface CreateCommentRequest {
  content: string;
}

export interface PresignRequest {
  filename: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize?: number;
}

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface ProcessedImageResponse {
  original: string;
  thumbnail: string;
  medium: string;
}

// ============================================
// Auth Types
// ============================================

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
