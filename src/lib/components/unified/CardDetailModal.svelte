<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { saveAsTemplate } from '$lib/utils/social-actions';
  import type { UnifiedCard } from '$lib/types/unified';
  import UnifiedHolographicCard from './UnifiedHolographicCard.svelte';

  const dispatch = createEventDispatcher();

  // Props
  export let isOpen = false;
  export let card: UnifiedCard | null = null;

  let isSavingTemplate = false;
  let showTemplateSuccess = false;

  async function handleSaveAsTemplate() {
    if (!card) return;

    isSavingTemplate = true;

    try {
      await saveAsTemplate(card.id);

      // Show success message
      showTemplateSuccess = true;
      setTimeout(() => {
        showTemplateSuccess = false;
      }, 3000);

      dispatch('template-saved');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('템플릿 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      isSavingTemplate = false;
    }
  }

  function close() {
    isOpen = false;
    card = null;
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && card}
  <div
    class="modal-overlay"
    on:click={close}
    data-testid="card-detail-modal"
  >
    <div class="modal-content" on:click|stopPropagation>
      <!-- Close Button -->
      <button class="close-btn" on:click={close} aria-label="닫기">
        ✕
      </button>

      <div class="content-wrapper">
        <!-- Card Preview -->
        <div class="card-preview">
          <UnifiedHolographicCard {card} context="detail" />
        </div>

        <!-- Card Info -->
        <div class="card-info">
          <h2 class="card-title">{card.title}</h2>

          <!-- Metadata -->
          <div class="metadata">
            <div class="metadata-item">
              <span class="label">레어도</span>
              <span class="value rarity-{card.photocard.rarity}">
                {card.photocard.rarity.toUpperCase()}
              </span>
            </div>

            <div class="metadata-item">
              <span class="label">효과</span>
              <span class="value">{card.holographic.effect}</span>
            </div>

            <div class="metadata-item">
              <span class="label">강도</span>
              <span class="value">{card.holographic.intensity}%</span>
            </div>
          </div>

          <!-- Stats -->
          {#if card.community}
            <div class="stats">
              <div class="stat">
                <span class="icon">❤️</span>
                <span class="count">{card.community.metadata.likes}</span>
              </div>
              <div class="stat">
                <span class="icon">⬇️</span>
                <span class="count">{card.community.metadata.downloads}</span>
              </div>
              <div class="stat">
                <span class="icon">⭐</span>
                <span class="count">
                  {card.community.metadata.rating.toFixed(1)}
                </span>
              </div>
            </div>
          {/if}

          <!-- Tags -->
          {#if card.community?.tags && card.community.tags.length > 0}
            <div class="tags">
              {#each card.community.tags as tag}
                <span class="tag">#{tag}</span>
              {/each}
            </div>
          {/if}

          <!-- Actions -->
          <div class="actions">
            <button
              class="action-btn save-template-btn"
              data-testid="save-template-btn"
              disabled={isSavingTemplate}
              on:click={handleSaveAsTemplate}
            >
              {isSavingTemplate ? '저장 중...' : '템플릿으로 저장'}
            </button>

            <button class="action-btn download-btn">
              다운로드
            </button>
          </div>

          <!-- Success Message -->
          {#if showTemplateSuccess}
            <div class="success-message" data-testid="template-save-success">
              ✅ 템플릿으로 저장되었습니다
            </div>
          {/if}

          <!-- Card Stats -->
          {#if card.photocard.stats}
            <div class="card-stats">
              <h3>통계</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">조회수</span>
                  <span class="stat-value">
                    {card.photocard.stats.totalViews.toLocaleString()}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">컬렉터</span>
                  <span class="stat-value">
                    {card.photocard.stats.uniqueCollectors.toLocaleString()}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">완성도</span>
                  <span class="stat-value">
                    {card.photocard.stats.completionRate}%
                  </span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    transform: rotate(90deg);
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
  }

  .card-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-title {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
    color: #111827;
  }

  .metadata {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .metadata-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .metadata-item .label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .metadata-item .value {
    font-size: 0.875rem;
    color: #111827;
    font-weight: 600;
  }

  .metadata-item .value.rarity-common {
    color: #6b7280;
  }

  .metadata-item .value.rarity-rare {
    color: #3b82f6;
  }

  .metadata-item .value.rarity-epic {
    color: #8b5cf6;
  }

  .metadata-item .value.rarity-legendary {
    color: #f59e0b;
  }

  .stats {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stat .icon {
    font-size: 1.25rem;
  }

  .stat .count {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--team-primary-color, #667eea);
    color: white;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .action-btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-template-btn {
    background: var(--team-primary-color, #667eea);
    border: none;
    color: white;
  }

  .save-template-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .save-template-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .download-btn {
    background: white;
    border: 2px solid var(--team-primary-color, #667eea);
    color: var(--team-primary-color, #667eea);
  }

  .download-btn:hover {
    background: var(--team-primary-color, #667eea);
    color: white;
  }

  .success-message {
    padding: 1rem;
    background: #d1fae5;
    color: #065f46;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-stats {
    margin-top: 1rem;
  }

  .card-stats h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    text-align: center;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  @media (max-width: 768px) {
    .content-wrapper {
      grid-template-columns: 1fr;
    }

    .card-preview {
      max-width: 300px;
      margin: 0 auto;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
