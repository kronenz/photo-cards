// SvelteKit의 redirect 함수와 PocketBase 인스턴스를 가져옵니다.
import { redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';

// SvelteKit의 핸들러 함수입니다. 모든 요청을 처리합니다.
export async function handle({ event, resolve }) {
  // 클라이언트에서 전송한 쿠키로 PocketBase 인증 상태를 복원합니다.
  // 쿠키가 없으면 빈 문자열을 사용합니다.
  pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  try {
    // authStore가 유효한 경우(사용자가 로그인 상태인 경우), 토큰을 새로고침합니다.
    // 이는 세션을 최신 상태로 유지하고 만료를 방지합니다.
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch (_) {
    // 토큰 새로고침에 실패한 경우 (예: 토큰이 만료된 경우),
    // 인증 상태를 초기화하여 사용자를 로그아웃 상태로 만듭니다.
    pb.authStore.clear();
  }

  // 보호된 라우트에 대한 인증 체크를 수행합니다.
  // URL이 '/dashboard'로 시작하고 사용자가 인증되지 않은 경우,
  // 로그인 페이지로 리다이렉트합니다.
  if (event.url.pathname.startsWith('/dashboard') && !pb.authStore.isValid) {
    throw redirect(303, '/login');
  }

  // 요청을 처리하고 응답을 생성합니다.
  const response = await resolve(event);
  
  // CORS 설정을 추가합니다.
  response.headers.append('Access-Control-Allow-Origin', 'https://30aa-210-113-225-166.ngrok-free.app');
  response.headers.append('Access-Control-Allow-Credentials', 'true');
  response.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 보안 설정이 추가된 쿠키를 설정합니다.
  // secure: true - HTTPS 연결에서만 쿠키를 전송하여 중간자 공격을 방지합니다.
  // sameSite: 'None' - 크로스 사이트 요청에서도 쿠키를 전송할 수 있도록 합니다.
  // httpOnly: true - JavaScript를 통한 쿠키 접근을 방지하여 XSS 공격으로부터 보호합니다.
  // path: '/' - 전체 사이트에서 쿠키를 사용할 수 있도록 합니다.
  response.headers.append('set-cookie', pb.authStore.exportToCookie({
    secure: true,
    sameSite: 'None',
    httpOnly: true,
    path: '/'
  }));

  // 최종적으로 처리된 응답을 반환합니다.
  return response;
}