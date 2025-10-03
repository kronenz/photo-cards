<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService, user } from '$lib/services/authService';
	import type { UserProfile } from '$lib/types/auth';

	export let profile: UserProfile = $user!;
	export let showActions = true;
	export let compact = false;

	const dispatch = createEventDispatcher();

	function handleEditProfile() {
		dispatch('edit-profile');
	}

	function handleSignOut() {
		authService.signOut();
		dispatch('sign-out');
	}

	function getGradeColor(level: string): string {
		const colors = {
			rookie: 'bg-gray-500',
			fan: 'bg-blue-500',
			supporter: 'bg-purple-500',
			expert: 'bg-orange-500',
			legend: 'bg-gradient-to-r from-yellow-400 to-orange-500'
		};
		return colors[level as keyof typeof colors] || colors.rookie;
	}

	function getGradeBadgeText(level: string): string {
		const badges = {
			rookie: '🥎',
			fan: '⚾',
			supporter: '🎺',
			expert: '🏟️',
			legend: '👑'
		};
		return badges[level as keyof typeof badges] || badges.rookie;
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

<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
	{#if !compact}
		<!-- Header with Team Colors -->
		<div 
			class="h-20 bg-gradient-to-r relative"
			style="background: linear-gradient(135deg, {profile.favoriteTeam?.colors.primary || '#3B82F6'}, {profile.favoriteTeam?.colors.secondary || '#1E40AF'})"
		>
			{#if profile.favoriteTeam}
				<div class="absolute top-2 right-2 text-white/80 text-sm font-medium">
					{profile.favoriteTeam.name}
				</div>
			{/if}
		</div>
	{/if}

	<div class="p-6 {compact ? 'pb-4' : ''}">
		<!-- Profile Header -->
		<div class="flex items-start gap-4 {compact ? 'mb-3' : 'mb-6'} {!compact ? '-mt-10' : ''}">
			<!-- Avatar -->
			<div class="relative flex-shrink-0">
				<div class="w-16 h-16 {compact ? 'w-12 h-12' : ''} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900">
					{#if profile.avatar}
						<img src={profile.avatar} alt={profile.displayName} class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full flex items-center justify-center text-gray-400">
							<svg class="w-6 h-6 {compact ? 'w-4 h-4' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
					{/if}
				</div>
				
				<!-- Grade Badge -->
				<div class="absolute -bottom-1 -right-1 w-6 h-6 {compact ? 'w-5 h-5' : ''} {getGradeColor(profile.grade.level)} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">
					{getGradeBadgeText(profile.grade.level)}
				</div>
			</div>

			<!-- Profile Info -->
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<h3 class="text-lg {compact ? 'text-base' : ''} font-bold text-gray-900 dark:text-white truncate">
						{profile.displayName}
					</h3>
					{#if profile.isVerified}
						<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
							<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					{/if}
				</div>
				
				<div class="flex items-center gap-2 mb-2">
					<span class="text-sm {compact ? 'text-xs' : ''} font-medium text-gray-600 dark:text-gray-400">
						{profile.grade.koreanName}
					</span>
					<span class="text-xs text-gray-500 dark:text-gray-500">
						{formatNumber(profile.stats.gradePoints)}점
					</span>
				</div>

				{#if profile.bio && !compact}
					<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
						{profile.bio}
					</p>
				{/if}
			</div>

			<!-- Actions -->
			{#if showActions}
				<div class="flex gap-2">
					<button
						on:click={handleEditProfile}
						class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						title="프로필 편집"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</button>
					<button
						on:click={handleSignOut}
						class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						title="로그아웃"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>
				</div>
			{/if}
		</div>

		{#if !compact}
			<!-- Stats -->
			<div class="grid grid-cols-4 gap-4 mb-6">
				<div class="text-center">
					<div class="text-lg font-bold text-gray-900 dark:text-white">
						{formatNumber(profile.stats.cardsCreated)}
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">카드</div>
				</div>
				<div class="text-center">
					<div class="text-lg font-bold text-gray-900 dark:text-white">
						{formatNumber(profile.stats.totalLikes)}
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">좋아요</div>
				</div>
				<div class="text-center">
					<div class="text-lg font-bold text-gray-900 dark:text-white">
						{formatNumber(profile.stats.followers)}
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">팔로워</div>
				</div>
				<div class="text-center">
					<div class="text-lg font-bold text-gray-900 dark:text-white">
						{formatNumber(profile.stats.following)}
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">팔로잉</div>
				</div>
			</div>

			<!-- Grade Progress -->
			<div class="mb-4">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
						다음 등급까지
					</span>
					<span class="text-sm text-gray-500 dark:text-gray-400">
						{profile.grade.maxPoints === Infinity ? '최고 등급' : `${formatNumber(profile.grade.maxPoints - profile.stats.gradePoints)}점 남음`}
					</span>
				</div>
				{#if profile.grade.maxPoints !== Infinity}
					<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
						<div 
							class="h-2 rounded-full {getGradeColor(profile.grade.level)} transition-all duration-300"
							style="width: {Math.min(100, ((profile.stats.gradePoints - profile.grade.minPoints) / (profile.grade.maxPoints - profile.grade.minPoints)) * 100)}%"
						></div>
					</div>
				{:else}
					<div class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full h-2"></div>
				{/if}
			</div>

			<!-- Badges -->
			{#if profile.badges.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each profile.badges.slice(0, 3) as badge}
						<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
							{badge}
						</span>
					{/each}
					{#if profile.badges.length > 3}
						<span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
							+{profile.badges.length - 3}
						</span>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>