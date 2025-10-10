<!--
  Dropdown Menu Component
  Feature: 003-navigation-ui-renewal
  Task: T018
  Uses: Bits UI DropdownMenu primitives
-->
<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	export let items: Array<{ label: string; onClick: () => void; icon?: string; disabled?: boolean }> = [];
	export let align: 'start' | 'center' | 'end' = 'start';
	export let side: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="dropdown-trigger" asChild let:builder>
		<slot name="trigger" {builder} />
	</DropdownMenu.Trigger>

	<DropdownMenu.Content
		class="dropdown-content"
		{align}
		{side}
		sideOffset={8}
		transition={(node) => {
			return {
				duration: 150,
				css: (t) => `
					opacity: ${t};
					transform: scale(${0.95 + t * 0.05});
				`
			};
		}}
	>
		{#each items as item}
			<DropdownMenu.Item
				class="dropdown-item"
				disabled={item.disabled}
				on:click={item.onClick}
			>
				{#if item.icon}
					<span class="item-icon">{item.icon}</span>
				{/if}
				<span class="item-label">{item.label}</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
	:global(.dropdown-content) {
		min-width: 200px;
		background: var(--surface-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: var(--space-sm);
		z-index: var(--z-dropdown);
	}

	:global(.dropdown-item) {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--font-body);
		color: var(--text-primary);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: background-color var(--transition-fast);
		outline: none;
	}

	:global(.dropdown-item:hover:not([data-disabled])) {
		background-color: color-mix(in srgb, var(--primary) 10%, transparent);
	}

	:global(.dropdown-item:focus-visible) {
		background-color: color-mix(in srgb, var(--primary) 10%, transparent);
		box-shadow: 0 0 0 2px var(--border-focus);
	}

	:global(.dropdown-item[data-disabled]) {
		opacity: var(--opacity-disabled);
		cursor: not-allowed;
	}

	:global(.item-icon) {
		font-size: 1.2em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.item-label) {
		flex: 1;
	}
</style>
