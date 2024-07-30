import { c as create_ssr_component, a as subscribe } from "../../chunks/index3.js";
import { p as page } from "../../chunks/stores.js";
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: "main.svelte-1s22oct.svelte-1s22oct{margin:0;padding:0;width:100%;min-height:100vh}@font-face{font-family:'NeoDunggeunmoPro';src:url('$fonts/NeoDunggeunmoPro-Regular.ttf') format('truetype');font-weight:normal;font-style:normal}body,a.svelte-1s22oct.svelte-1s22oct{font-family:'NeoDunggeunmoPro', sans-serif}.svelte-1s22oct.svelte-1s22oct:is(h1, h2, h3, h4, h5, h6, p){margin:1rem 0.1rem}.svelte-1s22oct.svelte-1s22oct:is(h1, h2, h3, h4, h5, h6, p, label):first-child{margin-top:0}.svelte-1s22oct.svelte-1s22oct:is(h1, h2, h3, h4, h5, h6, p, label):last-child{margin-bottom:0}a.svelte-1s22oct.svelte-1s22oct{color:var(--link)}a.svelte-1s22oct.svelte-1s22oct:hover{color:var(--link-hover)}a.svelte-1s22oct.svelte-1s22oct:active{color:var(--link-active)}nav.svelte-1s22oct.svelte-1s22oct{position:fixed;top:0;left:0;right:0;display:flex;justify-content:flex-start;align-items:center;padding:0 4%;height:68px;background-color:rgba(0, 0, 0, 0.9);transition:background-color 0.5s;z-index:1000}nav.svelte-1s22oct.svelte-1s22oct:hover{background-color:rgba(0, 0, 0, 1)}nav.svelte-1s22oct a.svelte-1s22oct{text-decoration:none;color:#e5e5e5;font-size:22px;margin-right:20px;transition:color 0.4s}nav.svelte-1s22oct a.svelte-1s22oct:hover{color:#b3b3b3}nav.svelte-1s22oct a.active.svelte-1s22oct{font-weight:bold;color:#ffffff}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css);
  $$unsubscribe_page();
  return `
<link rel="preconnect" href="https://fonts.googleapis.com" class="svelte-1s22oct">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin class="svelte-1s22oct">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,700;1,300;1,700&family=Roboto:ital,wght@0,300;0,700;1,300;1,700&display=swap" class="svelte-1s22oct"> 


<link rel="icon" href="%sveltekit.assets%/favicon.png" class="svelte-1s22oct">
<meta name="viewport" content="width=device-width, initial-scale=1" class="svelte-1s22oct">

<nav class="svelte-1s22oct">
	<a href="/" class="${["svelte-1s22oct", $page.url.pathname === "/" ? "active" : ""].join(" ").trim()}">홈</a>
	<a href="/card" class="${["svelte-1s22oct", $page.url.pathname === "/card" ? "active" : ""].join(" ").trim()}">카드</a>
	<a href="/login" class="${["svelte-1s22oct", $page.url.pathname === "/login" ? "active" : ""].join(" ").trim()}">로그인</a>
	<a href="/register" class="${["svelte-1s22oct", $page.url.pathname === "/register" ? "active" : ""].join(" ").trim()}">가입</a></nav>

<main style="background-color: blue;" class="svelte-1s22oct">${slots.default ? slots.default({}) : ``}
</main>`;
});
export {
  Layout as default
};
