/**
 * Unified Types for Integrated Holographic Platform
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Unified data models merging Phase 1, 2, 4
 */

// ===== UNIFIED CARD =====

export type HolographicEffect = 'overlay' | 'soft-light' | 'hard-light';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardContext = 'test' | 'main' | 'gallery' | 'community';

export interface UnifiedCard {
  // Common fields
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;

  // Phase 1: Enhanced Card Interaction
  holographic: {
    image: string; // Front image URL
    backImage: string; // Back image URL
    effect: HolographicEffect;
    intensity: number; // 0-100
    isFlipped: boolean;
    animationDuration: number; // ms (default: 600)
  };

  // Phase 2: Photocard Main Renewal
  photocard: {
    rarity: Rarity;
    stats: {
      totalViews: number;
      uniqueCollectors: number;
      completionRate: number; // %
    };
    collections: string[]; // Collection IDs
    acquiredAt?: Date;
  };

  // Phase 4: Holographic Card Community
  community: {
    creator: string; // User ID
    isPublic: boolean;
    tags: string[];
    template?: string; // Template ID
    metadata: {
      likes: number;
      downloads: number;
      rating: number; // 1-5
      ratingCount: number;
    };
  };

  // Context support
  context?: CardContext;
}

// ===== UNIFIED USER =====

export type CreatorLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface CollectionProgress {
  collectionId: string;
  totalCards: number;
  ownedCards: number;
  progress: number; // 0-100
}

export interface FanLevel {
  level: number; // 1-5
  name: string;
}

export interface UnifiedUser {
  // Basic profile
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: Date;
  lastLoginAt: Date;

  // KBO Fan Profile
  fanProfile: {
    fanLevel: FanLevel;
    currentPoints: number;
    favoriteTeam: string; // KBOTeam ID
    achievedBadges: string[];
    joinedFanclubs: string[];
  };

  // Creator Profile
  creatorProfile: {
    creatorLevel: CreatorLevel;
    stats: {
      totalCards: number;
      totalLikes: number;
      totalDownloads: number;
      averageRating: number;
      followers: number;
      following: number;
    };
    isVerified: boolean;
    specializations: string[];
  };

  // Collections
  collections: {
    owned: string[]; // Card IDs
    collectionProgress: CollectionProgress[];
    totalCards: number;
    rareCards: number;
  };

  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'kbo-team';
    teamThemeColor?: string; // Hex color
    notifications: {
      newFollower: boolean;
      cardLike: boolean;
      cardComment: boolean;
      levelUp: boolean;
    };
    privacy: {
      showCollections: boolean;
      showActivity: boolean;
    };
  };
}

// ===== COLLECTION =====

export interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnailImage: string;
  cards: string[]; // Card IDs
  totalCards: number;
  completedCount: number;
  rarity: Rarity;

  // Metadata
  createdBy: string; // User ID
  createdAt: Date;
  isOfficial: boolean;
  tags: string[];

  // Rewards
  completionReward: {
    badge: string; // Badge ID
    points: number;
    specialCard?: string; // Exclusive card ID
  };
}

// ===== COMMUNITY POST =====

export interface Comment {
  id: string;
  author: string; // User ID
  content: string;
  likes: string[]; // User IDs
  createdAt: Date;
}

export interface CommunityPost {
  id: string;
  card: string; // Card ID
  author: string; // User ID
  content: string;

  // Engagement
  likes: string[]; // User IDs
  comments: Comment[];
  shares: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isHighlighted: boolean;
  tags: string[];
}

// ===== KBO TEAM =====

export interface KBOTeam {
  id: string;
  name: string; // e.g., 'LG 트윈스'
  nameEn: string; // e.g., 'LG Twins'
  city: string;

  // Branding
  color: string; // Primary color (hex)
  secondaryColor?: string;
  logo: string;
  mascot: {
    name: string;
    image: string;
  };

  // Community
  fanCount: number;
  fanclubId: string;

  // Metadata
  founded: number;
  stadium: string;
  championships: number;
}

// ===== FAN LEVEL (Full) =====

export interface FanLevelFull extends FanLevel {
  requiredPoints: number;
  perks: string[];
  badgeIcon: string;
}

// ===== LEGACY TYPE MIGRATIONS =====

/**
 * Legacy Phase 1 Enhanced Card type
 */
export interface LegacyEnhancedCard {
  id: string;
  title: string;
  image: string;
  backImage: string;
  holographicEffect: 'overlay' | 'soft-light' | 'hard-light';
}

/**
 * Legacy Phase 2 Photocard type
 */
export interface LegacyPhotocardData {
  id: string;
  title: string;
  rarity: Rarity;
  collections: string[];
  acquiredAt?: string; // ISO date string
}

/**
 * Legacy Phase 4 Community Card type
 */
export interface LegacyCommunityCard {
  id: string;
  title: string;
  image: string;
  creator: string;
  tags: string[];
  isPublic: boolean;
  template?: string;
  likes: number;
  downloads: number;
}
