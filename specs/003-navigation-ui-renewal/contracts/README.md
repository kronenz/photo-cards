# API Contracts: Navigation & UI Renewal

**Feature**: 003-navigation-ui-renewal
**Date**: 2025-01-08
**Status**: ✅ Complete (Backend Integration Documented)

---

## Overview

This feature integrates with the existing **PocketBase backend** (specs/000-backend-architecture) to provide full-stack functionality. While no new API endpoints are created, all pages now connect to real backend services.

**Base URL**: `http://localhost:8090/api`
**Authentication**: Bearer Token (JWT)
**Content-Type**: `application/json`

---

## Backend Integration Summary

The Navigation & UI Renewal feature leverages existing PocketBase APIs:

1. **Authentication API** - Login, signup, OAuth, password reset
2. **Unified Cards API** - Card creation, listing, updates
3. **Collections API** - Collection management
4. **Unified Users API** - User profiles, stats, preferences
5. **Teams API** - Team data for themes
6. **File Upload API** - Image uploads for cards

All API contracts are defined in [specs/000-backend-architecture/API_REFERENCE.md](../../000-backend-architecture/API_REFERENCE.md).

---

## 🔐 Authentication API

### Login
```http
POST /api/collections/users/auth-with-password
Content-Type: application/json

{
  "identity": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "record": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "avatar_url",
    "created": "2024-01-01T00:00:00.000Z",
    "updated": "2024-01-01T00:00:00.000Z"
  }
}
```

**Frontend Usage**: `/login` page (AuthForm component)
**Data Model**: `AuthResponse`, `User` (see [data-model.md](../data-model.md))

---

### Register
```http
POST /api/collections/users/records
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "name": "User Name"
}
```

**Response:** Same as Login (auto-login after registration)

**Frontend Usage**: `/register` page (AuthForm component)

---

### Token Refresh
```http
POST /api/collections/users/auth-refresh
Authorization: Bearer {token}
```

**Response:**
```json
{
  "token": "new_token",
  "record": { ... }
}
```

**Frontend Usage**: Automatic refresh in PocketBase SDK (stores/auth.ts)

---

### Password Reset Request
```http
POST /api/collections/users/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

**Frontend Usage**: Future implementation (not in current spec)

---

## 🃏 Unified Cards API

### List Cards
```http
GET /api/collections/unified_cards/records?page=1&perPage=30&sort=-created&filter=context="community"
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `perPage`: Items per page (default: 30)
- `sort`: Sort field (e.g., `-created`, `community_likes`)
- `filter`: Filter expression (e.g., `context="community" && community_is_public=true`)
- `expand`: Related data (e.g., `community_creator`)

