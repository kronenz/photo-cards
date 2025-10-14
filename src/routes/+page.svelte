<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut, cubicOut } from 'svelte/easing';
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
  import CollectionStack from '$lib/components/v2/CollectionStack.svelte';
  import ShowoffModal from '$lib/components/ShowoffModal.svelte';
  import CreateCardModal from '$lib/components/CreateCardModal.svelte';
  import FPSCounterOverlay from '$lib/components/FPSCounterOverlay.svelte';
  import SkipLinks from '$lib/components/SkipLinks.svelte';
  import { dev } from '$app/environment';
  import { fadeScale, flyTransition, bounceIn, staggerDelay } from '$lib/transitions/page-transitions';

  // Animation control
  let mounted = false;

  onMount(() => {
    // Trigger animations after mount
    setTimeout(() => {
      mounted = true;
    }, 50);
  });

  // KBO 10개 구단 데이터
  const teams = [
    {
      id: 'lg',
      name: 'LG 트윈스',
      shortName: 'LG',
      color: '#C30452',
      secondary: '#8B0036',
      description: '잠실의 전설, 승리의 쌍둥이'
    },
    {
      id: 'doosan',
      name: '두산 베어스',
      shortName: '두산',
      color: '#131230',
      secondary: '#1C1C3A',
      description: '잠실의 지배자, 베어스 왕국'
    },
    {
      id: 'kt',
      name: 'KT 위즈',
      shortName: 'KT',
      color: '#000000',
      secondary: '#444444',
      description: '수원의 마법사들'
    },
    {
      id: 'samsung',
      name: '삼성 라이온즈',
      shortName: '삼성',
      color: '#074CA1',
      secondary: '#053A7A',
      description: '대구의 자랑, 라이온의 후예'
    },
    {
      id: 'nc',
      name: 'NC 다이노스',
      shortName: 'NC',
      color: '#B0976D',
      secondary: '#8B7355',
      description: '창원의 공룡, 새로운 강자'
    },
    {
      id: 'kia',
      name: 'KIA 타이거즈',
      shortName: 'KIA',
      color: '#EA0029',
      secondary: '#B8001F',
      description: '호랑이의 기백, 광주의 자부심'
    },
    {
      id: 'lotte',
      name: '롯데 자이언츠',
      shortName: '롯데',
      color: '#041E42',
      secondary: '#002A54',
      description: '부산의 갈매기, 바다의 거인'
    },
    {
      id: 'ssg',
      name: 'SSG 랜더스',
      shortName: 'SSG',
      color: '#CE0E2D',
      secondary: '#A00B24',
      description: '인천의 새로운 전설'
    },
    {
      id: 'hanwha',
      name: '한화 이글스',
      shortName: '한화',
      color: '#FF6600',
      secondary: '#CC5200',
      description: '대전의 독수리, 불굴의 의지'
    },
    {
      id: 'kiwoom',
      name: '키움 히어로즈',
      shortName: '키움',
      color: '#820024',
      secondary: '#5C001A',
      description: '서울의 영웅들'
    }
  ];

  type TeamId = 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom';

  // 선택된 팀 상태 관리
  let selectedTeam: TeamId | null = null;

  // 팀 선택 핸들러
  function selectTeam(teamId: TeamId) {
    if (selectedTeam === teamId) {
      selectedTeam = null; // 같은 팀 클릭 시 선택 해제
    } else {
      selectedTeam = teamId;
    }
  }

  // 선택된 팀의 테마 정보 가져오기
  $: selectedTeamData = selectedTeam ? teams.find(t => t.id === selectedTeam) : null;

  // 자랑하기 모달 상태
  let showoffModalOpen = false;

  // 카드 만들기 모달 상태
  let createCardModalOpen = false;

  // 사용자가 만든 카드 목록
  let myCreatedCards: any[] = [];

  // 사용자 보유 카드 (데모용)
  const myCards = [
    { team: 'lg' as TeamId, title: '오지환', subtitle: '내야수', number: '6', image: 'https://picsum.photos/400/560?random=1', rarity: 'legendary' as const },
    { team: 'samsung' as TeamId, title: '구자욱', subtitle: '외야수', number: '5', image: 'https://picsum.photos/400/560?random=2', rarity: 'legendary' as const },
    { team: 'kia' as TeamId, title: '김도영', subtitle: '내야수', number: '5', image: 'https://picsum.photos/400/560?random=3', rarity: 'legendary' as const },
    { team: 'doosan' as TeamId, title: '양의지', subtitle: '포수', number: '25', image: 'https://picsum.photos/400/560?random=11', rarity: 'epic' as const },
    { team: 'kt' as TeamId, title: '강백호', subtitle: '외야수', number: '50', image: 'https://picsum.photos/400/560?random=12', rarity: 'epic' as const },
    { team: 'nc' as TeamId, title: '박민우', subtitle: '내야수', number: '23', image: 'https://picsum.photos/400/560?random=14', rarity: 'rare' as const },
    { team: 'lotte' as TeamId, title: '박세웅', subtitle: '투수', number: '37', image: 'https://picsum.photos/400/560?random=16', rarity: 'rare' as const },
    { team: 'ssg' as TeamId, title: '추신수', subtitle: '외야수', number: '0', image: 'https://picsum.photos/400/560?random=17', rarity: 'rare' as const },
  ];

  function handleShowoffSubmit(event: CustomEvent) {
    console.log('자랑하기 제출:', event.detail);
    // TODO: 실제 API 호출로 커뮤니티 피드에 게시
    alert('카드 자랑하기가 성공적으로 게시되었습니다! 🎉');
  }

  function handleCreateCard(event: CustomEvent) {
    const cardData = event.detail;
    console.log('카드 생성:', cardData);

    // 생성된 카드를 목록에 추가
    myCreatedCards = [{
      team: cardData.team,
      title: cardData.title,
      subtitle: cardData.subtitle,
      number: cardData.number,
      image: cardData.image,
      rarity: cardData.rarity,
      description: cardData.description,
      tags: cardData.tags,
      createdAt: new Date().toISOString()
    }, ...myCreatedCards];

    // TODO: 실제 API 호출로 카드 저장
    alert('카드가 성공적으로 생성되었습니다! 🎉');
  }

  // 커뮤니티 피드 데이터
  const communityPosts = [
    {
      id: 1,
      card: { team: 'lg' as TeamId, title: '오지환', subtitle: '내야수', number: '6', image: 'https://picsum.photos/400/560?random=50', rarity: 'legendary' as const },
      author: { username: 'LG팬123', avatar: '👤' },
      message: '드디어 레전더리 오지환 카드 획득! 🎉',
      stats: { likes: 127, comments: 23, reactions: 45 },
      tags: ['#레전더리', '#LG트윈스', '#오지환'],
      createdAt: '2시간 전'
    },
    {
      id: 2,
      card: { team: 'kia' as TeamId, title: '김도영', subtitle: '내야수', number: '5', image: 'https://picsum.photos/400/560?random=51', rarity: 'legendary' as const },
      author: { username: '타이거즈팬', avatar: '👤' },
      message: '신인왕 김도영 카드 컬렉션 완성! 💪',
      stats: { likes: 98, comments: 17, reactions: 34 },
      tags: ['#레전더리', '#KIA타이거즈', '#김도영'],
      createdAt: '5시간 전'
    },
    {
      id: 3,
      card: { team: 'samsung' as TeamId, title: '구자욱', subtitle: '외야수', number: '5', image: 'https://picsum.photos/400/560?random=52', rarity: 'legendary' as const },
      author: { username: '라이온즈킹', avatar: '👤' },
      message: '2024 골든글러브 구자욱 카드 자랑 ⚾',
      stats: { likes: 156, comments: 31, reactions: 62 },
      tags: ['#레전더리', '#삼성라이온즈', '#구자욱'],
      createdAt: '1일 전'
    },
  ];

  // 피드 필터 상태
  let feedFilter: 'all' | 'popular' | 'recent' | 'rare' = 'all';

  // 필터링된 게시물
  $: filteredPosts = communityPosts.filter(post => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'popular') return post.stats.likes > 100;
    if (feedFilter === 'recent') return true; // 최신순은 기본 정렬
    if (feedFilter === 'rare') return post.card.rarity === 'legendary' || post.card.rarity === 'epic';
    return true;
  });

  // Hero 섹션 Featured 카드 데이터
  const heroCards = [
    { team: 'lg' as TeamId, player: '오지환', subtitle: '내야수', number: '6', image: 'https://picsum.photos/400/560?random=1', rarity: 'legendary' as const },
    { team: 'samsung' as TeamId, player: '구자욱', subtitle: '외야수', number: '5', image: 'https://picsum.photos/400/560?random=2', rarity: 'legendary' as const },
    { team: 'kia' as TeamId, player: '김도영', subtitle: '내야수', number: '5', image: 'https://picsum.photos/400/560?random=3', rarity: 'legendary' as const },
  ];

  // 컬렉션 데이터
  const collections = [
    {
      title: "2024 레전드 컬렉션",
      description: "역대 최고의 선수들을 한 자리에",
      progress: 85,
      cards: [
        { image: 'https://picsum.photos/400/560?random=20', title: '박찬호', subtitle: '투수', rarity: 'legendary' as const, team: 'lg' as TeamId, number: '61' },
        { image: 'https://picsum.photos/400/560?random=21', title: '이승엽', subtitle: '내야수', rarity: 'legendary' as const, team: 'samsung' as TeamId, number: '10' },
        { image: 'https://picsum.photos/400/560?random=22', title: '김병현', subtitle: '투수', rarity: 'legendary' as const, team: 'lg' as TeamId, number: '51' },
        { image: 'https://picsum.photos/400/560?random=23', title: '선동열', subtitle: '투수', rarity: 'legendary' as const, team: 'lotte' as TeamId, number: '21' },
        { image: 'https://picsum.photos/400/560?random=24', title: '최동원', subtitle: '투수', rarity: 'legendary' as const, team: 'lotte' as TeamId, number: '11' },
        { image: 'https://picsum.photos/400/560?random=25', title: '장성호', subtitle: '포수', rarity: 'legendary' as const, team: 'doosan' as TeamId, number: '22' },
      ]
    },
    {
      title: "2024 신인왕 후보",
      description: "미래를 이끌 새로운 스타들",
      progress: 60,
      cards: [
        { image: 'https://picsum.photos/400/560?random=30', title: '김영웅', subtitle: '투수', rarity: 'epic' as const, team: 'doosan' as TeamId, number: '19' },
        { image: 'https://picsum.photos/400/560?random=31', title: '문보경', subtitle: '외야수', rarity: 'epic' as const, team: 'hanwha' as TeamId, number: '33' },
        { image: 'https://picsum.photos/400/560?random=32', title: '유영찬', subtitle: '내야수', rarity: 'epic' as const, team: 'kia' as TeamId, number: '44' },
        { image: 'https://picsum.photos/400/560?random=33', title: '윤동희', subtitle: '투수', rarity: 'epic' as const, team: 'kt' as TeamId, number: '38' },
        { image: 'https://picsum.photos/400/560?random=34', title: '김건희', subtitle: '내야수', rarity: 'epic' as const, team: 'ssg' as TeamId, number: '9' },
      ]
    },
    {
      title: "KBO 올스타 2024",
      description: "팬들이 선택한 최고의 선수들",
      progress: 70,
      cards: [
        { image: 'https://picsum.photos/400/560?random=40', title: '양현종', subtitle: '투수', rarity: 'rare' as const, team: 'kia' as TeamId, number: '54' },
        { image: 'https://picsum.photos/400/560?random=41', title: '김태균', subtitle: '내야수', rarity: 'rare' as const, team: 'hanwha' as TeamId, number: '32' },
        { image: 'https://picsum.photos/400/560?random=42', title: '박병호', subtitle: '내야수', rarity: 'rare' as const, team: 'kt' as TeamId, number: '52' },
        { image: 'https://picsum.photos/400/560?random=43', title: '김재환', subtitle: '내야수', rarity: 'rare' as const, team: 'doosan' as TeamId, number: '27' },
        { image: 'https://picsum.photos/400/560?random=44', title: '나성범', subtitle: '외야수', rarity: 'rare' as const, team: 'nc' as TeamId, number: '17' },
        { image: 'https://picsum.photos/400/560?random=45', title: '최정', subtitle: '내야수', rarity: 'rare' as const, team: 'ssg' as TeamId, number: '14' },
      ]
    },
  ];

  // KBO 10개 구단 쇼케이스 카드
  const showcaseCards = [
    { team: 'lg' as TeamId, player: '오지환', subtitle: '내야수', number: '6', image: 'https://picsum.photos/400/560?random=10' },
    { team: 'doosan' as TeamId, player: '양의지', subtitle: '포수', number: '25', image: 'https://picsum.photos/400/560?random=11' },
    { team: 'kt' as TeamId, player: '강백호', subtitle: '외야수', number: '50', image: 'https://picsum.photos/400/560?random=12' },
    { team: 'samsung' as TeamId, player: '구자욱', subtitle: '외야수', number: '5', image: 'https://picsum.photos/400/560?random=13' },
    { team: 'nc' as TeamId, player: '박민우', subtitle: '내야수', number: '23', image: 'https://picsum.photos/400/560?random=14' },
    { team: 'kia' as TeamId, player: '김도영', subtitle: '내야수', number: '5', image: 'https://picsum.photos/400/560?random=15' },
    { team: 'lotte' as TeamId, player: '박세웅', subtitle: '투수', number: '37', image: 'https://picsum.photos/400/560?random=16' },
    { team: 'ssg' as TeamId, player: '추신수', subtitle: '외야수', number: '0', image: 'https://picsum.photos/400/560?random=17' },
    { team: 'hanwha' as TeamId, player: '노시환', subtitle: '내야수', number: '31', image: 'https://picsum.photos/400/560?random=18' },
    { team: 'kiwoom' as TeamId, player: '이정후', subtitle: '외야수', number: '51', image: 'https://picsum.photos/400/560?random=19' },
  ];
