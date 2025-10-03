<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { communityService } from '$lib/services/communityService';
  import { BASEBALL_TEAMS, getTeamById } from '$lib/data/baseballTeams';
  import type { CommunityPost, FeedFilter, TeamCommunity } from '$lib/types/community';
  import { PostType, UserGrade } from '$lib/types/community';
  import CommunityPostCard from './CommunityPostCard.svelte';
  import TeamSelector from './TeamSelector.svelte';
  import PostComposer from './PostComposer.svelte';

  // Props
  export let selectedTeamId: string | undefined = undefined;
  export let showTeamSelector: boolean = true;
  export let showPostComposer: boolean = true;
  export const feedType: 'all' | 'featured' | 'trending' | 'new' = 'all';

  // Events
  const dispatch = createEventDispatcher<{
    teamSelect: string | undefined;
    postInteraction: { postId: string; type: string };
  }>();

  // State
  let posts: CommunityPost[] = [];
  let featuredPosts: CommunityPost[] = [];
  let loading = false;
  let hasMore = false;
  let teamCommunity: TeamCommunity | null = null;
  let activeTab: 'featured' | 'trending' | 'new' | 'all' = 'featured';
  
  let filter: FeedFilter = {
    sortBy: 'latest',
    timeRange: 'week'
  };

  // Reactive statements
  $: if (selectedTeamId) {
    filter.teamId = selectedTeamId;
    loadTeamData();
  }

  $: currentTeam = selectedTeamId ? getTeamById(selectedTeamId) : null;

  // Functions
  async function loadTeamData() {
    if (!selectedTeamId) return;
    
    try {
      teamCommunity = await communityService.getTeamCommunity(selectedTeamId);
      featuredPosts = await communityService.getFeaturedPosts(selectedTeamId);
    } catch (error) {
      console.error('Failed to load team data:', error);
    }
  }

  async function loadFeed(append = false) {
    if (loading) return;
    
    loading = true;
    try {
      let result;
      
      switch (activeTab) {
        case 'featured':
          result = { posts: await communityService.getFeaturedPosts(selectedTeamId), hasMore: false };
          break;
        case 'trending':
          filter.sortBy = 'trending';
          result = await communityService.getFeed(filter);
          break;
        case 'new':
          filter.sortBy = 'latest';
          result = await communityService.getFeed(filter);
          break;
        default:
          result = await communityService.getFeed(filter);
      }
      
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
    dispatch('teamSelect', teamId);
  }

  function handleTabChange(tab: typeof activeTab) {
    activeTab = tab;
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

      dispatch('postInteraction', { postId, type });
    } catch (error) {
      console.error('Failed to interact with post:', error);
    }
  }

  onMount(() => {
    loadFeed();
    if (selectedTeamId) {
      loadTeamData();
    }
  });
</script>

