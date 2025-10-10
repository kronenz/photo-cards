<script lang="ts">
  import { onMount } from 'svelte';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';

  // Types
  type FeedTab = 'all' | 'following' | 'trending' | 'recent';
  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';

  interface Post {
    id: string;
    type: 'card' | 'text' | 'poll';
    author: {
      id: string;
      name: string;
      avatar: string;
      team?: TeamId;
    };
    content: string;
    card?: {
      title: string;
      subtitle: string;
      number: string;
      team: TeamId;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      image: string;
    };
    images?: string[];
    stats: {
      likes: number;
      comments: number;
      shares: number;
    };
    isLiked: boolean;
    createdAt: string;
  }

  // State
  let activeTab: FeedTab = 'all';
  let selectedTeam: TeamId | null = null;
  let posts: Post[] = [];

  // Teams data
  const teams = [
    { id: 'lg', name: 'LG 트윈스', color: '#C30452', icon: '⚾' },
    { id: 'doosan', name: '두산 베어스', color: '#131230', icon: '🐻' },
    { id: 'kt', name: 'KT 위즈', color: '#000000', icon: '🧙' },
    { id: 'samsung', name: '삼성 라이온즈', color: '#074CA1', icon: '🦁' },
    { id: 'nc', name: 'NC 다이노스', color: '#1D467F', icon: '🦕' },
    { id: 'kia', name: 'KIA 타이거즈', color: '#EA0029', icon: '🐯' },
    { id: 'lotte', name: '롯데 자이언츠', color: '#041E42', icon: '⚡' },
    { id: 'ssg', name: 'SSG 랜더스', color: '#CE0E2D', icon: '🦅' },
    { id: 'hanwha', name: '한화 이글스', color: '#FF6600', icon: '🦅' },
    { id: 'kiwoom', name: '키움 히어로즈', color: '#570514', icon: '🦸' }
  ];

  // Mock posts
  const mockPosts: Post[] = [
    {
      id: '1',
      type: 'card',
      author: {
        id: 'user1',
        name: '야구팬123',
        avatar: '👤',
        team: 'kia'
      },
      content: '김도영 선수 레전더리 카드 획득했습니다! 🎉',
      card: {
        title: '김도영',
        subtitle: '내야수',
        number: '5',
        team: 'kia',
        rarity: 'legendary',
        image: 'https://assets.codepen.io/13471/charizard-gx.webp'
      },
      stats: { likes: 156, comments: 23, shares: 12 },
      isLiked: false,
      createdAt: '2024-01-10T10:30:00Z'
    },
    {
      id: '2',
      type: 'text',
      author: {
        id: 'user2',
        name: 'LG팬',
        avatar: '👤',
        team: 'lg'
      },
      content: '29년만의 우승 정말 감동이었습니다 ㅠㅠ 모든 선수분들 고생하셨어요! #LG트윈스 #우승',
      stats: { likes: 342, comments: 67, shares: 45 },
      isLiked: true,
      createdAt: '2024-01-09T15:20:00Z'
    },
    {
      id: '3',
      type: 'card',
      author: {
        id: 'user3',
        name: '삼성팬',
        avatar: '👤',
        team: 'samsung'
      },
      content: '이승엽 선수 추억의 카드! 아시아 홈런왕 👑',
      card: {
        title: '이승엽',
        subtitle: '외야수',
        number: '36',
        team: 'samsung',
        rarity: 'legendary',
        image: 'https://assets.codepen.io/13471/pikachu-gx.webp'
      },
      stats: { likes: 234, comments: 45, shares: 23 },
      isLiked: false,
      createdAt: '2024-01-08T12:00:00Z'
    }
  ];

  // Load posts
  function loadPosts() {
    posts = mockPosts;
  }

  // Handle like
  function handleLike(postId: string) {
    posts = posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, stats: { ...post.stats, likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1 } }
        : post
    );
  }

  // Format time
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  }

  onMount(() => {
    loadPosts();
  });
</script>

<svelte:head>
  <title>커뮤니티 - Baseball 홀로그래픽 카드</title>
  <meta name="description" content="야구 팬들이 모여 카드를 공유하고 소통하는 커뮤니티" />
</svelte:head>

