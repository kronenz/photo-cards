<script lang="ts">
	import { onMount } from 'svelte';
	import { socialService, type FeedItem } from '$lib/services/socialService';
	import { user as currentUser } from '$lib/services/authService';

	export let limit = 20;

	let feedItems: FeedItem[] = [];
	let isLoading = true;
	let error: string | null = null;
	let currentPage = 1;
	let hasMore = true;

	onMount(() => {
		if ($currentUser) {
			loadFeed();
		}
	});

	async function loadFeed(page = 1) {
		if (!$currentUser) return;

		isLoading = true;
		error = null;

		try {
			const newItems = await socialService.getPersonalizedFeed(page, limit);
			
			if (page === 1) {
				feedItems = newItems;
			} else {
				feedItems = [...feedItems, ...newItems];
			}

			hasMore = newItems.length === limit;
			currentPage = page;
		} catch (err) {
			error = err instanceof Error ? err.message : '피드를 불러올 수 없습니다.';
		} finally {
			isLoading = false;
		}
	}

	async function loadMore() {
		if (!isLoading && hasMore) {
			await loadFeed(currentPage + 1);
		}
	}

	function getFeedItemIcon(type: string): string {
		const icons = {
			card_created: '🎨',
			card_liked: '❤️',
			user_followed: '👥',
			grade_upgraded: '⬆️',
			achievement_earned: '🏆'
		};
		return icons[type as keyof typeof icons] || '📢';
	}

	function getFeedItemTitle(item: FeedItem): string {
		const titles = {
			card_created: '새로운 카드를 만들었습니다',
			card_liked: '카드에 좋아요를 받았습니다',
			user_followed: '새로운 팔로워가 생겼습니다',
			grade_upgraded: '등급이 상승했습니다',
			achievement_earned: '새로운 업적을 달성했습니다'
		};
		return titles[item.type as keyof typeof titles] || '새로운 활동';
	}

	function getFeedItemDescription(item: FeedItem): string {
		switch (item.type) {
			case 'card_created':
				return item.content.title || '홀로그래픽 카드';
			case 'card_liked':
				return `${item.content.likeCount || 1}개의 좋아요`;
			case 'user_followed':
				return `${item.content.followerName || '누군가'}님이 팔로우했습니다`;
			case 'grade_upgraded':
				return `${item.content.newGrade || '새로운 등급'}으로 승급`;
			case 'achievement_earned':
				return item.content.achievementName || '새로운 업적';
			default:
				return '';
		}
	}

	function formatTimeAgo(timestamp: string): string {
		const now = new Date();
		const time = new Date(timestamp);
		const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return '방금 전';
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes}분 전`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours}시간 전`;
		} else if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days}일 전`;
		} else {
			return time.toLocaleDateString('ko-KR');
		}
	}
</script>

<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
	<!-- Header -->
	<div class="p-6 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-3">
			<div class="text-2xl">📰</div>
			<div>
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">
					개인화 피드
				</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					팔로우하는 크리에이터들의 최신 활동
				</p>
			</div>
		</div>
	</div>

	<div class="p-6">
		{#if !$currentUser}
			<!-- Not Authenticated -->
			<div class="text-center py-8">
				<div class="text-4xl mb-4">🔐</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					로그인이 필요합니다
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					개인화된 피드를 보려면 로그인하세요
				</p>
			</div>
		{:else if isLoading && feedItems.length === 0}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-8">
				<div class="flex items-center gap-3">
					<div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					<span class="text-gray-600 dark:text-gray-400">피드 로딩 중...</span>
				</div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center py-8">
				<div class="text-red-500 mb-2">⚠️</div>
				<p class="text-red-600 dark:text-red-400">{error}</p>
				<button
					on:click={() => loadFeed(1)}
					class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					다시 시도
				</button>
			</div>
		{:else if feedItems.length === 0}
			<!-- Empty State -->
			<div class="text-center py-8">
				<div class="text-4xl mb-4">📭</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					피드가 비어있습니다
				</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					관심 있는 크리에이터를 팔로우해서 피드를 채워보세요!
				</p>
				<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
					크리에이터 찾기
				</button>
			</div>
		{:else}
			<!-- Feed Items -->
			<div class="space-y-4">
				{#each feedItems as item}
					<div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
						<!-- User Avatar -->
						<div class="flex-shrink-0">
							<div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
								{#if item.user.avatar}
									<img 
										src={item.user.avatar} 
										alt={item.user.displayName}
										class="w-full h-full object-cover"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center text-gray-400">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</div>
								{/if}
							</div>
						</div>

						<!-- Feed Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-2">
								<span class="text-lg">{getFeedItemIcon(item.type)}</span>
								<h3 class="font-semibold text-gray-900 dark:text-white">
									{item.user.displayName}
								</h3>
								<span class="text-sm text-gray-500 dark:text-gray-400">
									{getFeedItemTitle(item)}
								</span>
							</div>

							<p class="text-gray-700 dark:text-gray-300 mb-2">
								{getFeedItemDescription(item)}
							</p>

							<!-- Content Preview -->
							{#if item.type === 'card_created' && item.content.imageUrl}
								<div class="mt-3 mb-2">
									<img 
										src={item.content.imageUrl} 
										alt="Card preview"
										class="w-20 h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
									/>
								</div>
							{/if}

							<div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
								<span>{formatTimeAgo(item.timestamp)}</span>
								
								{#if item.content.likes}
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
										</svg>
										{item.content.likes}
									</span>
								{/if}
								
								{#if item.content.comments}
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
										</svg>
										{item.content.comments}
									</span>
								{/if}
							</div>
						</div>

						<!-- Action Button -->
						<div class="flex-shrink-0">
							{#if item.type === 'card_created'}
								<button class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								</button>
							{/if}
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