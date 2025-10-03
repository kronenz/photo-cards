// 알림 시스템 타입 정의
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: NotificationData
  read: boolean
  priority: NotificationPriority
  createdAt: string
  expiresAt?: string
}

export type NotificationType = 
  | 'like'
  | 'comment' 
  | 'follow'
  | 'card_featured'
  | 'card_shared'
  | 'system'
  | 'achievement'
  | 'community_event'

export interface NotificationData {
  cardId?: string
  userId?: string
  commentId?: string
  achievementId?: string
  eventId?: string
  actionUrl?: string
  imageUrl?: string
  metadata?: Record<string, any>
}

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationSettings {
  id: string
  userId: string
  emailNotifications: {
    likes: boolean
    comments: boolean
    follows: boolean
    cardFeatured: boolean
    systemUpdates: boolean
    communityEvents: boolean
  }
  pushNotifications: {
    likes: boolean
    comments: boolean
    follows: boolean
    cardFeatured: boolean
    systemUpdates: boolean
    communityEvents: boolean
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  updatedAt: string
}

export interface NotificationSubscription {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: string
}

// 실시간 알림 이벤트
export interface RealtimeNotificationEvent {
  type: 'notification_created' | 'notification_read' | 'notification_deleted'
  notification: Notification
  userId: string
}

// 이메일 알림 템플릿
export interface EmailNotificationTemplate {
  type: NotificationType
  subject: string
  htmlTemplate: string
  textTemplate: string
  variables: string[]
}