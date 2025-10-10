<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import type { TemplateReview } from '$lib/types/template';

	export let templateId: string;
	export let currentUser: any = null;

	let reviews: TemplateReview[] = [];
	let myReview: TemplateReview | null = null;
	let isWritingReview = false;
	let isLoading = true;
	let error: string | null = null;

	// Review form state
	let rating = 5;
	let comment = '';
	let isSubmitting = false;

	// Helpful votes tracking (localStorage)
	let helpfulVotes = new Set<string>();

	onMount(async () => {
		await loadReviews();
		loadHelpfulVotes();
	});

	async function loadReviews() {
		try {
			isLoading = true;
			error = null;

			// Load all reviews for this template
			reviews = await pb.collection('template_reviews').getFullList<TemplateReview>({
				filter: `template="${templateId}"`,
				sort: '-helpful_count,-created',
				expand: 'user'
			});

			// Check if current user already reviewed
			if (currentUser) {
				myReview = reviews.find((r) => r.user === currentUser.id) || null;
			}
		} catch (err) {
			console.error('Failed to load reviews:', err);
			error = 'Failed to load reviews';
		} finally {
			isLoading = false;
		}
	}

	function loadHelpfulVotes() {
		try {
			const stored = localStorage.getItem('helpfulVotes');
			if (stored) {
				helpfulVotes = new Set(JSON.parse(stored));
			}
		} catch (err) {
			console.error('Failed to load helpful votes:', err);
		}
	}

	function saveHelpfulVotes() {
		try {
			localStorage.setItem('helpfulVotes', JSON.stringify([...helpfulVotes]));
		} catch (err) {
			console.error('Failed to save helpful votes:', err);
		}
	}

	async function submitReview() {
		if (!currentUser) {
			error = 'Please login to write a review';
			return;
		}

		if (comment.trim().length < 10) {
			error = 'Review must be at least 10 characters';
			return;
		}

		try {
			isSubmitting = true;
			error = null;

			const response = await fetch(`/api/templates/${templateId}/reviews`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating, comment: comment.trim() })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to submit review');
			}

			const newReview = await response.json();

			// Add to reviews list
			reviews = [newReview, ...reviews];
			myReview = newReview;
			isWritingReview = false;

			// Reset form
			rating = 5;
			comment = '';
		} catch (err) {
			console.error('Submit review error:', err);
			error = err instanceof Error ? err.message : 'Failed to submit review';
		} finally {
			isSubmitting = false;
		}
	}

	async function markHelpful(reviewId: string) {
		if (helpfulVotes.has(reviewId)) {
			return; // Already voted
		}

		try {
			const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				throw new Error('Failed to mark as helpful');
			}

			const data = await response.json();

			// Update local state
			helpfulVotes.add(reviewId);
			saveHelpfulVotes();

			// Update review count
			reviews = reviews.map((r) =>
				r.id === reviewId ? { ...r, helpful_count: data.helpful_count } : r
			);
		} catch (err) {
			console.error('Mark helpful error:', err);
		}
	}

	function openWriteReview() {
		if (!currentUser) {
			error = 'Please login to write a review';
			return;
		}

		if (myReview) {
			error = 'You have already reviewed this template';
			return;
		}

		isWritingReview = true;
	}

	function cancelReview() {
		isWritingReview = false;
		rating = 5;
		comment = '';
		error = null;
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return '오늘';
		if (diffDays === 1) return '어제';
		if (diffDays < 7) return `${diffDays}일 전`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
		return `${Math.floor(diffDays / 365)}년 전`;
	}

	function getAuthorName(review: TemplateReview): string {
		return review.expand?.user?.username || review.expand?.user?.name || '익명';
	}
</script>

