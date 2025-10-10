# Quickstart Guide: Navigation & UI Renewal

**Feature**: 003-navigation-ui-renewal
**Date**: 2025-01-08
**Audience**: Developers implementing the new design system

---

## Overview

This guide provides practical integration scenarios for the new design system components. Follow these examples to refactor existing pages and build new features consistently.

---

## 🚀 Getting Started

### Prerequisites

```bash
# Ensure you have the latest dependencies
npm install

# Install new dependencies
npm install bits-ui
npm install --save-dev @percy/cli @percy/playwright
```

### Project Structure

```
src/lib/
├── components/
│   ├── design-system/     # New base components
│   ├── navigation/        # New navigation components
│   ├── pages/             # Page-specific components
│   └── unified/           # Existing holographic card (unchanged)
├── stores/
│   ├── navigation.ts      # New navigation store
│   ├── theme.ts           # New theme store
│   └── form.ts            # New form utilities
└── styles/
    └── design-tokens.css  # New design tokens
```

---

## 📋 Integration Scenarios

### Scenario 1: Refactor a Page with New Design System

**Goal**: Update the `/create` page to use new Button and Input components

#### Before (Current)
```svelte
<!-- src/routes/create/+page.svelte -->
<script lang="ts">
  let title = '';
</script>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">카드 제작</h1>

  <input
    type="text"
    bind:value={title}
    placeholder="카드 제목 입력"
    class="w-full px-4 py-2 border rounded-lg"
  />

  <button
    class="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  >
    제작하기
  </button>
</div>
```

#### After (With Design System + PocketBase Backend)
```svelte
<!-- src/routes/create/+page.svelte -->
<script lang="ts">
  import { Button, Input } from '$lib/components/design-system';
  import { createCard } from '$lib/services/cards';
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import type { CardCreationData, UnifiedCard } from '$lib/types';

  let formData: Partial<CardCreationData> = {
    title: '',
    description: '',
    holographic_effect: 'overlay',
    holographic_intensity: 75,
    photocard_rarity: 'common',
    community_tags: [],
    community_is_public: true,
    context: 'community'
  };

  let imageFile: File | null = null;
  let errors: Record<string, string> = {};
  let isSubmitting = false;

  async function handleSubmit() {
    if (!formData.title || !imageFile) {
      errors.title = !formData.title ? '카드 제목을 입력해주세요' : '';
      errors.image = !imageFile ? '이미지를 선택해주세요' : '';
      return;
    }

    isSubmitting = true;

    try {
      // Call PocketBase API through service layer
      const card = await createCard({
        ...formData as CardCreationData,
        image: imageFile,
        community_creator: pb.authStore.model?.id || ''
      });

      // Redirect to gallery on success
      await goto('/gallery');
    } catch (error: any) {
      // Handle PocketBase error
      if (error.data?.data) {
        errors = Object.entries(error.data.data).reduce((acc, [key, val]: [string, any]) => {
          acc[key] = val.message;
          return acc;
        }, {} as Record<string, string>);
      } else {
        errors.submit = '카드 생성에 실패했습니다. 다시 시도해주세요.';
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="container mx-auto p-6">
  <h1 class="text-display font-bold mb-6">카드 제작</h1>

  <Input
    label="카드 제목"
    placeholder="카드 제목을 입력해주세요"
    bind:value={formData.title}
    error={errors.title}
    required
    maxLength={50}
  />

  <Input
    type="file"
    label="카드 이미지"
    accept="image/*"
    error={errors.image}
    required
    on:change={(e) => imageFile = e.target.files?.[0] || null}
  />

  <Button
    variant="primary"
    size="lg"
    fullWidth
    onClick={handleSubmit}
    loading={isSubmitting}
    disabled={isSubmitting}
    class="mt-4"
  >
    {isSubmitting ? '제작 중...' : '제작하기'}
  </Button>

  {#if errors.submit}
    <div class="error-message mt-4">{errors.submit}</div>
  {/if}
</div>

<style>
  /* Use design tokens */
  h1 {
    color: var(--text-primary);
  }

  .error-message {
    color: var(--semantic-error);
    font-size: var(--font-body);
  }
</style>
```

