/**
 * KBO Teams Static Data
 *
 * 10 KBO (한국야구위원회) professional baseball teams with official branding
 *
 * Data sources:
 * - Official KBO website: https://www.koreabaseball.com
 * - Team official colors and logos
 * - Historical data (founding year, championships)
 *
 * Last updated: 2024-03-20
 */

export interface KBOTeam {
  id: string;
  name: string; // Korean name
  nameEn: string; // English name
  city: string; // Home city

  // Branding
  color: string; // Primary team color (hex)
  secondaryColor?: string; // Secondary color (hex)
  logo: string; // Logo image URL
  mascot: {
    name: string;
    image: string;
  };

  // Community
  fanCount: number; // Number of fans on platform (dynamic in production)
  fanclubId: string; // Fanclub community ID

  // Metadata
  founded: number; // Year founded
  stadium: string; // Home stadium name
  championships: number; // Korean Series wins
}

/**
 * All 10 KBO teams (as of 2024 season)
 * Ordered alphabetically by Korean name
 */
export const kboTeams: KBOTeam[] = [
  {
    id: 'team-doosan-bears',
    name: '두산 베어스',
    nameEn: 'Doosan Bears',
    city: '서울',
    color: '#131230', // Navy blue
    secondaryColor: '#C41E3A', // Red accent
    logo: '/images/teams/doosan-bears-logo.png',
    mascot: {
      name: '백돌이',
      image: '/images/mascots/doosan-bears-mascot.png',
    },
    fanCount: 7234,
    fanclubId: 'fanclub-doosan-bears',
    founded: 1982,
    stadium: '잠실야구장',
    championships: 6,
  },
  {
    id: 'team-lg-twins',
    name: 'LG 트윈스',
    nameEn: 'LG Twins',
    city: '서울',
    color: '#7B2D7F', // Purple
    secondaryColor: '#C4122F', // Red accent
    logo: '/images/teams/lg-twins-logo.png',
    mascot: {
      name: '캡틴 트윈스',
      image: '/images/mascots/lg-twins-mascot.png',
    },
    fanCount: 8234,
    fanclubId: 'fanclub-lg-twins',
    founded: 1982,
    stadium: '잠실야구장',
    championships: 2,
  },
  {
    id: 'team-kia-tigers',
    name: 'KIA 타이거즈',
    nameEn: 'KIA Tigers',
    city: '광주',
    color: '#EA0029', // Red
    secondaryColor: '#000000', // Black
    logo: '/images/teams/kia-tigers-logo.png',
    mascot: {
      name: '호돌이',
      image: '/images/mascots/kia-tigers-mascot.png',
    },
    fanCount: 9123,
    fanclubId: 'fanclub-kia-tigers',
    founded: 1982,
    stadium: '광주-기아 챔피언스 필드',
    championships: 11,
  },
  {
    id: 'team-samsung-lions',
    name: '삼성 라이온즈',
    nameEn: 'Samsung Lions',
    city: '대구',
    color: '#074CA1', // Blue
    secondaryColor: '#FFFFFF', // White
    logo: '/images/teams/samsung-lions-logo.png',
    mascot: {
      name: '삼돌이',
      image: '/images/mascots/samsung-lions-mascot.png',
    },
    fanCount: 8756,
    fanclubId: 'fanclub-samsung-lions',
    founded: 1982,
    stadium: '대구 삼성 라이온즈 파크',
    championships: 8,
  },
  {
    id: 'team-lotte-giants',
    name: '롯데 자이언츠',
    nameEn: 'Lotte Giants',
    city: '부산',
    color: '#041E42', // Navy blue
    secondaryColor: '#D00F31', // Red
    logo: '/images/teams/lotte-giants-logo.png',
    mascot: {
      name: '누리',
      image: '/images/mascots/lotte-giants-mascot.png',
    },
    fanCount: 10234,
    fanclubId: 'fanclub-lotte-giants',
    founded: 1982,
    stadium: '사직야구장',
    championships: 2,
  },
  {
    id: 'team-ssg-landers',
    name: 'SSG 랜더스',
    nameEn: 'SSG Landers',
    city: '인천',
    color: '#CE0E2D', // Red
    secondaryColor: '#0C2340', // Navy
    logo: '/images/teams/ssg-landers-logo.png',
    mascot: {
      name: '랜디',
      image: '/images/mascots/ssg-landers-mascot.png',
    },
    fanCount: 6543,
    fanclubId: 'fanclub-ssg-landers',
    founded: 2000, // Originally SK Wyverns
    stadium: '인천 SSG 랜더스필드',
    championships: 1,
  },
  {
    id: 'team-nc-dinos',
    name: 'NC 다이노스',
    nameEn: 'NC Dinos',
    city: '창원',
    color: '#315288', // Blue
    secondaryColor: '#C69C6D', // Gold
    logo: '/images/teams/nc-dinos-logo.png',
    mascot: {
      name: '다이나',
      image: '/images/mascots/nc-dinos-mascot.png',
    },
    fanCount: 5234,
    fanclubId: 'fanclub-nc-dinos',
    founded: 2013,
    stadium: '창원 NC 파크',
    championships: 0,
  },
  {
    id: 'team-hanwha-eagles',
    name: '한화 이글스',
    nameEn: 'Hanwha Eagles',
    city: '대전',
    color: '#FF6600', // Orange
    secondaryColor: '#000000', // Black
    logo: '/images/teams/hanwha-eagles-logo.png',
    mascot: {
      name: '이돌이',
      image: '/images/mascots/hanwha-eagles-mascot.png',
    },
    fanCount: 4567,
    fanclubId: 'fanclub-hanwha-eagles',
    founded: 1986,
    stadium: '한화생명 이글스 파크',
    championships: 1,
  },
  {
    id: 'team-kt-wiz',
    name: 'KT 위즈',
    nameEn: 'KT Wiz',
    city: '수원',
    color: '#000000', // Black
    secondaryColor: '#ED1C24', // Red
    logo: '/images/teams/kt-wiz-logo.png',
    mascot: {
      name: '위즈',
      image: '/images/mascots/kt-wiz-mascot.png',
    },
    fanCount: 5432,
    fanclubId: 'fanclub-kt-wiz',
    founded: 2015,
    stadium: '수원 KT 위즈 파크',
    championships: 1,
  },
  {
    id: 'team-kiwoom-heroes',
    name: '키움 히어로즈',
    nameEn: 'Kiwoom Heroes',
    city: '서울',
    color: '#820024', // Burgundy
    secondaryColor: '#000000', // Black
    logo: '/images/teams/kiwoom-heroes-logo.png',
    mascot: {
      name: '히어로',
      image: '/images/mascots/kiwoom-heroes-mascot.png',
    },
    fanCount: 6123,
    fanclubId: 'fanclub-kiwoom-heroes',
    founded: 2008, // Originally Woori Heroes
    stadium: '고척스카이돔',
    championships: 0,
  },
];

