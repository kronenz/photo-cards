import { redirect } from "@sveltejs/kit"
import { pb } from '$lib/pocketbase';

// 페이지 로드 시 실행되는 함수
export async function load({locals, url, cookies}){
    // 현재는 아무 데이터도 반환하지 않음
    // 추후 필요한 초기 데이터를 여기서 로드하여 반환할 수 있음
    return{

    }
}

// 페이지에서 수행할 수 있는 액션들을 정의
export const actions = {
    // 회원가입 액션
    signup: async()=>{
        // 회원가입 로직을 구현할 수 있는 공간
        // 현재는 비어있음
    },
    // OAuth2 인증 액션
    OAuth2: async({cookies,url, locals})=>{
        // PocketBase의 users 컬렉션에서 사용 가능한 인증 방법들을 가져옴
        const authMethods = await pb.collection('users').listAuthMethods();
        // 가져온 인증 방법들을 콘솔에 출력 (디버깅 목적)
        console.log("OAuth2 action call");
        if(!authMethods){
            return {
                authProvider: '',
            }
        }
        // 여기에 OAuth2 인증 처리 로직을 추가할 수 있음
        const redirectURL = `${url.origin}/oauth`;
        const googleAuthProvider = authMethods.authProviders[0];
        const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`;

        const state = googleAuthProvider.state;
        const verifier = googleAuthProvider.codeVerifier;
        // path를 '/'로 설정하면 쿠키가 전체 웹사이트에서 접근 가능해집니다.
        // 이는 다음과 같은 영향을 미칩니다:
        // 1. 모든 페이지에서 이 쿠키에 접근할 수 있어 편리합니다.
        // 2. 하위 경로에서도 쿠키를 사용할 수 있어 유연성이 높아집니다.
        // 3. 보안 측면에서는 쿠키의 접근 범위가 넓어져 주의가 필요할 수 있습니다.
        cookies.set('state', state, { path: '/' });
        cookies.set('verifier', verifier, { path: '/' });

        throw redirect(302, authProviderRedirect);

    }
}