**Service Layer** (`src/lib/services/cards.ts`):
```typescript
import { pb, collections } from '$lib/pocketbase';
import type { UnifiedCard, CardCreationData, PocketBaseListResponse } from '$lib/types';

export async function createCard(data: CardCreationData): Promise<UnifiedCard> {
  // Step 1: Create card record without image
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

  // Step 2: Upload image with card ID
  if (data.image) {
    const formData = new FormData();
    formData.append('holographic_image', data.image);
    await collections.unifiedCards.update(card.id, formData);
  }

  return card;
}
```

**PocketBase Client** (`src/lib/pocketbase.ts`):
```typescript
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://localhost:8090');
pb.autoCancellation(false);

// Type-safe collection helpers
export const collections = {
  users: pb.collection('users'),
  unifiedUsers: pb.collection('unified_users'),
  unifiedCards: pb.collection('unified_cards'),
  collections: pb.collection('collections'),
  kboTeams: pb.collection('kbo_teams'),
};
```

**Benefits**:
- ✅ Consistent styling across pages
- ✅ Built-in validation and error handling
- ✅ Accessible by default (ARIA attributes)
- ✅ Dark mode support
- ✅ Type-safe props
- ✅ **Real backend integration with PocketBase**
- ✅ **Proper error handling with field-level validation**
- ✅ **Loading states for async operations**
- ✅ **Service layer pattern for API calls**

---

### Scenario 2: Add Navigation to a New Page

**Goal**: Create a new page with auto-hide navigation

#### Step 1: Create Page with Layout
```svelte
<!-- src/routes/my-new-page/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // Your page logic
  let content = 'Hello World';
</script>

<div class="page-container">
  <h1>My New Page</h1>
  <p>{content}</p>
</div>

<style>
  .page-container {
    min-height: 100vh;
    padding: var(--space-xl);
    background: var(--background-primary);
  }

  h1 {
    font-size: var(--font-title1);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }
</style>
```

#### Step 2: Navigation is Automatic
The layout file (`src/routes/+layout.svelte`) handles navigation automatically:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { NavigationHeader, Footer } from '$lib/components/navigation';
  import { navigationStore, themeStore } from '$lib/stores';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // Initialize stores
  onMount(() => {
    const cleanup = navigationStore.initAutoHideNavigation();
    themeStore.initTheme();
    return cleanup;
  });

  // Update current path on route change
  $: navigationStore.setCurrentPath($page.url.pathname);
</script>

<div class="app" class:dark={$themeStore.theme === 'dark'}>
  <NavigationHeader
    user={$page.data.user}
    currentPath={$page.url.pathname}
    theme={$themeStore.theme}
    visible={$navigationStore.isHeaderVisible}
    onThemeToggle={themeStore.toggleTheme}
  />

  <main class="main-content">
    <slot />
  </main>

  <Footer theme={$themeStore.theme} />
