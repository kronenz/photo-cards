<script lang="ts">
  import { onMount } from 'svelte';
  import {
    gachaState,
    currency,
    canAffordPull,
    gachaActions
  } from '$lib/stores/gachaStore';
  import GachaHeader from '$lib/components/gacha/GachaHeader.svelte';
  import GachaStage from '$lib/components/gacha/GachaStage.svelte';
  import GachaPullButtons from '$lib/components/gacha/GachaPullButtons.svelte';
  import SkipButton from '$lib/components/gacha/SkipButton.svelte';
  import ProbabilityModal from '$lib/components/gacha/ProbabilityModal.svelte';
  import HistoryModal from '$lib/components/gacha/HistoryModal.svelte';

  let showProbabilityModal = false;
  let showHistoryModal = false;

  $: showSkipButton = $gachaState.stage === 'revealing';

  function handleProbabilityClick() {
    showProbabilityModal = true;
  }

  function handleHistoryClick() {
    showHistoryModal = true;
  }

  function closeProbabilityModal() {
    showProbabilityModal = false;
  }

  function closeHistoryModal() {
    showHistoryModal = false;
  }

  onMount(() => {
    // Initialize gacha state
    gachaActions.reset();
  });
</script>

<svelte:head>
  <title>카드 뽑기 - Baseball 홀로그래픽 카드</title>
  <meta name="description" content="홀로그래픽 야구 카드를 뽑아보세요!" />
</svelte:head>

<div class="gacha-page">
  <GachaHeader
    on:probabilityClick={handleProbabilityClick}
    on:historyClick={handleHistoryClick}
  />

  <GachaStage />

  <GachaPullButtons />

  <SkipButton visible={showSkipButton} />

  <!-- Modals -->
  <ProbabilityModal show={showProbabilityModal} on:close={closeProbabilityModal} />
  <HistoryModal show={showHistoryModal} on:close={closeHistoryModal} />
</div>

<style>
  .gacha-page {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    position: relative;
    overflow: hidden;
  }

  /* Animated background stars */
  .gacha-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        2px 2px at 20px 30px,
        rgba(255, 255, 255, 0.3),
        transparent
      ),
      radial-gradient(2px 2px at 60px 70px, rgba(255, 255, 255, 0.2), transparent),
      radial-gradient(1px 1px at 50px 50px, rgba(255, 255, 255, 0.3), transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.2), transparent),
      radial-gradient(2px 2px at 90px 10px, rgba(255, 255, 255, 0.3), transparent);
    background-size: 200px 200px;
    background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 150px 50px;
    animation: stars 20s linear infinite;
    opacity: 0.5;
    z-index: 0;
  }

  @keyframes stars {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-200px);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .gacha-page {
      grid-template-rows: auto 1fr 140px;
    }
  }
</style>
