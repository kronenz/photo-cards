/**
 * MinIO Client Configuration
 * Feature: 004-production-service-integration
 * S3-compatible object storage for card images
 */

import * as Minio from 'minio';
import { env } from '$env/dynamic/private';

// MinIO client configuration
const minioConfig = {
  endPoint: env.MINIO_ENDPOINT?.replace(/^https?:\/\//, '') || 'localhost',
  port: parseInt(env.MINIO_PORT || '9000'),
  useSSL: env.MINIO_USE_SSL === 'true',
  accessKey: env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: env.MINIO_ROOT_PASSWORD || 'minioadmin123'
};

// Create MinIO client instance
export const minioClient = new Minio.Client(minioConfig);

// Default bucket name
export const BUCKET_NAME = env.MINIO_BUCKET || 'photo-cards';

// Public URL for accessing files
export const MINIO_PUBLIC_URL = env.MINIO_ENDPOINT || 'http://localhost:9000';

/**
 * Generate a presigned PUT URL for direct upload
 * @param key - Object key (file path in bucket)
 * @param expirySeconds - URL expiry time in seconds (default 5 minutes)
 */
export async function getPresignedPutUrl(key: string, expirySeconds = 300): Promise<string> {
  return minioClient.presignedPutObject(BUCKET_NAME, key, expirySeconds);
}

/**
 * Generate a presigned GET URL for downloading
 * @param key - Object key (file path in bucket)
 * @param expirySeconds - URL expiry time in seconds (default 1 hour)
 */
export async function getPresignedGetUrl(key: string, expirySeconds = 3600): Promise<string> {
  return minioClient.presignedGetObject(BUCKET_NAME, key, expirySeconds);
}

/**
 * Get public URL for an object (requires bucket policy to be public)
 * @param key - Object key
 */
export function getPublicUrl(key: string): string {
  return `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${key}`;
}

/**
 * Upload a buffer directly to MinIO
 * @param key - Object key
 * @param buffer - File buffer
 * @param contentType - MIME type
 */
export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await minioClient.putObject(BUCKET_NAME, key, buffer, buffer.length, {
    'Content-Type': contentType
  });
  return getPublicUrl(key);
}

/**
 * Delete an object from MinIO
 * @param key - Object key
 */
export async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, key);
}

/**
 * Check if an object exists
 * @param key - Object key
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(BUCKET_NAME, key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get object as buffer (for server-side processing)
 * @param key - Object key
 */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const stream = await minioClient.getObject(BUCKET_NAME, key);
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Ensure bucket exists with public read policy
 */
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET_NAME);

  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);

    // Set public read policy
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

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}
