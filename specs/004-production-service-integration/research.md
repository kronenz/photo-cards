# Research: Production Service Integration

**Feature**: 004-production-service-integration
**Date**: 2025-12-01
**Status**: Complete

## Research Areas

### 1. PocketBase Authentication Strategy

**Decision**: PocketBase built-in auth with OAuth2 providers (Google, GitHub)

**Rationale**:
- PocketBase provides built-in user management with email/password
- OAuth2 integration is straightforward via `authWithOAuth2()`
- Session tokens stored in httpOnly cookies for security
- Real-time subscription support for auth state changes

**Alternatives Considered**:
- Auth.js (@auth/sveltekit): Rejected - adds complexity, PocketBase auth sufficient
- Custom JWT implementation: Rejected - reinventing the wheel, security risks
- Firebase Auth: Rejected - vendor lock-in, additional service dependency

**Implementation Pattern**:
```typescript
// src/lib/services/auth.ts
export async function loginWithEmail(email: string, password: string) {
  const authData = await pb.collection('users').authWithPassword(email, password);
  return authData;
}

export async function loginWithOAuth(provider: 'google' | 'github') {
  const authData = await pb.collection('users').authWithOAuth2({ provider });
  return authData;
}
```

---

### 2. Session Management & Token Refresh

**Decision**: PocketBase auto-refresh with SvelteKit hooks

**Rationale**:
- PocketBase SDK handles token refresh automatically
- `hooks.server.ts` validates auth on each request
- Store auth state in httpOnly cookie (not localStorage)
- 24-hour session duration as per spec requirement

**Alternatives Considered**:
- Manual token refresh: Rejected - error-prone, SDK handles this
- localStorage tokens: Rejected - XSS vulnerability
- Server-side sessions only: Rejected - breaks real-time features

**Implementation Pattern**:
```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.pb = new PocketBase(PB_URL);
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  if (event.locals.pb.authStore.isValid) {
    try {
      await event.locals.pb.collection('users').authRefresh();
    } catch {
      event.locals.pb.authStore.clear();
    }
  }

  const response = await resolve(event);
  response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie());
  return response;
};
```

---

### 3. MinIO File Upload Strategy

**Decision**: Server-side presigned URLs with direct client upload

**Rationale**:
- Presigned URLs allow direct upload without proxying through server
- Reduces server load for large files (up to 10MB)
- S3-compatible API works with existing AWS SDK patterns
- Thumbnails generated server-side after upload confirmation

**Alternatives Considered**:
- Direct server proxy: Rejected - memory intensive, scales poorly
- Client-side direct to MinIO: Rejected - exposes credentials
- Base64 encoding: Rejected - 33% size overhead, memory intensive

**Implementation Pattern**:
```typescript
// src/routes/api/upload/presign/+server.ts
export const POST: RequestHandler = async ({ request }) => {
  const { filename, contentType } = await request.json();
  const key = `cards/${crypto.randomUUID()}-${filename}`;

  const presignedUrl = await minioClient.presignedPutObject(
    BUCKET_NAME,
    key,
    60 * 5 // 5 minutes
  );

  return json({ uploadUrl: presignedUrl, key });
};
```

---

### 4. Image Processing Pipeline

**Decision**: Server-side thumbnail generation with sharp.js

**Rationale**:
- WebP format for optimal compression (per spec requirement)
- Generate 3 sizes: thumbnail (150px), medium (400px), original
- Process after upload confirmation to avoid blocking
- Store processed images alongside original in MinIO

**Alternatives Considered**:
- Client-side resizing: Rejected - inconsistent quality, mobile performance
- On-demand processing: Rejected - latency on first request
- External service (Cloudinary): Rejected - additional cost and dependency

**Implementation Pattern**:
```typescript
// src/lib/services/imageProcessor.ts
export async function processCardImage(key: string): Promise<ProcessedImages> {
  const original = await minioClient.getObject(BUCKET_NAME, key);
  const buffer = await streamToBuffer(original);

  const thumbnail = await sharp(buffer)
    .resize(150, 210, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const medium = await sharp(buffer)
    .resize(400, 560, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();

  // Upload processed images
  await Promise.all([
    minioClient.putObject(BUCKET_NAME, `${key}-thumb.webp`, thumbnail),
    minioClient.putObject(BUCKET_NAME, `${key}-medium.webp`, medium)
  ]);

  return { thumbnail: `${key}-thumb.webp`, medium: `${key}-medium.webp`, original: key };
}
```

---

### 5. Real-time Updates Strategy

**Decision**: PocketBase real-time subscriptions with Svelte stores

**Rationale**:
- PocketBase provides WebSocket-based real-time subscriptions
- Svelte stores integrate naturally with reactive updates
- Subscribe to collection changes for likes, comments, notifications
- Automatic reconnection handled by SDK

**Alternatives Considered**:
- Polling: Rejected - inefficient, poor UX for social features
- Custom WebSocket: Rejected - PocketBase already provides this
- Server-Sent Events: Rejected - less feature-rich than WebSocket

