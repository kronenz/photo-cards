<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import type { Template } from '$lib/types/template';

	export let templateId: string;

	let remixes: Template[] = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadRemixes();
	});

	async function loadRemixes() {
		try {
			isLoading = true;
			error = null;

			// Find all templates where original_template_id = templateId
			remixes = await pb.collection('templates').getFullList<Template>({
				filter: `original_template_id="${templateId}" && is_published=true`,
				sort: '-created',
				expand: 'author,category'
			});
		} catch (err: any) {
			console.error('Failed to load remixes:', err);
			error = err.message || 'Failed to load remixes';
		} finally {
			isLoading = false;
		}
	}

	function formatNumber(num: number | undefined): string {
		if (!num) return '0';
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	}
</script>

<div class="remix-genealogy">
	<div class="genealogy-header">
		<h3>🎨 Remixes ({isLoading ? '...' : remixes.length})</h3>
		<p class="subtitle">이 템플릿을 기반으로 만들어진 작품들</p>
	</div>

	{#if isLoading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading remixes...</p>
		</div>
	{:else if error}
		<div class="error-box">
			❌ {error}
		</div>
	{:else if remixes.length === 0}
		<div class="empty-state">
			<span class="empty-icon">🎨</span>
			<p class="empty-title">아직 리믹스가 없습니다</p>
			<p class="empty-description">
				이 템플릿을 기반으로 새로운 작품을 만들어보세요!
			</p>
		</div>
	{:else}
		<div class="remixes-grid">
			{#each remixes as remix}
				<div class="remix-item">
					<a href="/marketplace/{remix.id}" class="remix-link">
						<div class="remix-thumbnail">
							<img src={remix.thumbnail_url} alt={remix.title} loading="lazy" />
							<div class="remix-overlay">
								<span class="view-icon">👁️</span>
							</div>
						</div>

						<div class="remix-info">
							<h4 class="remix-title">{remix.title}</h4>
							<p class="remix-author">
								by {remix.expand?.author?.username || '익명'}
							</p>

							<div class="remix-stats">
								<div class="stat">
									<span class="stat-icon">⭐</span>
									<span class="stat-value">
										{remix.rating_average ? remix.rating_average.toFixed(1) : 'N/A'}
									</span>
								</div>
								<div class="stat">
									<span class="stat-icon">⬇️</span>
									<span class="stat-value">{formatNumber(remix.download_count)}</span>
								</div>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.remix-genealogy {
		width: 100%;
	}

	.genealogy-header {
		margin-bottom: 20px;
	}

	.genealogy-header h3 {
		margin: 0 0 4px 0;
		font-size: 20px;
		font-weight: 600;
		color: #fff;
	}

	.subtitle {
		margin: 0;
		font-size: 14px;
		color: #999;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px;
		color: #999;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #a78bfa;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-box {
		padding: 16px;
		background: rgba(255, 68, 68, 0.15);
		border: 1px solid rgba(255, 68, 68, 0.4);
		border-radius: 8px;
		color: #ff6b6b;
		font-size: 14px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60px 20px;
		text-align: center;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
		opacity: 0.3;
	}

	.empty-title {
		margin: 0 0 8px 0;
		font-size: 18px;
		font-weight: 600;
		color: #fff;
	}

	.empty-description {
		margin: 0;
		font-size: 14px;
		color: #999;
		max-width: 400px;
	}

	.remixes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}

	.remix-item {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s;
	}

	.remix-item:hover {
		transform: translateY(-4px);
		border-color: rgba(147, 51, 234, 0.5);
		box-shadow: 0 8px 24px rgba(147, 51, 234, 0.2);
	}

	.remix-link {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.remix-thumbnail {
		position: relative;
		width: 100%;
		aspect-ratio: 5 / 7;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.3);
	}

	.remix-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.remix-item:hover .remix-thumbnail img {
		transform: scale(1.1);
	}

	.remix-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.remix-item:hover .remix-overlay {
		opacity: 1;
	}

	.view-icon {
		font-size: 32px;
	}

	.remix-info {
		padding: 16px;
	}

	.remix-title {
		margin: 0 0 6px 0;
		font-size: 15px;
		font-weight: 600;
		color: #fff;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.remix-author {
		margin: 0 0 12px 0;
		font-size: 13px;
		color: #999;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.remix-stats {
		display: flex;
		gap: 16px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.stat-icon {
		font-size: 14px;
	}

	.stat-value {
		font-size: 13px;
		font-weight: 500;
		color: #e0e0e0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.remixes-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 16px;
		}

		.remix-info {
			padding: 12px;
		}

		.remix-title {
			font-size: 14px;
		}

		.remix-author {
			font-size: 12px;
		}
	}
</style>
