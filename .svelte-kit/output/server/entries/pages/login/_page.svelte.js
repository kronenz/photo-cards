import { c as create_ssr_component, b as add_attribute } from "../../../chunks/index3.js";
import "../../../chunks/pocketbase.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "main.svelte-52vjze.svelte-52vjze{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f5f5f5;padding:0;margin:0;width:100%;overflow-x:hidden}.login-container.svelte-52vjze.svelte-52vjze{background-color:#ffffff;border-radius:8px;padding:1rem;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1);width:100%;max-width:400px}h1.svelte-52vjze.svelte-52vjze{font-size:1.8rem;color:#333;margin-bottom:1rem;text-align:center}h2.svelte-52vjze.svelte-52vjze{font-size:1.3rem;color:#333;margin-bottom:0.8rem}.input-group.svelte-52vjze.svelte-52vjze{margin-bottom:0.8rem}label.svelte-52vjze.svelte-52vjze{display:block;margin-bottom:0.3rem;color:#333;font-size:0.9rem}input.svelte-52vjze.svelte-52vjze{width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;font-size:0.9rem}button.svelte-52vjze.svelte-52vjze{width:100%;padding:0.6rem;background-color:#333;color:#ffffff;border:none;border-radius:4px;font-size:0.9rem;cursor:pointer;transition:background-color 0.3s;margin-bottom:0.5rem}button.svelte-52vjze.svelte-52vjze:hover{background-color:#555}.error-message.svelte-52vjze.svelte-52vjze{color:#ff0000;margin-top:0.8rem;text-align:center;font-size:0.9rem}.divider.svelte-52vjze.svelte-52vjze{text-align:center;margin:0.8rem 0;color:#777;font-size:0.9rem}.google-login.svelte-52vjze.svelte-52vjze,.kakao-login.svelte-52vjze.svelte-52vjze,.naver-login.svelte-52vjze.svelte-52vjze{background-color:#ffffff;color:#333;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:0.9rem}.google-login.svelte-52vjze img.svelte-52vjze,.kakao-login.svelte-52vjze img.svelte-52vjze,.naver-login.svelte-52vjze img.svelte-52vjze{width:18px;height:18px;margin-right:8px}.google-login.svelte-52vjze.svelte-52vjze:hover,.kakao-login.svelte-52vjze.svelte-52vjze:hover,.naver-login.svelte-52vjze.svelte-52vjze:hover{background-color:#f5f5f5}.kakao-login.svelte-52vjze.svelte-52vjze{background-color:#FEE500;color:#000000}.naver-login.svelte-52vjze.svelte-52vjze{background-color:#03C75A;color:#ffffff}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  $$result.css.add(css);
  return `<main class="svelte-52vjze"><div class="login-container svelte-52vjze"><h1 class="svelte-52vjze">포토 카드 온라인</h1>
    
    <div class="login-box"><h2 class="svelte-52vjze">로그인</h2>
      
      <form><div class="input-group svelte-52vjze"><label for="email" class="svelte-52vjze">이메일:</label>
          <input type="email" id="email" required class="svelte-52vjze"${add_attribute("value", email, 0)}></div>
        <div class="input-group svelte-52vjze"><label for="password" class="svelte-52vjze">비밀번호:</label>
          <input type="password" id="password" required class="svelte-52vjze"${add_attribute("value", password, 0)}></div>
        <button type="submit" class="svelte-52vjze">로그인</button></form>
      
      ${``}

      <div class="divider svelte-52vjze">또는</div>

      <button class="google-login svelte-52vjze"><img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google 로고" width="24" height="24" class="svelte-52vjze">
        Google로 로그인
      </button>

      <button class="kakao-login svelte-52vjze"><img src="https://developers.kakao.com/assets/img/about/logos/kakaologo.png" alt="Kakao 로고" width="24" height="24" class="svelte-52vjze">
        카카오로 로그인
      </button>

      <button class="naver-login svelte-52vjze"><img src="https://ssl.pstatic.net/static/common/snsapp/img/naver_logo_s.png" alt="Naver 로고" width="24" height="24" class="svelte-52vjze">
        네이버로 로그인
      </button></div></div>
</main>`;
});
export {
  Page as default
};
