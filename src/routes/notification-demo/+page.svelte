<script lang="ts">
  import { onMount } from 'svelte'
  import NotificationBell from '$lib/components/NotificationBell.svelte'
  import AppleNotificationCenter from '$lib/components/AppleNotificationCenter.svelte'
  import NotificationSettings from '$lib/components/NotificationSettings.svelte'
  import { notificationService } from '$lib/services/notificationService'

  // 데모용 사용자 ID
  const demoUserId = 'demo-user-123'
  
  let activeTab = 'bell'
  let isNotificationCenterOpen = false
  let testResults: string[] = []

  onMount(() => {
    console.log('🔔 알림 시스템 데모 페이지 로드됨')
  })

  // 테스트 알림 생성 함수들
  async function createLikeNotification() {
    try {
      await notificationService.createLikeNotification(
        demoUserId,
        'test-liker-123',
        'test-card-456',
        '멋진 홈런 카드'
      )
      addTestResult('✅ 좋아요 알림 생성 성공')
    } catch (error) {
      addTestResult('❌ 좋아요 알림 생성 실패: ' + error)
    }
  }

  async function createCommentNotification() {
    try {
      await notificationService.createCommentNotification(
        demoUserId,
        'test-commenter-123',
        'test-card-456',
        '멋진 홈런 카드',
        '정말 멋진 순간이네요! 어느 경기였나요?'
      )
      addTestResult('✅ 댓글 알림 생성 성공')
    } catch (error) {
      addTestResult('❌ 댓글 알림 생성 실패: ' + error)
    }
  }

  async function createFollowNotification() {
    try {
      await notificationService.createFollowNotification(
        demoUserId,
        'test-follower-123'
      )
      addTestResult('✅ 팔로우 알림 생성 성공')
    } catch (error) {
      addTestResult('❌ 팔로우 알림 생성 실패: ' + error)
    }
  }

  async function createSystemNotification() {
    try {
      await notificationService.createNotification(
        demoUserId,
        'system',
        '시스템 업데이트',
        '홀로그래픽 카드 커뮤니티에 새로운 기능이 추가되었습니다! 이제 더욱 생생한 홀로그래픽 효과를 경험하실 수 있습니다.',
        {
          actionUrl: '/updates',
          metadata: { version: '2.1.0' }
        }
      )
      addTestResult('✅ 시스템 알림 생성 성공')
    } catch (error) {
      addTestResult('❌ 시스템 알림 생성 실패: ' + error)
    }
  }

  async function createFeaturedNotification() {
    try {
      await notificationService.createNotification(
        demoUserId,
        'card_featured',
        '카드 추천 선정',
        '축하합니다! 회원님의 "2023 한국시리즈 우승 순간" 카드가 이번 주 추천 카드로 선정되었습니다.',
        {
          cardId: 'featured-card-789',
          actionUrl: '/featured/featured-card-789',
          imageUrl: '/images/featured-badge.png'
        }
      )
      addTestResult('✅ 카드 추천 알림 생성 성공')
    } catch (error) {
      addTestResult('❌ 카드 추천 알림 생성 실패: ' + error)
    }
  }

  async function testRealtimeConnection() {
    try {
      await notificationService.subscribeToNotifications(demoUserId, (event) => {
        addTestResult(`🔄 실시간 이벤트 수신: ${event.type} - ${event.notification.title}`)
      })
      addTestResult('✅ 실시간 연결 테스트 성공')
    } catch (error) {
      addTestResult('❌ 실시간 연결 테스트 실패: ' + error)
    }
  }

  async function clearAllNotifications() {
    try {
      await notificationService.markAllAsRead(demoUserId)
      addTestResult('✅ 모든 알림 읽음 처리 완료')
    } catch (error) {
      addTestResult('❌ 알림 읽음 처리 실패: ' + error)
    }
  }

  function addTestResult(message: string) {
    testResults = [message, ...testResults.slice(0, 9)] // 최근 10개만 유지
  }

  function clearTestResults() {
    testResults = []
  }
</script>

<svelte:head>
  <title>알림 시스템 데모 - 홀로그래픽 카드 커뮤니티</title>
</svelte:head>

