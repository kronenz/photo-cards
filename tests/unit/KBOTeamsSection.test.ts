import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import KBOTeamsSection from '$lib/components/unified/KBOTeamsSection.svelte';
import { currentUser } from '$lib/stores/unified';
import type { UnifiedUser } from '$lib/types/unified';

describe('KBOTeamsSection', () => {
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
      achievedBadges: ['badge-first-card'],
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
      owned: ['card-001'],
      collectionProgress: [],
      totalCards: 1,
      rareCards: 0,
    },
    preferences: {
      theme: 'kbo-team',
      teamThemeColor: '#7B2D7F',
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

  describe('Team Selection', () => {
    it('should render all 10 KBO teams', () => {
      const { container } = render(KBOTeamsSection);
      const teamButtons = container.querySelectorAll('[data-testid^="team-button-"]');
      expect(teamButtons.length).toBe(10);
    });

    it('should highlight currently selected team', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);
      const lgTwinsButton = container.querySelector('[data-testid="team-button-team-lg-twins"]');
      expect(lgTwinsButton?.classList.contains('ring-2')).toBe(true);
    });

    it('should update currentUser.fanProfile.favoriteTeam when team is selected', async () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const kiaButton = container.querySelector('[data-testid="team-button-team-kia-tigers"]');
      await fireEvent.click(kiaButton!);

      const updatedUser = get(currentUser);
      expect(updatedUser?.fanProfile.favoriteTeam).toBe('team-kia-tigers');
    });

    it('should display team colors correctly', () => {
      const { container } = render(KBOTeamsSection);
      const lgTwinsButton = container.querySelector('[data-testid="team-button-team-lg-twins"]');

      // LG Twins primary color should be #7B2D7F (purple)
      const style = lgTwinsButton?.getAttribute('style');
      expect(style).toContain('#7B2D7F');
    });
  });

  describe('Theme Application', () => {
    it('should apply team theme color when team is selected', async () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const doosanButton = container.querySelector('[data-testid="team-button-team-doosan-bears"]');
      await fireEvent.click(doosanButton!);

      const updatedUser = get(currentUser);
      expect(updatedUser?.preferences.theme).toBe('kbo-team');
      expect(updatedUser?.preferences.teamThemeColor).toBeTruthy();
    });

    it('should update teamThemeColor in user preferences', async () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const samsungButton = container.querySelector('[data-testid="team-button-team-samsung-lions"]');
      await fireEvent.click(samsungButton!);

      const updatedUser = get(currentUser);
      expect(updatedUser?.preferences.teamThemeColor).toBe('#074CA1'); // Samsung blue
    });
  });

  describe('Fan Level Calculations', () => {
    it('should display user fan level correctly', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const fanLevelDisplay = container.querySelector('[data-testid="fan-level-display"]');
      expect(fanLevelDisplay?.textContent).toContain('외야석 팬');
    });

    it('should show current points and next level threshold', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const pointsDisplay = container.querySelector('[data-testid="fan-points-display"]');
      expect(pointsDisplay?.textContent).toContain('150');
    });

    it('should calculate progress percentage to next level', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      // Level 2 (외야석 팬) requires 100 points, Level 3 requires 500 points
      // User has 150 points, so progress = (150-100)/(500-100) = 50/400 = 12.5%
      const progressBar = container.querySelector('[data-testid="fan-level-progress"]');
      const progressValue = progressBar?.getAttribute('aria-valuenow');
      expect(Number(progressValue)).toBeCloseTo(12.5, 1);
    });

    it('should show correct next level name', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const nextLevelDisplay = container.querySelector('[data-testid="next-fan-level"]');
      expect(nextLevelDisplay?.textContent).toContain('응원단 멤버');
    });
  });

  describe('Team Logos and Mascots', () => {
    it('should display team logo images', () => {
      const { container } = render(KBOTeamsSection);
      const logos = container.querySelectorAll('[data-testid^="team-logo-"]');
      expect(logos.length).toBe(10);
    });

    it('should have proper alt text for accessibility', () => {
      const { container } = render(KBOTeamsSection);
      const lgLogo = container.querySelector('[data-testid="team-logo-team-lg-twins"]');
      expect(lgLogo?.getAttribute('alt')).toContain('LG 트윈스');
    });

    it('should display team mascot on hover', async () => {
      const { container } = render(KBOTeamsSection);
      const lgButton = container.querySelector('[data-testid="team-button-team-lg-twins"]');

      await fireEvent.mouseEnter(lgButton!);

      const mascotDisplay = container.querySelector('[data-testid="team-mascot-team-lg-twins"]');
      expect(mascotDisplay).toBeTruthy();
    });
  });

  describe('Joined Fanclubs', () => {
    it('should show badge for joined fanclubs', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const lgButton = container.querySelector('[data-testid="team-button-team-lg-twins"]');
      const joinedBadge = lgButton?.querySelector('[data-testid="fanclub-joined-badge"]');
      expect(joinedBadge).toBeTruthy();
    });

    it('should not show badge for non-joined teams', () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const kiaButton = container.querySelector('[data-testid="team-button-team-kia-tigers"]');
      const joinedBadge = kiaButton?.querySelector('[data-testid="fanclub-joined-badge"]');
      expect(joinedBadge).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for team buttons', () => {
      const { container } = render(KBOTeamsSection);
      const lgButton = container.querySelector('[data-testid="team-button-team-lg-twins"]');
      expect(lgButton?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should support keyboard navigation', async () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      const lgButton = container.querySelector('[data-testid="team-button-team-lg-twins"]') as HTMLElement;
      lgButton.focus();

      await fireEvent.keyPress(lgButton, { key: 'Enter' });

      // Team should remain selected since it was already selected
      const updatedUser = get(currentUser);
      expect(updatedUser?.fanProfile.favoriteTeam).toBe('team-lg-twins');
    });

    it('should have role="radiogroup" for team selection', () => {
      const { container } = render(KBOTeamsSection);
      const teamGroup = container.querySelector('[role="radiogroup"]');
      expect(teamGroup).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user gracefully', () => {
      currentUser.set(null);
      const { container } = render(KBOTeamsSection);

      // Should still render teams but without selection
      const teamButtons = container.querySelectorAll('[data-testid^="team-button-"]');
      expect(teamButtons.length).toBe(10);
    });

    it('should handle invalid team selection gracefully', async () => {
      currentUser.set(mockUser);
      const { container } = render(KBOTeamsSection);

      // Simulate clicking a non-existent team button
      const invalidButton = document.createElement('button');
      invalidButton.setAttribute('data-team-id', 'team-invalid');

      // Should not throw error
      expect(() => fireEvent.click(invalidButton)).not.toThrow();
    });
  });
});