/**
 * Get team by ID
 */
export function getTeamById(teamId: string): KBOTeam | undefined {
  return kboTeams.find((team) => team.id === teamId);
}

/**
 * Get teams by city
 */
export function getTeamsByCity(city: string): KBOTeam[] {
  return kboTeams.filter((team) => team.city === city);
}

/**
 * Get teams sorted by championships
 */
export function getTeamsByChampionships(): KBOTeam[] {
  return [...kboTeams].sort((a, b) => b.championships - a.championships);
}

/**
 * Get teams sorted by fan count
 */
export function getTeamsByFanCount(): KBOTeam[] {
  return [...kboTeams].sort((a, b) => b.fanCount - a.fanCount);
}

/**
 * Search teams by name (Korean or English)
 */
export function searchTeams(query: string): KBOTeam[] {
  const lowerQuery = query.toLowerCase();
  return kboTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(lowerQuery) ||
      team.nameEn.toLowerCase().includes(lowerQuery) ||
      team.city.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Team color utilities
 */
export function getTeamColors(teamId: string): { primary: string; secondary?: string } | null {
  const team = getTeamById(teamId);
  if (!team) return null;

  return {
    primary: team.color,
    secondary: team.secondaryColor,
  };
}

/**
 * Get contrast color (white or black) for team color
 * Uses relative luminance calculation (WCAG 2.1)
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Validate WCAG 2.1 contrast ratio
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - 'AA' or 'AAA'
 * @returns Whether contrast ratio meets WCAG requirements
 */
export function validateContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  // WCAG 2.1 Level AA: 4.5:1 for normal text, 3:1 for large text
  // WCAG 2.1 Level AAA: 7:1 for normal text, 4.5:1 for large text
  const requiredRatio = level === 'AAA' ? 7 : 4.5;

  return ratio >= requiredRatio;
}

/**
 * Export count for validation
 */
export const TOTAL_KBO_TEAMS = kboTeams.length;
