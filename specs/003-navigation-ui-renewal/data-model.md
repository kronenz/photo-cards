# Data Model: Navigation & UI Renewal

**Feature**: 003-navigation-ui-renewal
**Date**: 2025-01-08
**Status**: ✅ Complete

---

## Executive Summary

This document defines TypeScript interfaces for all components, design tokens, and state models in the Navigation & UI Renewal feature. All interfaces are designed for type safety, reusability, and 60fps performance.

---

## Design System

### Design Tokens

```typescript
/**
 * Core design tokens following Apple Design System principles
 */
interface DesignTokens {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  transitions: Transitions;
  breakpoints: Breakpoints;
}

interface ColorPalette {
  /** Primary brand color (purple gradient start) */
  primary: string; // #667eea
  /** Secondary brand color (purple gradient end) */
  secondary: string; // #764ba2

  /** Background colors */
  background: {
    primary: string;   // Light: #ffffff, Dark: #000000
    secondary: string; // Light: #f7fafc, Dark: #1a1a1a
    tertiary: string;  // Light: #edf2f7, Dark: #2d2d2d
  };

  /** Surface colors (cards, modals, panels) */
  surface: {
    primary: string;   // Light: #ffffff, Dark: #1a1a1a
    secondary: string; // Light: #f7fafc, Dark: #2d2d2d
    border: string;    // Light: #e2e8f0, Dark: #404040
  };

  /** Text colors */
  text: {
    primary: string;   // Light: #1a202c, Dark: #ffffff
    secondary: string; // Light: #4a5568, Dark: #a0aec0
    tertiary: string;  // Light: #718096, Dark: #718096
  };

  /** Semantic colors */
  semantic: {
    success: string; // #48bb78
    error: string;   // #f56565
    warning: string; // #ed8936
    info: string;    // #4299e1
  };
}

interface Typography {
  fontFamily: {
    sans: string; // -apple-system, BlinkMacSystemFont, "Segoe UI", ...
    mono: string; // "SF Mono", Monaco, ...
  };

  fontSize: {
    display: string;  // 64px
    title1: string;   // 48px
    title2: string;   // 36px
    title3: string;   // 28px
    headline: string; // 22px
    body: string;     // 16px
    callout: string;  // 14px
    caption1: string; // 12px
    caption2: string; // 11px
  };

  fontWeight: {
    regular: number;   // 400
    medium: number;    // 500
    semibold: number;  // 600
    bold: number;      // 700
  };

  lineHeight: {
    tight: string;   // 1.2
    normal: string;  // 1.5
    relaxed: string; // 1.75
  };

  letterSpacing: {
    tight: string;   // -0.02em
    normal: string;  // 0
    wide: string;    // 0.01em
  };
}

interface Spacing {
  xs: string;   // 4px
  sm: string;   // 8px
  md: string;   // 16px
  lg: string;   // 24px
  xl: string;   // 32px
  '2xl': string; // 48px
  '3xl': string; // 64px
  '4xl': string; // 96px
}

interface Shadows {
  sm: string;  // 0 1px 2px rgba(0,0,0,0.05)
  md: string;  // 0 4px 6px rgba(0,0,0,0.1)
  lg: string;  // 0 10px 15px rgba(0,0,0,0.1)
  xl: string;  // 0 20px 25px rgba(0,0,0,0.15)
  '2xl': string; // 0 25px 50px rgba(0,0,0,0.25)
}

interface Transitions {
  fast: string;     // 150ms
  base: string;     // 200ms
  slow: string;     // 300ms
  slower: string;   // 500ms
  easing: {
    default: string;  // cubic-bezier(0.4, 0, 0.2, 1)
    in: string;       // cubic-bezier(0.4, 0, 1, 1)
    out: string;      // cubic-bezier(0, 0, 0.2, 1)
    inOut: string;    // cubic-bezier(0.4, 0, 0.2, 1)
  };
}

interface Breakpoints {
  sm: string;  // 640px
  md: string;  // 768px
  lg: string;  // 1024px
  xl: string;  // 1280px
  '2xl': string; // 1536px
}
```

