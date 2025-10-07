# Design System V2 - Design Document

## Overview

생동감 있고 화려한 KBO 야구 카드 플랫폼을 위한 완전히 새로운 디자인 시스템입니다. Pokemon 홀로그래픽 카드의 프리미엄 효과와 KBO 10개 구단의 강렬한 컬러를 결합하여, 야구 팬들에게 잊을 수 없는 시각적 경험을 제공합니다.

## Design Principles

### 1. 생동감 (Vibrancy)
- 선명하고 강렬한 컬러 사용
- 높은 채도의 구단 컬러 활용
- 다크모드에서도 네온처럼 빛나는 효과

### 2. 화려함 (Flashiness)
- 홀로그래픽 무지개 스펙트럼
- 레이어드 광택 효과
- 다이나믹한 애니메이션

### 3. 몰입감 (Immersion)
- 실제 카드를 만지는 듯한 인터랙션
- 구단별 독특한 테마 경험
- 야구장 전광판의 흥분감

## Visual Design System

### Color System

#### KBO 구단 Primary Colors
```css
:root {
  /* LG 트윈스 - 강렬한 마젠타 */
  --kbo-lg-primary: #C30452;
  --kbo-lg-secondary: #CF95AD;
  --kbo-lg-gradient: linear-gradient(135deg, #C30452 0%, #ED2E7E 100%);

  /* 두산 베어스 - 깊은 네이비 */
  --kbo-doosan-primary: #131230;
  --kbo-doosan-secondary: #0D1D5C;
  --kbo-doosan-gradient: linear-gradient(135deg, #131230 0%, #1E3A8A 100%);

  /* KT 위즈 - 순수한 블랙 */
  --kbo-kt-primary: #000000;
  --kbo-kt-secondary: #E3000F;
  --kbo-kt-gradient: linear-gradient(135deg, #000000 0%, #1F1F1F 50%, #E3000F 100%);

  /* 삼성 라이온즈 - 로얄 블루 */
  --kbo-samsung-primary: #074CA1;
  --kbo-samsung-secondary: #4A90E2;
  --kbo-samsung-gradient: linear-gradient(135deg, #074CA1 0%, #0EA5E9 100%);

  /* NC 다이노스 - 럭셔리 골드 */
  --kbo-nc-primary: #B0976D;
  --kbo-nc-secondary: #D4AF37;
  --kbo-nc-gradient: linear-gradient(135deg, #B0976D 0%, #FFD700 100%);

  /* KIA 타이거즈 - 파이어 레드 */
  --kbo-kia-primary: #EA0029;
  --kbo-kia-secondary: #FF4D6D;
  --kbo-kia-gradient: linear-gradient(135deg, #EA0029 0%, #FF6B35 100%);

  /* 롯데 자이언츠 - 오션 네이비 */
  --kbo-lotte-primary: #041E42;
  --kbo-lotte-secondary: #0284C7;
  --kbo-lotte-gradient: linear-gradient(135deg, #041E42 0%, #0369A1 100%);

  /* SSG 랜더스 - 크림슨 레드 */
  --kbo-ssg-primary: #CE0E2D;
  --kbo-ssg-secondary: #FF4D6D;
  --kbo-ssg-gradient: linear-gradient(135deg, #CE0E2D 0%, #E11D48 100%);

  /* 한화 이글스 - 선셋 오렌지 */
  --kbo-hanwha-primary: #FF6600;
  --kbo-hanwha-secondary: #FFAA00;
  --kbo-hanwha-gradient: linear-gradient(135deg, #FF6600 0%, #FFAA00 100%);

  /* 키움 히어로즈 - 와인 버건디 */
  --kbo-kiwoom-primary: #820024;
  --kbo-kiwoom-secondary: #C41E3A;
  --kbo-kiwoom-gradient: linear-gradient(135deg, #820024 0%, #DC143C 100%);
}
```

