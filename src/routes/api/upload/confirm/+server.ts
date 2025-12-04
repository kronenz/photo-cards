/**
 * Upload Confirm Endpoint
 * Feature: 004-production-service-integration
 *
 * POST /api/upload/confirm
 *
 * Called after client uploads to presigned URL
 * - Validates the upload
 * - Generates thumbnails
 * - Creates card record in database
 *
 * Request body: {
 *   objectKey: string,
 *   cardData: { title, subtitle, team, rarity, ... }
 * }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fileExists, getPublicUrl } from '$lib/server/minio';
import { pb } from '$lib/pocketbase';
import type { Team, Rarity } from '$lib/types/models';

interface CardData {
  title: string;
  subtitle?: string;
  team: Team;
  rarity: Rarity;
  number?: string;
  stats?: Record<string, number>;
  is_shared?: boolean;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, '로그인이 필요합니다.');
  }

  try {
    const body = await request.json();
    const { objectKey, cardData } = body as { objectKey: string; cardData: CardData };

    // Validate required fields
    if (!objectKey) {
      return json({ error: 'objectKey is required' }, { status: 400 });
    }

    if (!cardData?.title || !cardData?.team || !cardData?.rarity) {
      return json({ error: 'Card title, team, and rarity are required' }, { status: 400 });
    }

    // Verify the file exists in MinIO
    const exists = await fileExists(objectKey);
    if (!exists) {
      return json({ error: '업로드된 파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Get public URL for the uploaded file
    const imageUrl = getPublicUrl(objectKey);

    // Create card record in PocketBase
    const card = await pb.collection('cards').create({
      title: cardData.title,
      subtitle: cardData.subtitle || '',
      team: cardData.team,
      rarity: cardData.rarity,
      number: cardData.number || '',
      image_url: imageUrl,
      thumb_url: imageUrl, // For now, use same URL (thumbnails can be generated later)
      medium_url: imageUrl,
      creator: locals.user.id,
      is_shared: cardData.is_shared || false,
      like_count: 0,
      stats: cardData.stats || {}
    });

    // Create user_cards record to link card to user's collection
    await pb.collection('user_cards').create({
      user: locals.user.id,
      card: card.id,
      is_favorite: false,
      count: 1,
      obtained_via: 'created'
    });

    return json({
      success: true,
      card: {
        id: card.id,
        title: card.title,
        image_url: card.image_url,
        team: card.team,
        rarity: card.rarity
      }
    });
  } catch (err: any) {
    console.error('Upload confirm error:', err);

    if (err.status) {
      throw err;
    }

    // Handle PocketBase validation errors
    if (err.data?.data) {
      const fieldErrors = Object.entries(err.data.data)
        .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
        .join(', ');
      return json({ error: `유효성 검사 실패: ${fieldErrors}` }, { status: 400 });
    }

    return json({ error: '카드 생성에 실패했습니다.' }, { status: 500 });
  }
};
