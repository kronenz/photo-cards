/**
 * Collection Store
 * Feature: 004-production-service-integration
 *
 * Manages collection state including cards, filters, sorting, and stats
 */

import { writable, derived, get } from 'svelte/store';
import type { Team, Rarity } from '$lib/types/models';
import {
  getUserCollection,
  getCollectionStats,
  toggleFavorite,
  type UserCard,
  type CollectionFilters,
  type CollectionSort,
  type CollectionStats
} from '$lib/services/collections';

// ============================================
// Types
// ============================================

interface CollectionState {
  cards: UserCard[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  filters: CollectionFilters;
  sort: CollectionSort;
  stats: CollectionStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
}

// ============================================
// Initial State
// ============================================

const initialState: CollectionState = {
  cards: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  perPage: 30,
  filters: {},
  sort: { field: 'created', direction: 'desc' },
  stats: null,
  isLoading: false,
  isLoadingStats: false,
  error: null
};

// ============================================
// Store
// ============================================

function createCollectionStore() {
  const { subscribe, set, update } = writable<CollectionState>(initialState);

  return {
    subscribe,

    /**
     * Load collection with current filters and sorting
     */
    async loadCollection(options?: { page?: number; reset?: boolean }) {
      update((state) => ({
        ...state,
        isLoading: true,
        error: null,
        currentPage: options?.page ?? state.currentPage
      }));

      try {
        const currentState = get({ subscribe });
        const result = await getUserCollection({
          page: options?.page ?? currentState.currentPage,
          perPage: currentState.perPage,
          filters: currentState.filters,
          sort: currentState.sort
        });

        update((state) => ({
          ...state,
          cards: options?.reset ? result.items : [...state.cards, ...result.items],
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          isLoading: false
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          isLoading: false,
          error: err.message || '컬렉션을 불러오는데 실패했습니다.'
        }));
      }
    },

    /**
     * Load collection statistics
     */
    async loadStats() {
      update((state) => ({ ...state, isLoadingStats: true }));

      try {
        const stats = await getCollectionStats();
        update((state) => ({
          ...state,
          stats,
          isLoadingStats: false
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          isLoadingStats: false,
          error: err.message || '통계를 불러오는데 실패했습니다.'
        }));
      }
    },

    /**
     * Set filters and reload collection
     */
    async setFilters(filters: CollectionFilters) {
      update((state) => ({
        ...state,
        filters,
        currentPage: 1,
        cards: []
      }));

      const store = { subscribe };
      await createCollectionStore.call(store).loadCollection({ reset: true });
    },

    /**
     * Set sort and reload collection
     */
    async setSort(sort: CollectionSort) {
      update((state) => ({
        ...state,
        sort,
        currentPage: 1,
        cards: []
      }));

      // Reload collection
      update((state) => ({ ...state, isLoading: true }));
      try {
        const currentState = get({ subscribe });
        const result = await getUserCollection({
          page: 1,
          perPage: currentState.perPage,
          filters: currentState.filters,
          sort
        });

        update((state) => ({
          ...state,
          cards: result.items,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          isLoading: false
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          isLoading: false,
          error: err.message
        }));
      }
    },

    /**
     * Toggle favorite status (optimistic update)
     */
    async toggleFavorite(userCardId: string) {
      // Optimistic update
      update((state) => ({
        ...state,
        cards: state.cards.map((card) =>
          card.id === userCardId
            ? { ...card, is_favorite: !card.is_favorite }
            : card
        )
      }));

      try {
        await toggleFavorite(userCardId);

        // Update stats
        update((state) => {
          if (state.stats) {
            const card = state.cards.find((c) => c.id === userCardId);
            const delta = card?.is_favorite ? 1 : -1;
            return {
              ...state,
              stats: {
                ...state.stats,
                favoriteCount: state.stats.favoriteCount + delta
              }
            };
          }
          return state;
        });
      } catch (err: any) {
        // Revert on error
        update((state) => ({
          ...state,
          cards: state.cards.map((card) =>
            card.id === userCardId
              ? { ...card, is_favorite: !card.is_favorite }
              : card
          ),
          error: err.message || '즐겨찾기 변경에 실패했습니다.'
        }));
      }
    },

    /**
     * Load next page
     */
    async loadNextPage() {
      const currentState = get({ subscribe });
      if (currentState.currentPage < currentState.totalPages && !currentState.isLoading) {
        update((state) => ({ ...state, currentPage: state.currentPage + 1 }));
        await this.loadCollection({ page: currentState.currentPage + 1 });
      }
    },

    /**
     * Clear filters
     */
    clearFilters() {
      update((state) => ({
        ...state,
        filters: {},
        currentPage: 1,
        cards: []
      }));
    },

    /**
     * Reset store to initial state
     */
    reset() {
      set(initialState);
    },

    /**
     * Clear error
     */
    clearError() {
      update((state) => ({ ...state, error: null }));
    }
  };
}

export const collectionStore = createCollectionStore();

// ============================================
// Derived Stores
// ============================================

export const collectionCards = derived(
  collectionStore,
  ($store) => $store.cards
);

export const collectionStats = derived(
  collectionStore,
  ($store) => $store.stats
);

export const collectionFilters = derived(
  collectionStore,
  ($store) => $store.filters
);

export const collectionSort = derived(
  collectionStore,
  ($store) => $store.sort
);

export const isCollectionLoading = derived(
  collectionStore,
  ($store) => $store.isLoading
);

export const collectionError = derived(
  collectionStore,
  ($store) => $store.error
);

export const hasMorePages = derived(
  collectionStore,
  ($store) => $store.currentPage < $store.totalPages
);

export const isEmpty = derived(
  collectionStore,
  ($store) => !$store.isLoading && $store.cards.length === 0
);
