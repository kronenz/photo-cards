<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import TemplateGrid from '$lib/components/marketplace/TemplateGrid.svelte';
	import TemplateCard from '$lib/components/marketplace/TemplateCard.svelte';
	import TemplateDetailModal from '$lib/components/marketplace/TemplateDetailModal.svelte';
	import TemplateUploadModal from '$lib/components/marketplace/TemplateUploadModal.svelte';
	import TemplateFilters from '$lib/components/marketplace/TemplateFilters.svelte';
	import TrendingTemplates from '$lib/components/marketplace/TrendingTemplates.svelte';
	import RecommendedTemplates from '$lib/components/marketplace/RecommendedTemplates.svelte';
	import { debounce } from '$lib/utils/debounce';
	import type { Template, TemplateCategory } from '$lib/types/template';
	import type { Card } from '$lib/types/collections';

	// State
	let templates: Template[] = [];
	let categories: TemplateCategory[] = [];
	let loading = true;
	let error: string | null = null;

	// Filters
	let selectedCategory = '';
	let searchQuery = '';
	let selectedSort = '-created'; // Default: newest first
	let minRating = 0;
	let teamFilter = '';

	// Pagination
	let currentPage = 1;
	let totalPages = 1;
	let totalItems = 0;
	const perPage = 20;

	// Modals
	let showDetailModal = false;
	let showUploadModal = false;
	let selectedTemplate: Template | null = null;
	let selectedCard: Card | null = null;

	// Sort options
	const sortOptions = [
		{ value: '-created', label: '최신순' },
		{ value: 'created', label: '오래된 순' },
		{ value: '-rating_average', label: '평점 높은 순' },
		{ value: '-download_count', label: '다운로드 많은 순' },
		{ value: 'title', label: '이름 순' }
	];

	onMount(async () => {
		await Promise.all([loadCategories(), loadTemplates()]);
	});

	async function loadCategories() {
		try {
			const response = await fetch('/api/templates/categories');
			if (!response.ok) throw new Error('Failed to load categories');

			categories = await response.json();
		} catch (err) {
			console.error('Categories error:', err);
		}
	}

	async function loadTemplates() {
		try {
			loading = true;
			error = null;

			// Use search endpoint when filters are active
			const hasAdvancedFilters = searchQuery.trim() || minRating > 0 || teamFilter;
			const endpoint = hasAdvancedFilters ? '/api/templates/search' : '/api/templates';

			// Build query params
			const params = new URLSearchParams({
				page: currentPage.toString(),
				perPage: perPage.toString(),
				sort: selectedSort,
				expand: 'author,category'
			});

			if (selectedCategory) {
				params.set('category', selectedCategory);
			}

			if (searchQuery.trim()) {
				params.set('q', searchQuery.trim());
			}

			if (minRating > 0) {
				params.set('minRating', minRating.toString());
			}

			if (teamFilter) {
				params.set('team', teamFilter);
			}

			const response = await fetch(`${endpoint}?${params}`);
			if (!response.ok) throw new Error('Failed to load templates');

			const data = await response.json();
			templates = data.items;
			totalPages = data.totalPages;
			totalItems = data.totalItems;
		} catch (err) {
			console.error('Templates error:', err);
			error = err instanceof Error ? err.message : 'Failed to load templates';
		} finally {
			loading = false;
		}
	}

	function handleCardClick(event: CustomEvent<Template>) {
		selectedTemplate = event.detail;
		showDetailModal = true;
	}

	function handleTemplateDownloaded(event: CustomEvent) {
		console.log('Template downloaded:', event.detail);
		// Optionally show success toast
	}

	function handleTemplateUploaded(event: CustomEvent) {
		console.log('Template uploaded:', event.detail);
		// Reload templates to show new upload
		loadTemplates();
	}

	function handleCategoryChange() {
		currentPage = 1;
		loadTemplates();
	}

	// Debounced search (300ms)
	const debouncedLoadTemplates = debounce(() => {
		loadTemplates();
	}, 300);

	function handleSearchInput() {
		currentPage = 1;
		debouncedLoadTemplates();
	}

	function handleSortChange() {
		currentPage = 1;
		loadTemplates();
	}

	function handleFilterChange(event: CustomEvent) {
		const filters = event.detail;
		selectedSort = filters.sortBy;
		selectedCategory = filters.category;
		minRating = filters.minRating;
		teamFilter = filters.team;
		currentPage = 1;
		loadTemplates();
	}

	function goToPage(page: number) {
		currentPage = page;
		loadTemplates();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function nextPage() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	}

	function openUploadModal() {
		// For demo, create a mock card
		// In production, this would come from user's collection
		selectedCard = {
			id: 'demo_card_001',
			title: '데모 카드',
			description: '업로드 테스트용 카드',
			image: '/placeholder-card.jpg',
			rarity: 'rare' as any,
			type: 'player' as any,
			holographicEffect: {
				type: 'rainbow',
				intensity: 0.8,
				animationSpeed: 1.0
			},
			stats: { likes: 0, views: 0, downloads: 0, comments: 0, rating: 0 },
			metadata: { tags: [], playerName: '', team: '' },
			collections: [],
			owner: '',
			isPublic: true,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		showUploadModal = true;
	}
</script>

<svelte:head>
	<title>템플릿 마켓플레이스 - 홀로그래픽 카드</title>
	<meta name="description" content="홀로그래픽 카드 템플릿을 검색하고 다운로드하세요" />
</svelte:head>

<div class="marketplace-page">
	<!-- Header -->
	<header class="page-header">
		<div class="header-content">
			<div class="title-section">
				<h1>템플릿 마켓플레이스</h1>
				<p class="subtitle">크리에이터들이 만든 멋진 카드 템플릿을 발견하고 다운로드하세요</p>
			</div>

			<button class="btn-upload" on:click={openUploadModal}>
				<span class="upload-icon">⬆️</span>
				<span>템플릿 업로드</span>
			</button>
		</div>

		<!-- Stats -->
		<div class="stats-bar">
			<div class="stat">
				<span class="stat-value">{totalItems}</span>
				<span class="stat-label">템플릿</span>
			</div>
			<div class="stat">
				<span class="stat-value">{categories.length}</span>
				<span class="stat-label">카테고리</span>
			</div>
		</div>
	</header>

	<!-- Filters & Search -->
	<div class="filters-section">
		<div class="filters-row">
			<!-- Search -->
			<div class="search-box">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					bind:value={searchQuery}
					on:input={handleSearchInput}
					placeholder="템플릿 검색..."
					class="search-input"
				/>
			</div>
		</div>

		<!-- Advanced Filters Component -->
		<div class="advanced-filters-wrapper">
			<TemplateFilters
				{categories}
				initialFilters={{
					sortBy: selectedSort,
					category: selectedCategory,
					minRating,
					team: teamFilter
				}}
				on:change={handleFilterChange}
			/>
		</div>
	</div>

	<!-- Content -->
	<main class="marketplace-content">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>템플릿을 불러오는 중...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<div class="error-icon">❌</div>
				<h3>오류 발생</h3>
				<p>{error}</p>
				<button class="btn-retry" on:click={loadTemplates}>다시 시도</button>
			</div>
		{:else}
			<TemplateGrid {templates} on:cardclick={handleCardClick} />

			<!-- Trending Section (only show on first page with no filters) -->
			{#if currentPage === 1 && !searchQuery && !selectedCategory && minRating === 0 && !teamFilter}
				<TrendingTemplates on:cardclick={handleCardClick} />
			{/if}

			<!-- Recommended Section (only show on first page with no filters) -->
			{#if currentPage === 1 && !searchQuery && !selectedCategory && minRating === 0 && !teamFilter}
				<RecommendedTemplates on:cardclick={handleCardClick} />
			{/if}

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="pagination">
					<button
						class="pagination-btn"
						on:click={previousPage}
						disabled={currentPage === 1}
					>
						이전
					</button>

					<div class="pagination-pages">
						{#each Array(totalPages) as _, index}
							{#if index + 1 === 1 || index + 1 === totalPages || Math.abs(index + 1 - currentPage) <= 2}
								<button
									class="pagination-page"
									class:active={currentPage === index + 1}
									on:click={() => goToPage(index + 1)}
								>
									{index + 1}
								</button>
							{:else if Math.abs(index + 1 - currentPage) === 3}
								<span class="pagination-ellipsis">...</span>
							{/if}
						{/each}
					</div>

					<button
						class="pagination-btn"
						on:click={nextPage}
						disabled={currentPage === totalPages}
					>
						다음
					</button>
				</div>
			{/if}
		{/if}
	</main>

	<!-- Modals -->
	<TemplateDetailModal
		bind:isOpen={showDetailModal}
		bind:template={selectedTemplate}
		on:downloaded={handleTemplateDownloaded}
	/>

	<TemplateUploadModal
		bind:isOpen={showUploadModal}
		bind:selectedCard
		on:uploaded={handleTemplateUploaded}
	/>
</div>

<style>
	.marketplace-page {
		min-height: 100vh;
		background: #0a0a0a;
		color: #fff;
	}

	/* Header */
	.page-header {
		padding: 40px 24px 24px;
		background: linear-gradient(180deg, rgba(0, 122, 255, 0.1) 0%, transparent 100%);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 24px;
	}

	.title-section h1 {
		margin: 0 0 12px 0;
		font-size: 36px;
		font-weight: 800;
		background: linear-gradient(135deg, #fff, #007aff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		margin: 0;
		font-size: 16px;
		color: #999;
	}

	.btn-upload {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s;
		white-space: nowrap;
	}

	.btn-upload:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4);
	}

	.upload-icon {
		font-size: 18px;
	}

	.stats-bar {
		max-width: 1400px;
		margin: 24px auto 0;
		display: flex;
		gap: 32px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 800;
		color: #fff;
	}

	.stat-label {
		font-size: 13px;
		color: #999;
	}

	/* Filters */
	.filters-section {
		padding: 24px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(20px);
	}

	.filters-row {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		gap: 16px;
		margin-bottom: 16px;
	}

	.advanced-filters-wrapper {
		max-width: 1400px;
		margin: 0 auto;
	}

	.search-box {
		flex: 1;
		max-width: 400px;
		position: relative;
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 0 16px;
	}

	.search-icon {
		font-size: 18px;
		margin-right: 12px;
		opacity: 0.5;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		color: #fff;
		font-size: 15px;
		padding: 12px 0;
		outline: none;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.filter-select {
		min-width: 200px;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: #fff;
		font-size: 15px;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.filter-select:hover {
		border-color: rgba(255, 255, 255, 0.2);
	}

	.filter-select:focus {
		outline: none;
		border-color: #007aff;
	}

	/* Content */
	.marketplace-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	/* Loading & Error States */
	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 20px;
		text-align: center;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: #007aff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-icon {
		font-size: 64px;
		margin-bottom: 20px;
		opacity: 0.5;
	}

	.error-state h3 {
		margin: 0 0 12px 0;
		font-size: 24px;
		font-weight: 700;
	}

	.error-state p {
		margin: 0 0 24px 0;
		color: #999;
	}

	.btn-retry {
		padding: 12px 32px;
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-retry:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4);
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12px;
		margin-top: 40px;
		padding: 20px;
	}

	.pagination-btn {
		padding: 10px 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pagination-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.pagination-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.pagination-pages {
		display: flex;
		gap: 6px;
	}

	.pagination-page {
		min-width: 40px;
		height: 40px;
		padding: 0 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pagination-page:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.pagination-page.active {
		background: linear-gradient(135deg, #007aff, #00c6ff);
		border-color: transparent;
	}

	.pagination-ellipsis {
		display: flex;
		align-items: center;
		padding: 0 8px;
		color: #666;
		font-size: 14px;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.title-section h1 {
			font-size: 28px;
		}

		.subtitle {
			font-size: 14px;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
		}

		.btn-upload {
			width: 100%;
			justify-content: center;
		}

		.filters-row {
			flex-direction: column;
		}

		.search-box {
			max-width: none;
		}

		.filter-select {
			width: 100%;
		}

		.marketplace-content {
			padding: 24px 16px;
		}

		.pagination-pages {
			flex-wrap: wrap;
		}
	}
</style>
