<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/authService';
  import { messagingService } from '$lib/services/messagingService';
  import ChatInterface from '$lib/components/messaging/ChatInterface.svelte';
  import type { CreateChatRequest, ChatType } from '$lib/types/messaging';

  let isAuthenticated = false;
  let isLoading = true;

  // Subscribe to auth state
  authService.isAuthenticated.subscribe(auth => {
    isAuthenticated = auth;
  });

  authService.isLoading.subscribe(loading => {
    isLoading = loading;
  });

  onMount(async () => {
    // Create some demo chats if user is authenticated
    if (isAuthenticated) {
      await createDemoChats();
    }
  });

  async function createDemoChats() {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      // Create a general chat
      const generalChatRequest: CreateChatRequest = {
        type: 'general' as ChatType,
        name: '전체 야구팬 채팅',
        description: '모든 야구팬들이 함께하는 채팅방',
        participants: [],
        settings: {
          isPublic: true,
          allowInvites: true,
          allowCardSharing: true,
          moderationLevel: 'basic'
        }
      };

      await messagingService.createChat(generalChatRequest);

      // Create a team fanclub chat if user has favorite team
      if (currentUser.favoriteTeam) {
        const teamChatRequest: CreateChatRequest = {
          type: 'team_fanclub' as ChatType,
          name: `${currentUser.favoriteTeam.name} 팬클럽`,
          description: `${currentUser.favoriteTeam.name} 팬들의 전용 채팅방`,
          participants: [],
          settings: {
            isPublic: true,
            allowInvites: true,
            allowCardSharing: true,
            moderationLevel: 'basic'
          },
          teamId: currentUser.favoriteTeam.id
        };

        await messagingService.createChat(teamChatRequest);
      }

      // Create a game live chat
      const gameChatRequest: CreateChatRequest = {
        type: 'game_live' as ChatType,
        name: 'LG vs 두산 실시간 응원',
        description: '경기 실시간 응원 채팅방',
        participants: [],
        settings: {
          isPublic: true,
          allowInvites: true,
          allowCardSharing: true,
          moderationLevel: 'basic'
        }
      };

      await messagingService.createChat(gameChatRequest);

    } catch (error) {
      console.error('Failed to create demo chats:', error);
    }
  }

  async function signIn(provider: 'github' | 'google') {
    try {
      await authService.signInWithOAuth(provider);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
</script>

<svelte:head>
  <title>실시간 메시징 데모 - KBO 홀로그래픽 카드 커뮤니티</title>
  <meta name="description" content="KBO 팬들을 위한 실시간 메시징과 응원 채팅 시스템을 체험해보세요." />
</svelte:head>

<div class="messaging-demo">
  {#if isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>로딩 중...</p>
    </div>
  {:else if !isAuthenticated}
    <div class="auth-container">
      <div class="auth-card">
        <h1>⚾ KBO 팬 채팅</h1>
        <p>야구팬들과 실시간으로 소통하고 응원해보세요!</p>
        
        <div class="features">
          <div class="feature">
            <span class="feature-icon">💬</span>
            <div class="feature-text">
              <h3>실시간 채팅</h3>
              <p>다른 야구팬들과 실시간으로 대화</p>
            </div>
          </div>
          
          <div class="feature">
            <span class="feature-icon">🎺</span>
            <div class="feature-text">
              <h3>응원 메시지</h3>
              <p>특별한 응원 스티커와 이모지</p>
            </div>
          </div>
          
          <div class="feature">
            <span class="feature-icon">🃏</span>
            <div class="feature-text">
              <h3>카드 공유</h3>
              <p>홀로그래픽 카드를 친구들과 공유</p>
            </div>
          </div>
          
          <div class="feature">
            <span class="feature-icon">🏟️</span>
            <div class="feature-text">
              <h3>경기 실시간</h3>
              <p>경기 중 실시간 응원 채팅</p>
            </div>
          </div>
        </div>

        <div class="auth-buttons">
          <button 
            class="auth-btn github"
            on:click={() => signIn('github')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub로 시작하기
          </button>
          
          <button 
            class="auth-btn google"
            on:click={() => signIn('google')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </button>
        </div>
      </div>
    </div>
  {:else}
    <ChatInterface showCheerPanel={true} />
  {/if}
</div>

<style>
  .messaging-demo {
    height: 100vh;
    background: var(--bg-primary, #1a1a1a);
    color: var(--text-primary, #ffffff);
  }

  .loading-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .auth-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .auth-card {
    max-width: 500px;
    width: 100%;
    padding: 40px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    text-align: center;
  }

  .auth-card h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 12px 0;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .auth-card > p {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 40px 0;
    line-height: 1.5;
  }

  .features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }

  .feature {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    text-align: left;
  }

  .feature-icon {
    font-size: 24px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .feature-text h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #ffffff;
  }

  .feature-text p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.4;
  }

  .auth-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .auth-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .auth-btn.github {
    background: #24292e;
    color: white;
  }

  .auth-btn.github:hover {
    background: #1a1e22;
    transform: translateY(-2px);
  }

  .auth-btn.google {
    background: white;
    color: #1f2937;
  }

  .auth-btn.google:hover {
    background: #f9fafb;
    transform: translateY(-2px);
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .auth-card {
      padding: 24px;
      margin: 20px;
    }

    .auth-card h1 {
      font-size: 24px;
    }

    .auth-card > p {
      font-size: 16px;
      margin-bottom: 32px;
    }

    .features {
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 32px;
    }

    .feature {
      align-items: center;
      text-align: center;
      flex-direction: column;
      gap: 8px;
    }

    .feature-text {
      text-align: center;
    }

    .auth-btn {
      padding: 12px 20px;
      font-size: 14px;
    }
  }

  /* Dark theme variables */
  :global(.dark) {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #3a3a3a;
    --bg-quaternary: #4a4a4a;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --border-color: #404040;
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --primary-bg: rgba(59, 130, 246, 0.1);
  }

  /* Light theme variables */
  :global(.light) {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #f1f3f4;
    --bg-quaternary: #e8eaed;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --border-color: #e1e5e9;
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --primary-bg: rgba(59, 130, 246, 0.1);
  }
</style>