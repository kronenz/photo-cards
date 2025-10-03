<script lang="ts">
	import { onMount } from 'svelte';
	import { socialService, type SocialRecommendation } from '$lib/services/socialService';
	import { user as currentUser } from '$lib/services/authService';
	import FollowButton from './FollowButton.svelte';

	export let limit = 5;
	export let showTitle = true;

	let recommendations: SocialRecommendation[] = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(() => {
		if ($currentUser) {
			loadRecommendations();
		}
	});

	async function loadRecommendations() {
		if (!$currentUser) return;

		isLoading = true;
		error = null;

		try {
			recommendations = await socialService.getUserRecommendations(limit);
		} catch (err) {
			error = err instanceof Error ? err.message : '추천 사용자를 불러올 수 없습니다.';
		} finally {
			isLoading = false;
		}
	}

	function getReasonIcon(reason: string): string {
		const icons = {
			same_team: '⚾',
			similar_interests: '🎨',
			mutual_connections: '👥',
			high_activity: '🔥',
			new_user: '🌟'
		};
		return icons[reason as keyof typeof icons] || '👤';
	}

	function getReasonColor(reason: string): string {
		const colors = {
			same_team: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			similar_interests: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
			mutual_connections: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
			high_activity: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
			new_user: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
		};
		return colors[reason as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
	}

	function getGradeIcon(level: string): string {
		const icons = {
			rookie: '🥎',
			fan: '⚾',
			supporter: '🎺',
			expert: '🏟️',
			legend: '👑'
		};
		return icons[level as keyof typeof icons] || icons.rookie;
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}

	function handleFollowSuccess(recommendation: SocialRecommendation) {
		// Remove from recommendations after following
		recommendations = recommendations.filter(r => r.user.id !== recommendation.user.id);
	}
</script>

<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
	{#if showTitle}
		<!-- Header -->
		<div class="p-6 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center gap-3">
				<div class="text-2xl">🎯</div>
				<div>
					<h2 class="text-xl font-bold text-gray-900 dark:text-white">
						추천 크리에이터
					</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						관심사가 비슷한 야구 팬들을 만나보세요
					</p>
				</div>
			</div>
		</div>
	{/if}

	<div class="p-6">
		{#if !$currentUser}
			<!-- Not Authenticated -->
			<div class="text-center py-8">
				<div class="text-4xl mb-4">🔐</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					로그인이 필요합니다
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					맞춤 추천을 받으려면 로그인하세요
				</p>
			</div>
		{:else if isLoading}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-8">
				<div class="flex items-center gap-3">
					<div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					<span class="text-gray-600 dark:text-gray-400">추천 사용자 찾는 중...</span>
				</div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center py-8">
				<div class="text-red-500 mb-2">⚠️</div>
				<p class="text-red-600 dark:text-red-400">{error}</p>
				<button
					on:click={loadRecommendations}
					class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					다시 시도
				</button>
			</div>
		{:else if recommendations.length === 0}
			<!-- Empty State -->
			<div class="text-center py-8">
				<div class="text-4xl mb-4">🎯</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					추천할 사용자가 없습니다
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					더 많은 활동을 하면 맞춤 추천을 받을 수 있어요!
				</p>
			</div>
		{:else}
			<!-- Recommendations List -->
			<div class="space-y-4">
				{#each recommendations as recommendation}
					<div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
						<!-- Avatar -->
						<div class="flex-shrink-0">
							<div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
								{#if recommendation.user.avatar}
									<img 
										src={recommendation.user.avatar} 
										alt={recommendation.user.displayName}
										class="w-full h-full object-cover"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center text-gray-400">
										<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</div>
								{/if}
							</div>
						</div>

						<!-- User Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<h3 class="font-semibold text-gray-900 dark:text-white truncate">
									{recommendation.user.displayName}
								</h3>
								{#if recommendation.user.isVerified}
									<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
										<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
								{/if}
							</div>
							
							<div class="flex items-center gap-2 mb-2">
								{#if recommendation.user.grade}
									<span class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
										<span>{getGradeIcon(recommendation.user.grade.level)}</span>
										{recommendation.user.grade.koreanName}
									</span>
								{/if}
								
								{#if recommendation.user.favoriteTeam}
									<span class="text-xs text-gray-500 dark:text-gray-400">
										{recommendation.user.favoriteTeam.shortName} 팬
									</span>
								{/if}
							</div>

							<!-- Recommendation Reason -->
							<div class="flex items-center gap-2 mb-2">
								<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {getReasonColor(recommendation.reason)}">
									<span>{getReasonIcon(recommendation.reason)}</span>
									{recommendation.description}
								</span>
							</div>

							{#if recommendation.user.bio}
								<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
									{recommendation.user.bio}
								</p>
							{/if}
						</div>

						<!-- Stats -->
						<div class="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
							<div>카드 {formatNumber(recommendation.user.stats?.cardsCreated || 0)}</div>
							<div>좋아요 {formatNumber(recommendation.user.stats?.totalLikes || 0)}</div>
						</div>

						<!-- Follow Button -->
						<div class="flex-shrink-0">
							<FollowButton 
								targetUser={recommendation.user}
								size="sm"
								variant="primary"
								on:follow={() => handleFollowSuccess(recommendation)}
							/>
						</div>
					</div>
				{/each}
			</div>

			<!-- Refresh Button -->
			<div class="mt-6 text-center">
				<button
					on:click={loadRecommendations}
					class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
				>
					🔄 새로운 추천 받기
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>