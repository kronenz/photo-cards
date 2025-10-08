import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TemplateStorageService } from '../../src/lib/services/templates/template-storage';

describe('R2 Storage Integration', () => {
	const storageService = new TemplateStorageService();
	let testUploadId: string;
	let testStorageUrl: string;
	let testFileHash: string;

	// Skip tests if R2 credentials are not configured
	const isR2Configured =
		process.env.R2_ACCOUNT_ID &&
		process.env.R2_ACCESS_KEY_ID &&
		process.env.R2_SECRET_ACCESS_KEY;

	describe('generatePresignedUploadUrl', () => {
		it('should generate presigned upload URL', async () => {
			if (!isR2Configured) {
				console.log('Skipping R2 test - credentials not configured');
				return;
			}

			const filename = `test_template_${Date.now()}.json`;
			const fileSize = 1024; // 1KB

			const result = await storageService.generatePresignedUploadUrl(
				filename,
				fileSize,
				'application/json'
			);

			expect(result).toBeDefined();
			expect(result.uploadUrl).toBeDefined();
			expect(result.storageUrl).toBeDefined();
			expect(result.uploadId).toBeDefined();
			expect(result.expiresIn).toBe(3600);

			testUploadId = result.uploadId;
			testStorageUrl = result.storageUrl;
		});

		it('should reject files larger than 15MB', async () => {
			if (!isR2Configured) return;

			const filename = `large_template_${Date.now()}.json`;
			const fileSize = 16 * 1024 * 1024; // 16MB

			await expect(
				storageService.generatePresignedUploadUrl(filename, fileSize, 'application/json')
			).rejects.toThrow();
		});

		it('should generate different URLs for different files', async () => {
			if (!isR2Configured) return;

			const result1 = await storageService.generatePresignedUploadUrl(
				`test1_${Date.now()}.json`,
				1024,
				'application/json'
			);

			const result2 = await storageService.generatePresignedUploadUrl(
				`test2_${Date.now()}.json`,
				1024,
				'application/json'
			);

			expect(result1.uploadUrl).not.toBe(result2.uploadUrl);
			expect(result1.storageUrl).not.toBe(result2.storageUrl);
		});
	});

	describe('upload and verify workflow', () => {
		it('should upload file and verify', async () => {
			if (!isR2Configured) {
				console.log('Skipping R2 upload test - credentials not configured');
				return;
			}

			// Generate presigned URL
			const filename = `integration_test_${Date.now()}.json`;
			const testData = {
				test: true,
				message: 'Integration test template',
				timestamp: Date.now()
			};
			const jsonString = JSON.stringify(testData);
			const fileSize = new Blob([jsonString]).size;

			const { uploadUrl, storageUrl, uploadId } =
				await storageService.generatePresignedUploadUrl(filename, fileSize, 'application/json');

			// Upload file
			const uploadResponse = await fetch(uploadUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: jsonString
			});

			expect(uploadResponse.ok).toBe(true);

			// Calculate hash
			const encoder = new TextEncoder();
			const data = encoder.encode(jsonString);
			const hashBuffer = await crypto.subtle.digest('SHA-256', data);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
			testFileHash = `sha256:${hashHex}`;

			// Verify upload
			const verified = await storageService.verifyUpload(storageUrl, testFileHash);
			expect(verified).toBe(true);

			// Store for cleanup
			testStorageUrl = storageUrl;
		});

		it('should fail verification with wrong hash', async () => {
			if (!isR2Configured || !testStorageUrl) return;

			const wrongHash = 'sha256:0000000000000000000000000000000000000000000000000000000000000000';
			const verified = await storageService.verifyUpload(testStorageUrl, wrongHash);
			expect(verified).toBe(false);
		});
	});

	describe('getDownloadUrl', () => {
		it('should generate download URL', async () => {
			if (!isR2Configured || !testStorageUrl) return;

			const templateId = testStorageUrl.split('/').pop()?.replace('.json', '') || '';
			const downloadUrl = await storageService.getDownloadUrl(templateId);

			expect(downloadUrl).toBeDefined();
			expect(downloadUrl).toContain(templateId);
		});

		it('should generate presigned download URL for premium templates', async () => {
			if (!isR2Configured || !testStorageUrl) return;

			const templateId = testStorageUrl.split('/').pop()?.replace('.json', '') || '';
			const presignedUrl = await storageService.generatePresignedDownloadUrl(templateId, 900);

			expect(presignedUrl).toBeDefined();
			expect(presignedUrl).toContain('X-Amz-Signature');
		});
	});

	describe('deleteFile', () => {
		it('should delete file from R2', async () => {
			if (!isR2Configured || !testStorageUrl) return;

			const templateId = testStorageUrl.split('/').pop()?.replace('.json', '') || '';

			// Delete file
			await storageService.deleteFile(templateId);

			// Verify deletion
			const verified = await storageService.verifyUpload(testStorageUrl, testFileHash);
			expect(verified).toBe(false);
		});
	});

	describe('error handling', () => {
		it('should handle network errors gracefully', async () => {
			if (!isR2Configured) return;

			// Try to verify non-existent file
			const fakeUrl = 'https://fake-bucket.r2.cloudflarestorage.com/nonexistent.json';
			const verified = await storageService.verifyUpload(fakeUrl, 'sha256:fake');
			expect(verified).toBe(false);
		});

		it('should handle invalid file sizes', async () => {
			await expect(
				storageService.generatePresignedUploadUrl('test.json', -1, 'application/json')
			).rejects.toThrow();

			await expect(
				storageService.generatePresignedUploadUrl('test.json', 0, 'application/json')
			).rejects.toThrow();
		});
	});

	describe('performance', () => {
		it('should generate presigned URL in < 500ms', async () => {
			if (!isR2Configured) return;

			const startTime = performance.now();

			await storageService.generatePresignedUploadUrl(
				`perf_test_${Date.now()}.json`,
				1024,
				'application/json'
			);

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(duration).toBeLessThan(500);
		});

		it('should handle concurrent upload URL generation', async () => {
			if (!isR2Configured) return;

			const promises = Array.from({ length: 5 }, (_, i) =>
				storageService.generatePresignedUploadUrl(
					`concurrent_test_${i}_${Date.now()}.json`,
					1024,
					'application/json'
				)
			);

			const results = await Promise.all(promises);

			expect(results).toHaveLength(5);
			results.forEach((result) => {
				expect(result.uploadUrl).toBeDefined();
				expect(result.storageUrl).toBeDefined();
			});

			// All URLs should be unique
			const uploadUrls = results.map((r) => r.uploadUrl);
			const uniqueUrls = new Set(uploadUrls);
			expect(uniqueUrls.size).toBe(5);
		});
	});
});
