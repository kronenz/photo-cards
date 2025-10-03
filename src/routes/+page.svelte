<script lang="ts">
  import { onMount } from 'svelte';
  import MainPageLayout from '$lib/components/MainPageLayout.svelte';
  import CollectionDashboard from '$lib/components/CollectionDashboard.svelte';
  import HolographicCardV2 from '$lib/components/HolographicCardV2.svelte';
  import type { Card, CollectionProgress, UserStats, CardRarity } from '$lib/types/collections';
  import { CardType } from '$lib/types/collections';
  

  let currentTeam = 'lg';
  
  // Baseball 구단 데이터
  const baseballTeams = [
    { id: 'lg', name: 'LG 트윈스', color: '#c41e3a', accent: '#ff69b4', stadium: '잠실야구장', founded: 1982, achievements: { championships: 2 } },
    { id: 'doosan', name: '두산 베어스', color: '#131230', accent: '#4169e1', stadium: '잠실야구장', founded: 1982, achievements: { championships: 6 } },
    { id: 'kt', name: 'KT 위즈', color: '#000000', accent: '#ff0000', stadium: '수원 KT 위즈파크', founded: 2015, achievements: { championships: 0 } },
    { id: 'samsung', name: '삼성 라이온즈', color: '#074ca1', accent: '#87ceeb', stadium: '대구 삼성 라이온즈 파크', founded: 1982, achievements: { championships: 8 } },
    { id: 'lotte', name: '롯데 자이언츠', color: '#041e42', accent: '#c41e3a', stadium: '사직야구장', founded: 1982, achievements: { championships: 2 } },
    { id: 'kia', name: 'KIA 타이거즈', color: '#ea002c', accent: '#000000', stadium: '광주-기아 챔피언스 필드', founded: 1982, achievements: { championships: 11 } },
    { id: 'nc', name: 'NC 다이노스', color: '#315288', accent: '#c4a484', stadium: 'NC파크', founded: 2013, achievements: { championships: 0 } },
    { id: 'hanwha', name: '한화 이글스', color: '#ff6600', accent: '#000000', stadium: '한화생명 이글스파크', founded: 1986, achievements: { championships: 1 } },
    { id: 'ssg', name: 'SSG 랜더스', color: '#ce0e2d', accent: '#ffd700', stadium: 'SSG 랜더스필드', founded: 2000, achievements: { championships: 0 } },
    { id: 'kiwoom', name: '키움 히어로즈', color: '#570514', accent: '#ffd700', stadium: '고척스카이돔', founded: 2008, achievements: { championships: 0 } }
  ];
  
  // Mock data for the new layout
  const mockUser: any = null; // Will be replaced with actual user data
  
  // Mock user stats with proper typing
  const mockUserStats: UserStats = {
    totalCards: 127,
    rareCards: 23,
    completedCollections: 3,
    fanLevel: 'supporter',
    favoriteTeam: 'lg',
    cardsByRarity: {
      common: 45,
      uncommon: 32,
      rare: 18,
      epic: 4,
      legendary: 1,
      mythic: 0
    } as Record<CardRarity, number>,
    recentAcquisitions: [],
    collectionProgress: []
  };
  
  // Mock recent cards
  const mockRecentCards: Card[] = [
    {
      id: '1',
      title: '이정후 홈런 순간',
      image: '/api/placeholder/300/400',
      rarity: 'legendary' as CardRarity,
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
      rarity: 'epic' as CardRarity,
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
      rarity: 'rare' as CardRarity,
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
  
  // Mock collection progress
  const mockCollectionProgress: CollectionProgress[] = [
    {
      id: 'kia-2024',
      name: 'KIA 타이거즈 2024 시즌',
      totalCards: 50,
      ownedCards: 47,
      completionPercentage: 94,
      theme: 'team',
      rarity: 'rare' as CardRarity,
      isCompleted: false,
      recentlyAdded: mockRecentCards.slice(0, 2)
    },
    {
      id: 'lg-legends',
      name: 'LG 트윈스 레전드',
      totalCards: 25,
      ownedCards: 25,
      completionPercentage: 100,
      theme: 'team',
      rarity: 'legendary' as CardRarity,
      isCompleted: true,
      recentlyAdded: []
    },
    {
      id: 'baseball-2024-season',
      name: '2024 Baseball 시즌 하이라이트',
      totalCards: 100,
      ownedCards: 73,
      completionPercentage: 73,
      theme: 'season',
      rarity: 'epic' as CardRarity,
      isCompleted: false,
      recentlyAdded: mockRecentCards.slice(1, 3)
    },
    {
      id: 'stadiums-collection',
      name: 'Baseball 10개 구장',
      totalCards: 10,
      ownedCards: 6,
      completionPercentage: 60,
      theme: 'special',
      rarity: 'uncommon' as CardRarity,
      isCompleted: false,
      recentlyAdded: [mockRecentCards[2]]
    },
    {
      id: 'rookie-cards',
      name: '2024 신인왕 후보',
      totalCards: 15,
      ownedCards: 8,
      completionPercentage: 53,
      theme: 'player',
      rarity: 'rare' as CardRarity,
      isCompleted: false,
      recentlyAdded: []
    }
  ];
  
  onMount(() => {
    // 자동 구단 순환 (데모용)
    const interval = setInterval(() => {
      const currentIndex = baseballTeams.findIndex(team => team.id === currentTeam);
      const nextIndex = (currentIndex + 1) % baseballTeams.length;
      currentTeam = baseballTeams[nextIndex].id;
    }, 3000);
    
    return () => clearInterval(interval);
  });
  
  function selectTeam(teamId: string) {
    currentTeam = teamId;
  }
  
  function handleCardClick(card: Card) {
    console.log('Card clicked:', card);
    // Navigate to card detail page or open modal
  }
  
  function handleCollectionClick(collection: CollectionProgress) {
    console.log('Collection clicked:', collection);
    // Navigate to collection detail page
  }
</script>

<svelte:head>
  <title>Baseball 홀로그래픽 카드 커뮤니티 - 야구의 감동을 카드로</title>
  <meta name="description" content="Baseball 야구의 영광스러운 순간을 홀로그래픽 카드로 제작하고 공유하는 프리미엄 커뮤니티 플랫폼" />
</svelte:head>

<MainPageLayout>
  <!-- Hero Section Content - Using MainPageLayout's default hero -->

  <!-- Dashboard Section Content -->
  <div slot="dashboard" class="dashboard-content-wrapper">
    <div class="apple-container">
      <CollectionDashboard
        userStats={mockUserStats}
        recentCards={mockRecentCards}
        collectionProgress={mockCollectionProgress}
        onCardClick={handleCardClick}
        onCollectionClick={handleCollectionClick}
      />
    </div>
  </div>

  <!-- Community Section Content -->
  <div slot="community" class="community-content-wrapper">
    <div class="apple-container">
      <div class="section-header text-center apple-m-2xl">
        <h2 class="apple-text-title1">커뮤니티 피드</h2>
        <p class="apple-text-body apple-text-secondary">
          다른 사용자들의 멋진 카드와 컬렉션을 둘러보세요
        </p>
      </div>
      
      <!-- Featured Cards Grid -->
      <div class="featured-cards-section apple-m-2xl">
        <h3 class="apple-text-title3 text-center apple-m-lg">Featured 카드</h3>
        <div class="featured-cards-grid">
          {#each mockRecentCards as card, index (card.id)}
            <div class="featured-card-wrapper">
              <HolographicCardV2
                frontImage={card.image}
                title={card.title}
                rarity={card.rarity === 'legendary' ? 'rare rainbow' : card.rarity === 'epic' ? 'rare holo v' : 'rare holo'}
                teamId={card.metadata.team === 'KIA 타이거즈' ? 'kia-tigers' : card.metadata.team === 'SSG 랜더스' ? 'ssg-landers' : 'lg-twins'}
                cardType={card.type === CardType.PLAYER ? 'player' : 
                         card.type === CardType.STADIUM ? 'stadium' : 
                         card.type === CardType.MOMENT ? 'moment' : 
                         card.type === CardType.SPECIAL ? 'achievement' : 'player'}
                animationSpeed={600 + (index * 100)}
                on:hover={(e) => console.log('Featured card hover:', e.detail)}
                on:click={(e) => handleCardClick(card)}
              />
            </div>
          {/each}
        </div>
      </div>
      
      <div class="community-categories apple-grid md:grid-cols-2 lg:grid-cols-4 apple-spacing-lg">
        <div class="apple-card apple-card-elevated category-card">
          <div class="category-icon">🔥</div>
          <h3 class="apple-text-headline">Hot 카드</h3>
          <p class="apple-text-callout apple-text-secondary">지금 인기 있는 카드들</p>
          <div class="category-stats">
            <span class="stat-badge">+127 오늘</span>
          </div>
        </div>
        
        <div class="apple-card apple-card-elevated category-card">
          <div class="category-icon">✨</div>
          <h3 class="apple-text-headline">New 카드</h3>
          <p class="apple-text-callout apple-text-secondary">최신 업로드된 카드들</p>
          <div class="category-stats">
            <span class="stat-badge">+45 오늘</span>
          </div>
        </div>
        
        <div class="apple-card apple-card-elevated category-card">
          <div class="category-icon">📈</div>
          <h3 class="apple-text-headline">Rising 카드</h3>
          <p class="apple-text-callout apple-text-secondary">급상승 중인 카드들</p>
          <div class="category-stats">
            <span class="stat-badge">+89% 이번 주</span>
          </div>
        </div>
        
        <div class="apple-card apple-card-elevated category-card">
          <div class="category-icon">🏆</div>
          <h3 class="apple-text-headline">Top 컬렉션</h3>
          <p class="apple-text-callout apple-text-secondary">완성도 높은 컬렉션들</p>
          <div class="category-stats">
            <span class="stat-badge">234 완성</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- KBO Section Content -->
  <div slot="kbo" class="kbo-content-wrapper">
    <div class="apple-container">
      <div class="section-header text-center apple-m-2xl">
        <h2 class="apple-text-title1">Baseball 10개 구단</h2>
        <p class="apple-text-body apple-text-secondary">
          좋아하는 구단을 선택하고 전용 홀로그래픽 효과를 경험해보세요
        </p>
      </div>
      
      <div class="teams-showcase">
        <!-- Team Selection Grid -->
        <div class="teams-grid apple-grid grid-cols-2 md:grid-cols-5 apple-spacing-lg">
          {#each baseballTeams as team}
            <button 
              class="team-card apple-card"
              class:active={currentTeam === team.id}
              style="--team-color: {team.color}; --team-accent: {team.accent}"
              on:click={() => selectTeam(team.id)}
            >
              <div class="team-logo">⚾</div>
              <span class="team-name apple-text-callout">{team.name}</span>
            </button>
          {/each}
        </div>
        
        <!-- Team-specific Card Demo -->
        <div class="team-demo-section apple-m-2xl">
          <div class="team-demo-content">
            <div class="team-demo-info">
              {#each baseballTeams as team}
                {#if team.id === currentTeam}
                  <h3 class="apple-text-title2" style="color: {team.color}">
                    {team.name} 전용 홀로그래픽 효과
                  </h3>
                  <p class="apple-text-body apple-text-secondary">
                    {team.name}의 고유한 색상과 디자인이 적용된 특별한 홀로그래픽 카드를 경험해보세요.
                  </p>
                  <div class="team-details">
                    <div class="detail-item">
                      <span class="detail-label">홈구장:</span>
                      <span class="detail-value">{team.stadium}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">창단:</span>
                      <span class="detail-value">{team.founded}년</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">우승:</span>
                      <span class="detail-value">{team.achievements.championships}회</span>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
            
            <div class="team-demo-card">
              <HolographicCardV2
                frontImage="/api/placeholder/300/400"
                title="팀 전용 카드"
                rarity="rare holo"
                teamId={currentTeam}
                cardType="player"
                animationSpeed={500}
                on:hover={(e) => console.log('Team card hover:', e.detail)}
                on:click={(e) => console.log('Team card click:', e.detail)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="features-section apple-m-4xl">
        <div class="section-header text-center apple-m-2xl">
          <h2 class="apple-text-title1">프리미엄 홀로그래픽 기능</h2>
          <p class="apple-text-body apple-text-secondary">
            혁신적인 기술과 감동적인 야구 스토리텔링의 완벽한 조화
          </p>
        </div>
        
        <div class="features-grid apple-grid md:grid-cols-2 apple-spacing-xl">
          <div class="apple-card apple-card-elevated">
            <div class="feature-icon">✨</div>
            <h3 class="apple-text-title3">60fps 홀로그래픽 효과</h3>
            <p class="apple-text-callout apple-text-secondary">
              실물 카드 수준의 부드러운 홀로그래픽 애니메이션과<br>
              GPU 가속을 활용한 생생한 시각 효과
            </p>
          </div>
          
          <div class="apple-card apple-card-elevated">
            <div class="feature-icon">🎬</div>
            <h3 class="apple-text-title3">멀티미디어 스토리텔링</h3>
            <p class="apple-text-callout apple-text-secondary">
              사진, 동영상, 통계 데이터를 활용한<br>
              감동적인 야구 스토리 카드 제작
            </p>
          </div>
          
          <div class="apple-card apple-card-elevated">
            <div class="feature-icon">🏆</div>
            <h3 class="apple-text-title3">Baseball 팬 문화 반영</h3>
            <p class="apple-text-callout apple-text-secondary">
              구단별 응원 문화와 야구 덕후 등급 시스템으로<br>
              진정한 Baseball 팬 커뮤니티 경험
            </p>
          </div>
          
          <div class="apple-card apple-card-elevated">
            <div class="feature-icon">💎</div>
            <h3 class="apple-text-title3">희소성 & 거래 시스템</h3>
            <p class="apple-text-callout apple-text-secondary">
              실제 야구카드 문화를 반영한 등급 시스템과<br>
              안전한 카드 거래 마켓플레이스
            </p>
          </div>
        </div>
      </div>
      
      <div class="cta-section text-center apple-m-4xl">
        <h2 class="apple-text-title1">지금 시작하세요</h2>
        <p class="apple-text-body apple-text-secondary apple-m-lg">
          Baseball 야구의 감동적인 순간들을 홀로그래픽 카드로 만들어보세요
        </p>
        
        <div class="cta-actions flex justify-center apple-spacing-lg">
          <a href="/auth/signup" class="apple-btn apple-btn-primary apple-btn-large">
            무료로 시작하기
          </a>
          <a href="/realtime-preview-demo" class="apple-btn apple-btn-secondary apple-btn-large">
            실시간 미리보기 데모
          </a>
        </div>
      </div>
    </div>
  </div>
</MainPageLayout>

<style>
  /* Team Card Styles */
  .team-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--apple-spacing-md);
    padding: var(--apple-spacing-lg) var(--apple-spacing-md);
    cursor: pointer;
    transition: all var(--apple-transition-smooth);
    position: relative;
    overflow: hidden;
    border: 2px solid var(--apple-surface-border);
  }
  
  .team-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--team-color), var(--team-accent));
    opacity: 0;
    transition: opacity var(--apple-transition-smooth);
  }
  
  .team-card:hover::before,
  .team-card.active::before {
    opacity: 0.1;
  }
  
  .team-card:hover,
  .team-card.active {
    transform: translateY(-4px) scale(1.05);
    border-color: var(--team-color);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .team-logo {
    font-size: 32px;
    z-index: 1;
  }
  
  .team-card .team-name {
    font-weight: 600;
    text-align: center;
    z-index: 1;
    color: var(--apple-text-primary);
  }
  
  /* Team Showcase */
  .teams-showcase {
    margin: var(--apple-spacing-2xl) 0;
  }
  
  .team-demo-section {
    background: var(--apple-surface-primary);
    border-radius: var(--apple-radius-2xl);
    padding: var(--apple-spacing-2xl);
    border: 1px solid var(--apple-surface-border);
  }
  
  .team-demo-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--apple-spacing-2xl);
    align-items: center;
  }
  
  .team-demo-info h3 {
    margin-bottom: var(--apple-spacing-md);
    font-weight: 700;
  }
  
  .team-demo-info p {
    margin-bottom: var(--apple-spacing-lg);
    line-height: 1.6;
  }
  
  .team-details {
    display: flex;
    flex-direction: column;
    gap: var(--apple-spacing-sm);
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--apple-spacing-sm) 0;
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .detail-item:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    font-size: var(--apple-font-size-callout);
    color: var(--apple-text-secondary);
    font-weight: 500;
  }
  
  .detail-value {
    font-size: var(--apple-font-size-callout);
    color: var(--apple-text-primary);
    font-weight: 600;
  }
  
  .team-demo-card {
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
  }
  
  /* Feature Card Styles */
  .feature-icon {
    font-size: 48px;
    line-height: 1;
    margin-bottom: var(--apple-spacing-md);
  }
  
  /* CTA Section Styles */
  .cta-section {
    padding: var(--apple-spacing-4xl) 0;
    background: linear-gradient(135deg, 
      var(--apple-accent-blue) 0%, 
      var(--apple-accent-purple) 100%);
    border-radius: var(--apple-radius-2xl);
    margin: var(--apple-spacing-2xl) 0;
  }
  
  .cta-section h2 {
    color: white;
    margin-bottom: var(--apple-spacing-lg);
  }
  
  .cta-section p {
    color: rgba(255, 255, 255, 0.9);
  }
  
  /* Featured Cards Section */
  .featured-cards-section {
    margin: var(--apple-spacing-2xl) 0;
  }
  
  .featured-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--apple-spacing-xl);
    max-width: 900px;
    margin: 0 auto;
  }
  
  .featured-card-wrapper {
    transition: transform var(--apple-transition-smooth);
  }
  
  .featured-card-wrapper:hover {
    transform: translateY(-8px);
  }
  
  /* Community Categories */
  .community-categories {
    margin-top: var(--apple-spacing-2xl);
  }
  
  .category-card {
    text-align: center;
    padding: var(--apple-spacing-xl);
    transition: all var(--apple-transition-smooth);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .category-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--apple-accent-blue), var(--apple-accent-purple));
    transform: scaleX(0);
    transition: transform var(--apple-transition-smooth);
  }
  
  .category-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .category-card:hover::before {
    transform: scaleX(1);
  }
  
  .category-icon {
    font-size: 48px;
    margin-bottom: var(--apple-spacing-md);
    display: block;
  }
  
  .category-card h3 {
    margin-bottom: var(--apple-spacing-sm);
    color: var(--apple-text-primary);
  }
  
  .category-card p {
    margin-bottom: var(--apple-spacing-md);
  }
  
  .category-stats {
    margin-top: var(--apple-spacing-md);
  }
  
  .stat-badge {
    display: inline-block;
    background: var(--apple-accent-blue);
    color: white;
    padding: var(--apple-spacing-xs) var(--apple-spacing-sm);
    border-radius: var(--apple-radius-full);
    font-size: var(--apple-font-size-caption1);
    font-weight: var(--apple-font-weight-semibold);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: 1fr !important;
    }
    
    .cta-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .featured-cards-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--apple-spacing-lg);
    }
    
    .community-categories {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 480px) {
    .featured-cards-grid {
      grid-template-columns: 1fr;
    }
    
    .community-categories {
      grid-template-columns: 1fr !important;
    }
    
    .team-demo-content {
      grid-template-columns: 1fr !important;
      text-align: center;
    }
    
    .team-demo-section {
      padding: var(--apple-spacing-lg);
    }
  }
  
  @media (max-width: 768px) {
    .team-demo-content {
      grid-template-columns: 1fr;
      gap: var(--apple-spacing-xl);
      text-align: center;
    }
  }
</style>