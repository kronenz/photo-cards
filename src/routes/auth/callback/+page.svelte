<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';

	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			// PocketBase OAuth callback is handled automatically by the SDK
			// The authStore should already be populated from the OAuth flow

			if (pb.authStore.isValid) {
				// Session is valid, redirect to home
				await goto('/');
			} else {
				// Try to get auth data from URL if present (for manual OAuth flows)
				const params = new URLSearchParams(window.location.search);
				const code = params.get('code');
				const state = params.get('state');

				if (code && state) {
					// If we have OAuth params, the auth might still be in progress
					// Wait a moment for PocketBase to process
					await new Promise((resolve) => setTimeout(resolve, 1000));

					if (pb.authStore.isValid) {
						await goto('/');
						return;
					}
				}

				error = '인증에 실패했습니다. 다시 시도해주세요.';
				setTimeout(() => goto('/auth/signin'), 3000);
			}
		} catch (err: any) {
			error = '인증 처리 중 오류가 발생했습니다.';
			console.error('OAuth callback error:', err);
			setTimeout(() => goto('/auth/signin'), 3000);
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>인증 처리 중... - Holographic Card Community</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
	<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
		{#if isLoading}
			<div class="mb-6">
				<div class="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
			</div>
			<h1 class="text-2xl font-bold text-white mb-4">인증 처리 중...</h1>
			<p class="text-white/80">잠시만 기다려주세요.</p>
		{:else if error}
			<div class="mb-6">
				<svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-white mb-4">인증 실패</h1>
			<p class="text-white/80 mb-4">{error}</p>
			<p class="text-sm text-white/60">로그인 페이지로 이동합니다...</p>
		{/if}
	</div>
</div>
