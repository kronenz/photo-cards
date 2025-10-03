/**
 * 알림 시스템 통합 테스트
 * 
 * 테스트 범위:
 * - PocketBase WebSocket 실시간 구독 시스템 테스트
 * - 좋아요, 댓글, 팔로우 즉시 알림 테스트
 * - 이메일 알림 통합 테스트
 * - Apple 스타일 알림 센터 UI 테스트
 * - 사용자 맞춤 알림 설정과 필터링 테스트
 * 
 * Requirements: 3.5
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { notificationService } from '../notificationService'
import type { 
  Notification, 
  NotificationSettings, 
  NotificationType,
  RealtimeNotificationEvent 
} from '$lib/types/notifications'

// Mock PocketBase
vi.mock('pocketbase', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      collection: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn()
    }))
  }
})

// Mock fetch for email API
global.fetch = vi.fn()
const mockFetch = fetch as Mock

describe('알림 시스템 통합 테스트', () => {
  let mockCollection: any
  let mockPocketBase: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    
    // Mock collection methods
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

  describe('PocketBase WebSocket 실시간 구독 시스템 테스트', () => {
    it('실시간 알림 구독이 올바르게 설정되어야 한다', async () => {
      // Given: 사용자 ID와 콜백 함수
      const userId = 'user123'
      const mockCallback = vi.fn()

      mockCollection.subscribe.mockResolvedValue(undefined)

      // When: 실시간 알림 구독
      await notificationService.subscribeToNotifications(userId, mockCallback)

      // Then: PocketBase 구독이 설정되어야 함
      expect(mockPocketBase.collection).toHaveBeenCalledWith('notifications')
      expect(mockCollection.subscribe).toHaveBeenCalledWith('*', expect.any(Function))
    })

    it('실시간 알림 이벤트가 올바르게 처리되어야 한다', async () => {
      // Given: 구독된 사용자와 알림 이벤트
      const userId = 'user123'
      const mockCallback = vi.fn()
      const mockNotification: Notification = {
        id: 'notification1',
        userId,
        type: 'like',
        title: '새로운 좋아요',
        message: '누군가 회원님의 카드를 좋아합니다',
        data: { cardId: 'card123' },
        read: false,
        priority: 'normal',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }

      // Mock subscribe callback
      let subscribeCallback: (event: any) => void
      mockCollection.subscribe.mockImplementation((pattern: string, callback: (event: any) => void) => {
        subscribeCallback = callback
        return Promise.resolve()
      })

      await notificationService.subscribeToNotifications(userId, mockCallback)

      // When: 실시간 알림 이벤트 발생
      const mockEvent = {
        action: 'create',
        record: mockNotification
      }
      subscribeCallback!(mockEvent)

      // Then: 콜백이 올바른 이벤트와 함께 호출되어야 함
      expect(mockCallback).toHaveBeenCalledWith({
        type: 'notification_created',
        notification: mockNotification,
        userId
      })
    })

    it('다른 사용자의 알림은 필터링되어야 한다', async () => {
      // Given: 구독된 사용자와 다른 사용자의 알림
      const userId = 'user123'
      const otherUserId = 'user456'
      const mockCallback = vi.fn()

      let subscribeCallback: (event: any) => void
      mockCollection.subscribe.mockImplementation((pattern: string, callback: (event: any) => void) => {
        subscribeCallback = callback
        return Promise.resolve()
      })

      await notificationService.subscribeToNotifications(userId, mockCallback)

      // When: 다른 사용자의 알림 이벤트 발생
      const mockEvent = {
        action: 'create',
        record: {
          id: 'notification1',
          userId: otherUserId, // 다른 사용자
          type: 'like',
          title: '다른 사용자 알림'
        }
      }
      subscribeCallback!(mockEvent)

      // Then: 콜백이 호출되지 않아야 함
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('구독 해제가 올바르게 작동해야 한다', async () => {
      // Given: 구독된 사용자
      const userId = 'user123'
      mockCollection.unsubscribe.mockResolvedValue(undefined)

      // When: 구독 해제
      await notificationService.unsubscribeFromNotifications(userId)

      // Then: PocketBase 구독 해제가 호출되어야 함
      expect(mockCollection.unsubscribe).toHaveBeenCalled()
    })
  })

  describe('좋아요, 댓글, 팔로우 즉시 알림 테스트', () => {
    it('좋아요 알림이 올바르게 생성되어야 한다', async () => {
      // Given: 좋아요 알림 데이터
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
        data: JSON.stringify({
          cardId,
          userId: likerId,
          actionUrl: `/cards/${cardId}`,
          imageUrl: mockUser.avatar
        }),
        read: false,
        priority: 'low',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      mockCollection.getOne.mockResolvedValue(mockUser)
      mockCollection.create.mockResolvedValue(mockNotification)

      // Mock email sending
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 좋아요 알림 생성
      const result = await notificationService.createLikeNotification(
        cardOwnerId,
        likerId,
        cardId,
        cardTitle
      )

      // Then: 알림이 올바르게 생성되어야 함
      expect(mockCollection.getOne).toHaveBeenCalledWith(likerId)
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: cardOwnerId,
          type: 'like',
          title: '새로운 좋아요',
          priority: 'low'
        })
      )
      expect(result).toEqual(mockNotification)
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
        data: JSON.stringify({
          cardId,
          userId: commenterId,
          actionUrl: `/cards/${cardId}#comments`,
          imageUrl: mockUser.avatar
        }),
        read: false,
        priority: 'normal',
        createdAt: new Date().toISOString()
      }

      mockCollection.getOne.mockResolvedValue(mockUser)
      mockCollection.create.mockResolvedValue(mockNotification)

      // When: 댓글 알림 생성
      const result = await notificationService.createCommentNotification(
        cardOwnerId,
        commenterId,
        cardId,
        cardTitle,
        commentText
      )

      // Then: 알림이 올바르게 생성되어야 함
      expect(result.type).toBe('comment')
      expect(result.message).toContain(commentText.substring(0, 50))
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'comment',
          priority: 'normal'
        })
      )
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
        data: JSON.stringify({
          userId: followerId,
          actionUrl: `/users/${followerId}`,
          imageUrl: mockFollower.avatar
        }),
        read: false,
        priority: 'normal',
        createdAt: new Date().toISOString()
      }

      mockCollection.getOne.mockResolvedValue(mockFollower)
      mockCollection.create.mockResolvedValue(mockNotification)

      // When: 팔로우 알림 생성
      const result = await notificationService.createFollowNotification(
        followedUserId,
        followerId
      )

      // Then: 알림이 올바르게 생성되어야 함
      expect(result.type).toBe('follow')
      expect(result.message).toContain('팔로우하기 시작했습니다')
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'follow',
          priority: 'normal'
        })
      )
    })

    it('시스템 알림이 높은 우선순위로 생성되어야 한다', async () => {
      // Given: 시스템 알림 데이터
      const userId = 'user123'
      const title = '시스템 업데이트'
      const message = '새로운 기능이 추가되었습니다'

      const mockNotification = {
        id: 'notification4',
        userId,
        type: 'system',
        title,
        message,
        data: JSON.stringify({}),
        read: false,
        priority: 'urgent',
        createdAt: new Date().toISOString(),
        expiresAt: undefined // 시스템 알림은 만료되지 않음
      }

      mockCollection.create.mockResolvedValue(mockNotification)

      // When: 시스템 알림 생성
      const result = await notificationService.createNotification(
        userId,
        'system',
        title,
        message
      )

      // Then: 높은 우선순위로 생성되어야 함
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'urgent',
          expiresAt: undefined
        })
      )
    })
  })

  describe('이메일 알림 통합 테스트', () => {
    it('이메일 알림이 설정에 따라 발송되어야 한다', async () => {
      // Given: 이메일 알림이 활성화된 사용자
      const userId = 'user123'
      const userEmail = 'user@example.com'

      const mockUser = {
        id: userId,
        email: userEmail,
        displayName: '테스트 사용자'
      }

      const mockSettings: NotificationSettings = {
        id: 'settings1',
        userId,
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

      const mockNotification = {
        id: 'notification1',
        userId,
        type: 'like',
        title: '새로운 좋아요',
        message: '누군가 회원님의 카드를 좋아합니다',
        data: JSON.stringify({}),
        read: false,
        priority: 'low',
        createdAt: new Date().toISOString()
      }

      mockCollection.getOne.mockResolvedValue(mockUser)
      mockCollection.getFirstListItem.mockResolvedValue(mockSettings)
      mockCollection.create.mockResolvedValue(mockNotification)

      // Mock successful email sending
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 좋아요 알림 생성 (이메일 발송 포함)
      await notificationService.createNotification(
        userId,
        'like',
        '새로운 좋아요',
        '누군가 회원님의 카드를 좋아합니다'
      )

      // Then: 이메일 API가 호출되어야 함
      expect(mockFetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: userEmail,
          subject: '새로운 좋아요',
          html: expect.stringContaining('홀로그래픽 카드 커뮤니티')
        })
      })
    })

    it('이메일 알림이 비활성화된 경우 발송되지 않아야 한다', async () => {
      // Given: 이메일 알림이 비활성화된 사용자
      const userId = 'user123'

      const mockSettings: NotificationSettings = {
        id: 'settings1',
        userId,
        emailNotifications: {
          likes: false, // 좋아요 이메일 알림 비활성화
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

      const mockNotification = {
        id: 'notification1',
        userId,
        type: 'like',
        title: '새로운 좋아요',
        message: '누군가 회원님의 카드를 좋아합니다',
        data: JSON.stringify({}),
        read: false,
        priority: 'low',
        createdAt: new Date().toISOString()
      }

      mockCollection.getFirstListItem.mockResolvedValue(mockSettings)
      mockCollection.create.mockResolvedValue(mockNotification)

      // When: 좋아요 알림 생성
      await notificationService.createNotification(
        userId,
        'like',
        '새로운 좋아요',
        '누군가 회원님의 카드를 좋아합니다'
      )

      // Then: 이메일 API가 호출되지 않아야 함
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('이메일 템플릿이 올바르게 생성되어야 한다', async () => {
      // Given: 알림 데이터
      const userId = 'user123'
      const userEmail = 'user@example.com'

      const mockUser = {
        id: userId,
        email: userEmail,
        displayName: '테스트 사용자'
      }

      const mockSettings: NotificationSettings = {
        id: 'settings1',
        userId,
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

      const mockNotification = {
        id: 'notification1',
        userId,
        type: 'comment',
        title: '새로운 댓글',
        message: '누군가 회원님의 카드에 댓글을 남겼습니다',
        data: JSON.stringify({
          actionUrl: '/cards/123'
        }),
        read: false,
        priority: 'normal',
        createdAt: new Date().toISOString()
      }

      mockCollection.getOne.mockResolvedValue(mockUser)
      mockCollection.getFirstListItem.mockResolvedValue(mockSettings)
      mockCollection.create.mockResolvedValue(mockNotification)

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      // When: 댓글 알림 생성
      await notificationService.createNotification(
        userId,
        'comment',
        '새로운 댓글',
        '누군가 회원님의 카드에 댓글을 남겼습니다',
        { actionUrl: '/cards/123' }
      )

      // Then: 이메일 템플릿에 필요한 요소들이 포함되어야 함
      const emailCall = mockFetch.mock.calls.find(call => 
        call[0] === '/api/send-email'
      )
      expect(emailCall).toBeDefined()
      
      const emailBody = JSON.parse(emailCall![1].body)
      expect(emailBody.html).toContain('홀로그래픽 카드 커뮤니티')
      expect(emailBody.html).toContain('새로운 댓글')
      expect(emailBody.html).toContain('확인하기')
      expect(emailBody.html).toContain('알림 설정')
    })
  })

  describe('알림 조회 및 관리 테스트', () => {
    it('사용자 알림 목록이 올바르게 조회되어야 한다', async () => {
      // Given: 사용자 알림 데이터
      const userId = 'user123'
      const mockNotifications = [
        {
          id: 'notification1',
          userId,
          type: 'like',
          title: '새로운 좋아요',
          message: '누군가 회원님의 카드를 좋아합니다',
          data: '{"cardId": "card123"}',
          read: false,
          created: new Date().toISOString()
        },
        {
          id: 'notification2',
          userId,
          type: 'comment',
          title: '새로운 댓글',
          message: '누군가 회원님의 카드에 댓글을 남겼습니다',
          data: '{"cardId": "card456"}',
          read: true,
          created: new Date().toISOString()
        }
      ]

      mockCollection.getList.mockResolvedValue({
        items: mockNotifications,
        totalItems: 2,
        totalPages: 1,
        page: 1,
        perPage: 20
      })

      // When: 알림 목록 조회
      const result = await notificationService.getNotifications(userId)

      // Then: 올바른 알림 목록이 반환되어야 함
      expect(result).toHaveLength(2)
      expect(result[0].data).toEqual({ cardId: 'card123' }) // JSON 파싱 확인
      expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
        filter: `userId = "${userId}"`,
        sort: '-created'
      })
    })

    it('읽지 않은 알림 개수가 올바르게 조회되어야 한다', async () => {
      // Given: 읽지 않은 알림이 있는 사용자
      const userId = 'user123'
      const unreadCount = 5

      mockCollection.getList.mockResolvedValue({
        totalItems: unreadCount
      })

      // When: 읽지 않은 알림 개수 조회
      const result = await notificationService.getUnreadCount(userId)

      // Then: 올바른 개수가 반환되어야 함
      expect(result).toBe(unreadCount)
      expect(mockCollection.getList).toHaveBeenCalledWith(1, 1, {
        filter: `userId = "${userId}" && read = false`
      })
    })

    it('알림 읽음 처리가 올바르게 작동해야 한다', async () => {
      // Given: 읽지 않은 알림
      const notificationId = 'notification123'

      mockCollection.update.mockResolvedValue({
        id: notificationId,
        read: true
      })

      // When: 알림 읽음 처리
      await notificationService.markAsRead(notificationId)

      // Then: 업데이트가 호출되어야 함
      expect(mockCollection.update).toHaveBeenCalledWith(notificationId, {
        read: true
      })
    })

    it('모든 알림 읽음 처리가 올바르게 작동해야 한다', async () => {
      // Given: 읽지 않은 알림들이 있는 사용자
      const userId = 'user123'
      const unreadNotifications = [
        { id: 'notification1', read: false },
        { id: 'notification2', read: false },
        { id: 'notification3', read: false }
      ]

      mockCollection.getFullList.mockResolvedValue(unreadNotifications)
      mockCollection.update.mockResolvedValue({ read: true })

      // When: 모든 알림 읽음 처리
      await notificationService.markAllAsRead(userId)

      // Then: 모든 알림에 대해 업데이트가 호출되어야 함
      expect(mockCollection.getFullList).toHaveBeenCalledWith({
        filter: `userId = "${userId}" && read = false`
      })
      expect(mockCollection.update).toHaveBeenCalledTimes(3)
      expect(mockCollection.update).toHaveBeenCalledWith('notification1', { read: true })
      expect(mockCollection.update).toHaveBeenCalledWith('notification2', { read: true })
      expect(mockCollection.update).toHaveBeenCalledWith('notification3', { read: true })
    })
  })

  describe('사용자 맞춤 알림 설정과 필터링 테스트', () => {
    it('알림 설정이 올바르게 조회되어야 한다', async () => {
      // Given: 사용자 알림 설정
      const userId = 'user123'
      const mockSettings: NotificationSettings = {
        id: 'settings1',
        userId,
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
          enabled: true,
          startTime: '22:00',
          endTime: '08:00'
        },
        updatedAt: new Date()
      }

      mockCollection.getFirstListItem.mockResolvedValue(mockSettings)

      // When: 알림 설정 조회
      const result = await notificationService.getNotificationSettings(userId)

      // Then: 올바른 설정이 반환되어야 함
      expect(result).toEqual(mockSettings)
      expect(mockCollection.getFirstListItem).toHaveBeenCalledWith(
        `userId = "${userId}"`
      )
    })

    it('알림 설정이 없는 경우 기본 설정이 생성되어야 한다', async () => {
      // Given: 알림 설정이 없는 사용자
      const userId = 'user123'

      mockCollection.getFirstListItem.mockRejectedValue(new Error('Not found'))
      mockCollection.create.mockResolvedValue({
        id: 'settings1',
        userId,
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
        updatedAt: new Date().toISOString()
      })

      // When: 알림 설정 조회 (기본 설정 생성)
      const result = await notificationService.getNotificationSettings(userId)

      // Then: 기본 설정이 생성되고 반환되어야 함
      expect(result).toBeDefined()
      expect(result!.userId).toBe(userId)
      expect(result!.emailNotifications.likes).toBe(true)
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          frequency: 'immediate'
        })
      )
    })

    it('알림 설정 업데이트가 올바르게 작동해야 한다', async () => {
      // Given: 기존 알림 설정과 업데이트할 설정
      const userId = 'user123'
      const existingSettings: NotificationSettings = {
        id: 'settings1',
        userId,
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

      const updateData = {
        emailNotifications: {
          ...existingSettings.emailNotifications,
          likes: false // 좋아요 이메일 알림 비활성화
        },
        quietHours: {
          enabled: true,
          startTime: '23:00',
          endTime: '07:00'
        }
      }

      mockCollection.getFirstListItem.mockResolvedValue(existingSettings)
      mockCollection.update.mockResolvedValue({
        ...existingSettings,
        ...updateData,
        updatedAt: new Date().toISOString()
      })

      // When: 알림 설정 업데이트
      const result = await notificationService.updateNotificationSettings(userId, updateData)

      // Then: 설정이 올바르게 업데이트되어야 함
      expect(mockCollection.update).toHaveBeenCalledWith('settings1', {
        ...updateData,
        updatedAt: expect.any(String)
      })
      expect(result.emailNotifications.likes).toBe(false)
      expect(result.quietHours.enabled).toBe(true)
    })
  })

  describe('에러 처리 및 복원력 테스트', () => {
    it('PocketBase 연결 오류 시 적절히 처리되어야 한다', async () => {
      // Given: PocketBase 연결 오류
      mockCollection.create.mockRejectedValue(new Error('Connection failed'))

      // When & Then: 오류가 적절히 전파되어야 함
      await expect(
        notificationService.createNotification(
          'user123',
          'like',
          '테스트',
          '테스트 메시지'
        )
      ).rejects.toThrow('Connection failed')
    })

    it('이메일 발송 실패 시 알림 생성은 성공해야 한다', async () => {
      // Given: 이메일 발송 실패 상황
      const userId = 'user123'
      const mockUser = {
        id: userId,
        email: 'user@example.com'
      }

      const mockSettings: NotificationSettings = {
        id: 'settings1',
        userId,
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

      const mockNotification = {
        id: 'notification1',
        userId,
        type: 'like',
        title: '새로운 좋아요',
        message: '테스트 메시지',
        data: JSON.stringify({}),
        read: false,
        priority: 'low',
        createdAt: new Date().toISOString()
      }

      mockCollection.getOne.mockResolvedValue(mockUser)
      mockCollection.getFirstListItem.mockResolvedValue(mockSettings)
      mockCollection.create.mockResolvedValue(mockNotification)

      // Mock email sending failure
      mockFetch.mockRejectedValue(new Error('Email service unavailable'))

      // When: 알림 생성 (이메일 발송 실패)
      const result = await notificationService.createNotification(
        userId,
        'like',
        '새로운 좋아요',
        '테스트 메시지'
      )

      // Then: 알림은 성공적으로 생성되어야 함
      expect(result).toEqual(mockNotification)
      expect(mockCollection.create).toHaveBeenCalled()
    })

    it('읽지 않은 알림 개수 조회 실패 시 0을 반환해야 한다', async () => {
      // Given: 데이터베이스 오류
      const userId = 'user123'
      mockCollection.getList.mockRejectedValue(new Error('Database error'))

      // When: 읽지 않은 알림 개수 조회
      const result = await notificationService.getUnreadCount(userId)

      // Then: 0이 반환되어야 함
      expect(result).toBe(0)
    })

    it('알림 목록 조회 실패 시 빈 배열을 반환해야 한다', async () => {
      // Given: 데이터베이스 오류
      const userId = 'user123'
      mockCollection.getList.mockRejectedValue(new Error('Database error'))

      // When: 알림 목록 조회
      const result = await notificationService.getNotifications(userId)

      // Then: 빈 배열이 반환되어야 함
      expect(result).toEqual([])
    })
  })
})