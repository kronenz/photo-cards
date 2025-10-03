/**
 * Enhanced Card State Manager
 * Manages card state, animations, and interactions for the enhanced card component
 */

export interface CardState {
	isFlipped: boolean;
	isHovering: boolean;
	isAnimating: boolean;
	holographicIntensity: number;
	mousePosition: { x: number; y: number };
}

export interface HolographicEffect {
	gradientPosition: string;
	sparklePosition: string;
	opacity: string;
	transform: string;
	intensity: number;
	gradientOpacity?: number;
	sparkleOpacity?: number;
	distanceFromCenter?: number;
}

export interface CardConfig {
	animationSpeed: number;
	enableFlip: boolean;
	holographicStyle: string;
	preventDoubleClick: boolean;
}

export class CardStateManager {
	private state: CardState;
	private config: CardConfig;
	private animationTimeouts: Set<number> = new Set();
	private restorationTimeouts: Set<number> = new Set();

	constructor(config: CardConfig) {
		this.config = config;
		this.state = {
			isFlipped: false,
			isHovering: false,
			isAnimating: false,
			holographicIntensity: 0,
			mousePosition: { x: 0, y: 0 }
		};
	}

	/**
	 * Get current card state
	 */
	getState(): CardState {
		return { ...this.state };
	}

	/**
	 * Update card state
	 */
	updateState(updates: Partial<CardState>): void {
		this.state = { ...this.state, ...updates };
	}

	/**
	 * Calculate enhanced holographic effect based on mouse position
	 * Optimized for overlay/soft-light blend modes to preserve image visibility
	 */
	calculateHolographicEffect(
		mousePos: { x: number; y: number },
		cardBounds: { width: number; height: number }
	): HolographicEffect {
		const l = mousePos.x;
		const t = mousePos.y;
		const h = cardBounds.height;
		const w = cardBounds.width;

		// Normalize mouse position to percentage
		const normalizedX = Math.max(0, Math.min(100, (l / w) * 100));
		const normalizedY = Math.max(0, Math.min(100, (t / h) * 100));

		// Calculate distance from center for intensity
		const centerX = 50;
		const centerY = 50;
		const distanceFromCenter = Math.sqrt(
			Math.pow(normalizedX - centerX, 2) + Math.pow(normalizedY - centerY, 2)
		);
		const maxDistance = Math.sqrt(Math.pow(50, 2) + Math.pow(50, 2));
		const distanceRatio = distanceFromCenter / maxDistance;

		// Enhanced calculation for better visual effect with new blend modes
		const px = Math.abs(Math.floor(normalizedX) - 100);
		const py = Math.abs(Math.floor(normalizedY) - 100);
		
		// Improved positioning algorithm for smoother gradients
		const lp = 50 + (normalizedX - 50) * 0.8; // Reduced multiplier for subtler effect
		const tp = 50 + (normalizedY - 50) * 0.8;
		
		// Sparkle positioning with enhanced responsiveness
		const px_spark = 50 + (normalizedX - 50) * 0.6;
		const py_spark = 50 + (normalizedY - 50) * 0.6;

		// Dynamic intensity based on distance from center and holographic style
		const styleConfig = HOLOGRAPHIC_STYLES[this.config.holographicStyle as keyof typeof HOLOGRAPHIC_STYLES] || HOLOGRAPHIC_STYLES.basic;
		const baseIntensity = styleConfig.intensity;
		
		// Calculate intensity with smooth falloff from center
		const intensityMultiplier = 0.3 + (1 - distanceRatio) * 0.7; // Range: 0.3 to 1.0
		const dynamicIntensity = baseIntensity * intensityMultiplier;

		// Optimized opacity for overlay/soft-light blend modes
		const gradientOpacity = Math.min(0.4 + dynamicIntensity * 0.3, 0.7); // Range: 0.4 to 0.7
		const sparkleOpacity = Math.min(0.5 + dynamicIntensity * 0.3, 0.8); // Range: 0.5 to 0.8

		// Enhanced 3D rotation with smoother transitions
		const rotationIntensity = dynamicIntensity * 0.8;
		const ty = ((tp - 50) / 3) * -1 * rotationIntensity; // Reduced rotation for subtlety
		const tx = ((lp - 50) / 2.5) * 0.6 * rotationIntensity;

		// Smooth scaling effect based on hover intensity
		const scaleEffect = 1 + (dynamicIntensity - 1) * 0.02; // Very subtle scale: 0.98 to 1.02

		return {
			gradientPosition: `background-position: ${lp}% ${tp}%;`,
			sparklePosition: `background-position: ${px_spark}% ${py_spark}%;`,
			opacity: `opacity: ${sparkleOpacity};`,
			transform: `transform: rotateX(${ty}deg) rotateY(${tx}deg) scale(${scaleEffect})`,
			intensity: dynamicIntensity,
			gradientOpacity: gradientOpacity,
			sparkleOpacity: sparkleOpacity,
			distanceFromCenter: distanceRatio
		};
	}