---

## Component Interfaces

### Base Components (from Bits UI)

```typescript
/**
 * Button component with variants and states
 * Requirements: FR-001 (Design System)
 */
interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Disabled state */
  disabled?: boolean;

  /** Loading state (shows spinner) */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Click handler */
  onClick?: () => void;

  /** Button type (for forms) */
  type?: 'button' | 'submit' | 'reset';

  /** Additional CSS classes */
  class?: string;

  /** Child content */
  children?: any;
}

/**
 * Input component with validation
 * Requirements: FR-001 (Design System)
 */
interface InputProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

  /** Input value (controlled) */
  value?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Label text */
  label?: string;

  /** Helper text below input */
  helperText?: string;

  /** Error message (shows error state) */
  error?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Required field */
  required?: boolean;

  /** Maximum length */
  maxLength?: number;

  /** Input handler */
  onInput?: (value: string) => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Additional CSS classes */
  class?: string;
}

/**
 * Modal/Dialog component (Bits UI Dialog)
 * Requirements: FR-001 (Design System), FR-003 (Card Creation)
 */
interface ModalProps {
  /** Modal open state */
  open: boolean;

  /** Close handler */
  onClose: () => void;

  /** Modal title */
  title?: string;

  /** Modal description */
  description?: string;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /** Show close button */
  showCloseButton?: boolean;

  /** Close on overlay click */
  closeOnOverlayClick?: boolean;

  /** Close on Escape key */
  closeOnEscape?: boolean;

  /** Modal content */
  children?: any;

  /** Additional CSS classes */
  class?: string;
}

/**
 * Dropdown menu component (Bits UI DropdownMenu)
 * Requirements: FR-002 (Navigation System)
 */
interface DropdownMenuProps {
  /** Trigger element (button, link, etc.) */
  trigger: any;

  /** Menu items */
  items: DropdownMenuItem[];

  /** Alignment */
  align?: 'start' | 'center' | 'end';

  /** Side */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /** Additional CSS classes */
  class?: string;
}

interface DropdownMenuItem {
  /** Item label */
  label: string;

  /** Item icon (optional) */
  icon?: string;

  /** Click handler */
  onClick?: () => void;

  /** Item href (for links) */
  href?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Separator (renders divider) */
  separator?: boolean;
}

/**
 * Accordion component (Bits UI Accordion)
 * Requirements: FR-006 (Info Pages - Help)
 */
interface AccordionProps {
  /** Accordion items */
  items: AccordionItem[];

  /** Allow multiple items open */
  multiple?: boolean;

  /** Default open items (by value) */
  defaultValue?: string[];

  /** Additional CSS classes */
  class?: string;
}

interface AccordionItem {
  /** Unique identifier */
  value: string;

  /** Item title */
  title: string;

  /** Item content */
  content: string | any;

  /** Disabled state */
  disabled?: boolean;
}
```

### Navigation Components

