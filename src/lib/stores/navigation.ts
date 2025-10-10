/**
 * Navigation Store
 * Feature: 003-navigation-ui-renewal (US1)
 * Auto-hide scroll behavior
 */

import { writable } from 'svelte/store';

interface NavigationState {
	isVisible: boolean;
	isTransparent: boolean;
	activeRoute: string;
	menuOpen: boolean;
}

const createNavigationStore = () => {
	const { subscribe, set, update } = writable<NavigationState>({
		isVisible: true,
		isTransparent: true,
		activeRoute: '/',
		menuOpen: false
	});

	let lastScrollY = 0;
	let ticking = false;

	const handleScroll = () => {
		const currentScrollY = window.scrollY;

		if (!ticking) {
			window.requestAnimationFrame(() => {
				update((state) => ({
					...state,
					// Hide on scroll down, show on scroll up
					isVisible: currentScrollY < lastScrollY || currentScrollY < 100,
					// Transparent at top, opaque when scrolled
					isTransparent: currentScrollY < 50
				}));

				lastScrollY = currentScrollY;
				ticking = false;
			});
			ticking = true;
		}
	};

	return {
		subscribe,

		/**
		 * Initialize scroll listener
		 */
		init: () => {
			if (typeof window !== 'undefined') {
				window.addEventListener('scroll', handleScroll, { passive: true });
			}
		},

		/**
		 * Cleanup scroll listener
		 */
		destroy: () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('scroll', handleScroll);
			}
		},

		/**
		 * Set active route
		 */
		setActiveRoute: (route: string) => {
			update((state) => ({ ...state, activeRoute: route }));
		},

		/**
		 * Toggle mobile menu
		 */
		toggleMenu: () => {
			update((state) => ({ ...state, menuOpen: !state.menuOpen }));
		},

		/**
		 * Close mobile menu
		 */
		closeMenu: () => {
			update((state) => ({ ...state, menuOpen: false }));
		},

		/**
		 * Force show navigation
		 */
		show: () => {
			update((state) => ({ ...state, isVisible: true }));
		},

		/**
		 * Force hide navigation
		 */
		hide: () => {
			update((state) => ({ ...state, isVisible: false }));
		}
	};
};

export const navigationStore = createNavigationStore();
