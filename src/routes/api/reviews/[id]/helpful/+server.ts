import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';

/**
 * POST /api/reviews/[id]/helpful
 * Mark a review as helpful
 * Maps to: review-api.yaml POST /reviews/{id}/helpful
 */
export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const reviewId = params.id;

		if (!reviewId) {
			return json({ error: 'Review ID is required' }, { status: 400 });
		}

		// Get current review
		const review = await pb.collection('template_reviews').getOne(reviewId);

		// Increment helpful_count
		const newCount = (review.helpful_count || 0) + 1;

		// Update review
		await pb.collection('template_reviews').update(reviewId, {
			helpful_count: newCount
		});

		return json({ helpful_count: newCount });
	} catch (error) {
		console.error('Helpful vote error:', error);

		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };

			if (pbError.status === 404) {
				return json({ error: 'Review not found' }, { status: 404 });
			}

			return json(
				{ error: pbError.message || 'Failed to mark as helpful' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
