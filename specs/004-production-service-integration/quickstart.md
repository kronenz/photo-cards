# Quickstart: Production Service Integration

**Feature**: 004-production-service-integration
**Prerequisites**: Node.js 18+, Docker (for PocketBase/MinIO)

## 1. Environment Setup

### 1.1 Clone and Install

```bash
# 프로젝트가 이미 클론되어 있다면 생략
cd /Users/kronenz/Documents/develop/photo-cards
npm install
```

### 1.2 Environment Variables

`.env` 파일 생성:

```bash
# PocketBase
PUBLIC_POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=securepassword123

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=photo-cards

# OAuth (선택)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 1.3 Start Backend Services

```bash
# Docker Compose로 PocketBase와 MinIO 실행
docker-compose up -d

# 또는 개별 실행
# PocketBase
./pocketbase serve --http="127.0.0.1:8090"

# MinIO
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

## 2. PocketBase Schema Setup

### 2.1 Admin Access

1. http://localhost:8090/_/ 접속
2. 관리자 계정 생성 (최초 1회)
3. Collections 메뉴로 이동

### 2.2 Create Collections

아래 스키마를 순서대로 생성:

#### users (기본 제공, 확장)

Settings > Auth에서:
- OAuth2: Google, GitHub 활성화
- emailVisibility: false

#### cards

```json
{
  "name": "cards",
  "type": "base",
  "schema": [
    {"name": "title", "type": "text", "required": true, "options": {"min": 1, "max": 50}},
    {"name": "subtitle", "type": "text", "options": {"max": 30}},
    {"name": "team", "type": "select", "required": true, "options": {"values": ["lg","doosan","kt","samsung","nc","kia","lotte","ssg","hanwha","kiwoom"]}},
    {"name": "number", "type": "text", "options": {"max": 2}},
    {"name": "rarity", "type": "select", "required": true, "options": {"values": ["common","rare","epic","legendary"]}},
    {"name": "image_url", "type": "url", "required": true},
    {"name": "thumb_url", "type": "url"},
    {"name": "medium_url", "type": "url"},
    {"name": "creator", "type": "relation", "required": true, "options": {"collectionId": "users", "cascadeDelete": false}},
    {"name": "is_shared", "type": "bool"},
    {"name": "like_count", "type": "number", "options": {"min": 0}},
    {"name": "comment_count", "type": "number", "options": {"min": 0}},
    {"name": "stats", "type": "json"}
  ]
}
```

#### user_cards

```json
{
  "name": "user_cards",
  "type": "base",
  "schema": [
    {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "users"}},
    {"name": "card", "type": "relation", "required": true, "options": {"collectionId": "cards"}},
    {"name": "count", "type": "number", "required": true, "options": {"min": 1}},
    {"name": "is_favorite", "type": "bool"},
    {"name": "obtained_at", "type": "date", "required": true},
    {"name": "obtained_via", "type": "select", "options": {"values": ["create","gacha","trade"]}}
  ],
  "indexes": ["CREATE UNIQUE INDEX idx_user_card ON user_cards (user, card)"]
}
```

#### likes

```json
{
  "name": "likes",
  "type": "base",
  "schema": [
    {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "users"}},
    {"name": "card", "type": "relation", "required": true, "options": {"collectionId": "cards"}}
  ],
  "indexes": ["CREATE UNIQUE INDEX idx_like ON likes (user, card)"]
}
```

#### comments

```json
{
  "name": "comments",
  "type": "base",
  "schema": [
    {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "users"}},
    {"name": "card", "type": "relation", "required": true, "options": {"collectionId": "cards"}},
    {"name": "content", "type": "text", "required": true, "options": {"min": 1, "max": 500}}
  ]
}
```

#### gacha_history

```json
{
  "name": "gacha_history",
  "type": "base",
  "schema": [
    {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "users"}},
    {"name": "cards", "type": "json", "required": true},
    {"name": "pull_count", "type": "number", "required": true},
    {"name": "timestamp", "type": "date", "required": true}
  ]
}
```

#### notifications

```json
{
  "name": "notifications",
  "type": "base",
  "schema": [
    {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "users"}},
    {"name": "type", "type": "select", "required": true, "options": {"values": ["like","comment","follow","gacha","system"]}},
    {"name": "data", "type": "json", "required": true},
    {"name": "is_read", "type": "bool"}
  ]
}
```

## 3. MinIO Bucket Setup

### 3.1 Access Console

1. http://localhost:9001 접속
2. minioadmin / minioadmin 로그인

