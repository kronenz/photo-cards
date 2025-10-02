<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let styleElement: HTMLStyleElement;

	onMount(() => {
		if (!browser) return;

		// how2code.md 완벽 구현 - 동적 스타일 엘리먼트
		styleElement = document.createElement('style');
		styleElement.className = 'hover';
		document.head.appendChild(styleElement);

		// 카드 이벤트 리스너 등록
		const cards = document.querySelectorAll('.card');

		cards.forEach((card) => {
			card.addEventListener('mousemove', handleMouseMove);
			card.addEventListener('touchmove', handleTouchMove, { passive: false });
			card.addEventListener('mouseout', handleMouseOut);
			card.addEventListener('touchend', handleTouchEnd);
			card.addEventListener('touchcancel', handleTouchEnd);
		});

		return () => {
			if (styleElement && styleElement.parentNode) {
				styleElement.parentNode.removeChild(styleElement);
			}

			cards.forEach((card) => {
				card.removeEventListener('mousemove', handleMouseMove);
				card.removeEventListener('touchmove', handleTouchMove);
				card.removeEventListener('mouseout', handleMouseOut);
				card.removeEventListener('touchend', handleTouchEnd);
				card.removeEventListener('touchcancel', handleTouchEnd);
			});
		};
	});

	// how2code.md 완벽 구현 - 마우스 이벤트 처리
	function handleMouseMove(e: Event) {
		if (!styleElement) return;

		const mouseEvent = e as MouseEvent;
		const card = mouseEvent.currentTarget as HTMLElement;
		const pos = [mouseEvent.offsetX, mouseEvent.offsetY];

		// how2code.md 수학 공식 완벽 구현
		const l = pos[0];
		const t = pos[1];
		const h = card.offsetHeight;
		const w = card.offsetWidth;
		const px = Math.abs(Math.floor((100 / w) * l) - 100);
		const py = Math.abs(Math.floor((100 / h) * t) - 100);
		const pa = 50 - px + (50 - py);

		// 그라디언트/배경 위치 계산
		const lp = 50 + (px - 50) / 1.5;
		const tp = 50 + (py - 50) / 1.5;
		const px_spark = 50 + (px - 50) / 7;
		const py_spark = 50 + (py - 50) / 7;
		const p_opc = 20 + Math.abs(pa) * 1.5;
		const ty = ((tp - 50) / 2) * -1;
		const tx = ((lp - 50) / 1.5) * 0.5;

		// CSS 적용
		const grad_pos = `background-position: ${lp}% ${tp}%;`;
		const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
		const opc = `opacity: ${p_opc / 100};`;
		const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;

		// 스타일 태그에 CSS 적용 (how2code.md 방식)
		const style = `
      .card:hover:before { ${grad_pos} }  /* gradient */
      .card:hover:after { ${sprk_pos} ${opc} }   /* sparkles */ 
    `;

		// 클래스 및 스타일 적용
		const allCards = document.querySelectorAll('.card');
		allCards.forEach((c) => c.classList.remove('active'));
		card.classList.remove('animated');
		card.classList.add('active');
		card.style.cssText = tf;
		styleElement.innerHTML = style;
	}

	// 터치 이벤트 처리
	function handleTouchMove(e: Event) {
		e.preventDefault();
		const touchEvent = e as TouchEvent;
		if (!styleElement || touchEvent.touches.length === 0) return;

		const card = touchEvent.currentTarget as HTMLElement;
		const touch = touchEvent.touches[0];
		const rect = card.getBoundingClientRect();
		const pos = [touch.clientX - rect.left, touch.clientY - rect.top];

		// 마우스 이벤트와 동일한 로직
		const l = pos[0];
		const t = pos[1];
		const h = rect.height;
		const w = rect.width;
		const px = Math.abs(Math.floor((100 / w) * l) - 100);
		const py = Math.abs(Math.floor((100 / h) * t) - 100);
		const pa = 50 - px + (50 - py);

		const lp = 50 + (px - 50) / 1.5;
		const tp = 50 + (py - 50) / 1.5;
		const px_spark = 50 + (px - 50) / 7;
		const py_spark = 50 + (py - 50) / 7;
		const p_opc = 20 + Math.abs(pa) * 1.5;
		const ty = ((tp - 50) / 2) * -1;
		const tx = ((lp - 50) / 1.5) * 0.5;

		const grad_pos = `background-position: ${lp}% ${tp}%;`;
		const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
		const opc = `opacity: ${p_opc / 100};`;
		const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;

		const style = `
      .card:hover:before { ${grad_pos} }
      .card:hover:after { ${sprk_pos} ${opc} }
    `;

		const allCards = document.querySelectorAll('.card');
		allCards.forEach((c) => c.classList.remove('active'));
		card.classList.remove('animated');
		card.classList.add('active');
		card.style.cssText = tf;
		styleElement.innerHTML = style;
	}

	// 마우스 아웃 처리 (how2code.md 완벽 구현)
	function handleMouseOut(e: Event) {
		if (!styleElement) return;

		const card = e.currentTarget as HTMLElement;
		styleElement.innerHTML = '';
		card.removeAttribute('style');
		card.classList.remove('active');

		setTimeout(() => {
			if (card) {
				card.classList.add('animated');
			}
		}, 2500);
	}

	// 터치 종료 처리
	function handleTouchEnd(e: Event) {
		handleMouseOut(e);
	}
