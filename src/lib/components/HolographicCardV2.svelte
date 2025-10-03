<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import { getTeamById } from '$lib/data/baseballTeams';
	import type { BaseballTeam } from '$lib/data/baseballTeams';

	// Props
	export let frontImage: string;
	export let title: string = '';
	export let rarity: string = 'rare holo'; // Baseball card rarity types
	export let subtypes: string = ''; // Baseball card subtypes (position, etc.)
	export let supertype: string = 'player'; // Baseball card supertypes (player, stadium, moment)
	export let gallery: boolean = false; // Special gallery cards
	export let enableFlip: boolean = true;
	export let animationSpeed: number = 600;
	export let teamId: string | undefined = undefined; // Baseball team ID for team-specific effects
	export let cardType: 'player' | 'stadium' | 'moment' | 'achievement' = 'player'; // Baseball card types

	// State
	let cardContainer: HTMLElement;
	let cardRotator: HTMLElement;
	let isHovering = false;
	let isActive = false;

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Computed
	$: team = teamId ? getTeamById(teamId) : null;
	$: teamColors = team ? team.colors : null;
	$: holographicEffect = getHolographicEffect(rarity, teamId, cardType);

	// Mouse tracking for holographic effect
	function handleMouseMove(e: MouseEvent) {
		if (!cardContainer || !cardRotator) return;

		const rect = cardContainer.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		// Calculate mouse position relative to card center
		const mx = ((e.clientX - rect.left) / rect.width) * 100;
		const my = ((e.clientY - rect.top) / rect.height) * 100;

		// Calculate rotation values
		const rotateX = ((e.clientY - centerY) / rect.height) * 20;
		const rotateY = ((e.clientX - centerX) / rect.width) * -20;

		// Calculate hypotenuse for brightness effect
		const hyp = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
		const normalizedHyp = Math.min(hyp / Math.max(rect.width, rect.height), 1);

		// Update CSS custom properties
		cardContainer.style.setProperty('--mx', `${mx}%`);
		cardContainer.style.setProperty('--my', `${my}%`);
		cardContainer.style.setProperty('--posx', `${mx}%`);
		cardContainer.style.setProperty('--posy', `${my}%`);
		cardContainer.style.setProperty('--pos', `${mx}% ${my}%`);
		cardContainer.style.setProperty('--rx', `${rotateY}deg`);
		cardContainer.style.setProperty('--ry', `${rotateX}deg`);
		cardContainer.style.setProperty('--hyp', normalizedHyp.toString());
		cardContainer.style.setProperty('--s', isActive ? '1.05' : '1');
		cardContainer.style.setProperty('--o', isHovering ? '1' : '0');

		dispatch('hover', { mouseX: mx, mouseY: my, isHovering: true });
	}

	function handleMouseEnter() {
		isHovering = true;
		isActive = true;

		if (cardContainer) {
			cardContainer.classList.add('active', 'interacting');
			cardContainer.style.setProperty('--o', '1');
		}

		dispatch('hover', { isHovering: true });
	}

	function handleMouseLeave() {
		isHovering = false;
		isActive = false;

		if (cardContainer) {
			cardContainer.classList.remove('active', 'interacting');
			cardContainer.style.setProperty('--mx', '50%');
			cardContainer.style.setProperty('--my', '50%');
			cardContainer.style.setProperty('--posx', '50%');
			cardContainer.style.setProperty('--posy', '50%');
			cardContainer.style.setProperty('--pos', '50% 50%');
			cardContainer.style.setProperty('--rx', '0deg');
			cardContainer.style.setProperty('--ry', '0deg');
			cardContainer.style.setProperty('--hyp', '0');
			cardContainer.style.setProperty('--s', '1');
			cardContainer.style.setProperty('--o', '0');
		}

		dispatch('hover', { isHovering: false });
	}

	function handleClick() {
		if (enableFlip) {
			dispatch('flip');
		}
		dispatch('click', { teamId, cardType, title });
	}

	// Baseball team-specific holographic effects
	function getHolographicEffect(rarity: string, teamId?: string, cardType?: string) {
		if (teamId && team) {
			return {
				primary: team.colors.primary,
				secondary: team.colors.secondary,
				accent: team.colors.accent || '#FFFFFF',
				teamName: team.name,
				cardType
			};
		}
		return null;
	}

	onMount(() => {
		if (!browser || !cardContainer) return;

		// Initialize CSS custom properties
		cardContainer.style.setProperty('--mx', '50%');
		cardContainer.style.setProperty('--my', '50%');
		cardContainer.style.setProperty('--posx', '50%');
		cardContainer.style.setProperty('--posy', '50%');
		cardContainer.style.setProperty('--pos', '50% 50%');
		cardContainer.style.setProperty('--rx', '0deg');
		cardContainer.style.setProperty('--ry', '0deg');
		cardContainer.style.setProperty('--hyp', '0');
		cardContainer.style.setProperty('--s', '1');
		cardContainer.style.setProperty('--o', '0');
	});
