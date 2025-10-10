<script lang="ts">
	/**
	 * Toast Notification Component
	 * Feature: 003-navigation-ui-renewal
	 * Temporary success/error/info messages
	 */

	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let message = '';
	export let duration = 3000;
	export let position: 'top' | 'bottom' = 'top';
	export let onClose: () => void = () => {};

	let visible = true;

	const icons = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ⓘ'
	};

	const typeClasses = {
		success: 'bg-success text-white',
		error: 'bg-error text-white',
		warning: 'bg-warning text-white',
		info: 'bg-info text-white'
	};

	onMount(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				visible = false;
				setTimeout(onClose, 300);
			}, duration);

			return () => clearTimeout(timer);
		}
	});

	function handleClose() {
		visible = false;
		setTimeout(onClose, 300);
	}
</script>

{#if visible}
	<div
		class="toast {typeClasses[type]} {position}"
		transition:fly={{ y: position === 'top' ? -100 : 100, duration: 300 }}
		role="status"
		aria-live="polite"
	>
		<span class="toast-icon" aria-hidden="true">{icons[type]}</span>
		<span class="toast-message">{message}</span>
		<button
			type="button"
			class="toast-close"
			on:click={handleClose}
			aria-label="Close notification"
		>
			×
		</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		min-width: 300px;
		max-width: 500px;
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		z-index: var(--z-toast, 9999);
		font-size: var(--font-callout);
		font-weight: var(--font-weight-medium);
	}

	.toast.top {
		top: var(--space-lg);
	}

	.toast.bottom {
		bottom: var(--space-lg);
	}

	.toast-icon {
		font-size: 1.5em;
		flex-shrink: 0;
	}

	.toast-message {
		flex: 1;
	}

	.toast-close {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.5em;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: background-color var(--transition-fast);
		flex-shrink: 0;
	}

	.toast-close:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	.toast-close:focus-visible {
		outline: 2px solid white;
		outline-offset: 2px;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.toast {
			min-width: calc(100vw - 2rem);
			max-width: calc(100vw - 2rem);
			left: 1rem;
			right: 1rem;
			transform: none;
		}
	}
</style>
