/**
 * Fan Level System Static Data
 *
 * 5-tier fan level progression system for KBO Baseball community
 * Inspired by Korean baseball fan culture and community engagement
 *
 * Level progression is based on activity points earned through:
 * - Creating cards (+10 points)
 * - Sharing cards to community (+15 points)
 * - Receiving likes on cards (+2 points each)
 * - Commenting on posts (+5 points)
 * - Joining fanclub events (+20 points)
 * - Completing collections (+50 points)
 *
 * Last updated: 2024-03-20
 */

export interface FanLevel {
  level: number; // 1-5
  name: string; // Level name in Korean
  nameEn: string; // Level name in English
  requiredPoints: number; // Points needed to reach this level
  perks: string[]; // Benefits of this level
  badgeIcon: string; // Badge image URL
  badgeColor: string; // Badge color (hex)
  description: string; // Level description
}

/**
 * All 5 fan levels
 * Progression system designed for sustained engagement over months
 */
export const fanLevels: FanLevel[] = [
  {
    level: 1,
    name: '야구 입문자',
    nameEn: 'Baseball Beginner',
    requiredPoints: 0,
    perks: ['기본 카드 생성', '커뮤니티 참여', '팀 팔로우'],
    badgeIcon: '/images/badges/fan-level-1.png',
    badgeColor: '#9CA3AF', // Gray
    description: '야구와 KBO에 관심을 가진 새로운 팬입니다. 환영합니다!',
  },
  {
    level: 2,
    name: '외야석 팬',
    nameEn: 'Outfield Fan',
    requiredPoints: 100,
    perks: ['희귀 카드 생성', '커뮤니티 게시물 핀', '프로필 배지', '팬클럽 가입'],
    badgeIcon: '/images/badges/fan-level-2.png',
    badgeColor: '#10B981', // Green
    description: '경기장 외야석에서 열심히 응원하는 진정한 팬입니다.',
  },
  {
    level: 3,
    name: '응원단 멤버',
    nameEn: 'Cheerleader Member',
    requiredPoints: 500,
    perks: [
      '에픽 카드 생성',
      '템플릿 판매',
      '팬클럽 모더레이터',
      '특별 이벤트 참여',
      '커스텀 프로필 테마',
    ],
    badgeIcon: '/images/badges/fan-level-3.png',
    badgeColor: '#3B82F6', // Blue
    description: '응원단과 함께 열정적으로 응원하는 핵심 팬입니다.',
  },
  {
    level: 4,
    name: '시즌권 홀더',
    nameEn: 'Season Ticket Holder',
    requiredPoints: 2000,
    perks: [
      '레전더리 카드 생성',
      '구단 이벤트 우선 참여',
      '크리에이터 인증',
      '광고 없는 경험',
      'VIP 채팅방 접근',
      '월간 특별 카드팩',
    ],
    badgeIcon: '/images/badges/fan-level-4.png',
    badgeColor: '#8B5CF6', // Purple
    description: '시즌권을 구매할 정도로 팀에 헌신하는 충성 팬입니다.',
  },
  {
    level: 5,
    name: '구단 레전드',
    nameEn: 'Team Legend',
    requiredPoints: 10000,
    perks: [
      '독점 카드 템플릿',
      '실물 카드 제작 할인 (30% OFF)',
      'VIP 뱃지',
      '에디터 추천',
      '구단 공식 이벤트 초대',
      '레전드 전용 카드팩',
      '커뮤니티 리더보드 등재',
      '프로필 커스터마이징 무제한',
    ],
    badgeIcon: '/images/badges/fan-level-5.png',
    badgeColor: '#F59E0B', // Gold
    description: '구단의 역사와 함께하는 전설적인 팬입니다. 최고의 영예!',
  },
];

/**
 * Point rewards for various activities
 */
export const activityPoints = {
  // Card creation
  createCard: 10,
  createRareCard: 15,
  createEpicCard: 25,
  createLegendaryCard: 50,

  // Social interactions
  shareCard: 15,
  receiveLike: 2,
  receiveComment: 3,
  comment: 5,
  follow: 3,
  receiveFollow: 5,

  // Collections
  completeCollection: 50,
  completeRareCollection: 100,
  completeEpicCollection: 200,

  // Fanclub activities
  joinFanclub: 20,
  attendEvent: 30,
  createEvent: 50,

  // Templates
  uploadTemplate: 20,
  templateDownload: 1,
  featuredTemplate: 100,

  // Community contributions
  reportViolation: 10,
  helpfulComment: 10,
  tutorialComplete: 25,
} as const;

/**
 * Get fan level by points
 */
