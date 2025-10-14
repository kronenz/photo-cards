<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  // Probability data
  const probabilities = [
    {
      rarity: 'legendary',
      name: 'Legendary',
      korean: '전설',
      rate: '3.0%',
      color: '#fbbf24',
      description: '최고 등급 카드',
      examples: ['전설의 명장면', '역대급 선수', '시그니처 카드']
    },
    {
      rarity: 'epic',
      name: 'Epic',
      korean: '영웅',
      rate: '12.0%',
      color: '#a855f7',
      description: '높은 등급 카드',
      examples: ['올스타 선수', '명장면', '특별 기념 카드']
    },
    {
      rarity: 'rare',
      name: 'Rare',
      korean: '희귀',
      rate: '25.0%',
      color: '#3b82f6',
      description: '중간 등급 카드',
      examples: ['주전 선수', '인기 선수', '팀 카드']
    },
    {
      rarity: 'common',
      name: 'Common',
      korean: '일반',
      rate: '60.0%',
      color: '#9ca3af',
      description: '기본 등급 카드',
      examples: ['일반 선수', '기본 카드', '팀 로고']
    }
  ];

  // Guarantee system
  const guarantees = [
    {
      title: '10장 뽑기 보장',
      description: '10장 뽑기 시 최소 1장의 Epic 이상 카드 보장',
      icon: '🎁'
    },
    {
      title: '천장 시스템 (Pity)',
      description: '100회 연속 뽑기 시 Legendary 카드 보장',
      icon: '⭐'
    },
    {
      title: '중복 보상',
      description: '중복 카드는 재화로 전환 가능',
      icon: '💎'
    }
  ];
</script>

{#if show}
  <div class="modal-overlay" on:click={close} role="dialog" aria-modal="true">
    <div class="modal-container" on:click|stopPropagation>
      <!-- Header -->
      <div class="modal-header">
        <h2>뽑기 확률 정보</h2>
        <button class="close-btn" on:click={close} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Probability Table -->
        <section class="section">
          <h3 class="section-title">등급별 확률</h3>
          <div class="probability-table">
            {#each probabilities as prob}
              <div class="probability-row" data-rarity={prob.rarity}>
                <div class="rarity-badge" style="background-color: {prob.color};">
                  <span class="rarity-name">{prob.korean}</span>
                  <span class="rarity-rate">{prob.rate}</span>
                </div>
                <div class="rarity-info">
                  <p class="rarity-description">{prob.description}</p>
                  <div class="rarity-examples">
                    {#each prob.examples as example}
                      <span class="example-tag">{example}</span>
                    {/each}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>

        <!-- Guarantee System -->
        <section class="section">
          <h3 class="section-title">보장 시스템</h3>
          <div class="guarantee-grid">
            {#each guarantees as guarantee}
              <div class="guarantee-card">
                <div class="guarantee-icon">{guarantee.icon}</div>
                <h4 class="guarantee-title">{guarantee.title}</h4>
                <p class="guarantee-description">{guarantee.description}</p>
              </div>
            {/each}
          </div>
        </section>

        <!-- Additional Info -->
        <section class="section">
          <h3 class="section-title">유의사항</h3>
          <ul class="info-list">
            <li>각 등급의 확률은 독립적으로 적용됩니다</li>
            <li>10장 뽑기는 10% 할인 혜택이 적용됩니다</li>
            <li>천장 카운터는 Legendary 획득 시 초기화됩니다</li>
            <li>모든 확률은 공정하게 검증되었습니다</li>
          </ul>
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
    max-width: 800px;
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

  .section {
    margin-bottom: 32px;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: white;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  }

  .probability-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .probability-row {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .probability-row:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  .rarity-badge {
    flex-shrink: 0;
    width: 120px;
    padding: 12px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .rarity-name {
    font-size: 16px;
    font-weight: 700;
    color: white;
  }

  .rarity-rate {
    font-size: 20px;
    font-weight: 800;
    color: white;
  }

  .rarity-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rarity-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .rarity-examples {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .example-tag {
    font-size: 12px;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    border-radius: 6px;
  }

  .guarantee-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .guarantee-card {
    padding: 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s;
  }

  .guarantee-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }

  .guarantee-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .guarantee-title {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 0 0 8px 0;
  }

  .guarantee-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.5;
  }

  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-list li {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    padding-left: 24px;
    position: relative;
  }

  .info-list li::before {
    content: '•';
    position: absolute;
    left: 8px;
    color: #667eea;
    font-size: 18px;
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

    .probability-row {
      flex-direction: column;
      gap: 12px;
    }

    .rarity-badge {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }

    .guarantee-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
