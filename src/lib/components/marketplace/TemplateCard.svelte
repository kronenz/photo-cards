<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Template } from '$lib/types/template';

	export let template: Template;

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click', template);
	}

	// Format numbers with K/M suffix
	function formatNumber(num: number | undefined): string {
		if (!num) return '0';
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	}

	// Get author username from expanded relation
	$: authorName =
		template.expand?.author?.username || template.expand?.author?.name || '익명';
</script>

<div class="template-card" on:click={handleClick} on:keydown={handleClick} role="button" tabindex="0">
	<!-- Thumbnail -->
	<div class="thumbnail-container">
		<img
			src={template.thumbnail_url}
			alt={template.title}
			loading="lazy"
			class="thumbnail"
		/>

		<!-- Premium Badge -->
		{#if template.is_premium}
			<div class="premium-badge">
				<span class="premium-icon">👑</span>
				<span class="premium-price">{template.price}{template.currency === 'KRW' ? '원' : '$'}</span>
			</div>
		{/if}

		<!-- Featured Badge -->
		{#if template.featured}
			<div class="featured-badge">⭐ Featured</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="card-content">
		<!-- Title -->
		<h3 class="title">{template.title}</h3>

		<!-- Author -->
		<p class="author">by {authorName}</p>

		<!-- Stats -->
		<div class="stats">
			<div class="stat">
				<span class="stat-icon">⭐</span>
				<span class="stat-value">
					{template.rating_average ? template.rating_average.toFixed(1) : 'N/A'}
				</span>
				{#if template.rating_count}
					<span class="stat-count">({formatNumber(template.rating_count)})</span>
				{/if}
			</div>

			<div class="stat">
				<span class="stat-icon">⬇️</span>
				<span class="stat-value">{formatNumber(template.download_count)}</span>
			</div>

			{#if template.view_count}
				<div class="stat">
					<span class="stat-icon">👁️</span>
					<span class="stat-value">{formatNumber(template.view_count)}</span>
				</div>
			{/if}
		</div>

		<!-- Tags -->
		{#if template.tags && template.tags.length > 0}
			<div class="tags">
				{#each template.tags.slice(0, 3) as tag}
					<span class="tag">{tag}</span>
				{/each}
				{#if template.tags.length > 3}
					<span class="tag-more">+{template.tags.length - 3}</span>
				{/if}
			</div>
		{/if}

		<!-- Remix Badge -->
		{#if template.is_remix}
			<div class="remix-badge">🔄 Remix</div>
		{/if}
	</div>
</div>

<style>
	.template-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		contain: layout style paint;
		will-change: transform, box-shadow;
	}

	.template-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.template-card:focus {
		outline: 2px solid #007aff;
		outline-offset: 2px;
	}

	.thumbnail-container {
		position: relative;
		width: 100%;
		padding-top: 140%; /* 5:7 aspect ratio for card */
		overflow: hidden;
		background: rgba(0, 0, 0, 0.3);
	}

	.thumbnail {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.template-card:hover .thumbnail {
		transform: scale(1.05);
	}

	.premium-badge {
		position: absolute;
		top: 8px;
		right: 8px;
		background: linear-gradient(135deg, #ffd700, #ff8c00);
		color: #000;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 4px;
		box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
	}

	.premium-icon {
		font-size: 14px;
	}

	.featured-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(0, 122, 255, 0.4);
	}

	.card-content {
		padding: 12px;
	}

	.title {
		margin: 0 0 6px 0;
		font-size: 15px;
		font-weight: 600;
		color: #fff;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 1.4;
		min-height: 42px;
	}

	.author {
		margin: 0 0 12px 0;
		font-size: 13px;
		color: #999;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.stats {
		display: flex;
		gap: 12px;
		margin-bottom: 10px;
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		color: #e0e0e0;
	}

	.stat-icon {
		font-size: 14px;
		opacity: 0.8;
	}

	.stat-value {
		font-weight: 600;
	}

	.stat-count {
		font-size: 11px;
		color: #999;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 8px;
	}

	.tag {
		display: inline-block;
		padding: 3px 8px;
		background: rgba(0, 122, 255, 0.15);
		border: 1px solid rgba(0, 122, 255, 0.3);
		border-radius: 10px;
		font-size: 11px;
		color: #66b3ff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100px;
	}

	.tag-more {
		display: inline-block;
		padding: 3px 8px;
		font-size: 11px;
		color: #999;
		font-weight: 600;
	}

	.remix-badge {
		display: inline-block;
		padding: 4px 10px;
		background: rgba(156, 39, 176, 0.2);
		border: 1px solid rgba(156, 39, 176, 0.4);
		border-radius: 10px;
		font-size: 11px;
		color: #ba68c8;
		font-weight: 600;
	}

	/* Performance optimizations */
	@media (prefers-reduced-motion: reduce) {
		.template-card,
		.thumbnail {
			transition: none;
		}
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.title {
			font-size: 14px;
		}

		.author {
			font-size: 12px;
		}

		.stat {
			font-size: 12px;
		}
	}
</style>
