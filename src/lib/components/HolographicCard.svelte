<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';

	// Props
	export let frontImage: string;
	export let title: string = '';
	export let holographicStyle: 'rainbow' | 'cosmic' | 'aurora' | 'galaxy' | 'secret' = 'rainbow';
	export let enableFlip: boolean = false;
	export let animationSpeed: number = 600;

	// State
	let cardContainer: HTMLElement;
	let mouseX = 0;
	let mouseY = 0;
	let isHovering = false;

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Mouse tracking for holographic effect
	function handleMouseMove(e: MouseEvent) {
		if (!cardContainer) return;
		
		const rect = cardContainer.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		
		// Normalize to -1 to 1 range
		mouseX = (e.clientX - centerX) / (rect.width / 2);
		mouseY = (e.clientY - centerY) / (rect.height / 2);
		
		// Update CSS custom properties for holographic effect
		cardContainer.style.setProperty('--mouse-x', mouseX.toString());
		cardContainer.style.setProperty('--mouse-y', mouseY.toString());
		cardContainer.style.setProperty('--rotation-x', `${mouseY * 10}deg`);
		cardContainer.style.setProperty('--rotation-y', `${mouseX * -10}deg`);
		
		dispatch('hover', { mouseX, mouseY, isHovering: true });
	}

	function handleMouseEnter() {
		isHovering = true;
		dispatch('hover', { isHovering: true });
	}

	function handleMouseLeave() {
		isHovering = false;
		mouseX = 0;
		mouseY = 0;
		
		if (cardContainer) {
			cardContainer.style.setProperty('--mouse-x', '0');
			cardContainer.style.setProperty('--mouse-y', '0');
			cardContainer.style.setProperty('--rotation-x', '0deg');
			cardContainer.style.setProperty('--rotation-y', '0deg');
		}
		
		dispatch('hover', { isHovering: false });
	}

	function handleClick() {
		if (enableFlip) {
			dispatch('flip');
		}
		dispatch('click');
	}

	// Holographic style configurations
	const holographicStyles = {
		rainbow: {
			gradient: 'conic-gradient(from calc(var(--mouse-x, 0) * 180deg), #ff0080, #00e5ff, #ffff00, #ff0080)',
			blend: 'color-dodge',
			filter: 'saturate(140%) contrast(120%) brightness(110%)'
		},
		cosmic: {
			gradient: 'conic-gradient(from calc(var(--mouse-x, 0) * 90deg), #4f46e5, #06b6d4, #8b5cf6, #ec4899)',
			blend: 'screen',
			filter: 'saturate(160%) contrast(130%) brightness(105%)'
		},
		aurora: {
			gradient: 'linear-gradient(calc(135deg + var(--mouse-x, 0) * 45deg), #00ff87, #60efff, #ff006e, #8338ec)',
			blend: 'plus-lighter',
			filter: 'saturate(180%) contrast(110%) brightness(120%)'
		},
		galaxy: {
			gradient: 'radial-gradient(circle at calc(50% + var(--mouse-x, 0) * 30%) calc(50% + var(--mouse-y, 0) * 30%), #667eea, #764ba2, #f093fb)',
			blend: 'color-dodge',
			filter: 'saturate(150%) contrast(125%) brightness(115%)'
		},
		secret: {
			gradient: 'conic-gradient(from calc(var(--mouse-x, 0) * 360deg), #ffd700, #ff6b6b, #4ecdc4, #45b7d1, #ffd700)',
			blend: 'screen',
			filter: 'saturate(200%) contrast(140%) brightness(125%) hue-rotate(calc(var(--mouse-x, 0) * 30deg))'
		}
	};

	$: currentStyle = holographicStyles[holographicStyle];

	onMount(() => {
		if (!browser || !cardContainer) return;

		// Initialize CSS custom properties
		cardContainer.style.setProperty('--mouse-x', '0');
		cardContainer.style.setProperty('--mouse-y', '0');
		cardContainer.style.setProperty('--rotation-x', '0deg');
		cardContainer.style.setProperty('--rotation-y', '0deg');
	});
</script>

<div 
	class="holographic-card"
	class:hovering={isHovering}
	class:flippable={enableFlip}
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
	style="--animation-speed: {animationSpeed}ms;"
