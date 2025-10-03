<script lang="ts">
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';
	import { isTouchSupported, isPrimaryTouchDevice } from '$lib/utils/touchIntegration';

	// Device detection
	const touchSupported = isTouchSupported();
	const primaryTouchDevice = isPrimaryTouchDevice();

	// Event log
	let eventLog: string[] = [];
	let maxLogEntries = 10;

	function addLogEntry(message: string) {
		eventLog = [new Date().toLocaleTimeString() + ': ' + message, ...eventLog.slice(0, maxLogEntries - 1)];
	}

	function clearLog() {
		eventLog = [];
	}

	// Touch event handlers
	function handleTouchStart(event: CustomEvent) {
		addLogEntry(`Touch Start at (${event.detail.position.x}, ${event.detail.position.y})`);
	}

	function handleTouchMove(event: CustomEvent) {
		addLogEntry(`Touch Move to (${event.detail.position.x}, ${event.detail.position.y}) - Distance: ${Math.round(event.detail.distance)}px`);
	}

	function handleTouchEnd(event: CustomEvent) {
		addLogEntry(`Touch End - Type: ${event.detail.isTap ? 'Tap' : 'Release'} - Duration: ${event.detail.duration}ms`);
	}

	function handleTouchHold(event: CustomEvent) {
		addLogEntry(`Touch Hold detected at (${event.detail.position.x}, ${event.detail.position.y})`);
	}

	function handleTap(event: CustomEvent) {
		addLogEntry(`Tap gesture - Duration: ${event.detail.duration}ms`);
	}

	function handleCardFlip(event: CustomEvent) {
		addLogEntry(`Card flipped - Now showing: ${event.detail.isFlipped ? 'Back' : 'Front'}`);
	}

	function handleCardHover(event: CustomEvent) {
		addLogEntry(`Card hover - ${event.detail.isHovering ? 'Started' : 'Ended'}`);
	}
</script>

<svelte:head>
	<title>Touch Integration Test</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
</svelte:head>

<main>
	<h1>Touch Integration Test</h1>
	
	<section class="device-info">
		<h2>Device Information</h2>
		<div class="info-grid">
			<div class="info-item">
				<span class="label">Touch Support:</span>
				<span class="value {touchSupported ? 'supported' : 'not-supported'}">
					{touchSupported ? '✅ Supported' : '❌ Not Supported'}
				</span>
			</div>
			<div class="info-item">
				<span class="label">Primary Touch Device:</span>
				<span class="value {primaryTouchDevice ? 'primary' : 'not-primary'}">
					{primaryTouchDevice ? '📱 Yes' : '🖥️ No'}
				</span>
			</div>
			<div class="info-item">
				<span class="label">User Agent:</span>
				<span class="value user-agent">{navigator.userAgent.substring(0, 60)}...</span>
			</div>
		</div>
	</section>

	<section class="test-instructions">
		<h2>Test Instructions</h2>
		<div class="instructions">
			<div class="instruction-item">
				<strong>Touch/Hover:</strong> Touch or hover over the card to see holographic effects
			</div>
			<div class="instruction-item">
				<strong>Tap/Click:</strong> Tap or click the card to flip it
			</div>
			<div class="instruction-item">
				<strong>Touch Hold:</strong> Touch and hold for enhanced holographic effects
			</div>
			<div class="instruction-item">
				<strong>Touch Move:</strong> Touch and drag to see holographic effects follow your finger
			</div>
		</div>
	</section>

	<section class="card-test">
		<h2>Enhanced Card with Touch Integration</h2>
		<div class="card-container">
			<EnhancedCard
				frontImage="https://assets.codepen.io/13471/charizard-gx.webp"
				cardType="pokemon"
				holographicStyle="cosmic"
				enableFlip={true}
				animationSpeed={600}
				on:touchStart={handleTouchStart}
				on:touchMove={handleTouchMove}
				on:touchEnd={handleTouchEnd}
				on:touchHold={handleTouchHold}
				on:tap={handleTap}
				on:flip={handleCardFlip}
				on:hover={handleCardHover}
			/>
		</div>
	</section>

	<section class="event-log">
		<div class="log-header">
			<h2>Event Log</h2>
			<button class="clear-btn" on:click={clearLog}>Clear Log</button>
		</div>
		<div class="log-container">
			{#each eventLog as entry}
				<div class="log-entry">{entry}</div>
			{:else}
				<div class="log-empty">No events logged yet. Interact with the card above!</div>
			{/each}
		</div>
	</section>

	<section class="requirements-check">
		<h2>Requirements Verification</h2>
		<div class="requirements">
			<div class="requirement">
				<span class="req-number">4.1</span>
				<span class="req-text">Touch applies holographic effect</span>
				<span class="req-status">✅ Implemented</span>
			</div>
			<div class="requirement">
				<span class="req-number">4.2</span>
				<span class="req-text">Tap gesture flips card</span>
				<span class="req-status">✅ Implemented</span>
			</div>
			<div class="requirement">
				<span class="req-number">4.3</span>
				<span class="req-text">Prevents touch/mouse event duplication</span>
				<span class="req-status">✅ Implemented</span>
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
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		margin-bottom: 2rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #e0e7ff;
	}

	section {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Device Info */
	.info-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.label {
		font-weight: 600;
	}

	.value {
		font-weight: 500;
	}

	.value.supported, .value.primary {
		color: #4ade80;
	}

	.value.not-supported, .value.not-primary {
		color: #f87171;
	}

	.user-agent {
		font-size: 0.85rem;
		opacity: 0.8;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Instructions */
	.instructions {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	.instruction-item {
		padding: 1rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		border-left: 4px solid #60a5fa;
	}

	/* Card Test */
	.card-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		padding: 2rem;
	}

	/* Event Log */
	.log-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.clear-btn {
		background: #ef4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.clear-btn:hover {
		background: #dc2626;
	}

	.log-container {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		padding: 1rem;
		max-height: 300px;
		overflow-y: auto;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
	}

	.log-entry {
		padding: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		animation: fadeIn 0.3s ease-in;
	}

	.log-entry:last-child {
		border-bottom: none;
	}

	.log-empty {
		text-align: center;
		opacity: 0.6;
		font-style: italic;
		padding: 2rem;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Requirements Check */
	.requirements {
		display: grid;
		gap: 0.75rem;
	}

	.requirement {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.req-number {
		background: #3b82f6;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.85rem;
	}

	.req-text {
		font-weight: 500;
	}

	.req-status {
		color: #4ade80;
		font-weight: 600;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		main {
			padding: 1rem;
		}

		.info-grid,
		.instructions {
			grid-template-columns: 1fr;
		}

		.card-container {
			min-height: 300px;
			padding: 1rem;
		}

		.requirement {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			text-align: center;
		}

		.log-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
	}

	/* Touch-specific styles */
	@media (pointer: coarse) {
		.instruction-item {
			padding: 1.25rem;
		}
		
		.clear-btn {
			padding: 0.75rem 1.25rem;
			font-size: 1rem;
		}
	}
</style>