export function getFanLevelByPoints(points: number): FanLevel {
  // Find the highest level the user qualifies for
  for (let i = fanLevels.length - 1; i >= 0; i--) {
    if (points >= fanLevels[i].requiredPoints) {
      return fanLevels[i];
    }
  }
  return fanLevels[0]; // Default to level 1
}

/**
 * Get next fan level
 */
export function getNextFanLevel(currentLevel: number): FanLevel | null {
  if (currentLevel >= fanLevels.length) {
    return null; // Already at max level
  }
  return fanLevels[currentLevel]; // Next level (0-indexed array)
}

/**
 * Calculate progress to next level
 * @returns Progress percentage (0-100)
 */
export function calculateLevelProgress(currentPoints: number, currentLevel: number): number {
  const current = fanLevels[currentLevel - 1]; // Convert 1-indexed to 0-indexed
  const next = getNextFanLevel(currentLevel);

  if (!next) {
    return 100; // Max level reached
  }

  const pointsInCurrentLevel = currentPoints - current.requiredPoints;
  const pointsNeededForNextLevel = next.requiredPoints - current.requiredPoints;

  const progress = (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;

  return Math.min(Math.max(progress, 0), 100); // Clamp between 0-100
}

/**
 * Calculate points needed for next level
 */
export function getPointsToNextLevel(currentPoints: number, currentLevel: number): number {
  const next = getNextFanLevel(currentLevel);

  if (!next) {
    return 0; // Already at max level
  }

  return Math.max(0, next.requiredPoints - currentPoints);
}

/**
 * Check if user just leveled up
 * @param oldPoints - Points before activity
 * @param newPoints - Points after activity
 * @returns New level if leveled up, null otherwise
 */
export function checkLevelUp(oldPoints: number, newPoints: number): FanLevel | null {
  const oldLevel = getFanLevelByPoints(oldPoints);
  const newLevel = getFanLevelByPoints(newPoints);

  if (newLevel.level > oldLevel.level) {
    return newLevel;
  }

  return null;
}

/**
 * Get all perks unlocked up to current level
 */
export function getAllUnlockedPerks(currentLevel: number): string[] {
  const perks: string[] = [];

  for (let i = 0; i < currentLevel; i++) {
    perks.push(...fanLevels[i].perks);
  }

  return perks;
}

/**
 * Get fan level by level number
 */
export function getFanLevelByNumber(level: number): FanLevel | undefined {
  return fanLevels.find((fl) => fl.level === level);
}

/**
 * Get estimated time to next level
 * @param currentPoints - Current points
 * @param currentLevel - Current level
 * @param dailyActivityPoints - Average points earned per day
 * @returns Estimated days to next level
 */
export function getEstimatedTimeToNextLevel(
  currentPoints: number,
  currentLevel: number,
  dailyActivityPoints: number = 20
): number {
  const pointsNeeded = getPointsToNextLevel(currentPoints, currentLevel);

  if (pointsNeeded === 0 || dailyActivityPoints === 0) {
    return 0;
  }

  return Math.ceil(pointsNeeded / dailyActivityPoints);
}

/**
 * Level progression milestones (for achievements/notifications)
 */
export const levelMilestones = [
  {
    level: 2,
    message: '축하합니다! 외야석 팬이 되셨습니다. 이제 희귀 카드를 생성할 수 있습니다!',
    icon: '🎉',
  },
  {
    level: 3,
    message:
      '응원단 멤버가 되신 것을 축하합니다! 템플릿 판매와 팬클럽 모더레이터 권한이 부여되었습니다.',
    icon: '🎺',
  },
  {
    level: 4,
    message:
      '시즌권 홀더 달성! VIP 혜택과 크리에이터 인증을 받으셨습니다. 대단하십니다!',
    icon: '⭐',
  },
  {
    level: 5,
    message:
      '구단 레전드! 최고의 영예입니다. 모든 독점 혜택과 구단 공식 이벤트 초대 자격이 주어집니다!',
    icon: '👑',
  },
];

/**
 * Get milestone message for level
 */
export function getLevelMilestone(level: number): (typeof levelMilestones)[0] | undefined {
  return levelMilestones.find((m) => m.level === level);
}

/**
 * Badge gradients for visual effects
 */
export const badgeGradients = {
  1: 'from-gray-400 to-gray-600',
  2: 'from-green-400 to-green-600',
  3: 'from-blue-400 to-blue-600',
  4: 'from-purple-400 to-purple-600',
  5: 'from-yellow-400 to-yellow-600',
} as const;

/**
 * Export count for validation
 */
export const TOTAL_FAN_LEVELS = fanLevels.length;
export const MAX_FAN_LEVEL = fanLevels[fanLevels.length - 1].level;
export const MIN_POINTS = fanLevels[0].requiredPoints;
export const MAX_POINTS = fanLevels[fanLevels.length - 1].requiredPoints;
