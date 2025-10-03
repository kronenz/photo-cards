<script lang="ts">
  import { onMount } from 'svelte';
  import { communityService } from '$lib/services/communityService';
  import { BASEBALL_TEAMS, getTeamById } from '$lib/data/baseballTeams';
  import type { CommunityPost, FeedFilter } from '$lib/types/community';
  import { PostType, UserGrade } from '$lib/types/community';
  import CommunityPostCard from './CommunityPostCard.svelte';
  import TeamSelector from './TeamSelector.svelte';
  import PostComposer from './PostComposer.svelte';

  // Props
  export let selectedTeamId: string | undefined = undefined;
  export let showTeamSelector: boolean = true;
  export let showPostComposer: boolean = true;

  // State
  let posts: CommunityPost[] = [];
  let loading = false;
  let hasMore = false;
  let filter: FeedFilter = {
    sortBy: 'latest',
    timeRange: 'week'
  };

  // Reactive statements
  $: if (selectedTeamId) {
    filter.teamId = selectedTeamId;
    loadFeed();
  }

  // Functions
  async function loadFeed(append = false) {
    if (loading) return;
    
    loading = true;
    try {
      const result = await communityService.getFeed(filter);
      if (append) {
        posts = [...posts, ...result.posts];
      } else {
        posts = result.posts;
      }
      hasMore = result.hasMore;
    } catch (error) {
      console.error('Failed to load community feed:', error);
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (hasMore && !loading) {
      await loadFeed(true);
    }
  }

  function handleTeamSelect(teamId: string | undefined) {
    selectedTeamId = teamId;
  }

  function handleFilterChange(newFilter: Partial<FeedFilter>) {
    filter = { ...filter, ...newFilter };
    loadFeed();
  }

  async function handlePostCreated(newPost: CommunityPost) {
    posts = [newPost, ...posts];
  }

  async function handlePostInteraction(postId: string, type: 'like' | 'comment' | 'share' | 'bookmark') {
    try {
      await communityService.interactWithPost(postId, type);
      
      // 로컬 상태 업데이트
      posts = posts.map(post => {
        if (post.id === postId) {
          switch (type) {
            case 'like':
              return {
                ...post,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !post.isLiked
              };
            case 'bookmark':
              return {
                ...post,
                isBookmarked: !post.isBookmarked
              };
            case 'share':
              return {
                ...post,
                shares: post.shares + 1
              };
            default:
              return post;
          }
        }
        return post;
      });
    } catch (error) {
      console.error('Failed to interact with post:', error);
    }
  }

  onMount(() => {
    loadFeed();
  });
</script>

<div class="community-feed">
  <!-- 헤더 -->
  <div class="feed-header">
    <h2 class="feed-title">
      {#if selectedTeamId}
        {getTeamById(selectedTeamId)?.name} 팬클럽
      {:else}
        KBO 커뮤니티
      {/if}
    </h2>
    
    {#if showTeamSelector}
      <TeamSelector 
        {selectedTeamId} 
        on:teamSelect={(e) => handleTeamSelect(e.detail)} 
      />
    {/if}
  </div>

  <!-- 필터 -->
  <div class="feed-filters">
    <div class="filter-group">
      <label for="sort-select">정렬</label>
      <select 
        id="sort-select"
        bind:value={filter.sortBy} 
        on:change={() => handleFilterChange({ sortBy: filter.sortBy })}
      >
        <option value="latest">최신순</option>
        <option value="popular">인기순</option>
        <option value="trending">트렌딩</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="time-select">기간</label>
      <select 
        id="time-select"
        bind:value={filter.timeRange} 
        on:change={() => handleFilterChange({ timeRange: filter.timeRange })}
      >
        <option value="today">오늘</option>
        <option value="week">이번 주</option>
        <option value="month">이번 달</option>
        <option value="all">전체</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="type-select">타입</label>
      <select 
        id="type-select"
        bind:value={filter.postType} 
        on:change={() => handleFilterChange({ postType: filter.postType })}
      >
        <option value="">전체</option>
        <option value="card_share">카드 공유</option>
        <option value="stadium_visit">직관 후기</option>
        <option value="fan_story">팬 스토리</option>
        <option value="team_news">팀 소식</option>
      </select>
    </div>
  </div>

  <!-- 포스트 작성 -->
  {#if showPostComposer}
    <PostComposer 
      {selectedTeamId} 
      on:postCreated={(e) => handlePostCreated(e.detail)} 
    />
  {/if}

  <!-- 피드 콘텐츠 -->
  <div class="feed-content">
    {#if loading && posts.length === 0}
      <div class="loading-skeleton">
        {#each Array(3) as _}
          <div class="skeleton-post">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if posts.length === 0}
      <div class="empty-state">
        <div class="empty-icon">⚾</div>
        <h3>아직 포스트가 없습니다</h3>
        <p>첫 번째 포스트를 작성해보세요!</p>
      </div>
    {:else}
      <div class="posts-list">
        {#each posts as post (post.id)}
          <CommunityPostCard 
            {post} 
            on:like={() => handlePostInteraction(post.id, 'like')}
            on:comment={() => handlePostInteraction(post.id, 'comment')}
            on:share={() => handlePostInteraction(post.id, 'share')}
            on:bookmark={() => handlePostInteraction(post.id, 'bookmark')}
          />
        {/each}
      </div>

      <!-- 더 보기 버튼 -->
      {#if hasMore}
        <div class="load-more">
          <button 
            class="load-more-btn" 
            on:click={loadMore} 
            disabled={loading}
          >
            {loading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .community-feed {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color, #e1e5e9);
  }

  .feed-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
    margin: 0;
  }

  .feed-filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--surface-secondary, #f8f9fa);
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
  }

  .filter-group label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-group select {
    padding: 8px 12px;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 8px;
    background: white;
    font-size: 14px;
    color: var(--text-primary, #1a1a1a);
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .filter-group select:hover {
    border-color: var(--primary-color, #3b82f6);
  }

  .filter-group select:focus {
    outline: none;
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .feed-content {
    min-height: 400px;
  }

  .loading-skeleton {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skeleton-post {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: var(--surface-secondary, #f8f9fa);
    border-radius: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--border-color, #e1e5e9);
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-line {
    height: 16px;
    background: var(--border-color, #e1e5e9);
    border-radius: 4px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary, #6b7280);
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-primary, #1a1a1a);
  }

  .empty-state p {
    font-size: 14px;
    margin: 0;
  }

  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .load-more {
    text-align: center;
    margin-top: 24px;
  }

  .load-more-btn {
    padding: 12px 24px;
    background: var(--primary-color, #3b82f6);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .load-more-btn:hover:not(:disabled) {
    background: var(--primary-color-dark, #2563eb);
    transform: translateY(-1px);
  }

  .load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .community-feed {
      padding: 16px;
    }

    .feed-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .feed-filters {
      flex-direction: column;
      gap: 12px;
    }

    .filter-group {
      min-width: auto;
    }
  }
</style>