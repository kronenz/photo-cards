<!--
  Empty State Component
  Feature: 004-production-service-integration (T063)

  Displays a friendly empty state with customizable icon, message, and action
-->
<script lang="ts">
  export let icon: string = '📭';
  export let title: string = '데이터가 없습니다';
  export let description: string = '';
  export let actionLabel: string = '';
  export let actionHref: string = '';
  export let onAction: (() => void) | null = null;
  export let variant: 'default' | 'compact' | 'large' = 'default';
</script>

<div class="empty-state {variant}" role="status">
  <div class="empty-icon">{icon}</div>
  <h3 class="empty-title">{title}</h3>
  {#if description}
    <p class="empty-description">{description}</p>
  {/if}

  {#if actionLabel}
    {#if actionHref}
      <a href={actionHref} class="empty-action">
        {actionLabel}
      </a>
    {:else if onAction}
      <button class="empty-action" on:click={onAction}>
        {actionLabel}
      </button>
    {/if}
  {/if}

  <slot />
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .empty-state.compact {
    padding: 32px 16px;
  }

  .empty-state.large {
    padding: 100px 32px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    filter: grayscale(0.2);
    animation: bounce 2s ease-in-out infinite;
  }

  .empty-state.compact .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-state.large .empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .empty-title {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .empty-state.compact .empty-title {
    font-size: 16px;
  }

  .empty-state.large .empty-title {
    font-size: 24px;
  }

  .empty-description {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 20px 0;
    max-width: 400px;
    line-height: 1.5;
  }

  .empty-state.compact .empty-description {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .empty-action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .empty-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
  }

  .empty-state.compact .empty-action {
    padding: 10px 20px;
    font-size: 14px;
  }
</style>