	/**
	 * Start flip animation with holographic effect management
	 */
	async startFlipAnimation(): Promise<boolean> {
		// Prevent double clicks during animation
		if (this.state.isAnimating || !this.config.enableFlip) {
			return false;
		}

		// Store current hover state to restore after animation
		const wasHovering = this.state.isHovering;
		const currentMousePos = { ...this.state.mousePosition };

		this.updateState({ 
			isAnimating: true,
			holographicIntensity: 0 // Disable holographic effects during animation
		});

		try {
			// Wait for animation duration
			await this.delay(this.config.animationSpeed);
			
			// Toggle flip state and restore hover state if needed
			this.updateState({ 
				isFlipped: !this.state.isFlipped,
				isAnimating: false,
				isHovering: wasHovering,
				mousePosition: currentMousePos
			});

			return true;
		} catch (error) {
			console.error('Flip animation failed:', error);
			this.updateState({ 
				isAnimating: false,
				isHovering: wasHovering,
				mousePosition: currentMousePos
			});
			return false;
		}
	}

	/**
	 * Handle mouse enter event
	 */
	handleMouseEnter(): void {
		if (this.state.isAnimating) return;
		this.updateState({ isHovering: true });
	}

	/**
	 * Handle mouse leave event with smooth restoration
	 */
	handleMouseLeave(): void {
		this.updateState({ 
			isHovering: false,
			holographicIntensity: 0,
			mousePosition: { x: 0, y: 0 }
		});
		
		// Trigger smooth restoration animation
		this.startRestorationAnimation();
	}

	/**
	 * Handle touch start event - similar to mouse enter but optimized for touch
	 */
	handleTouchStart(touchPos: { x: number; y: number }): void {
		if (this.state.isAnimating) return;
		
		this.updateState({ 
			isHovering: true,
			mousePosition: touchPos
		});
	}

	/**
	 * Handle touch move event - similar to mouse move but with touch-specific optimizations
	 */
	handleTouchMove(touchPos: { x: number; y: number }): void {
		if (this.state.isAnimating) return;
		
		// Clear any ongoing restoration animation
		this.clearRestorationTimeouts();
		
		this.updateState({ 
			mousePosition: touchPos,
			isHovering: true 
		});
	}

	/**
	 * Handle touch hold event - sustained touch for enhanced holographic effect
	 */
	handleTouchHold(): void {
		if (this.state.isAnimating) return;
		
		// Enhance holographic intensity for touch hold
		this.updateState({ 
			holographicIntensity: Math.min(this.state.holographicIntensity * 1.2, 2.0)
		});
	}

	/**
	 * Handle touch end event - similar to mouse leave but with touch-specific behavior
	 */
	handleTouchEnd(): void {
		this.updateState({ 
			isHovering: false,
			holographicIntensity: 0,
			mousePosition: { x: 0, y: 0 }
		});
		
		// Trigger smooth restoration animation
		this.startRestorationAnimation();
	}

	/**
	 * Start smooth restoration animation when mouse leaves
	 */
	private startRestorationAnimation(): void {
		// Clear any existing restoration timeouts
		this.clearRestorationTimeouts();
		
		// Gradual intensity reduction for smooth transition
		const steps = 10;
		const stepDuration = 30; // 30ms per step = 300ms total
		
		for (let i = 1; i <= steps; i++) {
			const timeout = setTimeout(() => {
				const progress = i / steps;
				const easedProgress = this.easeOutCubic(progress);
				
				// Update intensity with eased transition
				this.updateState({
					holographicIntensity: (1 - easedProgress) * this.state.holographicIntensity
				});
			}, i * stepDuration);
			
			this.restorationTimeouts.add(timeout);
		}
	}

