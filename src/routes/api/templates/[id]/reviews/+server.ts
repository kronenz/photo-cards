import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import type { TemplateReview } from '$lib/types/template';

/**
 * POST /api/templates/[id]/reviews
 * Create a new review for a template
 * Maps to: review-api.yaml POST /collections/template_reviews/records
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		// Check authentication
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { rating, comment } = await request.json();

		// Validate rating
		if (!rating || rating < 1 || rating > 5) {
			return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
		}

		// Validate comment
		if (!comment || comment.trim().length < 10) {
			return json({ error: 'Comment must be at least 10 characters' }, { status: 400 });
		}

		if (comment.trim().length > 1000) {
			return json({ error: 'Comment must be less than 1000 characters' }, { status: 400 });
		}

		// Check if user already reviewed this template
		try {
			const existingReview = await pb.collection('template_reviews').getFirstListItem(
				`template="${templateId}" && user="${locals.user.id}"`
			);

			if (existingReview) {
				return json({ error: 'You have already reviewed this template' }, { status: 409 });
			}
		} catch (err) {
			// No existing review - continue
		}

		// Check if user downloaded the template (for verified purchase badge)
		let isVerifiedPurchase = false;
		try {
			await pb.collection('template_downloads').getFirstListItem(
				`template="${templateId}" && user="${locals.user.id}"`
			);
			isVerifiedPurchase = true;
		} catch (err) {
			// User hasn't downloaded - review is still allowed but not verified
		}

		// Create review
		const reviewData = {
			template: templateId,
			user: locals.user.id,
			rating,
			comment: comment.trim(),
			is_verified_purchase: isVerifiedPurchase,
			helpful_count: 0
		};

		const review = await pb.collection('template_reviews').create<TemplateReview>(reviewData, {
			expand: 'user'
		});

		// Rating aggregation will be handled by PocketBase hooks

		return json(review, { status: 201 });
	} catch (error) {
		console.error('Review creation error:', error);

		// Handle PocketBase errors
		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };
			return json(
				{ error: pbError.message || 'Failed to create review' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

/**
 * GET /api/templates/[id]/reviews
 * Get all reviews for a template
 */
export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		// Parse query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = parseInt(url.searchParams.get('perPage') || '20');
		const sort = url.searchParams.get('sort') || '-helpful_count,-created';
		const minRating = url.searchParams.get('minRating');

		// Build filter
		const filters: string[] = [`template="${templateId}"`];

		if (minRating) {
			filters.push(`rating >= ${minRating}`);
		}

		const filter = filters.join(' && ');

		// Fetch reviews from PocketBase
		const result = await pb.collection('template_reviews').getList<TemplateReview>(
			page,
			perPage,
			{
				filter,
				sort,
				expand: 'user'
			}
		);

		return json({
			items: result.items,
			page: result.page,
			perPage: result.perPage,
			totalItems: result.totalItems,
			totalPages: result.totalPages
		});
	} catch (error) {
		console.error('Reviews fetch error:', error);
		return json({ error: 'Failed to fetch reviews' }, { status: 500 });
	}
};

/**
 * DELETE /api/templates/[id]/reviews
 * Delete user's own review
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		// Check authentication
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Find user's review
		const review = await pb.collection('template_reviews').getFirstListItem(
			`template="${templateId}" && user="${locals.user.id}"`
		);

		// Delete review
		await pb.collection('template_reviews').delete(review.id);

		// Rating aggregation will be updated by PocketBase hooks

		return json({ success: true });
	} catch (error) {
		console.error('Review deletion error:', error);

		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };

			if (pbError.status === 404) {
				return json({ error: 'Review not found' }, { status: 404 });
			}

			return json(
				{ error: pbError.message || 'Failed to delete review' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
