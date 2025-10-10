<script lang="ts">
	import { onMount } from 'svelte';

	export let templateId: string;

	interface RatingDistribution {
		5: number;
		4: number;
		3: number;
		2: number;
		1: number;
	}

	interface RatingStatsData {
		average: number;
		count: number;
		distribution: RatingDistribution;
		verified_purchase_percentage: number;
	}

	let stats: RatingStatsData = {
		average: 0,
		count: 0,
		distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
		verified_purchase_percentage: 0
	};

	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadStats();
	});

	async function loadStats() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch(`/api/templates/${templateId}/rating`);

			if (!response.ok) {
				throw new Error('Failed to load rating stats');
			}

			stats = await response.json();
		} catch (err) {
			console.error('Failed to load rating stats:', err);
			error = 'Failed to load rating stats';
		} finally {
			isLoading = false;
		}
	}

	function getPercentage(count: number): number {
		if (stats.count === 0) return 0;
		return (count / stats.count) * 100;
	}

	function getStarColor(rating: number): string {
		if (rating >= 4.5) return '#4caf50'; // Green
		if (rating >= 3.5) return '#ffc107'; // Amber
		if (rating >= 2.5) return '#ff9800'; // Orange
		return '#f44336'; // Red
	}
</script>

<div class="rating-stats">
	{#if isLoading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if stats.count === 0}
		<div class="no-ratings">
			<span class="no-ratings-icon">⭐</span>
			<p>아직 평점이 없습니다</p>
		</div>
	{:else}
		<div class="stats-container">
			<!-- Average Rating -->
			<div class="average-section">
				<div class="average-value" style="color: {getStarColor(stats.average)}">
					{stats.average.toFixed(1)}
				</div>
				<div class="stars">
					{#each Array(5) as _, i}
						<span class="star" class:filled={i < Math.round(stats.average)}>★</span>
					{/each}
				</div>
				<div class="count">{stats.count}개의 평가</div>
				{#if stats.verified_purchase_percentage > 0}
					<div class="verified-info">
						✓ {stats.verified_purchase_percentage.toFixed(0)}% 인증된 다운로드
					</div>
				{/if}
			</div>

			<!-- Rating Distribution -->
			<div class="distribution-section">
				{#each [5, 4, 3, 2, 1] as star}
					<div class="distribution-row">
						<span class="star-label">{star}★</span>
						<div class="progress-bar">
							<div
								class="progress-fill"
								style="width: {getPercentage(stats.distribution[star])}%; background-color: {getStarColor(
									star
								)}"
							></div>
						</div>
						<span class="count-label">{stats.distribution[star]}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.rating-stats {
		width: 100%;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 40px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #007aff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		padding: 20px;
		text-align: center;
		color: #ff6b6b;
		font-size: 14px;
	}

	.no-ratings {
		text-align: center;
		padding: 40px 20px;
	}

	.no-ratings-icon {
		font-size: 48px;
		opacity: 0.3;
		display: block;
		margin-bottom: 12px;
	}

	.no-ratings p {
		margin: 0;
		font-size: 14px;
		color: #999;
	}

	.stats-container {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 32px;
		align-items: center;
	}

	/* Average Section */
	.average-section {
		text-align: center;
		padding: 20px;
	}

	.average-value {
		font-size: 48px;
		font-weight: 800;
		line-height: 1;
		margin-bottom: 8px;
	}

	.stars {
		display: flex;
		justify-content: center;
		gap: 4px;
		margin-bottom: 8px;
	}

	.star {
		font-size: 20px;
		color: rgba(255, 255, 255, 0.2);
	}

	.star.filled {
		color: #ffc107;
	}

	.count {
		font-size: 14px;
		color: #999;
		margin-bottom: 8px;
	}

	.verified-info {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: rgba(76, 175, 80, 0.15);
		border: 1px solid rgba(76, 175, 80, 0.3);
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		color: #81c784;
	}

	/* Distribution Section */
	.distribution-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.distribution-row {
		display: grid;
		grid-template-columns: 40px 1fr 40px;
		gap: 12px;
		align-items: center;
	}

	.star-label {
		font-size: 14px;
		font-weight: 600;
		color: #e0e0e0;
		text-align: right;
	}

	.progress-bar {
		height: 8px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.count-label {
		font-size: 13px;
		color: #999;
		font-weight: 500;
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.stats-container {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.average-value {
			font-size: 40px;
		}

		.distribution-row {
			grid-template-columns: 35px 1fr 35px;
			gap: 10px;
		}

		.star-label {
			font-size: 13px;
		}
	}
</style>
