/**
 * Test Helpers for Template Marketplace
 *
 * Provides mock data and utility functions for testing template features.
 */

import type {
	Template,
	TemplateReview,
	TemplateCategory,
	TemplateJSON
} from '$lib/types/template';

/**
 * Create a mock template for testing
 */
export function createMockTemplate(overrides?: Partial<Template>): Template {
	return {
		id: 'rec_test_template_123',
		created: '2025-01-07T00:00:00Z',
		updated: '2025-01-07T00:00:00Z',
		collectionId: 'templates',
		collectionName: 'templates',
		template_id: 'tpl_test_lg_homerun_001',
		version: '1.0.0',
		template_version: '1.0.0',
		title: 'Test LG Homerun Template',
		description: 'A test template for LG Twins homerun moments',
		author: 'user_test_creator',
		category: 'cat_moment_cards',
		tags: ['LG 트윈스', '홈런', '테스트'],
		storage_url: 'https://cdn.kbo-cards.com/templates/tpl_test_lg_homerun_001.json',
		thumbnail_url: 'https://cdn.kbo-cards.com/thumbnails/tpl_test_lg_homerun_001.webp',
		file_size: 512000,
		file_hash: 'sha256:' + 'a'.repeat(64),
		rating_average: 4.5,
		rating_count: 10,
		download_count: 100,
		view_count: 500,
		is_remix: false,
		allow_remix: true,
		license: 'CC-BY',
		is_premium: false,
		copyright_status: 'approved',
		is_published: true,
		published_at: '2025-01-07T00:00:00Z',
		...overrides
	};
}

/**
 * Create a mock template review for testing
 */
export function createMockReview(overrides?: Partial<TemplateReview>): TemplateReview {
	return {
		id: 'rec_test_review_123',
		created: '2025-01-07T00:00:00Z',
		updated: '2025-01-07T00:00:00Z',
		collectionId: 'template_reviews',
		collectionName: 'template_reviews',
		template: 'rec_test_template_123',
		user: 'user_test_reviewer',
		rating: 5,
		comment: 'Great template! Very useful.',
		helpful_count: 5,
		is_verified_purchase: true,
		...overrides
	};
}

/**
 * Create a mock template category for testing
 */
export function createMockCategory(overrides?: Partial<TemplateCategory>): TemplateCategory {
	return {
		id: 'cat_moment_cards',
		created: '2025-01-07T00:00:00Z',
		updated: '2025-01-07T00:00:00Z',
		collectionId: 'template_categories',
		collectionName: 'template_categories',
		slug: 'moment-cards',
		name: '순간 카드',
		description: 'KBO 경기의 명장면을 담은 카드 템플릿',
		icon: '⚡',
		color: '#FF6B35',
		order: 0,
		is_active: true,
		...overrides
	};
}

/**
 * Create a mock template JSON for testing
 */
export function createMockTemplateJSON(overrides?: Partial<TemplateJSON>): TemplateJSON {
	return {
		metadata: {
			id: 'tpl_test_lg_homerun_001',
			version: '1.0.0',
			templateVersion: '1.0.0',
			title: 'Test LG Homerun Template',
			author: {
				id: 'user_test_creator',
				username: 'test_creator'
			},
			category: 'moment-cards',
			tags: ['LG 트윈스', '홈런'],
			rating: {
				average: 4.5,
				count: 10
			},
			remixInfo: {
				isRemix: false,
				allowRemix: true
			}
		},
		cardConfig: {
			frontImage: {
				type: 'embedded',
				data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRjZCMzUiLz48L3N2Zz4=',
				hash: 'sha256:' + 'a'.repeat(64)
			},
			holographic: {
				effectType: 'lg',
				intensity: 0.8,
				animationSpeed: 1.2
			}
		},
		layout: {
			elements: [
				{
					type: 'text',
					position: { x: 50, y: 50 },
					size: { width: 200, height: 50 },
					content: 'Test Template',
					style: { fontSize: '24px', color: '#000' }
				}
			]
		},
		variables: {
			player_name: {
				type: 'string',
				default: '테스트 선수',
				label: '선수 이름'
			}
		},
		compatibility: {
			minTemplateVersion: '1.0.0',
			maxTemplateVersion: '2.0.0',
			requiredFeatures: ['holographic-effects', 'card-flip']
		},
		...overrides
	};
}

/**
 * Mock R2 client for testing
 */
export class MockR2Client {
	private storage = new Map<string, any>();

	async upload(key: string, data: any): Promise<string> {
		this.storage.set(key, data);
		return `https://cdn.kbo-cards.com/${key}`;
	}

	async download(key: string): Promise<any> {
		const data = this.storage.get(key);
		if (!data) throw new Error('Not found');
		return data;
	}

	async delete(key: string): Promise<void> {
		this.storage.delete(key);
	}

	async exists(key: string): Promise<boolean> {
		return this.storage.has(key);
	}

	clear(): void {
		this.storage.clear();
	}
}

/**
 * Calculate SHA-256 hash for testing
 */
export async function calculateTestHash(data: string): Promise<string> {
	// Simple mock hash for testing
	return 'sha256:' + data.split('').reduce((hash, char) => {
		return (hash << 5) - hash + char.charCodeAt(0);
	}, 0).toString(16).padStart(64, '0');
}
