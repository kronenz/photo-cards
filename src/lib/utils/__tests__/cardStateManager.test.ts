import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
	CardStateManager, 
	createCardStateManager, 
	getCardBackImage, 
	getHolographicColors 
} from '../cardStateManager';

describe('CardStateManager', () => {
	let stateManager: CardStateManager;

	beforeEach(() => {
		stateManager = createCardStateManager({
			animationSpeed: 600,
			enableFlip: true,
			holographicStyle: 'basic',
			preventDoubleClick: true
		});
	});

	afterEach(() => {
		stateManager.destroy();
	});

	it('should initialize with default state', () => {
		const state = stateManager.getState();
		
		expect(state.isFlipped).toBe(false);
		expect(state.isHovering).toBe(false);
		expect(state.isAnimating).toBe(false);
		expect(state.holographicIntensity).toBe(0);
		expect(state.mousePosition).toEqual({ x: 0, y: 0 });
	});

	it('should handle mouse enter correctly', () => {
		stateManager.handleMouseEnter();
		const state = stateManager.getState();
		
		expect(state.isHovering).toBe(true);
	});

	it('should handle mouse leave correctly', () => {
		stateManager.handleMouseEnter();
		stateManager.handleMouseLeave();
		const state = stateManager.getState();
		
		expect(state.isHovering).toBe(false);
		expect(state.holographicIntensity).toBe(0);
		expect(state.mousePosition).toEqual({ x: 0, y: 0 });
	});

	it('should handle mouse move correctly', () => {
		const mousePos = { x: 100, y: 150 };
		stateManager.handleMouseMove(mousePos);
		const state = stateManager.getState();
		
		expect(state.isHovering).toBe(true);
		expect(state.mousePosition).toEqual(mousePos);
	});

	it('should calculate holographic effect correctly', () => {
		const mousePos = { x: 100, y: 100 };
		const cardBounds = { width: 200, height: 300 };
		
		const effect = stateManager.calculateHolographicEffect(mousePos, cardBounds);
		
		expect(effect).toHaveProperty('gradientPosition');
		expect(effect).toHaveProperty('sparklePosition');
		expect(effect).toHaveProperty('opacity');
		expect(effect).toHaveProperty('transform');
		expect(effect).toHaveProperty('intensity');
		expect(typeof effect.intensity).toBe('number');
	});

	it('should prevent clicks during animation', () => {
		stateManager.updateState({ isAnimating: true });
		
		expect(stateManager.canClick()).toBe(false);
	});

	it('should allow clicks when not animating and flip is enabled', () => {
		expect(stateManager.canClick()).toBe(true);
	});

	it('should prevent clicks when flip is disabled', () => {
		stateManager.updateConfig({ enableFlip: false });
		
		expect(stateManager.canClick()).toBe(false);
	});

	it('should handle flip animation', async () => {
		const flipPromise = stateManager.startFlipAnimation();
		
		// Check that animation state is set initially
		let state = stateManager.getState();
		expect(state.isAnimating).toBe(true);
		
		// Wait for animation to complete
		await flipPromise;
		
		// Check final state
		state = stateManager.getState();
		expect(state.isFlipped).toBe(true);
		expect(state.isAnimating).toBe(false);
	});

	it('should reset state correctly', () => {
		// Set some state
		stateManager.updateState({
			isFlipped: true,
			isHovering: true,
			isAnimating: true,
			holographicIntensity: 0.5,
			mousePosition: { x: 100, y: 100 }
		});
		
		// Reset
		stateManager.reset();
		
		const state = stateManager.getState();
		expect(state.isFlipped).toBe(false);
		expect(state.isHovering).toBe(false);
		expect(state.isAnimating).toBe(false);
		expect(state.holographicIntensity).toBe(0);
		expect(state.mousePosition).toEqual({ x: 0, y: 0 });
	});
});

describe('Utility Functions', () => {
	it('should get correct card back image for pokemon', () => {
		const backImage = getCardBackImage('pokemon');
		expect(backImage).toBe('https://assets.codepen.io/13471/pokemon-card-back.webp');
	});

	it('should get correct card back image for KBO team', () => {
		const backImage = getCardBackImage('kbo', 'LG');
		expect(backImage).toBe('/images/kbo/lg-back.webp');
	});

	it('should get default KBO back image for unknown team', () => {
		const backImage = getCardBackImage('kbo', 'UNKNOWN');
		expect(backImage).toBe('/images/kbo/default-back.webp');
	});

	it('should get correct holographic colors', () => {
		const colors = getHolographicColors('cosmic');
		expect(colors).toEqual({
			color1: '#667eea',
			color2: '#764ba2',
			intensity: 1.2
		});
	});

	it('should fallback to basic colors for unknown style', () => {
		const colors = getHolographicColors('unknown' as any);
		expect(colors).toEqual({
			color1: '#00e7ff',
			color2: '#ff00e7',
			intensity: 1.0
		});
	});
});