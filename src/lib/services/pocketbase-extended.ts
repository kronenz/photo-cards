/**
 * PocketBase Extended Service
 *
 * 기존 pocketbase.ts를 확장하여 새로운 컬렉션 타입과 서비스를 제공합니다.
 * Phase 2-4 백엔드 연동 작업에서 사용됩니다.
 */

import { pb } from '$lib/pocketbase';
import type { RecordModel } from 'pocketbase';

// ============================================
// Base Types
// ============================================

export interface BaseRecord extends RecordModel {
	id: string;
	created: string;
	updated: string;
}

// ============================================
// Users Collection (PocketBase Auth)
// ============================================

export interface AuthUser extends BaseRecord {
	email: string;
	username: string;
	name?: string;
	avatar?: string;
	verified: boolean;
}

// ============================================
// Unified Users Collection
// ============================================

export interface UnifiedUser extends BaseRecord {
	user_id: string; // relation -> users
	display_name: string;
	avatar_url?: string;
	bio?: string;
	theme: 'light' | 'dark' | 'auto' | 'kbo-team';
	team_theme_color?: string;
	fan_favorite_team?: string; // relation -> kbo_teams
	fan_level: number; // 1-5
	fan_points: number;
	creator_followers: number;
	creator_following: number;
	stats_cards_created: number;
	stats_cards_collected: number;
	// Expanded relations
	expand?: {
		user_id?: AuthUser;
		fan_favorite_team?: KboTeam;
	};
}

// ============================================
// Unified Cards Collection
// ============================================

export type HolographicEffect = 'overlay' | 'soft-light' | 'hard-light';
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardContext = 'test' | 'main' | 'gallery' | 'community';

export interface UnifiedCard extends BaseRecord {
	title: string;
	description?: string;
	holographic_image?: string; // file
	holographic_back_image?: string; // file
	holographic_effect: HolographicEffect;
	holographic_intensity: number; // 0-100
	holographic_animation_duration: number; // 100-2000
	photocard_rarity: CardRarity;
	community_creator?: string; // relation -> unified_users
	community_is_public: boolean;
	community_tags?: string[]; // json array
	community_likes: number;
	community_downloads: number;
	community_rating: number;
	context: CardContext;
	// Expanded relations
	expand?: {
		community_creator?: UnifiedUser;
	};
}

// ============================================
// KBO Teams Collection
// ============================================

export interface KboTeam extends BaseRecord {
	name: string;
	name_en?: string;
	primary_color: string;
	secondary_color?: string;
	logo_url?: string; // file
	mascot?: string;
	stadium?: string;
}

// ============================================
// Fan Levels Collection
// ============================================

export interface FanLevelPerk {
	name: string;
	description: string;
}

export interface FanLevel extends BaseRecord {
	level: number; // 1-5
	name: string;
	required_points: number;
	perks: FanLevelPerk[];
}

// ============================================
// Collections Collection
// ============================================

export interface CardCollection extends BaseRecord {
	name: string;
	description?: string;
	owner: string; // relation -> unified_users
	cards?: string[]; // relation -> unified_cards (multiple)
	is_public: boolean;
	total_cards: number;
	completion_rate: number; // 0-100
	// Expanded relations
	expand?: {
		owner?: UnifiedUser;
		cards?: UnifiedCard[];
	};
}

// ============================================
// Templates Collection
// ============================================

export interface TemplateData {
	layout?: string;
	styles?: Record<string, unknown>;
	elements?: Array<{
		type: string;
		position: { x: number; y: number };
		size: { width: number; height: number };
		properties?: Record<string, unknown>;
	}>;
}

export interface Template extends BaseRecord {
	name: string;
	description?: string;
	category?: string;
	price: number;
	creator: string; // relation -> unified_users
	rating: number; // 0-5
	rating_count: number;
	downloads: number;
	is_public: boolean;
	template_data?: TemplateData;
	preview_image?: string; // file
	// Expanded relations
	expand?: {
		creator?: UnifiedUser;
	};
}

// ============================================
// Community Posts Collection
// ============================================

export type PostVisibility = 'public' | 'fanclub' | 'followers';

