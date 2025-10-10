<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let categories: Array<{ id: string; name: string }> = [];
	export let initialFilters: FilterOptions = {
		sortBy: '-created',
		category: '',
		minRating: 0,
		team: ''
	};

	interface FilterOptions {
		sortBy: string;
		category: string;
		minRating: number;
		team: string;
	}

	let sortBy = initialFilters.sortBy;
	let category = initialFilters.category;
	let minRating = initialFilters.minRating;
	let team = initialFilters.team;
	let showAdvanced = false;

	// Teams
	const teams = [
		{ id: '', name: '모든 팀' },
		{ id: 'lg-twins', name: 'LG 트윈스' },
		{ id: 'doosan-bears', name: '두산 베어스' },
		{ id: 'kia-tigers', name: 'KIA 타이거즈' },
		{ id: 'samsung-lions', name: '삼성 라이온즈' },
		{ id: 'lotte-giants', name: '롯데 자이언츠' },
		{ id: 'ssg-landers', name: 'SSG 랜더스' },
		{ id: 'kt-wiz', name: 'KT 위즈' },
		{ id: 'nc-dinos', name: 'NC 다이노스' },
		{ id: 'hanwha-eagles', name: '한화 이글스' },
		{ id: 'kiwoom-heroes', name: '키움 히어로즈' }
	];

	// Sort options
	const sortOptions = [
		{ value: '-created', label: '최신순' },
		{ value: 'created', label: '오래된 순' },
		{ value: '-rating_average', label: '평점 높은 순' },
		{ value: '-download_count', label: '다운로드 많은 순' },
		{ value: 'title', label: '이름 순 (A-Z)' }
	];

	// Rating filters
	const ratingFilters = [
		{ value: 0, label: '전체' },
		{ value: 4, label: '⭐ 4.0 이상' },
		{ value: 4.5, label: '⭐ 4.5 이상' }
	];

	function applyFilters() {
		dispatch('change', {
			sortBy,
			category,
			minRating,
			team
		});
	}

	function resetFilters() {
		sortBy = '-created';
		category = '';
		minRating = 0;
		team = '';
		applyFilters();
	}

	// Reactive application of filters
	$: {
		sortBy, category, minRating, team;
		applyFilters();
	}

	// Count active filters
	$: activeFilterCount = [category, minRating > 0, team].filter(Boolean).length;
</script>

<div class="template-filters">
	<div class="filters-main">
		<!-- Sort Dropdown -->
		<div class="filter-group">
			<label for="sort" class="filter-label">정렬</label>
			<select id="sort" bind:value={sortBy} class="filter-select">
				{#each sortOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Advanced Filters Toggle -->
		<button
			type="button"
			class="btn-advanced"
			class:active={showAdvanced}
			on:click={() => (showAdvanced = !showAdvanced)}
		>
			<span class="filter-icon">🔍</span>
			<span>고급 필터</span>
			{#if activeFilterCount > 0}
				<span class="filter-badge">{activeFilterCount}</span>
			{/if}
		</button>

		<!-- Reset Button -->
		{#if activeFilterCount > 0}
			<button type="button" class="btn-reset" on:click={resetFilters}>
				<span>초기화</span>
			</button>
		{/if}
	</div>

	<!-- Advanced Filters Panel -->
	{#if showAdvanced}
		<div class="filters-advanced">
			<div class="advanced-grid">
				<!-- Category Filter -->
				<div class="filter-group">
					<label for="category" class="filter-label">카테고리</label>
					<select id="category" bind:value={category} class="filter-select">
						<option value="">모든 카테고리</option>
						{#each categories as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>

				<!-- Team Filter -->
				<div class="filter-group">
					<label for="team" class="filter-label">팀</label>
					<select id="team" bind:value={team} class="filter-select">
						{#each teams as t}
							<option value={t.id}>{t.name}</option>
						{/each}
					</select>
				</div>

				<!-- Rating Filter -->
				<div class="filter-group">
					<label for="rating" class="filter-label">평점</label>
					<select id="rating" bind:value={minRating} class="filter-select">
						{#each ratingFilters as rating}
							<option value={rating.value}>{rating.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.template-filters {
		padding: 20px;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.filters-main {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.filter-label {
		font-size: 13px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.filter-select {
		min-width: 180px;
		padding: 10px 14px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #fff;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-select:hover {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
	}

	.filter-select:focus {
		outline: none;
		border-color: #007aff;
		box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
	}

	.btn-advanced {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}

	.btn-advanced:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.btn-advanced.active {
		background: rgba(0, 122, 255, 0.15);
		border-color: #007aff;
	}

	.filter-icon {
		font-size: 16px;
	}

	.filter-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: #007aff;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 700;
	}

	.btn-reset {
		padding: 10px 16px;
		background: rgba(255, 59, 48, 0.1);
		border: 1px solid rgba(255, 59, 48, 0.3);
		border-radius: 8px;
		color: #ff3b30;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-reset:hover {
		background: rgba(255, 59, 48, 0.2);
		border-color: rgba(255, 59, 48, 0.5);
	}

	.filters-advanced {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.advanced-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.filters-main {
			flex-direction: column;
			align-items: stretch;
		}

		.filter-select,
		.btn-advanced,
		.btn-reset {
			width: 100%;
		}

		.advanced-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
