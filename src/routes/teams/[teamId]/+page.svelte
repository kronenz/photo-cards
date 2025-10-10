<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // Redirect to fanclub page
  onMount(() => {
    const teamId = $page.params.teamId;
    goto(`/fanclub/${teamId}`, { replaceState: true });
  });
</script>

<div class="redirect-container">
  <p>팀 페이지로 이동 중...</p>
</div>

<style>
  .redirect-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-size: 18px;
    color: #666;
  }
</style>
