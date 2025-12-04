<!--
  Upload Progress Component
  Feature: 004-production-service-integration

  Displays upload progress with status messages and visual feedback
-->
<script lang="ts">
  import type { CardUploadProgress } from '$lib/services/uploadService';

  export let progress: CardUploadProgress = {
    status: 'idle',
    progress: 0,
    message: ''
  };

  // Get status icon
  function getStatusIcon(status: CardUploadProgress['status']): string {
    switch (status) {
      case 'idle': return '📤';
      case 'uploading': return '⬆️';
      case 'processing': return '⚙️';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '📤';
    }
  }

  // Get status color class
  function getStatusClass(status: CardUploadProgress['status']): string {
    switch (status) {
      case 'idle': return 'idle';
      case 'uploading': return 'uploading';
      case 'processing': return 'processing';
      case 'complete': return 'complete';
      case 'error': return 'error';
      default: return 'idle';
    }
  }

  $: statusIcon = getStatusIcon(progress.status);
  $: statusClass = getStatusClass(progress.status);
  $: isActive = progress.status !== 'idle' && progress.status !== 'complete';
</script>

{#if progress.status !== 'idle'}
  <div class="upload-progress {statusClass}">
    <div class="progress-header">
      <span class="status-icon">{statusIcon}</span>
      <span class="status-message">{progress.message}</span>
    </div>

    {#if isActive || progress.status === 'complete'}
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          style="width: {progress.progress}%"
          class:animated={isActive}
        ></div>
      </div>
      <div class="progress-percentage">{progress.progress}%</div>
    {/if}

    {#if progress.status === 'error'}
      <button class="retry-button" on:click={() => progress = { status: 'idle', progress: 0, message: '' }}>
        다시 시도
      </button>
    {/if}
  </div>
{/if}

<style>
  .upload-progress {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px 20px;
    margin: 16px 0;
  }

  .progress-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .status-icon {
    font-size: 20px;
  }

  .status-message {
    font-size: 14px;
    font-weight: 500;
    color: #ccc;
  }

  .progress-bar-container {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-bar.animated {
    background: linear-gradient(
      90deg,
      #667eea 0%,
      #764ba2 50%,
      #667eea 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .progress-percentage {
    font-size: 12px;
    color: #999;
    text-align: right;
  }

  /* Status-specific styles */
  .upload-progress.uploading {
    border-color: rgba(102, 126, 234, 0.3);
  }

  .upload-progress.uploading .progress-bar {
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  .upload-progress.processing {
    border-color: rgba(255, 183, 0, 0.3);
  }

  .upload-progress.processing .progress-bar {
    background: linear-gradient(90deg, #ffb700, #ff8c00);
  }

  .upload-progress.processing .status-message {
    color: #ffb700;
  }

  .upload-progress.complete {
    border-color: rgba(52, 199, 89, 0.3);
    background: rgba(52, 199, 89, 0.05);
  }

  .upload-progress.complete .progress-bar {
    background: #34c759;
  }

  .upload-progress.complete .status-message {
    color: #34c759;
  }

  .upload-progress.error {
    border-color: rgba(255, 59, 48, 0.3);
    background: rgba(255, 59, 48, 0.05);
  }

  .upload-progress.error .status-message {
    color: #ff3b30;
  }

  .retry-button {
    margin-top: 12px;
    padding: 8px 16px;
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 6px;
    color: #ff3b30;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background: rgba(255, 59, 48, 0.2);
  }
</style>
