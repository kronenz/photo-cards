/**
 * KBO 문화 반영 '영광의 순간' 템플릿 시스템
 * 한국 야구의 특별한 순간들을 담는 템플릿 데이터
 */

// KBO 구단 정보
export interface KBOTeam {
    id: string;
    name: string;
    englishName: string;
    city: string;
    founded: number;
    stadium: string;
    colors: {
        primary: string;
        secondary: string;
        accent?: string;
    };
    mascot: string;
    slogan: string;
    championships: number[];
}

// 영광의 순간 카테고리
export type GloryMomentCategory =
    | 'championship' // 우승
    | 'playoff' // 플레이오프
    | 'milestone' // 기록 달성
    | 'debut' // 데뷔
    | 'retirement' // 은퇴
    | 'walkoff' // 끝내기
    | 'nohitter' // 노히터
    | 'homerun' // 홈런
    | 'rookie' // 신인왕
    | 'mvp' // MVP
    | 'golden_glove' // 골든글러브
    | 'fan_moment' // 팬 순간
    | 'rivalry' // 라이벌전
    | 'season_highlight'; // 시즌 하이라이트

// 템플릿 스타일
export interface TemplateStyle {
    background: {
        type: 'gradient' | 'pattern' | 'image';
        value: string;
        overlay?: string;
    };
    border: {
        style: 'classic' | 'modern' | 'vintage' | 'holographic';
        color: string;
        width: number;
    };
    typography: {
        titleFont: string;
        bodyFont: string;
        accentColor: string;
    };
    effects: {
        holographic: boolean;
        glow: boolean;
        shadow: boolean;
        animation: 'none' | 'subtle' | 'dynamic';
    };
}

// 템플릿 요소
export interface TemplateElement {
    id: string;
    type: 'text' | 'image' | 'logo' | 'decoration' | 'stats';
    position: {
        x: number; // 0-100 (percentage)
        y: number; // 0-100 (percentage)
        width: number;
        height: number;
    };
    style: {
        fontSize?: number;
        fontWeight?: string;
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
        opacity?: number;
        rotation?: number;
        zIndex?: number;
    };
    content?: {
        text?: string;
        placeholder?: string;
        maxLength?: number;
        required?: boolean;
    };
    constraints?: {
        editable: boolean;
        movable: boolean;
        resizable: boolean;
    };
}

// 영광의 순간 템플릿
export interface GloryMomentTemplate {
    id: string;
    name: string;
    category: GloryMomentCategory;
    description: string;
    style: TemplateStyle;
    layout: {
        type: 'portrait' | 'landscape' | 'square';
        elements: TemplateElement[];
    };
    metadata: {
        difficulty: 'easy' | 'medium' | 'hard';
        popularity: number;
        tags: string[];
        createdAt: string;
        updatedAt: string;
    };
}

