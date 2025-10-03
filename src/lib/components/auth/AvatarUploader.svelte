<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentAvatar: string | undefined = undefined;
	export let disabled = false;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const dispatch = createEventDispatcher<{
		upload: File;
		remove: void;
	}>();

	let fileInput: HTMLInputElement;
	let dragOver = false;
	let previewUrl: string | null = null;

	const sizeClasses = {
		sm: 'w-16 h-16',
		md: 'w-20 h-20',
		lg: 'w-32 h-32'
	};

	const iconSizes = {
		sm: 'w-6 h-6',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			processFile(file);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		
		const file = event.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			processFile(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function processFile(file: File) {
		if (!file.type.startsWith('image/')) {
			alert('이미지 파일만 업로드할 수 있습니다.');
			return;
		}

		if (file.size > 5 * 1024 * 1024) { // 5MB limit
			alert('파일 크기는 5MB 이하여야 합니다.');
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			previewUrl = e.target?.result as string;
		};
		reader.readAsDataURL(file);

		dispatch('upload', file);
	}

	function handleRemove() {
		previewUrl = null;
		if (fileInput) {
			fileInput.value = '';
		}
		dispatch('remove');
	}

	function triggerFileInput() {
		if (!disabled) {
			fileInput?.click();
		}
	}

	// Get display image URL
	$: displayImage = previewUrl || currentAvatar;
</script>

<div class="flex flex-col items-center gap-4">
	<!-- Avatar Display -->
	<div class="relative group">
		<div 
			class="{sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-4 border-white dark:border-gray-800 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 {dragOver ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}"
			on:click={triggerFileInput}
			on:drop={handleDrop}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			role="button"
			tabindex="0"
			aria-label="프로필 사진 업로드"
			class:opacity-50={disabled}
			class:cursor-not-allowed={disabled}
		>
			{#if displayImage}
				<img 
					src={displayImage} 
					alt="프로필 사진" 
					class="w-full h-full object-cover"
				/>
			{:else}
				<div class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
					<svg class="{iconSizes[size]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
			{/if}

			<!-- Upload Overlay -->
			<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
		</div>

		<!-- Remove Button -->
		{#if displayImage && !disabled}
			<button
				on:click|stopPropagation={handleRemove}
				class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
				aria-label="사진 제거"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Upload Instructions -->
	<div class="text-center">
		<p class="text-sm font-medium text-gray-700 dark:text-gray-300">프로필 사진</p>
		<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
			클릭하거나 드래그해서 업로드<br>
			JPG, PNG (최대 5MB)
		</p>
	</div>

	<!-- Hidden File Input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		on:change={handleFileSelect}
		class="hidden"
		{disabled}
	/>
</div>

<style>
	/* Custom drag and drop styles */
	.drag-over {
		@apply ring-4 ring-blue-500 ring-opacity-50 scale-105;
	}

	/* Smooth transitions */
	div[role="button"] {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>