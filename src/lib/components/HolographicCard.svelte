<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { spring } from 'svelte/motion';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import {
		getSpringConfig,
		CSSVariableUpdater,
		detectBlendModeSupport,
		getOptimalBlendMode,
		type HolographicConfig,
	} from '$lib/holographic-engine';

	export let effect:
		| 'cosmic'
		| 'rainbow'
		| 'aurora'
		| 'neon'
		| 'basic'
		| 'reverse'
		| 'secret'
		| 'galaxy' = 'basic';
	export let intensity = 0.8;
	export let interactive = true;
	export let showEntrance = true; // 등장 효과 제어
	export let width = '280px';
	export let height = '392px'; // 66:92 ratio (standard trading card)

	let cardElement: HTMLElement;
	let isHovered = false;

	// Device capabilities - simplified for reliability
	let deviceCapabilities = {
		isMobile: false,
		isReducedMotion: false,
		isHighContrast: false,
		supportsGPU: true,
		isLowEndDevice: false,
	};

	// Holographic configuration with Edge compatibility
	let config: HolographicConfig = {
		intensity,
		interactive,
		effect,
		reducedMotion: deviceCapabilities.isReducedMotion,
		mobile: deviceCapabilities.isMobile,
		useBlendFallback: true,
		isolationContext: true,
	};

	// Svelte Spring-based physics system with adaptive settings
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

	// Pokemon Cards CSS style variables
	let pointerX = 50;
	let pointerY = 50;
	let pointerFromCenter = 0;
	let pointerFromTop = 0;
	let pointerFromLeft = 0;
	let cardOpacity = 0;
	let rotateX = 0;
	let rotateY = 0;
	let isSpinning = false;
	let spinRotation = 0;

	// Performance optimization flags
	let isReducedMotion = config.reducedMotion;
	let isMobile = config.mobile;
	let cssUpdater: CSSVariableUpdater;

	function handleClick() {
		console.log('🖱️ Card clicked - Starting realistic spin');

		if (isSpinning || isReducedMotion) {
			console.log('⏸️ Click ignored:', { isSpinning, isReducedMotion });
			return;
		}

		isSpinning = true;
		spinRotation = 0;
		
		// Enhanced spin physics for realistic card flip
		let spinVelocity = isMobile ? 15 : 22; // Initial spin speed
		const dampingFactor = 0.94; // More gradual deceleration
		const minVelocity = 0.3; // Minimum velocity before stopping

		console.log('🌀 Starting realistic Y-axis spin animation');

		const realisticSpinAnimation = () => {
			// Apply velocity to rotation
			spinRotation += spinVelocity;
			
			// Apply damping for realistic deceleration
			spinVelocity *= dampingFactor;

			// Update CSS with current rotation
			if (cssUpdater) {
				cssUpdater.set('--spin-rotation', `${spinRotation}deg`);
			} else if (cardElement) {
				cardElement.style.setProperty('--spin-rotation', `${spinRotation}deg`);
			}

			// Continue animation if velocity is above threshold
			if (Math.abs(spinVelocity) > minVelocity) {
				requestAnimationFrame(realisticSpinAnimation);
			} else {
				// Animation complete - settle to nearest 360° increment
				const settledRotation = Math.round(spinRotation / 360) * 360;
				
				// Smooth settle animation
				const settleAnimation = () => {
					const diff = settledRotation - spinRotation;
					if (Math.abs(diff) > 0.1) {
						spinRotation += diff * 0.1; // Smooth settle
						
						if (cssUpdater) {
							cssUpdater.set('--spin-rotation', `${spinRotation}deg`);
						} else if (cardElement) {
							cardElement.style.setProperty('--spin-rotation', `${spinRotation}deg`);
						}
						
						requestAnimationFrame(settleAnimation);
					} else {
						// Final cleanup
						console.log('✅ Realistic spin animation completed');
						isSpinning = false;
						spinRotation = 0;

						if (cssUpdater) {
							cssUpdater.set('--spin-rotation', '0deg');
						} else if (cardElement) {
							cardElement.style.setProperty('--spin-rotation', '0deg');
						}

						// Reset to hover state if mouse is still over card
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

		console.log('🎴 Initializing holographic card:', { effect, interactive, intensity });
		
		// Force interactive mode for debugging
		if (!interactive) {
			console.warn('⚠️ Card is not interactive, forcing interactive mode');
			interactive = true;
		}

		// Wait for element to be available
		if (!cardElement) {
			console.error('❌ Card element not available');
			return;
		}

		// Initialize CSS variable updater for performance
		cssUpdater = new CSSVariableUpdater(cardElement);
		console.log('✅ CSS updater initialized');

		// Update device capabilities with safe detection
		try {
			if (typeof window !== 'undefined') {
				const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
				const isReducedMotionPreferred = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				
				deviceCapabilities = {
					...deviceCapabilities,
					isMobile: isMobileDevice,
					isReducedMotion: isReducedMotionPreferred
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
					effect: effect
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
			cardElement.style.setProperty('--card-opacity', '0.3'); // 기본적으로 약간 보이도록
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

		// 페이지 로드 후 홀로그래픽 효과 즉시 활성화
		setTimeout(() => {
			if (cardElement) {
				cardElement.style.setProperty('--card-opacity', `${intensity * 0.7}`);
				console.log('🌟 Holographic effects auto-activated on load');
			}
		}, 100);



		// Subscribe to spring values for smooth animations
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
				cardOpacity = value;
				cardElement.style.setProperty('--card-opacity', `${value}`);
			} catch (error) {
				console.warn('⚠️ Opacity subscription error:', error);
			}
		});

		const unsubscribePointer = pointerPosition.subscribe((value) => {
			if (!cardElement) return;

			try {
				pointerX = value.x;
				pointerY = value.y;
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
			
			console.log('🖱️ Mouse move detected');

			const rect = cardElement.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			// Calculate pointer position as percentage
			const newPointerX = ((e.clientX - rect.left) / rect.width) * 100;
			const newPointerY = ((e.clientY - rect.top) / rect.height) * 100;

			// Calculate distance from center (0 to 1)
			const deltaX = (e.clientX - centerX) / (rect.width / 2);
			const deltaY = (e.clientY - centerY) / (rect.height / 2);
			const fromCenter = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);

			// Enhanced 3D rotation for realistic card physics
			const maxRotation = isMobile ? 20 : 35; // Increased for more dramatic effect
			const distanceMultiplier = Math.pow(fromCenter, 0.7); // Non-linear scaling
			const rotationIntensity = 0.8 + (distanceMultiplier * 0.4); // Dynamic intensity
			
			const targetRotateX = deltaY * -1 * maxRotation * rotationIntensity;
			const targetRotateY = deltaX * maxRotation * rotationIntensity;

			// Enhanced translation for realistic card lifting
			const maxTranslate = isMobile ? 6 : 12;
			const targetTranslateX = deltaX * maxTranslate;
			const targetTranslateY = deltaY * maxTranslate;
			
			// Dynamic scale based on interaction intensity
			const baseScale = 1.02;
			const scaleBoost = fromCenter * 0.06;
			const targetScale = baseScale + scaleBoost;

			// Update CSS variables directly for immediate response
			cardElement.style.setProperty('--pointer-x', `${Math.max(0, Math.min(100, newPointerX))}%`);
			cardElement.style.setProperty('--pointer-y', `${Math.max(0, Math.min(100, newPointerY))}%`);
			cardElement.style.setProperty('--pointer-from-center', `${fromCenter}`);
			cardElement.style.setProperty('--pointer-from-top', `${newPointerY / 100}`);
			cardElement.style.setProperty('--pointer-from-left', `${newPointerX / 100}`);
			cardElement.style.setProperty('--background-x', `${Math.max(0, Math.min(100, newPointerX))}%`);
			cardElement.style.setProperty('--background-y', `${Math.max(0, Math.min(100, newPointerY))}%`);
			
			if (!isReducedMotion) {
				cardElement.style.setProperty('--rotate-x', `${targetRotateX}deg`);
				cardElement.style.setProperty('--rotate-y', `${targetRotateY}deg`);
				cardElement.style.setProperty('--translate-x', `${targetTranslateX}px`);
				cardElement.style.setProperty('--translate-y', `${targetTranslateY}px`);
				cardElement.style.setProperty('--card-scale', `${targetScale}`);
				cardElement.style.setProperty('--translate-z', '20px'); // Lift effect
			}

			// Update component state
			pointerFromCenter = fromCenter;
			pointerFromTop = newPointerY / 100;
			pointerFromLeft = newPointerX / 100;
		}



		function handleMouseEnter() {
			console.log('🖱️ Mouse enter - boosting holographic effects');
			isHovered = true;

			if (cardElement) {
				// Boost holographic effects on hover
				cardElement.style.setProperty('--card-opacity', `${intensity}`);
				
				// Initialize pointer position for smooth entrance
				cardElement.style.setProperty('--pointer-x', '50%');
				cardElement.style.setProperty('--pointer-y', '50%');
				cardElement.style.setProperty('--background-x', '50%');
				cardElement.style.setProperty('--background-y', '50%');
				cardElement.style.setProperty('--pointer-from-center', '0');
				
				console.log('✅ Holographic effects boosted to full intensity:', intensity);
			}
		}

		function handleMouseLeave() {
			console.log('🖱️ Mouse leave - reducing holographic effects');
			isHovered = false;

			if (!isSpinning) {
				try {
					// Reduce but don't completely hide holographic effects
					if (cardElement) {
						cardElement.style.setProperty('--card-opacity', `${intensity * 0.4}`);
					}

					// Reset transformations with spring physics
					cardTransform.set({
						rotateX: 0,
						rotateY: 0,
						scale: 1,
						translateX: 0,
						translateY: 0,
					});

					// Reset pointer position
					pointerPosition.set({ x: 50, y: 50 });
				} catch (error) {
					console.warn('⚠️ Mouse leave error:', error);
					// Fallback to direct CSS reset
					if (cardElement) {
						cardElement.style.setProperty('--card-opacity', `${intensity * 0.4}`);
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

				// Reset other variables
				pointerFromCenter = 0;
				cardElement?.style.setProperty('--pointer-from-center', '0');
				cardElement?.style.setProperty('--pointer-from-top', '0.5');
				cardElement?.style.setProperty('--pointer-from-left', '0.5');
			}
		}

		// Touch support for mobile
		function handleTouchMove(e: TouchEvent) {
			e.preventDefault();
			const touch = e.touches[0];
			handleMouseMove({
				clientX: touch.clientX,
				clientY: touch.clientY,
			} as MouseEvent);
		}

		// Add event listeners with error handling
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
			console.log('🧹 Cleaning up holographic card');

			// Cleanup event listeners
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

			// Cleanup spring subscriptions
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
		`card--${effect}`,
		'relative overflow-hidden transition-transform duration-100 ease-out',
		isReducedMotion ? 'reduced-motion' : '',
		isMobile ? 'mobile-optimized' : '',
		showEntrance ? 'card-entrance' : '',
		interactive ? 'debug-interactive' : 'debug-non-interactive'
	]
		.filter(Boolean)
		.join(' ');
</script>

{#if interactive}
	<button
		bind:this={cardElement}
		class={cardClasses}
		style="width: {width}; height: {height}; border: none; background: none; padding: 0;"
		aria-label="Holographic trading card with {effect} effect. Click to spin."
		on:click={handleClick}
	>
		<!-- Card Content -->
		<div class="relative z-10 w-full h-full">
			<slot />

			<!-- Debug Info (only in development) -->
			{#if browser && typeof window !== 'undefined' && window.location.hostname === 'localhost'}
				<div
					class="absolute top-2 left-2 text-xs bg-black/50 text-white p-1 rounded opacity-50 pointer-events-none z-50"
				>
					{effect} | {isHovered ? 'hover' : 'idle'} | {isSpinning ? 'spin' : 'static'}
				</div>
			{/if}
		</div>

		<!-- Enhanced Pokemon Cards CSS Holographic Effects -->
		{#if !isReducedMotion}
			<div class="card__texture" aria-hidden="true"></div>
			<div class="card__foil" aria-hidden="true"></div>
			<div class="card__shine" aria-hidden="true"></div>
			<div class="card__glare" aria-hidden="true"></div>
			<!-- Additional sparkle layer for premium effects -->
			{#if (effect === 'rainbow' || effect === 'cosmic' || effect === 'secret' || effect === 'galaxy' || effect === 'neon') && !isMobile}
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
		aria-label="Holographic trading card with {effect} effect"
	>
		<!-- Card Content -->
		<div class="relative z-10 w-full h-full">
			<slot />
		</div>

		<!-- Enhanced Pokemon Cards CSS Holographic Effects -->
		{#if !isReducedMotion}
			<div class="card__texture" aria-hidden="true"></div>
			<div class="card__foil" aria-hidden="true"></div>
			<div class="card__shine" aria-hidden="true"></div>
			<div class="card__glare" aria-hidden="true"></div>
			<!-- Additional sparkle layer for premium effects -->
			{#if (effect === 'rainbow' || effect === 'cosmic' || effect === 'secret' || effect === 'galaxy' || effect === 'neon') && !isMobile}
				<div class="card__sparkles" aria-hidden="true"></div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	/* ===== HOLOGRAPHIC CARD BASE STYLES ===== */
	.holographic-card {
		/* Enhanced 3D 변형 공간 설정 for realistic card physics */
		transform-style: preserve-3d;
		perspective: 1200px; /* Increased perspective for more dramatic 3D effect */
		
		transform: 
			perspective(1200px)
			rotateX(var(--rotate-x))
			rotateY(calc(var(--rotate-y) + var(--spin-rotation, 0deg))) /* Y-axis spin support */
			scale(var(--card-scale))
			translate3d(var(--translate-x), var(--translate-y), var(--translate-z, 0px));
		
		/* Realistic card shadow that follows the tilt */
		filter: drop-shadow(
			calc(var(--rotate-y) * 0.1px) 
			calc(var(--rotate-x) * 0.1px + 8px) 
			calc(12px + var(--pointer-from-center, 0) * 8px) 
			rgba(0, 0, 0, calc(0.2 + var(--pointer-from-center, 0) * 0.15))
		);
		
		/* Enhanced performance and smoothness */
		will-change: transform, opacity, background-image, background-position;
		transition: transform 0.08s cubic-bezier(0.23, 1, 0.32, 1); /* Smoother easing */
	}

	/* Realistic hover effects */
	.holographic-card:hover {
		--translate-z: 20px; /* Lift the card up */
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

	/* 홀로그래픽 효과 기본 스타일 */
	.card__foil {
		background-position: var(--background-x, 50%) var(--background-y, 50%);
		background-size: 400% 400%;
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
	}

	.card__foil {
		z-index: 1;
	}

	.card__shine {
		z-index: 2;
	}

	.card__glare {
		z-index: 3;
	}

	.card__sparkles {
		z-index: 4;
		mix-blend-mode: screen;
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

	/* ===== HOLOGRAPHIC EFFECTS DIRECTLY IN COMPONENT ===== */
	
	/* Basic Holo - Simple rainbow gradient */
	:global(.card--basic .card__foil) {
		background: linear-gradient(
			calc(var(--pointer-x, 50%) * 2deg + 115deg),
			transparent 0%,
			rgba(255, 0, 153, 0.6) 25%,
			rgba(255, 204, 0, 0.7) 35%,
			rgba(255, 0, 153, 0.6) 45%,
			rgba(0, 255, 255, 0.7) 55%,
			rgba(255, 0, 153, 0.6) 65%,
			rgba(255, 204, 0, 0.7) 75%,
			transparent 100%
		);
		background-size: 300% 300%;
		animation: basic-shift 3s ease-in-out infinite;
	}

	@keyframes basic-shift {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}

	/* Cosmic Holo - Galaxy effect */
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
		background-size: 200% 200%, 400% 400%, 300% 300%;
		animation: cosmic-pulse 4s ease-in-out infinite;
	}

	@keyframes cosmic-pulse {
		0%, 100% { 
			background-size: 200% 200%, 400% 400%, 300% 300%;
			filter: hue-rotate(0deg) brightness(1);
		}
		50% { 
			background-size: 250% 250%, 500% 500%, 400% 400%;
			filter: hue-rotate(60deg) brightness(1.2);
		}
	}

	/* Rainbow Holo - Full spectrum */
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
		background-size: 400% 400%, 200% 200%;
		animation: rainbow-wave 2s ease-in-out infinite;
	}

	@keyframes rainbow-wave {
		0%, 100% { 
			background-position: 0% 50%, center;
			filter: hue-rotate(0deg) saturate(1);
		}
		33% { 
			background-position: 50% 100%, center;
			filter: hue-rotate(120deg) saturate(1.3);
		}
		66% { 
			background-position: 100% 50%, center;
			filter: hue-rotate(240deg) saturate(1.1);
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
		background-size: 350% 350%, 200% 200%;
		animation: neon-pulse 2.5s ease-in-out infinite;
	}

	@keyframes neon-pulse {
		0%, 100% { 
			filter: brightness(1) saturate(1.2);
		}
		50% { 
			filter: brightness(1.4) saturate(1.6);
		}
	}

	/* Galaxy Holo - Deep space effect */
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
				circle at calc(100% - var(--pointer-x, 50%) * 0.5%) calc(100% - var(--pointer-y, 50%) * 0.5%),
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
		background-size: 300% 300%, 250% 250%, 400% 400%;
		animation: galaxy-swirl 8s linear infinite;
	}

	@keyframes galaxy-swirl {
		0% { 
			background-position: 0% 0%, 100% 100%, 0% 50%;
			filter: hue-rotate(0deg);
		}
		25% { 
			background-position: 25% 25%, 75% 75%, 25% 75%;
			filter: hue-rotate(90deg);
		}
		50% { 
			background-position: 50% 50%, 50% 50%, 50% 100%;
			filter: hue-rotate(180deg);
		}
		75% { 
			background-position: 75% 75%, 25% 25%, 75% 25%;
			filter: hue-rotate(270deg);
		}
		100% { 
			background-position: 100% 100%, 0% 0%, 100% 50%;
			filter: hue-rotate(360deg);
		}
	}
</style>