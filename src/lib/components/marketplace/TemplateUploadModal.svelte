<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import { TemplateSerializer } from '$lib/services/templates/template-serializer';
	import { detectLogoClientSide } from '$lib/utils/copyright-detector';
	import type { Card } from '$lib/types/collections';
	import type { TemplateCategory, TemplateLicense } from '$lib/types/template';

	export let isOpen = false;
	export let selectedCard: Card | null = null;

	const dispatch = createEventDispatcher();
	const serializer = new TemplateSerializer();

	// Form state
	let title = '';
	let description = '';
	let tags: string[] = [];
	let tagInput = '';
	let selectedCategory = '';
	let selectedLicense: TemplateLicense = 'CC-BY';
	let allowRemix = true;

	// Upload state
	let isUploading = false;
	let uploadProgress = 0;
	let uploadError: string | null = null;
	let copyrightWarning: { detected: boolean; team?: string; confidence?: number } | null = null;

	// Categories
	let categories: TemplateCategory[] = [];

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		try {
			const records = await pb.collection('template_categories').getFullList<TemplateCategory>({
				sort: 'name'
			});
			categories = records;
		} catch (error) {
			console.error('Failed to load categories:', error);
		}
	}

	function handleTagInput(event: KeyboardEvent) {
		if (event.key === 'Enter' && tagInput.trim()) {
			event.preventDefault();
			if (!tags.includes(tagInput.trim()) && tags.length < 10) {
				tags = [...tags, tagInput.trim()];
				tagInput = '';
			}
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}

	async function handleUpload() {
		if (!selectedCard) {
			uploadError = '카드를 선택해주세요.';
			return;
		}

		if (!title.trim() || !description.trim() || !selectedCategory) {
			uploadError = '필수 항목을 모두 입력해주세요.';
			return;
		}

		try {
			isUploading = true;
			uploadError = null;
			uploadProgress = 0;

			// Step 1: Serialize card to JSON (10%)
			uploadProgress = 10;
			const templateJSON = serializer.serialize(selectedCard, {
				embedImages: true
			});

			// Step 2: Run copyright detection (20%)
			uploadProgress = 20;
			const logoCheck = await detectLogoClientSide(selectedCard.image);
			copyrightWarning = logoCheck;

			if (logoCheck.detected && logoCheck.confidence && logoCheck.confidence > 70) {
				// Show warning but allow upload
				const confirmed = confirm(
					`⚠️ 저작권 경고\n\n${logoCheck.team} 로고가 감지되었습니다 (신뢰도: ${logoCheck.confidence}%).\n\n개인 창작물이 맞다면 계속 진행하세요. 무단 사용 시 삭제될 수 있습니다.`
				);
				if (!confirmed) {
					isUploading = false;
					return;
				}
			}

			// Step 3: Calculate file hash and size (30%)
			uploadProgress = 30;
			const jsonString = JSON.stringify(templateJSON);
			const jsonBlob = new Blob([jsonString], { type: 'application/json' });
			const fileSize = jsonBlob.size;
			const fileHash = await serializer.calculateHash(templateJSON);

			if (fileSize > 15 * 1024 * 1024) {
				throw new Error('파일 크기가 15MB를 초과합니다.');
			}

			// Step 4: Request presigned URL (40%)
			uploadProgress = 40;
			const filename = `tpl_${Date.now()}_${templateJSON.metadata.id}.json`;
			const presignResponse = await fetch('/api/storage/presign-upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filename,
					fileSize,
					contentType: 'application/json',
					fileHash: `sha256:${fileHash}`
				})
			});

			if (!presignResponse.ok) {
				const error = await presignResponse.json();
				throw new Error(error.error || '업로드 URL 생성 실패');
			}

			const { uploadUrl, storageUrl, uploadId } = await presignResponse.json();

			// Step 5: Upload to R2 (50-80%)
			uploadProgress = 50;
			const uploadResponse = await fetch(uploadUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: jsonBlob
			});

			if (!uploadResponse.ok) {
				throw new Error('R2 업로드 실패');
			}

			uploadProgress = 80;

			// Step 6: Verify upload (85%)
			uploadProgress = 85;
			const verifyResponse = await fetch('/api/storage/verify-upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					uploadId,
					storageUrl,
					expectedHash: `sha256:${fileHash}`
				})
			});

			if (!verifyResponse.ok) {
				throw new Error('업로드 검증 실패');
			}

			// Step 7: Create template record in PocketBase (90%)
			uploadProgress = 90;
			const templateData = {
				template_id: templateJSON.metadata.id,
				version: templateJSON.metadata.version,
				template_version: '1.0.0',
				title: title.trim(),
				description: description.trim(),
				category: selectedCategory,
				tags,
				storage_url: storageUrl,
				thumbnail_url: selectedCard.image, // Use card image as thumbnail
				file_size: fileSize,
				file_hash: `sha256:${fileHash}`,
				license: selectedLicense,
				allow_remix: allowRemix,
				is_remix: false,
				is_premium: false,
				is_published: true,
				copyright_status: logoCheck.detected ? 'pending' : 'approved',
				copyright_check_metadata: {
					phash_checked: true,
					phash_results: logoCheck,
					ai_checked: false
				}
			};

			const createResponse = await fetch('/api/templates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(templateData)
			});

			if (!createResponse.ok) {
				const error = await createResponse.json();
				throw new Error(error.error || '템플릿 생성 실패');
			}

			const template = await createResponse.json();

			// Step 8: Complete (100%)
			uploadProgress = 100;

			// Success - close modal and notify parent
			setTimeout(() => {
				dispatch('uploaded', template);
				closeModal();
			}, 500);
		} catch (error) {
			console.error('Upload error:', error);
			uploadError = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
			isUploading = false;
		}
	}

	function closeModal() {
		isOpen = false;
		// Reset form
		title = '';
		description = '';
		tags = [];
		tagInput = '';
		selectedCategory = '';
		selectedLicense = 'CC-BY';
		allowRemix = true;
		isUploading = false;
		uploadProgress = 0;
		uploadError = null;
		copyrightWarning = null;
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>템플릿 업로드</h2>
				<button class="close-btn" on:click={closeModal} disabled={isUploading}>×</button>
			</div>

			<div class="modal-body">
				{#if selectedCard}
					<!-- Card Preview -->
					<div class="card-preview">
						<img src={selectedCard.image} alt={selectedCard.title} />
						<div class="card-info">
							<h3>{selectedCard.title}</h3>
							<p>{selectedCard.description || '설명 없음'}</p>
						</div>
					</div>

					<!-- Upload Form -->
					<form on:submit|preventDefault={handleUpload}>
						<!-- Title -->
						<div class="form-group">
							<label for="title">
								제목 <span class="required">*</span>
							</label>
							<input
								id="title"
								type="text"
								bind:value={title}
								placeholder="템플릿 제목 (3-100자)"
								minlength="3"
								maxlength="100"
								required
								disabled={isUploading}
							/>
						</div>

						<!-- Description -->
						<div class="form-group">
							<label for="description">
								설명 <span class="required">*</span>
							</label>
							<textarea
								id="description"
								bind:value={description}
								placeholder="템플릿 설명 및 사용 방법 (10-1000자)"
								minlength="10"
								maxlength="1000"
								rows="4"
								required
								disabled={isUploading}
							/>
						</div>

						<!-- Category -->
						<div class="form-group">
							<label for="category">
								카테고리 <span class="required">*</span>
							</label>
							<select id="category" bind:value={selectedCategory} required disabled={isUploading}>
								<option value="">카테고리 선택</option>
								{#each categories as category}
									<option value={category.id}>{category.name}</option>
								{/each}
							</select>
						</div>

						<!-- Tags -->
						<div class="form-group">
							<label for="tags">태그 (최대 10개)</label>
							<div class="tags-container">
								{#each tags as tag}
									<span class="tag">
										{tag}
										<button
											type="button"
											class="tag-remove"
											on:click={() => removeTag(tag)}
											disabled={isUploading}
										>
											×
										</button>
									</span>
								{/each}
							</div>
							<input
								id="tags"
								type="text"
								bind:value={tagInput}
								on:keydown={handleTagInput}
								placeholder="태그 입력 후 Enter (예: LG 트윈스, 홈런)"
								disabled={isUploading || tags.length >= 10}
							/>
						</div>

						<!-- License -->
						<div class="form-group">
							<label for="license">라이선스</label>
							<select id="license" bind:value={selectedLicense} disabled={isUploading}>
								<option value="CC-BY">CC-BY (저작자 표시)</option>
								<option value="CC-BY-SA">CC-BY-SA (저작자 표시-동일조건변경허락)</option>
								<option value="CC-BY-NC">CC-BY-NC (저작자 표시-비영리)</option>
								<option value="CC-BY-NC-SA">CC-BY-NC-SA (저작자 표시-비영리-동일조건변경허락)</option>
								<option value="All Rights Reserved">All Rights Reserved (모든 권리 보유)</option>
							</select>
						</div>

						<!-- Allow Remix -->
						<div class="form-group checkbox-group">
							<label>
								<input type="checkbox" bind:checked={allowRemix} disabled={isUploading} />
								다른 사용자의 리믹스 허용
							</label>
						</div>

						<!-- Copyright Warning -->
						{#if copyrightWarning && copyrightWarning.detected}
							<div class="warning-box">
								⚠️ 저작권 경고: {copyrightWarning.team} 로고가 감지되었습니다 (신뢰도:
								{copyrightWarning.confidence}%)
							</div>
						{/if}

						<!-- Error Message -->
						{#if uploadError}
							<div class="error-box">
								❌ {uploadError}
							</div>
						{/if}

						<!-- Upload Progress -->
						{#if isUploading}
							<div class="progress-container">
								<div class="progress-bar">
									<div class="progress-fill" style="width: {uploadProgress}%"></div>
								</div>
								<p class="progress-text">업로드 중... {uploadProgress}%</p>
							</div>
						{/if}

						<!-- Submit Button -->
						<div class="form-actions">
							<button type="button" class="btn-cancel" on:click={closeModal} disabled={isUploading}>
								취소
							</button>
							<button type="submit" class="btn-submit" disabled={isUploading}>
								{isUploading ? '업로드 중...' : '업로드'}
							</button>
						</div>
					</form>
				{:else}
					<p class="no-card-message">업로드할 카드를 선택해주세요.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: #1a1a1a;
		border-radius: 16px;
		max-width: 600px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
		color: #fff;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 32px;
		color: #999;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.close-btn:hover:not(:disabled) {
		color: #fff;
	}

	.close-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal-body {
		padding: 24px;
	}

	.card-preview {
		display: flex;
		gap: 16px;
		margin-bottom: 24px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
	}

	.card-preview img {
		width: 100px;
		height: 140px;
		object-fit: cover;
		border-radius: 8px;
	}

	.card-info {
		flex: 1;
	}

	.card-info h3 {
		margin: 0 0 8px 0;
		font-size: 18px;
		font-weight: 600;
		color: #fff;
	}

	.card-info p {
		margin: 0;
		font-size: 14px;
		color: #999;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #e0e0e0;
	}

	.required {
		color: #ff4444;
	}

	.form-group input[type='text'],
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #fff;
		font-size: 14px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.form-group input[type='text']:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #007aff;
	}

	.form-group input[type='text']:disabled,
	.form-group textarea:disabled,
	.form-group select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 8px;
		min-height: 32px;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(0, 122, 255, 0.2);
		border: 1px solid rgba(0, 122, 255, 0.4);
		border-radius: 16px;
		font-size: 13px;
		color: #4da6ff;
	}

	.tag-remove {
		background: none;
		border: none;
		color: #4da6ff;
		cursor: pointer;
		padding: 0;
		font-size: 18px;
		line-height: 1;
		transition: color 0.2s;
	}

	.tag-remove:hover:not(:disabled) {
		color: #fff;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.checkbox-group input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.warning-box {
		padding: 12px 16px;
		background: rgba(255, 152, 0, 0.15);
		border: 1px solid rgba(255, 152, 0, 0.4);
		border-radius: 8px;
		color: #ffb84d;
		font-size: 14px;
		margin-bottom: 16px;
	}

	.error-box {
		padding: 12px 16px;
		background: rgba(255, 68, 68, 0.15);
		border: 1px solid rgba(255, 68, 68, 0.4);
		border-radius: 8px;
		color: #ff6b6b;
		font-size: 14px;
		margin-bottom: 16px;
	}

	.progress-container {
		margin-bottom: 20px;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #007aff, #00c6ff);
		transition: width 0.3s ease;
	}

	.progress-text {
		text-align: center;
		font-size: 14px;
		color: #999;
		margin: 0;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 24px;
	}

	.btn-cancel,
	.btn-submit {
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-cancel {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	.btn-cancel:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
	}

	.btn-submit {
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4);
	}

	.btn-cancel:disabled,
	.btn-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.no-card-message {
		text-align: center;
		padding: 40px;
		color: #999;
		font-size: 16px;
	}

	/* Scrollbar styling */
	.modal-content::-webkit-scrollbar {
		width: 8px;
	}

	.modal-content::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.modal-content::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.modal-content::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>
