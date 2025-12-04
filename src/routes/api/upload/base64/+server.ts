/**
 * API Route: Base64 Image Upload
 *
 * Base64 인코딩된 이미지를 MinIO에 업로드합니다.
 * 캔버스에서 생성된 이미지나 클라이언트에서 처리된 이미지에 유용합니다.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	uploadImageBase64,
	uploadCardImage,
	uploadProfileImage,
	uploadTemplatePreview
} from '$lib/server/minio';

// 최대 Base64 데이터 크기 (약 13MB - 인코딩 오버헤드 포함)
const MAX_BASE64_SIZE = 13 * 1024 * 1024;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { data, filename, type, targetId, folder } = body;

		// 필수 필드 검증
		if (!data) {
			return json({ error: 'No image data provided' }, { status: 400 });
		}

		if (!filename) {
			return json({ error: 'Filename is required' }, { status: 400 });
		}

		// Base64 데이터 형식 검증
		if (!data.startsWith('data:image/')) {
			return json(
				{
					error: 'Invalid base64 format',
					details: 'Data must be a valid base64-encoded image with data URI prefix'
				},
				{ status: 400 }
			);
		}

		// 크기 검증
		if (data.length > MAX_BASE64_SIZE) {
			return json(
				{
					error: 'Image data too large',
					details: `Maximum size: ${Math.floor(MAX_BASE64_SIZE / 1024 / 1024)}MB`
				},
				{ status: 400 }
			);
		}

		let result;

		// 업로드 타입에 따라 처리
		switch (type) {
			case 'card-front':
				if (!targetId) {
					return json({ error: 'targetId (cardId) is required' }, { status: 400 });
				}
				result = await uploadCardImage(targetId, data, 'front', filename);
				break;

			case 'card-back':
				if (!targetId) {
					return json({ error: 'targetId (cardId) is required' }, { status: 400 });
				}
				result = await uploadCardImage(targetId, data, 'back', filename);
				break;

			case 'card-thumbnail':
				if (!targetId) {
					return json({ error: 'targetId (cardId) is required' }, { status: 400 });
				}
				result = await uploadCardImage(targetId, data, 'thumbnail', filename);
				break;

			case 'profile':
				if (!targetId) {
					return json({ error: 'targetId (userId) is required' }, { status: 400 });
				}
				result = await uploadProfileImage(targetId, data, filename);
				break;

			case 'template':
				if (!targetId) {
					return json({ error: 'targetId (templateId) is required' }, { status: 400 });
				}
				result = await uploadTemplatePreview(targetId, data, filename);
				break;

			default:
				// 일반 업로드
				result = await uploadImageBase64(data, filename, folder || 'uploads');
		}

		if (!result.success) {
			return json({ error: result.error || 'Upload failed' }, { status: 500 });
		}

		return json({
			success: true,
			url: result.url,
			objectKey: result.objectKey,
			etag: result.etag
		});
	} catch (error) {
		console.error('Base64 upload error:', error);
		return json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
