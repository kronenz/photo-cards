<script>
    import { goto } from '$app/navigation';
    import { pb } from '$lib/pocketbase';
  
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let error = '';
  
    async function handleSubmit() {
      if (password !== passwordConfirm) {
        error = "비밀번호가 일치하지 않습니다";
        return;
      }
  
      try {
        const data = {
          email: email,
          password: password,
          passwordConfirm: passwordConfirm,
        };
        await pb.collection('users').create(data);
        await pb.collection('users').authWithPassword(email, password);
        goto('/login');
      } catch (err) {
        error = err.message;
      }
    }

    async function handleGoogleRegister() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
        goto('/login');
      } catch (err) {
        error = err.message;
      }
    }

    async function handleKakaoRegister() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'kakao' });
        goto('/login');
      } catch (err) {
        error = err.message;
      }
    }

    async function handleNaverRegister() {
      try {
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'naver' });
        goto('/login');
      } catch (err) {
        error = err.message;
      }
    }
</script>

<main>
  <div class="register-container">
    <h1>포토 카드 온라인</h1>
    
    <div class="register-box">
      <h2>회원가입</h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
          <label for="email">이메일:</label>
          <input type="email" id="email" bind:value={email} required>
        </div>
        <div class="input-group">
          <label for="password">비밀번호:</label>
          <input type="password" id="password" bind:value={password} required>
        </div>
        <div class="input-group">
          <label for="passwordConfirm">비밀번호 확인:</label>
          <input type="password" id="passwordConfirm" bind:value={passwordConfirm} required>
        </div>
        <button type="submit">가입하기</button>
      </form>
      
      {#if error}
        <p class="error-message">{error}</p>
      {/if}

      <div class="divider">또는</div>

      <button class="google-register" on:click={handleGoogleRegister}>
        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google 로고" width="24" height="24" />
        Google로 가입하기
      </button>

      <button class="kakao-register" on:click={handleKakaoRegister}>
        <img src="https://developers.kakao.com/assets/img/about/logos/kakaologo.png" alt="Kakao 로고" width="24" height="24" />
        카카오로 가입하기
      </button>

      <button class="naver-register" on:click={handleNaverRegister}>
        <img src="https://ssl.pstatic.net/static/common/snsapp/img/naver_logo_s.png" alt="Naver 로고" width="24" height="24" />
        네이버로 가입하기
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

  .register-container {
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

  .google-register, .kakao-register, .naver-register {
    background-color: #ffffff;
    color: #333;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }

  .google-register img, .kakao-register img, .naver-register img {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }

  .google-register:hover, .kakao-register:hover, .naver-register:hover {
    background-color: #f5f5f5;
  }

  .kakao-register {
    background-color: #FEE500;
    color: #000000;
  }

  .naver-register {
    background-color: #03C75A;
    color: #ffffff;
  }


</style>