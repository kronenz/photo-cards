<!--
  Comment Section Component
  Feature: 004-production-service-integration (T046)

  Displays comments and provides input for new comments
-->
<script lang="ts">
  import { socialService, type CommentWithUser } from '$lib/services/socialService';
  import { pb } from '$lib/pocketbase';
  import { onMount } from 'svelte';

  export let cardId: string;
  export let initialComments: CommentWithUser[] = [];
  export let maxHeight: string = '400px';

  let comments: CommentWithUser[] = initialComments;
  let newComment = '';
  let isLoading = false;
  let isSubmitting = false;
  let error = '';
  let hasMore = false;
  let page = 1;
  let totalPages = 1;

  $: isAuthenticated = pb.authStore.isValid;
  $: currentUserId = pb.authStore.model?.id;

  onMount(async () => {
    await loadComments();
  });

  async function loadComments(reset: boolean = true) {
    if (isLoading) return;
    isLoading = true;
    error = '';

    try {
      const result = await socialService.getComments(cardId, reset ? 1 : page);
      if (reset) {
        comments = result.items;
        page = 1;
      } else {
        comments = [...comments, ...result.items];
      }
      totalPages = result.totalPages;
      hasMore = page < totalPages;
    } catch (err: any) {
      error = err.message || '댓글을 불러오는데 실패했습니다.';
    } finally {
      isLoading = false;
    }
  }

  async function loadMore() {
    if (!hasMore || isLoading) return;
    page++;
    await loadComments(false);
  }

  async function handleSubmit() {
    if (!newComment.trim() || isSubmitting) return;

    isSubmitting = true;
    error = '';

    try {
      const comment = await socialService.addComment(cardId, newComment);
      comments = [comment, ...comments];
      newComment = '';
    } catch (err: any) {
      error = err.message || '댓글 작성에 실패했습니다.';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await socialService.deleteComment(commentId);
      comments = comments.filter(c => c.id !== commentId);
    } catch (err: any) {
      error = err.message || '댓글 삭제에 실패했습니다.';
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  }
</script>

<div class="comment-section">
  <h4 class="section-title">
    댓글
    <span class="comment-count">{comments.length}</span>
  </h4>

  {#if isAuthenticated}
    <form class="comment-form" on:submit|preventDefault={handleSubmit}>
      <div class="input-wrapper">
        <textarea
          bind:value={newComment}
          placeholder="댓글을 입력하세요..."
          rows="2"
          maxlength="500"
          disabled={isSubmitting}
        ></textarea>
        <div class="input-footer">
          <span class="char-count" class:warning={newComment.length > 450}>
            {newComment.length}/500
          </span>
          <button
            type="submit"
            class="submit-btn"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? '작성 중...' : '작성'}
          </button>
        </div>
      </div>
    </form>
  {:else}
    <div class="login-prompt">
      <p>댓글을 작성하려면 <a href="/auth/signin">로그인</a>하세요.</p>
    </div>
  {/if}

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="comments-list" style="max-height: {maxHeight};">
    {#if isLoading && comments.length === 0}
      <div class="loading">댓글 불러오는 중...</div>
    {:else if comments.length === 0}
      <div class="empty-state">
        <p>아직 댓글이 없습니다.</p>
        <p class="hint">첫 번째 댓글을 작성해보세요!</p>
      </div>
    {:else}
      {#each comments as comment (comment.id)}
        <div class="comment-item">
          <div class="comment-avatar">
            {#if comment.expand?.user?.avatar}
              <img src={comment.expand.user.avatar} alt={comment.expand?.user?.name || '사용자'} />
            {:else}
              <div class="avatar-placeholder">
                {(comment.expand?.user?.name || '?').charAt(0).toUpperCase()}
              </div>
            {/if}
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{comment.expand?.user?.name || '익명'}</span>
              <span class="comment-date">{formatDate(comment.created)}</span>
              {#if comment.user === currentUserId}
                <button
                  type="button"
                  class="delete-btn"
                  on:click={() => handleDelete(comment.id)}
                  title="삭제"
                >
                  ×
                </button>
              {/if}
            </div>
            <p class="comment-text">{comment.content}</p>
          </div>
        </div>
      {/each}

      {#if hasMore}
        <button
          type="button"
          class="load-more-btn"
          on:click={loadMore}
          disabled={isLoading}
        >
          {isLoading ? '불러오는 중...' : '더 보기'}
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .comment-section {
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 16px 0;
  }

  .comment-count {
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .comment-form {
    margin-bottom: 20px;
  }

  .input-wrapper {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  textarea {
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 14px;
    resize: none;
  }

  textarea::placeholder {
    color: #666;
  }

  textarea:focus {
    outline: none;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .char-count {
    font-size: 12px;
    color: #666;
  }

  .char-count.warning {
    color: #ff9500;
  }

  .submit-btn {
    padding: 6px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-prompt {
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    text-align: center;
    color: #999;
    margin-bottom: 20px;
  }

  .login-prompt a {
    color: #667eea;
    text-decoration: none;
  }

  .login-prompt a:hover {
    text-decoration: underline;
  }

  .error-message {
    padding: 10px;
    background: rgba(255, 59, 48, 0.1);
    border-radius: 6px;
    color: #ff3b30;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .comments-list {
    overflow-y: auto;
  }

  .loading, .empty-state {
    padding: 24px;
    text-align: center;
    color: #999;
  }

  .empty-state .hint {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .comment-item:last-child {
    border-bottom: none;
  }

  .comment-avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
  }

  .comment-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-weight: 600;
    font-size: 14px;
  }

  .comment-content {
    flex: 1;
    min-width: 0;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .comment-author {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
  }

  .comment-date {
    font-size: 12px;
    color: #666;
  }

  .delete-btn {
    margin-left: auto;
    padding: 0;
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    color: #666;
    font-size: 18px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s, color 0.2s;
  }

  .comment-item:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    color: #ff3b30;
  }

  .comment-text {
    margin: 0;
    font-size: 14px;
    color: #ccc;
    line-height: 1.5;
    word-break: break-word;
  }

  .load-more-btn {
    display: block;
    width: 100%;
    padding: 12px;
    margin-top: 12px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #999;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .load-more-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  .load-more-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
