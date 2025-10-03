<script lang="ts">
	import { onMount } from 'svelte';
	import { gradeService } from '$lib/services/gradeService';
	import type { UserGrade } from '$lib/types/auth';

	interface LeaderboardEntry {
		user: any;
		grade: UserGrade;
	}

	let leaderboard: LeaderboardEntry[] = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			leaderboard = await gradeService.getGradeLeaderboard(20);
		} catch (err) {
			error = err instanceof Error ? err.message : '리더보드를 불러올 수 없습니다.';
		} finally {
			isLoading = false;
		}
	});

	function getGradeColor(level: string): string {
		const colors = {
			rookie: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
			fan: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
			supporter: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
			expert: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
			legend: 'text-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30'
		};
		return colors[level as keyof typeof colors] || colors.rookie;
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

	function getRankIcon(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `${rank}`;
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
		<div class="flex items-center gap-3">
			<div class="text-2xl">🏆</div>
			<div>
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">
					KBO 팬 등급 리더보드
				</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					가장 활발한 야구 덕후들을 만나보세요
				</p>
			</div>
		</div>
	</div>

	<div class="p-6">
		{#if isLoading}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-8">
				<div class="flex items-center gap-3">
					<div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					<span class="text-gray-600 dark:text-gray-400">리더보드 로딩 중...</span>
				</div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center py-8">
				<div class="text-red-500 mb-2">⚠️</div>
				<p class="text-red-600 dark:text-red-400">{error}</p>
			</div>
		{:else if leaderboard.length === 0}
			<!-- Empty State -->
			<div class="text-center py-8">
				<div class="text-4xl mb-4">🏟️</div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					아직 등급 데이터가 없습니다
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					첫 번째 KBO 레전드가 되어보세요!
				</p>
			</div>
		{:else}
			<!-- Leaderboard -->
			<div class="space-y-3">
				{#each leaderboard as entry, index}
					<div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
						<!-- Rank -->
						<div class="flex-shrink-0 w-8 text-center">
							{#if index < 3}
								<span class="text-xl">{getRankIcon(index + 1)}</span>
							{:else}
								<span class="text-sm font-bold text-gray-500 dark:text-gray-400">
									{index + 1}
								</span>
							{/if}
						</div>

						<!-- Avatar -->
						<div class="flex-shrink-0">
							<div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
								{#if entry.user.avatar}
									<img 
										src={entry.user.avatar} 
										alt={entry.user.displayName}
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
									{entry.user.displayName || entry.user.username}
								</h3>
								{#if entry.user.isVerified}
									<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
										<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {getGradeColor(entry.grade.level)}">
									<span>{getGradeIcon(entry.grade.level)}</span>
									{entry.grade.koreanName}
								</span>
							</div>
						</div>

						<!-- Stats -->
						<div class="flex-shrink-0 text-right">
							<div class="text-lg font-bold text-gray-900 dark:text-white">
								{formatNumber(entry.grade.points)}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">점수</div>
						</div>

						<!-- Additional Stats -->
						<div class="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
							<div>카드 {formatNumber(entry.user.stats?.cardsCreated || 0)}</div>
							<div>좋아요 {formatNumber(entry.user.stats?.totalLikes || 0)}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div class="mt-6 text-center">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					더 많은 카드를 만들고 커뮤니티에 참여해서 등급을 올려보세요! 🚀
				</p>
			</div>
		{/if}
	</div>
</div>