<script lang="ts">
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';

	// Card event handlers
	function handleCardFlip(event: CustomEvent) {
		console.log('Card flipped:', event.detail);
	}

	function handleCardHover(event: CustomEvent) {
		console.log('Card hover:', event.detail);
	}

	function handleAnimationStart(event: CustomEvent) {
		console.log('Animation started:', event.detail);
	}

	function handleAnimationEnd(event: CustomEvent) {
		console.log('Animation ended:', event.detail);
	}

	// Touch-specific event handlers
	function handleTouchStart(event: CustomEvent) {
		console.log('Touch started:', event.detail);
	}

	function handleTouchMove(event: CustomEvent) {
		console.log('Touch moved:', event.detail);
	}

	function handleTouchEnd(event: CustomEvent) {
		console.log('Touch ended:', event.detail);
	}

	function handleTap(event: CustomEvent) {
		console.log('Tap detected:', event.detail);
	}

	function handleTouchHold(event: CustomEvent) {
		console.log('Touch hold detected:', event.detail);
	}
</script>

<svelte:head>
	<title>Enhanced Card Component Test</title>
</svelte:head>

<main>
	<h1>Enhanced Card Component Test</h1>
	<p>Click cards to flip them. Hover for holographic effects.</p>

	<section class="card-grid">
		<!-- Pokemon Cards -->
		<div class="card-wrapper">
			<h3>Pokemon Card (Touch Test)</h3>
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/charizard-gx.webp"
				cardType="pokemon"
				holographicStyle="basic"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
				on:touchStart={handleTouchStart}
				on:touchMove={handleTouchMove}
				on:touchEnd={handleTouchEnd}
				on:tap={handleTap}
				on:touchHold={handleTouchHold}
			/>
		</div>

		<div class="card-wrapper">
			<h3>Pikachu Card</h3>
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/pikachu-gx.webp"
				cardType="pokemon"
				holographicStyle="cosmic"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			/>
		</div>

		<!-- KBO Cards -->
		<div class="card-wrapper">
			<h3>LG Twins Card</h3>
			<EnhancedCard
				frontImage="/images/kbo/lg-player.webp"
				cardType="kbo"
				teamOrType="LG TWINS"
				holographicStyle="rainbow"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="kbo-front-content">
					<div class="player-name">홍길동</div>
					<div class="player-position">내야수</div>
				</div>
			</EnhancedCard>
		</div>

		<div class="card-wrapper">
			<h3>Doosan Bears Card</h3>
			<EnhancedCard
				frontImage="/images/kbo/doosan-player.webp"
				cardType="kbo"
				teamOrType="DOOSAN BEARS"
				holographicStyle="aurora"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="kbo-front-content">
					<div class="player-name">김철수</div>
					<div class="player-position">투수</div>
				</div>
			</EnhancedCard>
		</div>

		<!-- Custom Cards -->
		<div class="card-wrapper">
			<h3>Custom Card</h3>
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/eevee-gx.webp"
				cardType="custom"
				holographicStyle="galaxy"
				enableFlip={true}
				animationSpeed={800}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="custom-front-content">
					<div class="custom-title">Special Edition</div>
				</div>
				<div slot="back-content" class="custom-back-content">
					<div class="custom-back-title">Holographic</div>
					<div class="custom-back-subtitle">Limited Edition</div>
				</div>
			</EnhancedCard>
		</div>

		<div class="card-wrapper">
			<h3>Secret Rare Card</h3>
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/mewtwo-gx.webp"
				cardType="custom"
				holographicStyle="secret"
				enableFlip={true}
				animationSpeed={500}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="front-content" class="secret-front-content">
					<div class="secret-badge">★ SECRET ★</div>
				</div>
			</EnhancedCard>
		</div>
	</section>

	<section class="controls">
		<h2>Card Features</h2>
		<ul>
			<li>✅ Enhanced holographic effects with improved image visibility</li>
			<li>✅ Click to flip cards with Y-axis rotation</li>
			<li>✅ State management (isFlipped, isHovering, isAnimating)</li>
			<li>✅ Animation lock prevents double-clicks during flip</li>
			<li>✅ Touch and mouse event integration with duplication prevention</li>
			<li>✅ Touch gestures: tap to flip, touch-and-hold for holographic effects</li>
			<li>✅ Visual feedback with loading indicator</li>
			<li>✅ Customizable holographic styles and animation speeds</li>
			<li>✅ Card type-specific back designs</li>
			<li>✅ Mobile-optimized touch interactions</li>
		</ul>
	</section>
</main>

<style>
	main {
		padding: 2rem;
		background-color: #333844;
		color: white;
		min-height: 100vh;
		font-family: 'Heebo', sans-serif;
	}

	h1 {
		text-align: center;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		margin-bottom: 1rem;
	}

	p {
		text-align: center;
		font-size: 1.1rem;
		margin-bottom: 2rem;
		opacity: 0.8;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto 3rem;
	}

	.card-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.card-wrapper h3 {
		margin: 0;
		font-size: 1.2rem;
		text-align: center;
	}

	/* Card Content Styles */
	.kbo-front-content {
		position: absolute;
		bottom: 20px;
		left: 20px;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.player-name {
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 0.25rem;
	}

	.player-position {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.custom-front-content {
		position: absolute;
		top: 20px;
		right: 20px;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.custom-title {
		font-size: 1rem;
		font-weight: bold;
		background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.custom-back-content {
		text-align: center;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.custom-back-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.custom-back-subtitle {
		font-size: 1rem;
		opacity: 0.8;
	}

	.secret-front-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.secret-badge {
		background: linear-gradient(45deg, #ffd700, #ffed4e);
		color: #333;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: bold;
		font-size: 0.9rem;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.controls {
		max-width: 800px;
		margin: 0 auto;
		background: rgba(0, 0, 0, 0.3);
		padding: 2rem;
		border-radius: 12px;
	}

	.controls h2 {
		margin-top: 0;
		margin-bottom: 1rem;
		text-align: center;
	}

	.controls ul {
		list-style: none;
		padding: 0;
	}

	.controls li {
		padding: 0.5rem 0;
		font-size: 1rem;
		line-height: 1.4;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.card-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 1.5rem;
		}

		main {
			padding: 1rem;
		}

		.controls {
			padding: 1.5rem;
		}
	}
</style>