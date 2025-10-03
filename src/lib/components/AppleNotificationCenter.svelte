<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { notificationService } from '$lib/services/notificationService'
  import type { Notification, RealtimeNotificationEvent } from '$lib/types/notifications'

  export let isOpen = false
  export let userId: string

  let notifications: Notification[] = []
  let unreadCount = 0
  let loading = true
  let error: string | null = null

  // 실시간 구독 해제 함수
  let unsubscribe: (() => void) | null = null

  onMount(async () => {
    await loadNotifications()
    await subscribeToRealtime()
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  async function loadNotifications() {
    try {
      loading = true
      error = null
      
      const [notificationList, count] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadCount(userId)
      ])
      
      notifications = notificationList
      unreadCount = count
    } catch (err) {
      error = '알림을 불러오는데 실패했습니다'
      console.error('❌ 알림 로드 실패:', err)
    } finally {
      loading = false
    }
  }

  async function subscribeToRealtime() {
    try {
      await notificationService.subscribeToNotifications(userId, handleRealtimeEvent)
      
      unsubscribe = () => {
        notificationService.unsubscribeFromNotifications(userId)
      }
    } catch (err) {
      console.error('❌ 실시간 구독 실패:', err)
    }
  }

  function handleRealtimeEvent(event: RealtimeNotificationEvent) {
    switch (event.type) {
      case 'notification_created':
        notifications = [event.notification, ...notifications]
        unreadCount += 1
        
        // 새 알림 사운드 재생 (선택사항)
        playNotificationSound()
        break
        
      case 'notification_read':
        notifications = notifications.map(n => 
          n.id === event.notification.id ? { ...n, read: true } : n
        )
        if (!event.notification.read) {
          unreadCount = Math.max(0, unreadCount - 1)
        }
        break
        
      case 'notification_deleted':
        notifications = notifications.filter(n => n.id !== event.notification.id)
        if (!event.notification.read) {
          unreadCount = Math.max(0, unreadCount - 1)
        }
        break
    }
  }

  async function markAsRead(notification: Notification) {
    if (notification.read) return

    try {
      await notificationService.markAsRead(notification.id)
      
      // UI 즉시 업데이트
      notifications = notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
      unreadCount = Math.max(0, unreadCount - 1)
    } catch (err) {
      console.error('❌ 알림 읽음 처리 실패:', err)
    }
  }

  async function markAllAsRead() {
    try {
      await notificationService.markAllAsRead(userId)
      
      // UI 즉시 업데이트
      notifications = notifications.map(n => ({ ...n, read: true }))
      unreadCount = 0
    } catch (err) {
      console.error('❌ 모든 알림 읽음 처리 실패:', err)
    }
  }

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification)
    
    if (notification.data?.actionUrl) {
      window.location.href = notification.data.actionUrl
    }
  }

  function playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // 사운드 재생 실패는 무시 (사용자 상호작용 필요)
      })
    } catch (err) {
      // 사운드 파일이 없어도 무시
    }
  }

  function getNotificationIcon(type: string): string {
    switch (type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'follow': return '👥'
      case 'card_featured': return '⭐'
      case 'system': return '🔔'
      case 'achievement': return '🏆'
      case 'community_event': return '🎉'
      default: return '📢'
    }
  }

  function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
    
    return date.toLocaleDateString('ko-KR')
  }

  // 키보드 단축키
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- 알림 센터 오버레이 -->
{#if isOpen}
  <div 
    class="notification-overlay"
    transition:fade={{ duration: 200 }}
    on:click={() => isOpen = false}
    on:keydown={(e) => e.key === 'Enter' && (isOpen = false)}
    role="button"
    tabindex="0"
  >
    <!-- 알림 센터 패널 -->
    <div 
      class="notification-center"
      transition:fly={{ y: -20, duration: 300, easing: quintOut }}
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-label="알림 센터"
    >
      <!-- 헤더 -->
      <div class="notification-header">
        <div class="header-left">
          <h2>알림</h2>
          {#if unreadCount > 0}
            <span class="unread-badge">{unreadCount}</span>
          {/if}
        </div>
        
        <div class="header-actions">
          {#if unreadCount > 0}
            <button 
              class="mark-all-read-btn"
              on:click={markAllAsRead}
            >
              모두 읽음
            </button>
          {/if}
          
          <button 
            class="close-btn"
            on:click={() => isOpen = false}
            aria-label="알림 센터 닫기"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 알림 목록 -->
      <div class="notification-list">
        {#if loading}
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>알림을 불러오는 중...</p>
          </div>
        {:else if error}
          <div class="error-state">
            <p>❌ {error}</p>
            <button on:click={loadNotifications}>다시 시도</button>
          </div>
        {:else if notifications.length === 0}
          <div class="empty-state">
            <div class="empty-icon">🔔</div>
            <h3>새로운 알림이 없습니다</h3>
            <p>카드에 좋아요나 댓글이 달리면 여기에 표시됩니다.</p>
          </div>
        {:else}
          {#each notifications as notification (notification.id)}
            <div 
              class="notification-item"
              class:unread={!notification.read}
              class:high-priority={notification.priority === 'high' || notification.priority === 'urgent'}
              on:click={() => handleNotificationClick(notification)}
              on:keydown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
              role="button"
              tabindex="0"
              transition:fly={{ x: -20, duration: 200 }}
            >
              <div class="notification-icon">
                {#if notification.data?.imageUrl}
                  <img src={notification.data.imageUrl} alt="" />
                {:else}
                  <span class="icon-emoji">{getNotificationIcon(notification.type)}</span>
                {/if}
              </div>
              
              <div class="notification-content">
                <div class="notification-title">{notification.title}</div>
                <div class="notification-message">{notification.message}</div>
                <div class="notification-time">{formatTimeAgo(notification.createdAt)}</div>
              </div>
              
              {#if !notification.read}
                <div class="unread-indicator"></div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>

      <!-- 푸터 -->
      <div class="notification-footer">
        <a href="/settings/notifications" class="settings-link">
          알림 설정
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  .notification-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 60px;
  }

  .notification-center {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    width: 100%;
    max-width: 400px;
    max-height: 80vh;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .notification-header {
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-left h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .unread-badge {
    background: #ff3b30;
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mark-all-read-btn {
    background: none;
    border: none;
    color: #007aff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .mark-all-read-btn:hover {
    background: rgba(0, 122, 255, 0.1);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: #8e8e93;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .notification-list {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #8e8e93;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e5ea;
    border-top: 2px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
  }

  .notification-item:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .notification-item.unread {
    background: rgba(0, 122, 255, 0.02);
  }

  .notification-item.high-priority {
    border-left: 3px solid #ff3b30;
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f2f2f7;
    flex-shrink: 0;
  }

  .notification-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-emoji {
    font-size: 20px;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 2px;
  }

  .notification-message {
    font-size: 14px;
    color: #8e8e93;
    line-height: 1.4;
    margin-bottom: 4px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .notification-time {
    font-size: 12px;
    color: #c7c7cc;
  }

  .unread-indicator {
    width: 8px;
    height: 8px;
    background: #007aff;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 6px;
  }

  .notification-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.8);
    text-align: center;
  }

  .settings-link {
    color: #007aff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }

  .settings-link:hover {
    text-decoration: underline;
  }

  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .notification-center {
      background: rgba(28, 28, 30, 0.95);
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .notification-header,
    .notification-footer {
      background: rgba(28, 28, 30, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .header-left h2 {
      color: #f2f2f7;
    }

    .close-btn {
      color: #8e8e93;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .notification-item {
      border-color: rgba(255, 255, 255, 0.05);
    }

    .notification-item:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .notification-item.unread {
      background: rgba(0, 122, 255, 0.1);
    }

    .notification-title {
      color: #f2f2f7;
    }

    .notification-message {
      color: #8e8e93;
    }

    .notification-time {
      color: #636366;
    }

    .notification-icon {
      background: #2c2c2e;
    }

    .empty-state h3 {
      color: #f2f2f7;
    }
  }

  /* 모바일 최적화 */
  @media (max-width: 480px) {
    .notification-overlay {
      padding: 0;
      align-items: stretch;
    }

    .notification-center {
      max-width: none;
      max-height: none;
      height: 100vh;
      border-radius: 0;
    }

    .notification-header {
      padding: 16px;
    }

    .notification-item {
      padding: 12px 16px;
    }
  }
</style>