```typescript
/**
 * Main navigation header
 * Requirements: FR-002 (Navigation System)
 */
interface NavigationHeaderProps {
  /** Current user (null if not authenticated) */
  user: User | null;

  /** Current route path */
  currentPath: string;

  /** Theme (light/dark) */
  theme: 'light' | 'dark';

  /** Theme toggle handler */
  onThemeToggle: () => void;

  /** Header visibility (for auto-hide) */
  visible?: boolean;

  /** Additional CSS classes */
  class?: string;
}

/**
 * Navigation item
 * Requirements: FR-002 (Navigation System)
 */
interface NavigationItem {
  /** Item label */
  label: string;

  /** Item href */
  href: string;

  /** Item icon (optional) */
  icon?: string;

  /** Active state (computed from currentPath) */
  active?: boolean;

  /** Badge (e.g., notification count) */
  badge?: number;

  /** Dropdown items (for nested navigation) */
  dropdown?: DropdownMenuItem[];

  /** Access control (show only if condition met) */
  requireAuth?: boolean;
}

/**
 * Mobile navigation drawer
 * Requirements: FR-002 (Navigation System), FR-007 (Responsive)
 */
interface MobileNavigationProps {
  /** Drawer open state */
  open: boolean;

  /** Close handler */
  onClose: () => void;

  /** Navigation items */
  items: NavigationItem[];

  /** Current user */
  user: User | null;

  /** Theme */
  theme: 'light' | 'dark';

  /** Theme toggle handler */
  onThemeToggle: () => void;
}

/**
 * Footer component
 * Requirements: FR-002 (Navigation System)
 */
interface FooterProps {
  /** Footer sections */
  sections: FooterSection[];

  /** Theme */
  theme: 'light' | 'dark';

  /** Additional CSS classes */
  class?: string;
}

interface FooterSection {
  /** Section title */
  title: string;

  /** Section links */
  links: FooterLink[];
}

interface FooterLink {
  /** Link label */
  label: string;

  /** Link href */
  href: string;

  /** External link (opens in new tab) */
  external?: boolean;
}
```

### Page-Specific Components

