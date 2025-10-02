<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.css';

	// Initialize any global services here
	onMount(() => {
		console.log('🚀 Holographic Card Community initialized');
	});
</script>

<svelte:head>
	<title>{$page.data.title || 'Holographic Card Community'}</title>
	<meta name="description" content="Create and share stunning holographic baseball cards with our community platform" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="app">
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	main {
		min-height: 100vh;
	}
</style>