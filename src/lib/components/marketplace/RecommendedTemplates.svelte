<script lang="ts">
	import { onMount } from 'svelte';
	import TemplateCard from './TemplateCard.svelte';
	import type { Template } from '$lib/types/template';

	export let currentUser: any = null;

	let recommended: Template[] = [];
	let loading = true;
	let algorithm = 'popular_fallback';

	onMount(async () => {
		await loadRecommendations();
	});

	async function loadRecommendations() {
		try {
			loading = true;
			const response = await fetch('/api/templates/recommended');
			if (!response.ok) throw new Error('Failed to load recommendations');

			const data = await response.json();
			recommended = data.items || [];
			algorithm = data.algorithm || 'popular_fallback';
		} catch (error) {
			console.error('Recommendations error:', error);
			recommended = [];
		} finally {
			loading = false;
		}
	}

	function handleCardClick(template: Template) {
		// Dispatch event to parent to open detail modal
		const event = new CustomEvent('cardclick', { detail: template });
		window.dispatchEvent(event);
	}

	$: sectionTitle =
		algorithm === 'collaborative_filtering' ? '추천 템플릿' : '인기 템플릿';
	$: sectionSubtitle =
		algorithm === 'collaborative_filtering'
			? '내 다운로드 기록 기반 추천'
			: '가장 인기있는 템플릿';
</script>

{#if recommended.length > 0}
	<section class="recommended-templates">
		<div class="section-header">
			<div class="title-group">
				<h2>{sectionTitle}</h2>
				<p class="subtitle">{sectionSubtitle}</p>
			</div>
			{#if algorithm === 'collaborative_filtering'}
				<div class="algorithm-badge">
					<span class="badge-icon">🤖</span>
					<span class="badge-text">AI 추천</span>
				</div>
			{/if}
		</div>

		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>추천 템플릿을 불러오는 중...</p>
			</div>
		{:else}
			<div class="templates-grid">
				{#each recommended as template (template.id)}
					<TemplateCard {template} on:cardclick />
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.recommended-templates {
		margin-top: 48px;
		padding-top: 48px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		gap: 20px;
	}

	.title-group h2 {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 800;
		background: linear-gradient(135deg, #fff, #007aff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		margin: 0;
		font-size: 14px;
		color: #999;
	}

	.algorithm-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: rgba(0, 122, 255, 0.1);
		border: 1px solid rgba(0, 122, 255, 0.3);
		border-radius: 20px;
		font-size: 13px;
		font-weight: 600;
		color: #007aff;
		white-space: nowrap;
	}

	.badge-icon {
		font-size: 16px;
	}

	.templates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
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
		border-top-color: #007aff;
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
		.recommended-templates {
			margin-top: 32px;
			padding-top: 32px;
		}

		.section-header {
			flex-direction: column;
			align-items: stretch;
		}

		.title-group h2 {
			font-size: 24px;
		}

		.algorithm-badge {
			align-self: flex-start;
		}

		.templates-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			gap: 16px;
		}
	}
</style>