// KBO 구단 데이터
export const KBO_TEAMS: Record<string, KBOTeam> = {
    lg: {
        id: 'lg',
        name: 'LG 트윈스',
        englishName: 'LG Twins',
        city: '서울',
        founded: 1982,
        stadium: '잠실야구장',
        colors: {
            primary: '#C41E3A',
            secondary: '#FF69B4',
            accent: '#FFFFFF'
        },
        mascot: '치돌이, 치순이',
        slogan: '우리가 LG다!',
        championships: [1990, 1994]
    },
    doosan: {
        id: 'doosan',
        name: '두산 베어스',
        englishName: 'Doosan Bears',
        city: '서울',
        founded: 1982,
        stadium: '잠실야구장',
        colors: {
            primary: '#131230',
            secondary: '#4169E1',
            accent: '#FFFFFF'
        },
        mascot: '베어스',
        slogan: '베어스 파이팅!',
        championships: [1982, 1995, 2001, 2015, 2016]
    },
    kt: {
        id: 'kt',
        name: 'KT 위즈',
        englishName: 'KT Wiz',
        city: '수원',
        founded: 2013,
        stadium: '수원KT위즈파크',
        colors: {
            primary: '#000000',
            secondary: '#FF0000',
            accent: '#FFFFFF'
        },
        mascot: '토리',
        slogan: '위즈덤 파워!',
        championships: [2021]
    },
    samsung: {
        id: 'samsung',
        name: '삼성 라이온즈',
        englishName: 'Samsung Lions',
        city: '대구',
        founded: 1982,
        stadium: '대구삼성라이온즈파크',
        colors: {
            primary: '#074CA1',
            secondary: '#87CEEB',
            accent: '#FFFFFF'
        },
        mascot: '뿌꾸',
        slogan: '라이온즈 파이팅!',
        championships: [1985, 1987, 1988, 1993, 2002, 2005, 2006, 2011, 2012, 2014]
    },
    lotte: {
        id: 'lotte',
        name: '롯데 자이언츠',
        englishName: 'Lotte Giants',
        city: '부산',
        founded: 1982,
        stadium: '사직야구장',
        colors: {
            primary: '#041E42',
            secondary: '#C41E3A',
            accent: '#FFFFFF'
        },
        mascot: '누리',
        slogan: '부산의 자랑!',
        championships: [1984, 1992]
    },
    kia: {
        id: 'kia',
        name: 'KIA 타이거즈',
        englishName: 'KIA Tigers',
        city: '광주',
        founded: 1982,
        stadium: '광주-기아 챔피언스 필드',
        colors: {
            primary: '#EA002C',
            secondary: '#000000',
            accent: '#FFFFFF'
        },
        mascot: '티거',
        slogan: '타이거즈 파이팅!',
        championships: [1983, 1986, 1988, 1989, 1993, 1996, 1997, 2009, 2017]
    },
    nc: {
        id: 'nc',
        name: 'NC 다이노스',
        englishName: 'NC Dinos',
        city: '창원',
        founded: 2011,
        stadium: 'NC파크',
        colors: {
            primary: '#315288',
            secondary: '#C4A484',
            accent: '#FFFFFF'
        },
        mascot: '디노',
        slogan: '다이노스 파이팅!',
        championships: []
    },
    hanwha: {
        id: 'hanwha',
        name: '한화 이글스',
        englishName: 'Hanwha Eagles',
        city: '대전',
        founded: 1982,
        stadium: '한화생명 이글스파크',
        colors: {
            primary: '#FF6600',
            secondary: '#000000',
            accent: '#FFFFFF'
        },
        mascot: '이글이',
        slogan: '이글스 파이팅!',
        championships: [1999]
    },
    ssg: {
        id: 'ssg',
        name: 'SSG 랜더스',
        englishName: 'SSG Landers',
        city: '인천',
        founded: 2021,
        stadium: 'SSG 랜더스필드',
        colors: {
            primary: '#CE0E2D',
            secondary: '#FFD700',
            accent: '#FFFFFF'
        },
        mascot: '랜디',
        slogan: '랜더스 파이팅!',
        championships: []
    },
    kiwoom: {
        id: 'kiwoom',
        name: '키움 히어로즈',
        englishName: 'Kiwoom Heroes',
        city: '서울',
        founded: 2008,
        stadium: '고척스카이돔',
        colors: {
            primary: '#570514',
            secondary: '#FFD700',
            accent: '#FFFFFF'
        },
        mascot: '슬기',
        slogan: '히어로즈 파이팅!',
        championships: []
    }
};

// KBO 응원가 및 사운드 효과 데이터
export interface KBOCheerSound {
    id: string;
    name: string;
    team: string;
    type: 'cheer' | 'fight_song' | 'victory' | 'sound_effect';
    audioUrl: string;
    description: string;
    duration: number;
}

