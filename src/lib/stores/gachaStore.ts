/**
 * Gacha Store
 *
 * State management for gacha system using Svelte stores.
 */

import { writable, derived, get } from 'svelte/store';
import type {
  GachaState,
  Currency,
  PullHistory,
  PityState,
  GachaStats,
  GachaCard,
  PullType
} from '$lib/gacha/types';
import { PULL_COSTS } from '$lib/gacha/types';
import { GachaEngine } from '$lib/gacha/GachaEngine';

// ===== Main Gacha State =====
export const gachaState = writable<GachaState>({
  stage: 'idle',
  pullType: 1,
  currentRevealIndex: 0,
  results: [],
  canSkip: false,
  isSkipping: false,
  error: null
});

// ===== Currency Store =====
export const currency = writable<Currency>({
  tickets: 10,
  premium: 1000,
  lastFreeTicket: new Date(),
  adTicketsToday: 0
});

// ===== History Store =====
export const pullHistory = writable<PullHistory[]>([]);

// ===== Pity Store =====
export const pityState = writable<PityState>({
  pullCount: 0,
  guaranteeThreshold: 100,
  isGuaranteed: false
});

// ===== Derived: Can Afford Pull =====
export const canAffordPull = derived([currency], ([$currency]) => ({
  single: $currency.tickets >= 1 || $currency.premium >= 100,
  multi: $currency.tickets >= 10 || $currency.premium >= 900
}));

// ===== Derived: Stats =====
export const gachaStats = derived(
  [pullHistory],
  ([$history]): GachaStats => {
    const allCards = $history.flatMap((h) => h.cards);

    return {
      totalPulls: $history.length,
      cardsByRarity: {
        common: allCards.filter((c) => c.rarity === 'common').length,
        rare: allCards.filter((c) => c.rarity === 'rare').length,
        epic: allCards.filter((c) => c.rarity === 'epic').length,
        legendary: allCards.filter((c) => c.rarity === 'legendary').length
      },
      averageRarity: calculateAverageRarity(allCards),
      legendaryCount: allCards.filter((c) => c.rarity === 'legendary').length,
      duplicateCount: allCards.filter((c) => c.isDuplicate).length
    };
  }
);

function calculateAverageRarity(cards: GachaCard[]): number {
  const rarityValues: Record<string, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4
  };
  const sum = cards.reduce((acc, c) => acc + (rarityValues[c.rarity] || 0), 0);
  return cards.length > 0 ? sum / cards.length : 0;
}

// ===== Actions =====
export const gachaActions = {
  /**
   * Perform a pull
   */
  async pull(type: PullType): Promise<GachaCard[]> {
    const $currency = get(currency);
    const cost = PULL_COSTS[type];

    // Check currency
    if ($currency.tickets < cost.tickets && $currency.premium < cost.premium) {
      gachaState.update((s) => ({ ...s, error: '재화가 부족합니다' }));
      throw new Error('Insufficient currency');
    }

    // Deduct currency (prefer tickets)
    if ($currency.tickets >= cost.tickets) {
      currency.update((c) => ({ ...c, tickets: c.tickets - cost.tickets }));
    } else {
      currency.update((c) => ({ ...c, premium: c.premium - cost.premium }));
    }

    // Generate cards
    const engine = new GachaEngine();
    engine.loadPityState(get(pityState));

    const cards = type === 1 ? [engine.pullSingle('', 0)] : engine.pullMulti();

    // Update pity state
    pityState.set(engine.getPityStatus());

    // Update gacha state
    gachaState.update((s) => ({
      ...s,
      pullType: type,
      results: cards,
      stage: 'pulling',
      canSkip: true,
      error: null
    }));

    // Save to history
    pullHistory.update((h) =>
      [
        {
          id: `history-${Date.now()}`,
          pullType: type,
          cards,
          pulledAt: new Date(),
          userId: 'current-user' // TODO: Get from auth
        },
        ...h
      ].slice(0, 100)
    ); // Keep last 100

    return cards;
  },

  /**
   * Skip animation
   */
  skipAnimation(): void {
    gachaState.update((s) => ({ ...s, isSkipping: true, canSkip: false }));
    // Immediately jump to complete stage
    setTimeout(() => {
      gachaState.update((s) => ({ ...s, stage: 'complete', isSkipping: false }));
    }, 300);
  },

  /**
   * Reset to idle
   */
  reset(): void {
    gachaState.set({
      stage: 'idle',
      pullType: 1,
      currentRevealIndex: 0,
      results: [],
      canSkip: false,
      isSkipping: false,
      error: null
    });
  },

  /**
   * Update reveal index
   */
  setRevealIndex(index: number): void {
    gachaState.update((s) => ({ ...s, currentRevealIndex: index }));
  },

  /**
   * Set stage
   */
  setStage(stage: GachaState['stage']): void {
    gachaState.update((s) => ({ ...s, stage }));
  },

  /**
   * Claim daily free ticket
   */
  claimFreeTicket(): boolean {
    const $currency = get(currency);
    const now = new Date();
    const lastClaim = new Date($currency.lastFreeTicket);

    // Check if 24 hours passed
    const hoursSinceLastClaim =
      (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastClaim >= 24) {
      currency.update((c) => ({
        ...c,
        tickets: c.tickets + 1,
        lastFreeTicket: now
      }));
      return true;
    }

    return false;
  },

  /**
   * Add premium currency (for testing)
   */
  addPremium(amount: number): void {
    currency.update((c) => ({ ...c, premium: c.premium + amount }));
  },

  /**
   * Add tickets (for testing)
   */
  addTickets(amount: number): void {
    currency.update((c) => ({ ...c, tickets: c.tickets + amount }));
  }
};
