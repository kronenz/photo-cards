<script lang="ts">
	import { onMount } from 'svelte';
	import TemplateCard from './TemplateCard.svelte';
	import type { Template } from '$lib/types/template';

	export let days = 7; // Trending period in days

	interface TrendingTemplate extends Template {
		trending_metrics?: {
			recent_downloads: number;
			trending_score: number;
			rank: number;
		};
	}

	let trending: TrendingTemplate[] = [];
	let loading = true;
	let periodDays = days;

	onMount(async () => {
		await loadTrending();
	});

	async function loadTrending() {
		try {
			loading = true;
			const response = await fetch(`/api/templates/trending?days=${days}&limit=10`);
			if (!response.ok) throw new Error('Failed to load trending templates');

			const data = await response.json();
			trending = data.items || [];
			periodDays = data.period_days || days;
		} catch (error) {
			console.error('Trending error:', error);
			trending = [];
		} finally {
			loading = false;
		}
	}

	function getTrendingIcon(rank: number): string {
		if (rank === 1) return '🔥';
		if (rank === 2) return '⚡';
		if (rank === 3) return '✨';
		return '📈';
	}
</script>

{#if trending.length > 0}
	<section class="trending-templates">
		<div class="section-header">
			<div class="title-group">
				<h2>
					<span class="trending-icon">🔥</span>
					지금 뜨는 템플릿
				</h2>
				<p class="subtitle">최근 {periodDays}일간 가장 인기있는 템플릿</p>
			</div>
		</div>

		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>트렌딩 템플릿을 불러오는 중...</p>
			</div>
		{:else}
			<div class="trending-grid">
				{#each trending as template, index (template.id)}
					<div class="trending-card">
						<div class="rank-badge" data-rank={index + 1}>
							<span class="rank-icon">{getTrendingIcon(index + 1)}</span>
							<span class="rank-number">#{index + 1}</span>
						</div>

						{#if template.trending_metrics}
							<div class="trending-stats">
								<div class="stat">
									<span class="stat-label">최근 다운로드</span>
									<span class="stat-value">{template.trending_metrics.recent_downloads}</span>
								</div>
								{#if template.trending_metrics.trending_score > 50}
									<div class="hot-badge">🔥 HOT</div>
								{/if}
							</div>
						{/if}

						<TemplateCard {template} on:cardclick />
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.trending-templates {
		margin-top: 48px;
		padding-top: 48px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.section-header {
		margin-bottom: 32px;
	}

	.title-group h2 {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 800;
		display: flex;
		align-items: center;
		gap: 12px;
		background: linear-gradient(135deg, #ff6b6b, #ff8e53);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.trending-icon {
		font-size: 32px;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.subtitle {
		margin: 0;
		font-size: 14px;
		color: #999;
	}

	.trending-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	.trending-card {
		position: relative;
	}

	.rank-badge {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		font-size: 14px;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.rank-badge[data-rank='1'] {
		background: linear-gradient(135deg, #ffd700, #ffed4e);
		color: #000;
		border-color: #ffd700;
	}

	.rank-badge[data-rank='2'] {
		background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
		color: #000;
		border-color: #c0c0c0;
	}

	.rank-badge[data-rank='3'] {
		background: linear-gradient(135deg, #cd7f32, #e8a87c);
		color: #fff;
		border-color: #cd7f32;
	}

	.rank-icon {
		font-size: 16px;
	}

	.rank-number {
		font-family: 'Courier New', monospace;
	}

	.trending-stats {
		position: absolute;
		top: 56px;
		left: 12px;
		right: 12px;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 8px;
		font-size: 11px;
	}

	.stat-label {
		color: #999;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		color: #fff;
		font-size: 14px;
		font-weight: 700;
	}

	.hot-badge {
		padding: 6px 10px;
		background: linear-gradient(135deg, #ff6b6b, #ff8e53);
		border-radius: 8px;
		font-size: 12px;
		font-weight: 700;
		color: #fff;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #ff6b6b;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-state p {
		margin: 0;
		color: #999;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.trending-templates {
			margin-top: 32px;
			padding-top: 32px;
		}

		.title-group h2 {
			font-size: 24px;
		}

		.trending-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			gap: 16px;
		}

		.trending-stats {
			flex-direction: column;
			align-items: flex-start;
		}

		.stat {
			font-size: 10px;
		}

		.stat-value {
			font-size: 12px;
		}
	}
</style>
