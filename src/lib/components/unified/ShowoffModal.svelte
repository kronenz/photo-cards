<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { currentUser, unifiedCards } from '$lib/stores/unified';
  import { shareCard } from '$lib/utils/social-actions';
  import { createFocusTrap, type FocusTrap } from '$lib/utils/focus-trap';
  import type { UnifiedCard, ShareCardData } from '$lib/types/unified';

  const dispatch = createEventDispatcher();

  export let show = false;

  let selectedCardId: string | undefined;
  let caption = '';
  let visibility: 'public' | 'fanclub' | 'followers' = 'public';
  let selectedFanclubId: string | undefined;
  let isSubmitting = false;
  let showSuccess = false;

  // Focus trap
  let modalContainer: HTMLDivElement;
  let focusTrap: FocusTrap | null = null;
  let previouslyFocusedElement: HTMLElement | null = null;

  // Get user's cards
  $: userCards = Array.from($unifiedCards.values()).filter(
    (card) => card.community?.creator === $currentUser?.id
  );

  function selectCard(cardId: string) {
    selectedCardId = cardId;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!selectedCardId || !caption.trim()) {
      return;
    }

    if (visibility === 'fanclub' && !selectedFanclubId) {
      alert('팬클럽을 선택해주세요');
      return;
    }

    isSubmitting = true;

    try {
      const shareData: ShareCardData = {
        cardId: selectedCardId,
        caption: caption.trim(),
        visibility,
        fanclubId: selectedFanclubId,
      };

      await shareCard(shareData);

      // Show success message
      showSuccess = true;
      setTimeout(() => {
        showSuccess = false;
        handleClose();
      }, 2000);

      dispatch('submit', { submitted: true });
    } catch (error) {
      console.error('Failed to share card:', error);
      alert('카드 공유에 실패했습니다. 다시 시도해주세요.');
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      show = false;
      selectedCardId = undefined;
      caption = '';
      visibility = 'public';
      selectedFanclubId = undefined;
      dispatch('close');
    }
  }

  // Focus trap management
  function initializeFocusTrap() {
    if (modalContainer && show) {
      previouslyFocusedElement = document.activeElement as HTMLElement;
      focusTrap = createFocusTrap(modalContainer, {
        returnFocusTo: previouslyFocusedElement,
        trapFocus: true,
        allowEscape: true,
        preventScroll: true,
        onEscape: handleClose,
      });
      focusTrap.activate();
    }
  }

  function cleanupFocusTrap() {
    if (focusTrap) {
      focusTrap.deactivate();
      focusTrap = null;
    }
  }

  // Reactive statement to handle focus trap when modal opens/closes
  $: if (show && modalContainer) {
    initializeFocusTrap();
  } else if (!show && focusTrap) {
    cleanupFocusTrap();
  }

  onDestroy(() => {
    cleanupFocusTrap();
  });
</script>

