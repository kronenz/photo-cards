# Data Model - Template Marketplace

> Generated: 2025-01-07
> Phase: 001-template-marketplace
> Status: Phase 1 Design Artifact

---

## Overview

This document defines the data model for the Template Marketplace feature, including PocketBase collection schemas, TypeScript interfaces, and validation rules.

**Key Entities**:
1. **Template**: Marketplace template metadata and storage references
2. **TemplateReview**: User ratings and reviews
3. **TemplateCategory**: Hierarchical categorization
4. **TemplateDownload**: Download tracking and statistics
5. **FlaggedUpload**: Copyright detection review queue

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   users     │◄────────│    templates     │────────►│  template_  │
│ (existing)  │  author │  (new)           │ category│  categories │
└─────────────┘         └──────────────────┘         └─────────────┘
                                │
                                │
                    ┌───────────┼───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐      ┌──────────────────┐
            │   template_   │      │  template_       │
            │   reviews     │      │  downloads       │
            └───────────────┘      └──────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   flagged_    │
            │   uploads     │
            └───────────────┘
```

---

## 1. Template Entity

### PocketBase Collection Schema

**Collection Name**: `templates`

```javascript
{
  "name": "templates",
  "type": "base",
  "schema": [
    {
      "name": "template_id",
      "type": "text",
      "required": true,
      "unique": true,
      "pattern": "^tpl_[a-z0-9_]{3,50}$"
    },
    {
      "name": "version",
      "type": "text",
      "required": true,
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    {
      "name": "template_version",
      "type": "text",
      "required": true,
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    {
      "name": "title",
      "type": "text",
      "required": true,
      "min": 3,
      "max": 100
    },
    {
      "name": "description",
      "type": "text",
      "required": true,
      "min": 10,
      "max": 1000
    },
    {
      "name": "author",
      "type": "relation",
      "required": true,
      "collectionId": "users",
      "cascadeDelete": false
    },
    {
      "name": "category",
      "type": "relation",
      "required": true,
      "collectionId": "template_categories",
      "cascadeDelete": false
    },
    {
      "name": "tags",
      "type": "json",
      "required": true
    },
    {
      "name": "storage_url",
      "type": "url",
      "required": true
    },
    {
      "name": "thumbnail_url",
      "type": "url",
      "required": true
    },
    {
      "name": "file_size",
      "type": "number",
      "required": true,
      "min": 1,
      "max": 15728640
    },
    {
      "name": "file_hash",
      "type": "text",
      "required": true,
      "pattern": "^sha256:[a-f0-9]{64}$"
    },
    {
      "name": "rating_average",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 5
    },
    {
      "name": "rating_count",
      "type": "number",
      "required": false,
      "min": 0
    },
    {
      "name": "download_count",
      "type": "number",
      "required": false,
      "min": 0
    },
    {
      "name": "view_count",
      "type": "number",
      "required": false,
      "min": 0
    },
    {
      "name": "is_remix",
      "type": "bool",
      "required": true
    },
    {
      "name": "original_template_id",
      "type": "relation",
      "required": false,
      "collectionId": "templates",
      "cascadeDelete": false
    },
    {
      "name": "allow_remix",
      "type": "bool",
      "required": true
    },
    {
      "name": "license",
      "type": "select",
      "required": true,
      "options": ["CC-BY", "CC-BY-SA", "CC-BY-NC", "CC-BY-NC-SA", "All Rights Reserved"]
    },
    {
      "name": "is_premium",
      "type": "bool",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": false,
      "min": 0
    },
    {
      "name": "currency",
      "type": "select",
      "required": false,
      "options": ["KRW", "USD"]
    },
    {
      "name": "copyright_status",
      "type": "select",
      "required": true,
      "options": ["pending", "approved", "flagged", "rejected"]
    },
    {
      "name": "copyright_check_metadata",
      "type": "json",
      "required": false
    },
    {
      "name": "is_published",
      "type": "bool",
      "required": true
    },
    {
      "name": "published_at",
      "type": "date",
      "required": false
    },
    {
      "name": "featured",
      "type": "bool",
      "required": false
    },
    {
      "name": "metadata",
      "type": "json",
      "required": false
    }
  ],
  "indexes": [
    "CREATE INDEX idx_templates_author ON templates(author)",
    "CREATE INDEX idx_templates_category ON templates(category)",
    "CREATE INDEX idx_templates_rating ON templates(rating_average DESC)",
    "CREATE INDEX idx_templates_downloads ON templates(download_count DESC)",
    "CREATE INDEX idx_templates_published ON templates(published_at DESC)",
    "CREATE INDEX idx_templates_featured ON templates(featured, published_at DESC)"
  ],
  "listRule": "is_published = true && copyright_status = 'approved'",
  "viewRule": "is_published = true && copyright_status = 'approved'",
  "createRule": "@request.auth.id != ''",
  "updateRule": "author = @request.auth.id",
  "deleteRule": "author = @request.auth.id"
}
```

### TypeScript Interface

```typescript
/**
 * Template Marketplace Template Entity
 *
 * Represents a user-created or system-provided holographic card template
 * that can be browsed, downloaded, and applied to create custom cards.
 *
 * @see User Story 1: Template Discovery & Browsing
 * @see User Story 2: Template Reviews & Ratings
 */
export interface Template {
  // PocketBase Standard Fields
  id: string;                    // PocketBase auto-generated ID
  created: string;               // ISO 8601 timestamp
  updated: string;               // ISO 8601 timestamp
  collectionId: string;          // "templates"
  collectionName: string;        // "templates"

  // Template Identity
  template_id: string;           // Unique identifier (e.g., "tpl_lg_homerun_moment_001")
  version: string;               // Template content version (e.g., "1.2.0")
  template_version: string;      // Template schema version (e.g., "1.0.0")

  // Metadata
  title: string;                 // Display title (3-100 chars)
  description: string;           // Full description (10-1000 chars)
  author: string;                // Relation to users collection
  category: string;              // Relation to template_categories
  tags: string[];                // Search tags (e.g., ["LG 트윈스", "홈런"])

  // Storage
  storage_url: string;           // Cloudflare R2 URL (JSON file)
  thumbnail_url: string;         // Preview image URL
  file_size: number;             // Bytes (max 15MB)
  file_hash: string;             // SHA-256 hash for integrity

  // Engagement Metrics
  rating_average?: number;       // 0.0 - 5.0
  rating_count?: number;         // Total number of ratings
  download_count?: number;       // Total downloads
  view_count?: number;           // Total views

  // Remix & Licensing
  is_remix: boolean;             // True if remixed from another template
  original_template_id?: string; // Relation to original template
  allow_remix: boolean;          // Allow others to remix
  license: TemplateLicense;      // Creative Commons or All Rights Reserved

  // Monetization (Phase 4)
  is_premium: boolean;           // Requires payment
  price?: number;                // Price in currency units
  currency?: 'KRW' | 'USD';      // Currency code

  // Copyright Detection
  copyright_status: CopyrightStatus;  // pending | approved | flagged | rejected
  copyright_check_metadata?: {        // AI detection results
    phash_checked: boolean;
    phash_results?: {
      detected: boolean;
      team?: string;
      confidence?: number;
    };
    ai_checked: boolean;
    ai_results?: {
      labels: Array<{ name: string; score: number }>;
      flagged: boolean;
    };
    manual_review?: {
      reviewer_id: string;
      reviewed_at: string;
      notes?: string;
    };
  };

  // Publishing
  is_published: boolean;         // Publicly visible
  published_at?: string;         // ISO 8601 timestamp
  featured?: boolean;            // Featured on homepage

  // Extensibility
  metadata?: Record<string, unknown>;  // Additional custom fields
}

export type TemplateLicense =
  | 'CC-BY'           // Attribution
  | 'CC-BY-SA'        // Attribution-ShareAlike
  | 'CC-BY-NC'        // Attribution-NonCommercial
  | 'CC-BY-NC-SA'     // Attribution-NonCommercial-ShareAlike
  | 'All Rights Reserved';

export type CopyrightStatus =
  | 'pending'    // Awaiting automated check
  | 'approved'   // Passed all checks
  | 'flagged'    // Detected potential violation
  | 'rejected';  // Manual review rejected
```

### Validation Rules

```typescript
import { z } from 'zod';

export const TemplateSchema = z.object({
  template_id: z.string()
    .regex(/^tpl_[a-z0-9_]{3,50}$/, 'Must match pattern: tpl_[a-z0-9_]{3,50}'),

  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Must be semantic version (e.g., 1.2.0)'),

  template_version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Must be semantic version (e.g., 1.0.0)'),

  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),

  tags: z.array(z.string())
    .min(1, 'At least one tag required')
    .max(10, 'Maximum 10 tags allowed'),

  file_size: z.number()
    .min(1, 'File cannot be empty')
    .max(15 * 1024 * 1024, 'File size must not exceed 15MB'),

  file_hash: z.string()
    .regex(/^sha256:[a-f0-9]{64}$/, 'Must be SHA-256 hash'),

  rating_average: z.number()
    .min(0)
    .max(5)
    .optional(),

  price: z.number()
    .min(0, 'Price cannot be negative')
    .optional(),

  license: z.enum(['CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'CC-BY-NC-SA', 'All Rights Reserved']),

  copyright_status: z.enum(['pending', 'approved', 'flagged', 'rejected']),
});

export type ValidatedTemplate = z.infer<typeof TemplateSchema>;
```

---

## 2. TemplateReview Entity

### PocketBase Collection Schema

**Collection Name**: `template_reviews`

```javascript
{
  "name": "template_reviews",
  "type": "base",
  "schema": [
    {
      "name": "template",
      "type": "relation",
      "required": true,
      "collectionId": "templates",
      "cascadeDelete": true
    },
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "collectionId": "users",
      "cascadeDelete": true
    },
    {
      "name": "rating",
      "type": "number",
      "required": true,
      "min": 1,
      "max": 5
    },
    {
      "name": "comment",
      "type": "text",
      "required": false,
      "max": 2000
    },
    {
      "name": "helpful_count",
      "type": "number",
      "required": false,
      "min": 0
    },
    {
      "name": "is_verified_purchase",
      "type": "bool",
      "required": false
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_reviews_user_template ON template_reviews(user, template)",
    "CREATE INDEX idx_reviews_template ON template_reviews(template)",
    "CREATE INDEX idx_reviews_rating ON template_reviews(rating DESC)",
    "CREATE INDEX idx_reviews_helpful ON template_reviews(helpful_count DESC)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "@request.auth.id != '' && user = @request.auth.id",
  "updateRule": "user = @request.auth.id",
  "deleteRule": "user = @request.auth.id"
}
```

### TypeScript Interface

```typescript
/**
 * Template Review Entity
 *
 * User-submitted ratings and reviews for marketplace templates.
 * Supports 1-5 star ratings with optional text comments.
 *
 * @see User Story 2: Template Reviews & Ratings
 */
export interface TemplateReview {
  // PocketBase Standard Fields
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;

  // Review Data
  template: string;              // Relation to templates
  user: string;                  // Relation to users
  rating: number;                // 1-5 stars
  comment?: string;              // Optional text review (max 2000 chars)

  // Engagement
  helpful_count?: number;        // Number of "helpful" votes
  is_verified_purchase?: boolean; // True if user downloaded/purchased template
}
```

---

## 3. TemplateCategory Entity

### PocketBase Collection Schema

**Collection Name**: `template_categories`

```javascript
{
  "name": "template_categories",
  "type": "base",
  "schema": [
    {
      "name": "slug",
      "type": "text",
      "required": true,
      "unique": true,
      "pattern": "^[a-z0-9-]+$"
    },
    {
      "name": "name",
      "type": "text",
      "required": true,
      "min": 2,
      "max": 50
    },
    {
      "name": "description",
      "type": "text",
      "required": false,
      "max": 500
    },
    {
      "name": "parent",
      "type": "relation",
      "required": false,
      "collectionId": "template_categories",
      "cascadeDelete": false
    },
    {
      "name": "icon",
      "type": "text",
      "required": false
    },
    {
      "name": "color",
      "type": "text",
      "required": false,
      "pattern": "^#[0-9A-Fa-f]{6}$"
    },
    {
      "name": "order",
      "type": "number",
      "required": false,
      "min": 0
    },
    {
      "name": "is_active",
      "type": "bool",
      "required": true
    }
  ],
  "indexes": [
    "CREATE INDEX idx_categories_parent ON template_categories(parent)",
    "CREATE INDEX idx_categories_order ON template_categories(order ASC)"
  ],
  "listRule": "is_active = true",
  "viewRule": "is_active = true",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}
```

### TypeScript Interface

```typescript
/**
 * Template Category Entity
 *
 * Hierarchical categorization system for templates.
 * Supports unlimited nesting (parent-child relationships).
 *
 * @see User Story 3: Template Search & Filtering
 */
export interface TemplateCategory {
  // PocketBase Standard Fields
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;

  // Category Data
  slug: string;                  // URL-safe identifier (e.g., "moment-cards")
  name: string;                  // Display name (e.g., "순간 카드")
  description?: string;          // Category description
  parent?: string;               // Relation to parent category (null for top-level)

  // Display Metadata
  icon?: string;                 // Icon name or emoji
  color?: string;                // Hex color code
  order?: number;                // Display order (0-indexed)

  // Status
  is_active: boolean;            // Publicly visible
}

/**
 * Example category hierarchy:
 *
 * - moment-cards (순간 카드)
 *   - homerun (홈런)
 *   - pitching (투구)
 *   - fielding (수비)
 *
 * - player-cards (선수 카드)
 *   - lg-twins (LG 트윈스)
 *   - doosan-bears (두산 베어스)
 *   ...
 *
 * - season-cards (시즌 카드)
 *   - 2024-season
 *   - 2023-season
 */
```

---

## 4. TemplateDownload Entity

### PocketBase Collection Schema

**Collection Name**: `template_downloads`

```javascript
{
  "name": "template_downloads",
  "type": "base",
  "schema": [
    {
      "name": "template",
      "type": "relation",
      "required": true,
      "collectionId": "templates",
      "cascadeDelete": true
    },
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "collectionId": "users",
      "cascadeDelete": true
    },
    {
      "name": "ip_address",
      "type": "text",
      "required": false
    },
    {
      "name": "user_agent",
      "type": "text",
      "required": false
    },
    {
      "name": "source",
      "type": "select",
      "required": true,
      "options": ["marketplace", "profile", "search", "featured", "direct"]
    }
  ],
  "indexes": [
    "CREATE INDEX idx_downloads_template ON template_downloads(template)",
    "CREATE INDEX idx_downloads_user ON template_downloads(user)",
    "CREATE INDEX idx_downloads_created ON template_downloads(created DESC)"
  ],
  "listRule": "user = @request.auth.id",
  "viewRule": "user = @request.auth.id",
  "createRule": "@request.auth.id != '' && user = @request.auth.id",
  "updateRule": null,
  "deleteRule": null
}
```

### TypeScript Interface

```typescript
/**
 * Template Download Event Entity
 *
 * Tracks each template download for analytics and statistics.
 * Used to calculate download_count on Template entity.
 *
 * @see User Story 1: Template Discovery & Browsing
 */
export interface TemplateDownload {
  // PocketBase Standard Fields
  id: string;
  created: string;              // Download timestamp
  updated: string;
  collectionId: string;
  collectionName: string;

  // Download Event
  template: string;             // Relation to templates
  user: string;                 // Relation to users

  // Analytics
  ip_address?: string;          // User IP (hashed for privacy)
  user_agent?: string;          // Browser user agent
  source: DownloadSource;       // Traffic source
}

export type DownloadSource =
  | 'marketplace'   // From marketplace grid
  | 'profile'       // From user profile
  | 'search'        // From search results
  | 'featured'      // From featured section
  | 'direct';       // Direct link
```

---

## 5. FlaggedUpload Entity

### PocketBase Collection Schema

**Collection Name**: `flagged_uploads`

```javascript
{
  "name": "flagged_uploads",
  "type": "base",
  "schema": [
    {
      "name": "template",
      "type": "relation",
      "required": true,
      "collectionId": "templates",
      "cascadeDelete": true
    },
    {
      "name": "uploader",
      "type": "relation",
      "required": true,
      "collectionId": "users",
      "cascadeDelete": false
    },
    {
      "name": "flag_reason",
      "type": "select",
      "required": true,
      "options": ["logo_detected", "ai_flagged", "user_reported", "manual_review"]
    },
    {
      "name": "detection_metadata",
      "type": "json",
      "required": true
    },
    {
      "name": "status",
      "type": "select",
      "required": true,
      "options": ["pending", "reviewing", "approved", "rejected"]
    },
    {
      "name": "reviewer",
      "type": "relation",
      "required": false,
      "collectionId": "users",
      "cascadeDelete": false
    },
    {
      "name": "reviewed_at",
      "type": "date",
      "required": false
    },
    {
      "name": "review_notes",
      "type": "text",
      "required": false,
      "max": 2000
    }
  ],
  "indexes": [
    "CREATE INDEX idx_flagged_template ON flagged_uploads(template)",
    "CREATE INDEX idx_flagged_status ON flagged_uploads(status)",
    "CREATE INDEX idx_flagged_created ON flagged_uploads(created DESC)"
  ],
  "listRule": "@request.auth.id != '' && @collection.users.role ?= 'admin'",
  "viewRule": "@request.auth.id != '' && (uploader = @request.auth.id || @collection.users.role ?= 'admin')",
  "createRule": "@request.auth.id != ''",
  "updateRule": "@request.auth.id != '' && @collection.users.role ?= 'admin'",
  "deleteRule": null
}
```

### TypeScript Interface

```typescript
/**
 * Flagged Upload Entity
 *
 * Queue for copyright detection review.
 * Created when automated checks detect potential violations.
 *
 * @see research.md - Decision 3: Copyright Detection
 */
export interface FlaggedUpload {
  // PocketBase Standard Fields
  id: string;
  created: string;              // Flag timestamp
  updated: string;
  collectionId: string;
  collectionName: string;

  // Flagged Template
  template: string;             // Relation to templates
  uploader: string;             // Relation to users

  // Flag Details
  flag_reason: FlagReason;      // Why it was flagged
  detection_metadata: {         // Detection results
    phash_results?: {
      detected: boolean;
      team?: string;
      confidence?: number;
    };
    ai_results?: {
      labels: Array<{ name: string; score: number }>;
      flagged: boolean;
    };
    user_report?: {
      reporter_id: string;
      reason: string;
    };
  };

  // Review Status
  status: ReviewStatus;         // Current review state
  reviewer?: string;            // Relation to admin user
  reviewed_at?: string;         // ISO 8601 timestamp
  review_notes?: string;        // Admin notes
}

export type FlagReason =
  | 'logo_detected'    // pHash detected KBO/team logo
  | 'ai_flagged'       // Cloudflare AI flagged content
  | 'user_reported'    // User submitted DMCA report
  | 'manual_review';   // Admin requested review

export type ReviewStatus =
  | 'pending'     // Awaiting review
  | 'reviewing'   // Admin actively reviewing
  | 'approved'    // Passed review (false positive)
  | 'rejected';   // Failed review (true violation)
```

---

## Data Relationships

### One-to-Many Relationships

1. **users → templates** (author)
   - One user can create many templates
   - Cascade: Do not delete templates when user deleted (orphan or reassign)

2. **template_categories → templates** (category)
   - One category can contain many templates
   - Cascade: Do not delete templates when category deleted (reassign to "uncategorized")

3. **templates → template_reviews** (template)
   - One template can have many reviews
   - Cascade: Delete reviews when template deleted

4. **users → template_reviews** (user)
   - One user can write many reviews
   - Cascade: Delete reviews when user deleted

5. **templates → template_downloads** (template)
   - One template can have many downloads
   - Cascade: Delete downloads when template deleted

6. **users → template_downloads** (user)
   - One user can download many templates
   - Cascade: Delete downloads when user deleted

7. **templates → flagged_uploads** (template)
   - One template can be flagged multiple times
   - Cascade: Delete flags when template deleted

### Self-Referencing Relationships

1. **template_categories → template_categories** (parent)
   - One category can have many child categories
   - Cascade: Do not delete children (orphan or move to top-level)

2. **templates → templates** (original_template_id)
   - One template can be remixed into many new templates
   - Cascade: Do not delete remixes (orphan)

---

## Computed Fields & Aggregations

### Template Statistics (Computed)

```typescript
/**
 * Statistics computed from related entities
 * (not stored in templates collection)
 */
export interface TemplateStatistics {
  rating_average: number;       // AVG(template_reviews.rating)
  rating_count: number;         // COUNT(template_reviews)
  download_count: number;       // COUNT(template_downloads)
  view_count: number;           // Tracked via analytics (not in DB)
  remix_count: number;          // COUNT(templates WHERE original_template_id = this.id)
}
```

**Update Strategy**:
- Use PocketBase hooks to update aggregates on insert/update/delete
- Cache in `templates` collection for query performance
- Recalculate periodically via cron job for accuracy

**Example Hook**:
```typescript
// src/lib/server/pocketbase-hooks.ts
pb.collection('template_reviews').on('afterCreate', async (e) => {
  const templateId = e.record.template;

  // Recalculate rating average
  const reviews = await pb.collection('template_reviews').getFullList({
    filter: `template = "${templateId}"`
  });

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await pb.collection('templates').update(templateId, {
    rating_average: avg,
    rating_count: reviews.length
  });
});
```

---

## Initial Seed Data

### Template Categories (Initial)

```typescript
export const INITIAL_CATEGORIES: Omit<TemplateCategory, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>[] = [
  // Top-Level Categories
  {
    slug: 'moment-cards',
    name: '순간 카드',
    description: '경기의 명장면을 담은 카드 템플릿',
    parent: undefined,
    icon: '⚡',
    color: '#FF6B35',
    order: 0,
    is_active: true
  },
  {
    slug: 'player-cards',
    name: '선수 카드',
    description: '선수 프로필 카드 템플릿',
    parent: undefined,
    icon: '👤',
    color: '#004E89',
    order: 1,
    is_active: true
  },
  {
    slug: 'season-cards',
    name: '시즌 카드',
    description: '시즌 통계 및 기록 카드 템플릿',
    parent: undefined,
    icon: '📊',
    color: '#1B998B',
    order: 2,
    is_active: true
  },
  {
    slug: 'team-cards',
    name: '팀 카드',
    description: '구단별 테마 카드 템플릿',
    parent: undefined,
    icon: '🏆',
    color: '#C5283D',
    order: 3,
    is_active: true
  },

  // Subcategories - Moment Cards
  {
    slug: 'homerun',
    name: '홈런',
    description: '홈런 장면 템플릿',
    parent: 'moment-cards', // Reference to parent slug
    icon: '⚾',
    color: '#FF6B35',
    order: 0,
    is_active: true
  },
  {
    slug: 'pitching',
    name: '투구',
    description: '투수 명장면 템플릿',
    parent: 'moment-cards',
    icon: '🎯',
    color: '#FF6B35',
    order: 1,
    is_active: true
  },

  // Subcategories - Team Cards (10 teams)
  {
    slug: 'lg-twins',
    name: 'LG 트윈스',
    description: 'LG 트윈스 테마 템플릿',
    parent: 'team-cards',
    icon: '⚪',
    color: '#C30452',
    order: 0,
    is_active: true
  },
  {
    slug: 'doosan-bears',
    name: '두산 베어스',
    description: '두산 베어스 테마 템플릿',
    parent: 'team-cards',
    icon: '🐻',
    color: '#131230',
    order: 1,
    is_active: true
  }
  // ... 8 more teams
];
```

---

## Migration Plan

### Phase 1: Core Collections (Immediate)

1. Create `templates` collection
2. Create `template_categories` collection
3. Seed initial categories
4. Test upload workflow

### Phase 2: Engagement Features (Sprint 1)

5. Create `template_reviews` collection
6. Create `template_downloads` collection
7. Add aggregation hooks

### Phase 3: Copyright System (Sprint 2)

8. Create `flagged_uploads` collection
9. Implement detection workflow
10. Add admin review dashboard

### Phase 4: Remixing & Versioning (Sprint 3)

11. Add remix fields to `templates`
12. Implement version migration logic

---

## References

- **spec.md**: User Stories US1-US3
- **research.md**: Template JSON format, Cloud storage decisions
- **plan.md**: Phase 1 data model requirements
- **PocketBase Docs**: https://pocketbase.io/docs/collections/

---

**Next Steps**:
1. Generate PocketBase migration scripts
2. Create TypeScript types package
3. Implement validation middleware
4. Write unit tests for schema validation
