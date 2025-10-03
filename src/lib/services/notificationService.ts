import PocketBase from 'pocketbase'
import type { 
  Notification, 
  NotificationSettings, 
  NotificationType, 
  NotificationData,
  RealtimeNotificationEvent 
} from '$lib/types/notifications'

class NotificationService {
  private pb: PocketBase
  private subscribers: Map<string, (event: RealtimeNotificationEvent) => void> = new Map()

  constructor() {
    this.pb = new PocketBase('http://localhost:8090')
  }

  // PocketBase WebSocket 실시간 구독 시스템
  async subscribeToNotifications(userId: string, callback: (event: RealtimeNotificationEvent) => void) {
    try {
      // 기존 구독 해제
      if (this.subscribers.has(userId)) {
        await this.unsubscribeFromNotifications(userId)
      }

      // 새 구독 등록
      this.subscribers.set(userId, callback)

      // PocketBase 실시간 구독
      await this.pb.collection('notifications').subscribe('*', (e) => {
        const notification = e.record as unknown as Notification
        
        // 해당 사용자의 알림만 처리
        if (notification.userId === userId) {
          const event: RealtimeNotificationEvent = {
            type: e.action === 'create' ? 'notification_created' : 
                  e.action === 'update' ? 'notification_read' : 'notification_deleted',
            notification,
            userId
          }
          callback(event)
        }
      })

      console.log(`✅ 실시간 알림 구독 시작: ${userId}`)
    } catch (error) {
      console.error('❌ 알림 구독 실패:', error)
      throw error
    }
  }

  async unsubscribeFromNotifications(userId: string) {
    try {
      await this.pb.collection('notifications').unsubscribe()
      this.subscribers.delete(userId)
      console.log(`✅ 실시간 알림 구독 해제: ${userId}`)
    } catch (error) {
      console.error('❌ 알림 구독 해제 실패:', error)
    }
  }

  // 좋아요, 댓글, 팔로우 즉시 알림
  async createNotification(
    userId: string, 
    type: NotificationType, 
    title: string, 
    message: string, 
    data: NotificationData = {}
  ): Promise<Notification> {
    try {
      const notification = await this.pb.collection('notifications').create({
        userId,
        type,
        title,
        message,
        data: JSON.stringify(data),
        read: false,
        priority: this.getPriorityForType(type),
        createdAt: new Date().toISOString(),
        expiresAt: this.getExpirationForType(type)
      })

      // 이메일 알림 발송 (설정에 따라)
      await this.sendEmailNotificationIfEnabled(userId, type, notification)

      return notification as unknown as Notification
    } catch (error) {
      console.error('❌ 알림 생성 실패:', error)
      throw error
    }
  }

  // 좋아요 알림
  async createLikeNotification(cardOwnerId: string, likerId: string, cardId: string, cardTitle: string) {
    const liker = await this.pb.collection('users').getOne(likerId)
    
    return this.createNotification(
      cardOwnerId,
      'like',
      '새로운 좋아요',
      `${liker.displayName || liker.username}님이 "${cardTitle}" 카드를 좋아합니다`,
      {
        cardId,
        userId: likerId,
        actionUrl: `/cards/${cardId}`,
        imageUrl: liker.avatar
      }
    )
  }

  // 댓글 알림
  async createCommentNotification(cardOwnerId: string, commenterId: string, cardId: string, cardTitle: string, commentText: string) {
    const commenter = await this.pb.collection('users').getOne(commenterId)
    
    return this.createNotification(
      cardOwnerId,
      'comment',
      '새로운 댓글',
      `${commenter.displayName || commenter.username}님이 "${cardTitle}" 카드에 댓글을 남겼습니다: "${commentText.substring(0, 50)}..."`,
      {
        cardId,
        userId: commenterId,
        actionUrl: `/cards/${cardId}#comments`,
        imageUrl: commenter.avatar
      }
    )
  }

  // 팔로우 알림
  async createFollowNotification(followedUserId: string, followerId: string) {
    const follower = await this.pb.collection('users').getOne(followerId)
    
    return this.createNotification(
      followedUserId,
      'follow',
      '새로운 팔로워',
      `${follower.displayName || follower.username}님이 회원님을 팔로우하기 시작했습니다`,
      {
        userId: followerId,
        actionUrl: `/users/${followerId}`,
        imageUrl: follower.avatar
      }
    )
  }

  // 알림 목록 조회
  async getNotifications(userId: string, page = 1, limit = 20): Promise<Notification[]> {
    try {
      const result = await this.pb.collection('notifications').getList(page, limit, {
        filter: `userId = "${userId}"`,
        sort: '-created'
      })

      return result.items.map(item => ({
        ...item,
        data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data
      })) as unknown as Notification[]
    } catch (error) {
      console.error('❌ 알림 조회 실패:', error)
      return []
    }
  }

