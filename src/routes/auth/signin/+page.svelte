<script lang="ts">
	import { AuthService } from '$lib/auth.js';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let loading = false;
	let error = '';
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	async function handleGitHubSignIn() {
		loading = true;
		error = '';
		
		try {
			await AuthService.signInWithGitHub();
		} catch (err) {
			error = 'GitHub 로그인에 실패했습니다. 다시 시도해주세요.';
			console.error('Sign in error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>로그인 - 홀로그래픽 카드 커뮤니티</title>
	<meta name="description" content="홀로그래픽 카드 커뮤니티에 로그인하여 나만의 특별한 야구카드를 만들어보세요." />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-civitai-bg-primary px-4">
	<!-- Auth Card - Civitai Style -->
	<div class="w-full max-w-md">
		<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-8">
			<!-- Header -->
			<div class="text-center mb-8">
				<!-- Logo -->
				<div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-civitai-accent-primary to-civitai-accent-secondary rounded-lg mb-6">
					<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
					</svg>
				</div>
				
				<h1 class="text-2xl font-bold text-civitai-text-primary mb-2">
					홀로카드에 로그인
				</h1>
				<p class="text-civitai-text-secondary">
					계정에 로그인하여 카드를 제작하고 커뮤니티에 참여하세요
				</p>
			</div>

			<!-- Error Message -->
			{#if error}
				<div class="mb-6 p-4 bg-civitai-accent-error/10 border border-civitai-accent-error/20 rounded-lg">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-civitai-accent-error flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
						</svg>
						<span class="text-civitai-accent-error text-sm">{error}</span>
					</div>
				</div>
			{/if}

			<!-- Social Login -->
			<div class="space-y-3 mb-6">
				<button
					on:click={handleGitHubSignIn}
					disabled={loading}
					class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-civitai-surface-secondary hover:bg-civitai-surface-tertiary border border-civitai-border-primary hover:border-civitai-border-accent rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<svg class="animate-spin w-5 h-5 text-civitai-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span class="text-civitai-text-secondary font-medium">로그인 중...</span>
					{:else}
						<svg class="w-5 h-5 text-civitai-text-primary" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
						</svg>
						<span class="text-civitai-text-primary font-medium">GitHub로 계속하기</span>
					{/if}
				</button>
				
				<!-- Google Login (준비 중) -->
				<button
					disabled
					class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-civitai-surface-secondary/50 border border-civitai-border-primary/50 rounded-lg cursor-not-allowed opacity-50"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					<span class="text-civitai-text-tertiary font-medium">Google (준비 중)</span>
				</button>
			</div>

			<!-- Divider -->
			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-civitai-border-primary"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-4 bg-civitai-surface-primary text-civitai-text-tertiary">또는</span>
				</div>
			</div>

			<!-- Email Form (준비 중) -->
			<div class="space-y-3 mb-6">
				<div>
					<input
						type="email"
						placeholder="이메일 주소"
						disabled
						class="w-full px-4 py-3 bg-civitai-surface-secondary/50 border border-civitai-border-primary/50 rounded-lg text-civitai-text-primary placeholder-civitai-text-tertiary opacity-50 cursor-not-allowed"
					/>
				</div>
				<div>
					<input
						type="password"
						placeholder="비밀번호"
						disabled
						class="w-full px-4 py-3 bg-civitai-surface-secondary/50 border border-civitai-border-primary/50 rounded-lg text-civitai-text-primary placeholder-civitai-text-tertiary opacity-50 cursor-not-allowed"
					/>
				</div>
				<button
					disabled
					class="w-full bg-civitai-accent-primary/50 text-white px-4 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed"
				>
					이메일로 로그인 (준비 중)
				</button>
			</div>

			<!-- Footer Links -->
			<div class="text-center space-y-3">
				<div class="text-sm text-civitai-text-tertiary">
					계정이 없으신가요? 
					<a href="/auth/signup" class="text-civitai-accent-primary hover:text-civitai-accent-secondary transition-colors">
						회원가입
					</a>
				</div>
				
				<div class="text-xs text-civitai-text-tertiary">
					로그인하면 
					<a href="/terms" class="text-civitai-accent-primary hover:underline">이용약관</a>과 
					<a href="/privacy" class="text-civitai-accent-primary hover:underline">개인정보처리방침</a>에 
					동의하는 것으로 간주됩니다.
				</div>
			</div>
		</div>
		
		<!-- Back to Home -->
		<div class="text-center mt-6">
			<a href="/" class="inline-flex items-center gap-2 text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
				</svg>
				홈으로 돌아가기
			</a>
		</div>
	</div>
</div>