### 3.2 Create Bucket

1. Buckets > Create Bucket
2. Name: `photo-cards`
3. Access Policy: Public (읽기용)

### 3.3 CORS Configuration

Bucket > Access Rules > CORS:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:4173"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 4. Service Layer Implementation

### 4.1 PocketBase Client

```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL);

// 타입 안전성을 위한 컬렉션 타입
export type Collections = {
  users: User;
  cards: Card;
  user_cards: UserCard;
  likes: Like;
  comments: Comment;
  gacha_history: GachaHistory;
  notifications: Notification;
};
```

### 4.2 Auth Service

```typescript
// src/lib/services/auth.ts
import { pb } from '$lib/pocketbase';

export async function loginWithEmail(email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password);
}

export async function loginWithOAuth(provider: 'google' | 'github') {
  return pb.collection('users').authWithOAuth2({ provider });
}

export async function register(email: string, password: string, name: string) {
  const user = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name
  });
  await pb.collection('users').authWithPassword(email, password);
  return user;
}

export function logout() {
  pb.authStore.clear();
}

export function getCurrentUser() {
  return pb.authStore.model;
}

export function isAuthenticated() {
  return pb.authStore.isValid;
}
```

### 4.3 Gacha Service

```typescript
// src/lib/services/gachaService.ts
import { pb } from '$lib/pocketbase';
import type { GachaCard, SavedCard } from '$lib/types/models';

export async function saveGachaResults(
  userId: string,
  cards: GachaCard[]
): Promise<SavedCard[]> {
  const results: SavedCard[] = [];

  for (const card of cards) {
    try {
      // 기존 카드 확인
      const existing = await pb.collection('user_cards')
        .getFirstListItem(`user="${userId}" && card="${card.id}"`);

      // 중복 - 수량 증가
      await pb.collection('user_cards').update(existing.id, {
        count: existing.count + 1
      });

      results.push({
        cardId: card.id,
        userCardId: existing.id,
        isDuplicate: true,
        newCount: existing.count + 1
      });
    } catch {
      // 신규 - 생성
      const newEntry = await pb.collection('user_cards').create({
        user: userId,
        card: card.id,
        count: 1,
        is_favorite: false,
        obtained_at: new Date().toISOString(),
        obtained_via: 'gacha'
      });

      results.push({
        cardId: card.id,
        userCardId: newEntry.id,
        isDuplicate: false,
        newCount: 1
      });
    }
  }

  // 이력 저장
  await pb.collection('gacha_history').create({
    user: userId,
    cards: cards.map(c => ({ card_id: c.id, rarity: c.rarity })),
    pull_count: cards.length,
    timestamp: new Date().toISOString()
  });

  return results;
}
```

## 5. Development Server

```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build
npm run preview
```

## 6. Testing

### 6.1 Unit Tests

```bash
# 전체 테스트
npm run test

# 서비스 테스트만
npm run test -- src/lib/services
```

### 6.2 E2E Tests

```bash
# Playwright 테스트
npm run test:e2e

# 특정 테스트
npx playwright test auth.spec.ts
```

## 7. API Testing

### 7.1 Authentication

```bash
# 회원가입
curl -X POST http://localhost:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345678","passwordConfirm":"12345678","name":"테스트"}'

# 로그인
curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"test@example.com","password":"12345678"}'
```

### 7.2 Cards

```bash
# 카드 목록 조회
curl http://localhost:8090/api/collections/cards/records?filter='is_shared=true'

# 카드 생성 (인증 필요)
curl -X POST http://localhost:8090/api/collections/cards/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"테스트 카드","team":"lg","rarity":"rare","image_url":"https://example.com/img.jpg","creator":"USER_ID"}'
```

## 8. Troubleshooting

### PocketBase 연결 실패

```bash
# PocketBase 로그 확인
./pocketbase serve --http="127.0.0.1:8090" --debug

# 포트 사용 확인
lsof -i :8090
```

### MinIO 업로드 실패

```bash
# MinIO 로그 확인
docker logs minio

# CORS 설정 확인
mc admin config get myminio api
```

### OAuth 콜백 오류

1. OAuth 제공자 콘솔에서 리다이렉트 URI 확인
2. `http://localhost:8090/api/oauth2-redirect` 등록 필요

## Next Steps

1. `/speckit.tasks` 실행하여 구현 작업 목록 생성
2. P1 기능 (인증, 업로드) 먼저 구현
3. 테스트 작성과 함께 점진적 구현
