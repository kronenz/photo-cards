# Data Model: Integrated Holographic Platform

**Feature**: 002-integrated-holographic-platform
**Date**: 2025-10-07
**Status**: Draft
**Input**: [spec.md](./spec.md), Phase 1, 2, 4 requirements

## Overview

This document defines the unified data models that merge Phase 1 (Enhanced Card Interaction), Phase 2 (Photocard Main Renewal), and Phase 4 (Holographic Card Community) entities. The integration strategy preserves backward compatibility while creating a cohesive data layer for the platform.

**Key Design Principles**:
- **Incremental Migration**: Existing Phase 1, 2, 4 data gradually migrates to unified models
- **Field Merging**: Common fields unified, phase-specific fields preserved with namespacing
- **Type Safety**: TypeScript interfaces enforce compile-time validation
- **Backward Compatibility**: Legacy components can still access phase-specific fields

---

## Entity Relationship Diagram

```
┌─────────────────┐     creates     ┌──────────────────┐
│   UnifiedUser   │────────────────→│   UnifiedCard    │
│                 │                  │                  │
│ - id            │←──────┐          │ - id             │
│ - username      │       │          │ - title          │
│ - email         │       │          │ - image          │
│ - avatar        │       │          │ - backImage      │
│ - fanProfile    │       │          │ - holographic    │
│ - creatorProfile│       │          │ - photocard      │
│ - collections[] │       │owns      │ - community      │
│ - stats         │       │          │ - metadata       │
└─────────────────┘       │          └──────────────────┘
        │                 │                    │
        │follows          │                    │belongs to
        │                 │                    ↓
        ↓                 │          ┌──────────────────┐
┌─────────────────┐       │          │   Collection     │
│  FollowRelation │       │          │                  │
└─────────────────┘       │          │ - id             │
                          │          │ - name           │
        ↓                 │          │ - cards[]        │
┌─────────────────┐       │          │ - progress       │
│ CommunityPost   │       │          └──────────────────┘
│                 │───────┘
│ - id            │
│ - card          │──→ references UnifiedCard
│ - author        │──→ references UnifiedUser
│ - content       │
│ - likes         │
│ - comments      │
└─────────────────┘

┌─────────────────┐
│    KBOTeam      │
│                 │
│ - id            │
│ - name          │
│ - color         │
│ - logo          │
│ - mascot        │
│ - fanCount      │
└─────────────────┘

┌─────────────────┐
│    FanLevel     │
│                 │
│ - level         │
│ - name          │
│ - requiredPoints│
│ - perks[]       │
└─────────────────┘
```

---

## Core Entities

### 1. UnifiedCard

**Purpose**: Unified card model merging Phase 1 (Enhanced Card), Phase 2 (Photocard), Phase 4 (Community) fields.

**TypeScript Interface**:

```typescript
interface UnifiedCard {
  // ===== COMMON FIELDS =====
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;

  // ===== PHASE 1: ENHANCED CARD INTERACTION =====
  holographic: {
    image: string; // Front image URL
    backImage: string; // Back image URL
    effect: HolographicEffect; // 'overlay' | 'soft-light' | 'hard-light'
    intensity: number; // 0-100
    isFlipped: boolean; // Current flip state
    animationDuration: number; // ms (default: 600)
  };

  // ===== PHASE 2: PHOTOCARD MAIN RENEWAL =====
  photocard: {
    rarity: Rarity; // 'common' | 'rare' | 'epic' | 'legendary'
    stats: {
      totalViews: number;
      uniqueCollectors: number;
      completionRate: number; // % of users who own this card
    };
    collections: string[]; // Collection IDs this card belongs to
    acquiredAt?: Date; // When current user acquired this card
  };

  // ===== PHASE 4: HOLOGRAPHIC CARD COMMUNITY =====
  community: {
    creator: string; // User ID of creator
    isPublic: boolean; // Public vs private card
    tags: string[]; // User-defined tags
    template?: string; // Template ID if created from template
    metadata: {
      likes: number;
      downloads: number;
      rating: number; // 1-5 stars
      ratingCount: number;
    };
  };

  // ===== CONTEXT SUPPORT =====
  context?: CardContext; // 'test' | 'main' | 'gallery' | 'community'
}

type HolographicEffect = 'overlay' | 'soft-light' | 'hard-light';
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
type CardContext = 'test' | 'main' | 'gallery' | 'community';
```

