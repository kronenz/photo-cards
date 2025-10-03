import { describe, it, expect, beforeEach } from 'vitest';
import { createCardStateManager, type CardStateManager } from '../cardStateManager';

describe('Back-Side Holographic Effects', () => {
	let stateManager: CardStateManager;
	const mockCardBounds = { width: 200, height: 280 };
	const mockMousePos = { x: 100, y: 140 }; // Center position

	beforeEach(() => {
		stateManager = createCardStateManager({
			animationSpeed: 600,
			enableFlip: true,
			holographicStyle: 'basic',
			preventDoubleClick: true
		});
	});

	it('should provide front-side holographic effects when not flipped', () => {
		stateManager.handleMouseEnter();
		
		const effect = stateManager.transitionHolographicEffect(false, mockMousePos, mockCardBounds);
		
		expect(effect).toBeDefined();
		expect(effect.intensity).toBeGreaterThan(0);
		expect(effect.gradientOpacity).toBeGreaterThan(0);
		expect(effect.sparkleOpacity).toBeGreaterThan(0);
	});

	it('should provide back-side holographic effects when flipped', () => {
		stateManager.handleMouseEnter();
		
		const frontEffect = stateManager.transitionHolographicEffect(false, mockMousePos, mockCardBounds);
		const backEffect = stateManager.transitionHolographicEffect(true, mockMousePos, mockCardBounds);
		
		expect(backEffect).toBeDefined();
		expect(backEffect.intensity).toBeGreaterThan(0);
		expect(backEffect.gradientOpacity).toBeGreaterThan(0);
		expect(backEffect.sparkleOpacity).toBeGreaterThan(0);
		
		// Back effects should be slightly enhanced
		expect(backEffect.gradientOpacity).toBeGreaterThanOrEqual(frontEffect.gradientOpacity || 0);
		expect(backEffect.intensity).toBeGreaterThanOrEqual(frontEffect.intensity);
	});

	it('should disable holographic effects during animation', () => {
		stateManager.handleMouseEnter();
		stateManager.updateState({ isAnimating: true });
		
		const effect = stateManager.getAnimationAwareHolographicEffect(false, mockMousePos, mockCardBounds);
		
		expect(effect).toBeNull();
	});

	it('should return effects after animation completes', async () => {
		stateManager.handleMouseEnter();
		
		// Start animation
		const animationPromise = stateManager.startFlipAnimation();
		
		// During animation, effects should be disabled
		let effect = stateManager.getAnimationAwareHolographicEffect(true, mockMousePos, mockCardBounds);
		expect(effect).toBeNull();
		
		// Wait for animation to complete
		await animationPromise;
		
		// After animation, effects should be restored
		effect = stateManager.getAnimationAwareHolographicEffect(true, mockMousePos, mockCardBounds);
		expect(effect).toBeDefined();
		expect(effect?.intensity).toBeGreaterThan(0);
	});

	it('should maintain hover state through flip animation', async () => {
		stateManager.handleMouseEnter();
		stateManager.handleMouseMove(mockMousePos);
		
		const initialState = stateManager.getState();
		expect(initialState.isHovering).toBe(true);
		
		// Start flip animation
		await stateManager.startFlipAnimation();
		
		const finalState = stateManager.getState();
		expect(finalState.isHovering).toBe(true);
		expect(finalState.isFlipped).toBe(true);
		expect(finalState.isAnimating).toBe(false);
	});

	it('should provide different positioning for back-side effects', () => {
		stateManager.handleMouseEnter();
		
		// Use off-center position to see positioning differences
		const offCenterPos = { x: 150, y: 100 };
		const frontEffect = stateManager.getEnhancedHolographicEffect(offCenterPos, mockCardBounds);
		const backEffect = stateManager.getBackSideHolographicEffect(offCenterPos, mockCardBounds);
		
		// Back effects should have adjusted positioning
		expect(backEffect.gradientPosition).toBeDefined();
		expect(backEffect.sparklePosition).toBeDefined();
		
		// Back effects should have enhanced opacity
		expect(backEffect.gradientOpacity).toBeGreaterThan(frontEffect.gradientOpacity || 0);
		expect(backEffect.intensity).toBeGreaterThanOrEqual(frontEffect.intensity);
	});

	it('should handle edge mouse positions correctly for back side', () => {
		stateManager.handleMouseEnter();
		
		// Test corner position
		const cornerPos = { x: 10, y: 10 };
		const effect = stateManager.getBackSideHolographicEffect(cornerPos, mockCardBounds);
		
		expect(effect).toBeDefined();
		expect(effect.intensity).toBeGreaterThan(0);
		expect(effect.distanceFromCenter).toBeGreaterThan(0.5); // Should be far from center
	});

	it('should clean up properly when effects are disabled', () => {
		stateManager.handleMouseEnter();
		stateManager.handleMouseMove(mockMousePos);
		
		// Trigger holographic effect calculation to set intensity
		stateManager.getEnhancedHolographicEffect(mockMousePos, mockCardBounds);
		
		let state = stateManager.getState();
		expect(state.isHovering).toBe(true);
		expect(state.holographicIntensity).toBeGreaterThan(0);
		
		stateManager.handleMouseLeave();
		
		state = stateManager.getState();
		expect(state.isHovering).toBe(false);
		expect(state.holographicIntensity).toBe(0);
	});
});