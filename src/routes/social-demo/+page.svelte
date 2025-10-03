<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/services/authService';
	import FollowButton from '$lib/components/social/FollowButton.svelte';
	import UserConnectionsList from '$lib/components/social/UserConnectionsList.svelte';
	import PersonalizedFeed from '$lib/components/social/PersonalizedFeed.svelte';
	import UserRecommendations from '$lib/components/social/UserRecommendations.svelte';
	import { socialService } from '$lib/services/socialService';
	import type { UserProfile } from '$lib/types/auth';

	let demoUsers: UserProfile[] = [
		{
			id: 'demo-user-1',
			email: 'lgfan@example.com',
			username: 'lgfan2024',
			displayName: 'LG 트윈스 매니아',
			avatar: undefined,
			bio: 'LG 트윈스를 사랑하는 20년차 팬입니다. 홀로그래픽 카드로 추억을 남겨요!',
			favoriteTeam: {
				id: 'lg-twins',
				name: 'LG 트윈스',
				englishName: 'LG Twins',
				city: '서울',
				stadium: '잠실야구장',
				founded: 1982,
				colors: {
					primary: '#C30452',
					secondary: '#FFFFFF'
				},
				mascot: '🦅',
				fanClubName: 'LG 트윈스 팬클럽',
				cheers: ['LG 트윈스 파이팅!'],
				achievements: {
					championships: 2,
					lastChampionship: 1994
				}
			},
			grade: {
				level: 'expert',
				name: 'Season Ticket Holder',
				koreanName: '시즌권 홀더',
				points: 3500,
				minPoints: 1501,
				maxPoints: 5000,
				benefits: ['프리미엄 편집 도구', '무제한 업로드'],
				holographicEffects: ['premium-glow', 'team-colors']
			},
			stats: {
				cardsCreated: 127,
				totalLikes: 2340,
				totalViews: 15600,
				followers: 89,
				following: 45,
				gradePoints: 3500,
				commentsReceived: 456,
				featuredCards: 12,
				monthlyActive: true,
				joinDate: '2023-03-15',
				lastActive: '2024-01-15'
			},
			stadiumVisits: ['잠실야구장', 'KT 위즈파크'],
			preferences: {
				emailNotifications: true,
				pushNotifications: true,
				publicProfile: true,
				showStats: true,
				theme: 'auto',
				language: 'ko',
				holographicQuality: 'high',
				autoSave: true
			},
			badges: ['verified', 'early-adopter', 'lg-fan'],
			achievements: ['first-card', '100-likes', 'featured-creator'],
			created: '2023-03-15T00:00:00Z',
			updated: '2024-01-15T00:00:00Z',
			isVerified: true
		},
		{
			id: 'demo-user-2',
			email: 'ktwizfan@example.com',
			username: 'ktwizard',
			displayName: 'KT 위즈 서포터',
			avatar: undefined,
			bio: '수원 KT 위즈파크에서 만나요! 매 경기 직관하는 열성팬입니다.',
			favoriteTeam: {
				id: 'kt-wiz',
				name: 'KT 위즈',
				englishName: 'KT Wiz',
				city: '수원',
				stadium: 'KT 위즈파크',
				founded: 2013,
				colors: {
					primary: '#000000',
					secondary: '#FF6600'
				},
				mascot: '🧙‍♂️',
				fanClubName: 'KT 위즈 팬클럽',
				cheers: ['KT 위즈 파이팅!'],
				achievements: {
					championships: 0
				}
			},
			grade: {
				level: 'supporter',
				name: 'Supporter',
				koreanName: '응원단 멤버',
				points: 1800,
				minPoints: 501,
				maxPoints: 1500,
				benefits: ['팀 컬러 홀로그래픽 효과'],
				holographicEffects: ['team-colors']
			},
			stats: {
				cardsCreated: 67,
				totalLikes: 890,
				totalViews: 4500,
				followers: 34,
				following: 78,
				gradePoints: 1800,
				commentsReceived: 123,
				featuredCards: 3,
				monthlyActive: true,
				joinDate: '2023-08-20',
				lastActive: '2024-01-14'
			},
			stadiumVisits: ['KT 위즈파크'],
			preferences: {
				emailNotifications: true,
				pushNotifications: false,
				publicProfile: true,
				showStats: true,
				theme: 'dark',
				language: 'ko',
				holographicQuality: 'medium',
				autoSave: true
			},
			badges: ['kt-fan', 'active-user'],
			achievements: ['first-card', '50-likes'],
			created: '2023-08-20T00:00:00Z',
			updated: '2024-01-14T00:00:00Z',
			isVerified: false
		},
		{
			id: 'demo-user-3',
			email: 'doosanfan@example.com',
			username: 'bearspower',
			displayName: '두산 베어스 파워',
			avatar: undefined,
			bio: '잠실에서 두산 베어스를 응원합니다. 홈런 카드 전문 제작자!',
			favoriteTeam: {
				id: 'doosan-bears',
				name: '두산 베어스',
				englishName: 'Doosan Bears',
				city: '서울',
				stadium: '잠실야구장',
				founded: 1982,
				colors: {
					primary: '#131230',
					secondary: '#FFFFFF'
				},
				mascot: '🐻',
				fanClubName: '두산 베어스 팬클럽',
				cheers: ['두산 베어스 파이팅!'],
				achievements: {
					championships: 6,
					lastChampionship: 2016
				}
			},
			grade: {
				level: 'fan',
				name: 'Fan',
				koreanName: '외야석 팬',
				points: 750,
				minPoints: 101,
				maxPoints: 500,
				benefits: ['응원가 BGM 추가'],
				holographicEffects: ['basic-glow']
			},
			stats: {
				cardsCreated: 23,
				totalLikes: 156,
				totalViews: 890,
				followers: 12,
				following: 29,
				gradePoints: 750,
				commentsReceived: 34,
				featuredCards: 1,
				monthlyActive: true,
				joinDate: '2023-11-10',
				lastActive: '2024-01-13'
			},
			stadiumVisits: ['잠실야구장'],
			preferences: {
				emailNotifications: false,
				pushNotifications: true,
				publicProfile: true,
				showStats: false,
				theme: 'light',
				language: 'ko',
				holographicQuality: 'low',
				autoSave: false
			},
			badges: ['doosan-fan'],
			achievements: ['first-card'],
			created: '2023-11-10T00:00:00Z',
			updated: '2024-01-13T00:00:00Z',
			isVerified: false
		}
	];

	let selectedTab = 'follow-demo';
	let selectedUserId = 'demo-user-1';

	function handleFollowSuccess(targetUser: UserProfile) {
		console.log('Successfully followed:', targetUser.displayName);
	}

	function handleUnfollowSuccess(targetUser: UserProfile) {
		console.log('Successfully unfollowed:', targetUser.displayName);
	}
