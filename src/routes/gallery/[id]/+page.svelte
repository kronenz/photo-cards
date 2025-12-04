<!--
  Card Detail Page
  Feature: 004-production-service-integration (T049)

  Shows card details with comments, likes, and share functionality
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { pb } from '$lib/pocketbase';
  import { socialService } from '$lib/services/socialService';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
  import LikeButton from '$lib/components/social/LikeButton.svelte';
  import ShareButton from '$lib/components/social/ShareButton.svelte';
  import CommentSection from '$lib/components/social/CommentSection.svelte';

  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';
  type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

  interface CardDetail {
    id: string;
    title: string;
    subtitle: string;
    number: string;
    description: string;
    image_url: string;
    team: TeamId;
    rarity: RarityType;
    creator: string;
    is_shared: boolean;
    like_count: number;
    comment_count: number;
    created: string;
    expand?: {
      creator?: {
        id: string;
        name: string;
        avatar?: string;
      };
    };
  }

  let card: CardDetail | null = null;
  let isLoading = true;
  let error = '';
  let isLiked = false;
  let unsubscribeLikes: (() => void) | null = null;

  $: cardId = $page.params.id;
  $: isAuthenticated = pb.authStore.isValid;
  $: currentUserId = pb.authStore.model?.id;
  $: isOwner = card?.creator === currentUserId;

  onMount(async () => {
    await loadCard();
  });

  onDestroy(() => {
    if (unsubscribeLikes) {
      unsubscribeLikes();
    }
  });

  async function loadCard() {
    isLoading = true;
    error = '';

    try {
      const result = await pb.collection('cards').getOne(cardId, {
        expand: 'creator'
      });

      card = {
        id: result.id,
        title: result.title,
        subtitle: result.subtitle || '',
        number: result.number || '',
        description: result.description || '',
        image_url: result.image_url,
        team: result.team,
        rarity: result.rarity,
        creator: result.creator,
        is_shared: result.is_shared,
        like_count: result.like_count || 0,
        comment_count: result.comment_count || 0,
        created: result.created,
        expand: result.expand
      };

      // Check if user has liked this card
      if (isAuthenticated) {
        isLiked = await socialService.hasLiked(cardId);
      }

      // Subscribe to real-time like updates
      unsubscribeLikes = socialService.subscribeToCardLikes(cardId, (newCount) => {
        if (card) {
          card = { ...card, like_count: newCount };
        }
      });
    } catch (err: any) {
      error = err.message || '카드를 불러오는데 실패했습니다.';
    } finally {
      isLoading = false;
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function goBack() {
    goto('/gallery');
  }

  function getCreatorAvatar(): string | undefined {
    if (card?.expand?.creator?.avatar) {
      return pb.files.getUrl(card.expand.creator, card.expand.creator.avatar);
    }
    return undefined;
  }
</script>

<svelte:head>
  <title>{card?.title || '카드 상세'} - Holographic Cards</title>
</svelte:head>

<div class="card-detail-page">
  <button class="back-button" on:click={goBack}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 12H5m0 0l7 7m-7-7l7-7"/>
    </svg>
    갤러리로 돌아가기
  </button>

  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>카드 불러오는 중...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>{error}</p>
      <button on:click={loadCard}>다시 시도</button>
    </div>
  {:else if card}
    <div class="content-layout">
      <!-- Left: Card Display -->
      <div class="card-display">
        <UnifiedCard
          title={card.title}
          subtitle={card.subtitle}
          number={card.number}
          team={card.team}
          rarity={card.rarity}
          image={card.image_url}
          size="large"
        />
      </div>

      <!-- Right: Details and Comments -->
      <div class="card-info">
        <div class="info-header">
          <div class="creator-info">
            {#if getCreatorAvatar()}
              <img src={getCreatorAvatar()} alt={card.expand?.creator?.name || '제작자'} class="creator-avatar" />
            {:else}
              <div class="avatar-placeholder">
                {(card.expand?.creator?.name || '?').charAt(0).toUpperCase()}
              </div>
            {/if}
            <div class="creator-details">
              <span class="creator-name">{card.expand?.creator?.name || '익명'}</span>
              <span class="created-date">{formatDate(card.created)}</span>
            </div>
          </div>

          <div class="rarity-badge rarity-{card.rarity}">
            {card.rarity.toUpperCase()}
          </div>
        </div>

        <h1 class="card-title">{card.title}</h1>
        <p class="card-subtitle">{card.subtitle} {card.number ? `#${card.number}` : ''}</p>

        {#if card.description}
          <div class="description">
            <p>{card.description}</p>
          </div>
        {/if}

        <div class="stats-row">
          <div class="stat">
            <span class="stat-value">{card.like_count}</span>
            <span class="stat-label">좋아요</span>
          </div>
          <div class="stat">
            <span class="stat-value">{card.comment_count}</span>
            <span class="stat-label">댓글</span>
          </div>
        </div>

        <div class="action-buttons">
          <LikeButton
            cardId={card.id}
            initialLiked={isLiked}
            initialCount={card.like_count}
            size="lg"
          />
          <ShareButton
            cardId={card.id}
            isShared={card.is_shared}
            {isOwner}
            size="lg"
          />
        </div>

        <div class="comments-section">
          <CommentSection cardId={card.id} maxHeight="500px" />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .card-detail-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    padding: 24px;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ccc;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 24px;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .back-button svg {
    width: 18px;
    height: 18px;
  }

  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: #999;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-state button {
    margin-top: 16px;
    padding: 10px 20px;
    background: #667eea;
    border: none;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
  }

  .content-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .card-display {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: sticky;
    top: 24px;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .creator-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .creator-avatar, .avatar-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-weight: 600;
    font-size: 18px;
  }

  .creator-details {
    display: flex;
    flex-direction: column;
  }

  .creator-name {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .created-date {
    font-size: 13px;
    color: #666;
  }

  .rarity-badge {
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .rarity-common { background: rgba(158, 158, 158, 0.2); color: #9e9e9e; }
  .rarity-rare { background: rgba(33, 150, 243, 0.2); color: #2196f3; }
  .rarity-epic { background: rgba(156, 39, 176, 0.2); color: #9c27b0; }
  .rarity-legendary { background: rgba(255, 193, 7, 0.2); color: #ffc107; }

  .card-title {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin: 0;
  }

  .card-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .description {
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .description p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: #ccc;
  }

  .stats-row {
    display: flex;
    gap: 32px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
  }

  .stat-label {
    font-size: 13px;
    color: #666;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .comments-section {
    margin-top: 16px;
  }

  @media (max-width: 1024px) {
    .content-layout {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .card-display {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .card-detail-page {
      padding: 16px;
    }

    .card-title {
      font-size: 24px;
    }

    .info-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
</style>
