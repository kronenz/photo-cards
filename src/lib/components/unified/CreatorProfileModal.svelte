<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { currentUser, unifiedCards } from '$lib/stores/unified';
  import { followUser, unfollowUser } from '$lib/utils/social-actions';
  import type { UnifiedUser } from '$lib/types/unified';

  const dispatch = createEventDispatcher();

  // Props
  export let isOpen = false;
  export let creatorId: string | undefined = undefined;

  // Mock creator data (TODO: Fetch from PocketBase)
  let creator: UnifiedUser | null = null;
  let isFollowing = false;
  let isLoading = false;

  $: if (creatorId && isOpen) {
    loadCreator(creatorId);
  }

  $: creatorCards = Array.from($unifiedCards.values()).filter(
    (card) => card.community?.creator === creatorId
  );

  async function loadCreator(id: string) {
    isLoading = true;
    // TODO: Fetch from PocketBase
    // For now, use mock data
    creator = {
      id: id,
      username: `creator_${id}`,
      email: `${id}@example.com`,
      avatar: 'https://i.pravatar.cc/150?img=2',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date(),
      fanProfile: {
        fanLevel: { level: 3, name: '응원단 멤버' },
        currentPoints: 750,
        favoriteTeam: 'team-lg-twins',
        achievedBadges: ['first-card', 'community-star'],
        joinedFanclubs: ['team-lg-twins'],
      },
      creatorProfile: {
        creatorLevel: 'gold',
        stats: {
          totalCards: 25,
          totalLikes: 500,
          totalDownloads: 200,
          averageRating: 4.7,
          followers: 120,
          following: 45,
        },
        isVerified: true,
        specializations: ['KBO', 'Holographic'],
      },
      collections: {
        owned: [],
        collectionProgress: [],
        totalCards: 0,
        rareCards: 0,
      },
      preferences: {
        theme: 'light',
        notifications: {
          newFollower: true,
          cardLike: true,
          cardComment: true,
          levelUp: true,
        },
        privacy: {
          showCollections: true,
          showActivity: true,
        },
      },
    };

    // Check if current user is following
    // TODO: Check actual following status from PocketBase
    isFollowing = false;
    isLoading = false;
  }

  async function handleFollowToggle() {
    if (!creator || !$currentUser) return;

    try {
      if (isFollowing) {
        await unfollowUser(creator.id);
        isFollowing = false;
        if (creator.creatorProfile) {
          creator.creatorProfile.stats.followers--;
        }
      } else {
        await followUser(creator.id);
        isFollowing = true;
        if (creator.creatorProfile) {
          creator.creatorProfile.stats.followers++;
        }
      }
      creator = creator; // Trigger reactivity
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }

  function close() {
    isOpen = false;
    creator = null;
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && creator}
  <div class="modal-overlay" on:click={close} data-testid="creator-profile">
    <div class="modal-content" on:click|stopPropagation>
      {#if isLoading}
        <div class="loading">로딩 중...</div>
      {:else}
        <!-- Header -->
        <div class="profile-header">
          <button class="close-btn" on:click={close} aria-label="닫기">
            ✕
          </button>
        </div>

        <!-- Profile Info -->
        <div class="profile-info">
          <img
            src={creator.avatar}
            alt={creator.username}
            class="avatar"
          />

          <div class="name-section">
            <h2 class="username">
              {creator.username}
              {#if creator.creatorProfile?.isVerified}
                <span class="verified-badge" title="인증된 크리에이터">
                  ✓
                </span>
              {/if}
            </h2>

            {#if creator.creatorProfile?.creatorLevel}
              <span class="creator-level {creator.creatorProfile.creatorLevel}">
                {creator.creatorProfile.creatorLevel.toUpperCase()}
              </span>
            {/if}
          </div>

          <!-- Follow Button -->
          {#if $currentUser?.id !== creator.id}
            <button
              class="follow-btn"
              class:following={isFollowing}
              data-testid="follow-btn"
              on:click={handleFollowToggle}
            >
              {isFollowing ? '팔로잉' : '팔로우'}
            </button>
          {/if}
        </div>

        <!-- Stats -->
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{creator.creatorProfile?.stats.totalCards || 0}</div>
            <div class="stat-label">카드</div>
          </div>
          <div class="stat">
            <div class="stat-value" data-testid="follower-count">
              {creator.creatorProfile?.stats.followers || 0}
            </div>
            <div class="stat-label">팔로워</div>
          </div>
          <div class="stat">
            <div class="stat-value">{creator.creatorProfile?.stats.following || 0}</div>
            <div class="stat-label">팔로잉</div>
          </div>
          <div class="stat">
            <div class="stat-value">{creator.creatorProfile?.stats.totalLikes || 0}</div>
            <div class="stat-label">좋아요</div>
          </div>
        </div>

        <!-- Specializations -->
        {#if creator.creatorProfile?.specializations && creator.creatorProfile.specializations.length > 0}
          <div class="specializations">
            <h3>전문 분야</h3>
            <div class="tags">
              {#each creator.creatorProfile.specializations as spec}
                <span class="tag">{spec}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Creator's Cards -->
        <div class="creator-cards">
          <h3>카드 ({creatorCards.length})</h3>
          <div class="cards-grid">
            {#each creatorCards.slice(0, 6) as card (card.id)}
              <div class="card-item">
                <img
                  src={card.holographic.image}
                  alt={card.title}
                  class="card-thumbnail"
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .loading {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
  }

  .profile-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
    line-height: 1;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--team-primary-color, #667eea);
  }

  .name-section {
    text-align: center;
  }

  .username {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--team-primary-color, #667eea);
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .creator-level {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .creator-level.gold {
    background: #fbbf24;
    color: #92400e;
  }

  .creator-level.silver {
    background: #d1d5db;
    color: #374151;
  }

  .creator-level.bronze {
    background: #f59e0b;
    color: #78350f;
  }

  .follow-btn {
    padding: 0.5rem 2rem;
    border: 2px solid var(--team-primary-color, #667eea);
    border-radius: 9999px;
    background: white;
    color: var(--team-primary-color, #667eea);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .follow-btn:hover {
    background: var(--team-primary-color, #667eea);
    color: white;
  }

  .follow-btn.following {
    background: var(--team-primary-color, #667eea);
    color: white;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 12px;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .specializations {
    margin-bottom: 2rem;
  }

  .specializations h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
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

  .creator-cards {
    margin-bottom: 1rem;
  }

  .creator-cards h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .card-item {
    aspect-ratio: 3 / 4;
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .card-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 640px) {
    .stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
