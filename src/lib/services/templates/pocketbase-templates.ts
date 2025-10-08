/**
 * PocketBase Template Service
 *
 * CRUD operations for template marketplace collections.
 * Provides typed interface for PocketBase operations.
 */

import PocketBase from 'pocketbase';
import type {
	Template,
	TemplateReview,
	TemplateCategory,
	TemplateDownload,
	FlaggedUpload,
	TemplateCreateRequest
} from '$lib/types/template';

export class TemplatePocketBaseService {
	constructor(private pb: PocketBase) {}

	// ========================================================================
	// Templates Collection
	// ========================================================================

	/**
	 * Create new template record
	 */
	async createTemplate(data: TemplateCreateRequest): Promise<Template> {
		return await this.pb.collection('templates').create<Template>(data);
	}

	/**
	 * Get template by ID
	 */
	async getTemplate(id: string, expand?: string): Promise<Template> {
		return await this.pb.collection('templates').getOne<Template>(id, {
			expand: expand || 'author,category'
		});
	}

	/**
	 * List templates with filtering and sorting
	 */
	async listTemplates(options?: {
		filter?: string;
		sort?: string;
		expand?: string;
		page?: number;
		perPage?: number;
	}): Promise<{ items: Template[]; totalItems: number; totalPages: number }> {
		const result = await this.pb.collection('templates').getList<Template>(options?.page || 1, options?.perPage || 20, {
			filter: options?.filter,
			sort: options?.sort || '-created',
			expand: options?.expand || 'author,category'
		});

		return {
			items: result.items,
			totalItems: result.totalItems,
			totalPages: result.totalPages
		};
	}

