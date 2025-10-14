<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, slide, scale } from 'svelte/transition';
  import { quintOut, backOut } from 'svelte/easing';
  import type { CommunityPost } from '$lib/types/community';

  // Props
  export let userId: string;
  export let showCreateCollection: boolean = false;

  // Events
  const dispatch = createEventDispatcher<{
    bookmarkAdded: { postId: string; collectionId: string };
    bookmarkRemoved: { postId: string; collectionId: string };
    collectionCreated: BookmarkCollection;
    collectionDeleted: string;
  }>();

  // Types
  interface BookmarkCollection {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    bookmarks: BookmarkedPost[];
    createdAt: Date;
    updatedAt: Date;
  }

  interface BookmarkedPost {
    id: string;
    postId: string;
    post: CommunityPost;
    addedAt: Date;
    note?: string;
  }

  // State
  let collections: BookmarkCollection[] = [];
  let selectedCollection: BookmarkCollection | null = null;
  let showCollectionModal = false;
  let showCreateModal = false;
  let loading = false;
  let searchQuery = '';
  let sortBy: 'recent' | 'oldest' | 'name' = 'recent';

  // New collection form
  let newCollectionName = '';
  let newCollectionDescription = '';
  let newCollectionPrivate = false;

  // Reactive
  $: filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Functions
  async function loadCollections() {
    loading = true;
    try {
      // Mock API call - replace with actual service
      collections = await mockGetBookmarkCollections(userId);
    } catch (error) {
      console.error('Failed to load bookmark collections:', error);
    } finally {
      loading = false;
    }
  }

  async function createCollection() {
    if (!newCollectionName.trim()) return;

    loading = true;
    try {
      const collection: BookmarkCollection = {
        id: `collection_${Date.now()}`,
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
        isPrivate: newCollectionPrivate,
        bookmarks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      collections = [collection, ...collections];
      dispatch('collectionCreated', collection);

      // Reset form
      newCollectionName = '';
      newCollectionDescription = '';
      newCollectionPrivate = false;
      showCreateModal = false;
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      loading = false;
    }
  }

  async function deleteCollection(collectionId: string) {
    if (!confirm('이 컬렉션을 삭제하시겠습니까?')) return;

    try {
      collections = collections.filter(c => c.id !== collectionId);
      if (selectedCollection?.id === collectionId) {
        selectedCollection = null;
      }
      dispatch('collectionDeleted', collectionId);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  }

  async function addToCollection(postId: string, collectionId: string) {
    try {
      // Mock implementation - replace with actual service
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        // Check if already bookmarked
        const existingBookmark = collection.bookmarks.find(b => b.postId === postId);
        if (existingBookmark) return;

        // Add bookmark (mock post data)
        const bookmark: BookmarkedPost = {
          id: `bookmark_${Date.now()}`,
          postId,
          post: await mockGetPost(postId),
          addedAt: new Date()
        };

        collection.bookmarks.unshift(bookmark);
        collection.updatedAt = new Date();
        collections = [...collections];

        dispatch('bookmarkAdded', { postId, collectionId });
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  }

  async function removeFromCollection(postId: string, collectionId: string) {
    try {
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        collection.bookmarks = collection.bookmarks.filter(b => b.postId !== postId);
        collection.updatedAt = new Date();
        collections = [...collections];

        dispatch('bookmarkRemoved', { postId, collectionId });
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  }

  function selectCollection(collection: BookmarkCollection) {
    selectedCollection = collection;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getCollectionIcon(collection: BookmarkCollection): string {
    if (collection.isPrivate) return '🔒';
    if (collection.bookmarks.length === 0) return '📁';
    return '📚';
  }

  // Mock functions - replace with actual API calls
  async function mockGetBookmarkCollections(userId: string): Promise<BookmarkCollection[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'default',
        name: '저장된 포스트',
        description: '기본 북마크 컬렉션',
        isPrivate: false,
        bookmarks: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'favorites',
        name: '즐겨찾기',
        description: '특별히 좋아하는 카드들',
        isPrivate: true,
        bookmarks: [],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-14')
      }
    ];
  }

  async function mockGetPost(postId: string): Promise<CommunityPost> {
    // Mock post data
    return {
      id: postId,
      userId: 'user1',
      userName: '야구팬',
      userGrade: 'CHEER_MEMBER' as any,
      content: '멋진 홀로그래픽 카드입니다!',
      type: 'CARD_SHARE' as any,
      tags: ['홀로그래픽', '야구카드'],
      likes: 25,
      comments: 5,
      shares: 3,
      isLiked: false,
      isBookmarked: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  onMount(() => {
    loadCollections();
  });
</script>

<div class="bookmark-manager">
  <!-- Header -->
  <div class="manager-header">
    <div class="header-content">
      <h2>북마크 컬렉션</h2>
      <p>저장된 포스트를 컬렉션별로 관리하세요</p>
    </div>

    {#if showCreateCollection}
      <button
        class="create-btn"
        on:click={() => showCreateModal = true}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        새 컬렉션
      </button>
    {/if}
  </div>

  <!-- Search and Sort -->
  <div class="controls">
    <div class="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        placeholder="컬렉션 검색..."
        bind:value={searchQuery}
      />
    </div>

    <select bind:value={sortBy} class="sort-select">
      <option value="recent">최근 업데이트</option>
      <option value="oldest">오래된 순</option>
      <option value="name">이름순</option>
    </select>
  </div>

  <!-- Collections Grid -->
  <div class="collections-grid">
    {#if loading}
      <div class="loading-skeleton">
        {#each Array(4) as _}
          <div class="skeleton-card"></div>
        {/each}
      </div>
    {:else if sortedCollections.length === 0}
      <div class="empty-state" in:fade={{ duration: 300 }}>
        <div class="empty-icon">📚</div>
        <h3>컬렉션이 없습니다</h3>
        <p>첫 번째 북마크 컬렉션을 만들어보세요</p>
        {#if showCreateCollection}
          <button
            class="create-first-btn"
            on:click={() => showCreateModal = true}
          >
            컬렉션 만들기
          </button>
        {/if}
      </div>
    {:else}
      {#each sortedCollections as collection (collection.id)}
        <button 
          class="collection-card"
          class:selected={selectedCollection?.id === collection.id}
          in:scale={{ duration: 200, start: 0.9 }}
          on:click={() => selectCollection(collection)}
        >
          <div class="card-header">
            <div class="collection-icon">
              {getCollectionIcon(collection)}
            </div>
            
            <div class="collection-info">
              <h3>{collection.name}</h3>
              {#if collection.description}
                <p>{collection.description}</p>
              {/if}
            </div>

            <div class="card-menu">
              <div
                role="button"
                tabindex="0"
                class="menu-btn"
                on:click|stopPropagation={() => deleteCollection(collection.id)}
                on:keydown={(e) => e.key === 'Enter' && deleteCollection(collection.id)}
                aria-label="컬렉션 삭제"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="card-stats">
            <div class="stat">
              <span class="stat-number">{collection.bookmarks.length}</span>
              <span class="stat-label">포스트</span>
            </div>
            
            <div class="stat">
              <span class="stat-date">{formatDate(collection.updatedAt)}</span>
            </div>
          </div>

          {#if collection.isPrivate}
            <div class="private-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              비공개
            </div>
          {/if}
        </button>
      {/each}
    {/if}
  </div>

  <!-- Selected Collection Detail -->
  {#if selectedCollection}
    <div class="collection-detail" in:slide={{ duration: 300, easing: quintOut }}>
      <div class="detail-header">
        <h3>{selectedCollection.name}</h3>
        <button
          class="close-btn"
          on:click={() => selectedCollection = null}
          aria-label="닫기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="bookmarks-list">
        {#if selectedCollection.bookmarks.length === 0}
          <div class="empty-bookmarks">
            <div class="empty-icon">🔖</div>
            <p>저장된 포스트가 없습니다</p>
          </div>
        {:else}
          {#each selectedCollection.bookmarks as bookmark (bookmark.id)}
            <div class="bookmark-item" in:fade={{ duration: 200 }}>
              <div class="bookmark-content">
                <div class="post-preview">
                  <h4>{bookmark.post.content.slice(0, 50)}...</h4>
                  <div class="post-meta">
                    <span>@{bookmark.post.userName}</span>
                    <span>{formatDate(bookmark.addedAt)}</span>
                  </div>
                </div>

                <button
                  class="remove-btn"
                  on:click={() => selectedCollection && removeFromCollection(bookmark.postId, selectedCollection.id)}
                  aria-label="북마크 제거"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}

  <!-- Create Collection Modal -->
  {#if showCreateModal}
    <div 
      class="modal-overlay" 
      in:fade={{ duration: 200 }} 
      on:click={() => showCreateModal = false}
      on:keydown={(e) => e.key === 'Escape' && (showCreateModal = false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        class="modal-content"
        in:scale={{ duration: 200, start: 0.9, easing: backOut }}
        on:click|stopPropagation
      >
        <div class="modal-header">
          <h3>새 컬렉션 만들기</h3>
          <button
            class="close-btn"
            on:click={() => showCreateModal = false}
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={createCollection} class="modal-form">
          <div class="form-group">
            <label for="collection-name">컬렉션 이름 *</label>
            <input
              id="collection-name"
              type="text"
              bind:value={newCollectionName}
              placeholder="예: 좋아하는 카드들"
              maxlength="50"
              required
            />
          </div>

          <div class="form-group">
            <label for="collection-description">설명 (선택사항)</label>
            <textarea
              id="collection-description"
              bind:value={newCollectionDescription}
              placeholder="이 컬렉션에 대한 설명을 입력하세요"
              maxlength="200"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:checked={newCollectionPrivate}
              />
              <span class="checkbox-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                비공개 컬렉션으로 만들기
              </span>
            </label>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="cancel-btn"
              on:click={() => showCreateModal = false}
            >
              취소
            </button>
            <button
              type="submit"
              class="create-btn"
              disabled={!newCollectionName.trim() || loading}
            >
              {loading ? '만드는 중...' : '컬렉션 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .bookmark-manager {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Header */
  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
  }

  .header-content h2 {
    font-size: 28px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }

  .header-content p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .create-btn:hover {
    background: #0056cc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    align-items: center;
  }

  .search-box {
    flex: 1;
    position: relative;
    max-width: 400px;
  }

  .search-box svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }

  .search-box input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s ease;
  }

  .search-box input:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  .sort-select {
    padding: 12px 16px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: white;
    cursor: pointer;
  }

  /* Collections Grid */
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .loading-skeleton {
    display: contents;
  }

  .skeleton-card {
    height: 160px;
    background: #f0f0f0;
    border-radius: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .empty-state h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #333;
  }

  .empty-state p {
    font-size: 16px;
    margin: 0 0 24px 0;
  }

  .create-first-btn {
    background: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .create-first-btn:hover {
    background: #0056cc;
    transform: translateY(-1px);
  }

  /* Collection Card */
  .collection-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }

  .collection-card:hover {
    border-color: #007aff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .collection-card.selected {
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .collection-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .collection-info {
    flex: 1;
    min-width: 0;
  }

  .collection-info h3 {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin: 0 0 4px 0;
    word-break: break-word;
  }

  .collection-info p {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
  }

  .card-menu {
    flex-shrink: 0;
  }

  .menu-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .menu-btn:hover {
    background: #f5f5f5;
    color: #ff3b30;
  }

  .card-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-number {
    font-size: 18px;
    font-weight: 700;
    color: #333;
  }

  .stat-label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-date {
    font-size: 12px;
    color: #666;
  }

  .private-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 193, 7, 0.1);
    color: #ff8f00;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }

  /* Collection Detail */
  .collection-detail {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 24px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .detail-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #f5f5f5;
    color: #333;
  }

  /* Bookmarks List */
  .bookmarks-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-bookmarks {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .empty-bookmarks .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .bookmark-item {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .bookmark-item:hover {
    border-color: #e1e5e9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .bookmark-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .post-preview {
    flex: 1;
    min-width: 0;
  }

  .post-preview h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .post-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #666;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    background: #f5f5f5;
    color: #ff3b30;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .modal-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .form-group input,
  .form-group textarea {
    padding: 12px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .checkbox-group {
    flex-direction: row;
    align-items: center;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: normal;
  }

  .checkbox-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .cancel-btn {
    background: none;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .cancel-btn:hover {
    background: #f5f5f5;
    border-color: #bbb;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .bookmark-manager {
      padding: 16px;
    }

    .manager-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .controls {
      flex-direction: column;
      gap: 12px;
    }

    .search-box {
      max-width: none;
    }

    .collections-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .collection-card {
      padding: 16px;
    }

    .modal-content {
      margin: 20px;
      padding: 20px;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
</style>