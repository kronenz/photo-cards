// 커뮤니티 피드 관련 타입 정의

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userGrade: UserGrade;
  teamId?: string; // KBO 구단 ID
  cardId?: string; // 연관된 카드 ID
  content: string;
  images?: string[];
  type: PostType;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostType {
  CARD_SHARE = 'card_share',
  GAME_HIGHLIGHT = 'game_highlight',
  STADIUM_VISIT = 'stadium_visit',
  PLAYER_SUPPORT = 'player_support',
  TEAM_NEWS = 'team_news',
  FAN_STORY = 'fan_story',
  GENERAL = 'general'
}

export enum UserGrade {
  ROOKIE = '야구 입문자',
  OUTFIELD_FAN = '외야석 팬',
  CHEER_MEMBER = '응원단 멤버',
  SEASON_HOLDER = '시즌권 홀더',
  TEAM_LEGEND = '구단 레전드'
}

export interface CommunityFeed {
  posts: CommunityPost[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface FeedFilter {
  teamId?: string;
  postType?: PostType;
  timeRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'latest' | 'popular' | 'trending';
}

export interface TeamCommunity {
  teamId: string;
  memberCount: number;
  activeMembers: number;
  todayPosts: number;
  weeklyPosts: number;
  featuredPosts: CommunityPost[];
  trendingTags: string[];
  upcomingEvents: CommunityEvent[];
}

export enum EventType {
  GAME_WATCH = 'game_watch',
  CARD_CONTEST = 'card_contest',
  FAN_MEETUP = 'fan_meetup',
  STADIUM_TOUR = 'stadium_tour',
  PLAYER_EVENT = 'player_event',
  SEASON_EVENT = 'season_event'
}

export interface CommunityEvent {
  id: string;
  teamId: string;
  title: string;
  description: string;
  type: EventType;
  startDate: Date;
  endDate?: Date;
  location?: string;
  participantCount: number;
  maxParticipants?: number;
  isParticipating: boolean;
  tags: string[];
}

export interface CommunityStats {
  totalMembers: number;
  activeToday: number;
  postsToday: number;
  cardsShared: number;
  topContributors: {
    userId: string;
    userName: string;
    contributions: number;
    grade: UserGrade;
  }[];
}

export interface PostInteraction {
  postId: string;
  type: 'like' | 'comment' | 'share' | 'bookmark';
  userId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  parentId?: string; // 대댓글용
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}