#### Holographic Spectrum Colors
```css
:root {
  /* Rainbow Spectrum */
  --holo-red: #FF0048;
  --holo-orange: #FF6B35;
  --holo-yellow: #FFD700;
  --holo-green: #00FF88;
  --holo-cyan: #00F0FF;
  --holo-blue: #0080FF;
  --holo-purple: #A855F7;
  --holo-magenta: #FF00F7;

  /* Holographic Gradients */
  --holo-rainbow: linear-gradient(
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

  --holo-cosmic: radial-gradient(
    circle at center,
    #A855F7 0%,
    #0080FF 30%,
    #00F0FF 60%,
    #000033 100%
  );

  --holo-aurora: linear-gradient(
    180deg,
    #00FF88 0%,
    #00F0FF 30%,
    #0080FF 60%,
    #A855F7 100%
  );
}
```

#### Dark Mode Neon Colors
```css
:root[data-theme="dark"] {
  /* Background - Deep Space */
  --dark-bg-primary: #0a0a0f;
  --dark-bg-secondary: #12121a;
  --dark-bg-tertiary: #1a1a27;
  --dark-bg-gradient: radial-gradient(
    circle at top center,
    #1a1a27 0%,
    #12121a 50%,
    #0a0a0f 100%
  );

  /* Surface - Glass Morphism */
  --dark-surface: rgba(255, 255, 255, 0.05);
  --dark-surface-glass: rgba(255, 255, 255, 0.1);
  --dark-surface-glass-border: rgba(255, 255, 255, 0.2);

  /* Text - High Contrast */
  --dark-text-primary: #ffffff;
  --dark-text-secondary: #b4b4be;
  --dark-text-tertiary: #777785;
  --dark-text-glow: #00f0ff;

  /* Neon Accents */
  --neon-blue: #00f0ff;
  --neon-blue-glow: 0 0 20px rgba(0, 240, 255, 0.5);

  --neon-pink: #ff00f7;
  --neon-pink-glow: 0 0 20px rgba(255, 0, 247, 0.5);

  --neon-purple: #a855f7;
  --neon-purple-glow: 0 0 20px rgba(168, 85, 247, 0.5);

  --neon-green: #00ff88;
  --neon-green-glow: 0 0 20px rgba(0, 255, 136, 0.5);

  --neon-orange: #ff6b35;
  --neon-orange-glow: 0 0 20px rgba(255, 107, 53, 0.5);
}
```

### Typography System

#### Font Families
```css
:root {
  /* Display - 타이틀/헤드라인 */
  --font-display: 'Pretendard Variable', 'Gmarket Sans Bold', -apple-system, sans-serif;
  --font-display-weight: 700;
  --font-display-weight-black: 900;

  /* Body - 본문 */
  --font-body: 'Pretendard', 'Apple SD Gothic Neo', -apple-system, sans-serif;
  --font-body-weight-regular: 400;
  --font-body-weight-medium: 500;
  --font-body-weight-semibold: 600;

  /* Mono - 숫자/통계 */
  --font-mono: 'JetBrains Mono', 'D2Coding', 'SF Mono', monospace;
  --font-mono-weight: 500;

  /* Special - KBO 느낌 */
  --font-special: 'Jalnan', 'GmarketSans Bold', cursive;
  --font-special-weight: 700;
}
```

#### Type Scale
```css
:root {
  /* Display - 히어로 타이틀 */
  --text-display-xl: 5rem;      /* 80px - 메인 히어로 */
  --text-display-lg: 4rem;      /* 64px - 섹션 히어로 */
  --text-display-md: 3rem;      /* 48px - 서브 타이틀 */

  /* Heading - 제목 */
  --text-heading-xl: 2.5rem;    /* 40px - H1 */
  --text-heading-lg: 2rem;      /* 32px - H2 */
  --text-heading-md: 1.5rem;    /* 24px - H3 */
  --text-heading-sm: 1.25rem;   /* 20px - H4 */

  /* Body - 본문 */
  --text-body-lg: 1.125rem;     /* 18px - 큰 본문 */
  --text-body-md: 1rem;         /* 16px - 기본 본문 */
  --text-body-sm: 0.875rem;     /* 14px - 작은 본문 */
  --text-body-xs: 0.75rem;      /* 12px - 캡션 */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

#### Text Effects
```css
/* Gradient Text */
.text-gradient {
  background: var(--holo-rainbow);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease infinite;
}

