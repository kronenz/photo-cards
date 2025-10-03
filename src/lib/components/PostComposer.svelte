<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getTeamById } from '$lib/data/baseballTeams';
  import { communityService } from '$lib/services/communityService';
  import type { CommunityPost } from '$lib/types/community';
  import { PostType } from '$lib/types/community';

  // Props
  export let selectedTeamId: string | undefined = undefined;
  export let placeholder: string = '야구에 대한 이야기를 공유해보세요...';

  // Events
  const dispatch = createEventDispatcher<{
    postCreated: CommunityPost;
  }>();

  // State
  let isExpanded = false;
  let content = '';
  let selectedPostType: PostType = PostType.GENERAL;
  let selectedImages: File[] = [];
  let imagePreviewUrls: string[] = [];
  let tags = '';
  let isSubmitting = false;

  // Computed
  $: team = selectedTeamId ? getTeamById(selectedTeamId) : null;
  $: canSubmit = content.trim().length > 0 && !isSubmitting;
  $: characterCount = content.length;
  $: maxCharacters = 500;

  // Functions
  function expandComposer() {
    isExpanded = true;
  }

  function collapseComposer() {
    if (content.trim() === '' && selectedImages.length === 0) {
      isExpanded = false;
    }
  }

  function handleImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files) {
      const newFiles = Array.from(files).slice(0, 4 - selectedImages.length); // 최대 4개
      selectedImages = [...selectedImages, ...newFiles];
      
      // 미리보기 URL 생성
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        imagePreviewUrls = [...imagePreviewUrls, url];
      });
    }
  }

  function removeImage(index: number) {
    // 미리보기 URL 해제
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    selectedImages = selectedImages.filter((_, i) => i !== index);
    imagePreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
  }

  function parseHashtags(text: string): string[] {
    const hashtagRegex = /#[\w가-힣]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    isSubmitting = true;
    try {
      // 해시태그 추출
      const contentTags = parseHashtags(content);
      const manualTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const allTags = [...new Set([...contentTags, ...manualTags])];

      // 포스트 데이터 생성
      const postData = {
        userId: 'current-user', // 실제로는 인증된 사용자 ID
        userName: '현재 사용자', // 실제로는 인증된 사용자 이름
        userGrade: 'CHEER_MEMBER' as any, // 실제로는 사용자의 실제 등급
        teamId: selectedTeamId,
        content: content.trim(),
        type: selectedPostType,
        tags: allTags,
        images: imagePreviewUrls // 실제로는 업로드된 이미지 URL
      };

      const newPost = await communityService.createPost(postData);
      dispatch('postCreated', newPost);

      // 폼 초기화
      resetForm();
    } catch (error) {
      console.error('Failed to create post:', error);
      // 에러 처리 (토스트 메시지 등)
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    content = '';
    tags = '';
    selectedPostType = PostType.GENERAL;
    selectedImages = [];
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    imagePreviewUrls = [];
    isExpanded = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      handleSubmit();
    }
  }

  // 컴포넌트 정리 시 미리보기 URL 해제
  function cleanup() {
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }
</script>

<svelte:window on:beforeunload={cleanup} />

<div 
  class="post-composer" 
  class:expanded={isExpanded}
  style={team ? `--team-primary: ${team.colors.primary}; --team-secondary: ${team.colors.secondary}` : ''}