</div>
```

**No page-specific navigation code needed!** Navigation is handled globally.

---

### Scenario 3: Fetch and Display Collections (Backend Integration)

**Goal**: Fetch user collections from PocketBase and display them

```svelte
<!-- src/routes/collections/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { CollectionCard } from '$lib/components/pages/collections';
  import { Button, Modal } from '$lib/components/design-system';
  import { listCollections } from '$lib/services/collections';
  import { pb } from '$lib/pocketbase';
  import type { Collection } from '$lib/types';

  let collections: Collection[] = [];
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    await fetchCollections();
  });

  async function fetchCollections() {
    isLoading = true;
    error = null;

    try {
      const userId = pb.authStore.model?.id;
      if (!userId) {
        throw new Error('로그인이 필요합니다');
      }

      // Fetch from PocketBase
      const response = await listCollections(userId);
      collections = response.items;
    } catch (err: any) {
      error = err.message || '컬렉션을 불러오는데 실패했습니다';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="collections-page">
  <h1 class="text-display font-bold mb-6">내 컬렉션</h1>

  {#if isLoading}
    <div class="loading">컬렉션을 불러오는 중...</div>
  {:else if error}
    <div class="error-message">
      {error}
      <Button onClick={fetchCollections}>다시 시도</Button>
    </div>
  {:else if collections.length === 0}
    <div class="empty-state">
      <p>아직 컬렉션이 없습니다.</p>
      <Button variant="primary" onClick={() => goto('/create')}>
        첫 카드 만들기
      </Button>
    </div>
  {:else}
    <div class="collections-grid">
      {#each collections as collection (collection.id)}
        <CollectionCard {collection} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
  }

  .loading, .error-message, .empty-state {
    text-align: center;
    padding: var(--space-xl);
  }
</style>
```

**Service Layer** (`src/lib/services/collections.ts`):
```typescript
import { collections as pbCollections } from '$lib/pocketbase';
import type { Collection, PocketBaseListResponse } from '$lib/types';

export async function listCollections(userId: string): Promise<PocketBaseListResponse<Collection>> {
  return await pbCollections.collections.getList<Collection>(1, 50, {
    filter: `owner="${userId}"`,
    sort: '-created'
  });
}

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

export async function deleteCollection(id: string): Promise<void> {
  await pbCollections.collections.delete(id);
}
```

**Benefits**:
- ✅ Real-time data from PocketBase
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Retry functionality
- ✅ Type-safe data fetching
- ✅ Service layer abstraction

---

### Scenario 4: Use Modal for Card Preview

**Goal**: Show card details in a modal when clicking a collection item

```svelte
<!-- src/routes/collections/+page.svelte -->
<script lang="ts">
  import { Modal, Button } from '$lib/components/design-system';
  import { CollectionCard } from '$lib/components/pages/collections';
  import type { Collection } from '$lib/types';

  let collections: Collection[] = []; // Fetched from API
  let selectedCollection: Collection | null = null;
  let isModalOpen = false;

  function handleCollectionClick(collection: Collection) {
    selectedCollection = collection;
    isModalOpen = true;
  }

  function handleModalClose() {
    isModalOpen = false;
    selectedCollection = null;
  }
</script>

<div class="collections-page">
  <h1>내 컬렉션</h1>

  <div class="collections-grid">
    {#each collections as collection (collection.id)}
      <CollectionCard
        {collection}
        onClick={() => handleCollectionClick(collection)}
      />
    {/each}
  </div>

  <Modal
    open={isModalOpen}
    onClose={handleModalClose}
    title={selectedCollection?.name}
    description={selectedCollection?.description}
    size="lg"
  >
    {#if selectedCollection}
      <div class="modal-content">
        <img
          src={selectedCollection.thumbnail}
          alt={selectedCollection.name}
          class="modal-thumbnail"
        />

        <div class="modal-stats">
          <p>카드 수: {selectedCollection.cardCount}개</p>
          <p>생성일: {selectedCollection.createdAt.toLocaleDateString('ko-KR')}</p>
        </div>

        <div class="modal-actions">
          <Button
            variant="outline"
            onClick={handleModalClose}
          >
            닫기
          </Button>
          <Button
            variant="primary"
            onClick={() => goto(`/collections/${selectedCollection.id}`)}
          >
            상세보기
          </Button>
        </div>
      </div>
    {/if}
  </Modal>
</div>

<style>
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
    margin-top: var(--space-xl);
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .modal-thumbnail {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: var(--shadow-md);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-md);
    justify-content: flex-end;
  }
</style>
```

**Benefits**:
- ✅ Accessible modal (focus trap, Esc to close)
- ✅ Overlay click to close
- ✅ Smooth animations
- ✅ Responsive sizing
- ✅ Dark mode support

---

### Scenario 5: Add Theme Toggle

**Goal**: Add theme toggle button anywhere in your app

```svelte
<!-- Any component -->
<script lang="ts">
  import { themeStore } from '$lib/stores';
  import { Button } from '$lib/components/design-system';
</script>

<Button
  variant="ghost"
  size="sm"
  onClick={themeStore.toggleTheme}
  aria-label="Toggle theme"
>
  {#if $themeStore.theme === 'light'}
    🌙 Dark
  {:else}
    ☀️ Light
  {/if}
</Button>
```

**Auto-sync with system preference**:
```typescript
// src/lib/stores/theme.ts
import { writable } from 'svelte/store';

export const themeStore = (() => {
  const { subscribe, set, update } = writable<'light' | 'dark'>('light');

  return {
    subscribe,
    toggleTheme: () => {
      update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return newTheme;
      });
    },
    initTheme: () => {
      // Check localStorage, then system preference
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = stored || system;

      set(theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');

      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          set(newTheme);
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      });
    }
  };
})();
```

---

### Scenario 6: Integrate Holographic Card (Existing Component)

**Goal**: Use existing UnifiedHolographicCard with new design system

```svelte
<!-- Any page with cards -->
<script lang="ts">
  import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
  import { Modal, Button } from '$lib/components/design-system';
  import type { UnifiedCard } from '$lib/types';

  let cards: UnifiedCard[] = []; // Fetched from API
  let selectedCard: UnifiedCard | null = null;
  let isModalOpen = false;
</script>

<div class="cards-grid">
  {#each cards as card (card.id)}
    <UnifiedHolographicCard
      {card}
      onClick={() => {
        selectedCard = card;
        isModalOpen = true;
      }}
    />
  {/each}
</div>

<Modal
  open={isModalOpen}
  onClose={() => isModalOpen = false}
  title={selectedCard?.title}
  size="xl"
>
  {#if selectedCard}
    <div class="card-detail">
      <UnifiedHolographicCard
        card={selectedCard}
        interactive={true}
        enlarged={true}
      />

      <div class="card-info">
        <p>{selectedCard.description}</p>
        <Button variant="primary" onClick={() => /* Download */}>
          다운로드
        </Button>
      </div>
    </div>
  {/if}
</Modal>

<style>
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
    padding: var(--space-xl);
  }

  .card-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }

  @media (max-width: 768px) {
    .card-detail {
      grid-template-columns: 1fr;
    }
  }
</style>
```

**No changes to UnifiedHolographicCard needed** - it works seamlessly with new components!

---

## 🎨 Using Design Tokens

### CSS Variables
```css
/* src/lib/styles/design-tokens.css */
:root {
  /* Colors */
  --primary: #667eea;
  --secondary: #764ba2;

  /* Backgrounds */
  --background-primary: #ffffff;
  --background-secondary: #f7fafc;

  /* Text */
  --text-primary: #1a202c;
  --text-secondary: #4a5568;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-display: 64px;
  --font-title1: 48px;
  --font-body: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 200ms;
}

:root.dark {
  --background-primary: #000000;
  --background-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
}
```

### Usage in Components
```svelte
<style>
  .my-component {
    background: var(--background-primary);
    color: var(--text-primary);
    padding: var(--space-lg);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-base) ease;
  }

  .my-component:hover {
    box-shadow: var(--shadow-lg);
  }
</style>
```

---

## 🧪 Testing Integration

### Component Testing with Vitest
```typescript
// src/lib/components/design-system/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders with correct variant', () => {
    const { container } = render(Button, {
      props: { variant: 'primary' }
    });

    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('calls onClick handler', async () => {
    const onClick = vi.fn();
    const { container } = render(Button, {
      props: { onClick }
    });

    const button = container.querySelector('button');
    await fireEvent.click(button!);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    const { container } = render(Button, {
      props: { loading: true }
    });

    const button = container.querySelector('button');
    expect(button).toBeDisabled();
    expect(container.querySelector('.spinner')).toBeTruthy();
  });
});
```

### Visual Regression Testing with Percy
```typescript
// tests/e2e/visual-regression.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression', () => {
  test('Create page - light mode', async ({ page }) => {
    await page.goto('/create');
    await page.waitForSelector('.card-preview');
    await percySnapshot(page, 'Create Page - Light');
  });

  test('Create page - dark mode', async ({ page }) => {
    await page.goto('/create');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForSelector('.card-preview');
    await percySnapshot(page, 'Create Page - Dark');
  });

  test('Collections page - responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/collections');
    await percySnapshot(page, 'Collections - Mobile');

    await page.setViewportSize({ width: 768, height: 1024 });
    await percySnapshot(page, 'Collections - Tablet');

    await page.setViewportSize({ width: 1920, height: 1080 });
    await percySnapshot(page, 'Collections - Desktop');
  });
});
```

---

## 📱 Responsive Patterns

### Mobile-First Grid
```css
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
  gap: var(--space-md);
  padding: var(--space-md);
}