**Response:**
```json
{
  "page": 1,
  "perPage": 30,
  "totalItems": 100,
  "totalPages": 4,
  "items": [
    {
      "id": "card_id",
      "title": "Card Title",
      "holographic_image": "image_url",
      "holographic_effect": "overlay",
      "holographic_intensity": 75,
      "photocard_rarity": "rare",
      "community_creator": "user_id",
      "community_likes": 42,
      "community_rating": 4.5,
      "community_tags": ["kbo", "baseball"],
      "context": "community",
      "created": "2024-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Frontend Usage**: `/gallery` page, `/collections` page
**Data Model**: `PocketBaseListResponse<UnifiedCard>`, `UnifiedCard`

---

### Get Card
```http
GET /api/collections/unified_cards/records/{id}?expand=community_creator
```

**Response:**
```json
{
  "id": "card_id",
  "title": "Card Title",
  // ... all UnifiedCard fields
  "expand": {
    "community_creator": {
      "id": "user_id",
      "display_name": "Creator Name",
      "avatar_url": "avatar_url"
    }
  }
}
```

**Frontend Usage**: Card detail modal, card preview
**Data Model**: `UnifiedCard`

---

### Create Card
```http
POST /api/collections/unified_cards/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Card",
  "description": "Card description",
  "holographic_image": "image_url_or_file_id",
  "holographic_effect": "overlay",
  "holographic_intensity": 75,
  "photocard_rarity": "common",
  "community_creator": "user_id",
  "community_is_public": true,
  "community_tags": ["kbo", "baseball"],
  "context": "community"
}
```

**Response:** Created card object (same as Get Card)

**Frontend Usage**: `/create` page (CardCreationForm component)
**Data Model**: `CardCreationData` (input), `UnifiedCard` (output)

**Note**: File upload is a separate request (see File Upload API below)

---

### Update Card
```http
PATCH /api/collections/unified_cards/records/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "community_likes": 43
}
```

**Response:** Updated card object

**Frontend Usage**: Card edit modal (future implementation)

---

### Delete Card
```http
DELETE /api/collections/unified_cards/records/{id}
Authorization: Bearer {token}
```

**Response:** `null` (204 No Content)

**Frontend Usage**: Card delete action (future implementation)

---

## 📚 Collections API

### List Collections
```http
GET /api/collections/collections/records?page=1&perPage=20&filter=owner="user_id"
```

**Query Parameters:** Same as Unified Cards API

**Response:**
```json
{
  "page": 1,
  "perPage": 20,
  "totalItems": 5,
  "totalPages": 1,
  "items": [
    {
      "id": "collection_id",
      "name": "My Collection",
      "description": "Collection description",
      "owner": "user_id",
      "cards": ["card_id_1", "card_id_2"],
      "is_public": true,
      "total_cards": 2,
      "completion_rate": 100,
      "created": "2024-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Frontend Usage**: `/collections` page (CollectionCard component)
**Data Model**: `PocketBaseListResponse<Collection>`, `Collection`

---

### Create Collection
```http
POST /api/collections/collections/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Collection",
  "description": "Collection description",
  "owner": "user_id",
  "cards": [],
  "is_public": true,
  "total_cards": 0,
  "completion_rate": 0
}
```

**Response:** Created collection object

**Frontend Usage**: `/collections` page (create modal)

---

### Update Collection
```http
PATCH /api/collections/collections/records/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "cards": ["card_id_1", "card_id_2", "card_id_3"],
  "total_cards": 3,
  "completion_rate": 75
}
```

**Response:** Updated collection object

**Frontend Usage**: Add/remove cards from collection

---

### Delete Collection
```http
DELETE /api/collections/collections/records/{id}
Authorization: Bearer {token}
```

**Response:** `null` (204 No Content)

**Frontend Usage**: Collection delete action

---

## 👥 Unified Users API

### Get User Profile
```http
GET /api/collections/unified_users/records?filter=user_id="user_id"
```

**Response:**
```json
{
  "items": [
    {
      "id": "unified_user_id",
      "user_id": "user_id",
      "display_name": "User Name",
      "avatar_url": "avatar_url",
      "theme": "light",
      "fan_favorite_team": "LG 트윈스",
      "fan_level": 2,
      "fan_points": 150,
      "creator_followers": 10,
      "creator_following": 5,
      "stats_cards_created": 25,
      "stats_cards_collected": 150,
      "stats_collections": 5,
      "created": "2024-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Frontend Usage**: Navigation header, profile page
**Data Model**: `UnifiedUser`

---

### Update User Profile
```http
PATCH /api/collections/unified_users/records/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_name": "New Name",
  "theme": "dark",
  "fan_favorite_team": "두산 베어스"
}
```

**Response:** Updated user object

**Frontend Usage**: Profile settings page (future)

---

## 🏢 Teams API

### List Teams
```http
GET /api/collections/kbo_teams/records
```

**Response:**
```json
{
  "items": [
    {
      "id": "team_id",
      "name": "LG 트윈스",
      "name_en": "LG Twins",
      "primary_color": "#C30452",
      "secondary_color": "#000000",
      "mascot": "트윈돌이",
      "stadium": "잠실야구장",
      "created": "2024-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Frontend Usage**: Team selector, theme switcher
**Data Model**: `KboTeam` (see data-model.md)

---

## 📁 File Upload API

### Upload Image
```http
POST /api/files/unified_cards/{recordId}/holographic_image
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
```

**Response:**
```json
{
  "id": "file_id",
  "collectionId": "unified_cards",
  "collectionName": "unified_cards",
  "recordId": "card_id",
  "filename": "image.jpg",
  "url": "http://localhost:8090/api/files/unified_cards/card_id/holographic_image/image.jpg"
}
```

**Frontend Usage**: `/create` page (CardCreationForm image upload)
**Data Model**: `FileUploadResponse`

**Upload Flow:**
1. Create card record without image (returns `recordId`)
2. Upload image with `recordId` in URL
3. Update card record with returned `url` or `filename`

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "code": 400,
  "message": "Validation failed",
  "data": {
    "title": {
      "code": "validation_required",
      "message": "The title field is required."
    },
    "email": {
      "code": "validation_invalid_email",
      "message": "Invalid email format."
    }
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (validation error)
- `500` - Internal Server Error

**Frontend Handling:**
- `401` → Redirect to `/login`
- `403` → Show permission denied message
- `404` → Show "not found" page
- `400/422` → Display field-level errors in forms
- `500` → Show generic error message

**Data Model**: `PocketBaseError`, `AppError`

---

## 🔍 Advanced Query Features

### Filtering
```http
GET /api/collections/unified_cards/records?filter=context="community" && community_is_public=true && community_rating>=4.0
```

**Filter Operators:**
- `=` - Equal
- `!=` - Not equal
- `>`, `>=`, `<`, `<=` - Comparison
- `~` - Like (case-insensitive)
- `&&` - AND
- `||` - OR

**Frontend Usage**: Search filters, advanced filtering

---

### Sorting
```http
GET /api/collections/unified_cards/records?sort=-community_likes,created
```

**Sort Format:**
- `-field` - Descending
- `field` - Ascending
- Multiple fields separated by comma

**Frontend Usage**: Sort dropdowns, default sorting

---

### Expanding Relations
```http
GET /api/collections/unified_cards/records?expand=community_creator
```

**Expand Format:**
- Single relation: `expand=community_creator`
- Multiple relations: `expand=community_creator,owner`
- Nested relations: `expand=community_creator.user_id`

**Frontend Usage**: Fetching related user data with cards

---

### Field Selection
```http
GET /api/collections/unified_cards/records?fields=id,title,holographic_image,community_likes
```

**Frontend Usage**: Optimizing payload size for card thumbnails

---

## 📊 Usage Examples by Page

### `/login` Page
**APIs Used:**
- `POST /api/collections/users/auth-with-password` - Login
- `POST /api/collections/users/records` - Register (if signup mode)

**Data Flow:**
1. User submits form
2. Call auth API
3. Store token in `pb.authStore`
4. Redirect to `/gallery`

---

### `/create` Page
**APIs Used:**
- `POST /api/collections/unified_cards/records` - Create card
- `POST /api/files/unified_cards/{id}/holographic_image` - Upload image

**Data Flow:**
1. User fills form and selects image
2. Create card record (without image)
3. Upload image file with card ID
4. Redirect to `/gallery` or show success message

---

### `/collections` Page
**APIs Used:**
- `GET /api/collections/collections/records?filter=owner="user_id"` - List user collections
- `GET /api/collections/unified_cards/records?filter=id?="{card_ids}"` - Fetch collection cards
- `POST /api/collections/collections/records` - Create collection
- `PATCH /api/collections/collections/records/{id}` - Update collection
- `DELETE /api/collections/collections/records/{id}` - Delete collection

**Data Flow:**
1. Fetch user's collections on page load
2. Display collections in grid
3. On collection click, fetch cards in that collection
4. Show collection detail modal

---

### Navigation Header
**APIs Used:**
- `GET /api/collections/unified_users/records?filter=user_id="user_id"` - Get user profile
- `GET /api/collections/users/records/{id}` - Get auth user

**Data Flow:**
1. Check `pb.authStore.model` for current user
2. Fetch unified user profile for display name, avatar
3. Show user info in header
4. Update on auth state change

---

## 🔧 PocketBase SDK Integration

### Client Setup
```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://localhost:8090');
pb.autoCancellation(false);

// Type-safe collections
export const collections = {
  users: pb.collection('users'),
  unifiedUsers: pb.collection('unified_users'),
  unifiedCards: pb.collection('unified_cards'),
  collections: pb.collection('collections'),
  kboTeams: pb.collection('kbo_teams'),
};
```

### Service Layer Example
```typescript
// src/lib/services/cards.ts
import { pb, collections } from '$lib/pocketbase';
import type { UnifiedCard, PocketBaseListResponse } from '$lib/types';

export async function listCards(page = 1, perPage = 30): Promise<PocketBaseListResponse<UnifiedCard>> {
  return await collections.unifiedCards.getList<UnifiedCard>(page, perPage, {
    sort: '-created',
    filter: 'context="community" && community_is_public=true',
    expand: 'community_creator',
  });
}

export async function createCard(data: CardCreationData): Promise<UnifiedCard> {
  // Create card record
  const card = await collections.unifiedCards.create<UnifiedCard>(data);

  // Upload image if provided
  if (data.image instanceof File) {
    const formData = new FormData();
    formData.append('holographic_image', data.image);
    await collections.unifiedCards.update(card.id, formData);
  }

  return card;
}
```

### Auth Service Example
```typescript
// src/lib/services/auth.ts
import { pb } from '$lib/pocketbase';
import type { AuthResponse } from '$lib/types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const authData = await pb.collection('users').authWithPassword(email, password);
  return {
    token: authData.token,
    record: authData.record,
  };
}

export async function logout(): Promise<void> {
  pb.authStore.clear();
}

export function isAuthenticated(): boolean {
  return pb.authStore.isValid;
}

export function getCurrentUser(): User | null {
  return pb.authStore.model as User | null;
}
```

---

## 📚 Related Documents

- **API Reference**: [specs/000-backend-architecture/API_REFERENCE.md](../../000-backend-architecture/API_REFERENCE.md)
- **Backend Guide**: [specs/000-backend-architecture/BACKEND_ARCHITECTURE_GUIDE.md](../../000-backend-architecture/BACKEND_ARCHITECTURE_GUIDE.md)
- **Data Model**: [data-model.md](../data-model.md)
- **Quickstart**: [quickstart.md](../quickstart.md)

---

## 🧪 Testing

### Mock Data for Tests
```typescript
// tests/mocks/pocketbase.ts
export const mockAuthResponse: AuthResponse = {
  token: 'mock_token',
  record: {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'avatar_url',
    emailVisibility: false,
    verified: true,
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
  },
};

export const mockCard: UnifiedCard = {
  id: 'card_123',
  title: 'Test Card',
  holographic_image: 'image_url',
  holographic_effect: 'overlay',
  holographic_intensity: 75,
  // ... other fields
};
```

### Integration Tests
```typescript
// tests/integration/cards.test.ts
import { describe, it, expect } from 'vitest';
import { listCards, createCard } from '$lib/services/cards';

describe('Cards API Integration', () => {
  it('should list cards', async () => {
    const result = await listCards(1, 10);
    expect(result.items).toBeInstanceOf(Array);
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it('should create card', async () => {
    const data = { title: 'Test Card', /* ... */ };
    const card = await createCard(data);
    expect(card.id).toBeDefined();
    expect(card.title).toBe('Test Card');
  });
});
```

---

**Last Updated**: 2025-01-08
**Version**: 2.0.0 (Backend Integration)
**Status**: ✅ Complete - Full PocketBase integration documented