export const KBO_CHEER_SOUNDS: KBOCheerSound[] = [
    // LG 트윈스 사운드
    {
        id: 'lg-twins-cheer',
        name: 'LG 트윈스 응원가',
        team: 'lg',
        type: 'cheer',
        audioUrl: '/sounds/lg-cheer.mp3',
        description: '잠실의 열기를 담은 LG 트윈스 대표 응원가',
        duration: 30
    },
    {
        id: 'lg-twins-victory',
        name: 'LG 승리의 함성',
        team: 'lg',
        type: 'victory',
        audioUrl: '/sounds/lg-victory.mp3',
        description: '트윈스 승리 후 팬들의 환호성',
        duration: 15
    },
    
    // 두산 베어스 사운드
    {
        id: 'doosan-bears-fight',
        name: '두산 베어스 파이팅송',
        team: 'doosan',
        type: 'fight_song',
        audioUrl: '/sounds/doosan-fight.mp3',
        description: '베어스의 투지를 보여주는 파이팅송',
        duration: 25
    },
    {
        id: 'doosan-bears-cheer',
        name: '베어스 응원가',
        team: 'doosan',
        type: 'cheer',
        audioUrl: '/sounds/doosan-cheer.mp3',
        description: '잠실 베어스 팬들의 열정적인 응원가',
        duration: 28
    },
    
    // 공통 효과음
    {
        id: 'homerun-sound',
        name: '홈런 타격음',
        team: 'all',
        type: 'sound_effect',
        audioUrl: '/sounds/homerun-hit.mp3',
        description: '짜릿한 홈런 순간의 타격음',
        duration: 3
    },
    {
        id: 'bat-crack-sound',
        name: '방망이 타격음',
        team: 'all',
        type: 'sound_effect',
        audioUrl: '/sounds/bat-crack.mp3',
        description: '깔끔한 방망이 타격 소리',
        duration: 2
    },
    {
        id: 'crowd-cheer',
        name: '관중 환호성',
        team: 'all',
        type: 'sound_effect',
        audioUrl: '/sounds/crowd-cheer.mp3',
        description: '경기장을 뜨겁게 달구는 관중들의 환호',
        duration: 8
    }
];

// 감정 표현 아이콘 시스템
export interface EmotionIcon {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    category: 'joy' | 'excitement' | 'pride' | 'determination' | 'nostalgia';
}

export const EMOTION_ICONS: EmotionIcon[] = [
    { id: 'joy', name: '기쁨', icon: '😊', color: '#FFD700', description: '우승의 기쁨', category: 'joy' },
    { id: 'excitement', name: '흥분', icon: '🔥', color: '#FF6B35', description: '끝내기의 짜릿함', category: 'excitement' },
    { id: 'pride', name: '자랑', icon: '💪', color: '#4ECDC4', description: '팀에 대한 자부심', category: 'pride' },
    { id: 'determination', name: '각오', icon: '⚡', color: '#667eea', description: '승리에 대한 의지', category: 'determination' },
    { id: 'nostalgia', name: '그리움', icon: '💭', color: '#95a5a6', description: '추억 속 그 순간', category: 'nostalgia' },
    { id: 'triumph', name: '승리', icon: '🏆', color: '#FFD700', description: '우승의 환희', category: 'joy' },
    { id: 'passion', name: '열정', icon: '🔥', color: '#FF4757', description: '뜨거운 야구 열정', category: 'excitement' }
];

// 명언 데이터
export interface FamousQuote {
    id: string;
    text: string;
    author: string;
    context: string;
    category: 'player' | 'coach' | 'commentator' | 'fan';
    team?: string;
}

export const FAMOUS_QUOTES: FamousQuote[] = [
    {
        id: 'quote-1',
        text: '야구는 실패의 게임이다. 하지만 그 실패를 극복하는 것이 진정한 승리다.',
        author: '선동열',
        context: '1995년 한국시리즈 우승 후 인터뷰',
        category: 'player',
        team: 'samsung'
    },
    {
        id: 'quote-2',
        text: '끝까지 포기하지 않는 것, 그것이 야구의 매력이다.',
        author: '이승엽',
        context: '통산 400호 홈런 달성 후',
        category: 'player',
        team: 'samsung'
    },
    {
        id: 'quote-3',
        text: '팬들의 응원이 있기에 우리는 더 강해질 수 있습니다.',
        author: '김현수',
        context: '2021년 시즌 MVP 수상 소감',
        category: 'player',
        team: 'lg'
    },
    {
        id: 'quote-4',
        text: '야구는 혼자 하는 게임이 아니다. 팀워크가 승리를 만든다.',
        author: '박찬호',
        context: 'MLB 진출 후 한국 야구에 대한 소감',
        category: 'player'
    },
    {
        id: 'quote-5',
        text: '승부는 9회말 2아웃까지 끝나지 않는다. 그것이 야구의 매력이다.',
        author: '김태형',
        context: '2015년 두산 베어스 우승 후',
        category: 'coach',
        team: 'doosan'
    }
];

