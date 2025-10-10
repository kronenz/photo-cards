<!--
  Image Upload Component with Drag & Drop
  Feature: 003-navigation-ui-renewal
  Task: T041 - US2
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let previewUrl = '';
	export let accept = 'image/*';
	export let maxSize = 10 * 1024 * 1024; // 10MB
	export let error = '';

	let isDragging = false;
	let fileInput: HTMLInputElement;

	const dispatch = createEventDispatcher<{
		upload: { file: File; previewUrl: string };
		error: { message: string };
	}>();

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const file = e.dataTransfer?.files[0];
		if (file) {
			validateAndProcessFile(file);
		}
	}

	function handleFileInput(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			validateAndProcessFile(file);
		}
	}

	function validateAndProcessFile(file: File) {
		error = '';

		// Check file type
		if (!file.type.startsWith('image/')) {
			error = '이미지 파일만 업로드할 수 있습니다.';
			dispatch('error', { message: error });
			return;
		}

		// Check file size
		if (file.size > maxSize) {
			error = `파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하여야 합니다.`;
			dispatch('error', { message: error });
			return;
		}

		// Process file
		const reader = new FileReader();
		reader.onload = (e) => {
			const url = e.target?.result as string;
			previewUrl = url;
			dispatch('upload', { file, previewUrl: url });
		};
		reader.onerror = () => {
			error = '파일을 읽을 수 없습니다.';
			dispatch('error', { message: error });
		};
		reader.readAsDataURL(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div
	class="upload-zone"
	class:dragging={isDragging}
	class:has-preview={!!previewUrl}
	on:drop={handleDrop}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	role="button"
	tabindex="0"
	on:click={triggerFileInput}
	on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
	aria-label="이미지 업로드"
>
	{#if previewUrl}
		<div class="preview-container">
			<img src={previewUrl} alt="Preview" class="preview-image" />
			<div class="preview-overlay">
				<button
					type="button"
					class="change-button"
					on:click|stopPropagation={triggerFileInput}
					aria-label="이미지 변경"
				>
					📷 이미지 변경
				</button>
			</div>
		</div>
	{:else}
		<div class="upload-prompt">
			<span class="upload-icon">📷</span>
			<p class="upload-title">이미지를 드래그 앤 드롭하거나 클릭하여 업로드</p>
			<p class="upload-hint">PNG, JPG, WebP (최대 {Math.round(maxSize / 1024 / 1024)}MB)</p>
		</div>
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		on:change={handleFileInput}
		style="display: none"
		aria-hidden="true"
	/>
</div>

{#if error}
	<p class="error-message" role="alert">{error}</p>
{/if}

<style>
	.upload-zone {
		border: 2px dashed var(--border-primary);
		border-radius: var(--radius-lg);
		padding: var(--space-3xl);
		text-align: center;
		transition: all var(--transition-fast);
		cursor: pointer;
		background-color: var(--surface-secondary);
		position: relative;
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-zone:hover {
		border-color: var(--primary);
		background-color: color-mix(in srgb, var(--primary) 5%, var(--surface-secondary));
	}

	.upload-zone:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.upload-zone.dragging {
		border-color: var(--primary);
		background-color: color-mix(in srgb, var(--primary) 10%, var(--surface-secondary));
		transform: scale(1.02);
	}

	.upload-zone.has-preview {
		padding: 0;
		border-style: solid;
	}

	.preview-container {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-lg);
	}

	.preview-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.preview-container:hover .preview-overlay {
		opacity: 1;
	}

	.change-button {
		padding: var(--space-md) var(--space-lg);
		background: white;
		color: var(--text-primary);
		border: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.change-button:hover {
		transform: scale(1.05);
		box-shadow: var(--shadow-lg);
	}

	.upload-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.upload-icon {
		font-size: 48px;
		opacity: 0.6;
	}

	.upload-title {
		font-size: var(--font-body);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		margin: 0;
	}

	.upload-hint {
		font-size: var(--font-callout);
		color: var(--text-secondary);
		margin: 0;
	}

	.error-message {
		color: var(--error);
		font-size: var(--font-callout);
		margin-top: var(--space-sm);
	}

	@media (max-width: 768px) {
		.upload-zone {
			min-height: 200px;
			padding: var(--space-xl);
		}

		.upload-icon {
			font-size: 36px;
		}
	}
</style>
