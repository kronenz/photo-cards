<script>
    import { goto } from '$app/navigation';
    import { pb } from '$lib/pocketbase';
  
    let email = '';
    let password = '';
    let error = '';
  
    async function handleSubmit() {
      try {
        await pb.collection('users').authWithPassword(email, password);
        goto('/card');
      } catch (err) {
        error = err.message;
      }
    }

    async function handleGoogleLogin() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
        goto('/card');
      } catch (err) {
        error = err.message;
      }
    }

    async function handleKakaoLogin() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'kakao' });
        goto('/card');
      } catch (err) {
        error = err.message;
      }
    }

    async function handleNaverLogin() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'naver' });
        goto('/card');
      } catch (err) {
        error = err.message;
      }
    }
</script>

<main>
  <div class="login-container">
    <h1>포토 카드 온라인</h1>
    
    <div class="login-box">
      <h2>로그인</h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
          <label for="email">이메일:</label>
          <input type="email" id="email" bind:value={email} required>
        </div>
        <div class="input-group">
          <label for="password">비밀번호:</label>
          <input type="password" id="password" bind:value={password} required>
        </div>
        <button type="submit">로그인</button>
      </form>
      
      {#if error}
        <p class="error-message">{error}</p>
      {/if}

      <div class="divider">또는</div>

      <button class="google-login" on:click={handleGoogleLogin}>
        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google 로고" width="24" height="24" />
        Google로 로그인
      </button>

      <button class="kakao-login" on:click={handleKakaoLogin}>
        <img src="https://developers.kakao.com/assets/img/about/logos/kakaologo.png" alt="Kakao 로고" width="24" height="24" />
        카카오로 로그인
      </button>

      <button class="naver-login" on:click={handleNaverLogin}>
        <img src="https://ssl.pstatic.net/static/common/snsapp/img/naver_logo_s.png" alt="Naver 로고" width="24" height="24" />
        네이버로 로그인
      </button>
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 120px 1rem 1rem;
  }

  .login-container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    margin-top: -80px;
  }

  h1 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
  }

  h2 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 0.8rem;
  }

  .input-group {
    margin-bottom: 0.8rem;
  }

  label {
    display: block;
    margin-bottom: 0.3rem;
    color: #333;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  button {
    width: 100%;
    padding: 0.6rem;
    background-color: #333;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-bottom: 0.5rem;
  }

  button:hover {
    background-color: #555;
  }

  .error-message {
    color: #ff0000;
    margin-top: 0.8rem;
    text-align: center;
    font-size: 0.9rem;
  }

  .divider {
    text-align: center;
    margin: 0.8rem 0;
    color: #777;
    font-size: 0.9rem;
  }

  .google-login, .kakao-login, .naver-login {
    background-color: #ffffff;
    color: #333;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }

  .google-login img, .kakao-login img, .naver-login img {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }

  .google-login:hover, .kakao-login:hover, .naver-login:hover {
    background-color: #f5f5f5;
  }

  .kakao-login {
    background-color: #FEE500;
    color: #000000;
  }

  .naver-login {
    background-color: #03C75A;
    color: #ffffff;
  }
</style>