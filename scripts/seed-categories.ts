/**
 * Seed Template Categories
 *
 * Populates the template_categories collection with initial KBO-themed categories.
 * Based on data-model.md seed data.
 *
 * Run with: npx tsx scripts/seed-categories.ts
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

interface CategorySeed {
	slug: string;
	name: string;
	description?: string;
	parent?: string;
	icon?: string;
	color?: string;
	order: number;
	is_active: boolean;
}

const INITIAL_CATEGORIES: CategorySeed[] = [
	// ========================================================================
	// Top-Level Categories
	// ========================================================================
	{
		slug: 'moment-cards',
		name: '순간 카드',
		description: 'KBO 경기의 명장면을 담은 카드 템플릿',
		parent: undefined,
		icon: '⚡',
		color: '#FF6B35',
		order: 0,
		is_active: true
	},
	{
		slug: 'player-cards',
		name: '선수 카드',
		description: 'KBO 선수 프로필 카드 템플릿',
		parent: undefined,
		icon: '👤',
		color: '#004E89',
		order: 1,
		is_active: true
	},
	{
		slug: 'season-cards',
		name: '시즌 카드',
		description: '시즌 통계 및 기록 카드 템플릿',
		parent: undefined,
		icon: '📊',
		color: '#1B998B',
		order: 2,
		is_active: true
	},
	{
		slug: 'team-cards',
		name: '팀 카드',
		description: 'KBO 구단별 테마 카드 템플릿',
		parent: undefined,
		icon: '🏆',
		color: '#C5283D',
		order: 3,
		is_active: true
	},

	// ========================================================================
	// Subcategories - Moment Cards
	// ========================================================================
	{
		slug: 'homerun',
		name: '홈런',
		description: '홈런 장면 템플릿',
		parent: 'moment-cards',
		icon: '⚾',
		color: '#FF6B35',
		order: 0,
		is_active: true
	},
	{
		slug: 'pitching',
		name: '투구',
		description: '투수 명장면 템플릿',
		parent: 'moment-cards',
		icon: '🎯',
		color: '#FF6B35',
		order: 1,
		is_active: true
	},
	{
		slug: 'fielding',
		name: '수비',
		description: '환상 수비 템플릿',
		parent: 'moment-cards',
		icon: '🧤',
		color: '#FF6B35',
		order: 2,
		is_active: true
	},

	// ========================================================================
	// Subcategories - Team Cards (10 KBO Teams)
	// ========================================================================
	{
		slug: 'lg-twins',
		name: 'LG 트윈스',
		description: 'LG 트윈스 테마 템플릿',
		parent: 'team-cards',
		icon: '⚪',
		color: '#C30452',
		order: 0,
		is_active: true
	},
	{
		slug: 'doosan-bears',
		name: '두산 베어스',
		description: '두산 베어스 테마 템플릿',
		parent: 'team-cards',
		icon: '🐻',
		color: '#131230',
		order: 1,
		is_active: true
	},
	{
		slug: 'kt-wiz',
		name: 'KT 위즈',
		description: 'KT 위즈 테마 템플릿',
		parent: 'team-cards',
		icon: '🧙',
		color: '#000000',
		order: 2,
		is_active: true
	},
	{
		slug: 'ssg-landers',
		name: 'SSG 랜더스',
		description: 'SSG 랜더스 테마 템플릿',
		parent: 'team-cards',
		icon: '⚓',
		color: '#CE0E2D',
		order: 3,
		is_active: true
	},
	{
		slug: 'nc-dinos',
		name: 'NC 다이노스',
		description: 'NC 다이노스 테마 템플릿',
		parent: 'team-cards',
		icon: '🦕',
		color: '#1C4A9C',
		order: 4,
		is_active: true
	},
	{
		slug: 'kiwoom-heroes',
		name: '키움 히어로즈',
		description: '키움 히어로즈 테마 템플릿',
		parent: 'team-cards',
		icon: '🦸',
		color: '#570514',
		order: 5,
		is_active: true
	},
	{
		slug: 'kia-tigers',
		name: 'KIA 타이거즈',
		description: 'KIA 타이거즈 테마 템플릿',
		parent: 'team-cards',
		icon: '🐯',
		color: '#EA0029',
		order: 6,
		is_active: true
	},
	{
		slug: 'lotte-giants',
		name: '롯데 자이언츠',
		description: '롯데 자이언츠 테마 템플릿',
		parent: 'team-cards',
		icon: '⚡',
		color: '#041E42',
		order: 7,
		is_active: true
	},
	{
		slug: 'samsung-lions',
		name: '삼성 라이온즈',
		description: '삼성 라이온즈 테마 템플릿',
		parent: 'team-cards',
		icon: '🦁',
		color: '#074CA1',
		order: 8,
		is_active: true
	},
	{
		slug: 'hanwha-eagles',
		name: '한화 이글스',
		description: '한화 이글스 테마 템플릿',
		parent: 'team-cards',
		icon: '🦅',
		color: '#FF6600',
		order: 9,
		is_active: true
	}
];

async function seedCategories() {
	console.log('🌱 Starting category seed...');

	try {
		// First pass: Create top-level categories
		const topLevel = INITIAL_CATEGORIES.filter((c) => !c.parent);
		const categoryMap = new Map<string, string>(); // slug -> id

		console.log(`📁 Creating ${topLevel.length} top-level categories...`);
		for (const category of topLevel) {
			try {
				const record = await pb.collection('template_categories').create(category);
				categoryMap.set(category.slug, record.id);
				console.log(`  ✓ ${category.name} (${category.slug})`);
			} catch (error: any) {
				if (error?.data?.slug?.code === 'validation_not_unique') {
					console.log(`  ↷ ${category.name} already exists, fetching...`);
					const existing = await pb
						.collection('template_categories')
						.getFirstListItem(`slug="${category.slug}"`);
					categoryMap.set(category.slug, existing.id);
				} else {
					throw error;
				}
			}
		}

		// Second pass: Create subcategories with parent references
		const subcategories = INITIAL_CATEGORIES.filter((c) => c.parent);
		console.log(`\n📂 Creating ${subcategories.length} subcategories...`);

		for (const category of subcategories) {
			const parentId = categoryMap.get(category.parent!);
			if (!parentId) {
				console.error(`  ✗ Parent category not found: ${category.parent}`);
				continue;
			}

			try {
				const record = await pb.collection('template_categories').create({
					...category,
					parent: parentId
				});
				categoryMap.set(category.slug, record.id);
				console.log(`  ✓ ${category.name} (${category.slug}) → ${category.parent}`);
			} catch (error: any) {
				if (error?.data?.slug?.code === 'validation_not_unique') {
					console.log(`  ↷ ${category.name} already exists`);
				} else {
					throw error;
				}
			}
		}

		console.log(`\n✅ Seed complete! Created/verified ${INITIAL_CATEGORIES.length} categories.`);
	} catch (error) {
		console.error('❌ Seed failed:', error);
		process.exit(1);
	}
}

// Run seed
seedCategories();
