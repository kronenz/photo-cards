<script lang="ts">
	/**
	 * Modal Component
	 * Feature: 003-navigation-ui-renewal
	 * Accessibility: Focus trap, ESC key, click outside to close
	 */

	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	export let isOpen = false;
	export let title = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let closeOnEscape = true;
	export let closeOnBackdrop = true;

	const dispatch = createEventDispatcher();

	let dialogElement: HTMLDialogElement;
	let previousActiveElement: HTMLElement | null = null;

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl'
	};

	function handleEscape(event: KeyboardEvent) {
		if (closeOnEscape && event.key === 'Escape' && isOpen) {
			close();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (closeOnBackdrop && event.target === dialogElement) {
			close();
		}
	}

	function close() {
		isOpen = false;
		dispatch('close');

		// Restore focus to previous element
		if (previousActiveElement) {
			previousActiveElement.focus();
		}
	}

	$: if (isOpen && dialogElement) {
		// Store current active element
		previousActiveElement = document.activeElement as HTMLElement;

		// Show modal
		dialogElement.showModal();

		// Focus first focusable element
		const firstFocusable = dialogElement.querySelector<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (firstFocusable) {
			firstFocusable.focus();
		}
	} else if (!isOpen && dialogElement) {
		dialogElement.close();
	}

	onMount(() => {
		document.addEventListener('keydown', handleEscape);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleEscape);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialogElement}
	class="modal {sizeClasses[size]}"
	on:click={handleBackdropClick}
	aria-labelledby={title ? 'modal-title' : undefined}
	aria-modal="true"
>
	<div class="modal-content" on:click|stopPropagation>
		<!-- Header -->
		<div class="modal-header">
			{#if title}
				<h2 id="modal-title" class="modal-title">{title}</h2>
			{/if}
			<button
				type="button"
				class="close-button"
				on:click={close}
				aria-label="Close modal"
				title="Close (ESC)"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<!-- Body -->
		<div class="modal-body">
			<slot />
		</div>

		<!-- Footer (optional) -->
		{#if $$slots.footer}
			<div class="modal-footer">
				<slot name="footer" />
			</div>
		{/if}
	</div>
</dialog>

<style>
	.modal {
		border: none;
		border-radius: var(--radius-xl);
		padding: 0;
		background: transparent;
		max-height: 90vh;
		overflow: visible;
	}

	.modal::backdrop {
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		animation: fadeIn var(--transition-base);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal[open] {
		animation: slideUp var(--transition-base);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-content {
		background-color: var(--surface-primary);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--border-primary);
	}

	.modal-title {
		margin: 0;
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
	}

	.close-button {
		background: none;
		border: none;
		padding: var(--space-xs);
		cursor: pointer;
		color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-button:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
	}

	.close-button:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.modal-body {
		padding: var(--space-lg);
		overflow-y: auto;
		max-height: calc(90vh - 140px);
	}

	.modal-footer {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
		padding: var(--space-lg);
		border-top: 1px solid var(--border-primary);
	}

	/* Size variants */
	.max-w-sm {
		width: 100%;
		max-width: 400px;
	}

	.max-w-md {
		width: 100%;
		max-width: 500px;
	}

	.max-w-lg {
		width: 100%;
		max-width: 640px;
	}

	.max-w-xl {
		width: 100%;
		max-width: 800px;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.modal {
			width: calc(100vw - 2rem);
			max-height: calc(100vh - 2rem);
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding: var(--space-md);
		}
	}
</style>
