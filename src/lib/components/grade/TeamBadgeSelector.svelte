<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { KBO_TEAMS } from '$lib/data/kboTeams';
	import type { KBOTeam } from '$lib/types/auth';

	export let selectedTeam: KBOTeam | undefined = undefined;
	export let showSeasonTicketBadge = false;
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		select: KBOTeam;
		'season-ticket': KBOTeam;
	}>();

	function handleTeamSelect(team: KBOTeam) {
		if (disabled) return;
		
		selectedTeam = team;
		dispatch('select', team);
	}

	function handleSeasonTicketClick(team: KBOTeam, event: MouseEvent) {
		event.stopPropagation();
		if (disabled) return;
		
		dispatch('season-ticket', team);
	}

	function getTeamStadium(teamId: string): string {
		const stadiums: Record<string, string> = {
			lg: '잠실야구장',
			doosan: '잠실야구장',
			kia: '광주-기아 챔피언스 필드',
			samsung: '대구 삼성 라이온즈 파크',
			lotte: '사직야구장',
			hanwha: '한화생명 이글스 파크',
			ssg: '인천 SSG 랜더스 필드',
			kiwoom: '고척스카이돔',
			kt: '수원 KT 위즈 파크',
			nc: '창원 NC 파크'
		};
		return stadiums[teamId] || '홈구장';
	}
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="text-center">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
			응원하는 팀을 선택하세요
		</h3>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			선택한 팀의 컬러로 특별한 홀로그래픽 효과를 사용할 수 있습니다
		</p>
	</div>

	<!-- Team Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-3">
		{#each KBO_TEAMS as team}
			<button
				type="button"
				on:click={() => handleTeamSelect(team)}
				disabled={disabled}
				class="relative group p-4 border-2 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed {
					selectedTeam?.id === team.id 
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
						: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
				}"
			>
				<!-- Team Colors -->
				<div class="flex justify-center mb-3">
					<div class="relative">
						<div 
							class="w-12 h-12 rounded-full shadow-lg"
							style="background: linear-gradient(135deg, {team.colors.primary}, {team.colors.secondary})"
						></div>
						{#if selectedTeam?.id === team.id}
							<div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
								<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							</div>
						{/if}
					</div>
				</div>

				<!-- Team Info -->
				<div class="text-center">
					<div class="font-bold text-gray-900 dark:text-white text-sm mb-1">
						{team.shortName}
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
						{team.city}
					</div>
					<div class="text-xs text-gray-400 dark:text-gray-500">
						{getTeamStadium(team.id)}
					</div>
				</div>

				<!-- Season Ticket Badge (for expert+ users) -->
				{#if showSeasonTicketBadge}
					<button
						type="button"
						on:click={(e) => handleSeasonTicketClick(team, e)}
						class="absolute top-1 right-1 w-6 h-6 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
						title="시즌권 홀더 인증"
						disabled={disabled}
					>
						<span class="text-xs text-white">🎫</span>
					</button>
				{/if}

				<!-- Hover Effect -->
				<div class="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
					style="background: linear-gradient(135deg, {team.colors.primary}, {team.colors.secondary})"
				></div>
			</button>
		{/each}
	</div>

	<!-- Selected Team Info -->
	{#if selectedTeam}
		<div class="mt-6 p-4 bg-gradient-to-r rounded-xl text-white"
			style="background: linear-gradient(135deg, {selectedTeam.colors.primary}, {selectedTeam.colors.secondary})"
		>
			<div class="flex items-center gap-4">
				<div class="text-3xl">⚾</div>
				<div class="flex-1">
					<h4 class="text-lg font-bold mb-1">
						{selectedTeam.name} 팬으로 선택됨
					</h4>
					<p class="text-white/80 text-sm">
						{selectedTeam.stadium}에서 응원하는 {selectedTeam.city}의 자랑!
					</p>
				</div>
				<div class="text-right">
					<div class="text-sm text-white/80">홈구장</div>
					<div class="font-medium">{selectedTeam.stadium}</div>
				</div>
			</div>
		</div>

		<!-- Team Benefits -->
		<div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
			<h4 class="font-semibold text-gray-900 dark:text-white mb-3">팀 선택 혜택</h4>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
						<span class="text-sm">🎨</span>
					</div>
					<div>
						<div class="text-sm font-medium text-gray-900 dark:text-white">팀 컬러 홀로그래픽</div>
						<div class="text-xs text-gray-500 dark:text-gray-400">팀 컬러 기반 특수 효과</div>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
						<span class="text-sm">🎵</span>
					</div>
					<div>
						<div class="text-sm font-medium text-gray-900 dark:text-white">응원가 BGM</div>
						<div class="text-xs text-gray-500 dark:text-gray-400">팀 응원가 배경음악</div>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
						<span class="text-sm">🏟️</span>
					</div>
					<div>
						<div class="text-sm font-medium text-gray-900 dark:text-white">구장 테마</div>
						<div class="text-xs text-gray-500 dark:text-gray-400">홈구장 배경 템플릿</div>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
						<span class="text-sm">👥</span>
					</div>
					<div>
						<div class="text-sm font-medium text-gray-900 dark:text-white">팬클럽 연결</div>
						<div class="text-xs text-gray-500 dark:text-gray-400">같은 팀 팬들과 소통</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>