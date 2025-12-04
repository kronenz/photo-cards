# Data Model: Production Service Integration

**Feature**: 004-production-service-integration
**Date**: 2025-12-01
**Database**: PocketBase (SQLite → PostgreSQL)

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     cards       │       │   user_cards    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ email           │   │   │ title           │   │   │ user (FK)       │←─┐
│ password        │   │   │ subtitle        │   │   │ card (FK)       │←─┤
│ name            │   │   │ team            │   │   │ count           │  │
│ avatar          │   │   │ number          │   └──→│ is_favorite     │  │
│ created         │   │   │ rarity          │       │ obtained_at     │  │
│ updated         │   │   │ image_url       │       │ created         │  │
└─────────────────┘   │   │ thumb_url       │       └─────────────────┘  │
        │             │   │ medium_url      │              │             │
        │             │   │ creator (FK)    │←─────────────┘             │
        │             │   │ is_shared       │                            │
        │             │   │ created         │                            │
        │             │   └─────────────────┘                            │
        │             │                                                   │
        │             │   ┌─────────────────┐       ┌─────────────────┐  │
        │             │   │     likes       │       │    comments     │  │
        │             │   ├─────────────────┤       ├─────────────────┤  │
        │             └──→│ id (PK)         │       │ id (PK)         │  │
        │                 │ user (FK)       │←──────│ user (FK)       │←─┤
        │                 │ card (FK)       │       │ card (FK)       │  │
        └────────────────→│ created         │       │ content         │  │
                          └─────────────────┘       │ created         │  │
                                                    └─────────────────┘  │
                                                                         │
        ┌─────────────────┐       ┌─────────────────┐                   │
        │ gacha_history   │       │  notifications  │                   │
        ├─────────────────┤       ├─────────────────┤                   │
        │ id (PK)         │       │ id (PK)         │                   │
        │ user (FK)       │←──────│ user (FK)       │←──────────────────┘
        │ cards (JSON)    │       │ type            │
        │ timestamp       │       │ data (JSON)     │
        │ created         │       │ is_read         │
        └─────────────────┘       │ created         │
                                  └─────────────────┘
```

## PocketBase Collections

### 1. users (built-in)

PocketBase 기본 users 컬렉션 확장

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | Primary key (15 chars) |
| email | string | ✅ | Unique, validated email |
| password | string | ✅ | Hashed, min 8 chars |
| name | string | ✅ | Display name, 2-50 chars |
| avatar | file | - | Profile image (max 2MB) |
| emailVisibility | bool | - | Default: false |
| verified | bool | - | Email verification status |
| created | datetime | auto | Created timestamp |
| updated | datetime | auto | Updated timestamp |

**Validation Rules**:
- Email: Valid email format, unique
- Password: Min 8 characters, at least 1 number
- Name: 2-50 characters, no special characters

**OAuth Fields** (auto-managed):
- External auth providers stored in `users_oauth` relation

---

### 2. cards

사용자가 생성한 카드 메타데이터

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | auto | - | Primary key |
| title | string | ✅ | - | 카드 제목 (1-50 chars) |
| subtitle | string | - | '' | 부제목/포지션 (max 30 chars) |
| team | string | ✅ | - | KBO 팀 코드 (enum) |
| number | string | - | '' | 등번호 (1-99) |
| rarity | string | ✅ | 'common' | 등급 (enum) |
| image_url | string | ✅ | - | MinIO 원본 이미지 URL |
| thumb_url | string | - | - | 150px 썸네일 URL |
| medium_url | string | - | - | 400px 중간 크기 URL |
| creator | relation | ✅ | - | users.id (FK) |
| is_shared | bool | - | false | 커뮤니티 공유 여부 |
| share_count | number | - | 0 | 공유 횟수 |
| like_count | number | - | 0 | 좋아요 수 (denormalized) |
| comment_count | number | - | 0 | 댓글 수 (denormalized) |
| stats | json | - | {} | 선수 스탯 데이터 |
| created | datetime | auto | - | 생성 시간 |
| updated | datetime | auto | - | 수정 시간 |

**Enums**:
```typescript
type Team = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' |
            'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
