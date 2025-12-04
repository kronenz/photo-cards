/**
 * Gacha Service
 * Feature: 004-production-service-integration (T054)
 *
 * Handles gacha results persistence, duplicate detection, and history
 */

import { pb } from '$lib/pocketbase';
import type { Rarity, GachaHistory, GachaResult, GachaStats } from '$lib/types/models';
import { logError } from '$lib/services/errorHandler';

export interface GachaPullResult {
  card_id: string;
  title: string;
  team: string;
  rarity: Rarity;
  is_duplicate: boolean;
  new_count: number;
}

export interface SaveGachaResponse {
  history_id: string;
  results: GachaPullResult[];
  stats: {
    new_cards: number;
    duplicates: number;
    by_rarity: Record<Rarity, number>;
  };
}

/**
 * Save gacha pull results to backend
 * - Creates card records if they don't exist
 * - Updates user_cards collection (with duplicate count)
 * - Records gacha history
 */
export async function saveGachaResults(
  cards: Array<{
    title: string;
    subtitle: string;
    team: string;
    number: string;
    rarity: Rarity;
    image: string;
  }>
): Promise<SaveGachaResponse> {
  if (!pb.authStore.model?.id) {
    throw new Error('로그인이 필요합니다.');
  }

  const userId = pb.authStore.model.id;
  const results: GachaPullResult[] = [];
  let newCards = 0;
  let duplicates = 0;
  const byRarity: Record<Rarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };

  try {
    for (const card of cards) {
      byRarity[card.rarity]++;

      // Check if this card already exists in user's collection
      // Using title + team + rarity as unique identifier for gacha cards
      const existingUserCard = await pb.collection('user_cards').getFirstListItem(
        `user="${userId}" && card.title="${card.title}" && card.team="${card.team}" && card.rarity="${card.rarity}"`
      ).catch(() => null);

      if (existingUserCard) {
        // Duplicate - increment count
        const newCount = (existingUserCard.count || 1) + 1;
        await pb.collection('user_cards').update(existingUserCard.id, {
          count: newCount
        });

        results.push({
          card_id: existingUserCard.card,
          title: card.title,
          team: card.team,
          rarity: card.rarity,
          is_duplicate: true,
          new_count: newCount
        });
        duplicates++;
      } else {
        // New card - create card record and user_card entry
        const cardRecord = await pb.collection('cards').create({
          title: card.title,
          subtitle: card.subtitle,
          team: card.team,
          number: card.number,
          rarity: card.rarity,
          image_url: card.image,
          creator: userId,
          is_shared: false,
          like_count: 0,
          comment_count: 0,
          share_count: 0
        });

        await pb.collection('user_cards').create({
          user: userId,
          card: cardRecord.id,
          count: 1,
          is_favorite: false,
          obtained_at: new Date().toISOString(),
          obtained_via: 'gacha'
        });

        results.push({
          card_id: cardRecord.id,
          title: card.title,
          team: card.team,
          rarity: card.rarity,
          is_duplicate: false,
          new_count: 1
        });
        newCards++;
      }
    }

    // Record gacha history
    const historyRecord = await pb.collection('gacha_history').create({
      user: userId,
      cards: results.map(r => ({
        card_id: r.card_id,
        rarity: r.rarity,
        is_duplicate: r.is_duplicate
      })),
      pull_count: cards.length,
      timestamp: new Date().toISOString()
    });

    // Create notification if got legendary or epic
    const legendaryCount = byRarity.legendary;
    const epicCount = byRarity.epic;

    if (legendaryCount > 0 || epicCount > 0) {
      await pb.collection('notifications').create({
        user: userId,
        type: 'gacha',
        data: {
          pull_count: cards.length,
          legendary_count: legendaryCount,
          epic_count: epicCount
        },
        is_read: false
      });
    }

    return {
      history_id: historyRecord.id,
      results,
      stats: {
        new_cards: newCards,
        duplicates,
        by_rarity: byRarity
      }
    };
  } catch (error: any) {
    logError('gachaService.saveGachaResults', error);
    throw new Error(error.message || '가챠 결과 저장에 실패했습니다.');
  }
}

/**
 * Get gacha history for current user
 */
export async function getGachaHistory(
  page: number = 1,
  perPage: number = 20
): Promise<{
  items: GachaHistory[];
  totalItems: number;
  totalPages: number;
}> {
  if (!pb.authStore.model?.id) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const result = await pb.collection('gacha_history').getList(page, perPage, {
      filter: `user="${pb.authStore.model.id}"`,
      sort: '-created'
    });

    return {
      items: result.items as GachaHistory[],
      totalItems: result.totalItems,
      totalPages: result.totalPages
    };
  } catch (error: any) {
    logError('gachaService.getGachaHistory', error);
    throw new Error(error.message || '가챠 이력을 불러오는데 실패했습니다.');
  }
}

/**
 * Get gacha statistics for current user
 */
export async function getGachaStats(): Promise<GachaStats> {
  if (!pb.authStore.model?.id) {
    throw new Error('로그인이 필요합니다.');
  }

  const userId = pb.authStore.model.id;

  try {
    // Get all gacha history
    const history = await pb.collection('gacha_history').getFullList({
      filter: `user="${userId}"`
    });

    // Calculate stats
    let totalPulls = 0;
    const byRarity: Record<Rarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };
    let legendaryCount = 0;
    let lastLegendary: string | null = null;
    let pityCounter = 0;

    for (const record of history) {
      totalPulls += record.pull_count || 0;
      const cards = record.cards as GachaResult[] || [];

      for (const card of cards) {
        byRarity[card.rarity]++;
        if (card.rarity === 'legendary') {
          legendaryCount++;
          lastLegendary = record.timestamp;
          pityCounter = 0;
        } else {
          pityCounter++;
        }
      }
    }

    return {
      totalPulls,
      byRarity,
      legendaryRate: totalPulls > 0 ? legendaryCount / totalPulls : 0,
      pityCounter,
      lastLegendary
    };
  } catch (error: any) {
    logError('gachaService.getGachaStats', error);
    throw new Error(error.message || '가챠 통계를 불러오는데 실패했습니다.');
  }
}

/**
 * Get gacha pool (available cards for gacha)
 * In production, this would fetch from a configured pool
 */
export async function getGachaPool(): Promise<{
  cards: Array<{
    id: string;
    title: string;
    team: string;
    rarity: Rarity;
    weight: number;
  }>;
  rates: Record<Rarity, number>;
}> {
  // Default rates
  const rates: Record<Rarity, number> = {
    common: 0.60,
    rare: 0.25,
    epic: 0.12,
    legendary: 0.03
  };

  // For now, return empty pool (cards are generated client-side)
  // In production, this would fetch from a card_pool collection
  return {
    cards: [],
    rates
  };
}