</script>

<svelte:head>
	<title>소셜 그래프 & 팔로우 시스템 데모</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
				🤝 소셜 그래프 & 팔로우 시스템
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
				KBO 팬들을 위한 소셜 네트워킹 기능을 체험해보세요. 
				팔로우/언팔로우, 개인화 피드, 사용자 추천 등의 기능을 확인할 수 있습니다.
			</p>
		</div>

		<!-- Authentication Status -->
		<div class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
			<div class="flex items-center gap-3">
				<div class="text-2xl">
					{$user ? '✅' : '❌'}
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 dark:text-white">
						인증 상태
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						{#if $user}
							{$user.displayName}님으로 로그인됨
						{:else}
							로그인이 필요합니다. 모든 기능을 체험하려면 로그인하세요.
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Tab Navigation -->
		<div class="mb-8">
			<nav class="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
				<button
					class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {selectedTab === 'follow-demo' 
						? 'border-blue-500 text-blue-600 dark:text-blue-400' 
						: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					on:click={() => selectedTab = 'follow-demo'}
				>
					팔로우 버튼 데모
				</button>
				<button
					class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {selectedTab === 'connections' 
						? 'border-blue-500 text-blue-600 dark:text-blue-400' 
						: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					on:click={() => selectedTab = 'connections'}
				>
					팔로워/팔로잉 목록
				</button>
				<button
					class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {selectedTab === 'feed' 
						? 'border-blue-500 text-blue-600 dark:text-blue-400' 
						: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					on:click={() => selectedTab = 'feed'}
				>
					개인화 피드
				</button>
				<button
					class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {selectedTab === 'recommendations' 
						? 'border-blue-500 text-blue-600 dark:text-blue-400' 
						: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					on:click={() => selectedTab = 'recommendations'}
				>
					사용자 추천
				</button>
			</nav>
		</div>

		<!-- Tab Content -->
		<div class="space-y-8">
			{#if selectedTab === 'follow-demo'}
				<!-- Follow Button Demo -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div class="space-y-6">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							팔로우 버튼 데모
						</h2>
						<p class="text-gray-600 dark:text-gray-400">
							다양한 사용자 프로필과 팔로우 버튼을 체험해보세요.
						</p>

						{#each demoUsers as demoUser}
							<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
								<div class="flex items-center gap-4">
									<!-- Avatar -->
									<div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
										{demoUser.favoriteTeam?.mascot || demoUser.displayName.charAt(0)}
									</div>

									<!-- User Info -->
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
												{demoUser.displayName}
											</h3>
											{#if demoUser.isVerified}
												<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
													<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
												</svg>
											{/if}
										</div>
										
										<div class="flex items-center gap-3 mb-2">
											<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
												{demoUser.grade?.koreanName}
											</span>
											<span class="text-sm text-gray-500 dark:text-gray-400">
												{demoUser.favoriteTeam?.name} 팬
											</span>
										</div>

										<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
											{demoUser.bio}
										</p>

										<div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
											<span>카드 {demoUser.stats?.cardsCreated}</span>
											<span>좋아요 {demoUser.stats?.totalLikes}</span>
											<span>팔로워 {demoUser.stats?.followers}</span>
										</div>
									</div>

									<!-- Follow Button -->
									<div class="flex-shrink-0">
										<FollowButton 
											targetUser={demoUser}
											size="md"
											variant="primary"
											showFollowCount={true}
											on:follow={() => handleFollowSuccess(demoUser)}
											on:unfollow={() => handleUnfollowSuccess(demoUser)}
										/>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Follow Button Variants -->
					<div class="space-y-6">
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
							버튼 스타일 변형
						</h3>

						<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
							<h4 class="font-medium text-gray-900 dark:text-white">크기 변형</h4>
							<div class="flex items-center gap-4">
								<FollowButton targetUser={demoUsers[0]} size="sm" variant="primary" />
								<FollowButton targetUser={demoUsers[0]} size="md" variant="primary" />
								<FollowButton targetUser={demoUsers[0]} size="lg" variant="primary" />
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
							<h4 class="font-medium text-gray-900 dark:text-white">스타일 변형</h4>
							<div class="flex items-center gap-4">
								<FollowButton targetUser={demoUsers[1]} size="md" variant="primary" />
								<FollowButton targetUser={demoUsers[1]} size="md" variant="secondary" />
								<FollowButton targetUser={demoUsers[1]} size="md" variant="ghost" />
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
							<h4 class="font-medium text-gray-900 dark:text-white">팔로워 수 표시</h4>
							<div class="flex items-center gap-4">
								<FollowButton targetUser={demoUsers[2]} size="md" variant="primary" showFollowCount={false} />
								<FollowButton targetUser={demoUsers[2]} size="md" variant="primary" showFollowCount={true} />
							</div>
						</div>
					</div>
				</div>

			{:else if selectedTab === 'connections'}
				<!-- Connections Lists -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
							팔로워 목록
						</h2>
						<UserConnectionsList userId={selectedUserId} type="followers" limit={10} />
					</div>
					
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
							팔로잉 목록
						</h2>
						<UserConnectionsList userId={selectedUserId} type="following" limit={10} />
					</div>
				</div>

				<!-- User Selector -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						사용자 선택
					</h3>
					<div class="flex gap-4">
						{#each demoUsers as demoUser}
							<button
								class="px-4 py-2 rounded-lg border transition-colors {selectedUserId === demoUser.id 
									? 'bg-blue-600 text-white border-blue-600' 
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}"
								on:click={() => selectedUserId = demoUser.id}
							>
								{demoUser.displayName}
							</button>
						{/each}
					</div>
				</div>

			{:else if selectedTab === 'feed'}
				<!-- Personalized Feed -->
				<div class="max-w-4xl mx-auto">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
						개인화 피드
					</h2>
					<PersonalizedFeed limit={10} />
				</div>

			{:else if selectedTab === 'recommendations'}
				<!-- User Recommendations -->
				<div class="max-w-4xl mx-auto">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
						사용자 추천
					</h2>
					<UserRecommendations limit={8} />
				</div>
			{/if}
		</div>

		<!-- Feature Summary -->
		<div class="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
				🎯 구현된 소셜 그래프 기능
			</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="text-3xl mb-3">👥</div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">팔로우/언팔로우</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						사용자 간 팔로우 관계 관리와 실시간 상태 업데이트
					</p>
				</div>
				
				<div class="text-center">
					<div class="text-3xl mb-3">📋</div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">팔로워/팔로잉 목록</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						관계 유형별 사용자 목록과 상호 연결 정보 표시
					</p>
				</div>
				
				<div class="text-center">
					<div class="text-3xl mb-3">📰</div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">개인화 피드</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						팔로우한 사용자들의 활동 기반 맞춤 피드 제공
					</p>
				</div>
				
				<div class="text-center">
					<div class="text-3xl mb-3">🎯</div>
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">사용자 추천</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						같은 팀 팬, 공통 관심사 기반 지능형 사용자 추천
					</p>
				</div>
			</div>

			<div class="mt-8 text-center">
				<div class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
					Task 5.3 소셜 그래프와 팔로우 시스템 구현 완료
				</div>
			</div>
		</div>
	</div>
</div>