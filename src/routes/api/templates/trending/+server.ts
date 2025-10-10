import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

export const GET: RequestHandler = async ({ url }) => {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const days = parseInt(url.searchParams.get('days') || '7'); // Last 7 days

		// Calculate date threshold
		const dateThreshold = new Date();
		dateThreshold.setDate(dateThreshold.getDate() - days);
		const dateStr = dateThreshold.toISOString();

		// Get recent downloads (last N days)
		const recentDownloads = await pb.collection('template_downloads').getFullList({
			filter: `created>="${dateStr}"`,
			fields: 'template',
			$autoCancel: false
		});

		// Count downloads per template
		const downloadCounts: Record<string, number> = {};
		for (const download of recentDownloads) {
			downloadCounts[download.template] = (downloadCounts[download.template] || 0) + 1;
		}

		// Get trending template IDs (most downloads in recent period)
		const trendingIds = Object.entries(downloadCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, limit)
			.map(([id]) => id);

		if (trendingIds.length === 0) {
			// Fallback to recently published popular templates
			const fallback = await pb.collection('templates').getList(1, limit, {
				filter: 'is_published=true && copyright_status="approved"',
				sort: '-created,-download_count',
				expand: 'author,category'
			});

			return json({
				items: fallback.items,
				algorithm: 'recent_popular_fallback',
				period_days: days
			});
		}

		// Fetch full template details
		const trending = await pb.collection('templates').getFullList({
			filter: trendingIds.map((id) => `id="${id}"`).join(' || '),
			expand: 'author,category'
		});

		// Sort by download count in the period (maintain trending order)
		const sortedTrending = trendingIds
			.map((id) => trending.find((t) => t.id === id))
			.filter(Boolean);

		// Calculate trending metrics
		const trendingWithMetrics = sortedTrending.map((template, index) => {
			const recentDownloadCount = downloadCounts[template!.id] || 0;
			const totalDownloads = template!.download_count || 0;
			const trendingScore =
				totalDownloads > 0 ? (recentDownloadCount / totalDownloads) * 100 : 100;

			return {
				...template,
				trending_metrics: {
					recent_downloads: recentDownloadCount,
					trending_score: Math.round(trendingScore * 10) / 10,
					rank: index + 1
				}
			};
		});

		return json({
			items: trendingWithMetrics,
			algorithm: 'recent_download_count',
			period_days: days,
			total_trending: trendingWithMetrics.length
		});
	} catch (error) {
		console.error('Trending API error:', error);
		return json(
			{
				error: 'Failed to get trending templates',
				details: error instanceof Error ? error.message : 'Unknown error',
				items: [],
				algorithm: 'error',
				period_days: 7
			},
			{ status: 500 }
		);
	}
};