```typescript
/**
 * Card creation form
 * Requirements: FR-003 (Card Creation Page)
 */
interface CardCreationFormProps {
  /** Form submit handler */
  onSubmit: (data: CardCreationData) => Promise<void>;

  /** Form cancel handler */
  onCancel: () => void;

  /** Initial form data (for edit mode) */
  initialData?: Partial<CardCreationData>;

  /** Loading state */
  loading?: boolean;

  /** Form errors */
  errors?: Record<string, string>;
}

/**
 * Unified Card model (from PocketBase unified_cards collection)
 * Backend: /api/collections/unified_cards/records
 */
interface UnifiedCard {
  /** Card ID */
  id: string;

  /** Card title */
  title: string;

  /** Card description */
  description?: string;

  /** Holographic image URL */
  holographic_image: string;

  /** Holographic back image URL */
  holographic_back_image?: string;

  /** Holographic effect type */
  holographic_effect: 'overlay' | 'soft-light' | 'hard-light';

  /** Holographic intensity (0-100) */
  holographic_intensity: number;

  /** Animation duration (100-2000ms) */
  holographic_animation_duration: number;

  /** Photocard rarity */
  photocard_rarity: 'common' | 'rare' | 'epic' | 'legendary';

  /** Photocard season */
  photocard_season: string;

  /** Total views */
  photocard_total_views: number;

  /** Unique collectors */
  photocard_unique_collectors: number;

  /** Completion rate (0-100) */
  photocard_completion_rate: number;

  /** Collections (JSON array) */
  photocard_collections: any[];

  /** Creator (unified_users reference) */
  community_creator: string;

  /** Public visibility */
  community_is_public: boolean;

  /** Tags (JSON array) */
  community_tags: string[];

  /** Likes count */
  community_likes: number;

  /** Downloads count */
  community_downloads: number;

  /** Rating (0-5) */
  community_rating: number;

  /** Rating count */
  community_rating_count: number;

  /** Context */
  context: 'test' | 'main' | 'gallery' | 'community';

  /** Migrated from */
  migrated_from?: 'phase1' | 'phase2' | 'phase4' | 'unified';

  /** Legacy ID */
  legacy_id?: string;

  /** Created date (ISO 8601) */
  created: string;

  /** Updated date (ISO 8601) */
  updated: string;
}

/**
 * Card creation form data (maps to UnifiedCard)
 */
interface CardCreationData {
  /** Card title */
  title: string;

  /** Card description */
  description?: string;

  /** Card image (File object for upload) */
  image: File;

  /** Holographic effect type */
  holographic_effect: 'overlay' | 'soft-light' | 'hard-light';

  /** Holographic intensity (0-100) */
  holographic_intensity: number;

  /** Photocard rarity */
  photocard_rarity: 'common' | 'rare' | 'epic' | 'legendary';

  /** Tags */
  community_tags: string[];

  /** Public visibility */
  community_is_public: boolean;

  /** Context */
  context: 'community';
}

/**
 * Card preview component
 * Requirements: FR-003 (Card Creation Page)
 */
interface CardPreviewProps {
  /** Card data for preview */
  data: Partial<CardCreationData>;

  /** Preview mode (static or interactive) */
  mode?: 'static' | 'interactive';

  /** Show placeholder if no data */
  showPlaceholder?: boolean;

  /** Additional CSS classes */
  class?: string;
}

/**
 * Collection card (grid item)
 * Requirements: FR-004 (Collections Page)
 */
interface CollectionCardProps {
  /** Collection data */
  collection: Collection;

  /** Click handler */
  onClick?: (collection: Collection) => void;

  /** Show edit/delete actions */
  showActions?: boolean;

  /** Edit handler */
  onEdit?: (collection: Collection) => void;

  /** Delete handler */
  onDelete?: (collection: Collection) => void;

  /** Additional CSS classes */
  class?: string;
}

/**
 * Collection model (from PocketBase collections collection)
 * Backend: /api/collections/collections/records
 */
interface Collection {
  /** Collection ID */
  id: string;

  /** Collection name */
  name: string;

  /** Collection description */
  description?: string;

  /** Owner (unified_users reference) */
  owner: string;

  /** Card IDs (JSON array) */
  cards: string[];

  /** Public visibility */
  is_public: boolean;

  /** Total cards count */
  total_cards: number;

  /** Completion rate (0-100) */
  completion_rate: number;

  /** Created date (ISO 8601) */
  created: string;

  /** Updated date (ISO 8601) */
  updated: string;
}

/**
 * Collection statistics dashboard
 * Requirements: FR-004 (Collections Page)
 */
interface CollectionStatsProps {
  /** Total collections count */
  totalCollections: number;

  /** Total cards count */
  totalCards: number;

  /** Average cards per collection */
  averageCardsPerCollection: number;

  /** Recent activity items */
  recentActivity?: ActivityItem[];

  /** Additional CSS classes */
  class?: string;
}

interface ActivityItem {
  /** Activity ID */
  id: string;

  /** Activity type */
  type: 'created' | 'updated' | 'deleted' | 'shared';

  /** Activity message */
  message: string;

  /** Activity date */
  date: Date;

  /** Related entity (collection, card) */
  entityId?: string;
  entityType?: 'collection' | 'card';
}

/**
 * Auth form component
 * Requirements: FR-005 (Auth Pages)
 */
interface AuthFormProps {
  /** Form mode (login or signup) */
  mode: 'login' | 'signup';

  /** Form submit handler */
  onSubmit: (data: AuthFormData) => Promise<void>;

  /** OAuth provider click handler */
  onOAuthClick: (provider: 'google' | 'github') => void;

  /** Loading state */
  loading?: boolean;

  /** Form errors */
  errors?: Record<string, string>;
}

interface AuthFormData {
  /** Email address */
  email: string;

  /** Password */
  password: string;

  /** Confirm password (signup only) */
  confirmPassword?: string;

  /** Display name (signup only) */
  displayName?: string;

  /** Terms acceptance (signup only) */
  acceptTerms?: boolean;
}

/**
 * Contact form component
 * Requirements: FR-006 (Info Pages - Contact)
 */
interface ContactFormProps {
  /** Form submit handler */
  onSubmit: (data: ContactFormData) => Promise<void>;

  /** Loading state */
  loading?: boolean;

  /** Success message */
  successMessage?: string;

  /** Form errors */
  errors?: Record<string, string>;
}

interface ContactFormData {
  /** Contact name */
  name: string;

  /** Contact email */
  email: string;

  /** Message subject */
  subject: string;

  /** Message content */
  message: string;
}
```

---

## State Management

### Navigation State

