<!--
  Card Filter Component
  Feature: 004-production-service-integration

  Provides team and rarity dropdown filters for collection
-->
<script lang="ts">
  import type { Team, Rarity } from '$lib/types/models';
  import type { CollectionFilters } from '$lib/services/collections';
  import { createEventDispatcher } from 'svelte';

  export let filters: CollectionFilters = {};

  const dispatch = createEventDispatcher<{
    change: CollectionFilters;
  }>();

  const teams: { value: Team | ''; label: string }[] = [
    { value: '', label: '전체 팀' },
    { value: 'lg', label: 'LG 트윈스' },
    { value: 'doosan', label: '두산 베어스' },
    { value: 'kt', label: 'KT 위즈' },
    { value: 'samsung', label: '삼성 라이온즈' },
    { value: 'nc', label: 'NC 다이노스' },
    { value: 'kia', label: 'KIA 타이거즈' },
    { value: 'lotte', label: '롯데 자이언츠' },
    { value: 'ssg', label: 'SSG 랜더스' },
    { value: 'hanwha', label: '한화 이글스' },
    { value: 'kiwoom', label: '키움 히어로즈' }
  ];

  const rarities: { value: Rarity | ''; label: string }[] = [
    { value: '', label: '전체 등급' },
    { value: 'common', label: 'Common' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  let selectedTeam: Team | '' = filters.team || '';
  let selectedRarity: Rarity | '' = filters.rarity || '';
  let showFavorites = filters.favorite || false;

  function handleChange() {
    const newFilters: CollectionFilters = {};

    if (selectedTeam) {
      newFilters.team = selectedTeam;
    }
    if (selectedRarity) {
      newFilters.rarity = selectedRarity;
    }
    if (showFavorites) {
      newFilters.favorite = true;
    }

    dispatch('change', newFilters);
  }

  function clearFilters() {
    selectedTeam = '';
    selectedRarity = '';
    showFavorites = false;
    dispatch('change', {});
  }

  $: hasActiveFilters = selectedTeam || selectedRarity || showFavorites;
</script>

<div class="card-filter">
  <div class="filter-row">
    <div class="filter-group">
      <label for="team-filter">팀</label>
      <select
        id="team-filter"
        bind:value={selectedTeam}
        on:change={handleChange}
        class="filter-select"
      >
        {#each teams as team}
          <option value={team.value}>{team.label}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label for="rarity-filter">등급</label>
      <select
        id="rarity-filter"
        bind:value={selectedRarity}
        on:change={handleChange}
        class="filter-select"
      >
        {#each rarities as rarity}
          <option value={rarity.value} class="rarity-{rarity.value}">
            {rarity.label}
          </option>
        {/each}
      </select>
    </div>

    <div class="filter-group favorite-toggle">
      <label class="checkbox-label">
        <input
          type="checkbox"
          bind:checked={showFavorites}
          on:change={handleChange}
        />
        <span class="favorite-icon">{showFavorites ? '★' : '☆'}</span>
        즐겨찾기만
      </label>
    </div>

    {#if hasActiveFilters}
      <button type="button" class="clear-btn" on:click={clearFilters}>
        필터 초기화
      </button>
    {/if}
  </div>
</div>

<style>
  .card-filter {
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-group label {
    font-size: 12px;
    font-weight: 500;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-select {
    min-width: 150px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-select:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .filter-select:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  .filter-select option {
    background: #1a1a2e;
    color: #fff;
  }

  .favorite-toggle {
    flex-direction: row;
    align-items: center;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #ccc;
    transition: all 0.2s ease;
  }

  .checkbox-label:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .checkbox-label input[type="checkbox"] {
    display: none;
  }

  .favorite-icon {
    font-size: 16px;
    color: #ffb700;
  }

  .clear-btn {
    padding: 10px 16px;
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: 8px;
    color: #ff3b30;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: auto;
  }

  .clear-btn:hover {
    background: rgba(255, 59, 48, 0.2);
  }

  @media (max-width: 768px) {
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-select {
      width: 100%;
    }

    .clear-btn {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