@media (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
    gap: var(--space-lg);
    padding: var(--space-lg);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
    gap: var(--space-xl);
  }
}

@media (min-width: 1536px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr); /* Large: 4 columns */
  }
}
```

### Responsive Typography
```css
.responsive-heading {
  font-size: 28px; /* Mobile */
  line-height: 1.2;
}

@media (min-width: 768px) {
  .responsive-heading {
    font-size: 36px; /* Tablet */
  }
}

@media (min-width: 1024px) {
  .responsive-heading {
    font-size: 48px; /* Desktop */
  }
}
```

---

## ♿ Accessibility Patterns

### Keyboard Navigation
```svelte
<script lang="ts">
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeyDown}
  aria-label="Open card details"
>
  Click me
</div>
```

### Focus Management
```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let modalElement: HTMLElement;
  let previousFocus: HTMLElement | null;

  onMount(() => {
    previousFocus = document.activeElement as HTMLElement;
    modalElement.focus();

    return () => {
      previousFocus?.focus(); // Restore focus on unmount
    };
  });
</script>

<div
  bind:this={modalElement}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <!-- Modal content -->
</div>
```

### ARIA Labels
```svelte
<Button
  onClick={handleDelete}
  aria-label="Delete collection"
  aria-describedby="delete-confirm"