```typescript
/**
 * Navigation store (Svelte store)
 * Requirements: FR-002 (Navigation System)
 */
interface NavigationState {
  /** Current route path */
  currentPath: string;

  /** Header visibility (for auto-hide) */
  isHeaderVisible: boolean;

  /** Mobile menu open state */
  isMobileMenuOpen: boolean;

  /** Scroll direction */
  scrollDirection: 'up' | 'down';

  /** Last scroll Y position */
  lastScrollY: number;

  /** Navigation items */
  items: NavigationItem[];
}

/**
 * Navigation store actions
 */
interface NavigationActions {
  /** Initialize auto-hide navigation */
  initAutoHideNavigation(): () => void;

  /** Set header visibility */
  setHeaderVisible(visible: boolean): void;

  /** Toggle mobile menu */
  toggleMobileMenu(): void;

  /** Close mobile menu */
  closeMobileMenu(): void;

  /** Update current path */
  setCurrentPath(path: string): void;
}
```

### Theme State

```typescript
/**
 * Theme store (Svelte store)
 * Requirements: FR-002 (Navigation System)
 */
interface ThemeState {
  /** Current theme */
  theme: 'light' | 'dark';

  /** System preference */
  systemPreference: 'light' | 'dark';

  /** User override (null = use system) */
  userOverride: 'light' | 'dark' | null;
}

/**
 * Theme store actions
 */
interface ThemeActions {
  /** Toggle theme */
  toggleTheme(): void;

  /** Set theme explicitly */
  setTheme(theme: 'light' | 'dark'): void;

  /** Reset to system preference */
  resetToSystem(): void;

  /** Initialize theme from localStorage and system */
  initTheme(): void;
}
```

### Form State

```typescript
/**
 * Generic form state (for all forms)
 * Requirements: FR-003, FR-005, FR-006
 */
interface FormState<T> {
  /** Form data */
  data: T;

  /** Form errors (field name → error message) */
  errors: Record<string, string>;

  /** Form touched fields (for validation) */
  touched: Record<string, boolean>;

  /** Form dirty state (has unsaved changes) */
  isDirty: boolean;

  /** Form submitting state */
  isSubmitting: boolean;

  /** Form submitted successfully */
  isSuccess: boolean;

  /** Form submission error */
  submitError: string | null;
}

/**
 * Generic form actions
 */
interface FormActions<T> {
  /** Set field value */
  setFieldValue(field: keyof T, value: any): void;

  /** Set field error */
  setFieldError(field: keyof T, error: string): void;

  /** Mark field as touched */
  setFieldTouched(field: keyof T, touched?: boolean): void;

  /** Validate field */
  validateField(field: keyof T): boolean;

  /** Validate all fields */
  validateForm(): boolean;

  /** Submit form */
  submitForm(): Promise<void>;

  /** Reset form */
  resetForm(): void;
}
```

---

## User & Auth Models

```typescript
/**
 * User model (from PocketBase users collection)
 * Requirements: FR-002, FR-005
 * Backend: /api/collections/users/records
 */
interface User {
  /** User ID */
  id: string;

  /** Email address */
  email: string;

  /** Display name */
  name: string;

  /** Profile picture URL */
  avatar: string;

  /** Email visibility */
  emailVisibility: boolean;

  /** Email verified status */
  verified: boolean;

  /** Created date (ISO 8601) */
  created: string;

  /** Updated date (ISO 8601) */
  updated: string;
}

/**
 * Unified User model (from PocketBase unified_users collection)
 * Requirements: FR-002, FR-005
 * Backend: /api/collections/unified_users/records
 */
interface UnifiedUser {
  /** Record ID */
  id: string;

  /** Reference to users table */
  user_id: string;

  /** Display name */
  display_name: string;

  /** Avatar URL */
  avatar_url?: string;

  /** Bio */
  bio?: string;

  /** Theme preference */
  theme: 'light' | 'dark' | 'auto' | 'kbo-team';

  /** Team theme color (HEX) */
  team_theme_color?: string;

  /** Favorite team */
  fan_favorite_team?: string;

  /** Fan level (1-5) */
  fan_level: number;

  /** Fan points */
  fan_points: number;

  /** Fan joined date (ISO 8601) */
  fan_joined_date?: string;

  /** Creator bio */
  creator_bio?: string;

  /** Follower count */
  creator_followers: number;

  /** Following count */
  creator_following: number;

  /** Total likes received */
  creator_total_likes: number;

  /** Total downloads */
  creator_total_downloads: number;

  /** Cards created count */
  stats_cards_created: number;

  /** Cards collected count */
  stats_cards_collected: number;

  /** Collections count */
  stats_collections: number;

  /** Created date (ISO 8601) */
  created: string;

  /** Updated date (ISO 8601) */
  updated: string;
}

/**
 * Auth response from PocketBase
 * Backend: POST /api/collections/users/auth-with-password
 */
interface AuthResponse {
  /** JWT token */
  token: string;

  /** User record */
  record: User;
}
```

