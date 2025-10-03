// Baseball 10개 구단 데이터
export interface BaseballTeam {
  id: string;
  name: string;
  englishName: string;
  city: string;
  stadium: string;
  founded: number;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  mascot: string;
  fanClubName: string;
  cheers: string[];
  achievements: {
    championships: number;
    lastChampionship?: number;
  };
}

export const BASEBALL_TEAMS: BaseballTeam[] = [
  {
    id: 'lg-twins',
    name: 'LG 트윈스',
    englishName: 'LG Twins',
    city: '서울',
    stadium: '잠실야구장',
    founded: 1982,
    colors: {
      primary: '#C41E3A',
      secondary: '#000000',
      accent: '#FFFFFF'
    },
    mascot: '차차, 우리',
    fanClubName: 'LG 트윈스 팬클럽',
    cheers: [
      '우리가 LG 트윈스다',
      '승리의 LG',
      '트윈스 파이팅'
    ],
    achievements: {
      championships: 2,
      lastChampionship: 1994
    }
  },
  {
    id: 'doosan-bears',
    name: '두산 베어스',
    englishName: 'Doosan Bears',
    city: '서울',
    stadium: '잠실야구장',
    founded: 1982,
    colors: {
      primary: '#131230',
      secondary: '#C41E3A',
      accent: '#FFFFFF'
    },
    mascot: '베어스',
    fanClubName: '베어스 덴',
    cheers: [
      '두산 베어스 파이팅',
      '우리는 베어스',
      '승리의 함성'
    ],
    achievements: {
      championships: 6,
      lastChampionship: 2016
    }
  },
  {
    id: 'kia-tigers',
    name: 'KIA 타이거즈',
    englishName: 'KIA Tigers',
    city: '광주',
    stadium: '광주-기아 챔피언스 필드',
    founded: 1982,
    colors: {
      primary: '#EA0029',
      secondary: '#000000',
      accent: '#FFFFFF'
    },
    mascot: '타이거즈',
    fanClubName: '타이거즈 팬클럽',
    cheers: [
      'KIA 타이거즈',
      '광주의 자랑',
      '타이거즈 파이팅'
    ],
    achievements: {
      championships: 11,
      lastChampionship: 2017
    }
  },
  {
    id: 'samsung-lions',
    name: '삼성 라이온즈',
    englishName: 'Samsung Lions',
    city: '대구',
    stadium: '대구 삼성 라이온즈 파크',
    founded: 1982,
    colors: {
      primary: '#074CA1',
      secondary: '#FFFFFF',
      accent: '#EA0029'
    },
    mascot: '라이온즈',
    fanClubName: '라이온즈 팬클럽',
    cheers: [
      '삼성 라이온즈',
      '대구의 왕자',
      '라이온즈 파이팅'
    ],
    achievements: {
      championships: 8,
      lastChampionship: 2014
    }
  },
  {
    id: 'lotte-giants',
    name: '롯데 자이언츠',
    englishName: 'Lotte Giants',
    city: '부산',
    stadium: '사직야구장',
    founded: 1982,
    colors: {
      primary: '#041E42',
      secondary: '#C41E3A',
      accent: '#FFFFFF'
    },
    mascot: '누리, 카리',
    fanClubName: '자이언츠 팬클럽',
    cheers: [
      '롯데 자이언츠',
      '부산의 자랑',
      '자이언츠 파이팅'
    ],
    achievements: {
      championships: 2,
      lastChampionship: 1992
    }
  },
  {
    id: 'hanwha-eagles',
    name: '한화 이글스',
    englishName: 'Hanwha Eagles',
    city: '대전',
    stadium: '한화생명 이글스파크',
    founded: 1986,
    colors: {
      primary: '#FF6600',
      secondary: '#000000',
      accent: '#FFFFFF'
    },
    mascot: '이글스',
    fanClubName: '이글스 팬클럽',
    cheers: [
      '한화 이글스',
      '대전의 독수리',
      '이글스 파이팅'
    ],
    achievements: {
      championships: 1,
      lastChampionship: 1999
    }
  },
  {
    id: 'ssg-landers',
    name: 'SSG 랜더스',
    englishName: 'SSG Landers',
    city: '인천',
    stadium: 'SSG 랜더스필드',
    founded: 2000,
    colors: {
      primary: '#CE0E2D',
      secondary: '#FDB827',
      accent: '#041E42'
    },
    mascot: '랜더스',
    fanClubName: '랜더스 팬클럽',
    cheers: [
      'SSG 랜더스',
      '인천의 자랑',
      '랜더스 파이팅'
    ],
    achievements: {
      championships: 0
    }
  },
  {
    id: 'kt-wiz',
    name: 'KT 위즈',
    englishName: 'KT Wiz',
    city: '수원',
    stadium: '수원 KT 위즈파크',
    founded: 2015,
    colors: {
      primary: '#000000',
      secondary: '#EA0029',
      accent: '#FFFFFF'
    },
    mascot: '토리, 까미',
    fanClubName: '위즈 팬클럽',
    cheers: [
      'KT 위즈',
      '수원의 마법사',
      '위즈 파이팅'
    ],
    achievements: {
      championships: 0
    }
  },
  {
    id: 'nc-dinos',
    name: 'NC 다이노스',
    englishName: 'NC Dinos',
    city: '창원',
    stadium: 'NC파크',
    founded: 2013,
    colors: {
      primary: '#315288',
      secondary: '#8B0000',
      accent: '#FFFFFF'
    },
    mascot: '다이노스',
    fanClubName: '다이노스 팬클럽',
    cheers: [
      'NC 다이노스',
      '창원의 공룡',
      '다이노스 파이팅'
    ],
    achievements: {
      championships: 0
    }
  },
  {
    id: 'kiwoom-heroes',
    name: '키움 히어로즈',
    englishName: 'Kiwoom Heroes',
    city: '서울',
    stadium: '고척스카이돔',
    founded: 2008,
    colors: {
      primary: '#570514',
      secondary: '#D4AF37',
      accent: '#FFFFFF'
    },
    mascot: '슬기, 너구리',
    fanClubName: '히어로즈 팬클럽',
    cheers: [
      '키움 히어로즈',
      '서울의 영웅',
      '히어로즈 파이팅'
    ],
    achievements: {
      championships: 0
    }
  }
];

export function getTeamById(teamId: string): BaseballTeam | undefined {
  return BASEBALL_TEAMS.find(team => team.id === teamId);
}

export function getTeamsByCity(city: string): BaseballTeam[] {
  return BASEBALL_TEAMS.filter(team => team.city === city);
}

export function getTeamColors(teamId: string): { primary: string; secondary: string; accent?: string } | null {
  const team = getTeamById(teamId);
  return team ? team.colors : null;
}