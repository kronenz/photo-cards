<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	interface ToastMessage {
		id: string;
		type: 'success' | 'error' | 'info' | 'warning';
		message: string;
		duration?: number;
	}

	let toasts: ToastMessage[] = [];

	export function show(
		message: string,
		type: ToastMessage['type'] = 'info',
		duration = 4000
	): void {
		const id = crypto.randomUUID();
		const toast: ToastMessage = { id, type, message, duration };
		toasts = [...toasts, toast];

		if (duration > 0) {
			setTimeout(() => dismiss(id), duration);
		}
	}

	export function success(message: string, duration = 4000): void {
		show(message, 'success', duration);
	}

	export function error(message: string, duration = 5000): void {
		show(message, 'error', duration);
	}

	export function warning(message: string, duration = 4000): void {
		show(message, 'warning', duration);
	}

	export function info(message: string, duration = 4000): void {
		show(message, 'info', duration);
	}

	function dismiss(id: string): void {
		toasts = toasts.filter((t) => t.id !== id);
	}

	function getIcon(type: ToastMessage['type']): string {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'warning':
				return '⚠';
			case 'info':
			default:
				return 'ℹ';
		}
	}
</script>

<div class="toast-container" aria-live="polite">
	{#each toasts as toast (toast.id)}
		<div
			class="toast toast-{toast.type}"
			in:fly={{ y: -20, duration: 300 }}
			out:fade={{ duration: 200 }}
			animate:flip={{ duration: 300 }}
			role="alert"
		>
			<span class="toast-icon">{getIcon(toast.type)}</span>
			<span class="toast-message">{toast.message}</span>
			<button class="toast-close" on:click={() => dismiss(toast.id)} aria-label="닫기">
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 400px;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		pointer-events: auto;
		backdrop-filter: blur(10px);
		font-size: 14px;
		font-weight: 500;
	}

	.toast-success {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
		color: white;
	}

	.toast-error {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
		color: white;
	}

	.toast-warning {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
		color: white;
	}

	.toast-info {
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
		color: white;
	}

	.toast-icon {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		font-size: 12px;
	}

	.toast-message {
		flex: 1;
		line-height: 1.4;
	}

	.toast-close {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 50%;
		color: inherit;
		cursor: pointer;
		font-size: 16px;
		transition: background 0.2s;
	}

	.toast-close:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	@media (max-width: 480px) {
		.toast-container {
			left: 16px;
			right: 16px;
			max-width: none;
		}
	}
</style>