```

**Validation Rules**:
- title: 1-50 characters
- team: Must be valid KBO team code
- rarity: Must be valid rarity level
- image_url: Must start with MinIO bucket URL

**Indexes**:
- `creator` - 사용자별 카드 조회
- `team` - 팀별 필터링
- `rarity` - 등급별 정렬
- `is_shared, created` - 갤러리 피드 (공유된 카드, 최신순)

---

### 3. user_cards

사용자 컬렉션 (소유 카드)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | auto | - | Primary key |
| user | relation | ✅ | - | users.id (FK) |
| card | relation | ✅ | - | cards.id (FK) |
| count | number | - | 1 | 중복 카드 수량 |
| is_favorite | bool | - | false | 즐겨찾기 여부 |
| obtained_at | datetime | ✅ | - | 획득 시간 |
| obtained_via | string | - | 'create' | 획득 경로 (create/gacha/trade) |
| created | datetime | auto | - | 생성 시간 |

**Unique Constraint**: `(user, card)` - 사용자당 카드 1개 레코드

**Validation Rules**:
- count: Min 1
- obtained_via: 'create' | 'gacha' | 'trade'

**Indexes**:
- `user` - 사용자 컬렉션 조회
- `user, is_favorite` - 즐겨찾기 필터
- `user, card` - 중복 확인 (unique)

---

### 4. likes

좋아요 관계

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | Primary key |
| user | relation | ✅ | users.id (FK) |
| card | relation | ✅ | cards.id (FK) |
| created | datetime | auto | 생성 시간 |

**Unique Constraint**: `(user, card)` - 사용자당 카드 1개 좋아요

**Indexes**:
- `card` - 카드별 좋아요 목록
- `user, card` - 좋아요 상태 확인 (unique)

**Triggers** (PocketBase hooks):
- onCreate: `cards.like_count++`
- onDelete: `cards.like_count--`

---

### 5. comments

댓글

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | string | auto | - | Primary key |
| user | relation | ✅ | - | users.id (FK) |
| card | relation | ✅ | - | cards.id (FK) |
| content | string | ✅ | 1-500 chars | 댓글 내용 |
| created | datetime | auto | - | 생성 시간 |
| updated | datetime | auto | - | 수정 시간 |

**Validation Rules**:
- content: 1-500 characters, no empty strings

**Indexes**:
- `card, created` - 카드별 댓글 (최신순)

**Triggers** (PocketBase hooks):
- onCreate: `cards.comment_count++`
- onDelete: `cards.comment_count--`

---

### 6. gacha_history

가챠 이력

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | Primary key |
| user | relation | ✅ | users.id (FK) |
| cards | json | ✅ | Array of card IDs |
| pull_count | number | ✅ | 1 또는 10 |
| timestamp | datetime | ✅ | 뽑기 시간 |
| created | datetime | auto | 생성 시간 |

**JSON Schema** (cards):
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "card_id": { "type": "string" },
      "rarity": { "type": "string" },
      "is_duplicate": { "type": "boolean" }
    }
  }
}
```

**Indexes**:
- `user, timestamp` - 사용자별 이력 (최신순)

---

### 7. notifications

알림

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | auto | - | Primary key |
| user | relation | ✅ | - | users.id (FK) |
| type | string | ✅ | - | 알림 유형 (enum) |
| data | json | ✅ | - | 알림 데이터 |
| is_read | bool | - | false | 읽음 여부 |
| created | datetime | auto | - | 생성 시간 |

**Notification Types**:
```typescript
type NotificationType =
  | 'like'      // 좋아요 알림
  | 'comment'   // 댓글 알림
  | 'follow'    // 팔로우 알림
  | 'gacha'     // 가챠 결과 알림
  | 'system';   // 시스템 알림
```

**Data JSON Schema** (by type):
```typescript
interface LikeNotification {
  card_id: string;
  card_title: string;
  liker_id: string;
  liker_name: string;
}

interface CommentNotification {
  card_id: string;
  card_title: string;
  commenter_id: string;
  commenter_name: string;
  comment_preview: string; // first 50 chars
}

interface GachaNotification {
  pull_count: number;
  legendary_count: number;
  epic_count: number;
}
```

**Indexes**:
- `user, is_read, created` - 읽지 않은 알림 (최신순)

---

## TypeScript Interfaces

```typescript
// src/lib/types/models.ts

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verified: boolean;
  created: string;
  updated: string;
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
  like_count: number;
  comment_count: number;
  stats?: CardStats;
  created: string;
  updated: string;
}

export interface UserCard {
  id: string;
  user: string;
  card: string;
  count: number;
  is_favorite: boolean;
  obtained_at: string;
  obtained_via: 'create' | 'gacha' | 'trade';
  created: string;
  // Expanded
  expand?: {
    card: Card;
  };
}

export interface Like {
  id: string;
  user: string;
  card: string;
  created: string;
}

export interface Comment {
  id: string;
  user: string;
  card: string;
  content: string;
  created: string;
  updated: string;
  // Expanded
  expand?: {
    user: User;
  };
}

export interface GachaHistory {
  id: string;
  user: string;
  cards: GachaResult[];
  pull_count: 1 | 10;
  timestamp: string;
  created: string;
}

export interface GachaResult {
  card_id: string;
  rarity: Rarity;
  is_duplicate: boolean;
}

export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  data: NotificationData;
  is_read: boolean;
  created: string;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'gacha' | 'system';

export type NotificationData =
  | LikeNotificationData
  | CommentNotificationData
  | GachaNotificationData
  | SystemNotificationData;
```

---

## State Transitions

### Card Lifecycle

```
[Draft] --create--> [Private] --share--> [Public] --unshare--> [Private]
                        |                    |
                        v                    v
                   [Deleted]            [Deleted]
```

### User Card Acquisition

```
[None] --create--> [Owned(1)]
                       |
[None] --gacha--> [Owned(1)] --gacha--> [Owned(n)]
                       |
                  --trade-->
                       v
                   [Owned(n)]
```

### Notification Lifecycle

```
[Created] --> [Unread] --view--> [Read] --expire--> [Deleted]
                                   |
                              (30 days)
```

---

## Migration Notes

### SQLite → PostgreSQL

1. **Auto-increment IDs**: PocketBase uses 15-char random strings, no migration needed
2. **JSON fields**: SQLite stores as TEXT, PostgreSQL uses native JSONB
3. **Indexes**: Recreate all indexes after migration
4. **Full-text search**: Consider adding PostgreSQL tsvector for search

### Recommended PostgreSQL Extensions

```sql
-- For search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- For UUID (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
