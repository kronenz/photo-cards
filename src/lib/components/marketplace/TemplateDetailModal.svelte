<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import type { Template } from '$lib/types/template';

	export let isOpen = false;
	export let template: Template | null = null;

	const dispatch = createEventDispatcher();

	let isDownloading = false;
	let downloadError: string | null = null;
	let downloadSuccess = false;

	// Format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}

	// Format file size
	function formatFileSize(bytes: number): string {
		if (bytes >= 1024 * 1024) {
			return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
		}
		if (bytes >= 1024) {
			return `${(bytes / 1024).toFixed(2)} KB`;
		}
		return `${bytes} B`;
	}

	// Format number with K/M suffix
	function formatNumber(num: number | undefined): string {
		if (!num) return '0';
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	}

	// Get license display name
	function getLicenseDisplay(license: string): string {
		const licenses: Record<string, string> = {
			'CC-BY': 'CC-BY (저작자 표시)',
			'CC-BY-SA': 'CC-BY-SA (저작자 표시-동일조건변경허락)',
			'CC-BY-NC': 'CC-BY-NC (저작자 표시-비영리)',
			'CC-BY-NC-SA': 'CC-BY-NC-SA (저작자 표시-비영리-동일조건변경허락)',
			'All Rights Reserved': 'All Rights Reserved (모든 권리 보유)'
		};
		return licenses[license] || license;
	}

	async function handleDownload() {
		if (!template) return;

		try {
			isDownloading = true;
			downloadError = null;
			downloadSuccess = false;

			// Call download API endpoint
			const response = await fetch(`/api/templates/${template.id}/download`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || '다운로드 실패');
			}

			const data = await response.json();

			// Save to localStorage for offline access
			const savedTemplates = JSON.parse(localStorage.getItem('myTemplates') || '[]');
			savedTemplates.push({
				templateId: template.id,
				templateJSON: data.templateJSON,
				metadata: {
					title: template.title,
					author: template.expand?.author?.username || '익명',
					downloadedAt: new Date().toISOString()
				}
			});
			localStorage.setItem('myTemplates', JSON.stringify(savedTemplates));

			downloadSuccess = true;

			// Notify parent
			dispatch('downloaded', { template, templateJSON: data.templateJSON });

			// Close modal after delay
			setTimeout(() => {
				closeModal();
			}, 2000);
		} catch (error) {
			console.error('Download error:', error);
			downloadError = error instanceof Error ? error.message : '다운로드 중 오류가 발생했습니다.';
		} finally {
			isDownloading = false;
		}
	}

	function closeModal() {
		isOpen = false;
		downloadSuccess = false;
		downloadError = null;
	}

	// Get author info
	$: authorName =
		template?.expand?.author?.username || template?.expand?.author?.name || '익명';
	$: categoryName = template?.expand?.category?.name || '기타';
</script>