<div class="review-section">
	<div class="section-header">
		<h3>리뷰 ({reviews.length})</h3>
		{#if !myReview && !isWritingReview}
			<button class="btn-write-review" on:click={openWriteReview}>
				✍️ 리뷰 작성
			</button>
		{/if}
	</div>

	<!-- Write Review Form -->
	{#if isWritingReview}
		<div class="write-review-form">
			<div class="form-header">
				<h4>리뷰 작성</h4>
				<button class="btn-close" on:click={cancelReview}>×</button>
			</div>

			<!-- Rating Input -->
			<div class="rating-input">
				<label>평점</label>
				<div class="stars">
					{#each [1, 2, 3, 4, 5] as star}
						<button
							class="star"
							class:active={star <= rating}
							on:click={() => (rating = star)}
							data-rating={star}
						>
							★
						</button>
					{/each}
				</div>
			</div>

			<!-- Comment Input -->
			<div class="comment-input">
				<label for="comment">리뷰 내용</label>
				<textarea
					id="comment"
					bind:value={comment}
					placeholder="이 템플릿에 대한 솔직한 의견을 남겨주세요 (최소 10자)"
					rows="5"
					disabled={isSubmitting}
				/>
				<div class="char-count">
					{comment.length} / 1000
				</div>
			</div>

			<!-- Error Message -->
			{#if error}
				<div class="error-message">❌ {error}</div>
			{/if}

			<!-- Submit Button -->
			<div class="form-actions">
				<button class="btn-cancel" on:click={cancelReview} disabled={isSubmitting}>
					취소
				</button>
				<button class="btn-submit" on:click={submitReview} disabled={isSubmitting}>
					{isSubmitting ? '제출 중...' : '리뷰 제출'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Reviews List -->
	{#if isLoading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>리뷰를 불러오는 중...</p>
		</div>
	{:else if reviews.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📝</div>
			<h4>아직 리뷰가 없습니다</h4>
			<p>첫 번째 리뷰어가 되어보세요!</p>
		</div>
	{:else}
		<div class="reviews-list">
			{#each reviews as review (review.id)}
				<div class="review-item">
					<!-- Review Header -->
					<div class="review-header">
						<div class="author-info">
							<span class="author-name">{getAuthorName(review)}</span>
							{#if review.is_verified_purchase}
								<span class="verified-badge" title="다운로드 인증">✓ 인증된 다운로드</span>
							{/if}
						</div>
						<span class="review-date">{formatDate(review.created)}</span>
					</div>

					<!-- Rating -->
					<div class="review-rating">
						{#each Array(5) as _, i}
							<span class="star" class:filled={i < review.rating}>★</span>
						{/each}
						<span class="rating-value">{review.rating}.0</span>
					</div>

					<!-- Comment -->
					<p class="review-comment">{review.comment}</p>

					<!-- Review Footer -->
					<div class="review-footer">
						<button
							class="btn-helpful"
							class:voted={helpfulVotes.has(review.id)}
							on:click={() => markHelpful(review.id)}
							disabled={helpfulVotes.has(review.id)}
						>
							👍 도움됨 ({review.helpful_count || 0})
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.review-section {
		width: 100%;
		margin-top: 32px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.section-header h3 {
		margin: 0;
		font-size: 20px;
		font-weight: 700;
		color: #fff;
	}

	.btn-write-review {
		padding: 10px 20px;
		background: linear-gradient(135deg, #007aff, #00c6ff);
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-write-review:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
	}

	/* Write Review Form */
	.write-review-form {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 32px;
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.form-header h4 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #fff;
	}

	.btn-close {
		background: none;
		border: none;
		color: #999;
		font-size: 28px;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.btn-close:hover {
		color: #fff;
	}

	.rating-input {
		margin-bottom: 20px;
	}

	.rating-input label {
		display: block;
		margin-bottom: 10px;
		font-size: 14px;
		font-weight: 500;
		color: #e0e0e0;
	}

	.stars {
		display: flex;
		gap: 8px;
	}

	.star {
		background: none;
		border: none;
		font-size: 32px;
		color: rgba(255, 255, 255, 0.2);
		cursor: pointer;
		transition: all 0.2s;
		padding: 0;
	}

	.star.active {
		color: #ffc107;
		transform: scale(1.1);
	}

	.star:hover {
		transform: scale(1.2);
	}

	.comment-input {
		margin-bottom: 16px;
	}

	.comment-input label {
		display: block;
		margin-bottom: 10px;
		font-size: 14px;
		font-weight: 500;
		color: #e0e0e0;
	}

	.comment-input textarea {
		width: 100%;
		padding: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		color: #fff;
		font-size: 14px;
		font-family: inherit;
		resize: vertical;
		transition: border-color 0.2s;
	}

	.comment-input textarea:focus {
		outline: none;
		border-color: #007aff;
	}

	.char-count {
		text-align: right;
		font-size: 12px;
		color: #999;
		margin-top: 6px;
	}

	.error-message {
		padding: 12px 16px;
		background: rgba(255, 68, 68, 0.15);
		border: 1px solid rgba(255, 68, 68, 0.4);
		border-radius: 8px;
		color: #ff6b6b;
		font-size: 14px;
		margin-bottom: 16px;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.btn-cancel,
	.btn-submit {
		padding: 10px 24px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
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
		box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
	}

	.btn-submit:disabled,
	.btn-cancel:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Reviews List */
	.loading-state,
	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #007aff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 16px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.empty-state h4 {
		margin: 0 0 8px 0;
		font-size: 18px;
		font-weight: 600;
		color: #fff;
	}

	.empty-state p {
		margin: 0;
		font-size: 14px;
		color: #999;
	}

	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.review-item {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 20px;
		transition: background 0.2s;
	}

	.review-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.author-name {
		font-weight: 600;
		color: #fff;
		font-size: 15px;
	}

	.verified-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: rgba(76, 175, 80, 0.2);
		border: 1px solid rgba(76, 175, 80, 0.4);
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		color: #81c784;
	}

	.review-date {
		font-size: 13px;
		color: #999;
	}

	.review-rating {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	.review-rating .star {
		font-size: 16px;
		color: rgba(255, 255, 255, 0.2);
		background: none;
		border: none;
		padding: 0;
		cursor: default;
	}

	.review-rating .star.filled {
		color: #ffc107;
	}

	.rating-value {
		font-size: 14px;
		font-weight: 600;
		color: #e0e0e0;
		margin-left: 4px;
	}

	.review-comment {
		margin: 0 0 16px 0;
		font-size: 14px;
		line-height: 1.6;
		color: #e0e0e0;
		white-space: pre-wrap;
	}

	.review-footer {
		display: flex;
		gap: 12px;
	}

	.btn-helpful {
		padding: 6px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #fff;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-helpful:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.btn-helpful.voted {
		background: rgba(0, 122, 255, 0.2);
		border-color: rgba(0, 122, 255, 0.4);
		color: #4da6ff;
	}

	.btn-helpful:disabled {
		cursor: not-allowed;
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.btn-write-review {
			width: 100%;
		}

		.review-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.form-actions {
			flex-direction: column;
		}

		.btn-cancel,
		.btn-submit {
			width: 100%;
		}
	}
</style>