</script>

<svelte:head>
	<title>홀로그래픽 카드 테스트 - how2code.md 완벽 구현</title>
</svelte:head>

<!-- how2code.md 완벽 구현 HTML 구조 -->
<main id="app">
	<p>
		how2code.md 완벽 예제 기반 구현 - <a
			href="https://codepen.io/simeydotme/pen/abYWJdX"
			target="_blank">원본 CodePen</a
		>
	</p>

	<h1>KBO 홀로그래픽 카드, 완벽 구현</h1>

	<section class="cards">
		<div class="three-d-wrapper">
			<div
				class="card charizard animated"
				style="--front: url('https://assets.codepen.io/13471/charizard-gx.webp')"
			></div>
		</div>
		<div class="three-d-wrapper">
			<div
				class="card pika animated"
				style="--front: url('https://assets.codepen.io/13471/pikachu-gx.webp')"
			></div>
		</div>
		<div class="three-d-wrapper">
			<div
				class="card eevee animated"
				style="--front: url('https://assets.codepen.io/13471/eevee-gx.webp')"
			></div>
		</div>
		<div class="three-d-wrapper">
			<div
				class="card mewtwo animated"
				style="--front: url('https://assets.codepen.io/13471/mewtwo-gx.webp')"
			></div>
		</div>
	</section>

	<style class="hover"></style>

	<section class="demo">
		<div class="card" style="--front: var(--back)"></div>
		<span class="operator">+</span>
		<div class="card" style="--front: none"><span>color-dodge</span></div>
		<span class="operator">+</span>
		<div class="card" style="--front: none"><span>color-dodge</span></div>
	</section>

	<!-- KBO 구단별 카드 섹션 -->
	<h2>KBO 구단별 홀로그래픽 카드</h2>

	<section class="kbo-cards">
		<div class="three-d-wrapper">
			<div class="card lg animated kbo-card" data-team="LG TWINS"></div>
		</div>
		<div class="three-d-wrapper">
			<div class="card doosan animated kbo-card" data-team="DOOSAN BEARS"></div>
		</div>
		<div class="three-d-wrapper">
			<div class="card kt animated kbo-card" data-team="KT WIZ"></div>
		</div>
		<div class="three-d-wrapper">
			<div class="card samsung animated kbo-card" data-team="SAMSUNG LIONS"></div>
		</div>
	</section>
</main>

