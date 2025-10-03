<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import { 
		CardStateManager, 
		createCardStateManager, 
		getCardBackImage, 
		getHolographicColors,
		type CardState 
	} from '$lib/utils/cardStateManager';
	import { 
		TouchIntegrationHandler, 
		createTouchIntegrationHandler,
		isTouchSupported,
		type TouchPosition,
		type TouchGesture
	} from '$lib/utils/touchIntegration';
	import { 
		detectDeviceCapabilities,
		getMobileOptimizationSettings,
		optimizeTouchEvents,
		PerformanceMonitor,
		throttle,
		type DeviceCapabilities,
		type PerformanceMetrics
	} from '$lib/utils/mobileOptimization';

	// Props
	export let frontImage: string;
	export let backImage: string = '';
	export let cardType: 'pokemon' | 'kbo' | 'custom' = 'custom';
	export let teamOrType: string = '';
	export let holographicStyle: 'basic' | 'cosmic' | 'rainbow' | 'aurora' | 'secret' | 'galaxy' = 'basic';
	export let enableFlip: boolean = true;
	export let animationSpeed: number = 600;

	// State manager
	let stateManager: CardStateManager;
	let cardState: CardState;

	// Touch integration handler
	let touchHandler: TouchIntegrationHandler;
	
	// Mobile optimization
	let deviceCapabilities: DeviceCapabilities;
	let optimizationSettings: ReturnType<typeof getMobileOptimizationSettings>;
	let performanceMonitor: PerformanceMonitor;

	// DOM references
	let cardContainer: HTMLElement;
	let cardInner: HTMLElement;
	let styleElement: HTMLStyleElement;

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Enhanced card component logic
	onMount(() => {
		if (!browser) return;

		// Detect device capabilities for optimization
		deviceCapabilities = detectDeviceCapabilities();
		optimizationSettings = getMobileOptimizationSettings(deviceCapabilities);

		// Initialize performance monitor
		performanceMonitor = new PerformanceMonitor();
		performanceMonitor.onMetrics((metrics: PerformanceMetrics) => {
			// Log performance issues in development
			if (metrics.fps < 50) {
				console.warn('Performance warning: FPS below 50:', metrics);
			}
		});

		// Initialize state manager with mobile optimizations
		stateManager = createCardStateManager({
			animationSpeed: optimizationSettings.animationDuration || animationSpeed,
			enableFlip,
			holographicStyle,
			preventDoubleClick: true
		});

		// Initialize card state
		cardState = stateManager.getState();

		// Initialize touch integration handler with mobile optimizations
		touchHandler = createTouchIntegrationHandler({
			tapTimeThreshold: optimizationSettings.tapTimeout,
			moveThreshold: optimizationSettings.touchThreshold,
			holdThreshold: optimizationSettings.holdTimeout,
			preventMouseDelay: 100
		});

		// Set up touch event callbacks
		touchHandler.setCallbacks({
			onTouchStart: handleTouchStartCallback,
			onTouchMove: handleTouchMoveCallback,
			onTouchEnd: handleTouchEndCallback,
			onTouchHold: handleTouchHoldCallback,
			onTap: handleTapCallback
		});

		// Create dynamic style element for holographic effects
		styleElement = document.createElement('style');
		styleElement.className = 'enhanced-card-hover';
		document.head.appendChild(styleElement);

		// Apply mobile optimizations to card container
		if (cardContainer) {
			optimizeTouchEvents(cardContainer, deviceCapabilities);
		}

		// Setup event listeners
		setupEventListeners();

		return () => {
			// Cleanup
			if (mouseMoveTimeout) {
				clearTimeout(mouseMoveTimeout);
			}

			if (styleElement && styleElement.parentNode) {
				styleElement.parentNode.removeChild(styleElement);
			}
			removeEventListeners();
			stateManager?.destroy();
			touchHandler?.destroy();
			performanceMonitor?.destroy();
		};
	});

	function setupEventListeners() {
		if (!cardContainer) return;

		// Mouse events
		cardContainer.addEventListener('mousemove', handleMouseMove);
		cardContainer.addEventListener('mouseenter', handleMouseEnter);
		cardContainer.addEventListener('mouseleave', handleMouseLeave);
		cardContainer.addEventListener('click', handleCardClick);

		// Touch events - using integrated touch handler
		cardContainer.addEventListener('touchstart', handleTouchStartIntegrated, { passive: false });
		cardContainer.addEventListener('touchmove', handleTouchMoveIntegrated, { passive: false });
		cardContainer.addEventListener('touchend', handleTouchEndIntegrated);
		cardContainer.addEventListener('touchcancel', handleTouchCancelIntegrated);
	}

	function removeEventListeners() {
		if (!cardContainer) return;

		cardContainer.removeEventListener('mousemove', handleMouseMove);
		cardContainer.removeEventListener('mouseenter', handleMouseEnter);
		cardContainer.removeEventListener('mouseleave', handleMouseLeave);
		cardContainer.removeEventListener('click', handleCardClick);
		cardContainer.removeEventListener('touchstart', handleTouchStartIntegrated);
		cardContainer.removeEventListener('touchmove', handleTouchMoveIntegrated);
		cardContainer.removeEventListener('touchend', handleTouchEndIntegrated);
		cardContainer.removeEventListener('touchcancel', handleTouchCancelIntegrated);
	}

	// Enhanced mouse event handlers with mobile optimization
	let mouseMoveTimeout: number;
	let throttledMouseMove: ((e: MouseEvent) => void) | null = null;
	
	function handleMouseMove(e: MouseEvent) {
		// Prevent mouse events if touch is being processed
		if (!styleElement || !stateManager || touchHandler?.shouldPreventMouseEvent()) return;

		const mousePos = { x: e.offsetX, y: e.offsetY };
		
		// Immediate state update for responsiveness
		stateManager.handleMouseMove(mousePos);
		cardState = stateManager.getState();

		if (!cardState.isAnimating) {
			// Use throttled updates on low-end devices, immediate on high-end
			if (optimizationSettings?.throttleEvents) {
				if (!throttledMouseMove) {
					throttledMouseMove = throttle((e: MouseEvent) => {
						const card = e.currentTarget as HTMLElement;
						const pos = { x: e.offsetX, y: e.offsetY };
						updateEnhancedHolographicEffect(pos, card);
					}, optimizationSettings.eventThrottleMs);
				}
				throttledMouseMove(e);
			} else {
				// Clear previous timeout for debouncing
				if (mouseMoveTimeout) {
					clearTimeout(mouseMoveTimeout);
				}
				
				// Debounced effect update for performance
				mouseMoveTimeout = setTimeout(() => {
					const card = e.currentTarget as HTMLElement;
					updateEnhancedHolographicEffect(mousePos, card);
				}, 8); // ~120fps for smooth animation
			}
		}
	}

	function handleMouseEnter() {
		// Prevent mouse events if touch is being processed
		if (!stateManager || touchHandler?.shouldPreventMouseEvent()) return;
		
		stateManager.handleMouseEnter();
		cardState = stateManager.getState();
		dispatch('hover', { isHovering: cardState.isHovering });
	}

	function handleMouseLeave() {
		// Prevent mouse events if touch is being processed
		if (!stateManager || touchHandler?.shouldPreventMouseEvent()) return;
		
		// Clear any pending mouse move timeouts
		if (mouseMoveTimeout) {
			clearTimeout(mouseMoveTimeout);
		}
		
		stateManager.handleMouseLeave();
		cardState = stateManager.getState();
		resetHolographicEffectSmooth();
		dispatch('hover', { isHovering: cardState.isHovering });
	}

	// Integrated touch event handlers using TouchIntegrationHandler
	function handleTouchStartIntegrated(e: TouchEvent) {
		if (!touchHandler || !cardContainer) return;
		touchHandler.handleTouchStart(e, cardContainer);
	}

	function handleTouchMoveIntegrated(e: TouchEvent) {
		if (!touchHandler || !cardContainer) return;
		touchHandler.handleTouchMove(e, cardContainer);
	}

	function handleTouchEndIntegrated(e: TouchEvent) {
		if (!touchHandler || !cardContainer) return;
		touchHandler.handleTouchEnd(e, cardContainer);
	}

	function handleTouchCancelIntegrated(e: TouchEvent) {
		if (!touchHandler) return;
		touchHandler.handleTouchCancel();
	}

	// Touch event callbacks
	function handleTouchStartCallback(position: TouchPosition) {
		if (!stateManager) return;

		// Record touch start for performance monitoring
		performanceMonitor?.recordTouchStart();

		// Start holographic effect immediately on touch
		stateManager.handleTouchStart(position);
		cardState = stateManager.getState();

		// Apply holographic effect for touch (only if enabled for this device)
		if (!cardState.isAnimating && cardContainer && optimizationSettings?.enableHolographicEffects) {
			updateEnhancedHolographicEffect(position, cardContainer);
		}

		dispatch('touchStart', { position });
	}

	function handleTouchMoveCallback(position: TouchPosition, distance: number) {
		if (!stateManager || !styleElement) return;

		// Update holographic effect based on touch movement
		stateManager.handleTouchMove(position);
		cardState = stateManager.getState();

		// Apply holographic effect only if enabled and not animating
		if (!cardState.isAnimating && cardContainer && optimizationSettings?.enableHolographicEffects) {
			updateEnhancedHolographicEffect(position, cardContainer);
		}

		dispatch('touchMove', { position, distance });
	}

	function handleTouchEndCallback(gesture: TouchGesture) {
		if (!stateManager) return;

		if (gesture.type === 'tap' && enableFlip && stateManager.canClick()) {
			// Handle tap gesture - flip card
			flipCard();
			dispatch('tap', { position: gesture.position, duration: gesture.duration });
		} else {
			// Handle touch end - remove holographic effect
			stateManager.handleTouchEnd();
			cardState = stateManager.getState();
			resetHolographicEffectSmooth();
		}

		dispatch('touchEnd', { 
			position: gesture.position, 
			duration: gesture.duration, 
			distance: gesture.distance,
			isTap: gesture.type === 'tap'
		});
	}

	function handleTouchHoldCallback(position: TouchPosition) {
		if (!stateManager) return;

		stateManager.handleTouchHold();
		cardState = stateManager.getState();
		dispatch('touchHold', { position });
	}

	function handleTapCallback(position: TouchPosition, duration: number) {
		// This is handled in handleTouchEndCallback for tap gestures
		// but we can dispatch a separate tap event if needed
		dispatch('tap', { position, duration });
	}

	// Card click handler with flip functionality and touch duplication prevention
	function handleCardClick(e: Event) {
		e.preventDefault();
		
		// Prevent mouse click if touch is being processed
		if (!stateManager || !stateManager.canClick() || touchHandler?.shouldPreventMouseEvent()) return;

		flipCard();
	}

	// Card flip animation logic with holographic effect transition
	async function flipCard() {
		if (!stateManager) return;

		const currentState = stateManager.getState();
		dispatch('animationStart', { isFlipped: currentState.isFlipped });

		// Clear any active holographic effects during animation
		const frontCard = cardContainer.querySelector('.enhanced-card-front');
		const backCard = cardContainer.querySelector('.enhanced-card-back');
		
		// Temporarily disable holographic effects during flip
		frontCard?.classList.remove('active', 'high-intensity', 'medium-intensity', 'low-intensity');
		backCard?.classList.remove('active', 'high-intensity', 'medium-intensity', 'low-intensity');
		
		// Clear dynamic styles during animation
		if (styleElement) {
			styleElement.innerHTML = '';
		}

		try {
			const success = await stateManager.startFlipAnimation();
			
			if (success && cardInner) {
				cardInner.classList.toggle('flipped');
				cardState = stateManager.getState();
				
				// Re-apply holographic effects if mouse is still hovering after flip
				if (cardState.isHovering && stateManager) {
					// Small delay to ensure flip animation has started
					setTimeout(() => {
						const mousePos = stateManager.getState().mousePosition;
						if (mousePos.x !== 0 || mousePos.y !== 0) {
							updateEnhancedHolographicEffect(mousePos, cardContainer);
						}
					}, 100);
				}
				
				dispatch('flip', { isFlipped: cardState.isFlipped });
			}
		} catch (error) {
			console.error('Card flip animation failed:', error);
		} finally {
			cardState = stateManager.getState();
			dispatch('animationEnd', { isFlipped: cardState.isFlipped });
		}
	}

	// Enhanced holographic effect calculation with improved blend modes
	function updateEnhancedHolographicEffect(mousePos: { x: number; y: number }, card: HTMLElement) {
		if (!stateManager || !card) return;

		// Skip holographic effects on low-end devices if disabled
		if (optimizationSettings && !optimizationSettings.enableHolographicEffects) {
			return;
		}

		// DOM 요소가 완전히 로드되었는지 확인
		if (!card.offsetWidth || !card.offsetHeight) {
			console.warn('Card dimensions not available yet, skipping holographic effect');
			return;
		}

		const cardBounds = {
			width: card.offsetWidth,
			height: card.offsetHeight
		};

		const effect = stateManager.getAnimationAwareHolographicEffect(
			cardState?.isFlipped || false, 
			mousePos, 
			cardBounds
		);

		// If no effect should be applied (e.g., during animation), clear effects
		if (!effect) {
			resetHolographicEffectSmooth();
			return;
		}

		// Enhanced CSS with optimized blend modes for image visibility
		// Apply mobile optimization intensity scaling
		const intensityMultiplier = optimizationSettings?.holographicIntensity || 1.0;
		const gradientOpacity = (effect.gradientOpacity || 0.6) * intensityMultiplier;
		const sparkleOpacity = (effect.sparkleOpacity || 0.8) * intensityMultiplier;
		const distanceFromCenter = effect.distanceFromCenter || 0;
		
		// Dynamic intensity based on distance from center
		const intensityClass = distanceFromCenter < 0.3 ? 'high-intensity' : 
		                      distanceFromCenter < 0.6 ? 'medium-intensity' : 'low-intensity';

		// Determine if we're showing front or back side
		const isShowingBack = cardState?.isFlipped;
		const cardSelector = isShowingBack ? '.enhanced-card-back.active' : '.enhanced-card-front.active';

		const style = `
			${cardSelector}:before { 
				${effect.gradientPosition} 
				opacity: ${gradientOpacity};
				filter: brightness(${0.8 + effect.intensity * 0.1}) contrast(${1.1 + effect.intensity * 0.1});
			}
			${cardSelector}:after { 
				${effect.sparklePosition} 
				opacity: ${sparkleOpacity};
				filter: brightness(${1.1 + effect.intensity * 0.1}) contrast(${1.05 + effect.intensity * 0.05});
			}
			${cardSelector}.${intensityClass} {
				box-shadow:
					${-15 - effect.intensity * 5}px ${-15 - effect.intensity * 5}px ${20 + effect.intensity * 10}px ${-20 - effect.intensity * 5}px var(--color1),
					${15 + effect.intensity * 5}px ${15 + effect.intensity * 5}px ${20 + effect.intensity * 10}px ${-20 - effect.intensity * 5}px var(--color2),
					0 0 ${8 + effect.intensity * 5}px ${2 + effect.intensity * 2}px rgba(255, 255, 255, ${0.2 + effect.intensity * 0.1}),
					0 55px 35px -20px rgba(0, 0, 0, 0.5);
			}
		`;

		// Apply styles with intensity class to the appropriate card side
		const frontCard = cardContainer.querySelector('.enhanced-card-front');
		const backCard = cardContainer.querySelector('.enhanced-card-back');
		
		if (isShowingBack && backCard) {
			// Apply effects to back card
			backCard.classList.add('active', intensityClass);
			frontCard?.classList.remove('active', 'high-intensity', 'medium-intensity', 'low-intensity');
		} else if (frontCard) {
			// Apply effects to front card
			frontCard.classList.add('active', intensityClass);
			backCard?.classList.remove('active', 'high-intensity', 'medium-intensity', 'low-intensity');
		}

		// Apply transform to the entire card container for 3D effect
		cardContainer.style.cssText = effect.transform;
		styleElement.innerHTML = style;

		// Update state
		cardState = stateManager.getState();
	}

	// Enhanced smooth restoration animation
	function resetHolographicEffectSmooth() {
		if (!styleElement || !cardContainer) return;

		// Get references to both card sides
		const frontCard = cardContainer.querySelector('.enhanced-card-front');
		const backCard = cardContainer.querySelector('.enhanced-card-back');
		
		// Remove intensity classes from both sides
		frontCard?.classList.remove('active', 'high-intensity', 'medium-intensity', 'low-intensity');
		backCard?.classList.remove('active', 'high-intensity', 'medium-intensity', 'low-intensity');
		
		// Gradual fade out with CSS transitions
		cardContainer.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
		
		// Step 1: Reduce intensity for both front and back
		setTimeout(() => {
			if (styleElement && cardContainer) {
				const fadeStyle = `
					.enhanced-card-front.active:before,
					.enhanced-card-back.active:before { 
						opacity: 0.2;
						filter: brightness(0.9) contrast(1.05);
						transition: all 0.2s ease-out;
					}
					.enhanced-card-front.active:after,
					.enhanced-card-back.active:after { 
						opacity: 0.3;
						filter: brightness(1.05) contrast(1.02);
						transition: all 0.2s ease-out;
					}
				`;
				styleElement.innerHTML = fadeStyle;
			}
		}, 50);

		// Step 2: Complete reset
		setTimeout(() => {
			if (styleElement && cardContainer) {
				styleElement.innerHTML = '';
				cardContainer.removeAttribute('style');
				
				// Add smooth return animation to the appropriate side
				if (cardState && !cardState.isAnimating) {
					const activeCard = cardState.isFlipped ? backCard : frontCard;
					activeCard?.classList.add('animated');
					
					// Remove animated class after animation completes
					setTimeout(() => {
						activeCard?.classList.remove('animated');
					}, 12000); // Match animation duration
				}
			}
		}, 300);
	}



	// Reactive statements
	$: colors = getHolographicColors(holographicStyle);
	$: backImageSrc = backImage || getCardBackImage(cardType, teamOrType);
	$: canClick = stateManager?.canClick() ?? false;

	// Update state manager when props change
	$: if (stateManager) {
		stateManager.updateConfig({
			animationSpeed,
			enableFlip,
			holographicStyle,
			preventDoubleClick: true
		});
	}