  // 읽지 않은 알림 개수
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await this.pb.collection('notifications').getList(1, 1, {
        filter: `userId = "${userId}" && read = false`
      })
      return result.totalItems
    } catch (error) {
      console.error('❌ 읽지 않은 알림 개수 조회 실패:', error)
      return 0
    }
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.pb.collection('notifications').update(notificationId, {
        read: true
      })
    } catch (error) {
      console.error('❌ 알림 읽음 처리 실패:', error)
    }
  }

  // 모든 알림 읽음 처리
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.pb.collection('notifications').getFullList({
        filter: `userId = "${userId}" && read = false`
      })

      const updatePromises = notifications.map(notification =>
        this.pb.collection('notifications').update(notification.id, { read: true })
      )

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('❌ 모든 알림 읽음 처리 실패:', error)
    }
  }

  // 알림 설정 조회
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const settings = await this.pb.collection('notification_settings').getFirstListItem(
        `userId = "${userId}"`
      )
      return settings as unknown as NotificationSettings
    } catch (error) {
      // 설정이 없으면 기본 설정 생성
      return this.createDefaultSettings(userId)
    }
  }

  // 알림 설정 업데이트
  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const existingSettings = await this.getNotificationSettings(userId)
      
      if (existingSettings) {
        const updated = await this.pb.collection('notification_settings').update(existingSettings.id, {
          ...settings,
          updatedAt: new Date().toISOString()
        })
        return updated as unknown as NotificationSettings
      } else {
        return this.createDefaultSettings(userId, settings)
      }
    } catch (error) {
      console.error('❌ 알림 설정 업데이트 실패:', error)
      throw error
    }
  }

  // 기본 설정 생성
  private async createDefaultSettings(userId: string, overrides: Partial<NotificationSettings> = {}): Promise<NotificationSettings> {
    const defaultSettings = {
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
      frequency: 'immediate' as const,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      updatedAt: new Date().toISOString(),
      ...overrides
    }

    const created = await this.pb.collection('notification_settings').create(defaultSettings)
    return created as unknown as NotificationSettings
  }

  // 이메일 알림 발송
  private async sendEmailNotificationIfEnabled(userId: string, type: NotificationType, notification: any) {
    try {
      const settings = await this.getNotificationSettings(userId)
      if (!settings?.emailNotifications[type as keyof typeof settings.emailNotifications]) {
        return
      }

      const user = await this.pb.collection('users').getOne(userId)
      if (!user.email) return

      // 이메일 발송 로직 (Resend/SendGrid 연동)
      await this.sendEmail(user.email, notification)
    } catch (error) {
      console.error('❌ 이메일 알림 발송 실패:', error)
    }
  }

  // 이메일 발송 (Resend 연동)
  private async sendEmail(email: string, notification: any) {
    try {
      // 실제 환경에서는 Resend API 키가 필요
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: email,
          subject: notification.title,
          html: this.generateEmailTemplate(notification)
        })
      })

      if (!response.ok) {
        throw new Error('이메일 발송 실패')
      }
    } catch (error) {
      console.error('❌ 이메일 발송 실패:', error)
    }
  }

  // 이메일 템플릿 생성
  private generateEmailTemplate(notification: any): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">홀로그래픽 카드 커뮤니티</h1>
        </div>
        <div style="padding: 20px; background: white;">
          <h2 style="color: #333; margin-top: 0;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          ${notification.data?.actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${notification.data.actionUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                확인하기
              </a>
            </div>
          ` : ''}
        </div>
        <div style="padding: 20px; background: #f8f9fa; text-align: center; color: #666; font-size: 14px;">
          <p>이 이메일을 받고 싶지 않으시면 <a href="/settings/notifications">알림 설정</a>에서 변경하실 수 있습니다.</p>
        </div>
      </div>
    `
  }

  // 알림 타입별 우선순위 설정
  private getPriorityForType(type: NotificationType): 'low' | 'normal' | 'high' | 'urgent' {
    switch (type) {
      case 'system':
        return 'urgent'
      case 'card_featured':
        return 'high'
      case 'follow':
      case 'comment':
        return 'normal'
      case 'like':
        return 'low'
      default:
        return 'normal'
    }
  }

  // 알림 타입별 만료 시간 설정
  private getExpirationForType(type: NotificationType): string | undefined {
    const now = new Date()
    switch (type) {
      case 'like':
        // 좋아요 알림은 7일 후 만료
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'comment':
      case 'follow':
        // 댓글, 팔로우 알림은 30일 후 만료
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      case 'system':
        // 시스템 알림은 만료되지 않음
        return undefined
      default:
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
}

export const notificationService = new NotificationService()