<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getTeamById } from '$lib/data/baseballTeams';
  import type { CommunityPost } from '$lib/types/community';
  import { PostType, UserGrade } from '$lib/types/community';
  import HolographicCardV2 from './HolographicCardV2.svelte';
  import AppleSocialInteractions from './AppleSocialInteractions.svelte';
  import CommentThread from './CommentThread.svelte';
  import SocialShareModal from './SocialShareModal.svelte';
  import { hapticService, hapticPatterns } from '$lib/services/hapticService';

  // Props
  export let post: CommunityPost;
  export let showComments: boolean = false;
  export let theme: 'light' | 'dark' = 'light';

  // Events
  const dispatch = createEventDispatcher<{
    like: void;
    comment: void;
    share: { platform?: string };
    bookmark: void;
    cardClick: string;
    commentAdded: any;
  }>();

  // State
  let showCommentsSection = false;
  let showShareModal = false;

  // Computed
  $: team = post.teamId ? getTeamById(post.teamId) : null;
  $: timeAgo = formatTimeAgo(post.createdAt);
  $: postTypeLabel = getPostTypeLabel(post.type);
  $: userGradeColor = getUserGradeColor(post.userGrade);

  // Functions
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  }

  function getPostTypeLabel(type: PostType): string {
    const labels = {
      card_share: '카드 공유',
      game_highlight: '경기 하이라이트',
      stadium_visit: '직관 후기',
      player_support: '선수 응원',
      team_news: '팀 소식',
      fan_story: '팬 스토리',
      general: '일반'
    };
    return labels[type] || '일반';
  }

  function getUserGradeColor(grade: UserGrade): string {
    const colors = {
      [UserGrade.ROOKIE]: '#94a3b8',
      [UserGrade.OUTFIELD_FAN]: '#3b82f6',
      [UserGrade.CHEER_MEMBER]: '#8b5cf6',
      [UserGrade.SEASON_HOLDER]: '#f59e0b',
      [UserGrade.TEAM_LEGEND]: '#ef4444'
    };
    return colors[grade] || '#94a3b8';
  }

  function handleLike() {
    // Trigger appropriate haptic feedback
    if (post.isLiked) {
      hapticPatterns.unlike();
    } else {
      hapticPatterns.like();
    }
    dispatch('like');
  }

  function handleComment() {
    hapticPatterns.comment();
    showCommentsSection = !showCommentsSection;
    dispatch('comment');
  }

  function handleShare(event: CustomEvent<{ platform?: string }>) {
    hapticPatterns.share();
    if (event.detail.platform) {
      dispatch('share', event.detail);
    } else {
      showShareModal = true;
    }
  }

  function handleBookmark() {
    hapticPatterns.bookmark();
    dispatch('bookmark');
  }

  function handleHapticFeedback(event: CustomEvent<{ type: 'light' | 'medium' | 'heavy' }>) {
    const { type } = event.detail;
    switch (type) {
      case 'light':
        hapticService.light();
        break;
      case 'medium':
        hapticService.medium();
        break;
      case 'heavy':
        hapticService.heavy();
        break;
    }
  }

  function handleCommentAdded(event: CustomEvent) {
    dispatch('commentAdded', event.detail);
  }

  function handleCardClick() {
    if (post.cardId) {
      dispatch('cardClick', post.cardId);
    }
  }
</script>

<article 
  class="post-card"
  style={team ? `--team-primary: ${team.colors.primary}; --team-secondary: ${team.colors.secondary}` : ''}