---

## Validation Schemas

```typescript
/**
 * Form validation rules
 * Requirements: FR-003, FR-005, FR-006
 */
interface ValidationRule {
  /** Rule type */
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';

  /** Rule message */
  message: string;

  /** Rule value (for minLength, maxLength, pattern) */
  value?: any;

  /** Custom validator function */
  validator?: (value: any) => boolean;
}

/**
 * Card creation validation schema
 */
const cardCreationSchema: Record<keyof CardCreationData, ValidationRule[]> = {
  template: [
    { type: 'required', message: '템플릿을 선택해주세요.' }
  ],
  title: [
    { type: 'required', message: '카드 제목을 입력해주세요.' },
    { type: 'minLength', value: 2, message: '제목은 2자 이상이어야 합니다.' },
    { type: 'maxLength', value: 50, message: '제목은 50자 이하여야 합니다.' }
  ],
  image: [
    { type: 'required', message: '이미지를 업로드해주세요.' }
  ],
  visibility: [
    { type: 'required', message: '공개 설정을 선택해주세요.' }
  ]
};

/**
 * Auth form validation schema
 */
const authFormSchema: Record<keyof AuthFormData, ValidationRule[]> = {
  email: [
    { type: 'required', message: '이메일을 입력해주세요.' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
  ],
  password: [
    { type: 'required', message: '비밀번호를 입력해주세요.' },
    { type: 'minLength', value: 8, message: '비밀번호는 8자 이상이어야 합니다.' }
  ],
  confirmPassword: [
    { type: 'required', message: '비밀번호 확인을 입력해주세요.' },
    {
      type: 'custom',
      message: '비밀번호가 일치하지 않습니다.',
      validator: (value, data) => value === data.password
    }
  ]
};

/**
 * Contact form validation schema
 */
const contactFormSchema: Record<keyof ContactFormData, ValidationRule[]> = {
  name: [
    { type: 'required', message: '이름을 입력해주세요.' },
    { type: 'minLength', value: 2, message: '이름은 2자 이상이어야 합니다.' }
  ],
  email: [
    { type: 'required', message: '이메일을 입력해주세요.' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
  ],
  subject: [
    { type: 'required', message: '제목을 입력해주세요.' },
    { type: 'minLength', value: 5, message: '제목은 5자 이상이어야 합니다.' }
  ],
  message: [
    { type: 'required', message: '메시지를 입력해주세요.' },
    { type: 'minLength', value: 20, message: '메시지는 20자 이상이어야 합니다.' }
  ]
};
```

---

## Animation & Performance

