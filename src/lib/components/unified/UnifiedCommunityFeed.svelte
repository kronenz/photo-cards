<script lang="ts">
  import { onMount } from 'svelte';
  import { currentUser, unifiedCards } from '$lib/stores/unified';
  import type { UnifiedCard } from '$lib/types/unified';
  import { likeCard, unlikeCard } from '$lib/utils/social-actions';

  // Props
  export let filter: 'public' | 'following' | 'team' = 'public';
  export let teamId: string | undefined = undefined;
  export let layout: 'grid' | 'masonry' = 'grid';
  export let columns: number = 3;
  export let sortBy: 'latest' | 'popular' | 'rating' = 'latest';
  export let postsPerPage: number = 20;
  export let infiniteScroll: boolean = false;

  // State
  let filteredCards: UnifiedCard[] = [];
  let displayedCards: UnifiedCard[] = [];
  let currentPage = 0;
  let hasMore = false;
  let likedCards = new Set<string>();

  // Reactive filtering
  $: {
    const cards = Array.from($unifiedCards.values());

    // Filter by visibility
    let filtered = cards.filter((card) => {
      if (!card.community) return false;

      // Public filter - show all public cards
      if (filter === 'public') {
        return card.community.isPublic;
      }

      // Following filter - show cards from followed creators
      if (filter === 'following') {
        // TODO: Implement following check
        return false;
      }

      // Team filter - show cards with specific team tag
      if (filter === 'team' && teamId) {
        return card.community.tags?.some((tag) =>
          tag.toLowerCase().includes(teamId.toLowerCase())
        );
      }

      return false;
    });

    // Sort cards
    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'popular') {
      filtered.sort(
        (a, b) =>
          (b.community?.metadata?.likes || 0) - (a.community?.metadata?.likes || 0)
      );
    } else if (sortBy === 'rating') {
      filtered.sort(
        (a, b) =>
          (b.community?.metadata?.rating || 0) - (a.community?.metadata?.rating || 0)
      );
    }

    filteredCards = filtered;

    // Update pagination
    updateDisplayedCards();
  }

  function updateDisplayedCards() {
    const start = 0;
    const end = (currentPage + 1) * postsPerPage;
    displayedCards = filteredCards.slice(start, end);
    hasMore = end < filteredCards.length;
  }

  function loadMore() {
    currentPage++;
    updateDisplayedCards();
  }

  async function handleLike(cardId: string) {
    if (likedCards.has(cardId)) {
      await unlikeCard(cardId);
      likedCards.delete(cardId);
    } else {
      await likeCard(cardId);
      likedCards.add(cardId);
    }
    likedCards = likedCards; // Trigger reactivity
  }

  function handleComment(cardId: string) {
    // TODO: Open comment modal
    console.log('Comment on card:', cardId);
  }

  function handleShare(cardId: string) {
    // TODO: Open share modal
    console.log('Share card:', cardId);
  }

  // Responsive columns
  let viewportWidth = 0;
  $: responsiveColumns =
    viewportWidth < 640 ? 1 : viewportWidth < 1024 ? 2 : columns;

  onMount(() => {
    viewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      viewportWidth = window.innerWidth;
    });
  });
</script>

<div
  class="unified-community-feed"
  role="feed"
  aria-label="Community feed"
  data-testid="community-feed"
>
  {#if displayedCards.length === 0}
    <div class="empty-state" data-testid="empty-state">
      {#if filter === 'following'}
        <p>팔로우한 크리에이터의 게시물이 없습니다.</p>
        <p class="text-sm text-gray-500">크리에이터를 팔로우하여 피드를 채워보세요.</p>
      {:else}
        <p>아직 게시물이 없습니다.</p>
      {/if}
    </div>
  {:else}
    <div
      class="feed-grid columns-{responsiveColumns}"
      class:masonry={layout === 'masonry'}
      data-testid="feed-grid"
    >
      {#each displayedCards as card (card.id)}
        <article
          class="community-post"
          data-testid="community-post-{card.id}"
        >
          <!-- Card Image -->
          <div class="card-image-wrapper">
            <img
              src={card.holographic.image}
              alt={card.title}
              class="card-image"
            />
          </div>

          <!-- Card Info -->
          <div class="card-info">
            <h3 class="card-title">{card.title}</h3>

            <!-- Creator Link -->
            {#if card.community?.creator}
              <button
                class="creator-link"
                data-testid="creator-link"
                on:click={() => {
                  /* TODO: Open creator profile */
                }}
              >
                <span class="creator-name">
                  {card.community.creator}
                </span>
              </button>
            {/if}

            <!-- Post Tags -->
            {#if card.community?.tags && card.community.tags.length > 0}
              <div class="post-tags" data-testid="post-tags">
                {#each card.community.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <button
              class="action-btn like-btn"
              class:liked={likedCards.has(card.id)}
              data-testid="like-btn"
              on:click={() => handleLike(card.id)}
              aria-label="좋아요"
            >
              <span class="icon">❤️</span>
              <span class="count" data-testid="like-count">
                {card.community?.metadata?.likes || 0}
              </span>
            </button>

            <button
              class="action-btn comment-btn"
              data-testid="comment-btn"
              on:click={() => handleComment(card.id)}
              aria-label="댓글"
            >
              <span class="icon">💬</span>
              <span class="count" data-testid="comment-count">
                {card.community?.metadata?.ratingCount || 0}
              </span>
            </button>

            <button
              class="action-btn download-btn"
              data-testid="download-btn"
              on:click={() => handleShare(card.id)}
              aria-label="다운로드"
            >
              <span class="icon">⬇️</span>
              <span class="count" data-testid="download-count">
                {card.community?.metadata?.downloads || 0}
              </span>
            </button>
          </div>
        </article>
      {/each}
    </div>

    <!-- Load More Button -->
    {#if hasMore && !infiniteScroll}
      <div class="load-more-wrapper">
        <button
          class="load-more-btn"
          data-testid="load-more-btn"
          on:click={loadMore}
        >
          더 보기
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .unified-community-feed {
    width: 100%;
    padding: 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-secondary, #6b7280);
  }

  .feed-grid {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .feed-grid.columns-1 {
    grid-template-columns: 1fr;
  }

  .feed-grid.columns-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .feed-grid.columns-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .feed-grid.masonry {
    column-count: var(--columns, 3);
    column-gap: 1.5rem;
  }

  .feed-grid.masonry .community-post {
    break-inside: avoid;
    margin-bottom: 1.5rem;
  }

  .community-post {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s;
  }

  .community-post:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-info {
    padding: 1rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #111827);
  }

  .creator-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.875rem;
    color: var(--team-primary-color, #667eea);
    cursor: pointer;
    text-decoration: none;
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  .creator-link:hover {
    text-decoration: underline;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--bg-secondary, #f3f4f6);
    border-radius: 9999px;
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
  }

  .card-actions {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: var(--bg-hover, #f9fafb);
  }

  .action-btn.liked {
    color: #ef4444;
  }

  .action-btn .icon {
    font-size: 1.25rem;
  }

  .load-more-wrapper {
    text-align: center;
    padding: 2rem 0;
  }

  .load-more-btn {
    padding: 0.75rem 2rem;
    background: var(--team-primary-color, #667eea);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .load-more-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    .unified-community-feed {
      padding: 0.5rem;
    }

    .feed-grid {
      gap: 1rem;
    }
  }
</style>
