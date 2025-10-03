<script lang="ts">
  import { onMount } from 'svelte';
  import EnhancedCommunityFeed from '$lib/components/EnhancedCommunityFeed.svelte';
  import KBOLiveSchedule from '$lib/components/KBOLiveSchedule.svelte';
  import { KBO_TEAMS } from '$lib/data/kboTeams';

  // State
  let selectedTeamId: string | undefined = undefined;
  let showSidebar = true;

  // Functions
  function handleTeamSelect(event: CustomEvent<string | undefined>) {
    selectedTeamId = event.detail;
  }

  function toggleSidebar() {
    showSidebar = !showSidebar;
  }

  onMount(() => {
    // 기본으로 LG 트윈스 선택 (데모용)
    selectedTeamId = 'lg-twins';
  });
</script>

<svelte:head>
  <title>KBO 커뮤니티 데모 - 홀로그래픽 카드 커뮤니티</title>
  <meta name="description" content="KBO 팬 커뮤니티와 실시간 일정을 확인하세요" />
</svelte:head>

<div class="community-demo">
  <!-- 헤더 -->
  <header class="demo-header">
    <div class="header-content">
      <h1>
        <span class="kbo-icon">⚾</span>
        KBO 커뮤니티 데모
      </h1>
      <p>구단별 팬클럽과 실시간 야구 일정을 한눈에</p>
    </div>
    
    <button class="sidebar-toggle" on:click={toggleSidebar} aria-label="사이드바 토글">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path 
          d="M3 12H21M3 6H21M3 18H21" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </header>

  <div class="demo-layout">
    <!-- 사이드바 -->
    <aside class="sidebar" class:hidden={!showSidebar}>
      <div class="sidebar-content">
        <!-- 실시간 일정 -->
        <KBOLiveSchedule {selectedTeamId} />

        <!-- 빠른 팀 선택 -->
        <div class="quick-team-selector">
          <h3>빠른 팀 선택</h3>
          <div class="team-grid">
            <button 
              class="team-quick-btn" 
              class:active={!selectedTeamId}
              on:click={() => selectedTeamId = undefined}
            >
              <div class="team-icon all">⚾</div>
              <span>전체</span>
            </button>
            {#each KBO_TEAMS as team}
              <button 
                class="team-quick-btn" 
                class:active={selectedTeamId === team.id}
                style="--team-color: {team.colors.primary}"
                on:click={() => selectedTeamId = team.id}
              >
                <div class="team-icon" style="background-color: {team.colors.primary}">
                  {team.name.charAt(0)}
                </div>
                <span>{team.name.split(' ')[1] || team.name}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- 커뮤니티 통계 -->
        <div class="community-overview">
          <h3>커뮤니티 현황</h3>
          <div class="overview-stats">
            <div class="overview-stat">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <span class="stat-number">25,847</span>
                <span class="stat-label">총 멤버</span>
              </div>
            </div>
            <div class="overview-stat">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <span class="stat-number">1,234</span>
                <span class="stat-label">오늘 활성</span>
              </div>
            </div>
            <div class="overview-stat">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <span class="stat-number">89</span>
                <span class="stat-label">오늘 포스트</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <EnhancedCommunityFeed 
        {selectedTeamId}
        showTeamSelector={false}
        on:teamSelect={handleTeamSelect}
      />
    </main>
  </div>
</div>

<style>
  .community-demo {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .demo-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content h1 {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .kbo-icon {
    font-size: 32px;
  }

  .header-content p {
    font-size: 16px;
    color: var(--text-secondary, #6b7280);
    margin: 0;
  }

  .sidebar-toggle {
    background: none;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    color: var(--text-secondary, #6b7280);
    transition: all 0.2s ease;
    display: none;
  }

  .sidebar-toggle:hover {
    border-color: var(--primary-color, #3b82f6);
    color: var(--primary-color, #3b82f6);
  }

  .demo-layout {
    display: flex;
    gap: 24px;
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .sidebar {
    width: 320px;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .sidebar.hidden {
    width: 0;
    overflow: hidden;
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .quick-team-selector {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .quick-team-selector h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 16px 0;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .team-quick-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: none;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .team-quick-btn:hover {
    border-color: var(--team-color, var(--primary-color, #3b82f6));
    transform: translateY(-2px);
  }

  .team-quick-btn.active {
    border-color: var(--team-color, var(--primary-color, #3b82f6));
    background: rgba(var(--team-color-rgb, 59, 130, 246), 0.1);
  }

  .team-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
  }

  .team-icon.all {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-size: 16px;
  }

  .team-quick-btn span {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
    text-align: center;
    line-height: 1.2;
  }

  .community-overview {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .community-overview h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 16px 0;
  }

  .overview-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .overview-stat {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .stat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-number {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .main-content {
    flex: 1;
    min-width: 0;
  }

  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .sidebar-toggle {
      display: block;
    }

    .demo-layout {
      padding: 16px;
      gap: 16px;
    }

    .sidebar {
      position: fixed;
      top: 80px;
      left: 0;
      bottom: 0;
      width: 300px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      z-index: 50;
      padding: 16px;
      overflow-y: auto;
      transform: translateX(-100%);
    }

    .sidebar:not(.hidden) {
      transform: translateX(0);
    }

    .main-content {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .demo-header {
      padding: 16px;
    }

    .header-content h1 {
      font-size: 24px;
    }

    .header-content p {
      font-size: 14px;
    }

    .demo-layout {
      padding: 12px;
    }

    .sidebar {
      width: 280px;
      top: 70px;
    }

    .team-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .team-quick-btn {
      padding: 10px 6px;
    }

    .team-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .team-quick-btn span {
      font-size: 10px;
    }
  }
</style>