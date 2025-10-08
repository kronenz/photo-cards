import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import type { Template } from '$lib/types/template';

/**
 * POST /api/templates/[id]/download
 * Download a template and record the download
 * Maps to: template-api.yaml POST /collections/templates/records/{id}/download
 */
export const POST: RequestHandler = async ({ params, locals, request }) => {
	try {
		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		// Get template record
		const template = await pb.collection('templates').getOne<Template>(templateId, {
			expand: 'author,category'
		});

		// Check if template is published
		if (!template.is_published) {
			return json({ error: 'Template is not published' }, { status: 403 });
		}

		// Check copyright status
		if (template.copyright_status === 'rejected') {
			return json({ error: 'Template has been rejected due to copyright issues' }, { status: 403 });
		}

		// Check if premium and user has purchased (TODO: implement payment check)
		if (template.is_premium && template.price && template.price > 0) {
			// For now, return error - implement payment gateway in Phase 8
			return json(
				{ error: 'Premium templates require purchase (not yet implemented)' },
				{ status: 402 }
			);
		}

		// Increment view count
		await pb.collection('templates').update(templateId, {
			view_count: (template.view_count || 0) + 1
		});

		// Record download if user is authenticated
		if (locals.user) {
			try {
				await pb.collection('template_downloads').create({
					template: templateId,
					user: locals.user.id,
					source: 'marketplace',
					downloaded_at: new Date().toISOString()
				});

				// Increment download count
				await pb.collection('templates').update(templateId, {
					download_count: (template.download_count || 0) + 1
				});
			} catch (error) {
				// Log error but don't fail the download
				console.error('Failed to record download:', error);
			}
		}

		// Fetch template JSON from R2
		try {
			const storageResponse = await fetch(template.storage_url);

			if (!storageResponse.ok) {
				throw new Error(`Failed to fetch template from storage: ${storageResponse.status}`);
			}

			const templateJSON = await storageResponse.json();

			// Return template JSON with metadata
			return json({
				templateJSON,
				metadata: {
					id: template.id,
					template_id: template.template_id,
					version: template.version,
					title: template.title,
					author: template.expand?.author?.username || template.expand?.author?.name || '익명',
					license: template.license,
					is_remix: template.is_remix,
					allow_remix: template.allow_remix,
					downloaded_at: new Date().toISOString()
				}
			});
		} catch (fetchError) {
			console.error('Storage fetch error:', fetchError);
			return json({ error: 'Failed to download template file' }, { status: 500 });
		}
	} catch (error) {
		console.error('Download error:', error);

		// Handle PocketBase errors
		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };

			if (pbError.status === 404) {
				return json({ error: 'Template not found' }, { status: 404 });
			}

			return json(
				{ error: pbError.message || 'Download failed' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

/**
 * GET /api/templates/[id]/download
 * Get template download metadata (without incrementing download count)
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		// Get template record
		const template = await pb.collection('templates').getOne<Template>(templateId, {
			expand: 'author,category'
		});

		// Check if template is published
		if (!template.is_published) {
			return json({ error: 'Template is not published' }, { status: 403 });
		}

		// Return download metadata
		return json({
			id: template.id,
			template_id: template.template_id,
			version: template.version,
			title: template.title,
			description: template.description,
			author: template.expand?.author?.username || template.expand?.author?.name || '익명',
			thumbnail_url: template.thumbnail_url,
			file_size: template.file_size,
			license: template.license,
			is_premium: template.is_premium,
			price: template.price,
			currency: template.currency,
			download_count: template.download_count,
			rating_average: template.rating_average,
			rating_count: template.rating_count
		});
	} catch (error) {
		console.error('Download metadata error:', error);

		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };

			if (pbError.status === 404) {
				return json({ error: 'Template not found' }, { status: 404 });
			}

			return json(
				{ error: pbError.message || 'Failed to fetch metadata' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
