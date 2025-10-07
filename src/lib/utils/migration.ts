/**
 * Data Migration Utilities for Integrated Holographic Platform
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Migrate Phase 1, 2, 4 data to unified models
 */

import type {
  UnifiedCard,
  UnifiedUser,
  LegacyEnhancedCard,
  LegacyPhotocardData,
  LegacyCommunityCard,
} from '$lib/types/unified';

// ===== PHASE 1 MIGRATION (Enhanced Card → Unified Card) =====

/**
 * Migrate Phase 1 Enhanced Card to UnifiedCard format
 */
export function migrateEnhancedCard(legacy: LegacyEnhancedCard): UnifiedCard {
  return {
    id: legacy.id,
    title: legacy.title,
    createdAt: new Date(),
    updatedAt: new Date(),

    // Phase 1 fields
    holographic: {
      image: legacy.image,
      backImage: legacy.backImage,
      effect: legacy.holographicEffect,
      intensity: 80, // Default intensity
      isFlipped: false,
      animationDuration: 600, // Default 600ms
    },

    // Phase 2 fields (default values for legacy cards)
    photocard: {
      rarity: 'common', // Legacy cards default to common
      stats: {
        totalViews: 0,
        uniqueCollectors: 0,
        completionRate: 0,
      },
      collections: [],
    },

    // Phase 4 fields (system-generated)
    community: {
      creator: 'system', // Legacy cards created by system
      isPublic: false,
      tags: ['legacy', 'phase-1'],
      metadata: {
        likes: 0,
        downloads: 0,
        rating: 0,
        ratingCount: 0,
      },
    },

    context: 'test', // Legacy Enhanced Cards used in /test
  };
}

// ===== PHASE 2 MIGRATION (Photocard → Unified Card) =====

/**
 * Migrate Phase 2 Photocard to UnifiedCard format
 */
export function migratePhotocardData(
  legacy: LegacyPhotocardData,
  imageUrl: string,
  backImageUrl: string
): UnifiedCard {
  return {
    id: legacy.id,
    title: legacy.title,
    createdAt: new Date(),
    updatedAt: new Date(),

    // Phase 1 fields (default holographic settings)
    holographic: {
      image: imageUrl,
      backImage: backImageUrl,
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600,
    },

    // Phase 2 fields
    photocard: {
      rarity: legacy.rarity,
      stats: {
        totalViews: 0,
        uniqueCollectors: 0,
        completionRate: 0,
      },
      collections: legacy.collections,
      acquiredAt: legacy.acquiredAt ? new Date(legacy.acquiredAt) : undefined,
    },

    // Phase 4 fields (default)
    community: {
      creator: 'system',
      isPublic: false,
      tags: ['legacy', 'phase-2', 'photocard'],
      metadata: {
        likes: 0,
        downloads: 0,
        rating: 0,
        ratingCount: 0,
      },
    },

    context: 'main', // Photocards used in main page
  };
}

// ===== PHASE 4 MIGRATION (Community Card → Unified Card) =====

/**
 * Migrate Phase 4 Community Card to UnifiedCard format
 */
export function migrateCommunityCard(
  legacy: LegacyCommunityCard,
  backImageUrl?: string
): UnifiedCard {
  return {
    id: legacy.id,
    title: legacy.title,
    createdAt: new Date(),
    updatedAt: new Date(),

    // Phase 1 fields
    holographic: {
      image: legacy.image,
      backImage: backImageUrl || legacy.image, // Use same image if no back
      effect: 'soft-light',
      intensity: 80,
      isFlipped: false,
      animationDuration: 600,
    },

    // Phase 2 fields (default)
    photocard: {
      rarity: 'common',
      stats: {
        totalViews: 0,
        uniqueCollectors: 0,
        completionRate: 0,
      },
      collections: [],
    },

    // Phase 4 fields
    community: {
      creator: legacy.creator,
      isPublic: legacy.isPublic,
      tags: legacy.tags,
      template: legacy.template,
      metadata: {
        likes: legacy.likes,
        downloads: legacy.downloads,
        rating: 0,
        ratingCount: 0,
      },
    },

    context: 'community', // Community cards used in gallery/community
  };
}