/* Neon Glow Text */
.text-neon {
  color: var(--neon-blue);
  text-shadow:
    0 0 10px rgba(0, 240, 255, 0.5),
    0 0 20px rgba(0, 240, 255, 0.3),
    0 0 30px rgba(0, 240, 255, 0.1);
  animation: neon-pulse 2s ease-in-out infinite;
}

/* Stadium Display Style */
.text-stadium {
  font-family: var(--font-special);
  font-weight: var(--font-special-weight);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow:
    2px 2px 0px rgba(0, 0, 0, 0.5),
    0 0 20px currentColor;
}
```

## Component Design

### 1. Holographic Card Design

#### Card Structure
```svelte
<!-- UnifiedHolographicCard.svelte -->
<div class="card-container" data-size={size}>
  <div class="card-3d-wrapper">
    <!-- Front Face -->
    <div class="card-face card-front">
      <!-- Holographic Layers -->
      <div class="holo-layer holo-rainbow"></div>
      <div class="holo-layer holo-sparkle"></div>
      <div class="holo-layer holo-gradient"></div>

      <!-- Card Content -->
      <div class="card-image">
        <img src={card.image} alt={card.title} />
      </div>

      <!-- Card Info -->
      <div class="card-info">
        <h3 class="card-title text-gradient">{card.title}</h3>
        <div class="card-rarity" data-rarity={card.rarity}>
          {card.rarity}
        </div>
      </div>
    </div>

    <!-- Back Face -->
    <div class="card-face card-back" data-team={card.team}>
      <div class="card-back-pattern"></div>
      <div class="card-back-logo"></div>
      <div class="holo-layer holo-rainbow"></div>
    </div>
  </div>
</div>
```

#### Holographic Effect Styles (from how2code_v2.md)
```css
/* Base Card Container */
.card-container {
  perspective: 1000px;
  transform-style: preserve-3d;
  transition: transform 0.1s ease;
}

.card-3d-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-3d-wrapper.flipped {
  transform: rotateY(180deg);
}

/* Card Faces */
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.card-back {
  transform: rotateY(180deg);
}

/* Holographic Layers */
.holo-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-container:hover .holo-layer {
  opacity: 0.7;
}

/* Rainbow Holographic Effect */
.holo-rainbow {
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgb(255, 0, 72) 10%,
    rgb(255, 107, 53) 20%,
    rgb(255, 215, 0) 30%,
    rgb(0, 255, 136) 40%,
    rgb(0, 240, 255) 50%,
    rgb(0, 128, 255) 60%,
    rgb(168, 85, 247) 70%,
    rgb(255, 0, 247) 80%,
    transparent 90%
  );
  background-size: 200% 200%;
  filter: brightness(1.2) contrast(1.3);
  animation: holo-rainbow-flow 3s ease infinite;
}

@keyframes holo-rainbow-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Sparkle Effect */
.holo-sparkle {
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 2%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.6) 0%, transparent 2%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 2%),
    radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.5) 0%, transparent 2%),
    radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.7) 0%, transparent 2%);
  background-size: 100% 100%;
  animation: sparkle-twinkle 2s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* Dynamic Gradient Effect */
.holo-gradient {
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.8) 0%,
    rgba(0, 240, 255, 0.6) 20%,
    rgba(168, 85, 247, 0.4) 40%,
    transparent 70%
  );
  background-size: 200% 200%;
  mix-blend-mode: overlay;
}

/* Card Sizes */
.card-container[data-size="small"] {
  width: 200px;
  height: 280px;
}

.card-container[data-size="medium"] {
  width: 280px;
  height: 392px;
}

.card-container[data-size="large"] {
  width: 360px;
  height: 504px;
}

.card-container[data-size="featured"] {
  width: 480px;
  height: 672px;
}

