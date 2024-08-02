import { r as redirect } from "../../../chunks/index.js";
import { p as pb } from "../../../chunks/pocketbase.js";
const GET = async ({ url, cookies, locals }) => {
  const redirectURL = `${url.origin}/oauth`;
  const expectedState = cookies.get("state");
  const expectedVerifier = cookies.get("verifier");
  const state = await url.searchParams.get("state");
  const code = await url.searchParams.get("code");
  const authMethods = await pb.collection("users").listAuthMethods();
  if (!authMethods?.authProviders) {
    console.log("No auth methods found");
    throw redirect(303, "/signup");
  }
  const provider = authMethods.authProviders[0];
  if (!provider) {
    console.log("provider net found");
    throw redirect(303, "/signup");
  }
  if (expectedState !== state) {
    console.log("state mismatch", expectedState, state);
    throw redirect(303, "/signup");
  }
  try {
    await pb.collection("users").authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL, { name: "My Awesome user" });
  } catch (error) {
    console.log("error signing in OAuth2", error);
  }
  throw redirect(303, "/login");
};
export {
  GET
};
