<script lang="ts">
	/**
	 * Spinner / Loading Indicator Component
	 * Feature: 003-navigation-ui-renewal
	 */

	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let color: 'primary' | 'secondary' | 'white' | 'current' = 'primary';
	export let label = 'Loading...';

	const sizeClasses = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-2',
		lg: 'w-12 h-12 border-3',
		xl: 'w-16 h-16 border-4'
	};

	const colorClasses = {
		primary: 'border-primary border-t-transparent',
		secondary: 'border-secondary border-t-transparent',
		white: 'border-white border-t-transparent',
		current: 'border-current border-t-transparent'
	};
</script>

<div class="spinner-wrapper" role="status" aria-live="polite">
	<div class="spinner {sizeClasses[size]} {colorClasses[color]}" aria-hidden="true"></div>
	<span class="sr-only">{label}</span>
</div>

<style>
	.spinner-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.spinner {
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Size classes */
	.w-4 {
		width: 1rem;
		height: 1rem;
	}

	.h-4 {
		height: 1rem;
	}

	.w-8 {
		width: 2rem;
	}

	.h-8 {
		height: 2rem;
	}

	.w-12 {
		width: 3rem;
	}

	.h-12 {
		height: 3rem;
	}

	.w-16 {
		width: 4rem;
	}

	.h-16 {
		height: 4rem;
	}

	/* Border width */
	.border-2 {
		border-width: 2px;
	}

	.border-3 {
		border-width: 3px;
	}

	.border-4 {
		border-width: 4px;
	}

	/* Screen reader only */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
