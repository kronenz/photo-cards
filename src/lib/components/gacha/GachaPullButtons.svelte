<script lang="ts">
  import { gachaState, canAffordPull, gachaActions } from '$lib/stores/gachaStore';
  import { PULL_COSTS } from '$lib/gacha/types';
  import { scrollFadeUp } from '$lib/transitions/scroll-animations';

  let pulling = false;

  async function handlePull(type: 1 | 10) {
    if (pulling || $gachaState.stage !== 'idle') return;

    pulling = true;

    try {
      // Perform pull
      const cards = await gachaActions.pull(type);

      // Simulate animation sequence
      await simulatePullingAnimation();
      await simulateRevealAnimation(cards.length);

      gachaActions.setStage('complete');
    } catch (error: any) {
      console.error('Pull error:', error);
      alert(error.message || '뽑기에 실패했습니다');
      gachaActions.reset();
    } finally {
      pulling = false;
    }
  }

  async function simulatePullingAnimation() {
    // Wait for pulling stage (summon circle animation)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    gachaActions.setStage('revealing');
  }

  async function simulateRevealAnimation(cardCount: number) {
    // Wait for revealing stage (cards flipping)
    const revealTime = cardCount * 100 + 1000;
    await new Promise((resolve) => setTimeout(resolve, revealTime));
  }

  function handleReset() {
    gachaActions.reset();
  }

  $: canPullSingle = $canAffordPull.single && !pulling;
  $: canPullMulti = $canAffordPull.multi && !pulling;
  $: isIdle = $gachaState.stage === 'idle';
  $: isComplete = $gachaState.stage === 'complete';
</script>

<footer class="gacha-pull-buttons" use:scrollFadeUp={{ duration: 600, delay: 100 }}>
  <div class="buttons-container">
    {#if isComplete}
      <!-- Complete state: Show reset button -->
      <button class="reset-button" on:click={handleReset}>
        <span class="button-icon">🔄</span>
        <span class="button-text">다시 뽑기</span>
      </button>
    {:else}
      <!-- Idle/Pulling state: Show pull buttons -->
      <div class="pull-buttons">
        <!-- Single Pull -->
        <button
          class="pull-button single"
          disabled={!canPullSingle || !isIdle}
          on:click={() => handlePull(1)}
        >
          <div class="button-content">
            <span class="button-icon">🎴</span>
            <div class="button-info">
              <span class="button-title">1장 뽑기</span>
              <div class="button-cost">
                <span>🎫 {PULL_COSTS[1].tickets}</span>
                <span class="divider">or</span>
                <span>💎 {PULL_COSTS[1].premium}</span>
              </div>
            </div>
          </div>
        </button>

        <!-- Multi Pull -->
        <button
          class="pull-button multi"
          disabled={!canPullMulti || !isIdle}
          on:click={() => handlePull(10)}
        >
          <div class="button-content">
            <span class="button-icon">🎁</span>
            <div class="button-info">
              <span class="button-title">10장 뽑기</span>
              <div class="button-cost">
                <span>🎫 {PULL_COSTS[10].tickets}</span>
                <span class="divider">or</span>
                <span>💎 {PULL_COSTS[10].premium}</span>
                <span class="discount">10% 할인!</span>
              </div>
            </div>
            <div class="guarantee-badge">Epic 보장</div>
          </div>
        </button>
      </div>
    {/if}
  </div>
</footer>

<style>
  .gacha-pull-buttons {
    position: relative;
    z-index: 10;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px 40px;
  }

  .buttons-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Pull Buttons */
  .pull-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .pull-button {
    position: relative;
    padding: 24px 32px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border: 2px solid rgba(102, 126, 234, 0.3);
    border-radius: 16px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .pull-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    opacity: 0;
    transition: opacity 0.3s;
  }

  .pull-button:hover:not(:disabled)::before {
    opacity: 1;
  }

  .pull-button:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
    border-color: rgba(102, 126, 234, 0.6);
  }

  .pull-button:active:not(:disabled) {
    transform: translateY(-2px);
  }

  .pull-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pull-button.multi {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
    border-color: rgba(251, 191, 36, 0.3);
  }

  .pull-button.multi::before {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  }

  .pull-button.multi:hover:not(:disabled) {
    box-shadow: 0 12px 32px rgba(251, 191, 36, 0.4);
    border-color: rgba(251, 191, 36, 0.6);
  }

  .button-content {
    position: relative;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .button-icon {
    font-size: 48px;
  }

  .button-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .button-title {
    font-size: 20px;
    font-weight: 700;
  }

  .button-cost {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .divider {
    color: rgba(255, 255, 255, 0.4);
  }

  .discount {
    margin-left: 8px;
    padding: 2px 8px;
    background: rgba(239, 68, 68, 0.3);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #ef4444;
  }

  .guarantee-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 12px;
    background: rgba(168, 85, 247, 0.3);
    border: 1px solid rgba(168, 85, 247, 0.5);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    color: #a855f7;
  }

  /* Reset Button */
  .reset-button {
    width: 100%;
    padding: 24px 32px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    border: 2px solid rgba(102, 126, 234, 0.4);
    border-radius: 16px;
    color: white;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .reset-button:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
    border-color: rgba(102, 126, 234, 0.6);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  }

  .button-icon {
    font-size: 32px;
  }

  .button-text {
    font-size: 20px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .gacha-pull-buttons {
      padding: 20px;
    }

    .pull-buttons {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .pull-button {
      padding: 20px 24px;
    }

    .button-icon {
      font-size: 36px;
    }

    .button-title {
      font-size: 18px;
    }

    .button-cost {
      font-size: 13px;
      flex-wrap: wrap;
    }

    .guarantee-badge {
      position: static;
      margin-top: 8px;
      width: fit-content;
    }

    .reset-button {
      padding: 20px 24px;
    }

    .button-text {
      font-size: 18px;
    }
  }
</style>
