<script lang="ts">
  import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';
  import CollectionStack from '$lib/components/v2/CollectionStack.svelte';

  const teams = [
    { id: 'lg', name: 'LG 트윈스', color: '#C30452' },
    { id: 'doosan', name: '두산 베어스', color: '#131230' },
    { id: 'kt', name: 'KT 위즈', color: '#000000' },
    { id: 'samsung', name: '삼성 라이온즈', color: '#074CA1' },
    { id: 'nc', name: 'NC 다이노스', color: '#B0976D' },
    { id: 'kia', name: 'KIA 타이거즈', color: '#EA0029' },
    { id: 'lotte', name: '롯데 자이언츠', color: '#041E42' },
    { id: 'ssg', name: 'SSG 랜더스', color: '#CE0E2D' },
    { id: 'hanwha', name: '한화 이글스', color: '#FF6600' },
    { id: 'kiwoom', name: '키움 히어로즈', color: '#820024' }
  ];

  const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];
  const sizes: Array<'small' | 'medium' | 'large' | 'featured'> = ['small', 'medium', 'large', 'featured'];

  let selectedTeam: 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom' = 'lg';
  let selectedRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'legendary';
  let selectedSize: 'small' | 'medium' | 'large' | 'featured' = 'large';

  const samplePlayers = [
    { name: "손흥민", subtitle: "외야수", number: "7", image: "https://picsum.photos/400/560?random=1" },
    { name: "김광현", subtitle: "투수", number: "29", image: "https://picsum.photos/400/560?random=2" },
    { name: "류현진", subtitle: "투수", number: "99", image: "https://picsum.photos/400/560?random=3" },
    { name: "이정후", subtitle: "외야수", number: "51", image: "https://picsum.photos/400/560?random=4" },
    { name: "김하성", subtitle: "내야수", number: "1", image: "https://picsum.photos/400/560?random=5" },
  ];

  let selectedPlayer = 0;

  // All 10 teams showcase
  const showcaseCards = [
    { team: 'lg', player: '오지환', subtitle: '내야수', number: '6', image: 'https://picsum.photos/400/560?random=10' },
    { team: 'doosan', player: '양의지', subtitle: '포수', number: '25', image: 'https://picsum.photos/400/560?random=11' },
    { team: 'kt', player: '강백호', subtitle: '외야수', number: '50', image: 'https://picsum.photos/400/560?random=12' },
    { team: 'samsung', player: '구자욱', subtitle: '외야수', number: '5', image: 'https://picsum.photos/400/560?random=13' },
    { team: 'nc', player: '박민우', subtitle: '내야수', number: '23', image: 'https://picsum.photos/400/560?random=14' },
    { team: 'kia', player: '김도영', subtitle: '내야수', number: '5', image: 'https://picsum.photos/400/560?random=15' },
    { team: 'lotte', player: '박세웅', subtitle: '투수', number: '37', image: 'https://picsum.photos/400/560?random=16' },
    { team: 'ssg', player: '추신수', subtitle: '외야수', number: '0', image: 'https://picsum.photos/400/560?random=17' },
    { team: 'hanwha', player: '노시환', subtitle: '내야수', number: '31', image: 'https://picsum.photos/400/560?random=18' },
    { team: 'kiwoom', player: '이정후', subtitle: '외야수', number: '51', image: 'https://picsum.photos/400/560?random=19' },
  ];

  // Collections data
  const collections = [
    {
      title: "2024 레전드 컬렉션",
      description: "역대 최고의 선수들을 한 자리에",
      progress: 85,
      cards: [
        { image: 'https://picsum.photos/400/560?random=20', title: '박찬호', subtitle: '투수', rarity: 'legendary' as const, team: 'lg' as const, number: '61' },
        { image: 'https://picsum.photos/400/560?random=21', title: '이승엽', subtitle: '내야수', rarity: 'legendary' as const, team: 'samsung' as const, number: '10' },
        { image: 'https://picsum.photos/400/560?random=22', title: '김병현', subtitle: '투수', rarity: 'legendary' as const, team: 'lg' as const, number: '51' },
        { image: 'https://picsum.photos/400/560?random=23', title: '선동열', subtitle: '투수', rarity: 'legendary' as const, team: 'lotte' as const, number: '21' },
        { image: 'https://picsum.photos/400/560?random=24', title: '최동원', subtitle: '투수', rarity: 'legendary' as const, team: 'lotte' as const, number: '11' },
        { image: 'https://picsum.photos/400/560?random=25', title: '장성호', subtitle: '포수', rarity: 'legendary' as const, team: 'doosan' as const, number: '22' },
      ]
    },
    {
      title: "2024 신인왕 후보",
      description: "미래를 이끌 새로운 스타들",
      progress: 60,
      cards: [
        { image: 'https://picsum.photos/400/560?random=30', title: '김영웅', subtitle: '투수', rarity: 'epic' as const, team: 'doosan' as const, number: '19' },
        { image: 'https://picsum.photos/400/560?random=31', title: '문보경', subtitle: '외야수', rarity: 'epic' as const, team: 'hanwha' as const, number: '33' },
        { image: 'https://picsum.photos/400/560?random=32', title: '유영찬', subtitle: '내야수', rarity: 'epic' as const, team: 'kia' as const, number: '44' },
        { image: 'https://picsum.photos/400/560?random=33', title: '윤동희', subtitle: '투수', rarity: 'epic' as const, team: 'kt' as const, number: '38' },
        { image: 'https://picsum.photos/400/560?random=34', title: '김건희', subtitle: '내야수', rarity: 'epic' as const, team: 'ssg' as const, number: '9' },
      ]
    },
    {
      title: "KBO 올스타 2024",
      description: "팬들이 선택한 최고의 선수들",
      progress: 70,
      cards: [
        { image: 'https://picsum.photos/400/560?random=40', title: '양현종', subtitle: '투수', rarity: 'rare' as const, team: 'kia' as const, number: '54' },
        { image: 'https://picsum.photos/400/560?random=41', title: '김태균', subtitle: '내야수', rarity: 'rare' as const, team: 'hanwha' as const, number: '32' },
        { image: 'https://picsum.photos/400/560?random=42', title: '박병호', subtitle: '내야수', rarity: 'rare' as const, team: 'kt' as const, number: '52' },
        { image: 'https://picsum.photos/400/560?random=43', title: '김재환', subtitle: '내야수', rarity: 'rare' as const, team: 'doosan' as const, number: '27' },
        { image: 'https://picsum.photos/400/560?random=44', title: '나성범', subtitle: '외야수', rarity: 'rare' as const, team: 'nc' as const, number: '17' },
        { image: 'https://picsum.photos/400/560?random=45', title: '최정', subtitle: '내야수', rarity: 'rare' as const, team: 'ssg' as const, number: '14' },
      ]
    },
  ];
