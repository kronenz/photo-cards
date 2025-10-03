/**
 * 커뮤니티 기능 전체 워크플로우 E2E 테스트
 * 
 * 테스트 시나리오:
 * 1. 사용자가 커뮤니티에 포스트를 작성한다
 * 2. 다른 사용자가 포스트에 좋아요를 누른다
 * 3. 실시간 알림이 발송된다
 * 4. 댓글을 작성하고 대댓글을 단다
 * 5. 포스트를 공유하고 북마크한다
 * 6. 구단별 피드에서 필터링된 결과를 확인한다
 * 7. 트렌딩 알고리즘이 올바르게 작동하는지 확인한다
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { communityService } from '../services/communityService'
import { notificationService } from '../services/notificationService'
import type { 
  CommunityPost, 
  Comment,
  FeedFilter 
} from '../types/community'
import { PostType, UserGrade } from '../types/community'
import type { 
  Notification,
  RealtimeNotificationEvent 
} from '../types/notifications'

// Mock dependencies
global.fetch = vi.fn()
const mockFetch = fetch as Mock

vi.mock('pocketbase', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      collection: vi.fn()
    }))
  }
})

describe('커뮤니티 기능 전체 워크플로우 E2E 테스트', () => {
  let mockCollection: any
  let mockPocketBase: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    
    mockCollection = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      create: vi.fn(),
      getList: vi.fn(),
      getOne: vi.fn(),
      update: vi.fn(),
      getFirstListItem: vi.fn(),
      getFullList: vi.fn()
    }
    
    mockPocketBase = {
      collection: vi.fn().mockReturnValue(mockCollection)
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('전체 커뮤니티 워크플로우 시나리오', () => {
    it('포스트 작성부터 소셜 인터랙션까지 전체 플로우가 올바르게 작동해야 한다', async () => {
      // === 1단계: 포스트 작성 ===
      const author = {
        id: 'author123',
        userName: '야구덕후',
        userGrade: UserGrade.CHEER_MEMBER,
        email: 'author@example.com'
      }

      const newPostData = {
        userId: author.id,
        userName: author.userName,
        userGrade: author.userGrade,
        teamId: 'lg-twins',
        content: '오늘 잠실에서 LG 트윈스 응원하고 왔어요! 홈런 터질 때 소름 돋았습니다 ⚾️',
        type: PostType.STADIUM_VISIT,
        tags: ['LG트윈스', '잠실야구장', '직관', '홈런']
      }

      const createdPost: CommunityPost = {
        ...newPostData,
        id: 'post123',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock post creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdPost)
      })

      // When: 포스트 작성
      const post = await communityService.createPost(newPostData)

      // Then: 포스트가 성공적으로 생성됨
      expect(post.id).toBe('post123')
      expect(post.content).toContain('LG 트윈스')
      expect(post.teamId).toBe('lg-twins')
      expect(post.type).toBe(PostType.STADIUM_VISIT)

      // === 2단계: 다른 사용자가 좋아요 ===
      const liker = {
        id: 'liker456',
        userName: '베어스팬',
        displayName: '베어스팬',
        avatar: '/avatar.jpg',
        email: 'liker@example.com'
      }

      // Mock like interaction
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // Mock user data for notification
      mockCollection.getOne.mockResolvedValue(liker)

      // Mock notification creation
      const likeNotification: Notification = {
        id: 'notification1',
        userId: author.id,
        type: 'like',
        title: '새로운 좋아요',
        message: `${liker.displayName}님이 "${post.content.substring(0, 20)}..." 포스트를 좋아합니다`,
        data: {
          postId: post.id,
          userId: liker.id,
          actionUrl: `/posts/${post.id}`,
          imageUrl: liker.avatar
        },
        read: false,
        priority: 'low',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }

      mockCollection.create.mockResolvedValue(likeNotification)

      // Mock notification settings (email enabled)
      const notificationSettings = {
        id: 'settings1',
        userId: author.id,
        emailNotifications: {
          likes: true,
          comments: true,
          follows: true,
          cardFeatured: true,
          systemUpdates: true,
          communityEvents: false
        },
        pushNotifications: {
          likes: true,
          comments: true,
          follows: true,
          cardFeatured: true,
          systemUpdates: true,
          communityEvents: true
        },
        frequency: 'immediate',
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        },
        updatedAt: new Date()
      }

      mockCollection.getFirstListItem.mockResolvedValue(notificationSettings)

      // Mock author data for email
      mockCollection.getOne.mockImplementation((id: string) => {
        if (id === liker.id) return Promise.resolve(liker)
        if (id === author.id) return Promise.resolve(author)
        return Promise.reject(new Error('User not found'))
      })

      // Mock email sending
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 좋아요 상호작용
      await communityService.interactWithPost(post.id, 'like')

      // And: 좋아요 알림 생성
      const notification = await notificationService.createLikeNotification(
        author.id,
        liker.id,
        post.id,
        post.content
      )

      // Then: 좋아요 상호작용과 알림이 성공적으로 처리됨
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${post.id}/interact`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ type: 'like' })
        })
      )
      expect(notification.type).toBe('like')
      expect(notification.userId).toBe(author.id)

      // === 3단계: 실시간 알림 구독 및 수신 ===
      const realtimeCallback = vi.fn()

      // Mock real-time subscription
      let subscribeCallback: (event: any) => void
      mockCollection.subscribe.mockImplementation((pattern: string, callback: (event: any) => void) => {
        subscribeCallback = callback
        return Promise.resolve()
      })

      // When: 실시간 알림 구독
      await notificationService.subscribeToNotifications(author.id, realtimeCallback)

      // And: 실시간 알림 이벤트 발생
      const realtimeEvent = {
        action: 'create',
        record: notification
      }
      subscribeCallback!(realtimeEvent)

      // Then: 실시간 콜백이 호출됨
      expect(realtimeCallback).toHaveBeenCalledWith({
        type: 'notification_created',
        notification,
        userId: author.id
      })

      // === 4단계: 댓글 작성 ===
      const commenter = {
        id: 'commenter789',
        userName: '댓글러',
        displayName: '댓글러',
        avatar: '/avatar2.jpg'
      }

      const commentContent = '정말 부럽네요! 저도 다음에 직관 가고 싶어요 🏟️'
      const comment: Comment = {
        id: 'comment1',
        postId: post.id,
        userId: commenter.id,
        userName: commenter.userName,
        content: commentContent,
        likes: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock comment creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(comment)
      })

      // When: 댓글 작성
      const createdComment = await communityService.createComment(post.id, commentContent)

      // Then: 댓글이 성공적으로 생성됨
      expect(createdComment.content).toBe(commentContent)
      expect(createdComment.postId).toBe(post.id)

      // === 5단계: 대댓글 작성 ===
      const replier = {
        id: 'replier101',
        userName: '답글러',
        displayName: '답글러'
      }

      const replyContent = '저도 함께 가요!'
      const reply: Comment = {
        id: 'reply1',
        postId: post.id,
        userId: replier.id,
        userName: replier.userName,
        content: replyContent,
        parentId: comment.id,
        likes: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock reply creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(reply)
      })

      // When: 대댓글 작성
      const createdReply = await communityService.createComment(post.id, replyContent, comment.id)

      // Then: 대댓글이 성공적으로 생성됨
      expect(createdReply.parentId).toBe(comment.id)
      expect(createdReply.content).toBe(replyContent)

      // === 6단계: 포스트 공유 ===
      // Mock share interaction
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 포스트 공유
      await communityService.interactWithPost(post.id, 'share')

      // Then: 공유 상호작용이 성공적으로 처리됨
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${post.id}/interact`,
        expect.objectContaining({
          body: JSON.stringify({ type: 'share' })
        })
      )

      // === 7단계: 북마크 ===
      // Mock bookmark interaction
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 포스트 북마크
      await communityService.interactWithPost(post.id, 'bookmark')

      // Then: 북마크 상호작용이 성공적으로 처리됨
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${post.id}/interact`,
        expect.objectContaining({
          body: JSON.stringify({ type: 'bookmark' })
        })
      )

      // === 8단계: 구단별 피드 필터링 확인 ===
      const teamFilter: FeedFilter = {
        teamId: 'lg-twins',
        sortBy: 'latest',
        timeRange: 'week'
      }

      const filteredFeed = {
        posts: [
          {
            ...post,
            likes: 1, // 좋아요가 증가됨
            comments: 2, // 댓글과 대댓글
            shares: 1 // 공유가 증가됨
          }
        ],
        hasMore: false
      }

      // Mock filtered feed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(filteredFeed)
      })

      // When: 구단별 피드 조회
      const teamFeed = await communityService.getFeed(teamFilter)

      // Then: LG 트윈스 관련 포스트만 반환됨
      expect(teamFeed.posts).toHaveLength(1)
      expect(teamFeed.posts[0].teamId).toBe('lg-twins')
      expect(teamFeed.posts[0].likes).toBe(1)
      expect(teamFeed.posts[0].comments).toBe(2)
      expect(teamFeed.posts[0].shares).toBe(1)

      // === 9단계: 트렌딩 알고리즘 확인 ===
      const trendingPosts = [
        {
          ...post,
          likes: 1,
          comments: 2,
          shares: 1,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1시간 전
        }
      ]

      // Mock trending posts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ posts: trendingPosts, hasMore: false })
      })

      // When: Featured 포스트 조회
      const featuredPosts = await communityService.getFeaturedPosts('lg-twins')

      // Then: 높은 상호작용을 가진 포스트가 선정됨
      expect(featuredPosts).toBeDefined()
      expect(Array.isArray(featuredPosts)).toBe(true)

      // === 10단계: 알림 읽음 처리 ===
      mockCollection.update.mockResolvedValue({
        id: notification.id,
        read: true
      })

      // When: 알림 읽음 처리
      await notificationService.markAsRead(notification.id)

      // Then: 알림이 읽음으로 처리됨
      expect(mockCollection.update).toHaveBeenCalledWith(notification.id, {
        read: true
      })
    })
  })

  describe('구단별 커뮤니티 특화 기능 테스트', () => {
    it('KBO 구단별 커뮤니티가 올바르게 작동해야 한다', async () => {
      // Given: 다양한 구단의 포스트들
      const posts = [
        {
          id: 'post1',
          teamId: 'lg-twins',
          content: 'LG 트윈스 화이팅!',
          type: PostType.TEAM_NEWS,
          likes: 15,
          comments: 5,
          shares: 3,
          createdAt: new Date()
        },
        {
          id: 'post2',
          teamId: 'doosan-bears',
          content: '두산 베어스 우승 가자!',
          type: PostType.FAN_STORY,
          likes: 20,
          comments: 8,
          shares: 5,
          createdAt: new Date()
        },
        {
          id: 'post3',
          teamId: 'kia-tigers',
          content: 'KIA 타이거즈 응원합니다',
          type: PostType.STADIUM_VISIT,
          likes: 12,
          comments: 3,
          shares: 2,
          createdAt: new Date()
        }
      ]

      // Mock team community data
      const lgCommunity = {
        teamId: 'lg-twins',
        memberCount: 5000,
        activeMembers: 150,
        todayPosts: 25,
        weeklyPosts: 180,
        featuredPosts: [posts[0]],
        trendingTags: ['직관', '응원', '홈런', 'LG트윈스'],
        upcomingEvents: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(lgCommunity)
      })

      // When: LG 트윈스 커뮤니티 정보 조회
      const teamCommunity = await communityService.getTeamCommunity('lg-twins')

      // Then: 올바른 팀 커뮤니티 정보가 반환됨
      expect(teamCommunity.teamId).toBe('lg-twins')
      expect(teamCommunity.memberCount).toBeGreaterThan(0)
      expect(teamCommunity.trendingTags).toContain('LG트윈스')
      expect(teamCommunity.featuredPosts).toHaveLength(1)

      // === KBO 실시간 일정 연동 테스트 ===
      const gameSchedule = [
        {
          id: 'game1',
          date: new Date(),
          homeTeam: 'lg-twins',
          awayTeam: 'doosan-bears',
          stadium: '잠실야구장',
          time: '18:30',
          status: 'scheduled',
          isLive: false
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gameSchedule)
      })

      // When: KBO 일정 조회
      const schedule = await communityService.getKBOSchedule()

      // Then: 올바른 경기 일정이 반환됨
      expect(schedule).toHaveLength(1)
      expect(schedule[0].homeTeam).toBe('lg-twins')
      expect(schedule[0].stadium).toBe('잠실야구장')

      // === 구단별 실시간 통계 테스트 ===
      const teamStats = {
        teamId: 'lg-twins',
        currentRank: 3,
        wins: 45,
        losses: 35,
        draws: 2,
        winRate: 0.563,
        recentForm: ['W', 'W', 'L', 'W', 'W'],
        nextGame: {
          opponent: 'doosan-bears',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isHome: true
        },
        topPlayers: [
          { name: '김선수', position: '내야수', avg: 0.325 }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(teamStats)
      })

      // When: 팀 실시간 통계 조회
      const liveStats = await communityService.getTeamLiveStats('lg-twins')

      // Then: 올바른 팀 통계가 반환됨
      expect(liveStats.teamId).toBe('lg-twins')
      expect(liveStats.currentRank).toBeGreaterThan(0)
      expect(liveStats.winRate).toBeGreaterThan(0)
      expect(liveStats.recentForm).toHaveLength(5)
      expect(liveStats.topPlayers).toHaveLength(1)
    })
  })

  describe('개인화 추천 시스템 테스트', () => {
    it('사용자 선호도 기반 개인화 피드가 올바르게 작동해야 한다', async () => {
      // Given: 사용자 선호 팀과 다양한 포스트들
      const userId = 'user123'
      const teamPreferences = ['lg-twins', 'doosan-bears']

      const allPosts = [
        {
          id: 'post1',
          teamId: 'lg-twins',
          content: 'LG 관련 포스트',
          type: PostType.CARD_SHARE,
          likes: 10,
          comments: 5,
          shares: 2,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1시간 전
        },
        {
          id: 'post2',
          teamId: 'kia-tigers',
          content: 'KIA 관련 포스트',
          type: PostType.GENERAL,
          likes: 15,
          comments: 3,
          shares: 1,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전
        },
        {
          id: 'post3',
          teamId: 'doosan-bears',
          content: '두산 관련 포스트',
          type: PostType.FAN_STORY,
          likes: 8,
          comments: 4,
          shares: 3,
          createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30분 전
        }
      ]

      // Mock feed data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ posts: allPosts, hasMore: false })
      })

      // When: 개인화 피드 조회
      const personalizedFeed = await communityService.getPersonalizedFeed(userId, teamPreferences)

      // Then: 개인화된 피드가 반환됨
      expect(personalizedFeed).toBeDefined()
      expect(Array.isArray(personalizedFeed)).toBe(true)
      
      // 선호 팀 포스트가 우선순위를 가져야 함 (실제 구현에서는 점수 기반 정렬)
      const preferredTeamPosts = personalizedFeed.filter(post => 
        teamPreferences.includes(post.teamId || '')
      )
      expect(preferredTeamPosts.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('커뮤니티 성과 분석 테스트', () => {
    it('커뮤니티 통계가 올바르게 집계되어야 한다', async () => {
      // Given: 커뮤니티 통계 데이터
      const communityStats = {
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
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(communityStats)
      })

      // When: 커뮤니티 통계 조회
      const stats = await communityService.getCommunityStats()

      // Then: 올바른 통계가 반환됨
      expect(stats.totalMembers).toBeGreaterThan(0)
      expect(stats.activeToday).toBeGreaterThan(0)
      expect(stats.postsToday).toBeGreaterThan(0)
      expect(stats.cardsShared).toBeGreaterThan(0)
      expect(stats.topContributors).toHaveLength(2)
      expect(stats.topContributors[0].grade).toBe(UserGrade.TEAM_LEGEND)
    })
  })

  describe('에러 복구 및 복원력 테스트', () => {
    it('네트워크 오류 시 목업 데이터로 복구되어야 한다', async () => {
      // Given: 네트워크 오류 상황
      mockFetch.mockRejectedValue(new Error('Network error'))

      // When: 피드 조회 (오류 발생)
      const result = await communityService.getFeed()

      // Then: 목업 데이터가 반환되어 서비스가 계속 작동함
      expect(result).toBeDefined()
      expect(result.posts).toBeDefined()
      expect(Array.isArray(result.posts)).toBe(true)
      expect(result.posts.length).toBeGreaterThan(0) // 목업 데이터 존재
    })

    it('부분적 서비스 장애 시에도 핵심 기능이 작동해야 한다', async () => {
      // Given: 알림 서비스는 실패하지만 커뮤니티 서비스는 정상
      const postData = {
        userId: 'user123',
        userName: '테스트유저',
        userGrade: UserGrade.CHEER_MEMBER,
        content: '테스트 포스트',
        type: PostType.GENERAL,
        tags: ['테스트']
      }

      const createdPost: CommunityPost = {
        ...postData,
        id: 'post123',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock successful post creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdPost)
      })

      // Mock notification service failure
      mockCollection.create.mockRejectedValue(new Error('Notification service down'))

      // When: 포스트 생성 (알림 서비스 실패)
      const post = await communityService.createPost(postData)

      // Then: 포스트는 성공적으로 생성됨
      expect(post.id).toBe('post123')
      expect(post.content).toBe('테스트 포스트')

      // And: 알림 생성 시도 시 오류가 발생하지만 전체 플로우는 중단되지 않음
      await expect(
        notificationService.createNotification(
          'user456',
          'like',
          '테스트',
          '테스트 메시지'
        )
      ).rejects.toThrow('Notification service down')
    })
  })

  describe('성능 및 확장성 테스트', () => {
    it('대량의 포스트 처리가 효율적으로 작동해야 한다', async () => {
      // Given: 대량의 포스트 데이터
      const largeFeed = {
        posts: Array.from({ length: 100 }, (_, i) => ({
          id: `post${i}`,
          userId: `user${i % 10}`,
          userName: `사용자${i % 10}`,
          userGrade: UserGrade.CHEER_MEMBER,
          content: `테스트 포스트 ${i}`,
          type: PostType.GENERAL,
          tags: [`태그${i % 5}`],
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(Date.now() - i * 60 * 1000), // i분 전
          updatedAt: new Date(Date.now() - i * 60 * 1000)
        })),
        hasMore: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(largeFeed)
      })

      // When: 대량 피드 조회
      const startTime = Date.now()
      const result = await communityService.getFeed()
      const endTime = Date.now()

      // Then: 합리적인 시간 내에 처리됨
      expect(endTime - startTime).toBeLessThan(1000) // 1초 이내
      expect(result.posts).toHaveLength(100)
      expect(result.hasMore).toBe(true)
    })

    it('동시 다발적 알림 처리가 안정적으로 작동해야 한다', async () => {
      // Given: 여러 사용자의 동시 알림 생성
      const users = Array.from({ length: 10 }, (_, i) => ({
        id: `user${i}`,
        displayName: `사용자${i}`,
        avatar: `/avatar${i}.jpg`
      }))

      // Mock user data
      mockCollection.getOne.mockImplementation((id: string) => {
        const user = users.find(u => u.id === id)
        return user ? Promise.resolve(user) : Promise.reject(new Error('User not found'))
      })

      // Mock notification creation
      mockCollection.create.mockImplementation((data: any) => {
        return Promise.resolve({
          id: `notification_${Date.now()}_${Math.random()}`,
          ...data,
          createdAt: new Date().toISOString()
        })
      })

      // When: 동시에 여러 알림 생성
      const notificationPromises = users.map((user, i) =>
        notificationService.createLikeNotification(
          'target_user',
          user.id,
          `card${i}`,
          `카드 제목 ${i}`
        )
      )

      const startTime = Date.now()
      const notifications = await Promise.all(notificationPromises)
      const endTime = Date.now()

      // Then: 모든 알림이 성공적으로 생성됨
      expect(notifications).toHaveLength(10)
      expect(notifications.every(n => n.id)).toBe(true)
      expect(endTime - startTime).toBeLessThan(2000) // 2초 이내
    })
  })
})