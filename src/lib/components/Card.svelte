<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { spring } from 'svelte/motion';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import {
		getSpringConfig,
		CSSVariableUpdater,
		type HolographicConfig,
	} from '$lib/holographic-engine';

	// Baseball card data props
	export let id: string = '';
	export let playerName: string = '';
	export let team: string = '';
	export let position: string = '';
	export let year: string = '';
	export let cardNumber: string = '';
	export let series: string = '';
	export let rarity: string = 'common';

	// Image props
	export let img: string = '';
	export let back: string = 'https://holographic-cards.b-cdn.net/backs/baseball-card-back.webp';

	// Display props
	export let showcase: boolean = false;
	export let width: string = '280px';
	export let height: string = '392px';
	export let interactive: boolean = true;

	let cardElement: HTMLElement;
	let isHovered = false;

	// Device capabilities
	let deviceCapabilities = {
		isMobile: false,
		isReducedMotion: false,
		isHighContrast: false,
		supportsGPU: true,
		isLowEndDevice: false,
	};

	// Determine holographic effect based on rarity
	function getHolographicEffect():
		| 'basic'
		| 'rainbow'
		| 'cosmic'
		| 'aurora'
		| 'neon'
		| 'galaxy'
		| 'secret' {
		const fRarity = rarity.toLowerCase();

		if (fRarity.includes('rookie')) return 'rainbow';
		if (fRarity.includes('special')) return 'cosmic';
		if (fRarity.includes('vintage')) return 'aurora';
		if (fRarity.includes('all-star')) return 'neon';
		if (fRarity.includes('rare') || fRarity.includes('ultra')) return 'galaxy';
		if (fRarity.includes('secret') || fRarity.includes('legendary')) return 'secret';

		return 'basic';
	}

	function getEffectIntensity(): number {
		const fRarity = rarity.toLowerCase();

		if (fRarity.includes('secret') || fRarity.includes('legendary')) return 1.0;
		if (fRarity.includes('rare') || fRarity.includes('ultra')) return 0.9;
		if (fRarity.includes('special') || fRarity.includes('all-star')) return 0.8;
		if (fRarity.includes('rookie') || fRarity.includes('vintage')) return 0.7;

		return 0.6;
	}

	// Holographic configuration
	let config: HolographicConfig = {
		intensity: getEffectIntensity(),
		interactive,
		effect: getHolographicEffect(),
		reducedMotion: deviceCapabilities.isReducedMotion,
		mobile: deviceCapabilities.isMobile,
	};

	// Svelte Spring-based physics system
	const springConfig = getSpringConfig(config.mobile, config.reducedMotion);
	const cardTransform = spring(
		{ rotateX: 0, rotateY: 0, scale: 1, translateX: 0, translateY: 0 },
		springConfig
	);

	const holographicOpacity = tweened(0, {
		duration: config.reducedMotion ? 0 : 200,
		easing: cubicOut,
	});

	const pointerPosition = spring(
		{ x: 50, y: 50 },
		{ stiffness: springConfig.stiffness * 1.5, damping: springConfig.damping }
	);

	// Performance optimization flags
	let isReducedMotion = config.reducedMotion;
	let isMobile = config.mobile;
	let cssUpdater: CSSVariableUpdater;
	let isSpinning = false;
	let spinRotation = 0;

	function handleClick() {
		console.log('🖱️ Baseball card clicked - Starting realistic spin');

		if (isSpinning || isReducedMotion) {
			console.log('⏸️ Click ignored:', { isSpinning, isReducedMotion });
			return;
		}

		isSpinning = true;
		spinRotation = 0;

		let spinVelocity = isMobile ? 15 : 22;
		const dampingFactor = 0.94;
		const minVelocity = 0.3;

		console.log('🌀 Starting realistic Y-axis spin animation');

		const realisticSpinAnimation = () => {
			spinRotation += spinVelocity;
			spinVelocity *= dampingFactor;

			if (cssUpdater) {
				cssUpdater.set('--spin-rotation', `${spinRotation}deg`);
			} else if (cardElement) {
				cardElement.style.setProperty('--spin-rotation', `${spinRotation}deg`);
			}

			if (Math.abs(spinVelocity) > minVelocity) {
				requestAnimationFrame(realisticSpinAnimation);
			} else {
				const settledRotation = Math.round(spinRotation / 360) * 360;

				const settleAnimation = () => {
					const diff = settledRotation - spinRotation;
					if (Math.abs(diff) > 0.1) {
						spinRotation += diff * 0.1;

						if (cssUpdater) {
							cssUpdater.set('--spin-rotation', `${spinRotation}deg`);
						} else if (cardElement) {
							cardElement.style.setProperty('--spin-rotation', `${spinRotation}deg`);
						}

						requestAnimationFrame(settleAnimation);
					} else {
						console.log('✅ Realistic spin animation completed');
						isSpinning = false;
						spinRotation = 0;

						if (cssUpdater) {
							cssUpdater.set('--spin-rotation', '0deg');
						} else if (cardElement) {
							cardElement.style.setProperty('--spin-rotation', '0deg');
						}

						if (!isHovered) {
							try {
								holographicOpacity.set(0);
								cardTransform.set({
									rotateX: 0,
									rotateY: 0,
									scale: 1,
									translateX: 0,
									translateY: 0,
								});
								pointerPosition.set({ x: 50, y: 50 });
							} catch (error) {
								console.warn('⚠️ Reset animation error:', error);
							}
						}
					}
				};

				settleAnimation();
			}
		};

		realisticSpinAnimation();
	}

	onMount(() => {
		if (!browser) return;

		console.log('🎴 Initializing baseball holographic card:', { playerName, team, rarity });

		if (!cardElement) {
			console.error('❌ Card element not available');
			return;
		}

		cssUpdater = new CSSVariableUpdater(cardElement);
		console.log('✅ CSS updater initialized');

		try {
			if (typeof window !== 'undefined') {
				const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
				const isReducedMotionPreferred = window.matchMedia(
					'(prefers-reduced-motion: reduce)'
				).matches;

				deviceCapabilities = {
					...deviceCapabilities,
					isMobile: isMobileDevice,
					isReducedMotion: isReducedMotionPreferred,
				};

				config = {
					...config,
					reducedMotion: isReducedMotionPreferred,
					mobile: isMobileDevice,
				};

				isReducedMotion = isReducedMotionPreferred;
				isMobile = isMobileDevice;

				console.log('📱 Device capabilities detected:', {
					mobile: isMobile,
					reducedMotion: isReducedMotion,
					interactive: interactive,
					effect: getHolographicEffect(),
				});
			}
		} catch (error) {
			console.warn('⚠️ Device capabilities detection failed, using defaults:', error);
			isReducedMotion = false;
			isMobile = false;
		}

		// Initialize CSS variables
		const initializeCSS = () => {
			if (!cardElement) return;

			cardElement.style.setProperty('--pointer-x', '50%');
			cardElement.style.setProperty('--pointer-y', '50%');
			cardElement.style.setProperty('--pointer-from-center', '0');
			cardElement.style.setProperty('--pointer-from-top', '0.5');
			cardElement.style.setProperty('--pointer-from-left', '0.5');
			cardElement.style.setProperty('--card-opacity', `${config.intensity * 0.7}`);
			cardElement.style.setProperty('--rotate-x', '0deg');
			cardElement.style.setProperty('--rotate-y', '0deg');
			cardElement.style.setProperty('--card-scale', '1');
			cardElement.style.setProperty('--translate-x', '0px');
			cardElement.style.setProperty('--translate-y', '0px');
			cardElement.style.setProperty('--spin-rotation', '0deg');
			cardElement.style.setProperty('--background-x', '50%');
			cardElement.style.setProperty('--background-y', '50%');

			console.log('🎨 CSS variables initialized with visible opacity');
		};

		initializeCSS();

		// Auto-activate holographic effects with higher visibility
		setTimeout(() => {
			if (cardElement) {
				cardElement.style.setProperty('--card-opacity', `${Math.min(config.intensity * 1.2, 1.0)}`);
				console.log('🌟 Holographic effects auto-activated on load with enhanced visibility');
			}
		}, 100);

		// Subscribe to spring values
		const unsubscribeTransform = cardTransform.subscribe((value) => {
			if (!cardElement || isReducedMotion) return;

			try {
				cardElement.style.setProperty('--rotate-x', `${value.rotateX}deg`);
				cardElement.style.setProperty('--rotate-y', `${value.rotateY}deg`);
				cardElement.style.setProperty('--card-scale', `${value.scale}`);
				cardElement.style.setProperty('--translate-x', `${value.translateX}px`);
				cardElement.style.setProperty('--translate-y', `${value.translateY}px`);
			} catch (error) {
				console.warn('⚠️ Transform subscription error:', error);
			}
		});

		const unsubscribeOpacity = holographicOpacity.subscribe((value) => {
			if (!cardElement) return;

			try {
				cardElement.style.setProperty('--card-opacity', `${value}`);
			} catch (error) {
				console.warn('⚠️ Opacity subscription error:', error);
			}
		});

		const unsubscribePointer = pointerPosition.subscribe((value) => {
			if (!cardElement) return;

			try {
				cardElement.style.setProperty('--pointer-x', `${value.x}%`);
				cardElement.style.setProperty('--pointer-y', `${value.y}%`);
				cardElement.style.setProperty('--background-x', `${value.x}%`);
				cardElement.style.setProperty('--background-y', `${value.y}%`);
			} catch (error) {
				console.warn('⚠️ Pointer subscription error:', error);
			}
		});

		function handleMouseMove(e: MouseEvent) {
			if (!cardElement) return;

			console.log('🖱️ Mouse move detected on baseball card');

			const rect = cardElement.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const newPointerX = ((e.clientX - rect.left) / rect.width) * 100;
			const newPointerY = ((e.clientY - rect.top) / rect.height) * 100;

			const deltaX = (e.clientX - centerX) / (rect.width / 2);
			const deltaY = (e.clientY - centerY) / (rect.height / 2);
			const fromCenter = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);

			const maxRotation = isMobile ? 20 : 35;
			const distanceMultiplier = Math.pow(fromCenter, 0.7);
			const rotationIntensity = 0.8 + distanceMultiplier * 0.4;

			const targetRotateX = deltaY * -1 * maxRotation * rotationIntensity;
			const targetRotateY = deltaX * maxRotation * rotationIntensity;

			const maxTranslate = isMobile ? 6 : 12;
			const targetTranslateX = deltaX * maxTranslate;
			const targetTranslateY = deltaY * maxTranslate;

			const baseScale = 1.02;
			const scaleBoost = fromCenter * 0.06;
			const targetScale = baseScale + scaleBoost;

			cardElement.style.setProperty('--pointer-x', `${Math.max(0, Math.min(100, newPointerX))}%`);
			cardElement.style.setProperty('--pointer-y', `${Math.max(0, Math.min(100, newPointerY))}%`);
			cardElement.style.setProperty('--pointer-from-center', `${fromCenter}`);
			cardElement.style.setProperty('--pointer-from-top', `${newPointerY / 100}`);
			cardElement.style.setProperty('--pointer-from-left', `${newPointerX / 100}`);
			cardElement.style.setProperty(
				'--background-x',
				`${Math.max(0, Math.min(100, newPointerX))}%`
			);
			cardElement.style.setProperty(
				'--background-y',
				`${Math.max(0, Math.min(100, newPointerY))}%`
			);

			if (!isReducedMotion) {
				cardElement.style.setProperty('--rotate-x', `${targetRotateX}deg`);
				cardElement.style.setProperty('--rotate-y', `${targetRotateY}deg`);
				cardElement.style.setProperty('--translate-x', `${targetTranslateX}px`);
				cardElement.style.setProperty('--translate-y', `${targetTranslateY}px`);
				cardElement.style.setProperty('--card-scale', `${targetScale}`);
				cardElement.style.setProperty('--translate-z', '20px');
			}
		}

		function handleMouseEnter() {
			console.log('🖱️ Mouse enter - boosting holographic effects');
			isHovered = true;

			if (cardElement) {
				cardElement.style.setProperty('--card-opacity', `${config.intensity}`);
				cardElement.style.setProperty('--pointer-x', '50%');
				cardElement.style.setProperty('--pointer-y', '50%');
				cardElement.style.setProperty('--background-x', '50%');
				cardElement.style.setProperty('--background-y', '50%');
				cardElement.style.setProperty('--pointer-from-center', '0');

				console.log('✅ Holographic effects boosted to full intensity:', config.intensity);
			}
		}

		function handleMouseLeave() {
			console.log('🖱️ Mouse leave - reducing holographic effects');
			isHovered = false;

			if (!isSpinning) {
				try {
					if (cardElement) {
						cardElement.style.setProperty('--card-opacity', `${config.intensity * 0.4}`);
					}

					cardTransform.set({
						rotateX: 0,
						rotateY: 0,
						scale: 1,
						translateX: 0,
						translateY: 0,
					});

					pointerPosition.set({ x: 50, y: 50 });
				} catch (error) {
					console.warn('⚠️ Mouse leave error:', error);
					if (cardElement) {
						cardElement.style.setProperty('--card-opacity', `${config.intensity * 0.4}`);
						cardElement.style.setProperty('--rotate-x', '0deg');
						cardElement.style.setProperty('--rotate-y', '0deg');
						cardElement.style.setProperty('--card-scale', '1');
						cardElement.style.setProperty('--translate-x', '0px');
						cardElement.style.setProperty('--translate-y', '0px');
						cardElement.style.setProperty('--pointer-x', '50%');
						cardElement.style.setProperty('--pointer-y', '50%');
						cardElement.style.setProperty('--background-x', '50%');
						cardElement.style.setProperty('--background-y', '50%');
					}
				}

				cardElement?.style.setProperty('--pointer-from-center', '0');
				cardElement?.style.setProperty('--pointer-from-top', '0.5');
				cardElement?.style.setProperty('--pointer-from-left', '0.5');
			}
		}

		function handleTouchMove(e: TouchEvent) {
			e.preventDefault();
			const touch = e.touches[0];
			handleMouseMove({
				clientX: touch.clientX,
				clientY: touch.clientY,
			} as MouseEvent);
		}

		try {
			cardElement.addEventListener('mousemove', handleMouseMove);
			cardElement.addEventListener('mouseenter', handleMouseEnter);
			cardElement.addEventListener('mouseleave', handleMouseLeave);
			cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
			cardElement.addEventListener('touchstart', handleMouseEnter);
			cardElement.addEventListener('touchend', handleMouseLeave);

			console.log('✅ Event listeners registered');
		} catch (error) {
			console.error('❌ Failed to register event listeners:', error);
		}

		return () => {
			console.log('🧹 Cleaning up baseball holographic card');

			try {
				if (cardElement) {
					cardElement.removeEventListener('mousemove', handleMouseMove);
					cardElement.removeEventListener('mouseenter', handleMouseEnter);
					cardElement.removeEventListener('mouseleave', handleMouseLeave);
					cardElement.removeEventListener('touchmove', handleTouchMove);
					cardElement.removeEventListener('touchstart', handleMouseEnter);
					cardElement.removeEventListener('touchend', handleMouseLeave);
				}
			} catch (error) {
				console.warn('⚠️ Error removing event listeners:', error);
			}

			try {
				unsubscribeTransform();
				unsubscribeOpacity();
				unsubscribePointer();
			} catch (error) {
				console.warn('⚠️ Error unsubscribing from springs:', error);
			}
		};
	});

	$: cardClasses = [
		'holographic-card',
		`card--${getHolographicEffect()}`,
		'relative overflow-hidden transition-transform duration-100 ease-out',
		isReducedMotion ? 'reduced-motion' : '',
		isMobile ? 'mobile-optimized' : '',
		showcase ? 'card-showcase' : '',
		interactive ? 'debug-interactive' : 'debug-non-interactive',
	]
		.filter(Boolean)
		.join(' ');
