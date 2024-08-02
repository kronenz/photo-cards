import { r as redirect } from "../../../chunks/index.js";
import { p as pb } from "../../../chunks/pocketbase.js";
async function load({ locals, url, cookies }) {
  return {};
}
const actions = {
  // 회원가입 액션
  signup: async () => {
  },
  // OAuth2 인증 액션
  OAuth2: async ({ cookies, url, locals }) => {
    const authMethods = await pb.collection("users").listAuthMethods();
    console.log("OAuth2 action call");
    if (!authMethods) {
      return {
        authProvider: ""
      };
    }
    const redirectURL = `${url.origin}/oauth`;
    const googleAuthProvider = authMethods.authProviders[0];
    const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`;
    const state = googleAuthProvider.state;
    const verifier = googleAuthProvider.codeVerifier;
    cookies.set("state", state, { path: "/" });
    cookies.set("verifier", verifier, { path: "/" });
    throw redirect(302, authProviderRedirect);
  }
};
export {
  actions,
  load
};