</script>

<div 
	class="enhanced-card-container"
	class:flipping={cardState?.isAnimating}
	class:flipped={cardState?.isFlipped}
	bind:this={cardContainer}
	style="--color1: {colors.color1}; --color2: {colors.color2};"
>
	<div 
		class="enhanced-card-inner"
		class:flipped={cardState?.isFlipped}
		bind:this={cardInner}
		style="transition-duration: {animationSpeed}ms;"
	>
		<!-- Card Front -->
		<div 
			class="enhanced-card enhanced-card-front {holographicStyle}"
			class:active={cardState?.isHovering}
			class:animated={cardState && !cardState.isHovering && !cardState.isAnimating}
			class:clickable={canClick}
			class:hovering={cardState?.isHovering && !cardState?.isAnimating}
			class:animating={cardState?.isAnimating}
			style="--front: url('{frontImage}');"
		>
			<div class="card-content">
				<slot name="front-content" />
			</div>
		</div>

		<!-- Card Back -->
		<div 
			class="enhanced-card enhanced-card-back {holographicStyle}"
			class:active={cardState?.isHovering && cardState?.isFlipped}
			class:animated={cardState && !cardState.isHovering && !cardState.isAnimating}
			class:hovering={cardState?.isHovering && cardState?.isFlipped && !cardState?.isAnimating}
			class:animating={cardState?.isAnimating}
			style="--back: url('{backImageSrc}');"
		>
			<div class="card-content">
				<slot name="back-content">
					{#if cardType === 'kbo'}
						<div class="team-logo">{teamOrType}</div>
					{/if}
				</slot>
			</div>
		</div>
	</div>

	<!-- Enhanced loading indicator during animation -->
	{#if cardState?.isAnimating}
		<div class="animation-indicator">
			<div class="spinner"></div>
			<div class="loading-text">Flipping...</div>
		</div>
	{/if}

	<!-- Flipped state indicator -->
	{#if cardState?.isFlipped && !cardState?.isAnimating}
		<div class="flip-state-indicator" title="Card is flipped - click to return">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" opacity="0.9"/>
			</svg>
		</div>
	{/if}

	<!-- Hover state indicator -->
	{#if cardState?.isHovering && !cardState?.isAnimating && canClick}
		<div class="hover-state-indicator">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M13 3C13.55 3 14 3.45 14 4V12L15.5 10.5C15.92 10.08 16.58 10.08 17 10.5C17.42 10.92 17.42 11.58 17 12L12.71 16.29C12.32 16.68 11.69 16.68 11.3 16.29L7 12C6.58 11.58 6.58 10.92 7 10.5C7.42 10.08 8.08 10.08 8.5 10.5L10 12V4C10 3.45 10.45 3 11 3H13Z" fill="currentColor"/>
			</svg>
		</div>
	{/if}

	<!-- Touch feedback indicator -->
	{#if cardState?.isHovering && isTouchSupported()}
		<div class="touch-feedback-indicator">
			<div class="touch-ripple"></div>
		</div>
	{/if}
</div>

<style>
	/* Enhanced Card Container */
	.enhanced-card-container {
		perspective: 1000px;
		transform-style: preserve-3d;
		position: relative;
		display: inline-block;
		cursor: default;
		
		/* Touch optimization */
		touch-action: none;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		
		/* Visual feedback transitions */
		transition: filter 0.2s ease, transform 0.2s ease;
	}

	/* Enhanced cursor feedback based on card state */
	.enhanced-card-container {
		cursor: default;
		transition: cursor 0.1s ease;
	}

	.enhanced-card-container:hover {
		cursor: pointer;
	}

	.enhanced-card-container.flipping {
		cursor: wait !important;
		filter: brightness(0.9);
		pointer-events: none;
	}

	.enhanced-card-container.flipped {
		cursor: pointer;
	}

	/* Enhanced visual feedback for clickable state */
	.enhanced-card-container:hover:not(.flipping) {
		transform: translateY(-1px);
		transition: transform 0.2s ease;
	}

	.enhanced-card-container:active:not(.flipping) {
		transform: translateY(0px);
		transition: transform 0.1s ease;
	}

	/* Flipped state visual indicator */
	.enhanced-card-container.flipped::after {
		content: '';
		position: absolute;
		top: -3px;
		left: -3px;
		right: -3px;
		bottom: -3px;
		border: 2px solid var(--color1, rgb(0, 231, 255));
		border-radius: 5% / 3.5%;
		pointer-events: none;
		z-index: 1000;
		animation: flippedGlow 3s ease-in-out infinite alternate;
		opacity: 0.8;
	}

	@keyframes flippedGlow {
		0% {
			border-color: var(--color1, rgb(0, 231, 255));
			box-shadow: 
				0 0 8px rgba(0, 231, 255, 0.3),
				inset 0 0 8px rgba(0, 231, 255, 0.1);
		}
		100% {
			border-color: var(--color2, rgb(255, 0, 231));
			box-shadow: 
				0 0 20px rgba(255, 0, 231, 0.4),
				inset 0 0 12px rgba(255, 0, 231, 0.2);
		}
	}

	.enhanced-card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
		transform-style: preserve-3d;
	}

	.enhanced-card-inner.flipped {
		transform: rotateY(180deg);
	}

	/* Enhanced Card Base Styles */
	.enhanced-card {
		width: 71.5vw;
		height: 100vw;
		position: absolute;
		top: 0;
		left: 0;
		overflow: hidden;
		z-index: 10;
		touch-action: none;
		isolation: isolate;
		backface-visibility: hidden;

		border-radius: 5% / 3.5%;
		box-shadow:
			-5px -5px 5px -5px var(--color1, rgb(0, 231, 255)),
			5px 5px 5px -5px var(--color2, rgb(255, 0, 231)),
			-7px -7px 10px -5px transparent,
			7px 7px 10px -5px transparent,
			0 0 5px 0px rgba(255, 255, 255, 0),
			0 55px 35px -20px rgba(0, 0, 0, 0.5);

		transition:
			transform 0.5s ease,
			box-shadow 0.2s ease;
		will-change: transform, filter;

		background-color: #040712;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: 50% 50%;
		transform-origin: center;
	}

	@media screen and (min-width: 600px) {
		.enhanced-card {
			width: clamp(12.9vw, 61vh, 18vw);
			height: clamp(18vw, 85vh, 25.2vw);
		}
	}

	/* Card Front */
	.enhanced-card-front {
		background-image: var(--front);
	}

	/* Card Back */
	.enhanced-card-back {
		background-image: var(--back);
		transform: rotateY(180deg);
	}

	/* Enhanced clickable state with visual feedback */
	.enhanced-card.clickable {
		cursor: inherit; /* Inherit from container */
		transition: all 0.2s ease;
		position: relative;
	}

	.enhanced-card.clickable::before {
		transition: all 0.2s ease;
	}

	.enhanced-card.clickable:hover {
		box-shadow:
			-20px -20px 30px -25px var(--color1, rgb(0, 231, 255)),
			20px 20px 30px -25px var(--color2, rgb(255, 0, 231)),
			-7px -7px 10px -5px var(--color1, rgb(0, 231, 255)),
			7px 7px 10px -5px var(--color2, rgb(255, 0, 231)),
			0 0 13px 4px rgba(255, 255, 255, 0.3),
			0 55px 35px -20px rgba(0, 0, 0, 0.5);
		transform: translateY(-2px);
	}

	/* Clickable state indicator */
	.enhanced-card.clickable:hover::after {
		content: '';
		position: absolute;
		top: 5px;
		left: 5px;
		width: 12px;
		height: 12px;
		background: radial-gradient(circle, var(--color1, rgb(0, 231, 255)), var(--color2, rgb(255, 0, 231)));
		border-radius: 50%;
		z-index: 1000;
		animation: clickIndicator 1.5s ease-in-out infinite;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
	}

	@keyframes clickIndicator {
		0%, 100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.3);
		}
	}

	/* Enhanced visual feedback for different card states */
	.enhanced-card.hovering {
		transform: translateY(-1px);
		box-shadow:
			-15px -15px 25px -20px var(--color1, rgb(0, 231, 255)),
			15px 15px 25px -20px var(--color2, rgb(255, 0, 231)),
			-5px -5px 8px -3px var(--color1, rgb(0, 231, 255)),
			5px 5px 8px -3px var(--color2, rgb(255, 0, 231)),
			0 0 10px 2px rgba(255, 255, 255, 0.2),
			0 45px 25px -15px rgba(0, 0, 0, 0.4);
		transition: all 0.2s ease;
	}

	.enhanced-card.hovering::before {
		opacity: 0.8;
		filter: brightness(0.9) contrast(1.3);
	}

	.enhanced-card.animating {
		cursor: wait;
		filter: brightness(0.95) saturate(0.9);
		transition: filter 0.1s ease;
		position: relative;
	}

	/* Loading state visual feedback */
	.enhanced-card.animating::before {
		animation-play-state: paused;
		opacity: 0.3;
		filter: brightness(0.8) contrast(1.1);
	}

	.enhanced-card.animating::after {
		animation-play-state: paused;
		opacity: 0.4;
		filter: brightness(1.0) contrast(1.0);
	}

	/* Interactive state feedback */
	.enhanced-card-container:active .enhanced-card {
		transform: scale(0.98);
		transition: transform 0.1s ease;
	}

	/* Focus state for accessibility */
	.enhanced-card-container:focus {
		outline: 3px solid var(--color1, rgb(0, 231, 255));
		outline-offset: 4px;
		border-radius: 5% / 3.5%;
	}

	.enhanced-card-container:focus:not(:focus-visible) {
		outline: none;
	}

	/* Enhanced state transitions */
	.enhanced-card {
		transition: 
			transform 0.2s ease,
			box-shadow 0.2s ease,
			filter 0.2s ease;
	}

	/* Enhanced Holographic Effects - Improved for image visibility */
	.enhanced-card:before,
	.enhanced-card:after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		background-repeat: no-repeat;
		transition: all 0.33s ease;
		pointer-events: none;
	}

	.enhanced-card:before {
		background-position: 50% 50%;
		background-size: 300% 300%;
		background-image: linear-gradient(
			115deg,
			transparent 0%,
			var(--color1, rgb(0, 231, 255)) 25%,
			transparent 47%,
			transparent 53%,
			var(--color2, rgb(255, 0, 231)) 75%,
			transparent 100%
		);
		
		/* Improved blend mode for image visibility */
		mix-blend-mode: overlay;
		opacity: 0.4;
		filter: brightness(0.8) contrast(1.1);
		z-index: 1;
	}

	.enhanced-card:after {
		background-image:
			url('https://assets.codepen.io/13471/sparkles.gif'),
			url('https://assets.codepen.io/13471/holo.png'),
			linear-gradient(
				125deg,
				#ff008450 15%,
				#fca40040 30%,
				#ffff0030 40%,
				#00ff8a20 60%,
				#00cfff40 70%,
				#cc4cfa50 85%
			);
		background-position: 50% 50%;
		background-size: 160%;
		background-blend-mode: overlay;
		z-index: 2;
		filter: brightness(1.1) contrast(1.05);
		transition: all 0.33s ease;
		
		/* Improved blend mode for natural effect */
		mix-blend-mode: soft-light;
		opacity: 0.6;
	}

	/* Active/Hover states with intensity levels for both front and back */
	.enhanced-card-front.active:after,
	.enhanced-card-back.active:after {
		filter: brightness(1.2) contrast(1.1);
		opacity: 0.8;
	}

	.enhanced-card-front.active,
	.enhanced-card-back.active,
	.enhanced-card:hover {
		animation: none;
		transition: box-shadow 0.1s ease-out;
	}

	/* Intensity-based hover effects for both sides */
	.enhanced-card-front.active.high-intensity,
	.enhanced-card-back.active.high-intensity {
		transition: all 0.05s ease-out;
	}

	.enhanced-card-front.active.medium-intensity,
	.enhanced-card-back.active.medium-intensity {
		transition: all 0.08s ease-out;
	}

	.enhanced-card-front.active.low-intensity,
	.enhanced-card-back.active.low-intensity {
		transition: all 0.12s ease-out;
	}

	.enhanced-card-front.active:before,
	.enhanced-card-back.active:before {
		animation: none;
		background-image: linear-gradient(
			110deg,
			transparent 25%,
			var(--color1, rgb(0, 231, 255)) 48%,
			var(--color2, rgb(255, 0, 231)) 52%,
			transparent 75%
		);
		background-position: 50% 50%;
		background-size: 250% 250%;
		
		mix-blend-mode: overlay;
		opacity: 0.7;
		filter: brightness(0.85) contrast(1.2);
		transition: none;
	}

	/* Back-specific holographic adjustments for better visibility */
	.enhanced-card-back.active:before {
		/* Slightly different gradient for back side to complement back image */
		background-image: linear-gradient(
			110deg,
			transparent 20%,
			var(--color1, rgb(0, 231, 255)) 45%,
			var(--color2, rgb(255, 0, 231)) 55%,
			transparent 80%
		);
		opacity: 0.6;
		filter: brightness(0.9) contrast(1.15);
	}

	.enhanced-card-back.active:after {
		/* Enhanced sparkle effect for back side */
		filter: brightness(1.15) contrast(1.08);
		opacity: 0.7;
	}

	/* Animated state for both front and back */
	.enhanced-card-front.animated,
	.enhanced-card-back.animated {
		transition: none;
		animation: holoCard 12s ease 0s 1;
	}

	.enhanced-card-front.animated:before,
	.enhanced-card-back.animated:before {
		transition: none;
		animation: holoGradient 12s ease 0s 1;
	}

	.enhanced-card-front.animated:after,
	.enhanced-card-back.animated:after {
		transition: none;
		animation: holoSparkle 12s ease 0s 1;
	}

	/* Smooth transition effects during flip animation */
	.enhanced-card-inner.flipped .enhanced-card-front {
		animation: fadeOutHolographic 0.3s ease-out forwards;
	}

	.enhanced-card-inner.flipped .enhanced-card-back {
		animation: fadeInHolographic 0.3s ease-in 0.3s forwards;
	}

	.enhanced-card-inner:not(.flipped) .enhanced-card-front {
		animation: fadeInHolographic 0.3s ease-in 0.3s forwards;
	}

	.enhanced-card-inner:not(.flipped) .enhanced-card-back {
		animation: fadeOutHolographic 0.3s ease-out forwards;
	}

	/* Card Content */
	.card-content {
		position: relative;
		z-index: 3;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.team-logo {
		color: white;
		font-size: clamp(12px, 2vw, 18px);
		font-weight: 700;
		text-align: center;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
		opacity: 0.9;
	}

	/* Enhanced Animation Indicator with improved visual feedback */
	.animation-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		pointer-events: none;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 50%;
		padding: 16px;
		backdrop-filter: blur(6px);
		border: 2px solid rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 0 20px rgba(0, 0, 0, 0.5),
			inset 0 0 20px rgba(255, 255, 255, 0.1);
		animation: indicatorPulse 1.2s ease-in-out infinite;
	}

	.spinner {
		width: 28px;
		height: 28px;
		border: 3px solid rgba(255, 255, 255, 0.2);
		border-top: 3px solid var(--color1, rgb(0, 231, 255));
		border-right: 3px solid var(--color2, rgb(255, 0, 231));
		border-radius: 50%;
		animation: spin 1s linear infinite;
		position: relative;
		filter: drop-shadow(0 0 8px rgba(0, 231, 255, 0.5));
	}

	.spinner::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 10px;
		height: 10px;
		background: radial-gradient(circle, var(--color1, rgb(0, 231, 255)), var(--color2, rgb(255, 0, 231)));
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: innerPulse 0.6s ease-in-out infinite alternate;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
	}

	.spinner::before {
		content: '';
		position: absolute;
		top: -6px;
		left: -6px;
		right: -6px;
		bottom: -6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		animation: outerRing 2s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes outerRing {
		0% { 
			transform: rotate(0deg);
			border-color: rgba(0, 231, 255, 0.3);
		}
		50% {
			border-color: rgba(255, 0, 231, 0.3);
		}
		100% { 
			transform: rotate(360deg);
			border-color: rgba(0, 231, 255, 0.3);
		}
	}

	@keyframes indicatorPulse {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.95;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.08);
			opacity: 1;
		}
	}

	@keyframes innerPulse {
		0% {
			opacity: 0.7;
			transform: translate(-50%, -50%) scale(0.9);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.3);
		}
	}

	/* Enhanced Flip State Indicator */
	.flip-state-indicator {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 1001;
		pointer-events: none;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 50%;
		padding: 8px;
		backdrop-filter: blur(4px);
		border: 2px solid rgba(255, 255, 255, 0.3);
		color: var(--color1, rgb(0, 231, 255));
		animation: flipIndicatorGlow 2.5s ease-in-out infinite;
		transition: all 0.3s ease;
		box-shadow: 
			0 0 15px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(255, 255, 255, 0.1);
	}

	.flip-state-indicator svg {
		display: block;
		filter: drop-shadow(0 0 6px currentColor);
		transition: transform 0.3s ease;
	}

	.flip-state-indicator:hover svg {
		transform: scale(1.1) rotate(15deg);
	}

	@keyframes flipIndicatorGlow {
		0%, 100% {
			color: var(--color1, rgb(0, 231, 255));
			transform: scale(1);
			border-color: rgba(0, 231, 255, 0.4);
			box-shadow: 
				0 0 15px rgba(0, 0, 0, 0.5),
				inset 0 0 10px rgba(0, 231, 255, 0.2),
				0 0 20px rgba(0, 231, 255, 0.3);
		}
		50% {
			color: var(--color2, rgb(255, 0, 231));
			transform: scale(1.15);
			border-color: rgba(255, 0, 231, 0.4);
			box-shadow: 
				0 0 15px rgba(0, 0, 0, 0.5),
				inset 0 0 10px rgba(255, 0, 231, 0.2),
				0 0 25px rgba(255, 0, 231, 0.4);
		}
	}

	/* Loading text for animation indicator */
	.loading-text {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 8px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 12px;
		font-weight: 600;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		animation: loadingTextPulse 1s ease-in-out infinite alternate;
		white-space: nowrap;
	}

	@keyframes loadingTextPulse {
		0% {
			opacity: 0.7;
		}
		100% {
			opacity: 1;
		}
	}

	/* Hover state indicator */
	.hover-state-indicator {
		position: absolute;
		bottom: 10px;
		left: 10px;
		z-index: 1001;
		pointer-events: none;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 50%;
		padding: 6px;
		backdrop-filter: blur(3px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.8);
		animation: hoverIndicatorBounce 1.5s ease-in-out infinite;
		transition: all 0.3s ease;
	}

	.hover-state-indicator svg {
		display: block;
		filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
	}

	@keyframes hoverIndicatorBounce {
		0%, 100% {
			transform: translateY(0);
			opacity: 0.8;
		}
		50% {
			transform: translateY(-3px);
			opacity: 1;
		}
	}

	/* Touch feedback indicator */
	.touch-feedback-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 999;
		pointer-events: none;
		width: 60px;
		height: 60px;
	}

	.touch-ripple {
		width: 100%;
		height: 100%;
		border: 2px solid var(--color1, rgb(0, 231, 255));
		border-radius: 50%;
		animation: touchRipple 1.5s ease-out infinite;
		opacity: 0;
	}

	@keyframes touchRipple {
		0% {
			transform: scale(0.3);
			opacity: 1;
			border-color: var(--color1, rgb(0, 231, 255));
		}
		50% {
			border-color: var(--color2, rgb(255, 0, 231));
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
			border-color: var(--color1, rgb(0, 231, 255));
		}
	}

	/* Enhanced responsive design for indicators */
	@media (max-width: 768px) {
		.flip-state-indicator,
		.hover-state-indicator {
			padding: 4px;
		}

		.flip-state-indicator svg,
		.hover-state-indicator svg {
			width: 14px;
			height: 14px;
		}

		.loading-text {
			font-size: 11px;
		}

		.animation-indicator {
			padding: 12px;
		}

		.spinner {
			width: 24px;
			height: 24px;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.animation-indicator,
		.flip-state-indicator,
		.hover-state-indicator {
			background: rgba(0, 0, 0, 0.9);
			border-color: rgba(255, 255, 255, 0.8);
		}

		.loading-text {
			color: #ffffff;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 1);
		}

		.touch-ripple {
			border-width: 3px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.flip-state-indicator,
		.hover-state-indicator,
		.animation-indicator,
		.touch-ripple,
		.loading-text {
			animation: none;
		}

		.enhanced-card-container:hover {
			transform: none;
		}

		.enhanced-card.hovering {
			transform: none;
		}
	}

	/* Keyframe Animations - Enhanced for image visibility */
	@keyframes holoSparkle {
		0%, 100% {
			opacity: 0.6;
			background-position: 50% 50%;
			filter: brightness(1.1) contrast(1.05);
		}
		5%, 8% {
			opacity: 0.8;
			background-position: 40% 40%;
			filter: brightness(1.0) contrast(1.1);
		}
		13%, 16% {
			opacity: 0.5;
			background-position: 50% 50%;
			filter: brightness(1.15) contrast(1.0);
		}
		35%, 38% {
			opacity: 0.8;
			background-position: 60% 60%;
			filter: brightness(1.05) contrast(1.05);
		}
		55% {
			opacity: 0.4;
			background-position: 45% 45%;
			filter: brightness(1.1) contrast(1.1);
		}
	}

	@keyframes holoGradient {
		0%, 100% {
			opacity: 0.4;
			background-position: 50% 50%;
			filter: brightness(0.8) contrast(1.1);
		}
		5%, 9% {
			background-position: 100% 100%;
			opacity: 0.7;
			filter: brightness(0.85) contrast(1.15);
		}
		13%, 17% {
			background-position: 0% 0%;
			opacity: 0.6;
			filter: brightness(0.8) contrast(1.1);
		}
		35%, 39% {
			background-position: 100% 100%;
			opacity: 0.7;
			filter: brightness(0.8) contrast(1.1);
		}
		55% {
			background-position: 0% 0%;
			opacity: 0.7;
			filter: brightness(0.85) contrast(1.15);
		}
	}

	@keyframes holoCard {
		0%, 100% {
			transform: rotateZ(0deg) rotateX(0deg) rotateY(0deg);
		}
		5%, 8% {
			transform: rotateZ(0deg) rotateX(6deg) rotateY(-20deg);
		}
		13%, 16% {
			transform: rotateZ(0deg) rotateX(-9deg) rotateY(32deg);
		}
		35%, 38% {
			transform: rotateZ(3deg) rotateX(12deg) rotateY(20deg);
		}
		55% {
			transform: rotateZ(-3deg) rotateX(-12deg) rotateY(-27deg);
		}
	}

	/* Fade animations for smooth holographic effect transitions */
	@keyframes fadeOutHolographic {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes fadeInHolographic {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.enhanced-card-container {
			perspective: 500px;
		}
		
		.enhanced-card:before,
		.enhanced-card:after {
			animation-duration: 6s !important;
			filter: brightness(0.9) contrast(1.05);
		}
		
		/* Touch-specific optimizations for mobile */
		.enhanced-card {
			transition-duration: 0.2s;
		}
		
		.enhanced-card.active {
			transition-duration: 0.1s;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.enhanced-card-container {
			cursor: default;
		}
		
		.enhanced-card-container:hover {
			cursor: default;
		}
		
		.enhanced-card.clickable {
			cursor: default;
		}
		
		/* Enhanced touch feedback with visual response */
		.enhanced-card:active {
			transform: scale(0.98);
			transition: transform 0.1s ease-out;
			filter: brightness(1.1);
		}
		
		.enhanced-card-container.flipping {
			cursor: default;
		}
		
		/* Touch-specific visual feedback */
		.enhanced-card-container:active {
			transform: scale(0.99);
		}
		
		/* Optimize holographic effects for touch */
		.enhanced-card:before,
		.enhanced-card:after {
			transition-duration: 0.15s;
		}
		
		/* Enhanced flip state indicator for touch */
		.flip-state-indicator {
			top: 12px;
			right: 12px;
			padding: 8px;
		}
		
		/* Touch-specific animation indicator */
		.animation-indicator {
			padding: 16px;
		}
		
		.spinner {
			width: 28px;
			height: 28px;
			border-width: 4px;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.enhanced-card,
		.enhanced-card:before,
		.enhanced-card:after,
		.enhanced-card-inner {
			animation: none !important;
			transition-duration: 0.1s !important;
		}
	}

	@media (prefers-contrast: high) {
		.enhanced-card:before,
		.enhanced-card:after {
			filter: contrast(150%) brightness(120%);
			mix-blend-mode: screen;
			opacity: 0.4;
		}
	}
</style>