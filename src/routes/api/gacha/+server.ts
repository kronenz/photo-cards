/**
 * Gacha API Endpoint
 * Feature: 004-production-service-integration (T055)
 *
 * POST /api/gacha - Save gacha results
 * GET /api/gacha - Get gacha history
 * GET /api/gacha?stats=true - Get gacha statistics
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveGachaResults, getGachaHistory, getGachaStats } from '$lib/services/gachaService';
import type { Rarity } from '$lib/types/models';

interface GachaCardInput {
  title: string;
  subtitle: string;
  team: string;
  number: string;
  rarity: Rarity;
  image: string;
}

/**
 * POST /api/gacha - Save gacha results
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, '로그인이 필요합니다.');
  }

  try {
    const body = await request.json();
    const { cards } = body as { cards: GachaCardInput[] };

    // Validate input
    if (!Array.isArray(cards) || cards.length === 0) {
      throw error(400, '카드 데이터가 필요합니다.');
    }

    if (cards.length > 10) {
      throw error(400, '한 번에 최대 10장까지 저장할 수 있습니다.');
    }

    // Validate each card
    const validRarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
    for (const card of cards) {
      if (!card.title || !card.team || !card.rarity) {
        throw error(400, '카드 정보가 올바르지 않습니다.');
      }
      if (!validRarities.includes(card.rarity)) {
        throw error(400, '올바르지 않은 등급입니다.');
      }
    }

    const result = await saveGachaResults(cards);

    return json({
      success: true,
      data: result
    });
  } catch (err: any) {
    if (err.status) {
      throw err;
    }
    console.error('Gacha save error:', err);
    throw error(500, err.message || '가챠 결과 저장에 실패했습니다.');
  }
};

/**
 * GET /api/gacha - Get gacha history or stats
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, '로그인이 필요합니다.');
  }

  try {
    const wantStats = url.searchParams.get('stats') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '20');

    if (wantStats) {
      const stats = await getGachaStats();
      return json({
        success: true,
        data: stats
      });
    }

    const history = await getGachaHistory(page, perPage);
    return json({
      success: true,
      data: history
    });
  } catch (err: any) {
    if (err.status) {
      throw err;
    }
    console.error('Gacha fetch error:', err);
    throw error(500, err.message || '가챠 데이터를 불러오는데 실패했습니다.');
  }
};
