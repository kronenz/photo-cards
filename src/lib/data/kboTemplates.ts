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
        id: 'doosan-bears-fight',
        name: '두산 베어스 파이팅송',
        team: 'doosan',
        type: 'fight_song',
        audioUrl: '/sounds/doosan-fight.mp3',
        description: '베어스의 투지를 보여주는 파이팅송',
        duration: 25
    },
    {
        id: 'homerun-sound',
        name: '홈런 타격음',
        team: 'all',
        type: 'sound_effect',
        audioUrl: '/sounds/homerun-hit.mp3',
        description: '짜릿한 홈런 순간의 타격음',
        duration: 3
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
    { id: 'nostalgia', name: '그리움', icon: '💭', color: '#95a5a6', description: '추억 속 그 순간', category: 'nostalgia' }
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
                },
                {
                    id: 'team-logo',
                    type: 'logo',
                    position: { x: 75, y: 75, width: 20, height: 20 },
                    style: {
                        opacity: 0.9,
                        zIndex: 8
                    },
                    constraints: {
                        editable: false,
                        movable: true,
                        resizable: true
                    }
                },
                {
                    id: 'year',
                    type: 'text',
                    position: { x: 10, y: 75, width: 30, height: 10 },
                    style: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textAlign: 'left',
                        zIndex: 9
                    },
                    content: {
                        text: '2024',
                        placeholder: '연도',
                        maxLength: 4,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'description',
                    type: 'text',
                    position: { x: 10, y: 85, width: 80, height: 10 },
                    style: {
                        fontSize: 14,
                        color: '#FFFFFF',
                        textAlign: 'center',
                        zIndex: 7
                    },
                    content: {
                        text: '영광의 순간을 기억하며',
                        placeholder: '설명을 입력하세요',
                        maxLength: 50
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
                },
                {
                    id: 'main-image',
                    type: 'image',
                    position: { x: 5, y: 25, width: 60, height: 50 },
                    style: {
                        opacity: 1,
                        zIndex: 5
                    },
                    content: {
                        placeholder: '끝내기 순간 사진을 업로드하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'stats',
                    type: 'stats',
                    position: { x: 70, y: 30, width: 25, height: 40 },
                    style: {
                        fontSize: 16,
                        color: '#FFFFFF',
                        textAlign: 'left',
                        zIndex: 8
                    },
                    content: {
                        text: '9회말\n2아웃\n만루',
                        placeholder: '상황 정보'
                    },
                    constraints: {
                        editable: true,
                        movable: true,
                        resizable: true
                    }
                },
                {
                    id: 'player-name',
                    type: 'text',
                    position: { x: 5, y: 80, width: 40, height: 10 },
                    style: {
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textAlign: 'left',
                        zIndex: 9
                    },
                    content: {
                        text: '선수명',
                        placeholder: '선수 이름을 입력하세요',
                        maxLength: 10,
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
                },
                {
                    id: 'video-area',
                    type: 'image',
                    position: { x: 5, y: 20, width: 60, height: 50 },
                    style: {
                        opacity: 1,
                        zIndex: 5
                    },
                    content: {
                        placeholder: '홈런 동영상을 업로드하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'trajectory',
                    type: 'decoration',
                    position: { x: 65, y: 25, width: 30, height: 40 },
                    style: {
                        opacity: 0.8,
                        zIndex: 7
                    },
                    content: {
                        text: '⚾ → 🌟',
                        placeholder: '공의 궤적'
                    },
                    constraints: {
                        editable: false,
                        movable: true,
                        resizable: true
                    }
                },
                {
                    id: 'distance',
                    type: 'stats',
                    position: { x: 70, y: 70, width: 25, height: 25 },
                    style: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textAlign: 'center',
                        zIndex: 8
                    },
                    content: {
                        text: '140m',
                        placeholder: '비거리'
                    },
                    constraints: {
                        editable: true,
                        movable: true,
                        resizable: true
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
    },
    {
        id: 'steal-success',
        name: '도루 성공',
        category: 'milestone',
        description: '짜릿한 도루 성공 순간의 스피드감을 표현하는 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'linear-gradient(45deg, #667eea, #764ba2)',
                overlay: 'rgba(0, 0, 0, 0.1)'
            },
            border: {
                style: 'modern',
                color: '#667eea',
                width: 5
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
            type: 'square',
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
                        text: '도루 성공!',
                        placeholder: '도루 제목',
                        maxLength: 12,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'sliding-image',
                    type: 'image',
                    position: { x: 10, y: 25, width: 80, height: 45 },
                    style: {
                        opacity: 1,
                        zIndex: 5
                    },
                    content: {
                        placeholder: '슬라이딩 장면을 업로드하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'speed-effect',
                    type: 'decoration',
                    position: { x: 5, y: 35, width: 90, height: 20 },
                    style: {
                        opacity: 0.6,
                        zIndex: 6
                    },
                    content: {
                        text: '💨💨💨',
                        placeholder: '스피드 효과'
                    },
                    constraints: {
                        editable: false,
                        movable: true,
                        resizable: true
                    }
                },
                {
                    id: 'time',
                    type: 'stats',
                    position: { x: 10, y: 75, width: 35, height: 15 },
                    style: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textAlign: 'left',
                        zIndex: 8
                    },
                    content: {
                        text: '3.2초',
                        placeholder: '도루 시간'
                    },
                    constraints: {
                        editable: true,
                        movable: true,
                        resizable: true
                    }
                }
            ]
        },
        metadata: {
            difficulty: 'medium',
            popularity: 85,
            tags: ['도루', '스피드', '슬라이딩', '성공'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    },
    {
        id: 'defense-masterpiece',
        name: '수비 명장면',
        category: 'milestone',
        description: '화려한 수비 플레이의 예술적 순간을 담는 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                overlay: 'rgba(0, 0, 0, 0.1)'
            },
            border: {
                style: 'classic',
                color: '#2ecc71',
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
                animation: 'subtle'
            }
        },
        layout: {
            type: 'portrait',
            elements: [
                {
                    id: 'title',
                    type: 'text',
                    position: { x: 10, y: 5, width: 80, height: 12 },
                    style: {
                        fontSize: 26,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        zIndex: 10
                    },
                    content: {
                        text: '수비 명장면',
                        placeholder: '수비 제목',
                        maxLength: 15,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'defense-video',
                    type: 'image',
                    position: { x: 10, y: 20, width: 80, height: 50 },
                    style: {
                        opacity: 1,
                        zIndex: 5
                    },
                    content: {
                        placeholder: '수비 장면을 업로드하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'glove-icon',
                    type: 'decoration',
                    position: { x: 75, y: 15, width: 20, height: 20 },
                    style: {
                        opacity: 0.9,
                        zIndex: 8
                    },
                    content: {
                        text: '🥊',
                        placeholder: '글러브'
                    },
                    constraints: {
                        editable: false,
                        movable: true,
                        resizable: true
                    }
                },
                {
                    id: 'play-type',
                    type: 'text',
                    position: { x: 10, y: 75, width: 80, height: 10 },
                    style: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#FFD700',
                        textAlign: 'center',
                        zIndex: 9
                    },
                    content: {
                        text: '다이빙 캐치',
                        placeholder: '플레이 유형'
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
            difficulty: 'easy',
            popularity: 87,
            tags: ['수비', '다이빙', '캐치', '명장면'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    },
    {
        id: 'stats-visualization',
        name: '통계 시각화',
        category: 'milestone',
        description: '선수의 시즌 성적을 아름답게 시각화하는 데이터 중심 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'linear-gradient(45deg, #3498db, #2980b9)',
                overlay: 'rgba(0, 0, 0, 0.05)'
            },
            border: {
                style: 'modern',
                color: '#3498db',
                width: 4
            },
            typography: {
                titleFont: 'Noto Sans KR',
                bodyFont: 'Noto Sans KR',
                accentColor: '#FFFFFF'
            },
            effects: {
                holographic: false,
                glow: true,
                shadow: true,
                animation: 'subtle'
            }
        },
        layout: {
            type: 'landscape',
            elements: [
                {
                    id: 'player-name',
                    type: 'text',
                    position: { x: 5, y: 5, width: 40, height: 15 },
                    style: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'left',
                        zIndex: 10
                    },
                    content: {
                        text: '선수명',
                        placeholder: '선수 이름',
                        maxLength: 10,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'season-year',
                    type: 'text',
                    position: { x: 50, y: 5, width: 45, height: 15 },
                    style: {
                        fontSize: 20,
                        fontWeight: '500',
                        color: '#FFD700',
                        textAlign: 'right',
                        zIndex: 9
                    },
                    content: {
                        text: '2024 시즌',
                        placeholder: '시즌 연도'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'stats-chart',
                    type: 'stats',
                    position: { x: 5, y: 25, width: 90, height: 50 },
                    style: {
                        fontSize: 16,
                        color: '#FFFFFF',
                        textAlign: 'left',
                        zIndex: 5
                    },
                    content: {
                        text: '타율: .320\n홈런: 25개\nRBI: 85개\nOPS: .950',
                        placeholder: '통계 데이터'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'chart-decoration',
                    type: 'decoration',
                    position: { x: 70, y: 30, width: 25, height: 40 },
                    style: {
                        opacity: 0.7,
                        zIndex: 6
                    },
                    content: {
                        text: '📊📈',
                        placeholder: '차트 아이콘'
                    },
                    constraints: {
                        editable: false,
                        movable: true,
                        resizable: true
                    }
                }
            ]
        },
        metadata: {
            difficulty: 'easy',
            popularity: 78,
            tags: ['통계', '데이터', '시각화', '성적'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    },
    {
        id: 'legend-story',
        name: '레전드 스토리',
        category: 'retirement',
        description: '전설적인 선수의 감동적인 이야기를 담는 스토리텔링 템플릿',
        style: {
            background: {
                type: 'gradient',
                value: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
                overlay: 'rgba(0, 0, 0, 0.2)'
            },
            border: {
                style: 'vintage',
                color: '#8e44ad',
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
                animation: 'subtle'
            }
        },
        layout: {
            type: 'portrait',
            elements: [
                {
                    id: 'legend-title',
                    type: 'text',
                    position: { x: 10, y: 5, width: 80, height: 12 },
                    style: {
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textAlign: 'center',
                        zIndex: 10
                    },
                    content: {
                        text: '레전드',
                        placeholder: '레전드 제목',
                        maxLength: 10,
                        required: true
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: false
                    }
                },
                {
                    id: 'player-photo',
                    type: 'image',
                    position: { x: 10, y: 20, width: 80, height: 40 },
                    style: {
                        opacity: 1,
                        zIndex: 5
                    },
                    content: {
                        placeholder: '선수 사진을 업로드하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'quote',
                    type: 'text',
                    position: { x: 10, y: 65, width: 80, height: 20 },
                    style: {
                        fontSize: 14,
                        fontWeight: '400',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        zIndex: 8
                    },
                    content: {
                        text: '"야구는 실패의 게임이다. 하지만 그 실패를 극복하는 것이 진정한 승리다."',
                        placeholder: '명언을 입력하세요'
                    },
                    constraints: {
                        editable: true,
                        movable: false,
                        resizable: true
                    }
                },
                {
                    id: 'crown-icon',
                    type: 'decoration',
                    position: { x: 75, y: 10, width: 20, height: 20 },
                    style: {
                        opacity: 0.9,
                        zIndex: 9
                    },
                    content: {
                        text: '👑',
                        placeholder: '왕관'
                    },
                    constraints: {
                        editable: false,
                        movable: true,
                        resizable: true
                    }
                }
            ]
        },
        metadata: {
            difficulty: 'medium',
            popularity: 91,
            tags: ['레전드', '스토리', '명언', '감동'],
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
        icon: '🥇',
        color: '#2ecc71'
    },
    mvp: {
        name: 'MVP',
        description: '최우수선수 수상의 영광',
        icon: '👑',
        color: '#f1c40f'
    },
    golden_glove: {
        name: '골든글러브',
        description: '수비 부문 최고의 영예',
        icon: '🥊',
        color: '#d35400'
    },
    fan_moment: {
        name: '팬 순간',
        description: '팬들과 함께하는 특별한 순간',
        icon: '❤️',
        color: '#e91e63'
    },
    rivalry: {
        name: '라이벌전',
        description: '라이벌 팀과의 치열한 대결',
        icon: '🔥',
        color: '#ff5722'
    },
    season_highlight: {
        name: '시즌 하이라이트',
        description: '시즌의 하이라이트 순간',
        icon: '✨',
        color: '#673ab7'
    }
};

// 유틸리티 함수들
export function getTemplateById(id: string): GloryMomentTemplate | undefined {
    return GLORY_MOMENT_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: GloryMomentCategory): GloryMomentTemplate[] {
    return TEMPLATES_BY_CATEGORY[category] || [];
}

export function getTeamById(id: string): KBOTeam | undefined {
    return KBO_TEAMS[id];
}

export function searchTemplates(query: string): GloryMomentTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return GLORY_MOMENT_TEMPLATES.filter(template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}

export function getRandomTemplate(): GloryMomentTemplate {
    const randomIndex = Math.floor(Math.random() * GLORY_MOMENT_TEMPLATES.length);
    return GLORY_MOMENT_TEMPLATES[randomIndex];
}