<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
  import UploadProgress from '$lib/components/UploadProgress.svelte';
  import {
    uploadCardWithPresign,
    validateCardImage,
    type CardData,
    type CardUploadProgress
  } from '$lib/services/uploadService';
  import type { Team, Rarity } from '$lib/types/models';

  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
  type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

  // 진행 단계
  let currentStep = 1;
  const totalSteps = 4;

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

  // 업로드 상태
  let uploadProgress: CardUploadProgress = { status: 'idle', progress: 0, message: '' };
  let isSubmitting = false;
  let submitError = '';

  // 팀 목록
  const teams = [
    { id: 'lg', name: 'LG 트윈스', color: '#C30452' },
    { id: 'doosan', name: '두산 베어스', color: '#131230' },
    { id: 'kt', name: 'KT 위즈', color: '#000000' },
    { id: 'samsung', name: '삼성 라이온즈', color: '#074CA1' },
    { id: 'nc', name: 'NC 다이노스', color: '#1D467F' },
    { id: 'kia', name: 'KIA 타이거즈', color: '#EA0029' },
    { id: 'lotte', name: '롯데 자이언츠', color: '#041E42' },
    { id: 'ssg', name: 'SSG 랜더스', color: '#CE0E2D' },
    { id: 'hanwha', name: '한화 이글스', color: '#FF6600' },
    { id: 'kiwoom', name: '키움 히어로즈', color: '#570514' }
  ];

  // TeamId와 Team 타입은 동일한 값을 사용 (lowercase)
  // RarityType과 Rarity 타입도 동일한 값을 사용

  // 파일 업로드 처리
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      handleFile(input.files[0]);
    }
  }

  function handleFile(file: File) {
    if (!browser) return;

    // 파일 검증
    const validation = validateCardImage(file);
    if (!validation.valid) {
      submitError = validation.error || '파일 검증에 실패했습니다.';
      return;
    }

    submitError = '';
    imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage = e.target?.result as string;
      currentStep = 2;
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

  // 태그 관리
  function addTag() {
    if (newTag.trim() && !tags.includes(`#${newTag.trim()}`)) {
      tags = [...tags, `#${newTag.trim()}`];
      newTag = '';
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter(t => t !== tag);
  }

  // 단계 이동
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  // 제출
  async function handleSubmit() {
    if (!imageFile) {
      submitError = '이미지를 업로드해주세요.';
      return;
    }
    if (!playerName.trim()) {
      submitError = '선수 이름을 입력해주세요.';
      return;
    }

    submitError = '';
    isSubmitting = true;

    // CardData 구성 (TeamId와 Team 타입은 동일)
    const cardData: CardData = {
      title: playerName,
      subtitle: position || '선수',
      team: selectedTeam,
      rarity: selectedRarity,
      number: number || undefined,
      is_shared: visibility === 'public'
    };

    try {
      const result = await uploadCardWithPresign(
        imageFile,
        cardData,
        (progress) => {
          uploadProgress = progress;
        }
      );

      if (result.success && result.card) {
        // 성공 시 컬렉션 페이지로 이동
        setTimeout(() => {
          goto('/collections');
        }, 1500);
      } else {
        submitError = result.error || '카드 생성에 실패했습니다.';
        uploadProgress = { status: 'error', progress: 0, message: submitError };
      }
    } catch (err: any) {
      submitError = err.message || '알 수 없는 오류가 발생했습니다.';
      uploadProgress = { status: 'error', progress: 0, message: submitError };
    } finally {
      isSubmitting = false;
    }
  }

  // 업로드 상태 리셋
  function resetUpload() {
    uploadProgress = { status: 'idle', progress: 0, message: '' };
    submitError = '';
  }

  // 단계별 유효성 검사
  $: canProceed = {
    1: uploadedImage !== null,
    2: playerName.trim().length > 0,
    3: true,
    4: true
  };

  // 제출 버튼 비활성화 조건
  $: isSubmitDisabled = isSubmitting || uploadProgress.status === 'uploading' || uploadProgress.status === 'processing';
</script>

<svelte:head>
  <title>카드 제작 - Baseball 홀로그래픽 카드</title>
  <meta name="description" content="나만의 홀로그래픽 야구 카드를 제작하세요" />
</svelte:head>

<div class="create-page">
  <div class="create-container">
    <header class="page-header">
      <h1 class="page-title">🎨 나만의 카드 만들기</h1>
      <p class="page-subtitle">프리미엄 홀로그래픽 카드를 단계별로 제작해보세요</p>
    </header>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-steps">
        {#each Array(totalSteps) as _, i}
          <div class="progress-step" class:active={currentStep === i + 1} class:completed={currentStep > i + 1}>
            <div class="step-number">{i + 1}</div>
            <div class="step-label">
              {#if i === 0}이미지 업로드
              {:else if i === 1}카드 정보
              {:else if i === 2}효과 설정
              {:else}최종 확인{/if}
            </div>
          </div>
          {#if i < totalSteps - 1}
            <div class="step-connector" class:completed={currentStep > i + 1}></div>
          {/if}
        {/each}
      </div>
    </div>

    <div class="create-layout">
      <!-- Left: Form -->
      <div class="form-section">
        <!-- Step 1 -->
        {#if currentStep === 1}
          <section class="step-content">
            <h2 class="step-title">📸 이미지 업로드</h2>
            {#if !uploadedImage}
              <div class="upload-area" on:drop={handleDrop} on:dragover={handleDragOver}>
                <input type="file" id="image-upload" accept="image/*" on:change={handleFileSelect} style="display: none;" />
                <label for="image-upload" class="upload-label">
                  <div class="upload-icon">📤</div>
                  <p class="upload-text">클릭하여 이미지 선택</p>
                  <p class="upload-hint">또는 드래그 앤 드롭</p>
                  <p class="upload-info">JPG, PNG, WEBP (최대 10MB)</p>
                </label>
              </div>
            {:else}
              <div class="uploaded-preview">
                <img src={uploadedImage} alt="업로드된 이미지" />
                <button class="change-btn" on:click={() => { uploadedImage = null; currentStep = 1; }}>
                  📷 이미지 변경
                </button>
              </div>
            {/if}
          </section>
        {/if}

        <!-- Step 2 -->
        {#if currentStep === 2}
          <section class="step-content">
            <h2 class="step-title">✏️ 카드 정보 입력</h2>
            <div class="form-group">
              <label for="player-name">선수 이름 *</label>
              <input id="player-name" type="text" placeholder="예: 김도영" bind:value={playerName} class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="position">포지션</label>
                <input id="position" type="text" placeholder="예: 내야수" bind:value={position} class="form-input" />
              </div>
              <div class="form-group">
                <label for="number">등번호</label>
                <input id="number" type="text" placeholder="예: 5" bind:value={number} class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label for="team">소속 팀 *</label>
              <select id="team" bind:value={selectedTeam} class="form-select">
                {#each teams as team}
                  <option value={team.id}>{team.name}</option>
                {/each}
              </select>
            </div>
            <div class="form-group">
              <label>희귀도 *</label>
              <div class="rarity-grid">
                {#each ['common', 'rare', 'epic', 'legendary'] as rarity}
                  <label class="rarity-option" class:selected={selectedRarity === rarity}>
                    <input type="radio" name="rarity" value={rarity} bind:group={selectedRarity} />
                    <span class="rarity-badge rarity-{rarity}">
                      {rarity === 'common' ? 'Common' : rarity === 'rare' ? 'Rare' : rarity === 'epic' ? 'Epic' : 'Legendary'}
                    </span>
                  </label>
                {/each}
              </div>
            </div>
          </section>
        {/if}

        <!-- Step 3 -->
        {#if currentStep === 3}
          <section class="step-content">
            <h2 class="step-title">🌈 홀로그래픽 효과 설정</h2>
            <div class="form-group">
              <label>효과 타입</label>
              <div class="effect-grid">
                {#each ['rainbow', 'cosmic', 'aurora', 'neon'] as effect}
                  <label class="effect-option" class:selected={effectType === effect}>
                    <input type="radio" name="effect" value={effect} bind:group={effectType} />
                    <span class="effect-name">
                      {effect === 'rainbow' ? '🌈 Rainbow' : effect === 'cosmic' ? '🌌 Cosmic' : effect === 'aurora' ? '🌠 Aurora' : '💫 Neon'}
                    </span>
                  </label>
                {/each}
              </div>
            </div>
            <div class="form-group">
              <label for="intensity">효과 강도: {effectIntensity}%</label>
              <input id="intensity" type="range" min="0" max="100" bind:value={effectIntensity} class="range-input" />
            </div>
            <div class="form-group">
              <label for="description">카드 설명 (선택)</label>
              <textarea id="description" placeholder="이 카드에 대한 설명을 입력하세요..." bind:value={description} class="form-textarea" rows="4"></textarea>
            </div>
          </section>
        {/if}

        <!-- Step 4 -->
        {#if currentStep === 4}
          <section class="step-content">
            <h2 class="step-title">✅ 최종 확인 및 공개 설정</h2>
            <div class="form-group">
              <label>태그 추가</label>
              <div class="tag-input-wrapper">
                <input type="text" placeholder="태그 입력 (엔터로 추가)" bind:value={newTag} on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} class="form-input" />
                <button type="button" on:click={addTag} class="tag-add-btn">추가</button>
              </div>
              {#if tags.length > 0}
                <div class="tags-list">
                  {#each tags as tag}
                    <span class="tag">{tag}<button on:click={() => removeTag(tag)} class="tag-remove">×</button></span>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="form-group">
              <label>공개 설정</label>
              <div class="visibility-options">
                <label class="visibility-option" class:selected={visibility === 'public'}>
                  <input type="radio" name="visibility" value="public" bind:group={visibility} />
                  <span>🌍 전체 공개</span>
                </label>
                <label class="visibility-option" class:selected={visibility === 'followers'}>
                  <input type="radio" name="visibility" value="followers" bind:group={visibility} />
                  <span>👥 팔로워만</span>
                </label>
                <label class="visibility-option" class:selected={visibility === 'private'}>
                  <input type="radio" name="visibility" value="private" bind:group={visibility} />
                  <span>🔒 비공개</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={allowCollect} />
                <span>다른 사용자가 이 카드를 수집할 수 있도록 허용</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={autoPost} />
                <span>생성 즉시 커뮤니티에 자동 게시</span>
              </label>
            </div>

            <!-- Upload Progress -->
            <UploadProgress bind:progress={uploadProgress} />

            <!-- Error Message -->
            {#if submitError}
              <div class="error-message">
                <span class="error-icon">⚠️</span>
                <span>{submitError}</span>
              </div>
            {/if}
          </section>
        {/if}

        <!-- Navigation -->
        <div class="step-actions">
          {#if currentStep > 1}
            <button type="button" on:click={prevStep} class="btn-secondary" disabled={isSubmitDisabled}>← 이전</button>
          {/if}
          {#if currentStep < totalSteps}
            <button type="button" on:click={nextStep} class="btn-primary" disabled={!canProceed[currentStep]}>다음 →</button>
          {:else}
            <button type="button" on:click={handleSubmit} class="btn-submit" disabled={isSubmitDisabled}>
              {#if isSubmitting}
                <span class="spinner"></span> 생성 중...
              {:else}
                ✨ 카드 생성하기
              {/if}
            </button>
          {/if}
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="preview-section">
        <div class="preview-sticky">
          <h3 class="preview-title">실시간 미리보기</h3>
          {#if uploadedImage && playerName}
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
            <div class="preview-info">
              <p><strong>선수:</strong> {playerName}</p>
              {#if position}<p><strong>포지션:</strong> {position}</p>{/if}
              {#if number}<p><strong>등번호:</strong> {number}</p>{/if}
              <p><strong>팀:</strong> {teams.find(t => t.id === selectedTeam)?.name}</p>
              <p><strong>희귀도:</strong> {selectedRarity}</p>
            </div>
          {:else}
            <div class="preview-placeholder">
              <div class="placeholder-icon">🎴</div>
              <p>이미지와 선수 이름을 입력하면<br/>미리보기가 표시됩니다</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .create-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    padding: 40px 20px 100px;
  }
  .create-container { max-width: 1400px; margin: 0 auto; }
  .page-header { text-align: center; margin-bottom: 40px; }
  .page-title {
    font-size: 48px; font-weight: 800; margin: 0 0 12px 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .page-subtitle { font-size: 18px; color: #999; margin: 0; }

  .progress-bar { margin-bottom: 48px; padding: 0 20px; }
  .progress-steps { display: flex; align-items: center; justify-content: center; }
  .progress-step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .step-number {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #666; transition: all 0.3s ease;
  }
  .progress-step.active .step-number {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: #667eea; color: #fff; transform: scale(1.1);
  }
  .progress-step.completed .step-number { background: #34c759; border-color: #34c759; color: #fff; }
  .step-label { font-size: 12px; color: #666; text-align: center; white-space: nowrap; }
  .progress-step.active .step-label { color: #667eea; font-weight: 600; }
  .step-connector {
    width: 60px; height: 2px; background: rgba(255, 255, 255, 0.1);
    margin: 0 -10px; margin-bottom: 28px;
  }
  .step-connector.completed { background: #34c759; }

  .create-layout { display: grid; grid-template-columns: 1fr 450px; gap: 40px; }
  .form-section {
    background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px; padding: 40px;
  }
  .step-content { min-height: 400px; }
  .step-title { font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 24px 0; }

  .upload-area {
    border: 2px dashed rgba(255, 255, 255, 0.2); border-radius: 16px;
    padding: 60px 20px; text-align: center; transition: all 0.3s ease; cursor: pointer;
  }
  .upload-area:hover { border-color: #667eea; background: rgba(102, 126, 234, 0.05); }
  .upload-label { cursor: pointer; display: block; }
  .upload-icon { font-size: 64px; margin-bottom: 16px; }
  .upload-text { font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 8px 0; }
  .upload-hint { font-size: 14px; color: #999; margin: 0 0 16px 0; }
  .upload-info { font-size: 12px; color: #666; margin: 0; }

  .uploaded-preview { text-align: center; }
  .uploaded-preview img { max-width: 100%; max-height: 400px; border-radius: 12px; margin-bottom: 16px; }
  .change-btn {
    padding: 12px 24px; background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px;
    color: #fff; cursor: pointer; transition: all 0.3s ease;
  }
  .change-btn:hover { background: rgba(255, 255, 255, 0.15); }

  .form-group { margin-bottom: 24px; }
  .form-group label { display: block; font-size: 14px; font-weight: 600; color: #ccc; margin-bottom: 8px; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
    color: #fff; font-size: 16px; font-family: inherit; transition: all 0.3s ease;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none; border-color: #667eea; background: rgba(255, 255, 255, 0.08);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .rarity-grid, .effect-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .rarity-option, .effect-option {
    padding: 12px; background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
    cursor: pointer; transition: all 0.3s ease; text-align: center;
  }
  .rarity-option:hover, .effect-option:hover { border-color: rgba(255, 255, 255, 0.3); }
  .rarity-option.selected, .effect-option.selected {
    border-color: #667eea; background: rgba(102, 126, 234, 0.1);
  }
  .rarity-option input, .effect-option input { display: none; }
  .rarity-badge { font-weight: 600; font-size: 14px; }
  .rarity-common { color: #999; }
  .rarity-rare { color: #4a9eff; }
  .rarity-epic { color: #9945ff; }
  .rarity-legendary { color: #ffb700; }
  .effect-name { font-size: 14px; color: #fff; }

  .range-input {
    width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1);
    border-radius: 3px; outline: none; -webkit-appearance: none;
  }
  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none; width: 18px; height: 18px;
    background: #667eea; border-radius: 50%; cursor: pointer;
  }

  .tag-input-wrapper { display: flex; gap: 8px; }
  .tag-add-btn {
    padding: 12px 24px; background: #667eea; border: none;
    border-radius: 8px; color: #fff; font-weight: 600;
    cursor: pointer; white-space: nowrap;
  }
  .tags-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .tag {
    padding: 6px 12px; background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.4); border-radius: 16px;
    color: #667eea; font-size: 14px; display: flex; align-items: center; gap: 6px;
  }
  .tag-remove {
    background: none; border: none; color: #667eea;
    cursor: pointer; font-size: 18px; line-height: 1; padding: 0;
  }

  .visibility-options { display: flex; gap: 12px; }
  .visibility-option {
    flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
    cursor: pointer; transition: all 0.3s ease; text-align: center;
  }
  .visibility-option:hover { border-color: rgba(255, 255, 255, 0.3); }
  .visibility-option.selected { border-color: #667eea; background: rgba(102, 126, 234, 0.1); }
  .visibility-option input { display: none; }

  .checkbox-label {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 12px; cursor: pointer; color: #ccc;
  }
  .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }

  .step-actions {
    display: flex; justify-content: space-between; gap: 16px;
    margin-top: 40px; padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .btn-secondary, .btn-primary, .btn-submit {
    padding: 14px 32px; border: none; border-radius: 8px;
    font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
  }
  .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #fff; }
  .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
  .btn-primary { background: #667eea; color: #fff; margin-left: auto; }
  .btn-primary:hover:not(:disabled) { background: #764ba2; transform: translateY(-2px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-submit {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff; width: 100%; font-size: 18px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

  .error-message {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px; margin-top: 16px;
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 8px; color: #ff3b30; font-size: 14px;
  }
  .error-icon { font-size: 16px; }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .preview-section { position: relative; }
  .preview-sticky {
    position: sticky; top: 100px; background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 32px;
  }
  .preview-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 24px 0; text-align: center; }
  .preview-card { display: flex; justify-content: center; margin-bottom: 24px; }
  .preview-info {
    background: rgba(0, 0, 0, 0.3); border-radius: 12px;
    padding: 16px; font-size: 14px; color: #ccc;
  }
  .preview-info p { margin: 8px 0; }
  .preview-placeholder { text-align: center; padding: 60px 20px; color: #666; }
  .placeholder-icon { font-size: 64px; margin-bottom: 16px; }
  .preview-placeholder p { line-height: 1.6; }

  @media (max-width: 1024px) {
    .create-layout { grid-template-columns: 1fr; }
    .preview-sticky { position: static; }
  }
  @media (max-width: 768px) {
    .page-title { font-size: 32px; }
    .form-section { padding: 24px; }
    .progress-steps { flex-wrap: wrap; }
    .step-connector { width: 40px; }
    .step-label { font-size: 10px; }
    .form-row, .rarity-grid, .effect-grid { grid-template-columns: 1fr; }
    .visibility-options { flex-direction: column; }
  }
</style>
