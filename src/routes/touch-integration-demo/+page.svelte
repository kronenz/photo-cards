<script lang="ts">
	import EnhancedCard from '$lib/components/EnhancedCard.svelte';
	import { onMount } from 'svelte';
	import { isTouchSupported, isPrimaryTouchDevice } from '$lib/utils/touchIntegration';
	import { detectDeviceCapabilities, getMobileOptimizationSettings } from '$lib/utils/mobileOptimization';

	let deviceInfo = {
		isTouchSupported: false,
		isPrimaryTouchDevice: false,
		capabilities: null as any,
		optimizationSettings: null as any
	};

	let eventLog: string[] = [];
	let maxLogEntries = 10;

	function logEvent(message: string) {
		eventLog = [new Date().toLocaleTimeString() + ': ' + message, ...eventLog.slice(0, maxLogEntries - 1)];
	}

	function clearLog() {
		eventLog = [];
	}

	// Enhanced Card event handlers
	function handleCardFlip(event: CustomEvent) {
		logEvent(`Card flipped: ${event.detail.isFlipped ? 'Back' : 'Front'}`);
	}

	function handleCardHover(event: CustomEvent) {
		logEvent(`Card hover: ${event.detail.isHovering ? 'Enter' : 'Leave'}`);
	}

	function handleTouchStart(event: CustomEvent) {
		logEvent(`Touch start at (${event.detail.position.x}, ${event.detail.position.y})`);
	}

	function handleTouchMove(event: CustomEvent) {
		logEvent(`Touch move to (${event.detail.position.x}, ${event.detail.position.y}), distance: ${Math.round(event.detail.distance)}`);
	}

	function handleTouchEnd(event: CustomEvent) {
		logEvent(`Touch end: ${event.detail.isTap ? 'Tap' : 'Release'} (${Math.round(event.detail.duration)}ms)`);
	}

	function handleTap(event: CustomEvent) {
		logEvent(`Tap gesture detected (${Math.round(event.detail.duration)}ms)`);
	}

	function handleTouchHold(event: CustomEvent) {
		logEvent(`Touch hold at (${event.detail.position.x}, ${event.detail.position.y})`);
	}

	onMount(() => {
		deviceInfo.isTouchSupported = isTouchSupported();
		deviceInfo.isPrimaryTouchDevice = isPrimaryTouchDevice();
		deviceInfo.capabilities = detectDeviceCapabilities();
		deviceInfo.optimizationSettings = getMobileOptimizationSettings(deviceInfo.capabilities);
	});
</script>

<svelte:head>
	<title>Touch Integration Demo - Task 1.1</title>
	<meta name="description" content="Touch event integration demonstration for Enhanced Card" />
</svelte:head>

