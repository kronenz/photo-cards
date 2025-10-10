<!--
  Theme Toggle Component
  Feature: 003-navigation-ui-renewal
  Task: T030
  Dark/Light mode switcher with smooth transition
-->
<script lang="ts">
	import { themeStore } from '$lib/stores/theme';

	$: currentTheme = $themeStore;

	function handleToggle() {
		themeStore.toggleTheme();
	}
</script>

<button
	type="button"
	class="theme-toggle"
	on:click={handleToggle}
	aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
	title={currentTheme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
>
	<span class="icon" class:rotating={true}>
		{#if currentTheme === 'light'}
			<span class="moon">🌙</span>
		{:else}
			<span class="sun">☀️</span>
		{/if}
	</span>
</button>

<style>
	.theme-toggle {
		background: none;
		border: none;
		padding: var(--space-sm);
		cursor: pointer;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: 1.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		position: relative;
		width: 40px;
		height: 40px;
	}

	.theme-toggle:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
		transform: scale(1.1);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-base);
	}

	.theme-toggle:hover .icon {
		transform: rotate(20deg);
	}

	.moon,
	.sun {
		display: inline-block;
		animation: fadeIn var(--transition-fast);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.8) rotate(-20deg);
		}
		to {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
	}

	/* Subtle glow effect */
	.theme-toggle:hover .sun {
		filter: drop-shadow(0 0 4px rgba(255, 200, 0, 0.6));
	}

	.theme-toggle:hover .moon {
		filter: drop-shadow(0 0 4px rgba(100, 150, 255, 0.6));
	}
</style>
