/**
 * Template Marketplace Type Definitions
 *
 * Comprehensive type system for holographic card templates.
 * Based on data-model.md specifications.
 *
 * @see specs/001-template-marketplace/data-model.md
 */

// ============================================================================
// Template Entity
// ============================================================================

export type TemplateLicense =
	| 'CC-BY' // Attribution
	| 'CC-BY-SA' // Attribution-ShareAlike
	| 'CC-BY-NC' // Attribution-NonCommercial
	| 'CC-BY-NC-SA' // Attribution-NonCommercial-ShareAlike
	| 'All Rights Reserved';

export type CopyrightStatus = 'pending' | 'approved' | 'flagged' | 'rejected';

export interface CopyrightCheckMetadata {
	phash_checked: boolean;
	phash_results?: {
		detected: boolean;
		team?: string;
		confidence?: number;
	};
	ai_checked: boolean;
	ai_results?: {
		labels: Array<{ name: string; score: number }>;
		flagged: boolean;
	};
	manual_review?: {
		reviewer_id: string;
		reviewed_at: string;
		notes?: string;
	};
}

/**
 * Template Entity - Main marketplace template record
 */
export interface Template {
	// PocketBase Standard Fields
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;

	// Template Identity
	template_id: string; // Unique identifier (e.g., "tpl_lg_homerun_moment_001")
	version: string; // Template content version (e.g., "1.2.0")
	template_version: string; // Template schema version (e.g., "1.0.0")

	// Metadata
	title: string; // Display title (3-100 chars)
	description: string; // Full description (10-1000 chars)
	author: string; // Relation to users collection
	category: string; // Relation to template_categories
	tags: string[]; // Search tags (e.g., ["LG 트윈스", "홈런"])

	// Storage
	storage_url: string; // Cloudflare R2 URL (JSON file)
	thumbnail_url: string; // Preview image URL
	file_size: number; // Bytes (max 15MB)
	file_hash: string; // SHA-256 hash for integrity

	// Engagement Metrics
	rating_average?: number; // 0.0 - 5.0
	rating_count?: number; // Total number of ratings
	download_count?: number; // Total downloads
	view_count?: number; // Total views

	// Remix & Licensing
	is_remix: boolean; // True if remixed from another template
	original_template_id?: string; // Relation to original template
	allow_remix: boolean; // Allow others to remix
	license: TemplateLicense; // Creative Commons or All Rights Reserved

	// Monetization (Phase 4)
	is_premium: boolean; // Requires payment
	price?: number; // Price in currency units
	currency?: 'KRW' | 'USD'; // Currency code

	// Copyright Detection
	copyright_status: CopyrightStatus;
	copyright_check_metadata?: CopyrightCheckMetadata;

	// Publishing
	is_published: boolean; // Publicly visible
	published_at?: string; // ISO 8601 timestamp
	featured?: boolean; // Featured on homepage

	// Extensibility
	metadata?: Record<string, unknown>; // Additional custom fields

	// Expanded relations (optional, populated when expand query used)
	expand?: {
		author?: User;
		category?: TemplateCategory;
		original_template_id?: Template;
	};
}

// ============================================================================
// Template Review Entity
// ============================================================================

/**
 * Template Review Entity - User ratings and reviews
 */
export interface TemplateReview {
	// PocketBase Standard Fields
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;

	// Review Data
	template: string; // Relation to templates
	user: string; // Relation to users
	rating: number; // 1-5 stars
	comment?: string; // Optional text review (max 2000 chars)

	// Engagement
	helpful_count?: number; // Number of "helpful" votes
	is_verified_purchase?: boolean; // True if user downloaded this template

	// Expanded relations
	expand?: {
		user?: User;
		template?: Template;
	};
}

// ============================================================================
// Template Category Entity
// ============================================================================

/**
 * Template Category Entity - Hierarchical categorization
 */
export interface TemplateCategory {
	// PocketBase Standard Fields
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;

	// Category Data
	slug: string; // URL-safe identifier (e.g., "moment-cards")
	name: string; // Display name (e.g., "순간 카드")
	description?: string; // Category description
	parent?: string; // Relation to parent category (null for top-level)

	// Display Metadata
	icon?: string; // Icon name or emoji
	color?: string; // Hex color code
	order?: number; // Display order (0-indexed)

	// Status
	is_active: boolean; // Publicly visible

	// Expanded relations
	expand?: {
		parent?: TemplateCategory;
	};
}

// ============================================================================
// Template Download Entity
// ============================================================================

export type DownloadSource = 'marketplace' | 'profile' | 'search' | 'featured' | 'direct';

/**
 * Template Download Event Entity - Download tracking
 */
