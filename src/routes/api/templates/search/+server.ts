import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

export const GET: RequestHandler = async ({ url }) => {
	try {
		const query = url.searchParams.get('q') || '';
		const category = url.searchParams.get('category') || '';
		const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];
		const minRating = parseFloat(url.searchParams.get('minRating') || '0');
		const teamFilter = url.searchParams.get('team') || '';
		const sort = url.searchParams.get('sort') || '-created';
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = parseInt(url.searchParams.get('perPage') || '20');

		// Build PocketBase filter - start with base published templates
		let filter = 'is_published=true && copyright_status="approved"';

		// Full-text search across title, description, tags
		if (query.trim()) {
			const escapedQuery = query.trim().replace(/"/g, '\\"');
			filter += ` && (title~"${escapedQuery}" || description~"${escapedQuery}" || tags~"${escapedQuery}")`;
		}

		// Category filter
		if (category) {
			filter += ` && category="${category}"`;
		}

		// Tags filter (must match all tags)
		if (tags.length > 0) {
			const tagFilters = tags
				.map((tag) => `tags~"${tag.trim().replace(/"/g, '\\"')}"`)
				.join(' && ');
			filter += ` && (${tagFilters})`;
		}

		// Rating filter
		if (minRating > 0) {
			filter += ` && rating_average>=${minRating}`;
		}

		// Team filter (search in tags for team name)
		if (teamFilter) {
			filter += ` && tags~"${teamFilter}"`;
		}

		// Execute search with pagination
		const result = await pb.collection('templates').getList(page, perPage, {
			filter,
			sort,
			expand: 'author,category'
		});

		return json({
			items: result.items,
			page: result.page,
			perPage: result.perPage,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
			query,
			filters: {
				category,
				tags,
				minRating,
				team: teamFilter
			}
		});
	} catch (error) {
		console.error('Search API error:', error);
		return json(
			{
				error: 'Failed to search templates',
				details: error instanceof Error ? error.message : 'Unknown error',
				items: [],
				page: 1,
				perPage: 20,
				totalItems: 0,
				totalPages: 0
			},
			{ status: 500 }
		);
	}
};