<div class="demo-container">
  <div class="demo-header">
    <h1>🔔 실시간 알림 시스템 데모</h1>
    <p>PocketBase 기반 실시간 알림 시스템을 테스트해보세요</p>
    
    <!-- 알림 벨 데모 -->
    <div class="notification-bell-demo">
      <NotificationBell userId={demoUserId} />
      <span class="demo-label">← 알림 벨 클릭해보세요</span>
    </div>
  </div>

  <!-- 탭 네비게이션 -->
  <div class="tab-navigation">
    <button 
      class="tab-button"
      class:active={activeTab === 'bell'}
      on:click={() => activeTab = 'bell'}
    >
      🔔 알림 벨 테스트
    </button>
    
    <button 
      class="tab-button"
      class:active={activeTab === 'center'}
      on:click={() => activeTab = 'center'}
    >
      📱 알림 센터
    </button>
    
    <button 
      class="tab-button"
      class:active={activeTab === 'settings'}
      on:click={() => activeTab = 'settings'}
    >
      ⚙️ 알림 설정
    </button>
  </div>

  <!-- 탭 콘텐츠 -->
  <div class="tab-content">
    {#if activeTab === 'bell'}
      <div class="test-section">
        <h2>알림 생성 테스트</h2>
        <p>다양한 종류의 알림을 생성하여 실시간 동작을 확인해보세요.</p>
        
        <div class="test-buttons">
          <button class="test-btn like-btn" on:click={createLikeNotification}>
            ❤️ 좋아요 알림 생성
          </button>
          
          <button class="test-btn comment-btn" on:click={createCommentNotification}>
            💬 댓글 알림 생성
          </button>
          
          <button class="test-btn follow-btn" on:click={createFollowNotification}>
            👥 팔로우 알림 생성
          </button>
          
          <button class="test-btn system-btn" on:click={createSystemNotification}>
            🔔 시스템 알림 생성
          </button>
          
          <button class="test-btn featured-btn" on:click={createFeaturedNotification}>
            ⭐ 카드 추천 알림 생성
          </button>
        </div>

        <div class="utility-buttons">
          <button class="utility-btn" on:click={testRealtimeConnection}>
            🔄 실시간 연결 테스트
          </button>
          
          <button class="utility-btn danger" on:click={clearAllNotifications}>
            🗑️ 모든 알림 읽음 처리
          </button>
        </div>

        <!-- 테스트 결과 -->
        {#if testResults.length > 0}
          <div class="test-results">
            <div class="results-header">
              <h3>테스트 결과</h3>
              <button class="clear-btn" on:click={clearTestResults}>지우기</button>
            </div>
            
            <div class="results-list">
              {#each testResults as result}
                <div class="result-item">{result}</div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'center'}
      <div class="notification-center-section">
        <h2>알림 센터 미리보기</h2>
        <p>Apple 스타일의 알림 센터를 직접 확인해보세요.</p>
        
        <div class="center-demo">
          <button 
            class="open-center-btn"
            on:click={() => isNotificationCenterOpen = true}
          >
            📱 알림 센터 열기
          </button>
          
          <AppleNotificationCenter 
            bind:isOpen={isNotificationCenterOpen}
            userId={demoUserId}
          />
        </div>

        <div class="feature-list">
          <h3>주요 기능</h3>
          <ul>
            <li>✅ 실시간 알림 수신</li>
            <li>✅ Apple 스타일 UI/UX</li>
            <li>✅ 읽음/읽지 않음 상태 관리</li>
            <li>✅ 알림 타입별 아이콘</li>
            <li>✅ 시간 표시 (방금 전, N분 전 등)</li>
            <li>✅ 클릭 시 해당 페이지로 이동</li>
            <li>✅ 키보드 접근성 지원</li>
            <li>✅ 다크 모드 지원</li>
          </ul>
        </div>
      </div>

    {:else if activeTab === 'settings'}
      <div class="settings-section">
        <h2>알림 설정</h2>
        <p>사용자 맞춤 알림 설정을 관리할 수 있습니다.</p>
        
        <NotificationSettings userId={demoUserId} />
      </div>
    {/if}
  </div>

  <!-- 기술 정보 -->
  <div class="tech-info">
    <h3>🛠️ 기술 스택</h3>
    <div class="tech-grid">
      <div class="tech-item">
        <strong>PocketBase</strong>
        <span>실시간 WebSocket 구독</span>
      </div>
      
      <div class="tech-item">
        <strong>Svelte</strong>
        <span>반응형 UI 컴포넌트</span>
      </div>
      
      <div class="tech-item">
        <strong>Resend</strong>
        <span>이메일 알림 발송</span>
      </div>
      
      <div class="tech-item">
        <strong>Apple Design</strong>
        <span>네이티브 앱 수준 UX</span>
      </div>
    </div>
  </div>
</div>

<style>
  .demo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
  }

  .demo-header h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 12px;
  }

  .demo-header p {
    font-size: 18px;
    opacity: 0.9;
    margin: 0 0 24px;
  }

  .notification-bell-demo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }

  .demo-label {
    font-size: 14px;
    opacity: 0.8;
  }

  .tab-navigation {
    display: flex;
    gap: 4px;
    margin-bottom: 32px;
    background: #f8f9fa;
    padding: 4px;
    border-radius: 12px;
  }

  .tab-button {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #8e8e93;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-button.active {
    background: white;
    color: #1d1d1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tab-button:hover:not(.active) {
    color: #1d1d1f;
    background: rgba(255, 255, 255, 0.5);
  }

  .tab-content {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
  }

  .test-section h2,
  .notification-center-section h2,
  .settings-section h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 8px;
  }

  .test-section p,
  .notification-center-section p,
  .settings-section p {
    color: #8e8e93;
    margin: 0 0 24px;
  }

  .test-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .test-btn {
    padding: 16px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: white;
  }

  .like-btn { background: #ff3b30; }
  .comment-btn { background: #007aff; }
  .follow-btn { background: #34c759; }
  .system-btn { background: #ff9500; }
  .featured-btn { background: #af52de; }

  .test-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .utility-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .utility-btn {
    padding: 10px 16px;
    border: 2px solid #007aff;
    background: none;
    color: #007aff;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .utility-btn:hover {
    background: #007aff;
    color: white;
  }

  .utility-btn.danger {
    border-color: #ff3b30;
    color: #ff3b30;
  }

  .utility-btn.danger:hover {
    background: #ff3b30;
    color: white;
  }

  .test-results {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    margin-top: 24px;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .results-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
  }

  .clear-btn {
    background: none;
    border: none;
    color: #8e8e93;
    font-size: 14px;
    cursor: pointer;
  }

  .clear-btn:hover {
    color: #1d1d1f;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .result-item {
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .center-demo {
    text-align: center;
    margin: 32px 0;
  }

  .open-center-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .open-center-btn:hover {
    background: #0056d3;
    transform: translateY(-2px);
  }

  .feature-list {
    margin-top: 32px;
  }

  .feature-list h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 16px;
  }

  .feature-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 8px;
  }

  .feature-list li {
    padding: 8px 0;
    color: #1d1d1f;
    font-size: 14px;
  }

  .tech-info {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .tech-info h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 20px;
    text-align: center;
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .tech-item {
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tech-item strong {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .tech-item span {
    font-size: 14px;
    color: #8e8e93;
  }

  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .demo-container {
      background: #000;
      color: #f2f2f7;
    }

    .tab-navigation {
      background: #1c1c1e;
    }

    .tab-button {
      color: #8e8e93;
    }

    .tab-button.active {
      background: #2c2c2e;
      color: #f2f2f7;
    }

    .tab-content,
    .tech-info {
      background: #1c1c1e;
    }

    .test-section h2,
    .notification-center-section h2,
    .settings-section h2,
    .results-header h3,
    .feature-list h3,
    .tech-info h3 {
      color: #f2f2f7;
    }

    .feature-list li {
      color: #f2f2f7;
    }

    .test-results {
      background: #2c2c2e;
    }

    .result-item {
      background: #1c1c1e;
      color: #f2f2f7;
    }

    .tech-item {
      background: #2c2c2e;
    }

    .tech-item strong {
      color: #f2f2f7;
    }
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .demo-container {
      padding: 16px;
    }

    .demo-header {
      padding: 24px 16px;
    }

    .demo-header h1 {
      font-size: 24px;
    }

    .tab-content,
    .tech-info {
      padding: 20px;
    }

    .test-buttons {
      grid-template-columns: 1fr;
    }

    .utility-buttons {
      flex-direction: column;
    }

    .tech-grid {
      grid-template-columns: 1fr;
    }
  }
</style>