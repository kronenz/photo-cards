<script lang="ts">
	/**
	 * Card Component
	 * Feature: 003-navigation-ui-renewal
	 * Apple Design System inspired container
	 */

	export let variant: 'default' | 'elevated' | 'outlined' = 'default';
	export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
	export let hoverable = false;
	export let clickable = false;

	const variantClasses = {
		default: 'bg-surface-primary shadow-card',
		elevated: 'bg-surface-elevated shadow-md',
		outlined: 'bg-surface-primary border-2 border-border-primary'
	};

	const paddingClasses = {
		none: 'p-0',
		sm: 'p-sm',
		md: 'p-md',
		lg: 'p-lg'
	};

	function handleClick() {
		if (clickable) {
			// Dispatch click event to parent
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (clickable && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<div
	class="card {variantClasses[variant]} {paddingClasses[padding]}"
	class:hoverable
	class:clickable
	role={clickable ? 'button' : undefined}
	tabindex={clickable ? 0 : undefined}
	on:click={handleClick}
	on:keydown={handleKeyDown}
	{...$$restProps}
>
	<slot />
</div>

<style>
	.card {
		border-radius: var(--radius-lg);
		transition: all var(--transition-base);
		overflow: hidden;
	}

	/* Padding variants */
	.p-0 {
		padding: 0;
	}

	.p-sm {
		padding: var(--space-sm);
	}

	.p-md {
		padding: var(--space-md);
	}

	.p-lg {
		padding: var(--space-lg);
	}

	/* Hoverable state */
	.card.hoverable:hover {
		box-shadow: var(--shadow-card-hover);
		transform: translateY(-2px);
	}

	/* Clickable state */
	.card.clickable {
		cursor: pointer;
		user-select: none;
	}

	.card.clickable:active {
		transform: translateY(0);
		box-shadow: var(--shadow-card);
	}

	.card.clickable:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	/* Combined hoverable + clickable */
	.card.hoverable.clickable:hover {
		box-shadow: var(--shadow-lg);
		transform: translateY(-4px);
	}
</style>
