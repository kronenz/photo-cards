import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { to, subject, html, text }: EmailRequest = await request.json()

    // 입력 검증
    if (!to || !subject || !html) {
      return json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 이메일 주소 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return json(
        { error: '유효하지 않은 이메일 주소입니다' },
        { status: 400 }
      )
    }

    // Resend API 키 확인
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.log('📧 개발 모드: 이메일 발송 시뮬레이션')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('HTML:', html.substring(0, 100) + '...')
      
      return json({
        success: true,
        message: '개발 모드에서 이메일 발송 시뮬레이션 완료',
        id: `dev-${Date.now()}`
      })
    }

    // Resend API 호출
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'notifications@holographic-cards.com',
        to: [to],
        subject,
        html,
        text: text || stripHtml(html)
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Resend API 오류:', errorData)
      
      return json(
        { error: 'Resend API 오류', details: errorData },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ 이메일 발송 성공:', result.id)

    return json({
      success: true,
      message: '이메일이 성공적으로 발송되었습니다',
      id: result.id
    })

  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error)
    
    return json(
      { 
        error: '이메일 발송 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// HTML에서 텍스트만 추출하는 간단한 함수
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/&nbsp;/g, ' ') // &nbsp; 공백으로 변환
    .replace(/&amp;/g, '&') // &amp; 변환
    .replace(/&lt;/g, '<') // &lt; 변환
    .replace(/&gt;/g, '>') // &gt; 변환
    .replace(/&quot;/g, '"') // &quot; 변환
    .replace(/&#39;/g, "'") // &#39; 변환
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim()
}

// CORS 헤더 설정 (필요한 경우)
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}