<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import TemplateCard from './TemplateCard.svelte';
	import type { Template } from '$lib/types/template';

	export let templates: Template[] = [];
	export let columns: number = 3; // Auto-adjust based on viewport

	const dispatch = createEventDispatcher();

	let containerWidth = 0;
	let gridElement: HTMLDivElement;

	// Masonry layout state
	let masonryLayout: { template: Template; left: number; top: number; height: number }[] = [];

	// Performance optimization: Use RAF throttling for scroll
	let ticking = false;

	// Auto-adjust columns based on container width
	$: {
		if (containerWidth < 640) columns = 1; // Mobile
		else if (containerWidth < 1024) columns = 2; // Tablet
		else if (containerWidth < 1536) columns = 3; // Desktop
		else columns = 4; // Large desktop
	}

	// Calculate masonry layout
	$: {
		if (templates.length > 0 && containerWidth > 0) {
			calculateMasonryLayout();
		}
	}

	function calculateMasonryLayout() {
		const columnWidth = containerWidth / columns;
		const gap = 16;
		const columnHeights = new Array(columns).fill(0);
		const newLayout: typeof masonryLayout = [];

		templates.forEach((template) => {
			// Find column with minimum height
			const minHeight = Math.min(...columnHeights);
			const columnIndex = columnHeights.indexOf(minHeight);

			// Calculate position
			const left = columnIndex * columnWidth;
			const top = columnHeights[columnIndex];

			// Estimate card height (ratio-based)
			// Thumbnail: 5:7 ratio, content: ~100-150px
			const thumbnailHeight = (columnWidth - gap * 2) * 1.4;
			const contentHeight = 140; // Approximate content height
			const cardHeight = thumbnailHeight + contentHeight + gap;

			newLayout.push({
				template,
				left,
				top,
				height: cardHeight
			});

			// Update column height
			columnHeights[columnIndex] += cardHeight + gap;
		});

		masonryLayout = newLayout;
	}

	function handleCardClick(event: CustomEvent<Template>) {
		dispatch('cardclick', event.detail);
	}

	function handleResize() {
		if (!ticking && gridElement) {
			window.requestAnimationFrame(() => {
				containerWidth = gridElement.offsetWidth;
				ticking = false;
			});
			ticking = true;
		}
	}

	onMount(() => {
		if (gridElement) {
			containerWidth = gridElement.offsetWidth;
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div class="template-grid-container" bind:this={gridElement}>
	{#if templates.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🎨</div>
			<h3>템플릿이 없습니다</h3>
			<p>첫 번째 템플릿을 업로드해보세요!</p>
		</div>
	{:else}
		<div
			class="template-grid"
			style="height: {Math.max(...masonryLayout.map((item) => item.top + item.height))}px"
		>
			{#each masonryLayout as { template, left, top }, index (template.id)}
				<div
					class="grid-item"
					style="
						position: absolute;
						left: {left}px;
						top: {top}px;
						width: {containerWidth / columns - 16}px;
						transition: opacity 0.3s ease {index * 0.02}s;
					"
				>
					<TemplateCard {template} on:click={handleCardClick} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.template-grid-container {
		width: 100%;
		min-height: 400px;
		position: relative;
	}

	.template-grid {
		position: relative;
		width: 100%;
		transition: height 0.3s ease;
		contain: layout style;
	}

	.grid-item {
		contain: layout style paint;
		will-change: transform;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 20px;
		text-align: center;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 20px;
		opacity: 0.5;
	}

	.empty-state h3 {
		margin: 0 0 12px 0;
		font-size: 24px;
		font-weight: 700;
		color: #fff;
	}

	.empty-state p {
		margin: 0;
		font-size: 16px;
		color: #999;
	}

	/* Performance optimizations */
	@media (prefers-reduced-motion: reduce) {
		.grid-item {
			transition: none !important;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.template-grid-container {
			min-height: 300px;
		}

		.empty-state {
			padding: 60px 20px;
		}

		.empty-icon {
			font-size: 48px;
		}

		.empty-state h3 {
			font-size: 20px;
		}

		.empty-state p {
			font-size: 14px;
		}
	}
</style>
