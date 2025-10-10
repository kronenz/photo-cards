<script lang="ts">
	/**
	 * Top Navigation Component
	 * Feature: 003-navigation-ui-renewal (US1)
	 * Auto-hide scroll behavior + Transparent background
	 */

	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { navigationStore } from '$lib/stores/navigation';
	import { themeStore } from '$lib/stores/theme';
	import Button from '$lib/components/design-system/Button.svelte';

	let isVisible = true;
	let isTransparent = true;
	let menuOpen = false;

	// Subscribe to navigation store
	const unsubscribe = navigationStore.subscribe((state) => {
		isVisible = state.isVisible;
		isTransparent = state.isTransparent;
		menuOpen = state.menuOpen;
	});

	onMount(() => {
		navigationStore.init();
	});

	onDestroy(() => {
		navigationStore.destroy();
		unsubscribe();
	});

	// Navigation links
	const navLinks = [
		{ label: '홈', href: '/', icon: '🏠' },
		{ label: '카드 만들기', href: '/create', icon: '✨' },
		{ label: '컬렉션', href: '/collections', icon: '📚' },
		{ label: '마켓플레이스', href: '/marketplace', icon: '🛒' },
		{ label: '갤러리', href: '/gallery', icon: '🖼️' }
	];

	function toggleMenu() {
		navigationStore.toggleMenu();
	}

	function closeMenu() {
		navigationStore.closeMenu();
	}

	$: currentPath = $page.url.pathname;
</script>

<nav
	class="top-nav"
	class:visible={isVisible}
	class:transparent={isTransparent}
	class:menu-open={menuOpen}
>
	<div class="nav-container">
		<!-- Logo / Brand -->
		<a href="/" class="brand" on:click={closeMenu}>
			<span class="brand-icon">⚾</span>
			<span class="brand-name">Cards</span>
		</a>

		<!-- Desktop Navigation Links -->
		<div class="nav-links desktop-only">
			{#each navLinks as link}
				<a
					href={link.href}
					class="nav-link"
					class:active={currentPath === link.href}
					on:click={closeMenu}
				>
					<span class="link-icon">{link.icon}</span>
					<span class="link-label">{link.label}</span>
				</a>
			{/each}
		</div>

		<!-- Actions -->
		<div class="nav-actions">
			<!-- Theme Toggle -->
			<button
				type="button"
				class="icon-button"
				on:click={() => themeStore.toggleTheme()}
				aria-label="Toggle theme"
				title="테마 변경"
			>
				<span class="theme-icon">🌙</span>
			</button>

			<!-- Mobile Menu Toggle -->
			<button
				type="button"
				class="icon-button mobile-only"
				on:click={toggleMenu}
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
			>
				<span class="menu-icon" class:open={menuOpen}>
					{menuOpen ? '✕' : '☰'}
				</span>
			</button>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if menuOpen}
		<div class="mobile-menu">
			{#each navLinks as link}
				<a
					href={link.href}
					class="mobile-link"
					class:active={currentPath === link.href}
					on:click={closeMenu}
				>
					<span class="link-icon">{link.icon}</span>
					<span class="link-label">{link.label}</span>
				</a>
			{/each}
		</div>
	{/if}
</nav>

<style>
	.top-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-sticky);
		transform: translateY(0);
		transition: all var(--transition-base);
		will-change: transform, background-color;
	}

	.top-nav:not(.visible) {
		transform: translateY(-100%);
	}

	.top-nav.transparent {
		background-color: transparent;
		backdrop-filter: none;
	}

	.top-nav:not(.transparent) {
		background-color: var(--surface-primary);
		backdrop-filter: blur(10px);
		box-shadow: var(--shadow-sm);
	}

	.nav-container {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: var(--space-md) var(--space-lg);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		text-decoration: none;
		transition: transform var(--transition-fast);
	}

	.brand:hover {
		transform: scale(1.05);
	}

	.brand-icon {
		font-size: 1.5em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex: 1;
		justify-content: center;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--font-callout);
		font-weight: var(--font-weight-medium);
		transition: all var(--transition-fast);
	}

	.nav-link:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
	}

	.nav-link.active {
		background-color: var(--primary);
		color: white;
	}

	.link-icon {
		font-size: 1.2em;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.icon-button {
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
	}

	.icon-button:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
	}

	.icon-button:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	/* Mobile Menu */
	.mobile-menu {
		display: none;
		flex-direction: column;
		padding: var(--space-md);
		gap: var(--space-xs);
		background-color: var(--surface-primary);
		border-top: 1px solid var(--border-primary);
	}

	.mobile-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--font-body);
		font-weight: var(--font-weight-medium);
		transition: all var(--transition-fast);
	}

	.mobile-link:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
	}

	.mobile-link.active {
		background-color: var(--primary);
		color: white;
	}

	/* Responsive */
	.desktop-only {
		display: flex;
	}

	.mobile-only {
		display: none;
	}

	@media (max-width: 768px) {
		.desktop-only {
			display: none;
		}

		.mobile-only {
			display: flex;
		}

		.top-nav.menu-open .mobile-menu {
			display: flex;
		}

		.brand-name {
			font-size: var(--font-body);
		}
	}

	/* Performance: GPU acceleration for smooth animations */
	.top-nav,
	.brand,
	.nav-link,
	.icon-button {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