**Field Migration Map**:

| Phase 1 Field | Phase 2 Field | Phase 4 Field | Unified Field |
|---------------|---------------|---------------|---------------|
| `image` | - | - | `holographic.image` |
| `backImage` | - | - | `holographic.backImage` |
| - | `rarity` | - | `photocard.rarity` |
| - | `stats` | - | `photocard.stats` |
| - | - | `creator` | `community.creator` |
| - | - | `isPublic` | `community.isPublic` |
| - | - | `tags` | `community.tags` |

**State Transitions**:

```
┌─────────────┐  click  ┌─────────────┐  click  ┌─────────────┐
│   Front     │────────→│  Flipping   │────────→│    Back     │
│ (flipped=F) │         │ (animating) │         │ (flipped=T) │
└─────────────┘         └─────────────┘         └─────────────┘
      ↑                                                 │
      │                    click                        │
      └─────────────────────────────────────────────────┘

Mouse Hover: holographic effect ON (both Front and Back states)
Mouse Leave: holographic effect OFF
Animation: Clicks ignored during "Flipping" state
```

**Validation Rules**:

```typescript
const cardValidation = {
  title: { required: true, minLength: 1, maxLength: 100 },
  holographic: {
    image: { required: true, pattern: /^https?:\/\// },
    backImage: { required: true, pattern: /^https?:\/\// },
    intensity: { min: 0, max: 100 },
    animationDuration: { min: 300, max: 1000 },
  },
  photocard: {
    rarity: { enum: ['common', 'rare', 'epic', 'legendary'] },
    stats: {
      totalViews: { min: 0 },
      uniqueCollectors: { min: 0 },
      completionRate: { min: 0, max: 100 },
    },
  },
  community: {
    tags: { maxLength: 10, itemMaxLength: 20 },
    metadata: {
      rating: { min: 1, max: 5 },
      ratingCount: { min: 0 },
    },
  },
};
```

**Example Instance**:

```typescript
const exampleCard: UnifiedCard = {
  id: 'card-001',
  title: 'LG 트윈스 - 오지환 2024 시즌',
  createdAt: new Date('2024-03-15'),
  updatedAt: new Date('2024-03-15'),
  holographic: {
    image: 'https://cdn.example.com/cards/oh-ji-hwan-front.jpg',
    backImage: 'https://cdn.example.com/cards/lg-twins-back.jpg',
    effect: 'soft-light',
    intensity: 80,
    isFlipped: false,
    animationDuration: 600,
  },
  photocard: {
    rarity: 'epic',
    stats: {
      totalViews: 1523,
      uniqueCollectors: 342,
      completionRate: 12.5,
    },
    collections: ['col-kbo-2024', 'col-lg-twins'],
    acquiredAt: new Date('2024-03-20'),
  },
  community: {
    creator: 'user-123',
    isPublic: true,
    tags: ['LG트윈스', '오지환', '2024시즌', 'KBO'],
    template: 'template-kbo-player',
    metadata: {
      likes: 234,
      downloads: 89,
      rating: 4.7,
      ratingCount: 56,
    },
  },
  context: 'main',
};
```

---

### 2. UnifiedUser

**Purpose**: Unified user model merging basic profile, KBO fan profile, and creator profile.

**TypeScript Interface**:

