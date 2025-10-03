<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { spring, tweened } from 'svelte/motion';
  import { cubicOut, elasticOut } from 'svelte/easing';

  const dispatch = createEventDispatcher();

  export let isVisible = false;
  export let saveType = 'card'; // 'card' | 'export' | 'share'
  export let fileName = '';
  export let fileSize = '';

  let animationContainer: HTMLDivElement;
  let checkmarkPath: SVGPathElement;

  // Animation states
  const scale = spring(0, { stiffness: 0.2, damping: 0.8 });
  const opacity = spring(0, { stiffness: 0.3, damping: 0.9 });
  const checkmarkProgress = tweened(0, { duration: 800, easing: elasticOut });
  const successScale = spring(1, { stiffness: 0.15, damping: 0.7 });

  // Animation sequence
  let currentStep = 'hidden'; // 'hidden' | 'saving' | 'success' | 'complete'
  let showDetails = false;

  // Save type configurations
  const saveConfigs = {
    card: {
      icon: '🎨',
      title: '카드 저장 중...',
      successTitle: '카드가 저장되었습니다!',
      color: '#6366f1'
    },
    export: {
      icon: '📤',
      title: '내보내는 중...',
      successTitle: '성공적으로 내보냈습니다!',
      color: '#10b981'
    },
    share: {
      icon: '📱',
      title: '공유 준비 중...',
      successTitle: '공유 준비 완료!',
      color: '#f59e0b'
    }
  };

  $: config = saveConfigs[saveType as keyof typeof saveConfigs];

  // Watch for visibility changes
  $: if (isVisible) {
    startSaveAnimation();
  } else {
    resetAnimation();
  }

  async function startSaveAnimation() {
    currentStep = 'saving';
    
    // Initial appearance
    scale.set(1);
    opacity.set(1);
    
    // Simulate save process (in real app, this would be triggered by actual save completion)
    setTimeout(() => {
      showSuccessAnimation();
    }, 1500);
  }

  async function showSuccessAnimation() {
    currentStep = 'success';
    
    // Animate checkmark
    checkmarkProgress.set(1);
    
    // Success scale animation
    successScale.set(1.1);
    setTimeout(() => successScale.set(1), 200);
    
    // Show file details
    setTimeout(() => {
      showDetails = true;
    }, 400);
    
    // Auto-hide after delay
    setTimeout(() => {
      hideAnimation();
    }, 2500);
  }

  function hideAnimation() {
    currentStep = 'complete';
    showDetails = false;
    
    scale.set(0.8);
    opacity.set(0);
    
    setTimeout(() => {
      resetAnimation();
      dispatch('animationComplete');
    }, 300);
  }

  function resetAnimation() {
    currentStep = 'hidden';
    showDetails = false;
    scale.set(0);
    opacity.set(0);
    checkmarkProgress.set(0);
    successScale.set(1);
  }

  // Haptic feedback (for mobile devices)
  function triggerHapticFeedback() {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  }

  onMount(() => {
    // Trigger haptic feedback on success
    if (currentStep === 'success') {
      triggerHapticFeedback();
    }
  });
</script>

{#if isVisible}
  <div 
    class="save-animation-overlay"
    style="opacity: {$opacity}"
  >
    <div 
      class="save-animation-container"
      bind:this={animationContainer}
      style="
        transform: scale({$scale}) scale({$successScale});
        opacity: {$opacity};
      "
    >
      <!-- Saving State -->
      {#if currentStep === 'saving'}
        <div class="saving-state">
          <div class="spinner-container">
            <div class="apple-spinner" style="border-top-color: {config.color}"></div>
          </div>
          
          <div class="save-content">
            <div class="save-icon" style="color: {config.color}">
              {config.icon}
            </div>
            <h3 class="save-title">{config.title}</h3>
            <div class="save-progress">
              <div class="progress-dots">
                <span class="dot active"></span>
                <span class="dot active"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Success State -->
      {#if currentStep === 'success'}
        <div class="success-state">
          <div class="checkmark-container">
            <svg class="checkmark" viewBox="0 0 52 52">
              <circle 
                class="checkmark-circle" 
                cx="26" 
                cy="26" 
                r="25" 
                fill="none"
                stroke={config.color}
              />
              <path 
                bind:this={checkmarkPath}
                class="checkmark-check" 
                fill="none" 
                stroke={config.color}
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                style="
                  stroke-dasharray: 48;
                  stroke-dashoffset: {48 - ($checkmarkProgress * 48)};
                "
              />
            </svg>
          </div>
          
          <div class="success-content">
            <h3 class="success-title">{config.successTitle}</h3>
            
            {#if showDetails && (fileName || fileSize)}
              <div class="file-details">
                {#if fileName}
                  <div class="file-name">
                    <span class="label">파일명:</span>
                    <span class="value">{fileName}</span>
                  </div>
                {/if}
                {#if fileSize}
                  <div class="file-size">
                    <span class="label">크기:</span>
                    <span class="value">{fileSize}</span>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Background blur effect -->
      <div class="background-blur"></div>
    </div>
  </div>
{/if}

<style>
  .save-animation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    pointer-events: none;
  }

  .save-animation-container {
    position: relative;
    background: rgba(28, 28, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    min-width: 280px;
    max-width: 400px;
    text-align: center;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    will-change: transform, opacity;
  }

  .background-blur {
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    border-radius: 30px;
    z-index: -1;
  }

  /* Saving State */
  .saving-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .spinner-container {
    position: relative;
    width: 60px;
    height: 60px;
  }

  .apple-spinner {
    width: 100%;
    height: 100%;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #6366f1;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .save-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .save-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .save-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  }

  .save-progress {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .progress-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #6366f1;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  /* Success State */
  .success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .checkmark-container {
    width: 80px;
    height: 80px;
  }

  .checkmark {
    width: 100%;
    height: 100%;
  }

  .checkmark-circle {
    stroke-width: 2;
    stroke-miterlimit: 10;
    animation: checkmark-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  }

  .checkmark-check {
    transform-origin: 50% 50%;
    animation: checkmark-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
  }

  @keyframes checkmark-circle {
    0% {
      stroke-dasharray: 0 157;
    }
    100% {
      stroke-dasharray: 157 157;
    }
  }

  @keyframes checkmark-check {
    0% {
      stroke-dasharray: 0 48;
    }
    100% {
      stroke-dasharray: 48 48;
    }
  }

  .success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .success-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  }

  .file-details {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    width: 100%;
    animation: slideUp 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .file-name,
  .file-size {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .file-name:last-child,
  .file-size:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #86868b;
    font-weight: 500;
  }

  .value {
    color: #ffffff;
    font-weight: 600;
    font-family: 'SF Mono', monospace;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .save-animation-container {
      margin: 20px;
      padding: 24px;
      min-width: auto;
      width: calc(100% - 40px);
    }

    .save-title,
    .success-title {
      font-size: 16px;
    }

    .checkmark-container {
      width: 60px;
      height: 60px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .apple-spinner {
      animation: none;
    }
    
    .dot.active {
      animation: none;
    }
    
    .checkmark-circle,
    .checkmark-check {
      animation: none;
    }
    
    .file-details {
      animation: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .save-animation-container {
      border: 2px solid #ffffff;
      background: #000000;
    }
    
    .save-title,
    .success-title {
      color: #ffffff;
    }
  }
</style>