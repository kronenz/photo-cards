<script lang="ts">
  import HolographicCardV2 from '$lib/components/HolographicCardV2.svelte';
  import CollectionCardGrid from '$lib/components/CollectionCardGrid.svelte';
  import type { Card } from '$lib/types/collections';
  import { CardType, CardRarity } from '$lib/types/collections';

  // Demo cards with different rarities and teams
  const demoCards: Card[] = [
    {
      id: '1',
      title: '이정후 홈런 순간',
      image: '/api/placeholder/300/400',
      rarity: CardRarity.LEGENDARY,
      type: CardType.MOMENT,
      holographicEffect: {
        type: 'rainbow',
        intensity: 0.8,
        animationSpeed: 1.2
      },
      stats: { likes: 245, views: 1200, downloads: 89, comments: 34, rating: 4.8, ratingCount: 67 },
      metadata: {
        player: '이정후',
        team: 'KIA 타이거즈',
        season: '2024',
        tags: ['홈런', '역전', '끝내기'],
        creator: 'user123'
      },
      collections: ['kia-2024'],
      owner: 'user123',
      isPublic: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: '김하성 수비 하이라이트',
      image: '/api/placeholder/300/400',
      rarity: CardRarity.EPIC,
      type: CardType.PLAYER,
      holographicEffect: {
        type: 'cosmic',
        intensity: 0.7,
        animationSpeed: 1.0
      },
      stats: { likes: 189, views: 890, downloads: 45, comments: 23, rating: 4.6, ratingCount: 42 },
      metadata: {
        player: '김하성',
        team: 'SSG 랜더스',
        season: '2024',
        tags: ['수비', '내야수', '골든글러브'],
        creator: 'user456'
      },
      collections: ['ssg-2024'],
      owner: 'user456',
      isPublic: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      title: '잠실야구장 야경',
      image: '/api/placeholder/300/400',
      rarity: CardRarity.RARE,
      type: CardType.STADIUM,
      holographicEffect: {
        type: 'aurora',
        intensity: 0.6,
        animationSpeed: 0.8
      },
      stats: { likes: 156, views: 678, downloads: 34, comments: 18, rating: 4.4, ratingCount: 29 },
      metadata: {
        team: 'LG 트윈스',
        season: '2024',
        tags: ['잠실', '야경', '홈구장'],
        creator: 'user789'
      },
      collections: ['stadiums-2024'],
      owner: 'user789',
      isPublic: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    }
  ];

  function handleCardClick(event: CustomEvent) {
    console.log('Card clicked:', event.detail);
  }

  function handleCardHover(event: CustomEvent) {
    console.log('Card hover:', event.detail);
  }
</script>

<svelte:head>
  <title>홀로그래픽 카드 데모 - Baseball Cards</title>
</svelte:head>