```typescript
interface UnifiedUser {
  // ===== BASIC PROFILE =====
  id: string;
  username: string;
  email: string;
  avatar: string; // URL to avatar image
  createdAt: Date;
  lastLoginAt: Date;

  // ===== KBO FAN PROFILE (Phase 2 + 4) =====
  fanProfile: {
    fanLevel: FanLevel; // Reference to FanLevel entity
    currentPoints: number; // Activity points for next level
    favoriteTeam: string; // KBOTeam ID
    achievedBadges: string[]; // Badge IDs
    joinedFanclubs: string[]; // KBOTeam IDs
  };

  // ===== CREATOR PROFILE (Phase 4) =====
  creatorProfile: {
    creatorLevel: CreatorLevel; // 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
    stats: {
      totalCards: number;
      totalLikes: number;
      totalDownloads: number;
      averageRating: number;
      followers: number;
      following: number;
    };
    isVerified: boolean;
    specializations: string[]; // e.g., ['KBO', 'Custom Design', 'Template Creator']
  };

  // ===== COLLECTIONS (Phase 2) =====
  collections: {
    owned: string[]; // UnifiedCard IDs
    collectionProgress: CollectionProgress[]; // Progress per collection
    totalCards: number;
    rareCards: number; // Count of rare+ cards
  };

  // ===== PREFERENCES =====
  preferences: {
    theme: 'light' | 'dark' | 'kbo-team'; // Theme preference
    teamThemeColor?: string; // Hex color if kbo-team selected
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

type CreatorLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface CollectionProgress {
  collectionId: string;
  totalCards: number; // Total cards in collection
  ownedCards: number; // Cards user owns
  progress: number; // Percentage (0-100)
}
```

**Validation Rules**:

```typescript
const userValidation = {
  username: { required: true, minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  fanProfile: {
    currentPoints: { min: 0 },
  },
  creatorProfile: {
    creatorLevel: { enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] },
    stats: {
      totalCards: { min: 0 },
      averageRating: { min: 0, max: 5 },
    },
  },
  preferences: {
    theme: { enum: ['light', 'dark', 'kbo-team'] },
  },
};
```

**Example Instance**:

```typescript
const exampleUser: UnifiedUser = {
  id: 'user-123',
  username: 'kbo_fan_2024',
  email: 'fan@example.com',
  avatar: 'https://cdn.example.com/avatars/user-123.jpg',
  createdAt: new Date('2024-01-10'),
  lastLoginAt: new Date('2024-03-20'),
  fanProfile: {
    fanLevel: { level: 3, name: '응원단 멤버' }, // Reference
    currentPoints: 1250,
    favoriteTeam: 'team-lg-twins',
    achievedBadges: ['badge-first-card', 'badge-100-cards', 'badge-lg-super-fan'],
    joinedFanclubs: ['team-lg-twins', 'team-doosan-bears'],
  },
  creatorProfile: {
    creatorLevel: 'gold',
    stats: {
      totalCards: 78,
      totalLikes: 3421,
      totalDownloads: 892,
      averageRating: 4.6,
      followers: 234,
      following: 156,
    },
    isVerified: true,
    specializations: ['KBO', 'Custom Design'],
  },
  collections: {
    owned: ['card-001', 'card-002', 'card-003'],
    collectionProgress: [
      { collectionId: 'col-kbo-2024', totalCards: 30, ownedCards: 15, progress: 50 },
      { collectionId: 'col-lg-twins', totalCards: 20, ownedCards: 20, progress: 100 },
    ],
    totalCards: 78,
    rareCards: 12,
  },
  preferences: {
    theme: 'kbo-team',
    teamThemeColor: '#7B2D7F', // LG Twins purple
    notifications: {
      newFollower: true,
      cardLike: true,
      cardComment: true,
      levelUp: true,
    },
    privacy: {
      showCollections: true,
      showActivity: true,
    },
  },
};
```

---

### 3. Collection

**Purpose**: Represents a themed collection of cards (e.g., "KBO 2024 Season", "LG Twins Legends").

**TypeScript Interface**:

```typescript
interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnailImage: string; // Collection cover image
  cards: string[]; // UnifiedCard IDs in this collection
  totalCards: number; // Total cards in collection
  completedCount: number; // Number of users who completed this collection
  rarity: Rarity; // Collection rarity (affects rewards)

  // Metadata
  createdBy: string; // User ID of creator
  createdAt: Date;
  isOfficial: boolean; // Official KBO collection vs user-created
  tags: string[];

  // Rewards
  completionReward: {
    badge: string; // Badge ID
    points: number; // Fan points
    specialCard?: string; // Exclusive card ID
  };
}
```

**Example Instance**:

