<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { socialService } from '$lib/services/socialService';
	import { user as currentUser } from '$lib/services/authService';
	import type { UserProfile } from '$lib/types/auth';

	export let targetUser: UserProfile;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let showFollowCount = false;

	const dispatch = createEventDispatcher<{
		follow: UserProfile;
		unfollow: UserProfile;
	}>();

	let isFollowing = false;
	let isLoading = false;
	let followerCount = targetUser.stats?.followers || 0;

	onMount(async () => {
		if ($currentUser && targetUser.id !== $currentUser.id) {
			isFollowing = await socialService.isFollowing(targetUser.id);
		}
	});

	async function handleFollowToggle() {
		if (!$currentUser || isLoading) return;

		isLoading = true;

		try {
			if (isFollowing) {
				const success = await socialService.unfollowUser(targetUser.id);
				if (success) {
					isFollowing = false;
					followerCount = Math.max(0, followerCount - 1);
					dispatch('unfollow', targetUser);
				}
			} else {
				const success = await socialService.followUser(targetUser.id);
				if (success) {
					isFollowing = true;
					followerCount += 1;
					dispatch('follow', targetUser);
				}
			}
		} catch (error) {
			console.error('Follow/unfollow error:', error);
		} finally {
			isLoading = false;
		}
	}

	function getSizeClasses(size: string): string {
		const sizes = {
			sm: 'px-3 py-1.5 text-sm',
			md: 'px-4 py-2 text-sm',
			lg: 'px-6 py-3 text-base'
		};
		return sizes[size as keyof typeof sizes] || sizes.md;
	}

	function getVariantClasses(variant: string, isFollowing: boolean): string {
		if (isFollowing) {
			// Following state - show unfollow on hover
			return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600';
		}

		const variants = {
			primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
			secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
			ghost: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent'
		};
		return variants[variant as keyof typeof variants] || variants.primary;
	}

	function formatFollowerCount(count: number): string {
		if (count >= 1000000) {
			return (count / 1000000).toFixed(1) + 'M';
		} else if (count >= 1000) {
			return (count / 1000).toFixed(1) + 'K';
		}
		return count.toString();
	}

	// Don't show follow button for current user
	$: showButton = $currentUser && targetUser.id !== $currentUser.id;
</script>

{#if showButton}
	<div class="flex items-center gap-2">
		<button
			on:click={handleFollowToggle}
			disabled={isLoading}
			class="relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group {getSizeClasses(size)} {getVariantClasses(variant, isFollowing)}"
		>
			{#if isLoading}
				<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
			{:else if isFollowing}
				<!-- Following state -->
				<svg class="w-4 h-4 group-hover:hidden" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
				<svg class="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
				<span class="group-hover:hidden">팔로잉</span>
				<span class="hidden group-hover:block">언팔로우</span>
			{:else}
				<!-- Not following state -->
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				<span>팔로우</span>
			{/if}
		</button>

		{#if showFollowCount && followerCount > 0}
			<span class="text-sm text-gray-500 dark:text-gray-400">
				팔로워 {formatFollowerCount(followerCount)}
			</span>
		{/if}
	</div>
{/if}