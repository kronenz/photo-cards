<script lang="ts">
  import { onMount } from 'svelte';
  import RealtimePreview from '$lib/components/RealtimePreview.svelte';
  import AppleSaveAnimation from '$lib/components/AppleSaveAnimation.svelte';

  // State variables
  let selectedDemo = 'kbo-legend';
  let holographicEnabled = true;
  let previewQuality: 'preview' | 'high' | 'ultra' = 'high';
  let performanceMode = false;
  let showExportManager = false;
  let showSaveAnimation = false;
  let saveAnimationType: 'card' | 'export' | 'share' = 'card';
  let showCommunityPanel = false;
  let showShareModal = false;

  // Component references
  let realtimePreview: RealtimePreview;

  // Community features (Civitai-style)
  let cardStats = {
    likes: 247,
    downloads: 1834,
    views: 5621,
    comments: 23,
    bookmarks: 89
  };

  let isLiked = false;
  let isBookmarked = false;
  let isFollowing = false;

  // Card metadata
  let cardMetadata = {
    title: '아시아의 홈런왕 이승엽 - 영광의 순간',
    description: '삼성 라이온즈의 전설, 아시아 최고의 홈런왕 이승엽 선수의 가슴 뛰는 순간을 담은 특별한 카드입니다. 그의 방망이 끝에서 터져 나온 희망과 감동을 홀로그래픽으로 영원히 간직하세요.',
    tags: ['이승엽', '삼성라이온즈', '홈런왕', '아시아최고', '전설', '영광의순간'],
    creator: {
      name: '라이온즈_덕후',
      avatar: '🦁',
      followers: 1247,
      verified: true
    },
    createdAt: '2024-03-15',
    model: '영광의 순간 템플릿',
    rating: 4.8,
    difficulty: '야구 입문자'
  };

  // Canvas settings
  let canvasSettings = {
    width: 660,
    height: 921,
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
  };

  // Demo elements
  let demoElements = [
    {
      id: 'title',
      type: 'text',
      x: 50,
      y: 50,
      width: 560,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      data: {
        content: 'KBO 홀로그래픽 카드',
        fontSize: 36,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffffff',
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
        padding: 16,
        borderRadius: 12
      }
    },
    {
      id: 'player-name',
      type: 'text',
      x: 100,
      y: 200,
      width: 460,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: 3,
      data: {
        content: '이승엽',
        fontSize: 48,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffd700',
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 1,
        textShadow: '0 0 20px #ffd700, 2px 2px 4px rgba(0,0,0,0.8)',
        background: 'transparent',
        padding: 0,
        borderRadius: 0
      }
    }
  ];

  // Demo presets
  const demoPresets = {
    'kbo-legend': {
      name: 'KBO 레전드',
      description: '이승엽 선수 기념 카드'
    }
  };

  // Event handlers
  function toggleHolographic() {
    holographicEnabled = !holographicEnabled;
  }

  function changeQuality(quality: 'preview' | 'high' | 'ultra') {
    previewQuality = quality;
  }

  async function capturePreview() {
    if (!realtimePreview) return;
    
    try {
      showSaveAnimation = true;
      saveAnimationType = 'card';
      
      const dataUrl = await realtimePreview.capturePreview();
      
      // Simulate save process
      setTimeout(() => {
        console.log('Preview captured:', dataUrl);
        // In real app, this would save to gallery or cloud
      }, 1500);
      
    } catch (error) {
      console.error('Failed to capture preview:', error);
      showSaveAnimation = false;
    }
  }

  function openExportManager() {
    showExportManager = true;
  }

  function shareCard() {
    showSaveAnimation = true;
    saveAnimationType = 'share';
    
    // Simulate share process
    setTimeout(() => {
      if (navigator.share) {
        navigator.share({
          title: 'KBO 홀로그래픽 카드',
          text: '내가 만든 KBO 홀로그래픽 카드를 확인해보세요!',
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    }, 1500);
  }

  function handlePreviewHover(event: CustomEvent) {
    // Handle preview hover events for additional UI feedback
    const { hovering } = event.detail;
    console.log('Preview hover:', hovering);
  }

  function handlePerformanceMode(event: CustomEvent) {
    const { enabled } = event.detail;
    performanceMode = enabled;
    
    if (enabled) {
      previewQuality = 'preview';
    }
  }

  function handleExportComplete(event: CustomEvent) {
    const { formatName, filename, fileSize } = event.detail;
    console.log('Export completed:', { formatName, filename, fileSize });
    showExportManager = false;
  }

  function handleSaveAnimationComplete() {
    showSaveAnimation = false;
  }

  // Community interaction functions (Civitai-style)
  function toggleLike() {
    isLiked = !isLiked;
    cardStats.likes += isLiked ? 1 : -1;
  }

  function toggleBookmark() {
    isBookmarked = !isBookmarked;
    cardStats.bookmarks += isBookmarked ? 1 : -1;
  }

  function toggleFollow() {
    isFollowing = !isFollowing;
    cardMetadata.creator.followers += isFollowing ? 1 : -1;
  }

  function openShareModal() {
    showShareModal = true;
  }

  function downloadTemplate() {
    // Simulate template download
    cardStats.downloads += 1;
    showSaveAnimation = true;
    saveAnimationType = 'export';
    
    setTimeout(() => {
      console.log('Template downloaded');
    }, 1500);
  }

  function openCommunityPanel() {
    showCommunityPanel = true;
  }

  function addComment(comment: string) {
    // Simulate adding comment
    cardStats.comments += 1;
    console.log('Comment added:', comment);
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  }

  function shareToSocial(platform: string) {
    const shareData = {
      title: cardMetadata.title,
      text: cardMetadata.description,
      url: window.location.href
    };

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
        break;
      case 'discord':
        // Discord sharing would require Discord bot integration
        copyShareLink();
        break;
    }
  }

  onMount(() => {
    console.log('Real-time Preview Demo loaded');
    
    // Add keyboard shortcuts
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            capturePreview();
            break;
          case 'e':
            event.preventDefault();
            openExportManager();
            break;
          case 'h':
            event.preventDefault();
            toggleHolographic();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>KBO 영광의 순간 - 홀로그래픽 카드 팬클럽</title>
  <meta name="description" content="그날의 감동을 영원히 간직하세요. 야구팬들과 함께 만드는 추억의 홀로그래픽 카드, 박수와 응원댓글로 소통하는 팬클럽 광장" />
</svelte:head>

<div class="demo-page">
  <!-- Header -->
  <header class="demo-header">
    <div class="header-content">
      <h1>⚾ KBO 영광의 순간 - 홀로그래픽 카드</h1>
      <p>그날의 감동을 영원히, 팬들과 함께 만드는 야구 추억 보관함</p>
    </div>
    
    <div class="header-actions">
      <a href="/advanced-editor-demo" class="nav-link">🎨 고급 편집기</a>
      <a href="/kbo-demo" class="nav-link">⚾ KBO 데모</a>
      <a href="/" class="nav-link">🏠 홈</a>
    </div>
  </header>

  <!-- Demo Controls -->
  <div class="demo-controls">
    <div class="control-section">
      <h3>데모 프리셋</h3>
      <div class="preset-buttons">
        <button class="preset-btn active">
          <div class="preset-name">영광의 순간</div>
          <div class="preset-description">이승엽의 전설적인 홈런 순간</div>
        </button>
      </div>
    </div>

    <div class="control-section">
      <h3>미리보기 설정</h3>
      <div class="setting-controls">
        <label class="toggle-control">
          <input type="checkbox" bind:checked={holographicEnabled} on:change={toggleHolographic} />
          <span class="toggle-slider"></span>
          <span class="toggle-label">홀로그래픽 효과</span>
        </label>

        <div class="quality-control">
          <label for="quality-select">카드 품질:</label>
          <select id="quality-select" bind:value={previewQuality} on:change={() => changeQuality(previewQuality)}>
            <option value="preview">빠른 확인 (외야석)</option>
            <option value="high">선명한 화질 (내야석)</option>
            <option value="ultra">프리미엄 (VIP석)</option>
          </select>
        </div>

        {#if performanceMode}
          <div class="performance-warning">
            ⚡ 빠른 관람 모드 - 더 부드러운 카드 감상을 위해 화질을 조정했어요
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Preview Area -->
  <div class="preview-area">
    <div class="preview-container">
      <RealtimePreview
        bind:this={realtimePreview}
        elements={demoElements}
        {canvasSettings}
        {holographicEnabled}
        quality={previewQuality}
        on:previewHover={handlePreviewHover}
        on:performanceMode={handlePerformanceMode}
      />
      
      <div class="preview-overlay">
        <div class="preview-info">
          <span class="preview-title">{demoPresets['kbo-legend'].name}</span>
          <span class="preview-size">{canvasSettings.width} × {canvasSettings.height}</span>
          {#if performanceMode}
            <span class="performance-badge">⚡ 성능 모드</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Community Stats & Actions (Civitai-style) -->
    <div class="community-stats">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-icon">👁️</span>
          <span class="stat-value">{cardStats.views.toLocaleString()}</span>
          <span class="stat-label">관람객</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">👏</span>
          <span class="stat-value">{cardStats.likes.toLocaleString()}</span>
          <span class="stat-label">박수</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎁</span>
          <span class="stat-value">{cardStats.downloads.toLocaleString()}</span>
          <span class="stat-label">소장</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">💬</span>
          <span class="stat-value">{cardStats.comments}</span>
          <span class="stat-label">응원댓글</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button 
        class="action-btn like" 
        class:active={isLiked}
        on:click={toggleLike}
      >
        <span class="btn-icon">{isLiked ? '👏' : '🤍'}</span>
        박수 보내기
      </button>
      
      <button class="action-btn primary" on:click={downloadTemplate}>
        <span class="btn-icon">🎁</span>
        카드 소장하기
      </button>
      
      <button 
        class="action-btn bookmark" 
        class:active={isBookmarked}
        on:click={toggleBookmark}
      >
        <span class="btn-icon">{isBookmarked ? '⭐' : '☆'}</span>
        명예의 전당
      </button>
      
      <button class="action-btn secondary" on:click={openShareModal}>
        <span class="btn-icon">📢</span>
        응원단에 공유
      </button>
      
      <button class="action-btn tertiary" on:click={openCommunityPanel}>
        <span class="btn-icon">🏟️</span>
        팬클럽 광장
      </button>
    </div>
  </div>

  <!-- Card Information Panel (Civitai-style) -->
  <div class="card-info-panel">
    <div class="card-header">
      <div class="card-title-section">
        <h2>{cardMetadata.title}</h2>
        <div class="card-rating">
          <div class="stars">
            {#each Array(5) as _, i}
              <span class="star" class:filled={i < Math.floor(cardMetadata.rating)}>⭐</span>
            {/each}
          </div>
          <span class="rating-value">{cardMetadata.rating}</span>
        </div>
      </div>
      
      <div class="creator-info">
        <div class="creator-avatar">{cardMetadata.creator.avatar}</div>
        <div class="creator-details">
          <div class="creator-name">
            {cardMetadata.creator.name}
            {#if cardMetadata.creator.verified}
              <span class="verified-badge">✓</span>
            {/if}
          </div>
          <div class="creator-stats">
            응원단 {cardMetadata.creator.followers.toLocaleString()}명
          </div>
        </div>
        <button 
          class="follow-btn" 
          class:following={isFollowing}
          on:click={toggleFollow}
        >
          {isFollowing ? '응원 중' : '응원하기'}
        </button>
      </div>
    </div>

    <div class="card-description">
      <p>{cardMetadata.description}</p>
    </div>

    <div class="card-tags">
      {#each cardMetadata.tags as tag}
        <span class="tag">#{tag}</span>
      {/each}
    </div>

    <div class="card-metadata">
      <div class="metadata-item">
        <span class="metadata-label">템플릿:</span>
        <span class="metadata-value">{cardMetadata.model}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">제작 난이도:</span>
        <span class="metadata-value">{cardMetadata.difficulty}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">추억 날짜:</span>
        <span class="metadata-value">{cardMetadata.createdAt}</span>
      </div>
    </div>
  </div>

  <!-- Share Modal -->
  {#if showShareModal}
    <div class="modal-overlay" role="dialog" aria-modal="true" on:click={() => showShareModal = false} on:keydown={(e) => e.key === 'Escape' && (showShareModal = false)}>
      <div class="modal-content share-modal" role="document" on:click|stopPropagation>
        <div class="modal-header">
          <h2>응원단에 카드 공유하기</h2>
          <button class="close-btn" on:click={() => showShareModal = false}>×</button>
        </div>
        
        <div class="share-options">
          <button class="share-btn twitter" on:click={() => shareToSocial('twitter')}>
            <span class="share-icon">🐦</span>
            트위터 응원단
          </button>
          
          <button class="share-btn facebook" on:click={() => shareToSocial('facebook')}>
            <span class="share-icon">📘</span>
            페이스북 팬클럽
          </button>
          
          <button class="share-btn discord" on:click={() => shareToSocial('discord')}>
            <span class="share-icon">💬</span>
            디스코드 채팅방
          </button>
          
          <button class="share-btn copy" on:click={copyShareLink}>
            <span class="share-icon">🔗</span>
            카드 링크 복사
          </button>
        </div>
        
        <div class="share-link">
          <input type="text" value={window.location.href} readonly />
          <button on:click={copyShareLink}>복사</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Community Panel -->
  {#if showCommunityPanel}
    <div class="modal-overlay" role="dialog" aria-modal="true" on:click={() => showCommunityPanel = false} on:keydown={(e) => e.key === 'Escape' && (showCommunityPanel = false)}>
      <div class="modal-content community-modal" role="document" on:click|stopPropagation>
        <div class="modal-header">
          <h2>🏟️ 팬클럽 광장</h2>
          <button class="close-btn" on:click={() => showCommunityPanel = false}>×</button>
        </div>
        
        <div class="community-content">
          <div class="comment-section">
            <h3>응원 메시지 ({cardStats.comments})</h3>
            
            <div class="comment-input">
              <textarea placeholder="이 카드에 대한 응원 메시지를 남겨주세요..." rows="3"></textarea>
              <button class="comment-submit" on:click={() => addComment('새 댓글')}>
                응원 메시지 보내기
              </button>
            </div>
            
            <div class="comments-list">
              <div class="comment">
                <div class="comment-avatar">🦁</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">라이온즈_평생팬</span>
                    <span class="comment-time">2시간 전</span>
                  </div>
                  <p>이승엽 형님의 그 순간이 다시 살아나네요! 정말 가슴이 뛰는 카드입니다. 삼성 라이온즈 파이팅! 🦁⚾</p>
                  <div class="comment-actions">
                    <button class="comment-like">👏 12</button>
                    <button class="comment-reply">응원</button>
                  </div>
                </div>
              </div>
              
              <div class="comment">
                <div class="comment-avatar">⚾</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">야구_덕후</span>
                    <span class="comment-time">5시간 전</span>
                  </div>
                  <p>홀로그래픽 효과가 실제 카드 같아요! 이런 추억의 순간을 이렇게 멋지게 담을 수 있다니... 감동입니다 ㅠㅠ</p>
                  <div class="comment-actions">
                    <button class="comment-like">👏 8</button>
                    <button class="comment-reply">응원</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Feature Highlights -->
  <div class="feature-highlights">
    <div class="feature-card">
      <div class="feature-icon">🏟️</div>
      <h3>팬클럽 광장</h3>
      <p>박수, 응원댓글, 명예의 전당으로 소통하는 야구팬 커뮤니티</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">🎁</div>
      <h3>카드 소장 & 공유</h3>
      <p>다른 팬들의 명작 카드를 소장하고 나만의 추억 카드 공유</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">⭐</div>
      <h3>팬들의 평가</h3>
      <p>야구팬들의 진심 어린 평가로 선별되는 명작 카드들</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">📢</div>
      <h3>응원단 네트워크</h3>
      <p>SNS 응원단과 팬클럽에 감동의 순간을 쉽게 공유</p>
    </div>
  </div>

  <!-- Keyboard Shortcuts Help -->
  <div class="shortcuts-help">
    <h4>빠른 조작법</h4>
    <div class="shortcuts-list">
      <div class="shortcut-item">
        <kbd>⌘</kbd> + <kbd>S</kbd>
        <span>순간 포착</span>
      </div>
      <div class="shortcut-item">
        <kbd>⌘</kbd> + <kbd>E</kbd>
        <span>카드 소장</span>
      </div>
      <div class="shortcut-item">
        <kbd>⌘</kbd> + <kbd>H</kbd>
        <span>홀로그래픽 효과</span>
      </div>
    </div>
  </div>
</div>

<!-- Save Animation -->
<AppleSaveAnimation
  bind:isVisible={showSaveAnimation}
  saveType={saveAnimationType}
  fileName="kbo-holographic-card"
  fileSize="2.4 MB"
  on:animationComplete={handleSaveAnimationComplete}
/>

<style>
  .demo-page {
    min-height: 100vh;
    background: #0f0f23;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  }

  .demo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    background: rgba(28, 28, 30, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-content p {
    margin: 0;
    font-size: 16px;
    color: #86868b;
  }

  .header-actions {
    display: flex;
    gap: 16px;
  }

  .nav-link {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .demo-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .control-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .preset-btn {
    padding: 16px 20px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid #6366f1;
    border-radius: 12px;
    color: #ffffff;
    cursor: pointer;
    text-align: left;
  }

  .preset-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 14px;
    color: #86868b;
  }

  .setting-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .toggle-control {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .toggle-control input {
    display: none;
  }

  .toggle-slider {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;
  }

  .toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .toggle-control input:checked + .toggle-slider {
    background: #6366f1;
  }

  .toggle-control input:checked + .toggle-slider::after {
    transform: translateX(20px);
  }

  .quality-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .quality-control select {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
  }

  .performance-warning {
    padding: 12px 16px;
    background: rgba(255, 159, 10, 0.1);
    border: 1px solid rgba(255, 159, 10, 0.3);
    border-radius: 8px;
    color: #ff9f0a;
    font-size: 14px;
  }

  .preview-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 40px;
  }

  .preview-container {
    position: relative;
    transform: scale(0.6);
    transform-origin: center;
  }

  .preview-overlay {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(28, 28, 30, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 16px;
    display: flex;
    gap: 16px;
  }

  .preview-title {
    font-size: 14px;
    font-weight: 600;
  }

  .preview-size {
    font-size: 12px;
    color: #86868b;
    font-family: 'SF Mono', monospace;
  }

  .performance-badge {
    font-size: 11px;
    color: #ff9f0a;
    background: rgba(255, 159, 10, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(255, 159, 10, 0.3);
  }

  /* Community Stats */
  .community-stats {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-icon {
    font-size: 24px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }

  .stat-label {
    font-size: 12px;
    color: #86868b;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-width: 120px;
    justify-content: center;
  }

  .btn-icon {
    font-size: 16px;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff;
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .action-btn.tertiary {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .action-btn.like {
    background: rgba(255, 20, 147, 0.1);
    border: 1px solid rgba(255, 20, 147, 0.3);
    color: #ff1493;
  }

  .action-btn.like.active {
    background: linear-gradient(135deg, #ff1493, #ff69b4);
    color: #ffffff;
  }

  .action-btn.bookmark {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    color: #ffc107;
  }

  .action-btn.bookmark.active {
    background: linear-gradient(135deg, #ffc107, #ffeb3b);
    color: #000000;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .feature-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .feature-card h3 {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .feature-card p {
    margin: 0;
    font-size: 14px;
    color: #86868b;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: rgba(28, 28, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Shortcuts Help */
  .shortcuts-help {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    margin: 40px auto;
    max-width: 400px;
  }

  .shortcuts-help h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
  }

  .shortcut-item kbd {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    font-family: 'SF Mono', monospace;
    color: #ffffff;
  }

  .shortcut-item span {
    color: #86868b;
  }

  /* Card Information Panel */
  .card-info-panel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    margin: 40px auto;
    max-width: 800px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .card-title-section h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

  .card-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    font-size: 16px;
    opacity: 0.3;
  }

  .star.filled {
    opacity: 1;
  }

  .rating-value {
    font-size: 14px;
    font-weight: 600;
    color: #ffc107;
  }

  .creator-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .creator-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .creator-name {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .verified-badge {
    color: #1da1f2;
    font-size: 14px;
  }

  .creator-stats {
    font-size: 12px;
    color: #86868b;
  }

  .follow-btn {
    padding: 8px 16px;
    border: 1px solid #6366f1;
    border-radius: 6px;
    background: transparent;
    color: #6366f1;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .follow-btn.following {
    background: #6366f1;
    color: #ffffff;
  }

  .follow-btn:hover {
    background: #6366f1;
    color: #ffffff;
  }

  .card-description {
    margin: 16px 0;
    line-height: 1.6;
    color: #ebebf5;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
  }

  .tag {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #6366f1;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .card-metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .metadata-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .metadata-label {
    color: #86868b;
  }

  .metadata-value {
    color: #ffffff;
    font-weight: 500;
  }

  /* Share Modal */
  .share-modal {
    min-width: 400px;
  }

  .share-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .share-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }

  .share-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .share-btn.twitter:hover {
    border-color: #1da1f2;
    background: rgba(29, 161, 242, 0.1);
  }

  .share-btn.facebook:hover {
    border-color: #1877f2;
    background: rgba(24, 119, 242, 0.1);
  }

  .share-btn.discord:hover {
    border-color: #5865f2;
    background: rgba(88, 101, 242, 0.1);
  }

  .share-icon {
    font-size: 18px;
  }

  .share-link {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .share-link input {
    flex: 1;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
  }

  .share-link button {
    padding: 10px 16px;
    background: #6366f1;
    border: none;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  /* Community Modal */
  .community-modal {
    min-width: 600px;
    max-width: 800px;
  }

  .community-content {
    max-height: 60vh;
    overflow-y: auto;
  }

  .comment-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
  }

  .comment-input {
    margin-bottom: 24px;
  }

  .comment-input textarea {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    resize: vertical;
    margin-bottom: 8px;
  }

  .comment-submit {
    padding: 8px 16px;
    background: #6366f1;
    border: none;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comment {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .comment-content {
    flex: 1;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .comment-author {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .comment-time {
    font-size: 12px;
    color: #86868b;
  }

  .comment-content p {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.5;
    color: #ebebf5;
  }

  .comment-actions {
    display: flex;
    gap: 16px;
  }

  .comment-like,
  .comment-reply {
    background: none;
    border: none;
    color: #86868b;
    cursor: pointer;
    font-size: 12px;
    padding: 0;
    transition: color 0.2s ease;
  }

  .comment-like:hover,
  .comment-reply:hover {
    color: #ffffff;
  }

  @media (max-width: 768px) {
    .demo-header {
      flex-direction: column;
      gap: 16px;
      padding: 16px 20px;
    }

    .demo-controls {
      grid-template-columns: 1fr;
      padding: 20px;
    }

    .action-buttons {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }

    .stats-row {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .card-header {
      flex-direction: column;
      gap: 16px;
    }

    .creator-info {
      align-self: flex-start;
    }

    .share-options {
      grid-template-columns: 1fr;
    }

    .community-modal,
    .share-modal {
      min-width: auto;
      width: 90vw;
    }

    .feature-highlights {
      grid-template-columns: 1fr;
      padding: 20px;
    }
  }
</style>