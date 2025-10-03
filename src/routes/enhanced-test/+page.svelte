<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import '../../enhanced-holographic-effects.css';

	let styleElement: HTMLStyleElement;

	onMount(() => {
		if (!browser) return;

		// 동적 스타일 엘리먼트 생성
		styleElement = document.createElement('style');
		styleElement.className = 'hover';
		document.head.appendChild(styleElement);

		// 카드 이벤트 리스너 등록
		const cards = document.querySelectorAll('.enhanced-card');

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

	// 마우스 이벤트 처리
	function handleMouseMove(e: Event) {
		if (!styleElement) return;

		const mouseEvent = e as MouseEvent;
		const card = mouseEvent.currentTarget as HTMLElement;
		const pos = [mouseEvent.offsetX, mouseEvent.offsetY];

		// 수학 공식 계산
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

		// 스타일 태그에 CSS 적용
		const style = `
      .enhanced-card:hover:before { ${grad_pos} }  /* gradient */
      .enhanced-card:hover:after { ${sprk_pos} ${opc} }   /* sparkles */ 
    `;

		// 클래스 및 스타일 적용
		const allCards = document.querySelectorAll('.enhanced-card');
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
      .enhanced-card:hover:before { ${grad_pos} }
      .enhanced-card:hover:after { ${sprk_pos} ${opc} }
    `;

		const allCards = document.querySelectorAll('.enhanced-card');
		allCards.forEach((c) => c.classList.remove('active'));
		card.classList.remove('animated');
		card.classList.add('active');
		card.style.cssText = tf;
		styleElement.innerHTML = style;
	}

	// 마우스 아웃 처리
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
	<title>개선된 홀로그래픽 효과 테스트 - 이미지 가시성 유지</title>
</svelte:head>

<main id="app">
	<h1>개선된 홀로그래픽 카드 효과</h1>
	<p>
		이미지 가시성을 유지하면서 홀로그래픽 효과를 제공하는 개선된 시스템입니다.<br />
		<strong>개선사항:</strong> color-dodge → overlay/soft-light 블렌드 모드 변경
	</p>

	<section class="comparison">
		<div class="comparison-section">
			<h2>기존 방식 (color-dodge)</h2>
			<div class="three-d-wrapper">
				<div
					class="card charizard animated"
					style="--front: url('https://assets.codepen.io/13471/charizard-gx.webp')"
				></div>
			</div>
			<p class="description">이미지가 사라지거나 과도하게 변형됨</p>
		</div>

		<div class="comparison-section">
			<h2>개선된 방식 (overlay/soft-light)</h2>
			<div class="three-d-wrapper">
				<div
					class="enhanced-card charizard animated"
					style="--front: url('https://assets.codepen.io/13471/charizard-gx.webp')"
				></div>
			</div>
			<p class="description">이미지 가시성 유지하면서 홀로그래픽 효과 제공</p>
		</div>
	</section>

	<section class="enhanced-cards">
		<h2>개선된 포켓몬 카드</h2>
		<div class="cards-grid">
			<div class="three-d-wrapper">
				<div
					class="enhanced-card charizard animated"
					style="--front: url('https://assets.codepen.io/13471/charizard-gx.webp')"
				></div>
			</div>
			<div class="three-d-wrapper">
				<div
					class="enhanced-card pika animated"
					style="--front: url('https://assets.codepen.io/13471/pikachu-gx.webp')"
				></div>
			</div>
			<div class="three-d-wrapper">
				<div
					class="enhanced-card eevee animated"
					style="--front: url('https://assets.codepen.io/13471/eevee-gx.webp')"
				></div>
			</div>
			<div class="three-d-wrapper">
				<div
					class="enhanced-card mewtwo animated"
					style="--front: url('https://assets.codepen.io/13471/mewtwo-gx.webp')"
				></div>
			</div>
		</div>
	</section>

	<section class="enhanced-kbo-cards">
		<h2>개선된 KBO 카드</h2>
		<div class="cards-grid">
			<div class="three-d-wrapper">
				<div class="enhanced-card lg animated kbo-card" data-team="LG TWINS"></div>
			</div>
			<div class="three-d-wrapper">
				<div class="enhanced-card doosan animated kbo-card" data-team="DOOSAN BEARS"></div>
			</div>
			<div class="three-d-wrapper">
				<div class="enhanced-card kt animated kbo-card" data-team="KT WIZ"></div>
			</div>
			<div class="three-d-wrapper">
				<div class="enhanced-card samsung animated kbo-card" data-team="SAMSUNG LIONS"></div>
			</div>
		</div>
	</section>

	<style class="hover"></style>
</main>

<style>
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

	h1, h2 {
		display: block;
		margin: 30px 0;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
	}

	h2 {
		font-size: clamp(1.2rem, 3vw, 2rem);
	}

	p {
		margin-top: 5px;
		font-weight: 200;
		font-size: 18px;
		padding: 1em;
		background: rgba(0, 0, 0, 0.3);
		margin-top: 0;
	}

	#app {
		position: relative;
		min-height: 100vh;
		padding: 20px;
	}

	.comparison {
		display: flex;
		flex-direction: column;
		gap: 40px;
		margin: 40px 0;
		padding: 20px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
	}

	@media screen and (min-width: 768px) {
		.comparison {
			flex-direction: row;
			justify-content: space-around;
		}
	}

	.comparison-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.description {
		font-size: 14px;
		color: #ccc;
		background: rgba(0, 0, 0, 0.5);
		padding: 10px;
		border-radius: 8px;
		margin: 0;
	}

	.enhanced-cards,
	.enhanced-kbo-cards {
		margin: 40px 0;
	}

	.cards-grid {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		gap: 20px;
		margin: 20px 0;
	}

	@media screen and (min-width: 600px) {
		.cards-grid {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	/* 3D Wrapper */
	:global(.three-d-wrapper) {
		perspective: 750px;
		isolation: isolate;
		transform: translate3d(0.1px, 0.1px, 0.1px);
	}

	/* 기존 카드 스타일 (비교용) */
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
		transition: transform 0.5s ease, box-shadow 0.2s ease;
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
</style>