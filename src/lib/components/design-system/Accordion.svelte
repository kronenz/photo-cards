<!--
  Accordion Component
  Feature: 003-navigation-ui-renewal
  Task: T019
  Uses: Bits UI Accordion primitives for FAQ pages
-->
<script lang="ts">
	import { Accordion } from 'bits-ui';

	export let items: Array<{ title: string; content: string }> = [];
	export let multiple = false;
	export let defaultValue: string[] = [];
</script>

<Accordion.Root {multiple} value={defaultValue} class="accordion-root">
	{#each items as item, i (item.title)}
		<Accordion.Item value={`item-${i}`} class="accordion-item">
			<Accordion.Header class="accordion-header">
				<Accordion.Trigger class="accordion-trigger">
					<span class="trigger-text">{item.title}</span>
					<span class="trigger-icon" aria-hidden="true">▼</span>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Content class="accordion-content">
				<div class="content-inner">
					{item.content}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>

<style>
	:global(.accordion-root) {
		width: 100%;
	}

	:global(.accordion-item) {
		border-bottom: 1px solid var(--border-primary);
	}

	:global(.accordion-item:last-child) {
		border-bottom: none;
	}

	:global(.accordion-header) {
		display: flex;
	}

	:global(.accordion-trigger) {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) 0;
		font-size: var(--font-body);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		outline: none;
		transition: color var(--transition-fast);
	}

	:global(.accordion-trigger:hover) {
		color: var(--primary);
	}

	:global(.accordion-trigger:focus-visible) {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	:global(.trigger-text) {
		flex: 1;
	}

	:global(.trigger-icon) {
		font-size: 0.8em;
		transition: transform var(--transition-fast);
		color: var(--text-secondary);
	}

	:global(.accordion-trigger[data-state='open'] .trigger-icon) {
		transform: rotate(180deg);
	}

	:global(.accordion-content) {
		overflow: hidden;
		transition: height var(--transition-base);
	}

	:global(.accordion-content[data-state='open']) {
		animation: slideDown var(--transition-base);
	}

	:global(.accordion-content[data-state='closed']) {
		animation: slideUp var(--transition-base);
	}

	:global(.content-inner) {
		padding: 0 0 var(--space-md) 0;
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
	}

	@keyframes slideDown {
		from {
			height: 0;
			opacity: 0;
		}
		to {
			height: var(--bits-accordion-content-height);
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			height: var(--bits-accordion-content-height);
			opacity: 1;
		}
		to {
			height: 0;
			opacity: 0;
		}
	}
</style>
