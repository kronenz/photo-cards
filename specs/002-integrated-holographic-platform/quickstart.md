# Quickstart Guide: Integrated Holographic Platform

**Feature**: 002-integrated-holographic-platform
**Audience**: Developers implementing the integration
**Time to Complete**: ~15 minutes

## Prerequisites

- Node.js 18+
- npm 9+
- Basic knowledge of SvelteKit, TypeScript, Tailwind CSS
- Existing Phase 1, 2, 4 implementations (see `.kiro/specs/`)

## Quick Start

### 1. Install Dependencies (2 minutes)

```bash
# Install virtual scrolling library
npm install @tanstack/svelte-virtual

# Install gesture library for unified pointer events
npm install svelte-gestures

# Install dev dependencies (if not already present)
npm install -D @playwright/test vitest @vitest/ui
```

### 2. Create Type Definitions (3 minutes)

Create the unified types file:

```bash
mkdir -p src/lib/types
touch src/lib/types/unified.ts
```

Copy the following into `src/lib/types/unified.ts`:

```typescript
// UnifiedCard type
export interface UnifiedCard {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;

  holographic: {
    image: string;
    backImage: string;
    effect: 'overlay' | 'soft-light' | 'hard-light';
    intensity: number;
    isFlipped: boolean;
    animationDuration: number;
  };

  photocard: {
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    stats: {
      totalViews: number;
      uniqueCollectors: number;
      completionRate: number;
    };
    collections: string[];
    acquiredAt?: Date;
  };

  community: {
    creator: string;
    isPublic: boolean;
    tags: string[];
    template?: string;
    metadata: {
      likes: number;
      downloads: number;
      rating: number;
      ratingCount: number;
    };
  };

  context?: 'test' | 'main' | 'gallery' | 'community';
}

// UnifiedUser type
export interface UnifiedUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: Date;
  lastLoginAt: Date;

  fanProfile: {
    fanLevel: { level: number; name: string };
    currentPoints: number;
    favoriteTeam: string;
    achievedBadges: string[];
    joinedFanclubs: string[];
  };

  creatorProfile: {
    creatorLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
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

  collections: {
    owned: string[];
    collectionProgress: Array<{
      collectionId: string;
      totalCards: number;
      ownedCards: number;
      progress: number;
    }>;
    totalCards: number;
    rareCards: number;
  };

  preferences: {
    theme: 'light' | 'dark' | 'kbo-team';
    teamThemeColor?: string;
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

// Other types (Collection, CommunityPost, KBOTeam, etc.)
// See data-model.md for complete definitions
```

### 3. Create Unified Stores (3 minutes)

Create the stores file:

```bash
mkdir -p src/lib/stores
touch src/lib/stores/unified.ts
```

Copy the following into `src/lib/stores/unified.ts`:

```typescript
import { writable, derived } from 'svelte/store';
import type { UnifiedCard, UnifiedUser } from '$lib/types/unified';

// Global stores
export const unifiedCards = writable<Map<string, UnifiedCard>>(new Map());
export const currentUser = writable<UnifiedUser | null>(null);

// Derived: Team theme
export const teamTheme = derived(currentUser, ($user) => {
  if (!$user || $user.preferences.theme !== 'kbo-team') return null;
  return {
    color: $user.preferences.teamThemeColor,
    teamId: $user.fanProfile.favoriteTeam,
  };
});
```

### 4. Create UnifiedHolographicCard Component (5 minutes)

Create the component directory:

```bash
mkdir -p src/lib/components/unified
touch src/lib/components/unified/UnifiedHolographicCard.svelte
```

Minimal working implementation:

```svelte
<!-- src/lib/components/unified/UnifiedHolographicCard.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { UnifiedCard } from '$lib/types/unified';

  // Props
  export let card: UnifiedCard;
  export let context: 'test' | 'main' | 'gallery' | 'community' = 'main';
  export let size: 'small' | 'medium' | 'large' | 'featured' = 'medium';
  export let interactive = true;

  // Local state
  const isFlipped = writable(card.holographic.isFlipped);
  const isAnimating = writable(false);
  const holographicParams = writable({ x: 0, y: 0 });

  // Context for child components
  setContext('card-context', {
    isFlipped,
    isAnimating,
    holographicParams,
    flip: () => {
      if ($isAnimating) return;
      $isAnimating = true;
      $isFlipped = !$isFlipped;
      setTimeout(() => ($isAnimating = false), card.holographic.animationDuration);
    },
    reset: () => {
      $isFlipped = false;
    },
  });

  // Event handlers
  function handleMouseMove(e: MouseEvent) {
    if (!interactive) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    $holographicParams = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function handleClick() {
    if (!interactive || $isAnimating) return;
    $isAnimating = true;
    $isFlipped = !$isFlipped;
    setTimeout(() => ($isAnimating = false), card.holographic.animationDuration);
  }

  // Size mapping
  const sizeClasses = {
    small: 'w-[200px] h-[280px]',
    medium: 'w-[300px] h-[420px]',
    large: 'w-[400px] h-[560px]',
    featured: 'w-[600px] h-[840px]',
  };
</script>

<div
  class="card-wrapper {sizeClasses[size]} perspective-1000"
  on:mousemove={handleMouseMove}
  on:click={handleClick}
  on:keypress={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
  aria-label="{card.title} - {card.photocard.rarity} card"
  aria-pressed={$isFlipped}
>
  <div
    class="card-inner relative w-full h-full transition-transform duration-[{card.holographic.animationDuration}ms] transform-style-3d"
    style="transform: rotateY({$isFlipped ? 180 : 0}deg)"
  >
    <!-- Front -->
    <div class="card-face absolute inset-0 backface-hidden">
      <img src={card.holographic.image} alt={card.title} class="w-full h-full object-cover" />
      {#if interactive}
        <div
          class="holographic-overlay absolute inset-0 pointer-events-none"
          style="
            background: radial-gradient(
              circle at {$holographicParams.x * 100}% {$holographicParams.y * 100}%,
              rgba(255,255,255,0.3) 0%,
              transparent 50%
            );
            mix-blend-mode: {card.holographic.effect};
            opacity: {card.holographic.intensity / 100};
          "
        />
      {/if}
    </div>

    <!-- Back -->
    <div
      class="card-face absolute inset-0 backface-hidden"
      style="transform: rotateY(180deg)"
    >
      <img src={card.holographic.backImage} alt="{card.title} - back" class="w-full h-full object-cover" />
    </div>
  </div>
</div>

<style>
  .perspective-1000 {
    perspective: 1000px;
  }

  .transform-style-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }
</style>
```

