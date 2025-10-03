<script lang="ts">
  import { onMount } from 'svelte';
  import HolographicCardV2 from './HolographicCardV2.svelte';
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="main-page-layout" class:mounted>


  <!-- Main Content Area -->
  <main class="main-content">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <slot name="hero">
          <div class="hero-content-grid">
            <div class="hero-text-section">
              <h2 class="hero-title">
                <span class="title-line">Baseball 야구의 영광스러운 순간을</span>
                <span class="title-line holographic-text">홀로그래픽 카드로</span>
                <span class="title-line">영원히 보존하세요</span>
              </h2>
              <p class="hero-description">
                프리미엄 디자인과 60fps 부드러운 홀로그래픽 효과로<br>
                감동적인 야구 스토리를 담은 나만의 카드를 제작하고 공유하세요.
              </p>
              <div class="hero-actions">
                <a href="/create" class="apple-btn apple-btn-primary apple-btn-large">
                  카드 제작 시작하기
                </a>
                <a href="/gallery" class="apple-btn apple-btn-secondary apple-btn-large">
                  갤러리 둘러보기
                </a>
              </div>
            </div>
            
            <div class="hero-card-section">
              <div class="demo-card-container">
                <HolographicCardV2
                  frontImage="/api/placeholder/300/400"
                  title="영광의 순간"
                  rarity="rare holo"
                  teamId="lg-twins"
                  cardType="moment"
                  on:hover={(e) => console.log('Card hover:', e.detail)}
                  on:click={(e) => console.log('Card click:', e.detail)}
                />
              </div>
            </div>
          </div>
        </slot>
      </div>
    </section>

    <!-- Dashboard Section -->
    <section class="dashboard-section">
      <div class="section-container">
        <slot name="dashboard">
          <div class="dashboard-placeholder">
            <h3 class="section-title">컬렉션 대시보드</h3>
            <p class="section-description">사용자 컬렉션 현황이 여기에 표시됩니다.</p>
          </div>
        </slot>
      </div>
    </section>

    <!-- Community Feed Section -->
    <section class="community-section">
      <div class="section-container">
        <slot name="community">
          <div class="community-placeholder">
            <h3 class="section-title">커뮤니티 피드</h3>
            <p class="section-description">Civitai 스타일 커뮤니티 피드가 여기에 표시됩니다.</p>
          </div>
        </slot>
      </div>
    </section>

    <!-- KBO Teams Section -->
    <section class="kbo-section">
      <div class="section-container">
        <slot name="kbo">
          <div class="kbo-placeholder">
            <h3 class="section-title">KBO 구단</h3>
            <p class="section-description">10개 KBO 구단 섹션이 여기에 표시됩니다.</p>
          </div>
        </slot>
      </div>
    </section>
  </main>

  <!-- Apple-style Footer -->
  <footer class="main-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h4 class="footer-title">Baseball Cards</h4>
          <p class="footer-description">
            프리미엄 홀로그래픽 카드 컬렉션 플랫폼
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">기능</h4>
          <ul class="footer-links">
            <li><a href="/gallery">갤러리</a></li>
            <li><a href="/create">카드 제작</a></li>
            <li><a href="/community">커뮤니티</a></li>
            <li><a href="/collections">컬렉션</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">지원</h4>
          <ul class="footer-links">
            <li><a href="/help">도움말</a></li>
            <li><a href="/contact">문의하기</a></li>
            <li><a href="/privacy">개인정보처리방침</a></li>
            <li><a href="/terms">이용약관</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© 2024 Baseball Cards. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Main Layout Container */
  .main-page-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: theme('colors.apple.light.background.primary');
    color: theme('colors.apple.light.text.primary');
    font-family: theme('fontFamily.sans');
    opacity: 0;
    transition: opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .main-page-layout.mounted {
    opacity: 1;
  }
  

  
  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  /* Section Containers */
  .section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
  }
  
  /* Hero Section */
  .hero-section {
    padding: var(--apple-spacing-4xl) 0 var(--apple-spacing-3xl);
    background: linear-gradient(135deg, 
      var(--apple-bg-primary) 0%, 
      var(--apple-bg-secondary) 100%);
    overflow: hidden;
  }
  
  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--apple-spacing-lg);
  }
  
  .hero-content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--apple-spacing-4xl);
    align-items: center;
    min-height: 500px;
  }
  
  .hero-text-section {
    display: flex;
    flex-direction: column;
    gap: var(--apple-spacing-xl);
  }
  
  .hero-title {
    font-size: var(--apple-font-size-display1);
    font-weight: var(--apple-font-weight-bold);
    color: var(--apple-text-primary);
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.02em;
    display: flex;
    flex-direction: column;
    gap: var(--apple-spacing-sm);
  }
  
  .title-line {
    display: block;
    animation: apple-fade-in 0.8s var(--apple-transition-smooth) forwards;
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
               apple-fade-in 0.8s var(--apple-transition-smooth) forwards;
  }
  
  @keyframes holographic-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .hero-description {
    font-size: var(--apple-font-size-title2);
    color: var(--apple-text-secondary);
    margin: 0;
    line-height: 1.4;
    animation: apple-fade-in 0.8s var(--apple-transition-smooth) 0.7s forwards;
    opacity: 0;
  }
  
  .hero-actions {
    display: flex;
    gap: var(--apple-spacing-lg);
    animation: apple-fade-in 0.8s var(--apple-transition-smooth) 0.9s forwards;
    opacity: 0;
  }
  
  .hero-card-section {
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
  }
  
  .demo-card-container {
    width: 300px;
    max-width: 100%;
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  /* Dashboard Section */
  .dashboard-section {
    padding: 60px 0;
    background: theme('colors.apple.light.background.secondary');
  }
  
  /* Community Section */
  .community-section {
    padding: 60px 0;
    background: theme('colors.apple.light.background.primary');
  }
  
  /* KBO Section */
  .kbo-section {
    padding: 60px 0;
    background: theme('colors.apple.light.background.secondary');
  }
  
  /* Section Titles */
  .section-title {
    font-size: theme('fontSize.title1');
    font-weight: theme('fontWeight.bold');
    color: theme('colors.apple.light.text.primary');
    margin: 0 0 16px;
    text-align: center;
  }
  
  .section-description {
    font-size: theme('fontSize.body');
    color: theme('colors.apple.light.text.secondary');
    margin: 0;
    text-align: center;
    line-height: 1.5;
  }
  
  /* Placeholder Styles */
  .dashboard-placeholder,
  .community-placeholder,
  .kbo-placeholder {
    text-align: center;
    padding: 60px 0;
    background: theme('colors.apple.light.surface.primary');
    border-radius: 20px;
    border: 1px solid theme('colors.apple.light.surface.border');
  }
  
  /* Apple-style Footer */
  .main-footer {
    background: theme('colors.apple.light.background.tertiary');
    border-top: 1px solid theme('colors.apple.light.surface.border');
    margin-top: auto;
  }
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 24px 24px;
  }
  
  .footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 60px;
    margin-bottom: 40px;
  }
  
  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .footer-title {
    font-size: theme('fontSize.headline');
    font-weight: theme('fontWeight.semibold');
    color: theme('colors.apple.light.text.primary');
    margin: 0;
  }
  
  .footer-description {
    font-size: theme('fontSize.callout');
    color: theme('colors.apple.light.text.secondary');
    margin: 0;
    line-height: 1.5;
  }
  
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .footer-links a {
    font-size: theme('fontSize.callout');
    color: theme('colors.apple.light.text.secondary');
    text-decoration: none;
    transition: color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .footer-links a:hover {
    color: theme('colors.apple.light.text.primary');
  }
  
  .footer-bottom {
    padding-top: 24px;
    border-top: 1px solid theme('colors.apple.light.surface.border');
    text-align: center;
  }
  
  .copyright {
    font-size: theme('fontSize.footnote');
    color: theme('colors.apple.light.text.tertiary');
    margin: 0;
  }
  

  
  /* Responsive Design */
  @media (max-width: 768px) {
    
    .hero-content-grid {
      grid-template-columns: 1fr;
      gap: var(--apple-spacing-2xl);
      text-align: center;
    }
    
    .hero-title {
      font-size: var(--apple-font-size-3xl);
    }
    
    .hero-description {
      font-size: var(--apple-font-size-lg);
    }
    
    .hero-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .demo-card-container {
      width: 250px;
    }
    
    .hero-section,
    .dashboard-section,
    .community-section,
    .kbo-section {
      padding: var(--apple-spacing-2xl) 0;
    }
    
    .section-container {
      padding: 0 var(--apple-spacing-md);
    }
    
    .footer-content {
      grid-template-columns: 1fr;
      gap: var(--apple-spacing-2xl);
    }
    
    .footer-container {
      padding: var(--apple-spacing-2xl) var(--apple-spacing-md) var(--apple-spacing-md);
    }
  }
  
  @media (max-width: 480px) {
    .hero-section {
      padding: var(--apple-spacing-xl) 0;
    }
    
    .dashboard-section,
    .community-section,
    .kbo-section {
      padding: var(--apple-spacing-xl) 0;
    }
    
    .dashboard-placeholder,
    .community-placeholder,
    .kbo-placeholder {
      padding: var(--apple-spacing-2xl) var(--apple-spacing-lg);
    }
    
    .hero-title {
      font-size: var(--apple-font-size-2xl);
    }
    
    .hero-description {
      font-size: var(--apple-font-size-base);
    }
  }
  

  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .main-page-layout {
      background: theme('colors.apple.dark.background.primary');
      color: theme('colors.apple.dark.text.primary');
    }
    

    
    .hero-section {
      background: linear-gradient(135deg, 
        theme('colors.apple.dark.background.primary') 0%, 
        theme('colors.apple.dark.background.secondary') 100%);
    }
    
    .hero-title {
      color: theme('colors.apple.dark.text.primary');
    }
    
    .hero-description {
      color: theme('colors.apple.dark.text.secondary');
    }
    
    .dashboard-section,
    .kbo-section {
      background: theme('colors.apple.dark.background.secondary');
    }
    
    .community-section {
      background: theme('colors.apple.dark.background.primary');
    }
    
    .section-title {
      color: theme('colors.apple.dark.text.primary');
    }
    
    .section-description {
      color: theme('colors.apple.dark.text.secondary');
    }
    
    .dashboard-placeholder,
    .community-placeholder,
    .kbo-placeholder {
      background: theme('colors.apple.dark.surface.primary');
      border-color: theme('colors.apple.dark.surface.border');
    }
    
    .main-footer {
      background: theme('colors.apple.dark.background.tertiary');
      border-top-color: theme('colors.apple.dark.surface.border');
    }
    
    .footer-title {
      color: theme('colors.apple.dark.text.primary');
    }
    
    .footer-description {
      color: theme('colors.apple.dark.text.secondary');
    }
    
    .footer-links a {
      color: theme('colors.apple.dark.text.secondary');
    }
    
    .footer-links a:hover {
      color: theme('colors.apple.dark.text.primary');
    }
    
    .footer-bottom {
      border-top-color: theme('colors.apple.dark.surface.border');
    }
    
    .copyright {
      color: theme('colors.apple.dark.text.tertiary');
    }
    

  }
</style>