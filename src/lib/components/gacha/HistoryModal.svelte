<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { pullHistory, gachaStats } from '$lib/stores/gachaStore';
  import type { PullHistory } from '$lib/gacha/types';

  export let show = false;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  $: stats = $gachaStats;
  $: history = $pullHistory.slice(0, 50); // Show last 50 pulls

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  }

  function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#9ca3af',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#fbbf24'
    };
    return colors[rarity] || colors.common;
  }

  function getRarityName(rarity: string): string {
    const names: Record<string, string> = {
      common: '일반',
      rare: '희귀',
      epic: '영웅',
      legendary: '전설'
    };
    return names[rarity] || rarity;
  }
</script>

{#if show}
  <div class="modal-overlay" on:click={close} role="dialog" aria-modal="true">
    <div class="modal-container" on:click|stopPropagation>
      <!-- Header -->
      <div class="modal-header">
        <h2>뽑기 기록</h2>
        <button class="close-btn" on:click={close} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Statistics -->
        <section class="stats-section">
          <h3 class="section-title">통계</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎲</div>
              <div class="stat-value">{stats.totalPulls}</div>
              <div class="stat-label">총 뽑기 횟수</div>
            </div>
            <div class="stat-card legendary">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">{stats.legendaryCount}</div>
              <div class="stat-label">Legendary 획득</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💎</div>
              <div class="stat-value">{stats.cardsByRarity.epic}</div>
              <div class="stat-label">Epic 획득</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔄</div>
              <div class="stat-value">{stats.duplicateCount}</div>
              <div class="stat-label">중복 카드</div>
            </div>
          </div>

          <!-- Rarity Distribution -->
          <div class="rarity-distribution">
            <h4 class="distribution-title">등급별 획득률</h4>
            <div class="distribution-bars">
              {#each Object.entries(stats.cardsByRarity) as [rarity, count]}
                {@const total = stats.totalPulls * (rarity === 'common' ? 1 : rarity === 'rare' ? 10 : 10)}
                {@const percentage = total > 0 ? (count / total) * 100 : 0}
                <div class="distribution-bar">
                  <div class="bar-label">
                    <span>{getRarityName(rarity)}</span>
                    <span class="bar-count">{count}장 ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      style="width: {percentage}%; background-color: {getRarityColor(rarity)};"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </section>

        <!-- History List -->
        <section class="history-section">
          <h3 class="section-title">최근 뽑기 ({history.length}건)</h3>
          {#if history.length === 0}
            <div class="empty-state">
              <div class="empty-icon">📦</div>
              <p class="empty-text">아직 뽑기 기록이 없습니다</p>
              <p class="empty-subtext">첫 번째 카드를 뽑아보세요!</p>
            </div>
          {:else}
            <div class="history-list">
              {#each history as pull (pull.id)}
                <div class="history-item">
                  <div class="history-header">
                    <span class="history-type">
                      {pull.pullType === 1 ? '🎴 1장 뽑기' : '🎁 10장 뽑기'}
                    </span>
                    <span class="history-time">{formatDate(pull.pulledAt)}</span>
                  </div>
                  <div class="history-cards">
                    {#each pull.cards as card}
                      <div
                        class="mini-card"
                        style="border-color: {getRarityColor(card.rarity)}; box-shadow: 0 0 10px {getRarityColor(card.rarity)}30;"
                      >
                        <div class="mini-card-rarity" style="background-color: {getRarityColor(card.rarity)};">
                          {getRarityName(card.rarity)}
                        </div>
                        <div class="mini-card-name">{card.title}</div>
                        {#if card.isNew}
                          <div class="mini-card-badge new">NEW</div>
                        {/if}
                        {#if card.guaranteeType}
                          <div class="mini-card-badge guarantee">
                            {card.guaranteeType === 'pity' ? '천장' : '보너스'}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-container {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 30, 0.98) 100%);
    border-radius: 24px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  }

  .modal-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .modal-content {
    padding: 28px;
    overflow-y: auto;
    max-height: calc(90vh - 88px);
  }

  .stats-section {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: white;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
  }

  .stat-card.legendary {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
    border-color: rgba(251, 191, 36, 0.3);
  }

  .stat-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .rarity-distribution {
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .distribution-title {
    font-size: 15px;
    font-weight: 600;
    color: white;
    margin: 0 0 16px 0;
  }

  .distribution-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .distribution-bar {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }

  .bar-count {
    font-weight: 600;
  }

  .bar-track {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .history-section {
    margin-top: 32px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 8px 0;
  }

  .empty-subtext {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .history-item {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .history-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .history-type {
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .history-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .history-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .mini-card {
    aspect-ratio: 2.5 / 3.5;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid;
    border-radius: 8px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    transition: all 0.2s;
  }

  .mini-card:hover {
    transform: translateY(-2px);
  }

  .mini-card-rarity {
    font-size: 10px;
    font-weight: 700;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
    width: fit-content;
  }

  .mini-card-name {
    font-size: 11px;
    font-weight: 600;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-card-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .mini-card-badge.new {
    background: #ef4444;
    color: white;
  }

  .mini-card-badge.guarantee {
    background: #f59e0b;
    color: white;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .modal-container {
      max-width: 100%;
      border-radius: 20px 20px 0 0;
      max-height: 95vh;
    }

    .modal-header h2 {
      font-size: 20px;
    }

    .modal-content {
      padding: 20px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .history-cards {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
  }
</style>
