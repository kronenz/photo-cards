<script lang="ts">
	import { onMount } from 'svelte';
	import { authService, user, isAuthenticated, isLoading } from '$lib/services/authService';
	import { socialService } from '$lib/services/socialService';
	
	// Auth Components
	import SignInModal from '$lib/components/auth/SignInModal.svelte';
	import UserProfileCard from '$lib/components/auth/UserProfileCard.svelte';
	import UserProfileEditor from '$lib/components/auth/UserProfileEditor.svelte';
	
	// Grade Components
	import GradeProgressCard from '$lib/components/grade/GradeProgressCard.svelte';
	import GradeLeaderboard from '$lib/components/grade/GradeLeaderboard.svelte';
	import TeamBadgeSelector from '$lib/components/grade/TeamBadgeSelector.svelte';
	
	// Social Components
	import FollowButton from '$lib/components/social/FollowButton.svelte';
	import UserConnectionsList from '$lib/components/social/UserConnectionsList.svelte';
	import PersonalizedFeed from '$lib/components/social/PersonalizedFeed.svelte';
	import UserRecommendations from '$lib/components/social/UserRecommendations.svelte';

	let showSignInModal = false;
	let showProfileEditor = false;
	let activeTab = 'profile';
	let selectedTeam = undefined;

	// Demo data
	let demoUsers = [
		{
			id: 'demo1',
			displayName: 'KBO 매니아',
			email: 'demo1@example.com',
			username: 'kbo_mania',
			avatar: undefined,
			bio: '20년차 야구팬, LG 트윈스 응원단장',
			grade: { level: 'expert', koreanName: '시즌권 홀더' },
			stats: { cardsCreated: 150, totalLikes: 2000, followers: 100, following: 80 },
			favoriteTeam: { id: 'lg', shortName: 'LG', name: 'LG 트윈스' },
			isVerified: true
		},
		{
			id: 'demo2',
			displayName: '야구카드 수집가',
			email: 'demo2@example.com',
			username: 'card_collector',
			avatar: undefined,
			bio: '홀로그래픽 카드 전문 크리에이터',
			grade: { level: 'supporter', koreanName: '응원단 멤버' },
			stats: { cardsCreated: 80, totalLikes: 800, followers: 50, following: 60 },
			favoriteTeam: { id: 'doosan', shortName: '두산', name: '두산 베어스' },
			isVerified: false
		}
	];

	function handleSignIn() {
		showSignInModal = true;
	}

	function handleEditProfile() {
		showProfileEditor = true;
	}

	function handleTeamSelect(event) {
		selectedTeam = event.detail;
		console.log('Selected team:', selectedTeam);
	}

	onMount(() => {
		console.log('User Management Demo mounted');
	});
</script>