>
  삭제
</Button>

<span id="delete-confirm" class="sr-only">
  이 컬렉션을 영구적으로 삭제합니다
</span>
```

---

## 🚀 Performance Optimization

### Code Splitting
```javascript
// src/routes/+layout.ts
export const load = async () => {
  // Only load heavy components when needed
  const { default: HeavyComponent } = await import('$lib/components/HeavyComponent.svelte');
  return { HeavyComponent };
};
```

### Image Optimization
```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let imageSrc = '';
  let isVisible = false;

  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        isVisible = true;
        observer.disconnect();
      }
    });

    observer.observe(imgElement);
  });
</script>

{#if isVisible}
  <img
    bind:this={imgElement}
    src={imageSrc}
    alt="Card thumbnail"
    loading="lazy"
  />
{:else}
  <div class="skeleton" bind:this={imgElement}></div>
{/if}
```

### 60fps Animation
```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let cardElement: HTMLElement;

  onMount(() => {
    let rafId: number | null = null;

    function handlePointerMove(e: PointerEvent) {
      if (rafId) return; // Skip if already scheduled

      rafId = requestAnimationFrame(() => {
        // Calculate tilt...
        const rect = cardElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Apply transform (GPU-accelerated)
        cardElement.style.transform = `
          perspective(1000px)
          rotateX(${(y - rect.height / 2) / 10}deg)
          rotateY(${(x - rect.width / 2) / 10}deg)
        `;

        rafId = null;
      });
    }

    cardElement.addEventListener('pointermove', handlePointerMove);
    return () => cardElement.removeEventListener('pointermove', handlePointerMove);
  });
</script>

<div
  bind:this={cardElement}
  class="card"
  style="will-change: transform; transform: translateZ(0);"
>
  <!-- Card content -->
</div>
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Modal Not Closing on Overlay Click
**Solution**: Ensure Bits UI Dialog is properly configured
```svelte
<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed inset-0 bg-black/80"
      on:click={() => isOpen = false} <!-- Add explicit handler -->
    />
    <Dialog.Content>
      <!-- Content -->
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Issue 2: Theme Flicker on Page Load
**Solution**: Initialize theme before page renders
```javascript
// src/app.html
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  })();
</script>
```

### Issue 3: Navigation Not Hiding on Scroll
**Solution**: Check scroll event listener is active
```typescript
// src/lib/stores/navigation.ts
export function initAutoHideNavigation() {
  let lastScrollY = window.scrollY;
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          isHeaderVisible.set(false);
        } else if (currentScrollY < lastScrollY) {
          isHeaderVisible.set(true);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
}
```

---

## 📚 Additional Resources

- **Design Tokens Reference**: [design-tokens.css](../src/lib/styles/design-tokens.css)
- **Component Props**: [data-model.md](./data-model.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research Decisions**: [research.md](./research.md)
- **Bits UI Docs**: https://www.bits-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **SvelteKit**: https://kit.svelte.dev/

---

## ✅ Integration Checklist

Before deploying your changes, ensure:

- [ ] All components use design tokens (no hardcoded colors/spacing)
- [ ] Forms have validation and error handling
- [ ] Modals are accessible (focus trap, keyboard support)
- [ ] Navigation auto-hides on scroll
- [ ] Theme toggle works and persists
- [ ] Mobile layout is tested on real devices
- [ ] 60fps animations verified with Chrome DevTools
- [ ] Visual regression tests pass in Percy
- [ ] E2E tests cover happy paths
- [ ] Lighthouse score > 90

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Complete - Ready for implementation
