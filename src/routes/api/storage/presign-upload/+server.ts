/**
 * API Route: Presigned Upload URL
 *
 * Generates presigned S3/R2 URL for client-side template uploads.
 *
 * @see contracts/storage-api.yaml - POST /storage/presign-upload
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { templateStorageService } from '$lib/services/templates/template-storage';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Validate authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { filename, fileSize, contentType, fileHash } = body;

		// Validate required fields
		if (!filename || !fileSize || !fileHash) {
			return json(
				{
					error: 'Missing required fields',
					details: 'filename, fileSize, and fileHash are required'
				},
				{ status: 400 }
			);
		}

		// Validate filename pattern (tpl_*.json)
		const filenameRegex = /^tpl_[a-z0-9_]+\.json$/;
		if (!filenameRegex.test(filename)) {
			return json(
				{
					error: 'Invalid filename',
					details: 'Filename must match pattern: tpl_[a-z0-9_]+.json'
				},
				{ status: 400 }
			);
		}

		// Validate file size (max 15MB)
		const maxSize = 15 * 1024 * 1024; // 15MB
		if (fileSize > maxSize) {
			return json(
				{
					error: 'File too large',
					details: `File size must not exceed ${maxSize} bytes (15MB)`
				},
				{ status: 400 }
			);
		}

		// Validate content type
		if (contentType && contentType !== 'application/json') {
			return json(
				{
					error: 'Invalid content type',
					details: 'Only application/json is supported for templates'
				},
				{ status: 400 }
			);
		}

		// Validate file hash format (sha256:...)
		const hashRegex = /^sha256:[a-f0-9]{64}$/;
		if (!hashRegex.test(fileHash)) {
			return json(
				{
					error: 'Invalid file hash',
					details: 'File hash must be in format: sha256:[64 hex chars]'
				},
				{ status: 400 }
			);
		}

		// Generate presigned upload URL
		const result = await templateStorageService.generatePresignedUploadUrl(
			filename,
			fileSize,
			contentType || 'application/json'
		);

		return json(
			{
				uploadUrl: result.uploadUrl,
				storageUrl: result.storageUrl,
				expiresIn: result.expiresIn,
				uploadId: result.uploadId
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error('Presign upload error:', error);

		return json(
			{
				error: 'Internal server error',
				details: error.message
			},
			{ status: 500 }
		);
	}
};
