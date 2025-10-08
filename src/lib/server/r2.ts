import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 Storage Client Configuration
 *
 * R2 is S3-compatible storage with zero egress fees.
 * Used for storing template JSON files and thumbnails.
 *
 * @see research.md - Decision 1: Cloud Storage
 */

// Validate required environment variables
const requiredEnvVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn(`⚠️  Missing R2 environment variables: ${missingVars.join(', ')}`);
  console.warn('Template uploads will fail. Please configure R2 credentials in .env');
}

/**
 * R2 S3-compatible client
 * Configured with Cloudflare R2 endpoint
 */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock-key',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock-secret',
  },
});

/**
 * R2 bucket name for template storage
 * Default: 'kbo-templates'
 */
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kbo-templates';

/**
 * Public CDN URL for accessing templates
 * Templates are served via Cloudflare CDN for performance
 */
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://cdn.kbo-cards.com';

/**
 * Maximum template file size (15MB)
 * Enforced during upload
 */
export const MAX_TEMPLATE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

/**
 * Presigned URL expiry time
 * Upload URLs expire after 1 hour
 */
export const PRESIGNED_URL_EXPIRY = 3600; // 1 hour in seconds
