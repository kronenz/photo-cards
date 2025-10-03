<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import CommunityFeed from '$lib/components/CommunityFeed.svelte';
  import { KBO_TEAMS } from '$lib/data/kboTeams';

  // State
  let selectedTeamId: string | undefined = undefined;

  // URL에서 팀 ID 파라미터 읽기
  $: {
    const teamParam = $page.url.searchParams.get('team');
    if (teamParam && KBO_TEAMS.find(team => team.id === teamParam)) {
      selectedTeamId = teamParam;
    }
  }

  onMount(() => {
    // 페이지 타이틀 설정
    document.title = selectedTeamId 
      ? `${KBO_TEAMS.find(t => t.id === selectedTeamId)?.name} 팬클럽 - KBO 커뮤니티`
      : 'KBO 커뮤니티';
  });
</script>

<svelte:head>
  <title>
    {selectedTeamId 
      ? `${KBO_TEAMS.find(t => t.id === selectedTeamId)?.name} 팬클럽 - KBO 커뮤니티`
      : 'KBO 커뮤니티'
    }
  </title>
  <meta name="description" content="KBO 팬들이 모여 야구 이야기를 나누고 홀로그래픽 카드를 공유하는 커뮤니티입니다." />
</svelte:head>

<main class="community-page">
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">
        {#if selectedTeamId}
          {KBO_TEAMS.find(t => t.id === selectedTeamId)?.name} 팬클럽
        {:else}
          KBO 커뮤니티
        {/if}
      </h1>
      <p class="page-description">
        {#if selectedTeamId}
          {KBO_TEAMS.find(t => t.id === selectedTeamId)?.name} 팬들이 모여 응원하고 소통하는 공간입니다
        {:else}
          KBO 팬들이 모여 야구 이야기를 나누고 홀로그래픽 카드를 공유하는 커뮤니티입니다
        {/if}
      </p>
    </div>
  </div>

  <div class="community-content">
    <CommunityFeed 
      {selectedTeamId}
      showTeamSelector={true}
      showPostComposer={true}
    />
  </div>
</main>

<style>
  .community-page {
    min-height: 100vh;
    background: var(--background-primary, #ffffff);
  }

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 20px 40px;
    text-align: center;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .page-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 16px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .page-description {
    font-size: 18px;
    margin: 0;
    opacity: 0.9;
    line-height: 1.6;
  }

  .community-content {
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .page-header {
      padding: 40px 16px 30px;
    }

    .page-title {
      font-size: 28px;
    }

    .page-description {
      font-size: 16px;
    }

    .community-content {
      padding: 20px 16px;
    }
  }
</style>