```typescript
const exampleCollection: Collection = {
  id: 'col-kbo-2024',
  name: 'KBO 2024 정규시즌',
  description: '2024 KBO 리그 전 구단 선수 카드 컬렉션',
  thumbnailImage: 'https://cdn.example.com/collections/kbo-2024.jpg',
  cards: ['card-001', 'card-002', 'card-003'], // ... 30 cards
  totalCards: 30,
  completedCount: 42,
  rarity: 'epic',
  createdBy: 'admin',
  createdAt: new Date('2024-03-01'),
  isOfficial: true,
  tags: ['KBO', '2024', '정규시즌'],
  completionReward: {
    badge: 'badge-kbo-2024-complete',
    points: 500,
    specialCard: 'card-special-kbo-2024',
  },
};
```

---

### 4. CommunityPost

**Purpose**: Represents a card shared in the community feed.

**TypeScript Interface**:

```typescript
interface CommunityPost {
  id: string;
  card: string; // UnifiedCard ID
  author: string; // UnifiedUser ID
  content: string; // Post caption/description

  // Engagement
  likes: string[]; // User IDs who liked
  comments: Comment[];
  shares: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isHighlighted: boolean; // Featured post
  tags: string[];
}

interface Comment {
  id: string;
  author: string; // UnifiedUser ID
  content: string;
  likes: string[]; // User IDs who liked this comment
  createdAt: Date;
}
```

**Example Instance**:

```typescript
const examplePost: CommunityPost = {
  id: 'post-001',
  card: 'card-001',
  author: 'user-123',
  content: '드디어 오지환 선수 레어 카드 획득! 🎉',
  likes: ['user-456', 'user-789'],
  comments: [
    {
      id: 'comment-001',
      author: 'user-456',
      content: '축하합니다! 저도 노리고 있는 카드예요',
      likes: ['user-123'],
      createdAt: new Date('2024-03-20T14:30:00Z'),
    },
  ],
  shares: 5,
  createdAt: new Date('2024-03-20T14:00:00Z'),
  updatedAt: new Date('2024-03-20T14:00:00Z'),
  isHighlighted: false,
  tags: ['LG트윈스', '오지환', 'epic'],
};
```

---

### 5. KBOTeam

**Purpose**: Represents a KBO team with branding and theme information.

**TypeScript Interface**:

```typescript
interface KBOTeam {
  id: string;
  name: string; // e.g., 'LG 트윈스'
  nameEn: string; // e.g., 'LG Twins'
  city: string; // e.g., '서울'

  // Branding
  color: string; // Primary team color (hex)
  secondaryColor?: string; // Secondary color (hex)
  logo: string; // Logo image URL
  mascot: {
    name: string; // e.g., '캡틴 트윈스'
    image: string;
  };

  // Community
  fanCount: number; // Number of fans on platform
  fanclubId: string; // Fanclub community ID

  // Metadata
  founded: number; // Year founded
  stadium: string; // Home stadium name
  championships: number; // Korean Series wins
}
```

**Example Instance**:

```typescript
const exampleTeam: KBOTeam = {
  id: 'team-lg-twins',
  name: 'LG 트윈스',
  nameEn: 'LG Twins',
  city: '서울',
  color: '#7B2D7F', // LG purple
  secondaryColor: '#C4122F', // Red accent
  logo: 'https://cdn.example.com/teams/lg-twins-logo.png',
  mascot: {
    name: '캡틴 트윈스',
    image: 'https://cdn.example.com/mascots/captain-twins.png',
  },
  fanCount: 8234,
  fanclubId: 'fanclub-lg-twins',
  founded: 1982,
  stadium: '잠실야구장',
  championships: 2,
};
```

---

### 6. FanLevel

**Purpose**: Defines KBO fan tier system (5 levels).

**TypeScript Interface**:

```typescript
interface FanLevel {
  level: number; // 1-5
  name: string; // Level name in Korean
  requiredPoints: number; // Points needed to reach this level
  perks: string[]; // Benefits of this level
  badgeIcon: string; // Badge image URL
}
```

**Predefined Levels**:

```typescript
const fanLevels: FanLevel[] = [
  {
    level: 1,
    name: '야구 입문자',
    requiredPoints: 0,
    perks: ['기본 카드 생성', '커뮤니티 참여'],
    badgeIcon: '/badges/fan-level-1.png',
  },
  {
    level: 2,
    name: '외야석 팬',
    requiredPoints: 100,
    perks: ['희귀 카드 생성', '커뮤니티 게시물 핀', '프로필 배지'],
    badgeIcon: '/badges/fan-level-2.png',
  },
  {
    level: 3,
    name: '응원단 멤버',
    requiredPoints: 500,
    perks: ['에픽 카드 생성', '템플릿 판매', '팬클럽 모더레이터'],
    badgeIcon: '/badges/fan-level-3.png',
  },
  {
    level: 4,
    name: '시즌권 홀더',
    requiredPoints: 2000,
    perks: ['레전더리 카드 생성', '구단 이벤트 우선 참여', '크리에이터 인증'],
    badgeIcon: '/badges/fan-level-4.png',
  },
  {
    level: 5,
    name: '구단 레전드',
    requiredPoints: 10000,
    perks: ['독점 카드 템플릿', '실물 카드 제작 할인', 'VIP 뱃지', '에디터 추천'],
    badgeIcon: '/badges/fan-level-5.png',
  },
];
```

---

## State Management Strategy

### Svelte Stores

**Global Stores** (cross-cutting concerns):

```typescript
// src/lib/stores/unified.ts
import { writable, derived } from 'svelte/store';
import type { UnifiedCard, UnifiedUser, Collection } from '$lib/types/unified';

// Card store
export const unifiedCards = writable<Map<string, UnifiedCard>>(new Map());

// User store
export const currentUser = writable<UnifiedUser | null>(null);

// Collection store
export const collections = writable<Map<string, Collection>>(new Map());

// Derived: Completed collections
export const completedCollections = derived(
  [currentUser, collections],
  ([$currentUser, $collections]) => {
    if (!$currentUser) return [];
    return Array.from($collections.values()).filter(
      (col) => $currentUser.collections.collectionProgress.find(
        (p) => p.collectionId === col.id && p.progress === 100
      )
    );
  }
);

// Derived: User's favorite team theme
export const teamTheme = derived(currentUser, ($user) => {
  if (!$user || $user.preferences.theme !== 'kbo-team') return null;
  return {
    color: $user.preferences.teamThemeColor,
    teamId: $user.fanProfile.favoriteTeam,
  };
});
```

**Component-Scoped Context** (local state):

```typescript
// src/lib/components/unified/UnifiedHolographicCard.svelte
import { setContext, getContext } from 'svelte';
import { writable } from 'svelte/store';

interface CardContext {
  isFlipped: Writable<boolean>;
  isAnimating: Writable<boolean>;
  holographicParams: Writable<{ x: number; y: number }>;
}

// In UnifiedHolographicCard component:
const cardContext: CardContext = {
  isFlipped: writable(false),
  isAnimating: writable(false),
  holographicParams: writable({ x: 0, y: 0 }),
};

setContext('card-context', cardContext);
```

---

## Data Migration Strategy

### Phase 1 → Unified Migration

```typescript
// src/lib/utils/migration.ts

interface LegacyEnhancedCard {
  id: string;
  title: string;
  image: string;
  backImage: string;
  holographicEffect: 'overlay' | 'soft-light';
}

function migrateEnhancedCard(legacy: LegacyEnhancedCard): UnifiedCard {
  return {
    id: legacy.id,
    title: legacy.title,
    createdAt: new Date(),
    updatedAt: new Date(),
    holographic: {
      image: legacy.image,
      backImage: legacy.backImage,
      effect: legacy.holographicEffect,
      intensity: 80,
      isFlipped: false,
      animationDuration: 600,
    },
    photocard: {
      rarity: 'common', // Default for legacy cards
      stats: { totalViews: 0, uniqueCollectors: 0, completionRate: 0 },
      collections: [],
    },
    community: {
      creator: 'system', // System-generated legacy card
      isPublic: false,
      tags: ['legacy', 'phase-1'],
      metadata: { likes: 0, downloads: 0, rating: 0, ratingCount: 0 },
    },
    context: 'test',
  };
}
```

### PocketBase Schema

