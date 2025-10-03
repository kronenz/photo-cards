<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ChatMessage, MessageType } from '$lib/types/messaging';

  export let message: ChatMessage;
  export let isOwn: boolean = false;
  export let showAvatar: boolean = true;

  const dispatch = createEventDispatcher();

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  }

  function getMessageTypeIcon(type: MessageType): string {
    switch (type) {
      case 'cheer': return '🎺';
      case 'card_share': return '🃏';
      case 'sticker': return '😊';
      case 'system': return 'ℹ️';
      case 'game_update': return '⚾';
      default: return '';
    }
  }

  function getCheerIntensityColor(intensity?: number): string {
    if (!intensity) return 'var(--text-primary)';
    
    const colors = [
      '#94a3b8', // 1 - 약한 응원
      '#64748b', // 2
      '#f59e0b', // 3 - 보통 응원
      '#f97316', // 4
      '#dc2626'  // 5 - 강한 응원
    ];
    
    return colors[Math.min(intensity - 1, 4)] || colors[2];
  }

  function handleReaction(emoji: string) {
    dispatch('addReaction', { messageId: message.id, emoji });
  }

  function handleReply() {
    dispatch('reply', { messageId: message.id });
  }

  function getStarString(intensity: number): string {
    return '⭐'.repeat(intensity);
  }
</script>

