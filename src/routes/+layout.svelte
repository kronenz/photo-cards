<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import '../app.css';

	// Initialize global services and theme
	onMount(() => {
		console.log('🚀 Holographic Card Community initialized');
		
		// Apply dark theme class to document
		if (browser) {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<svelte:head>
	<title>{$page.data.title || '홀로그래픽 카드 커뮤니티'}</title>
	<meta name="description" content="AI 기반 홀로그래픽 효과로 나만의 야구카드를 제작하고 전 세계 컬렉터들과 공유하세요" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#0f0f23" />
	
	<!-- Preload fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="app min-h-screen bg-civitai-bg-primary text-civitai-text-primary">
	<main class="min-h-screen">
		<slot />
	</main>
</div>

<style>
	.app {
		font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>