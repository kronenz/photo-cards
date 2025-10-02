<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import AppInit from '../lib/components/AppInit.svelte';
  import '../lib/styles/apple-design-system.css';
  import '../app.css';
  
  // Apple-style theme management
  let theme = 'dark';
  let mounted = false;
  
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
  
  // Apple-style theme toggle function
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('kbo-cards-theme', theme);
    
    if (browser) {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
    }
  }
</script>

<!-- App initialization component -->
<AppInit />

<!-- Apple-style global layout -->
<div class="app-layout" class:dark={theme === 'dark'}>
  <!-- Apple-style navigation header -->
  <header class="app-header">
    <nav class="nav-container">
      <div class="nav-brand">
        <a href="/" class="brand-link">
          <div class="brand-icon">⚾</div>
          <span class="brand-text">KBO Cards</span>
        </a>
      </div>
      
      <div class="nav-menu">
        <a href="/" class="nav-link">홈</a>
        <a href="/gallery" class="nav-link">갤러리</a>
        <a href="/create" class="nav-link">카드 제작</a>
        <a href="/community" class="nav-link">커뮤니티</a>
      </div>
      
      <div class="nav-actions">
        <button 
          class="theme-toggle btn-apple-secondary"
          on:click={toggleTheme}
          aria-label="테마 전환"
        >
          {#if theme === 'dark'}
            🌙
          {:else}
            ☀️
          {/if}
        </button>
        
        <a href="/auth/login" class="btn-apple-primary">로그인</a>
      </div>
    </nav>
  </header>
  
  <!-- Main content area -->
  <main class="app-main">
    <slot />
  </main>
  
  <!-- Apple-style footer -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">KBO 홀로그래픽 카드</h3>
          <p class="footer-description">
            Apple 수준의 프리미엄 디자인으로 제작된<br>
            KBO 야구 홀로그래픽 카드 커뮤니티 플랫폼
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
          <h4 class="footer-subtitle">KBO 구단</h4>
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
          © 2024 KBO 홀로그래픽 카드 커뮤니티. Apple 수준 프리미엄 플랫폼.
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
  /* Apple-style layout styles */
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--apple-bg-primary);
    color: var(--apple-text-primary);
    transition: all 300ms var(--apple-easing-smooth);
  }
  
  /* Apple-style header */
  .app-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--apple-bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--apple-surface-border);
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
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
    gap: 12px;
    text-decoration: none;
    color: var(--apple-text-primary);
    font-weight: 600;
    font-size: 20px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .brand-link:hover {
    transform: scale(1.05);
  }
  
  .brand-icon {
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  .nav-menu {
    display: flex;
    align-items: center;
    gap: 32px;
  }
  
  .nav-link {
    color: var(--apple-text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-size: 17px;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .nav-link:hover {
    color: var(--apple-text-primary);
    background: var(--apple-surface-secondary);
  }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .theme-toggle {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: none;
    cursor: pointer;
  }
  
  /* Main content */
  .app-main {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
  }
  
  /* Apple-style footer */
  .app-footer {
    background: var(--apple-surface-secondary);
    border-top: 1px solid var(--apple-surface-border);
    margin-top: auto;
  }
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 24px 24px;
  }
  
  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 32px;
  }
  
  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .footer-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--apple-text-primary);
    margin: 0;
  }
  
  .footer-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: var(--apple-text-primary);
    margin: 0;
  }
  
  .footer-description {
    color: var(--apple-text-secondary);
    line-height: 1.6;
    margin: 0;
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
    color: var(--apple-text-secondary);
    text-decoration: none;
    font-size: 15px;
    transition: color var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .footer-links a:hover {
    color: var(--apple-text-accent);
  }
  
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    border-top: 1px solid var(--apple-surface-border);
  }
  
  .footer-copyright {
    color: var(--apple-text-tertiary);
    font-size: 14px;
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
    border-radius: 10px;
    background: var(--apple-surface-tertiary);
    text-decoration: none;
    font-size: 18px;
    transition: all var(--apple-duration-fast) var(--apple-easing-smooth);
  }
  
  .social-link:hover {
    transform: translateY(-2px);
    background: var(--apple-accent-blue);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .nav-container {
      padding: 0 16px;
      height: 56px;
    }
    
    .nav-menu {
      display: none;
    }
    
    .brand-link {
      font-size: 18px;
    }
    
    .brand-icon {
      font-size: 24px;
    }
    
    .app-main {
      padding: 24px 16px;
    }
    
    .footer-content {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .nav-actions {
      gap: 8px;
    }
    
    .theme-toggle {
      width: 40px;
      height: 40px;
    }
  }
</style>