{#if isOpen && template}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<!-- Close Button -->
			<button class="close-btn" on:click={closeModal} disabled={isDownloading}>×</button>

			<!-- Modal Body -->
			<div class="modal-body">
				<!-- Preview Image -->
				<div class="preview-section">
					<img src={template.thumbnail_url} alt={template.title} class="preview-image" />

					<!-- Badges -->
					<div class="badges">
						{#if template.is_premium}
							<span class="badge premium">👑 Premium</span>
						{/if}
						{#if template.featured}
							<span class="badge featured">⭐ Featured</span>
						{/if}
						{#if template.is_remix}
							<span class="badge remix">🔄 Remix</span>
						{/if}
					</div>
				</div>

				<!-- Details Section -->
				<div class="details-section">
					<!-- Title & Author -->
					<div class="header">
						<h2 class="title">{template.title}</h2>
						<p class="author">by {authorName}</p>
					</div>

					<!-- Stats -->
					<div class="stats">
						<div class="stat">
							<span class="stat-icon">⭐</span>
							<span class="stat-value">
								{template.rating_average ? template.rating_average.toFixed(1) : 'N/A'}
							</span>
							{#if template.rating_count}
								<span class="stat-label">({formatNumber(template.rating_count)} 평가)</span>
							{/if}
						</div>

						<div class="stat">
							<span class="stat-icon">⬇️</span>
							<span class="stat-value">{formatNumber(template.download_count)}</span>
							<span class="stat-label">다운로드</span>
						</div>

						{#if template.view_count}
							<div class="stat">
								<span class="stat-icon">👁️</span>
								<span class="stat-value">{formatNumber(template.view_count)}</span>
								<span class="stat-label">조회</span>
							</div>
						{/if}
					</div>

					<!-- Description -->
					<div class="description">
						<h3>설명</h3>
						<p>{template.description}</p>
					</div>

					<!-- Metadata -->
					<div class="metadata">
						<div class="metadata-item">
							<span class="metadata-label">카테고리</span>
							<span class="metadata-value">{categoryName}</span>
						</div>

						<div class="metadata-item">
							<span class="metadata-label">라이선스</span>
							<span class="metadata-value">{getLicenseDisplay(template.license)}</span>
						</div>

						<div class="metadata-item">
							<span class="metadata-label">파일 크기</span>
							<span class="metadata-value">{formatFileSize(template.file_size)}</span>
						</div>

						<div class="metadata-item">
							<span class="metadata-label">버전</span>
							<span class="metadata-value">{template.version}</span>
						</div>

						<div class="metadata-item">
							<span class="metadata-label">업로드</span>
							<span class="metadata-value">{formatDate(template.created)}</span>
						</div>

						{#if template.allow_remix}
							<div class="metadata-item">
								<span class="metadata-label">리믹스</span>
								<span class="metadata-value success">✓ 허용</span>
							</div>
						{/if}
					</div>

					<!-- Tags -->
					{#if template.tags && template.tags.length > 0}
						<div class="tags-section">
							<h3>태그</h3>
							<div class="tags">
								{#each template.tags as tag}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Original Template Link (if remix) -->
					{#if template.is_remix && template.original_template_id}
						<div class="remix-info">
							<span class="remix-icon">🔄</span>
							<span>이 템플릿은 다른 템플릿을 리믹스한 작품입니다</span>
						</div>
					{/if}

					<!-- Download Section -->
					<div class="download-section">
						{#if downloadSuccess}
							<div class="success-message">
								✅ 다운로드 완료! 내 템플릿에서 확인하세요.
							</div>
						{:else if downloadError}
							<div class="error-message">
								❌ {downloadError}
							</div>
						{/if}

						{#if template.is_premium}
							<button class="btn-download premium" disabled={isDownloading}>
								<span class="price-tag">
									{template.price}{template.currency === 'KRW' ? '원' : '$'}
								</span>
								구매하기
							</button>
						{:else}
							<button
								class="btn-download"
								on:click={handleDownload}
								disabled={isDownloading || downloadSuccess}
							>
								{#if isDownloading}
									⏳ 다운로드 중...
								{:else if downloadSuccess}
									✅ 다운로드 완료
								{:else}
									⬇️ 무료 다운로드
								{/if}
							</button>
						{/if}
					</div>
				</div>
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
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(8px);
		padding: 20px;
		overflow-y: auto;
	}

	.modal-content {
		background: #1a1a1a;
		border-radius: 20px;
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 16px;
		right: 16px;
		background: rgba(0, 0, 0, 0.6);
		border: none;
		color: #fff;
		font-size: 32px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
		transform: rotate(90deg);
	}

	.close-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal-body {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 32px;
		padding: 32px;
	}

	/* Preview Section */
	.preview-section {
		position: relative;
	}

	.preview-image {
		width: 100%;
		aspect-ratio: 5 / 7;
		object-fit: cover;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.badges {
		display: flex;
		flex-direction: column;
		gap: 8px;
		position: absolute;
		top: 12px;
		left: 12px;
	}

	.badge {
		padding: 6px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 700;
		display: inline-block;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.badge.premium {
		background: linear-gradient(135deg, #ffd700, #ff8c00);
		color: #000;
	}

	.badge.featured {
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
	}

	.badge.remix {
		background: rgba(156, 39, 176, 0.9);
		color: #fff;
	}

	/* Details Section */
	.details-section {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.header .title {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 700;
		color: #fff;
		line-height: 1.3;
	}

	.header .author {
		margin: 0;
		font-size: 16px;
		color: #999;
	}

	.stats {
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.stat-icon {
		font-size: 20px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: #fff;
	}

	.stat-label {
		font-size: 14px;
		color: #999;
	}

	.description h3,
	.tags-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #e0e0e0;
	}

	.description p {
		margin: 0;
		font-size: 15px;
		line-height: 1.6;
		color: #ccc;
		white-space: pre-wrap;
	}

	.metadata {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.metadata-item {
		display: flex;
		justify-content: space-between;
		padding: 10px 14px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.metadata-label {
		font-size: 13px;
		color: #999;
	}

	.metadata-value {
		font-size: 13px;
		font-weight: 600;
		color: #fff;
	}

	.metadata-value.success {
		color: #4caf50;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag {
		padding: 6px 14px;
		background: rgba(0, 122, 255, 0.15);
		border: 1px solid rgba(0, 122, 255, 0.3);
		border-radius: 14px;
		font-size: 13px;
		color: #66b3ff;
	}

	.remix-info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: rgba(156, 39, 176, 0.15);
		border: 1px solid rgba(156, 39, 176, 0.3);
		border-radius: 10px;
		font-size: 14px;
		color: #ba68c8;
	}

	.remix-icon {
		font-size: 20px;
	}

	.download-section {
		margin-top: auto;
	}

	.success-message {
		padding: 12px 16px;
		background: rgba(76, 175, 80, 0.15);
		border: 1px solid rgba(76, 175, 80, 0.4);
		border-radius: 10px;
		color: #81c784;
		font-size: 14px;
		margin-bottom: 12px;
		text-align: center;
	}

	.error-message {
		padding: 12px 16px;
		background: rgba(255, 68, 68, 0.15);
		border: 1px solid rgba(255, 68, 68, 0.4);
		border-radius: 10px;
		color: #ff6b6b;
		font-size: 14px;
		margin-bottom: 12px;
		text-align: center;
	}

	.btn-download {
		width: 100%;
		padding: 16px;
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-download:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4);
	}

	.btn-download:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn-download.premium {
		background: linear-gradient(135deg, #ffd700, #ff8c00);
		color: #000;
	}

	.price-tag {
		margin-right: 8px;
		font-weight: 800;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.modal-body {
			grid-template-columns: 1fr;
			gap: 24px;
			padding: 24px;
		}

		.header .title {
			font-size: 24px;
		}

		.metadata {
			grid-template-columns: 1fr;
		}
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