	/**
	 * Easing function for smooth restoration
	 */
	private easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	/**
	 * Handle mouse move event with enhanced responsiveness
	 */
	handleMouseMove(mousePos: { x: number; y: number }): void {
		if (this.state.isAnimating) return;
		
		// Clear any ongoing restoration animation
		this.clearRestorationTimeouts();
		
		this.updateState({ 
			mousePosition: mousePos,
			isHovering: true 
		});
	}

	/**
	 * Get enhanced holographic effect with intensity control
	 */
	getEnhancedHolographicEffect(
		mousePos: { x: number; y: number },
		cardBounds: { width: number; height: number }
	): HolographicEffect {
		const effect = this.calculateHolographicEffect(mousePos, cardBounds);
		
		// Update state with current intensity
		this.updateState({ 
			holographicIntensity: effect.intensity,
			mousePosition: mousePos 
		});
		
		return effect;
	}

	/**
	 * Get holographic effect specifically optimized for card back
	 * Adjusts intensity and positioning for better back-side visibility
	 */
	getBackSideHolographicEffect(
		mousePos: { x: number; y: number },
		cardBounds: { width: number; height: number }
	): HolographicEffect {
		const baseEffect = this.calculateHolographicEffect(mousePos, cardBounds);
		
		// Adjust effect for back side - slightly different positioning and intensity
		const backAdjustedEffect: HolographicEffect = {
			...baseEffect,
			// Slightly more centered positioning for back side
			gradientPosition: baseEffect.gradientPosition.replace(/(\d+)%/g, (match, p1) => {
				const value = parseInt(p1);
				const adjusted = 50 + (value - 50) * 0.8; // 20% less extreme positioning
				return `${Math.round(adjusted)}%`;
			}),
			// Enhanced sparkle positioning for back side
			sparklePosition: baseEffect.sparklePosition.replace(/(\d+)%/g, (match, p1) => {
				const value = parseInt(p1);
				const adjusted = 50 + (value - 50) * 0.9; // 10% less extreme positioning
				return `${Math.round(adjusted)}%`;
			}),
			// Slightly higher opacity for back side to compensate for different background
			gradientOpacity: Math.min((baseEffect.gradientOpacity || 0.6) * 1.1, 0.8),
			sparkleOpacity: Math.min((baseEffect.sparkleOpacity || 0.8) * 1.05, 0.85),
			// Enhanced intensity for back side
			intensity: Math.min(baseEffect.intensity * 1.1, 2.0)
		};
		
		// Update state with current intensity
		this.updateState({ 
			holographicIntensity: backAdjustedEffect.intensity,
			mousePosition: mousePos 
		});
		
		return backAdjustedEffect;
	}

	/**
	 * Handle smooth transition between front and back holographic effects
	 */
	transitionHolographicEffect(
		isFlipped: boolean,
		mousePos: { x: number; y: number },
		cardBounds: { width: number; height: number }
	): HolographicEffect {
		// Don't apply effects during animation
		if (this.state.isAnimating) {
			return {
				gradientPosition: 'background-position: 50% 50%;',
				sparklePosition: 'background-position: 50% 50%;',
				opacity: 'opacity: 0;',
				transform: 'transform: rotateX(0deg) rotateY(0deg) scale(1)',
				intensity: 0,
				gradientOpacity: 0,
				sparkleOpacity: 0,
				distanceFromCenter: 0
			};
		}

		if (isFlipped) {
			return this.getBackSideHolographicEffect(mousePos, cardBounds);
		} else {
			return this.getEnhancedHolographicEffect(mousePos, cardBounds);
		}
	}

	/**
	 * Check if holographic effects should be active
	 */
	shouldApplyHolographicEffects(): boolean {
		return this.state.isHovering && !this.state.isAnimating;
	}

