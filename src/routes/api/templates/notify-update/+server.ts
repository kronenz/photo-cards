import { json } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';
import type { RequestHandler } from './$types';

/**
 * POST /api/templates/notify-update
 *
 * Notifies all users who downloaded a template about a new version
 *
 * @see US4 Scenario 2: Notify existing downloaders
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { templateId } = await request.json();

		if (!templateId) {
			return json({ error: 'Template ID required' }, { status: 400 });
		}

		// Get template info
		const template = await pb.collection('templates').getOne(templateId, {
			expand: 'author'
		});

		// Get all unique users who downloaded this template
		const downloads = await pb.collection('template_downloads').getFullList({
			filter: `template="${templateId}"`,
			fields: 'user'
		});

		const uniqueUserIds = [...new Set(downloads.map((d) => d.user))];

		// Create notifications for each user
		let notifiedCount = 0;

		for (const userId of uniqueUserIds) {
			try {
				await pb.collection('notifications').create({
					user: userId,
					type: 'template_update',
					title: 'Template Update Available',
					message: `${template.title} has a new version available`,
					link: `/marketplace/${templateId}`,
					read: false,
					metadata: {
						template_id: templateId,
						template_title: template.title,
						new_version: template.version
					}
				});
				notifiedCount++;
			} catch (error) {
				console.error(`Failed to notify user ${userId}:`, error);
			}
		}

		return json({
			success: true,
			notified: notifiedCount,
			totalDownloaders: uniqueUserIds.length
		});
	} catch (error: any) {
		console.error('Notification error:', error);
		return json(
			{
				error: error.message || 'Failed to send notifications'
			},
			{ status: 500 }
		);
	}
};
