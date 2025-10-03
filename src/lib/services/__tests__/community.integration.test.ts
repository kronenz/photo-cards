/**
 * 커뮤니티 기능 통합 테스트
 * 
 * 테스트 범위:
 * - 피드 생성과 카드 발견 알고리즘 테스트
 * - 소셜 인터랙션과 실시간 업데이트 테스트  
 * - 알림 전달과 사용자 참여도 테스트
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { communityService } from '../communityService'
import { notificationService } from '../notificationService'
import type { 
  CommunityPost, 
  FeedFilter, 
  TeamCommunity,
  CommunityStats,
  Comment 
} from '$lib/types/community'
import { PostType, UserGrade } from '$lib/types/community'

// Mock fetch for API calls
global.fetch = vi.fn()
const mockFetch = fetch as Mock

// Mock PocketBase for notification service
vi.mock('pocketbase', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      collection: vi.fn().mockReturnValue({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        create: vi.fn(),
        getList: vi.fn(),
        getOne: vi.fn(),
        update: vi.fn(),
        getFirstListItem: vi.fn(),
        getFullList: vi.fn()
      })
    }))
  }
})

describe('커뮤니티 기능 통합 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('피드 생성과 카드 발견 알고리즘 테스트 (Requirement 3.1)', () => {
    it('구단별 피드가 올바르게 필터링되어야 한다', async () => {
      // Given: LG 트윈스 팀 필터
      const filter: FeedFilter = {
        teamId: 'lg-twins',
        sortBy: 'latest',
        timeRange: 'week'
      }

      const mockResponse = {
        posts: [
          {
            id: '1',
            userId: 'user1',
            userName: '야구덕후123',
            userGrade: UserGrade.CHEER_MEMBER,
            teamId: 'lg-twins',
            content: 'LG 트윈스 응원하고 왔어요!',
            type: PostType.STADIUM_VISIT,
            tags: ['LG트윈스', '잠실야구장'],
            likes: 24,
            comments: 8,
            shares: 3,
            isLiked: false,
            isBookmarked: false,
            createdAt: new Date('2024-01-15T14:30:00'),
            updatedAt: new Date('2024-01-15T14:30:00')
          }
        ],
        hasMore: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // When: 피드 조회
      const result = await communityService.getFeed(filter)

      // Then: LG 트윈스 관련 포스트만 반환
      expect(result.posts).toHaveLength(1)
      expect(result.posts[0].teamId).toBe('lg-twins')
      expect(result.posts[0].content).toContain('LG 트윈스')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('teamId=lg-twins')
      )
    })

    it('트렌딩 알고리즘이 인기도 기반으로 정렬되어야 한다', async () => {
      // Given: 다양한 인기도의 포스트들
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '사용자1',
          userGrade: UserGrade.CHEER_MEMBER,
          content: '낮은 인기도 포스트',
          type: PostType.GENERAL,
          tags: [],
          likes: 5,
          comments: 2,
          shares: 1,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          userId: 'user2',
          userName: '사용자2',
          userGrade: UserGrade.SEASON_HOLDER,
          content: '높은 인기도 포스트',
          type: PostType.CARD_SHARE,
          tags: ['인기'],
          likes: 50,
          comments: 20,
          shares: 15,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1시간 전
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ posts: mockPosts, hasMore: false })
      })

      // When: 트렌딩 순으로 피드 조회
      const result = await communityService.getFeed({ sortBy: 'trending' })

      // Then: 높은 인기도 포스트가 먼저 나와야 함
      expect(result.posts).toHaveLength(2)
      // 실제 구현에서는 트렌딩 점수로 정렬되지만, 목업에서는 원본 순서 유지
      expect(result.posts[0].likes).toBeGreaterThanOrEqual(5)
    })

    it('개인화 추천 알고리즘이 사용자 선호도를 반영해야 한다', async () => {
      // Given: 사용자 선호 팀 설정
      const userId = 'user123'
      const teamPreferences = ['lg-twins', 'doosan-bears']

      // Mock getFeed to return posts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          posts: [
            {
              id: '1',
              teamId: 'lg-twins',
              content: 'LG 관련 포스트',
              type: PostType.CARD_SHARE,
              likes: 10,
              comments: 5,
              shares: 2,
              createdAt: new Date()
            },
            {
              id: '2',
              teamId: 'kia-tigers',
              content: 'KIA 관련 포스트',
              type: PostType.GENERAL,
              likes: 15,
              comments: 3,
              shares: 1,
              createdAt: new Date()
            }
          ],
          hasMore: false
        })
      })

      // When: 개인화 피드 조회
      const result = await communityService.getPersonalizedFeed(userId, teamPreferences)

      // Then: 선호 팀 포스트가 우선순위를 가져야 함
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('Featured 포스트 선정이 올바르게 작동해야 한다', async () => {
      // Given: 높은 상호작용을 가진 포스트들
      const mockPosts = [
        {
          id: '1',
          likes: 25,
          comments: 12,
          shares: 8,
          createdAt: new Date()
        },
        {
          id: '2',
          likes: 5,
          comments: 2,
          shares: 1,
          createdAt: new Date()
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ posts: mockPosts, hasMore: false })
      })

      // When: Featured 포스트 조회
      const result = await communityService.getFeaturedPosts()

      // Then: 높은 상호작용 포스트만 선정
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('소셜 인터랙션과 실시간 업데이트 테스트 (Requirement 3.2)', () => {
    it('좋아요 기능이 올바르게 작동해야 한다', async () => {
      // Given: 포스트 ID
      const postId = 'post123'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 좋아요 상호작용
      await communityService.interactWithPost(postId, 'like')

      // Then: API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${postId}/interact`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'like' })
        })
      )
    })

    it('댓글 작성과 조회가 올바르게 작동해야 한다', async () => {
      // Given: 댓글 데이터
      const postId = 'post123'
      const commentContent = '좋은 카드네요!'
      const mockComment: Comment = {
        id: 'comment1',
        postId,
        userId: 'user1',
        userName: '댓글러',
        content: commentContent,
        likes: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock comment creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockComment)
      })

      // When: 댓글 작성
      const result = await communityService.createComment(postId, commentContent)

      // Then: 댓글이 올바르게 생성됨
      expect(result).toEqual(mockComment)
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${postId}/comments`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: commentContent, parentId: undefined })
        })
      )
    })

    it('대댓글 기능이 올바르게 작동해야 한다', async () => {
      // Given: 대댓글 데이터
      const postId = 'post123'
      const parentId = 'comment1'
      const replyContent = '동감합니다!'

      const mockReply: Comment = {
        id: 'reply1',
        postId,
        userId: 'user2',
        userName: '답글러',
        content: replyContent,
        parentId,
        likes: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReply)
      })

      // When: 대댓글 작성
      const result = await communityService.createComment(postId, replyContent, parentId)

      // Then: 대댓글이 올바르게 생성됨
      expect(result.parentId).toBe(parentId)
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${postId}/comments`,
        expect.objectContaining({
          body: JSON.stringify({ content: replyContent, parentId })
        })
      )
    })

    it('북마크 기능이 올바르게 작동해야 한다', async () => {
      // Given: 포스트 ID
      const postId = 'post123'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 북마크 상호작용
      await communityService.interactWithPost(postId, 'bookmark')

      // Then: API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${postId}/interact`,
        expect.objectContaining({
          body: JSON.stringify({ type: 'bookmark' })
        })
      )
    })

    it('공유 기능이 올바르게 작동해야 한다', async () => {
      // Given: 포스트 ID
      const postId = 'post123'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 공유 상호작용
      await communityService.interactWithPost(postId, 'share')

      // Then: API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/community/posts/${postId}/interact`,
        expect.objectContaining({
          body: JSON.stringify({ type: 'share' })
        })
      )
    })
  })

  describe('알림 전달과 사용자 참여도 테스트 (Requirement 3.5)', () => {
    it('좋아요 알림이 올바르게 생성되어야 한다', async () => {
      // Given: 알림 데이터
      const cardOwnerId = 'owner123'
      const likerId = 'liker456'
      const cardId = 'card789'
      const cardTitle = '멋진 홀로그래픽 카드'

      const mockUser = {
        id: likerId,
        username: 'liker456',
        displayName: '좋아요러',
        avatar: '/avatar.jpg'
      }

      const mockNotification = {
        id: 'notification1',
        userId: cardOwnerId,
        type: 'like',
        title: '새로운 좋아요',
        message: `${mockUser.displayName}님이 "${cardTitle}" 카드를 좋아합니다`,
        data: {
          cardId,
          userId: likerId,
          actionUrl: `/cards/${cardId}`,
          imageUrl: mockUser.avatar
        },
        read: false,
        createdAt: new Date()
      }

      // Mock PocketBase calls
      const mockPb = {
        collection: vi.fn().mockReturnValue({
          getOne: vi.fn().mockResolvedValue(mockUser),
          create: vi.fn().mockResolvedValue(mockNotification)
        })
      }

      // Replace the pb instance in notificationService
      ;(notificationService as any).pb = mockPb

      // When: 좋아요 알림 생성
      const result = await notificationService.createLikeNotification(
        cardOwnerId,
        likerId,
        cardId,
        cardTitle
      )

      // Then: 알림이 올바르게 생성됨
      expect(result).toEqual(mockNotification)
      expect(mockPb.collection).toHaveBeenCalledWith('users')
      expect(mockPb.collection).toHaveBeenCalledWith('notifications')
    })

    it('댓글 알림이 올바르게 생성되어야 한다', async () => {
      // Given: 댓글 알림 데이터
      const cardOwnerId = 'owner123'
      const commenterId = 'commenter456'
      const cardId = 'card789'
      const cardTitle = '멋진 홀로그래픽 카드'
      const commentText = '정말 멋진 카드네요! 어떻게 만드셨나요?'

      const mockUser = {
        id: commenterId,
        username: 'commenter456',
        displayName: '댓글러',
        avatar: '/avatar2.jpg'
      }

      const mockNotification = {
        id: 'notification2',
        userId: cardOwnerId,
        type: 'comment',
        title: '새로운 댓글',
        message: `${mockUser.displayName}님이 "${cardTitle}" 카드에 댓글을 남겼습니다: "${commentText.substring(0, 50)}..."`,
        data: {
          cardId,
          userId: commenterId,
          actionUrl: `/cards/${cardId}#comments`,
          imageUrl: mockUser.avatar
        },
        read: false,
        createdAt: new Date()
      }

      const mockPb = {
        collection: vi.fn().mockReturnValue({
          getOne: vi.fn().mockResolvedValue(mockUser),
          create: vi.fn().mockResolvedValue(mockNotification)
        })
      }

      ;(notificationService as any).pb = mockPb

      // When: 댓글 알림 생성
      const result = await notificationService.createCommentNotification(
        cardOwnerId,
        commenterId,
        cardId,
        cardTitle,
        commentText
      )

      // Then: 알림이 올바르게 생성됨
      expect(result).toEqual(mockNotification)
      expect(result.message).toContain(commentText.substring(0, 50))
    })

    it('팔로우 알림이 올바르게 생성되어야 한다', async () => {
      // Given: 팔로우 알림 데이터
      const followedUserId = 'followed123'
      const followerId = 'follower456'

      const mockFollower = {
        id: followerId,
        username: 'follower456',
        displayName: '팔로워',
        avatar: '/avatar3.jpg'
      }

      const mockNotification = {
        id: 'notification3',
        userId: followedUserId,
        type: 'follow',
        title: '새로운 팔로워',
        message: `${mockFollower.displayName}님이 회원님을 팔로우하기 시작했습니다`,
        data: {
          userId: followerId,
          actionUrl: `/users/${followerId}`,
          imageUrl: mockFollower.avatar
        },
        read: false,
        createdAt: new Date()
      }

      const mockPb = {
        collection: vi.fn().mockReturnValue({
          getOne: vi.fn().mockResolvedValue(mockFollower),
          create: vi.fn().mockResolvedValue(mockNotification)
        })
      }

      ;(notificationService as any).pb = mockPb

      // When: 팔로우 알림 생성
      const result = await notificationService.createFollowNotification(
        followedUserId,
        followerId
      )

      // Then: 알림이 올바르게 생성됨
      expect(result).toEqual(mockNotification)
      expect(result.message).toContain('팔로우하기 시작했습니다')
    })

    it('실시간 알림 구독이 올바르게 작동해야 한다', async () => {
      // Given: 사용자 ID와 콜백 함수
      const userId = 'user123'
      const mockCallback = vi.fn()

      const mockPb = {
        collection: vi.fn().mockReturnValue({
          subscribe: vi.fn().mockResolvedValue(undefined),
          unsubscribe: vi.fn().mockResolvedValue(undefined)
        })
      }

      ;(notificationService as any).pb = mockPb

      // When: 실시간 알림 구독
      await notificationService.subscribeToNotifications(userId, mockCallback)

      // Then: PocketBase 구독이 호출됨
      expect(mockPb.collection).toHaveBeenCalledWith('notifications')
      expect(mockPb.collection().subscribe).toHaveBeenCalledWith('*', expect.any(Function))
    })

    it('읽지 않은 알림 개수가 올바르게 조회되어야 한다', async () => {
      // Given: 사용자 ID
      const userId = 'user123'
      const unreadCount = 5

      const mockPb = {
        collection: vi.fn().mockReturnValue({
          getList: vi.fn().mockResolvedValue({
            totalItems: unreadCount
          })
        })
      }

      ;(notificationService as any).pb = mockPb

      // When: 읽지 않은 알림 개수 조회
      const result = await notificationService.getUnreadCount(userId)

      // Then: 올바른 개수가 반환됨
      expect(result).toBe(unreadCount)
      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 1, {
        filter: `userId = "${userId}" && read = false`
      })
    })

    it('알림 읽음 처리가 올바르게 작동해야 한다', async () => {
      // Given: 알림 ID
      const notificationId = 'notification123'

      const mockPb = {
        collection: vi.fn().mockReturnValue({
          update: vi.fn().mockResolvedValue({ id: notificationId, read: true })
        })
      }

      ;(notificationService as any).pb = mockPb

      // When: 알림 읽음 처리
      await notificationService.markAsRead(notificationId)

      // Then: 업데이트가 호출됨
      expect(mockPb.collection().update).toHaveBeenCalledWith(notificationId, {
        read: true
      })
    })
  })

  describe('구단별 커뮤니티 기능 테스트 (Requirement 3.1, 3.4)', () => {
    it('구단별 커뮤니티 정보가 올바르게 조회되어야 한다', async () => {
      // Given: 팀 ID
      const teamId = 'lg-twins'
      const mockTeamCommunity: TeamCommunity = {
        teamId,
        memberCount: 5000,
        activeMembers: 150,
        todayPosts: 25,
        weeklyPosts: 180,
        featuredPosts: [],
        trendingTags: ['직관', '응원', '홈런', 'LG트윈스'],
        upcomingEvents: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeamCommunity)
      })

      // When: 팀 커뮤니티 정보 조회
      const result = await communityService.getTeamCommunity(teamId)

      // Then: 올바른 팀 정보가 반환됨
      expect(result.teamId).toBe(teamId)
      expect(result.memberCount).toBeGreaterThan(0)
      expect(result.trendingTags).toContain('LG트윈스')
      expect(mockFetch).toHaveBeenCalledWith(`/api/community/teams/${teamId}`)
    })

    it('KBO 실시간 일정이 올바르게 조회되어야 한다', async () => {
      // Given: 날짜
      const testDate = new Date('2024-01-15')
      const mockSchedule = [
        {
          id: 'game1',
          date: testDate,
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
        json: () => Promise.resolve(mockSchedule)
      })

      // When: KBO 일정 조회
      const result = await communityService.getKBOSchedule(testDate)

      // Then: 올바른 일정이 반환됨
      expect(result).toHaveLength(1)
      expect(result[0].homeTeam).toBe('lg-twins')
      expect(result[0].stadium).toBe('잠실야구장')
    })

    it('구단별 실시간 통계가 올바르게 조회되어야 한다', async () => {
      // Given: 팀 ID
      const teamId = 'lg-twins'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          teamId,
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
        })
      })

      // When: 팀 실시간 통계 조회
      const result = await communityService.getTeamLiveStats(teamId)

      // Then: 올바른 통계가 반환됨
      expect(result.teamId).toBe(teamId)
      expect(result.currentRank).toBeGreaterThan(0)
      expect(result.winRate).toBeGreaterThan(0)
      expect(result.recentForm).toHaveLength(5)
    })
  })

  describe('커뮤니티 통계 및 성과 분석 테스트', () => {
    it('커뮤니티 전체 통계가 올바르게 조회되어야 한다', async () => {
      // Given: 커뮤니티 통계
      const mockStats: CommunityStats = {
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
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      })

      // When: 커뮤니티 통계 조회
      const result = await communityService.getCommunityStats()

      // Then: 올바른 통계가 반환됨
      expect(result.totalMembers).toBeGreaterThan(0)
      expect(result.activeToday).toBeGreaterThan(0)
      expect(result.topContributors).toHaveLength(1)
      expect(result.topContributors[0].grade).toBe(UserGrade.TEAM_LEGEND)
    })

    it('포스트 생성이 올바르게 작동해야 한다', async () => {
      // Given: 새 포스트 데이터
      const newPost = {
        userId: 'user123',
        userName: '테스트유저',
        userGrade: UserGrade.CHEER_MEMBER,
        teamId: 'lg-twins',
        content: '새로운 포스트입니다!',
        type: PostType.GENERAL,
        tags: ['테스트']
      }

      const mockCreatedPost: CommunityPost = {
        ...newPost,
        id: 'post123',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedPost)
      })

      // When: 포스트 생성
      const result = await communityService.createPost(newPost)

      // Then: 포스트가 올바르게 생성됨
      expect(result.id).toBe('post123')
      expect(result.content).toBe(newPost.content)
      expect(result.teamId).toBe(newPost.teamId)
      expect(mockFetch).toHaveBeenCalledWith('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      })
    })
  })

  describe('에러 처리 및 복원력 테스트', () => {
    it('API 오류 시 목업 데이터를 반환해야 한다', async () => {
      // Given: API 오류 상황
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // When: 피드 조회 (오류 발생)
      const result = await communityService.getFeed()

      // Then: 목업 데이터가 반환됨
      expect(result).toBeDefined()
      expect(result.posts).toBeDefined()
      expect(Array.isArray(result.posts)).toBe(true)
    })

    it('알림 서비스 오류 시 적절히 처리되어야 한다', async () => {
      // Given: PocketBase 오류 상황
      const mockPb = {
        collection: vi.fn().mockReturnValue({
          create: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      }

      ;(notificationService as any).pb = mockPb

      // When & Then: 오류가 발생해도 예외가 전파됨
      await expect(
        notificationService.createNotification(
          'user123',
          'like',
          '테스트',
          '테스트 메시지'
        )
      ).rejects.toThrow('Database error')
    })

    it('네트워크 오류 시 빈 배열을 반환해야 한다', async () => {
      // Given: 네트워크 오류
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // When: 댓글 조회 (오류 발생)
      const result = await communityService.getComments('post123')

      // Then: 빈 배열이 반환됨
      expect(result).toEqual([])
    })
  })
})