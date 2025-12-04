/**
 * MinIO Storage Service
 *
 * 서버 사이드에서만 사용 가능한 MinIO 클라이언트
 * 홀로그래픽 카드 이미지 업로드/다운로드를 처리합니다.
 */

import { Client } from 'minio';
import {
	MINIO_ENDPOINT,
	MINIO_ROOT_USER,
	MINIO_ROOT_PASSWORD,
	MINIO_BUCKET
} from '$env/static/private';

// MinIO 엔드포인트 파싱
function parseEndpoint(endpoint: string): { host: string; port: number; useSSL: boolean } {
	const url = new URL(endpoint);
	return {
		host: url.hostname,
		port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 9000),
		useSSL: url.protocol === 'https:'
	};
}

// MinIO 설정
const endpointConfig = parseEndpoint(MINIO_ENDPOINT || 'http://192.168.101.203:9000');

const minioConfig = {
	endPoint: endpointConfig.host,
	port: endpointConfig.port,
	useSSL: endpointConfig.useSSL,
	accessKey: MINIO_ROOT_USER || 'minioadmin',
	secretKey: MINIO_ROOT_PASSWORD || 'minioadmin123'
};

const BUCKET_NAME = MINIO_BUCKET || 'holographic-cards';

// MinIO 클라이언트 인스턴스 (싱글톤)
let minioClient: Client | null = null;

/**
 * MinIO 클라이언트 가져오기
 */
export function getMinioClient(): Client {
	if (!minioClient) {
		minioClient = new Client(minioConfig);
	}
	return minioClient;
}

/**
 * 버킷 존재 확인 및 생성
 */
export async function ensureBucket(): Promise<boolean> {
	const client = getMinioClient();

	try {
		const exists = await client.bucketExists(BUCKET_NAME);

		if (!exists) {
			await client.makeBucket(BUCKET_NAME, 'us-east-1');
			console.log(`Bucket '${BUCKET_NAME}' created successfully`);

			// 버킷 정책 설정 (공개 읽기)
			const policy = {
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: { AWS: ['*'] },
						Action: ['s3:GetObject'],
						Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
					}
				]
			};

			await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
			console.log(`Bucket policy set for '${BUCKET_NAME}'`);
		}

		return true;
	} catch (error) {
		console.error('Error ensuring bucket:', error);
		return false;
	}
}

/**
 * 파일 업로드 옵션
 */
export interface UploadOptions {
	/** 파일 데이터 (Buffer만 지원) */
	data: Buffer;
	/** 파일명 */
	filename: string;
	/** Content-Type */
	contentType: string;
	/** 저장 경로 (폴더) */
	folder?: string;
	/** 메타데이터 */
	metadata?: Record<string, string>;
}

/**
 * 업로드 결과
 */
export interface UploadResult {
	success: boolean;
	/** 객체 키 (전체 경로) */
	objectKey?: string;
	/** 공개 URL */
	url?: string;
	/** 에러 메시지 */
	error?: string;
	/** ETag */
	etag?: string;
}

/**
 * 파일 업로드
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
	const client = getMinioClient();

	try {
		// 버킷 확인
		await ensureBucket();

		// 객체 키 생성
		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const sanitizedFilename = options.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
		const objectKey = options.folder
			? `${options.folder}/${timestamp}-${randomSuffix}-${sanitizedFilename}`
			: `${timestamp}-${randomSuffix}-${sanitizedFilename}`;

		// 메타데이터 설정
		const metadata: Record<string, string> = {
			'Content-Type': options.contentType,
			...options.metadata
		};

		// 업로드 실행
		const result = await client.putObject(
			BUCKET_NAME,
			objectKey,
			options.data,
			options.data.length,
			metadata
		);

		// 공개 URL 생성
		const publicUrl = getPublicUrl(objectKey);

		return {
			success: true,
			objectKey,
			url: publicUrl,
			etag: result.etag
		};
	} catch (error) {
		console.error('Upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * 이미지 업로드 (Base64)
 */
export async function uploadImageBase64(
	base64Data: string,
	filename: string,
	folder: string = 'cards'
): Promise<UploadResult> {
	// Base64 데이터 파싱
	const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

	if (!matches || matches.length !== 3) {
		return {
			success: false,
			error: 'Invalid base64 image data'
		};
	}

	const contentType = matches[1];
	const buffer = Buffer.from(matches[2], 'base64');

	return uploadFile({
		data: buffer,
		filename,
		contentType,
		folder
	});
}

/**
 * 파일 삭제
 */
export async function deleteFile(objectKey: string): Promise<boolean> {
	const client = getMinioClient();

	try {
		await client.removeObject(BUCKET_NAME, objectKey);
		return true;
	} catch (error) {
		console.error('Delete error:', error);
		return false;
	}
}

/**
 * 여러 파일 삭제
 */
export async function deleteFiles(objectKeys: string[]): Promise<boolean> {
	const client = getMinioClient();

	try {
		await client.removeObjects(BUCKET_NAME, objectKeys);
		return true;
	} catch (error) {
		console.error('Delete multiple files error:', error);
		return false;
	}
}

/**
 * 파일 존재 확인
 */
export async function fileExists(objectKey: string): Promise<boolean> {
	const client = getMinioClient();

	try {
		await client.statObject(BUCKET_NAME, objectKey);
		return true;
	} catch {
		return false;
	}
}