export interface TemplateDownload {
	// PocketBase Standard Fields
	id: string;
	created: string; // Download timestamp
	updated: string;
	collectionId: string;
	collectionName: string;

	// Download Event
	template: string; // Relation to templates
	user: string; // Relation to users

	// Analytics
	ip_address?: string; // User IP (hashed for privacy)
	user_agent?: string; // Browser user agent
	source: DownloadSource; // Traffic source

	// Expanded relations
	expand?: {
		template?: Template;
		user?: User;
	};
}

// ============================================================================
// Flagged Upload Entity
// ============================================================================

export type FlagReason = 'logo_detected' | 'ai_flagged' | 'user_reported' | 'manual_review';
export type ReviewStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

/**
 * Flagged Upload Entity - Copyright detection review queue
 */
export interface FlaggedUpload {
	// PocketBase Standard Fields
	id: string;
	created: string; // Flag timestamp
	updated: string;
	collectionId: string;
	collectionName: string;

	// Flagged Template
	template: string; // Relation to templates
	uploader: string; // Relation to users

	// Flag Details
	flag_reason: FlagReason; // Why it was flagged
	detection_metadata: {
		phash_results?: {
			detected: boolean;
			team?: string;
			confidence?: number;
		};
		ai_results?: {
			labels: Array<{ name: string; score: number }>;
			flagged: boolean;
		};
		user_report?: {
			reporter_id: string;
			reason: string;
		};
	};

	// Review Status
	status: ReviewStatus; // Current review state
	reviewer?: string; // Relation to admin user
	reviewed_at?: string; // ISO 8601 timestamp
	review_notes?: string; // Admin notes

	// Expanded relations
	expand?: {
		template?: Template;
		uploader?: User;
		reviewer?: User;
	};
}

// ============================================================================
// User Entity (Existing - for reference)
// ============================================================================

/**
 * User Entity - From existing auth system
 * Used for template authorship and reviews
 */
export interface User {
	id: string;
	username?: string;
	email: string;
	avatar?: string;
	name?: string;
	// ... other user fields from existing system
}

// ============================================================================
// Template JSON Format (from research.md)
// ============================================================================

/**
 * Template JSON Format - Stored in R2
 * Hybrid Base64/URL schema for efficient storage
 */
export interface TemplateJSON {
	metadata: {
		id: string;
		version: string;
		templateVersion: string;
		title: string;
		author: {
			id: string;
			username: string;
		};
		category: string;
		tags: string[];
		rating: {
			average: number;
			count: number;
		};
		remixInfo: {
			isRemix: boolean;
			allowRemix: boolean;
			originalTemplateId?: string;
		};
	};
	cardConfig: {
		frontImage: {
			type: 'embedded' | 'url';
			data?: string; // Base64 for embedded
			url?: string; // CDN URL for shared assets
			fallbackUrl?: string;
			hash: string; // SHA-256 for integrity
		};
		backImage?: {
			type: 'embedded' | 'url';
			data?: string;
			url?: string;
			hash: string;
		};
		holographic: {
			effectType: string; // lg, doosan, kt, etc.
			intensity: number; // 0.0 - 1.0
			animationSpeed: number; // 0.5 - 2.0
		};
	};
	layout: {
		elements: Array<{
			type: 'text' | 'image' | 'shape';
			position: { x: number; y: number };
			size: { width: number; height: number };
			content?: string;
			style?: Record<string, unknown>;
		}>;
	};
	variables: Record<
		string,
		{
			type: 'string' | 'number' | 'color';
			default: unknown;
			label?: string;
		}
	>;
	compatibility: {
		minTemplateVersion: string;
		maxTemplateVersion: string;
		requiredFeatures: string[];
	};
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Template Create Request - For POST /api/templates
 */
export interface TemplateCreateRequest {
	template_id: string;
	version: string;
	template_version: string;
	title: string;
	description: string;
	category: string;
	tags: string[];
	storage_url: string;
	thumbnail_url: string;
	file_size: number;
	file_hash: string;
	is_remix: boolean;
	original_template_id?: string;
	allow_remix: boolean;
	license: TemplateLicense;
	is_premium: boolean;
	price?: number;
	currency?: 'KRW' | 'USD';
}

/**
 * Presigned Upload URL Response
 */
export interface PresignedUploadResponse {
	uploadUrl: string;
	storageUrl: string;
	expiresIn: number;
	uploadId: string;
}

/**
 * Rating Statistics Response
 */
export interface RatingStatsResponse {
	average: number;
	count: number;
	distribution: {
		5: number;
		4: number;
		3: number;
		2: number;
		1: number;
	};
	verified_purchase_percentage: number;
}