/* Rarity Styles */
.card-rarity[data-rarity="common"] {
  background: linear-gradient(135deg, #888 0%, #AAA 100%);
}

.card-rarity[data-rarity="rare"] {
  background: var(--kbo-samsung-gradient);
  box-shadow: 0 0 20px rgba(7, 76, 161, 0.5);
}

.card-rarity[data-rarity="epic"] {
  background: var(--kbo-kiwoom-gradient);
  box-shadow: 0 0 20px rgba(130, 0, 36, 0.5);
}

.card-rarity[data-rarity="legendary"] {
  background: var(--holo-rainbow);
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 60px rgba(255, 215, 0, 0.3);
}
```

#### Interactive Holographic JavaScript
```typescript
// Enhanced holographic mouse tracking
function handleMouseMove(e: MouseEvent, cardElement: HTMLElement) {
  const rect = cardElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const percentX = (x / rect.width) * 100;
  const percentY = (y / rect.height) * 100;

  // 3D tilt effect
  const rotateX = ((y - centerY) / centerY) * 15; // -15 to 15 degrees
  const rotateY = ((x - centerX) / centerX) * 15;

  cardElement.style.transform = `
    perspective(1000px)
    rotateX(${-rotateX}deg)
    rotateY(${rotateY}deg)
    scale3d(1.05, 1.05, 1.05)
  `;

  // Update holographic gradient position
  cardElement.style.setProperty('--mouse-x', `${percentX}%`);
  cardElement.style.setProperty('--mouse-y', `${percentY}%`);
}

function handleMouseLeave(cardElement: HTMLElement) {
  cardElement.style.transform = '';
  cardElement.style.removeProperty('--mouse-x');
  cardElement.style.removeProperty('--mouse-y');
}
```

### 2. Main Page Layout Design

#### Page Structure
```svelte
<!-- IntegratedMainPage.svelte -->
<div class="main-page" data-theme={currentTheme}>
  <!-- Hero Section -->
  <section class="hero-section">
    <HeroCarousel cards={featuredCards} />
    <HeroTitle />
    <ScrollIndicator />
  </section>

  <!-- User Dashboard -->
  <section class="dashboard-section">
    <UserStats stats={userStats} />
    <CollectionProgress collections={collections} />
    <QuickActions />
  </section>

  <!-- KBO Teams Showcase -->
  <section class="teams-section">
    <SectionTitle>KBO 10구단</SectionTitle>
    <TeamsGrid teams={kboTeams} />
  </section>

  <!-- Community Feed -->
  <section class="feed-section">
    <FeedHeader />
    <MasonryFeed posts={communityFeed} />
  </section>

  <!-- Stats Dashboard -->
  <section class="stats-section">
    <GlobalStats />
    <LeaderboardPreview />
  </section>
</div>
```

#### Hero Section Design
```css
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  overflow: hidden;

  /* Animated Gradient Background */
  background:
    radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    var(--dark-bg-gradient);
  animation: hero-gradient-shift 10s ease infinite;
}

@keyframes hero-gradient-shift {
  0%, 100% {
    background-position: 0% 50%, 100% 50%, 50% 50%;
  }
  50% {
    background-position: 100% 50%, 0% 50%, 25% 75%;
  }
}

/* Hero Carousel */
.hero-carousel {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 600px;
  perspective: 2000px;
  transform-style: preserve-3d;
}

