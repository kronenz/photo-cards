/**
 * Template Storage Service
 *
 * Cloudflare R2 abstraction layer for template file operations.
 * Handles presigned URLs, uploads, downloads, and verification.
 *
 * @see research.md - Decision 1: Cloud Storage (Cloudflare R2)
 * @see contracts/storage-api.yaml
 */

import {
	PutObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	DeleteObjectCommand,
	type S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, PRESIGNED_URL_EXPIRY } from '$lib/server/r2';
import { createHash } from 'crypto';

export interface PresignedUrl {
	uploadUrl: string;
	storageUrl: string;
	expiresIn: number;
	uploadId: string;
}

export interface FileMetadata {
	key: string;
	size: number;
	contentType: string;
	etag: string;
	lastModified: Date;
	storageClass: string;
	publicUrl: string;
}

export class TemplateStorageService {
	constructor(private client: S3Client = r2Client) {}

	/**
	 * Generate presigned upload URL for client-side uploads
	 *
	 * @param filename - Template filename (e.g., 'tpl_lg_homerun_001.json')
	 * @param fileSize - File size in bytes (max 15MB)
	 * @param contentType - MIME type (default: 'application/json')
	 * @returns Presigned URL and storage information
	 */
	async generatePresignedUploadUrl(
		filename: string,
		fileSize: number,
		contentType: string = 'application/json'
	): Promise<PresignedUrl> {
		// Validate file size (15MB max)
		if (fileSize > 15 * 1024 * 1024) {
			throw new Error('File size exceeds 15MB limit');
		}

		// Generate unique upload ID
		const uploadId = this.generateUploadId();

		// S3 key: templates/{filename}
		const key = `templates/${filename}`;

		// Create PUT command
		const command = new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
			Metadata: {
				uploadId,
				uploadedAt: new Date().toISOString()
			}
		});

		// Generate presigned URL (1 hour expiry)
		const uploadUrl = await getSignedUrl(this.client, command, {
			expiresIn: PRESIGNED_URL_EXPIRY
		});

		// Public CDN URL
		const storageUrl = `${R2_PUBLIC_URL}/${key}`;

		return {
			uploadUrl,
			storageUrl,
			expiresIn: PRESIGNED_URL_EXPIRY,
			uploadId
		};
	}

	/**
	 * Verify upload completion and integrity
	 *
	 * @param storageUrl - Public storage URL
	 * @param expectedHash - Expected SHA-256 hash
	 * @returns true if upload verified
	 */
	async verifyUpload(storageUrl: string, expectedHash: string): Promise<boolean> {
		const key = this.extractKeyFromUrl(storageUrl);

		try {
			// Check if file exists
			const command = new HeadObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: key
			});

			const response = await this.client.send(command);

			// Verify file exists
			if (!response.ContentLength || response.ContentLength === 0) {
				return false;
			}

			// TODO: Verify hash (requires downloading file to calculate hash)
			// For now, just verify existence

			return true;
		} catch (error) {
			console.error('Upload verification failed:', error);
			return false;
		}
	}

	/**
	 * Get download URL for template
	 *
	 * @param templateId - Template ID
	 * @returns Public CDN URL
	 */
	async getDownloadUrl(templateId: string): Promise<string> {
		const key = `templates/${templateId}.json`;
		return `${R2_PUBLIC_URL}/${key}`;
	}

	/**
	 * Generate presigned download URL for premium templates
	 *
	 * @param templateId - Template ID
	 * @param expiresIn - URL expiry in seconds (default: 15 minutes)
	 * @returns Presigned download URL
	 */
	async generatePresignedDownloadUrl(
		templateId: string,
		expiresIn: number = 900
	): Promise<string> {
		const key = `templates/${templateId}.json`;

		const command = new GetObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key
		});

		return await getSignedUrl(this.client, command, { expiresIn });
	}

	/**
	 * Get file metadata from R2
	 *
	 * @param templateId - Template ID
	 * @returns File metadata
	 */
	async getFileMetadata(templateId: string): Promise<FileMetadata> {
		const key = `templates/${templateId}.json`;

		const command = new HeadObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key
		});

		const response = await this.client.send(command);

		return {
			key,
			size: response.ContentLength || 0,
			contentType: response.ContentType || 'application/json',
			etag: response.ETag || '',
			lastModified: response.LastModified || new Date(),
			storageClass: response.StorageClass || 'STANDARD',
			publicUrl: `${R2_PUBLIC_URL}/${key}`
		};
	}

	/**
	 * Delete file from R2
	 *
	 * @param templateId - Template ID
	 */
	async deleteFile(templateId: string): Promise<void> {
		const key = `templates/${templateId}.json`;

		const command = new DeleteObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key
		});

		await this.client.send(command);
	}

	/**
	 * Delete thumbnail from R2
	 *
	 * @param templateId - Template ID
	 */
	async deleteThumbnail(templateId: string): Promise<void> {
		const key = `thumbnails/${templateId}.webp`;

		const command = new DeleteObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key
		});

		await this.client.send(command);
	}

	/**
	 * Generate presigned URL for thumbnail upload
	 *
	 * @param templateId - Template ID
	 * @param contentType - Image MIME type
	 * @param fileSize - File size in bytes (max 2MB)
	 * @returns Presigned upload URL and thumbnail URL
	 */
	async generateThumbnailUploadUrl(
		templateId: string,
		contentType: string,
		fileSize: number
	): Promise<{ uploadUrl: string; thumbnailUrl: string; expiresIn: number }> {
		// Validate file size (2MB max for thumbnails)
		if (fileSize > 2 * 1024 * 1024) {
			throw new Error('Thumbnail size exceeds 2MB limit');
		}

		// Validate content type
		const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!validTypes.includes(contentType)) {
			throw new Error('Invalid thumbnail content type');
		}

		// Determine file extension
		const ext = contentType.split('/')[1];
		const key = `thumbnails/${templateId}.${ext}`;

		const command = new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			ContentType: contentType
		});

		const uploadUrl = await getSignedUrl(this.client, command, {
			expiresIn: PRESIGNED_URL_EXPIRY
		});

		const thumbnailUrl = `${R2_PUBLIC_URL}/${key}`;

		return {
			uploadUrl,
			thumbnailUrl,
			expiresIn: PRESIGNED_URL_EXPIRY
		};
	}

	// ========================================================================
	// Private Helper Methods
	// ========================================================================

	private generateUploadId(): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 10);
		return `upld_${timestamp}_${random}`;
	}

	private extractKeyFromUrl(url: string): string {
		// Extract key from public URL
		// Example: https://cdn.kbo-cards.com/templates/tpl_lg_homerun_001.json -> templates/tpl_lg_homerun_001.json
		const urlObj = new URL(url);
		return urlObj.pathname.substring(1); // Remove leading '/'
	}
}

/**
 * Singleton instance
 */
export const templateStorageService = new TemplateStorageService();