	/**
	 * Get animation-aware holographic effect
	 */
	getAnimationAwareHolographicEffect(
		isFlipped: boolean,
		mousePos: { x: number; y: number },
		cardBounds: { width: number; height: number }
	): HolographicEffect | null {
		if (!this.shouldApplyHolographicEffects()) {
			return null;
		}

		return this.transitionHolographicEffect(isFlipped, mousePos, cardBounds);
	}

	/**
	 * Check if card can be clicked
	 */
	canClick(): boolean {
		return this.config.enableFlip && !this.state.isAnimating;
	}

	/**
	 * Reset card to initial state
	 */
	reset(): void {
		this.clearTimeouts();
		this.clearRestorationTimeouts();
		this.state = {
			isFlipped: false,
			isHovering: false,
			isAnimating: false,
			holographicIntensity: 0,
			mousePosition: { x: 0, y: 0 }
		};
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig: Partial<CardConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		this.clearTimeouts();
		this.clearRestorationTimeouts();
	}

	/**
	 * Private helper methods
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			const timeout = setTimeout(resolve, ms);
			this.animationTimeouts.add(timeout);
		});
	}

	private clearTimeouts(): void {
		this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
		this.animationTimeouts.clear();
	}

	private clearRestorationTimeouts(): void {
		this.restorationTimeouts.forEach(timeout => clearTimeout(timeout));
		this.restorationTimeouts.clear();
	}
}

/**
 * Holographic style configurations
 */
export const HOLOGRAPHIC_STYLES = {
	basic: { 
		color1: '#00e7ff', 
		color2: '#ff00e7',
		intensity: 1.0
	},
	cosmic: { 
		color1: '#667eea', 
		color2: '#764ba2',
		intensity: 1.2
	},
	rainbow: { 
		color1: '#ff6b6b', 
		color2: '#4ecdc4',
		intensity: 1.1
	},
	aurora: { 
		color1: '#a8edea', 
		color2: '#fed6e3',
		intensity: 0.9
	},
	secret: { 
		color1: '#ffecd2', 
		color2: '#fcb69f',
		intensity: 1.3
	},
	galaxy: { 
		color1: '#667eea', 
		color2: '#764ba2',
		intensity: 1.4
	}
} as const;

/**
 * Card type configurations
 */
export const CARD_TYPES = {
	pokemon: {
		defaultBack: 'https://assets.codepen.io/13471/pokemon-card-back.webp',
		aspectRatio: '71.5:100'
	},
	kbo: {
		defaultBack: 'https://assets.codepen.io/13471/pokemon-card-back.webp',
		aspectRatio: '71.5:100'
	},
	custom: {
		defaultBack: 'https://assets.codepen.io/13471/holographic-back.webp',
		aspectRatio: '71.5:100'
	}
} as const;

/**
 * Animation presets
 */
export const ANIMATION_PRESETS = {
	fast: { duration: 400, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
	normal: { duration: 600, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
	slow: { duration: 800, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
	bounce: { duration: 700, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
} as const;

/**
 * Utility functions
 */
export function getCardBackImage(cardType: keyof typeof CARD_TYPES, team?: string): string {
	if (cardType === 'kbo' && team) {
		// 임시로 포켓몬 카드 뒷면을 사용 (실제 KBO 이미지가 없으므로)
		const teamBacks: Record<string, string> = {
			'LG': 'https://assets.codepen.io/13471/pokemon-card-back.webp',
			'DOOSAN': 'https://assets.codepen.io/13471/pokemon-card-back.webp',
			'KT': 'https://assets.codepen.io/13471/pokemon-card-back.webp',
			'SAMSUNG': 'https://assets.codepen.io/13471/pokemon-card-back.webp'
		};
		return teamBacks[team.toUpperCase()] || CARD_TYPES.kbo.defaultBack;
	}
	
	return CARD_TYPES[cardType].defaultBack;
}

export function getHolographicColors(style: keyof typeof HOLOGRAPHIC_STYLES) {
	return HOLOGRAPHIC_STYLES[style] || HOLOGRAPHIC_STYLES.basic;
}

export function createCardStateManager(config: Partial<CardConfig> = {}): CardStateManager {
	const defaultConfig: CardConfig = {
		animationSpeed: 600,
		enableFlip: true,
		holographicStyle: 'basic',
		preventDoubleClick: true
	};

	return new CardStateManager({ ...defaultConfig, ...config });
}