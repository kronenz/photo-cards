<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let mounted = false;
  let currentTeam = 'lg';
  
  // KBO 구단 데이터
  const kboTeams = [
    { id: 'lg', name: 'LG 트윈스', color: '#c41e3a', accent: '#ff69b4' },
    { id: 'doosan', name: '두산 베어스', color: '#131230', accent: '#4169e1' },
    { id: 'kt', name: 'KT 위즈', color: '#000000', accent: '#ff0000' },
    { id: 'samsung', name: '삼성 라이온즈', color: '#074ca1', accent: '#87ceeb' },
    { id: 'lotte', name: '롯데 자이언츠', color: '#041e42', accent: '#c41e3a' },
    { id: 'kia', name: 'KIA 타이거즈', color: '#ea002c', accent: '#000000' },
    { id: 'nc', name: 'NC 다이노스', color: '#315288', accent: '#c4a484' },
    { id: 'hanwha', name: '한화 이글스', color: '#ff6600', accent: '#000000' },
    { id: 'ssg', name: 'SSG 랜더스', color: '#ce0e2d', accent: '#ffd700' },
    { id: 'kiwoom', name: '키움 히어로즈', color: '#570514', accent: '#ffd700' }
  ];
  
  onMount(() => {
    mounted = true;
    
    // 자동 구단 순환 (데모용)
    const interval = setInterval(() => {
      const currentIndex = kboTeams.findIndex(team => team.id === currentTeam);
      const nextIndex = (currentIndex + 1) % kboTeams.length;
      currentTeam = kboTeams[nextIndex].id;
    }, 3000);
    
    return () => clearInterval(interval);
  });
  
  function selectTeam(teamId: string) {
    currentTeam = teamId;
  }
</script>

<svelte:head>
  <title>KBO 홀로그래픽 카드 커뮤니티 - 야구의 감동을 카드로</title>
  <meta name="description" content="KBO 야구의 영광스러운 순간을 홀로그래픽 카드로 제작하고 공유하는 프리미엄 커뮤니티 플랫폼" />
</svelte:head>

<!-- 히어로 섹션 -->
<section class="hero-section">
  <div class="hero-content">
    <div class="hero-text">
      <h1 class="hero-title">
        <span class="title-line">KBO 야구의 영광스러운 순간을</span>
        <span class="title-line holographic-text">홀로그래픽 카드로</span>
        <span class="title-line">영원히 보존하세요</span>
      </h1>
      
      <p class="hero-description">
        프리미엄 디자인과 60fps 부드러운 홀로그래픽 효과로<br>
        감동적인 야구 스토리를 담은 나만의 카드를 제작하고 공유하세요.
      </p>
      
      <div class="hero-actions">
        <a href="/create" class="btn-apple btn-primary">
          카드 제작 시작하기
        </a>
        <a href="/gallery" class="btn-apple btn-secondary">
          갤러리 둘러보기
        </a>
      </div>
    </div>
    
    <div class="hero-visual">
      <div class="card-showcase">
        <div class="holographic-card demo-card" class:active={mounted}>
          <div class="card-content holographic-{currentTeam}">
            <div class="card-header">
              <span class="team-name">{kboTeams.find(t => t.id === currentTeam)?.name}</span>
              <span class="card-type">홀로그래픽</span>
            </div>
            
            <div class="card-image">
              <div class="player-silhouette">⚾</div>
            </div>
            
            <div class="card-footer">
              <span class="player-name">영광의 순간</span>
              <span class="card-rarity">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- KBO 구단 선택 섹션 -->
