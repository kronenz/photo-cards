<script lang="ts">
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';

	let testResults: string[] = [];
	let currentTest = '';

	function addTestResult(result: string) {
		testResults = [...testResults, `${new Date().toLocaleTimeString()}: ${result}`];
	}

	function handleCardFlip(event: CustomEvent) {
		const isFlipped = event.detail.isFlipped;
		addTestResult(`Card flipped to ${isFlipped ? 'BACK' : 'FRONT'} side`);
		currentTest = isFlipped ? 'Testing back-side holographic effects' : 'Testing front-side holographic effects';
	}

	function handleCardHover(event: CustomEvent) {
		const isHovering = event.detail.isHovering;
		if (isHovering) {
			addTestResult(`Holographic effect activated on ${currentTest.includes('back') ? 'BACK' : 'FRONT'} side`);
		} else {
			addTestResult(`Holographic effect deactivated`);
		}
	}

	function handleAnimationStart(event: CustomEvent) {
		addTestResult('Flip animation started - holographic effects should be temporarily disabled');
	}

	function handleAnimationEnd(event: CustomEvent) {
		addTestResult('Flip animation ended - holographic effects should be re-enabled if hovering');
	}

	function clearResults() {
		testResults = [];
	}
</script>

<svelte:head>
	<title>Back-Side Holographic Effects Test</title>
</svelte:head>

<main>
	<h1>Back-Side Holographic Effects Test</h1>
	<p>This test verifies that holographic effects work on both front and back sides of cards.</p>

	<section class="test-instructions">
		<h2>Test Instructions</h2>
		<ol>
			<li><strong>Front Side Test:</strong> Hover over the card to see holographic effects on the front</li>
			<li><strong>Flip Test:</strong> Click the card to flip it to the back side</li>
			<li><strong>Back Side Test:</strong> Hover over the flipped card to see holographic effects on the back</li>
			<li><strong>Transition Test:</strong> Hover while clicking to test effect transitions during animation</li>
			<li><strong>Multiple Flip Test:</strong> Flip back and forth while hovering to test smooth transitions</li>
		</ol>
	</section>

	<section class="test-cards">
		<div class="card-test-group">
			<h3>Pokemon Card - Basic Holographic Style</h3>
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
			/>
		</div>

		<div class="card-test-group">
			<h3>KBO Card - Rainbow Holographic Style</h3>
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
				<div slot="back-content" class="kbo-back-content">
					<div class="team-logo">LG TWINS</div>
					<div class="team-year">2024</div>
				</div>
			</EnhancedCard>
		</div>

		<div class="card-test-group">
			<h3>Custom Card - Galaxy Holographic Style</h3>
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/eevee-gx.webp"
				cardType="custom"
				holographicStyle="galaxy"
				enableFlip={true}
				animationSpeed={600}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
				on:animationStart={handleAnimationStart}
				on:animationEnd={handleAnimationEnd}
			>
				<div slot="back-content" class="custom-back-content">
					<div class="holographic-pattern">✨</div>
					<div class="back-title">HOLOGRAPHIC</div>
					<div class="back-subtitle">Special Edition</div>
				</div>
			</EnhancedCard>
		</div>
	</section>

	<section class="test-results">
		<div class="results-header">
			<h2>Test Results</h2>
			<button on:click={clearResults} class="clear-btn">Clear Results</button>
		</div>
		<div class="results-log">
			{#each testResults as result}
				<div class="result-item">{result}</div>
			{/each}
			{#if testResults.length === 0}
				<div class="no-results">No test results yet. Start interacting with the cards above.</div>
			{/if}
		</div>
	</section>

	<section class="expected-behavior">
		<h2>Expected Behavior</h2>
		<div class="behavior-grid">
			<div class="behavior-item">
				<h4>Front Side Holographic Effects</h4>
				<ul>
					<li>Gradient overlay follows mouse movement</li>
					<li>Sparkle effects respond to mouse position</li>
					<li>3D rotation based on mouse position</li>
					<li>Smooth intensity transitions</li>
				</ul>
			</div>
			<div class="behavior-item">
				<h4>Back Side Holographic Effects</h4>
				<ul>
					<li>Same gradient and sparkle effects as front</li>
					<li>Slightly adjusted positioning for back design</li>
					<li>Enhanced opacity for better visibility</li>
					<li>Smooth 3D rotation effects</li>
				</ul>
			</div>
			<div class="behavior-item">
				<h4>Transition Behavior</h4>
				<ul>
					<li>Effects disabled during flip animation</li>
					<li>Smooth re-activation after flip completes</li>
					<li>No effect duplication or interference</li>
					<li>Proper cleanup between transitions</li>
				</ul>
			</div>
		</div>
	</section>
</main>

<style>
	main {
		padding: 2rem;
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
		color: white;
		min-height: 100vh;
		font-family: 'Heebo', sans-serif;
	}

	h1 {
		text-align: center;
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		margin-bottom: 1rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	p {
		text-align: center;
		font-size: 1.1rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.test-instructions {
		background: rgba(255, 255, 255, 0.1);
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		backdrop-filter: blur(10px);
	}

	.test-instructions h2 {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.test-instructions ol {
		margin: 0;
		padding-left: 1.5rem;
	}

	.test-instructions li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.test-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.card-test-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 1.5rem;
		border-radius: 12px;
		backdrop-filter: blur(5px);
	}

	.card-test-group h3 {
		margin: 0;
		font-size: 1.1rem;
		text-align: center;
		opacity: 0.9;
	}

	/* Back content styles */
	.kbo-back-content {
		text-align: center;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.team-logo {
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.team-year {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.custom-back-content {
		text-align: center;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.holographic-pattern {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		animation: sparkle 2s ease-in-out infinite alternate;
	}

	.back-title {
		font-size: 1.3rem;
		font-weight: bold;
		margin-bottom: 0.25rem;
		background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.back-subtitle {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	@keyframes sparkle {
		0% { opacity: 0.6; transform: scale(1); }
		100% { opacity: 1; transform: scale(1.1); }
	}

	.test-results {
		background: rgba(0, 0, 0, 0.3);
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.results-header h2 {
		margin: 0;
	}

	.clear-btn {
		background: #ff6b6b;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s ease;
	}

	.clear-btn:hover {
		background: #ff5252;
	}

	.results-log {
		max-height: 300px;
		overflow-y: auto;
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 8px;
	}

	.result-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.no-results {
		text-align: center;
		opacity: 0.6;
		font-style: italic;
	}

	.expected-behavior {
		background: rgba(255, 255, 255, 0.05);
		padding: 1.5rem;
		border-radius: 12px;
		backdrop-filter: blur(5px);
	}

	.expected-behavior h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.behavior-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.behavior-item {
		background: rgba(255, 255, 255, 0.05);
		padding: 1rem;
		border-radius: 8px;
	}

	.behavior-item h4 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		color: #4ecdc4;
	}

	.behavior-item ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.behavior-item li {
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
		line-height: 1.3;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		main {
			padding: 1rem;
		}

		.test-cards {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.behavior-grid {
			grid-template-columns: 1fr;
		}

		.results-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
	}
</style>