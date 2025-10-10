<script lang="ts">
  import PrototypeHolographicCard from '$lib/components/PrototypeHolographicCard.svelte';

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

  let selectedTeam = 'lg';
  let selectedRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'legendary';
  let selectedSize: 'small' | 'medium' | 'large' | 'featured' = 'large';

  const samplePlayers = [
    { name: "손흥민", image: "https://picsum.photos/400/560?random=1" },
    { name: "김광현", image: "https://picsum.photos/400/560?random=2" },
    { name: "류현진", image: "https://picsum.photos/400/560?random=3" },
    { name: "이정후", image: "https://picsum.photos/400/560?random=4" },
    { name: "김하성", image: "https://picsum.photos/400/560?random=5" },
  ];

  let selectedPlayer = 0;
</script>

<svelte:head>
  <title>Design System V2 Prototype - Holographic Card</title>
</svelte:head>

<div class="demo-page">
  <!-- Hero Section -->
  <div class="hero-section">
    <h1 class="hero-title">
      <span class="text-gradient">Design System V2</span>
    </h1>
    <p class="hero-subtitle">생동감 있고 화려한 홀로그래픽 카드 프로토타입</p>
  </div>

  <!-- Main Demo Section -->
  <div class="demo-section">
    <div class="card-showcase">
      <PrototypeHolographicCard
        title={samplePlayers[selectedPlayer].name}
        team={selectedTeam}
        rarity={selectedRarity}
        image={samplePlayers[selectedPlayer].image}
        size={selectedSize}
      />
    </div>

    <div class="controls-panel">
      <div class="control-group">
        <label>선수</label>
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
        <label>구단</label>
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
        <label>희귀도</label>
        <div class="button-group">
          {#each rarities as rarity}
            <button
              class="control-btn"
              class:active={selectedRarity === rarity}
              on:click={() => selectedRarity = rarity}
            >
              {rarity.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>

      <div class="control-group">
        <label>크기</label>
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
  </div>

  <!-- Features Section -->
  <div class="features-section">
    <h2 class="section-title">주요 기능</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🌈</div>
        <h3>홀로그래픽 효과</h3>
        <p>Pokemon 카드 스타일의 프리미엄 무지개 스펙트럼 효과</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚾</div>
        <h3>KBO 10개 구단</h3>
        <p>각 구단의 고유한 컬러와 그라디언트 적용</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <h3>반짝임 효과</h3>
        <p>동적 스파클 애니메이션과 광택 효과</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎮</div>
        <h3>3D 인터랙션</h3>
        <p>마우스/터치 추적 기반 3D 틸트 효과</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h3>카드 뒤집기</h3>
        <p>클릭/탭으로 앞뒤 확인 가능</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>반응형 디자인</h3>
        <p>4가지 크기 옵션과 터치 지원</p>
      </div>
    </div>
  </div>

  <!-- Instructions -->
  <div class="instructions">
    <h3>사용 방법</h3>
    <ul>
      <li><strong>마우스 오버</strong>: 카드에 마우스를 올리면 3D 틸트 효과와 홀로그래픽 효과 활성화</li>
      <li><strong>클릭/탭</strong>: 카드를 클릭하면 앞뒤 뒤집기</li>
      <li><strong>컨트롤</strong>: 위의 버튼으로 선수, 구단, 희귀도, 크기 변경</li>
      <li><strong>성능</strong>: 모든 효과는 GPU 가속을 사용하여 60fps 유지</li>
    </ul>
  </div>
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

  .hero-section {
    text-align: center;
    padding: 4rem 2rem;
    margin-bottom: 4rem;
  }

  .hero-title {
    font-family: 'Pretendard Variable', 'Gmarket Sans Bold', sans-serif;
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 1rem 0;
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
    font-size: 1.5rem;
    color: #b4b4be;
    margin: 0;
  }

  .demo-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1400px;
    margin: 0 auto 6rem;
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

  .features-section {
    max-width: 1200px;
    margin: 0 auto 4rem;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 3rem 0;
    background: linear-gradient(135deg, #00f0ff 0%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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

  .instructions {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
  }

  .instructions h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #00f0ff;
  }

  .instructions ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .instructions li {
    font-size: 1rem;
    color: #b4b4be;
    line-height: 1.6;
    padding-left: 1.5rem;
    position: relative;
  }

  .instructions li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #00f0ff;
  }

  .instructions strong {
    color: white;
    font-weight: 600;
  }
</style>
