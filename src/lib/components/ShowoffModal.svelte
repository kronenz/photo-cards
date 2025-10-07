<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import UnifiedCard from './v2/UnifiedCard.svelte';

  export let show = false;
  export let userCards: any[] = [];

  const dispatch = createEventDispatcher();

  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
  type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

  // 모달 상태
  let selectedCard: any = null;
  let message = '';
  let tags: string[] = [];
  let newTag = '';
  let holographicIntensity = 50;
  let visibility: 'public' | 'followers' | 'private' = 'public';
  let showInFeed = true;
  let shareToFanclub = true;
  let muteNotifications = false;

  // 필터 상태
  let selectedRarity: RarityType | 'all' = 'all';
  let searchQuery = '';

  // 카드 필터링
  $: filteredCards = userCards.filter(card => {
    const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
    const matchesSearch = searchQuery === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRarity && matchesSearch;
  });

  // 자동 추천 태그
  $: suggestedTags = selectedCard ? [
    `#${selectedCard.rarity}`,
    `#${selectedCard.team}`,
    `#${selectedCard.title}`,
  ] : [];

  function selectCard(card: any) {
    selectedCard = card;
    // 자동으로 추천 태그 추가
    tags = [...suggestedTags];
  }

  function addTag() {
    if (newTag.trim() && !tags.includes(`#${newTag.trim()}`)) {
      tags = [...tags, `#${newTag.trim()}`];
      newTag = '';
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter(t => t !== tag);
  }

  function handleSubmit() {
    if (!selectedCard) return;

    const postData = {
      card: selectedCard,
      message,
      tags,
      holographicIntensity,
      visibility,
      showInFeed,
      shareToFanclub,
      muteNotifications
    };

    dispatch('submit', postData);
    closeModal();
  }

  function closeModal() {
    show = false;
    resetForm();
  }

  function resetForm() {
    selectedCard = null;
    message = '';
    tags = [];
    newTag = '';
    holographicIntensity = 50;
    visibility = 'public';
    showInFeed = true;
    shareToFanclub = true;
    muteNotifications = false;
    selectedRarity = 'all';
    searchQuery = '';
  }

  // ESC 키로 모달 닫기
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-container" on:click|stopPropagation>
      <!-- Header -->
      <div class="modal-header">
        <h2>🎴 카드 자랑하기</h2>
        <button class="close-btn" on:click={closeModal}>✕</button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Step 1: 카드 선택 -->
        <section class="step-section">
          <h3 class="step-title">📂 1단계: 카드 선택</h3>

          <div class="filter-bar">
            <div class="filter-buttons">
              <button
                class="filter-btn"
                class:active={selectedRarity === 'all'}
                on:click={() => selectedRarity = 'all'}
              >
                전체
              </button>
              <button
                class="filter-btn"
                class:active={selectedRarity === 'legendary'}
                on:click={() => selectedRarity = 'legendary'}
              >
                레전더리
              </button>
              <button
                class="filter-btn"
                class:active={selectedRarity === 'epic'}
                on:click={() => selectedRarity = 'epic'}
              >
                에픽
              </button>
              <button
                class="filter-btn"
                class:active={selectedRarity === 'rare'}
                on:click={() => selectedRarity = 'rare'}
              >
                레어
              </button>
              <button
                class="filter-btn"
                class:active={selectedRarity === 'common'}
                on:click={() => selectedRarity = 'common'}
              >
                커먼
              </button>
            </div>
            <input
              type="text"
              class="search-input"
              placeholder="🔍 카드 검색..."
              bind:value={searchQuery}
            />
          </div>

          <div class="cards-grid">
            {#each filteredCards as card}
              <button
                class="card-item"
                class:selected={selectedCard === card}
                on:click={() => selectCard(card)}
              >
                <UnifiedCard
                  title={card.title}
                  subtitle={card.subtitle}
                  number={card.number}
                  team={card.team}
                  rarity={card.rarity}
                  image={card.image}
                  size="small"
                />
                {#if selectedCard === card}
                  <div class="selected-overlay">✓ 선택됨</div>
                {/if}
              </button>
            {/each}
          </div>
        </section>

        {#if selectedCard}
          <!-- Step 2: 홀로그래픽 프리뷰 -->
          <section class="step-section">
            <h3 class="step-title">✨ 2단계: 홀로그래픽 프리뷰</h3>

            <div class="preview-container">
              <div class="preview-card">
                <UnifiedCard
                  title={selectedCard.title}
                  subtitle={selectedCard.subtitle}
                  number={selectedCard.number}
                  team={selectedCard.team}
                  rarity={selectedCard.rarity}
                  image={selectedCard.image}
                  size="large"
                />
              </div>
            </div>

            <div class="intensity-control">
              <label for="intensity">효과 강도:</label>
              <input
                id="intensity"
                type="range"
                min="0"
                max="100"
                bind:value={holographicIntensity}
                class="intensity-slider"
              />
              <span class="intensity-value">{holographicIntensity}%</span>
            </div>
          </section>

          <!-- Step 3: 메시지 작성 -->
          <section class="step-section">
            <h3 class="step-title">💬 3단계: 메시지 작성 (선택사항)</h3>

            <textarea
              class="message-input"
              placeholder="카드 획득 스토리나 자랑하고 싶은 내용을 작성해주세요..."
              bind:value={message}
              rows="4"
            ></textarea>

            <p class="tip">💡 팁: 획득 스토리를 공유하면 더 많은 반응을 받을 수 있어요!</p>
          </section>

          <!-- Step 4: 태그 추가 -->
          <section class="step-section">
            <h3 class="step-title">🏷️ 4단계: 태그 추가 (선택사항)</h3>

            <div class="tags-container">
              {#each tags as tag}
                <span class="tag">
                  {tag}
                  <button class="tag-remove" on:click={() => removeTag(tag)}>×</button>
                </span>
              {/each}
            </div>

            <div class="tag-input-container">
              <input
                type="text"
                class="tag-input"
                placeholder="태그 입력..."
                bind:value={newTag}
                on:keydown={(e) => e.key === 'Enter' && addTag()}
              />
              <button class="tag-add-btn" on:click={addTag}>+ 추가</button>
            </div>
          </section>

          <!-- Step 5: 공개 설정 -->
          <section class="step-section">
            <h3 class="step-title">⚙️ 5단계: 공개 설정</h3>

            <div class="visibility-options">
              <label class="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  bind:group={visibility}
                />
                <span>전체 공개</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  value="followers"
                  bind:group={visibility}
                />
                <span>팔로워만</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  bind:group={visibility}
                />
                <span>나만 보기</span>
              </label>
            </div>

            <div class="checkbox-options">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={showInFeed} />
                <span>커뮤니티 피드에 표시</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={shareToFanclub} />
                <span>팀 팬클럽에 공유</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={muteNotifications} />
                <span>알림 받지 않기</span>
              </label>
            </div>
          </section>
        {/if}
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-cancel" on:click={closeModal}>❌ 취소</button>
        <button
          class="btn-submit"
          disabled={!selectedCard}
          on:click={handleSubmit}
        >
          ✨ 자랑하기 🎉
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
    overflow-y: auto;
  }

  .modal-container {
    background: linear-gradient(135deg, #1a1a27 0%, #12121a 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .close-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  .modal-content {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }

  .step-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .step-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .step-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: white;
  }

  /* 필터 바 */
  .filter-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: #b4b4be;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .filter-btn:hover {
    border-color: rgba(0, 240, 255, 0.5);
    background: rgba(0, 240, 255, 0.1);
    color: #00f0ff;
  }

  .filter-btn.active {
    border-color: #00f0ff;
    background: rgba(0, 240, 255, 0.2);
    color: #00f0ff;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.875rem;
  }

  .search-input::placeholder {
    color: #777785;
  }

  .search-input:focus {
    outline: none;
    border-color: #00f0ff;
    background: rgba(0, 240, 255, 0.05);
  }

  /* 카드 그리드 */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .card-item {
    position: relative;
    border: 2px solid transparent;
    border-radius: 0.75rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .card-item:hover {
    border-color: rgba(0, 240, 255, 0.5);
    transform: translateY(-4px);
  }

  .card-item.selected {
    border-color: #00f0ff;
    background: rgba(0, 240, 255, 0.1);
  }

  .selected-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 240, 255, 0.2);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 1rem;
  }

  /* 프리뷰 */
  .preview-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .preview-card {
    width: 300px;
  }

  .intensity-control {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
  }

  .intensity-control label {
    font-size: 0.875rem;
    color: #b4b4be;
    white-space: nowrap;
  }

  .intensity-slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    -webkit-appearance: none;
  }

  .intensity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    cursor: pointer;
  }

  .intensity-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #00f0ff;
    min-width: 40px;
    text-align: right;
  }

  /* 메시지 입력 */
  .message-input {
    width: 100%;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;
  }

  .message-input::placeholder {
    color: #777785;
  }

  .message-input:focus {
    outline: none;
    border-color: #00f0ff;
    background: rgba(0, 240, 255, 0.05);
  }

  .tip {
    margin: 1rem 0 0 0;
    font-size: 0.875rem;
    color: #b4b4be;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    border-left: 3px solid #00f0ff;
  }

  /* 태그 */
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 240, 255, 0.2);
    border: 1px solid rgba(0, 240, 255, 0.5);
    border-radius: 1rem;
    color: #00f0ff;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .tag-remove {
    background: none;
    border: none;
    color: #00f0ff;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .tag-remove:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .tag-input-container {
    display: flex;
    gap: 0.5rem;
  }

  .tag-input {
    flex: 1;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.875rem;
  }

  .tag-input:focus {
    outline: none;
    border-color: #00f0ff;
  }

  .tag-add-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 240, 255, 0.5);
    background: rgba(0, 240, 255, 0.1);
    color: #00f0ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tag-add-btn:hover {
    background: rgba(0, 240, 255, 0.2);
  }

  /* 공개 설정 */
  .visibility-options {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #b4b4be;
    font-size: 0.875rem;
  }

  .radio-label input[type="radio"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .checkbox-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    color: #b4b4be;
    font-size: 0.875rem;
  }

  .checkbox-label input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    gap: 1rem;
  }

  .btn-cancel,
  .btn-submit {
    padding: 1rem 2rem;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-cancel {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-submit {
    border: none;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    color: white;
  }

  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.4);
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 1rem;
    }

    .modal-container {
      max-height: 95vh;
    }

    .modal-header,
    .modal-content,
    .modal-footer {
      padding: 1.5rem;
    }

    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .visibility-options {
      flex-direction: column;
      gap: 1rem;
    }

    .modal-footer {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
      width: 100%;
    }
  }
</style>
