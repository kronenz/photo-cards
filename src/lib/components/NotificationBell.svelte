<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { notificationService } from '$lib/services/notificationService'
  import AppleNotificationCenter from './AppleNotificationCenter.svelte'
  import type { RealtimeNotificationEvent } from '$lib/types/notifications'

  export let userId: string

  let unreadCount = 0
  let isNotificationCenterOpen = false
  let bellElement: HTMLButtonElement
  let isAnimating = false

  // 실시간 구독 해제 함수
  let unsubscribe: (() => void) | null = null

  onMount(async () => {
    await loadUnreadCount()
    await subscribeToRealtime()
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  async function loadUnreadCount() {
    try {
      unreadCount = await notificationService.getUnreadCount(userId)
    } catch (error) {
      console.error('❌ 읽지 않은 알림 개수 로드 실패:', error)
    }
  }

  async function subscribeToRealtime() {
    try {
      await notificationService.subscribeToNotifications(userId, handleRealtimeEvent)
      
      unsubscribe = () => {
        notificationService.unsubscribeFromNotifications(userId)
      }
    } catch (error) {
      console.error('❌ 실시간 구독 실패:', error)
    }
  }

  function handleRealtimeEvent(event: RealtimeNotificationEvent) {
    switch (event.type) {
      case 'notification_created':
        unreadCount += 1
        animateBell()
        break
        
      case 'notification_read':
        if (!event.notification.read) {
          unreadCount = Math.max(0, unreadCount - 1)
        }
        break
        
      case 'notification_deleted':
        if (!event.notification.read) {
          unreadCount = Math.max(0, unreadCount - 1)
        }
        break
    }
  }

  function animateBell() {
    if (isAnimating) return
    
    isAnimating = true
    bellElement?.classList.add('shake')
    
    setTimeout(() => {
      bellElement?.classList.remove('shake')
      isAnimating = false
    }, 600)
  }

  function toggleNotificationCenter() {
    isNotificationCenterOpen = !isNotificationCenterOpen
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleNotificationCenter()
    }
  }

  // 외부 클릭 시 알림 센터 닫기
  function handleOutsideClick(event: MouseEvent) {
    if (isNotificationCenterOpen && !bellElement?.contains(event.target as Node)) {
      isNotificationCenterOpen = false
    }
  }
</script>

<svelte:window on:click={handleOutsideClick} />

<div class="notification-bell-container">
  <button
    bind:this={bellElement}
    class="notification-bell"
    class:has-notifications={unreadCount > 0}
    on:click={toggleNotificationCenter}
    on:keydown={handleKeydown}
    aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개의 읽지 않은 알림)` : ''}`}
    title={`알림 ${unreadCount > 0 ? `(${unreadCount}개)` : ''}`}
  >
    <!-- 벨 아이콘 -->
    <svg 
      class="bell-icon" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>

    <!-- 읽지 않은 알림 배지 -->
    {#if unreadCount > 0}
      <span class="notification-badge">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    {/if}

    <!-- 활성 상태 표시 -->
    {#if isNotificationCenterOpen}
      <div class="active-indicator"></div>
    {/if}
  </button>

  <!-- 알림 센터 -->
  <AppleNotificationCenter 
    bind:isOpen={isNotificationCenterOpen}
    {userId}
  />
</div>

<style>
  .notification-bell-container {
    position: relative;
    display: inline-block;
  }

  .notification-bell {
    position: relative;
    background: none;
    border: none;
    padding: 8px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8e8e93;
    outline: none;
  }

  .notification-bell:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1d1d1f;
    transform: translateY(-1px);
  }

  .notification-bell:focus {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }

  .notification-bell.has-notifications {
    color: #007aff;
  }

  .notification-bell.has-notifications:hover {
    color: #0056d3;
    background: rgba(0, 122, 255, 0.1);
  }

  .bell-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
  }

  .notification-bell:hover .bell-icon {
    transform: scale(1.1);
  }

  .notification-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ff3b30;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 10px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    animation: badge-appear 0.3s ease-out;
  }

  .active-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: #007aff;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  /* 벨 흔들림 애니메이션 */
  .notification-bell.shake {
    animation: bell-shake 0.6s ease-in-out;
  }

  @keyframes bell-shake {
    0%, 100% { transform: rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
    20%, 40%, 60%, 80% { transform: rotate(10deg); }
  }

  @keyframes badge-appear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translateX(-50%) scale(1.2);
    }
  }

  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .notification-bell {
      color: #8e8e93;
    }

    .notification-bell:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f2f2f7;
    }

    .notification-bell:focus {
      background: rgba(0, 122, 255, 0.2);
      color: #64d2ff;
    }

    .notification-bell.has-notifications {
      color: #64d2ff;
    }

    .notification-bell.has-notifications:hover {
      color: #32d2ff;
      background: rgba(0, 122, 255, 0.2);
    }

    .active-indicator {
      background: #64d2ff;
    }
  }

  /* 접근성 개선 */
  @media (prefers-reduced-motion: reduce) {
    .notification-bell,
    .bell-icon,
    .notification-badge,
    .active-indicator {
      animation: none;
      transition: none;
    }

    .notification-bell.shake {
      animation: none;
    }

    .notification-bell:hover {
      transform: none;
    }
  }

  /* 모바일 최적화 */
  @media (max-width: 480px) {
    .notification-bell {
      padding: 12px;
      border-radius: 16px;
    }

    .bell-icon {
      width: 22px;
      height: 22px;
    }

    .notification-badge {
      top: 4px;
      right: 4px;
      font-size: 11px;
      min-width: 18px;
      height: 18px;
      padding: 2px 6px;
    }
  }

  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    .notification-bell {
      border: 1px solid currentColor;
    }

    .notification-bell:focus {
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.5);
    }

    .notification-badge {
      border: 2px solid white;
    }
  }
</style>