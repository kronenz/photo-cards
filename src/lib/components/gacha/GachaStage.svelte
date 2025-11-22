<script lang="ts">
  import { gachaState } from '$lib/stores/gachaStore';
  import SummonCircle from './SummonCircle.svelte';
  import GachaCard from './GachaCard.svelte';
  import LegendaryEffect from './LegendaryEffect.svelte';

  $: stage = $gachaState.stage;
  $: results = $gachaState.results;

  let revealedCount = 0;
  let showLegendaryEffect = false;

  function handleCardReveal() {
    revealedCount++;
    // Trigger particle effects or sounds here
  }

  // Check for legendary cards and trigger effect
  $: if (stage === 'revealing' && results.length > 0) {
    const hasLegendary = results.some((card) => card.rarity === 'legendary');
    if (hasLegendary && !showLegendaryEffect) {
      setTimeout(() => {
        showLegendaryEffect = true;
      }, 800); // Trigger after first card starts flipping
    }
  }

  // Reset revealed count and effects when stage changes
  $: if (stage === 'idle') {
    revealedCount = 0;
    showLegendaryEffect = false;
  }
</script>

<main class="gacha-stage">
  <div class="stage-content">
    {#if stage === 'idle'}
      <!-- Idle State: Show summon circle -->
      <div class="idle-state">
        <SummonCircle active={false} />
        <div class="idle-text">
          <h2>카드를 뽑아보세요!</h2>
          <p>행운을 시험해보세요</p>
        </div>
      </div>
    {:else if stage === 'pulling'}
      <!-- Pulling State: Animated summon circle -->
      <div class="pulling-state">
        <SummonCircle active={true} />
        <div class="pulling-text">
          <h2>소환 중...</h2>
        </div>
      </div>
    {:else if stage === 'revealing' || stage === 'complete'}
      <!-- Revealing/Complete State: Show flippable cards -->
      <div class="cards-state">
        <div class="cards-grid {results.length > 1 ? 'multi-pull' : 'single-pull'}">
          {#each results as card, i}
            <GachaCard
              {card}
              revealed={stage === 'revealing' || stage === 'complete'}
              index={i}
              onReveal={handleCardReveal}
            />
          {/each}
        </div>

        {#if stage === 'complete'}
          <div class="complete-actions">
            <button class="action-btn primary" on:click={() => window.location.href = '/collections'}>
              컬렉션 보기
            </button>
            <button class="action-btn secondary" on:click={() => { gachaState.update(s => ({ ...s, stage: 'idle' })); }}>
              다시 뽑기
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Legendary Effect (full screen overlay) -->
  <LegendaryEffect active={showLegendaryEffect} duration={3000} />
</main>

<style>
  .gacha-stage {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    height: 100%;
    width: 100%;
  }

  .stage-content {
    width: 100%;
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 0; /* Allow flex item to shrink */
  }

  /* Idle State */
  .idle-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }

  .idle-text {
    text-align: center;
  }

  .idle-text h2 {
    font-size: 36px;
    font-weight: 800;
    color: white;
    margin: 0 0 12px 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .idle-text p {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  /* Pulling State */
  .pulling-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .pulling-text h2 {
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin: 0;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Cards State (Revealing & Complete) */
  .cards-state {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    /* Remove height: 100% to allow natural sizing */
  }

  .cards-grid {
    display: grid;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    perspective: 1500px;
    align-items: center;
    justify-items: center;
  }

  .cards-grid.single-pull {
    grid-template-columns: 1fr;
    max-width: 320px;
    justify-items: center;
  }

  .cards-grid.multi-pull {
    grid-template-columns: repeat(5, 1fr);
    max-width: 1400px;
  }

  .complete-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    animation: fadeInUp 0.5s ease-out 1s backwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .action-btn {
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    letter-spacing: 0.5px;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  .action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6);
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .action-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .gacha-stage {
      padding: 20px;
    }

    .idle-text h2 {
      font-size: 28px;
    }

    .idle-text p {
      font-size: 16px;
    }

    .cards-grid.multi-pull {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .complete-actions {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }

    .action-btn {
      padding: 12px 24px;
      font-size: 14px;
    }
  }
</style>