.hero-card {
  position: absolute;
  width: 400px;
  height: 560px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.hero-card:hover {
  transform: scale(1.1) translateZ(50px);
  z-index: 10;
}

/* 3D Carousel Positioning */
.hero-card:nth-child(1) {
  transform: translateX(-40%) translateZ(0px) rotateY(20deg);
}
.hero-card:nth-child(2) {
  transform: translateX(0%) translateZ(100px) rotateY(0deg);
  z-index: 5;
}
.hero-card:nth-child(3) {
  transform: translateX(40%) translateZ(0px) rotateY(-20deg);
}

/* Hero Title */
.hero-title {
  font-family: var(--font-special);
  font-size: var(--text-display-xl);
  font-weight: var(--font-special-weight);
  text-align: center;
  margin-top: 4rem;

  background: var(--holo-rainbow);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow: 0 0 60px rgba(255, 255, 255, 0.3);
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

#### KBO Teams Grid Design
```css
.teams-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .teams-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .teams-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.team-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 1.5rem;
  padding: 2rem;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  background: var(--dark-surface-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--dark-surface-glass-border);

  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.team-card:hover {
  transform: rotateY(10deg) rotateX(10deg) scale(1.05);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

/* Team-specific glow effects */
.team-card[data-team="lg"]:hover {
  box-shadow:
    0 20px 60px rgba(195, 4, 82, 0.4),
    0 0 40px rgba(195, 4, 82, 0.3) inset;
  border-color: var(--kbo-lg-primary);
}

.team-card[data-team="doosan"]:hover {
  box-shadow:
    0 20px 60px rgba(19, 18, 48, 0.4),
    0 0 40px rgba(13, 29, 92, 0.3) inset;
  border-color: var(--kbo-doosan-secondary);
}

/* ... (similar for all 10 teams) */

.team-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.2));
  transition: all 0.4s ease;
}

.team-card:hover .team-logo {
  transform: scale(1.1) translateZ(20px);
  filter: drop-shadow(0 8px 30px currentColor);
}

.team-name {
  font-family: var(--font-display);
  font-weight: var(--font-display-weight);
  font-size: var(--text-heading-md);
  color: var(--dark-text-primary);
  text-align: center;
}
```

#### Masonry Community Feed Design
```css
.masonry-feed {
  column-count: 4;
  column-gap: 1.5rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 1280px) {
  .masonry-feed { column-count: 3; }
}

@media (max-width: 768px) {
  .masonry-feed { column-count: 2; }
}

@media (max-width: 480px) {
  .masonry-feed { column-count: 1; }
}

.feed-item {
  break-inside: avoid;
  margin-bottom: 1.5rem;

  background: var(--dark-surface-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--dark-surface-glass-border);
  border-radius: 1rem;
  overflow: hidden;

  transition: all 0.3s ease;
  cursor: pointer;
}

.feed-item:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 0 2px var(--neon-blue);
}

.feed-item-image {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
}

.feed-item-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.8) 100%
  );
  pointer-events: none;
}

.feed-item-info {
  padding: 1rem;
}

.feed-item-title {
  font-family: var(--font-display);
  font-weight: var(--font-display-weight);
  font-size: var(--text-body-lg);
  color: var(--dark-text-primary);
  margin-bottom: 0.5rem;
}

.feed-item-stats {
  display: flex;
  gap: 1rem;
  font-size: var(--text-body-sm);
  color: var(--dark-text-secondary);
}

.feed-item-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.feed-item-stat:hover {
  color: var(--neon-blue);
}
```

### 3. Animation System

#### Entrance Animations
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Stagger Animation Class */
.stagger-item {
  animation: fade-in-up 0.6s ease-out backwards;
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
.stagger-item:nth-child(4) { animation-delay: 0.4s; }
.stagger-item:nth-child(5) { animation-delay: 0.5s; }
```

#### Hover Effects
```css
/* Ripple Effect */
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ripple-button:active::after {
  width: 300px;
  height: 300px;
}

/* Glow Pulse */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px currentColor;
  }
  50% {
    box-shadow: 0 0 40px currentColor, 0 0 60px currentColor;
  }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Shimmer Loading */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.0) 0%,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0.0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

#### Special Effects
```css
/* Confetti Burst */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  background: var(--holo-rainbow);
  animation: confetti-fall 3s linear infinite;
}

/* Lightning Flash */
@keyframes lightning-flash {
  0%, 100% { opacity: 0; }
  10%, 30%, 50% { opacity: 1; }
  20%, 40%, 60% { opacity: 0; }
}

.lightning-flash {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  animation: lightning-flash 1s ease-out;
}

/* Particle Burst */
@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: particle-burst 1s ease-out forwards;
}
```

## Accessibility

### Color Contrast
```css
/* WCAG 2.1 AA Compliant Contrast Ratios */
:root {
  --contrast-primary: 7.5:1;    /* AAA for normal text */
  --contrast-secondary: 4.5:1;  /* AA for large text */
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --dark-text-primary: #ffffff;
    --dark-text-secondary: #e0e0e0;
    --dark-bg-primary: #000000;
  }

  .card-container {
    border: 2px solid currentColor;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .holo-layer {
    display: none;
  }
}
```

### Keyboard Navigation
```css
/* Focus Visible Styles */
:focus-visible {
  outline: 2px solid var(--neon-blue);
  outline-offset: 4px;
  border-radius: 4px;
}

.card-container:focus-visible {
  outline: 3px solid var(--neon-blue);
  outline-offset: 8px;
  box-shadow: 0 0 0 4px rgba(0, 240, 255, 0.2);
}

/* Skip to Content Link */
.skip-to-content {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--neon-blue);
  color: var(--dark-bg-primary);
  padding: 1rem 2rem;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-to-content:focus {
  top: 0;
}
```

## Performance Optimization

### GPU Acceleration
```css
/* Force GPU Acceleration */
.card-container,
.holo-layer,
.card-3d-wrapper {
  transform: translateZ(0);
  will-change: transform;
}

/* Composite Layers */
.card-face {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Loading Strategy
```typescript
// Progressive Image Loading
interface ProgressiveImageProps {
  src: string;
  placeholder: string;
  alt: string;
}

function ProgressiveImage({ src, placeholder, alt }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div class="progressive-image">
      <img
        src={placeholder}
        alt={alt}
        class="placeholder"
        class:hidden={loaded}
      />
      <img
        src={src}
        alt={alt}
        class="full-image"
        class:visible={loaded}
        on:load={() => setLoaded(true)}
      />
    </div>
  );
}
```

### Lazy Loading
```svelte
<script>
  import { onMount } from 'svelte';

  let observer: IntersectionObserver;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load content
            entry.target.classList.add('loaded');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );

    document.querySelectorAll('.lazy-load').forEach(el => {
      observer.observe(el);
    });
  });
