<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { Comment } from '$lib/types/community';
  import { communityService } from '$lib/services/communityService';

  // Props
  export let postId: string;
  export let comments: Comment[] = [];
  export let maxDepth: number = 3;
  export let showComposer: boolean = true;
  export let theme: 'light' | 'dark' = 'light';

  // Events
  const dispatch = createEventDispatcher<{
    commentAdded: Comment;
    commentLiked: { commentId: string; isLiked: boolean };
    commentReported: string;
  }>();

  // State
  let newCommentText = '';
  let replyingTo: string | null = null;
  let replyText = '';
  let loading = false;
  let expandedComments = new Set<string>();
  let showAllComments = false;

  // Reactive
  $: visibleComments = showAllComments ? comments : comments.slice(0, 3);
  $: hasMoreComments = comments.length > 3;

  // Functions
  async function submitComment() {
    if (!newCommentText.trim() || loading) return;

    loading = true;
    try {
      const comment = await communityService.createComment(postId, newCommentText.trim());
      comments = [comment, ...comments];
      newCommentText = '';
      dispatch('commentAdded', comment);
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      loading = false;
    }
  }

  async function submitReply(parentId: string) {
    if (!replyText.trim() || loading) return;

    loading = true;
    try {
      const reply = await communityService.createComment(postId, replyText.trim(), parentId);
      
      // Add reply to parent comment
      comments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      });

      replyText = '';
      replyingTo = null;
      dispatch('commentAdded', reply);
    } catch (error) {
      console.error('Failed to create reply:', error);
    } finally {
      loading = false;
    }
  }

  async function toggleCommentLike(commentId: string, isLiked: boolean) {
    try {
      await communityService.interactWithPost(commentId, 'like');
      
      // Update local state
      comments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !isLiked
          };
        }
        
        // Check replies
        if (comment.replies) {
          comment.replies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !isLiked
              };
            }
            return reply;
          });
        }
        
        return comment;
      });

      dispatch('commentLiked', { commentId, isLiked: !isLiked });
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }

  function toggleReplies(commentId: string) {
    if (expandedComments.has(commentId)) {
      expandedComments.delete(commentId);
    } else {
      expandedComments.add(commentId);
    }
    expandedComments = expandedComments;
  }

  function startReply(commentId: string) {
    replyingTo = commentId;
    replyText = '';
  }

  function cancelReply() {
    replyingTo = null;
    replyText = '';
  }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  }

  function handleKeydown(event: KeyboardEvent, action: () => void) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      action();
    }
  }

  onMount(async () => {
    if (comments.length === 0) {
      try {
        comments = await communityService.getComments(postId);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  });
</script>

<div class="comment-thread" class:dark={theme === 'dark'}>
  <!-- Comment Composer -->
  {#if showComposer}
    <div class="comment-composer" in:slide={{ duration: 300, easing: quintOut }}>
      <div class="composer-avatar">
        <div class="avatar-placeholder">👤</div>
      </div>
      
      <div class="composer-input">
        <textarea
          bind:value={newCommentText}
          placeholder="댓글을 작성해주세요..."
          rows="2"
          maxlength="500"
          on:keydown={(e) => handleKeydown(e, submitComment)}
          disabled={loading}
        ></textarea>
        
        <div class="composer-actions">
          <div class="character-count">
            <span class:warning={newCommentText.length > 400}>
              {newCommentText.length}/500
            </span>
          </div>
          
          <button
            class="submit-btn"
            on:click={submitComment}
            disabled={!newCommentText.trim() || loading}
          >
            {loading ? '게시 중...' : '댓글 달기'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Comments List -->
  <div class="comments-list">
    {#if comments.length === 0}
      <div class="empty-comments" in:fade={{ duration: 300 }}>
        <div class="empty-icon">💬</div>
        <p>아직 댓글이 없습니다</p>
        <span>첫 번째 댓글을 작성해보세요!</span>
      </div>
    {:else}
      {#each visibleComments as comment (comment.id)}
        <div class="comment-item" in:slide={{ duration: 300, easing: quintOut }}>
          <!-- Comment Content -->
          <div class="comment-content">
            <div class="comment-avatar">
              {#if comment.userAvatar}
                <img src={comment.userAvatar} alt={comment.userName} />
              {:else}
                <div class="avatar-placeholder">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
              {/if}
            </div>

            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{comment.userName}</span>
                <span class="comment-time">{formatTimeAgo(comment.createdAt)}</span>
              </div>

              <div class="comment-text">
                {comment.content}
              </div>

              <div class="comment-actions">
                <button
                  class="action-btn like-btn"
                  class:active={comment.isLiked}
                  on:click={() => toggleCommentLike(comment.id, comment.isLiked)}
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M10 17.5L8.825 16.4C4.5 12.5 1.5 9.8 1.5 6.5C1.5 4.1 3.4 2.5 5.5 2.5C6.74 2.5 7.94 3.09 8.75 4C9.56 3.09 10.76 2.5 12 2.5C14.1 2.5 16 4.1 16 6.5C16 9.8 13 12.5 8.675 16.4L10 17.5Z" 
                      fill={comment.isLiked ? '#ff3b30' : 'none'}
                      stroke="currentColor" 
                      stroke-width="1.5"
                    />
                  </svg>
                  {comment.likes > 0 ? comment.likes : ''}
                </button>

                <button
                  class="action-btn reply-btn"
                  on:click={() => startReply(comment.id)}
                >
                  답글
                </button>

                {#if comment.replies && comment.replies.length > 0}
                  <button
                    class="action-btn toggle-replies-btn"
                    on:click={() => toggleReplies(comment.id)}
                  >
                    {expandedComments.has(comment.id) ? '답글 숨기기' : `답글 ${comment.replies.length}개 보기`}
                  </button>
                {/if}
              </div>
            </div>
          </div>

          <!-- Reply Composer -->
          {#if replyingTo === comment.id}
            <div class="reply-composer" in:slide={{ duration: 200 }}>
              <div class="composer-avatar">
                <div class="avatar-placeholder">👤</div>
              </div>
              
              <div class="composer-input">
                <textarea
                  bind:value={replyText}
                  placeholder={`${comment.userName}님에게 답글...`}
                  rows="2"
                  maxlength="500"
                  on:keydown={(e) => handleKeydown(e, () => submitReply(comment.id))}
                  disabled={loading}
                ></textarea>
                
                <div class="composer-actions">
                  <button class="cancel-btn" on:click={cancelReply}>
                    취소
                  </button>
                  
                  <button
                    class="submit-btn"
                    on:click={() => submitReply(comment.id)}
                    disabled={!replyText.trim() || loading}
                  >
                    {loading ? '게시 중...' : '답글 달기'}
                  </button>
                </div>
              </div>
            </div>
          {/if}

          <!-- Replies -->
          {#if comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id)}
            <div class="replies-list" in:slide={{ duration: 300 }}>
              {#each comment.replies as reply (reply.id)}
                <div class="reply-item" in:fly={{ x: 20, duration: 200 }}>
                  <div class="reply-content">
                    <div class="comment-avatar small">
                      {#if reply.userAvatar}
                        <img src={reply.userAvatar} alt={reply.userName} />
                      {:else}
                        <div class="avatar-placeholder">
                          {reply.userName.charAt(0).toUpperCase()}
                        </div>
                      {/if}
                    </div>

                    <div class="comment-body">
                      <div class="comment-header">
                        <span class="comment-author">{reply.userName}</span>
                        <span class="comment-time">{formatTimeAgo(reply.createdAt)}</span>
                      </div>

                      <div class="comment-text">
                        {reply.content}
                      </div>

                      <div class="comment-actions">
                        <button
                          class="action-btn like-btn"
                          class:active={reply.isLiked}
                          on:click={() => toggleCommentLike(reply.id, reply.isLiked)}
                        >
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                            <path 
                              d="M10 17.5L8.825 16.4C4.5 12.5 1.5 9.8 1.5 6.5C1.5 4.1 3.4 2.5 5.5 2.5C6.74 2.5 7.94 3.09 8.75 4C9.56 3.09 10.76 2.5 12 2.5C14.1 2.5 16 4.1 16 6.5C16 9.8 13 12.5 8.675 16.4L10 17.5Z" 
                              fill={reply.isLiked ? '#ff3b30' : 'none'}
                              stroke="currentColor" 
                              stroke-width="1.5"
                            />
                          </svg>
                          {reply.likes > 0 ? reply.likes : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Show More Comments -->
      {#if hasMoreComments && !showAllComments}
        <button
          class="show-more-btn"
          on:click={() => showAllComments = true}
          in:fade={{ duration: 200 }}
        >
          댓글 {comments.length - 3}개 더 보기
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .comment-thread {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
  }

  /* Comment Composer */
  .comment-composer {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .reply-composer {
    display: flex;
    gap: 12px;
    margin: 12px 0 0 52px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .composer-avatar {
    flex-shrink: 0;
  }

  .composer-input {
    flex: 1;
  }

  .composer-input textarea {
    width: 100%;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 44px;
    transition: border-color 0.2s ease;
  }

  .composer-input textarea:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  .composer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .character-count {
    font-size: 12px;
    color: #666;
  }

  .character-count .warning {
    color: #ff3b30;
  }

  .submit-btn {
    background: #007aff;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .submit-btn:hover:not(:disabled) {
    background: #0056cc;
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  .cancel-btn {
    background: none;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .cancel-btn:hover {
    background: #f5f5f5;
    border-color: #bbb;
  }

  /* Avatar */
  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .comment-avatar.small {
    width: 32px;
    height: 32px;
  }

  .comment-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 16px;
  }

  .comment-avatar.small .avatar-placeholder {
    font-size: 14px;
  }

  /* Comments List */
  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-comments {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-comments p {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #333;
  }

  .empty-comments span {
    font-size: 14px;
    color: #666;
  }

  /* Comment Item */
  .comment-item {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 16px;
  }

  .comment-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .comment-content {
    display: flex;
    gap: 12px;
  }

  .comment-body {
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
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }

  .comment-time {
    font-size: 12px;
    color: #666;
  }

  .comment-text {
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    margin-bottom: 8px;
    white-space: pre-wrap;
  }

  .comment-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .action-btn:hover {
    background: #f5f5f5;
    color: #333;
  }

  .like-btn.active {
    color: #ff3b30;
  }

  /* Replies */
  .replies-list {
    margin-left: 52px;
    margin-top: 12px;
    padding-left: 16px;
    border-left: 2px solid #f0f0f0;
  }

  .reply-item {
    margin-bottom: 12px;
  }

  .reply-item:last-child {
    margin-bottom: 0;
  }

  .reply-content {
    display: flex;
    gap: 8px;
  }

  /* Show More Button */
  .show-more-btn {
    background: none;
    border: 1px solid #ddd;
    color: #666;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    align-self: center;
    font-family: inherit;
  }

  .show-more-btn:hover {
    background: #f5f5f5;
    border-color: #bbb;
    color: #333;
  }

  /* Dark Theme */
  .dark {
    background: #1c1c1e;
    color: #ffffff;
  }

  .dark .comment-composer,
  .dark .comment-item {
    border-color: #38383a;
  }

  .dark .composer-input textarea {
    background: #2c2c2e;
    border-color: #38383a;
    color: #ffffff;
  }

  .dark .composer-input textarea:focus {
    border-color: #0a84ff;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
  }

  .dark .reply-composer {
    background: #2c2c2e;
  }

  .dark .comment-author,
  .dark .comment-text {
    color: #ffffff;
  }

  .dark .comment-time,
  .dark .action-btn {
    color: #8e8e93;
  }

  .dark .action-btn:hover {
    background: #38383a;
    color: #ffffff;
  }

  .dark .replies-list {
    border-color: #38383a;
  }

  .dark .show-more-btn,
  .dark .cancel-btn {
    border-color: #38383a;
    color: #8e8e93;
  }

  .dark .show-more-btn:hover,
  .dark .cancel-btn:hover {
    background: #38383a;
    color: #ffffff;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .comment-thread {
      padding: 16px;
    }

    .comment-composer,
    .reply-composer {
      gap: 8px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
    }

    .comment-avatar.small {
      width: 28px;
      height: 28px;
    }

    .avatar-placeholder {
      font-size: 14px;
    }

    .comment-avatar.small .avatar-placeholder {
      font-size: 12px;
    }

    .replies-list {
      margin-left: 40px;
      padding-left: 12px;
    }

    .reply-composer {
      margin-left: 40px;
    }

    .composer-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .character-count {
      text-align: center;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .comment-item,
    .reply-item,
    .action-btn {
      transition: none;
    }
  }
</style>