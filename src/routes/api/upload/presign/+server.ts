/**
 * API Route: Presigned Upload URL
 * Feature: 004-production-service-integration
 *
 * MinIO presigned URL을 생성하여 클라이언트가 직접 업로드할 수 있도록 합니다.
 * 대용량 파일 업로드 시 서버 부하를 줄이는 데 유용합니다.
 *
 * Authentication required: Yes
 * Max file size: 10MB
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getPresignedUploadUrl,
	ensureBucket,
	getPublicUrl,
	BUCKET_NAME
} from '$lib/server/minio';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, '로그인이 필요합니다.');
	}

	try {
		const body = await request.json();
		const { filename, folder, contentType, expiresIn = 3600, fileSize } = body;

		// Validate file size
		if (fileSize && fileSize > MAX_FILE_SIZE) {
			return json({ error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 });
		}

		// 필수 필드 검증
		if (!filename) {
			return json({ error: 'Filename is required' }, { status: 400 });
		}

		// 허용된 Content-Type 검증
		const allowedTypes = [
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml'
		];

		if (contentType && !allowedTypes.includes(contentType)) {
			return json(
				{
					error: 'Invalid content type',
					details: `Allowed types: ${allowedTypes.join(', ')}`
				},
				{ status: 400 }
			);
		}

		// 만료 시간 검증 (최소 5분, 최대 7일)
		const minExpiry = 300; // 5분
		const maxExpiry = 604800; // 7일
		const validExpiry = Math.max(minExpiry, Math.min(maxExpiry, expiresIn));

		// 버킷 확인
		await ensureBucket();

		// 객체 키 생성
		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
		const objectKey = folder
			? `${folder}/${timestamp}-${randomSuffix}-${sanitizedFilename}`
			: `${timestamp}-${randomSuffix}-${sanitizedFilename}`;

		// Presigned URL 생성
		const uploadUrl = await getPresignedUploadUrl(objectKey, validExpiry);

		if (!uploadUrl) {
			return json({ error: 'Failed to generate presigned URL' }, { status: 500 });
		}

		// 업로드 완료 후 접근할 공개 URL
		const publicUrl = getPublicUrl(objectKey);

		return json({
			success: true,
			uploadUrl,
			publicUrl,
			objectKey,
			bucket: BUCKET_NAME,
			expiresIn: validExpiry
		});
	} catch (error) {
		console.error('Presign URL generation error:', error);
		return json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
