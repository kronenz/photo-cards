<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { KBO_TEAMS } from '$lib/data/kboTeams';
	import type { KBOTeam } from '$lib/types/auth';

	export let selectedTeam: KBOTeam | undefined = undefined;
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		select: KBOTeam;
		clear: void;
	}>();

	function handleTeamSelect(team: KBOTeam) {
		if (disabled) return;
		
		selectedTeam = team;
		dispatch('select', team);
	}

	function handleClearSelection() {
		if (disabled) return;
		
		selectedTeam = undefined;
		dispatch('clear');
	}
</script>

<div class="space-y-4">
	<!-- Selected Team Display -->
	{#if selectedTeam}
		<div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2" style="border-color: {selectedTeam.colors.primary}40">
			<div class="flex items-center gap-3">
				<div 
					class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
					style="background: linear-gradient(135deg, {selectedTeam.colors.primary}, {selectedTeam.colors.secondary})"
				>
					{selectedTeam.name.charAt(0)}
				</div>
				<div>
					<h3 class="font-bold text-gray-900 dark:text-white">{selectedTeam.name}</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">{selectedTeam.city} • {selectedTeam.stadium}</p>
				</div>
			</div>
			<button
				on:click={handleClearSelection}
				{disabled}
				class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
				aria-label="선택 해제"
			>
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/if}

	<!-- Team Selection Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-3">
		{#each KBO_TEAMS as team}
			<button
				type="button"
				on:click={() => handleTeamSelect(team)}
				{disabled}
				class="group relative p-4 border-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed {selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
			>
				<!-- Team Color Circle -->
				<div 
					class="w-10 h-10 mx-auto mb-2 rounded-full shadow-md flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform"
					style="background: linear-gradient(135deg, {team.colors.primary}, {team.colors.secondary})"
				>
					{team.name.charAt(0)}
				</div>
				
				<!-- Team Info -->
				<div class="text-center">
					<div class="text-xs font-bold text-gray-900 dark:text-white mb-1">{team.name.split(' ')[1] || team.name}</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">{team.city}</div>
				</div>

				<!-- Selection Indicator -->
				{#if selectedTeam?.id === team.id}
					<div class="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}

				<!-- Hover Effect -->
				<div class="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
			</button>
		{/each}
	</div>

	<!-- Team Stats (Optional) -->
	{#if selectedTeam}
		<div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
			<div class="flex items-center justify-between text-sm">
				<span class="text-gray-600 dark:text-gray-400">창단년도</span>
				<span class="font-medium text-gray-900 dark:text-white">{selectedTeam.founded}년</span>
			</div>
			<div class="flex items-center justify-between text-sm mt-1">
				<span class="text-gray-600 dark:text-gray-400">우승 횟수</span>
				<span class="font-medium text-gray-900 dark:text-white">{selectedTeam.achievements.championships}회</span>
			</div>
			{#if selectedTeam.achievements.lastChampionship}
				<div class="flex items-center justify-between text-sm mt-1">
					<span class="text-gray-600 dark:text-gray-400">최근 우승</span>
					<span class="font-medium text-gray-900 dark:text-white">{selectedTeam.achievements.lastChampionship}년</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Custom hover animations */
	@keyframes teamPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	.group:hover .w-10 {
		animation: teamPulse 0.6s ease-in-out;
	}
</style>