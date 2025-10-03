<script lang="ts">
	import { onMount } from 'svelte';
	import { socialService, type UserConnection } from '$lib/services/socialService';
	import FollowButton from './FollowButton.svelte';
	import type { UserProfile } from '$lib/types/auth';

	export let userId: string;
	export let type: 'followers' | 'following' = 'followers';
	export let limit = 20;

	let connections: UserConnection[] = [];
	let isLoading = true;
	let error: string | null = null;
	let currentPage = 1;
	let hasMore = true;

	onMount(() => {
		loadConnections();
	});

	async function loadConnections(page = 1) {
		isLoading = true;
		error = null;

		try {
			let newConnections: UserConnection[] = [];
			
			if (type === 'followers') {
				newConnections = await socialService.getFollowers(userId, page, limit);
			} else {
				newConnections = await socialService.getFollowing(userId, page, limit);
			}

			if (page === 1) {
				connections = newConnections;
			} else {
				connections = [...connections, ...newConnections];
			}

			hasMore = newConnections.length === limit;
			currentPage = page;
		} catch (err) {
			error = err instanceof Error ? err.message : '연결 목록을 불러올 수 없습니다.';
		} finally {
			isLoading = false;
		}
	}

	async function loadMore() {
		if (!isLoading && hasMore) {
			await loadConnections(currentPage + 1);
		}
	}

	function getRelationshipBadge(relationship: string): { text: string; color: string } {
		const badges = {
			following: { text: '팔로잉', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
			follower: { text: '팔로워', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
			mutual: { text: '맞팔로우', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
			none: { text: '', color: '' }
		};
		return badges[relationship as keyof typeof badges] || badges.none;
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
</script>

<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
	<!-- Header -->
	<div class="p-6 border-b border-gray-200 dark:border-gray-700">
		<h2 class="text-xl font-bold text-gray-900 dark:text-white">
			{type === 'followers' ? '팔로워' : '팔로잉'}
			{#if connections.length > 0}
				<span class="text-gray-500 dark:text-gray-400">({connections.length})</span>
			{/if}
		</h2>
	</div>

	<div class="p-6">
		{#if isLoading && connections.length === 0}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-8">
				<div class="flex items-center gap-3">
					<div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					<span class="text-gray-600 dark:text-gray-400">연결 목록 로딩 중...</span>
				</div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center py-8">
				<div class="text-red-500 mb-2">⚠️</div>
				<p class="text-red-600 dark:text-red-400">{error}</p>
				<button
					on:click={() => loadConnections(1)}
					class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					다시 시도
				</button>
			</div>
		{:else if connections.length === 0}
			<!-- Empty State -->
			<div class="text-center py-8">
				<div class="text-4xl mb-4">
					{type === 'followers' ? '👥' : '🔗'}
				</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					{type === 'followers' ? '아직 팔로워가 없습니다' : '아직 팔로우하는 사람이 없습니다'}
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					{type === 'followers' 
						? '멋진 카드를 만들어서 팔로워를 늘려보세요!' 
						: '관심 있는 크리에이터를 팔로우해보세요!'}
				</p>
			</div>
		{:else}
			<!-- Connections List -->
			<div class="space-y-4">
				{#each connections as connection}
					<div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
						<!-- Avatar -->
						<div class="flex-shrink-0">
							<div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
								{#if connection.user.avatar}
									<img 
										src={connection.user.avatar} 
										alt={connection.user.displayName}
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
									{connection.user.displayName}
								</h3>
								{#if connection.user.isVerified}
									<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
										<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
								{/if}
							</div>
							
							<div class="flex items-center gap-2 mb-2">
								{#if connection.user.grade}
									<span class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
										<span>{getGradeIcon(connection.user.grade.level)}</span>
										{connection.user.grade.koreanName}
									</span>
								{/if}
								
								{#if connection.user.favoriteTeam}
									<span class="text-xs text-gray-500 dark:text-gray-400">
										{connection.user.favoriteTeam.shortName} 팬
									</span>
								{/if}
							</div>

							{#if connection.user.bio}
								<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
									{connection.user.bio}
								</p>
							{/if}

							<!-- Connection Info -->
							<div class="flex items-center gap-3 mt-2">
								{#if connection.relationship !== 'none'}
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getRelationshipBadge(connection.relationship).color}">
										{getRelationshipBadge(connection.relationship).text}
									</span>
								{/if}
								
								{#if connection.mutualConnections > 0}
									<span class="text-xs text-gray-500 dark:text-gray-400">
										공통 팔로우 {connection.mutualConnections}명
									</span>
								{/if}
								
								{#if connection.followedAt}
									<span class="text-xs text-gray-500 dark:text-gray-400">
										{new Date(connection.followedAt).toLocaleDateString('ko-KR')}
									</span>
								{/if}
							</div>
						</div>

						<!-- Stats -->
						<div class="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
							<div>카드 {formatNumber(connection.user.stats?.cardsCreated || 0)}</div>
							<div>좋아요 {formatNumber(connection.user.stats?.totalLikes || 0)}</div>
						</div>

						<!-- Follow Button -->
						<div class="flex-shrink-0">
							<FollowButton 
								targetUser={connection.user}
								size="sm"
								variant="secondary"
								on:follow={() => {
									// Update connection relationship
									connection.relationship = connection.relationship === 'follower' ? 'mutual' : 'following';
								}}
								on:unfollow={() => {
									// Update connection relationship
									connection.relationship = connection.relationship === 'mutual' ? 'follower' : 'none';
								}}
							/>
						</div>
					</div>
				{/each}
			</div>

			<!-- Load More Button -->
			{#if hasMore}
				<div class="mt-6 text-center">
					<button
						on:click={loadMore}
						disabled={isLoading}
						class="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isLoading}
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
								로딩 중...
							</div>
						{:else}
							더 보기
						{/if}
					</button>
				</div>
			{/if}
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