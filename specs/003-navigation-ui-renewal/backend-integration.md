# Backend Integration Guide: Navigation & UI Renewal

**Feature**: 003-navigation-ui-renewal
**Date**: 2025-01-08
**Status**: ✅ Complete

---

## 📋 Overview

This document provides comprehensive guidance on integrating the Navigation & UI Renewal feature with the PocketBase backend. It covers architecture patterns, service layer design, error handling, and best practices.

**Backend Architecture**: specs/000-backend-architecture
**API Reference**: specs/000-backend-architecture/API_REFERENCE.md

---

## 🏗️ Architecture Pattern

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Svelte Components, UI Logic)      │
│  - routes/+page.svelte              │
│  - lib/components/*                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Service Layer               │
│  (Business Logic, API Abstraction)  │
│  - lib/services/auth.ts             │
│  - lib/services/cards.ts            │
│  - lib/services/collections.ts      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Data Layer                  │
│  (PocketBase Client, HTTP)          │
│  - lib/pocketbase.ts                │
│  - PocketBase SDK                   │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         PocketBase Backend          │
│  (SQLite, REST API, Auth)           │
│  http://localhost:8090/api          │
└─────────────────────────────────────┘
```

### Why Three Layers?

1. **Separation of Concerns**: UI logic separate from API calls
2. **Testability**: Easy to mock service layer for tests
3. **Reusability**: Services can be used across multiple components
4. **Type Safety**: TypeScript interfaces at each layer
5. **Error Handling**: Centralized error handling in service layer

---

## 🔧 Setting Up PocketBase Client

### Basic Setup

```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

// Create PocketBase client instance
export const pb = new PocketBase('http://localhost:8090');

// Configure auto-cancellation (set to false for better UX)
pb.autoCancellation(false);

// Subscribe to auth state changes
pb.authStore.onChange((token, model) => {
  console.log('Auth state changed:', !!token);

  // You can trigger side effects here
  // e.g., invalidate caches, redirect user, etc.
});

// Type-safe collection helpers
export const collections = {
  users: pb.collection('users'),
  unifiedUsers: pb.collection('unified_users'),
  unifiedCards: pb.collection('unified_cards'),
  collections: pb.collection('collections'),
  kboTeams: pb.collection('kbo_teams'),
  communityPosts: pb.collection('community_posts'),
  fanLevels: pb.collection('fan_levels'),
};
```

### Environment-Based Configuration

```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

// Use environment variable for flexibility
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

// Enable debug mode in development
if (import.meta.env.DEV) {
  pb.beforeSend = (url, options) => {
    console.log('[PocketBase]', options.method, url);
    return { url, options };
  };

  pb.afterSend = (response, data) => {
    console.log('[PocketBase] Response:', response.status, data);
    return data;
  };
}

export const collections = {
  // ... collections
};
```

### .env Configuration

```bash
# .env.development
VITE_POCKETBASE_URL=http://localhost:8090

# .env.production
VITE_POCKETBASE_URL=https://api.yourapp.com
```

---

## 🎯 Service Layer Pattern

### Authentication Service

```typescript
// src/lib/services/auth.ts
import { pb } from '$lib/pocketbase';
import { goto } from '$app/navigation';
import type { User, UnifiedUser, AuthResponse } from '$lib/types';

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);

    return {
      token: authData.token,
      record: authData.record as User
    };
  } catch (error: any) {
    throw handleAuthError(error);
  }
}

/**
 * Register new user
 */
