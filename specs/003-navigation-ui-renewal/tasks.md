# Tasks: Navigation & UI Renewal

**Feature**: 003-navigation-ui-renewal | **Branch**: `003-navigation-ui-renewal`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 📊 Overview

**Total Tasks**: 128
**Estimated Duration**: 3 weeks
**Status**: 🟡 Ready to Start

### Task Distribution by User Story

| User Story | Tasks | Priority | Status |
|-----------|-------|----------|--------|
| Setup (Infrastructure) | 10 | P0 | ✅ Complete |
| Foundational (Prerequisites) | 15 | P0 | 🟡 In Progress |
| US1: Navigation System | 18 | P1 | 🔵 Pending |
| US2: Card Create Page | 22 | P1 | 🔵 Pending |
| US3: Collections Page | 20 | P1 | 🔵 Pending |
| US4: Auth Pages | 15 | P2 | 🔵 Pending |
| US5: Info Pages | 12 | P2 | 🔵 Pending |
| US6: Responsive & A11y | 16 | P1 | 🔵 Pending |
| Polish & Integration | 10 | P1 | 🔵 Pending |

---

## Phase 1: Setup (Infrastructure)

> **Goal**: Install dependencies, configure tooling, and set up project structure
> **Duration**: Day 1
> **Blocking**: All other phases depend on this

### T001: Install Bits UI and Percy [P]
**File**: `package.json`
**Requirements**: FR-001, FR-008
**Story**: Setup

Install headless UI components and visual regression testing tools based on research decisions.

```bash
npm install bits-ui
npm install --save-dev @percy/cli @percy/playwright
```

**Acceptance Criteria**:
- `bits-ui` added to dependencies
- `@percy/cli` and `@percy/playwright` added to devDependencies
- No version conflicts with existing packages

---

### T002: Configure Percy for Visual Regression [P]
**File**: `.percy.yml`
**Requirements**: Testing Strategy
**Story**: Setup

Create Percy configuration for visual regression testing.

```yaml
# .percy.yml
version: 2
snapshot:
  widths: [375, 768, 1280]
  percy-css: |
    /* Hide dynamic content */
    .dynamic-timestamp { display: none; }
```

**Acceptance Criteria**:
- Percy config file created
- Widths match spec breakpoints (mobile, tablet, desktop)
- Percy CLI runs without errors

---

### T003: Create Design Tokens CSS File [P]
**File**: `src/lib/styles/design-tokens.css`
**Requirements**: FR-001 (Design System)
**Story**: Setup

Define CSS custom properties for design system tokens.

```css
:root {
  /* Colors */
  --primary: #667eea;
  --secondary: #764ba2;
  --background-primary: #ffffff;
  --surface-primary: #f7fafc;
  --text-primary: #1a202c;

  /* Typography */
  --font-display: 64px;
  --font-title1: 48px;
  --font-body: 16px;

  /* Spacing */
  --space-xs: 4px;
  --space-md: 16px;
  --space-lg: 24px;

  /* Shadows */
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
}

:root.dark {
  --background-primary: #0a0a0a;
  --text-primary: #f7fafc;
}
```

**Acceptance Criteria**:
- All tokens from spec.md implemented
- Dark mode variants defined
- File imported in `+layout.svelte`

---

### T004: Create Component Directory Structure [P]
**File**: `src/lib/components/` (directories)
**Requirements**: Component Architecture
**Story**: Setup

Set up component folder structure.

```bash
mkdir -p src/lib/components/design-system
mkdir -p src/lib/components/navigation
mkdir -p src/lib/components/pages/create
mkdir -p src/lib/components/pages/collections
mkdir -p src/lib/components/pages/auth
```

**Acceptance Criteria**:
- All directories created
- No conflicts with existing `unified/` directory
- README.md added to each directory explaining purpose

---

### T005: Set Up Accessibility Testing [P]
**File**: `tests/setup/axe.ts`
**Requirements**: FR-008 (Accessibility)
**Story**: Setup

Configure axe-core for automated accessibility testing.

```typescript
// tests/setup/axe.ts
import { test as base } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

export const test = base.extend({
  page: async ({ page }, use) => {
    await injectAxe(page);
    await use(page);
  }
});

export { expect } from '@playwright/test';
```

**Acceptance Criteria**:
- axe-core integrated with Playwright
- Helper function for A11y checks
- CI configuration updated

---

### T006: Create PocketBase Service Layer [P]
**File**: `src/lib/services/cards.ts`, `src/lib/services/collections.ts`, `src/lib/services/auth.ts`
**Requirements**: Backend Integration
**Story**: Setup

Set up service layer for PocketBase API calls (from backend-integration.md).

```typescript
// src/lib/services/cards.ts
import { collections } from '$lib/pocketbase';
import type { UnifiedCard, CardCreationData } from '$lib/types';

export async function createCard(data: CardCreationData): Promise<UnifiedCard> {
  const card = await collections.unifiedCards.create(data);
  // Upload image if provided...
  return card;
}
```

**Acceptance Criteria**:
- Services for cards, collections, auth created
- Type-safe interfaces
- Error handling with PocketBaseError

---

### T007: Configure Environment Variables [P]
**File**: `.env.example`, `.env.development`
**Requirements**: Backend Integration
**Story**: Setup

Set up environment configuration for PocketBase URL.

```bash
# .env.example
VITE_POCKETBASE_URL=http://localhost:8090
```

**Acceptance Criteria**:
- Environment variables documented
- Development config created
- PocketBase URL configurable

---

### T008: Set Up Bundle Size Monitoring [P]
**File**: `vite.config.ts`
**Requirements**: FR-010 (Performance)
**Story**: Setup

Configure Vite to track bundle sizes.

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    sveltekit(),
    visualizer({
      filename: './stats.html',
      gzipSize: true
    })
  ]
});
```

**Acceptance Criteria**:
- Bundle analyzer plugin installed
- Size report generated on build
- CI fails if bundle > 500KB per route

---

### T009: Create Lighthouse CI Configuration [P]
**File**: `.lighthouserc.js`
**Requirements**: FR-010 (Performance), FR-007 (Animation)
**Story**: Setup

Configure Lighthouse CI for performance monitoring.

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/', 'http://localhost:5173/create', 'http://localhost:5173/collections'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }]
      }
    }
  }
};
```

**Acceptance Criteria**:
- Lighthouse CI config created
- Performance budget >90
- Accessibility score 100

---

### T010: Update TypeScript Types [P]
**File**: `src/lib/types/index.ts`
**Requirements**: data-model.md
**Story**: Setup

Add component prop types and PocketBase response types.

```typescript
// src/lib/types/index.ts
export interface PocketBaseListResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// ... other types from data-model.md
```

**Acceptance Criteria**:
- All types from data-model.md added
- No TypeScript errors in existing code
- Exported from index.ts

---

**Checkpoint**: ✅ All dependencies installed, project structure ready, tooling configured

---

## Phase 2: Foundational (Prerequisites)

> **Goal**: Build core design system components that all user stories depend on
> **Duration**: Day 2-3
> **Blocking**: All user story implementations depend on these components

### T011: Create Button Component
**File**: `src/lib/components/design-system/Button.svelte`
**Requirements**: FR-001 (Design System)
**Story**: Foundational

Build reusable button component with variants.

