<!--
  Main Navigation Component
  Feature: 003-navigation-ui-renewal
  Task: T026 - Refactored unified navigation with all features
  Combines: Auto-hide, Mobile menu, Theme toggle, User menu, Breadcrumbs
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { navigationStore } from '$lib/stores/navigation';
	import ThemeToggle from './ThemeToggle.svelte';
	import UserMenu from './UserMenu.svelte';
	import Breadcrumb from './Breadcrumb.svelte';

	// Props
	export let user: { name: string; email: string; avatar?: string } | null = null;
	export let showBreadcrumb = false;

	// Navigation items
	const navItems = [
		{ label: '홈', href: '/', icon: '🏠' },
		{ label: '카드 만들기', href: '/create', icon: '✨' },
		{ label: '컬렉션', href: '/collections', icon: '📚' },
		{ label: '마켓플레이스', href: '/marketplace', icon: '🛒' },
		{ label: '갤러리', href: '/gallery', icon: '🖼️' }
	];

	// Store subscriptions
	let isVisible = true;
	let isTransparent = true;
	let menuOpen = false;

	const unsubscribe = navigationStore.subscribe((state) => {
		isVisible = state.isVisible;
		isTransparent = state.isTransparent;
		menuOpen = state.menuOpen;
	});

	// Lifecycle
	onMount(() => {
		navigationStore.init();
	});

	onDestroy(() => {
		navigationStore.destroy();
		unsubscribe();
	});

	// Reactive values
	$: currentPath = $page.url.pathname;
	$: isHomePage = currentPath === '/';

	// Methods
	function toggleMobileMenu() {
		navigationStore.toggleMenu();
	}

	function closeMobileMenu() {
		navigationStore.closeMenu();
	}
</script>

<!-- Main Navigation Bar -->
<nav
	class="main-nav"
	class:visible={isVisible}
	class:transparent={isTransparent}
	class:menu-open={menuOpen}
	role="navigation"
	aria-label="Main navigation"
>
	<div class="nav-container">
		<!-- Brand / Logo -->
		<a href="/" class="brand" on:click={closeMobileMenu}>
			<span class="brand-icon">⚾</span>
			<span class="brand-name">Cards</span>
		</a>

		<!-- Desktop Navigation Links -->
		<ul class="nav-links desktop-only" role="menubar">
			{#each navItems as item}
				<li role="none">
					<a
						href={item.href}
						class="nav-link"
						class:active={currentPath === item.href}
						role="menuitem"
						aria-current={currentPath === item.href ? 'page' : undefined}
						on:click={closeMobileMenu}
					>
						<span class="link-icon" aria-hidden="true">{item.icon}</span>
						<span class="link-label">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>

		<!-- Actions -->
		<div class="nav-actions">
			<ThemeToggle />
			<UserMenu {user} />

			<!-- Mobile Menu Toggle -->
			<button
				type="button"
				class="mobile-menu-toggle mobile-only"
				on:click={toggleMobileMenu}
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				aria-controls="mobile-menu"
			>
				<span class="hamburger" class:open={menuOpen}>
					<span class="line"></span>
					<span class="line"></span>
					<span class="line"></span>
				</span>
			</button>
		</div>
	</div>

	<!-- Breadcrumb (optional) -->
	{#if showBreadcrumb && !isHomePage}
		<div class="breadcrumb-container">
			<Breadcrumb />
		</div>
	{/if}
</nav>

<!-- Mobile Menu Overlay -->
{#if menuOpen}
	<div
		class="mobile-menu-overlay"
		role="dialog"
		aria-modal="true"
		aria-label="Mobile navigation menu"
		on:click={closeMobileMenu}
		on:keydown={(e) => e.key === 'Escape' && closeMobileMenu()}
	>
		<div class="mobile-menu" id="mobile-menu" on:click={(e) => e.stopPropagation()}>
			<ul class="mobile-nav-links" role="menu">
				{#each navItems as item}
					<li role="none">
						<a
							href={item.href}
							class="mobile-nav-link"
							class:active={currentPath === item.href}
							role="menuitem"
							on:click={closeMobileMenu}
						>
							<span class="link-icon">{item.icon}</span>
							<span class="link-label">{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style>
	/* Main Navigation */
	.main-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-sticky);
		transform: translateY(0);
		transition: all var(--transition-base);
		will-change: transform, background-color;
	}

	.main-nav:not(.visible) {
		transform: translateY(-100%);
	}

	.main-nav.transparent {
		background-color: transparent;
		backdrop-filter: none;
	}

	.main-nav:not(.transparent) {
		background-color: color-mix(in srgb, var(--surface-primary) 95%, transparent);
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

	/* Brand */
	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		text-decoration: none;
		transition: transform var(--transition-fast);
		z-index: 2;
	}

	.brand:hover {
		transform: scale(1.05);
	}

	.brand:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 4px;
		border-radius: var(--radius-sm);
	}

	.brand-icon {
		font-size: 1.5em;
	}

	/* Desktop Navigation Links */
	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex: 1;
		justify-content: center;
		list-style: none;
		margin: 0;
		padding: 0;
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
		position: relative;
	}

	.nav-link:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
	}

	.nav-link:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.nav-link.active {
		color: var(--primary);
		font-weight: var(--font-weight-semibold);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: var(--space-md);
		right: var(--space-md);
		height: 2px;
		background: var(--primary);
		border-radius: var(--radius-full);
	}

	.link-icon {
		font-size: 1.2em;
	}

	/* Navigation Actions */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	/* Breadcrumb Container */
	.breadcrumb-container {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: 0 var(--space-lg);
		border-top: 1px solid var(--border-primary);
	}

	/* Mobile Menu Toggle */
	.mobile-menu-toggle {
		background: none;
		border: none;
		padding: var(--space-sm);
		cursor: pointer;
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		transition: background-color var(--transition-fast);
	}

	.mobile-menu-toggle:hover {
		background-color: var(--surface-secondary);
	}

	.mobile-menu-toggle:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.hamburger {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 24px;
		height: 18px;
		position: relative;
	}

	.line {
		width: 100%;
		height: 2px;
		background-color: var(--text-primary);
		border-radius: var(--radius-full);
		transition: all var(--transition-fast);
		transform-origin: center;
	}

	.hamburger.open .line:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.hamburger.open .line:nth-child(2) {
		opacity: 0;
	}

	.hamburger.open .line:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* Mobile Menu Overlay */
	.mobile-menu-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: calc(var(--z-sticky) - 1);
		display: none;
		animation: fadeIn var(--transition-base);
	}

	.mobile-menu {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(300px, 80vw);
		background-color: var(--surface-primary);
		box-shadow: var(--shadow-xl);
		padding: var(--space-3xl) var(--space-lg) var(--space-lg);
		overflow-y: auto;
		animation: slideInRight var(--transition-base);
	}

	.mobile-nav-links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.mobile-nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--font-body);
		font-weight: var(--font-weight-medium);
		transition: all var(--transition-fast);
	}

	.mobile-nav-link:hover {
		background-color: var(--surface-secondary);
		color: var(--text-primary);
	}

	.mobile-nav-link.active {
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

		.main-nav.menu-open .mobile-menu-overlay {
			display: block;
		}

		.brand-name {
			font-size: var(--font-body);
		}
	}

	/* Animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideInRight {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	/* Performance optimizations */
	.main-nav,
	.brand,
	.nav-link,
	.mobile-menu {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
