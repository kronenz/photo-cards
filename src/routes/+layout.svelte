<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import AppInit from '../lib/components/AppInit.svelte';
  import NotificationCenter from '../lib/components/unified/NotificationCenter.svelte';
  import { currentUser, teamTheme } from '$lib/stores/unified';
  import '../lib/styles/apple-design-system.css';
  import '../app.css';

  // 테마 관리
  let theme = 'dark';
  let mounted = false;
  let mobileMenuOpen = false;
  let showNotifications = false;

  // User data from unified store
  $: user = $currentUser;
  
  // Apply team theme CSS variables
  $: if (browser && $teamTheme) {
    const root = document.documentElement;
    root.style.setProperty('--team-primary-color', $teamTheme.color || '');
    root.classList.add('theme-kbo');
  } else if (browser) {
    const root = document.documentElement;
    root.style.removeProperty('--team-primary-color');
    root.classList.remove('theme-kbo');
  }

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

<!-- Notification Center -->
<NotificationCenter isOpen={showNotifications} />

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
          <!-- Notification Button -->
          <button
            class="notification-btn"
            data-testid="notification-btn"
            on:click={() => showNotifications = !showNotifications}
            aria-label="알림"
          >
            🔔
            <span class="unread-badge" data-testid="unread-count">3</span>
          </button>

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
  
  /* Modern Holographic Header */
  .main-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 247, 250, 0.95) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.04),
      0 4px 12px rgba(0, 0, 0, 0.02),
      0 0 0 1px rgba(0, 0, 0, 0.02);
  }

  .main-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(102, 126, 234, 0.3) 25%,
      rgba(118, 75, 162, 0.3) 50%,
      rgba(102, 126, 234, 0.3) 75%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .main-header:hover::before {
    opacity: 1;
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
    background: linear-gradient(135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #4facfe 75%,
      #667eea 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: holographic-shift 8s ease-in-out infinite;
    position: relative;
  }

  @keyframes holographic-shift {
    0%, 100% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
  }

  .brand-title::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: blur(8px);
    opacity: 0.3;
  }
  
  .desktop-nav {
    display: flex;
    gap: var(--apple-spacing-xl);
    align-items: center;
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(240, 245, 255, 0.5) 50%,
      rgba(255, 255, 255, 0.6) 100%
    );
    padding: 10px 24px;
    border-radius: 16px;
    backdrop-filter: blur(12px) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 2px 8px rgba(102, 126, 234, 0.08),
      0 4px 16px rgba(118, 75, 162, 0.04),
      inset 0 1px 1px rgba(255, 255, 255, 0.6);
  }
  
  .nav-link {
    font-size: 15px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    padding: 8px 12px;
    border-radius: 8px;
    letter-spacing: -0.01em;
  }

  .nav-link:hover {
    color: rgba(0, 0, 0, 0.95);
    background: rgba(102, 126, 234, 0.08);
    transform: translateY(-1px);
  }

  .nav-link::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.4),
      rgba(118, 75, 162, 0.4)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .nav-link:hover::before {
    opacity: 1;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg,
      #667eea,
      #764ba2,
      #667eea
    );
    background-size: 200% 100%;
    border-radius: 2px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-link:hover::after {
    transform: translateX(-50%) scaleX(1);
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
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(250, 250, 255, 0.8) 100%
    );
    color: var(--apple-text-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 1px rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
  }

  .theme-toggle::before {
    content: '';
    position: absolute;
    inset: -50%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(102, 126, 234, 0.15) 60deg,
      rgba(118, 75, 162, 0.15) 120deg,
      transparent 180deg
    );
    animation: theme-toggle-rotate 8s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  @keyframes theme-toggle-rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .theme-toggle:hover::before {
    opacity: 1;
  }

  .theme-toggle:hover {
    transform: translateY(-2px) scale(1.05);
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow:
      0 4px 16px rgba(102, 126, 234, 0.2),
      0 8px 24px rgba(118, 75, 162, 0.1),
      inset 0 1px 1px rgba(255, 255, 255, 0.9);
  }

  .theme-toggle:active {
    transform: translateY(0) scale(1);
  }

  .notification-btn {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(250, 250, 255, 0.8) 100%
    );
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 1px rgba(255, 255, 255, 0.8);
  }

  .notification-btn:hover {
    transform: translateY(-2px) scale(1.05);
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow:
      0 4px 16px rgba(102, 126, 234, 0.2),
      0 8px 24px rgba(118, 75, 162, 0.1),
      inset 0 1px 1px rgba(255, 255, 255, 0.9);
  }

  .unread-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 18px;
    height: 18px;
    background: #ef4444;
    color: white;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid white;
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
    background: linear-gradient(135deg,
      #667eea 0%,
      #764ba2 50%,
      #667eea 100%
    );
    background-size: 200% 100%;
    border-color: transparent;
    position: relative;
    overflow: hidden;
  }

  .signup-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  .signup-btn:hover::before {
    left: 100%;
  }

  .signup-btn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 4px 16px rgba(102, 126, 234, 0.4),
      0 8px 32px rgba(118, 75, 162, 0.3);
    background-position: 100% 0;
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
      background: linear-gradient(135deg,
        rgba(28, 28, 30, 0.98) 0%,
        rgba(20, 20, 25, 0.95) 100%
      );
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.3),
        0 4px 12px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    }

    .main-header::before {
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(102, 126, 234, 0.5) 25%,
        rgba(118, 75, 162, 0.5) 50%,
        rgba(102, 126, 234, 0.5) 75%,
        transparent 100%
      );
    }
    
    .nav-brand .brand-title {
      color: theme('colors.apple.dark.text.primary');
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .desktop-nav {
      background: linear-gradient(135deg,
        rgba(50, 50, 55, 0.6) 0%,
        rgba(40, 40, 50, 0.5) 50%,
        rgba(50, 50, 55, 0.6) 100%
      );
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.3),
        0 4px 16px rgba(0, 0, 0, 0.2),
        inset 0 1px 1px rgba(255, 255, 255, 0.08);
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.75);
    }

    .nav-link:hover {
      color: rgba(255, 255, 255, 0.95);
      background: rgba(102, 126, 234, 0.15);
    }

    .theme-toggle {
      background: linear-gradient(135deg,
        rgba(50, 50, 55, 0.9) 0%,
        rgba(40, 40, 50, 0.8) 100%
      );
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);
    }

    .theme-toggle:hover {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow:
        0 4px 16px rgba(102, 126, 234, 0.3),
        0 8px 24px rgba(118, 75, 162, 0.2),
        inset 0 1px 1px rgba(255, 255, 255, 0.15);
    }
    
    .login-btn {
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .login-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(102, 126, 234, 0.5);
    }

    .mobile-auth-btn.login-btn {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
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