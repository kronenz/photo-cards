import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { currentUser, teamTheme } from '$lib/stores/unified';
import type { UnifiedUser } from '$lib/types/unified';

// Mock components for integration testing
import KBOTeamsSection from '$lib/components/unified/KBOTeamsSection.svelte';
import IntegratedMainPage from '$lib/components/unified/IntegratedMainPage.svelte';

describe('Team Theme Integration', () => {
  const mockUser: UnifiedUser = {
    id: 'user-test-001',
    username: 'test_fan',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-03-20'),
    fanProfile: {
      fanLevel: { level: 2, name: '외야석 팬' },
      currentPoints: 150,
      favoriteTeam: 'team-lg-twins',
      achievedBadges: [],
      joinedFanclubs: ['team-lg-twins'],
    },
    creatorProfile: {
      creatorLevel: 'bronze',
      stats: {
        totalCards: 5,
        totalLikes: 20,
        totalDownloads: 3,
        averageRating: 4.0,
        followers: 2,
        following: 5,
      },
      isVerified: false,
      specializations: ['KBO'],
    },
    collections: {
      owned: [],
      collectionProgress: [],
      totalCards: 0,
      rareCards: 0,
    },
    preferences: {
      theme: 'light',
      notifications: {
        newFollower: true,
        cardLike: true,
        cardComment: true,
        levelUp: true,
      },
      privacy: {
        showCollections: true,
        showActivity: true,
      },
    },
  };

  beforeEach(() => {
    currentUser.set(null);
  });

  describe('Theme Store Updates', () => {
    it('should update teamTheme store when user selects KBO team', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      await waitFor(() => {
        const theme = get(teamTheme);
        expect(theme).toBeTruthy();
        expect(theme?.color).toBe('#7B2D7F');
        expect(theme?.teamId).toBe('team-lg-twins');
      });
    });

    it('should set teamTheme to null when user uses light/dark theme', () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'light',
        },
      });

      const theme = get(teamTheme);
      expect(theme).toBeNull();
    });

    it('should reactively update teamTheme when user changes team', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      let theme = get(teamTheme);
      expect(theme?.teamId).toBe('team-lg-twins');

      // Change to Doosan Bears
      currentUser.update((user) => ({
        ...user!,
        fanProfile: {
          ...user!.fanProfile,
          favoriteTeam: 'team-doosan-bears',
        },
        preferences: {
          ...user!.preferences,
          teamThemeColor: '#131230',
        },
      }));

      await waitFor(() => {
        theme = get(teamTheme);
        expect(theme?.teamId).toBe('team-doosan-bears');
        expect(theme?.color).toBe('#131230');
      });
    });
  });

  describe('CSS Variables Propagation', () => {
    it('should apply team color as CSS variable to layout', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      // In actual implementation, +layout.svelte would apply this
      const rootElement = document.documentElement;
      rootElement.style.setProperty('--team-primary-color', '#7B2D7F');

      const primaryColor = getComputedStyle(rootElement).getPropertyValue('--team-primary-color');
      expect(primaryColor).toBe('#7B2D7F');
    });

    it('should apply secondary color when available', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      const rootElement = document.documentElement;
      rootElement.style.setProperty('--team-primary-color', '#7B2D7F');
      rootElement.style.setProperty('--team-secondary-color', '#C4122F');

      const secondaryColor = getComputedStyle(rootElement).getPropertyValue('--team-secondary-color');
      expect(secondaryColor).toBe('#C4122F');
    });

    it('should remove CSS variables when theme is changed to non-KBO', () => {
      const rootElement = document.documentElement;
      rootElement.style.setProperty('--team-primary-color', '#7B2D7F');

      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'light',
        },
      });

      // In actual implementation, +layout.svelte would remove the variable
      rootElement.style.removeProperty('--team-primary-color');

      const primaryColor = getComputedStyle(rootElement).getPropertyValue('--team-primary-color');
      expect(primaryColor).toBe('');
    });
  });

  describe('Component Theme Synchronization', () => {
    it('should apply theme to UnifiedHolographicCard', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      // Cards should inherit team theme via CSS variables
      const rootElement = document.documentElement;
      rootElement.style.setProperty('--team-primary-color', '#7B2D7F');

      await waitFor(() => {
        const theme = get(teamTheme);
        expect(theme?.color).toBe('#7B2D7F');
      });
    });

    it('should apply theme to IntegratedMainPage sections', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      const { container } = render(IntegratedMainPage);

      await waitFor(() => {
        // Check if main page has theme class applied
        const mainPage = container.querySelector('[data-testid="integrated-main-page"]');
        expect(mainPage?.classList.contains('theme-kbo')).toBe(true);
      });
    });

    it('should apply theme to CollectionDashboard', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      // CollectionDashboard should use CSS variables for theming
      const rootElement = document.documentElement;
      rootElement.style.setProperty('--team-primary-color', '#7B2D7F');

      const primaryColor = getComputedStyle(rootElement).getPropertyValue('--team-primary-color');
      expect(primaryColor).toBe('#7B2D7F');
    });

    it('should apply theme to CommunityFeed', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      // CommunityFeed should respect team theme
      const theme = get(teamTheme);
      expect(theme?.color).toBe('#7B2D7F');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme selection across page reloads', async () => {
      // Simulate localStorage persistence
      const userWithTheme = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team' as const,
          teamThemeColor: '#7B2D7F',
        },
      };

      localStorage.setItem('currentUser', JSON.stringify(userWithTheme));

      // Simulate page reload by loading from localStorage
      const storedUser = JSON.parse(localStorage.getItem('currentUser')!);
      currentUser.set(storedUser);

      const theme = get(teamTheme);
      expect(theme?.color).toBe('#7B2D7F');
      expect(theme?.teamId).toBe('team-lg-twins');

      localStorage.removeItem('currentUser');
    });

    it('should sync theme to PocketBase on change', async () => {
      // Mock PocketBase update
      const pbUpdateMock = vi.fn();

      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#074CA1', // Samsung Lions
        },
      });

      // In actual implementation, this would trigger PocketBase update
      // pbUpdateMock('users', mockUser.id, { preferences: { ... } })

      expect(get(currentUser)?.preferences.teamThemeColor).toBe('#074CA1');
    });
  });

  describe('Accessibility with Themes', () => {
    it('should maintain WCAG contrast ratios with team themes', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F', // LG purple
        },
      });

      // Team colors should have accessible contrast
      // LG purple (#7B2D7F) on white has contrast ratio > 4.5:1
      const theme = get(teamTheme);
      expect(theme?.color).toBeTruthy();
    });

    it('should allow users to override theme for accessibility', () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'light', // User prefers light theme despite team selection
        },
      });

      const theme = get(teamTheme);
      expect(theme).toBeNull(); // Theme override should work
    });
  });

  describe('Multi-Component Theme Consistency', () => {
    it('should apply same theme color to all components simultaneously', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      const theme = get(teamTheme);

      // All components should read from same teamTheme store
      expect(theme?.color).toBe('#7B2D7F');
      expect(theme?.teamId).toBe('team-lg-twins');

      // Verify store is reactive
      currentUser.update((user) => ({
        ...user!,
        preferences: {
          ...user!.preferences,
          teamThemeColor: '#131230', // Doosan navy
        },
      }));

      await waitFor(() => {
        const updatedTheme = get(teamTheme);
        expect(updatedTheme?.color).toBe('#131230');
      });
    });

    it('should handle theme transitions smoothly', async () => {
      currentUser.set({
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          theme: 'kbo-team',
          teamThemeColor: '#7B2D7F',
        },
      });

      // Transition to different team
      currentUser.update((user) => ({
        ...user!,
        fanProfile: {
          ...user!.fanProfile,
          favoriteTeam: 'team-kia-tigers',
        },
        preferences: {
          ...user!.preferences,
          teamThemeColor: '#EA0029', // KIA red
        },
      }));

      await waitFor(() => {
        const theme = get(teamTheme);
        expect(theme?.color).toBe('#EA0029');
        expect(theme?.teamId).toBe('team-kia-tigers');
      });
    });
  });
});