export interface CommunityPost extends BaseRecord {
	card?: string; // relation -> unified_cards
	author: string; // relation -> unified_users
	caption?: string;
	visibility: PostVisibility;
	likes: number;
	comments_count: number;
	// Expanded relations
	expand?: {
		card?: UnifiedCard;
		author?: UnifiedUser;
	};
}

// ============================================
// Reviews Collection
// ============================================

export interface Review extends BaseRecord {
	template: string; // relation -> templates
	user: string; // relation -> users
	rating: number; // 1-5
	comment?: string;
	// Expanded relations
	expand?: {
		template?: Template;
		user?: AuthUser;
	};
}

// ============================================
// Collection Names
// ============================================

export const Collections = {
	USERS: 'users',
	UNIFIED_USERS: 'unified_users',
	UNIFIED_CARDS: 'unified_cards',
	KBO_TEAMS: 'kbo_teams',
	FAN_LEVELS: 'fan_levels',
	COLLECTIONS: 'collections',
	TEMPLATES: 'templates',
	COMMUNITY_POSTS: 'community_posts',
	REVIEWS: 'reviews',
} as const;

// ============================================
// Helper: Get file URL
// ============================================

export function getFileUrl(record: BaseRecord, filename: string): string {
	return pb.files.getUrl(record, filename);
}

// ============================================
// Auth Service
// ============================================

export class AuthService {
	static async login(email: string, password: string): Promise<AuthUser> {
		const authData = await pb.collection(Collections.USERS).authWithPassword(email, password);
		return authData.record as AuthUser;
	}

	static async register(email: string, password: string, username: string): Promise<AuthUser> {
		const user = await pb.collection(Collections.USERS).create<AuthUser>({
			email,
			password,
			passwordConfirm: password,
			username,
		});
		await pb.collection(Collections.USERS).authWithPassword(email, password);
		return user;
	}

	static logout(): void {
		pb.authStore.clear();
	}

	static isLoggedIn(): boolean {
		return pb.authStore.isValid;
	}

	static getCurrentAuthUser(): AuthUser | null {
		return pb.authStore.model as AuthUser | null;
	}
}

// ============================================
// User Service
// ============================================

export class UserService {
	static async getCurrentUser(): Promise<AuthUser | null> {
		if (!pb.authStore.isValid || !pb.authStore.model?.id) {
			return null;
		}

		try {
			return await pb.collection(Collections.USERS).getOne<AuthUser>(pb.authStore.model.id);
		} catch (error) {
			console.error('Failed to get current user:', error);
			return null;
		}
	}

	static async getUnifiedUser(userId: string): Promise<UnifiedUser | null> {
		try {
			const records = await pb.collection(Collections.UNIFIED_USERS).getList<UnifiedUser>(1, 1, {
				filter: `user_id = "${userId}"`,
				expand: 'user_id,fan_favorite_team',
			});
			return records.items[0] || null;
		} catch (error) {
			console.error('Failed to get unified user:', error);
			return null;
		}
	}

	static async getCurrentUnifiedUser(): Promise<UnifiedUser | null> {
		const user = AuthService.getCurrentAuthUser();
		if (!user) return null;
		return this.getUnifiedUser(user.id);
	}

	static async createUnifiedUser(data: Partial<UnifiedUser>): Promise<UnifiedUser> {
		return await pb.collection(Collections.UNIFIED_USERS).create<UnifiedUser>(data);
	}

	static async updateUnifiedUser(id: string, data: Partial<UnifiedUser>): Promise<UnifiedUser> {
		return await pb.collection(Collections.UNIFIED_USERS).update<UnifiedUser>(id, data);
	}

	static async getProfile(id: string): Promise<UnifiedUser | null> {
		try {
			return await pb.collection(Collections.UNIFIED_USERS).getOne<UnifiedUser>(id, {
				expand: 'user_id,fan_favorite_team',
			});
		} catch (error) {
			console.error('Failed to get profile:', error);
			return null;
		}
	}
}

// ============================================
// Card Service
// ============================================

export interface CardListOptions {
	page?: number;
	perPage?: number;
	filter?: string;
	sort?: string;
	expand?: string;
}