<div class="enhanced-community-feed">
  <!-- 헤더 -->
  <div class="feed-header">
    <div class="header-content">
      <h2 class="feed-title">
        {#if selectedTeamId && currentTeam}
          <span class="team-badge" style="background-color: {currentTeam.colors.primary}">
            {currentTeam.name.charAt(0)}
          </span>
          {currentTeam.name} 팬클럽
        {:else}
          <span class="kbo-badge">⚾</span>
          KBO 커뮤니티
        {/if}
      </h2>
      
      {#if teamCommunity}
        <div class="community-stats">
          <div class="stat-item">
            <span class="stat-number">{teamCommunity.memberCount.toLocaleString()}</span>
            <span class="stat-label">멤버</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{teamCommunity.activeMembers}</span>
            <span class="stat-label">활성 사용자</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{teamCommunity.todayPosts}</span>
            <span class="stat-label">오늘 포스트</span>
          </div>
        </div>
      {/if}
    </div>
    
    {#if showTeamSelector}
      <TeamSelector 
        {selectedTeamId} 
        on:teamSelect={(e) => handleTeamSelect(e.detail)} 
      />
    {/if}
  </div>

  <!-- 탭 네비게이션 -->
  <div class="feed-tabs">
    <button 
      class="tab-button" 
      class:active={activeTab === 'featured'}
      on:click={() => handleTabChange('featured')}
    >
      <span class="tab-icon">⭐</span>
      Featured
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'trending'}
      on:click={() => handleTabChange('trending')}
    >
      <span class="tab-icon">🔥</span>
      Trending
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'new'}
      on:click={() => handleTabChange('new')}
    >
      <span class="tab-icon">🆕</span>
      New
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'all'}
      on:click={() => handleTabChange('all')}
    >
      <span class="tab-icon">📋</span>
      All
    </button>
  </div>

  <!-- 트렌딩 태그 -->
  {#if teamCommunity && teamCommunity.trendingTags.length > 0}
    <div class="trending-tags">
      <h3>🔥 인기 태그</h3>
      <div class="tags-list">
        {#each teamCommunity.trendingTags as tag}
          <span class="trending-tag" style={currentTeam ? `color: ${currentTeam.colors.primary}` : ''}>
            #{tag}
          </span>
        {/each}
      </div>
    </div>
  {/if}

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
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if posts.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          {#if selectedTeamId && currentTeam}
            <div class="team-empty-icon" style="background-color: {currentTeam.colors.primary}">
              {currentTeam.name.charAt(0)}
            </div>
          {:else}
            ⚾
          {/if}
        </div>
        <h3>
          {#if activeTab === 'featured'}
            아직 추천 포스트가 없습니다
          {:else if activeTab === 'trending'}
            트렌딩 포스트가 없습니다
          {:else}
            아직 포스트가 없습니다
          {/if}
        </h3>
        <p>
          {#if selectedTeamId && currentTeam}
            {currentTeam.name} 팬클럽의 첫 번째 포스트를 작성해보세요!
          {:else}
            첫 번째 포스트를 작성해보세요!
          {/if}
        </p>
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
            style={currentTeam ? `background-color: ${currentTeam.colors.primary}` : ''}
          >
            {loading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .enhanced-community-feed {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--border-color, #e1e5e9);
  }

  .header-content {
    flex: 1;
  }

  .feed-title {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .team-badge {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
  }

  .kbo-badge {
    font-size: 32px;
  }

  .community-stats {
    display: flex;
    gap: 24px;
    margin-top: 8px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-number {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .feed-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    background: var(--surface-secondary, #f8f9fa);
    border-radius: 12px;
    padding: 4px;
  }

  .tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .tab-button:hover {
    color: var(--text-primary, #1a1a1a);
    background: rgba(255, 255, 255, 0.5);
  }

  .tab-button.active {
    background: white;
    color: var(--text-primary, #1a1a1a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tab-icon {
    font-size: 16px;
  }

  .trending-tags {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    color: white;
  }

  .trending-tags h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .trending-tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .trending-tag:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .feed-content {
    min-height: 400px;
  }

  .loading-skeleton {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .skeleton-post {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: var(--surface-secondary, #f8f9fa);
    border-radius: 16px;
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
    gap: 12px;
  }

  .skeleton-line {
    height: 16px;
    background: var(--border-color, #e1e5e9);
    border-radius: 8px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  .skeleton-line.medium {
    width: 80%;
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;
    color: var(--text-secondary, #6b7280);
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .team-empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 32px;
    margin: 0 auto 20px;
  }

  .empty-state h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: var(--text-primary, #1a1a1a);
  }

  .empty-state p {
    font-size: 16px;
    margin: 0;
    line-height: 1.5;
  }

  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .load-more {
    text-align: center;
    margin-top: 32px;
  }

  .load-more-btn {
    padding: 14px 32px;
    background: var(--primary-color, #3b82f6);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .load-more-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
    .enhanced-community-feed {
      padding: 16px;
    }

    .feed-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .feed-title {
      font-size: 24px;
    }

    .team-badge {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }

    .community-stats {
      gap: 16px;
      justify-content: center;
    }

    .stat-number {
      font-size: 16px;
    }

    .feed-tabs {
      flex-direction: column;
      gap: 2px;
    }

    .tab-button {
      justify-content: flex-start;
      padding: 10px 16px;
    }

    .trending-tags {
      padding: 16px;
      margin-bottom: 20px;
    }

    .empty-icon {
      font-size: 48px;
    }

    .team-empty-icon {
      width: 60px;
      height: 60px;
      font-size: 24px;
    }
  }
</style>