```svelte
<script lang="ts">
  import type { ButtonProps } from '$lib/types';

  export let variant: ButtonProps['variant'] = 'primary';
  export let size: ButtonProps['size'] = 'md';
  export let disabled = false;
  export let loading = false;
  export let onClick: () => void = () => {};

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
</script>

<button
  class="btn {variantClasses[variant]} {sizeClasses[size]}"
  class:disabled
  class:loading
  {disabled}
  on:click={onClick}
  {...$$restProps}
>
  {#if loading}
    <span class="spinner"></span>
  {/if}
  <slot />
</button>

<style>
  .btn {
    font-weight: 600;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

**Acceptance Criteria**:
- All 4 variants work (primary, secondary, outline, ghost)
- All 3 sizes work (sm, md, lg)
- Loading state shows spinner
- Disabled state prevents clicks
- ARIA attributes for accessibility

---

### T012: Create Input Component
**File**: `src/lib/components/design-system/Input.svelte`
**Requirements**: FR-001 (Design System)
**Story**: Foundational

Build reusable input component with validation states.

```svelte
<script lang="ts">
  import type { InputProps } from '$lib/types';

  export let type: InputProps['type'] = 'text';
  export let label = '';
  export let placeholder = '';
  export let error = '';
  export let value = '';
  export let disabled = false;
  export let required = false;
</script>

