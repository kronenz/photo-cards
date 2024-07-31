<script>
  // @auth/sveltekit/client에서 signIn과 signOut 함수를 가져옵니다.
  // 이 함수들은 사용자 인증 관련 작업을 수행합니다.
  import {signIn, signOut} from "@auth/sveltekit/client"

  // $app/stores에서 page 스토어를 가져옵니다.
  // page 스토어는 현재 페이지의 정보를 포함하고 있습니다.
  import {page} from "$app/stores";

  // signIn 함수: 사용자 로그인을 처리합니다.
  // 사용 예: signIn('google')로 구글 로그인을 시작할 수 있습니다.

  // signOut 함수: 사용자 로그아웃을 처리합니다.
  // 사용 예: signOut()으로 현재 사용자를 로그아웃할 수 있습니다.

  // page 스토어: 현재 페이지의 URL, 파라미터, 쿼리 문자열 등의 정보에 접근할 수 있습니다.
  // 사용 예: $page.url.searchParams로 URL의 쿼리 파라미터에 접근할 수 있습니다.
</script>

<main class="community-home">
  
  <h1>포토 카드 온라인 커뮤니티</h1>
  
  <section >
    <h1>Welcome to SvelteKit</h1>
    <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
    <p>
        {#if $page.data.session}
            <span>
                <small>Signed in as</small><br/>
                <strong>{$page.data.session.user?.name ?? "User"}</strong>
            </span>
            <button on:click={() => signOut()} class="button">Sign out</button>
        {:else}
            <span>You are not signed in</span>
            <button on:click={() => signIn("google")}>
                Sign In with Google
            </button>
        {/if}
    </p>
  </section>
  <section class="featured-posts">
    <h2>인기 게시물</h2>
    <div class="post-grid">
      <div class="post-card">
        <img src="https://via.placeholder.com/300x200.png?text=인기+게시물+1" alt="인기 게시물 1">
        <h3>멋진 카드 컬렉션 공유합니다!</h3>
        <p>작성자: 카드마스터</p>
      </div>
      <div class="post-card">
        <img src="https://via.placeholder.com/300x200.png?text=인기+게시물+2" alt="인기 게시물 2">
        <h3>새로운 카드 디자인 아이디어</h3>
        <p>작성자: 크리에이티브디자이너</p>
      </div>
      <div class="post-card">
        <img src="https://via.placeholder.com/300x200.png?text=인기+게시물+3" alt="인기 게시물 3">
        <h3>이번 주 카드 교환 모임 안내</h3>
        <p>작성자: 이벤트플래너</p>
      </div>
    </div>
  </section>
  
  <section class="community-stats">
    <h2>커뮤니티 현황</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-number">1,234</span>
        <span class="stat-label">회원 수</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">5,678</span>
        <span class="stat-label">총 게시물</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">9,876</span>
        <span class="stat-label">오늘의 방문자</span>
      </div>
    </div>
  </section>
  
  <section class="quick-links">
    <h2>빠른 링크</h2>
    <div class="link-buttons">
      <a href="/card" class="link-button">카드 갤러리</a>
      <a href="/forum" class="link-button">토론 게시판</a>
      <a href="/events" class="link-button">이벤트 캘린더</a>
    </div>
  </section>
</main>

<style>
  .community-home {
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1, h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .post-grid, .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .post-card {
    background-color: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .post-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  
  .post-card h3, .post-card p {
    padding: 0.5rem 1rem;
  }
  
  .stat-item {
    background-color: #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: bold;
    display: block;
  }
  
  .link-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .link-button {
    background-color: #333;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .link-button:hover {
    background-color: #555;
  }
</style>
