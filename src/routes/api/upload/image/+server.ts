/**
 * API Route: Image Upload
 *
 * 이미지 파일을 MinIO에 업로드합니다.
 * 카드 이미지, 프로필 이미지, 템플릿 미리보기 등을 처리합니다.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	uploadFile,
	uploadCardImage,
	uploadProfileImage,
	uploadTemplatePreview,
	getPublicUrl
} from '$lib/server/minio';

// 허용된 이미지 MIME 타입
const ALLOWED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp'
];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const type = formData.get('type') as string | null; // 'card-front', 'card-back', 'profile', 'template'
		const targetId = formData.get('targetId') as string | null; // cardId, userId, templateId
		const imageType = formData.get('imageType') as string | null; // 'front', 'back', 'thumbnail' for cards

		// 파일 검증
		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return json(
				{
					error: 'Invalid file type',
					details: `Allowed types: ${ALLOWED_TYPES.join(', ')}`
				},
				{ status: 400 }
			);
		}

		if (file.size > MAX_FILE_SIZE) {
			return json(
				{
					error: 'File too large',
					details: `Maximum file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
				},
				{ status: 400 }
			);
		}

		// 파일 데이터를 Buffer로 변환
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		let result;

		// 업로드 타입에 따라 처리
		switch (type) {
			case 'card-front':
			case 'card-back':
			case 'card-thumbnail':
				if (!targetId) {
					return json({ error: 'targetId (cardId) is required for card images' }, { status: 400 });
				}
				const cardImageType = type === 'card-front' ? 'front' : type === 'card-back' ? 'back' : 'thumbnail';
				result = await uploadCardImage(targetId, buffer, cardImageType, file.name);
				break;

			case 'profile':
				if (!targetId) {
					return json({ error: 'targetId (userId) is required for profile images' }, { status: 400 });
				}
				result = await uploadProfileImage(targetId, buffer, file.name);
				break;

			case 'template':
				if (!targetId) {
					return json({ error: 'targetId (templateId) is required for template images' }, { status: 400 });
				}
				result = await uploadTemplatePreview(targetId, buffer, file.name);
				break;

			default:
				// 일반 업로드 (폴더 지정 가능)
				const folder = formData.get('folder') as string || 'uploads';
				result = await uploadFile({
					data: buffer,
					filename: file.name,
					contentType: file.type,
					folder
				});
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
		console.error('Image upload error:', error);
		return json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