<div class="input-wrapper">
  {#if label}
    <label class="input-label" for={label}>
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <input
    id={label}
    {type}
    {placeholder}
    {disabled}
    {required}
    bind:value
    class="input"
    class:error={!!error}
    aria-invalid={!!error}
    aria-describedby={error ? `${label}-error` : undefined}
    on:input
    on:blur
    {...$$restProps}
  />

  {#if error}
    <span id="{label}-error" class="error-message" role="alert">
      {error}
    </span>
  {/if}
</div>

<style>
  .input {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--surface-border);
    border-radius: var(--radius-md);
    font-size: var(--font-body);
    transition: border-color var(--transition-fast);
  }
  .input:focus {
    border-color: var(--primary);
    outline: none;
  }
  .input.error {
    border-color: var(--semantic-error);
  }
  .error-message {
    color: var(--semantic-error);
    font-size: var(--font-footnote);
    margin-top: var(--space-xs);
  }
</style>
```

**Acceptance Criteria**:
- Label, placeholder, helper text work
- Error state shows red border + message
- Required indicator displayed
- Focus state with holographic border
- Accessible with ARIA attributes

---

### T013: Create Modal Component (Bits UI)
**File**: `src/lib/components/design-system/Modal.svelte`
**Requirements**: FR-001 (Design System), research.md R001
**Story**: Foundational

Build modal using Bits UI Dialog primitives.

```svelte
<script lang="ts">
  import { Dialog } from 'bits-ui';
  import type { ModalProps } from '$lib/types';

  export let open = false;
  export let title = '';
  export let size: ModalProps['size'] = 'md';
  export let showCloseButton = true;
  export let onClose: () => void;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-full m-4'
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
    <Dialog.Content
      class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             bg-white dark:bg-surface-dark rounded-xl shadow-2xl z-50
             {sizeClasses[size]} w-full p-6"
    >
      {#if title}
        <Dialog.Title class="text-title2 font-bold mb-4">{title}</Dialog.Title>
      {/if}

      <slot />

      {#if showCloseButton}
        <Dialog.Close
          class="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
          on:click={onClose}
          aria-label="Close dialog"
        >
          ✕
        </Dialog.Close>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Acceptance Criteria**:
- Opens/closes smoothly
- Backdrop click closes modal
- Escape key closes modal
- Focus trapped inside modal
- Accessible with ARIA attributes

---

### T014: Create Card Component
**File**: `src/lib/components/design-system/Card.svelte`
**Requirements**: FR-003 (Collections)
**Story**: Foundational

Build reusable card container component.

```svelte
<script lang="ts">
  export let hover = false;
  export let padding = 'md';

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
</script>

<div
  class="card {paddingClasses[padding]}"
  class:hover
  {...$$restProps}
>
  <slot />
</div>

<style>
  .card {
    background: var(--surface-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-smooth);
  }
  .card.hover:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
</style>
```

**Acceptance Criteria**:
- Padding variants work
- Hover effect smooth (60fps)
- Dark mode compatible
- GPU-accelerated transform

---

### T015: Create Loading Spinner
**File**: `src/lib/components/design-system/LoadingSpinner.svelte`
**Requirements**: FR-007 (Animation)
**Story**: Foundational

Build animated loading spinner.

```svelte
<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const sizes = { sm: '16px', md: '24px', lg: '32px' };
</script>

<div
  class="spinner"
  style="width: {sizes[size]}; height: {sizes[size]}"
  role="status"
  aria-label="Loading"
>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" class="spinner-circle"/>
  </svg>
</div>

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spinner {
    animation: spin 1s linear infinite;
    will-change: transform;
  }
  .spinner-circle {
    fill: none;
    stroke: var(--primary);
    stroke-width: 3;
    stroke-dasharray: 50, 200;
    stroke-linecap: round;
  }
</style>
```

**Acceptance Criteria**:
- 60fps rotation (will-change applied)
- Size variants work
- Accessible with role/aria-label
- No jank during animation

---

### T016: Create Skeleton Loader
**File**: `src/lib/components/design-system/Skeleton.svelte`
**Requirements**: FR-007 (Animation)
**Story**: Foundational

Build skeleton loading component.

```svelte
<script lang="ts">
  export let width = '100%';
  export let height = '20px';
  export let circle = false;
</script>

<div
  class="skeleton"
  class:circle
  style="width: {width}; height: {height}"
  aria-hidden="true"
></div>

<style>
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--surface-secondary) 0%,
      var(--surface-primary) 50%,
      var(--surface-secondary) 100%
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
    border-radius: var(--radius-sm);
  }
  .skeleton.circle {
    border-radius: 50%;
  }
</style>
```

**Acceptance Criteria**:
- Shimmer animation smooth
- Width/height customizable
- Circle variant for avatars
- GPU-accelerated animation

---

### T017: Create Toast Notification
**File**: `src/lib/components/design-system/Toast.svelte`
**Requirements**: FR-001 (Design System)
**Story**: Foundational

Build toast notification using Melt UI or custom.

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let message = '';
  export let type: 'success' | 'error' | 'info' = 'info';
  export let visible = false;
  export let duration = 3000;

  $: if (visible) {
    setTimeout(() => { visible = false; }, duration);
  }

  const typeColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
</script>

{#if visible}
  <div
    class="toast {typeColors[type]}"
    transition:fly={{ y: -20, duration: 200 }}
    role="alert"
  >
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    color: white;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
  }
</style>
```

**Acceptance Criteria**:
- Success/error/info types
- Auto-dismiss after duration
- Slide-in animation (60fps)
- Accessible with role="alert"

---

### T018: Create Dropdown Menu (Bits UI)
**File**: `src/lib/components/design-system/DropdownMenu.svelte`
**Requirements**: FR-001 (Design System), US1 (Navigation)
**Story**: Foundational

Build dropdown menu using Bits UI.

```svelte
<script lang="ts">
  import { DropdownMenu } from 'bits-ui';

  export let items: Array<{ label: string; onClick: () => void; icon?: string }> = [];
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class="dropdown-trigger">
    <slot name="trigger" />
  </DropdownMenu.Trigger>

  <DropdownMenu.Content
    class="dropdown-content bg-white dark:bg-surface-dark rounded-lg shadow-xl p-2"
  >
    {#each items as item}
      <DropdownMenu.Item
        class="dropdown-item px-4 py-2 hover:bg-primary/10 rounded cursor-pointer"
        on:click={item.onClick}
      >
        {#if item.icon}<span class="icon">{item.icon}</span>{/if}
        {item.label}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>

<style>
  .dropdown-content {
    min-width: 200px;
    z-index: 50;
  }
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-body);
  }
</style>
```

**Acceptance Criteria**:
- Items render correctly
- Click handlers work
- Keyboard navigation (Arrow keys)
- Accessible with ARIA

---

### T019: Create Accordion Component (Bits UI)
**File**: `src/lib/components/design-system/Accordion.svelte`
**Requirements**: FR-005 (Info Pages), US5
**Story**: Foundational

Build accordion using Bits UI for FAQ pages.

```svelte
<script lang="ts">
  import { Accordion } from 'bits-ui';

  export let items: Array<{ title: string; content: string }> = [];
  export let multiple = false;
</script>

<Accordion.Root {multiple}>
  {#each items as item, i (item.title)}
    <Accordion.Item value={`item-${i}`} class="accordion-item">
      <Accordion.Header>
        <Accordion.Trigger class="accordion-trigger">
          {item.title}
          <span class="icon">▼</span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content class="accordion-content">
        {item.content}
      </Accordion.Content>
    </Accordion.Item>
  {/each}
</Accordion.Root>

<style>
  .accordion-item {
    border-bottom: 1px solid var(--surface-border);
  }
  .accordion-trigger {
    width: 100%;
    text-align: left;
    padding: var(--space-md);
    font-weight: 600;
    display: flex;
    justify-content: space-between;
  }
  .accordion-content {
    padding: var(--space-md);
    color: var(--text-secondary);
  }
</style>
```

**Acceptance Criteria**:
- Expand/collapse smoothly
- Multiple mode allows multi-open
- Keyboard navigation works
- Accessible with ARIA

---

### T020: Create Navigation Store
**File**: `src/lib/stores/navigation.ts`
**Requirements**: FR-001 (Navigation)
**Story**: Foundational

Create Svelte store for navigation state.

```typescript
// src/lib/stores/navigation.ts
import { writable } from 'svelte/store';
import type { NavigationState } from '$lib/types';

export const navigationStore = (() => {
  const { subscribe, set, update } = writable<NavigationState>({
    currentPath: '/',
    isMenuOpen: false,
    isHeaderVisible: true,
    theme: 'light'
  });

  return {
    subscribe,
    setCurrentPath: (path: string) => update(state => ({ ...state, currentPath: path })),
    toggleMenu: () => update(state => ({ ...state, isMenuOpen: !state.isMenuOpen })),
    setHeaderVisible: (visible: boolean) => update(state => ({ ...state, isHeaderVisible: visible })),
    initAutoHideNavigation: () => {
      let lastScrollY = window.scrollY;
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              update(state => ({ ...state, isHeaderVisible: false }));
            } else if (currentScrollY < lastScrollY) {
              update(state => ({ ...state, isHeaderVisible: true }));
            }
            lastScrollY = currentScrollY;
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  };
})();
```

**Acceptance Criteria**:
- Current path tracked
- Menu open state managed
- Auto-hide scroll logic works
- No scroll jank (requestAnimationFrame)

---

### T021: Create Theme Store
**File**: `src/lib/stores/theme.ts`
**Requirements**: FR-009 (Dark Mode)
**Story**: Foundational

Create theme management store.

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
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = stored || system;

      set(theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');

      // Listen for system theme changes
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

**Acceptance Criteria**:
- System preference detected
- localStorage persists choice
- Class applied to documentElement
- System change listener works

---

### T022: Create Error Handler Utility
**File**: `src/lib/utils/errorHandler.ts`
**Requirements**: Backend Integration (backend-integration.md)
**Story**: Foundational

Create centralized error handling.

```typescript
// src/lib/utils/errorHandler.ts
import { goto } from '$app/navigation';

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

export function handlePocketBaseError(error: any): AppError {
  if (error.status === 401) {
    goto('/login');
    return new AppError('로그인이 필요합니다', 'UNAUTHORIZED');
  }

  if (error.status === 400 || error.status === 422) {
    const fieldErrors: Record<string, string> = {};
    if (error.data?.data) {
      for (const [field, err] of Object.entries(error.data.data as Record<string, any>)) {
        fieldErrors[field] = err.message;
      }
    }
    return new AppError('입력값이 올바르지 않습니다', 'VALIDATION_ERROR', fieldErrors);
  }

  return new AppError(error.message || '알 수 없는 오류가 발생했습니다', 'UNKNOWN_ERROR');
}
```

**Acceptance Criteria**:
- 401 redirects to login
- 400/422 extracts field errors
- Type-safe AppError class
- Used in all services

---

### T023: Create Form Validation Utility
**File**: `src/lib/utils/validation.ts`
**Requirements**: FR-002 (Card Create), FR-004 (Auth)
**Story**: Foundational

Create validation helpers for forms.

```typescript
// src/lib/utils/validation.ts
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  message: string;
  value?: any;
}

export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (rule.type === 'required' && !value) {
      return rule.message;
    }
    if (rule.type === 'email' && !isValidEmail(value)) {
      return rule.message;
    }
    if (rule.type === 'minLength' && value.length < rule.value) {
      return rule.message;
    }
    if (rule.type === 'maxLength' && value.length > rule.value) {
      return rule.message;
    }
    if (rule.type === 'pattern' && !new RegExp(rule.value).test(value)) {
      return rule.message;
    }
  }
  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**Acceptance Criteria**:
- All validation types work
- Email regex correct
- Returns first error only
- Used in all forms

---

### T024: Create Cache Utility
**File**: `src/lib/utils/cache.ts`
**Requirements**: Backend Integration (backend-integration.md)
**Story**: Foundational

Create caching utility for API responses.

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

**Acceptance Criteria**:
- TTL expiration works
- Type-safe getCache
- Clear single/all cache
- Used in service layer

---

### T025: Unit Tests for Design System Components [P]
**File**: `src/lib/components/design-system/*.test.ts`
**Requirements**: Testing Strategy
**Story**: Foundational

Write unit tests for all design system components.

```typescript
// Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders with correct variant', () => {
    const { container } = render(Button, { props: { variant: 'primary' } });
    expect(container.querySelector('.btn-primary')).toBeTruthy();
  });

  it('calls onClick handler', async () => {
    const onClick = vi.fn();
    const { container } = render(Button, { props: { onClick } });
    await fireEvent.click(container.querySelector('button')!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    const { container } = render(Button, { props: { loading: true } });
    expect(container.querySelector('.spinner')).toBeTruthy();
  });
});
```

**Acceptance Criteria**:
- All components have tests
- Props validation tested
- Event handlers tested
- >70% test coverage

---

**Checkpoint**: ✅ All foundational components built and tested

---

## Phase 3: US1 - Navigation System (P1)

> **Goal**: Implement unified navigation with auto-hide, mobile menu, and active states
> **Duration**: Day 4-5
> **Dependencies**: Phase 2 (Foundational)
> **Independent Test**: Navigation works on all pages, auto-hide on scroll, mobile menu functional

### T026: Refactor Main Navigation Component
**File**: `src/lib/components/navigation/MainNav.svelte`
**Requirements**: FR-001, US1
**Story**: US1

Extract navigation from `+layout.svelte` to dedicated component.

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { navigationStore } from '$lib/stores/navigation';
  import { Button } from '$lib/components/design-system';
  import type { NavigationItem } from '$lib/types';

  export let items: NavigationItem[] = [
    { label: '홈', href: '/', icon: '🏠' },
    { label: '갤러리', href: '/gallery', icon: '🖼️' },
    { label: '카드 제작', href: '/create', icon: '✨' },
    { label: '커뮤니티', href: '/community', icon: '💬' },
    { label: '컬렉션', href: '/collections', icon: '📚' }
  ];

  export let user: any = null;

  $: currentPath = $page.url.pathname;
</script>

<nav
  class="main-nav"
  class:hidden={!$navigationStore.isHeaderVisible}
  aria-label="Main navigation"
>
  <div class="nav-container">
    <a href="/" class="logo">⚾ Cards</a>

    <ul class="nav-menu" role="menubar">
      {#each items as item}
        <li role="none">
          <a
            href={item.href}
            class="nav-item"
            class:active={currentPath === item.href}
            role="menuitem"
            aria-current={currentPath === item.href ? 'page' : undefined}
          >
            <span class="icon">{item.icon}</span>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <div class="nav-actions">
      {#if user}
        <img src={user.avatar} alt={user.name} class="avatar" />
      {:else}
        <Button variant="outline" href="/login">로그인</Button>
      {/if}
    </div>
  </div>
</nav>

<style>
  .main-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--background-primary);
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-md);
    z-index: 100;
    transition: transform var(--transition-smooth);
  }
  .main-nav.hidden {
    transform: translateY(-100%);
  }
  .nav-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }
  .nav-menu {
    display: flex;
    gap: var(--space-md);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    position: relative;
  }
  .nav-item:hover {
    background: var(--primary) / 10%;
  }
  .nav-item.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary);
  }
