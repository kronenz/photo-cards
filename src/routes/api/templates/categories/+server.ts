import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import type { TemplateCategory } from '$lib/types/template';

/**
 * GET /api/templates/categories
 * Get all template categories
 */
export const GET: RequestHandler = async () => {
	try {
		const categories = await pb
			.collection('template_categories')
			.getFullList<TemplateCategory>({
				sort: 'name'
			});

		return json(categories);
	} catch (error) {
		console.error('Categories fetch error:', error);
		return json({ error: 'Failed to fetch categories' }, { status: 500 });
	}
};
