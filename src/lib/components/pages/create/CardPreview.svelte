<!--
  Card Preview Component - Real-time holographic preview
  Feature: 003-navigation-ui-renewal
  Task: T042 - US2
-->
<script lang="ts">
	export let imageUrl = '';
	export let playerName = '';
	export let team = '';
	export let position = '';
	export let year = '';
	export let holographicEffect = true;

	let cardElement: HTMLDivElement;
	let rotateX = 0;
	let rotateY = 0;

	function handleMouseMove(e: MouseEvent) {
		if (!cardElement || !holographicEffect) return;

		const rect = cardElement.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		rotateY = ((x - centerX) / centerX) * 15;
		rotateX = ((centerY - y) / centerY) * 15;
	}

	function handleMouseLeave() {
		rotateX = 0;
		rotateY = 0;
	}
</script>

<div class="preview-container">
	<div
		bind:this={cardElement}
		class="card-preview"
		class:holographic={holographicEffect}
		style:transform="rotateX({rotateX}deg) rotateY({rotateY}deg)"
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
		role="img"
		aria-label="Card preview"
	>
		{#if imageUrl}
			<div class="card-image">
				<img src={imageUrl} alt={playerName || 'Player'} />
				{#if holographicEffect}
					<div class="holographic-overlay"></div>
				{/if}
			</div>
		{:else}
			<div class="placeholder">
				<span class="placeholder-icon">⚾</span>
				<p class="placeholder-text">카드 프리뷰</p>
			</div>
		{/if}

		<div class="card-info">
			<h3 class="player-name">{playerName || '선수 이름'}</h3>
			<div class="meta-info">
				<span class="team">{team || '구단'}</span>
				<span class="separator">•</span>
				<span class="position">{position || '포지션'}</span>
				{#if year}
					<span class="separator">•</span>
					<span class="year">{year}</span>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.preview-container {
		perspective: 1000px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--space-xl);
	}

	.card-preview {
		width: 300px;
		height: 420px;
		border-radius: var(--radius-xl);
		background: linear-gradient(
			135deg,
			var(--surface-primary),
			var(--surface-secondary)
		);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		transition: transform var(--transition-base);
		transform-style: preserve-3d;
		position: relative;
	}

	.card-preview.holographic {
		box-shadow:
			var(--shadow-xl),
			0 0 20px rgba(102, 126, 234, 0.3),
			0 0 40px rgba(118, 75, 162, 0.2);
	}

	.card-image {
		position: relative;
		width: 100%;
		height: 70%;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.holographic-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(102, 126, 234, 0.3) 0%,
			rgba(118, 75, 162, 0.3) 25%,
			rgba(240, 147, 251, 0.3) 50%,
			rgba(79, 172, 254, 0.3) 75%,
			rgba(102, 126, 234, 0.3) 100%
		);
		background-size: 200% 200%;
		animation: holographic-shift 3s ease-in-out infinite;
		mix-blend-mode: overlay;
		pointer-events: none;
	}

	@keyframes holographic-shift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	.placeholder {
		width: 100%;
		height: 70%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--surface-secondary);
		color: var(--text-tertiary);
	}

	.placeholder-icon {
		font-size: 64px;
		opacity: 0.5;
		margin-bottom: var(--space-md);
	}

	.placeholder-text {
		font-size: var(--font-body);
		margin: 0;
	}

	.card-info {
		padding: var(--space-lg);
		background: linear-gradient(
			to bottom,
			transparent,
			var(--surface-primary)
		);
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
	}

	.player-name {
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-sm) 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.meta-info {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--font-callout);
		color: var(--text-secondary);
	}

	.separator {
		color: var(--text-tertiary);
	}

	@media (max-width: 768px) {
		.card-preview {
			width: 250px;
			height: 350px;
		}

		.player-name {
			font-size: var(--font-title3);
		}
	}
</style>