>
	<!-- Card Base (불투명 배경으로 블렌드 컨텍스트 보장) -->
	<div class="card-base">
		<!-- Card Image -->
		<img 
			class="card-image" 
			src={frontImage} 
			alt={title}
			loading="lazy"
		/>
		
		<!-- Holographic Foil Layer -->
		<div 
			class="foil-layer"
			style="
				background: {currentStyle.gradient};
				mix-blend-mode: {currentStyle.blend};
				filter: {currentStyle.filter};
			"
		></div>
		
		<!-- Glare Effect -->
		<div class="glare-effect"></div>
		
		<!-- Sparkle Pattern (선택적) -->
		<div class="sparkle-pattern"></div>
	</div>
</div>

<style>
	.holographic-card {
		position: relative;
		width: 100%;
		aspect-ratio: 63/88; /* 표준 카드 비율 */
		border-radius: 12px;
		overflow: visible; /* 카드가 잘리지 않도록 변경 */
		cursor: pointer;
		
		/* 3D 효과를 위한 perspective */
		perspective: 1000px;
		transform-style: preserve-3d;
		
		/* 성능 최적화 */
		will-change: transform;
		
		/* 터치 최적화 */
		touch-action: manipulation;
		user-select: none;
		
		transition: transform 0.2s ease-out;
	}

	.holographic-card.flippable:hover {
		transform: translateY(-4px);
	}

	.card-base {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: inherit;
		overflow: hidden;
		
		/* 핵심: 블렌드 컨텍스트 보장 (Edge 호환성) */
		background: transparent; /* 투명 배경으로 변경 */
		isolation: isolate; /* 블렌드 컨텍스트 격리 */
		
		/* 3D 틸트 효과 */
		transform: 
			rotateX(var(--rotation-x, 0deg)) 
			rotateY(var(--rotation-y, 0deg));
		transition: transform 0.1s ease-out;
	}

	.card-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
		z-index: 1;
	}

	.foil-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
		
		/* 기본 그라디언트 (JS에서 동적으로 업데이트) */
		background: conic-gradient(from 0deg, #ff0080, #00e5ff, #ffff00, #ff0080);
		
		/* 블렌드 모드 (Edge 호환성을 위해 폴백 제공) */
		mix-blend-mode: color-dodge;
		
		/* 필터 효과 */
		filter: saturate(140%) contrast(120%) brightness(110%);
		
		/* 호버 시에만 활성화 */
		opacity: 0;
		transition: opacity 0.3s ease;
		
		pointer-events: none;
	}

	.holographic-card.hovering .foil-layer {
		opacity: 0.8;
	}

	.glare-effect {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 3;
		
		background: linear-gradient(
			calc(135deg + var(--mouse-x, 0) * 45deg),
			transparent 30%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 70%
		);
		
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
	}

	.holographic-card.hovering .glare-effect {
		opacity: 1;
	}

	.sparkle-pattern {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 4;
		
		background-image: 
			radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
			radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
			radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.4) 1px, transparent 1px);
		background-size: 50px 50px, 30px 30px, 40px 40px;
		
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		
		/* 애니메이션 */
		animation: sparkle 3s ease-in-out infinite;
	}

	.holographic-card.hovering .sparkle-pattern {
		opacity: 0.6;
	}

	@keyframes sparkle {
		0%, 100% { 
			transform: scale(1) rotate(0deg);
			opacity: 0.6;
		}
		50% { 
			transform: scale(1.05) rotate(180deg);
			opacity: 0.8;
		}
	}

	/* Edge 브라우저 폴백 */
	@supports not (mix-blend-mode: color-dodge) {
		.foil-layer {
			mix-blend-mode: screen;
			filter: saturate(160%) contrast(130%) brightness(105%);
		}
	}

	/* 성능 최적화: 애니메이션 비활성화 옵션 */
	@media (prefers-reduced-motion: reduce) {
		.holographic-card,
		.card-base,
		.foil-layer,
		.glare-effect,
		.sparkle-pattern {
			transition: none;
			animation: none;
		}
	}

	/* 모바일 최적화 */
	@media (max-width: 768px) {
		.holographic-card {
			perspective: 800px;
		}
		
		.foil-layer {
			filter: saturate(120%) contrast(110%) brightness(105%);
		}
	}

	/* 고해상도 디스플레이 최적화 */
	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
		.sparkle-pattern {
			background-size: 25px 25px, 15px 15px, 20px 20px;
		}
	}
</style>