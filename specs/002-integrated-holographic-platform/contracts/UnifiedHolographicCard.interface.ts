/**
 * UnifiedHolographicCard Component Contract
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Unified card component supporting all contexts (test, main, gallery, community)
 *
 * This contract defines the public API for the UnifiedHolographicCard component
 * that wraps the existing Phase 1 Enhanced Card with context-aware rendering.
 */

import type { UnifiedCard, CardContext } from '$lib/types/unified';

// ===== PROPS INTERFACE =====

export interface UnifiedHolographicCardProps {
  /**
   * The unified card data to render
   * @required
   */
  card: UnifiedCard;

  /**
   * Context in which the card is rendered
   * Determines which features are enabled
   * @default 'main'
   */
  context?: CardContext;

  /**
   * Card size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'featured';

  /**
   * Whether the card is interactive (clickable, hoverable)
   * @default true
   */
  interactive?: boolean;

  /**
   * Custom CSS class for the card wrapper
   */
  class?: string;

  /**
   * Whether to show card metadata (likes, downloads, etc.)
   * @default true in 'community' context, false otherwise
   */
  showMetadata?: boolean;

  /**
   * Whether to enable holographic effect
   * @default true
   */
  enableHolographic?: boolean;

  /**
   * Whether to enable card flip on click
   * @default true
   */
  enableFlip?: boolean;
}

// ===== EVENTS INTERFACE =====

export interface UnifiedHolographicCardEvents {
  /**
   * Fired when the card is clicked (not during animation)
   * @param card - The clicked card
   */
  click: (card: UnifiedCard) => void;

  /**
   * Fired when the card flip animation completes
   * @param isFlipped - Current flip state
   */
  flip: (isFlipped: boolean) => void;

  /**
   * Fired when the card gains hover/focus
   * @param card - The hovered card
   */
  hoverstart: (card: UnifiedCard) => void;

  /**
   * Fired when the card loses hover/focus
   * @param card - The previously hovered card
   */
  hoverend: (card: UnifiedCard) => void;

  /**
   * Fired when the like button is clicked (community context only)
   * @param card - The liked card
   */
  like: (card: UnifiedCard) => void;

  /**
   * Fired when the share button is clicked
   * @param card - The shared card
   */
  share: (card: UnifiedCard) => void;
}

// ===== SLOTS INTERFACE =====

export interface UnifiedHolographicCardSlots {
  /**
   * Custom content to render on the card front (overlays the image)
   */
  'front-overlay': {};

  /**
   * Custom content to render on the card back (replaces default back)
   */
  'back-content': {
    card: UnifiedCard;
  };

  /**
   * Custom actions to render in the card footer
   */
  'actions': {
    card: UnifiedCard;
  };
}

// ===== CONTEXT API =====

export interface CardContextValue {
  /**
   * Current flip state
   */
  isFlipped: boolean;

  /**
   * Whether flip animation is in progress
   */
  isAnimating: boolean;

  /**
   * Current holographic parameters (mouse position)
   */
  holographicParams: {
    x: number; // Normalized X position (0-1)
    y: number; // Normalized Y position (0-1)
  };

  /**
   * Programmatically flip the card
   */
  flip: () => void;

  /**
   * Reset card to front side
   */
  reset: () => void;
}

// ===== SIZE CONFIGURATIONS =====

export const CARD_SIZE_CONFIGS = {
  small: {
    width: 200,
    height: 280,
    fontSize: 'text-sm',
  },
  medium: {
    width: 300,
    height: 420,
    fontSize: 'text-base',
  },
  large: {
    width: 400,
    height: 560,
    fontSize: 'text-lg',
  },
  featured: {
    width: 600,
    height: 840,
    fontSize: 'text-xl',
  },
} as const;

// ===== CONTEXT-SPECIFIC BEHAVIORS =====

export const CONTEXT_BEHAVIORS: Record<CardContext, {
  showMetadata: boolean;
  enableSocial: boolean;
  enableDownload: boolean;
  enableEdit: boolean;
}> = {
  test: {
    showMetadata: false,
    enableSocial: false,
    enableDownload: false,
    enableEdit: false,
  },
  main: {
    showMetadata: true,
    enableSocial: true,
    enableDownload: false,
    enableEdit: false,
  },
  gallery: {
    showMetadata: true,
    enableSocial: true,
    enableDownload: true,
    enableEdit: true,
  },
  community: {
    showMetadata: true,
    enableSocial: true,
    enableDownload: true,
    enableEdit: false,
  },
} as const;

// ===== COMPONENT USAGE EXAMPLE =====

/**
 * Example usage in a Svelte component:
 *
 * ```svelte
 * <script lang="ts">
 *   import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
 *   import type { UnifiedCard } from '$lib/types/unified';
 *
 *   const card: UnifiedCard = {
 *     // ... card data
 *   };
 *
 *   function handleClick(card: UnifiedCard) {
 *     console.log('Card clicked:', card.id);
 *   }
 *
 *   function handleFlip(isFlipped: boolean) {
 *     console.log('Card flipped:', isFlipped);
 *   }
 * </script>
 *
 * <UnifiedHolographicCard
 *   {card}
 *   context="main"
 *   size="medium"
 *   on:click={handleClick}
 *   on:flip={handleFlip}
 * >
 *   <div slot="front-overlay" class="custom-badge">NEW</div>
 * </UnifiedHolographicCard>
 * ```
 */

// ===== ACCESSIBILITY REQUIREMENTS =====

export const ACCESSIBILITY_REQUIREMENTS = {
  /**
   * The card must be keyboard navigable
   */
  keyboardNavigation: {
    tab: 'Focus the card',
    enter: 'Flip the card',
    space: 'Flip the card',
    escape: 'Reset to front side',
  },

  /**
   * ARIA attributes that must be present
   */
  ariaAttributes: {
    role: 'button', // When interactive
    'aria-label': 'Card title with rarity and creator',
    'aria-pressed': 'true/false based on flip state',
    'aria-busy': 'true during animation',
  },

  /**
   * Focus indicator requirements
   */
  focusIndicator: {
    visible: true,
    color: 'ring-blue-500',
    width: '2px',
  },

  /**
   * Screen reader announcements
   */
  announcements: {
    flip: 'Card flipped to [front/back] side',
    like: 'Card liked. Total likes: [count]',
    share: 'Card shared',
  },
} as const;

// ===== PERFORMANCE REQUIREMENTS =====

export const PERFORMANCE_REQUIREMENTS = {
  /**
   * Target frame rate for holographic animation
   */
  targetFPS: 60,

  /**
   * Maximum frame time (1000ms / 60fps)
   */
  maxFrameTime: 16.67,

  /**
   * Animation duration for card flip
   */
  flipDuration: 600,

  /**
   * Throttle interval for mouse move events (ms)
   */
  mouseMoveThrottle: 16,

  /**
   * Maximum number of cards that can be rendered simultaneously
   * while maintaining 60fps
   */
  maxCardsForPerformance: 100,
} as const;

// ===== ERROR HANDLING =====

export interface CardError {
  code: 'IMAGE_LOAD_FAILED' | 'ANIMATION_ERROR' | 'CONTEXT_ERROR';
  message: string;
  card: UnifiedCard;
}

/**
 * Error event fired when card encounters an error
 */
export interface UnifiedHolographicCardErrorEvent {
  error: (error: CardError) => void;
}
