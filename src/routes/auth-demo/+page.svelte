<script lang="ts">
	import { onMount } from 'svelte';
	import { authService, user, isAuthenticated, isLoading } from '$lib/services/authService';
	import SignInModal from '$lib/components/auth/SignInModal.svelte';
	import UserProfileCard from '$lib/components/auth/UserProfileCard.svelte';
	import UserProfileEditor from '$lib/components/auth/UserProfileEditor.svelte';

	let showSignInModal = false;
	let showProfileEditor = false;

	function handleSignIn() {
		showSignInModal = true;
	}

	function handleEditProfile() {
		showProfileEditor = true;
	}

	function handleSignOut() {
		authService.signOut();
	}

	onMount(() => {
		console.log('Auth Demo mounted');
	});
</script>

<svelte:head>
	<title>인증 시스템 데모 - KBO 홀로그래픽 카드 커뮤니티</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
	<div class="container mx-auto px-4 max-w-4xl">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
				KBO 팬 인증 시스템 데모
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				OAuth 기반 사용자 인증과 프로필 시스템을 테스트해보세요
			</p>
		</div>

		<!-- Loading State -->
		{#if $isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="flex items-center gap-3">
					<div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					<span class="text-gray-600 dark:text-gray-400">인증 상태 확인 중...</span>
				</div>
			</div>
		{:else if $isAuthenticated && $user}
			<!-- Authenticated State -->
			<div class="space-y-8">
				<!-- User Profile Card -->
				<div class="max-w-md mx-auto">
					<UserProfileCard 
						profile={$user}
						on:edit-profile={handleEditProfile}
						on:sign-out={handleSignOut}
					/>
				</div>

				<!-- User Stats -->
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
					<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">사용자 정보</h2>
					
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Basic Info -->
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">기본 정보</h3>
							<div class="space-y-3">
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">이메일:</span>
									<span class="text-gray-900 dark:text-white">{$user.email}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">사용자명:</span>
									<span class="text-gray-900 dark:text-white">{$user.username}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">등급:</span>
									<span class="text-gray-900 dark:text-white">{$user.grade.koreanName}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">가입일:</span>
									<span class="text-gray-900 dark:text-white">
										{new Date($user.created).toLocaleDateString('ko-KR')}
									</span>
								</div>
							</div>
						</div>

						<!-- KBO Info -->
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">KBO 팬 정보</h3>
							<div class="space-y-3">
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">응원팀:</span>
									<span class="text-gray-900 dark:text-white">
										{$user.favoriteTeam?.name || '미설정'}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">팬 시작:</span>
									<span class="text-gray-900 dark:text-white">
										{$user.fanSince || '미설정'}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">좋아하는 선수:</span>
									<span class="text-gray-900 dark:text-white">
										{$user.favoritePlayer || '미설정'}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">구장 방문:</span>
									<span class="text-gray-900 dark:text-white">
										{$user.stadiumVisits.length}곳
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Grade Progress -->
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
					<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">등급 진행도</h2>
					
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-lg font-medium text-gray-900 dark:text-white">
								{$user.grade.koreanName}
							</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">
								{$user.stats.gradePoints}점
							</span>
						</div>
						
						{#if $user.grade.maxPoints !== Infinity}
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
								<div 
									class="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
									style="width: {Math.min(100, (($user.stats.gradePoints - $user.grade.minPoints) / ($user.grade.maxPoints - $user.grade.minPoints)) * 100)}%"
								></div>
							</div>
							<div class="text-sm text-gray-600 dark:text-gray-400 text-center">
								다음 등급까지 {$user.grade.maxPoints - $user.stats.gradePoints}점 남음
							</div>
						{:else}
							<div class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full h-3"></div>
							<div class="text-sm text-center text-orange-600 dark:text-orange-400 font-medium">
								최고 등급 달성! 🏆
							</div>
						{/if}
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-4 justify-center">
					<button
						on:click={handleEditProfile}
						class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						프로필 편집
					</button>
					<button
						on:click={handleSignOut}
						class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
					>
						로그아웃
					</button>
				</div>
			</div>
		{:else}
			<!-- Unauthenticated State -->
			<div class="text-center py-12">
				<div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
					로그인이 필요합니다
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-8">
					KBO 홀로그래픽 카드 커뮤니티에 참여하려면 로그인하세요
				</p>
				<button
					on:click={handleSignIn}
					class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
				>
					로그인하기
				</button>
			</div>
		{/if}
	</div>
</div>

<!-- Modals -->
<SignInModal 
	bind:isOpen={showSignInModal}
	on:success={() => showSignInModal = false}
	on:close={() => showSignInModal = false}
/>

<UserProfileEditor 
	bind:isOpen={showProfileEditor}
	on:success={() => showProfileEditor = false}
	on:close={() => showProfileEditor = false}
/>