<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import type { Template } from '$lib/types/template';

	export let templateId: string;

	let versions: Template[] = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadVersionHistory();
	});

	async function loadVersionHistory() {
		try {
			isLoading = true;
			error = null;

			// Get the template to find its template_id
			const template = await pb.collection('templates').getOne<Template>(templateId);

			// Fetch all versions (same template_id, sorted by version desc)
			versions = await pb.collection('templates').getFullList<Template>({
				filter: `template_id="${template.template_id}"`,
				sort: '-created',
				expand: 'author'
			});
		} catch (err: any) {
			console.error('Failed to load version history:', err);
			error = err.message || 'Failed to load version history';
		} finally {
			isLoading = false;
		}
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}

	function getVersionBadge(index: number): string {
		if (index === 0) return 'latest';
		return '';
	}
</script>

<div class="version-history">
	<h3>Version History</h3>

	{#if isLoading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading version history...</p>
		</div>
	{:else if error}
		<div class="error-box">
			❌ {error}
		</div>
	{:else if versions.length === 0}
		<p class="no-versions">No versions available</p>
	{:else}
		<div class="versions-list">
			{#each versions as version, index}
				<div class="version-item" class:is-latest={index === 0}>
					<div class="version-header">
						<div class="version-number">
							<span class="version-label">v{version.version}</span>
							{#if getVersionBadge(index) === 'latest'}
								<span class="badge badge-latest">Latest</span>
							{/if}
						</div>
						<span class="version-date">{formatDate(version.created)}</span>
					</div>

					{#if version.changelog}
						<div class="version-changelog">
							<p>{version.changelog}</p>
						</div>
					{/if}

					<div class="version-stats">
						<div class="stat">
							<span class="stat-icon">⬇️</span>
							<span class="stat-value">{version.download_count || 0}</span>
							<span class="stat-label">downloads</span>
						</div>
						<div class="stat">
							<span class="stat-icon">⭐</span>
							<span class="stat-value">{version.rating_average?.toFixed(1) || 'N/A'}</span>
							<span class="stat-label">rating</span>
						</div>
						<div class="stat">
							<span class="stat-icon">📦</span>
							<span class="stat-value">{(version.file_size / 1024).toFixed(1)} KB</span>
							<span class="stat-label">size</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.version-history {
		width: 100%;
	}

	h3 {
		margin: 0 0 20px 0;
		font-size: 20px;
		font-weight: 600;
		color: #fff;
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
		border-top-color: #007aff;
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

	.no-versions {
		text-align: center;
		padding: 40px;
		color: #999;
		font-size: 16px;
	}

	.versions-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.version-item {
		padding: 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		transition: all 0.2s;
	}

	.version-item:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.version-item.is-latest {
		border-color: rgba(0, 122, 255, 0.5);
		background: rgba(0, 122, 255, 0.1);
	}

	.version-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.version-number {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.version-label {
		font-size: 18px;
		font-weight: 700;
		color: #fff;
		font-family: 'SF Mono', monospace;
	}

	.badge {
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge-latest {
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
	}

	.version-date {
		font-size: 14px;
		color: #999;
	}

	.version-changelog {
		margin-bottom: 16px;
		padding: 12px 16px;
		background: rgba(0, 0, 0, 0.3);
		border-left: 3px solid rgba(0, 122, 255, 0.5);
		border-radius: 6px;
	}

	.version-changelog p {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
		color: #e0e0e0;
		white-space: pre-wrap;
	}

	.version-stats {
		display: flex;
		gap: 24px;
		margin-top: 12px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.stat-icon {
		font-size: 16px;
	}

	.stat-value {
		font-size: 15px;
		font-weight: 600;
		color: #fff;
	}

	.stat-label {
		font-size: 13px;
		color: #999;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.version-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.version-stats {
			flex-direction: column;
			gap: 12px;
		}
	}
</style>
