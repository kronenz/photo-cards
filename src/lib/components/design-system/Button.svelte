<script lang="ts">
	/**
	 * Button Component
	 * Feature: 003-navigation-ui-renewal
	 * Design System: Apple Design System inspired
	 */

	export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let loading = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const variantClasses = {
		primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95',
		secondary: 'bg-secondary text-white hover:bg-secondary-dark active:scale-95',
		outline:
			'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white active:scale-95',
		ghost: 'text-primary bg-transparent hover:bg-primary/10 active:scale-95'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	{type}
	class="btn {variantClasses[variant]} {sizeClasses[size]}"
	class:disabled
	class:loading
	disabled={disabled || loading}
	on:click
	aria-busy={loading}
	aria-disabled={disabled}
	{...$$restProps}
>
	{#if loading}
		<span class="spinner" aria-hidden="true"></span>
	{/if}
	<span class:opacity-0={loading}>
		<slot />
	</span>
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 600;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		cursor: pointer;
		border: none;
		position: relative;
		font-family: var(--font-body);
		white-space: nowrap;
	}

	.btn:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.btn:disabled,
	.btn.disabled {
		opacity: var(--opacity-disabled);
		cursor: not-allowed;
		transform: none !important;
	}

	.btn.loading {
		cursor: wait;
	}

	/* Spinner Animation */
	.spinner {
		position: absolute;
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.opacity-0 {
		opacity: 0;
	}

	/* Hover Effects */
	.btn:not(:disabled):not(.loading):hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn:not(:disabled):not(.loading):active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}
</style>