	/**
	 * Update template
	 */
	async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
		return await this.pb.collection('templates').update<Template>(id, data);
	}

	/**
	 * Delete template
	 */
	async deleteTemplate(id: string): Promise<boolean> {
		return await this.pb.collection('templates').delete(id);
	}

	/**
	 * Increment download count
	 */
	async incrementDownloadCount(templateId: string): Promise<void> {
		const template = await this.getTemplate(templateId);
		await this.updateTemplate(templateId, {
			download_count: (template.download_count || 0) + 1
		});
	}

	/**
	 * Update rating statistics
	 */
	async updateRatingStats(templateId: string): Promise<void> {
		const reviews = await this.pb
			.collection('template_reviews')
			.getFullList<TemplateReview>({
				filter: `template="${templateId}"`
			});

		if (reviews.length === 0) {
			await this.updateTemplate(templateId, {
				rating_average: 0,
				rating_count: 0
			});
			return;
		}

		const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

		await this.updateTemplate(templateId, {
			rating_average: average,
			rating_count: reviews.length
		});
	}

	// ========================================================================
	// Template Reviews Collection
	// ========================================================================

	/**
	 * Create review
	 */
	async createReview(data: {
		template: string;
		user: string;
		rating: number;
		comment?: string;
		is_verified_purchase?: boolean;
	}): Promise<TemplateReview> {
		return await this.pb.collection('template_reviews').create<TemplateReview>(data);
	}

	/**
	 * Get reviews for template
	 */
	async getReviews(
		templateId: string,
		options?: {
			sort?: string;
			page?: number;
			perPage?: number;
		}
	): Promise<{ items: TemplateReview[]; totalItems: number }> {
		const result = await this.pb.collection('template_reviews').getList<TemplateReview>(
			options?.page || 1,
			options?.perPage || 10,
			{
				filter: `template="${templateId}"`,
				sort: options?.sort || '-helpful_count,-created',
				expand: 'user'
			}
		);

		return {
			items: result.items,
			totalItems: result.totalItems
		};
	}

	/**
	 * Update review
	 */
	async updateReview(
		reviewId: string,
		data: { rating?: number; comment?: string }
	): Promise<TemplateReview> {
		return await this.pb.collection('template_reviews').update<TemplateReview>(reviewId, data);
	}

	/**
	 * Delete review
	 */
	async deleteReview(reviewId: string): Promise<boolean> {
		return await this.pb.collection('template_reviews').delete(reviewId);
	}

	/**
	 * Increment helpful count
	 */
	async incrementHelpfulCount(reviewId: string): Promise<void> {
		const review = await this.pb.collection('template_reviews').getOne<TemplateReview>(reviewId);
		await this.pb.collection('template_reviews').update(reviewId, {
			helpful_count: (review.helpful_count || 0) + 1
		});
	}

	// ========================================================================
	// Template Categories Collection
	// ========================================================================

	/**
	 * Get all active categories
	 */
	async getCategories(): Promise<TemplateCategory[]> {
		return await this.pb.collection('template_categories').getFullList<TemplateCategory>({
			filter: 'is_active=true',
			sort: 'order',
			expand: 'parent'
		});
	}

	/**
	 * Get category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<TemplateCategory> {
		return await this.pb
			.collection('template_categories')
			.getFirstListItem<TemplateCategory>(`slug="${slug}"`);
	}

	// ========================================================================
	// Template Downloads Collection
	// ========================================================================

	/**
	 * Record template download
	 */
	async recordDownload(data: {
		template: string;
		user: string;
		source: string;
		ip_address?: string;
		user_agent?: string;
	}): Promise<TemplateDownload> {
		return await this.pb.collection('template_downloads').create<TemplateDownload>(data);
	}

	/**
	 * Get user's download history
	 */
	async getUserDownloads(userId: string): Promise<TemplateDownload[]> {
		return await this.pb.collection('template_downloads').getFullList<TemplateDownload>({
			filter: `user="${userId}"`,
			sort: '-created',
			expand: 'template'
		});
	}

	/**
	 * Check if user has downloaded template
	 */
	async hasUserDownloaded(userId: string, templateId: string): Promise<boolean> {
		try {
			await this.pb
				.collection('template_downloads')
				.getFirstListItem(`user="${userId}" && template="${templateId}"`);
			return true;
		} catch {
			return false;
		}
	}

	// ========================================================================
	// Flagged Uploads Collection
	// ========================================================================

	/**
	 * Create flagged upload record
	 */
	async flagUpload(data: {
		template: string;
		uploader: string;
		flag_reason: string;
		detection_metadata: any;
		status: string;
	}): Promise<FlaggedUpload> {
		return await this.pb.collection('flagged_uploads').create<FlaggedUpload>(data);
	}

	/**
	 * Get flagged uploads for review
	 */
	async getFlaggedUploads(status?: string): Promise<FlaggedUpload[]> {
		const filter = status ? `status="${status}"` : '';
		return await this.pb.collection('flagged_uploads').getFullList<FlaggedUpload>({
			filter,
			sort: '-created',
			expand: 'template,uploader'
		});
	}

	/**
	 * Update flagged upload status
	 */
	async updateFlaggedStatus(
		flagId: string,
		data: {
			status: string;
			reviewer?: string;
			reviewed_at?: string;
			review_notes?: string;
		}
	): Promise<FlaggedUpload> {
		return await this.pb.collection('flagged_uploads').update<FlaggedUpload>(flagId, data);
	}

	// ========================================================================
	// Search & Discovery
	// ========================================================================

	/**
	 * Search templates by keyword
	 */
	async searchTemplates(query: string, options?: {
		category?: string;
		tags?: string[];
		minRating?: number;
		page?: number;
		perPage?: number;
	}): Promise<{ items: Template[]; totalItems: number }> {
		let filter = `is_published=true && copyright_status="approved"`;

		// Add keyword search
		if (query) {
			filter += ` && (title~"${query}" || description~"${query}" || tags~"${query}")`;
		}

		// Add category filter
		if (options?.category) {
			filter += ` && category="${options.category}"`;
		}

		// Add rating filter
		if (options?.minRating) {
			filter += ` && rating_average>=${options.minRating}`;
		}

		const result = await this.pb.collection('templates').getList<Template>(
			options?.page || 1,
			options?.perPage || 20,
			{
				filter,
				sort: '-download_count,-rating_average',
				expand: 'author,category'
			}
		);

		return {
			items: result.items,
			totalItems: result.totalItems
		};
	}
}

/**
 * Create service instance
 * Usage: const service = createTemplatePBService(pb);
 */
export function createTemplatePBService(pb: PocketBase): TemplatePocketBaseService {
	return new TemplatePocketBaseService(pb);
}
