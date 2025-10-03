// 커뮤니티 피드 서비스
import type { 
  CommunityPost, 
  CommunityFeed, 
  FeedFilter, 
  TeamCommunity, 
  CommunityEvent,
  CommunityStats,
  PostInteraction,
  Comment
} from '$lib/types/community';
import { PostType, UserGrade, EventType } from '$lib/types/community';
import { KBO_TEAMS } from '$lib/data/kboTeams';

class CommunityService {
  private baseUrl = '/api/community';

  // 피드 조회
  async getFeed(filter: FeedFilter = {}, cursor?: string): Promise<CommunityFeed> {
    try {
      const params = new URLSearchParams();
      if (filter.teamId) params.append('teamId', filter.teamId);
      if (filter.postType) params.append('postType', filter.postType);
      if (filter.timeRange) params.append('timeRange', filter.timeRange);
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`${this.baseUrl}/feed?${params}`);
      if (!response.ok) throw new Error('Failed to fetch feed');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching community feed:', error);
      // 개발 중 목업 데이터 반환
      return this.getMockFeed(filter);
    }
  }

  // 구단별 커뮤니티 정보 조회
  async getTeamCommunity(teamId: string): Promise<TeamCommunity> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${teamId}`);
      if (!response.ok) throw new Error('Failed to fetch team community');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching team community:', error);
      return this.getMockTeamCommunity(teamId);
    }
  }

  // 포스트 생성
  async createPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'shares' | 'isLiked' | 'isBookmarked'>): Promise<CommunityPost> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // 포스트 상호작용 (좋아요, 댓글, 공유, 북마크)
  async interactWithPost(postId: string, type: 'like' | 'comment' | 'share' | 'bookmark'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (!response.ok) throw new Error('Failed to interact with post');
    } catch (error) {
      console.error('Error interacting with post:', error);
      throw error;
    }
  }

  // 댓글 조회
  async getComments(postId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // 댓글 작성
  async createComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId })
      });
      
      if (!response.ok) throw new Error('Failed to create comment');
      return await response.json();
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // 커뮤니티 통계 조회
  async getCommunityStats(teamId?: string): Promise<CommunityStats> {
    try {
      const url = teamId ? `${this.baseUrl}/stats?teamId=${teamId}` : `${this.baseUrl}/stats`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch community stats');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return this.getMockCommunityStats();
    }
  }

  // 실시간 KBO 뉴스 연동 (목업)
  async getKBONews(teamId?: string): Promise<CommunityPost[]> {
    // 실제로는 KBO 공식 API나 뉴스 API와 연동
    return this.getMockKBONews(teamId);
  }

  // 트렌딩 알고리즘 - 인기도 기반 점수 계산
  private calculateTrendingScore(post: CommunityPost): number {
    const now = new Date();
    const postAge = (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60); // 시간 단위
    
    // 시간 가중치 (최근 게시물일수록 높은 점수)
    const timeWeight = Math.max(0, 1 - (postAge / 24)); // 24시간 기준
    
    // 상호작용 점수
    const interactionScore = (post.likes * 1) + (post.comments * 2) + (post.shares * 3);
    
    // 최종 트렌딩 점수
    return interactionScore * timeWeight;
  }

  // 개인화 추천 알고리즘
  async getPersonalizedFeed(userId: string, teamPreferences: string[] = []): Promise<CommunityPost[]> {
    try {
      // 사용자 선호도 기반 필터링
      const allPosts = await this.getFeed();
      
      return allPosts.posts
        .map(post => ({
          ...post,
          personalizedScore: this.calculatePersonalizationScore(post, teamPreferences)
        }))
        .sort((a, b) => b.personalizedScore - a.personalizedScore)
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting personalized feed:', error);
      return [];
    }
  }

  private calculatePersonalizationScore(post: CommunityPost, teamPreferences: string[]): number {
    let score = this.calculateTrendingScore(post);
    
    // 선호 팀 보너스
    if (post.teamId && teamPreferences.includes(post.teamId)) {
      score *= 1.5;
    }
    
    // 포스트 타입별 가중치
    const typeWeights = {
      [PostType.CARD_SHARE]: 1.2,
      [PostType.STADIUM_VISIT]: 1.1,
      [PostType.FAN_STORY]: 1.3,
      [PostType.GAME_HIGHLIGHT]: 1.4,
      [PostType.PLAYER_SUPPORT]: 1.1,
      [PostType.TEAM_NEWS]: 1.0,
      [PostType.GENERAL]: 0.9
    };
    
    score *= typeWeights[post.type] || 1.0;
    
    return score;
  }

  // KBO 실시간 일정 연동
  async getKBOSchedule(date?: Date): Promise<KBOGameSchedule[]> {
    try {
      const targetDate = date || new Date();
      const response = await fetch(`${this.baseUrl}/kbo/schedule?date=${targetDate.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch KBO schedule');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching KBO schedule:', error);
      return this.getMockKBOSchedule(date);
    }
  }

  // 구단별 실시간 통계
  async getTeamLiveStats(teamId: string): Promise<TeamLiveStats> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/live-stats`);
      if (!response.ok) throw new Error('Failed to fetch team live stats');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching team live stats:', error);
      return this.getMockTeamLiveStats(teamId);
    }
  }

  // Featured 포스트 선정 알고리즘
  async getFeaturedPosts(teamId?: string): Promise<CommunityPost[]> {
    try {
      const filter: FeedFilter = {
        teamId,
        timeRange: 'week',
        sortBy: 'popular'
      };
      
      const feed = await this.getFeed(filter);
      
      return feed.posts
        .filter(post => post.likes >= 10 || post.comments >= 5) // 최소 상호작용 기준
        .sort((a, b) => this.calculateTrendingScore(b) - this.calculateTrendingScore(a))
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting featured posts:', error);
      return [];
    }
  }

  // 개발용 목업 데이터
  private getMockFeed(filter: FeedFilter): CommunityFeed {
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        userId: 'user1',
        userName: '야구덕후123',
        userGrade: UserGrade.CHEER_MEMBER,
        teamId: 'lg-twins',
        cardId: 'card1',
        content: '오늘 잠실에서 LG 트윈스 응원하고 왔어요! 홈런 터질 때 소름 돋았습니다 ⚾️',
        images: ['/images/stadium1.jpg'],
        type: PostType.STADIUM_VISIT,
        tags: ['LG트윈스', '잠실야구장', '직관', '홈런'],
        likes: 24,
        comments: 8,
        shares: 3,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date('2024-01-15T14:30:00'),
        updatedAt: new Date('2024-01-15T14:30:00')
      },
      {
        id: '2',
        userId: 'user2',
        userName: '베어스팬',
        userGrade: UserGrade.SEASON_HOLDER,
        teamId: 'doosan-bears',
        content: '두산 베어스 새 시즌 유니폼 너무 멋있어요! 홀로그래픽 카드로 만들어봤습니다 ✨',
        type: PostType.CARD_SHARE,
        tags: ['두산베어스', '유니폼', '홀로그래픽카드'],
        likes: 45,
        comments: 12,
        shares: 7,
        isLiked: true,
        isBookmarked: true,
        createdAt: new Date('2024-01-15T12:15:00'),
        updatedAt: new Date('2024-01-15T12:15:00')
      },
      {
        id: '3',
        userId: 'user3',
        userName: '타이거즈매니아',
        userGrade: UserGrade.TEAM_LEGEND,
        teamId: 'kia-tigers',
        content: 'KIA 타이거즈 17년 우승 그때가 그립네요... 그때 추억을 카드로 만들어봤어요 🏆',
        type: PostType.FAN_STORY,
        tags: ['KIA타이거즈', '2017우승', '추억', '챔피언'],
        likes: 89,
        comments: 23,
        shares: 15,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date('2024-01-15T10:45:00'),
        updatedAt: new Date('2024-01-15T10:45:00')
      }
    ];

    // 필터 적용
    let filteredPosts = mockPosts;
    if (filter.teamId) {
      filteredPosts = filteredPosts.filter(post => post.teamId === filter.teamId);
    }
    if (filter.postType) {
      filteredPosts = filteredPosts.filter(post => post.type === filter.postType);
    }

    return {
      posts: filteredPosts,
      hasMore: false
    };
  }

  private getMockTeamCommunity(teamId: string): TeamCommunity {
    const team = KBO_TEAMS.find(t => t.id === teamId);
    return {
      teamId,
      memberCount: Math.floor(Math.random() * 10000) + 5000,
      activeMembers: Math.floor(Math.random() * 500) + 100,
      todayPosts: Math.floor(Math.random() * 50) + 10,
      weeklyPosts: Math.floor(Math.random() * 300) + 100,
      featuredPosts: [],
      trendingTags: ['직관', '응원', '홈런', '승리', team?.name || ''],
      upcomingEvents: [
        {
          id: 'event1',
          teamId,
          title: `${team?.name} 홈경기 단체관람`,
          description: '팬클럽 회원들과 함께 응원해요!',
          type: EventType.GAME_WATCH,
          startDate: new Date('2024-01-20T18:00:00'),
          location: team?.stadium,
          participantCount: 45,
          maxParticipants: 100,
          isParticipating: false,
          tags: ['단체관람', '응원']
        }
      ]
    };
  }

  private getMockCommunityStats(): CommunityStats {
    return {
      totalMembers: 25847,
      activeToday: 1234,
      postsToday: 89,
      cardsShared: 456,
      topContributors: [
        {
          userId: 'user1',
          userName: '야구마스터',
          contributions: 234,
          grade: UserGrade.TEAM_LEGEND
        },
        {
          userId: 'user2',
          userName: '카드장인',
          contributions: 189,
          grade: UserGrade.SEASON_HOLDER
        }
      ]
    };
  }

  private getMockKBONews(teamId?: string): CommunityPost[] {
    return [
      {
        id: 'news1',
        userId: 'kbo_official',
        userName: 'KBO 공식',
        userGrade: UserGrade.TEAM_LEGEND,
        teamId: teamId || 'lg-twins',
        content: '2024 시즌 개막전 일정이 발표되었습니다! 🎉',
        type: PostType.TEAM_NEWS,
        tags: ['KBO', '개막전', '2024시즌'],
        likes: 156,
        comments: 34,
        shares: 28,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date('2024-01-15T09:00:00'),
        updatedAt: new Date('2024-01-15T09:00:00')
      }
    ];
  }

  private getMockKBOSchedule(date?: Date): KBOGameSchedule[] {
    const today = date || new Date();
    return [
      {
        id: 'game1',
        date: today,
        homeTeam: 'lg-twins',
        awayTeam: 'doosan-bears',
        stadium: '잠실야구장',
        time: '18:30',
        status: 'scheduled',
        isLive: false
      },
      {
        id: 'game2',
        date: today,
        homeTeam: 'kia-tigers',
        awayTeam: 'samsung-lions',
        stadium: '광주-기아 챔피언스 필드',
        time: '18:30',
        status: 'scheduled',
        isLive: false
      }
    ];
  }

  private getMockTeamLiveStats(teamId: string): TeamLiveStats {
    return {
      teamId,
      currentRank: Math.floor(Math.random() * 10) + 1,
      wins: Math.floor(Math.random() * 50) + 30,
      losses: Math.floor(Math.random() * 50) + 20,
      draws: Math.floor(Math.random() * 5),
      winRate: 0.600,
      recentForm: ['W', 'W', 'L', 'W', 'W'],
      nextGame: {
        opponent: 'doosan-bears',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isHome: true
      },
      topPlayers: [
        { name: '김선수', position: '내야수', avg: 0.325 },
        { name: '박투수', position: '투수', era: 2.45 }
      ]
    };
  }
}

// 추가 타입 정의
interface KBOGameSchedule {
  id: string;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  time: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  isLive: boolean;
  score?: {
    home: number;
    away: number;
  };
}

interface TeamLiveStats {
  teamId: string;
  currentRank: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  recentForm: string[]; // ['W', 'L', 'W', 'W', 'L']
  nextGame: {
    opponent: string;
    date: Date;
    isHome: boolean;
  };
  topPlayers: {
    name: string;
    position: string;
    avg?: number;
    era?: number;
  }[];
}

export const communityService = new CommunityService();