```javascript
// pocketbase/migrations/002_unified_platform.js

migrate((db) => {
  // Create unified_cards collection
  const collection = new Collection({
    name: 'unified_cards',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'holographic', type: 'json', required: true },
      { name: 'photocard', type: 'json', required: true },
      { name: 'community', type: 'json', required: true },
      { name: 'context', type: 'select', options: ['test', 'main', 'gallery', 'community'] },
    ],
  });

  db.saveCollection(collection);

  // Migrate existing Phase 1 cards
  const legacyCards = db.select('SELECT * FROM enhanced_cards');
  legacyCards.forEach((card) => {
    db.insert('unified_cards', {
      id: card.id,
      title: card.title,
      holographic: JSON.stringify({
        image: card.image,
        backImage: card.backImage,
        effect: card.holographicEffect,
        intensity: 80,
        isFlipped: false,
        animationDuration: 600,
      }),
      photocard: JSON.stringify({
        rarity: 'common',
        stats: { totalViews: 0, uniqueCollectors: 0, completionRate: 0 },
        collections: [],
      }),
      community: JSON.stringify({
        creator: 'system',
        isPublic: false,
        tags: ['legacy', 'phase-1'],
        metadata: { likes: 0, downloads: 0, rating: 0, ratingCount: 0 },
      }),
      context: 'test',
    });
  });
});
```

---

## Performance Considerations

### Virtual Scrolling

For rendering 100+ cards at 60fps, use TanStack Virtual:

```typescript
// src/lib/components/unified/CardGrid.svelte
import { createVirtualizer } from '@tanstack/svelte-virtual';

const rowVirtualizer = createVirtualizer({
  count: cards.length,
  getScrollElement: () => scrollElement,
  estimateSize: () => 350, // Card height
  overscan: 5, // Render 5 extra cards
});
```

### Derived Store Optimization

Avoid unnecessary re-renders with granular stores:

```typescript
// BAD: Re-renders entire component when any card changes
const allCards = derived(unifiedCards, ($cards) => Array.from($cards.values()));

// GOOD: Only re-render when specific card changes
export function getCard(id: string) {
  return derived(unifiedCards, ($cards) => $cards.get(id));
}
```

---

## Type Exports

```typescript
// src/lib/types/unified.ts

export type {
  UnifiedCard,
  UnifiedUser,
  Collection,
  CommunityPost,
  Comment,
  KBOTeam,
  FanLevel,
  CollectionProgress,
};

export type {
  HolographicEffect,
  Rarity,
  CardContext,
  CreatorLevel,
};

export { cardValidation, userValidation };
```

---

## Backward Compatibility

### Adapter Pattern for Legacy Components

```typescript
// src/lib/components/adapters/EnhancedCardAdapter.svelte

import UnifiedHolographicCard from '../unified/UnifiedHolographicCard.svelte';
import type { LegacyEnhancedCard } from '$lib/types/legacy';
import { migrateEnhancedCard } from '$lib/utils/migration';

export let card: LegacyEnhancedCard;

$: unifiedCard = migrateEnhancedCard(card);
</script>

<UnifiedHolographicCard card={unifiedCard} />
```

This allows existing Phase 1 /test page to work without modification:

```svelte
<!-- src/routes/test/+page.svelte -->
<script>
import EnhancedCardAdapter from '$lib/components/adapters/EnhancedCardAdapter.svelte';

const legacyCards = [...]; // Existing Phase 1 cards
</script>

{#each legacyCards as card}
  <EnhancedCardAdapter {card} />
{/each}
```

---

## Summary

**Total Entities**: 6 (UnifiedCard, UnifiedUser, Collection, CommunityPost, KBOTeam, FanLevel)

**Key Integrations**:
- Phase 1 fields → `holographic` namespace
- Phase 2 fields → `photocard` namespace
- Phase 4 fields → `community` namespace

**Migration Path**: Incremental via adapter pattern (100% backward compatibility)

**State Management**: Hybrid (Svelte Stores for global state, Context API for component-scoped state)

**Performance**: Virtual scrolling for 100+ cards, derived stores for computed values

**Next Step**: Create API contracts in `contracts/` directory