{#if show}
  <div class="modal-backdrop" on:click|self={handleClose} data-testid="showoff-modal">
    <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title" bind:this={modalContainer}>
      <div class="modal-header">
        <h2 id="modal-title">카드 자랑하기</h2>
        <button 
          class="close-btn" 
          on:click={handleClose} 
          disabled={isSubmitting}
          aria-label="모달 닫기"
        >×</button>
      </div>

      <div class="modal-body">
        {#if showSuccess}
          <div class="success-message" data-testid="showoff-success">
            <div class="success-icon">✅</div>
            <p>카드가 커뮤니티에 공유되었습니다!</p>
          </div>
        {:else}
          <!-- Card Selection -->
          <div class="form-group">
            <label>카드 선택</label>
            <div class="card-grid">
              {#each userCards as card (card.id)}
                <button
                  type="button"
                  class="card-item"
                  class:selected={selectedCardId === card.id}
                  data-testid="card-select-{card.id}"
                  on:click={() => selectCard(card.id)}
                >
                  <img
                    src={card.holographic.image}
                    alt={card.title}
                    class="card-thumbnail"
                  />
                  {#if selectedCardId === card.id}
                    <div class="selected-badge">✓</div>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <form on:submit={handleSubmit}>
            <div class="form-group">
              <label for="caption">설명</label>
              <textarea
                id="caption"
                data-testid="caption-input"
                bind:value={caption}
                placeholder="카드에 대한 설명을 입력하세요..."
                rows="4"
                maxlength="500"
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div class="form-group">
              <label>공개 범위</label>
              <div class="visibility-options">
                <label data-testid="visibility-public">
                  <input type="radio" bind:group={visibility} value="public" />
                  <span class="icon">🌍</span>
                  전체 공개
                </label>
                <label data-testid="visibility-fanclub">
                  <input type="radio" bind:group={visibility} value="fanclub" />
                  <span class="icon">⚾</span>
                  팬클럽
                </label>
                <label data-testid="visibility-followers">
                  <input type="radio" bind:group={visibility} value="followers" />
                  <span class="icon">👥</span>
                  팔로워
                </label>
              </div>
            </div>

            {#if visibility === 'fanclub'}
              <div class="form-group" data-testid="fanclub-selector">
                <label>팬클럽 선택</label>
                <div class="fanclub-options">
                  {#each $currentUser?.fanProfile?.joinedFanclubs || [] as fanclubId}
                    <button
                      type="button"
                      class="fanclub-option"
                      class:selected={selectedFanclubId === fanclubId}
                      data-testid="fanclub-{fanclubId}"
                      on:click={() => (selectedFanclubId = fanclubId)}
                    >
                      {fanclubId.replace('team-', '').toUpperCase()}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="actions">
              <button type="button" on:click={handleClose} disabled={isSubmitting}>취소</button>
              <button type="submit" data-testid="submit-showoff-btn" disabled={isSubmitting || !selectedCardId || !caption.trim()}>
                {isSubmitting ? '게시 중...' : '게시하기'}
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-container {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f3f4f6;
    cursor: pointer;
    font-size: 24px;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
  }

  .card-item {
    position: relative;
    aspect-ratio: 3 / 4;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    background: none;
    padding: 0;
  }

  .card-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-item.selected {
    border-color: var(--team-primary-color, #667eea);
  }

  .card-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .selected-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    background: var(--team-primary-color, #667eea);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-family: inherit;
    resize: vertical;
  }

  textarea:focus {
    outline: none;
    border-color: var(--team-primary-color, #667eea);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .visibility-options {
    display: flex;
    gap: 0.75rem;
  }

  .visibility-options label {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .visibility-options label:hover {
    border-color: var(--team-primary-color, #667eea);
  }

  .visibility-options label:has(input:checked) {
    border-color: var(--team-primary-color, #667eea);
    background: rgba(102, 126, 234, 0.05);
  }

  .visibility-options input[type="radio"] {
    display: none;
  }

  .visibility-options .icon {
    font-size: 1.5rem;
  }

  .fanclub-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .fanclub-option {
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .fanclub-option:hover {
    border-color: var(--team-primary-color, #667eea);
  }

  .fanclub-option.selected {
    border-color: var(--team-primary-color, #667eea);
    background: var(--team-primary-color, #667eea);
    color: white;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .actions button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .actions button[type="button"] {
    background: white;
    border: 1px solid #e5e7eb;
  }

  .actions button[type="button"]:hover {
    background: #f9fafb;
  }

  .actions button[type="submit"] {
    background: var(--team-primary-color, #667eea);
    border: none;
    color: white;
  }

  .actions button[type="submit"]:hover:not(:disabled) {
    opacity: 0.9;
  }

  .actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .success-message {
    padding: 4rem 2rem;
    text-align: center;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .success-message p {
    font-size: 1.25rem;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .visibility-options {
      flex-direction: column;
    }

    .card-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
  }
</style>
