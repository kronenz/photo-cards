<script lang="ts">
  import { onMount } from 'svelte';
  import CommunityPostCard from '$lib/components/CommunityPostCard.svelte';
  import BookmarkManager from '$lib/components/BookmarkManager.svelte';
  import AppleSocialInteractions from '$lib/components/AppleSocialInteractions.svelte';
  import CommentThread from '$lib/components/CommentThread.svelte';
  import SocialShareModal from '$lib/components/SocialShareModal.svelte';
  import { hapticService, hapticPatterns } from '$lib/services/hapticService';
  import type { CommunityPost } from '$lib/types/community';
  import { PostType, UserGrade } from '$lib/types/community';

  // Demo state
  let currentView: 'interactions' | 'comments' | 'bookmarks' | 'posts' = 'interactions';
  let showShareModal = false;
  let theme: 'light' | 'dark' = 'light';

  // Demo data
  let demoPost: CommunityPost = {
    id: 'demo-post-1',
    userId: 'demo-user',
    userName: '야구매니아',
    userGrade: UserGrade.CHEER_MEMBER,
    teamId: 'lg-twins',
    content: '오늘 잠실에서 LG 트윈스 경기 봤는데 정말 감동적이었어요! 9회말 역전 홈런에 온 구장이 들썩였습니다 ⚾️✨',
    images: ['/images/stadium1.jpg'],
    type: PostType.STADIUM_VISIT,
    tags: ['LG트윈스', '잠실야구장', '직관', '홈런', '역전승'],
    likes: 42,
    comments: 15,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date('2024-01-15T19:30:00'),
    updatedAt: new Date('2024-01-15T19:30:00')
  };

  let interactionStats = {
    likes: 42,
    comments: 15,
    shares: 8,
    isLiked: false,
    isBookmarked: false
  };

  // Functions
  function handleLike() {
    interactionStats.isLiked = !interactionStats.isLiked;
    interactionStats.likes += interactionStats.isLiked ? 1 : -1;
    demoPost.isLiked = interactionStats.isLiked;
    demoPost.likes = interactionStats.likes;
    
    // Update demo post
    demoPost = { ...demoPost };
  }

  function handleComment() {
    console.log('Comment clicked');
  }

  function handleShare(event: CustomEvent<{ platform?: string }>) {
    if (event.detail.platform) {
      console.log('Sharing to:', event.detail.platform);
      interactionStats.shares += 1;
      demoPost.shares = interactionStats.shares;
      demoPost = { ...demoPost };
    } else {
      showShareModal = true;
    }
  }

  function handleBookmark() {
    interactionStats.isBookmarked = !interactionStats.isBookmarked;
    demoPost.isBookmarked = interactionStats.isBookmarked;
    demoPost = { ...demoPost };
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

  function testHapticPattern(pattern: keyof typeof hapticPatterns) {
    hapticPatterns[pattern]();
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    hapticPatterns.toggle();
  }

  onMount(() => {
    // Initialize haptic service
    console.log('Haptic support:', hapticService.isHapticSupported());
    console.log('Device type:', hapticService.getDeviceType());
  });
</script>

<svelte:head>
  <title>Apple 수준 소셜 인터랙션 데모</title>
  <meta name="description" content="Apple 수준의 소셜 인터랙션 기능 데모" />
</svelte:head>

<div class="demo-container" class:dark={theme === 'dark'}>
  <!-- Header -->
  <header class="demo-header">
    <div class="header-content">
      <h1>Apple 수준 소셜 인터랙션</h1>
      <p>부드러운 애니메이션, 햅틱 피드백, 실시간 댓글 시스템을 체험해보세요</p>
    </div>

    <div class="header-controls">
      <button class="theme-toggle" on:click={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
    </div>
  </header>

  <!-- Navigation -->
  <nav class="demo-nav">
    <button 
      class="nav-btn" 
      class:active={currentView === 'interactions'}
      on:click={() => { currentView = 'interactions'; hapticPatterns.buttonTap(); }}
    >
      ❤️ 인터랙션
    </button>
    <button 
      class="nav-btn" 
      class:active={currentView === 'comments'}
      on:click={() => { currentView = 'comments'; hapticPatterns.buttonTap(); }}
    >
      💬 댓글 시스템
    </button>
    <button 
      class="nav-btn" 
      class:active={currentView === 'bookmarks'}
      on:click={() => { currentView = 'bookmarks'; hapticPatterns.buttonTap(); }}
    >
      🔖 북마크
    </button>
    <button 
      class="nav-btn" 
      class:active={currentView === 'posts'}
      on:click={() => { currentView = 'posts'; hapticPatterns.buttonTap(); }}
    >
      📱 통합 포스트
    </button>
  </nav>

  <!-- Content -->
  <main class="demo-content">
    {#if currentView === 'interactions'}
      <section class="demo-section">
        <h2>Apple 스타일 소셜 인터랙션</h2>
        <p>부드러운 애니메이션과 햅틱 피드백이 포함된 소셜 버튼들</p>

        <div class="interaction-demo">
          <div class="demo-card">
            <div class="card-content">
              <h3>홀로그래픽 야구카드 데모</h3>
              <p>좋아요, 댓글, 공유, 북마크 버튼을 눌러보세요. 모바일에서는 햅틱 피드백을 느낄 수 있습니다.</p>
            </div>

            <AppleSocialInteractions
              postId="demo-interaction"
              likes={interactionStats.likes}
              comments={interactionStats.comments}
              shares={interactionStats.shares}
              isLiked={interactionStats.isLiked}
              isBookmarked={interactionStats.isBookmarked}
              size="large"
              {theme}
              on:like={handleLike}
              on:comment={handleComment}
              on:share={handleShare}
              on:bookmark={handleBookmark}
              on:hapticFeedback={handleHapticFeedback}
            />
          </div>

          <!-- Haptic Test Buttons -->
          <div class="haptic-tests">
            <h3>햅틱 피드백 테스트</h3>
            <div class="haptic-buttons">
              <button class="haptic-btn" on:click={() => testHapticPattern('like')}>
                ❤️ 좋아요
              </button>
              <button class="haptic-btn" on:click={() => testHapticPattern('bookmark')}>
                🔖 북마크
              </button>
              <button class="haptic-btn" on:click={() => testHapticPattern('success')}>
                ✅ 성공
              </button>
              <button class="haptic-btn" on:click={() => testHapticPattern('error')}>
                ❌ 오류
              </button>
              <button class="haptic-btn" on:click={() => testHapticPattern('homerun')}>
                ⚾ 홈런!
              </button>
            </div>
          </div>
        </div>
      </section>

    {:else if currentView === 'comments'}
      <section class="demo-section">
        <h2>실시간 댓글 시스템</h2>
        <p>중첩 댓글과 대댓글을 지원하는 Apple 스타일 댓글 시스템</p>

        <div class="comment-demo">
          <CommentThread
            postId="demo-comments"
            {theme}
            on:commentAdded={(e) => console.log('Comment added:', e.detail)}
          />
        </div>
      </section>

    {:else if currentView === 'bookmarks'}
      <section class="demo-section">
        <h2>북마크 컬렉션 관리</h2>
        <p>개인 컬렉션으로 포스트를 체계적으로 관리하세요</p>

        <div class="bookmark-demo">
          <BookmarkManager
            userId="demo-user"
            showCreateCollection={true}
          />
        </div>
      </section>

    {:else if currentView === 'posts'}
      <section class="demo-section">
        <h2>통합 소셜 포스트</h2>
        <p>모든 기능이 통합된 완전한 소셜 포스트 카드</p>

        <div class="post-demo">
          <CommunityPostCard
            post={demoPost}
            {theme}
            on:like={handleLike}
            on:comment={handleComment}
            on:share={handleShare}
            on:bookmark={handleBookmark}
            on:commentAdded={(e) => console.log('Comment added:', e.detail)}
          />
        </div>
      </section>
    {/if}
  </main>

  <!-- Features List -->
  <aside class="features-sidebar">
    <h3>구현된 기능</h3>
    <ul class="features-list">
      <li>✨ 부드러운 애니메이션 좋아요/하트 시스템</li>
      <li>💬 실시간 댓글과 대댓글 스레딩</li>
      <li>🔖 카드 북마크와 개인 컬렉션 저장</li>
      <li>📱 소셜 미디어 통합 공유 (Twitter, Instagram, Facebook)</li>
      <li>📳 Apple 스타일 햅틱 피드백 (모바일)</li>
      <li>🎨 라이트/다크 테마 지원</li>
      <li>♿ WCAG 2.1 AA 접근성 준수</li>
      <li>📱 완전한 반응형 디자인</li>
    </ul>

    <div class="device-info">
      <h4>디바이스 정보</h4>
      <p>햅틱 지원: {hapticService.isHapticSupported() ? '✅' : '❌'}</p>
      <p>디바이스 타입: {hapticService.getDeviceType()}</p>
    </div>
  </aside>

  <!-- Social Share Modal -->
  <SocialShareModal
    isOpen={showShareModal}
    postId="demo-share"
    postTitle="Apple 수준 소셜 인터랙션 데모"
    postImage="/images/demo-card.jpg"
    postUrl={typeof window !== 'undefined' ? window.location.href : ''}
    on:close={() => showShareModal = false}
    on:share={(e) => console.log('Shared to:', e.detail)}
  />
</div>

<style>
  .demo-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    transition: all 0.3s ease;
  }

  .demo-container.dark {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
  }

  /* Header */
  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .demo-container.dark .demo-header {
    background: rgba(0, 0, 0, 0.8);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .header-content h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-content p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  .demo-container.dark .header-content p {
    color: #999;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .theme-toggle:hover {
    background: rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .demo-container.dark .theme-toggle {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .demo-container.dark .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Navigation */
  .demo-nav {
    display: flex;
    gap: 8px;
    padding: 24px 32px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .demo-container.dark .demo-nav {
    background: rgba(0, 0, 0, 0.6);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;
    font-family: inherit;
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  .nav-btn.active {
    background: #007aff;
    color: white;
    border-color: #007aff;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }

  .demo-container.dark .nav-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ccc;
  }

  .demo-container.dark .nav-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .demo-container.dark .nav-btn.active {
    background: #0a84ff;
    color: white;
    border-color: #0a84ff;
  }

  /* Content */
  .demo-content {
    display: flex;
    gap: 32px;
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .demo-section {
    flex: 1;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 32px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .demo-container.dark .demo-section {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .demo-section h2 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #333;
  }

  .demo-container.dark .demo-section h2 {
    color: white;
  }

  .demo-section p {
    font-size: 16px;
    color: #666;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  .demo-container.dark .demo-section p {
    color: #999;
  }

  /* Demo Cards */
  .interaction-demo,
  .comment-demo,
  .bookmark-demo,
  .post-demo {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .demo-card {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .demo-container.dark .demo-card {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-content h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }

  .demo-container.dark .card-content h3 {
    color: white;
  }

  .card-content p {
    font-size: 14px;
    color: #666;
    margin: 0 0 20px 0;
    line-height: 1.5;
  }

  .demo-container.dark .card-content p {
    color: #ccc;
  }

  /* Haptic Tests */
  .haptic-tests h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: #333;
  }

  .demo-container.dark .haptic-tests h3 {
    color: white;
  }

  .haptic-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .haptic-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .haptic-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  /* Features Sidebar */
  .features-sidebar {
    width: 300px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    height: fit-content;
  }

  .demo-container.dark .features-sidebar {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .features-sidebar h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #333;
  }

  .demo-container.dark .features-sidebar h3 {
    color: white;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
  }

  .features-list li {
    font-size: 14px;
    color: #666;
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .demo-container.dark .features-list li {
    color: #ccc;
  }

  .device-info {
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .demo-container.dark .device-info {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .device-info h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }

  .demo-container.dark .device-info h4 {
    color: white;
  }

  .device-info p {
    font-size: 12px;
    color: #666;
    margin: 0 0 4px 0;
  }

  .demo-container.dark .device-info p {
    color: #999;
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .demo-content {
      flex-direction: column;
    }

    .features-sidebar {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .demo-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
      padding: 24px;
    }

    .header-content h1 {
      font-size: 24px;
    }

    .demo-nav {
      flex-wrap: wrap;
      padding: 20px 24px;
    }

    .demo-content {
      padding: 24px;
    }

    .demo-section {
      padding: 24px;
    }

    .haptic-buttons {
      justify-content: center;
    }
  }
</style>