<div class="demo-page">
  <div class="demo-container">
    <header class="demo-header">
      <h1 class="demo-title">홀로그래픽 카드 데모</h1>
      <p class="demo-description">
        Baseball 팀별 전용 홀로그래픽 효과와 다양한 카드 타입을 체험해보세요
      </p>
    </header>

    <!-- Individual Card Demos -->
    <section class="individual-demos">
      <h2 class="section-title">개별 카드 데모</h2>
      
      <div class="card-demo-grid">
        <!-- KIA Tigers Card -->
        <div class="card-demo-item">
          <h3>KIA 타이거즈 전용 효과</h3>
          <HolographicCardV2
            frontImage="/api/placeholder/300/400"
            title="타이거즈 레전드"
            rarity="rare rainbow"
            teamId="kia-tigers"
            cardType="player"
            on:hover={handleCardHover}
            on:click={handleCardClick}
          />
        </div>

        <!-- LG Twins Card -->
        <div class="card-demo-item">
          <h3>LG 트윈스 전용 효과</h3>
          <HolographicCardV2
            frontImage="/api/placeholder/300/400"
            title="트윈스 영광"
            rarity="rare holo v"
            teamId="lg-twins"
            cardType="moment"
            on:hover={handleCardHover}
            on:click={handleCardClick}
          />
        </div>

        <!-- Samsung Lions Card -->
        <div class="card-demo-item">
          <h3>삼성 라이온즈 전용 효과</h3>
          <HolographicCardV2
            frontImage="/api/placeholder/300/400"
            title="라이온즈 킹"
            rarity="rare holo galaxy"
            teamId="samsung-lions"
            cardType="achievement"
            on:hover={handleCardHover}
            on:click={handleCardClick}
          />
        </div>

        <!-- Stadium Card -->
        <div class="card-demo-item">
          <h3>구장 카드 전용 효과</h3>
          <HolographicCardV2
            frontImage="/api/placeholder/300/400"
            title="잠실야구장"
            rarity="rare holo"
            teamId="lg-twins"
            cardType="stadium"
            on:hover={handleCardHover}
            on:click={handleCardClick}
          />
        </div>
      </div>
    </section>

    <!-- Collection Grid Demo -->
    <section class="collection-demo">
      <h2 class="section-title">컬렉션 그리드 데모</h2>
      <CollectionCardGrid
        cards={demoCards}
        title="데모 컬렉션"
        gridCols={3}
        enableFlip={true}
        animationSpeed={600}
        on:cardClick={handleCardClick}
        on:cardHover={handleCardHover}
        on:cardFlip={(e) => console.log('Card flip:', e.detail)}
        on:createCard={() => console.log('Create card clicked')}
      />
    </section>

    <!-- Rarity Showcase -->
    <section class="rarity-showcase">
      <h2 class="section-title">희귀도별 홀로그래픽 효과</h2>
      
      <div class="rarity-grid">
        <div class="rarity-demo-item">
          <h4>일반 홀로</h4>
          <HolographicCardV2
            frontImage="/api/placeholder/200/280"
            title="일반 카드"
            rarity="rare holo"
            cardType="player"
            animationSpeed={800}
          />
        </div>

        <div class="rarity-demo-item">
          <h4>V 카드</h4>
          <HolographicCardV2
            frontImage="/api/placeholder/200/280"
            title="V 카드"
            rarity="rare holo v"
            cardType="player"
            animationSpeed={700}
          />
        </div>

        <div class="rarity-demo-item">
          <h4>갤럭시 홀로</h4>
          <HolographicCardV2
            frontImage="/api/placeholder/200/280"
            title="갤럭시 카드"
            rarity="rare holo galaxy"
            cardType="moment"
            animationSpeed={600}
          />
        </div>

        <div class="rarity-demo-item">
          <h4>레인보우 시크릿</h4>
          <HolographicCardV2
            frontImage="/api/placeholder/200/280"
            title="레인보우 카드"
            rarity="rare rainbow"
            cardType="achievement"
            animationSpeed={500}
          />
        </div>
      </div>
    </section>

    <div class="demo-footer">
      <a href="/" class="back-link">← 메인 페이지로 돌아가기</a>
    </div>
  </div>
</div>

<style>
  .demo-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: var(--apple-spacing-2xl) 0;
  }

  .demo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--apple-spacing-lg);
  }

  .demo-header {
    text-align: center;
    margin-bottom: var(--apple-spacing-4xl);
  }

  .demo-title {
    font-size: var(--apple-font-size-display1);
    font-weight: 700;
    color: var(--apple-text-primary);
    margin-bottom: var(--apple-spacing-md);
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .demo-description {
    font-size: var(--apple-font-size-title3);
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .section-title {
    font-size: var(--apple-font-size-title2);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: var(--apple-spacing-xl);
    text-align: center;
  }

  .individual-demos {
    margin-bottom: var(--apple-spacing-4xl);
  }

  .card-demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--apple-spacing-2xl);
    margin-bottom: var(--apple-spacing-2xl);
  }

  .card-demo-item {
    text-align: center;
  }

  .card-demo-item h3 {
    font-size: var(--apple-font-size-headline);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: var(--apple-spacing-lg);
  }

  .collection-demo {
    margin-bottom: var(--apple-spacing-4xl);
  }

  .rarity-showcase {
    margin-bottom: var(--apple-spacing-4xl);
  }

  .rarity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--apple-spacing-xl);
  }

  .rarity-demo-item {
    text-align: center;
  }

  .rarity-demo-item h4 {
    font-size: var(--apple-font-size-callout);
    font-weight: 600;
    color: var(--apple-text-primary);
    margin-bottom: var(--apple-spacing-md);
  }

  .demo-footer {
    text-align: center;
    padding-top: var(--apple-spacing-2xl);
    border-top: 1px solid var(--apple-surface-border);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
    font-size: var(--apple-font-size-body);
    color: var(--apple-accent-blue);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--apple-transition-fast);
  }

  .back-link:hover {
    color: var(--apple-accent-blue-dark);
    transform: translateX(-4px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .card-demo-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--apple-spacing-xl);
    }

    .rarity-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--apple-spacing-lg);
    }

    .demo-title {
      font-size: var(--apple-font-size-3xl);
    }

    .demo-description {
      font-size: var(--apple-font-size-lg);
    }
  }

  @media (max-width: 480px) {
    .card-demo-grid,
    .rarity-grid {
      grid-template-columns: 1fr;
    }

    .demo-container {
      padding: 0 var(--apple-spacing-md);
    }
  }
</style>