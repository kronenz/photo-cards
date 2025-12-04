/**
 * Upload Service
 *
 * 클라이언트에서 MinIO에 이미지를 업로드하는 서비스
 */

export interface UploadResponse {
	success: boolean;
	url?: string;
	objectKey?: string;
	etag?: string;
	error?: string;
}

export interface PresignedUploadResponse {
	success: boolean;
	uploadUrl?: string;
	publicUrl?: string;
	objectKey?: string;
	bucket?: string;
	expiresIn?: number;
	error?: string;
}

/**
 * 이미지 파일 업로드 (FormData)
 */
export async function uploadImage(
	file: File,
	options: {
		type?: 'card-front' | 'card-back' | 'card-thumbnail' | 'profile' | 'template';
		targetId?: string;
		folder?: string;
	} = {}
): Promise<UploadResponse> {
	try {
		const formData = new FormData();
		formData.append('file', file);

		if (options.type) {
			formData.append('type', options.type);
		}
		if (options.targetId) {
			formData.append('targetId', options.targetId);
		}
		if (options.folder) {
			formData.append('folder', options.folder);
		}

		const response = await fetch('/api/upload/image', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: result.error || 'Upload failed'
			};
		}

		return {
			success: true,
			url: result.url,
			objectKey: result.objectKey,
			etag: result.etag
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Base64 이미지 업로드
 */
export async function uploadBase64Image(
	base64Data: string,
	filename: string,
	options: {
		type?: 'card-front' | 'card-back' | 'card-thumbnail' | 'profile' | 'template';
		targetId?: string;
		folder?: string;
	} = {}
): Promise<UploadResponse> {
	try {
		const response = await fetch('/api/upload/base64', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: base64Data,
				filename,
				...options
			})
		});

		const result = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: result.error || 'Upload failed'
			};
		}

		return {
			success: true,
			url: result.url,
			objectKey: result.objectKey,
			etag: result.etag
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Presigned URL을 사용한 직접 업로드
 */
export async function getPresignedUploadUrl(
	filename: string,
	options: {
		folder?: string;
		contentType?: string;
		expiresIn?: number;
	} = {}
): Promise<PresignedUploadResponse> {
	try {
		const response = await fetch('/api/upload/presign', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				filename,
				...options
			})
		});

		const result = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: result.error || 'Failed to get presigned URL'
			};
		}

		return {
			success: true,
			uploadUrl: result.uploadUrl,
			publicUrl: result.publicUrl,
			objectKey: result.objectKey,
			bucket: result.bucket,
			expiresIn: result.expiresIn
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Presigned URL로 파일 직접 업로드
 */
export async function uploadToPresignedUrl(
	uploadUrl: string,
	file: File
): Promise<boolean> {
	try {
		const response = await fetch(uploadUrl, {
			method: 'PUT',
			body: file,
			headers: {
				'Content-Type': file.type
			}
		});

		return response.ok;
	} catch (error) {
		console.error('Direct upload error:', error);
		return false;
	}
}

/**
 * 카드 이미지 업로드 (앞면)
 */
export async function uploadCardFrontImage(
	cardId: string,
	file: File | string // File 또는 Base64
): Promise<UploadResponse> {
	if (typeof file === 'string') {
		return uploadBase64Image(file, `card-front-${Date.now()}.png`, {
			type: 'card-front',
			targetId: cardId
		});
	}
	return uploadImage(file, {
		type: 'card-front',
		targetId: cardId
	});
}

/**
 * 카드 이미지 업로드 (뒷면)
 */
export async function uploadCardBackImage(
	cardId: string,
	file: File | string
): Promise<UploadResponse> {
	if (typeof file === 'string') {
		return uploadBase64Image(file, `card-back-${Date.now()}.png`, {
			type: 'card-back',
			targetId: cardId
		});
	}
	return uploadImage(file, {
		type: 'card-back',
		targetId: cardId
	});
}

/**
 * 카드 썸네일 업로드
 */
export async function uploadCardThumbnail(
	cardId: string,
	file: File | string
): Promise<UploadResponse> {
	if (typeof file === 'string') {
		return uploadBase64Image(file, `card-thumbnail-${Date.now()}.png`, {
			type: 'card-thumbnail',
			targetId: cardId
		});
	}
	return uploadImage(file, {
		type: 'card-thumbnail',
		targetId: cardId
	});
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadProfileImage(
	userId: string,
	file: File | string
): Promise<UploadResponse> {
	if (typeof file === 'string') {
		return uploadBase64Image(file, `profile-${Date.now()}.png`, {
			type: 'profile',
			targetId: userId
		});
	}
	return uploadImage(file, {
		type: 'profile',
		targetId: userId
	});
}

/**
 * 템플릿 미리보기 이미지 업로드
 */
export async function uploadTemplatePreview(
	templateId: string,
	file: File | string
): Promise<UploadResponse> {
	if (typeof file === 'string') {
		return uploadBase64Image(file, `template-preview-${Date.now()}.png`, {
			type: 'template',
			targetId: templateId
		});
	}
	return uploadImage(file, {
		type: 'template',
		targetId: templateId
	});
}

/**
 * Canvas를 이미지로 업로드
 */
export async function uploadCanvas(
	canvas: HTMLCanvasElement,
	filename: string,
	options: {
		type?: 'card-front' | 'card-back' | 'card-thumbnail' | 'profile' | 'template';
		targetId?: string;
		folder?: string;
		quality?: number;
		format?: 'png' | 'jpeg' | 'webp';
	} = {}
): Promise<UploadResponse> {
	const { format = 'png', quality = 0.92 } = options;
	const mimeType = `image/${format}`;
	const base64Data = canvas.toDataURL(mimeType, quality);

	return uploadBase64Image(base64Data, filename, {
		type: options.type,
		targetId: options.targetId,
		folder: options.folder
	});
}

/**
 * 이미지 리사이즈 후 업로드
 */
export async function uploadResizedImage(
	file: File,
	maxWidth: number,
	maxHeight: number,
	options: {
		type?: 'card-front' | 'card-back' | 'card-thumbnail' | 'profile' | 'template';
		targetId?: string;
		folder?: string;
		quality?: number;
	} = {}
): Promise<UploadResponse> {
	return new Promise((resolve) => {
		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		img.onload = async () => {
			// 비율 유지하면서 리사이즈
			let width = img.width;
			let height = img.height;

			if (width > maxWidth) {
				height = (height * maxWidth) / width;
				width = maxWidth;
			}

			if (height > maxHeight) {
				width = (width * maxHeight) / height;
				height = maxHeight;
			}

			canvas.width = width;
			canvas.height = height;

			ctx?.drawImage(img, 0, 0, width, height);

			const result = await uploadCanvas(canvas, file.name, {
				type: options.type,
				targetId: options.targetId,
				folder: options.folder,
				quality: options.quality || 0.85
			});

			resolve(result);
		};

		img.onerror = () => {
			resolve({
				success: false,
				error: 'Failed to load image'
			});
		};

		img.src = URL.createObjectURL(file);
	});
}
