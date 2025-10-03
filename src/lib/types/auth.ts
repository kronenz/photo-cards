// Authentication and User Profile Types

export interface KBOTeam {
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

export interface UserGrade {
	level: 'rookie' | 'fan' | 'supporter' | 'expert' | 'legend';
	name: string;
	koreanName: string;
	points: number;
	minPoints: number;
	maxPoints: number;
	benefits: string[];
	holographicEffects: string[];
}

export interface UserStats {
	cardsCreated: number;
	totalLikes: number;
	totalViews: number;
	followers: number;
	following: number;
	gradePoints: number;
	commentsReceived: number;
	featuredCards: number;
	monthlyActive: boolean;
	joinDate: string;
	lastActive: string;
}

export interface UserPreferences {
	emailNotifications: boolean;
	pushNotifications: boolean;
	publicProfile: boolean;
	showStats: boolean;
	theme: 'light' | 'dark' | 'auto';
	language: 'ko' | 'en';
	holographicQuality: 'low' | 'medium' | 'high';
	autoSave: boolean;
}

export interface UserProfile {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatar?: string;
	bio?: string;
	location?: string;
	website?: string;
	
	// KBO Fan Information
	favoriteTeam?: KBOTeam;
	fanSince?: string;
	stadiumVisits: string[];
	favoritePlayer?: string;
	
	// Grade and Stats
	grade: UserGrade;
	stats: UserStats;
	preferences: UserPreferences;
	
	// Social
	isVerified: boolean;
	badges: string[];
	achievements: string[];
	
	// Timestamps
	created: string;
	updated: string;
}

export interface AuthSession {
	user: UserProfile;
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
}

export interface OAuthProvider {
	id: 'github' | 'google';
	name: string;
	icon: string;
	color: string;
}

export interface AuthError {
	code: string;
	message: string;
	details?: any;
}

// Grade System Constants
export const USER_GRADES: Record<UserGrade['level'], UserGrade> = {
	rookie: {
		level: 'rookie',
		name: 'Baseball Rookie',
		koreanName: '야구 입문자',
		points: 0,
		minPoints: 0,
		maxPoints: 100,
		benefits: ['기본 카드 제작', '커뮤니티 참여'],
		holographicEffects: ['basic']
	},
	fan: {
		level: 'fan',
		name: 'Outfield Fan',
		koreanName: '외야석 팬',
		points: 101,
		minPoints: 101,
		maxPoints: 500,
		benefits: ['응원가 BGM 추가', '팀 컬러 테마'],
		holographicEffects: ['basic', 'team-colors']
	},
	supporter: {
		level: 'supporter',
		name: 'Cheering Squad',
		koreanName: '응원단 멤버',
		points: 501,
		minPoints: 501,
		maxPoints: 1500,
		benefits: ['프리미엄 편집 도구', '특별 배지'],
		holographicEffects: ['basic', 'team-colors', 'premium']
	},
	expert: {
		level: 'expert',
		name: 'Season Ticket Holder',
		koreanName: '시즌권 홀더',
		points: 1501,
		minPoints: 1501,
		maxPoints: 5000,
		benefits: ['무제한 업로드', '멘토 자격', '수익 분배'],
		holographicEffects: ['basic', 'team-colors', 'premium', 'exclusive']
	},
	legend: {
		level: 'legend',
		name: 'Team Legend',
		koreanName: '구단 레전드',
		points: 5001,
		minPoints: 5001,
		maxPoints: Infinity,
		benefits: ['모든 기능', '명예의 전당', '특별 이벤트'],
		holographicEffects: ['basic', 'team-colors', 'premium', 'exclusive', 'legendary']
	}
};

export const OAUTH_PROVIDERS: OAuthProvider[] = [
	{
		id: 'github',
		name: 'GitHub',
		icon: 'github',
		color: '#333'
	},
	{
		id: 'google',
		name: 'Google',
		icon: 'google',
		color: '#4285f4'
	}
];