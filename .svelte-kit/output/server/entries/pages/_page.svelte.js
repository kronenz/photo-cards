import { c as create_ssr_component } from "../../chunks/index3.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".community-home.svelte-1oethwd.svelte-1oethwd{margin:0 auto;padding:2rem}h1.svelte-1oethwd.svelte-1oethwd,h2.svelte-1oethwd.svelte-1oethwd{text-align:center;margin-bottom:1.5rem}.post-grid.svelte-1oethwd.svelte-1oethwd,.stats-grid.svelte-1oethwd.svelte-1oethwd{display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:1.5rem;margin-bottom:2rem}.post-card.svelte-1oethwd.svelte-1oethwd{background-color:#f5f5f5;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1)}.post-card.svelte-1oethwd img.svelte-1oethwd{width:100%;height:150px;object-fit:cover}.post-card.svelte-1oethwd h3.svelte-1oethwd,.post-card.svelte-1oethwd p.svelte-1oethwd{padding:0.5rem 1rem}.stat-item.svelte-1oethwd.svelte-1oethwd{background-color:#e0e0e0;border-radius:8px;padding:1rem;text-align:center}.stat-number.svelte-1oethwd.svelte-1oethwd{font-size:1.5rem;font-weight:bold;display:block}.link-buttons.svelte-1oethwd.svelte-1oethwd{display:flex;justify-content:center;gap:1rem}.link-button.svelte-1oethwd.svelte-1oethwd{background-color:#333;color:#fff;padding:0.5rem 1rem;border-radius:4px;text-decoration:none;transition:background-color 0.3s}.link-button.svelte-1oethwd.svelte-1oethwd:hover{background-color:#555}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<main class="community-home svelte-1oethwd"><h1 class="svelte-1oethwd">포토 카드 온라인 커뮤니티</h1>
  
  <section class="featured-posts"><h2 class="svelte-1oethwd">인기 게시물</h2>
    <div class="post-grid svelte-1oethwd"><div class="post-card svelte-1oethwd"><img src="https://via.placeholder.com/300x200.png?text=인기+게시물+1" alt="인기 게시물 1" class="svelte-1oethwd">
        <h3 class="svelte-1oethwd">멋진 카드 컬렉션 공유합니다!</h3>
        <p class="svelte-1oethwd">작성자: 카드마스터</p></div>
      <div class="post-card svelte-1oethwd"><img src="https://via.placeholder.com/300x200.png?text=인기+게시물+2" alt="인기 게시물 2" class="svelte-1oethwd">
        <h3 class="svelte-1oethwd">새로운 카드 디자인 아이디어</h3>
        <p class="svelte-1oethwd">작성자: 크리에이티브디자이너</p></div>
      <div class="post-card svelte-1oethwd"><img src="https://via.placeholder.com/300x200.png?text=인기+게시물+3" alt="인기 게시물 3" class="svelte-1oethwd">
        <h3 class="svelte-1oethwd">이번 주 카드 교환 모임 안내</h3>
        <p class="svelte-1oethwd">작성자: 이벤트플래너</p></div></div></section>
  
  <section class="community-stats"><h2 class="svelte-1oethwd">커뮤니티 현황</h2>
    <div class="stats-grid svelte-1oethwd"><div class="stat-item svelte-1oethwd"><span class="stat-number svelte-1oethwd">1,234</span>
        <span class="stat-label">회원 수</span></div>
      <div class="stat-item svelte-1oethwd"><span class="stat-number svelte-1oethwd">5,678</span>
        <span class="stat-label">총 게시물</span></div>
      <div class="stat-item svelte-1oethwd"><span class="stat-number svelte-1oethwd">9,876</span>
        <span class="stat-label">오늘의 방문자</span></div></div></section>
  
  <section class="quick-links"><h2 class="svelte-1oethwd">빠른 링크</h2>
    <div class="link-buttons svelte-1oethwd"><a href="/card" class="link-button svelte-1oethwd">카드 갤러리</a>
      <a href="/forum" class="link-button svelte-1oethwd">토론 게시판</a>
      <a href="/events" class="link-button svelte-1oethwd">이벤트 캘린더</a></div></section>
</main>`;
});
export {
  Page as default
};
