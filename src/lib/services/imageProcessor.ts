/**
 * Image Processor Service
 * Feature: 004-production-service-integration
 *
 * Server-side image processing using Sharp.js
 * - WebP conversion for optimal storage
 * - Thumbnail generation (multiple sizes)
 * - Image optimization
 */

import sharp from 'sharp';
import { uploadFile, getPublicUrl } from '$lib/server/minio';

export interface ProcessedImage {
  original: string;
  thumb: string;
  medium: string;
  large: string;
}

export interface ProcessOptions {
  generateThumbnails?: boolean;
  convertToWebP?: boolean;
  quality?: number;
}

const DEFAULT_OPTIONS: ProcessOptions = {
  generateThumbnails: true,
  convertToWebP: true,
  quality: 85
};

// Thumbnail sizes
const SIZES = {
  thumb: { width: 150, height: 210 },   // 1:1.4 aspect ratio for cards
  medium: { width: 300, height: 420 },
  large: { width: 600, height: 840 }
};

/**
 * Process an uploaded image
 * - Converts to WebP
 * - Generates thumbnails
 * - Returns URLs for all sizes
 */
export async function processImage(
  imageBuffer: Buffer,
  userId: string,
  filename: string,
  options: ProcessOptions = DEFAULT_OPTIONS
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const timestamp = Date.now();
  const baseKey = `cards/${userId}/${timestamp}`;

  // Process original image (optimize and optionally convert to WebP)
  const originalBuffer = await sharp(imageBuffer)
    .webp({ quality: opts.quality })
    .toBuffer();

  // Upload original
  const originalResult = await uploadFile({
    data: originalBuffer,
    filename: `${baseKey}-original.webp`,
    contentType: 'image/webp',
    folder: ''
  });

  if (!originalResult.success || !originalResult.objectKey) {
    throw new Error('Failed to upload original image');
  }

  const result: ProcessedImage = {
    original: originalResult.url || getPublicUrl(originalResult.objectKey),
    thumb: '',
    medium: '',
    large: ''
  };

  // Generate and upload thumbnails
  if (opts.generateThumbnails) {
    // Thumb
    const thumbBuffer = await sharp(imageBuffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: opts.quality })
      .toBuffer();

    const thumbResult = await uploadFile({
      data: thumbBuffer,
      filename: `${baseKey}-thumb.webp`,
      contentType: 'image/webp',
      folder: ''
    });

    if (thumbResult.success && thumbResult.objectKey) {
      result.thumb = thumbResult.url || getPublicUrl(thumbResult.objectKey);
    }

    // Medium
    const mediumBuffer = await sharp(imageBuffer)
      .resize(SIZES.medium.width, SIZES.medium.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: opts.quality })
      .toBuffer();

    const mediumResult = await uploadFile({
      data: mediumBuffer,
      filename: `${baseKey}-medium.webp`,
      contentType: 'image/webp',
      folder: ''
    });

    if (mediumResult.success && mediumResult.objectKey) {
      result.medium = mediumResult.url || getPublicUrl(mediumResult.objectKey);
    }

    // Large
    const largeBuffer = await sharp(imageBuffer)
      .resize(SIZES.large.width, SIZES.large.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: opts.quality })
      .toBuffer();

    const largeResult = await uploadFile({
      data: largeBuffer,
      filename: `${baseKey}-large.webp`,
      contentType: 'image/webp',
      folder: ''
    });

    if (largeResult.success && largeResult.objectKey) {
      result.large = largeResult.url || getPublicUrl(largeResult.objectKey);
    }
  }

  return result;
}

/**
 * Process image from base64 string
 */
export async function processImageBase64(
  base64Data: string,
  userId: string,
  filename: string,
  options?: ProcessOptions
): Promise<ProcessedImage> {
  // Extract base64 content
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image data');
  }

  const buffer = Buffer.from(matches[2], 'base64');
  return processImage(buffer, userId, filename, options);
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imageBuffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  const metadata = await sharp(imageBuffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: imageBuffer.length
  };
}

/**
 * Validate image file
 */
export async function validateImage(
  imageBuffer: Buffer,
  maxSize: number = 10 * 1024 * 1024
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (imageBuffer.length > maxSize) {
    return {
      valid: false,
      error: `파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`
    };
  }

  try {
    const metadata = await sharp(imageBuffer).metadata();

    // Check format
    const allowedFormats = ['jpeg', 'png', 'webp', 'gif'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: 'JPEG, PNG, WebP, GIF 형식만 업로드 가능합니다.'
      };
    }

    // Check dimensions (max 10000x10000)
    if ((metadata.width && metadata.width > 10000) || (metadata.height && metadata.height > 10000)) {
      return {
        valid: false,
        error: '이미지 크기가 너무 큽니다. 최대 10000x10000 픽셀까지 지원합니다.'
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: '이미지 파일을 읽을 수 없습니다.'
    };
  }
}
