import { c as create_ssr_component, b as add_attribute } from "../../../chunks/index3.js";
import "../../../chunks/pocketbase.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "main.svelte-ax9kup.svelte-ax9kup{display:flex;justify-content:center;align-items:center;min-height:100vh;background-color:#f5f5f5;padding:68px 1rem 1rem}.register-container.svelte-ax9kup.svelte-ax9kup{background-color:#ffffff;border-radius:8px;padding:1rem;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1);width:100%;max-width:400px}h1.svelte-ax9kup.svelte-ax9kup{font-size:1.8rem;color:#333;margin-bottom:1rem;text-align:center}h2.svelte-ax9kup.svelte-ax9kup{font-size:1.3rem;color:#333;margin-bottom:0.8rem}.input-group.svelte-ax9kup.svelte-ax9kup{margin-bottom:0.8rem}label.svelte-ax9kup.svelte-ax9kup{display:block;margin-bottom:0.3rem;color:#333;font-size:0.9rem}input.svelte-ax9kup.svelte-ax9kup{width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;font-size:0.9rem}button.svelte-ax9kup.svelte-ax9kup{width:100%;padding:0.6rem;background-color:#333;color:#ffffff;border:none;border-radius:4px;font-size:0.9rem;cursor:pointer;transition:background-color 0.3s;margin-bottom:0.5rem}button.svelte-ax9kup.svelte-ax9kup:hover{background-color:#555}.error-message.svelte-ax9kup.svelte-ax9kup{color:#ff0000;margin-top:0.8rem;text-align:center;font-size:0.9rem}.divider.svelte-ax9kup.svelte-ax9kup{text-align:center;margin:0.8rem 0;color:#777;font-size:0.9rem}.google-register.svelte-ax9kup.svelte-ax9kup,.kakao-register.svelte-ax9kup.svelte-ax9kup,.naver-register.svelte-ax9kup.svelte-ax9kup{background-color:#ffffff;color:#333;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:0.9rem}.google-register.svelte-ax9kup img.svelte-ax9kup,.kakao-register.svelte-ax9kup img.svelte-ax9kup,.naver-register.svelte-ax9kup img.svelte-ax9kup{width:18px;height:18px;margin-right:8px}.google-register.svelte-ax9kup.svelte-ax9kup:hover,.kakao-register.svelte-ax9kup.svelte-ax9kup:hover,.naver-register.svelte-ax9kup.svelte-ax9kup:hover{background-color:#f5f5f5}.kakao-register.svelte-ax9kup.svelte-ax9kup{background-color:#FEE500;color:#000000}.naver-register.svelte-ax9kup.svelte-ax9kup{background-color:#03C75A;color:#ffffff}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  let passwordConfirm = "";
  $$result.css.add(css);
  return `<main class="svelte-ax9kup"><div class="register-container svelte-ax9kup"><h1 class="svelte-ax9kup">포토 카드 온라인</h1>
    
    <div class="register-box"><h2 class="svelte-ax9kup">회원가입</h2>
      
      <form><div class="input-group svelte-ax9kup"><label for="email" class="svelte-ax9kup">이메일:</label>
          <input type="email" id="email" required class="svelte-ax9kup"${add_attribute("value", email, 0)}></div>
        <div class="input-group svelte-ax9kup"><label for="password" class="svelte-ax9kup">비밀번호:</label>
          <input type="password" id="password" required class="svelte-ax9kup"${add_attribute("value", password, 0)}></div>
        <div class="input-group svelte-ax9kup"><label for="passwordConfirm" class="svelte-ax9kup">비밀번호 확인:</label>
          <input type="password" id="passwordConfirm" required class="svelte-ax9kup"${add_attribute("value", passwordConfirm, 0)}></div>
        <button type="submit" class="svelte-ax9kup">가입하기</button></form>
      
      ${``}

      <div class="divider svelte-ax9kup">또는</div>

      <button class="google-register svelte-ax9kup"><img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google 로고" width="24" height="24" class="svelte-ax9kup">
        Google로 가입하기
      </button>

      <button class="kakao-register svelte-ax9kup"><img src="https://developers.kakao.com/assets/img/about/logos/kakaologo.png" alt="Kakao 로고" width="24" height="24" class="svelte-ax9kup">
        카카오로 가입하기
      </button>

      <button class="naver-register svelte-ax9kup"><img src="https://ssl.pstatic.net/static/common/snsapp/img/naver_logo_s.png" alt="Naver 로고" width="24" height="24" class="svelte-ax9kup">
        네이버로 가입하기
      </button></div></div>
</main>`;
});
export {
  Page as default
};