export interface CardCreateData {
	title: string;
	description?: string;
	holographic_effect?: HolographicEffect;
	holographic_intensity?: number;
	holographic_animation_duration?: number;
	photocard_rarity?: CardRarity;
	community_creator?: string;
	community_is_public?: boolean;
	community_tags?: string[];
	context?: CardContext;
	// File uploads (File objects)
	holographic_image?: File;
	holographic_back_image?: File;
}

export class CardService {
	static async getCards(options: CardListOptions = {}): Promise<{
		items: UnifiedCard[];
		totalItems: number;
		totalPages: number;
	}> {
		const { page = 1, perPage = 20, filter, sort = '-created', expand = 'community_creator' } = options;

		const result = await pb.collection(Collections.UNIFIED_CARDS).getList<UnifiedCard>(page, perPage, {
			filter,
			sort,
			expand,
		});

		return {
			items: result.items,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}

	static async getCard(id: string): Promise<UnifiedCard | null> {
		try {
			return await pb.collection(Collections.UNIFIED_CARDS).getOne<UnifiedCard>(id, {
				expand: 'community_creator',
			});
		} catch (error) {
			console.error('Failed to get card:', error);
			return null;
		}
	}

	static async createCard(data: Partial<UnifiedCard>): Promise<UnifiedCard> {
		return await pb.collection(Collections.UNIFIED_CARDS).create<UnifiedCard>(data);
	}

	/**
	 * 파일 업로드와 함께 카드 생성 (PocketBase 파일 저장소 사용)
	 */
	static async createCardWithFiles(data: CardCreateData): Promise<UnifiedCard> {
		const formData = new FormData();

		// Add text fields
		formData.append('title', data.title);
		if (data.description) formData.append('description', data.description);
		formData.append('holographic_effect', data.holographic_effect || 'overlay');
		formData.append('holographic_intensity', String(data.holographic_intensity ?? 50));
		formData.append('holographic_animation_duration', String(data.holographic_animation_duration ?? 1000));
		formData.append('photocard_rarity', data.photocard_rarity || 'common');
		if (data.community_creator) formData.append('community_creator', data.community_creator);
		formData.append('community_is_public', String(data.community_is_public ?? false));
		if (data.community_tags) formData.append('community_tags', JSON.stringify(data.community_tags));
		formData.append('context', data.context || 'community');
		formData.append('community_likes', '0');
		formData.append('community_downloads', '0');
		formData.append('community_rating', '0');

		// Add file fields
		if (data.holographic_image) {
			formData.append('holographic_image', data.holographic_image);
		}
		if (data.holographic_back_image) {
			formData.append('holographic_back_image', data.holographic_back_image);
		}

		return await pb.collection(Collections.UNIFIED_CARDS).create<UnifiedCard>(formData);
	}

	/**
	 * 파일 업로드와 함께 카드 수정 (PocketBase 파일 저장소 사용)
	 */
	static async updateCardWithFiles(id: string, data: Partial<CardCreateData>): Promise<UnifiedCard> {
		const formData = new FormData();

		// Add text fields that are present
		if (data.title !== undefined) formData.append('title', data.title);
		if (data.description !== undefined) formData.append('description', data.description);
		if (data.holographic_effect !== undefined) formData.append('holographic_effect', data.holographic_effect);
		if (data.holographic_intensity !== undefined) formData.append('holographic_intensity', String(data.holographic_intensity));
		if (data.holographic_animation_duration !== undefined) formData.append('holographic_animation_duration', String(data.holographic_animation_duration));
		if (data.photocard_rarity !== undefined) formData.append('photocard_rarity', data.photocard_rarity);
		if (data.community_creator !== undefined) formData.append('community_creator', data.community_creator);
		if (data.community_is_public !== undefined) formData.append('community_is_public', String(data.community_is_public));
		if (data.community_tags !== undefined) formData.append('community_tags', JSON.stringify(data.community_tags));
		if (data.context !== undefined) formData.append('context', data.context);

		// Add file fields
		if (data.holographic_image) {
			formData.append('holographic_image', data.holographic_image);
		}
		if (data.holographic_back_image) {
			formData.append('holographic_back_image', data.holographic_back_image);
		}

		return await pb.collection(Collections.UNIFIED_CARDS).update<UnifiedCard>(id, formData);
	}

	static async updateCard(id: string, data: Partial<UnifiedCard>): Promise<UnifiedCard> {
		return await pb.collection(Collections.UNIFIED_CARDS).update<UnifiedCard>(id, data);
	}

	static async deleteCard(id: string): Promise<void> {
		await pb.collection(Collections.UNIFIED_CARDS).delete(id);
	}

	static async likeCard(id: string): Promise<UnifiedCard> {
		const card = await this.getCard(id);
		if (!card) throw new Error('Card not found');

		return await this.updateCard(id, {
			community_likes: card.community_likes + 1,
		});
	}

	static async searchCards(query: string, options: CardListOptions = {}): Promise<{
		items: UnifiedCard[];
		totalItems: number;
		totalPages: number;
	}> {
		const filter = `title ~ "${query}" || description ~ "${query}"`;
		return this.getCards({ ...options, filter });
	}

	static async getPublicCards(options: CardListOptions = {}): Promise<{
		items: UnifiedCard[];
		totalItems: number;
		totalPages: number;
	}> {
		return this.getCards({ ...options, filter: 'community_is_public = true' });
	}

	static async getUserCards(userId: string, options: CardListOptions = {}): Promise<{
		items: UnifiedCard[];
		totalItems: number;
		totalPages: number;
	}> {
		return this.getCards({ ...options, filter: `community_creator = "${userId}"` });
	}
}

// ============================================
// Collection Service
// ============================================

export class CollectionService {
	static async getCollections(options: CardListOptions = {}): Promise<{
		items: CardCollection[];
		totalItems: number;
		totalPages: number;
	}> {
		const { page = 1, perPage = 20, filter, sort = '-created', expand = 'owner' } = options;

		const result = await pb.collection(Collections.COLLECTIONS).getList<CardCollection>(page, perPage, {
			filter,
			sort,
			expand,
		});

		return {
			items: result.items,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}

	static async getCollection(id: string): Promise<CardCollection | null> {
		try {
			return await pb.collection(Collections.COLLECTIONS).getOne<CardCollection>(id, {
				expand: 'owner,cards',
			});
		} catch (error) {
			console.error('Failed to get collection:', error);
			return null;
		}
	}

	static async createCollection(data: Partial<CardCollection>): Promise<CardCollection> {
		return await pb.collection(Collections.COLLECTIONS).create<CardCollection>(data);
	}

	static async updateCollection(id: string, data: Partial<CardCollection>): Promise<CardCollection> {
		return await pb.collection(Collections.COLLECTIONS).update<CardCollection>(id, data);
	}

	static async deleteCollection(id: string): Promise<void> {
		await pb.collection(Collections.COLLECTIONS).delete(id);
	}

	static async addCardToCollection(collectionId: string, cardId: string): Promise<CardCollection> {
		const collection = await this.getCollection(collectionId);
		if (!collection) throw new Error('Collection not found');

		const cards = collection.cards || [];
		if (!cards.includes(cardId)) {
			cards.push(cardId);
		}

		return await this.updateCollection(collectionId, {
			cards,
			total_cards: cards.length,
		});
	}

	static async removeCardFromCollection(collectionId: string, cardId: string): Promise<CardCollection> {
		const collection = await this.getCollection(collectionId);
		if (!collection) throw new Error('Collection not found');

		const cards = (collection.cards || []).filter(id => id !== cardId);

		return await this.updateCollection(collectionId, {
			cards,
			total_cards: cards.length,
		});
	}

	static async getUserCollections(userId: string): Promise<CardCollection[]> {
		const result = await this.getCollections({ filter: `owner = "${userId}"` });
		return result.items;
	}
}

// ============================================
// Team & Level Service
// ============================================

export class TeamService {
	static async getKboTeams(): Promise<KboTeam[]> {
		return await pb.collection(Collections.KBO_TEAMS).getFullList<KboTeam>({
			sort: 'name',
		});
	}