</script>

<svelte:head>
  <title>홀로그래픽 카드 플랫폼 - Design System V2</title>
  <meta name="description" content="생동감 있고 화려한 KBO 야구 카드 컬렉션 플랫폼" />
</svelte:head>

<!-- Skip Links for Accessibility -->
<SkipLinks />

<div
  class="main-page"
  class:team-theme={selectedTeam !== null}
  style={selectedTeamData ? `--theme-primary: ${selectedTeamData.color}; --theme-secondary: ${selectedTeamData.secondary}` : ''}
>
  <!-- Hero Section -->
  <section class="hero-section">
    {#if mounted}
      <div class="hero-content" in:fly={{ y: 30, duration: 800, easing: quintOut, delay: 100 }}>
        <h1 class="hero-title">
          <span class="text-gradient">홀로그래픽 카드</span>
        </h1>
        <p class="hero-subtitle" in:fly={{ y: 20, duration: 700, easing: quintOut, delay: 200 }}>
          생동감 있고 화려한 야구 카드 컬렉션 플랫폼
        </p>
        <p class="hero-description" in:fly={{ y: 20, duration: 600, easing: quintOut, delay: 300 }}>
          홀로그래픽 효과 · KBO 10개 구단 · 프리미엄 카드 경험
        </p>

        <div class="hero-actions" in:scale={{ duration: 500, easing: quintOut, delay: 400 }}>
          <button class="create-card-btn" on:click={() => createCardModalOpen = true}>
            🎨 나만의 카드 만들기
          </button>
        </div>
      </div>

      <!-- Hero Cards Carousel -->
      <div class="hero-cards">
        {#each heroCards as card, i}
          <div
            class="hero-card"
            in:fly={{ y: 50, duration: 700, easing: cubicOut, delay: staggerDelay(i, 500, 100) }}
          >
            <UnifiedCard
              title={card.player}
              subtitle={card.subtitle}
              number={card.number}
              team={card.team}
              rarity={card.rarity}
              image={card.image}
              size="large"
            />
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- My Collection Dashboard -->
  <section id="main-collection" class="dashboard-section" tabindex="-1">
    {#if mounted}
      <div class="section-header" in:fly={{ y: 30, duration: 600, easing: quintOut, delay: 900 }}>
        <div class="header-content">
          <h2 class="section-title">나의 컬렉션 대시보드</h2>
          <p class="section-subtitle">최근 획득한 카드와 컬렉션 진행 상황을 확인하세요</p>
        </div>
        <button class="showoff-btn" on:click={() => showoffModalOpen = true}>
          ✨ 카드 자랑하기
        </button>
      </div>

      <div class="dashboard-grid">
        {#each [
          { icon: '🎴', value: '147', label: '총 보유 카드' },
          { icon: '⭐', value: '12', label: '레전더리 카드' },
          { icon: '🏆', value: '5/8', label: '완성 컬렉션' },
          { icon: '🔥', value: '7일', label: '연속 수집' }
        ] as stat, i}
          <div
            class="stat-card"
            in:scale={{ duration: 500, easing: cubicOut, delay: staggerDelay(i, 1000, 80) }}
          >
            <div class="stat-icon">{stat.icon}</div>
            <div class="stat-content">
              <div class="stat-value">{stat.value}</div>
              <div class="stat-label">{stat.label}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Collections Section -->
  <section id="main-content" class="collections-section" tabindex="-1">
    {#if mounted}
      <div class="section-header" in:fly={{ y: 30, duration: 600, easing: quintOut, delay: 1400 }}>
        <h2 class="section-title">나의 컬렉션</h2>
        <p class="section-subtitle">카드를 클릭하여 컬렉션을 펼쳐보세요</p>
      </div>

      <div class="collections-grid">
        {#each collections as collection, i}
          <div in:fly={{ x: -30, duration: 600, easing: cubicOut, delay: staggerDelay(i, 1600, 150) }}>
            <CollectionStack
              title={collection.title}
              description={collection.description}
              cards={collection.cards}
              progress={collection.progress}
            />
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- My Created Cards Section -->
  {#if myCreatedCards.length > 0}
    <section class="my-created-cards-section">
      <div class="section-header">
        <h2 class="section-title">🎨 내가 만든 카드</h2>
        <p class="section-subtitle">나만의 특별한 홀로그래픽 카드 컬렉션</p>
      </div>

      <div class="created-cards-grid">
        {#each myCreatedCards as card}
          <div class="created-card-wrapper">
            <UnifiedCard
              title={card.title}
              subtitle={card.subtitle}
              number={card.number}
              team={card.team}
              rarity={card.rarity}
              image={card.image}
              size="medium"
            />
            <div class="card-info">
              <p class="card-created-date">
                {new Date(card.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {#if card.tags && card.tags.length > 0}
                <div class="card-tags">
                  {#each card.tags.slice(0, 3) as tag}
                    <span class="card-tag">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Community Feed Section -->
  <section id="main-feed" class="community-feed-section" tabindex="-1">
    {#if mounted}
      <div class="section-header" in:fly={{ y: 30, duration: 600, easing: quintOut, delay: 2100 }}>
        <h2 class="section-title">커뮤니티 피드</h2>
        <p class="section-subtitle">팬들이 자랑하는 특별한 카드들</p>
      </div>

      <div class="feed-container">
        <div class="feed-filters" in:scale={{ duration: 400, easing: cubicOut, delay: 2300 }}>
          <button
            class="filter-btn"
            class:active={feedFilter === 'all'}
            on:click={() => feedFilter = 'all'}
          >
            전체
          </button>
          <button
            class="filter-btn"
            class:active={feedFilter === 'popular'}
            on:click={() => feedFilter = 'popular'}
          >
            인기
          </button>
          <button
            class="filter-btn"
            class:active={feedFilter === 'recent'}
            on:click={() => feedFilter = 'recent'}
          >
            최신
          </button>
          <button
            class="filter-btn"
            class:active={feedFilter === 'rare'}
            on:click={() => feedFilter = 'rare'}
          >
            희귀
          </button>
        </div>

        <div class="feed-grid">
          {#each filteredPosts as post, i (post.id)}
            <div
              class="feed-card"
              in:fly={{ x: -20, duration: 500, easing: cubicOut, delay: staggerDelay(i, 2500, 100) }}
            >
            <div class="feed-card-image">
              <UnifiedCard
                title={post.card.title}
                subtitle={post.card.subtitle}
                number={post.card.number}
                team={post.card.team}
                rarity={post.card.rarity}
                image={post.card.image}
                size="small"
              />

              <!-- 호버 시 상세 정보 오버레이 -->
              <div class="card-hover-overlay">
                <div class="overlay-stats">
                  <div class="overlay-stat">
                    <span class="stat-icon">❤️</span>
                    <span class="stat-number">{post.stats.likes}</span>
                  </div>
                  <div class="overlay-stat">
                    <span class="stat-icon">💬</span>
                    <span class="stat-number">{post.stats.comments}</span>
                  </div>
                  <div class="overlay-stat">
                    <span class="stat-icon">😍</span>
                    <span class="stat-number">{post.stats.reactions}</span>
                  </div>
                </div>
                <div class="overlay-tags">
                  {#each post.tags as tag}
                    <span class="overlay-tag">{tag}</span>
                  {/each}
                </div>
                <div class="overlay-time">{post.createdAt}</div>
              </div>
            </div>

            <div class="feed-card-content">
              <div class="feed-user">
                <div class="feed-avatar">{post.author.avatar}</div>
                <div class="feed-username">{post.author.username}</div>
              </div>
              <p class="feed-text">{post.message}</p>
              <div class="feed-actions">
                <button class="feed-action">❤️ {post.stats.likes}</button>
                <button class="feed-action">💬 {post.stats.comments}</button>
                <button class="feed-action">😍 {post.stats.reactions}</button>
              </div>
            </div>
          </div>
          {/each}
        </div>
      </div>
    {/if}
  </section>

  <!-- Live Activity Section -->
  <section class="activity-section">
    <div class="section-header">
      <h2 class="section-title">실시간 활동</h2>
      <p class="section-subtitle">지금 이 순간 일어나는 일들</p>
    </div>

    <div class="activity-feed">
      <div class="activity-item">
        <span class="activity-icon">✨</span>
        <span class="activity-text"><strong>야구매니아</strong>님이 레전더리 카드를 획득했습니다</span>
        <span class="activity-time">방금 전</span>
      </div>
      <div class="activity-item">
        <span class="activity-icon">🏆</span>
        <span class="activity-text"><strong>KBO러버</strong>님이 "2024 올스타" 컬렉션을 완성했습니다</span>
        <span class="activity-time">2분 전</span>
      </div>
      <div class="activity-item">
        <span class="activity-icon">🔥</span>
        <span class="activity-text"><strong>베어스팬</strong>님의 카드가 인기 급상승 중입니다</span>
        <span class="activity-time">5분 전</span>
      </div>
      <div class="activity-item">
        <span class="activity-icon">💝</span>
        <span class="activity-text"><strong>히어로즈</strong>님이 새로운 카드를 자랑했습니다</span>
        <span class="activity-time">8분 전</span>
      </div>
    </div>
  </section>

  <!-- KBO Team Selection Section -->
  <section id="main-teams" class="team-selection-section" tabindex="-1">
    <div class="section-header">
      <h2 class="section-title">나의 팀 선택하기</h2>
      <p class="section-subtitle">좋아하는 구단을 선택하면 구단 테마가 적용됩니다</p>
    </div>

    <div class="team-selection-grid">
      {#each teams as team}
        <button
          class="team-card"
          class:selected={selectedTeam === team.id}
          style="--team-color: {team.color}; --team-secondary: {team.secondary}"
          on:click={() => selectTeam(team.id)}
        >
          <div class="team-logo">
            <span class="team-initial">{team.shortName}</span>
          </div>
          <div class="team-info">
            <h3 class="team-name">{team.name}</h3>
            <p class="team-description">{team.description}</p>
          </div>
          {#if selectedTeam === team.id}
            <div class="selected-badge">✓</div>
          {/if}
        </button>
      {/each}
    </div>

    {#if selectedTeamData}
      <div class="selected-team-banner" style="background: linear-gradient(135deg, {selectedTeamData.color} 0%, {selectedTeamData.secondary} 100%);">
        <div class="banner-content">
          <h3>{selectedTeamData.name} 팬클럽에 오신 것을 환영합니다!</h3>
          <p>구단 테마가 활성화되었습니다. 메인 화면에서 {selectedTeamData.shortName} 컬러를 확인하세요.</p>
        </div>
      </div>
    {/if}
  </section>

  <!-- Teams Showcase Section -->
  <section class="teams-section">
    <div class="section-header">
      <h2 class="section-title">KBO 10개 구단 쇼케이스</h2>
      <p class="section-subtitle">각 구단의 고유한 컬러와 홀로그래픽 효과를 확인하세요</p>
    </div>

    <div class="teams-grid">
      {#each showcaseCards as card}
        <UnifiedCard
          title={card.player}
          subtitle={card.subtitle}
          number={card.number}
          team={card.team}
          rarity="legendary"
          image={card.image}
          size="medium"
        />
      {/each}
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <div class="section-header">
      <h2 class="section-title">포토카드 문화</h2>
      <p class="section-subtitle">KBO 야구 추억을 간직하는 특별한 방법</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">💝</div>
        <h3>소장의 즐거움</h3>
        <p>잊지 못할 야구 순간을 프리미엄 홀로그래픽 카드로 영원히 간직하세요</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🏆</div>
        <h3>컬렉션의 완성</h3>
        <p>시즌별, 선수별 카드를 모아 나만의 특별한 컬렉션을 완성하세요</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <h3>자랑의 순간</h3>
        <p>희귀하고 특별한 카드를 커뮤니티에 자랑하고 팬들과 공유하세요</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚾</div>
        <h3>응원의 증표</h3>
        <p>좋아하는 구단과 선수의 카드로 진정한 팬심을 표현하세요</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎁</div>
        <h3>기념품의 가치</h3>
        <p>홈런, 우승 등 역사적 순간을 담은 카드는 소중한 추억이 됩니다</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤝</div>
        <h3>팬 문화의 중심</h3>
        <p>카드 교환, 자랑하기로 KBO 팬들과 특별한 유대감을 형성하세요</p>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <h2>지금 시작하세요</h2>
    <p>KBO 야구의 감동적인 순간들을 홀로그래픽 카드로 경험해보세요</p>
    <div class="cta-buttons">
      <a href="/v2-prototype" class="cta-btn primary">프로토타입 보기</a>
      <a href="/gallery" class="cta-btn secondary">갤러리 둘러보기</a>
    </div>
  </section>
</div>

<!-- Showoff Modal -->
{#if showoffModalOpen}
  <div in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
    <ShowoffModal
      bind:show={showoffModalOpen}
      userCards={myCards}
      on:submit={handleShowoffSubmit}
    />
  </div>
{/if}

<!-- Create Card Modal -->
{#if createCardModalOpen}
  <div in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
    <CreateCardModal
      bind:show={createCardModalOpen}
      on:submit={handleCreateCard}
    />
  </div>
{/if}

<style>
  .main-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
      radial-gradient(circle at top center, #1a1a27 0%, #12121a 50%, #0a0a0f 100%);
    color: white;
    padding: 2rem;
  }

  /* Hero Section */
  .hero-section {
    min-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    gap: 4rem;
  }

  .hero-content {
    max-width: 900px;
  }

  .hero-title {
    font-family: 'Pretendard Variable', 'Gmarket Sans Bold', sans-serif;
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 900;
    margin: 0 0 1rem 0;
    line-height: 1;
  }

  .text-gradient {
    background: linear-gradient(
      90deg,
      #FF0048 0%,
      #FF6B35 14%,
      #FFD700 28%,
      #00FF88 42%,
      #00F0FF 57%,
      #0080FF 71%,
      #A855F7 85%,
      #FF00F7 100%
    );
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-shift 3s ease infinite;
  }

  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .hero-subtitle {
    font-size: clamp(1.125rem, 3vw, 1.5rem);
    color: #b4b4be;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }

  .hero-description {
    font-size: clamp(0.875rem, 2vw, 1rem);
    color: #777785;
    margin: 0;
  }

  .hero-cards {
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    max-width: 1200px;
  }

  .hero-card {
    animation: float 6s ease-in-out infinite;
  }

  .hero-card:nth-child(1) {
    animation-delay: 0s;
  }

  .hero-card:nth-child(2) {
    animation-delay: 2s;
  }

  .hero-card:nth-child(3) {
    animation-delay: 4s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  /* Section Common Styles */
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
  }

  .section-header .header-content {
    display: inline-block;
  }

  .showoff-btn {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.875rem 1.75rem;
    border-radius: 0.75rem;
    border: none;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
  }

  .showoff-btn:hover {
    transform: translateY(-50%) translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.5);
  }

  @media (max-width: 768px) {
    .section-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .showoff-btn {
      position: static;
      transform: none;
      width: 100%;
    }

    .showoff-btn:hover {
      transform: translateY(-2px);
    }
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: 700;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    font-size: 1.125rem;
    color: #b4b4be;
    margin: 0;
  }

  /* Dashboard Section */
  .dashboard-section {
    max-width: 1400px;
    margin: 0 auto 6rem;
    padding: 4rem 0;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.2);
  }

  .stat-icon {
    font-size: 3rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #b4b4be;
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Collections Section */
  .collections-section {
    max-width: 1600px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  /* My Created Cards Section */
  .my-created-cards-section {
    max-width: 1600px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  .created-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }

  .created-card-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-created-date {
    font-size: 0.875rem;
    color: #b4b4be;
    margin: 0;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .card-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
    border-radius: 0.5rem;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }

  @media (max-width: 1024px) {
    .created-cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .created-cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
  }

  .collections-grid {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  /* Community Feed Section */
  .community-feed-section {
    max-width: 1400px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  .feed-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .feed-filters {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: #b4b4be;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .filter-btn:hover {
    border-color: rgba(0, 240, 255, 0.5);
    background: rgba(0, 240, 255, 0.1);
    color: #00f0ff;
  }

  .filter-btn.active {
    border-color: #00f0ff;
    background: rgba(0, 240, 255, 0.2);
    color: #00f0ff;
  }

  .feed-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .feed-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .feed-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.2);
  }

  .feed-card-image {
    position: relative;
    width: 100%;
    aspect-ratio: 2/3;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
  }

  /* 호버 오버레이 */
  .card-hover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.5) 50%,
      rgba(0, 0, 0, 0.9) 100%
    );
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .feed-card:hover .card-hover-overlay {
    opacity: 1;
  }

  .overlay-stats {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
  }

  .overlay-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
  }

  .overlay-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .overlay-tag {
    padding: 0.375rem 0.75rem;
    background: rgba(0, 240, 255, 0.2);
    border: 1px solid rgba(0, 240, 255, 0.5);
    border-radius: 1rem;
    color: #00f0ff;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .overlay-time {
    text-align: center;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .feed-card-content {
    padding: 1.5rem;
  }

  .feed-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .feed-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .feed-username {
    font-weight: 600;
    color: white;
  }

  .feed-text {
    font-size: 0.875rem;
    color: #b4b4be;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .feed-actions {
    display: flex;
    gap: 1rem;
  }

  .feed-action {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: #b4b4be;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .feed-action:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.3);
    color: white;
  }

  @media (max-width: 1024px) {
    .feed-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .feed-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Activity Section */
  .activity-section {
    max-width: 1400px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  .activity-feed {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.3s ease;
  }

  .activity-item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  .activity-icon {
    font-size: 1.5rem;
  }

  .activity-text {
    flex: 1;
    font-size: 0.875rem;
    color: #b4b4be;
  }

  .activity-text strong {
    color: white;
    font-weight: 600;
  }

  .activity-time {
    font-size: 0.75rem;
    color: #777785;
  }

  /* Team Selection Section */
  .team-selection-section {
    max-width: 1400px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  .team-selection-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .team-card {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .team-card:hover {
    transform: translateY(-4px);
    border-color: var(--team-color);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  }

  .team-card.selected {
    border-color: var(--team-color);
    background: linear-gradient(135deg, var(--team-color) 0%, var(--team-secondary) 100%);
    box-shadow: 0 8px 30px var(--team-color);
  }

  .team-logo {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .team-card.selected .team-logo {
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
  }

  .team-initial {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .team-info {
    flex: 1;
  }

  .team-name {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: white;
  }

  .team-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .team-card.selected .team-description {
    color: rgba(255, 255, 255, 0.95);
  }

  .selected-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: white;
    color: var(--team-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .selected-team-banner {
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    animation: slideIn 0.5s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .banner-content h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: white;
  }

  .banner-content p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }

  @media (max-width: 1024px) {
    .team-selection-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Team Theme Applied to Main Page */
  .main-page.team-theme {
    background:
      radial-gradient(circle at 20% 30%, var(--theme-primary) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, var(--theme-secondary) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
      radial-gradient(circle at top center, #1a1a27 0%, #12121a 50%, #0a0a0f 100%);
  }

  .main-page.team-theme .section-title {
    background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .main-page.team-theme .stat-value {
    background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .main-page.team-theme .stat-card:hover,
  .main-page.team-theme .feature-card:hover,
  .main-page.team-theme .feed-card:hover {
    border-color: var(--theme-primary);
    box-shadow: 0 8px 30px var(--theme-primary);
  }

  .main-page.team-theme .filter-btn.active {
    border-color: var(--theme-primary);
    background: rgba(var(--theme-primary), 0.2);
    color: var(--theme-primary);
  }

  .main-page.team-theme .cta-btn.primary {
    background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  }

  /* Teams Section */
  .teams-section {
    max-width: 1600px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  .teams-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2rem;
    justify-items: center;
  }

  @media (max-width: 1400px) {
    .teams-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 1024px) {
    .teams-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 768px) {
    .teams-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .teams-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Features Section */
  .features-section {
    max-width: 1200px;
    margin: 0 auto 8rem;
    padding: 4rem 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.2);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: #b4b4be;
    margin: 0;
    line-height: 1.5;
  }

  /* CTA Section */
  .cta-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 6rem 2rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
  }

  .cta-section h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }

  .cta-section p {
    font-size: 1.125rem;
    color: #b4b4be;
    margin: 0 0 2rem 0;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-btn {
    padding: 1rem 2rem;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-block;
  }

  .cta-btn.primary {
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    color: white;
  }

  .cta-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.4);
  }

  .cta-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .create-card-btn {
    padding: 1.25rem 2.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    border: none;
    border-radius: 1rem;
    background: linear-gradient(135deg, #ff6b35 0%, #f7941d 50%, #ffd700 100%);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      0 4px 15px rgba(255, 107, 53, 0.3),
      0 0 30px rgba(255, 215, 0, 0.2);
    position: relative;
    overflow: hidden;
  }

  .create-card-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  .create-card-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 8px 25px rgba(255, 107, 53, 0.5),
      0 0 50px rgba(255, 215, 0, 0.4);
  }

  .create-card-btn:hover::before {
    left: 100%;
  }

  .create-card-btn:active {
    transform: translateY(-1px) scale(0.98);
  }

  .cta-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(0, 240, 255, 0.5);
    transform: translateY(-2px);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .main-page {
      padding: 1rem;
    }

    .hero-section {
      min-height: auto;
      padding: 3rem 1rem;
      gap: 2rem;
    }

    .hero-cards {
      gap: 1rem;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>

<!-- FPS Counter Overlay for Development Mode -->
{#if dev}
  <FPSCounterOverlay 
    enabled={true}
    position="top-right"
    updateInterval={100}
    showDetails={true}
    autoHide={false}
  />
{/if}
