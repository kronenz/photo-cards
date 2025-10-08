import { describe, it, expect } from 'vitest';
import { TemplateSerializer } from '../../src/lib/services/templates/template-serializer';
import type { Card } from '../../src/lib/types/collections';

describe('Template Serialization', () => {
	const serializer = new TemplateSerializer();

	// Mock card data
	const mockCard: Card = {
		id: 'test_card_001',
		title: 'LG 트윈스 홈런 순간',
		description: '2024 시즌 결승 홈런 순간을 담은 카드',
		image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
		backImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
		rarity: 'legendary' as any,
		type: 'moment' as any,
		holographicEffect: {
			type: 'rainbow',
			intensity: 0.9,
			animationSpeed: 1.2
		},
		stats: {
			likes: 150,
			views: 1200,
			downloads: 45,
			comments: 23,
			rating: 4.8
		},
		metadata: {
			tags: ['LG 트윈스', '홈런', '2024 시즌'],
			playerName: '오지환',
			team: 'LG Twins'
		},
		collections: ['homerun_moments', 'lg_twins_2024'],
		owner: 'user_123',
		isPublic: true,
		createdAt: new Date('2024-10-01'),
		updatedAt: new Date('2024-10-01')
	};

	describe('serialize', () => {
		it('should serialize card to TemplateJSON', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});

			expect(templateJSON).toBeDefined();
			expect(templateJSON.metadata).toBeDefined();
			expect(templateJSON.metadata.title).toBe(mockCard.title);
			expect(templateJSON.metadata.version).toMatch(/^\d+\.\d+\.\d+$/);
			expect(templateJSON.cardConfig).toBeDefined();
			expect(templateJSON.cardConfig.frontImage.type).toBe('embedded');
		});

		it('should embed images as Base64', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});

			expect(templateJSON.cardConfig.frontImage.type).toBe('embedded');
			expect(templateJSON.cardConfig.frontImage.data).toBeDefined();
			expect(templateJSON.cardConfig.frontImage.data).toContain('data:image');
		});

		it('should use CDN URLs when embedImages is false', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: false,
				cdnBaseUrl: 'https://cdn.example.com'
			});

			expect(templateJSON.cardConfig.frontImage.type).toBe('url');
			expect(templateJSON.cardConfig.frontImage.url).toContain('https://cdn.example.com');
		});

		it('should include holographic effect settings', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});

			expect(templateJSON.cardConfig.holographic).toBeDefined();
			expect(templateJSON.cardConfig.holographic.effectType).toBe('rainbow');
			expect(templateJSON.cardConfig.holographic.intensity).toBe(0.9);
			expect(templateJSON.cardConfig.holographic.animationSpeed).toBe(1.2);
		});

		it('should generate consistent file hash', () => {
			const template1 = serializer.serialize(mockCard, { embedImages: true });
			const template2 = serializer.serialize(mockCard, { embedImages: true });

			const hash1 = serializer.calculateHash(template1);
			const hash2 = serializer.calculateHash(template2);

			expect(hash1).toBe(hash2);
		});
	});

	describe('deserialize', () => {
		it('should deserialize TemplateJSON to Card', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});
			const deserializedCard = serializer.deserialize(templateJSON);

			expect(deserializedCard).toBeDefined();
			expect(deserializedCard.title).toBe(mockCard.title);
			expect(deserializedCard.description).toBe(mockCard.description);
			expect(deserializedCard.holographicEffect.type).toBe(mockCard.holographicEffect.type);
		});

		it('should preserve holographic effect settings', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});
			const deserializedCard = serializer.deserialize(templateJSON);

			expect(deserializedCard.holographicEffect).toEqual(mockCard.holographicEffect);
		});

		it('should restore embedded images', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});
			const deserializedCard = serializer.deserialize(templateJSON);

			expect(deserializedCard.image).toBeDefined();
			expect(deserializedCard.image).toContain('data:image');
		});
	});

	describe('round-trip conversion', () => {
		it('should preserve card data through serialize -> deserialize', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});
			const deserializedCard = serializer.deserialize(templateJSON);

			// Check key fields are preserved
			expect(deserializedCard.title).toBe(mockCard.title);
			expect(deserializedCard.description).toBe(mockCard.description);
			expect(deserializedCard.rarity).toBe(mockCard.rarity);
			expect(deserializedCard.type).toBe(mockCard.type);
			expect(deserializedCard.holographicEffect).toEqual(mockCard.holographicEffect);
			expect(deserializedCard.metadata.playerName).toBe(mockCard.metadata.playerName);
			expect(deserializedCard.metadata.team).toBe(mockCard.metadata.team);
		});

		it('should handle multiple round-trips without data loss', () => {
			let currentCard = mockCard;

			for (let i = 0; i < 3; i++) {
				const templateJSON = serializer.serialize(currentCard, {
					embedImages: true
				});
				currentCard = serializer.deserialize(templateJSON);
			}

			expect(currentCard.title).toBe(mockCard.title);
			expect(currentCard.holographicEffect.intensity).toBe(mockCard.holographicEffect.intensity);
		});
	});

	describe('validate', () => {
		it('should validate correct TemplateJSON', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});

			const isValid = serializer.validate(templateJSON);
			expect(isValid).toBe(true);
		});

		it('should reject invalid TemplateJSON (missing metadata)', () => {
			const invalidJSON: any = {
				cardConfig: {},
				layout: { elements: [] },
				variables: {},
				compatibility: { minVersion: '1.0.0' }
			};

			const isValid = serializer.validate(invalidJSON);
			expect(isValid).toBe(false);
		});

		it('should reject invalid TemplateJSON (missing cardConfig)', () => {
			const invalidJSON: any = {
				metadata: { id: 'test', version: '1.0.0', title: 'Test' },
				layout: { elements: [] },
				variables: {},
				compatibility: { minVersion: '1.0.0' }
			};

			const isValid = serializer.validate(invalidJSON);
			expect(isValid).toBe(false);
		});
	});

	describe('calculateHash', () => {
		it('should generate SHA-256 hash', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});

			const hash = serializer.calculateHash(templateJSON);
			expect(hash).toBeDefined();
			expect(hash).toHaveLength(64); // SHA-256 hex string is 64 chars
		});

		it('should generate different hashes for different templates', () => {
			const card1 = { ...mockCard, title: 'Card 1' };
			const card2 = { ...mockCard, title: 'Card 2' };

			const template1 = serializer.serialize(card1, { embedImages: true });
			const template2 = serializer.serialize(card2, { embedImages: true });

			const hash1 = serializer.calculateHash(template1);
			const hash2 = serializer.calculateHash(template2);

			expect(hash1).not.toBe(hash2);
		});

		it('should generate same hash for identical templates', () => {
			const template1 = serializer.serialize(mockCard, { embedImages: true });
			const template2 = serializer.serialize(mockCard, { embedImages: true });

			const hash1 = serializer.calculateHash(template1);
			const hash2 = serializer.calculateHash(template2);

			expect(hash1).toBe(hash2);
		});
	});

	describe('file size estimation', () => {
		it('should generate templates within size limit (15MB)', () => {
			const templateJSON = serializer.serialize(mockCard, {
				embedImages: true
			});

			const jsonString = JSON.stringify(templateJSON);
			const sizeBytes = new Blob([jsonString]).size;
			const sizeMB = sizeBytes / (1024 * 1024);

			expect(sizeMB).toBeLessThan(15);
		});

		it('should have smaller file size without embedded images', () => {
			const templateWithImages = serializer.serialize(mockCard, {
				embedImages: true
			});
			const templateWithoutImages = serializer.serialize(mockCard, {
				embedImages: false,
				cdnBaseUrl: 'https://cdn.example.com'
			});

			const sizeWith = new Blob([JSON.stringify(templateWithImages)]).size;
			const sizeWithout = new Blob([JSON.stringify(templateWithoutImages)]).size;

			expect(sizeWithout).toBeLessThan(sizeWith);
		});
	});
});