<section class="promo">
	<p>
		<a href="/demo">
			완전한 데모 페이지 보기<br />
			<div class="demo-preview">
				<span>🎴 KBO 홀로그래픽 카드 데모</span>
			</div>
		</a>
	</p>
</section>

<style>
	/* how2code.md 완벽 구현 스타일 */
	:global(html, body) {
		height: 100%;
		background-color: #333844;
		padding: 0;
		z-index: 1;
		transform: translate3d(0, 0, 0.1px);
	}

	:global(body) {
		color: white;
		background-color: #333844;
		font-family: 'Heebo', sans-serif;
		text-align: center;
	}

	h1,
	h2 {
		display: block;
		margin: 30px 0;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
	}

	p {
		margin-top: 5px;
		font-weight: 200;
		font-size: 18px;
		padding: 1em;
		background: rgba(0, 0, 0, 0.3);
		margin-top: 0;
	}

	p a {
		color: cyan;
		text-decoration: none;
	}

	p a:hover {
		text-decoration: underline;
	}

	#app {
		position: relative;
		min-height: 100vh;
	}

	.demo,
	.cards,
	.kbo-cards {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		position: relative;
		z-index: 1;
		margin: 40px 0;
	}

	.demo {
		flex-direction: row;
		justify-content: center;
		gap: 20px;
	}

	@media screen and (min-width: 600px) {
		.cards,
		.kbo-cards {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	/* 데모 카드 스타일 */
	.demo .card {
		background-image: var(--back);
		font-size: 2vh;
		width: 20vh;
		height: 27.5vh;
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.4),
			0 25px 15px -10px rgba(0, 0, 0, 0.5);
		animation: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.demo .card:nth-of-type(1):before,
	.demo .card:nth-of-type(1):after {
		display: none;
	}

	.demo .card:nth-of-type(2) {
		background: none;
	}
	.demo .card:nth-of-type(2):before {
		display: none;
	}

	.demo .card:nth-of-type(3) {
		background: none;
	}
	.demo .card:nth-of-type(3):after {
		display: none;
	}

	.operator {
		display: inline-block;
		vertical-align: middle;
		font-size: 6vh;
		color: white;
		font-weight: bold;
	}

	.promo {
		margin-top: 50px;
		padding: 40px 20px;
	}

	.demo-preview {
		margin-top: 10px;
		max-width: 80%;
		padding: 40px 20px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		color: white;
		font-size: 18px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
	}
	
	.demo-preview:hover {
		transform: translateY(-2px);
	}

	/* how2code.md 완벽 구현 - .card 클래스 스타일 */
	:global(.card) {
		width: 71.5vw;
		height: 100vw;

		position: relative;
		overflow: hidden;
		margin: 20px;
		z-index: 10;
		touch-action: none;
		isolation: isolate;

		border-radius: 5% / 3.5%;
		box-shadow:
			-5px -5px 5px -5px var(--color1, rgb(0, 231, 255)),
			5px 5px 5px -5px var(--color2, rgb(255, 0, 231)),
			-7px -7px 10px -5px transparent,
			7px 7px 10px -5px transparent,
			0 0 5px 0px rgba(255, 255, 255, 0),
			0 55px 35px -20px rgba(0, 0, 0, 0.5);

		transition:
			transform 0.5s ease,
			box-shadow 0.2s ease;
		will-change: transform, filter;

		background-color: #040712;
		background-image: var(--front);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: 50% 50%;
		transform-origin: center;
	}

	@media screen and (min-width: 600px) {
		:global(.card) {
			width: clamp(12.9vw, 61vh, 18vw);
			height: clamp(18vw, 85vh, 25.2vw);
		}
	}

	:global(.card:hover) {
		box-shadow:
			-20px -20px 30px -25px var(--color1, rgb(0, 231, 255)),
			20px 20px 30px -25px var(--color2, rgb(255, 0, 231)),
			-7px -7px 10px -5px var(--color1, rgb(0, 231, 255)),
			7px 7px 10px -5px var(--color2, rgb(255, 0, 231)),
			0 0 13px 4px rgba(255, 255, 255, 0.3),
			0 55px 35px -20px rgba(0, 0, 0, 0.5);
	}

	/* 홀로그래픽 효과 레이어 */
	:global(.card:before),
	:global(.card:after) {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		background-repeat: no-repeat;
		opacity: 0.5;
		mix-blend-mode: color-dodge;
		transition: all 0.33s ease;
	}

	:global(.card:before) {
		background-position: 50% 50%;
		background-size: 300% 300%;
		background-image: linear-gradient(
			115deg,
			transparent 0%,
			var(--color1, rgb(0, 231, 255)) 25%,
			transparent 47%,
			transparent 53%,
			var(--color2, rgb(255, 0, 231)) 75%,
			transparent 100%
		);
		opacity: 0.5;
		filter: brightness(0.5) contrast(1);
		z-index: 1;
	}

	:global(.card:after) {
		opacity: 1;
		background-image:
			url('https://assets.codepen.io/13471/sparkles.gif'),
			url('https://assets.codepen.io/13471/holo.png'),
			linear-gradient(
				125deg,
				#ff008450 15%,
				#fca40040 30%,
				#ffff0030 40%,
				#00ff8a20 60%,
				#00cfff40 70%,
				#cc4cfa50 85%
			);
		background-position: 50% 50%;
		background-size: 160%;
		background-blend-mode: overlay;
		z-index: 2;
		filter: brightness(1) contrast(1);
		transition: all 0.33s ease;
		mix-blend-mode: color-dodge;
		opacity: 0.75;
	}

	:global(.card.active:after),
	:global(.card:hover:after) {
		filter: brightness(1) contrast(1);
		opacity: 1;
	}

	:global(.card.active),
	:global(.card:hover) {
		animation: none;
		transition: box-shadow 0.1s ease-out;
	}

	:global(.card.active:before),
	:global(.card:hover:before) {
		animation: none;
		background-image: linear-gradient(
			110deg,
			transparent 25%,
			var(--color1, rgb(0, 231, 255)) 48%,
			var(--color2, rgb(255, 0, 231)) 52%,
			transparent 75%
		);
		background-position: 50% 50%;
		background-size: 250% 250%;
		opacity: 0.88;
		filter: brightness(0.66) contrast(1.33);
		transition: none;
	}

	/* 자동 애니메이션 */
	:global(.card.animated) {
		transition: none;
		animation: holoCard 12s ease 0s 1;
	}

	:global(.card.animated:before) {
		transition: none;
		animation: holoGradient 12s ease 0s 1;
	}

	:global(.card.animated:after) {
		transition: none;
		animation: holoSparkle 12s ease 0s 1;
	}

	/* 키프레임 애니메이션 */
	@keyframes holoSparkle {
		0%,
		100% {
			opacity: 0.75;
			background-position: 50% 50%;
			filter: brightness(1.2) contrast(1.25);
		}
		5%,
		8% {
			opacity: 1;
			background-position: 40% 40%;
			filter: brightness(0.8) contrast(1.2);
		}
		13%,
		16% {
			opacity: 0.5;
			background-position: 50% 50%;
			filter: brightness(1.2) contrast(0.8);
		}
		35%,
		38% {
			opacity: 1;
			background-position: 60% 60%;
			filter: brightness(1) contrast(1);
		}
		55% {
			opacity: 0.33;
			background-position: 45% 45%;
			filter: brightness(1.2) contrast(1.25);
		}
	}

	@keyframes holoGradient {
		0%,
		100% {
			opacity: 0.5;
			background-position: 50% 50%;
			filter: brightness(0.5) contrast(1);
		}
		5%,
		9% {
			background-position: 100% 100%;
			opacity: 1;
			filter: brightness(0.75) contrast(1.25);
		}
		13%,
		17% {
			background-position: 0% 0%;
			opacity: 0.88;
		}
		35%,
		39% {
			background-position: 100% 100%;
			opacity: 1;
			filter: brightness(0.5) contrast(1);
		}
		55% {
			background-position: 0% 0%;
			opacity: 1;
			filter: brightness(0.75) contrast(1.25);
		}
	}

	@keyframes holoCard {
		0%,
		100% {
			transform: rotateZ(0deg) rotateX(0deg) rotateY(0deg);
		}
		5%,
		8% {
			transform: rotateZ(0deg) rotateX(6deg) rotateY(-20deg);
		}
		13%,
		16% {
			transform: rotateZ(0deg) rotateX(-9deg) rotateY(32deg);
		}
		35%,
		38% {
			transform: rotateZ(3deg) rotateX(12deg) rotateY(20deg);
		}
		55% {
			transform: rotateZ(-3deg) rotateX(-12deg) rotateY(-27deg);
		}
	}

	/* 3D Wrapper */
	:global(.three-d-wrapper) {
		perspective: 750px;
		isolation: isolate;
		transform: translate3d(0.1px, 0.1px, 0.1px);
	}

	/* 포켓몬 카드 스타일 */
	:global(.card.charizard) {
		--color1: #fac;
		--color2: #ddccaa;
	}

	:global(.card.pika) {
		--color1: #54a29e;
		--color2: #a79d66;
	}

	:global(.card.mewtwo) {
		--color1: #efb2fb;
		--color2: #acc6f8;
	}

	:global(.card.eevee) {
		--color1: #ec9bb6;
		--color2: #ccac6f;
		--color3: #69e4a5;
		--color4: #8ec5d6;
		--color5: #b98cce;
	}

	:global(.card.eevee:hover) {
		box-shadow:
			0 0 30px -5px white,
			0 0 10px -2px white,
			0 55px 35px -20px rgba(0, 0, 0, 0.5);
	}

	:global(.card.eevee:hover:before),
	:global(.card.eevee.active:before) {
		background-image: linear-gradient(
			115deg,
			transparent 20%,
			var(--color1) 36%,
			var(--color2) 43%,
			var(--color3) 50%,
			var(--color4) 57%,
			var(--color5) 64%,
			transparent 80%
		);
	}

	/* KBO 구단별 컬러 */
	:global(.card.lg) {
		--color1: #c41e3a;
		--color2: #ff69b4;
		background: linear-gradient(135deg, #c41e3a, #ff69b4);
	}

	:global(.card.doosan) {
		--color1: #131230;
		--color2: #4169e1;
		background: linear-gradient(135deg, #131230, #4169e1);
	}

	:global(.card.kt) {
		--color1: #000000;
		--color2: #ff0000;
		background: linear-gradient(135deg, #000000, #ff0000);
	}

	:global(.card.samsung) {
		--color1: #074ca1;
		--color2: #87ceeb;
		background: linear-gradient(135deg, #074ca1, #87ceeb);
	}
	
	/* KBO 카드 텍스트 오버레이 */
	:global(.kbo-card::after) {
		content: attr(data-team);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: clamp(12px, 2vw, 18px);
		font-weight: 700;
		text-align: center;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
		z-index: 5;
		pointer-events: none;
		mix-blend-mode: normal;
		opacity: 0.9;
	}

	/* 반응형 디자인 */
	@media (max-width: 768px) {
		.cards,
		.kbo-cards {
			flex-direction: column;
			gap: 20px;
		}

		.demo {
			flex-direction: column;
			gap: 10px;
		}

		.demo .card {
			width: 15vh;
			height: 20vh;
		}

		.operator {
			font-size: 4vh;
		}

		p {
			font-size: 16px;
			padding: 0.8em;
		}
	}

	@media (max-width: 480px) {
		.demo .card {
			width: 12vh;
			height: 16vh;
		}

		.operator {
			font-size: 3vh;
		}
	}
</style>
