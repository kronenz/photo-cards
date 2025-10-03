import type { Notification, NotificationType } from '$lib/types/notifications'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    // 환경 변수에서 API 키 가져오기
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || ''
    this.fromEmail = 'notifications@holographic-cards.com'
  }

  // 이메일 알림 통합 (Resend/SendGrid)
  async sendNotificationEmail(
    userEmail: string, 
    notification: Notification, 
    userName: string = '사용자'
  ): Promise<boolean> {
    try {
      const template = this.generateEmailTemplate(notification, userName)
      
      const emailData: EmailData = {
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      // Resend API 사용
      if (this.apiKey) {
        return await this.sendWithResend(emailData)
      } else {
        // 개발 환경에서는 콘솔에 로그만 출력
        console.log('📧 이메일 알림 (개발 모드):', emailData)
        return true
      }
    } catch (error) {
      console.error('❌ 이메일 발송 실패:', error)
      return false
    }
  }

  // Resend API를 통한 이메일 발송
  private async sendWithResend(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API 오류: ${error}`)
      }

      const result = await response.json()
      console.log('✅ 이메일 발송 성공:', result.id)
      return true
    } catch (error) {
      console.error('❌ Resend 이메일 발송 실패:', error)
      return false
    }
  }

  // SendGrid 대안 (백업용)
  private async sendWithSendGrid(emailData: EmailData): Promise<boolean> {
    try {
      const sendGridApiKey = import.meta.env.VITE_SENDGRID_API_KEY
      if (!sendGridApiKey) {
        throw new Error('SendGrid API 키가 없습니다')
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: emailData.to }]
          }],
          from: { email: this.fromEmail },
          subject: emailData.subject,
          content: [
            {
              type: 'text/html',
              value: emailData.html
            },
            {
              type: 'text/plain',
              value: emailData.text || ''
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid API 오류: ${error}`)
      }

      console.log('✅ SendGrid 이메일 발송 성공')
      return true
    } catch (error) {
      console.error('❌ SendGrid 이메일 발송 실패:', error)
      return false
    }
  }

  // 이메일 템플릿 생성
  private generateEmailTemplate(notification: Notification, userName: string): EmailTemplate {
    const baseTemplate = this.getBaseTemplate()
    
    switch (notification.type) {
      case 'like':
        return this.generateLikeTemplate(notification, userName, baseTemplate)
      case 'comment':
        return this.generateCommentTemplate(notification, userName, baseTemplate)
      case 'follow':
        return this.generateFollowTemplate(notification, userName, baseTemplate)
      case 'card_featured':
        return this.generateFeaturedTemplate(notification, userName, baseTemplate)
      case 'system':
        return this.generateSystemTemplate(notification, userName, baseTemplate)
      default:
        return this.generateDefaultTemplate(notification, userName, baseTemplate)
    }
  }

  // 기본 이메일 템플릿
  private getBaseTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>홀로그래픽 카드 커뮤니티</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 8px 0 0;
            font-size: 16px;
          }
          .content {
            padding: 30px 20px;
          }
          .notification-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .notification-title {
            font-size: 18px;
            font-weight: 600;
            color: #1d1d1f;
            margin: 0 0 8px;
          }
          .notification-message {
            font-size: 16px;
            color: #666;
            margin: 0 0 16px;
            line-height: 1.5;
          }
          .cta-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background: #5a6fd8;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          .unsubscribe {
            margin-top: 16px;
            font-size: 12px;
            color: #999;
          }
          .unsubscribe a {
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚾ 홀로그래픽 카드 커뮤니티</h1>
            <p>KBO 팬들의 특별한 추억 공간</p>
          </div>
          <div class="content">
            {{CONTENT}}
          </div>
          <div class="footer">
            <p>홀로그래픽 카드 커뮤니티에서 더 많은 야구 추억을 만들어보세요!</p>
            <div class="unsubscribe">
              <p>
                이 이메일을 받고 싶지 않으시면 
                <a href="{{UNSUBSCRIBE_URL}}">알림 설정</a>에서 변경하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // 좋아요 알림 템플릿
  private generateLikeTemplate(notification: Notification, userName: string, baseTemplate: string): EmailTemplate {
    const content = `
      <h2>안녕하세요, ${userName}님! 👋</h2>
      <div class="notification-card">
        <div class="notification-title">❤️ ${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.data?.actionUrl ? `
          <a href="${notification.data.actionUrl}" class="cta-button">카드 확인하기</a>
        ` : ''}
      </div>
      <p>회원님의 멋진 카드가 다른 야구팬들에게 사랑받고 있어요! 계속해서 특별한 순간들을 공유해주세요.</p>
    `

    return {
      subject: `❤️ ${notification.title} - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${notification.title}\n\n${notification.message}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  // 댓글 알림 템플릿
  private generateCommentTemplate(notification: Notification, userName: string, baseTemplate: string): EmailTemplate {
    const content = `
      <h2>안녕하세요, ${userName}님! 👋</h2>
      <div class="notification-card">
        <div class="notification-title">💬 ${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.data?.actionUrl ? `
          <a href="${notification.data.actionUrl}" class="cta-button">댓글 확인하기</a>
        ` : ''}
      </div>
      <p>회원님의 카드에 새로운 댓글이 달렸어요! 다른 야구팬과 소통해보세요.</p>
    `

    return {
      subject: `💬 ${notification.title} - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${notification.title}\n\n${notification.message}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  // 팔로우 알림 템플릿
  private generateFollowTemplate(notification: Notification, userName: string, baseTemplate: string): EmailTemplate {
    const content = `
      <h2>안녕하세요, ${userName}님! 👋</h2>
      <div class="notification-card">
        <div class="notification-title">👥 ${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.data?.actionUrl ? `
          <a href="${notification.data.actionUrl}" class="cta-button">프로필 확인하기</a>
        ` : ''}
      </div>
      <p>새로운 야구팬이 회원님을 팔로우하기 시작했어요! 함께 야구 이야기를 나눠보세요.</p>
    `

    return {
      subject: `👥 ${notification.title} - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${notification.title}\n\n${notification.message}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  // 카드 추천 알림 템플릿
  private generateFeaturedTemplate(notification: Notification, userName: string, baseTemplate: string): EmailTemplate {
    const content = `
      <h2>축하합니다, ${userName}님! 🎉</h2>
      <div class="notification-card">
        <div class="notification-title">⭐ ${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.data?.actionUrl ? `
          <a href="${notification.data.actionUrl}" class="cta-button">추천 카드 보기</a>
        ` : ''}
      </div>
      <p>회원님의 카드가 커뮤니티에서 추천되었어요! 정말 멋진 작품이네요. 더 많은 야구팬들과 공유해보세요.</p>
    `

    return {
      subject: `⭐ ${notification.title} - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${notification.title}\n\n${notification.message}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  // 시스템 알림 템플릿
  private generateSystemTemplate(notification: Notification, userName: string, baseTemplate: string): EmailTemplate {
    const content = `
      <h2>안녕하세요, ${userName}님! 👋</h2>
      <div class="notification-card">
        <div class="notification-title">🔔 ${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.data?.actionUrl ? `
          <a href="${notification.data.actionUrl}" class="cta-button">자세히 보기</a>
        ` : ''}
      </div>
      <p>홀로그래픽 카드 커뮤니티에서 중요한 소식을 전해드립니다.</p>
    `

    return {
      subject: `🔔 ${notification.title} - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${notification.title}\n\n${notification.message}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  // 기본 알림 템플릿
  private generateDefaultTemplate(notification: Notification, userName: string, baseTemplate: string): EmailTemplate {
    const content = `
      <h2>안녕하세요, ${userName}님! 👋</h2>
      <div class="notification-card">
        <div class="notification-title">📢 ${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        ${notification.data?.actionUrl ? `
          <a href="${notification.data.actionUrl}" class="cta-button">확인하기</a>
        ` : ''}
      </div>
      <p>홀로그래픽 카드 커뮤니티에서 새로운 소식을 전해드립니다.</p>
    `

    return {
      subject: `📢 ${notification.title} - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${notification.title}\n\n${notification.message}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  // 일괄 이메일 발송 (요약 알림용)
  async sendBatchNotificationEmail(
    userEmail: string,
    notifications: Notification[],
    userName: string,
    frequency: 'hourly' | 'daily' | 'weekly'
  ): Promise<boolean> {
    try {
      const template = this.generateBatchEmailTemplate(notifications, userName, frequency)
      
      const emailData: EmailData = {
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      if (this.apiKey) {
        return await this.sendWithResend(emailData)
      } else {
        console.log('📧 일괄 이메일 알림 (개발 모드):', emailData)
        return true
      }
    } catch (error) {
      console.error('❌ 일괄 이메일 발송 실패:', error)
      return false
    }
  }

  // 일괄 알림 템플릿 생성
  private generateBatchEmailTemplate(
    notifications: Notification[], 
    userName: string, 
    frequency: 'hourly' | 'daily' | 'weekly'
  ): EmailTemplate {
    const baseTemplate = this.getBaseTemplate()
    const frequencyText = {
      hourly: '지난 1시간',
      daily: '오늘',
      weekly: '이번 주'
    }

    const content = `
      <h2>안녕하세요, ${userName}님! 👋</h2>
      <p>${frequencyText[frequency]} 동안의 활동 요약을 전해드립니다.</p>
      
      <div style="margin: 20px 0;">
        ${notifications.map(notification => `
          <div class="notification-card" style="margin-bottom: 16px;">
            <div class="notification-title">${this.getNotificationIcon(notification.type)} ${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            ${notification.data?.actionUrl ? `
              <a href="${notification.data.actionUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">확인하기 →</a>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <a href="/notifications" class="cta-button">모든 알림 보기</a>
      <p>홀로그래픽 카드 커뮤니티에서 더 많은 활동을 확인해보세요!</p>
    `

    return {
      subject: `📬 ${frequencyText[frequency]} 활동 요약 (${notifications.length}개) - 홀로그래픽 카드 커뮤니티`,
      html: baseTemplate.replace('{{CONTENT}}', content).replace('{{UNSUBSCRIBE_URL}}', '/settings/notifications'),
      text: `${frequencyText[frequency]} 활동 요약\n\n${notifications.map(n => `${n.title}: ${n.message}`).join('\n\n')}\n\n홀로그래픽 카드 커뮤니티`
    }
  }

  private getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'follow': return '👥'
      case 'card_featured': return '⭐'
      case 'system': return '🔔'
      case 'achievement': return '🏆'
      case 'community_event': return '🎉'
      default: return '📢'
    }
  }
}

export const emailService = new EmailService()