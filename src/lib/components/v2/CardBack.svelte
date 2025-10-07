<script lang="ts">
  export let team: 'lg' | 'doosan' | 'kt' | 'samsung' | 'nc' | 'kia' | 'lotte' | 'ssg' | 'hanwha' | 'kiwoom' = 'lg';

  const teamInfo = {
    lg: { name: 'LG 트윈스', fullName: 'LG TWINS', color: '#C30452' },
    doosan: { name: '두산 베어스', fullName: 'DOOSAN BEARS', color: '#131230' },
    kt: { name: 'KT 위즈', fullName: 'KT WIZ', color: '#000000' },
    samsung: { name: '삼성 라이온즈', fullName: 'SAMSUNG LIONS', color: '#074CA1' },
    nc: { name: 'NC 다이노스', fullName: 'NC DINOS', color: '#B0976D' },
    kia: { name: 'KIA 타이거즈', fullName: 'KIA TIGERS', color: '#EA0029' },
    lotte: { name: '롯데 자이언츠', fullName: 'LOTTE GIANTS', color: '#041E42' },
    ssg: { name: 'SSG 랜더스', fullName: 'SSG LANDERS', color: '#CE0E2D' },
    hanwha: { name: '한화 이글스', fullName: 'HANWHA EAGLES', color: '#FF6600' },
    kiwoom: { name: '키움 히어로즈', fullName: 'KIWOOM HEROES', color: '#820024' }
  };

  $: info = teamInfo[team];
</script>

<div class="card__back" data-team={team}>
  <!-- Background Pattern -->
  <div class="card__back-pattern"></div>

  <!-- Holographic Layer (same as front) -->
  <div class="card__back-shine"></div>

  <!-- Team Logo Section -->
  <div class="card__back-content">
    <!-- KBO Logo -->
    <div class="kbo-logo">
      <svg viewBox="0 0 100 100" class="logo-svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="3"/>
        <text x="50" y="58" text-anchor="middle" font-size="24" font-weight="900" fill="currentColor">KBO</text>
      </svg>
    </div>

    <!-- Team Name -->
    <div class="team-section">
      <h2 class="team-name-en">{info.fullName}</h2>
      <p class="team-name-kr">{info.name}</p>
    </div>

    <!-- Decorative Elements -->
    <div class="decorative-bars">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>

    <!-- Baseball Icon -->
    <div class="baseball-icon">
      <svg viewBox="0 0 100 100" class="baseball-svg">
        <circle cx="50" cy="50" r="40" fill="white" stroke="#ddd" stroke-width="2"/>
        <path d="M 20 35 Q 35 50 20 65" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>
        <path d="M 80 35 Q 65 50 80 65" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>
        <path d="M 35 20 Q 50 30 65 20" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>
        <path d="M 35 80 Q 50 70 65 80" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Edition Info -->
    <div class="edition-info">
      <span class="edition-text">2024 SEASON</span>
      <span class="edition-number">LIMITED EDITION</span>
    </div>
  </div>
</div>

<style>
  .card__back {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transform: rotateY(180deg);
    transform-style: preserve-3d;
    overflow: hidden;
  }

  /* Team-specific Gradients */
  .card__back[data-team="lg"] {
    background: linear-gradient(135deg, #C30452 0%, #8B0036 50%, #C30452 100%);
  }
  .card__back[data-team="doosan"] {
    background: linear-gradient(135deg, #131230 0%, #0D1D5C 50%, #1E3A8A 100%);
  }
  .card__back[data-team="kt"] {
    background: linear-gradient(135deg, #000000 0%, #1F1F1F 30%, #E3000F 70%, #000000 100%);
  }
  .card__back[data-team="samsung"] {
    background: linear-gradient(135deg, #074CA1 0%, #0369A1 50%, #0EA5E9 100%);
  }
  .card__back[data-team="nc"] {
    background: linear-gradient(135deg, #B0976D 0%, #8B7355 50%, #D4AF37 100%);
  }
  .card__back[data-team="kia"] {
    background: linear-gradient(135deg, #EA0029 0%, #B8001F 50%, #FF6B35 100%);
  }
  .card__back[data-team="lotte"] {
    background: linear-gradient(135deg, #041E42 0%, #0369A1 50%, #0284C7 100%);
  }
  .card__back[data-team="ssg"] {
    background: linear-gradient(135deg, #CE0E2D 0%, #991122 50%, #E11D48 100%);
  }
  .card__back[data-team="hanwha"] {
    background: linear-gradient(135deg, #FF6600 0%, #FF8833 50%, #FFAA00 100%);
  }
  .card__back[data-team="kiwoom"] {
    background: linear-gradient(135deg, #820024 0%, #5A001A 50%, #C41E3A 100%);
  }

  /* Background Pattern */
  .card__back-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image:
      repeating-linear-gradient(
        45deg,
        transparent 0px,
        transparent 20px,
        rgba(255, 255, 255, 0.1) 20px,
        rgba(255, 255, 255, 0.1) 40px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent 0px,
        transparent 20px,
        rgba(255, 255, 255, 0.05) 20px,
        rgba(255, 255, 255, 0.05) 40px
      );
  }

  /* Holographic Shine on Back */
  .card__back-shine {
    position: absolute;
    inset: 0;
    z-index: 2;
    opacity: 0;
    mix-blend-mode: overlay;
    background-image:
      linear-gradient(
        115deg,
        transparent 25%,
        rgba(255, 255, 255, 0.2) 45%,
        rgba(255, 255, 255, 0.35) 50%,
        rgba(255, 255, 255, 0.2) 55%,
        transparent 75%
      );
    background-size: 200% 200%;
    background-position: var(--posx, 50%) var(--posy, 50%);
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .card__back:hover .card__back-shine {
    opacity: 0.4;
  }

  /* Content */
  .card__back-content {
    position: relative;
    z-index: 10;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1.5rem;
  }

  /* KBO Logo */
  .kbo-logo {
    width: 80px;
    height: 80px;
    color: white;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  }

  .logo-svg {
    width: 100%;
    height: 100%;
  }

  /* Team Section */
  .team-section {
    text-align: center;
  }

  .team-name-en {
    font-family: 'Pretendard Variable', 'Gmarket Sans Bold', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    color: white;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.7),
      0 0 30px rgba(255, 255, 255, 0.3);
    line-height: 1;
  }

  .team-name-kr {
    font-family: 'Pretendard', sans-serif;
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
    letter-spacing: 0.15em;
  }

  /* Decorative Bars */
  .decorative-bars {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .bar {
    width: 40px;
    height: 3px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .bar:nth-child(2) {
    width: 60px;
    height: 4px;
  }

  /* Baseball Icon */
  .baseball-icon {
    width: 60px;
    height: 60px;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
  }

  .baseball-svg {
    width: 100%;
    height: 100%;
  }

  /* Edition Info */
  .edition-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .edition-text,
  .edition-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.1em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .edition-number {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Border Frame Effect */
  .card__back::before {
    content: '';
    position: absolute;
    inset: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    pointer-events: none;
    z-index: 5;
    box-shadow:
      inset 0 0 20px rgba(255, 255, 255, 0.1),
      0 0 20px rgba(0, 0, 0, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .card__back-content {
      padding: 1.5rem;
      gap: 1rem;
    }

    .kbo-logo {
      width: 60px;
      height: 60px;
    }

    .team-name-en {
      font-size: 1.5rem;
    }

    .team-name-kr {
      font-size: 1rem;
    }

    .baseball-icon {
      width: 50px;
      height: 50px;
    }
  }
</style>