// 영광의 순간 템플릿 데이터
export const GLORY_MOMENT_TEMPLATES: GloryMomentTemplate[] = [
    {
        id: 'championship-classic',
        name: '우승 클래식',
        category: 'championship',
        description: '한국시리즈 우승의 감동적인 순간을 담는 클래식한 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'linear-gradient(135deg, #FFD700, #FFA500)',
                overlay: 'rgba(0, 0, 0, 0.1)'
            },
            border: {
                style: 'classic',
                color: '#FFD700',
                width: 8
            },
            typography: {
                titleFont: 'Noto Sans KR',
                bodyFont: 'Noto Sans KR',
                accentColor: '#FFFFFF'
            },
            effects: {
                holographic: true,
                glow: true,
                shadow: true,
                animation: 'dynamic'
            }
        },
        layout: {
            type: 'portrait',
            elements: [
                {
                    id: 'title',
                    type: 'text',
                    position: { x: 10, y: 5, width: 80, height: 15 },
                    style: {
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        zIndex: 10
                    },
                    content: {
                        text: '한국시리즈 우승',
                        placeholder: '제목을 입력하세요',
                        maxLength: 20,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'main-image',
                    type: 'image',
                    position: { x: 10, y: 25, width: 80, height: 45 },
                    style: {
                        opacity: 1,
                        zIndex: 5
                    },
                    content: {
                        placeholder: '우승 순간 사진을 업로드하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                }
            ]
        },
        metadata: {
            difficulty: 'easy',
            popularity: 95,
            tags: ['우승', '한국시리즈', '클래식', '골드'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    },
    {
        id: 'walkoff-moment',
        name: '끝내기 순간',
        category: 'walkoff',
        description: '짜릿한 끝내기 순간의 감동을 담는 다이나믹한 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                overlay: 'rgba(0, 0, 0, 0.2)'
            },
            border: {
                style: 'modern',
                color: '#FF6B6B',
                width: 6
            },
            typography: {
                titleFont: 'Noto Sans KR',
                bodyFont: 'Noto Sans KR',
                accentColor: '#FFFFFF'
            },
            effects: {
                holographic: true,
                glow: true,
                shadow: true,
                animation: 'dynamic'
            }
        },
        layout: {
            type: 'landscape',
            elements: [
                {
                    id: 'title',
                    type: 'text',
                    position: { x: 5, y: 5, width: 90, height: 15 },
                    style: {
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        zIndex: 10
                    },
                    content: {
                        text: '끝내기 홈런!',
                        placeholder: '끝내기 순간을 표현하세요',
                        maxLength: 15,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                }
            ]
        },
        metadata: {
            difficulty: 'medium',
            popularity: 88,
            tags: ['끝내기', '홈런', '다이나믹', '감동'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    },
    {
        id: 'homerun-spectacular',
        name: '홈런 스펙터클',
        category: 'homerun',
        description: '장외 홈런의 웅장함을 담는 동적 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'radial-gradient(circle, #FF6B35, #F7931E, #FFD700)',
                overlay: 'rgba(0, 0, 0, 0.15)'
            },
            border: {
                style: 'holographic',
                color: '#FF6B35',
                width: 6
            },
            typography: {
                titleFont: 'Noto Sans KR',
                bodyFont: 'Noto Sans KR',
                accentColor: '#FFFFFF'
            },
            effects: {
                holographic: true,
                glow: true,
                shadow: true,
                animation: 'dynamic'
            }
        },
        layout: {
            type: 'landscape',
            elements: [
                {
                    id: 'title',
                    type: 'text',
                    position: { x: 5, y: 5, width: 90, height: 12 },
                    style: {
                        fontSize: 36,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        zIndex: 10
                    },
                    content: {
                        text: '장외 홈런!',
                        placeholder: '홈런 제목을 입력하세요',
                        maxLength: 15,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                }
            ]
        },
        metadata: {
            difficulty: 'medium',
            popularity: 92,
            tags: ['홈런', '장외', '스펙터클', '파워'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    }
];

// 템플릿 카테고리별 그룹화
export const TEMPLATES_BY_CATEGORY = GLORY_MOMENT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
        acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
}, {} as Record<GloryMomentCategory, GloryMomentTemplate[]>);

// 인기 템플릿 (인기도 80 이상)
export const POPULAR_TEMPLATES = GLORY_MOMENT_TEMPLATES
    .filter(template => template.metadata.popularity >= 80)
    .sort((a, b) => b.metadata.popularity - a.metadata.popularity);

// 카테고리 메타데이터
export const CATEGORY_METADATA: Record<GloryMomentCategory, {
    name: string;
    description: string;
    icon: string;
    color: string;
}> = {
    championship: {
        name: '우승',
        description: '한국시리즈 우승의 영광스러운 순간',
        icon: '🏆',
        color: '#FFD700'
    },
    playoff: {
        name: '플레이오프',
        description: '포스트시즌의 치열한 승부',
        icon: '⚔️',
        color: '#FF6B35'
    },
    milestone: {
        name: '기록 달성',
        description: '역사에 남을 기록 달성의 순간',
        icon: '📊',
        color: '#4ECDC4'
    },
    debut: {
        name: '데뷔',
        description: '꿈의 무대 첫 발을 내딛는 순간',
        icon: '🌟',
        color: '#667eea'
    },
    retirement: {
        name: '은퇴',
        description: '오랜 여정의 마지막을 장식하는 순간',
        icon: '👋',
        color: '#95a5a6'
    },
    walkoff: {
        name: '끝내기',
        description: '짜릿한 끝내기 승부의 순간',
        icon: '💥',
        color: '#e74c3c'
    },
    nohitter: {
        name: '노히터',
        description: '완벽한 투구의 예술',
        icon: '🎯',
        color: '#9b59b6'
    },
    homerun: {
        name: '홈런',
        description: '짜릿한 홈런의 순간',
        icon: '⚾',
        color: '#f39c12'
    },
    rookie: {
        name: '신인왕',
        description: '신인왕 수상의 영예로운 순간',
        icon: '🌟',
        color: '#2ecc71'
    },
    mvp: {
        name: 'MVP',
        description: '시즌 최우수 선수의 영광',
        icon: '👑',
        color: '#e67e22'
    },
    golden_glove: {
        name: '골든글러브',
        description: '최고 수비수의 증명',
        icon: '🥊',
        color: '#27ae60'
    },
    fan_moment: {
        name: '팬 순간',
        description: '팬들과 함께한 특별한 순간',
        icon: '❤️',
        color: '#e91e63'
    },
    rivalry: {
        name: '라이벌전',
        description: '치열한 라이벌 구단과의 승부',
        icon: '⚡',
        color: '#ff5722'
    },
    season_highlight: {
        name: '시즌 하이라이트',
        description: '시즌을 빛낸 최고의 순간',
        icon: '✨',
        color: '#607d8b'
    }
};

// 유틸리티 함수들
export function getTemplatesByCategory(category: GloryMomentCategory): GloryMomentTemplate[] {
    return TEMPLATES_BY_CATEGORY[category] || [];
}

export function getTemplateById(id: string): GloryMomentTemplate | undefined {
    return GLORY_MOMENT_TEMPLATES.find(template => template.id === id);
}

export function searchTemplates(query: string): GloryMomentTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return GLORY_MOMENT_TEMPLATES.filter(template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        CATEGORY_METADATA[template.category]?.name.toLowerCase().includes(lowercaseQuery)
    );
}

export function getTemplatesByTeam(teamId: string): GloryMomentTemplate[] {
    return GLORY_MOMENT_TEMPLATES.filter(template => 
        template.metadata.tags.includes(teamId) ||
        template.metadata.tags.includes(KBO_TEAMS[teamId]?.name)
    );
}

export function getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): GloryMomentTemplate[] {
    return GLORY_MOMENT_TEMPLATES.filter(template => template.metadata.difficulty === difficulty);
}

export function getRandomTemplate(): GloryMomentTemplate {
    const randomIndex = Math.floor(Math.random() * GLORY_MOMENT_TEMPLATES.length);
    return GLORY_MOMENT_TEMPLATES[randomIndex];
}

export function getRecommendedTemplates(category?: GloryMomentCategory, limit: number = 6): GloryMomentTemplate[] {
    let templates = category ? getTemplatesByCategory(category) : POPULAR_TEMPLATES;
    return templates.slice(0, limit);
}