</style>
```

**Acceptance Criteria**:
- Navigation extracted from layout
- Active state highlights current page
- Auto-hide on scroll down
- Backdrop blur effect
- ARIA navigation landmarks

---

### T027: Create Mobile Hamburger Menu
**File**: `src/lib/components/navigation/MobileMenu.svelte`
**Requirements**: FR-001, US1
**Story**: US1

Build mobile navigation with hamburger icon.

```svelte
<script lang="ts">
  import { navigationStore } from '$lib/stores/navigation';
  import { fly } from 'svelte/transition';
  import type { NavigationItem } from '$lib/types';

  export let items: NavigationItem[] = [];

  function handleItemClick() {
    navigationStore.toggleMenu();
  }
</script>

<button
  class="hamburger"
  on:click={() => navigationStore.toggleMenu()}
  aria-label="Toggle menu"
  aria-expanded={$navigationStore.isMenuOpen}
>
  <span class="line"></span>
  <span class="line"></span>
  <span class="line"></span>
</button>

{#if $navigationStore.isMenuOpen}
  <div
    class="mobile-overlay"
    transition:fly={{ x: -300, duration: 300 }}
    on:click|self={handleItemClick}
  >
    <nav class="mobile-menu" role="navigation">
      <ul>
        {#each items as item}
          <li>
            <a href={item.href} on:click={handleItemClick}>
              {item.icon} {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
{/if}

<style>
  .hamburger {
    display: none;
  }
  @media (max-width: 768px) {
    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
    }
    .line {
      width: 24px;
      height: 2px;
      background: var(--text-primary);
      transition: all var(--transition-fast);
    }
  }
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    z-index: 200;
  }
  .mobile-menu {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 80%;
    max-width: 300px;
    background: var(--background-primary);
    padding: var(--space-xl);
  }
</style>
```

**Acceptance Criteria**:
- Hamburger shows on mobile (<768px)
- Slide-in animation (60fps)
- Overlay closes menu
- Touch-optimized tap targets
- Accessible with ARIA

---

### T028: Initialize Auto-Hide Navigation [Story: US1]
**File**: `src/routes/+layout.svelte`
**Requirements**: FR-001, US1
**Story**: US1

Initialize auto-hide scroll behavior in layout.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { navigationStore, themeStore } from '$lib/stores';
  import MainNav from '$lib/components/navigation/MainNav.svelte';
  import Footer from '$lib/components/navigation/Footer.svelte';

  onMount(() => {
    // Initialize auto-hide navigation
    const cleanup = navigationStore.initAutoHideNavigation();

    // Initialize theme
    themeStore.initTheme();

    return cleanup;
  });
</script>

<div class="app" class:dark={$themeStore.theme === 'dark'}>
  <MainNav user={data.user} />

  <main class="main-content">
    <slot />
  </main>

  <Footer />
</div>

<style>
  .main-content {
    margin-top: 64px; /* Nav height */
    min-height: calc(100vh - 64px);
  }
</style>
```

**Acceptance Criteria**:
- Auto-hide initializes on mount
- Cleanup runs on unmount
- No memory leaks
- Works on all pages

---

### T029: Add Breadcrumb Navigation [P] [Story: US1]
**File**: `src/lib/components/navigation/Breadcrumb.svelte`
**Requirements**: FR-001, US1
**Story**: US1

Build breadcrumb navigation for sub-pages.

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  $: segments = $page.url.pathname.split('/').filter(Boolean);
</script>

<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">홈</a></li>
    {#each segments as segment, i}
      <li>
        <span class="separator">›</span>
        {#if i === segments.length - 1}
          <span aria-current="page">{segment}</span>
        {:else}
          <a href="/{segments.slice(0, i + 1).join('/')}">{segment}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) 0;
    list-style: none;
  }
  .separator {
    color: var(--text-tertiary);
  }
</style>
```

**Acceptance Criteria**:
- Segments from URL
- Current page non-clickable
- Separator between items
- Accessible with aria-current

---

### T030: Create Theme Toggle Button [P] [Story: US1]
**File**: `src/lib/components/navigation/ThemeToggle.svelte`
**Requirements**: FR-009, US1
**Story**: US1

Build theme toggle for dark mode.

```svelte
<script lang="ts">
  import { themeStore } from '$lib/stores/theme';
</script>

<button
  class="theme-toggle"
  on:click={() => themeStore.toggleTheme()}
  aria-label="Toggle theme"
>
  {#if $themeStore.theme === 'light'}
    🌙
  {:else}
    ☀️
  {/if}
</button>

<style>
  .theme-toggle {
    padding: var(--space-sm);
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 24px;
    transition: transform var(--transition-fast);
  }
  .theme-toggle:hover {
    transform: scale(1.1);
  }
</style>
```

**Acceptance Criteria**:
- Icon toggles light/dark
- Persists to localStorage
- Class applied to DOM
- Smooth transition

---

### T031: Add Navigation Dropdown for User Menu [P] [Story: US1]
**File**: `src/lib/components/navigation/UserMenu.svelte`
**Requirements**: FR-001, US1
**Story**: US1

Build user dropdown menu.

```svelte
<script lang="ts">
  import { DropdownMenu } from '$lib/components/design-system';
  import { logout } from '$lib/services/auth';

  export let user: any;

  const menuItems = [
    { label: '프로필', onClick: () => goto('/profile'), icon: '👤' },
    { label: '설정', onClick: () => goto('/settings'), icon: '⚙️' },
    { label: '로그아웃', onClick: logout, icon: '🚪' }
  ];
</script>

<DropdownMenu items={menuItems}>
  <svelte:fragment slot="trigger">
    <img src={user.avatar} alt={user.name} class="avatar" />
  </svelte:fragment>
</DropdownMenu>

<style>
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
  }
</style>
```

**Acceptance Criteria**:
- Dropdown opens on click
- Items execute actions
- Closes on outside click
- Keyboard navigation

---

### T032: Update Footer Component [P] [Story: US1]
**File**: `src/lib/components/navigation/Footer.svelte`
**Requirements**: FR-001, US1
**Story**: US1

Update footer to use new design system.

```svelte
<script lang="ts">
  const sections = [
    {
      title: '플랫폼',
      links: [
        { label: '홈', href: '/' },
        { label: '갤러리', href: '/gallery' },
        { label: '커뮤니티', href: '/community' }
      ]
    },
    {
      title: '지원',
      links: [
        { label: '도움말', href: '/help' },
        { label: '문의하기', href: '/contact' },
        { label: '개인정보처리방침', href: '/privacy' }
      ]
    }
  ];
</script>

<footer class="footer">
  <div class="footer-container">
    {#each sections as section}
      <div class="footer-section">
        <h3>{section.title}</h3>
        <ul>
          {#each section.links as link}
            <li><a href={link.href}>{link.label}</a></li>
          {/each}
        </ul>
      </div>
    {/each}

    <div class="footer-bottom">
      <p>© 2025 Holographic Cards. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--surface-secondary);
    padding: var(--space-3xl) var(--space-lg);
    margin-top: var(--space-3xl);
  }
  .footer-container {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-xl);
  }
