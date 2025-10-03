<script lang="ts">
	import { onMount } from 'svelte';
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';

	let testResults: string[] = [];
	let cardRef: any;

	function addResult(test: string, passed: boolean) {
		testResults = [...testResults, `${passed ? '✅' : '❌'} ${test}`];
	}

	onMount(() => {
		// Test 1: Component mounts without errors
		addResult('Component mounts successfully', true);

		// Test 2: Card state management
		setTimeout(() => {
			const cardElement = document.querySelector('.enhanced-card-container');
			addResult('Card container element exists', !!cardElement);
		}, 100);

		// Test 3: Event handling
		setTimeout(() => {
			const cardElement = document.querySelector('.enhanced-card-container');
			if (cardElement) {
				// Simulate mouse enter
				const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
				cardElement.dispatchEvent(mouseEnterEvent);
				
				// Check if active class is applied
				setTimeout(() => {
					const activeCard = document.querySelector('.enhanced-card.active');
					addResult('Mouse enter activates holographic effect', !!activeCard);
				}, 50);
			}
		}, 200);

		// Test 4: Click handling
		setTimeout(() => {
			const cardElement = document.querySelector('.enhanced-card-container');
			if (cardElement) {
				const clickEvent = new MouseEvent('click', { bubbles: true });
				cardElement.dispatchEvent(clickEvent);
				
				// Check if flip animation starts
				setTimeout(() => {
					const flippedCard = document.querySelector('.enhanced-card-inner.flipped');
					addResult('Click triggers flip animation', !!flippedCard);
				}, 100);
			}
		}, 400);
	});

	// Event handlers for testing
	function handleFlip(event: CustomEvent) {
		addResult(`Card flip event fired: ${event.detail.isFlipped ? 'flipped' : 'unflipped'}`, true);
	}

	function handleHover(event: CustomEvent) {
		addResult(`Card hover event fired: ${event.detail.isHovering ? 'hovering' : 'not hovering'}`, true);
	}

	function handleAnimationStart(event: CustomEvent) {
		addResult('Animation start event fired', true);
	}

	function handleAnimationEnd(event: CustomEvent) {
		addResult('Animation end event fired', true);
	}
</script>

<svelte:head>
	<title>Enhanced Card Integration Test</title>
</svelte:head>

<main>
	<h1>Enhanced Card Integration Test</h1>
	<p>This page tests the enhanced card component functionality automatically.</p>

	<section class="test-card">
		<h2>Test Card</h2>
		<EnhancedCard
			bind:this={cardRef}
			frontImage="https://assets.codepen.io/13471/charizard-gx.webp"
			cardType="pokemon"
			holographicStyle="basic"
			enableFlip={true}
			animationSpeed={600}
			on:flip={handleFlip}
			on:hover={handleHover}
			on:animationStart={handleAnimationStart}
			on:animationEnd={handleAnimationEnd}
		/>
	</section>

	<section class="test-results">
		<h2>Test Results</h2>
		<div class="results-list">
			{#each testResults as result}
				<div class="result-item">{result}</div>
			{/each}
			{#if testResults.length === 0}
				<div class="result-item">Running tests...</div>
			{/if}
		</div>
	</section>

	<section class="manual-tests">
		<h2>Manual Tests</h2>
		<p>Try these manual interactions:</p>
		<ul>
			<li>Hover over the card to see holographic effects</li>
			<li>Click the card to flip it</li>
			<li>Try clicking rapidly to test animation lock</li>
			<li>Test on mobile devices for touch interactions</li>
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

	h1, h2 {
		text-align: center;
		margin-bottom: 1rem;
	}

	p {
		text-align: center;
		margin-bottom: 2rem;
		opacity: 0.8;
	}

	.test-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 3rem;
	}

	.test-results {
		max-width: 600px;
		margin: 0 auto 3rem;
		background: rgba(0, 0, 0, 0.3);
		padding: 2rem;
		border-radius: 12px;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.result-item {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.manual-tests {
		max-width: 600px;
		margin: 0 auto;
		background: rgba(0, 0, 0, 0.3);
		padding: 2rem;
		border-radius: 12px;
	}

	.manual-tests ul {
		list-style-type: disc;
		padding-left: 2rem;
	}

	.manual-tests li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		main {
			padding: 1rem;
		}

		.test-results,
		.manual-tests {
			padding: 1.5rem;
		}
	}
</style>