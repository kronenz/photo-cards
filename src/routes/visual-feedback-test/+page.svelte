<script lang="ts">
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';
	import { onMount } from 'svelte';

	let testCards = [
		{
			id: 'pokemon-test',
			frontImage: 'https://assets.codepen.io/13471/pikachu.webp',
			cardType: 'pokemon' as const,
			teamOrType: 'electric',
			holographicStyle: 'basic' as const,
			title: 'Pokemon Card - Basic Holographic'
		},
		{
			id: 'kbo-test',
			frontImage: 'https://via.placeholder.com/300x420/c41e3a/ffffff?text=LG+TWINS',
			cardType: 'kbo' as const,
			teamOrType: 'lg',
			holographicStyle: 'cosmic' as const,
			title: 'KBO Card - LG Twins'
		},
		{
			id: 'custom-test',
			frontImage: 'https://via.placeholder.com/300x420/1a1a2e/ffffff?text=CUSTOM+CARD',
			cardType: 'custom' as const,
			teamOrType: 'custom',
			holographicStyle: 'rainbow' as const,
			title: 'Custom Card - Rainbow Effect'
		}
	];

	let feedbackLog: string[] = [];

	function logFeedback(message: string) {
		feedbackLog = [new Date().toLocaleTimeString() + ': ' + message, ...feedbackLog.slice(0, 9)];
	}

	function handleCardEvent(event: CustomEvent, cardId: string) {
		const eventType = event.type;
		const detail = event.detail;
		
		switch (eventType) {
			case 'hover':
				logFeedback(`${cardId}: ${detail.isHovering ? 'Hover started' : 'Hover ended'}`);
				break;
			case 'flip':
				logFeedback(`${cardId}: Flipped to ${detail.isFlipped ? 'back' : 'front'}`);
				break;
			case 'animationStart':
				logFeedback(`${cardId}: Animation started`);
				break;
			case 'animationEnd':
				logFeedback(`${cardId}: Animation ended`);
				break;
			case 'touchStart':
				logFeedback(`${cardId}: Touch started`);
				break;
			case 'touchEnd':
				logFeedback(`${cardId}: Touch ended (${detail.isTap ? 'tap' : 'release'})`);
				break;
			case 'tap':
				logFeedback(`${cardId}: Tap gesture detected`);
				break;
		}
	}

	onMount(() => {
		logFeedback('Visual feedback test page loaded');
	});
</script>

<svelte:head>
	<title>Enhanced Card Visual Feedback Test</title>
	<meta name="description" content="Testing visual feedback system for enhanced cards" />
</svelte:head>