</style>
```

**Acceptance Criteria**:
- Grid layout responsive
- Links work
- Dark mode compatible
- Semantic HTML (footer, nav)

---

### T033: E2E Test for Navigation [Story: US1]
**File**: `tests/e2e/navigation.spec.ts`
**Requirements**: Testing Strategy, US1
**Story**: US1

Write E2E test for navigation flow.

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    await page.click('text=갤러리');
    await expect(page).toHaveURL('/gallery');

    await page.click('text=카드 제작');
    await expect(page).toHaveURL('/create');
  });

  test('should show active state', async ({ page }) => {
    await page.goto('/gallery');

    const navItem = page.locator('a.nav-item.active');
    await expect(navItem).toHaveText('갤러리');
  });

  test('should auto-hide on scroll', async ({ page }) => {
    await page.goto('/');

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(400);

    const nav = page.locator('.main-nav');
    await expect(nav).toHaveClass(/hidden/);

    // Scroll up
    await page.evaluate(() => window.scrollBy(0, -500));
    await page.waitForTimeout(400);

    await expect(nav).not.toHaveClass(/hidden/);
  });

  test('mobile menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.click('.hamburger');
    await expect(page.locator('.mobile-menu')).toBeVisible();

    await page.click('.mobile-overlay');
    await expect(page.locator('.mobile-menu')).not.toBeVisible();
  });
});
```

**Acceptance Criteria**:
- Navigation between pages works
- Active state correct
- Auto-hide scroll behavior works
- Mobile menu functional

---

### T034: Visual Regression Test for Navigation [P] [Story: US1]
**File**: `tests/visual/navigation.spec.ts`
**Requirements**: Testing Strategy (Percy), US1
**Story**: US1

Percy snapshot tests for navigation.

```typescript
// tests/visual/navigation.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Navigation Visual Regression', () => {
  test('navigation light mode', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'Navigation - Light Mode');
  });

  test('navigation dark mode', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await percySnapshot(page, 'Navigation - Dark Mode');
  });

  test('mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.click('.hamburger');
    await percySnapshot(page, 'Mobile Menu - Open');
  });
});
```

**Acceptance Criteria**:
- Light/dark mode snapshots
- Mobile menu snapshot
- No visual regressions
- Percy CI passing

---

### T035: Accessibility Test for Navigation [Story: US1]
**File**: `tests/a11y/navigation.spec.ts`
**Requirements**: FR-008, US1
**Story**: US1

Accessibility test for navigation.

```typescript
// tests/a11y/navigation.spec.ts
import { test, expect } from '../setup/axe';

test.describe('Navigation Accessibility', () => {
  test('navigation has no a11y violations', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter should navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/gallery|create/);
  });

  test('screen reader announces correctly', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toHaveAttribute('role', 'navigation');

    const activeLink = page.locator('a.active');
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });
});
```

**Acceptance Criteria**:
- 0 axe violations
- Keyboard navigation works
- ARIA labels correct
- Screen reader compatible

---

### T036: Performance Test for Navigation [P] [Story: US1]
**File**: `tests/performance/navigation.spec.ts`
**Requirements**: FR-007, FR-010, US1
**Story**: US1

Performance test for navigation animations.

```typescript
// tests/performance/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation Performance', () => {
  test('auto-hide animation is 60fps', async ({ page }) => {
    await page.goto('/');

    // Start performance measurement
    await page.evaluate(() => {
      (window as any).frameCount = 0;
      const measureFrames = () => {
        (window as any).frameCount++;
        requestAnimationFrame(measureFrames);
      };
      measureFrames();
    });

    // Scroll to trigger auto-hide
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);

    const frameCount = await page.evaluate(() => (window as any).frameCount);
    expect(frameCount).toBeGreaterThan(55); // ~60fps for 1 second
  });

  test('navigation has no long tasks', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => JSON.stringify(performance.getEntriesByType('measure')));
    const entries = JSON.parse(metrics);

    const longTasks = entries.filter((entry: any) => entry.duration > 50);
    expect(longTasks.length).toBe(0);
  });
});
```

**Acceptance Criteria**:
- 60fps animation verified
- No long tasks >50ms
- GPU acceleration used
- Performance budget met

---

### T037: Navigation Integration with Existing Pages [Story: US1]
**File**: Multiple pages
**Requirements**: Integration Strategy, US1
**Story**: US1

Ensure new navigation works with all existing pages.

**Test Pages**:
- `/` (home)
- `/gallery`
- `/community`
- `/marketplace`
- `/create`
- `/collections`
- `/login`
- `/help`

**Checklist**:
- [ ] Navigation renders on all pages
- [ ] Auto-hide works on all pages
- [ ] Active state highlights correctly
- [ ] Mobile menu works on all pages
- [ ] No z-index conflicts
- [ ] Breadcrumb shows on sub-pages

**Acceptance Criteria**:
- Manual QA on all 8 pages
- No visual regressions
- No console errors
- Performance maintained

---

### T038: Navigation Documentation [P] [Story: US1]
**File**: `src/lib/components/navigation/README.md`
**Requirements**: Component Reusability
**Story**: US1

Document navigation components.

```markdown
# Navigation Components

## MainNav

Main navigation bar with auto-hide.

### Props
- `items`: Navigation items array
- `user`: Current user object (optional)

### Usage
```svelte
<MainNav items={navItems} user={currentUser} />
```

## MobileMenu

Mobile hamburger menu.

### Props
- `items`: Navigation items array

### Usage
Automatically shown on <768px breakpoint.

## ThemeToggle

Theme switcher button.

### Usage
```svelte
<ThemeToggle />
```
```

**Acceptance Criteria**:
- Props documented
- Usage examples provided
- ARIA patterns explained
- Integration notes included

---

**Checkpoint**: ✅ Navigation system complete, tested, and integrated

---

## Phase 4: US2 - Card Create Page (P1)

> **Goal**: Redesign card creation page with 2-column layout, live preview, drag-and-drop
> **Duration**: Day 6-7
> **Dependencies**: Phase 2 (Foundational), Phase 3 (Navigation)
> **Independent Test**: Can create card with form validation, see live preview, upload image

### T039: Create Card Creation Form Component [Story: US2]
**File**: `src/lib/components/pages/create/CardCreationForm.svelte`
**Requirements**: FR-002, US2
**Story**: US2

Build card creation form with validation.