```typescript
/**
 * Animation configuration
 * Requirements: FR-007 (Responsive), FR-008 (Accessibility)
 */
interface AnimationConfig {
  /** Enable animations (can be disabled for accessibility) */
  enabled: boolean;

  /** Respect prefers-reduced-motion */
  respectMotionPreference: boolean;

  /** Animation duration (ms) */
  duration: number;

  /** Animation easing function */
  easing: string;

  /** Delay before animation starts (ms) */
  delay?: number;
}

/**
 * Page transition animation
 * Requirements: FR-007 (Responsive)
 */
interface PageTransition {
  /** Transition type */
  type: 'fade' | 'slide' | 'scale' | 'none';

  /** Transition duration (ms) */
  duration: number;

  /** Transition easing */
  easing: string;
}

/**
 * 3D tilt effect configuration
 * Requirements: FR-001 (Design System - from research.md)
 */
interface TiltConfig {
  /** Maximum tilt angle (degrees) */
  maxTilt: number; // 15

  /** Tilt perspective (px) */
  perspective: number; // 1000

  /** Event throttle (ms, for 60fps = 16ms) */
  throttle: number; // 16

  /** Enable on mobile */
  enableMobile: boolean;

  /** Reset on mouse leave */
  reset: boolean;

  /** Glare effect intensity (0-1) */
  glareIntensity?: number;
}

/**
 * Scroll auto-hide configuration
 * Requirements: FR-002 (Navigation System - from research.md)
 */
interface AutoHideConfig {
  /** Scroll threshold (px) */
  threshold: number; // 100

  /** Transition duration (ms) */
  transitionDuration: number; // 300

  /** Show on scroll up */
  showOnScrollUp: boolean; // true

  /** Hide on scroll down */
  hideOnScrollDown: boolean; // true

  /** Always visible at top */
  alwaysVisibleAtTop: boolean; // true
}
```

---

## API Response Models

```typescript
/**
 * PocketBase list response (standard pagination)
 * Backend: GET /api/collections/{collection}/records
 * Requirements: FR-003, FR-004, FR-005, FR-006
 */
interface PocketBaseListResponse<T> {
  /** Current page (1-indexed) */
  page: number;

  /** Items per page */
  perPage: number;

  /** Total items count */
  totalItems: number;

  /** Total pages count */
  totalPages: number;

  /** Items array */
  items: T[];
}

/**
 * PocketBase single record response
 * Backend: GET /api/collections/{collection}/records/{id}
 */
type PocketBaseRecordResponse<T> = T;

/**
 * PocketBase create/update response
 * Backend: POST/PATCH /api/collections/{collection}/records
 */
type PocketBaseWriteResponse<T> = T;

/**
 * PocketBase delete response
 * Backend: DELETE /api/collections/{collection}/records/{id}
 */
type PocketBaseDeleteResponse = null;

/**
 * PocketBase error response
 */
interface PocketBaseError {
  /** HTTP status code */
  code: number;

  /** Error message */
  message: string;

  /** Validation errors (field-level) */
  data?: Record<string, {
    code: string;
    message: string;
  }>;
}

/**
 * File upload response
 * Backend: POST /api/files/{collection}/{recordId}/{field}
 */
interface FileUploadResponse {
  /** File ID */
  id: string;

  /** Collection ID */
  collectionId: string;

  /** Collection name */
  collectionName: string;

  /** Record ID */
  recordId: string;

  /** Filename */
  filename: string;

  /** File URL */
  url: string;
}

/**
 * Paginated response (generic wrapper)
 * Requirements: FR-004 (Collections pagination)
 */
interface PaginatedResponse<T> {
  /** Items array */
  items: T[];

  /** Current page (1-indexed) */
  page: number;

  /** Page size */
  pageSize: number;

  /** Total items count */
  total: number;

  /** Total pages count */
  totalPages: number;

  /** Has next page */
  hasNext: boolean;

  /** Has previous page */
  hasPrevious: boolean;
}
```

---

## Error Handling

```typescript
/**
 * Application error types
 * Requirements: FR-003, FR-004, FR-005, FR-006
 */
type AppErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

interface AppError {
  /** Error type */
  type: AppErrorType;

  /** Error message (user-friendly) */
  message: string;

  /** Error details (technical) */
  details?: any;

  /** Field errors (for form validation) */
  fieldErrors?: Record<string, string>;

  /** Retry function (if applicable) */
  retry?: () => Promise<void>;
}

/**
 * Error handler function
 */
type ErrorHandler = (error: AppError) => void;
```