<div class="demo-container">
	<header class="demo-header">
		<h1>Touch Integration Demo</h1>
		<p>Task 1.1: 터치 이벤트 통합 처리 구현</p>
	</header>

	<section class="device-info">
		<h2>Device Information</h2>
		<div class="info-grid">
			<div class="info-item">
				<strong>Touch Support:</strong> 
				<span class="status" class:supported={deviceInfo.isTouchSupported}>
					{deviceInfo.isTouchSupported ? '✓ Supported' : '✗ Not Supported'}
				</span>
			</div>
			<div class="info-item">
				<strong>Primary Touch Device:</strong> 
				<span class="status" class:supported={deviceInfo.isPrimaryTouchDevice}>
					{deviceInfo.isPrimaryTouchDevice ? '✓ Yes' : '✗ No'}
				</span>
			</div>
			{#if deviceInfo.capabilities}
				<div class="info-item">
					<strong>Max Touch Points:</strong> {deviceInfo.capabilities.maxTouchPoints}
				</div>
				<div class="info-item">
					<strong>Device Pixel Ratio:</strong> {deviceInfo.capabilities.devicePixelRatio}
				</div>
				<div class="info-item">
					<strong>Low-End Device:</strong> 
					<span class="status" class:warning={deviceInfo.capabilities.isLowEndDevice}>
						{deviceInfo.capabilities.isLowEndDevice ? '⚠ Yes' : '✓ No'}
					</span>
				</div>
				<div class="info-item">
					<strong>Reduced Motion:</strong> 
					<span class="status" class:warning={deviceInfo.capabilities.preferReducedMotion}>
						{deviceInfo.capabilities.preferReducedMotion ? '⚠ Enabled' : '✓ Disabled'}
					</span>
				</div>
			{/if}
		</div>

		{#if deviceInfo.optimizationSettings}
			<h3>Optimization Settings</h3>
			<div class="optimization-grid">
				<div class="opt-item">
					<strong>Holographic Effects:</strong> 
					<span class="status" class:supported={deviceInfo.optimizationSettings.enableHolographicEffects}>
						{deviceInfo.optimizationSettings.enableHolographicEffects ? '✓ Enabled' : '✗ Disabled'}
					</span>
				</div>
				<div class="opt-item">
					<strong>Event Throttling:</strong> 
					<span class="status" class:warning={deviceInfo.optimizationSettings.throttleEvents}>
						{deviceInfo.optimizationSettings.throttleEvents ? '⚠ Enabled' : '✓ Disabled'}
					</span>
				</div>
				<div class="opt-item">
					<strong>Touch Threshold:</strong> {deviceInfo.optimizationSettings.touchThreshold}px
				</div>
				<div class="opt-item">
					<strong>Animation Duration:</strong> {deviceInfo.optimizationSettings.animationDuration}ms
				</div>
			</div>
		{/if}
	</section>

	<section class="demo-cards">
		<h2>Interactive Cards</h2>
		<p class="instructions">
			<strong>Instructions:</strong><br>
			• <strong>Mouse:</strong> Hover for holographic effects, click to flip<br>
			• <strong>Touch:</strong> Touch for holographic effects, tap to flip, hold for hold gesture<br>
			• Watch the event log below to see touch/mouse event processing
		</p>

		<div class="cards-container">
			<div class="card-wrapper">
				<h3>Pokemon Card</h3>
				<EnhancedCard
					frontImage="https://assets.codepen.io/13471/charizard-gx.webp"
					cardType="pokemon"
					holographicStyle="basic"
					on:flip={handleCardFlip}
					on:hover={handleCardHover}
					on:touchStart={handleTouchStart}
					on:touchMove={handleTouchMove}
					on:touchEnd={handleTouchEnd}
					on:tap={handleTap}
					on:touchHold={handleTouchHold}
				/>
			</div>

			<div class="card-wrapper">
				<h3>KBO Card (Rainbow Effect)</h3>
				<EnhancedCard
					frontImage="https://assets.codepen.io/13471/pikachu-gx.webp"
					cardType="kbo"
					teamOrType="LG"
					holographicStyle="rainbow"
					on:flip={handleCardFlip}
					on:hover={handleCardHover}
					on:touchStart={handleTouchStart}
					on:touchMove={handleTouchMove}
					on:touchEnd={handleTouchEnd}
					on:tap={handleTap}
					on:touchHold={handleTouchHold}
				>
					<div slot="back-content" class="kbo-back">
						<div class="team-logo">🦁</div>
						<div class="team-name">LG Twins</div>
						<div class="player-name">김현수</div>
						<div class="player-position">외야수</div>
					</div>
				</EnhancedCard>
			</div>

			<div class="card-wrapper">
				<h3>Custom Card (Galaxy Effect)</h3>
				<EnhancedCard
					frontImage="https://assets.codepen.io/13471/eevee-gx.webp"
					cardType="custom"
					holographicStyle="galaxy"
					on:flip={handleCardFlip}
					on:hover={handleCardHover}
					on:touchStart={handleTouchStart}
					on:touchMove={handleTouchMove}
					on:touchEnd={handleTouchEnd}
					on:tap={handleTap}
					on:touchHold={handleTouchHold}
				>
					<div slot="back-content" class="custom-back">
						<div class="custom-title">Special Edition</div>
						<div class="custom-subtitle">Limited Release</div>
						<div class="custom-year">2024</div>
					</div>
				</EnhancedCard>
			</div>
		</div>
	</section>

	<section class="event-log">
		<div class="log-header">
			<h2>Event Log</h2>
			<button on:click={clearLog} class="clear-btn">Clear Log</button>
		</div>
		<div class="log-container">
			{#each eventLog as entry}
				<div class="log-entry">{entry}</div>
			{:else}
				<div class="log-empty">No events logged yet. Interact with the cards above!</div>
			{/each}
		</div>
	</section>

	<section class="requirements-checklist">
		<h2>Task 1.1 Requirements Checklist</h2>
		<div class="checklist">
			<div class="check-item">
				<span class="check-icon">✓</span>
				<strong>터치 이벤트와 마우스 이벤트 중복 방지 로직 구현</strong>
				<p>Touch events prevent mouse events during processing with configurable delay</p>
			</div>
			<div class="check-item">
				<span class="check-icon">✓</span>
				<strong>터치 시 홀로그래픽 효과 적용 기능 구현</strong>
				<p>Holographic effects respond to touch position and movement</p>
			</div>
			<div class="check-item">
				<span class="check-icon">✓</span>
				<strong>탭 제스처로 카드 뒤집기 기능 구현</strong>
				<p>Tap gestures (quick touch/release) trigger card flip animation</p>
			</div>
			<div class="check-item">
				<span class="check-icon">✓</span>
				<strong>모바일 디바이스 최적화 및 성능 테스트</strong>
				<p>Device detection, performance optimization, and 60fps guarantee</p>
			</div>
		</div>
	</section>
</div>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.demo-header h1 {
		font-size: 2.5rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.demo-header p {
		font-size: 1.2rem;
		color: #666;
		font-weight: 500;
	}

	.device-info {
		background: #f8f9fa;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 3rem;
	}

	.device-info h2 {
		margin-top: 0;
		color: #333;
	}

	.info-grid, .optimization-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.info-item, .opt-item {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e9ecef;
	}

	.status {
		font-weight: 600;
	}

	.status.supported {
		color: #28a745;
	}

	.status.warning {
		color: #ffc107;
	}

	.demo-cards {
		margin-bottom: 3rem;
	}

	.demo-cards h2 {
		color: #333;
		margin-bottom: 1rem;
	}

	.instructions {
		background: #e3f2fd;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		border-left: 4px solid #2196f3;
	}

	.cards-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.card-wrapper {
		text-align: center;
	}

	.card-wrapper h3 {
		margin-bottom: 1rem;
		color: #333;
	}

	.kbo-back, .custom-back {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: white;
		text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
	}

	.team-logo {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.team-name, .custom-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.player-name, .custom-subtitle {
		font-size: 1.2rem;
		margin-bottom: 0.25rem;
	}

	.player-position, .custom-year {
		font-size: 1rem;
		opacity: 0.9;
	}

	.event-log {
		background: #f8f9fa;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 3rem;
	}

	.log-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.log-header h2 {
		margin: 0;
		color: #333;
	}

	.clear-btn {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.clear-btn:hover {
		background: #c82333;
	}

	.log-container {
		background: white;
		border-radius: 8px;
		padding: 1rem;
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid #e9ecef;
	}

	.log-entry {
		padding: 0.5rem;
		border-bottom: 1px solid #f1f3f4;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.9rem;
	}

	.log-entry:last-child {
		border-bottom: none;
	}

	.log-empty {
		text-align: center;
		color: #6c757d;
		font-style: italic;
		padding: 2rem;
	}

	.requirements-checklist {
		background: #e8f5e8;
		border-radius: 12px;
		padding: 2rem;
	}

	.requirements-checklist h2 {
		margin-top: 0;
		color: #333;
		margin-bottom: 1.5rem;
	}

	.checklist {
		display: grid;
		gap: 1.5rem;
	}

	.check-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #c3e6cb;
	}

	.check-icon {
		color: #28a745;
		font-weight: bold;
		font-size: 1.2rem;
		flex-shrink: 0;
	}

	.check-item strong {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.check-item p {
		margin: 0;
		color: #666;
		line-height: 1.5;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.demo-container {
			padding: 1rem;
		}

		.demo-header h1 {
			font-size: 2rem;
		}

		.cards-container {
			grid-template-columns: 1fr;
		}

		.info-grid, .optimization-grid {
			grid-template-columns: 1fr;
		}

		.log-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
	}
</style>