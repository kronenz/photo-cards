import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import type { Template } from '$lib/types/template';

/**
 * POST /api/templates
 * Create a new template record
 * Maps to: template-api.yaml POST /collections/templates/records
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Validate authentication
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const data = await request.json();

		// Validate required fields
		const requiredFields = [
			'template_id',
			'version',
			'template_version',
			'title',
			'description',
			'category',
			'storage_url',
			'thumbnail_url',
			'file_size',
			'file_hash',
			'license'
		];

		for (const field of requiredFields) {
			if (!data[field]) {
				return json({ error: `Missing required field: ${field}` }, { status: 400 });
			}
		}

		// Validate title length (3-100 chars)
		if (data.title.length < 3 || data.title.length > 100) {
			return json({ error: 'Title must be 3-100 characters' }, { status: 400 });
		}

		// Validate description length (10-1000 chars)
		if (data.description.length < 10 || data.description.length > 1000) {
			return json({ error: 'Description must be 10-1000 characters' }, { status: 400 });
		}

		// Validate file size (max 15MB)
		if (data.file_size > 15 * 1024 * 1024) {
			return json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
		}

		// Prepare template data
		const templateData = {
			template_id: data.template_id,
			version: data.version,
			template_version: data.template_version,
			title: data.title.trim(),
			description: data.description.trim(),
			author: locals.user.id, // Set author from authenticated user
			category: data.category,
			tags: data.tags || [],
			storage_url: data.storage_url,
			thumbnail_url: data.thumbnail_url,
			file_size: data.file_size,
			file_hash: data.file_hash,
			license: data.license,
			allow_remix: data.allow_remix ?? true,
			is_remix: data.is_remix ?? false,
			original_template_id: data.original_template_id || null,
			is_premium: data.is_premium ?? false,
			price: data.price || null,
			currency: data.currency || null,
			copyright_status: data.copyright_status || 'pending',
			copyright_check_metadata: data.copyright_check_metadata || null,
			is_published: data.is_published ?? true,
			published_at: data.is_published ? new Date().toISOString() : null,
			featured: false,
			rating_average: 0,
			rating_count: 0,
			download_count: 0,
			view_count: 0,
			metadata: data.metadata || {}
		};

		// Create template in PocketBase
		const template = await pb.collection('templates').create<Template>(templateData);

		// TODO: Trigger async copyright check (Cloudflare AI)
		// This would be implemented in a separate background job

		return json(template, { status: 201 });
	} catch (error) {
		console.error('Template creation error:', error);

		// Handle PocketBase validation errors
		if (error && typeof error === 'object' && 'status' in error) {
			const pbError = error as { status: number; message: string };
			return json(
				{ error: pbError.message || 'Template creation failed' },
				{ status: pbError.status || 500 }
			);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

/**
 * GET /api/templates
 * List templates with pagination and filtering
 * Maps to: template-api.yaml GET /collections/templates/records
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = parseInt(url.searchParams.get('perPage') || '20');
		const category = url.searchParams.get('category');
		const tag = url.searchParams.get('tag');
		const search = url.searchParams.get('search');
		const sort = url.searchParams.get('sort') || '-created'; // Default: newest first
		const expand = url.searchParams.get('expand') || 'author,category';

		// Build filter
		const filters: string[] = ['is_published = true', 'copyright_status != "rejected"'];

		if (category) {
			filters.push(`category = "${category}"`);
		}

		if (tag) {
			filters.push(`tags ~ "${tag}"`);
		}

		if (search) {
			filters.push(
				`(title ~ "${search}" || description ~ "${search}" || tags ~ "${search}")`
			);
		}

		const filter = filters.join(' && ');

		// Fetch templates from PocketBase
		const result = await pb.collection('templates').getList<Template>(page, perPage, {
			filter,
			sort,
			expand
		});

		return json({
			items: result.items,
			page: result.page,
			perPage: result.perPage,
			totalItems: result.totalItems,
			totalPages: result.totalPages
		});
	} catch (error) {
		console.error('Template list error:', error);
		return json({ error: 'Failed to fetch templates' }, { status: 500 });
	}
};
