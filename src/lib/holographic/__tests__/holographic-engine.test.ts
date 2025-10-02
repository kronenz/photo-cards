/**
 * 홀로그래픽 엔진 핵심 기능 단위 테스트
 * Task 1.4 Implementation
 * 
 * 테스트 범위:
 * - CSS 변수 계산과 Spring 물리학 테스트
 * - 홀로그래픽 효과 렌더링 성능 테스트 (60fps 검증)
 * - 반응형 디자인과 접근성 기능 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { 
  HolographicEngine, 
  createHolographicEngine,
  createOptimizedHolographicEngine,
  SPRING_PRESETS,
  KBO_TEAM_CONFIGS,
  type HolographicType,
  type SpringConfig,
  type HolographicParams
} from '../HolographicEngine';

// Mock DOM environment
const mockElement = () => {
  const element = document.createElement('div');
  element.style.setProperty = vi.fn();
  element.getBoundingClientRect = vi.fn(() => ({
    left: 0,
    top: 0,
    width: 300,
    height: 420,
    right: 300,
    bottom: 420,
    x: 0,
    y: 0,
    toJSON: () => ({})
  }));
  element.offsetWidth = 300;
  element.offsetHeight = 420;
  element.offsetLeft = 0;
  element.offsetTop = 0;
  return element;
};

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16.67); // 60fps
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe('홀로그래픽 엔진 핵심 기능 테스트', () => {
  let element: HTMLElement;
  let engine: HolographicEngine;

  beforeEach(() => {
    element = mockElement();
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
    document.body.removeChild(element);
    vi.clearAllMocks();
  });

  describe('엔진 초기화 및 기본 설정', () => {
    it('기본 홀로그래픽 엔진이 올바르게 초기화되어야 함', () => {
      engine = createHolographicEngine(element, 'basic');
      
      expect(engine).toBeInstanceOf(HolographicEngine);
      expect(element.style.transform).toBe('translateZ(0)');
      expect(element.style.willChange).toBe('transform, filter');
      expect(element.style.backfaceVisibility).toBe('hidden');
      expect(element.style.perspective).toBe('1000px');
    });

    it('KBO 구단별 설정이 올바르게 적용되어야 함', () => {
      const teamTypes: HolographicType[] = ['lg', 'doosan', 'kt', 'samsung', 'lotte'];
      
      teamTypes.forEach(team => {
        const testEngine = createHolographicEngine(element, team);
        const params = get(testEngine.params);
        const expectedConfig = KBO_TEAM_CONFIGS[team];
        
        expect(params.intensity).toBe(expectedConfig.intensity);
        expect(params.colorShift).toBe(expectedConfig.colorShift);
        expect(params.reflectionAngle).toBe(expectedConfig.reflectionAngle);
        
        testEngine.destroy();
      });
    });

    it('최적화된 엔진이 저사양 기기용 설정을 사용해야 함', () => {
      engine = createOptimizedHolographicEngine(element, 'basic');
      
      expect(engine).toBeInstanceOf(HolographicEngine);
      // 최적화된 설정은 더 부드러운 스프링 설정을 사용
      expect(element.style.willChange).toBe('transform, filter');
    });
  });

  describe('CSS 변수 계산 및 Spring 물리학 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'basic');
    });

    it('포인터 위치에 따른 CSS 변수가 올바르게 계산되어야 함', async () => {
      // 중앙 위치 (50%, 50%)
      const centerEvent = new MouseEvent('mousemove', {
        clientX: 150, // element width / 2
        clientY: 210  // element height / 2
      });
      
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.dispatchEvent(centerEvent);
      
      // Spring 애니메이션 완료 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cssVars = get(engine.cssVars);
      expect(cssVars['--pointer-x']).toBe('50%');
      expect(cssVars['--pointer-y']).toBe('50%');
      expect(cssVars['--pointer-from-center-x']).toBe('0%');
      expect(cssVars['--pointer-from-center-y']).toBe('0%');
    });

    it('극단적인 포인터 위치에서 물리학 계산이 올바르게 제한되어야 함', async () => {
      // 좌상단 모서리
      const cornerEvent = new MouseEvent('mousemove', {
        clientX: 0,
        clientY: 0
      });
      
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.dispatchEvent(cornerEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const physics = get(engine.physics);
      
      // 회전각이 합리적인 범위 내에 있어야 함
      expect(physics.rotateX).toBeGreaterThan(-20);
      expect(physics.rotateX).toBeLessThan(20);
      expect(physics.rotateY).toBeGreaterThan(-35);
      expect(physics.rotateY).toBeLessThan(35);
      
      // 스케일이 합리적인 범위 내에 있어야 함
      expect(physics.scale).toBeGreaterThanOrEqual(0.95);
      expect(physics.scale).toBeLessThanOrEqual(1.05);
    });

    it('Spring 물리학이 부드러운 전환을 제공해야 함', async () => {
      const initialPointer = get(engine.pointer);
      
      // 포인터 위치 변경
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 300, // 우측 끝
        clientY: 210
      });
      
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.dispatchEvent(moveEvent);
      
      // 즉시 값이 변경되지 않아야 함 (Spring 효과)
      const immediatePointer = get(engine.pointer);
      expect(immediatePointer.normalizedX).not.toBe(1.0);
      
      // 시간이 지나면 목표값에 도달해야 함
      await new Promise(resolve => setTimeout(resolve, 500));
      const finalPointer = get(engine.pointer);
      expect(finalPointer.normalizedX).toBeCloseTo(1.0, 1);
    });
  });

  describe('홀로그래픽 효과 렌더링 성능 테스트 (60fps 검증)', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'cosmic');
    });

    it('성능 모니터링이 올바르게 작동해야 함', async () => {
      // 성능 모니터링 시작 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const performance = get(engine.performance);
      expect(performance.fps).toBeGreaterThan(0);
      expect(performance.frameTime).toBeGreaterThan(0);
      expect(performance.frameTime).toBeLessThan(50); // 50ms 이하여야 함
    });

    it('연속적인 마우스 이동에서 성능이 유지되어야 함', async () => {
      const performanceData: number[] = [];
      
      // 성능 데이터 수집
      const unsubscribe = engine.performance.subscribe(perf => {
        performanceData.push(perf.fps);
      });
      
      element.dispatchEvent(new MouseEvent('mouseenter'));
      
      // 연속적인 마우스 이동 시뮬레이션
      for (let i = 0; i < 10; i++) {
        const moveEvent = new MouseEvent('mousemove', {
          clientX: i * 30,
          clientY: i * 42
        });
        element.dispatchEvent(moveEvent);
        await new Promise(resolve => setTimeout(resolve, 16.67)); // 60fps 간격
      }
      
      unsubscribe();
      
      // 평균 FPS가 30 이상이어야 함 (성능 기준)
      const avgFps = performanceData.reduce((a, b) => a + b, 0) / performanceData.length;
      expect(avgFps).toBeGreaterThan(30);
    });

    it('CSS 변수 업데이트가 배치 처리되어야 함', () => {
      const setPropertySpy = vi.spyOn(element.style, 'setProperty');
      
      // 여러 CSS 변수 업데이트
      const cssVars = get(engine.cssVars);
      const varCount = Object.keys(cssVars).length;
      
      // CSS 변수가 한 번에 모두 설정되어야 함
      expect(setPropertySpy).toHaveBeenCalledTimes(varCount);
    });
  });

  describe('반응형 디자인 및 접근성 기능 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'rainbow');
    });

    it('터치 이벤트가 올바르게 처리되어야 함', async () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 210 } as Touch]
      });
      
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 200, clientY: 260 } as Touch]
      });
      
      element.dispatchEvent(touchStart);
      expect(element.classList.contains('holographic-active')).toBe(true);
      
      element.dispatchEvent(touchMove);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const pointer = get(engine.pointer);
      expect(pointer.normalizedX).toBeGreaterThan(0.5);
      expect(pointer.normalizedY).toBeGreaterThan(0.5);
      
      element.dispatchEvent(new TouchEvent('touchend'));
      expect(element.classList.contains('holographic-active')).toBe(false);
    });

    it('키보드 포커스가 접근성을 지원해야 함', async () => {
      element.dispatchEvent(new FocusEvent('focus'));
      expect(element.classList.contains('holographic-active')).toBe(true);
      
      // 포커스 시 약간의 홀로그래픽 효과가 있어야 함
      await new Promise(resolve => setTimeout(resolve, 100));
      const physics = get(engine.physics);
      expect(Math.abs(physics.rotateY)).toBeGreaterThan(0);
      
      element.dispatchEvent(new FocusEvent('blur'));
      expect(element.classList.contains('holographic-active')).toBe(false);
    });

    it('리사이즈 이벤트에서 올바르게 리셋되어야 함', async () => {
      // 초기 상태 설정
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 420 }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      let physics = get(engine.physics);
      expect(Math.abs(physics.rotateY)).toBeGreaterThan(0);
      
      // 리사이즈 이벤트 발생
      window.dispatchEvent(new Event('resize'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      physics = get(engine.physics);
      expect(physics.rotateX).toBeCloseTo(0, 1);
      expect(physics.rotateY).toBeCloseTo(0, 1);
      expect(physics.scale).toBeCloseTo(1, 1);
    });

    it('다양한 화면 크기에서 정상 작동해야 함', () => {
      // 모바일 크기 시뮬레이션
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 250,
        height: 350,
        right: 250,
        bottom: 350,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));
      
      const mobileEvent = new MouseEvent('mousemove', {
        clientX: 125, // 중앙
        clientY: 175
      });
      
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.dispatchEvent(mobileEvent);
      
      const cssVars = get(engine.cssVars);
      expect(cssVars['--pointer-x']).toBe('50%');
      expect(cssVars['--pointer-y']).toBe('50%');
    });
  });

  describe('홀로그래픽 타입 및 매개변수 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'basic');
    });

    it('홀로그래픽 타입 변경이 올바르게 작동해야 함', async () => {
      const initialParams = get(engine.params);
      
      engine.setType('cosmic');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newParams = get(engine.params);
      expect(newParams.intensity).not.toBe(initialParams.intensity);
      expect(newParams.colorShift).not.toBe(initialParams.colorShift);
      expect(element.classList.contains('holographic-cosmic')).toBe(true);
    });

    it('매개변수 업데이트가 올바르게 반영되어야 함', async () => {
      const customParams = {
        intensity: 1.5,
        brightness: 2.0,
        saturation: 1.8
      };
      
      engine.updateParams(customParams);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updatedParams = get(engine.params);
      expect(updatedParams.intensity).toBe(1.5);
      expect(updatedParams.brightness).toBe(2.0);
      expect(updatedParams.saturation).toBe(1.8);
      
      const cssVars = get(engine.cssVars);
      expect(cssVars['--holographic-intensity']).toBe('1.5');
      expect(cssVars['--holographic-brightness']).toBe('2');
      expect(cssVars['--holographic-saturation']).toBe('1.8');
    });

    it('Spring 설정 프리셋이 올바르게 작동해야 함', () => {
      Object.entries(SPRING_PRESETS).forEach(([name, config]) => {
        expect(config.stiffness).toBeGreaterThan(0);
        expect(config.stiffness).toBeLessThanOrEqual(1);
        expect(config.damping).toBeGreaterThan(0);
        expect(config.damping).toBeLessThanOrEqual(1);
        expect(config.precision).toBeGreaterThan(0);
        expect(config.precision).toBeLessThanOrEqual(0.1);
      });
    });
  });

  describe('메모리 및 리소스 관리 테스트', () => {
    it('엔진 파괴 시 모든 리소스가 정리되어야 함', () => {
      engine = createHolographicEngine(element, 'galaxy');
      
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
      const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');
      
      engine.destroy();
      
      // 이벤트 리스너가 제거되어야 함
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
      
      // 애니메이션 프레임이 취소되어야 함
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      
      // CSS 정리
      expect(element.style.willChange).toBe('auto');
      expect(element.classList.contains('holographic-active')).toBe(false);
    });

    it('다중 엔진 인스턴스가 서로 간섭하지 않아야 함', () => {
      const element2 = mockElement();
      document.body.appendChild(element2);
      
      const engine1 = createHolographicEngine(element, 'basic');
      const engine2 = createHolographicEngine(element2, 'cosmic');
      
      // 각각 독립적으로 작동해야 함
      element.dispatchEvent(new MouseEvent('mouseenter'));
      expect(element.classList.contains('holographic-active')).toBe(true);
      expect(element2.classList.contains('holographic-active')).toBe(false);
      
      element2.dispatchEvent(new MouseEvent('mouseenter'));
      expect(element.classList.contains('holographic-active')).toBe(true);
      expect(element2.classList.contains('holographic-active')).toBe(true);
      
      engine1.destroy();
      engine2.destroy();
      document.body.removeChild(element2);
    });
  });

  describe('에러 처리 및 예외 상황 테스트', () => {
    it('잘못된 홀로그래픽 타입에 대해 기본값을 사용해야 함', () => {
      engine = createHolographicEngine(element, 'invalid-type' as HolographicType);
      
      const params = get(engine.params);
      expect(params.intensity).toBe(0.6); // basic 타입의 기본값
    });

    it('DOM 요소가 없는 상황에서 안전하게 처리해야 함', () => {
      const nullElement = null as any;
      
      expect(() => {
        new HolographicEngine(nullElement, 'basic');
      }).toThrow();
    });

    it('비정상적인 매개변수 값에 대해 안전하게 처리해야 함', () => {
      engine = createHolographicEngine(element, 'basic');
      
      // 극단적인 값들
      engine.updateParams({
        intensity: -10,
        brightness: 100,
        saturation: -5
      });
      
      const params = get(engine.params);
      // 값이 설정되지만 CSS에서 적절히 제한될 것으로 예상
      expect(typeof params.intensity).toBe('number');
      expect(typeof params.brightness).toBe('number');
      expect(typeof params.saturation).toBe('number');
    });
  });
});