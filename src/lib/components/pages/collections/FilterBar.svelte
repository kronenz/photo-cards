<!--
  Filter Bar Component - Collection filtering and sorting
  Feature: 003-navigation-ui-renewal
  Task: T064 - US3
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let teams: string[] = [];
	export let selectedTeam = '';
	export let sortBy: 'name' | 'date' | 'team' = 'date';
	export let searchQuery = '';

	const dispatch = createEventDispatcher<{
		filter: { team: string; sortBy: string; search: string };
	}>();

	function handleFilter() {
		dispatch('filter', {
			team: selectedTeam,
			sortBy,
			search: searchQuery
		});
	}

	$: {
		handleFilter();
	}
</script>

<div class="filter-bar">
	<div class="search-box">
		<span class="search-icon" aria-hidden="true">🔍</span>
		<input
			type="search"
			bind:value={searchQuery}
			placeholder="선수 이름 검색..."
			class="search-input"
			aria-label="선수 이름 검색"
		/>
	</div>

	<div class="filter-controls">
		<select
			bind:value={selectedTeam}
			class="filter-select"
			aria-label="구단 필터"
		>
			<option value="">전체 구단</option>
			{#each teams as team}
				<option value={team}>{team}</option>
			{/each}
		</select>

		<select
			bind:value={sortBy}
			class="filter-select"
			aria-label="정렬 기준"
		>
			<option value="date">최신순</option>
			<option value="name">이름순</option>
			<option value="team">구단별</option>
		</select>
	</div>
</div>

<style>
	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		padding: var(--space-lg);
		background-color: var(--surface-secondary);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-lg);
	}

	.search-box {
		flex: 1;
		min-width: 250px;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--space-md);
		font-size: 1.2em;
		color: var(--text-secondary);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) * 3);
		font-size: var(--font-body);
		color: var(--text-primary);
		background-color: var(--surface-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.search-input:hover {
		border-color: var(--primary);
	}

	.search-input:focus {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
		border-color: var(--primary);
	}

	.filter-controls {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.filter-select {
		padding: var(--space-md) var(--space-lg);
		font-size: var(--font-body);
		color: var(--text-primary);
		background-color: var(--surface-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 150px;
	}

	.filter-select:hover {
		border-color: var(--primary);
	}

	.filter-select:focus {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
		border-color: var(--primary);
	}

	@media (max-width: 768px) {
		.filter-bar {
			flex-direction: column;
		}

		.search-box {
			min-width: 100%;
		}

		.filter-controls {
			width: 100%;
		}

		.filter-select {
			flex: 1;
			min-width: 0;
		}
	}
</style>
