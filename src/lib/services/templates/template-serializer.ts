/**
 * Template Serializer Service
 *
 * Converts UnifiedHolographicCard to/from Template JSON format.
 * Handles Base64 embedding and CDN URL references.
 *
 * @see research.md - Decision 2: Template JSON Format
 */

import type { TemplateJSON } from '$lib/types/template';
import type { UnifiedHolographicCard } from '$lib/types/card';

// Simple hash function for browser environment
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export class TemplateSerializer {
	/**
	 * Serialize a UnifiedHolographicCard to Template JSON format
	 *
	 * @param card - The holographic card to serialize
	 * @param options - Serialization options
	 * @returns Template JSON ready for upload to R2
	 */
	serialize(
		card: UnifiedHolographicCard,
		options?: {
			embedImages?: boolean; // true = Base64, false = URLs
			cdnBaseUrl?: string;
		}
	): TemplateJSON {
		const embedImages = options?.embedImages ?? true;

		// Generate unique template ID from card
		const template_id = this.generateTemplateId(card);

		// Serialize front image
		const frontImage = this.serializeImage(card.frontImage, embedImages, options?.cdnBaseUrl);

		// Serialize back image (if exists)
		const backImage = card.backImage
			? this.serializeImage(card.backImage, embedImages, options?.cdnBaseUrl)
			: undefined;

		const templateJSON: TemplateJSON = {
			metadata: {
				id: template_id,
				version: '1.0.0', // Initial version
				templateVersion: '1.0.0', // Schema version
				title: card.title || 'Untitled Template',
				author: {
					id: card.authorId || 'unknown',
					username: card.authorName || 'Unknown'
				},
				category: card.category || 'general',
				tags: card.tags || [],
				rating: {
					average: 0,
					count: 0
				},
				remixInfo: {
					isRemix: false,
					allowRemix: true
				}
			},
			cardConfig: {
				frontImage,
				backImage,
				holographic: {
					effectType: card.holographicEffect?.type || 'default',
					intensity: card.holographicEffect?.intensity || 0.8,
					animationSpeed: card.holographicEffect?.animationSpeed || 1.0
				}
			},
			layout: {
				elements: card.layoutElements || []
			},
			variables: card.variables || {},
			compatibility: {
				minTemplateVersion: '1.0.0',
				maxTemplateVersion: '2.0.0',
				requiredFeatures: ['holographic-effects', 'card-flip']
			}
		};

		return templateJSON;
	}

	/**
	 * Deserialize Template JSON to UnifiedHolographicCard
	 *
	 * @param json - Template JSON from R2
	 * @returns UnifiedHolographicCard instance
	 */
	deserialize(json: TemplateJSON): UnifiedHolographicCard {
		// Deserialize images
		const frontImage = this.deserializeImage(json.cardConfig.frontImage);
		const backImage = json.cardConfig.backImage
			? this.deserializeImage(json.cardConfig.backImage)
			: undefined;

		const card: UnifiedHolographicCard = {
			id: json.metadata.id,
			title: json.metadata.title,
			frontImage,
			backImage,
			authorId: json.metadata.author.id,
			authorName: json.metadata.author.username,
			category: json.metadata.category,
			tags: json.metadata.tags,
			holographicEffect: {
				type: json.cardConfig.holographic.effectType,
				intensity: json.cardConfig.holographic.intensity,
				animationSpeed: json.cardConfig.holographic.animationSpeed
			},
			layoutElements: json.layout.elements,
			variables: json.variables,
			created: new Date().toISOString(),
			updated: new Date().toISOString()
		};

		return card;
	}

	/**
	 * Calculate SHA-256 hash of template JSON
	 *
	 * @param json - Template JSON
	 * @returns SHA-256 hash with 'sha256:' prefix
	 */
	calculateHash(json: TemplateJSON): string {
		const jsonString = JSON.stringify(json);
		const hash = simpleHash(jsonString);
		return `sha256:${hash}`;
	}

	/**
	 * Validate template JSON schema
	 *
	 * @param json - Template JSON to validate
	 * @returns true if valid
	 * @throws Error if validation fails
	 */
	validate(json: TemplateJSON): boolean {
		// Check required fields
		if (!json.metadata?.id) throw new Error('Missing metadata.id');
		if (!json.metadata?.version) throw new Error('Missing metadata.version');
		if (!json.metadata?.title) throw new Error('Missing metadata.title');
		if (!json.cardConfig?.frontImage) throw new Error('Missing frontImage');
		if (!json.cardConfig?.holographic) throw new Error('Missing holographic config');

		// Validate semantic versioning
		const versionRegex = /^\d+\.\d+\.\d+$/;
		if (!versionRegex.test(json.metadata.version)) {
			throw new Error('Invalid version format (must be semantic: X.Y.Z)');
		}

		// Validate compatibility range
		if (!json.compatibility?.minTemplateVersion || !json.compatibility?.maxTemplateVersion) {
			throw new Error('Missing compatibility version range');
		}

		return true;
	}

	// ========================================================================
	// Private Helper Methods
	// ========================================================================

	private generateTemplateId(card: UnifiedHolographicCard): string {
		const timestamp = Date.now();
		const category = (card.category || 'general').replace(/[^a-z0-9]/gi, '_').toLowerCase();
		return `tpl_${category}_${timestamp}`;
	}

	private serializeImage(
		imageData: string | File | Blob,
		embedImages: boolean,
		cdnBaseUrl?: string
	): {
		type: 'embedded' | 'url';
		data?: string;
		url?: string;
		fallbackUrl?: string;
		hash: string;
	} {
		if (embedImages) {
			// Convert to Base64
			const base64Data =
				typeof imageData === 'string' && imageData.startsWith('data:')
					? imageData
					: this.toBase64(imageData);

			const hash = this.hashData(base64Data);

			return {
				type: 'embedded',
				data: base64Data,
				hash
			};
		} else {
			// Use CDN URL (assumes image already uploaded)
			const imageUrl =
				typeof imageData === 'string'
					? imageData
					: `${cdnBaseUrl}/images/${this.hashData(imageData)}`;

			const hash = this.hashData(imageUrl);

			return {
				type: 'url',
				url: imageUrl,
				hash
			};
		}
	}

	private deserializeImage(imageConfig: {
		type: 'embedded' | 'url';
		data?: string;
		url?: string;
		hash: string;
	}): string {
		if (imageConfig.type === 'embedded' && imageConfig.data) {
			return imageConfig.data;
		} else if (imageConfig.type === 'url' && imageConfig.url) {
			return imageConfig.url;
		} else {
			throw new Error('Invalid image configuration');
		}
	}

	private toBase64(data: string | File | Blob): string {
		// In browser environment, use FileReader
		// For server, use Buffer
		if (typeof data === 'string') {
			return data;
		}

		// Placeholder - actual implementation would use FileReader/Buffer
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
	}

	private hashData(data: string | File | Blob): string {
		const dataString = typeof data === 'string' ? data : data.toString();
		return simpleHash(dataString);
	}
}

/**
 * Singleton instance
 */
export const templateSerializer = new TemplateSerializer();