**Implementation Pattern**:
```typescript
// src/lib/stores/socialStore.ts
export function subscribeToCardLikes(cardId: string) {
  const unsubscribe = pb.collection('likes')
    .subscribe('*', (e) => {
      if (e.record.card === cardId) {
        cardLikes.update(likes => {
          if (e.action === 'create') return [...likes, e.record];
          if (e.action === 'delete') return likes.filter(l => l.id !== e.record.id);
          return likes;
        });
      }
    });

  return unsubscribe;
}
```

---

### 6. Optimistic Updates Pattern

**Decision**: Optimistic UI with rollback on error

**Rationale**:
- Instant feedback for user actions (likes, comments)
- Rollback to previous state if server request fails
- Show toast notification on error with retry option
- Per spec: "1초 이내에 UI에 반영"

**Alternatives Considered**:
- Wait for server response: Rejected - feels sluggish
- Fire-and-forget: Rejected - silent failures confuse users
- Queue with retry: Rejected - over-engineering for this use case

**Implementation Pattern**:
```typescript
// src/lib/services/socialService.ts
export async function toggleLike(cardId: string, userId: string) {
  const previousState = get(cardLikes);

  // Optimistic update
  cardLikes.update(likes => {
    const existing = likes.find(l => l.card === cardId && l.user === userId);
    if (existing) return likes.filter(l => l.id !== existing.id);
    return [...likes, { id: 'temp', card: cardId, user: userId }];
  });

  try {
    // Server request
    const existing = await pb.collection('likes')
      .getFirstListItem(`card="${cardId}" && user="${userId}"`);
    if (existing) {
      await pb.collection('likes').delete(existing.id);
    }
  } catch (error) {
    if ((error as ClientResponseError).status === 404) {
      await pb.collection('likes').create({ card: cardId, user: userId });
    } else {
      // Rollback on error
      cardLikes.set(previousState);
      throw error;
    }
  }
}
```

---

### 7. Error Handling & Korean Messages

**Decision**: Centralized error handler with Korean message mapping

**Rationale**:
- Per spec: "사용자 친화적 메시지가 표시"
- Map PocketBase error codes to Korean messages
- Toast notifications for user-facing errors
- Console logging for debugging (removed in production)

**Alternatives Considered**:
- Generic error messages: Rejected - poor UX, confusing
- Per-component error handling: Rejected - inconsistent, duplicated code
- i18n library: Rejected - overkill for Korean-only app

**Implementation Pattern**:
```typescript
// src/lib/services/errorHandler.ts
const ERROR_MESSAGES: Record<string, string> = {
  'validation_required': '필수 항목을 입력해주세요.',
  'validation_email': '유효한 이메일 주소를 입력해주세요.',
  'auth_invalid_credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth_email_exists': '이미 등록된 이메일입니다.',
  'file_too_large': '파일 크기가 10MB를 초과합니다.',
  'network_error': '네트워크 연결을 확인해주세요.',
  'unknown': '오류가 발생했습니다. 다시 시도해주세요.'
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    return ERROR_MESSAGES[error.data?.code] || ERROR_MESSAGES.unknown;
  }
  return ERROR_MESSAGES.unknown;
}
```

---

### 8. Gacha Result Persistence

**Decision**: Atomic transaction for gacha results with duplicate detection

**Rationale**:
- Per spec: "가챠 결과가 100% 정확하게 컬렉션에 저장"
- Check for existing cards before creating new collection entries
- Increment count for duplicates
- Store gacha history with timestamp

**Alternatives Considered**:
- Client-side storage first: Rejected - data loss risk
- Batch processing: Rejected - unnecessary complexity
- Event sourcing: Rejected - overkill for this use case

**Implementation Pattern**:
```typescript
// src/lib/services/gachaService.ts
export async function saveGachaResults(userId: string, cards: GachaCard[]) {
  const results = [];

  for (const card of cards) {
    // Check for existing card in collection
    try {
      const existing = await pb.collection('user_cards')
        .getFirstListItem(`user="${userId}" && card="${card.id}"`);

      // Duplicate - increment count
      await pb.collection('user_cards').update(existing.id, {
        count: existing.count + 1
      });
      results.push({ ...card, isDuplicate: true });
    } catch (error) {
      if ((error as ClientResponseError).status === 404) {
        // New card - create entry
        await pb.collection('user_cards').create({
          user: userId,
          card: card.id,
          count: 1,
          obtainedAt: new Date().toISOString()
        });
        results.push({ ...card, isDuplicate: false, isNew: true });
      } else {
        throw error;
      }
    }
  }

  // Record gacha history
  await pb.collection('gacha_history').create({
    user: userId,
    cards: cards.map(c => c.id),
    timestamp: new Date().toISOString()
  });

  return results;
}
```

---

## Summary

All research areas resolved with clear decisions and implementation patterns. No NEEDS CLARIFICATION items remain.

| Research Area | Decision | Confidence |
|---------------|----------|------------|
| Authentication | PocketBase built-in + OAuth2 | High |
| Session Management | httpOnly cookies + auto-refresh | High |
| File Upload | Presigned URLs | High |
| Image Processing | Server-side sharp.js | High |
| Real-time Updates | PocketBase subscriptions | High |
| Optimistic Updates | Update + rollback pattern | High |
| Error Handling | Centralized Korean messages | High |
| Gacha Persistence | Atomic with duplicate check | High |

**Ready for Phase 1: Design & Contracts**
