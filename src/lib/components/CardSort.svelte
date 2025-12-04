<!--
  Card Sort Component
  Feature: 004-production-service-integration

  Provides sorting options for collection (date, rarity, title)
-->
<script lang="ts">
  import type { CollectionSort } from '$lib/services/collections';
  import { createEventDispatcher } from 'svelte';

  export let sort: CollectionSort = { field: 'created', direction: 'desc' };

  const dispatch = createEventDispatcher<{
    change: CollectionSort;
  }>();

  const sortOptions: { value: CollectionSort['field']; label: string }[] = [
    { value: 'created', label: '획득일' },
    { value: 'rarity', label: '등급' },
    { value: 'team', label: '팀' },
    { value: 'title', label: '이름' }
  ];

  function handleFieldChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    sort = { ...sort, field: target.value as CollectionSort['field'] };
    dispatch('change', sort);
  }

  function toggleDirection() {
    sort = {
      ...sort,
      direction: sort.direction === 'asc' ? 'desc' : 'asc'
    };
    dispatch('change', sort);
  }
</script>

<div class="card-sort">
  <label for="sort-field" class="sort-label">정렬</label>
  <select
    id="sort-field"
    value={sort.field}
    on:change={handleFieldChange}
    class="sort-select"
  >
    {#each sortOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <button
    type="button"
    class="direction-btn"
    on:click={toggleDirection}
    title={sort.direction === 'asc' ? '오름차순' : '내림차순'}
  >
    {#if sort.direction === 'asc'}
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5m0 0l-7 7m7-7l7 7"/>
      </svg>
    {:else}
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14m0 0l7-7m-7 7l-7-7"/>
      </svg>
    {/if}
  </button>
</div>

<style>
  .card-sort {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sort-label {
    font-size: 12px;
    font-weight: 500;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sort-select {
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sort-select:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .sort-select:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  .sort-select option {
    background: #1a1a2e;
    color: #fff;
  }

  .direction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .direction-btn:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .icon {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 480px) {
    .sort-label {
      display: none;
    }
  }
</style>