>
  <!-- 기본 입력 영역 -->
  <div class="composer-main">
    <div class="user-avatar">
      <div class="avatar-placeholder">U</div>
    </div>

    <div class="input-area">
      <textarea
        bind:value={content}
        on:focus={expandComposer}
        on:blur={collapseComposer}
        on:keydown={handleKeydown}
        placeholder={placeholder}
        maxlength={maxCharacters}
        rows={isExpanded ? 4 : 1}
        class="content-input"
      ></textarea>

      {#if isExpanded}
        <div class="character-count" class:warning={characterCount > maxCharacters * 0.9}>
          {characterCount}/{maxCharacters}
        </div>
      {/if}
    </div>
  </div>

  <!-- 확장된 옵션들 -->
  {#if isExpanded}
    <div class="composer-options">
      <!-- 포스트 타입 선택 -->
      <div class="option-group">
        <label for="post-type-select">포스트 타입</label>
        <select id="post-type-select" bind:value={selectedPostType} class="post-type-select">
          <option value={PostType.GENERAL}>일반</option>
          <option value={PostType.CARD_SHARE}>카드 공유</option>
          <option value={PostType.STADIUM_VISIT}>직관 후기</option>
          <option value={PostType.PLAYER_SUPPORT}>선수 응원</option>
          <option value={PostType.FAN_STORY}>팬 스토리</option>
          <option value={PostType.GAME_HIGHLIGHT}>경기 하이라이트</option>
        </select>
      </div>

      <!-- 태그 입력 -->
      <div class="option-group">
        <label for="tags-input">태그 (쉼표로 구분)</label>
        <input
          id="tags-input"
          type="text"
          bind:value={tags}
          placeholder="예: 직관, 홈런, 승리"
          class="tags-input"
        />
      </div>

      <!-- 이미지 업로드 -->
      <div class="option-group">
        <label for="image-upload">이미지 ({selectedImages.length}/4)</label>
        <div class="image-upload-area">
          <input
            type="file"
            accept="image/*"
            multiple
            on:change={handleImageSelect}
            class="image-input"
            id="image-upload"
            disabled={selectedImages.length >= 4}
          />
          <label for="image-upload" class="image-upload-button" class:disabled={selectedImages.length >= 4}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 8L12 3M12 3L7 8M12 3V15" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
            이미지 추가
          </label>
        </div>

        <!-- 이미지 미리보기 -->
        {#if imagePreviewUrls.length > 0}
          <div class="image-previews">
            {#each imagePreviewUrls as url, index}
              <div class="image-preview">
                <img src={url} alt="미리보기 {index + 1}" />
                <button 
                  class="remove-image" 
                  on:click={() => removeImage(index)}
                  aria-label="이미지 제거"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path 
                      d="M12 4L4 12M4 4L12 12" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- 액션 버튼들 -->
    <div class="composer-actions">
      <div class="action-info">
        {#if team}
          <span class="team-info">
            <span class="team-badge" style="background-color: {team.colors.primary}">
              {team.name}
            </span>
            팬클럽에 게시
          </span>
        {:else}
          <span class="community-info">전체 커뮤니티에 게시</span>
        {/if}
      </div>

      <div class="action-buttons">
        <button 
          class="cancel-btn" 
          on:click={resetForm}
          disabled={isSubmitting}
        >
          취소
        </button>
        <button 
          class="submit-btn" 
          on:click={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? '게시 중...' : '게시하기'}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .post-composer {
    background: white;
    border: 2px solid var(--border-color, #e1e5e9);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }

  .post-composer.expanded {
    border-color: var(--team-primary, var(--primary-color, #3b82f6));
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .composer-main {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 16px;
  }

  .input-area {
    flex: 1;
    position: relative;
  }

  .content-input {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 16px;
    line-height: 1.5;
    color: var(--text-primary, #1a1a1a);
    background: transparent;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .content-input::placeholder {
    color: var(--text-secondary, #6b7280);
  }

  .character-count {
    position: absolute;
    bottom: 4px;
    right: 8px;
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .character-count.warning {
    color: #ef4444;
  }

  .composer-options {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color, #e1e5e9);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option-group label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
  }

  .post-type-select,
  .tags-input {
    padding: 8px 12px;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-primary, #1a1a1a);
    background: white;
    transition: border-color 0.2s ease;
  }

  .post-type-select:focus,
  .tags-input:focus {
    outline: none;
    border-color: var(--team-primary, var(--primary-color, #3b82f6));
    box-shadow: 0 0 0 3px rgba(var(--team-primary-rgb, 59, 130, 246), 0.1);
  }

  .image-upload-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .image-input {
    display: none;
  }

  .image-upload-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--surface-secondary, #f8f9fa);
    border: 1px dashed var(--border-color, #e1e5e9);
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary, #6b7280);
    transition: all 0.2s ease;
  }

  .image-upload-button:hover:not(.disabled) {
    background: var(--surface-tertiary, #e5e7eb);
    border-color: var(--team-primary, var(--primary-color, #3b82f6));
    color: var(--team-primary, var(--primary-color, #3b82f6));
  }

  .image-upload-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .image-previews {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .image-preview {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
  }

  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-image {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .remove-image:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  .composer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color, #e1e5e9);
  }

  .action-info {
    font-size: 14px;
    color: var(--text-secondary, #6b7280);
  }

  .team-badge {
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-right: 4px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .cancel-btn,
  .submit-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .cancel-btn {
    background: none;
    border: 1px solid var(--border-color, #e1e5e9);
    color: var(--text-secondary, #6b7280);
  }

  .cancel-btn:hover:not(:disabled) {
    background: var(--surface-secondary, #f8f9fa);
    color: var(--text-primary, #1a1a1a);
  }

  .submit-btn {
    background: var(--team-primary, var(--primary-color, #3b82f6));
    border: 1px solid var(--team-primary, var(--primary-color, #3b82f6));
    color: white;
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--team-primary-dark, var(--primary-color-dark, #2563eb));
    transform: translateY(-1px);
  }

  .submit-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .post-composer {
      padding: 12px;
      border-radius: 12px;
    }

    .composer-main {
      gap: 8px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
    }

    .avatar-placeholder {
      font-size: 14px;
    }

    .content-input {
      font-size: 15px;
    }

    .composer-actions {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .action-buttons {
      justify-content: stretch;
    }

    .cancel-btn,
    .submit-btn {
      flex: 1;
    }
  }
</style>