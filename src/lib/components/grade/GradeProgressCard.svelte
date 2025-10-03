<script lang="ts">
	import { onMount } from 'svelte';
	import { gradeService, type GradeCalculation, type GradeBenefit } from '$lib/services/gradeService';
	import type { UserProfile } from '$lib/types/auth';

	export let user: UserProfile;
	export let showDetails = true;

	let gradeCalculation: GradeCalculation | null = null;
	let gradeBenefits: GradeBenefit[] = [];
	let isLoading = true;

	onMount(async () => {
		try {
			gradeCalculation = gradeService.calculateGrade(user.stats);
			gradeBenefits = gradeService.getGradeBenefits(user.grade);
		} catch (error) {
			console.error('Failed to calculate grade:', error);
		} finally {
			isLoading = false;
		}
	});

	function getGradeColor(level: string): string {
		const colors = {
			rookie: 'from-gray-400 to-gray-600',
			fan: 'from-blue-400 to-blue-600',
			supporter: 'from-purple-400 to-purple-600',
			expert: 'from-orange-400 to-orange-600',
			legend: 'from-yellow-400 to-orange-500'
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

	function getBenefitIcon(type: string): string {
		const icons = {
			feature: '🛠️',
			effect: '✨',
			privilege: '🏆',
			reward: '💰'
		};
		return icons[type as keyof typeof icons] || '⭐';
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
	{#if isLoading}
		<!-- Loading State -->
		<div class="p-6 flex items-center justify-center">
			<div class="flex items-center gap-3">
				<div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
				<span class="text-gray-600 dark:text-gray-400">등급 정보 로딩 중...</span>
			</div>
		</div>
	{:else if gradeCalculation}
		<!-- Grade Header -->
		<div class="bg-gradient-to-r {getGradeColor(gradeCalculation.currentGrade.level)} p-6 text-white">
			<div class="flex items-center gap-4">
				<div class="text-4xl">
					{getGradeIcon(gradeCalculation.currentGrade.level)}
				</div>
				<div class="flex-1">
					<h3 class="text-2xl font-bold mb-1">
						{gradeCalculation.currentGrade.koreanName}
					</h3>
					<p class="text-white/80 text-sm">
						{gradeCalculation.currentGrade.name}
					</p>
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold">
						{formatNumber(gradeCalculation.currentGrade.points)}
					</div>
					<div class="text-white/80 text-sm">점수</div>
				</div>
			</div>
		</div>

		<div class="p-6">
			<!-- Progress to Next Grade -->
			{#if gradeCalculation.nextGrade}
				<div class="mb-6">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
							다음 등급: {gradeCalculation.nextGrade.koreanName}
						</span>
						<span class="text-sm text-gray-500 dark:text-gray-400">
							{formatNumber(gradeCalculation.pointsToNext)}점 남음
						</span>
					</div>
					<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
						<div 
							class="h-3 bg-gradient-to-r {getGradeColor(gradeCalculation.nextGrade.level)} rounded-full transition-all duration-500"
							style="width: {gradeCalculation.progress}%"
						></div>
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
						{gradeCalculation.progress.toFixed(1)}% 달성
					</div>
				</div>
			{:else}
				<div class="mb-6 text-center">
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full">
						<span class="text-2xl">🏆</span>
						<span class="font-bold text-yellow-800 dark:text-yellow-300">최고 등급 달성!</span>
					</div>
				</div>
			{/if}

			{#if showDetails}
				<!-- Recent Activities -->
				{#if gradeCalculation.recentActivities.length > 0}
					<div class="mb-6">
						<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
							최근 활동
						</h4>
						<div class="space-y-2">
							{#each gradeCalculation.recentActivities as activity}
								<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
											<span class="text-sm">
												{activity.type === 'card_created' ? '🎨' : 
												 activity.type === 'like_received' ? '❤️' : 
												 activity.type === 'featured' ? '⭐' : 
												 activity.type === 'monthly_active' ? '📅' : '🎯'}
											</span>
										</div>
										<div>
											<div class="text-sm font-medium text-gray-900 dark:text-white">
												{activity.description}
											</div>
											<div class="text-xs text-gray-500 dark:text-gray-400">
												{activity.timestamp.toLocaleDateString('ko-KR')}
											</div>
										</div>
									</div>
									<div class="text-sm font-bold text-green-600 dark:text-green-400">
										+{activity.points}점
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Grade Benefits -->
				{#if gradeBenefits.length > 0}
					<div>
						<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
							등급 혜택
						</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
							{#each gradeBenefits as benefit}
								<div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<div class="text-lg">
										{getBenefitIcon(benefit.type)}
									</div>
									<div class="flex-1">
										<div class="text-sm font-medium text-gray-900 dark:text-white">
											{benefit.name}
										</div>
										<div class="text-xs text-gray-500 dark:text-gray-400">
											{benefit.description}
										</div>
									</div>
									{#if benefit.unlocked}
										<div class="text-green-500">
											<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
											</svg>
										</div>
									{:else}
										<div class="text-gray-400">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>