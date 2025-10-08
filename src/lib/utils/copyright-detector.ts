/**
 * Copyright Detection Utility
 *
 * Client-side logo detection using perceptual hashing (pHash).
 * Detects KBO and team logos to prevent copyright violations.
 *
 * @see research.md - Decision 3: Copyright Detection (Hybrid Approach)
 */

import phash from 'phash-js';

/**
 * KBO Team Logo Hashes
 *
 * Perceptual hashes of official KBO team logos.
 * Generated from high-quality logo sources.
 *
 * TODO: Replace placeholder hashes with actual pHash values from real logos
 */
const KBO_LOGO_HASHES = [
	{ team: 'LG Twins', hash: 'a8c5d3e9f1b2c4a5b6d7e8f9a0b1c2d3' },
	{ team: 'Doosan Bears', hash: 'b9d6e4f0c2a3d5b6c7e8f9a0b1c2d3e4' },
	{ team: 'KT Wiz', hash: 'c0e7f5a1d3b4e6c7d8e9f0a1b2c3d4e5' },
	{ team: 'SSG Landers', hash: 'd1f8a6b2e4c5f7d8e9f0a1b2c3d4e5f6' },
	{ team: 'NC Dinos', hash: 'e2a9b7c3f5d6a8e9f0a1b2c3d4e5f6a7' },
	{ team: 'Kiwoom Heroes', hash: 'f3b0c8d4a6e7b9f0a1b2c3d4e5f6a7b8' },
	{ team: 'KIA Tigers', hash: 'a4c1d9e5b7f8c0a1b2c3d4e5f6a7b8c9' },
	{ team: 'Lotte Giants', hash: 'b5d2e0f6c8a9d1b2c3d4e5f6a7b8c9d0' },
	{ team: 'Samsung Lions', hash: 'c6e3f1a7d9b0e2c3d4e5f6a7b8c9d0e1' },
	{ team: 'Hanwha Eagles', hash: 'd7f4a2b8e0c1f3d4e5f6a7b8c9d0e1f2' },
	{ team: 'KBO League', hash: 'e8a5b3c9f1d2a4e5f6a7b8c9d0e1f2a3' }
];

/**
 * Logo detection result
 */
export interface LogoDetectionResult {
	detected: boolean;
	team?: string;
	confidence?: number; // 0-100%
	matchedHash?: string;
}

/**
 * Detect KBO/team logos in image using perceptual hashing
 *
 * @param imageFile - Image file to analyze
 * @param threshold - Hamming distance threshold (default: 10, lower = stricter)
 * @returns Detection result with team and confidence
 */
export async function detectLogoClientSide(
	imageFile: File | Blob | string,
	threshold: number = 10
): Promise<LogoDetectionResult> {
	try {
		// Calculate pHash of input image
		const imageHash = await calculatePHash(imageFile);

		// Compare with known logo hashes
		for (const logo of KBO_LOGO_HASHES) {
			const distance = hammingDistance(imageHash, logo.hash);

			if (distance < threshold) {
				// Match found - calculate confidence
				const confidence = Math.max(0, 100 - distance * 10);

				return {
					detected: true,
					team: logo.team,
					confidence,
					matchedHash: logo.hash
				};
			}
		}

		// No match found
		return { detected: false };
	} catch (error) {
		console.error('Logo detection error:', error);
		return { detected: false };
	}
}

/**
 * Calculate perceptual hash of image
 *
 * @param image - Image file, blob, or data URL
 * @returns pHash string (32-character hex)
 */
async function calculatePHash(image: File | Blob | string): Promise<string> {
	// Convert to buffer/array for phash-js
	if (typeof image === 'string') {
		// Data URL - convert to buffer
		const base64Data = image.split(',')[1];
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return await phash(bytes);
	} else {
		// File or Blob - read as ArrayBuffer
		const arrayBuffer = await image.arrayBuffer();
		const bytes = new Uint8Array(arrayBuffer);
		return await phash(bytes);
	}
}

/**
 * Calculate Hamming distance between two hashes
 *
 * Hamming distance = number of differing bits
 * Lower distance = more similar images
 *
 * @param hash1 - First hash (hex string)
 * @param hash2 - Second hash (hex string)
 * @returns Hamming distance (0 = identical)
 */
function hammingDistance(hash1: string, hash2: string): number {
	if (hash1.length !== hash2.length) {
		throw new Error('Hashes must be same length');
	}

	let distance = 0;

	for (let i = 0; i < hash1.length; i++) {
		// Convert hex chars to binary and count differing bits
		const byte1 = parseInt(hash1[i], 16);
		const byte2 = parseInt(hash2[i], 16);
		const xor = byte1 ^ byte2;

		// Count set bits (Brian Kernighan's algorithm)
		let count = xor;
		while (count > 0) {
			count &= count - 1;
			distance++;
		}
	}

	return distance;
}

/**
 * Batch detect logos in multiple images
 *
 * @param images - Array of image files
 * @param threshold - Detection threshold
 * @returns Array of detection results
 */
export async function batchDetectLogos(
	images: (File | Blob | string)[],
	threshold: number = 10
): Promise<LogoDetectionResult[]> {
	const results = await Promise.all(
		images.map((image) => detectLogoClientSide(image, threshold))
	);
	return results;
}

/**
 * Get copyright warning message based on detection result
 *
 * @param result - Logo detection result
 * @returns User-friendly warning message
 */
export function getCopyrightWarning(result: LogoDetectionResult): string | null {
	if (!result.detected) return null;

	return `⚠️ Copyright Warning: This image appears to contain the ${result.team} logo (${result.confidence}% match). Using official KBO/team logos without permission may violate copyright laws. Please use only your own creative work.`;
}

/**
 * Check if image is safe to upload (no logos detected)
 *
 * @param imageFile - Image to check
 * @returns true if safe, false if logo detected
 */
export async function isSafeToUpload(imageFile: File | Blob | string): Promise<boolean> {
	const result = await detectLogoClientSide(imageFile);
	return !result.detected;
}

/**
 * Generate copyright check metadata for template record
 *
 * @param imageFile - Image to analyze
 * @returns Metadata object for PocketBase
 */
export async function generateCopyrightMetadata(imageFile: File | Blob | string) {
	const result = await detectLogoClientSide(imageFile);

	return {
		phash_checked: true,
		phash_results: {
			detected: result.detected,
			team: result.team,
			confidence: result.confidence
		},
		ai_checked: false, // Server-side AI check not implemented yet
		ai_results: undefined
	};
}

/**
 * TODO: Collect high-quality KBO logos and generate actual pHash values
 *
 * Instructions:
 * 1. Obtain official logos from KBO/team websites (ensure legal access)
 * 2. Process each logo with phash-js to generate perceptual hashes
 * 3. Replace placeholder hashes in KBO_LOGO_HASHES array
 * 4. Test detection accuracy with sample images
 * 5. Adjust threshold based on false positive/negative rates
 *
 * Expected accuracy: 85%+ (per research.md Decision 3)
 */
