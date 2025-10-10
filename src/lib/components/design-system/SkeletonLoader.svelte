<script lang="ts">
	/**
	 * Skeleton Loader Component
	 * Feature: 003-navigation-ui-renewal
	 * Purpose: Content placeholder during loading
	 */

	export let variant: 'text' | 'circle' | 'rect' | 'card' = 'rect';
	export let width = '100%';
	export let height = variant === 'text' ? '1em' : '100px';
	export let count = 1;

	const variantClasses = {
		text: 'rounded',
		circle: 'rounded-full',
		rect: 'rounded-md',
		card: 'rounded-lg'
	};
</script>

<div class="skeleton-container">
	{#each Array(count) as _, i (i)}
		<div
			class="skeleton {variantClasses[variant]}"
			style="width: {width}; height: {height};"
			aria-busy="true"
			aria-label="Loading content"
		></div>
	{/each}
</div>

<style>
	.skeleton-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.skeleton {
		background: linear-gradient(
			90deg,
			var(--surface-secondary) 0%,
			var(--surface-primary) 50%,
			var(--surface-secondary) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.rounded {
		border-radius: var(--radius-sm);
	}

	.rounded-md {
		border-radius: var(--radius-md);
	}

	.rounded-lg {
		border-radius: var(--radius-lg);
	}

	.rounded-full {
		border-radius: var(--radius-full);
		aspect-ratio: 1;
	}
</style>
