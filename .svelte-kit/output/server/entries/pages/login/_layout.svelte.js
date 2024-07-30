import { c as create_ssr_component } from "../../../chunks/index3.js";
import { p as pb } from "../../../chunks/pocketbase.js";
import { w as writable } from "../../../chunks/index2.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const user = writable(pb.authStore.model);
  pb.authStore.onChange((auth) => {
    user.set(pb.authStore.model);
  });
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `
${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