<section class="teams-section">
  <div class="section-header">
    <h2 class="section-title">KBO 10개 구단</h2>
    <p class="section-description">
      좋아하는 구단을 선택하고 전용 홀로그래픽 효과를 경험해보세요
    </p>
  </div>
  
  <div class="teams-grid">
    {#each kboTeams as team}
      <button 
        class="team-card"
        class:active={currentTeam === team.id}
        style="--team-color: {team.color}; --team-accent: {team.accent}"
        on:click={() => selectTeam(team.id)}
      >
        <div class="team-logo">⚾</div>
        <span class="team-name">{team.name}</span>
      </button>
    {/each}
  </div>
</section>

<!-- 기능 소개 섹션 -->
<section class="features-section">
  <div class="section-header">
    <h2 class="section-title">프리미엄 홀로그래픽 기능</h2>
    <p class="section-description">
      혁신적인 기술과 감동적인 야구 스토리텔링의 완벽한 조화
    </p>
  </div>
  
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">✨</div>
      <h3 class="feature-title">60fps 홀로그래픽 효과</h3>
      <p class="feature-description">
        실물 카드 수준의 부드러운 홀로그래픽 애니메이션과<br>
        GPU 가속을 활용한 생생한 시각 효과
      </p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">🎬</div>
      <h3 class="feature-title">멀티미디어 스토리텔링</h3>
      <p class="feature-description">
        사진, 동영상, 통계 데이터를 활용한<br>
        감동적인 야구 스토리 카드 제작
      </p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">🏆</div>
      <h3 class="feature-title">KBO 팬 문화 반영</h3>
      <p class="feature-description">
        구단별 응원 문화와 야구 덕후 등급 시스템으로<br>
        진정한 KBO 팬 커뮤니티 경험
      </p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">💎</div>
      <h3 class="feature-title">희소성 & 거래 시스템</h3>
      <p class="feature-description">
        실제 야구카드 문화를 반영한 등급 시스템과<br>
        안전한 카드 거래 마켓플레이스
      </p>
    </div>
  </div>
</section>

<!-- CTA 섹션 -->
<section class="cta-section">
  <div class="cta-content">
    <h2 class="cta-title">지금 시작하세요</h2>
    <p class="cta-description">
      KBO 야구의 감동적인 순간들을 홀로그래픽 카드로 만들어보세요
    </p>
    
    <div class="cta-actions">
      <a href="/auth/signup" class="btn-apple btn-primary large">
        무료로 시작하기
      </a>
      <a href="/realtime-preview-demo" class="btn-apple btn-secondary large">
        실시간 미리보기 데모
      </a>
    </div>
  </div>
</section>

<style>
  /* Hero Section */
  .hero-section {
    padding: 80px 0 120px;
    background: linear-gradient(135deg, 
      var(--apple-bg-primary) 0%, 
      var(--apple-bg-secondary) 50%, 
      var(--apple-bg-primary) 100%);
    overflow: hidden;
  }
  
  .hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .hero-text {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .title-line {
    display: block;
    animation: fade-in-up 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
    opacity: 0;
  }
  
  .title-line:nth-child(1) { animation-delay: 0.1s; }
  .title-line:nth-child(2) { animation-delay: 0.3s; }
  .title-line:nth-child(3) { animation-delay: 0.5s; }
  
  .holographic-text {
    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: holographic-shimmer 3s ease-in-out infinite,
               fade-in-up 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  }
  
  .hero-description {
    font-size: 20px;
    line-height: 1.6;
    color: var(--apple-text-secondary);
    margin: 0;
    animation: fade-in-up 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.7s forwards;
    opacity: 0;
  }
  
  .hero-actions {
    display: flex;
    gap: 20px;
    animation: fade-in-up 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.9s forwards;
    opacity: 0;
  }
  
  /* Hero Visual */
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
  }
  
  .card-showcase {
    position: relative;
  }
  
  .demo-card {
    width: 300px;
    height: 420px;
    transform: rotateY(-15deg) rotateX(5deg);
    transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
    animation: float 6s ease-in-out infinite;
  }
  
  .demo-card.active {
    transform: rotateY(0deg) rotateX(0deg) scale(1.05);
  }
  
  .card-content {
    width: 100%;
    height: 100%;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 20px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    position: relative;
    overflow: hidden;
  }
  
  .card-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.1) 0%,
      rgba(139, 92, 246, 0.1) 25%,
      rgba(236, 72, 153, 0.1) 50%,
      rgba(245, 87, 108, 0.1) 75%,
      transparent 100%);
    opacity: 0.8;
    animation: holographic-shimmer 4s ease-in-out infinite;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
  }
  
  .team-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--apple-text-primary);
  }
  
  .card-type {
    font-size: 12px;
    color: var(--apple-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .card-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  
  .player-silhouette {
    font-size: 80px;
    opacity: 0.8;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
  }
  
  .player-name {
    font-weight: 600;
    font-size: 18px;
    color: var(--apple-text-primary);
  }
  
  .card-rarity {
    color: #ffd700;
    font-size: 16px;
  }
  
  /* Teams Section */
  .teams-section {
    padding: 80px 0;
    background: var(--apple-bg-secondary);
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }
  
  .section-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 16px;
    color: var(--apple-text-primary);
  }
  
  .section-description {
    font-size: 20px;
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
  
  .teams-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .team-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 16px;
    background: var(--apple-surface-primary);
    border: 2px solid var(--apple-surface-border);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    position: relative;
    overflow: hidden;
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
    transition: opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .team-card:hover::before,
  .team-card.active::before {
    opacity: 0.1;
  }
  
  .team-card:hover,
  .team-card.active {
    transform: translateY(-4px) scale(1.05);
    border-color: var(--team-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .team-logo {
    font-size: 32px;
    z-index: 1;
  }
  
  .team-card .team-name {
    font-weight: 600;
    font-size: 14px;
    text-align: center;
    z-index: 1;
    color: var(--apple-text-primary);
  }
  
  /* Features Section */
  .features-section {
    padding: 80px 0;
    background: var(--apple-bg-primary);
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .feature-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 40px;
    background: var(--apple-surface-primary);
    border: 1px solid var(--apple-surface-border);
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--apple-shadow-xl);
  }
  
  .feature-icon {
    font-size: 48px;
    line-height: 1;
  }
  
  .feature-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: var(--apple-text-primary);
  }
  
  .feature-description {
    font-size: 16px;
    line-height: 1.6;
    color: var(--apple-text-secondary);
    margin: 0;
  }
  
  /* CTA Section */
  .cta-section {
    padding: 100px 0;
    background: linear-gradient(135deg, 
      var(--apple-accent-blue) 0%, 
      var(--apple-accent-purple) 100%);
    text-align: center;
  }
  
  .cta-content {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .cta-title {
    font-size: 48px;
    font-weight: 700;
    color: white;
    margin: 0 0 20px;
  }
  
  .cta-description {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 40px;
    line-height: 1.6;
  }
  
  .cta-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
  
  /* Button Styles */
  .btn-apple {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 28px;
    font-size: 17px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 12px;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    cursor: pointer;
    border: none;
    font-family: inherit;
  }
  
  .btn-apple:active {
    transform: scale(0.95);
  }
  
  .btn-primary {
    background: var(--apple-accent-blue);
    color: white;
  }
  
  .btn-primary:hover {
    background: color-mix(in srgb, var(--apple-accent-blue) 90%, black);
    transform: translateY(-2px);
    box-shadow: var(--apple-shadow-lg);
  }
  
  .btn-secondary {
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    border: 1px solid var(--apple-surface-border);
  }
  
  .btn-secondary:hover {
    background: var(--apple-surface-tertiary);
    transform: translateY(-2px);
  }
  
  .btn-apple.large {
    padding: 18px 36px;
    font-size: 18px;
  }
  
  /* Animations */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: rotateY(-15deg) rotateX(5deg) translateY(0px);
    }
    50% {
      transform: rotateY(-15deg) rotateX(5deg) translateY(-10px);
    }
  }
  
  @keyframes holographic-shimmer {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 60px;
      text-align: center;
    }
    
    .hero-title {
      font-size: clamp(2rem, 8vw, 3rem);
    }
    
    .hero-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .demo-card {
      width: 250px;
      height: 350px;
    }
    
    .teams-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    
    .cta-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .section-title {
      font-size: 36px;
    }
    
    .cta-title {
      font-size: 36px;
    }
  }
  
  @media (max-width: 480px) {
    .hero-section {
      padding: 60px 0 80px;
    }
    
    .teams-section,
    .features-section {
      padding: 60px 0;
    }
    
    .cta-section {
      padding: 80px 0;
    }
    
    .feature-card {
      padding: 32px 24px;
    }
  }
</style>