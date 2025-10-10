<!--
  Breadcrumb Navigation Component
  Feature: 003-navigation-ui-renewal
  Task: T029
  Provides hierarchical navigation trail
-->
<script lang="ts">
	import { page } from '$app/stores';

	// Parse URL segments into breadcrumb items
	$: segments = $page.url.pathname.split('/').filter(Boolean);

	// Format segment for display (capitalize, replace hyphens)
	function formatSegment(segment: string): string {
		return segment
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Build href for breadcrumb item
	function buildHref(index: number): string {
		return '/' + segments.slice(0, index + 1).join('/');
	}
</script>

<nav aria-label="Breadcrumb" class="breadcrumb">
	<ol class="breadcrumb-list">
		<!-- Home link -->
		<li class="breadcrumb-item">
			<a href="/" class="breadcrumb-link">
				<span class="icon">🏠</span>
				<span class="label">홈</span>
			</a>
		</li>

		<!-- Path segments -->
		{#each segments as segment, i}
			<li class="breadcrumb-item">
				<span class="separator" aria-hidden="true">›</span>
				{#if i === segments.length - 1}
					<!-- Current page - not clickable -->
					<span class="breadcrumb-current" aria-current="page">
						{formatSegment(segment)}
					</span>
				{:else}
					<!-- Intermediate page - clickable -->
					<a href={buildHref(i)} class="breadcrumb-link">
						{formatSegment(segment)}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		padding: var(--space-sm) 0;
	}

	.breadcrumb-list {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		list-style: none;
		margin: 0;
		padding: 0;
		flex-wrap: wrap;
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--font-callout);
	}

	.breadcrumb-link {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--text-secondary);
		text-decoration: none;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.breadcrumb-link:hover {
		color: var(--primary);
		background-color: var(--surface-secondary);
	}

	.breadcrumb-link:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.breadcrumb-current {
		color: var(--text-primary);
		font-weight: var(--font-weight-semibold);
		padding: var(--space-xs) var(--space-sm);
	}

	.separator {
		color: var(--text-tertiary);
		user-select: none;
		margin: 0 var(--space-xs);
	}

	.icon {
		font-size: 1em;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.breadcrumb-link .label {
			display: none;
		}

		.breadcrumb-item:last-child .breadcrumb-current,
		.breadcrumb-item:last-child .breadcrumb-link {
			display: flex;
		}
	}
</style>