<div class="test-container">
	<header class="test-header">
		<h1>Enhanced Card Visual Feedback Test</h1>
		<p>Test the visual feedback system including cursor changes, loading indicators, and state indicators.</p>
	</header>

	<div class="test-instructions">
		<h2>Test Instructions</h2>
		<ul>
			<li><strong>Hover:</strong> Move mouse over cards to see cursor change to pointer and hover indicators</li>
			<li><strong>Click:</strong> Click cards to flip them and see loading animation with spinner</li>
			<li><strong>Flipped State:</strong> Notice the glowing border and star indicator when cards are flipped</li>
			<li><strong>Touch:</strong> On mobile devices, tap to see touch feedback ripples</li>
			<li><strong>Animation:</strong> Watch for loading spinner and "Flipping..." text during animations</li>
		</ul>
	</div>

	<div class="cards-grid">
		{#each testCards as card (card.id)}
			<div class="card-wrapper">
				<h3>{card.title}</h3>
				<EnhancedCard
					frontImage={card.frontImage}
					cardType={card.cardType}
					teamOrType={card.teamOrType}
					holographicStyle={card.holographicStyle}
					enableFlip={true}
					animationSpeed={600}
					on:hover={(e) => handleCardEvent(e, card.id)}
					on:flip={(e) => handleCardEvent(e, card.id)}
					on:animationStart={(e) => handleCardEvent(e, card.id)}
					on:animationEnd={(e) => handleCardEvent(e, card.id)}
					on:touchStart={(e) => handleCardEvent(e, card.id)}
					on:touchEnd={(e) => handleCardEvent(e, card.id)}
					on:tap={(e) => handleCardEvent(e, card.id)}
				/>
			</div>
		{/each}
	</div>

	<div class="feedback-log">
		<h2>Event Log</h2>
		<div class="log-container">
			{#each feedbackLog as logEntry}
				<div class="log-entry">{logEntry}</div>
			{/each}
		</div>
	</div>

	<div class="test-checklist">
		<h2>Visual Feedback Checklist</h2>
		<div class="checklist-grid">
			<div class="checklist-section">
				<h3>Cursor Feedback</h3>
				<ul>
					<li>✓ Default cursor when not hovering</li>
					<li>✓ Pointer cursor on hover</li>
					<li>✓ Wait cursor during animation</li>
					<li>✓ Pointer cursor on flipped cards</li>
				</ul>
			</div>
			
			<div class="checklist-section">
				<h3>Animation Indicators</h3>
				<ul>
					<li>✓ Loading spinner during flip</li>
					<li>✓ "Flipping..." text</li>
					<li>✓ Pulsing animation indicator</li>
					<li>✓ Disabled interactions during animation</li>
				</ul>
			</div>
			
			<div class="checklist-section">
				<h3>State Indicators</h3>
				<ul>
					<li>✓ Glowing border when flipped</li>
					<li>✓ Star icon for flipped state</li>
					<li>✓ Hover indicator (arrow down)</li>
					<li>✓ Touch ripple effect</li>
				</ul>
			</div>
			
			<div class="checklist-section">
				<h3>Interactive Feedback</h3>
				<ul>
					<li>✓ Card lift on hover</li>
					<li>✓ Click indicator dot</li>
					<li>✓ Scale down on active press</li>
					<li>✓ Smooth transitions</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	.test-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
		color: white;
		padding: 20px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.test-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.test-header h1 {
		font-size: 2.5rem;
		margin-bottom: 10px;
		background: linear-gradient(45deg, #00e7ff, #ff00e7);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.test-header p {
		font-size: 1.1rem;
		opacity: 0.8;
		max-width: 600px;
		margin: 0 auto;
	}

	.test-instructions {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 40px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.test-instructions h2 {
		color: #00e7ff;
		margin-bottom: 15px;
	}

	.test-instructions ul {
		list-style: none;
		padding: 0;
	}

	.test-instructions li {
		padding: 8px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.test-instructions li:last-child {
		border-bottom: none;
	}

	.test-instructions strong {
		color: #ff00e7;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
		margin-bottom: 40px;
		justify-items: center;
	}

	.card-wrapper {
		text-align: center;
	}

	.card-wrapper h3 {
		margin-bottom: 20px;
		color: #00e7ff;
		font-size: 1.2rem;
	}

	.feedback-log {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 40px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.feedback-log h2 {
		color: #00e7ff;
		margin-bottom: 15px;
	}

	.log-container {
		max-height: 200px;
		overflow-y: auto;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 5px;
		padding: 10px;
	}

	.log-entry {
		padding: 5px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
	}

	.log-entry:last-child {
		border-bottom: none;
	}

	.test-checklist {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		padding: 20px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.test-checklist h2 {
		color: #00e7ff;
		margin-bottom: 20px;
		text-align: center;
	}

	.checklist-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.checklist-section {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		padding: 15px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.checklist-section h3 {
		color: #ff00e7;
		margin-bottom: 10px;
		font-size: 1.1rem;
	}

	.checklist-section ul {
		list-style: none;
		padding: 0;
	}

	.checklist-section li {
		padding: 5px 0;
		font-size: 0.9rem;
		opacity: 0.9;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.test-container {
			padding: 15px;
		}

		.test-header h1 {
			font-size: 2rem;
		}

		.cards-grid {
			grid-template-columns: 1fr;
			gap: 30px;
		}

		.checklist-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Scrollbar styling */
	.log-container::-webkit-scrollbar {
		width: 6px;
	}

	.log-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.log-container::-webkit-scrollbar-thumb {
		background: rgba(0, 231, 255, 0.5);
		border-radius: 3px;
	}

	.log-container::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 231, 255, 0.7);
	}
</style>