</script>
```

## Design Tokens Export

```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    kbo: {
      lg: { primary: '#C30452', secondary: '#CF95AD' },
      doosan: { primary: '#131230', secondary: '#0D1D5C' },
      kt: { primary: '#000000', secondary: '#E3000F' },
      samsung: { primary: '#074CA1', secondary: '#4A90E2' },
      nc: { primary: '#B0976D', secondary: '#D4AF37' },
      kia: { primary: '#EA0029', secondary: '#FF4D6D' },
      lotte: { primary: '#041E42', secondary: '#0284C7' },
      ssg: { primary: '#CE0E2D', secondary: '#FF4D6D' },
      hanwha: { primary: '#FF6600', secondary: '#FFAA00' },
      kiwoom: { primary: '#820024', secondary: '#C41E3A' },
    },
    neon: {
      blue: '#00f0ff',
      pink: '#ff00f7',
      purple: '#a855f7',
      green: '#00ff88',
      orange: '#ff6b35',
    },
  },
  typography: {
    fonts: {
      display: 'Pretendard Variable, Gmarket Sans Bold, sans-serif',
      body: 'Pretendard, Apple SD Gothic Neo, sans-serif',
      mono: 'JetBrains Mono, D2Coding, monospace',
      special: 'Jalnan, GmarketSans Bold, cursive',
    },
    sizes: {
      displayXl: '5rem',
      displayLg: '4rem',
      displayMd: '3rem',
      headingXl: '2.5rem',
      headingLg: '2rem',
      headingMd: '1.5rem',
      headingSm: '1.25rem',
      bodyLg: '1.125rem',
      bodyMd: '1rem',
      bodySm: '0.875rem',
      bodyXs: '0.75rem',
    },
  },
  animations: {
    durations: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.6s',
      slower: '1s',
    },
    easings: {
      easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;
```

---

이 디자인 문서는 생동감 있고 화려한 KBO 홀로그래픽 카드 플랫폼의 완전한 비주얼 시스템을 정의합니다. Pokemon 카드의 홀로그래픽 효과와 KBO 구단의 강렬한 컬러를 결합하여, 사용자에게 잊을 수 없는 프리미엄 경험을 제공합니다.