<svelte:head>
	<title>사용자 관리 시스템 데모 - KBO 홀로그래픽 카드 커뮤니티</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
	<div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
		<div class="container mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
						KBO 팬 사용자 관리 시스템
					</h1>
					<p class="text-gray-600 dark:text-gray-400 mt-2">
						OAuth 인증, 등급 시스템, 소셜 그래프 통합 데모
					</p>
				</div>
				
				{#if $isAuthenticated && $user}
					<UserProfileCard profile={$user} compact={true} on:edit-profile={handleEditProfile} />
				{:else}
					<button
						on:click={handleSignIn}
						class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						로그인하기
					</button>
				{/if}
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8">
		{#if $isLoading}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-12">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					<span class="text-lg text-gray-600 dark:text-gray-400">시스템 초기화 중...</span>
				</div>
			</div>
		{:else if $isAuthenticated && $user}
			<!-- Authenticated User Interface -->
			<div class="space-y-8">
				<!-- Tab Navigation -->
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
					<div class="border-b border-gray-200 dark:border-gray-700">
						<nav class="flex space-x-8 px-6" aria-label="Tabs">
							{#each [
								{ id: 'profile', name: '프로필 관리', icon: '👤' },
								{ id: 'grade', name: '등급 시스템', icon: '🏆' },
								{ id: 'social', name: '소셜 네트워크', icon: '👥' },
								{ id: 'team', name: '팀 선택', icon: '⚾' }
							] as tab}
								<button
									on:click={() => activeTab = tab.id}
									class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {
										activeTab === tab.id
											? 'border-blue-500 text-blue-600 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
									}"
								>
									<span class="mr-2">{tab.icon}</span>
									{tab.name}
								</button>
							{/each}
						</nav>
					</div>

					<div class="p-6">
						{#if activeTab === 'profile'}
							<!-- Profile Management -->
							<div class="space-y-6">
								<h2 class="text-2xl font-bold text-gray-900 dark:text-white">프로필 관리</h2>
								
								<div class="grid lg:grid-cols-2 gap-6">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">현재 프로필</h3>
										<UserProfileCard profile={$user} on:edit-profile={handleEditProfile} />
									</div>
									
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">프로필 기능</h3>
										<div class="space-y-4">
											<div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
												<h4 class="font-medium text-gray-900 dark:text-white mb-2">✅ 구현된 기능</h4>
												<ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
													<li>• OAuth 기반 GitHub/Google 로그인</li>
													<li>• 프로필 정보 편집 (이름, 소개, 위치)</li>
													<li>• 아바타 이미지 업로드</li>
													<li>• KBO 팀 선택 및 팬 정보</li>
													<li>• 사용자 설정 및 알림 관리</li>
												</ul>
											</div>
											
											<button
												on:click={handleEditProfile}
												class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
											>
												프로필 편집하기
											</button>
										</div>
									</div>
								</div>
							</div>
						{:else if activeTab === 'grade'}
							<!-- Grade System -->
							<div class="space-y-6">
								<h2 class="text-2xl font-bold text-gray-900 dark:text-white">KBO 팬 등급 시스템</h2>
								
								<div class="grid lg:grid-cols-2 gap-6">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">내 등급 현황</h3>
										<GradeProgressCard user={$user} />
									</div>
									
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">등급 리더보드</h3>
										<GradeLeaderboard />
									</div>
								</div>
								
								<div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
									<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">등급 시스템 설명</h3>
									<div class="grid md:grid-cols-5 gap-4">
										{#each [
											{ level: 'rookie', name: '야구 입문자', icon: '🥎', points: '0-100점' },
											{ level: 'fan', name: '외야석 팬', icon: '⚾', points: '101-500점' },
											{ level: 'supporter', name: '응원단 멤버', icon: '🎺', points: '501-1500점' },
											{ level: 'expert', name: '시즌권 홀더', icon: '🏟️', points: '1501-5000점' },
											{ level: 'legend', name: '구단 레전드', icon: '👑', points: '5000점+' }
										] as grade}
											<div class="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
												<div class="text-2xl mb-2">{grade.icon}</div>
												<div class="font-medium text-gray-900 dark:text-white text-sm">{grade.name}</div>
												<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{grade.points}</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{:else if activeTab === 'social'}
							<!-- Social Network -->
							<div class="space-y-6">
								<h2 class="text-2xl font-bold text-gray-900 dark:text-white">소셜 네트워크</h2>
								
								<div class="grid lg:grid-cols-2 gap-6">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">개인화 피드</h3>
										<PersonalizedFeed limit={10} />
									</div>
									
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">추천 크리에이터</h3>
										<UserRecommendations limit={5} />
									</div>
								</div>
								
								<div class="grid lg:grid-cols-2 gap-6">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">팔로워</h3>
										<UserConnectionsList userId={$user.id} type="followers" limit={10} />
									</div>
									
									<div>
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">팔로잉</h3>
										<UserConnectionsList userId={$user.id} type="following" limit={10} />
									</div>
								</div>
								
								<!-- Demo Users for Testing -->
								<div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
									<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">데모 사용자 (팔로우 테스트)</h3>
									<div class="grid md:grid-cols-2 gap-4">
										{#each demoUsers as demoUser}
											<div class="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
												<div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
													<span class="text-lg">{demoUser.favoriteTeam.shortName.charAt(0)}</span>
												</div>
												<div class="flex-1">
													<h4 class="font-medium text-gray-900 dark:text-white">{demoUser.displayName}</h4>
													<p class="text-sm text-gray-500 dark:text-gray-400">{demoUser.grade.koreanName}</p>
													<p class="text-xs text-gray-400 dark:text-gray-500">{demoUser.favoriteTeam.name} 팬</p>
												</div>
												<FollowButton targetUser={demoUser} size="sm" />
											</div>
										{/each}
									</div>
								</div>
							</div>
						{:else if activeTab === 'team'}
							<!-- Team Selection -->
							<div class="space-y-6">
								<h2 class="text-2xl font-bold text-gray-900 dark:text-white">KBO 팀 선택</h2>
								
								<div class="bg-white dark:bg-gray-800 rounded-xl p-6">
									<TeamBadgeSelector 
										bind:selectedTeam={selectedTeam}
										showSeasonTicketBadge={$user.grade.level === 'expert' || $user.grade.level === 'legend'}
										on:select={handleTeamSelect}
										on:season-ticket={(e) => console.log('Season ticket for:', e.detail)}
									/>
								</div>
								
								{#if $user.favoriteTeam}
									<div class="bg-gradient-to-r rounded-xl p-6 text-white"
										style="background: linear-gradient(135deg, {$user.favoriteTeam.colors?.primary || '#3B82F6'}, {$user.favoriteTeam.colors?.secondary || '#1E40AF'})"
									>
										<h3 class="text-xl font-bold mb-2">현재 응원팀</h3>
										<p class="text-lg">{$user.favoriteTeam.name}</p>
										<p class="text-white/80">홈구장: {$user.favoriteTeam.stadium || '미정'}</p>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<!-- Unauthenticated State -->
			<div class="text-center py-16">
				<div class="max-w-2xl mx-auto">
					<div class="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
						<svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
						KBO 홀로그래픽 카드 커뮤니티에 오신 것을 환영합니다
					</h2>
					
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
						로그인하여 야구 카드 제작, 등급 시스템, 소셜 네트워크 기능을 체험해보세요
					</p>
					
					<div class="grid md:grid-cols-3 gap-6 mb-8">
						<div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
							<div class="text-3xl mb-4">🎨</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">홀로그래픽 카드 제작</h3>
							<p class="text-gray-600 dark:text-gray-400">60fps 보장 홀로그래픽 효과로 실물 카드 같은 경험</p>
						</div>
						
						<div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
							<div class="text-3xl mb-4">🏆</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">KBO 팬 등급 시스템</h3>
							<p class="text-gray-600 dark:text-gray-400">야구 덕후부터 구단 레전드까지 성장하는 재미</p>
						</div>
						
						<div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
							<div class="text-3xl mb-4">👥</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">소셜 네트워크</h3>
							<p class="text-gray-600 dark:text-gray-400">같은 팀 팬들과 함께하는 야구 문화 공간</p>
						</div>
					</div>
					
					<button
						on:click={handleSignIn}
						class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
					>
						지금 시작하기
					</button>
				</div>
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