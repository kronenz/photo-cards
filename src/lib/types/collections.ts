// Collection and Card related types

export interface Card {
  id: string;
  title: string;
  description?: string;
  image: string;
  backImage?: string;
  rarity: CardRarity;
  type: CardType;
  holographicEffect: HolographicEffect;
  stats: CardStats;
  metadata: CardMetadata;
  collections: string[];
  owner: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export enum CardType {
  PLAYER = 'player',
  TEAM = 'team',
  MOMENT = 'moment',
  STADIUM = 'stadium',
  SPECIAL = 'special'
}

export interface HolographicEffect {
  type: 'rainbow' | 'cosmic' | 'aurora' | 'neon' | 'team-themed';
  intensity: number;
  animationSpeed: number;
  glowColor?: string;
}

export interface CardStats {
  likes: number;
  views: number;
  downloads: number;
  comments: number;
  rating: number;
  ratingCount: number;
}

export interface CardMetadata {
  player?: string;
  team?: string;
  season?: string;
  position?: string;
  gameDate?: Date;
  tags: string[];
  creator: string;
  template?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  type: CollectionType;
  cards: Card[];
  totalCards: number;
  completionPercentage: number;
  theme: CollectionTheme;
  season?: string;
  team?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CollectionType {
  SEASON = 'season',
  TEAM = 'team',
  PLAYER = 'player',
  SPECIAL_EVENT = 'special_event',
  USER_CUSTOM = 'user_custom'
}

export interface CollectionTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  holographicEffect?: HolographicEffect;
}

export interface CollectionProgress {
  id: string;
  name: string;
  totalCards: number;
  ownedCards: number;
  completionPercentage: number;
  theme: 'season' | 'team' | 'player' | 'special';
  rarity: CardRarity;
  isCompleted: boolean;
  recentlyAdded?: Card[];
}

export interface UserStats {
  totalCards: number;
  rareCards: number;
  completedCollections: number;
  fanLevel: string;
  favoriteTeam?: string;
  cardsByRarity: Record<CardRarity, number>;
  recentAcquisitions: Card[];
  collectionProgress: CollectionProgress[];
}

// Rarity display configuration
export const RARITY_CONFIG: Record<CardRarity, {
  name: string;
  koreanName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  [CardRarity.COMMON]: {
    name: 'Common',
    koreanName: '일반',
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#d1d5db',
    glowColor: '#9ca3af'
  },
  [CardRarity.UNCOMMON]: {
    name: 'Uncommon',
    koreanName: '고급',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    glowColor: '#34d399'
  },
  [CardRarity.RARE]: {
    name: 'Rare',
    koreanName: '희귀',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
    glowColor: '#60a5fa'
  },
  [CardRarity.EPIC]: {
    name: 'Epic',
    koreanName: '영웅',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#c4b5fd',
    glowColor: '#a78bfa'
  },
  [CardRarity.LEGENDARY]: {
    name: 'Legendary',
    koreanName: '전설',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    glowColor: '#fb923c'
  },
  [CardRarity.MYTHIC]: {
    name: 'Mythic',
    koreanName: '신화',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    glowColor: '#f87171'
  }
};

// Collection type display configuration
export const COLLECTION_TYPE_CONFIG: Record<CollectionType, {
  name: string;
  koreanName: string;
  icon: string;
  color: string;
}> = {
  [CollectionType.SEASON]: {
    name: 'Season',
    koreanName: '시즌',
    icon: '🏆',
    color: '#f59e0b'
  },
  [CollectionType.TEAM]: {
    name: 'Team',
    koreanName: '구단',
    icon: '⚾',
    color: '#3b82f6'
  },
  [CollectionType.PLAYER]: {
    name: 'Player',
    koreanName: '선수',
    icon: '👤',
    color: '#10b981'
  },
  [CollectionType.SPECIAL_EVENT]: {
    name: 'Special Event',
    koreanName: '특별 이벤트',
    icon: '✨',
    color: '#8b5cf6'
  },
  [CollectionType.USER_CUSTOM]: {
    name: 'Custom',
    koreanName: '사용자 정의',
    icon: '📁',
    color: '#6b7280'
  }
};