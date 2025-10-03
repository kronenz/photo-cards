<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authService, isAuthenticated } from '$lib/services/authService';
	import SignInModal from '$lib/components/auth/SignInModal.svelte';

	let showModal = true;
	let error: string | null = null;

	// Redirect if already authenticated
	$: if ($isAuthenticated) {
		const redirectTo = $page.url.searchParams.get('redirectTo') || '/';
		goto(redirectTo);
	}

	onMount(() => {
		// Check for error in URL params
		const errorParam = $page.url.searchParams.get('error');
		if (errorParam) {
			error = decodeURIComponent(errorParam);
		}
	});

	function handleSignInSuccess() {
		const redirectTo = $page.url.searchParams.get('redirectTo') || '/';
		goto(redirectTo);
	}

	function handleClose() {
		goto('/');
	}
</script>

<svelte:head>
	<title>로그인 - KBO 홀로그래픽 카드 커뮤니티</title>
	<meta name="description" content="KBO 홀로그래픽 카드 커뮤니티에 로그인하여 야구 카드를 만들고 공유하세요." />
</svelte:head>

<!-- Background -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
	<!-- Hero Section -->
	<div class="container mx-auto px-4 py-16">
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
				KBO 홀로그래픽 카드
				<span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
					커뮤니티
				</span>
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
				Apple 수준의 프리미엄 홀로그래픽 효과로 야구의 감동적인 순간을 영원히 보존하세요
			</p>
		</div>

		<!-- Features Grid -->
		<div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
			<div class="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
				<div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">홀로그래픽 카드 제작</h3>
				<p class="text-gray-600 dark:text-gray-400">60fps 보장 홀로그래픽 효과로 실물 카드 같은 경험</p>
			</div>

			<div class="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
				<div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">KBO 팬 커뮤니티</h3>
				<p class="text-gray-600 dark:text-gray-400">10개 구단 팬들과 함께하는 야구 문화 공간</p>
			</div>

			<div class="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
				<div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">등급 시스템</h3>
				<p class="text-gray-600 dark:text-gray-400">야구 덕후부터 구단 레전드까지 성장하는 재미</p>
			</div>
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="max-w-md mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
				<p class="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
			</div>
		{/if}

		<!-- Call to Action -->
		<div class="text-center">
			<p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
				지금 시작해서 당신만의 야구 추억을 홀로그래픽 카드로 만들어보세요
			</p>
		</div>
	</div>
</div>

<!-- Sign In Modal -->
<SignInModal 
	bind:isOpen={showModal}
	on:success={handleSignInSuccess}
	on:close={handleClose}
/>