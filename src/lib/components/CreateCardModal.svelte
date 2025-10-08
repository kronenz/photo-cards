<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { createFocusTrap, type FocusTrap } from '$lib/utils/focus-trap';
  import UnifiedCard from './v2/UnifiedCard.svelte';

  export let show = false;

  const dispatch = createEventDispatcher();

  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
  type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

  // 카드 정보
  let playerName = '';
  let position = '';
  let number = '';
  let selectedTeam: TeamId = 'lg';
  let selectedRarity: RarityType = 'rare';

  // 이미지
  let uploadedImage: string | null = null;
  let imageFile: File | null = null;

  // 홀로그래픽 설정
  let effectType: 'rainbow' | 'cosmic' | 'aurora' | 'neon' = 'rainbow';
  let effectIntensity = 50;

  // 추가 정보
  let description = '';
  let tags: string[] = [];
  let newTag = '';

  // 공개 설정
  let visibility: 'public' | 'private' | 'followers' = 'public';
  let allowCollect = true;
  let autoPost = false;

  // Focus trap
  let modalContainer: HTMLDivElement;
  let focusTrap: FocusTrap | null = null;
  let previouslyFocusedElement: HTMLElement | null = null;

  // KBO 팀 목록
  const teams = [
    { id: 'lg', name: 'LG 트윈스' },
    { id: 'doosan', name: '두산 베어스' },
    { id: 'kt', name: 'KT 위즈' },
    { id: 'samsung', name: '삼성 라이온즈' },
    { id: 'nc', name: 'NC 다이노스' },
    { id: 'kia', name: 'KIA 타이거즈' },
    { id: 'lotte', name: '롯데 자이언츠' },
    { id: 'ssg', name: 'SSG 랜더스' },
    { id: 'hanwha', name: '한화 이글스' },
    { id: 'kiwoom', name: '키움 히어로즈' }
  ];

  // 파일 업로드 처리
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      handleFile(file);
    }
  }

  function handleFile(file: File) {
    // 파일 크기 확인 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    imageFile = file;

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // 드래그 앤 드롭
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // 태그 추가
  function addTag() {
    if (newTag.trim() && !tags.includes(`#${newTag.trim()}`)) {
      tags = [...tags, `#${newTag.trim()}`];
      newTag = '';
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter(t => t !== tag);
  }

  // 제출
  function handleSubmit() {
    // 필수 입력 검증
    if (!uploadedImage) {
      alert('이미지를 업로드해주세요.');
      return;
    }
    if (!playerName.trim()) {
      alert('선수 이름을 입력해주세요.');
      return;
    }

    const cardData = {
      image: uploadedImage,
      title: playerName,
      subtitle: position || '선수',
      number: number || '0',
      team: selectedTeam,
      rarity: selectedRarity,
      effect: {
        type: effectType,
        intensity: effectIntensity
      },
      description,
      tags,
      visibility,
      allowCollect,
      autoPost
    };

    dispatch('submit', cardData);
    closeModal();
  }

  function closeModal() {
    show = false;
    resetForm();
  }

  function resetForm() {
    playerName = '';
    position = '';
    number = '';
    selectedTeam = 'lg';
    selectedRarity = 'rare';
    uploadedImage = null;
    imageFile = null;
    effectType = 'rainbow';
    effectIntensity = 50;
    description = '';
    tags = [];
    newTag = '';
    visibility = 'public';
    allowCollect = true;
    autoPost = false;
  }

  // ESC 키로 닫기
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
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
        onEscape: closeModal,
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

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-container" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="modal-title" bind:this={modalContainer}>
      <!-- Header -->
      <div class="modal-header">
        <h2 id="modal-title">🎨 나만의 카드 만들기</h2>
        <button 
          class="close-btn" 
          on:click={closeModal}
          aria-label="모달 닫기"
        >✕</button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Step 1: 이미지 업로드 -->
        <section class="step-section">
          <h3 class="step-title">📸 1단계: 이미지 업로드</h3>

          {#if !uploadedImage}
            <div
              class="upload-area"
              on:drop={handleDrop}
              on:dragover={handleDragOver}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                on:change={handleFileSelect}
                style="display: none;"
              />
              <label for="image-upload" class="upload-label">
                <div class="upload-icon">📤</div>
                <p class="upload-text">이미지 업로드</p>
                <p class="upload-hint">또는 드래그 앤 드롭</p>
              </label>
            </div>
            <p class="upload-info">지원 형식: JPG, PNG, WEBP (최대 5MB)</p>
          {:else}
            <div class="uploaded-preview">
              <img src={uploadedImage} alt="업로드된 이미지" />
              <button class="change-btn" on:click={() => uploadedImage = null}>
                📷 이미지 변경
              </button>
            </div>
          {/if}
        </section>

        <!-- Step 2: 카드 정보 입력 -->
        <section class="step-section">
          <h3 class="step-title">✏️ 2단계: 카드 정보 입력</h3>

          <div class="form-grid">
            <div class="form-group">
              <label for="player-name">선수 이름 *</label>
              <input
                id="player-name"
                type="text"
                placeholder="예: 김도영"
                bind:value={playerName}
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="position">포지션</label>
              <input
                id="position"
                type="text"
                placeholder="예: 내야수"
                bind:value={position}
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="number">등번호</label>
              <input
                id="number"
                type="text"
                placeholder="예: 5"
                bind:value={number}
                class="form-input short"
              />
            </div>

            <div class="form-group">
              <label for="team">소속 팀 *</label>
              <select id="team" bind:value={selectedTeam} class="form-select">
                {#each teams as team}
                  <option value={team.id}>{team.name}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>희귀도 *</label>
            <div class="rarity-options">
              <label class="rarity-label">
                <input type="radio" name="rarity" value="common" bind:group={selectedRarity} />
                <span>Common</span>
              </label>
              <label class="rarity-label">
                <input type="radio" name="rarity" value="rare" bind:group={selectedRarity} />
                <span>Rare</span>
              </label>
              <label class="rarity-label">
                <input type="radio" name="rarity" value="epic" bind:group={selectedRarity} />
                <span>Epic</span>
              </label>
              <label class="rarity-label">
                <input type="radio" name="rarity" value="legendary" bind:group={selectedRarity} />
                <span>Legendary</span>
              </label>
            </div>
          </div>
        </section>

        {#if uploadedImage && playerName}
          <!-- Step 3: 홀로그래픽 효과 설정 -->
          <section class="step-section">
            <h3 class="step-title">🌈 3단계: 홀로그래픽 효과 설정</h3>

            <div class="preview-container">
              <div class="preview-card">
                <UnifiedCard
                  title={playerName}
                  subtitle={position || '선수'}
                  number={number || '0'}
                  team={selectedTeam}
                  rarity={selectedRarity}
                  image={uploadedImage}
                  size="large"
                />
              </div>
            </div>

            <div class="effect-controls">
              <div class="form-group">
                <label for="effect-type">효과 타입</label>
                <select id="effect-type" bind:value={effectType} class="form-select">
                  <optgroup label="기본 효과">
                    <option value="basic">Basic - 기본</option>
                    <option value="holo">Holo - 홀로그래픽</option>
                    <option value="reverse-holo">Reverse Holo - 리버스 홀로</option>
                  </optgroup>
                  <optgroup label="프리미엄 효과">
                    <option value="galaxy-holo">Galaxy Holo - 갤럭시</option>
                    <option value="cosmos-holo">Cosmos Holo - 코스믹</option>
                    <option value="aurora">Aurora - 오로라</option>
                    <option value="neon">Neon - 네온</option>
                  </optgroup>
                  <optgroup label="레어 효과">
                    <option value="v-regular">V - V 카드</option>
                    <option value="v-full-art">V Full Art - V 풀아트</option>
                    <option value="vmax">VMAX - VMAX</option>
                    <option value="vstar">VSTAR - VSTAR</option>
                  </optgroup>
                  <optgroup label="울트라 레어">
                    <option value="rainbow">Rainbow - 레인보우</option>
                    <option value="rainbow-alt">Rainbow Alt - 레인보우 얼터</option>
                    <option value="secret">Gold Secret - 골드 시크릿</option>
                    <option value="radiant">Radiant - 래디언트</option>
                    <option value="amazing-rare">Amazing Rare - 어메이징</option>
                  </optgroup>
                  <optgroup label="트레이너 갤러리">
                    <option value="trainer-gallery-holo">Trainer Gallery Holo</option>
                    <option value="trainer-gallery-v">Trainer Gallery V</option>
                    <option value="trainer-full-art">Trainer Full Art</option>
                  </optgroup>
                </select>
              </div>

              <div class="intensity-control">
                <label for="intensity">효과 강도:</label>
                <input
                  id="intensity"
                  type="range"
                  min="0"
                  max="100"
                  bind:value={effectIntensity}
                  class="intensity-slider"
                />
                <span class="intensity-value">{effectIntensity}%</span>
              </div>
            </div>
          </section>

          <!-- Step 4: 추가 정보 -->
          <section class="step-section">
            <h3 class="step-title">📝 4단계: 추가 정보 (선택사항)</h3>

            <div class="form-group">
              <label for="description">설명</label>
              <textarea
                id="description"
                placeholder="카드에 대한 설명을 입력하세요..."
                bind:value={description}
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label>태그</label>
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
                  placeholder="태그 입력..."
                  bind:value={newTag}
                  on:keydown={(e) => e.key === 'Enter' && addTag()}
                  class="tag-input"
                />
                <button class="tag-add-btn" on:click={addTag}>+ 추가</button>
              </div>
            </div>
          </section>

          <!-- Step 5: 공개 설정 -->
          <section class="step-section">
            <h3 class="step-title">🌐 5단계: 공개 설정</h3>

            <div class="visibility-options">
              <label class="radio-label">
                <input type="radio" name="visibility" value="public" bind:group={visibility} />
                <span>커뮤니티에 공개 (모두가 볼 수 있음)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="visibility" value="private" bind:group={visibility} />
                <span>나만 보기 (내 컬렉션에만 저장)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="visibility" value="followers" bind:group={visibility} />
                <span>팔로워에게만 공개</span>
              </label>
            </div>

            <div class="checkbox-options">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={allowCollect} />
                <span>다른 사용자가 이 카드를 컬렉션에 추가할 수 있도록 허용</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={autoPost} />
                <span>커뮤니티 피드에 자동으로 게시</span>
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
          disabled={!uploadedImage || !playerName.trim()}
          on:click={handleSubmit}
        >
          ✨ 카드 만들기 🎉
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Modal 기본 스타일 (ShowoffModal과 유사) */
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
  }

  .step-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: white;
  }

  /* 이미지 업로드 */
  .upload-area {
    border: 2px dashed rgba(0, 240, 255, 0.3);
    border-radius: 1rem;
    padding: 3rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .upload-area:hover {
    border-color: rgba(0, 240, 255, 0.6);
    background: rgba(0, 240, 255, 0.05);
  }

  .upload-label {
    cursor: pointer;
    display: block;
  }

  .upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .upload-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: white;
    margin: 0 0 0.5rem 0;
  }

  .upload-hint {
    font-size: 0.875rem;
    color: #b4b4be;
    margin: 0;
  }

  .upload-info {
    text-align: center;
    font-size: 0.875rem;
    color: #777785;
    margin-top: 1rem;
  }

  .uploaded-preview {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
  }

  .uploaded-preview img {
    width: 100%;
    border-radius: 1rem;
    display: block;
  }

  .change-btn {
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 240, 255, 0.5);
    background: rgba(0, 240, 255, 0.1);
    color: #00f0ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .change-btn:hover {
    background: rgba(0, 240, 255, 0.2);
  }

  /* 폼 스타일 */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #b4b4be;
    margin-bottom: 0.5rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.875rem;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #00f0ff;
    background: rgba(0, 240, 255, 0.05);
  }

  .form-input.short {
    max-width: 100px;
  }

  .form-textarea {
    resize: vertical;
    font-family: inherit;
  }

  /* 희귀도 선택 */
  .rarity-options {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .rarity-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #b4b4be;
    font-size: 0.875rem;
  }

  .rarity-label input[type="radio"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
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

  .effect-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  /* 태그 (ShowoffModal과 동일) */
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
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .radio-label,
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    color: #b4b4be;
    font-size: 0.875rem;
  }

  .radio-label input[type="radio"],
  .checkbox-label input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .checkbox-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    .form-grid {
      grid-template-columns: 1fr;
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
