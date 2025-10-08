/**
 * Fan Level Calculation Utilities
 *
 * Handles fan level progression, points calculation, and level upgrades
 * Integrates with the unified stores and PocketBase backend
 */

import { get } from 'svelte/store';
import { currentUser } from '$lib/stores/unified';
import {
  getFanLevelByPoints,
  getNextFanLevel,
  calculateLevelProgress,
  getPointsToNextLevel,
  checkLevelUp,
  activityPoints,
  type FanLevel,
} from '$lib/data/fan-levels';
import type { UnifiedUser } from '$lib/types/unified';

/**
 * Activity types that earn points
 */
export type ActivityType = keyof typeof activityPoints;

/**
 * Award points for an activity
 * @param activity - The activity type
 * @param count - Number of times the activity was performed (default: 1)
 * @returns Points awarded
 */
export function awardPoints(activity: ActivityType, count: number = 1): number {
  const points = activityPoints[activity] * count;
  return points;
}

/**
 * Add points to current user
 * @param points - Points to add
 * @param activity - Activity that earned the points (for logging)
 * @returns New level if leveled up, null otherwise
 */
export async function addPointsToUser(
  points: number,
  activity: ActivityType
): Promise<FanLevel | null> {
  const user = get(currentUser);

  if (!user) {
    throw new Error('No user logged in');
  }

  const oldPoints = user.fanProfile.currentPoints;
  const newPoints = oldPoints + points;

  // Check if user leveled up
  const newLevel = checkLevelUp(oldPoints, newPoints);

  // Update user points
  currentUser.update((u) => {
    if (!u) return u;

    return {
      ...u,
      fanProfile: {
        ...u.fanProfile,
        currentPoints: newPoints,
        // Update fan level if leveled up
        fanLevel: newLevel ? { level: newLevel.level, name: newLevel.name } : u.fanProfile.fanLevel,
      },
    };
  });

  // Persist to PocketBase (in production)
  // await persistUserPoints(user.id, newPoints, newLevel);

  return newLevel;
}

/**
 * Get current user's fan level info
 * @returns Fan level info or null if no user
 */
export function getCurrentUserLevel(): {
  level: FanLevel;
  progress: number;
  pointsToNext: number;
  nextLevel: FanLevel | null;
} | null {
  const user = get(currentUser);

  if (!user) {
    return null;
  }

  const currentLevel = user.fanProfile.fanLevel.level;
  const currentPoints = user.fanProfile.currentPoints;

  const level = getFanLevelByPoints(currentPoints);
  const progress = calculateLevelProgress(currentPoints, currentLevel);
  const pointsToNext = getPointsToNextLevel(currentPoints, currentLevel);
  const nextLevel = getNextFanLevel(currentLevel);

  return {
    level,
    progress,
    pointsToNext,
    nextLevel,
  };
}

/**
 * Check if user has perk unlocked
 * @param perk - Perk name to check
 * @returns Whether user has the perk
 */
export function hasPerkUnlocked(perk: string): boolean {
  const user = get(currentUser);

  if (!user) {
    return false;
  }

  const level = user.fanProfile.fanLevel.level;

  // Check if any level up to current level has this perk
  for (let i = 1; i <= level; i++) {
    const fanLevel = getFanLevelByPoints((i - 1) * 100); // Approximate
    if (fanLevel.perks.includes(perk)) {
      return true;
    }
  }

  return false;
}

/**
 * Award badge to user
 * @param badgeId - Badge ID to award
 */
export async function awardBadge(badgeId: string): Promise<void> {
  currentUser.update((user) => {
    if (!user) return user;

    // Don't award duplicate badges
    if (user.fanProfile.achievedBadges.includes(badgeId)) {
      return user;
    }

    return {
      ...user,
      fanProfile: {
        ...user.fanProfile,
        achievedBadges: [...user.fanProfile.achievedBadges, badgeId],
      },
    };
  });

  // Persist to PocketBase
  // await persistBadge(badgeId);
}

/**
 * Check if user has badge
 * @param badgeId - Badge ID to check
 * @returns Whether user has the badge
 */
export function hasBadge(badgeId: string): boolean {
  const user = get(currentUser);
  return user?.fanProfile.achievedBadges.includes(badgeId) ?? false;
}

/**
 * Calculate activity multiplier based on fan level
 * Higher levels earn more points for activities
 * @param level - Current fan level
 * @returns Multiplier (1.0 - 2.0)
 */
