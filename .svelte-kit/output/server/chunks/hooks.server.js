import { r as redirect } from "./index.js";
import { p as pb } from "./pocketbase.js";
async function handle({ event, resolve }) {
  pb.authStore.loadFromCookie(event.request.headers.get("cookie") || "");
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
    }
  } catch (_) {
    pb.authStore.clear();
  }
  if (event.url.pathname.startsWith("/dashboard") && !pb.authStore.isValid) {
    throw redirect(303, "/login");
  }
  const response = await resolve(event);
  response.headers.append("Access-Control-Allow-Origin", "https://30aa-210-113-225-166.ngrok-free.app");
  response.headers.append("Access-Control-Allow-Credentials", "true");
  response.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.append("set-cookie", pb.authStore.exportToCookie({
    secure: true,
    sameSite: "None",
    httpOnly: true,
    path: "/"
  }));
  return response;
}
export {
  handle
};
