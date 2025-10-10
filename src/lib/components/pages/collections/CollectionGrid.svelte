<!--
  Collection Grid Component - Masonry-style card grid
  Feature: 003-navigation-ui-renewal
  Task: T063 - US3
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import SkeletonLoader from '$lib/components/design-system/SkeletonLoader.svelte';

	export let cards: Array<{
		id: string;
		imageUrl: string;
		playerName: string;
		team: string;
		position: string;
	}> = [];
	export let loading = false;

	let gridElement: HTMLDivElement;

	onMount(() => {
		// Setup virtual scrolling if needed for large collections
	});
</script>

<div class="collection-grid" bind:this={gridElement}>
	{#if loading}
		{#each Array(8) as _, i (i)}
			<div class="grid-item">
				<SkeletonLoader height="300px" />
			</div>
		{/each}
	{:else if cards.length === 0}
		<div class="empty-state">
			<span class="empty-icon">📚</span>
			<h3 class="empty-title">컬렉션이 비어있습니다</h3>
			<p class="empty-text">첫 번째 카드를 만들어보세요!</p>
			<a href="/create" class="empty-button">카드 만들기</a>
		</div>
	{:else}
		{#each cards as card (card.id)}
			<a href="/cards/{card.id}" class="grid-item">
				<div class="card-container">
					<img src={card.imageUrl} alt={card.playerName} class="card-image" />
					<div class="card-overlay">
						<h4 class="card-title">{card.playerName}</h4>
						<p class="card-meta">{card.team} • {card.position}</p>
					</div>
				</div>
			</a>
		{/each}
	{/if}
</div>

<style>
	.collection-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--space-lg);
		padding: var(--space-lg);
	}

	.grid-item {
		position: relative;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: all var(--transition-fast);
		text-decoration: none;
	}

	.grid-item:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}

	.card-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-base);
	}

	.grid-item:hover .card-image {
		transform: scale(1.05);
	}

	.card-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: var(--space-lg);
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.8),
			rgba(0, 0, 0, 0.4),
			transparent
		);
		color: white;
		transform: translateY(100%);
		transition: transform var(--transition-base);
	}

	.grid-item:hover .card-overlay,
	.grid-item:focus-visible .card-overlay {
		transform: translateY(0);
	}

	.card-title {
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--space-xs) 0;
	}

	.card-meta {
		font-size: var(--font-callout);
		opacity: 0.9;
		margin: 0;
	}

	.empty-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-3xl);
		text-align: center;
	}

	.empty-icon {
		font-size: 64px;
		opacity: 0.5;
		margin-bottom: var(--space-lg);
	}

	.empty-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-sm) 0;
	}

	.empty-text {
		font-size: var(--font-body);
		color: var(--text-secondary);
		margin: 0 0 var(--space-xl) 0;
	}

	.empty-button {
		padding: var(--space-md) var(--space-xl);
		background-color: var(--primary);
		color: white;
		text-decoration: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-semibold);
		transition: all var(--transition-fast);
	}

	.empty-button:hover {
		background-color: var(--primary-dark);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	@media (max-width: 1024px) {
		.collection-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: var(--space-md);
		}
	}

	@media (max-width: 768px) {
		.collection-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: var(--space-sm);
			padding: var(--space-md);
		}

		.card-overlay {
			padding: var(--space-md);
		}

		.card-title {
			font-size: var(--font-body);
		}

		.card-meta {
			font-size: var(--font-callout);
		}
	}
</style>