---

## Component Directory Structure

```
src/lib/components/
├── design-system/
│   ├── Button.svelte              → ButtonProps
│   ├── Input.svelte               → InputProps
│   ├── Modal.svelte               → ModalProps
│   ├── DropdownMenu.svelte        → DropdownMenuProps
│   ├── Accordion.svelte           → AccordionProps
│   └── index.ts                   → Re-exports
│
├── navigation/
│   ├── NavigationHeader.svelte    → NavigationHeaderProps
│   ├── MobileNavigation.svelte    → MobileNavigationProps
│   ├── Footer.svelte              → FooterProps
│   └── index.ts
│
├── pages/
│   ├── create/
│   │   ├── CardCreationForm.svelte   → CardCreationFormProps
│   │   ├── CardPreview.svelte        → CardPreviewProps
│   │   └── index.ts
│   │
│   ├── collections/
│   │   ├── CollectionCard.svelte     → CollectionCardProps
│   │   ├── CollectionStats.svelte    → CollectionStatsProps
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── AuthForm.svelte           → AuthFormProps
│   │   └── index.ts
│   │
│   └── contact/
│       ├── ContactForm.svelte        → ContactFormProps
│       └── index.ts
│
└── unified/
    └── UnifiedHolographicCard.svelte  → Existing component
```

---

## Store Directory Structure

```
src/lib/stores/
├── navigation.ts    → NavigationState, NavigationActions
├── theme.ts         → ThemeState, ThemeActions
├── form.ts          → FormState<T>, FormActions<T> (generic)
└── index.ts         → Re-exports
```

---

## Utility Functions

```typescript
/**
 * Form validation utility
 * Requirements: FR-003, FR-005, FR-006
 */
function validateField(
  value: any,
  rules: ValidationRule[]
): string | null {
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
    if (rule.type === 'custom' && rule.validator && !rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Throttle utility (for 60fps event handling)
 * Requirements: FR-001 (Design System)
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let previous = 0;

  return function(...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * Debounce utility (for search inputs)
 * Requirements: FR-004 (Collections - future search)
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Class names utility (for conditional CSS classes)
 * Requirements: All components
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

---

## Dependencies to Install

```bash
# Production dependencies (from research.md)
npm install bits-ui

# Backend integration (already installed)
# - pocketbase (PocketBase JavaScript SDK) ✅

# Development dependencies (from research.md)
npm install --save-dev @percy/cli @percy/playwright

# Already installed (no changes needed)
# - Tailwind CSS 3.3.6 ✅
# - Playwright ✅
# - @tanstack/svelte-virtual ✅
```

## PocketBase Client Setup

```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

/** PocketBase client instance */
export const pb = new PocketBase('http://localhost:8090');

/** Enable auto-cancellation of pending requests */
pb.autoCancellation(false);

/** Subscribe to auth state changes */
pb.authStore.onChange((token, model) => {
  console.log('Auth state changed:', !!token, model?.id);
});
```

---

## Type Safety Checklist

- ✅ All component props typed with interfaces
- ✅ All store states typed with interfaces
- ✅ All form data typed with interfaces
- ✅ All API responses typed with generics
- ✅ All validation schemas typed
- ✅ All utility functions typed with generics
- ✅ All error types defined
- ✅ All animation configs typed
- ✅ No `any` types (except for children props)
- ✅ Strict TypeScript configuration recommended

---

## Next Steps

1. ✅ **Data model complete** - All interfaces defined
2. 🔄 **Create contracts/** - Document API surface (empty for UI-only changes)
3. 🔄 **Write quickstart.md** - Integration scenarios for design system
4. 🔄 **Generate tasks.md** - Break down implementation into trackable tasks

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Complete - Ready for contracts/ creation