export function getActivityMultiplier(level: number): number {
  const multipliers = {
    1: 1.0, // No bonus
    2: 1.1, // 10% bonus
    3: 1.25, // 25% bonus
    4: 1.5, // 50% bonus
    5: 2.0, // 100% bonus (double points!)
  };

  return multipliers[level as keyof typeof multipliers] ?? 1.0;
}

/**
 * Award points with level multiplier
 * @param activity - Activity type
 * @param count - Number of times performed
 * @returns New level if leveled up, null otherwise
 */
export async function awardPointsWithMultiplier(
  activity: ActivityType,
  count: number = 1
): Promise<FanLevel | null> {
  const user = get(currentUser);

  if (!user) {
    throw new Error('No user logged in');
  }

  const basePoints = awardPoints(activity, count);
  const multiplier = getActivityMultiplier(user.fanProfile.fanLevel.level);
  const totalPoints = Math.floor(basePoints * multiplier);

  return addPointsToUser(totalPoints, activity);
}

/**
 * Get recent activities (for activity feed)
 * This would be stored in PocketBase in production
 */
export interface ActivityLog {
  id: string;
  userId: string;
  activity: ActivityType;
  pointsEarned: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const activityLogs: ActivityLog[] = [];

/**
 * Log activity
 * @param activity - Activity type
 * @param pointsEarned - Points earned
 * @param metadata - Additional data
 */
export function logActivity(
  activity: ActivityType,
  pointsEarned: number,
  metadata?: Record<string, any>
): void {
  const user = get(currentUser);

  if (!user) return;

  const log: ActivityLog = {
    id: `activity-${Date.now()}`,
    userId: user.id,
    activity,
    pointsEarned,
    timestamp: new Date(),
    metadata,
  };

  activityLogs.push(log);

  // Persist to PocketBase
  // await persistActivityLog(log);
}

/**
 * Get user's recent activities
 * @param limit - Number of activities to return
 * @returns Recent activity logs
 */
export function getRecentActivities(limit: number = 10): ActivityLog[] {
  const user = get(currentUser);

  if (!user) return [];

  return activityLogs
    .filter((log) => log.userId === user.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Calculate total points earned from activity history
 */
export function calculateTotalPointsEarned(): number {
  const user = get(currentUser);

  if (!user) return 0;

  return activityLogs
    .filter((log) => log.userId === user.id)
    .reduce((total, log) => total + log.pointsEarned, 0);
}

/**
 * Get points breakdown by activity type
 */
export function getPointsBreakdown(): Record<ActivityType, number> {
  const user = get(currentUser);

  if (!user) {
    return {} as Record<ActivityType, number>;
  }

  const breakdown = {} as Record<ActivityType, number>;

  activityLogs
    .filter((log) => log.userId === user.id)
    .forEach((log) => {
      if (!breakdown[log.activity]) {
        breakdown[log.activity] = 0;
      }
      breakdown[log.activity] += log.pointsEarned;
    });

  return breakdown;
}

/**
 * Leaderboard utilities
 */

/**
 * Get top fans by points (for leaderboard)
 * This would query PocketBase in production
 */
export function getTopFans(limit: number = 10): Array<{
  user: UnifiedUser;
  rank: number;
}> {
  // Mock implementation - in production, query PocketBase
  const user = get(currentUser);

  if (!user) return [];

  return [
    {
      user,
      rank: 1,
    },
  ];
}

/**
 * Get user's rank among all fans
 */
export function getUserRank(): number {
  const user = get(currentUser);

  if (!user) return 0;

  // Mock implementation - in production, query PocketBase
  return 1;
}

/**
 * Validation utilities
 */

/**
 * Validate points value
 * @param points - Points to validate
 * @returns Whether points value is valid
 */
export function validatePoints(points: number): boolean {
  return points >= 0 && points <= 1000000 && Number.isInteger(points);
}

/**
 * Validate level number
 * @param level - Level to validate
 * @returns Whether level is valid
 */
export function validateLevel(level: number): boolean {
  return level >= 1 && level <= 5 && Number.isInteger(level);
}

/**
 * Sanitize points input
 * @param points - Points value to sanitize
 * @returns Sanitized points value
 */
export function sanitizePoints(points: number): number {
  if (!validatePoints(points)) {
    return 0;
  }
  return Math.floor(points);
}

/**
 * Export utilities
 */
export { getFanLevelByPoints, getNextFanLevel, calculateLevelProgress, getPointsToNextLevel };
