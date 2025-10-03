<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/authService';
	import { OAUTH_PROVIDERS } from '$lib/types/auth';
	import type { OAuthProvider } from '$lib/types/auth';

	export let isOpen = false;

	const dispatch = createEventDispatcher();
	let isLoading = false;
	let error: string | null = null;

	async function handleOAuthSignIn(provider: OAuthProvider['id']) {
		isLoading = true;
		error = null;

		try {
			await authService.signInWithOAuth(provider);
			// OAuth will redirect to callback page
			dispatch('success');
			isOpen = false;
		} catch (err) {
			error = err instanceof Error ? err.message : '로그인에 실패했습니다.';
		} finally {
			isLoading = false;
		}
	}

	function handleClose() {
		if (!isLoading) {
			isOpen = false;
			dispatch('close');
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

{#if isOpen}
	<!-- Modal Backdrop -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="signin-title"
	>
		<!-- Modal Content -->
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 id="signin-title" class="text-2xl font-bold text-gray-900 dark:text-white">
					KBO 카드 커뮤니티 로그인
				</h2>
				<button
					on:click={handleClose}
					disabled={isLoading}
					class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
					aria-label="닫기"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Welcome Message -->
			<div class="text-center mb-8">
				<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
					</svg>
				</div>
				<p class="text-gray-600 dark:text-gray-400">
					홀로그래픽 야구 카드를 만들고<br>
					KBO 팬들과 함께 추억을 공유하세요
				</p>
			</div>

			<!-- Error Message -->
			{#if error}
				<div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			{/if}

			<!-- OAuth Providers -->
			<div class="space-y-3">
				{#each OAUTH_PROVIDERS as provider}
					<button
						on:click={() => handleOAuthSignIn(provider.id)}
						disabled={isLoading}
						class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						style="border-color: {provider.color}20"
					>
						{#if isLoading}
							<div class="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
						{:else}
							<!-- Provider Icon -->
							{#if provider.id === 'github'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
							{:else if provider.id === 'google'}
								<svg class="w-5 h-5" viewBox="0 0 24 24">
									<path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
									<path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
									<path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
									<path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
								</svg>
							{/if}
						{/if}
						<span class="font-medium text-gray-700 dark:text-gray-300">
							{provider.name}으로 계속하기
						</span>
					</button>
				{/each}
			</div>

			<!-- Terms and Privacy -->
			<div class="mt-6 text-center">
				<p class="text-xs text-gray-500 dark:text-gray-400">
					로그인하면 
					<a href="/terms" class="text-blue-600 dark:text-blue-400 hover:underline">이용약관</a>과 
					<a href="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline">개인정보처리방침</a>에 
					동의하는 것으로 간주됩니다.
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom animations */
	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.fixed > div {
		animation: modalSlideIn 0.2s ease-out;
	}
</style>