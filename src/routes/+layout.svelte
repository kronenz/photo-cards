<script>
	import { page } from '$app/stores';


</script>

<!-- fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com./src/lib/styles/css/2?family=Roboto+Condensed:ital,wght@0,300;0,700;1,300;1,700&family=Roboto:ital,wght@0,300;0,700;1,300;1,700&display=swap"> 

<link rel="stylesheet" href="./src/lib/styles/css/global.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards.css">
<link rel="stylesheet" href="../src/lib/styles/css/cards/base.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/basic.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/reverse-holo.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/regular-holo.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/cosmos-holo.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/amazing-rare.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/radiant-holo.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/v-regular.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/v-full-art.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/v-max.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/v-star.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/trainer-full-art.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/rainbow-holo.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/rainbow-alt.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/secret-rare.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/trainer-gallery-holo.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/trainer-gallery-v-regular.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/trainer-gallery-v-max.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/trainer-gallery-secret-rare.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/shiny-rare.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/shiny-v.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/shiny-vmax.css">
<link rel="stylesheet" href="./src/lib/styles/css/cards/swsh-pikachu.css">


<!-- href 속성의 값인 "%sveltekit.assets%/favicon.png"는 SvelteKit에서 제공하는 특별한 플레이스홀더입니다.
     이는 빌드 시 실제 favicon.png 파일의 경로로 대체됩니다. 이렇게 함으로써 개발 환경과 프로덕션 환경에서
     일관된 방식으로 파비콘을 참조할 수 있습니다. -->
<link rel="icon" href="%sveltekit.assets%/favicon.png" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<nav>
	<!-- 
	1. 사용자에게 현재 위치를 시각적으로 알려줍니다.
	2. 네비게이션을 통해 사이트의 주요 섹션으로 쉽게 이동할 수 있게 합니다.
	3. $page 스토어를 사용하여 현재 URL을 동적으로 확인하고, 활성 링크를 강조 표시합니다.
	4. class:active 디렉티브를 사용하여 조건부로 클래스를 적용함으로써 코드를 간결하게 유지합니다.
	-->
	<a href="/" class:active={$page.url.pathname === '/'}>홈</a>
	<a href="/card" class:active={$page.url.pathname === '/card'}>카드</a>
	<a href="/login" class:active={$page.url.pathname === '/login'}>로그인</a>
	<a href="/register" class:active={$page.url.pathname === '/register'}>가입</a>
</nav>

<main >
	<slot  />
</main>

<style>
	main {
		margin: 68px 0 0 0;
		padding: 0;
		width: 100%;
		min-height: calc(100vh - 68px);
	}

	@font-face {
		font-family: 'NeoDunggeunmoPro';
		src: url('$fonts/NeoDunggeunmoPro-Regular.ttf') format('truetype');
		font-weight: normal;
		font-style: normal;
	}

	:global(body), h1, h2, h3, h4, h5, h6, p, a {
		font-family: 'NeoDunggeunmoPro', sans-serif;
	}

	:is(h1, h2, h3, h4, h5, h6, p) {
		margin: 1rem 0.1rem;
	}


	:is(h1, h2, h3, h4, h5, h6, p, label):first-child {
		margin-top: 0;
	}

	:is(h1, h2, h3, h4, h5, h6, p, label):last-child {
		margin-bottom: 0;
	}

	a {
		color: var(--link);
	}

	a:hover {
		color: var(--link-hover);
	}

	a:active {
		color: var(--link-active);
	}


	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 0 4%;
		height: 68px;
		background-color: rgba(0, 0, 0, 0.9);
		transition: background-color 0.5s;
		z-index: 1000;
	}

	nav:hover {
		background-color: rgba(0, 0, 0, 1);
	}

	nav a {
		text-decoration: none;
		color: #e5e5e5;
		font-size: 22px;
		margin-right: 20px;
		transition: color 0.4s;
	}

	nav a:hover {
		color: #b3b3b3;
	}

	nav a.active {
		font-weight: bold;
		color: #ffffff;
	}

</style>