/**
 * 파일 정보 가져오기
 */
export async function getFileInfo(objectKey: string): Promise<{
	size: number;
	contentType: string;
	lastModified: Date;
	etag: string;
} | null> {
	const client = getMinioClient();

	try {
		const stat = await client.statObject(BUCKET_NAME, objectKey);
		return {
			size: stat.size,
			contentType: stat.metaData['content-type'] || 'application/octet-stream',
			lastModified: stat.lastModified,
			etag: stat.etag
		};
	} catch {
		return null;
	}
}

/**
 * Presigned URL 생성 (임시 다운로드 링크)
 */
export async function getPresignedUrl(
	objectKey: string,
	expirySeconds: number = 3600
): Promise<string | null> {
	const client = getMinioClient();

	try {
		return await client.presignedGetObject(BUCKET_NAME, objectKey, expirySeconds);
	} catch (error) {
		console.error('Presigned URL error:', error);
		return null;
	}
}

/**
 * Presigned Upload URL 생성 (직접 업로드용)
 */
export async function getPresignedUploadUrl(
	objectKey: string,
	expirySeconds: number = 3600
): Promise<string | null> {
	const client = getMinioClient();

	try {
		return await client.presignedPutObject(BUCKET_NAME, objectKey, expirySeconds);
	} catch (error) {
		console.error('Presigned upload URL error:', error);
		return null;
	}
}

/**
 * 공개 URL 생성
 */
export function getPublicUrl(objectKey: string): string {
	const { host, port, useSSL } = endpointConfig;
	const protocol = useSSL ? 'https' : 'http';
	const portPart = (useSSL && port === 443) || (!useSSL && port === 80) ? '' : `:${port}`;
	return `${protocol}://${host}${portPart}/${BUCKET_NAME}/${objectKey}`;
}

/**
 * 폴더 내 파일 목록 가져오기
 */
export async function listFiles(
	prefix: string = '',
	recursive: boolean = true
): Promise<Array<{
	name: string;
	size: number;
	lastModified: Date;
}>> {
	const client = getMinioClient();
	const files: Array<{ name: string; size: number; lastModified: Date }> = [];

	return new Promise((resolve, reject) => {
		const stream = client.listObjects(BUCKET_NAME, prefix, recursive);

		stream.on('data', (obj) => {
			if (obj.name) {
				files.push({
					name: obj.name,
					size: obj.size,
					lastModified: obj.lastModified
				});
			}
		});

		stream.on('error', reject);
		stream.on('end', () => resolve(files));
	});
}

/**
 * 이미지 최적화 옵션
 */
export interface ImageOptimizeOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: 'jpeg' | 'png' | 'webp';
}

/**
 * 카드 이미지 업로드 (홀로그래픽 / 뒷면)
 */
export async function uploadCardImage(
	cardId: string,
	imageData: Buffer | string,
	type: 'front' | 'back' | 'thumbnail',
	originalFilename: string
): Promise<UploadResult> {
	const folder = `cards/${cardId}`;
	const filename = `${type}-${originalFilename}`;

	// Base64 문자열인 경우
	if (typeof imageData === 'string') {
		return uploadImageBase64(imageData, filename, folder);
	}

	// Buffer인 경우
	const contentType = getContentTypeFromFilename(originalFilename);
	return uploadFile({
		data: imageData,
		filename,
		contentType,
		folder
	});
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadProfileImage(
	userId: string,
	imageData: Buffer | string,
	originalFilename: string
): Promise<UploadResult> {
	const folder = `profiles/${userId}`;
	const filename = `avatar-${originalFilename}`;

	if (typeof imageData === 'string') {
		return uploadImageBase64(imageData, filename, folder);
	}

	const contentType = getContentTypeFromFilename(originalFilename);
	return uploadFile({
		data: imageData,
		filename,
		contentType,
		folder
	});
}

/**
 * 템플릿 미리보기 이미지 업로드
 */
export async function uploadTemplatePreview(
	templateId: string,
	imageData: Buffer | string,
	originalFilename: string
): Promise<UploadResult> {
	const folder = `templates/${templateId}`;
	const filename = `preview-${originalFilename}`;

	if (typeof imageData === 'string') {
		return uploadImageBase64(imageData, filename, folder);
	}

	const contentType = getContentTypeFromFilename(originalFilename);
	return uploadFile({
		data: imageData,
		filename,
		contentType,
		folder
	});
}

/**
 * 파일명에서 Content-Type 추출
 */
function getContentTypeFromFilename(filename: string): string {
	const ext = filename.toLowerCase().split('.').pop();

	const contentTypes: Record<string, string> = {
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'gif': 'image/gif',
		'webp': 'image/webp',
		'svg': 'image/svg+xml',
		'bmp': 'image/bmp',
		'ico': 'image/x-icon'
	};

	return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * MinIO 연결 테스트
 */
export async function testConnection(): Promise<{
	success: boolean;
	message: string;
	bucketExists?: boolean;
}> {
	try {
		const client = getMinioClient();
		const buckets = await client.listBuckets();
		const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

		return {
			success: true,
			message: `Connected to MinIO. Found ${buckets.length} bucket(s).`,
			bucketExists
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

export { BUCKET_NAME, minioConfig };
