<!--
  Network Error Component with Retry
  Feature: 004-production-service-integration (T064)

  Displays network error state with retry functionality
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let message: string = '네트워크 연결에 문제가 발생했습니다.';
  export let details: string = '';
  export let retryLabel: string = '다시 시도';
  export let showRetry: boolean = true;
  export let isRetrying: boolean = false;
  export let variant: 'inline' | 'fullpage' | 'card' = 'inline';

  const dispatch = createEventDispatcher<{ retry: void }>();

  function handleRetry() {
    dispatch('retry');
  }
</script>

<div class="network-error {variant}" role="alert">
  <div class="error-content">
    <div class="error-icon">
      {#if isRetrying}
        <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01"/>
        </svg>
      {/if}
    </div>

    <div class="error-text">
      <h3 class="error-title">{isRetrying ? '재연결 중...' : message}</h3>
      {#if details && !isRetrying}
        <p class="error-details">{details}</p>
      {/if}
    </div>

    {#if showRetry && !isRetrying}
      <button class="retry-button" on:click={handleRetry}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 4v6h6M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        {retryLabel}
      </button>
    {/if}
  </div>
</div>

<style>
  .network-error {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .network-error.inline {
    padding: 24px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 16px;
  }

  .network-error.fullpage {
    min-height: 400px;
    padding: 60px 24px;
  }

  .network-error.card {
    padding: 32px;
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    max-width: 400px;
  }

  .error-icon {
    width: 56px;
    height: 56px;
    color: #ef4444;
  }

  .network-error.card .error-icon {
    width: 64px;
    height: 64px;
  }

  .error-icon svg {
    width: 100%;
    height: 100%;
  }

  .spinner {
    animation: spin 1s linear infinite;
    color: #667eea;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .error-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .error-title {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .network-error.card .error-title {
    font-size: 20px;
  }

  .error-details {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.5;
  }

  .retry-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #667eea;
    transform: translateY(-2px);
  }

  .retry-button svg {
    width: 18px;
    height: 18px;
  }
</style>
