<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { currentUser } from '$lib/stores/unified';

  // Props
  export let isOpen = false;

  // Mock notifications (TODO: Replace with real PocketBase subscription)
  let notifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'card_like',
      actorName: 'user123',
      message: 'user123님이 회원님의 카드를 좋아합니다',
      cardTitle: 'LG 트윈스 홀로그래픽 카드',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: 'notif-2',
      type: 'card_comment',
      actorName: 'kbofan',
      message: 'kbofan님이 댓글을 남겼습니다: "정말 멋진 카드네요!"',
      cardTitle: 'KBO 야구 추억 카드',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: 'notif-3',
      type: 'new_follower',
      actorName: 'twins_fan',
      message: 'twins_fan님이 팔로우하기 시작했습니다',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  ];

  interface Notification {
    id: string;
    type: 'card_like' | 'card_comment' | 'new_follower' | 'level_up';
    actorName: string;
    message: string;
    cardTitle?: string;
    read: boolean;
    createdAt: Date;
  }

  $: unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(notificationId: string) {
    notifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    // TODO: Update PocketBase
  }

  function markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    // TODO: Update PocketBase
  }

  function getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'card_like':
        return '❤️';
      case 'card_comment':
        return '💬';
      case 'new_follower':
        return '👤';
      case 'level_up':
        return '⭐';
      default:
        return '🔔';
    }
  }

  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return date.toLocaleDateString('ko-KR');
  }

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id);
    // TODO: Navigate to related content (card, profile, etc.)
  }

  function close() {
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  onMount(() => {
    // TODO: Subscribe to PocketBase notifications
    // pb.collection('notifications').subscribe('*', (e) => {
    //   if (e.action === 'create') {
    //     notifications = [e.record, ...notifications];
    //   }
    // });
  });

  onDestroy(() => {
    // TODO: Unsubscribe from PocketBase
    // pb.collection('notifications').unsubscribe();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="notification-backdrop" on:click={close}>
    <div
      class="notification-panel"
      on:click|stopPropagation
      data-testid="notification-panel"
      role="dialog"
      aria-label="알림"
    >
      <!-- Header -->
      <div class="panel-header">
        <h2>알림</h2>
        {#if unreadCount > 0}
          <button class="mark-all-read-btn" on:click={markAllAsRead}>
            모두 읽음
          </button>
        {/if}
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        {#if notifications.length === 0}
          <div class="empty-state">
            <p>알림이 없습니다</p>
          </div>
        {:else}
          {#each notifications as notification (notification.id)}
            <button
              class="notification-item"
              class:unread={!notification.read}
              data-testid="notification-{notification.type}-{notification.id}"
              on:click={() => handleNotificationClick(notification)}
            >
              <div class="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div class="notification-content">
                <p class="notification-message">
                  {notification.message}
                </p>
                {#if notification.cardTitle}
                  <p class="notification-card-title">
                    {notification.cardTitle}
                  </p>
                {/if}
                <p class="notification-time">
                  {getTimeAgo(notification.createdAt)}
                </p>
              </div>

              {#if !notification.read}
                <div class="unread-badge"></div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .notification-backdrop {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 999;
  }

  .notification-panel {
    position: fixed;
    top: 4rem;
    right: 1rem;
    width: 400px;
    max-height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .mark-all-read-btn {
    background: none;
    border: none;
    color: var(--team-primary-color, #667eea);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
  }

  .mark-all-read-btn:hover {
    text-decoration: underline;
  }

  .notifications-list {
    overflow-y: auto;
    flex: 1;
  }

  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #6b7280;
  }

  .notification-item {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: none;
    border-bottom: 1px solid #f3f4f6;
    background: white;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }

  .notification-item:hover {
    background: #f9fafb;
  }

  .notification-item.unread {
    background: rgba(102, 126, 234, 0.05);
  }

  .notification-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-message {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #111827;
    line-height: 1.4;
  }

  .notification-card-title {
    margin: 0 0 0.25rem 0;
    font-size: 0.75rem;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notification-time {
    margin: 0;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .unread-badge {
    width: 8px;
    height: 8px;
    background: var(--team-primary-color, #667eea);
    border-radius: 50%;
    flex-shrink: 0;
    align-self: center;
  }

  @media (max-width: 640px) {
    .notification-panel {
      right: 0;
      left: 0;
      width: 100%;
      max-height: 80vh;
      border-radius: 12px 12px 0 0;
      top: auto;
      bottom: 0;
    }
  }
</style>
