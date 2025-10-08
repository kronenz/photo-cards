/**
 * API Route: Verify Upload
 *
 * Verifies that file was successfully uploaded to R2 and matches expected hash.
 *
 * @see contracts/storage-api.yaml - POST /storage/verify-upload
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { templateStorageService } from '$lib/services/templates/template-storage';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { uploadId, storageUrl, expectedHash } = body;

		// Validate required fields
		if (!uploadId || !storageUrl) {
			return json(
				{
					error: 'Missing required fields',
					details: 'uploadId and storageUrl are required'
				},
				{ status: 400 }
			);
		}

		// Validate storage URL format
		if (!storageUrl.startsWith('https://')) {
			return json(
				{
					error: 'Invalid storage URL',
					details: 'Storage URL must be HTTPS'
				},
				{ status: 400 }
			);
		}

		// Verify upload
		const verified = await templateStorageService.verifyUpload(storageUrl, expectedHash);

		if (!verified) {
			return json(
				{
					error: 'Upload verification failed',
					details: 'File not found or hash mismatch'
				},
				{ status: 400 }
			);
		}

		// Get file metadata
		try {
			const templateId = extractTemplateId(storageUrl);
			const metadata = await templateStorageService.getFileMetadata(templateId);

			return json(
				{
					verified: true,
					fileSize: metadata.size,
					storageUrl: metadata.publicUrl,
					contentType: metadata.contentType
				},
				{ status: 200 }
			);
		} catch (metadataError) {
			// Fallback if metadata fetch fails
			return json(
				{
					verified: true,
					storageUrl
				},
				{ status: 200 }
			);
		}
	} catch (error: any) {
		console.error('Verify upload error:', error);

		return json(
			{
				error: 'Internal server error',
				details: error.message
			},
			{ status: 500 }
		);
	}
};

/**
 * Extract template ID from storage URL
 *
 * @param url - Storage URL (e.g., https://cdn.kbo-cards.com/templates/tpl_abc123.json)
 * @returns Template ID (e.g., tpl_abc123)
 */
function extractTemplateId(url: string): string {
	const match = url.match(/templates\/(tpl_[a-z0-9_]+)\.json/);
	if (!match) {
		throw new Error('Invalid storage URL format');
	}
	return match[1];
}
