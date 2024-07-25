import { c as create_ssr_component } from "../../chunks/ssr.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<nav data-svelte-h="svelte-13xgy25"><a href="/">home</a> <a href="/card">card</a></nav> ${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