<div class="community-page">
  <!-- Left Sidebar -->
  <aside class="left-sidebar">
    <div class="sidebar-section">
      <h3 class="sidebar-title">메뉴</h3>
      <nav class="nav-menu">
        <button class="nav-item" class:active={!selectedTeam}>
          <span class="nav-icon">🏠</span>
          <span class="nav-label">홈 피드</span>
        </button>
        <button class="nav-item">
          <span class="nav-icon">🔥</span>
          <span class="nav-label">트렌딩</span>
        </button>
        <button class="nav-item">
          <span class="nav-icon">🎴</span>
          <span class="nav-label">내 카드</span>
        </button>
        <button class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-label">팔로잉</span>
        </button>
        <button class="nav-item">
          <span class="nav-icon">🔖</span>
          <span class="nav-label">저장됨</span>
        </button>
      </nav>
    </div>

    <div class="sidebar-section">
      <h3 class="sidebar-title">팀별 커뮤니티</h3>
      <nav class="team-list">
        {#each teams as team}
          <button
            class="team-item"
            class:active={selectedTeam === team.id}
            on:click={() => selectedTeam = selectedTeam === team.id ? null : team.id}
          >
            <span class="team-icon">{team.icon}</span>
            <span class="team-name">{team.name}</span>
          </button>
        {/each}
      </nav>
    </div>
  </aside>

  <!-- Main Feed -->
  <main class="main-feed">
    <!-- Tabs -->
    <div class="feed-tabs">
      <button class="feed-tab" class:active={activeTab === 'all'} on:click={() => activeTab = 'all'}>
        전체
      </button>
      <button class="feed-tab" class:active={activeTab === 'following'} on:click={() => activeTab = 'following'}>
        팔로잉
      </button>
      <button class="feed-tab" class:active={activeTab === 'trending'} on:click={() => activeTab = 'trending'}>
        트렌딩
      </button>
      <button class="feed-tab" class:active={activeTab === 'recent'} on:click={() => activeTab = 'recent'}>
        최신
      </button>
    </div>

    <!-- Post Composer -->
    <div class="post-composer">
      <div class="composer-avatar">👤</div>
      <button class="composer-input">무슨 생각을 하고 계신가요?</button>
      <button class="composer-card-btn" title="카드 첨부">🎴</button>
    </div>

    <!-- Posts -->
    <div class="posts-container">
      {#each posts as post (post.id)}
        <article class="post-card">
          <!-- Author -->
          <div class="post-header">
            <div class="author-info">
              <div class="author-avatar">{post.author.avatar}</div>
              <div class="author-details">
                <div class="author-name">{post.author.name}</div>
                <div class="post-time">{formatTime(post.createdAt)}</div>
              </div>
            </div>
            <button class="post-menu">⋯</button>
          </div>

          <!-- Content -->
          <div class="post-content">
            <p class="post-text">{post.content}</p>

            {#if post.type === 'card' && post.card}
              <div class="post-card-preview">
                <UnifiedCard
                  title={post.card.title}
                  subtitle={post.card.subtitle}
                  number={post.card.number}
                  team={post.card.team}
                  rarity={post.card.rarity}
                  image={post.card.image}
                  size="medium"
                />
              </div>
            {/if}
          </div>

          <!-- Actions -->
          <div class="post-actions">
            <button
              class="action-btn"
              class:liked={post.isLiked}
              on:click={() => handleLike(post.id)}
            >
              <span class="action-icon">{post.isLiked ? '❤️' : '🤍'}</span>
              <span class="action-count">{post.stats.likes}</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">💬</span>
              <span class="action-count">{post.stats.comments}</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">🔄</span>
              <span class="action-count">{post.stats.shares}</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">🔖</span>
            </button>
          </div>
        </article>
      {/each}
    </div>
  </main>

  <!-- Right Sidebar -->
  <aside class="right-sidebar">
    <!-- Live Schedule -->
    <div class="widget">
      <h3 class="widget-title">🔴 오늘의 경기</h3>
      <div class="schedule-list">
        <div class="schedule-item">
          <div class="schedule-teams">
            <span class="team">LG 트윈스</span>
            <span class="vs">vs</span>
            <span class="team">두산 베어스</span>
          </div>
          <div class="schedule-time">19:00</div>
        </div>
        <div class="schedule-item">
          <div class="schedule-teams">
            <span class="team">KIA 타이거즈</span>
            <span class="vs">vs</span>
            <span class="team">삼성 라이온즈</span>
          </div>
          <div class="schedule-time">18:30</div>
        </div>
      </div>
    </div>

    <!-- Popular Cards -->
    <div class="widget">
      <h3 class="widget-title">🏆 인기 카드 Top 5</h3>
      <div class="popular-cards">
        <div class="popular-card-item">
          <span class="rank">1</span>
          <div class="card-info">
            <div class="card-name">김도영</div>
            <div class="card-team">KIA 타이거즈</div>
          </div>
          <span class="card-likes">567 ❤️</span>
        </div>
        <div class="popular-card-item">
          <span class="rank">2</span>
          <div class="card-info">
            <div class="card-name">이승엽</div>
            <div class="card-team">삼성 라이온즈</div>
          </div>
          <span class="card-likes">456 ❤️</span>
        </div>
        <div class="popular-card-item">
          <span class="rank">3</span>
          <div class="card-info">
            <div class="card-name">류현진</div>
            <div class="card-team">LG 트윈스</div>
          </div>
          <span class="card-likes">342 ❤️</span>
        </div>
      </div>
    </div>

    <!-- Recommended Users -->
    <div class="widget">
      <h3 class="widget-title">👥 추천 사용자</h3>
      <div class="user-list">
        <div class="user-item">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <div class="user-name">야구매니아</div>
            <div class="user-desc">카드 수집가</div>
          </div>
          <button class="follow-btn">팔로우</button>
        </div>
        <div class="user-item">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <div class="user-name">KBO팬</div>
            <div class="user-desc">LG 트윈스 팬</div>
          </div>
          <button class="follow-btn">팔로우</button>
        </div>
      </div>
    </div>
  </aside>
</div>

<style>
  .community-page {
    display: grid;
    grid-template-columns: 280px 1fr 360px;
    gap: 24px;
    max-width: 1920px;
    margin: 0 auto;
    padding: 24px 40px;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  }

  /* Left Sidebar */
  .left-sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
  }

  .sidebar-section {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .sidebar-title {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav-menu, .team-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item, .team-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 15px;
    text-align: left;
    width: 100%;
  }

  .nav-item:hover, .team-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .nav-item.active, .team-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    color: #667eea;
  }

  .nav-icon, .team-icon {
    font-size: 20px;
  }

  .nav-label, .team-name {
    font-weight: 600;
  }

  /* Main Feed */
  .main-feed {
    max-width: 800px;
  }

  .feed-tabs {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px;
    margin-bottom: 20px;
  }

  .feed-tab {
    flex: 1;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .feed-tab:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  .feed-tab.active {
    color: #fff;
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  /* Post Composer */
  .post-composer {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .composer-avatar {
    font-size: 32px;
  }

  .composer-input {
    flex: 1;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    color: rgba(255, 255, 255, 0.5);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .composer-input:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .composer-card-btn {
    padding: 10px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .composer-card-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Posts */
  .posts-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .post-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-avatar {
    font-size: 32px;
  }

  .author-name {
    font-weight: 600;
    color: #fff;
  }

  .post-time {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .post-menu {
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
    cursor: pointer;
  }

  .post-content {
    margin-bottom: 16px;
  }

  .post-text {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin: 0 0 16px 0;
  }

  .post-card-preview {
    display: flex;
    justify-content: center;
  }

  .post-actions {
    display: flex;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .action-btn.liked {
    color: #ff4458;
    border-color: #ff4458;
  }

  .action-icon {
    font-size: 18px;
  }

  .action-count {
    font-size: 14px;
    font-weight: 600;
  }

  /* Right Sidebar */
  .right-sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
  }

  .widget {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .widget-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 16px 0;
  }

  /* Schedule */
  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .schedule-item {
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .schedule-teams {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #fff;
    font-weight: 600;
  }

  .vs {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  .schedule-time {
    color: #667eea;
    font-weight: 600;
  }

  /* Popular Cards */
  .popular-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .popular-card-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .rank {
    font-size: 18px;
    font-weight: 700;
    color: #667eea;
    min-width: 24px;
  }

  .card-info {
    flex: 1;
  }

  .card-name {
    font-weight: 600;
    color: #fff;
  }

  .card-team {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .card-likes {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Users */
  .user-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    font-size: 32px;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-weight: 600;
    color: #fff;
  }

  .user-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .follow-btn {
    padding: 6px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 20px;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .follow-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  /* Responsive */
  @media (max-width: 1400px) {
    .community-page {
      grid-template-columns: 240px 1fr 300px;
      gap: 20px;
      padding: 20px;
    }
  }

  @media (max-width: 1200px) {
    .community-page {
      grid-template-columns: 1fr;
      padding: 20px;
    }

    .left-sidebar, .right-sidebar {
      display: none;
    }

    .main-feed {
      max-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .community-page {
      padding: 12px;
    }

    .post-card {
      padding: 16px;
    }

    .post-composer {
      padding: 16px;
      gap: 12px;
    }

    .feed-tabs {
      padding: 6px;
    }

    .feed-tab {
      padding: 8px 12px;
      font-size: 14px;
    }
  }
</style>
