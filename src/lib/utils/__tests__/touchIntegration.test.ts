import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CardStateManager, createCardStateManager } from '../cardStateManager';

describe('Touch Integration', () => {
	let stateManager: CardStateManager;

	beforeEach(() => {
		stateManager = createCardStateManager({
			animationSpeed: 600,
			enableFlip: true,
			holographicStyle: 'basic',
			preventDoubleClick: true
		});
	});

	describe('Touch Event Handling', () => {
		it('should handle touch start correctly', () => {
			const touchPos = { x: 100, y: 150 };
			
			stateManager.handleTouchStart(touchPos);
			const state = stateManager.getState();
			
			expect(state.isHovering).toBe(true);
			expect(state.mousePosition).toEqual(touchPos);
		});

		it('should handle touch move correctly', () => {
			const initialPos = { x: 100, y: 150 };
			const movePos = { x: 120, y: 170 };
			
			stateManager.handleTouchStart(initialPos);
			stateManager.handleTouchMove(movePos);
			const state = stateManager.getState();
			
			expect(state.isHovering).toBe(true);
			expect(state.mousePosition).toEqual(movePos);
		});

		it('should handle touch hold correctly', () => {
			const touchPos = { x: 100, y: 150 };
			
			stateManager.handleTouchStart(touchPos);
			// Set initial intensity to simulate holographic effect calculation
			stateManager.updateState({ holographicIntensity: 1.0 });
			stateManager.handleTouchHold();
			const state = stateManager.getState();
			
			expect(state.isHovering).toBe(true);
			expect(state.holographicIntensity).toBeGreaterThan(1.0);
		});

		it('should handle touch end correctly', () => {
			const touchPos = { x: 100, y: 150 };
			
			stateManager.handleTouchStart(touchPos);
			stateManager.handleTouchEnd();
			const state = stateManager.getState();
			
			expect(state.isHovering).toBe(false);
			expect(state.holographicIntensity).toBe(0);
			expect(state.mousePosition).toEqual({ x: 0, y: 0 });
		});

		it('should not handle touch events during animation', () => {
			const touchPos = { x: 100, y: 150 };
			
			// Start animation
			stateManager.updateState({ isAnimating: true });
			
			stateManager.handleTouchStart(touchPos);
			const state = stateManager.getState();
			
			expect(state.isHovering).toBe(false);
			expect(state.mousePosition).toEqual({ x: 0, y: 0 });
		});
	});

	describe('Enhanced Holographic Effect with Touch', () => {
		it('should calculate holographic effect for touch position', () => {
			const touchPos = { x: 100, y: 150 };
			const cardBounds = { width: 200, height: 300 };
			
			const effect = stateManager.getEnhancedHolographicEffect(touchPos, cardBounds);
			
			expect(effect).toHaveProperty('gradientPosition');
			expect(effect).toHaveProperty('sparklePosition');
			expect(effect).toHaveProperty('transform');
			expect(effect).toHaveProperty('intensity');
			expect(effect.intensity).toBeGreaterThan(0);
		});

		it('should update state when calculating holographic effect', () => {
			const touchPos = { x: 100, y: 150 };
			const cardBounds = { width: 200, height: 300 };
			
			stateManager.getEnhancedHolographicEffect(touchPos, cardBounds);
			const state = stateManager.getState();
			
			expect(state.mousePosition).toEqual(touchPos);
			expect(state.holographicIntensity).toBeGreaterThan(0);
		});
	});

	describe('Touch Hold Enhancement', () => {
		it('should enhance holographic intensity on touch hold', () => {
			const touchPos = { x: 100, y: 150 };
			
			stateManager.handleTouchStart(touchPos);
			// Set initial intensity to simulate holographic effect calculation
			stateManager.updateState({ holographicIntensity: 1.0 });
			const initialIntensity = 1.0;
			
			stateManager.handleTouchHold();
			const enhancedState = stateManager.getState();
			
			expect(enhancedState.holographicIntensity).toBeGreaterThan(initialIntensity);
		});

		it('should cap holographic intensity at maximum value', () => {
			const touchPos = { x: 100, y: 150 };
			
			stateManager.handleTouchStart(touchPos);
			stateManager.updateState({ holographicIntensity: 1.8 });
			stateManager.handleTouchHold();
			const state = stateManager.getState();
			
			expect(state.holographicIntensity).toBeLessThanOrEqual(2.0);
		});
	});
});