// ===== BATCH MIGRATION =====

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Array<{
    sourceId: string;
    error: string;
    timestamp: Date;
  }>;
  duration: number;
}

/**
 * Migrate multiple Phase 1 Enhanced Cards in batch
 */
export async function migrateEnhancedCardsBatch(
  legacyCards: LegacyEnhancedCard[]
): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
    duration: 0,
  };

  for (const legacyCard of legacyCards) {
    try {
      const unifiedCard = migrateEnhancedCard(legacyCard);
      // TODO: Save to PocketBase unified_cards collection
      console.log('Migrated Enhanced Card:', unifiedCard.id);
      result.migratedCount++;
    } catch (error) {
      result.failedCount++;
      result.errors.push({
        sourceId: legacyCard.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }

  result.duration = Date.now() - startTime;
  result.success = result.failedCount === 0;

  return result;
}

/**
 * Migrate multiple Phase 2 Photocards in batch
 */
export async function migratePhotocardsBatch(
  legacyCards: Array<LegacyPhotocardData & { imageUrl: string; backImageUrl: string }>
): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
    duration: 0,
  };

  for (const legacyCard of legacyCards) {
    try {
      const unifiedCard = migratePhotocardData(
        legacyCard,
        legacyCard.imageUrl,
        legacyCard.backImageUrl
      );
      // TODO: Save to PocketBase unified_cards collection
      console.log('Migrated Photocard:', unifiedCard.id);
      result.migratedCount++;
    } catch (error) {
      result.failedCount++;
      result.errors.push({
        sourceId: legacyCard.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }

  result.duration = Date.now() - startTime;
  result.success = result.failedCount === 0;

  return result;
}

/**
 * Migrate multiple Phase 4 Community Cards in batch
 */
export async function migrateCommunityCardsBatch(
  legacyCards: Array<LegacyCommunityCard & { backImageUrl?: string }>
): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
    duration: 0,
  };

  for (const legacyCard of legacyCards) {
    try {
      const unifiedCard = migrateCommunityCard(legacyCard, legacyCard.backImageUrl);
      // TODO: Save to PocketBase unified_cards collection
      console.log('Migrated Community Card:', unifiedCard.id);
      result.migratedCount++;
    } catch (error) {
      result.failedCount++;
      result.errors.push({
        sourceId: legacyCard.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }

  result.duration = Date.now() - startTime;
  result.success = result.failedCount === 0;

  return result;
}

// ===== VALIDATION =====

/**
 * Validate a unified card meets schema requirements
 */
export function validateUnifiedCard(card: UnifiedCard): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate common fields
  if (!card.id || card.id.trim() === '') errors.push('Missing or empty card ID');
  if (!card.title || card.title.trim() === '') errors.push('Missing or empty title');

  // Validate holographic fields
  if (!card.holographic.image) errors.push('Missing holographic image URL');
  if (!card.holographic.backImage) errors.push('Missing holographic back image URL');
  if (card.holographic.intensity < 0 || card.holographic.intensity > 100) {
    errors.push('Holographic intensity must be 0-100');
  }
  if (card.holographic.animationDuration < 300 || card.holographic.animationDuration > 1000) {
    errors.push('Animation duration must be 300-1000ms');
  }

  // Validate photocard fields
  if (!['common', 'rare', 'epic', 'legendary'].includes(card.photocard.rarity)) {
    errors.push('Invalid rarity value');
  }
  if (card.photocard.stats.completionRate < 0 || card.photocard.stats.completionRate > 100) {
    errors.push('Completion rate must be 0-100%');
  }

  // Validate community fields
  if (!card.community.creator) errors.push('Missing creator ID');
  if (card.community.metadata.rating < 0 || card.community.metadata.rating > 5) {
    errors.push('Rating must be 0-5');
  }
  if (card.community.tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
