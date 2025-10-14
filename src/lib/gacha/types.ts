/**
 * Gacha System Type Definitions
 */

import type { Card } from '$lib/types/card';

// ===== Gacha Stage =====
export type GachaStage = 'idle' | 'pulling' | 'revealing' | 'complete';

// ===== Pull Type =====
export type PullType = 1 | 10;

// ===== Gacha Card =====
export interface GachaCard extends Card {
  // Additional gacha-specific data
  pullId: string;           // Unique pull session ID
  pullIndex: number;        // Position in the pull (0-9)
  pulledAt: Date;           // Timestamp
  isNew: boolean;           // First time acquiring
  isDuplicate: boolean;     // Already owned
  guaranteeType?: 'pity' | 'bonus'; // Special guarantee
}

// ===== Gacha State =====
export interface GachaState {
  // Current stage of the gacha process
  stage: GachaStage;

  // Type of pull being performed
  pullType: PullType;

  // Current card being revealed (for sequential animation)
  currentRevealIndex: number;

  // All pulled cards
  results: GachaCard[];

  // Animation control
  canSkip: boolean;
  isSkipping: boolean;

  // Error state
  error: string | null;
}

// ===== Currency =====
export interface Currency {
  tickets: number;          // Free/earned tickets
  premium: number;          // Paid currency
  lastFreeTicket: Date;     // For daily reset
  adTicketsToday: number;   // Ad-earned tickets today
}

// ===== Pull Cost =====
export interface PullCost {
  tickets: number;
  premium: number;
}

export const PULL_COSTS: Record<PullType, PullCost> = {
  1: { tickets: 1, premium: 100 },
  10: { tickets: 10, premium: 900 } // 10% discount
};

// ===== Probability Config =====
export interface ProbabilityConfig {
  common: number;      // 0.60 (60%)
  rare: number;        // 0.25 (25%)
  epic: number;        // 0.12 (12%)
  legendary: number;   // 0.03 (3%)
}

export const DEFAULT_PROBABILITIES: ProbabilityConfig = {
  common: 0.60,
  rare: 0.25,
  epic: 0.12,
  legendary: 0.03
};

// ===== Pity System =====
export interface PityState {
  pullCount: number;           // Total pulls since last legendary
  guaranteeThreshold: number;  // 100 pulls
  isGuaranteed: boolean;       // Next pull is guaranteed legendary
}

// ===== Pull History =====
export interface PullHistory {
  id: string;
  pullType: PullType;
  cards: GachaCard[];
  pulledAt: Date;
  userId: string;
}

// ===== Gacha Stats =====
export interface GachaStats {
  totalPulls: number;
  cardsByRarity: Record<string, number>;
  averageRarity: number;
  legendaryCount: number;
  duplicateCount: number;
}

// ===== Animation Config =====
export interface AnimationConfig {
  // Duration for each stage (ms)
  duration: {
    pulling: number;      // Summon circle
    cardAppear: number;   // Each card appearing
    cardFlip: number;     // Card flip animation
    particle: number;     // Particle effect duration
    complete: number;     // Final result display
  };

  // Timing between cards
  stagger: {
    appear: number;       // Time between card appearances
    reveal: number;       // Time between card reveals
  };

  // Easing functions
  easing: {
    pullOut: string;      // bounce
    flip: string;         // smooth
    particle: string;     // ease-out
  };

  // Particle counts by rarity
  particles: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };

  // Special effects
  special: {
    legendaryScreenFlash: boolean;
    legendaryCameraZoom: number;  // 1.2x
    legendarySlowMotion: number;  // 0.5x speed
  };
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  duration: {
    pulling: 1000,
    cardAppear: 400,
    cardFlip: 800,
    particle: 1200,
    complete: 2000
  },
  stagger: {
    appear: 100,
    reveal: 100
  },
  easing: {
    pullOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    flip: 'cubic-bezier(0.33, 1, 0.68, 1)',
    particle: 'ease-out'
  },
  particles: {
    common: 10,
    rare: 20,
    epic: 40,
    legendary: 80
  },
  special: {
    legendaryScreenFlash: true,
    legendaryCameraZoom: 1.2,
    legendarySlowMotion: 0.5
  }
};

// ===== Animation Callbacks =====
export interface AnimationCallbacks {
  onStageChange?: (stage: GachaStage) => void;
  onRevealStart?: (card: GachaCard, index: number) => void;
  onRevealComplete?: (card: GachaCard, index: number) => void;
  onComplete?: (cards: GachaCard[]) => void;
  onError?: (error: any) => void;
}
