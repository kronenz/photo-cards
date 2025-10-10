import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import type { TemplateReview } from '$lib/types/template';

/**
 * GET /api/templates/[id]/rating
 * Get rating statistics for a template
 * Maps to: review-api.yaml GET /templates/{templateId}/rating
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		// Fetch all reviews for this template
		const reviews = await pb.collection('template_reviews').getFullList<TemplateReview>({
			filter: `template="${templateId}"`
		});

		// Calculate average rating
		const average =
			reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

		// Calculate distribution
		const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach((r) => {
			const rating = r.rating as 1 | 2 | 3 | 4 | 5;
			if (rating >= 1 && rating <= 5) {
				distribution[rating]++;
			}
		});

		// Calculate verified purchase percentage
		const verifiedCount = reviews.filter((r) => r.is_verified_purchase).length;
		const verifiedPercentage = reviews.length > 0 ? (verifiedCount / reviews.length) * 100 : 0;

		// Return statistics
		return json({
			average: Math.round(average * 10) / 10, // Round to 1 decimal
			count: reviews.length,
			distribution,
			verified_purchase_percentage: Math.round(verifiedPercentage * 10) / 10
		});
	} catch (error) {
		console.error('Rating stats error:', error);

		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };

			if (pbError.status === 404) {
				return json({ error: 'Template not found' }, { status: 404 });
			}

			return json(
				{ error: pbError.message || 'Failed to fetch rating stats' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
