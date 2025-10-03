<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import AppInit from '../lib/components/AppInit.svelte';
  import '../lib/styles/apple-design-system.css';
  import '../app.css';
  
  // 테마 관리
  let theme = 'dark';
  let mounted = false;
  let mobileMenuOpen = false;
  
  // Mock user data - replace with actual user store
  let user: any = null;
  
  onMount(() => {
    mounted = true;
    
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('kbo-cards-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Apply theme to document
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('kbo-cards-theme')) {
        theme = e.matches ? 'dark' : 'light';
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
      }
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  });
  
  // 테마 전환 함수
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('kbo-cards-theme', theme);
    
    if (browser) {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
    }
  }
  
  // 모바일 메뉴 관리
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
  
  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<!-- App initialization component -->
<AppInit />

<!-- 글로벌 레이아웃 -->
<div class="app-layout" class:dark={theme === 'dark'} class:mounted>
  <!-- Apple-style Navigation Header -->
  <header class="main-header">
    <nav class="nav-container">
      <div class="nav-brand">
        <a href="/" class="brand-link">
          <span class="brand-icon">⚾</span>
          <h1 class="brand-title">Baseball Cards</h1>
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="nav-menu desktop-nav">
        <a href="/" class="nav-link">홈</a>
        <a href="/gallery" class="nav-link">갤러리</a>
        <a href="/create" class="nav-link">카드 제작</a>
        <a href="/community" class="nav-link">커뮤니티</a>
        <a href="/collections" class="nav-link">컬렉션</a>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn md:hidden" on:click={toggleMobileMenu} aria-label="메뉴 열기">
        <span class="hamburger-line" class:open={mobileMenuOpen}></span>
        <span class="hamburger-line" class:open={mobileMenuOpen}></span>
        <span class="hamburger-line" class:open={mobileMenuOpen}></span>
      </button>
      
      <div class="nav-actions">
        <button 
          class="theme-toggle"
          on:click={toggleTheme}
          aria-label="테마 전환"
        >
          {#if theme === 'dark'}
            🌙
          {:else}
            ☀️
          {/if}
        </button>
        
        {#if user}
          <div class="user-profile">
            <img src={user.avatar || '/default-avatar.png'} alt="Profile" class="profile-avatar" />
            <span class="user-name">{user.username}</span>
          </div>
        {:else}
          <div class="auth-buttons">
            <a href="/auth/login" class="auth-btn login-btn">로그인</a>
            <a href="/auth/signup" class="auth-btn signup-btn">회원가입</a>
          </div>
        {/if}
      </div>
    </nav>
    
    <!-- Mobile Navigation Menu -->
    {#if mobileMenuOpen}
      <div class="mobile-nav" class:open={mobileMenuOpen}>
        <div class="mobile-nav-content">
          <a href="/" class="mobile-nav-link" on:click={closeMobileMenu}>홈</a>
          <a href="/gallery" class="mobile-nav-link" on:click={closeMobileMenu}>갤러리</a>
          <a href="/create" class="mobile-nav-link" on:click={closeMobileMenu}>카드 제작</a>
          <a href="/community" class="mobile-nav-link" on:click={closeMobileMenu}>커뮤니티</a>
          <a href="/collections" class="mobile-nav-link" on:click={closeMobileMenu}>컬렉션</a>
          
          <div class="mobile-auth-section">
            <a href="/auth/login" class="mobile-auth-btn login-btn" on:click={closeMobileMenu}>로그인</a>
            <a href="/auth/signup" class="mobile-auth-btn signup-btn" on:click={closeMobileMenu}>회원가입</a>
          </div>
        </div>
      </div>
    {/if}
  </header>
  
  <!-- Main content area -->
  <main class="main-content">
    <slot />
  </main>
  
  <!-- 푸터 -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">Baseball 홀로그래픽 카드</h3>
          <p class="footer-description">
            프리미엄 디자인으로 제작된<br>
            Baseball 야구 홀로그래픽 카드 커뮤니티 플랫폼
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">플랫폼</h4>
          <ul class="footer-links">
            <li><a href="/gallery">카드 갤러리</a></li>
            <li><a href="/create">카드 제작</a></li>
            <li><a href="/community">커뮤니티</a></li>
            <li><a href="/marketplace">마켓플레이스</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Baseball 구단</h4>
          <ul class="footer-links">
            <li><a href="/teams/lg">LG 트윈스</a></li>
            <li><a href="/teams/doosan">두산 베어스</a></li>
            <li><a href="/teams/kt">KT 위즈</a></li>
            <li><a href="/teams/samsung">삼성 라이온즈</a></li>
            <li><a href="/teams/lotte">롯데 자이언츠</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">지원</h4>
          <ul class="footer-links">
            <li><a href="/help">도움말</a></li>
            <li><a href="/contact">문의하기</a></li>
            <li><a href="/privacy">개인정보처리방침</a></li>
            <li><a href="/terms">이용약관</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="footer-copyright">
          © 2024 Baseball 홀로그래픽 카드 커뮤니티. 야구의 감동을 카드로.
        </p>
        <div class="footer-social">
          <a href="https://twitter.com" class="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">🐦</a>
          <a href="https://instagram.com" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">📷</a>
          <a href="https://youtube.com" class="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">📺</a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Main Layout Container */
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: theme('colors.apple.light.background.primary');
    color: theme('colors.apple.light.text.primary');
    font-family: theme('fontFamily.sans');
    opacity: 0;
    transition: opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .app-layout.mounted {
    opacity: 1;
  }
  
  /* Apple-style Header */
  .main-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--apple-surface-border);
    transition: all 0.3s var(--apple-transition-smooth);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--apple-spacing-lg);
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .nav-brand {
    display: flex;
    align-items: center;
  }
  
  .brand-link {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
    text-decoration: none;
    color: var(--apple-text-primary);
    transition: all var(--apple-transition-fast);
  }
  
  .brand-link:hover {
    transform: scale(1.02);
  }
  
  .brand-icon {
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  .brand-title {
    font-size: var(--apple-font-size-title1);
    font-weight: var(--apple-font-weight-bold);
    color: var(--apple-text-primary);
    margin: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .desktop-nav {
    display: flex;
    gap: var(--apple-spacing-2xl);
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    padding: var(--apple-spacing-sm) var(--apple-spacing-lg);
    border-radius: var(--apple-radius-full);
    backdrop-filter: blur(10px);
  }
  
  .nav-link {
    font-size: var(--apple-font-size-body);
    font-weight: var(--apple-font-weight-medium);
    color: var(--apple-text-secondary);
    text-decoration: none;
    transition: color var(--apple-transition-fast);
    position: relative;
    padding: var(--apple-spacing-sm) 0;
  }
  
  .nav-link:hover {
    color: var(--apple-text-primary);
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--apple-accent-blue);
    transform: scaleX(0);
    transition: transform var(--apple-transition-fast);
  }
  
  .nav-link:hover::after {
    transform: scaleX(1);
  }
  
  /* Mobile Menu Button */
  .mobile-menu-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    gap: 4px;
  }
  
  .hamburger-line {
    width: 20px;
    height: 2px;
    background: var(--apple-text-primary);
    transition: all var(--apple-transition-smooth);
    transform-origin: center;
  }
  
  .hamburger-line.open:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .hamburger-line.open:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger-line.open:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
  
  /* Mobile Navigation */
  .mobile-nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--apple-bg-glass);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--apple-surface-border);
    transform: translateY(-100%);
    opacity: 0;
    transition: all var(--apple-transition-smooth);
    pointer-events: none;
  }
  
  .mobile-nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  
  .mobile-nav-content {
    padding: var(--apple-spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--apple-spacing-md);
  }
  
  .mobile-nav-link {
    font-size: var(--apple-font-size-body);
    font-weight: var(--apple-font-weight-medium);
    color: var(--apple-text-secondary);
    text-decoration: none;
    padding: var(--apple-spacing-md);
    border-radius: var(--apple-radius-md);
    transition: all var(--apple-transition-fast);
  }
  
  .mobile-nav-link:hover {
    color: var(--apple-text-primary);
    background: var(--apple-surface-secondary);
  }
  
  .mobile-auth-section {
    margin-top: var(--apple-spacing-lg);
    padding-top: var(--apple-spacing-lg);
    border-top: 1px solid var(--apple-surface-border);
    display: flex;
    flex-direction: column;
    gap: var(--apple-spacing-sm);
  }
  
  .mobile-auth-btn {
    padding: var(--apple-spacing-md) var(--apple-spacing-lg);
    border-radius: var(--apple-radius-lg);
    text-decoration: none;
    font-size: var(--apple-font-size-body);
    font-weight: var(--apple-font-weight-semibold);
    text-align: center;
    transition: all var(--apple-transition-fast);
  }
  
  .mobile-auth-btn.login-btn {
    color: var(--apple-text-primary);
    background: var(--apple-surface-secondary);
    border: 1px solid var(--apple-surface-border);
  }
  
  .mobile-auth-btn.signup-btn {
    color: white;
    background: linear-gradient(135deg, var(--apple-accent-blue), var(--apple-accent-purple));
  }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
  }
  
  .theme-toggle {
    width: 44px;
    height: 44px;
    border-radius: var(--apple-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 2px solid var(--apple-surface-border);
    background: var(--apple-surface-secondary);
    color: var(--apple-text-primary);
    cursor: pointer;
    transition: all var(--apple-transition-fast);
  }
  
  .theme-toggle:hover {
    background: var(--apple-surface-tertiary);
    border-color: var(--apple-accent-blue);
  }
  
  .auth-buttons {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-sm);
  }
  
  .auth-btn {
    padding: var(--apple-spacing-sm) var(--apple-spacing-lg);
    border-radius: var(--apple-radius-full);
    text-decoration: none;
    font-size: var(--apple-font-size-callout);
    font-weight: var(--apple-font-weight-semibold);
    transition: all var(--apple-transition-fast);
    border: 2px solid transparent;
  }
  
  .login-btn {
    color: var(--apple-text-primary);
    background: transparent;
    border-color: var(--apple-surface-border);
  }
  
  .login-btn:hover {
    background: var(--apple-surface-secondary);
    border-color: var(--apple-accent-blue);
  }
  
  .signup-btn {
    color: white;
    background: linear-gradient(135deg, var(--apple-accent-blue), var(--apple-accent-purple));
    border-color: transparent;
  }
  
  .signup-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--apple-shadow-md);
  }
  
  .user-profile {
    display: flex;
    align-items: center;
    gap: var(--apple-spacing-md);
    padding: var(--apple-spacing-sm) var(--apple-spacing-md);
    background: var(--apple-surface-secondary);
    border-radius: var(--apple-radius-full);
    transition: all var(--apple-transition-fast);
  }
  
  .user-profile:hover {
    background: var(--apple-surface-tertiary);
  }
  
  .profile-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .user-name {
    font-size: var(--apple-font-size-callout);
    font-weight: var(--apple-font-weight-medium);
    color: var(--apple-text-primary);
  }
  
  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  /* Apple-style Footer */
  .app-footer {
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
    grid-template-columns: 2fr 1fr 1fr 1fr;
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
  
  .footer-subtitle {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .footer-copyright {
    font-size: theme('fontSize.footnote');
    color: theme('colors.apple.light.text.tertiary');
    margin: 0;
  }
  
  .footer-social {
    display: flex;
    gap: 16px;
  }
  
  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--apple-radius-lg);
    background: var(--apple-surface-tertiary);
    text-decoration: none;
    font-size: 18px;
    transition: all var(--apple-transition-fast);
  }
  
  .social-link:hover {
    transform: translateY(-2px);
    background: var(--apple-accent-blue);
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-container {
      padding: 0 var(--apple-spacing-md);
      height: 64px;
    }
    
    .desktop-nav {
      display: none;
    }
    
    .mobile-menu-btn {
      display: flex;
    }
    
    .auth-buttons {
      display: none;
    }
    
    .brand-title {
      font-size: var(--apple-font-size-title2);
    }
    
    .footer-content {
      grid-template-columns: 1fr;
      gap: var(--apple-spacing-2xl);
    }
    
    .footer-container {
      padding: var(--apple-spacing-2xl) var(--apple-spacing-md) var(--apple-spacing-md);
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .nav-actions {
      gap: var(--apple-spacing-sm);
    }
    
    .theme-toggle {
      width: 40px;
      height: 40px;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-menu-btn {
      display: none !important;
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .app-layout {
      background: theme('colors.apple.dark.background.primary');
      color: theme('colors.apple.dark.text.primary');
    }
    
    .main-header {
      background: rgba(28, 28, 30, 0.95);
      border-bottom-color: theme('colors.apple.dark.surface.border');
    }
    
    .nav-brand .brand-title {
      color: theme('colors.apple.dark.text.primary');
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .desktop-nav {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .login-btn {
      color: theme('colors.apple.dark.text.primary');
      border-color: theme('colors.apple.dark.surface.border');
    }
    
    .login-btn:hover {
      background: theme('colors.apple.dark.surface.secondary');
      border-color: theme('colors.apple.accent.darkBlue');
    }
    
    .mobile-auth-btn.login-btn {
      color: theme('colors.apple.dark.text.primary');
      background: theme('colors.apple.dark.surface.secondary');
      border-color: theme('colors.apple.dark.surface.border');
    }
    
    .nav-link {
      color: theme('colors.apple.dark.text.secondary');
    }
    
    .nav-link:hover {
      color: theme('colors.apple.dark.text.primary');
    }
    
    .nav-link::after {
      background: theme('colors.apple.accent.darkBlue');
    }
    
    .theme-toggle {
      background: theme('colors.apple.dark.surface.secondary');
      border-color: theme('colors.apple.dark.surface.border');
      color: theme('colors.apple.dark.text.primary');
    }
    
    .theme-toggle:hover {
      background: theme('colors.apple.dark.surface.tertiary');
      border-color: theme('colors.apple.accent.darkBlue');
    }
    
    .user-profile {
      background: theme('colors.apple.dark.surface.secondary');
    }
    
    .user-profile:hover {
      background: theme('colors.apple.dark.surface.tertiary');
    }
    
    .user-name {
      color: theme('colors.apple.dark.text.primary');
    }
    
    .app-footer {
      background: theme('colors.apple.dark.background.tertiary');
      border-top-color: theme('colors.apple.dark.surface.border');
    }
    
    .footer-title,
    .footer-subtitle {
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
    
    .footer-copyright {
      color: theme('colors.apple.dark.text.tertiary');
    }
    
    .social-link {
      background: theme('colors.apple.dark.surface.tertiary');
    }
    
    .social-link:hover {
      background: theme('colors.apple.accent.darkBlue');
    }
  }
</style>