```svelte
<script lang="ts">
  import { Button, Input } from '$lib/components/design-system';
  import { createCard } from '$lib/services/cards';
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import type { CardCreationData } from '$lib/types';
  import { validateField } from '$lib/utils/validation';

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
    // Validate
    errors.title = validateField(formData.title, [
      { type: 'required', message: '카드 제목을 입력해주세요' },
      { type: 'minLength', value: 2, message: '제목은 2자 이상이어야 합니다' }
    ]) || '';

    if (!imageFile) {
      errors.image = '이미지를 선택해주세요';
    }

    if (Object.values(errors).some(e => e)) return;

    isSubmitting = true;

    try {
      const card = await createCard({
        ...formData as CardCreationData,
        image: imageFile!,
        community_creator: pb.authStore.model?.id || ''
      });

      await goto('/gallery');
    } catch (error: any) {
      if (error.fieldErrors) {
        errors = error.fieldErrors;
      } else {
        errors.submit = '카드 생성에 실패했습니다';
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form class="create-form" on:submit|preventDefault={handleSubmit}>
  <Input
    label="카드 제목"
    bind:value={formData.title}
    error={errors.title}
    required
    maxLength={50}
    placeholder="예: 2024 레전드"
  />

  <Input
    label="설명"
    type="textarea"
    bind:value={formData.description}
    placeholder="카드에 대한 설명을 입력하세요"
  />

  <div class="form-group">
    <label>홀로그래픽 효과</label>
    <select bind:value={formData.holographic_effect}>
      <option value="overlay">Overlay</option>
      <option value="soft-light">Soft Light</option>
      <option value="hard-light">Hard Light</option>
    </select>
  </div>

  <div class="form-group">
    <label>홀로그래픽 강도: {formData.holographic_intensity}</label>
    <input
      type="range"
      min="0"
      max="100"
      bind:value={formData.holographic_intensity}
    />
  </div>

  <div class="form-group">
    <label>희귀도</label>
    <select bind:value={formData.photocard_rarity}>
      <option value="common">Common</option>
      <option value="rare">Rare</option>
      <option value="epic">Epic</option>
      <option value="legendary">Legendary</option>
    </select>
  </div>

  <div class="form-group">
    <label>이미지 업로드</label>
    <input
      type="file"
      accept="image/*"
      on:change={(e) => imageFile = e.target.files?.[0] || null}
    />
    {#if errors.image}<span class="error">{errors.image}</span>{/if}
  </div>

  <Button
    type="submit"
    variant="primary"
    size="lg"
    loading={isSubmitting}
    disabled={isSubmitting}
  >
    {isSubmitting ? '생성 중...' : '카드 생성하기'}
  </Button>

  {#if errors.submit}
    <div class="error-message">{errors.submit}</div>
  {/if}
</form>

<style>
  .create-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  .error {
    color: var(--semantic-error);
    font-size: var(--font-footnote);
  }
</style>
```

**Acceptance Criteria**:
- All fields render correctly
- Validation on submit
- Loading state during submission
- Error messages displayed
- Integrates with PocketBase API

---

### T040: Create Live Preview Component [Story: US2]
**File**: `src/lib/components/pages/create/LivePreview.svelte`
**Requirements**: FR-002, US2
**Story**: US2

Build live preview of card as user types.

```svelte
<script lang="ts">
  import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
  import type { UnifiedCard } from '$lib/types';

  export let formData: Partial<UnifiedCard>;
  export let imagePreview: string = '';

  $: previewCard = {
    id: 'preview',
    title: formData.title || '카드 제목',
    holographic_image: imagePreview || '/placeholder.jpg',
    holographic_effect: formData.holographic_effect || 'overlay',
    holographic_intensity: formData.holographic_intensity || 75,
    photocard_rarity: formData.photocard_rarity || 'common',
    ...formData
  } as UnifiedCard;
</script>

<div class="preview-container">
  <h3>미리보기</h3>
  <div class="preview-card">
    <UnifiedHolographicCard card={previewCard} interactive={true} />
  </div>
  <p class="preview-hint">
    실시간으로 변경사항이 반영됩니다
  </p>
</div>

<style>
  .preview-container {
    position: sticky;
    top: 100px;
    padding: var(--space-xl);
    background: var(--surface-secondary);
    border-radius: var(--radius-lg);
  }
  .preview-card {
    margin: var(--space-lg) 0;
    display: flex;
    justify-content: center;
  }
  .preview-hint {
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-footnote);
  }
</style>
```

**Acceptance Criteria**:
- Preview updates in real-time
- Uses existing HolographicCard
- Sticky positioning works
- Placeholder shown when no image

---

### T041: Add Drag-and-Drop Image Upload [Story: US2]
**File**: `src/lib/components/pages/create/ImageUpload.svelte`
**Requirements**: FR-002, US2
**Story**: US2

Build drag-and-drop image upload component.

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let previewUrl = '';

  let isDragging = false;
  const dispatch = createEventDispatcher();

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }

  function handleFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleFile(file);
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl = e.target?.result as string;
      dispatch('upload', { file, previewUrl });
    };
    reader.readAsDataURL(file);
  }
</script>

<div
  class="upload-zone"
  class:dragging={isDragging}
  on:drop={handleDrop}
  on:dragover|preventDefault={() => isDragging = true}
  on:dragleave={() => isDragging = false}
>
  {#if previewUrl}
    <img src={previewUrl} alt="Preview" class="preview-image" />
  {:else}
    <div class="upload-prompt">
      <span class="icon">📷</span>
      <p>이미지를 드래그 앤 드롭하거나 클릭하여 업로드</p>
      <input
        type="file"
        accept="image/*"
        on:change={handleFileInput}
        style="display: none"
        id="file-input"
      />
      <label for="file-input" class="upload-button">
        파일 선택
      </label>
    </div>
  {/if}
</div>

<style>
  .upload-zone {
    border: 2px dashed var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3xl);
    text-align: center;
    transition: all var(--transition-fast);
    cursor: pointer;
  }
  .upload-zone.dragging {
    border-color: var(--primary);
    background: var(--primary) / 5%;
  }
  .preview-image {
    max-width: 100%;
    border-radius: var(--radius-md);
  }
  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }
  .icon {
    font-size: 48px;
  }
</style>
```

**Acceptance Criteria**:
- Drag-and-drop works
- Click to upload works
- Image preview shows
- Only image files accepted
- Visual feedback on drag

---

(Continuing with remaining US2 tasks...)

### T042: Create Template Selector Component [P] [Story: US2]
**File**: `src/lib/components/pages/create/TemplateSelector.svelte`
**Requirements**: FR-002, US2
**Story**: US2

Build template selection gallery.

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const templates = [
    { id: 'player', name: '선수 카드', icon: '⚾', preview: '/templates/player.jpg' },
    { id: 'moment', name: '명장면', icon: '📸', preview: '/templates/moment.jpg' },
    { id: 'team', name: '팀 카드', icon: '🏆', preview: '/templates/team.jpg' },
    { id: 'custom', name: '커스텀', icon: '✨', preview: '/templates/custom.jpg' }
  ];

  export let selected = 'player';
  const dispatch = createEventDispatcher();
</script>

<div class="template-selector">
  <h3>템플릿 선택</h3>
  <div class="template-grid">
    {#each templates as template}
      <button
        class="template-card"
        class:selected={selected === template.id}
        on:click={() => {
          selected = template.id;
          dispatch('select', template);
        }}
      >
        <img src={template.preview} alt={template.name} />
        <span class="icon">{template.icon}</span>
        <span class="name">{template.name}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .template-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  .template-card {
    position: relative;
    aspect-ratio: 3/4;
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .template-card.selected {
    border: 3px solid var(--primary);
    transform: scale(1.05);
  }
</style>
```

**Acceptance Criteria**:
- 4 templates displayed
- Selection highlights card
- Preview images shown
- Responsive grid

---

### T043: Update Create Page with 2-Column Layout [Story: US2]
**File**: `src/routes/create/+page.svelte`
**Requirements**: FR-002, US2
**Story**: US2

Update create page to use new components with 2-column layout.

