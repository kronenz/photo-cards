<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Redirect to existing register page
  onMount(() => {
    goto('/register', { replaceState: true });
  });
</script>

<div class="redirect-container">
  <p>회원가입 페이지로 이동 중...</p>
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