	static async getKboTeam(id: string): Promise<KboTeam | null> {
		try {
			return await pb.collection(Collections.KBO_TEAMS).getOne<KboTeam>(id);
		} catch (error) {
			console.error('Failed to get KBO team:', error);
			return null;
		}
	}

	static async getFanLevels(): Promise<FanLevel[]> {
		return await pb.collection(Collections.FAN_LEVELS).getFullList<FanLevel>({
			sort: 'level',
		});
	}

	static async getFanLevel(level: number): Promise<FanLevel | null> {
		try {
			const records = await pb.collection(Collections.FAN_LEVELS).getList<FanLevel>(1, 1, {
				filter: `level = ${level}`,
			});
			return records.items[0] || null;
		} catch (error) {
			console.error('Failed to get fan level:', error);
			return null;
		}
	}

	static async updateUserTeam(unifiedUserId: string, teamId: string): Promise<UnifiedUser> {
		return await pb.collection(Collections.UNIFIED_USERS).update<UnifiedUser>(unifiedUserId, {
			fan_favorite_team: teamId,
		});
	}
}

// ============================================
// Template Service
// ============================================

export class TemplateService {
	static async getTemplates(options: CardListOptions = {}): Promise<{
		items: Template[];
		totalItems: number;
		totalPages: number;
	}> {
		const { page = 1, perPage = 20, filter, sort = '-created', expand = 'creator' } = options;

		const result = await pb.collection(Collections.TEMPLATES).getList<Template>(page, perPage, {
			filter,
			sort,
			expand,
		});

		return {
			items: result.items,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}

	static async getTemplate(id: string): Promise<Template | null> {
		try {
			return await pb.collection(Collections.TEMPLATES).getOne<Template>(id, {
				expand: 'creator',
			});
		} catch (error) {
			console.error('Failed to get template:', error);
			return null;
		}
	}

	static async getPublicTemplates(options: CardListOptions = {}): Promise<{
		items: Template[];
		totalItems: number;
		totalPages: number;
	}> {
		return this.getTemplates({ ...options, filter: 'is_public = true' });
	}
}

// ============================================
// Community Post Service
// ============================================

export class CommunityPostService {
	static async getPosts(options: CardListOptions = {}): Promise<{
		items: CommunityPost[];
		totalItems: number;
		totalPages: number;
	}> {
		const { page = 1, perPage = 20, filter, sort = '-created', expand = 'author,card' } = options;

		const result = await pb.collection(Collections.COMMUNITY_POSTS).getList<CommunityPost>(page, perPage, {
			filter,
			sort,
			expand,
		});

		return {
			items: result.items,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}

	static async getPublicPosts(options: CardListOptions = {}): Promise<{
		items: CommunityPost[];
		totalItems: number;
		totalPages: number;
	}> {
		return this.getPosts({ ...options, filter: 'visibility = "public"' });
	}

	static async createPost(data: Partial<CommunityPost>): Promise<CommunityPost> {
		return await pb.collection(Collections.COMMUNITY_POSTS).create<CommunityPost>(data);
	}

	static async likePost(id: string): Promise<CommunityPost> {
		const post = await pb.collection(Collections.COMMUNITY_POSTS).getOne<CommunityPost>(id);
		return await pb.collection(Collections.COMMUNITY_POSTS).update<CommunityPost>(id, {
			likes: post.likes + 1,
		});
	}
}

// ============================================
// Review Service
// ============================================

export class ReviewService {
	static async getTemplateReviews(templateId: string): Promise<Review[]> {
		return await pb.collection(Collections.REVIEWS).getFullList<Review>({
			filter: `template = "${templateId}"`,
			sort: '-created',
			expand: 'user',
		});
	}

	static async createReview(data: Partial<Review>): Promise<Review> {
		return await pb.collection(Collections.REVIEWS).create<Review>(data);
	}

	static async getUserReview(templateId: string, userId: string): Promise<Review | null> {
		try {
			const records = await pb.collection(Collections.REVIEWS).getList<Review>(1, 1, {
				filter: `template = "${templateId}" && user = "${userId}"`,
			});
			return records.items[0] || null;
		} catch (error) {
			return null;
		}
	}
}

// Re-export pb for convenience
export { pb };