</script>

<svelte:head>
  <title>Design System V2 - Pokemon Holographic Cards</title>
</svelte:head>

<div class="demo-page">
  <!-- Hero Section -->
  <section class="hero-section">
    <h1 class="hero-title">
      <span class="text-gradient">Design System V2</span>
    </h1>
    <p class="hero-subtitle">Pokemon 스타일 홀로그래픽 효과 + KBO 10개 구단 컬러</p>
    <p class="hero-description">
      how2code_v2.md 기반 · 앞면/뒷면 분리 · 실제 Pokemon 카드 CSS 적용
    </p>
  </section>

  <!-- Interactive Demo Section -->
  <section class="demo-section">
    <div class="card-showcase">
      <UnifiedCard
        title={samplePlayers[selectedPlayer].name}
        subtitle={samplePlayers[selectedPlayer].subtitle}
        number={samplePlayers[selectedPlayer].number}
        team={selectedTeam}
        rarity={selectedRarity}
        image={samplePlayers[selectedPlayer].image}
        size={selectedSize}
      />
    </div>

    <div class="controls-panel">
      <div class="control-group">
        <label>선수 선택</label>
        <div class="button-group">
          {#each samplePlayers as player, i}
            <button
              class="control-btn"
              class:active={selectedPlayer === i}
              on:click={() => selectedPlayer = i}
            >
              {player.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="control-group">
        <label>구단 선택</label>
        <div class="button-group team-grid">
          {#each teams as team}
            <button
              class="control-btn team-btn"
              class:active={selectedTeam === team.id}
              style="--team-color: {team.color}"
              on:click={() => selectedTeam = team.id}
            >
              {team.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="control-group">
        <label>희귀도 선택</label>
        <div class="button-group">
          {#each rarities as rarity}
            <button
              class="control-btn rarity-btn"
              class:active={selectedRarity === rarity}
              data-rarity={rarity}
              on:click={() => selectedRarity = rarity}
            >
              {rarity.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>

      <div class="control-group">
        <label>크기 선택</label>
        <div class="button-group">
          {#each sizes as size}
            <button
              class="control-btn"
              class:active={selectedSize === size}
              on:click={() => selectedSize = size}
            >
              {size.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Collections Section -->
  <section class="collections-section">
    <h2 class="section-title">나의 컬렉션</h2>
    <p class="section-subtitle">카드를 클릭하여 컬렉션을 펼쳐보세요</p>

    <div class="collections-grid">
      {#each collections as collection}
        <CollectionStack
          title={collection.title}
          description={collection.description}
          cards={collection.cards}
          progress={collection.progress}
        />
      {/each}
    </div>
  </section>

  <!-- Holographic Effects Showcase -->
  <section class="holographic-effects-section">
    <h2 class="section-title">🌈 홀로그래픽 효과 갤러리</h2>
    <p class="section-subtitle">Pokemon 카드 스타일 20+ 프리미엄 효과 컬렉션</p>

    <div class="effects-category">
      <h3 class="category-title">기본 효과</h3>
      <div class="effects-grid">
        <div class="effect-item">
          <UnifiedCard
            title="김도영"
            subtitle="내야수"
            number="5"
            team="kia"
            rarity="legendary"
            effectType="basic"
            image="https://picsum.photos/400/560?random=100"
            size="medium"
          />
          <p class="effect-name">Basic - 기본</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="양의지"
            subtitle="포수"
            number="25"
            team="doosan"
            rarity="legendary"
            effectType="holo"
            image="https://picsum.photos/400/560?random=101"
            size="medium"
          />
          <p class="effect-name">Holo - 홀로그래픽</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="강백호"
            subtitle="외야수"
            number="50"
            team="kt"
            rarity="legendary"
            effectType="reverse-holo"
            image="https://picsum.photos/400/560?random=102"
            size="medium"
          />
          <p class="effect-name">Reverse Holo - 리버스</p>
        </div>
      </div>
    </div>

    <div class="effects-category">
      <h3 class="category-title">프리미엄 효과</h3>
      <div class="effects-grid">
        <div class="effect-item">
          <UnifiedCard
            title="구자욱"
            subtitle="외야수"
            number="5"
            team="samsung"
            rarity="legendary"
            effectType="galaxy-holo"
            image="https://picsum.photos/400/560?random=103"
            size="medium"
          />
          <p class="effect-name">Galaxy Holo - 갤럭시</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="박민우"
            subtitle="내야수"
            number="23"
            team="nc"
            rarity="legendary"
            effectType="cosmos-holo"
            image="https://picsum.photos/400/560?random=104"
            size="medium"
          />
          <p class="effect-name">Cosmos Holo - 코스믹</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="추신수"
            subtitle="외야수"
            number="0"
            team="ssg"
            rarity="legendary"
            effectType="aurora"
            image="https://picsum.photos/400/560?random=105"
            size="medium"
          />
          <p class="effect-name">Aurora - 오로라</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="노시환"
            subtitle="내야수"
            number="31"
            team="hanwha"
            rarity="legendary"
            effectType="neon"
            image="https://picsum.photos/400/560?random=106"
            size="medium"
          />
          <p class="effect-name">Neon - 네온</p>
        </div>
      </div>
    </div>

    <div class="effects-category">
      <h3 class="category-title">레어 효과 (V/VMAX/VSTAR)</h3>
      <div class="effects-grid">
        <div class="effect-item">
          <UnifiedCard
            title="이정후"
            subtitle="외야수"
            number="51"
            team="kiwoom"
            rarity="legendary"
            effectType="v-regular"
            image="https://picsum.photos/400/560?random=107"
            size="medium"
          />
          <p class="effect-name">V Regular - V 카드</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="오지환"
            subtitle="내야수"
            number="6"
            team="lg"
            rarity="legendary"
            effectType="v-full-art"
            image="https://picsum.photos/400/560?random=108"
            size="medium"
          />
          <p class="effect-name">V Full Art - V 풀아트</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="박세웅"
            subtitle="투수"
            number="37"
            team="lotte"
            rarity="legendary"
            effectType="vmax"
            image="https://picsum.photos/400/560?random=109"
            size="medium"
          />
          <p class="effect-name">VMAX - VMAX</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="최정"
            subtitle="내야수"
            number="14"
            team="ssg"
            rarity="legendary"
            effectType="vstar"
            image="https://picsum.photos/400/560?random=110"
            size="medium"
          />
          <p class="effect-name">VSTAR - VSTAR</p>
        </div>
      </div>
    </div>

    <div class="effects-category">
      <h3 class="category-title">울트라 레어</h3>
      <div class="effects-grid">
        <div class="effect-item">
          <UnifiedCard
            title="김하성"
            subtitle="내야수"
            number="1"
            team="kt"
            rarity="legendary"
            effectType="rainbow"
            image="https://picsum.photos/400/560?random=111"
            size="medium"
          />
          <p class="effect-name">Rainbow - 레인보우</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="양현종"
            subtitle="투수"
            number="54"
            team="kia"
            rarity="legendary"
            effectType="rainbow-alt"
            image="https://picsum.photos/400/560?random=112"
            size="medium"
          />
          <p class="effect-name">Rainbow Alt - 레인보우 얼터</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="김광현"
            subtitle="투수"
            number="29"
            team="ssg"
            rarity="legendary"
            effectType="secret"
            image="https://picsum.photos/400/560?random=113"
            size="medium"
          />
          <p class="effect-name">Gold Secret - 골드 시크릿</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="박병호"
            subtitle="내야수"
            number="52"
            team="kt"
            rarity="legendary"
            effectType="radiant"
            image="https://picsum.photos/400/560?random=114"
            size="medium"
          />
          <p class="effect-name">Radiant - 래디언트</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="나성범"
            subtitle="외야수"
            number="17"
            team="nc"
            rarity="legendary"
            effectType="amazing-rare"
            image="https://picsum.photos/400/560?random=115"
            size="medium"
          />
          <p class="effect-name">Amazing Rare - 어메이징</p>
        </div>
      </div>
    </div>

    <div class="effects-category">
      <h3 class="category-title">트레이너 갤러리</h3>
      <div class="effects-grid">
        <div class="effect-item">
          <UnifiedCard
            title="김재환"
            subtitle="내야수"
            number="27"
            team="doosan"
            rarity="legendary"
            effectType="trainer-gallery-holo"
            image="https://picsum.photos/400/560?random=116"
            size="medium"
          />
          <p class="effect-name">Trainer Gallery Holo</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="김태균"
            subtitle="내야수"
            number="32"
            team="hanwha"
            rarity="legendary"
            effectType="trainer-gallery-v"
            image="https://picsum.photos/400/560?random=117"
            size="medium"
          />
          <p class="effect-name">Trainer Gallery V</p>
        </div>
        <div class="effect-item">
          <UnifiedCard
            title="손아섭"
            subtitle="내야수"
            number="7"
            team="lotte"
            rarity="legendary"
            effectType="trainer-full-art"
            image="https://picsum.photos/400/560?random=118"
            size="medium"
          />
          <p class="effect-name">Trainer Full Art</p>
        </div>
      </div>
    </div>
  </section>

  <!-- All Teams Showcase -->
  <section class="showcase-section">
    <h2 class="section-title">KBO 10개 구단 쇼케이스</h2>
    <p class="section-subtitle">각 구단의 고유한 컬러와 홀로그래픽 효과를 확인하세요</p>

    <div class="showcase-grid">
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
    <h2 class="section-title">주요 기능</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🌈</div>
        <h3>Pokemon 홀로그래픽</h3>
        <p>how2code_v2.md의 실제 Pokemon 카드 CSS 효과 적용</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h3>앞면/뒷면 분리</h3>
        <p>CardFront.svelte와 CardBack.svelte로 완전히 분리된 구조</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚾</div>
        <h3>KBO 10개 구단</h3>
        <p>각 구단별 고유 그라디언트와 뒷면 디자인</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <h3>20+ 홀로그래픽 효과</h3>
        <p>Pokemon 카드 스타일 기반 프리미엄 효과 컬렉션</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎮</div>
        <h3>3D 인터랙션</h3>
        <p>마우스/터치 추적 기반 실시간 3D 회전</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>GPU 가속</h3>
        <p>60fps 보장 및 transform3d 최적화</p>
      </div>
    </div>
  </section>

  <!-- Technical Details -->
  <section class="tech-section">
    <h2 class="section-title">기술 세부사항</h2>
    <div class="tech-grid">
      <div class="tech-card">
        <h4>컴포넌트 구조</h4>
        <ul>
          <li><code>UnifiedCard.svelte</code> - 카드 래퍼 및 3D 회전</li>
          <li><code>CardFront.svelte</code> - 앞면 (이미지 + 홀로그래픽)</li>
          <li><code>CardBack.svelte</code> - 뒷면 (구단 디자인)</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>홀로그래픽 효과 (20+ 타입)</h4>
        <ul>
          <li><strong>기본:</strong> Basic, Holo, Reverse Holo</li>
          <li><strong>프리미엄:</strong> Galaxy, Cosmos, Aurora, Neon</li>
          <li><strong>레어:</strong> V, V Full Art, VMAX, VSTAR</li>
          <li><strong>울트라:</strong> Rainbow, Gold Secret, Radiant, Amazing</li>
          <li><strong>트레이너:</strong> Gallery Holo, Gallery V, Full Art</li>
          <li>각 효과마다 고유한 intensity, colorShift, reflectionAngle 설정</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>인터랙션</h4>
        <ul>
          <li>마우스 오버: 3D 틸트 (±15도)</li>
          <li>클릭/탭: 카드 뒤집기 (180도 회전)</li>
          <li>터치: 모바일 제스처 지원</li>
          <li>키보드: Enter/Space로 뒤집기</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>성능 최적화</h4>
        <ul>
          <li>GPU 가속: transform3d, will-change</li>
          <li>레이어 분리: backface-visibility</li>
          <li>60fps 유지: requestAnimationFrame</li>
          <li>Reduced Motion: 접근성 지원</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Instructions -->
  <section class="instructions-section">
    <h3>사용 방법</h3>
    <div class="instructions-grid">
      <div class="instruction-item">
        <span class="instruction-number">1</span>
        <div class="instruction-content">
          <h4>마우스 오버</h4>
          <p>카드에 마우스를 올리면 3D 틸트 효과와 홀로그래픽 레이어가 활성화됩니다</p>
        </div>
      </div>
      <div class="instruction-item">
        <span class="instruction-number">2</span>
        <div class="instruction-content">
          <h4>클릭/탭</h4>
          <p>카드를 클릭하거나 탭하면 뒤집어져서 구단별 뒷면 디자인을 확인할 수 있습니다</p>
        </div>
      </div>
      <div class="instruction-item">
        <span class="instruction-number">3</span>
        <div class="instruction-content">
          <h4>컨트롤 변경</h4>
          <p>위의 버튼으로 선수, 구단, 희귀도, 크기를 실시간으로 변경할 수 있습니다</p>
        </div>
      </div>
      <div class="instruction-item">
        <span class="instruction-number">4</span>
        <div class="instruction-content">
          <h4>다른 카드 확인</h4>
          <p>아래로 스크롤하여 10개 구단의 다양한 카드를 확인하세요</p>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .demo-page {
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
    text-align: center;
    padding: 4rem 2rem 6rem;
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

  /* Demo Section */
  .demo-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1400px;
    margin: 0 auto 8rem;
    align-items: center;
  }

  @media (max-width: 1024px) {
    .demo-section {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }

  .card-showcase {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 600px;
  }

  .controls-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .control-group label {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #b4b4be;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .control-btn {
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .control-btn.active {
    background: rgba(0, 240, 255, 0.2);
    border-color: #00f0ff;
    color: #00f0ff;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  }

  .team-btn.active {
    background: var(--team-color);
    border-color: var(--team-color);
    color: white;
    box-shadow: 0 0 20px var(--team-color);
  }

  .rarity-btn[data-rarity="legendary"].active {
    background: linear-gradient(90deg, #FFD700, #FFA500);
    border-color: #FFD700;
  }

  .rarity-btn[data-rarity="epic"].active {
    background: #C41E3A;
    border-color: #C41E3A;
  }

  .rarity-btn[data-rarity="rare"].active {
    background: #0EA5E9;
    border-color: #0EA5E9;
  }

  /* Collections Section */
  .collections-section {
    max-width: 1600px;
    margin: 0 auto 8rem;
  }

  .collections-grid {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  /* Holographic Effects Section */
  .holographic-effects-section {
    max-width: 1600px;
    margin: 0 auto 8rem;
  }

  .effects-category {
    margin-bottom: 6rem;
  }

  .category-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    padding-left: 1rem;
    border-left: 4px solid #00f0ff;
    color: #00f0ff;
  }

  .effects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 3rem;
    justify-items: center;
  }

  .effect-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .effect-name {
    font-size: 1rem;
    font-weight: 600;
    color: #b4b4be;
    text-align: center;
    margin: 0;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 200px;
    transition: all 0.3s ease;
  }

  /* Make holographic effects always visible in gallery */
  .effect-item :global(.card__shine) {
    opacity: 0.5 !important;
  }

  .effect-item:hover :global(.card__shine) {
    opacity: 0.7 !important;
  }

  .effect-item:hover .effect-name {
    background: rgba(0, 240, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.3);
    color: #00f0ff;
    transform: translateY(-2px);
  }

  @media (max-width: 1200px) {
    .effects-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 2rem;
    }
  }

  @media (max-width: 768px) {
    .effects-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .category-title {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .effects-grid {
      grid-template-columns: 1fr;
    }

    .effects-category {
      margin-bottom: 4rem;
    }
  }

  /* Showcase Section */
  .showcase-section {
    max-width: 1600px;
    margin: 0 auto 8rem;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: 700;
    text-align: center;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    text-align: center;
    font-size: 1.125rem;
    color: #b4b4be;
    margin: 0 0 3rem 0;
  }

  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2rem;
    justify-items: center;
  }

  @media (max-width: 1400px) {
    .showcase-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 1024px) {
    .showcase-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 768px) {
    .showcase-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .showcase-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Features Section */
  .features-section {
    max-width: 1200px;
    margin: 0 auto 8rem;
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

  /* Tech Section */
  .tech-section {
    max-width: 1200px;
    margin: 0 auto 8rem;
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .tech-grid {
      grid-template-columns: 1fr;
    }
  }

  .tech-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
  }

  .tech-card h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #00f0ff;
  }

  .tech-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tech-card li {
    font-size: 0.875rem;
    color: #b4b4be;
    line-height: 1.6;
    padding-left: 1.5rem;
    position: relative;
  }

  .tech-card li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #00f0ff;
  }

  .tech-card code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #a855f7;
  }

  /* Instructions Section */
  .instructions-section {
    max-width: 1000px;
    margin: 0 auto;
  }

  .instructions-section h3 {
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    margin: 0 0 2rem 0;
    color: #00f0ff;
  }

  .instructions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .instructions-grid {
      grid-template-columns: 1fr;
    }
  }

  .instruction-item {
    display: flex;
    gap: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
  }

  .instruction-number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #00f0ff, #a855f7);
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .instruction-content h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: white;
  }

  .instruction-content p {
    font-size: 0.875rem;
    color: #b4b4be;
    margin: 0;
    line-height: 1.6;
  }
</style>