>
  <!-- 포스트 헤더 -->
  <header class="post-header">
    <div class="user-info">
      <div class="user-avatar">
        {#if post.userAvatar}
          <img src={post.userAvatar} alt={post.userName} />
        {:else}
          <div class="avatar-placeholder">
            {post.userName.charAt(0).toUpperCase()}
          </div>
        {/if}
      </div>
      
      <div class="user-details">
        <div class="user-name-row">
          <span class="user-name">{post.userName}</span>
          <span 
            class="user-grade" 
            style="color: {userGradeColor}"
          >
            {post.userGrade}
          </span>
        </div>
        
        <div class="post-meta">
          <span class="post-time">{timeAgo}</span>
          <span class="post-type">{postTypeLabel}</span>
          {#if team}
            <span class="team-badge" style="background-color: {team.colors.primary}">
              {team.name}
            </span>
          {/if}
        </div>
      </div>
    </div>

    <div class="post-actions-menu">
      <button class="menu-button" aria-label="더보기">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </header>

  <!-- 포스트 콘텐츠 -->
  <div class="post-content">
    <p class="post-text">{post.content}</p>

    <!-- 이미지 -->
    {#if post.images && post.images.length > 0}
      <div class="post-images" class:single={post.images.length === 1}>
        {#each post.images as image, index}
          <div class="image-container">
            <img src={image} alt="포스트 이미지 {index + 1}" loading="lazy" />
          </div>
        {/each}
      </div>
    {/if}

    <!-- 연관된 카드 -->
    {#if post.cardId}
      <div class="attached-card" role="button" tabindex="0" on:click={handleCardClick} on:keydown={(e) => e.key === 'Enter' && handleCardClick()}>
        <div class="card-preview">
          <HolographicCardV2 
            frontImage="/images/sample-card.jpg"
            title="홀로그래픽 카드"
            rarity="rare holo"
            enableFlip={false}
          />
        </div>
        <div class="card-info">
          <h4>홀로그래픽 카드</h4>
          <p>클릭하여 카드 상세보기</p>
        </div>
      </div>
    {/if}

    <!-- 태그 -->
    {#if post.tags && post.tags.length > 0}
      <div class="post-tags">
        {#each post.tags as tag}
          <span class="tag">#{tag}</span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Apple-level Social Interactions -->
  <footer class="post-actions">
    <AppleSocialInteractions
      postId={post.id}
      likes={post.likes}
      comments={post.comments}
      shares={post.shares}
      isLiked={post.isLiked}
      isBookmarked={post.isBookmarked}
      {theme}
      on:like={handleLike}
      on:comment={handleComment}
      on:share={handleShare}
      on:bookmark={handleBookmark}
      on:hapticFeedback={handleHapticFeedback}
    />
  </footer>

  <!-- Comments Section -->
  {#if showCommentsSection}
    <CommentThread
      postId={post.id}
      {theme}
      on:commentAdded={handleCommentAdded}
    />
  {/if}

  <!-- Social Share Modal -->
  <SocialShareModal
    isOpen={showShareModal}
    postId={post.id}
    postTitle={post.content}
    postImage={post.images?.[0] || ''}
    postUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`}
    on:close={() => showShareModal = false}
    on:share={(e) => dispatch('share', e.detail)}
  />
</article>

<style>
  .post-card {
    background: white;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s ease;
    position: relative;
  }

  .post-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-color: var(--team-primary, var(--primary-color, #3b82f6));
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .user-info {
    display: flex;
    gap: 12px;
    flex: 1;
  }

  .user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .user-avatar img {
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
    font-weight: 700;
    font-size: 18px;
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .user-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary, #1a1a1a);
  }

  .user-grade {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    border: 1px solid currentColor;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-secondary, #6b7280);
    flex-wrap: wrap;
  }

  .post-meta > * {
    white-space: nowrap;
  }

  .team-badge {
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .menu-button {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary, #6b7280);
    transition: all 0.2s ease;
  }

  .menu-button:hover {
    background: var(--surface-secondary, #f8f9fa);
    color: var(--text-primary, #1a1a1a);
  }

  .post-content {
    margin-bottom: 16px;
  }

  .post-text {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 16px 0;
    white-space: pre-wrap;
  }

  .post-images {
    display: grid;
    gap: 8px;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
  }

  .post-images.single {
    grid-template-columns: 1fr;
  }

  .post-images:not(.single) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .image-container {
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: 8px;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  .image-container:hover img {
    transform: scale(1.05);
  }

  .attached-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: var(--surface-secondary, #f8f9fa);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 16px;
  }

  .attached-card:hover {
    background: var(--surface-tertiary, #e5e7eb);
    transform: translateY(-2px);
  }

  .card-preview {
    width: 80px;
    height: 112px;
    flex-shrink: 0;
  }

  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 4px 0;
  }

  .card-info p {
    font-size: 14px;
    color: var(--text-secondary, #6b7280);
    margin: 0;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    font-size: 14px;
    color: var(--team-primary, var(--primary-color, #3b82f6));
    background: rgba(var(--team-primary-rgb, 59, 130, 246), 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background: rgba(var(--team-primary-rgb, 59, 130, 246), 0.2);
  }

  .post-actions {
    border-top: 1px solid var(--border-color, #e1e5e9);
    padding-top: 16px;
  }

  .action-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--text-secondary, #6b7280);
  }

  .action-buttons {
    display: flex;
    justify-content: space-around;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .action-btn:hover {
    background: var(--surface-secondary, #f8f9fa);
    color: var(--text-primary, #1a1a1a);
  }

  .action-btn.active {
    color: var(--team-primary, var(--primary-color, #3b82f6));
  }

  .like-btn.active {
    color: #ef4444;
  }

  .bookmark-btn.active {
    color: #3b82f6;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .post-card {
      padding: 16px;
      border-radius: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
    }

    .avatar-placeholder {
      font-size: 16px;
    }

    .post-text {
      font-size: 15px;
    }

    .attached-card {
      flex-direction: column;
      gap: 12px;
    }

    .card-preview {
      width: 60px;
      height: 84px;
      align-self: center;
    }

    .action-buttons {
      gap: 8px;
    }

    .action-btn {
      padding: 6px 12px;
      font-size: 13px;
    }

    .action-btn span {
      display: none;
    }
  }
</style>