export async function register(data: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}): Promise<AuthResponse> {
  try {
    // Create user account
    const user = await pb.collection('users').create<User>(data);

    // Auto-login after registration
    const authData = await pb.collection('users').authWithPassword(data.email, data.password);

    // Create unified user profile
    await createUnifiedUserProfile(user.id, data.name);

    return {
      token: authData.token,
      record: authData.record as User
    };
  } catch (error: any) {
    throw handleAuthError(error);
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  pb.authStore.clear();
  await goto('/login');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return pb.authStore.isValid;
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return pb.authStore.model as User | null;
}

/**
 * Refresh auth token
 */
export async function refreshToken(): Promise<void> {
  try {
    await pb.collection('users').authRefresh();
  } catch (error) {
    // Token refresh failed, logout user
    await logout();
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await pb.collection('users').requestPasswordReset(email);
}

/**
 * Create unified user profile (internal)
 */
async function createUnifiedUserProfile(userId: string, displayName: string): Promise<UnifiedUser> {
  return await pb.collection('unified_users').create<UnifiedUser>({
    user_id: userId,
    display_name: displayName,
    theme: 'light',
    fan_level: 1,
    fan_points: 0,
    creator_followers: 0,
    creator_following: 0,
    creator_total_likes: 0,
    creator_total_downloads: 0,
    stats_cards_created: 0,
    stats_cards_collected: 0,
    stats_collections: 0
  });
}

/**
 * Handle authentication errors
 */
function handleAuthError(error: any): Error {
  if (error.status === 400) {
    return new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  } else if (error.status === 404) {
    return new Error('사용자를 찾을 수 없습니다.');
  } else if (error.data?.data) {
    // Field-level validation errors
    const firstError = Object.values(error.data.data)[0] as any;
    return new Error(firstError.message);
  }
  return new Error('로그인에 실패했습니다. 다시 시도해주세요.');
}
```

---

### Cards Service

```typescript
// src/lib/services/cards.ts
import { collections, pb } from '$lib/pocketbase';
import type { UnifiedCard, CardCreationData, PocketBaseListResponse } from '$lib/types';

/**
 * List cards with pagination and filters
 */
export async function listCards(
  page = 1,
  perPage = 30,
  options?: {
    filter?: string;
    sort?: string;
    expand?: string;
  }
): Promise<PocketBaseListResponse<UnifiedCard>> {
  return await collections.unifiedCards.getList<UnifiedCard>(page, perPage, {
    filter: options?.filter || 'context="community" && community_is_public=true',
    sort: options?.sort || '-created',
    expand: options?.expand || 'community_creator',
  });
}

/**
 * Get single card by ID
 */
export async function getCard(id: string): Promise<UnifiedCard> {
  return await collections.unifiedCards.getOne<UnifiedCard>(id, {
    expand: 'community_creator'
  });
}

/**
 * Create new card
 */
export async function createCard(data: CardCreationData): Promise<UnifiedCard> {
  // Step 1: Create card record (without image first)
  const cardData = {
    title: data.title,
    description: data.description,
    holographic_effect: data.holographic_effect,
    holographic_intensity: data.holographic_intensity,
    holographic_animation_duration: 300,
    photocard_rarity: data.photocard_rarity,
    photocard_season: new Date().getFullYear().toString(),
    photocard_total_views: 0,
    photocard_unique_collectors: 0,
    photocard_completion_rate: 0,
    photocard_collections: [],
    community_creator: data.community_creator,
    community_is_public: data.community_is_public,
    community_tags: data.community_tags,
    community_likes: 0,
    community_downloads: 0,
    community_rating: 0,
    community_rating_count: 0,
    context: data.context
  };

  const card = await collections.unifiedCards.create<UnifiedCard>(cardData);

  // Step 2: Upload image if provided
  if (data.image) {
    const formData = new FormData();
    formData.append('holographic_image', data.image);
    await collections.unifiedCards.update(card.id, formData);
  }

  return card;
}

/**
 * Update existing card
 */
export async function updateCard(
  id: string,
  data: Partial<UnifiedCard>
): Promise<UnifiedCard> {
  return await collections.unifiedCards.update<UnifiedCard>(id, data);
}

/**
 * Delete card
 */
export async function deleteCard(id: string): Promise<void> {
  await collections.unifiedCards.delete(id);
}

/**
 * Like/unlike card
 */
export async function toggleLike(card: UnifiedCard): Promise<UnifiedCard> {
  // TODO: Check if user already liked (requires likes table)
  const newLikes = card.community_likes + 1;
  return await updateCard(card.id, { community_likes: newLikes });
}

/**
 * Increment download count
 */
export async function incrementDownload(cardId: string): Promise<void> {
  const card = await getCard(cardId);
  await updateCard(cardId, {
    community_downloads: card.community_downloads + 1
  });
}

/**
 * Search cards by query
 */
export async function searchCards(query: string): Promise<PocketBaseListResponse<UnifiedCard>> {
  return await listCards(1, 30, {
    filter: `(title~"${query}" || community_tags~"${query}") && community_is_public=true`,
    sort: '-community_rating'
  });
}
```

---

### Collections Service

```typescript
// src/lib/services/collections.ts
import { collections as pbCollections } from '$lib/pocketbase';
import type { Collection, PocketBaseListResponse } from '$lib/types';

/**
 * List user collections
 */
export async function listCollections(userId: string): Promise<PocketBaseListResponse<Collection>> {
  return await pbCollections.collections.getList<Collection>(1, 50, {
    filter: `owner="${userId}"`,
    sort: '-created'
  });
}

/**
 * Get collection by ID
 */
export async function getCollection(id: string): Promise<Collection> {
  return await pbCollections.collections.getOne<Collection>(id);
}

/**
 * Create new collection
 */
export async function createCollection(data: {
  name: string;
  description?: string;
  owner: string;
}): Promise<Collection> {
  return await pbCollections.collections.create<Collection>({
    ...data,
    cards: [],
    is_public: true,
    total_cards: 0,
    completion_rate: 0
  });
}

/**
 * Add card to collection
 */
export async function addCardToCollection(
  collectionId: string,
  cardId: string
): Promise<Collection> {
  const collection = await getCollection(collectionId);

  // Check if card already in collection
  if (collection.cards.includes(cardId)) {
    return collection;
  }

  const updatedCards = [...collection.cards, cardId];

  return await pbCollections.collections.update<Collection>(collectionId, {
    cards: updatedCards,
    total_cards: updatedCards.length
  });
}

/**
 * Remove card from collection
 */
export async function removeCardFromCollection(
  collectionId: string,
  cardId: string
): Promise<Collection> {
  const collection = await getCollection(collectionId);
  const updatedCards = collection.cards.filter(id => id !== cardId);

  return await pbCollections.collections.update<Collection>(collectionId, {
    cards: updatedCards,
    total_cards: updatedCards.length
  });
}

/**
 * Delete collection
 */
export async function deleteCollection(id: string): Promise<void> {
  await pbCollections.collections.delete(id);
}

/**
 * Update collection metadata
 */
export async function updateCollection(
  id: string,
  data: Partial<Collection>
): Promise<Collection> {
  return await pbCollections.collections.update<Collection>(id, data);
}
```

---

## 🚨 Error Handling

### Centralized Error Handler

```typescript
// src/lib/utils/errorHandler.ts
import { goto } from '$app/navigation';
import type { PocketBaseError } from '$lib/types';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle PocketBase errors
 */
export function handlePocketBaseError(error: any): AppError {
  // Unauthorized - redirect to login
  if (error.status === 401) {
    goto('/login');
    return new AppError('로그인이 필요합니다', 'UNAUTHORIZED');
  }

  // Forbidden
  if (error.status === 403) {
    return new AppError('권한이 없습니다', 'FORBIDDEN');
  }

  // Not Found
  if (error.status === 404) {
    return new AppError('리소스를 찾을 수 없습니다', 'NOT_FOUND');
  }

  // Validation Error
  if (error.status === 400 || error.status === 422) {
    const fieldErrors: Record<string, string> = {};

    if (error.data?.data) {
      for (const [field, err] of Object.entries(error.data.data as Record<string, any>)) {
        fieldErrors[field] = err.message;
      }
    }

    return new AppError(
      '입력값이 올바르지 않습니다',
      'VALIDATION_ERROR',
      fieldErrors
    );
  }

  // Server Error
  if (error.status >= 500) {
    return new AppError('서버 오류가 발생했습니다', 'SERVER_ERROR');
  }

  // Generic Error
  return new AppError(
    error.message || '알 수 없는 오류가 발생했습니다',
    'UNKNOWN_ERROR'
  );
}

/**
 * Display error to user
 */
export function displayError(error: AppError): void {
  // You can integrate with a toast/notification system here
  console.error(`[${error.code}]`, error.message, error.fieldErrors);
}
```

### Using Error Handler in Services

```typescript
// src/lib/services/cards.ts
import { handlePocketBaseError } from '$lib/utils/errorHandler';

export async function createCard(data: CardCreationData): Promise<UnifiedCard> {
  try {
    // ... card creation logic
  } catch (error: any) {
    throw handlePocketBaseError(error);
  }
}
```

### Using Error Handler in Components

```svelte
<!-- src/routes/create/+page.svelte -->
<script lang="ts">
  import { createCard } from '$lib/services/cards';
  import { displayError, type AppError } from '$lib/utils/errorHandler';

  let errors: Record<string, string> = {};
  let isSubmitting = false;

  async function handleSubmit() {
    isSubmitting = true;
    errors = {};

    try {
      const card = await createCard(formData);
      await goto('/gallery');
    } catch (error: any) {
      if (error instanceof AppError) {
        if (error.fieldErrors) {
          errors = error.fieldErrors;
        } else {
          displayError(error);
        }
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>
```

---

## 🔄 Real-time Updates

### Subscribe to Collection Changes

```typescript
// src/lib/services/realtime.ts
import { pb } from '$lib/pocketbase';
import type { UnifiedCard } from '$lib/types';

/**
 * Subscribe to card updates
 */
export function subscribeToCards(
  callback: (action: 'create' | 'update' | 'delete', card: UnifiedCard) => void
) {
  return pb.collection('unified_cards').subscribe('*', (e) => {
    callback(e.action, e.record as UnifiedCard);
  });
}

/**
 * Unsubscribe from all changes
 */
export function unsubscribeAll() {
  pb.collection('unified_cards').unsubscribe();
}
```

### Using Realtime in Components

```svelte
<!-- src/routes/gallery/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { subscribeToCards, unsubscribeAll } from '$lib/services/realtime';
  import type { UnifiedCard } from '$lib/types';

  let cards: UnifiedCard[] = [];

  onMount(() => {
    // Initial fetch
    fetchCards();

    // Subscribe to realtime updates
    const unsubscribe = subscribeToCards((action, card) => {
      if (action === 'create') {
        cards = [card, ...cards];
      } else if (action === 'update') {
        cards = cards.map(c => c.id === card.id ? card : c);
      } else if (action === 'delete') {
        cards = cards.filter(c => c.id !== card.id);
      }
    });

    return unsubscribe;
  });

  onDestroy(() => {
    unsubscribeAll();
  });
</script>
```

---

## 🧪 Testing with Mock Data

### Mock PocketBase Client

```typescript
// tests/mocks/pocketbase.ts
import type { UnifiedCard, User, Collection } from '$lib/types';

export const mockUser: User = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'avatar_url',
  emailVisibility: false,
  verified: true,
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z'
};

export const mockCard: UnifiedCard = {
  id: 'card_123',
  title: 'Test Card',
  description: 'Test description',
  holographic_image: 'image_url',
  holographic_effect: 'overlay',
  holographic_intensity: 75,
  holographic_animation_duration: 300,
  photocard_rarity: 'common',
  photocard_season: '2024',
  photocard_total_views: 100,
  photocard_unique_collectors: 10,
  photocard_completion_rate: 50,
  photocard_collections: [],
  community_creator: 'user_123',
  community_is_public: true,
  community_tags: ['kbo', 'baseball'],
  community_likes: 42,
  community_downloads: 20,
  community_rating: 4.5,
  community_rating_count: 10,
  context: 'community',
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z'
};

export const mockPocketBase = {
  authStore: {
    isValid: true,
    model: mockUser,
    token: 'mock_token',
    clear: vi.fn(),
    onChange: vi.fn()
  },
  collection: vi.fn(() => ({
    getList: vi.fn().mockResolvedValue({
      page: 1,
      perPage: 30,
      totalItems: 1,
      totalPages: 1,
      items: [mockCard]
    }),
    getOne: vi.fn().mockResolvedValue(mockCard),
    create: vi.fn().mockResolvedValue(mockCard),
    update: vi.fn().mockResolvedValue(mockCard),
    delete: vi.fn().mockResolvedValue(null),
    authWithPassword: vi.fn().mockResolvedValue({
      token: 'mock_token',
      record: mockUser
    })
  }))
};
```

### Unit Test Example

```typescript
// tests/unit/services/cards.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCard, listCards } from '$lib/services/cards';
import { mockCard, mockPocketBase } from '../mocks/pocketbase';

// Mock PocketBase module
vi.mock('$lib/pocketbase', () => ({
  pb: mockPocketBase,
  collections: {
    unifiedCards: mockPocketBase.collection('unified_cards')
  }
}));

describe('Cards Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create card', async () => {
    const data = {
      title: 'New Card',
      // ... other fields
    };

    const card = await createCard(data);

    expect(card).toBeDefined();
    expect(card.id).toBe('card_123');
    expect(card.title).toBe('Test Card');
  });

  it('should list cards', async () => {
    const result = await listCards(1, 30);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Test Card');
  });
});
```

---

## 📊 Performance Optimization

### Caching Strategy

```typescript
// src/lib/utils/cache.ts
const cache = new Map<string, { data: any; expires: number }>();

export function setCache(key: string, data: any, ttl = 5 * 60 * 1000) {
  cache.set(key, {
    data,
    expires: Date.now() + ttl
  });
}

export function getCache<T>(key: string): T | null {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
```

### Cached Service Layer

```typescript
// src/lib/services/cards.ts
import { getCache, setCache } from '$lib/utils/cache';

export async function getCard(id: string, useCache = true): Promise<UnifiedCard> {
  const cacheKey = `card:${id}`;

  // Check cache first
  if (useCache) {
    const cached = getCache<UnifiedCard>(cacheKey);
    if (cached) return cached;
  }

  // Fetch from API
  const card = await collections.unifiedCards.getOne<UnifiedCard>(id, {
    expand: 'community_creator'
  });

  // Store in cache (5 minutes TTL)
  setCache(cacheKey, card, 5 * 60 * 1000);

  return card;
}
```

### Pagination with Infinite Scroll

```svelte
<!-- src/routes/gallery/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { listCards } from '$lib/services/cards';
  import type { UnifiedCard } from '$lib/types';

  let cards: UnifiedCard[] = [];
  let page = 1;
  let hasMore = true;
  let isLoading = false;

  onMount(() => {
    loadMore();

    // Infinite scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  });

  async function loadMore() {
    if (isLoading || !hasMore) return;

    isLoading = true;

    try {
      const result = await listCards(page, 30);
      cards = [...cards, ...result.items];
      hasMore = page < result.totalPages;
      page++;
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="cards-grid">
  {#each cards as card (card.id)}
    <CardComponent {card} />
  {/each}
</div>

{#if isLoading}
  <div class="loading">로딩 중...</div>
{/if}

<!-- Sentinel element for infinite scroll -->
<div id="scroll-sentinel" style="height: 1px;"></div>
```

---

## 🔒 Security Best Practices

### 1. Never Store Sensitive Data in Frontend

```typescript
// ❌ BAD
const API_KEY = 'sk_live_xxxx'; // Never hardcode secrets

// ✅ GOOD
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
// API keys should be handled by backend
```

### 2. Validate User Input

```typescript
// src/lib/utils/validation.ts
export function sanitizeCardTitle(title: string): string {
  // Remove HTML tags
  return title.replace(/<[^>]*>/g, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 3. Handle Auth Expiration

```typescript
// src/lib/pocketbase.ts
import { goto } from '$app/navigation';

pb.authStore.onChange((token, model) => {
  if (!token) {
    // User logged out or token expired
    goto('/login');
  }
});

// Auto-refresh token before expiration
setInterval(async () => {
  if (pb.authStore.isValid) {
    try {
      await pb.collection('users').authRefresh();
    } catch (error) {
      // Refresh failed, logout
      pb.authStore.clear();
      goto('/login');
    }
  }
}, 10 * 60 * 1000); // Every 10 minutes
```

---

## 📚 Related Documents

- **API Reference**: [specs/000-backend-architecture/API_REFERENCE.md](../../000-backend-architecture/API_REFERENCE.md)
- **Backend Guide**: [specs/000-backend-architecture/BACKEND_ARCHITECTURE_GUIDE.md](../../000-backend-architecture/BACKEND_ARCHITECTURE_GUIDE.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/README.md](./contracts/README.md)
- **Quickstart**: [quickstart.md](./quickstart.md)

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Complete - Full backend integration guide
