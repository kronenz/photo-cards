/**
 * Theme Store
 * Feature: 003-navigation-ui-renewal (FR-009)
 * Dark/Light mode management
 */

import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

const createThemeStore = () => {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,

		/**
		 * Toggle between light and dark theme
		 */
		toggleTheme: () => {
			update((current) => {
				const newTheme: Theme = current === 'light' ? 'dark' : 'light';
				localStorage.setItem('theme', newTheme);
				document.documentElement.classList.toggle('dark', newTheme === 'dark');
				return newTheme;
			});
		},

		/**
		 * Set theme explicitly
		 */
		setTheme: (theme: Theme) => {
			localStorage.setItem('theme', theme);
			document.documentElement.classList.toggle('dark', theme === 'dark');
			set(theme);
		},

		/**
		 * Initialize theme from localStorage or system preference
		 */
		initTheme: () => {
			if (typeof window === 'undefined') return;

			const stored = localStorage.getItem('theme') as Theme | null;
			const system = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
			const theme = stored || system;

			set(theme);
			document.documentElement.classList.toggle('dark', theme === 'dark');

			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (!localStorage.getItem('theme')) {
					const newTheme: Theme = e.matches ? 'dark' : 'light';
					set(newTheme);
					document.documentElement.classList.toggle('dark', newTheme === 'dark');
				}
			});
		}
	};
};

export const themeStore = createThemeStore();
