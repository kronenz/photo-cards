<script lang="ts">
  import { gacha2Store, gacha2Actions, gacha2Error, gacha2SaveResult } from '$lib/stores/gacha2Store';
  import { pb } from '$lib/pocketbase';

  // 레어리티 색상
  const rarityColors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#fbbf24'
  };

  const rarityNames: Record<string, string> = {
    common: '커먼',
    rare: '레어',
    epic: '에픽',
    legendary: '레전더리'
  };

  $: isAuthenticated = pb.authStore.isValid;

  function handlePull(count: 1 | 10) {
    gacha2Actions.pull(count);
  }

  async function handleSave() {
    await gacha2Actions.saveResults();
  }

  function handleReset() {
    gacha2Actions.reset();
  }
</script>

<svelte:head>
  <title>카드 뽑기 v2 - Baseball 홀로그래픽 카드</title>
</svelte:head>

<div class="gacha2-page">
  <!-- 헤더 -->
  <header class="header">
    <h1>카드 뽑기</h1>
    <p>행운을 시험해보세요!</p>
  </header>

  <!-- 메인 영역 -->
  <main class="main">
    {#if $gacha2Store.stage === 'idle'}
      <!-- 대기 상태 -->
      <div class="idle-area">
        <div class="summon-circle">
          <div class="circle-inner">?</div>
        </div>
        <p class="idle-hint">아래 버튼을 눌러 카드를 뽑아보세요</p>
      </div>

    {:else if $gacha2Store.stage === 'pulling'}
      <!-- 뽑기 중 -->
      <div class="pulling-area">
        <div class="summon-circle active">
          <div class="circle-inner spinning">?</div>
        </div>
        <p class="pulling-text">소환 중...</p>
      </div>

    {:else if $gacha2Store.stage === 'result' || $gacha2Store.stage === 'saving' || $gacha2Store.stage === 'saved'}
      <!-- 결과 표시 -->
      <div class="result-area">
        {#if $gacha2Error}
          <div class="error-message">{$gacha2Error}</div>
        {/if}

        {#if $gacha2Store.stage === 'saved' && $gacha2SaveResult}
          <div class="save-summary">
            <span class="save-stat new">새 카드: {$gacha2SaveResult.newCards}장</span>
            <span class="save-stat dup">중복: {$gacha2SaveResult.duplicates}장</span>
          </div>
        {/if}

        <div class="cards-container" class:single={$gacha2Store.cards.length === 1}>
          {#each $gacha2Store.cards as card, index (card.id)}
            <div
              class="card-slot"
              style="--delay: {index * 100}ms; --rarity-color: {rarityColors[card.rarity]}"
            >
              <div class="card-inner">
                <!-- 카드 앞면 -->
                <div class="card-front">
                  <img src={card.image} alt={card.title} />
                  <div class="card-overlay">
                    <span class="card-number">#{card.number}</span>
                    <h3 class="card-title">{card.title}</h3>
                    <p class="card-subtitle">{card.subtitle}</p>
                    <span class="card-rarity">{rarityNames[card.rarity]}</span>
                  </div>
                  {#if card.isNew && !card.isDuplicate}
                    <span class="new-badge">NEW</span>
                  {:else if card.isDuplicate}
                    <span class="dup-badge">x{card.cardCount || 1}</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </main>

  <!-- 하단 버튼 영역 -->
  <footer class="footer">
    {#if $gacha2Store.stage === 'idle'}
      <button class="pull-btn" on:click={() => handlePull(1)}>
        1회 뽑기
      </button>
      <button class="pull-btn primary" on:click={() => handlePull(10)}>
        10회 뽑기
      </button>
    {:else if $gacha2Store.stage === 'result'}
      {#if isAuthenticated}
        <button class="pull-btn save-btn" on:click={handleSave}>
          💾 저장하기
        </button>
      {:else}
        <a href="/auth/signin" class="pull-btn save-btn">
          🔒 로그인하고 저장
        </a>
      {/if}
      <button class="pull-btn" on:click={handleReset}>
        다시 뽑기
      </button>
    {:else if $gacha2Store.stage === 'saving'}
      <button class="pull-btn" disabled>
        저장 중...
      </button>
    {:else if $gacha2Store.stage === 'saved'}
      <button class="pull-btn" on:click={handleReset}>
        다시 뽑기
      </button>
      <a href="/collections" class="pull-btn primary">
        컬렉션 보기
      </a>
    {/if}
  </footer>
</div>

<style>
  .gacha2-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%);
    color: white;
  }

  /* 헤더 */
  .header {
    text-align: center;
    padding: 24px 16px;
  }

  .header h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header p {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  /* 메인 영역 */
  .main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  /* 대기 상태 */
  .idle-area, .pulling-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .summon-circle {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
    border: 3px solid rgba(102, 126, 234, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .summon-circle::before {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    border: 2px dashed rgba(102, 126, 234, 0.3);
    animation: rotate 20s linear infinite;
  }

  .summon-circle.active {
    border-color: rgba(102, 126, 234, 0.8);
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
  }

  .circle-inner {
    font-size: 64px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
  }

  .circle-inner.spinning {
    animation: pulse 0.5s ease-in-out infinite;
  }

  .idle-hint, .pulling-text {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .pulling-text {
    animation: blink 1s ease-in-out infinite;
  }

  /* 결과 영역 */
  .result-area {
    width: 100%;
    max-width: 1000px;
  }

  .cards-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    justify-items: center;
  }

  .cards-container.single {
    grid-template-columns: 1fr;
    max-width: 200px;
    margin: 0 auto;
  }

  .card-slot {
    width: 100%;
    max-width: 160px;
    aspect-ratio: 2.5 / 3.5;
    animation: cardAppear 0.5s ease-out forwards;
    animation-delay: var(--delay);
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }

  @keyframes cardAppear {
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .card-inner {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.4),
      0 0 0 2px var(--rarity-color),
      0 0 20px var(--rarity-color);
  }

  .card-front {
    width: 100%;
    height: 100%;
    position: relative;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .card-front img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 12px;
  }

  .card-number {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--rarity-color);
  }

  .card-title {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    color: white;
  }

  .card-subtitle {
    font-size: 11px;
    margin: 2px 0 0;
    color: rgba(255, 255, 255, 0.7);
  }

  .card-rarity {
    font-size: 10px;
    font-weight: 600;
    color: var(--rarity-color);
    text-transform: uppercase;
    margin-top: 4px;
  }

  .new-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 4px;
  }

  .dup-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 4px;
  }

  .error-message {
    margin-bottom: 16px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    text-align: center;
    font-size: 14px;
  }

  .save-summary {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 20px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  .save-stat {
    font-size: 15px;
    font-weight: 600;
  }

  .save-stat.new {
    color: #34d399;
  }

  .save-stat.dup {
    color: #fbbf24;
  }

  /* 하단 버튼 */
  .footer {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 24px 16px;
  }

  .pull-btn {
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pull-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .pull-btn.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  .pull-btn.primary:hover {
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6);
  }

  .pull-btn.save-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  }

  .pull-btn.save-btn:hover {
    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.6);
  }

  .pull-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* 애니메이션 */
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .cards-container {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      max-width: 340px;
      margin: 0 auto;
    }

    .card-slot {
      max-width: 150px;
    }

    .footer {
      flex-direction: column;
      align-items: center;
    }

    .pull-btn {
      width: 100%;
      max-width: 280px;
    }
  }

  @media (max-width: 400px) {
    .card-slot {
      max-width: 130px;
    }

    .cards-container {
      max-width: 290px;
    }
  }
</style>
