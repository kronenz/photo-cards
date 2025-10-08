<script lang="ts">
  import { currentUser, teamTheme } from '$lib/stores/unified';
  import { kboTeams, getTeamColors, getContrastColor } from '$lib/data/kbo-teams';
  import { getCurrentUserLevel } from '$lib/utils/fan-level';
  import { onMount } from 'svelte';

  // Props
  export let showFanLevel: boolean = true;
  export let compact: boolean = false;

  // State
  let selectedTeam: string = '';
  let hoveredTeam: string | null = null;

  // Reactive statements
  $: if ($currentUser) {
    selectedTeam = $currentUser.fanProfile.favoriteTeam;
  }

  $: fanLevelInfo = getCurrentUserLevel();

  // Event handlers
  function handleTeamSelect(teamId: string) {
    if (!$currentUser) return;

    // Update user's favorite team
    currentUser.update((user) => {
      if (!user) return user;

      const colors = getTeamColors(teamId);

      return {
        ...user,
        fanProfile: {
          ...user.fanProfile,
          favoriteTeam: teamId,
        },
        preferences: {
          ...user.preferences,
          theme: 'kbo-team',
          teamThemeColor: colors?.primary,
        },
      };
    });

    selectedTeam = teamId;
  }

  function handleTeamHover(teamId: string | null) {
    hoveredTeam = teamId;
  }

  function handleKeyPress(event: KeyboardEvent, teamId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTeamSelect(teamId);
    }
  }

  // Check if user is in fanclub
  function isInFanclub(teamId: string): boolean {
    return $currentUser?.fanProfile.joinedFanclubs.includes(teamId) ?? false;
  }
</script>

<div class="kbo-teams-section" data-testid="kbo-teams-section">
  <!-- Fan Level Display -->
  {#if showFanLevel && fanLevelInfo}
    <div class="fan-level-header mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold" data-testid="fan-level-display">
            {fanLevelInfo.level.name}
            <span class="text-sm text-gray-600">레벨 {fanLevelInfo.level.level}</span>
          </h3>
          <p class="text-sm text-gray-600 mt-1" data-testid="fan-points-display">
            {$currentUser?.fanProfile.currentPoints ?? 0} 포인트
            {#if fanLevelInfo.nextLevel}
              <span class="text-xs text-gray-500">
                (다음 레벨까지 {fanLevelInfo.pointsToNext}p)
              </span>
            {/if}
          </p>
        </div>

        {#if fanLevelInfo.nextLevel}
          <div class="text-right">
            <p class="text-xs text-gray-500 mb-1" data-testid="next-fan-level">
              다음: {fanLevelInfo.nextLevel.name}
            </p>
            <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style="width: {fanLevelInfo.progress}%"
                data-testid="fan-level-progress"
                role="progressbar"
                aria-valuenow={fanLevelInfo.progress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
        {:else}
          <div class="flex items-center text-yellow-600">
            <span class="text-2xl mr-2">👑</span>
            <span class="font-bold">최고 레벨!</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Teams Grid -->
  <div class="teams-header mb-4">
    <h2 class="text-2xl font-bold">
      {#if selectedTeam}
        응원 구단 선택
      {:else}
        좋아하는 구단을 선택하세요
      {/if}
    </h2>
    <p class="text-sm text-gray-600 mt-1">
      선택한 구단의 테마 색상이 플랫폼 전체에 적용됩니다
    </p>
  </div>

  <div
    class="teams-grid {compact
      ? 'grid grid-cols-5 gap-3'
      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'}"
    role="radiogroup"
    aria-label="KBO 구단 선택"
  >
    {#each kboTeams as team (team.id)}
      {@const isSelected = selectedTeam === team.id}
      {@const isHovered = hoveredTeam === team.id}
      {@const isMember = isInFanclub(team.id)}
      {@const textColor = getContrastColor(team.color)}

      <button
        type="button"
        class="team-button relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
        class:ring-2={isSelected}
        class:ring-offset-2={isSelected}
        class:border-transparent={isSelected}
        class:shadow-lg={isSelected || isHovered}
        style="border-color: {isSelected ? team.color : '#e5e7eb'}; background-color: {isSelected
          ? team.color + '20'
          : 'white'}"
        data-testid="team-button-{team.id}"
        data-team-id={team.id}
        role="radio"
        aria-checked={isSelected}
        aria-label="{team.name} 선택"
        tabindex={isSelected ? 0 : -1}
        on:click={() => handleTeamSelect(team.id)}
        on:mouseenter={() => handleTeamHover(team.id)}
        on:mouseleave={() => handleTeamHover(null)}
        on:keypress={(e) => handleKeyPress(e, team.id)}
      >
        <!-- Team Logo -->
        <div class="team-logo mb-2">
          <img
            src={team.logo}
            alt="{team.name} 로고"
            class="w-16 h-16 mx-auto object-contain"
            data-testid="team-logo-{team.id}"
            loading="lazy"
          />
        </div>

        <!-- Team Name -->
        <div class="team-name text-center">
          <p class="font-bold text-sm" style="color: {isSelected ? team.color : '#1f2937'}">
            {team.name}
          </p>
          <p class="text-xs text-gray-500 mt-1">{team.city}</p>
        </div>

        <!-- Fanclub Member Badge -->
        {#if isMember}
          <div
            class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
            data-testid="fanclub-joined-badge"
          >
            팬클럽
          </div>
        {/if}

        <!-- Selected Indicator -->
        {#if isSelected}
          <div class="absolute bottom-2 right-2 text-green-500">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        {/if}

        <!-- Team Mascot (on hover) -->
        {#if isHovered && team.mascot}
          <div
            class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-xl"
            data-testid="team-mascot-{team.id}"
          >
            <div class="text-center">
              <img
                src={team.mascot.image}
                alt="{team.mascot.name} 마스코트"
                class="w-20 h-20 mx-auto object-contain mb-2"
              />
              <p class="font-bold text-sm" style="color: {team.color}">{team.mascot.name}</p>
            </div>
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Team Stats (if team selected) -->
  {#if selectedTeam}
    {@const team = kboTeams.find((t) => t.id === selectedTeam)}
    {#if team}
      <div class="team-stats mt-6 p-4 rounded-lg" style="background-color: {team.color}20">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg" style="color: {team.color}">{team.name}</h3>
            <p class="text-sm text-gray-600 mt-1">
              창단: {team.founded}년 | {team.stadium}
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold" style="color: {team.color}">
              {team.championships}회
            </p>
            <p class="text-xs text-gray-600">한국시리즈 우승</p>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between text-sm">
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">팬: {team.fanCount.toLocaleString()}명</span>
          </div>

          <a
            href="/fanclub/{team.id}"
            class="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style="background-color: {team.color}"
          >
            팬클럽 가기 →
          </a>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .team-button {
    cursor: pointer;
    user-select: none;
  }

  .team-button:hover {
    transform: translateY(-2px);
  }

  .team-button:active {
    transform: translateY(0);
  }

  .team-logo img {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
</style>