<div class="message-bubble" class:own={isOwn} class:system={message.type === 'system'}>
  {#if message.type === 'system'}
    <!-- System Message -->
    <div class="system-message">
      <span class="system-icon">{getMessageTypeIcon(message.type)}</span>
      <span class="system-text">{message.content}</span>
      <span class="system-time">{formatTime(message.createdAt)}</span>
    </div>
  {:else}
    <!-- Regular Message -->
    <div class="message-container">
      <!-- Avatar (for other users) -->
      {#if showAvatar && !isOwn}
        <div class="message-avatar">
          {#if message.senderAvatar}
            <img src={message.senderAvatar} alt={message.senderName} />
          {:else}
            <div class="default-avatar">
              {message.senderName.charAt(0).toUpperCase()}
            </div>
          {/if}
        </div>
      {/if}

      <div class="message-content" class:own-content={isOwn}>
        <!-- Sender Info (for other users) -->
        {#if !isOwn}
          <div class="sender-info">
            <span class="sender-name">{message.senderName}</span>
            <span class="sender-grade">{message.senderGrade}</span>
          </div>
        {/if}

        <!-- Reply Context -->
        {#if message.replyTo}
          <div class="reply-context">
            <div class="reply-line"></div>
            <div class="reply-content">
              <span class="reply-to">답장</span>
              <!-- This would show the original message content -->
            </div>
          </div>
        {/if}

        <!-- Message Bubble -->
        <div 
          class="bubble" 
          class:own-bubble={isOwn}
          class:cheer-bubble={message.type === 'cheer'}
        >
          <!-- Message Type Icon -->
          {#if message.type !== 'text'}
            <div class="message-type">
              <span class="type-icon">{getMessageTypeIcon(message.type)}</span>
              {#if message.type === 'cheer'}
                <span class="cheer-intensity">
                  {getStarString(message.intensity || 1)}
                </span>
              {/if}
            </div>
          {/if}

          <!-- Attachments -->
          {#if message.attachments && message.attachments.length > 0}
            <div class="attachments">
              {#each message.attachments as attachment}
                {#if attachment.type === 'image'}
                  <div class="image-attachment">
                    <img src={attachment.url} alt="첨부 이미지" />
                  </div>
                {:else if attachment.type === 'card'}
                  <div class="card-attachment">
                    <div class="card-preview">
                      <span class="card-icon">🃏</span>
                      <span>홀로그래픽 카드</span>
                    </div>
                    <button class="view-card-btn">카드 보기</button>
                  </div>
                {:else if attachment.type === 'sticker'}
                  <div class="sticker-attachment">
                    <img src={attachment.url} alt="스티커" class="sticker-image" />
                  </div>
                {/if}
              {/each}
            </div>
          {/if}

          <!-- Text Content -->
          {#if message.content}
            <div class="text-content">
              {message.content}
            </div>
          {/if}

          <!-- Message Footer -->
          <div class="message-footer">
            <span class="message-time">{formatTime(message.createdAt)}</span>
            {#if message.isEdited}
              <span class="edited-indicator">편집됨</span>
            {/if}
          </div>
        </div>

        <!-- Reactions -->
        {#if message.reactions && message.reactions.length > 0}
          <div class="reactions">
            {#each message.reactions as reaction}
              <button 
                class="reaction"
                class:reacted={reaction.hasReacted}
                on:click={() => handleReaction(reaction.emoji)}
              >
                <span class="reaction-emoji">{reaction.emoji}</span>
                <span class="reaction-count">{reaction.count}</span>
              </button>
            {/each}
          </div>
        {/if}

        <!-- Quick Actions -->
        <div class="quick-actions" class:own-actions={isOwn}>
          <button 
            class="quick-action"
            on:click={() => handleReaction('👍')}
            title="좋아요"
          >
            👍
          </button>
          <button 
            class="quick-action"
            on:click={() => handleReaction('❤️')}
            title="하트"
          >
            ❤️
          </button>
          <button 
            class="quick-action"
            on:click={handleReply}
            title="답장"
          >
            ↩️
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .message-bubble {
    margin-bottom: 8px;
    padding: 0 20px;
  }

  .message-bubble.own {
    display: flex;
    justify-content: flex-end;
  }

  .message-bubble.system {
    display: flex;
    justify-content: center;
    margin: 16px 0;
  }

  .system-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border-radius: 16px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .system-icon {
    font-size: 16px;
  }

  .system-text {
    flex: 1;
  }

  .system-time {
    font-size: 12px;
    opacity: 0.7;
  }

  .message-container {
    display: flex;
    gap: 8px;
    max-width: 70%;
    position: relative;
  }

  .message-container:hover .quick-actions {
    opacity: 1;
    visibility: visible;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .message-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .default-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .own-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .sender-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .sender-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .sender-grade {
    font-size: 12px;
    padding: 2px 6px;
    background: var(--primary-bg);
    color: var(--primary-color);
    border-radius: 8px;
    font-weight: 500;
  }

  .reply-context {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    padding-left: 12px;
  }

  .reply-line {
    width: 3px;
    background: var(--primary-color);
    border-radius: 2px;
  }

  .reply-content {
    flex: 1;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .reply-to {
    font-weight: 500;
  }

  .bubble {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 12px 16px;
    position: relative;
    word-wrap: break-word;
    border: 1px solid var(--border-color);
  }

  .own-bubble {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .cheer-bubble {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-bg) 100%);
    border-left: 4px solid var(--primary-color);
  }

  .message-type {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .type-icon {
    font-size: 16px;
  }

  .cheer-intensity {
    font-size: 12px;
  }

  .attachments {
    margin-bottom: 8px;
  }

  .image-attachment img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    object-fit: cover;
  }

  .card-attachment {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-tertiary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .card-preview {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-icon {
    font-size: 20px;
  }

  .view-card-btn {
    padding: 4px 12px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-card-btn:hover {
    background: var(--primary-hover);
  }

  .sticker-attachment {
    display: inline-block;
  }

  .sticker-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .text-content {
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .message-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.7;
  }

  .own-bubble .message-footer {
    color: rgba(255, 255, 255, 0.8);
  }

  .edited-indicator {
    font-style: italic;
  }

  .reactions {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .reaction {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reaction:hover {
    background: var(--bg-quaternary);
  }

  .reaction.reacted {
    background: var(--primary-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .reaction-emoji {
    font-size: 14px;
  }

  .reaction-count {
    font-weight: 500;
  }

  .quick-actions {
    position: absolute;
    top: -16px;
    display: flex;
    gap: 4px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 4px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .quick-actions.own-actions {
    right: 0;
  }

  .quick-actions:not(.own-actions) {
    left: 40px;
  }

  .quick-action {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .quick-action:hover {
    background: var(--bg-tertiary);
    transform: scale(1.1);
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .message-bubble {
      padding: 0 16px;
    }

    .message-container {
      max-width: 85%;
    }

    .bubble {
      padding: 10px 12px;
    }

    .quick-actions {
      position: static;
      opacity: 1;
      visibility: visible;
      margin-top: 8px;
      justify-content: center;
    }
  }
</style>