### 5. Test the Integration (2 minutes)

Create a test route to verify the component:

```bash
mkdir -p src/routes/unified-test
touch src/routes/unified-test/+page.svelte
```

```svelte
<!-- src/routes/unified-test/+page.svelte -->
<script lang="ts">
  import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
  import type { UnifiedCard } from '$lib/types/unified';

  const testCard: UnifiedCard = {
    id: 'test-001',
    title: 'Test Card',
    createdAt: new Date(),
    updatedAt: new Date(),
    holographic: {
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      backImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600,
    },
    photocard: {
      rarity: 'epic',
      stats: { totalViews: 0, uniqueCollectors: 0, completionRate: 0 },
      collections: [],
    },
    community: {
      creator: 'system',
      isPublic: false,
      tags: ['test'],
      metadata: { likes: 0, downloads: 0, rating: 0, ratingCount: 0 },
    },
  };
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">Unified Holographic Card Test</h1>
  <div class="flex gap-8">
    <UnifiedHolographicCard card={testCard} size="small" />
    <UnifiedHolographicCard card={testCard} size="medium" />
    <UnifiedHolographicCard card={testCard} size="large" />
  </div>
</div>
```

Run the dev server and visit http://localhost:5173/unified-test:

```bash
npm run dev
```

**Expected Result**: You should see three cards (small, medium, large) with:
- Holographic effect on mouse hover
- Card flip on click
- Smooth animations at 60fps

---

## Next Steps

### Phase 2: Full Implementation

1. **Complete UnifiedHolographicCard**: Add metadata display, social actions, error handling
2. **Create IntegratedMainPage**: Combine CollectionDashboard + CommunityFeed + KBOTeamsSection
3. **Implement Virtual Scrolling**: Use TanStack Virtual for large card grids
4. **Add Performance Monitoring**: Integrate Chrome DevTools Performance API

### Phase 3: Data Migration

1. **Write Migration Scripts**: Convert Phase 1, 2, 4 data to unified format
2. **PocketBase Schema**: Update database collections
3. **Test Migration**: Run dry-run migrations, verify data integrity

### Phase 4: Testing

1. **Unit Tests**: Test card state transitions, holographic calculations
2. **Integration Tests**: Test component interactions, store synchronization
3. **E2E Tests**: Test full user flows with Playwright
4. **Performance Tests**: Validate 60fps requirement

---

## Troubleshooting

### Issue: Holographic effect not visible

**Solution**: Ensure Tailwind CSS is configured to allow dynamic styles:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: [
    'mix-blend-overlay',
    'mix-blend-soft-light',
    'mix-blend-hard-light',
  ],
};
```

### Issue: Card flip animation is janky

**Solution**: Enable GPU acceleration in CSS:

```css
.card-inner {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform; /* Hint browser about animation */
}
```

### Issue: TypeScript errors for svelte-gestures

**Solution**: Create type declaration file:

```bash
touch src/lib/types/svelte-gestures.d.ts
```

```typescript
// src/lib/types/svelte-gestures.d.ts
declare module 'svelte-gestures' {
  export function pan(node: HTMLElement, options?: any): any;
  export function tap(node: HTMLElement, options?: any): any;
  export function swipe(node: HTMLElement, options?: any): any;
}
```

---

## Performance Checklist

Before moving to production, verify:

- [ ] Cards render at 60fps (use Chrome DevTools Performance)
- [ ] Time to Interactive < 3 seconds (use Lighthouse)
- [ ] Lighthouse Performance score ≥ 90
- [ ] 100+ cards rendered without frame drops (test with virtual scrolling)
- [ ] Keyboard navigation works (Tab, Enter, Space, Esc)
- [ ] Screen reader accessible (test with NVDA/VoiceOver)

---

## Reference Documentation

- **Data Model**: [data-model.md](./data-model.md)
- **Component Contracts**: [contracts/](./contracts/)
- **Full Plan**: [plan.md](./plan.md)
- **Feature Spec**: [spec.md](./spec.md)

---

## Support

If you encounter issues:
1. Check [plan.md](./plan.md) Technical Context section
2. Review [research.md](./research.md) for technical decisions
3. Verify all dependencies are installed: `npm list @tanstack/svelte-virtual svelte-gestures`
4. Run tests: `npm run test`

---

**Estimated Time**: 15 minutes setup + 2-3 days for full implementation

**Next Command**: `/speckit.tasks` to generate actionable task list
