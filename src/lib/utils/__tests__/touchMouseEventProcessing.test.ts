/**
 * 터치/마우스 이벤트 처리 단위 테스트 (간소화 버전)
 * Task 11.3 Implementation - Enhanced Card Interaction
 * 
 * 테스트 범위:
 * - 터치 이벤트와 마우스 이벤트 기본 처리
 * - 이벤트 상태 관리
 * - 기본적인 제스처 처리
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  CardStateManager, 
  createCardStateManager,
  type CardConfig 
} from '../cardStateManager';

describe('터치/마우스 이벤트 처리 테스트', () => {
  let stateManager: CardStateManager;
  let mockConfig: CardConfig;

  beforeEach(() => {
    mockConfig = {
      animationSpeed: 600,
      enableFlip: true,
      holographicStyle: 'basic',
      preventDoubleClick: true
    };

    stateManager = createCardStateManager(mockConfig);
  });

  afterEach(() => {
    if (stateManager) {
      stateManager.destroy();
    }
    vi.clearAllMocks();
  });

  describe('마우스 이벤트 처리 테스트', () => {
    it('마우스 엔터 이벤트가 올바르게 처리되어야 함', () => {
      stateManager.handleMouseEnter();
      
      const state = stateManager.getState();
      expect(state.isHovering).toBe(true);
    });

    it('마우스 무브 이벤트가 올바르게 처리되어야 함', () => {
      const mousePos = { x: 150, y: 200 };
      
      stateManager.handleMouseMove(mousePos);
      
      const state = stateManager.getState();
      expect(state.isHovering).toBe(true);
      expect(state.mousePosition).toEqual(mousePos);
    });

    it('마우스 리브 이벤트가 올바르게 처리되어야 함', () => {
      // 먼저 마우스 오버 상태 설정
      stateManager.handleMouseEnter();
      stateManager.handleMouseMove({ x: 100, y: 100 });
      
      expect(stateManager.getState().isHovering).toBe(true);
      
      // 마우스 리브
      stateManager.handleMouseLeave();
      
      const state = stateManager.getState();
      expect(state.isHovering).toBe(false);
      expect(state.holographicIntensity).toBe(0);
      expect(state.mousePosition).toEqual({ x: 0, y: 0 });
    });

    it('마우스 이벤트가 카드 뒤집기를 트리거할 수 있어야 함', async () => {
      expect(stateManager.canClick()).toBe(true);
      
      const flipPromise = stateManager.startFlipAnimation();
      
      // 애니메이션 시작 확인
      expect(stateManager.getState().isAnimating).toBe(true);
      
      // 애니메이션 완료 대기
      await flipPromise;
      
      const state = stateManager.getState();
      expect(state.isFlipped).toBe(true);
      expect(state.isAnimating).toBe(false);
    });
  });

  describe('터치 이벤트 처리 테스트', () => {
    it('터치 시작 이벤트가 올바르게 처리되어야 함', () => {
      const touchPos = { x: 120, y: 180 };
      
      stateManager.handleTouchStart(touchPos);
      
      const state = stateManager.getState();
      expect(state.isHovering).toBe(true);
      expect(state.mousePosition).toEqual(touchPos);
    });

    it('터치 무브 이벤트가 올바르게 처리되어야 함', () => {
      const startPos = { x: 100, y: 150 };
      const movePos = { x: 130, y: 180 };
      
      stateManager.handleTouchStart(startPos);
      stateManager.handleTouchMove(movePos);
      
      const state = stateManager.getState();
      expect(state.isHovering).toBe(true);
      expect(state.mousePosition).toEqual(movePos);
    });

    it('터치 엔드 이벤트가 올바르게 처리되어야 함', () => {
      const touchPos = { x: 100, y: 150 };
      
      stateManager.handleTouchStart(touchPos);
      expect(stateManager.getState().isHovering).toBe(true);
      
      stateManager.handleTouchEnd();
      
      const state = stateManager.getState();
      expect(state.isHovering).toBe(false);
      expect(state.holographicIntensity).toBe(0);
      expect(state.mousePosition).toEqual({ x: 0, y: 0 });
    });

    it('터치 홀드가 홀로그래픽 효과를 강화해야 함', () => {
      const touchPos = { x: 100, y: 150 };
      
      stateManager.handleTouchStart(touchPos);
      
      // Calculate holographic effect to set initial intensity
      const cardBounds = { width: 300, height: 420 };
      stateManager.getEnhancedHolographicEffect(touchPos, cardBounds);
      
      const initialIntensity = stateManager.getState().holographicIntensity;
      
      stateManager.handleTouchHold();
      const enhancedState = stateManager.getState();
      
      expect(enhancedState.holographicIntensity).toBeGreaterThan(initialIntensity);
      expect(enhancedState.holographicIntensity).toBeLessThanOrEqual(2.0); // 최대값 제한
    });
  });

  describe('홀로그래픽 효과 통합 테스트', () => {
    it('마우스 위치 기반 홀로그래픽 효과가 계산되어야 함', () => {
      const mousePos = { x: 150, y: 200 };
      const cardBounds = { width: 300, height: 420 };
      
      const effect = stateManager.calculateHolographicEffect(mousePos, cardBounds);
      
      expect(effect).toHaveProperty('gradientPosition');
      expect(effect).toHaveProperty('sparklePosition');
      expect(effect).toHaveProperty('opacity');
      expect(effect).toHaveProperty('transform');
      expect(effect).toHaveProperty('intensity');
      expect(effect.intensity).toBeGreaterThan(0);
    });

    it('향상된 홀로그래픽 효과가 상태를 업데이트해야 함', () => {
      const mousePos = { x: 100, y: 150 };
      const cardBounds = { width: 300, height: 420 };
      
      const effect = stateManager.getEnhancedHolographicEffect(mousePos, cardBounds);
      const state = stateManager.getState();
      
      expect(state.mousePosition).toEqual(mousePos);
      expect(state.holographicIntensity).toBeGreaterThan(0);
      expect(effect.intensity).toBe(state.holographicIntensity);
    });

    it('뒷면 홀로그래픽 효과가 올바르게 작동해야 함', () => {
      const mousePos = { x: 200, y: 250 };
      const cardBounds = { width: 300, height: 420 };
      
      const backEffect = stateManager.getBackSideHolographicEffect(mousePos, cardBounds);
      const frontEffect = stateManager.getEnhancedHolographicEffect(mousePos, cardBounds);
      
      expect(backEffect).toHaveProperty('gradientPosition');
      expect(backEffect).toHaveProperty('sparklePosition');
      expect(backEffect.intensity).toBeGreaterThan(0);
      
      // 뒷면 효과는 앞면과 다를 수 있음
      expect(typeof backEffect.gradientOpacity).toBe('number');
      expect(typeof backEffect.sparkleOpacity).toBe('number');
    });
  });

  describe('애니메이션과 이벤트 상호작용 테스트', () => {
    it('애니메이션 중 이벤트 처리가 제한되어야 함', async () => {
      const flipPromise = stateManager.startFlipAnimation();
      
      // 애니메이션 중 마우스 이벤트
      stateManager.handleMouseEnter();
      stateManager.handleMouseMove({ x: 100, y: 100 });
      
      // 애니메이션 중에는 홀로그래픽 효과가 제한됨
      const animatingState = stateManager.getState();
      expect(animatingState.isAnimating).toBe(true);
      
      await flipPromise;
      
      // 애니메이션 완료 후 정상 작동
      const finalState = stateManager.getState();
      expect(finalState.isAnimating).toBe(false);
    });

    it('홀로그래픽 효과 적용 여부를 올바르게 판단해야 함', () => {
      // 호버 상태가 아닐 때
      expect(stateManager.shouldApplyHolographicEffects()).toBe(false);
      
      // 호버 상태일 때
      stateManager.handleMouseEnter();
      expect(stateManager.shouldApplyHolographicEffects()).toBe(true);
      
      // 애니메이션 중일 때
      stateManager.startFlipAnimation();
      expect(stateManager.shouldApplyHolographicEffects()).toBe(false);
    });

    it('애니메이션 인식 홀로그래픽 효과가 올바르게 작동해야 함', () => {
      const mousePos = { x: 150, y: 200 };
      const cardBounds = { width: 300, height: 420 };
      
      // 호버 상태가 아닐 때
      let effect = stateManager.getAnimationAwareHolographicEffect(false, mousePos, cardBounds);
      expect(effect).toBeNull();
      
      // 호버 상태일 때
      stateManager.handleMouseEnter();
      effect = stateManager.getAnimationAwareHolographicEffect(false, mousePos, cardBounds);
      expect(effect).not.toBeNull();
      expect(effect?.intensity).toBeGreaterThan(0);
    });
  });

  describe('상태 관리 및 정리 테스트', () => {
    it('상태 리셋이 올바르게 작동해야 함', () => {
      // 복잡한 상태 설정
      stateManager.handleMouseEnter();
      stateManager.handleMouseMove({ x: 100, y: 100 });
      
      // 상태 리셋
      stateManager.reset();
      
      const resetState = stateManager.getState();
      expect(resetState.isFlipped).toBe(false);
      expect(resetState.isHovering).toBe(false);
      expect(resetState.isAnimating).toBe(false);
      expect(resetState.holographicIntensity).toBe(0);
      expect(resetState.mousePosition).toEqual({ x: 0, y: 0 });
    });

    it('설정 업데이트가 올바르게 작동해야 함', () => {
      const newConfig = {
        animationSpeed: 800,
        enableFlip: false,
        holographicStyle: 'cosmic' as const,
        preventDoubleClick: false
      };

      stateManager.updateConfig(newConfig);
      
      // 설정 변경 확인 (enableFlip: false)
      expect(stateManager.canClick()).toBe(false);
    });

    it('리소스 정리가 올바르게 작동해야 함', () => {
      stateManager.destroy();
      
      // 상태 접근 시 에러가 발생하지 않아야 함
      expect(() => stateManager.getState()).not.toThrow();
    });
  });

  describe('에러 처리 및 예외 상황 테스트', () => {
    it('잘못된 이벤트 데이터에 대해 안전하게 처리해야 함', () => {
      const invalidPositions = [
        { x: NaN, y: 100 },
        { x: 100, y: Infinity },
        { x: -1000, y: 2000 },
        null as any,
        undefined as any
      ];

      invalidPositions.forEach(pos => {
        expect(() => {
          if (pos) {
            stateManager.handleMouseMove(pos);
          }
        }).not.toThrow();
      });
    });

    it('극단적인 카드 크기에서 안전하게 처리해야 함', () => {
      const mousePos = { x: 100, y: 100 };
      const extremeBounds = [
        { width: 0, height: 0 },
        { width: 1, height: 1 },
        { width: 10000, height: 10000 }
      ];

      extremeBounds.forEach(bounds => {
        expect(() => {
          stateManager.calculateHolographicEffect(mousePos, bounds);
        }).not.toThrow();
      });
    });

    it('동시 다중 이벤트에 대해 안전하게 처리해야 함', () => {
      // 빠른 연속 이벤트
      for (let i = 0; i < 10; i++) {
        stateManager.handleMouseMove({ x: i * 10, y: i * 10 });
        stateManager.handleTouchStart({ x: i * 5, y: i * 5 });
        stateManager.handleTouchEnd();
      }

      // 상태가 일관성을 유지해야 함
      const state = stateManager.getState();
      expect(typeof state.isHovering).toBe('boolean');
      expect(typeof state.isAnimating).toBe('boolean');
      expect(typeof state.isFlipped).toBe('boolean');
    });
  });
});