</script>

<div
	class="card"
	class:interacting={isHovering}
	class:active={isActive}
	data-rarity={rarity}
	data-subtypes={subtypes}
	data-supertype={supertype}
	data-gallery={gallery}
	data-team={teamId}
	data-card-type={cardType}
	bind:this={cardContainer}
	on:mousemove={handleMouseMove}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	on:click={handleClick}
	on:keydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick();
		}
	}}
	role="button"
	tabindex="0"
	style="--animation-speed: {animationSpeed}ms; {teamColors ? `--team-primary: ${teamColors.primary}; --team-secondary: ${teamColors.secondary}; --team-accent: ${teamColors.accent || '#FFFFFF'};` : ''}"
>
	<div class="card__translater">
		<div class="card__rotator" bind:this={cardRotator}>
			<!-- Card Front -->
			<div class="card__front">
				<img class="card__image" src={frontImage} alt={title} loading="lazy" />

				<!-- Holographic Shine Effect -->
				<div class="card__shine"></div>

				<!-- Glare Effect -->
				<div class="card__glare"></div>
			</div>

			<!-- Card Back (optional) -->
			{#if enableFlip}
				<div class="card__back">
					<div class="card__back-content">
						<h3>{title}</h3>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:root {
		--mx: 50%;
		--my: 50%;
		--s: 1;
		--o: 0;
		--tx: 0px;
		--ty: 0px;
		--rx: 0deg;
		--ry: 0deg;
		--pos: 50% 50%;
		--posx: 50%;
		--posy: 50%;
		--hyp: 0;
	}

	.card {
		--radius: 4.55% / 3.5%;
		z-index: calc(var(--s) * 100);
		transform: translate3d(0, 0, 0.1px);
		will-change: transform, visibility;
		transform-style: preserve-3d;
		width: 100%;
		aspect-ratio: 63/88; /* Standard card ratio */
	}

	.card.interacting {
		z-index: calc(var(--s) * 120);
	}

	.card.active .card__translater,
	.card.active .card__rotator {
		touch-action: none;
	}

	.card__translater,
	.card__rotator {
		display: grid;
		perspective: 600px;
		transform-origin: center;
		will-change: transform;
		width: 100%;
		height: 100%;
	}

	.card__translater {
		position: relative;
		transform: translate3d(var(--tx), var(--ty), 0) scale(var(--s));
	}

	.card__rotator {
		--glow: #69d1e9;
		transform: rotateY(var(--rx)) rotateX(var(--ry));
		transform-style: preserve-3d;
		box-shadow: 0px 10px 20px -5px black;
		border-radius: var(--radius);
		outline: none;
		transition:
			box-shadow 0.4s ease,
			outline 0.2s ease;
	}

	.card.active .card__rotator {
		box-shadow:
			0 0 10px 0px var(--glow),
			0 0 10px 0px var(--glow),
			0 0 30px 0px var(--glow);
	}

	.card__rotator:focus {
		box-shadow:
			0 0 10px 0px var(--glow),
			0 0 10px 0px var(--glow),
			0 0 30px 0px var(--glow);
	}

	.card.active .card__rotator:focus {
		box-shadow: 0px 10px 30px 3px black;
	}

	.card__rotator :global(*) {
		width: 100%;
		display: grid;
		grid-area: 1/1;
		border-radius: var(--radius);
		image-rendering: optimizeQuality;
		transform-style: preserve-3d;
	}

	.card__back {
		transform: rotateY(180deg);
		backface-visibility: visible;
		background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card__back-content {
		text-align: center;
		color: white;
		padding: 20px;
	}

	.card__front,
	.card__front * {
		backface-visibility: hidden;
	}

	.card__front {
		opacity: 1;
		transition: opacity 0.2s ease-out;
		position: relative;
	}

	.card__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius);
	}

	.card__shine {
		--grain: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCI+CjxmaWx0ZXIgaWQ9Im4iPgo8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT4KPC9maWx0ZXI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuMyI+PC9yZWN0Pgo8L3N2Zz4=');
		--space: 5%;
		--angle: 133deg;
		--imgsize: 500px;
		--red: #f80e7b;
		--yel: #eedf10;
		--gre: #21e985;
		--blu: #0dbde9;
		--vio: #c929f1;

		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: calc(var(--o) * 0.8);
		pointer-events: none;
		mix-blend-mode: color-dodge;
		transition: opacity 0.3s ease;
	}

	.card__glare {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: radial-gradient(
			farthest-corner circle at var(--mx) var(--my),
			rgba(222, 245, 250, 0.7) 10%,
			rgba(255, 255, 255, 0.5) 20%,
			rgba(0, 0, 0, 0.5) 90%
		);
		opacity: calc(var(--o) * 0.6);
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	/* HOLO EFFECTS */
	.card[data-rarity='rare holo'] .card__shine {
		--space: 2px;
		--h: 21;
		--s: 70%;
		--l: 50%;
		--bars: 24px;
		--bar-color: rgba(255, 255, 255, 0.6);
		--bar-bg: rgb(10, 10, 10);

		clip-path: inset(10% 8.5% 52.5% 8.5%);

		background-image:
			repeating-linear-gradient(
				90deg,
				hsl(calc(var(--h) * 0), var(--s), var(--l)) calc(var(--space) * 0),
				hsl(calc(var(--h) * 0), var(--s), var(--l)) calc(var(--space) * 1),
				black calc(var(--space) * 1.001),
				black calc(var(--space) * 1.999),
				hsl(calc(var(--h) * 1), var(--s), var(--l)) calc(var(--space) * 2),
				hsl(calc(var(--h) * 1), var(--s), var(--l)) calc(var(--space) * 3),
				black calc(var(--space) * 3.001),
				black calc(var(--space) * 3.999),
				hsl(calc(var(--h) * 2), var(--s), var(--l)) calc(var(--space) * 4),
				hsl(calc(var(--h) * 2), var(--s), var(--l)) calc(var(--space) * 5),
				black calc(var(--space) * 5.001),
				black calc(var(--space) * 5.999),
				hsl(calc(var(--h) * 3), var(--s), var(--l)) calc(var(--space) * 6),
				hsl(calc(var(--h) * 3), var(--s), var(--l)) calc(var(--space) * 7),
				black calc(var(--space) * 7.001),
				black calc(var(--space) * 7.999),
				hsl(calc(var(--h) * 4), var(--s), var(--l)) calc(var(--space) * 8),
				hsl(calc(var(--h) * 4), var(--s), var(--l)) calc(var(--space) * 9),
				black calc(var(--space) * 9.001),
				black calc(var(--space) * 9.999),
				hsl(calc(var(--h) * 5), var(--s), var(--l)) calc(var(--space) * 10),
				hsl(calc(var(--h) * 5), var(--s), var(--l)) calc(var(--space) * 11),
				black calc(var(--space) * 11.001),
				black calc(var(--space) * 11.999),
				hsl(calc(var(--h) * 6), var(--s), var(--l)) calc(var(--space) * 12),
				hsl(calc(var(--h) * 6), var(--s), var(--l)) calc(var(--space) * 13),
				black calc(var(--space) * 13.001),
				black calc(var(--space) * 13.999),
				hsl(calc(var(--h) * 7), var(--s), var(--l)) calc(var(--space) * 14),
				hsl(calc(var(--h) * 7), var(--s), var(--l)) calc(var(--space) * 15),
				black calc(var(--space) * 15.001),
				black calc(var(--space) * 15.999),
				hsl(calc(var(--h) * 8), var(--s), var(--l)) calc(var(--space) * 16),
				hsl(calc(var(--h) * 8), var(--s), var(--l)) calc(var(--space) * 17),
				black calc(var(--space) * 17.001),
				black calc(var(--space) * 17.999),
				hsl(calc(var(--h) * 9), var(--s), var(--l)) calc(var(--space) * 18),
				hsl(calc(var(--h) * 9), var(--s), var(--l)) calc(var(--space) * 19),
				black calc(var(--space) * 19.001),
				black calc(var(--space) * 19.999),
				hsl(calc(var(--h) * 10), var(--s), var(--l)) calc(var(--space) * 20),
				hsl(calc(var(--h) * 10), var(--s), var(--l)) calc(var(--space) * 21),
				black calc(var(--space) * 21.001),
				black calc(var(--space) * 21.999),
				hsl(calc(var(--h) * 11), var(--s), var(--l)) calc(var(--space) * 22),
				hsl(calc(var(--h) * 11), var(--s), var(--l)) calc(var(--space) * 23),
				black calc(var(--space) * 23.001),
				black calc(var(--space) * 23.999),
				hsl(calc(var(--h) * 12), var(--s), var(--l)) calc(var(--space) * 24),
				hsl(calc(var(--h) * 12), var(--s), var(--l)) calc(var(--space) * 25),
				black calc(var(--space) * 25.001),
				black calc(var(--space) * 25.999),
				hsl(calc(var(--h) * 13), var(--s), var(--l)) calc(var(--space) * 26),
				hsl(calc(var(--h) * 13), var(--s), var(--l)) calc(var(--space) * 27),
				black calc(var(--space) * 27.001),
				black calc(var(--space) * 27.999),
				hsl(calc(var(--h) * 14), var(--s), var(--l)) calc(var(--space) * 28),
				hsl(calc(var(--h) * 14), var(--s), var(--l)) calc(var(--space) * 29),
				black calc(var(--space) * 29.001),
				black calc(var(--space) * 29.999),
				hsl(calc(var(--h) * 15), var(--s), var(--l)) calc(var(--space) * 30),
				hsl(calc(var(--h) * 15), var(--s), var(--l)) calc(var(--space) * 31),
				black calc(var(--space) * 31.001),
				black calc(var(--space) * 31.999)
			),
			repeating-linear-gradient(
				90deg,
				var(--vio),
				var(--blu),
				var(--gre),
				var(--yel),
				var(--red),
				var(--vio)
			),
			repeating-linear-gradient(
				90deg,
				var(--bar-bg) calc(var(--bars) * 2),
				var(--bar-color) calc(var(--bars) * 3),
				var(--bar-bg) calc(var(--bars) * 3.5),
				var(--bar-color) calc(var(--bars) * 4),
				var(--bar-bg) calc(var(--bars) * 5),
				var(--bar-bg) calc(var(--bars) * 12)
			),
			repeating-linear-gradient(
				90deg,
				var(--bar-bg) calc(var(--bars) * 2),
				var(--bar-color) calc(var(--bars) * 3),
				var(--bar-bg) calc(var(--bars) * 3.5),
				var(--bar-color) calc(var(--bars) * 4),
				var(--bar-bg) calc(var(--bars) * 5),
				var(--bar-bg) calc(var(--bars) * 9)
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(230, 230, 230, 0.85) 0%,
				rgba(200, 200, 200, 0.1) 25%,
				rgb(0, 0, 0) 90%
			);

		background-blend-mode: soft-light, soft-light, screen, overlay;
		background-position:
			center,
			calc(((50% - var(--posx)) * 25) + 50%) center,
			calc(var(--posx) * -1.2) var(--posy),
			var(--pos),
			center;
		background-size:
			100% 100%,
			200% 200%,
			237% 237%,
			195% 195%,
			120% 120%;

		filter: brightness(calc((var(--hyp) + 0.7) * 0.7)) contrast(3.2) saturate(0.66);
	}

	/* GALAXY HOLO */
	.card[data-rarity='rare holo galaxy'] .card__glare {
		background-image: radial-gradient(
			farthest-corner circle at var(--mx) var(--my),
			rgba(222, 245, 250, 0.7) 10%,
			rgba(255, 255, 255, 0.5) 20%,
			rgba(0, 0, 0, 0.5) 90%
		);
	}

	.card[data-rarity='rare holo galaxy'] .card__shine {
		--space: 80px;
		--h: 21;
		--s: 70%;
		--l: 50%;
		--bars: 50px;
		--bar-color: rgba(255, 255, 255, 0.6);
		--bar-bg: rgb(10, 10, 10);

		clip-path: inset(10% 8.5% 52.5% 8.5%);

		background-image:
			url('https://res.cloudinary.com/simey/image/upload/Dev/PokemonCards/galaxy.png'),
			url('https://res.cloudinary.com/simey/image/upload/Dev/PokemonCards/galaxy.png'),
			url('https://res.cloudinary.com/simey/image/upload/Dev/PokemonCards/galaxy.png'),
			repeating-linear-gradient(
				82deg,
				rgb(218, 56, 50) calc(var(--space) * 1),
				rgb(219, 204, 86) calc(var(--space) * 2),
				rgb(121, 199, 58) calc(var(--space) * 3),
				rgb(58, 192, 183) calc(var(--space) * 4),
				rgb(71, 98, 207) calc(var(--space) * 5),
				rgb(170, 69, 209) calc(var(--space) * 6),
				rgb(218, 56, 50) calc(var(--space) * 10)
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(255, 255, 255, 0.6) 5%,
				rgba(150, 150, 150, 0.3) 40%,
				rgb(0, 0, 0) 100%
			);

		background-blend-mode: color-dodge, color-burn, saturation, screen;
		background-position:
			center,
			center,
			center,
			calc(((50% - var(--posx)) * 2.5) + 50%) calc(((50% - var(--posy)) * 2.5) + 50%),
			center;
		background-size:
			cover,
			cover,
			cover,
			600% 1200%,
			cover;

		filter: brightness(0.75) contrast(1.2) saturate(1.5);
		mix-blend-mode: color-dodge;
	}

	/* V CARDS */
	.card[data-rarity*='rare holo v'] .card__shine,
	.card[data-rarity*='rare holo v'] .card__shine:after {
		--space: 5%;
		--angle: 133deg;
		--imgsize: 500px;

		background-image:
			var(--grain),
			repeating-linear-gradient(
				0deg,
				rgb(255, 119, 115) calc(var(--space) * 1),
				rgba(255, 237, 95, 1) calc(var(--space) * 2),
				rgba(168, 255, 95, 1) calc(var(--space) * 3),
				rgba(131, 255, 247, 1) calc(var(--space) * 4),
				rgba(120, 148, 255, 1) calc(var(--space) * 5),
				rgb(216, 117, 255) calc(var(--space) * 6),
				rgb(255, 119, 115) calc(var(--space) * 7)
			),
			repeating-linear-gradient(
				var(--angle),
				#0e152e 0%,
				hsl(180, 10%, 60%) 3.8%,
				hsl(180, 29%, 66%) 4.5%,
				hsl(180, 10%, 60%) 5.2%,
				#0e152e 10%,
				#0e152e 12%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(0, 0, 0, 0.1) 12%,
				rgba(0, 0, 0, 0.15) 20%,
				rgba(0, 0, 0, 0.25) 120%
			);

		background-blend-mode: screen, hue, hard-light;
		background-size:
			var(--imgsize),
			200% 700%,
			300%,
			200%;
		background-position:
			center,
			0% var(--posy),
			var(--posx) var(--posy),
			var(--posx) var(--posy);

		filter: brightness(0.8) contrast(2.95) saturate(0.5);
	}

	.card[data-rarity='rare holo v'] .card__shine:after {
		content: '';

		background-position:
			center,
			0% var(--posy),
			calc(var(--posx) * -1) calc(var(--posy) * -1),
			var(--posx) var(--posy);
		background-size:
			var(--imgsize),
			200% 400%,
			195%,
			200%;

		filter: brightness(1) contrast(2.5) saturate(1.75);
		mix-blend-mode: soft-light;
	}

	/* RAINBOW SECRET */
	.card[data-rarity^='rare rainbow'] .card__shine,
	.card[data-rarity^='rare rainbow'] .card__shine:after {
		--space: 7%;
		--angle: -20deg;
		--angle2: 130deg;
		--imgsize: 540px 700px;

		background-image:
			url('https://res.cloudinary.com/simey/image/upload/Dev/PokemonCards/rainbow2.jpg'),
			repeating-linear-gradient(
				var(--angle),
				rgb(253, 71, 65) calc(var(--space) * 1),
				rgb(255, 243, 151) calc(var(--space) * 2),
				rgba(168, 255, 95, 1) calc(var(--space) * 3),
				rgba(131, 255, 247, 1) calc(var(--space) * 4),
				rgb(75, 198, 255) calc(var(--space) * 5),
				rgb(255, 73, 246) calc(var(--space) * 6),
				rgb(255, 56, 49) calc(var(--space) * 7)
			),
			repeating-linear-gradient(
				var(--angle2),
				rgba(89, 46, 80, 0.5) 0%,
				hsl(118, 43%, 76%) 2.5%,
				rgb(223, 96, 202) 5%,
				hsl(180, 57%, 56%) 7.5%,
				rgba(14, 21, 46, 0.5) 10%,
				rgba(14, 21, 46, 0.5) 15%
			),
			url('https://res.cloudinary.com/simey/image/upload/Dev/PokemonCards/illusion2.webp');

		background-size:
			50% 50%,
			500% 500%,
			1000% 1000%,
			var(--imgsize);
		background-position:
			center,
			0% calc(var(--posy) * 1.5),
			var(--posx) var(--posy),
			center;
		background-blend-mode: color-burn, soft-light, normal;

		filter: brightness(calc((var(--hyp) * 0.25) + 0.66)) contrast(2) saturate(0.95);
	}

	.card[data-rarity^='rare rainbow'] .card__shine:after {
		content: '';

		background-position:
			center,
			0% calc(var(--posy) * -1),
			calc(var(--posx) * -1) calc(var(--posy) * -1),
			center;
		mix-blend-mode: exclusion;
	}

	/* BASEBALL TEAM SPECIFIC EFFECTS */
	.card[data-team] .card__rotator {
		--glow: var(--team-primary, #69d1e9);
	}

	.card[data-team="lg-twins"] .card__shine {
		--space: 3px;
		--h: 0; /* Red base */
		--s: 80%;
		--l: 50%;
		background-image:
			repeating-linear-gradient(
				45deg,
				var(--team-primary) 0%,
				var(--team-secondary) 25%,
				var(--team-accent) 50%,
				var(--team-secondary) 75%,
				var(--team-primary) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(196, 30, 58, 0.8) 0%,
				rgba(0, 0, 0, 0.3) 50%,
				rgba(196, 30, 58, 0.1) 100%
			);
		background-blend-mode: color-dodge, overlay;
		filter: brightness(calc((var(--hyp) + 0.8) * 0.9)) contrast(2.8) saturate(1.2);
	}

	.card[data-team="doosan-bears"] .card__shine {
		--space: 4px;
		background-image:
			repeating-linear-gradient(
				90deg,
				var(--team-primary) 0%,
				var(--team-secondary) 30%,
				var(--team-accent) 60%,
				var(--team-secondary) 90%,
				var(--team-primary) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(19, 18, 48, 0.9) 0%,
				rgba(196, 30, 58, 0.4) 40%,
				rgba(0, 0, 0, 0.6) 100%
			);
		background-blend-mode: screen, multiply;
		filter: brightness(calc((var(--hyp) + 0.7) * 0.8)) contrast(3.0) saturate(0.9);
	}

	.card[data-team="kia-tigers"] .card__shine {
		--space: 2px;
		background-image:
			repeating-linear-gradient(
				135deg,
				var(--team-primary) 0%,
				var(--team-secondary) 20%,
				var(--team-accent) 40%,
				var(--team-secondary) 60%,
				var(--team-primary) 80%,
				var(--team-primary) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(234, 0, 41, 0.8) 0%,
				rgba(255, 255, 255, 0.2) 30%,
				rgba(0, 0, 0, 0.5) 100%
			);
		background-blend-mode: color-burn, screen;
		filter: brightness(calc((var(--hyp) + 0.9) * 0.85)) contrast(2.5) saturate(1.3);
	}

	.card[data-team="samsung-lions"] .card__shine {
		--space: 5px;
		background-image:
			repeating-linear-gradient(
				60deg,
				var(--team-primary) 0%,
				var(--team-accent) 25%,
				var(--team-secondary) 50%,
				var(--team-accent) 75%,
				var(--team-primary) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(7, 76, 161, 0.7) 0%,
				rgba(255, 255, 255, 0.3) 35%,
				rgba(234, 0, 41, 0.2) 70%,
				rgba(0, 0, 0, 0.4) 100%
			);
		background-blend-mode: soft-light, overlay;
		filter: brightness(calc((var(--hyp) + 0.8) * 0.9)) contrast(2.7) saturate(1.1);
	}

	.card[data-team="lotte-giants"] .card__shine {
		--space: 3px;
		background-image:
			repeating-linear-gradient(
				120deg,
				var(--team-primary) 0%,
				var(--team-secondary) 30%,
				var(--team-accent) 60%,
				var(--team-secondary) 90%,
				var(--team-primary) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(4, 30, 66, 0.8) 0%,
				rgba(196, 30, 58, 0.4) 40%,
				rgba(255, 255, 255, 0.1) 80%,
				rgba(0, 0, 0, 0.5) 100%
			);
		background-blend-mode: hard-light, multiply;
		filter: brightness(calc((var(--hyp) + 0.7) * 0.8)) contrast(2.9) saturate(1.0);
	}

	.card[data-card-type="stadium"] .card__shine {
		background-image:
			repeating-linear-gradient(
				0deg,
				rgba(255, 255, 255, 0.1) 0%,
				rgba(255, 255, 255, 0.3) 50%,
				rgba(255, 255, 255, 0.1) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(255, 255, 255, 0.6) 0%,
				rgba(255, 255, 255, 0.2) 50%,
				rgba(0, 0, 0, 0.3) 100%
			);
		background-blend-mode: overlay, soft-light;
		filter: brightness(calc((var(--hyp) + 1.0) * 0.9)) contrast(2.0) saturate(0.8);
	}

	.card[data-card-type="moment"] .card__shine {
		background-image:
			repeating-linear-gradient(
				45deg,
				rgba(255, 215, 0, 0.3) 0%,
				rgba(255, 255, 255, 0.5) 25%,
				rgba(255, 215, 0, 0.3) 50%,
				rgba(255, 255, 255, 0.5) 75%,
				rgba(255, 215, 0, 0.3) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(255, 215, 0, 0.8) 0%,
				rgba(255, 255, 255, 0.4) 30%,
				rgba(255, 215, 0, 0.2) 60%,
				rgba(0, 0, 0, 0.4) 100%
			);
		background-blend-mode: screen, overlay;
		filter: brightness(calc((var(--hyp) + 1.1) * 0.95)) contrast(2.2) saturate(1.4);
	}

	.card[data-card-type="achievement"] .card__shine {
		background-image:
			repeating-linear-gradient(
				90deg,
				rgba(255, 0, 0, 0.4) 0%,
				rgba(255, 255, 0, 0.4) 20%,
				rgba(0, 255, 0, 0.4) 40%,
				rgba(0, 255, 255, 0.4) 60%,
				rgba(0, 0, 255, 0.4) 80%,
				rgba(255, 0, 255, 0.4) 100%
			),
			radial-gradient(
				farthest-corner circle at var(--mx) var(--my),
				rgba(255, 255, 255, 0.9) 0%,
				rgba(255, 255, 255, 0.3) 40%,
				rgba(0, 0, 0, 0.2) 100%
			);
		background-blend-mode: color-dodge, overlay;
		filter: brightness(calc((var(--hyp) + 1.2) * 1.0)) contrast(2.5) saturate(1.5);
	}

	/* Performance optimizations */
	@media (prefers-reduced-motion: reduce) {
		.card,
		.card__translater,
		.card__rotator,
		.card__shine,
		.card__glare {
			transition: none;
			animation: none;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.card__translater {
			perspective: 400px;
		}

		.card__shine {
			filter: brightness(calc((var(--hyp) + 0.8) * 0.8)) contrast(2.5) saturate(0.8);
		}
	}
</style>
