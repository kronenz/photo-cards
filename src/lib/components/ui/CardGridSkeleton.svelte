<!--
  Card Grid Skeleton Loader
  Feature: 004-production-service-integration (T065)

  Displays animated skeleton placeholders for card grids during loading
-->
<script lang="ts">
  export let count: number = 8;
  export let columns: 2 | 3 | 4 | 5 = 4;
  export let cardAspectRatio: string = '2.5 / 3.5';
</script>

<div
  class="skeleton-grid"
  style="--columns: {columns};"
  role="status"
  aria-label="카드 로딩 중"
>
  {#each Array(count) as _, i}
    <div class="skeleton-card" style="--delay: {i * 100}ms; --aspect-ratio: {cardAspectRatio};">
      <div class="skeleton-image"></div>
      <div class="skeleton-info">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
    </div>
  {/each}
</div>

<style>
  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 24px;
    width: 100%;
  }

  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.3s ease-out forwards;
    animation-delay: var(--delay);
    opacity: 0;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  .skeleton-image {
    aspect-ratio: var(--aspect-ratio);
    border-radius: 16px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.03) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .skeleton-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 8px;
  }

  .skeleton-title {
    height: 20px;
    width: 70%;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.03) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .skeleton-subtitle {
    height: 16px;
    width: 50%;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.03) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    animation-delay: 0.2s;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .skeleton-grid {
      --columns: 3;
    }
  }

  @media (max-width: 900px) {
    .skeleton-grid {
      --columns: 2;
    }
  }

  @media (max-width: 600px) {
    .skeleton-grid {
      --columns: 2;
      gap: 16px;
    }
  }
</style>
