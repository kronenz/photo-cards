<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { currency, pityState } from '$lib/stores/gachaStore';
  import { scrollFadeUp } from '$lib/transitions/scroll-animations';

  const dispatch = createEventDispatcher();

  function handleProbabilityClick() {
    dispatch('probabilityClick');
  }

  function handleHistoryClick() {
    dispatch('historyClick');
  }

  $: pityProgress = ($pityState.pullCount / $pityState.guaranteeThreshold) * 100;
</script>

<header class="gacha-header" use:scrollFadeUp={{ duration: 600 }}>
  <div class="header-content">
    <!-- Left: Logo & Title -->
    <div class="header-left">
      <a href="/" class="logo-link">
        <span class="logo-icon">⚾</span>
        <span class="logo-text">카드 뽑기</span>
      </a>
    </div>

    <!-- Center: Currency Display -->
    <div class="currency-display">
      <div class="currency-item tickets">
        <span class="currency-icon">🎫</span>
        <div class="currency-info">
          <span class="currency-label">티켓</span>
          <span class="currency-value">{$currency.tickets}</span>
        </div>
      </div>

      <div class="currency-item premium">
        <span class="currency-icon">💎</span>
        <div class="currency-info">
          <span class="currency-label">프리미엄</span>
          <span class="currency-value">{$currency.premium}</span>
        </div>
      </div>
    </div>

    <!-- Right: Action Buttons -->
    <div class="header-right">
      <button class="header-button" on:click={handleProbabilityClick} title="확률 정보">
        <span>📊</span>
        <span class="button-label">확률</span>
      </button>

      <button class="header-button" on:click={handleHistoryClick} title="뽑기 기록">
        <span>📜</span>
        <span class="button-label">히스토리</span>
      </button>
    </div>
  </div>

  <!-- Pity Counter -->
  <div class="pity-counter">
    <div class="pity-info">
      <span class="pity-label">천장까지</span>
      <span class="pity-value"
        >{$pityState.guaranteeThreshold - $pityState.pullCount}회</span
      >
    </div>
    <div class="pity-bar">
      <div class="pity-fill" style:width="{pityProgress}%"></div>
    </div>
  </div>
</header>

<style>
  .gacha-header {
    position: relative;
    z-index: 10;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px 40px 10px;
  }

  .header-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Left: Logo */
  .header-left {
    display: flex;
    align-items: center;
  }

  .logo-link {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: white;
    transition: opacity 0.2s;
  }

  .logo-link:hover {
    opacity: 0.8;
  }

  .logo-icon {
    font-size: 32px;
  }

  .logo-text {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Center: Currency */
  .currency-display {
    display: flex;
    gap: 20px;
  }

  .currency-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    min-width: 140px;
  }

  .currency-item.tickets {
    border-color: rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.05);
  }

  .currency-item.premium {
    border-color: rgba(168, 85, 247, 0.3);
    background: rgba(168, 85, 247, 0.05);
  }

  .currency-icon {
    font-size: 24px;
  }

  .currency-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .currency-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .currency-value {
    font-size: 18px;
    font-weight: 700;
    color: white;
  }

  /* Right: Buttons */
  .header-right {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .header-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .header-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .button-label {
    font-size: 13px;
  }

  /* Pity Counter */
  .pity-counter {
    max-width: 1400px;
    margin: 12px auto 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .pity-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
  }

  .pity-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .pity-value {
    font-size: 14px;
    font-weight: 700;
    color: #fbbf24;
  }

  .pity-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .pity-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
    border-radius: 3px;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .header-content {
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
    }

    .currency-display {
      grid-column: 1 / -1;
      justify-content: center;
    }

    .header-right {
      justify-content: flex-end;
    }
  }

  @media (max-width: 768px) {
    .gacha-header {
      padding: 16px 20px 10px;
    }

    .header-content {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .logo-text {
      font-size: 18px;
    }

    .currency-display {
      gap: 12px;
    }

    .currency-item {
      min-width: 0;
      flex: 1;
      padding: 10px 16px;
    }

    .currency-value {
      font-size: 16px;
    }

    .header-right {
      justify-content: center;
    }

    .button-label {
      display: none;
    }

    .pity-counter {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .pity-info {
      justify-content: center;
    }
  }
</style>
