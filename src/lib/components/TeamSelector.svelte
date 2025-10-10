<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { BASEBALL_TEAMS } from '$lib/data/baseballTeams';
  import type { BaseballTeam } from '$lib/data/baseballTeams';
	import type { KBOTeam } from '$lib/data/kboTeams';

  // Props
  export let selectedTeamId: string | undefined = undefined;
  export let showAllOption: boolean = true;
  export let compact: boolean = false;

  // Events
  const dispatch = createEventDispatcher<{
    teamSelect: string | undefined;
  }>();

  // State
  let isOpen = false;
  let selectedTeam: KBOTeam | undefined;

  // Reactive statements
  $: selectedTeam = selectedTeamId ? BASEBALL_TEAMS.find(team => team.id === selectedTeamId) : undefined;

  // Functions
  function selectTeam(teamId: string | undefined) {
    selectedTeamId = teamId;
    isOpen = false;
    dispatch('teamSelect', teamId);
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.team-selector')) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="team-selector" class:compact>
  <button 
    class="selector-button" 
    class:active={isOpen}
    on:click={toggleDropdown}
    style={selectedTeam ? `--team-primary: ${selectedTeam.colors.primary}; --team-secondary: ${selectedTeam.colors.secondary}` : ''}
  >
    <div class="selected-team">
      {#if selectedTeam}
        <div class="team-logo" style="background-color: {selectedTeam.colors.primary}">
          {selectedTeam.name.charAt(0)}
        </div>
        <div class="team-info">
          <span class="team-name">{selectedTeam.name}</span>
          {#if !compact}
            <span class="team-city">{selectedTeam.city}</span>
          {/if}
        </div>
      {:else}
        <div class="all-teams-icon">⚾</div>
        <div class="team-info">
          <span class="team-name">전체 구단</span>
          {#if !compact}
            <span class="team-city">리그</span>
          {/if}
        </div>
      {/if}
    </div>
    
    <svg 
      class="dropdown-arrow" 
      class:rotated={isOpen}
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
    >
      <path 
        d="M4 6L8 10L12 6" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  </button>

  {#if isOpen}
    <div class="dropdown-menu">
      {#if showAllOption}
        <button 
          class="team-option" 
          class:selected={!selectedTeamId}
          on:click={() => selectTeam(undefined)}
        >
          <div class="all-teams-icon">⚾</div>
          <div class="team-info">
            <span class="team-name">전체 구단</span>
            <span class="team-city">리그</span>
          </div>
        </button>
      {/if}

      {#each BASEBALL_TEAMS as team (team.id)}
        <button 
          class="team-option" 
          class:selected={selectedTeamId === team.id}
          style="--team-primary: {team.colors.primary}; --team-secondary: {team.colors.secondary}"
          on:click={() => selectTeam(team.id)}
        >
          <div class="team-logo" style="background-color: {team.colors.primary}">
            {team.name.charAt(0)}
          </div>
          <div class="team-info">
            <span class="team-name">{team.name}</span>
            <span class="team-city">{team.city} · {team.stadium}</span>
          </div>
          {#if team.achievements.championships > 0}
            <div class="championships">
              🏆 {team.achievements.championships}
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .team-selector {
    position: relative;
    display: inline-block;
    min-width: 200px;
  }

  .team-selector.compact {
    min-width: 150px;
  }

  .selector-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: white;
    border: 2px solid var(--border-color, #e1e5e9);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .selector-button:hover {
    border-color: var(--team-primary, var(--primary-color, #3b82f6));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .selector-button.active {
    border-color: var(--team-primary, var(--primary-color, #3b82f6));
    box-shadow: 0 0 0 3px rgba(var(--team-primary-rgb, 59, 130, 246), 0.1);
  }

  .selected-team {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .team-logo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }

  .all-teams-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .team-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .team-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #1a1a1a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .team-city {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-arrow {
    color: var(--text-secondary, #6b7280);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .dropdown-arrow.rotated {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    border: 1px solid var(--border-color, #e1e5e9);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    margin-top: 4px;
    max-height: 400px;
    overflow-y: auto;
    animation: slideDown 0.2s ease;
  }

  .team-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    text-align: left;
  }

  .team-option:hover {
    background: var(--surface-secondary, #f8f9fa);
  }

  .team-option.selected {
    background: var(--team-primary, var(--primary-color, #3b82f6));
    color: white;
  }

  .team-option.selected .team-name,
  .team-option.selected .team-city {
    color: white;
  }

  .championships {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    margin-left: auto;
    flex-shrink: 0;
  }

  .team-option.selected .championships {
    color: rgba(255, 255, 255, 0.8);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 스크롤바 스타일링 */
  .dropdown-menu::-webkit-scrollbar {
    width: 6px;
  }

  .dropdown-menu::-webkit-scrollbar-track {
    background: transparent;
  }

  .dropdown-menu::-webkit-scrollbar-thumb {
    background: var(--border-color, #e1e5e9);
    border-radius: 3px;
  }

  .dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary, #6b7280);
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .team-selector {
      min-width: 100%;
    }

    .team-selector.compact {
      min-width: 120px;
    }

    .dropdown-menu {
      max-height: 300px;
    }

    .team-city {
      display: none;
    }

    .compact .team-city {
      display: none;
    }
  }
</style>