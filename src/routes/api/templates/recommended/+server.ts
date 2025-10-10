import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// If user not logged in, return popular templates
		if (!locals?.user) {
			return await getFallbackTemplates();
		}

		// Get user's download history
		const downloads = await pb.collection('template_downloads').getFullList({
			filter: `user="${locals.user.id}"`,
			fields: 'template',
			sort: '-created'
		});

		// If no download history, return popular templates
		if (downloads.length === 0) {
			return await getFallbackTemplates();
		}

		const downloadedIds = downloads.map((d) => d.template);

		// Collaborative filtering: Find templates downloaded by similar users
		// Users who downloaded the same templates as current user
		const similarUsersDownloads = await pb.collection('template_downloads').getFullList({
			filter: downloadedIds.map((id) => `template="${id}"`).join(' || '),
			fields: 'user,template',
			$autoCancel: false
		});

		// Get unique user IDs (excluding current user)
		const similarUserIds = [
			...new Set(similarUsersDownloads.map((d) => d.user).filter((id) => id !== locals.user.id))
		];

		if (similarUserIds.length === 0) {
			return await getFallbackTemplates();
		}

		// Get all templates downloaded by similar users
		const similarUsersAllDownloads = await pb.collection('template_downloads').getFullList({
			filter: similarUserIds.map((id) => `user="${id}"`).join(' || '),
			fields: 'template',
			$autoCancel: false
		});

		// Count frequency of each template (excluding already downloaded)
		const templateCounts: Record<string, number> = {};
		for (const download of similarUsersAllDownloads) {
			if (!downloadedIds.includes(download.template)) {
				templateCounts[download.template] = (templateCounts[download.template] || 0) + 1;
			}
		}

		// Sort by frequency and get top 10 template IDs
		const recommendedIds = Object.entries(templateCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)
			.map(([id]) => id);

		if (recommendedIds.length === 0) {
			return await getFallbackTemplates();
		}

		// Fetch full template details
		const recommended = await pb.collection('templates').getFullList({
			filter: recommendedIds.map((id) => `id="${id}"`).join(' || '),
			expand: 'author,category',
			sort: '-rating_average,-download_count'
		});

		return json({
			items: recommended,
			algorithm: 'collaborative_filtering',
			based_on: downloads.length
		});
	} catch (error) {
		console.error('Recommendation API error:', error);
		// Fallback to popular templates on error
		return await getFallbackTemplates();
	}
};

async function getFallbackTemplates() {
	try {
		// Return popular templates as fallback
		const popular = await pb.collection('templates').getList(1, 10, {
			filter: 'is_published=true && copyright_status="approved"',
			sort: '-download_count,-rating_average',
			expand: 'author,category'
		});

		return json({
			items: popular.items,
			algorithm: 'popular_fallback',
			based_on: 0
		});
	} catch (error) {
		console.error('Fallback templates error:', error);
		return json({
			items: [],
			algorithm: 'error_fallback',
			based_on: 0
		});
	}
}