</script>

{#if interactive}
	<button
		bind:this={cardElement}
		class={cardClasses}
		style="width: {width}; height: {height}; border: none; background: none; padding: 0;"
		aria-label="Holographic baseball card: {playerName} - {team}. Click to spin."
		on:click={handleClick}
	>
		<!-- Baseball Card Content -->
		<div class="relative z-10 w-full h-full">
			<!-- Card Background Image -->
			<div class="absolute inset-0 w-full h-full">
				<img
					src={img}
					alt="{playerName} - {team}"
					class="w-full h-full object-cover rounded-xl"
					loading="lazy"
				/>
				<!-- Gradient Overlays -->
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 rounded-xl"
				></div>
			</div>

			<!-- Card Header -->
			<div class="absolute top-0 left-0 right-0 p-4 z-20">
				<div class="text-center">
					<h3 class="text-lg font-bold text-white mb-1 drop-shadow-lg">{playerName}</h3>
					<p class="text-sm text-yellow-300 font-medium drop-shadow-lg">{team}</p>
				</div>
			</div>

			<!-- Position Badge -->
			<div
				class="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-black text-xs px-2 py-1 rounded-full font-bold shadow-lg z-20"
			>
				{position}
			</div>

			<!-- Card Footer -->
			<div class="absolute bottom-0 left-0 right-0 p-4 z-20">
				<div class="text-center space-y-2">
					<!-- Rarity -->
					<div class="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
						<p class="text-xs text-yellow-300 font-semibold uppercase tracking-wide drop-shadow-lg">
							{rarity}
						</p>
					</div>

					<!-- Card Info -->
					<div class="flex justify-center items-center gap-3 text-xs text-white">
						<div
							class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
						>
							<span class="font-semibold drop-shadow-lg">#{cardNumber}</span>
						</div>
						<div
							class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
						>
							<span class="font-semibold drop-shadow-lg">{year}</span>
						</div>
						<div
							class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
						>
							<span class="font-semibold drop-shadow-lg text-blue-300">{series}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Debug Info (only in development) -->
			{#if browser && typeof window !== 'undefined' && window.location.hostname === 'localhost'}
				<div
					class="absolute top-2 left-2 text-xs bg-black/50 text-white p-1 rounded opacity-50 pointer-events-none z-50"
				>
					{getHolographicEffect()} | {isHovered ? 'hover' : 'idle'} | {isSpinning
						? 'spin'
						: 'static'}
				</div>
			{/if}
		</div>

		<!-- Enhanced Holographic Effects -->
		{#if !isReducedMotion}
			<div class="card__texture" aria-hidden="true"></div>
			<div class="card__foil" aria-hidden="true"></div>
			<div class="card__shine" aria-hidden="true"></div>
			<div class="card__glare" aria-hidden="true"></div>
			<!-- Additional sparkle layer for premium effects -->
			{#if (getHolographicEffect() === 'rainbow' || getHolographicEffect() === 'cosmic' || getHolographicEffect() === 'secret' || getHolographicEffect() === 'galaxy' || getHolographicEffect() === 'neon') && !isMobile}
				<div class="card__sparkles" aria-hidden="true"></div>
			{/if}
		{/if}
	</button>
{:else}
	<div
		bind:this={cardElement}
		class={cardClasses}
		style="width: {width}; height: {height};"
		role="img"
		aria-label="Holographic baseball card: {playerName} - {team}"
	>
		<!-- Baseball Card Content (same as above) -->
		<div class="relative z-10 w-full h-full">
			<div class="absolute inset-0 w-full h-full">
				<img
					src={img}
					alt="{playerName} - {team}"
					class="w-full h-full object-cover rounded-xl"
					loading="lazy"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 rounded-xl"
				></div>
			</div>

			<div class="absolute top-0 left-0 right-0 p-4 z-20">
				<div class="text-center">
					<h3 class="text-lg font-bold text-white mb-1 drop-shadow-lg">{playerName}</h3>
					<p class="text-sm text-yellow-300 font-medium drop-shadow-lg">{team}</p>
				</div>
			</div>

			<div
				class="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-black text-xs px-2 py-1 rounded-full font-bold shadow-lg z-20"
			>
				{position}
			</div>

			<div class="absolute bottom-0 left-0 right-0 p-4 z-20">
				<div class="text-center space-y-2">
					<div class="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
						<p class="text-xs text-yellow-300 font-semibold uppercase tracking-wide drop-shadow-lg">
							{rarity}
						</p>
					</div>

					<div class="flex justify-center items-center gap-3 text-xs text-white">
						<div
							class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
						>
							<span class="font-semibold drop-shadow-lg">#{cardNumber}</span>
						</div>
						<div
							class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
						>
							<span class="font-semibold drop-shadow-lg">{year}</span>
						</div>
						<div
							class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
						>
							<span class="font-semibold drop-shadow-lg text-blue-300">{series}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		{#if !isReducedMotion}
			<div class="card__texture" aria-hidden="true"></div>
			<div class="card__foil" aria-hidden="true"></div>
			<div class="card__shine" aria-hidden="true"></div>
			<div class="card__glare" aria-hidden="true"></div>
			{#if (getHolographicEffect() === 'rainbow' || getHolographicEffect() === 'cosmic' || getHolographicEffect() === 'secret' || getHolographicEffect() === 'galaxy' || getHolographicEffect() === 'neon') && !isMobile}
				<div class="card__sparkles" aria-hidden="true"></div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	/* ===== HOLOGRAPHIC CARD BASE STYLES ===== */
	.holographic-card {
		/* 핵심: 불투명한 배경 + isolation으로 블렌드 컨텍스트 보장 */
		position: relative;
		background: #000;
		isolation: isolate;
		border-radius: 12px;
		overflow: hidden;
		
		transform-style: preserve-3d;
		perspective: 1200px;

		transform: perspective(1200px) rotateX(var(--rotate-x))
			rotateY(calc(var(--rotate-y) + var(--spin-rotation, 0deg))) scale(var(--card-scale))
			translate3d(var(--translate-x), var(--translate-y), var(--translate-z, 0px));

		/* Enhanced Pokemon-style shadow with holographic glow */
		filter: drop-shadow(
				calc(var(--rotate-y) * 0.15px) calc(var(--rotate-x) * 0.15px + 12px)
					calc(16px + var(--pointer-from-center, 0) * 12px)
					rgba(0, 0, 0, calc(0.25 + var(--pointer-from-center, 0) * 0.2))
			)
			drop-shadow(
				0px 0px calc(8px + var(--pointer-from-center, 0) * 16px)
					rgba(99, 102, 241, calc(var(--card-opacity, 0) * 0.3))
			);

		will-change: transform, filter;
		transition:
			transform 0.08s cubic-bezier(0.23, 1, 0.32, 1),
			filter 0.2s ease;
	}

	.holographic-card:hover {
		--translate-z: 20px;
	}

	/* Pokemon-style holographic border glow */
	.holographic-card::before {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		background: linear-gradient(
			calc(var(--pointer-x, 50%) * 2deg + 45deg),
			rgba(99, 102, 241, 0.6),
			rgba(139, 92, 246, 0.6),
			rgba(236, 72, 153, 0.6),
			rgba(251, 146, 60, 0.6),
			rgba(99, 102, 241, 0.6)
		);
		border-radius: inherit;
		opacity: calc(var(--card-opacity, 0) * 0.5);
		z-index: -1;
		animation: border-glow 3s linear infinite;
		pointer-events: none;
	}

	@keyframes border-glow {
		0% {
			background-position: 0% 50%;
			filter: hue-rotate(0deg);
		}
		50% {
			background-position: 100% 50%;
			filter: hue-rotate(180deg);
		}
		100% {
			background-position: 0% 50%;
			filter: hue-rotate(360deg);
		}
	}

	/* Holographic effect layers */
	.card__texture,
	.card__foil,
	.card__shine,
	.card__glare,
	.card__sparkles {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		border-radius: inherit;
		opacity: var(--card-opacity, 0);
		mix-blend-mode: color-dodge;
		transition: opacity 0.2s ease;
	}

	/* Edge 호환성을 위한 폴백 */
	@supports (mix-blend-mode: plus-lighter) {
		.card__foil.edge-fallback {
			mix-blend-mode: plus-lighter;
			filter: saturate(160%) contrast(130%) brightness(120%);
		}
	}

	/* color-dodge가 제대로 작동하지 않을 때 screen 폴백 */
	@supports not (mix-blend-mode: color-dodge) {
		.card__foil,
		.card__shine,
		.card__glare {
			mix-blend-mode: screen;
			filter: saturate(140%) contrast(120%) brightness(110%);
		}
	}

	.card__foil {
		background-position: var(--background-x, 50%) var(--background-y, 50%);
		background-size: 400% 400%;
		z-index: 1;
	}

	.card__shine {
		background: linear-gradient(
			calc(var(--pointer-x, 50%) * 1deg + 115deg),
			transparent 0%,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.4) 49%,
			rgba(255, 255, 255, 0.6) 50%,
			rgba(255, 255, 255, 0.4) 51%,
			rgba(255, 255, 255, 0.1) 75%,
			transparent 100%
		);
		background-position: var(--pointer-x, 50%) var(--pointer-y, 50%);
		background-size: 400% 400%;
		z-index: 2;
		animation: shine-sweep 3s ease-in-out infinite;
	}

	@keyframes shine-sweep {
		0%,
		100% {
			background-position: -200% 0%;
			opacity: 0.3;
		}
		50% {
			background-position: 200% 0%;
			opacity: 0.8;
		}
	}

	.card__glare {
		background: radial-gradient(
			ellipse 600px 200px at var(--pointer-x, 50%) var(--pointer-y, 50%),
			rgba(255, 255, 255, 0.8) 0%,
			rgba(255, 255, 255, 0.4) 20%,
			rgba(255, 255, 255, 0.1) 40%,
			transparent 60%
		);
		mix-blend-mode: overlay;
		opacity: calc(var(--pointer-from-center, 0) * var(--card-opacity, 0) * 0.8);
		z-index: 3;
	}

	.card__sparkles {
		z-index: 4;
		mix-blend-mode: screen;
		background:
			radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.4) 0%, transparent 50%);
		background-size:
			calc(var(--pointer-from-center, 0) * 100px + 20px)
				calc(var(--pointer-from-center, 0) * 100px + 20px),
			calc(var(--pointer-from-center, 0) * 80px + 15px)
				calc(var(--pointer-from-center, 0) * 80px + 15px),
			calc(var(--pointer-from-center, 0) * 60px + 10px)
				calc(var(--pointer-from-center, 0) * 60px + 10px);
		animation: sparkle-twinkle 2s ease-in-out infinite;
	}

	@keyframes sparkle-twinkle {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.1);
		}
	}

	/* Reduced motion support */
	.reduced-motion .holographic-card {
		transform: none !important;
		filter: none !important;
		transition: none !important;
	}

	.reduced-motion .card__texture,
	.reduced-motion .card__foil,
	.reduced-motion .card__shine,
	.reduced-motion .card__glare,
	.reduced-motion .card__sparkles {
		opacity: 0 !important;
		animation: none !important;
	}

	/* Mobile optimizations */
	.mobile-optimized .holographic-card {
		perspective: 800px;
	}

	/* Debug styles */
	.debug-interactive {
		cursor: pointer;
	}

	.debug-non-interactive {
		cursor: default;
	}

	/* ===== POKEMON CARDS HOLOGRAPHIC EFFECTS ===== */

	/* Basic Holo - Simple rainbow gradient (sRGB 최적화) */
	:global(.card--basic .card__foil) {
		background: linear-gradient(
			calc(var(--pointer-x, 50%) * 2deg + 115deg),
			transparent 0%,
			rgba(255, 0, 153, 0.5) 25%,
			rgba(255, 204, 0, 0.6) 35%,
			rgba(255, 0, 153, 0.5) 45%,
			rgba(0, 255, 255, 0.6) 55%,
			rgba(255, 0, 153, 0.5) 65%,
			rgba(255, 204, 0, 0.6) 75%,
			transparent 100%
		);
		background-size: 300% 300%;
		background-position: var(--background-x, 50%) var(--background-y, 50%);
		animation: basic-shift 3s ease-in-out infinite;
	}

	@keyframes basic-shift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	/* Cosmic Holo - Galaxy effect with conic gradient */
	:global(.card--cosmic .card__foil) {
		background:
			radial-gradient(
				ellipse 600px 200px at var(--pointer-x, 50%) var(--pointer-y, 50%),
				rgba(138, 43, 226, 0.8) 0%,
				rgba(30, 144, 255, 0.6) 30%,
				rgba(255, 20, 147, 0.4) 60%,
				transparent 100%
			),
			linear-gradient(
				calc(var(--pointer-x, 50%) * 2deg + 45deg),
				transparent 0%,
				rgba(0, 231, 255, 0.4) 20%,
				rgba(255, 0, 231, 0.6) 40%,
				rgba(255, 206, 84, 0.4) 60%,
				rgba(138, 43, 226, 0.3) 80%,
				transparent 100%
			),
			conic-gradient(
				from calc(var(--pointer-y, 50%) * 3.6deg),
				rgba(138, 43, 226, 0.3) 0deg,
				rgba(0, 191, 255, 0.3) 120deg,
				rgba(255, 20, 147, 0.3) 240deg,
				rgba(138, 43, 226, 0.3) 360deg
			);
		background-size:
			200% 200%,
			400% 400%,
			300% 300%;
		animation: cosmic-pulse 4s ease-in-out infinite;
	}

	@keyframes cosmic-pulse {
		0%,
		100% {
			background-size:
				200% 200%,
				400% 400%,
				300% 300%;
			filter: hue-rotate(0deg) brightness(1);
		}
		50% {
			background-size:
				250% 250%,
				500% 500%,
				400% 400%;
			filter: hue-rotate(60deg) brightness(1.2);
		}
	}

	/* Rainbow Holo - Full spectrum with radial overlay */
	:global(.card--rainbow .card__foil) {
		background:
			linear-gradient(
				calc(var(--pointer-x, 50%) * 3deg + 45deg),
				rgba(255, 0, 0, 0.9) 0%,
				rgba(255, 128, 0, 0.9) 12.5%,
				rgba(255, 255, 0, 0.9) 25%,
				rgba(128, 255, 0, 0.9) 37.5%,
				rgba(0, 255, 0, 0.9) 50%,
				rgba(0, 255, 128, 0.9) 62.5%,
				rgba(0, 255, 255, 0.9) 75%,
				rgba(0, 128, 255, 0.9) 87.5%,
				rgba(0, 0, 255, 0.9) 100%
			),
			radial-gradient(
				circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
				rgba(255, 255, 255, 0.3) 0%,
				rgba(255, 255, 255, 0.1) 30%,
				transparent 60%
			);
		background-size:
			400% 400%,
			200% 200%;
		animation: rainbow-wave 2s ease-in-out infinite;
	}

	@keyframes rainbow-wave {
		0%,
		100% {
			background-position:
				0% 50%,
				center;
			filter: hue-rotate(0deg) saturate(1);
		}
		33% {
			background-position:
				50% 100%,
				center;
			filter: hue-rotate(120deg) saturate(1.3);
		}
		66% {
			background-position:
				100% 50%,
				center;
			filter: hue-rotate(240deg) saturate(1.1);
		}
	}

	/* Aurora Holo - Pastel northern lights with multiple layers */
	:global(.card--aurora .card__foil) {
		background:
			linear-gradient(
				calc(var(--pointer-x, 50%) * 2deg + 60deg),
				transparent 0%,
				rgba(168, 237, 234, 0.6) 20%,
				rgba(254, 214, 227, 0.8) 40%,
				rgba(210, 153, 194, 0.6) 60%,
				rgba(254, 249, 215, 0.4) 80%,
				transparent 100%
			),
			radial-gradient(
				ellipse 400px 100px at var(--pointer-x, 50%) var(--pointer-y, 50%),
				rgba(168, 237, 234, 0.4) 0%,
				rgba(254, 214, 227, 0.3) 50%,
				transparent 100%
			),
			linear-gradient(
				calc(var(--pointer-y, 50%) * -1deg + 120deg),
				transparent 0%,
				rgba(210, 153, 194, 0.3) 30%,
				rgba(254, 249, 215, 0.5) 60%,
				transparent 100%
			);
		background-size:
			300% 300%,
			200% 200%,
			250% 250%;
		animation: aurora-dance 5s ease-in-out infinite;
	}

	@keyframes aurora-dance {
		0%,
		100% {
			background-position:
				0% 50%,
				center,
				0% 50%;
			filter: brightness(1) saturate(1);
		}
		33% {
			background-position:
				50% 100%,
				center,
				100% 50%;
			filter: brightness(1.2) saturate(1.3);
		}
		66% {
			background-position:
				100% 0%,
				center,
				50% 100%;
			filter: brightness(0.9) saturate(0.8);
		}
	}

	/* Neon Holo - Electric cyberpunk effect */
	:global(.card--neon .card__foil) {
		background:
			linear-gradient(
				calc(var(--pointer-x, 50%) * 2deg + 90deg),
				transparent 0%,
				rgba(18, 194, 233, 0.8) 20%,
				rgba(196, 113, 237, 0.9) 40%,
				rgba(246, 79, 89, 0.8) 60%,
				rgba(18, 194, 233, 0.6) 80%,
				transparent 100%
			),
			radial-gradient(
				circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
				rgba(196, 113, 237, 0.6) 0%,
				rgba(18, 194, 233, 0.4) 30%,
				transparent 60%
			);
		background-size:
			350% 350%,
			200% 200%;
		animation: neon-pulse 2.5s ease-in-out infinite;
	}

	@keyframes neon-pulse {
		0%,
		100% {
			filter: brightness(1) saturate(1.2);
		}
		50% {
			filter: brightness(1.4) saturate(1.6);
		}
	}

	/* Galaxy Holo - Deep space effect with multiple radial gradients */
	:global(.card--galaxy .card__foil) {
		background:
			radial-gradient(
				circle at calc(var(--pointer-x, 50%) * 0.8%) calc(var(--pointer-y, 50%) * 0.8%),
				rgba(138, 43, 226, 0.8) 0%,
				rgba(75, 0, 130, 0.6) 20%,
				rgba(25, 25, 112, 0.4) 40%,
				transparent 60%
			),
			radial-gradient(
				circle at calc(100% - var(--pointer-x, 50%) * 0.5%)
					calc(100% - var(--pointer-y, 50%) * 0.5%),
				rgba(0, 191, 255, 0.6) 0%,
				rgba(30, 144, 255, 0.4) 30%,
				transparent 50%
			),
			linear-gradient(
				calc(var(--pointer-x, 50%) * 1deg + 135deg),
				transparent 0%,
				rgba(138, 43, 226, 0.3) 25%,
				rgba(255, 20, 147, 0.5) 50%,
				rgba(0, 191, 255, 0.3) 75%,
				transparent 100%
			);
		background-size:
			300% 300%,
			250% 250%,
			400% 400%;
		animation: galaxy-swirl 8s linear infinite;
	}

	@keyframes galaxy-swirl {
		0% {
			background-position:
				0% 0%,
				100% 100%,
				0% 50%;
			filter: hue-rotate(0deg);
		}
		25% {
			background-position:
				25% 25%,
				75% 75%,
				25% 75%;
			filter: hue-rotate(90deg);
		}
		50% {
			background-position:
				50% 50%,
				50% 50%,
				50% 100%;
			filter: hue-rotate(180deg);
		}
		75% {
			background-position:
				75% 75%,
				25% 25%,
				75% 25%;
			filter: hue-rotate(270deg);
		}
		100% {
			background-position:
				100% 100%,
				0% 0%,
				100% 50%;
			filter: hue-rotate(360deg);
		}
	}

	/* Secret Rare - Premium gold effect with repeating patterns */
	:global(.card--secret .card__foil) {
		background:
			radial-gradient(
				circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
				rgba(255, 215, 0, 0.9) 0%,
				rgba(255, 140, 0, 0.7) 20%,
				rgba(255, 69, 0, 0.5) 40%,
				rgba(255, 215, 0, 0.3) 60%,
				transparent 80%
			),
			linear-gradient(
				calc(var(--pointer-x, 50%) * 1deg + 45deg),
				rgba(255, 215, 0, 0.8) 0%,
				rgba(255, 140, 0, 0.9) 25%,
				rgba(255, 69, 0, 0.7) 50%,
				rgba(255, 140, 0, 0.9) 75%,
				rgba(255, 215, 0, 0.8) 100%
			),
			repeating-linear-gradient(
				calc(var(--pointer-y, 50%) * 0.5deg + 90deg),
				transparent,
				transparent 3px,
				rgba(255, 215, 0, 0.2) 3px,
				rgba(255, 215, 0, 0.2) 6px
			);
		background-size:
			150% 150%,
			200% 200%,
			20px 20px;
		animation: secret-gleam 3s ease-in-out infinite;
	}

	@keyframes secret-gleam {
		0%,
		100% {
			background-position:
				center,
				0% 50%,
				0px 0px;
			filter: brightness(1) contrast(1);
		}
		50% {
			background-position:
				center,
				100% 50%,
				10px 10px;
			filter: brightness(1.3) contrast(1.2);
		}
	}
</style>
