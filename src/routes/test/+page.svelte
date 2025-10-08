<script lang="ts">
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';
	import UnifiedHolographicCard from '$lib/components/unified/UnifiedHolographicCard.svelte';
	import FPSCounterOverlay from '$lib/components/FPSCounterOverlay.svelte';
	import type { UnifiedCard } from '$lib/types/unified';
	import { dev } from '$app/environment';

	// Enhanced card event handlers
	function handleCardFlip(event: CustomEvent) {
		console.log('Card flipped:', event.detail);
	}

	function handleCardHover(event: CustomEvent) {
		console.log('Card hover:', event.detail);
	}

	function handleCardTap(event: CustomEvent) {
		console.log('Card tapped:', event.detail);
	}

	function handleAnimationStart(event: CustomEvent) {
		console.log('Animation started:', event.detail);
	}

	function handleAnimationEnd(event: CustomEvent) {
		console.log('Animation ended:', event.detail);
	}

	// Unified card demo data (Phase 3 integration test)
	const unifiedTestCard: UnifiedCard = {
		id: 'unified-test-001',
		title: 'Unified Holographic Card',
		holographic: {
			image: 'https://assets.codepen.io/13471/charizard-gx.webp',
			backImage: '',
			effect: 'soft-light',
			intensity: 80,
			isFlipped: false,
			animationDuration: 600
		},
		photocard: {
			rarity: 'legendary',
			season: '2025',
			stats: {
				totalViews: 1520,
				uniqueCollectors: 342,
				completionRate: 87.5
			},
			collections: ['test-collection']
		},
		community: {
			creator: 'test-user',
			isPublic: true,
			tags: ['phase-3', 'integration-test', 'unified-card'],
			metadata: {
				likes: 125,
				downloads: 89,
				rating: 4.8,
				ratingCount: 45
			}
		},
		context: 'test'
	};
</script>

<svelte:head>
	<title>향상된 홀로그래픽 카드 테스트 - 카드 뒤집기 및 개선된 효과</title>
</svelte:head>

<!-- Enhanced card system implementation -->
<main id="app">
	<p>
		향상된 홀로그래픽 카드 시스템 - 이미지 가시성 유지 + 카드 뒤집기 기능<br />
		<strong>개선사항:</strong> 클릭으로 카드 뒤집기, 터치 지원, 개선된 홀로그래픽 효과
	</p>

	<h1>향상된 홀로그래픽 카드 시스템</h1>

	<section class="cards">
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/charizard-gx.webp"
				cardType="pokemon"
				teamOrType="charizard"
				holographicStyle="basic"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			/>
		</div>
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/pikachu-gx.webp"
				cardType="pokemon"
				teamOrType="pikachu"
				holographicStyle="cosmic"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			/>
		</div>
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/eevee-gx.webp"
				cardType="pokemon"
				teamOrType="eevee"
				holographicStyle="rainbow"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			/>
		</div>
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/mewtwo-gx.webp"
				cardType="pokemon"
				teamOrType="mewtwo"
				holographicStyle="aurora"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			/>
		</div>
	</section>

	<style class="hover"></style>

	<section class="demo">
		<div class="demo-card enhanced-demo" style="--front: var(--back)"></div>
		<span class="operator">+</span>
		<div class="demo-card enhanced-demo" style="--front: none"><span>overlay</span></div>
		<span class="operator">+</span>
		<div class="demo-card enhanced-demo" style="--front: none"><span>soft-light</span></div>
	</section>

	<!-- Phase 3: Unified Holographic Card Integration Test -->
	<h2>Phase 3: 통합 홀로그래픽 카드 시스템</h2>
	<p style="background: rgba(0, 255, 200, 0.1); border-left: 4px solid #00ffc8; padding: 1em;">
		<strong>✅ Phase 3 Integration:</strong> UnifiedHolographicCard 컴포넌트는 Phase 1, 2, 4의 데이터를 통합하며 v2-prototype의 고급 3D 효과를 포함합니다.<br />
		<strong>Features:</strong> 7가지 홀로그래픽 효과, 희귀도별 글로우, 3D 회전 (±15도), Context-aware 렌더링
	</p>

	<section class="cards">
		<div class="three-d-wrapper">
			<UnifiedHolographicCard
				card={unifiedTestCard}
				context="test"
				size="large"
				enableHolographic={true}
				enableFlip={true}
			/>
		</div>
	</section>

	<!-- KBO 구단별 카드 섹션 -->
	<h2>KBO 구단별 홀로그래픽 카드 (Phase 1 Legacy)</h2>

	<section class="kbo-cards">
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/charizard-gx.webp"
				cardType="kbo"
				teamOrType="LG"
				holographicStyle="basic"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="kbo-team-content">
					<h3>LG TWINS</h3>
					<div class="team-logo">🦁</div>
				</div>
			</EnhancedCard>
		</div>
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/pikachu-gx.webp"
				cardType="kbo"
				teamOrType="DOOSAN"
				holographicStyle="cosmic"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="kbo-team-content">
					<h3>DOOSAN BEARS</h3>
					<div class="team-logo">🐻</div>
				</div>
			</EnhancedCard>
		</div>
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/eevee-gx.webp"
				cardType="kbo"
				teamOrType="KT"
				holographicStyle="galaxy"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="kbo-team-content">
					<h3>KT WIZ</h3>
					<div class="team-logo">🧙‍♂️</div>
				</div>
			</EnhancedCard>
		</div>
		<div class="three-d-wrapper">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/mewtwo-gx.webp"
				cardType="kbo"
				teamOrType="SAMSUNG"
				holographicStyle="secret"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:tap={handleCardTap}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="kbo-team-content">
					<h3>SAMSUNG LIONS</h3>
					<div class="team-logo">🦁</div>
				</div>
			</EnhancedCard>
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
	.demo-card {
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
		border-radius: 5% / 3.5%;
		background-color: #040712;
		color: white;
		font-weight: bold;
	}

	.demo-card:nth-of-type(1):before,
	.demo-card:nth-of-type(1):after {
		display: none;
	}

	.demo-card:nth-of-type(2) {
		background: none;
	}

	.demo-card:nth-of-type(3) {
		background: none;
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

	/* Enhanced card system is now handled by the EnhancedCard component */

	/* Holographic effects are now handled by the EnhancedCard component */

	/* Keyframe animations are now handled by the EnhancedCard component */

	/* 3D Wrapper */
	:global(.three-d-wrapper) {
		perspective: 750px;
		isolation: isolate;
		transform: translate3d(0.1px, 0.1px, 0.1px);
	}

	/* KBO Team Content Styles */
	:global(.kbo-team-content) {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: white;
		text-align: center;
		z-index: 10;
		pointer-events: none;
	}

	:global(.kbo-team-content h3) {
		font-size: clamp(14px, 2.5vw, 20px);
		font-weight: 700;
		margin: 0 0 10px 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
		letter-spacing: 1px;
	}

	:global(.kbo-team-content .team-logo) {
		font-size: clamp(24px, 4vw, 36px);
		margin-top: 10px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
	}

	/* Card-specific styles are now handled by the EnhancedCard component */

	/* Browser compatibility and performance optimizations are handled by the EnhancedCard component */

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

		.demo .demo-card {
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
		.demo .demo-card {
			width: 12vh;
			height: 16vh;
		}

		.operator {
			font-size: 3vh;
		}
	}
</style>

<!-- FPS Counter Overlay for Development Mode -->
{#if dev}
	<FPSCounterOverlay 
		enabled={true}
		position="top-right"
		updateInterval={100}
		showDetails={true}
		autoHide={false}
	/>
{/if}