```svelte
<script lang="ts">
  import CardCreationForm from '$lib/components/pages/create/CardCreationForm.svelte';
  import LivePreview from '$lib/components/pages/create/LivePreview.svelte';
  import TemplateSelector from '$lib/components/pages/create/TemplateSelector.svelte';
  import type { CardCreationData } from '$lib/types';

  let formData: Partial<CardCreationData> = {
    title: '',
    holographic_effect: 'overlay',
    holographic_intensity: 75
  };
  let imagePreview = '';
</script>

<div class="create-page">
  <h1 class="page-title">카드 제작</h1>

  <div class="create-layout">
    <div class="form-column">
      <TemplateSelector bind:selected={formData.template} />
      <CardCreationForm bind:formData bind:imagePreview />
    </div>

    <div class="preview-column">
      <LivePreview {formData} {imagePreview} />
    </div>
  </div>
</div>

<style>
  .create-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
    margin-top: var(--space-xl);
  }

  @media (max-width: 1024px) {
    .create-layout {
      grid-template-columns: 1fr;
    }
    .preview-column {
      order: -1; /* Preview first on mobile */
    }
  }
</style>
```

**Acceptance Criteria**:
- 2-column layout on desktop
- 1-column on mobile (preview first)
- Form and preview sync
- Responsive breakpoint works

---

(Due to length constraints, I'll continue with summarized tasks for US2-US6 and provide the complete structure)

### T044-T060: Additional US2 Tasks [Story: US2]

**T044**: Add Progress Indicator for Steps [P]
**T045**: Create Success Animation (Confetti) [P]
**T046**: Add Form Auto-Save to LocalStorage [P]
**T047**: Implement Holographic Intensity Slider Preview
**T048**: Add Tag Input Component [P]
**T049**: Integrate with PocketBase Cards API
**T050**: Add File Size Validation (< 10MB)
**T051**: Add Image Format Validation (JPEG, PNG, WebP)
**T052**: Create Error Toast for Upload Failures
**T053**: Add "Save as Draft" Feature [P]
**T054**: E2E Test for Card Creation Flow
**T055**: Visual Regression Test for Create Page [P]
**T056**: Accessibility Test for Form [Story: US2]
**T057**: Performance Test for Live Preview (60fps)
**T058**: Integration Test with Existing Gallery
**T059**: Mobile Responsive Test for Create Page
**T060**: Documentation for Create Components [P]

**Checkpoint**: ✅ Card create page complete with live preview, validation, and tests

---

## Phase 5: US3 - Collections Page (P1)

> **Goal**: Apple Photos-style collection management with grid, stats, modals
> **Duration**: Day 8-9
> **Dependencies**: Phase 2 (Foundational), Phase 3 (Navigation)
> **Independent Test**: Can view collections, create new collection, see stats dashboard

### T061-T080: US3 Tasks [Story: US3]

**T061**: Create CollectionCard Component
**T062**: Create CollectionGrid Component
**T063**: Create CollectionStats Dashboard
**T064**: Add 3D Tilt Hover Effect (Custom CSS from research.md)
**T065**: Create Empty State Component [P]
**T066**: Create "New Collection" Modal [P]
**T067**: Integrate with PocketBase Collections API
**T068**: Add Count-Up Animation for Stats
**T069**: Add Filter/Sort Controls [P]
**T070**: Create Collection Detail Modal
**T071**: Add Quick Actions (Edit, Delete, Share) [P]
**T072**: Update Collections Page Layout
**T073**: Add Loading Skeleton for Collection Grid
**T074**: Add Infinite Scroll Pagination [P]
**T075**: E2E Test for Collections CRUD
**T076**: Visual Regression Test for Collections Page [P]
**T077**: Accessibility Test for Collections
**T078**: Performance Test for Grid Rendering
**T079**: Mobile Responsive Test for Collections
**T080**: Documentation for Collections Components [P]

**Checkpoint**: ✅ Collections page complete with Apple Photos-style grid and stats

---

## Phase 6: US4 - Auth Pages (P2)

> **Goal**: Modern auth UI with validation, OAuth, password strength
> **Duration**: Day 10-11
> **Dependencies**: Phase 2 (Foundational)
> **Independent Test**: Can login, signup, see validation errors, use OAuth

### T081-T095: US4 Tasks [Story: US4]

**T081**: Create LoginForm Component
**T082**: Create SignupForm Component
**T083**: Create PasswordStrength Component [P]
**T084**: Add Real-time Email Validation
**T085**: Create OAuth Buttons (Google, GitHub) [P]
**T086**: Update Login Page Layout
**T087**: Update Register Page Layout
**T088**: Add "Forgot Password" Link and Flow [P]
**T089**: Integrate with PocketBase Auth API
**T090**: Add Success Toast on Login
**T091**: Add Redirect After Login
**T092**: E2E Test for Auth Flow
**T093**: Visual Regression Test for Auth Pages [P]
**T094**: Accessibility Test for Forms
**T095**: Documentation for Auth Components [P]

**Checkpoint**: ✅ Auth pages complete with validation and OAuth

---

## Phase 7: US5 - Info Pages (P2)

> **Goal**: Readable info pages with TOC, accordion, contact form
> **Duration**: Day 12
> **Dependencies**: Phase 2 (Foundational)
> **Independent Test**: Can read help, FAQ, contact form works, terms readable

### T096-T107: US5 Tasks [Story: US5]

**T096**: Create TableOfContents Component [P]
**T097**: Create ReadingProgress Component [P]
**T098**: Update Help Page with TOC
**T099**: Create FAQ Section with Accordion
**T100**: Create ContactForm Component
**T101**: Update Contact Page
**T102**: Update Privacy Policy Page Typography
**T103**: Update Terms of Service Page Typography
**T104**: Add Print-Optimized CSS [P]
**T105**: E2E Test for Contact Form
**T106**: Accessibility Test for Info Pages
**T107**: Documentation for Info Components [P]

**Checkpoint**: ✅ Info pages complete with improved readability

---

## Phase 8: US6 - Responsive & Accessibility (P1)

> **Goal**: Full responsive design and WCAG 2.1 AA compliance
> **Duration**: Day 13-14
> **Dependencies**: All previous phases
> **Independent Test**: Works on all screen sizes, 0 axe violations, keyboard navigation

### T108-T123: US6 Tasks [Story: US6]

**T108**: Define CSS Breakpoints (375px, 768px, 1024px, 1280px)
**T109**: Implement Mobile-First Grid System
**T110**: Add Touch-Optimized Tap Targets (44px min) [P]
**T111**: Test All Pages on Mobile (375px)
**T112**: Test All Pages on Tablet (768px)
**T113**: Test All Pages on Desktop (1280px+)
**T114**: Add Swipe Gestures for Mobile Gallery [P]
**T115**: Create Bottom Navigation for Mobile [P]
**T116**: Add Landscape Mode Support [P]
**T117**: Implement prefers-reduced-motion [P]
**T118**: Add Skip-to-Content Link
**T119**: Ensure Color Contrast 4.5:1+
**T120**: Add Focus Indicators for Keyboard Nav
**T121**: Run axe DevTools on All Pages
**T122**: Test with Screen Reader (VoiceOver, NVDA)
**T123**: Create Accessibility Report

**Checkpoint**: ✅ Fully responsive and accessible across all devices

---

## Phase 9: Polish & Integration (P1)

> **Goal**: Final polish, cross-cutting concerns, production readiness
> **Duration**: Day 15
> **Dependencies**: All phases
> **Independent Test**: Lighthouse >90, bundle <500KB, feature flags work, no regressions

### T124: Run Lighthouse Audits on All Pages
**File**: CI/CD pipeline
**Requirements**: FR-010, Success Criteria
**Story**: Polish

Run Lighthouse CI on all pages and ensure scores >90.

```bash
npm run lighthouse:ci
```

**Pages to Test**:
- `/` (Home)
- `/gallery`
- `/create`
- `/collections`
- `/login`
- `/help`

**Acceptance Criteria**:
- Performance >90 (mobile), >95 (desktop)
- Accessibility 100
- Best Practices >90
- SEO >90
- All Core Web Vitals pass (LCP <2.5s, FID <100ms, CLS <0.1)

---

### T125: Bundle Size Optimization [Story: Polish]
**File**: `vite.config.ts`, code splitting
**Requirements**: FR-010
**Story**: Polish

Optimize bundle sizes to meet <500KB per route.

**Actions**:
- Run bundle analyzer: `npm run build && npm run analyze`
- Code-split heavy components (Lottie, Bits UI)
- Tree-shake unused Tailwind classes
- Optimize images (WebP, srcset)
- Lazy-load non-critical components

**Acceptance Criteria**:
- Main bundle <500KB gzipped
- Each route <500KB gzipped
- No duplicate dependencies
- CI fails if budget exceeded

---

### T126: Add Feature Flags for Gradual Rollout [P] [Story: Polish]
**File**: `src/lib/config/featureFlags.ts`
**Requirements**: Deployment Strategy
**Story**: Polish

Implement feature flags for gradual rollout.

```typescript
// src/lib/config/featureFlags.ts
export const featureFlags = {
  navigationRenewal: import.meta.env.VITE_FF_NAVIGATION === 'true',
  createPageRenewal: import.meta.env.VITE_FF_CREATE_PAGE === 'true',
  collectionsRenewal: import.meta.env.VITE_FF_COLLECTIONS === 'true',
  authPagesRenewal: import.meta.env.VITE_FF_AUTH === 'true',
  infoPagesRenewal: import.meta.env.VITE_FF_INFO === 'true'
};
```

**Usage**:
```svelte
{#if $featureFlags.navigationRenewal}
  <NewMainNav />
{:else}
  <OldMainNav />
{/if}
```

**Acceptance Criteria**:
- All flags configurable via env vars
- Default to `false` (gradual rollout)
- Can toggle per page
- No performance impact when disabled

---

### T127: Cross-Browser Testing [Story: Polish]
**File**: Playwright config
**Requirements**: Constraints (Chrome, Safari, Firefox)
**Story**: Polish

Test on Chrome, Safari, Firefox.

```typescript
// playwright.config.ts
export default {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
};
```

**Acceptance Criteria**:
- All tests pass on Chrome
- All tests pass on Safari (WebKit)
- All tests pass on Firefox
- No browser-specific bugs

---

### T128: Create Rollback Plan Documentation [P] [Story: Polish]
**File**: `docs/ROLLBACK.md`
**Requirements**: Deployment Strategy
**Story**: Polish

Document rollback procedure.

```markdown
# Rollback Plan

## Immediate Rollback (Feature Flags)
1. Set `VITE_FF_NAVIGATION=false` in Vercel environment
2. Redeploy (no code changes needed)
3. Old UI restored immediately

## Full Rollback (Git Revert)
1. `git revert <commit-hash>`
2. `git push origin main`
3. Vercel auto-deploys reverted version

## Partial Rollback (Per Page)
Toggle individual feature flags:
- Navigation: `VITE_FF_NAVIGATION=false`
- Create Page: `VITE_FF_CREATE_PAGE=false`
- Collections: `VITE_FF_COLLECTIONS=false`
```

**Acceptance Criteria**:
- Rollback steps documented
- Feature flags tested
- Rollback time <5 minutes
- No data loss on rollback

---

### T129: Set Up Monitoring Alerts
**File**: Vercel/Sentry configuration
**Requirements**: Deployment Strategy
**Story**: Polish

Configure alerts for performance and errors.

**Alerts**:
- Lighthouse score <85
- Error rate >1%
- Page load time >5s (p95)
- Bundle size >500KB

**Acceptance Criteria**:
- Alerts configured in Vercel
- Sentry error tracking
- Email/Slack notifications
- Dashboard for monitoring

---

### T130: Final QA Checklist
**File**: Manual testing checklist
**Requirements**: All User Stories
**Story**: Polish

Complete manual QA across all pages and user stories.

**Checklist**:
- [ ] US1: Navigation works on all pages, auto-hide smooth, mobile menu functional
- [ ] US2: Card creation works, live preview updates, validation correct, image upload works
- [ ] US3: Collections display correctly, stats animate, 3D hover works, modals open/close
- [ ] US4: Login/signup works, validation real-time, OAuth buttons present, success redirect
- [ ] US5: Info pages readable, FAQ accordion works, contact form submits, TOC navigates
- [ ] US6: Responsive on mobile/tablet/desktop, keyboard navigation works, 0 axe violations
- [ ] Dark mode toggles correctly on all pages
- [ ] No console errors on any page
- [ ] Performance: Lighthouse >90 on all pages
- [ ] Accessibility: axe-core 0 violations
- [ ] Visual: No regressions in Percy
- [ ] Integration: No breaks in Phase 1/4 features

**Acceptance Criteria**:
- All checklist items pass
- No critical bugs
- Ready for production

---

## Summary

**Total Tasks**: 130 (128 implementation + 2 documentation)

**Timeline**: 15 days (3 weeks)

### Week 1: Foundation
- **Day 1**: Setup (T001-T010)
- **Day 2-3**: Foundational Components (T011-T025)
- **Day 4-5**: US1 Navigation (T026-T038)

### Week 2: Core Pages
- **Day 6-7**: US2 Card Create (T039-T060)
- **Day 8-9**: US3 Collections (T061-T080)
- **Day 10-11**: US4 Auth Pages (T081-T095)

### Week 3: Polish
- **Day 12**: US5 Info Pages (T096-T107)
- **Day 13-14**: US6 Responsive & A11y (T108-T123)
- **Day 15**: Polish & Integration (T124-T130)

---

## Parallel Execution Opportunities

Tasks marked `[P]` can be executed in parallel:

**Week 1 Parallel**:
- T001-T010 (Setup tasks)
- T011-T018 (Design system components)
- T019-T024 (Stores and utilities)

**Week 2 Parallel**:
- T042, T045, T046, T048, T050-T053 (Create page sub-components)
- T065, T066, T069, T071, T074 (Collections sub-components)
- T083, T085, T088 (Auth sub-components)

**Week 3 Parallel**:
- T096, T097, T104, T107 (Info page components)
- T110, T114, T115, T116, T117 (Responsive features)
- T126, T128 (Polish documentation)

---

## Dependencies Graph

```
Setup (T001-T010)
  └─> Foundational (T011-T025)
        ├─> US1 Navigation (T026-T038)
        ├─> US2 Card Create (T039-T060)
        ├─> US3 Collections (T061-T080)
        ├─> US4 Auth Pages (T081-T095)
        ├─> US5 Info Pages (T096-T107)
        └─> US6 Responsive & A11y (T108-T123)
              └─> Polish & Integration (T124-T130)
```

**Critical Path**: Setup → Foundational → US1/US2/US3 → US6 → Polish

---

## Testing Strategy Summary

**Unit Tests** (Vitest): T025 + per-component tests
**E2E Tests** (Playwright): T033, T054, T075, T092, T105
**Visual Tests** (Percy): T034, T055, T076, T093
**A11y Tests** (axe-core): T035, T056, T077, T094, T106, T121
**Performance Tests**: T036, T057, T078, T124

**Test Coverage Goal**: >70%

---

## Risk Mitigation

1. **60fps Performance**: T036, T057, T078 validate animations
2. **Phase Integration**: T037, T058 test cross-phase compatibility
3. **Bundle Size**: T008, T125 enforce budget
4. **Accessibility**: T035, T121 ensure WCAG 2.1 AA
5. **Rollback**: T126, T128 enable safe rollout

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Ready for Implementation

**Next Step**: Begin Phase 1 Setup (T001-T010)
