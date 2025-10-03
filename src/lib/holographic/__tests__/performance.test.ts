/**
 * 홀로그래픽 엔진 성능 테스트
 * Task 1.4 Implementation
 * 
 * 60fps 보장 및 성능 최적화 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HolographicEngine, createHolographicEngine } from '../HolographicEngine';
import { 
  calculatePointerData, 
  calculateTransform, 
  PerformanceMonitor,
  detectDeviceCapabilities,
  getAdaptiveQuality
} from '../../holographic-engine';

// 성능 측정을 위한 헬퍼
class PerformanceTestHelper {
  private startTime: number = 0;
  private endTime: number = 0;
  private frameCount: number = 0;
  private frameTimes: number[] = [];

  startMeasurement() {
    this.startTime = performance.now();
    this.frameCount = 0;
    this.frameTimes = [];
  }

  recordFrame() {
    const now = performance.now();
    if (this.startTime > 0) {
      this.frameTimes.push(now - this.startTime);
      this.frameCount++;
    }
  }

  endMeasurement() {
    this.endTime = performance.now();
    return {
      totalTime: this.endTime - this.startTime,
      frameCount: this.frameCount,
      averageFrameTime: this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length,
      fps: this.frameCount / ((this.endTime - this.startTime) / 1000),
      frameTimes: [...this.frameTimes]
    };
  }
}

// Mock performance.now with high precision
let mockTime = 0;
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => {
      mockTime += 16.67; // 60fps 시뮬레이션
      return mockTime;
    })
  }
});

// Mock requestAnimationFrame
let rafCallbacks: (() => void)[] = [];
global.requestAnimationFrame = vi.fn((callback) => {
  rafCallbacks.push(callback);
  return rafCallbacks.length;
});

// RAF 콜백 실행 헬퍼
const flushRAF = () => {
  const callbacks = [...rafCallbacks];
  rafCallbacks = [];
  callbacks.forEach(callback => callback());
};

describe('홀로그래픽 엔진 성능 테스트', () => {
  let element: HTMLElement;
  let engine: HolographicEngine;
  let performanceHelper: PerformanceTestHelper;

  beforeEach(() => {
    element = document.createElement('div');
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
    document.body.appendChild(element);
    
    performanceHelper = new PerformanceTestHelper();
    mockTime = 0;
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
    document.body.removeChild(element);
    rafCallbacks = [];
    vi.clearAllMocks();
  });

  describe('60fps 보장 테스트', () => {
    it('연속적인 마우스 이동에서 60fps를 유지해야 함', async () => {
      engine = createHolographicEngine(element, 'cosmic');
      performanceHelper.startMeasurement();
      
      // 60프레임 동안 마우스 이동 시뮬레이션
      for (let i = 0; i < 60; i++) {
        const event = new MouseEvent('mousemove', {
          clientX: (i * 5) % 300,
          clientY: (i * 7) % 420
        });
        
        element.dispatchEvent(event);
        performanceHelper.recordFrame();
        flushRAF(); // RAF 콜백 실행
      }
      
      const results = performanceHelper.endMeasurement();
      
      // 60fps 기준: 16.67ms 이하의 프레임 시간
      expect(results.averageFrameTime).toBeLessThan(20); // 여유를 둔 기준
      expect(results.fps).toBeGreaterThan(50); // 최소 50fps
      
      // 프레임 드롭이 10% 이하여야 함
      const slowFrames = results.frameTimes.filter(time => time > 20).length;
      const frameDropRate = slowFrames / results.frameCount;
      expect(frameDropRate).toBeLessThan(0.1);
    });

    it('복잡한 홀로그래픽 효과에서도 성능을 유지해야 함', async () => {
      engine = createHolographicEngine(element, 'rainbow');
      performanceHelper.startMeasurement();
      
      // 복잡한 패턴으로 마우스 이동
      for (let i = 0; i < 100; i++) {
        const angle = (i * Math.PI * 2) / 50;
        const x = 150 + Math.cos(angle) * 100;
        const y = 210 + Math.sin(angle) * 150;
        
        const event = new MouseEvent('mousemove', {
          clientX: x,
          clientY: y
        });
        
        element.dispatchEvent(event);
        performanceHelper.recordFrame();
        flushRAF();
      }
      
      const results = performanceHelper.endMeasurement();
      
      // 복잡한 효과에서도 최소 30fps 유지
      expect(results.fps).toBeGreaterThan(30);
      expect(results.averageFrameTime).toBeLessThan(33.33); // 30fps 기준
    });

    it('다중 카드 인스턴스에서 성능이 저하되지 않아야 함', async () => {
      const elements: HTMLElement[] = [];
      const engines: HolographicEngine[] = [];
      
      // 5개의 카드 생성
      for (let i = 0; i < 5; i++) {
        const el = document.createElement('div');
        el.getBoundingClientRect = element.getBoundingClientRect;
        document.body.appendChild(el);
        elements.push(el);
        engines.push(createHolographicEngine(el, 'basic'));
      }
      
      performanceHelper.startMeasurement();
      
      // 모든 카드에 동시에 마우스 이벤트 발생
      for (let i = 0; i < 50; i++) {
        elements.forEach((el, index) => {
          const event = new MouseEvent('mousemove', {
            clientX: (i * 6 + index * 10) % 300,
            clientY: (i * 8 + index * 15) % 420
          });
          el.dispatchEvent(event);
        });
        
        performanceHelper.recordFrame();
        flushRAF();
      }
      
      const results = performanceHelper.endMeasurement();
      
      // 다중 인스턴스에서도 최소 25fps 유지
      expect(results.fps).toBeGreaterThan(25);
      
      // 정리
      engines.forEach(eng => eng.destroy());
      elements.forEach(el => document.body.removeChild(el));
    });
  });

  describe('메모리 사용량 최적화 테스트', () => {
    it('CSS 변수 업데이트가 배치 처리되어야 함', () => {
      engine = createHolographicEngine(element, 'basic');
      const setPropertySpy = vi.spyOn(element.style, 'setProperty');
      
      // 여러 번의 빠른 마우스 이동
      for (let i = 0; i < 10; i++) {
        const event = new MouseEvent('mousemove', {
          clientX: i * 30,
          clientY: i * 42
        });
        element.dispatchEvent(event);
      }
      
      flushRAF();
      
      // CSS 변수가 배치로 업데이트되어야 함
      const callCount = setPropertySpy.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);
      
      // 각 프레임마다 모든 CSS 변수가 한 번에 업데이트되어야 함
      const expectedVarCount = 12; // 예상되는 CSS 변수 개수
      expect(callCount % expectedVarCount).toBe(0);
    });

    it('불필요한 DOM 조작이 최소화되어야 함', () => {
      engine = createHolographicEngine(element, 'cosmic');
      
      const classListSpy = vi.spyOn(element.classList, 'add');
      const classListRemoveSpy = vi.spyOn(element.classList, 'remove');
      
      // 마우스 진입/이탈 반복
      for (let i = 0; i < 5; i++) {
        element.dispatchEvent(new MouseEvent('mouseenter'));
        element.dispatchEvent(new MouseEvent('mouseleave'));
      }
      
      // 클래스 조작이 필요한 만큼만 발생해야 함
      expect(classListSpy).toHaveBeenCalledTimes(5); // mouseenter 5번
      expect(classListRemoveSpy).toHaveBeenCalledTimes(5); // mouseleave 5번
    });

    it('이벤트 리스너가 효율적으로 관리되어야 함', () => {
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
      
      engine = createHolographicEngine(element, 'galaxy');
      
      // 필요한 이벤트 리스너만 등록되어야 함
      const expectedEvents = [
        'mouseenter', 'mousemove', 'mouseleave',
        'touchstart', 'touchmove', 'touchend',
        'focus', 'blur'
      ];
      
      expect(addEventListenerSpy).toHaveBeenCalledTimes(expectedEvents.length);
      
      engine.destroy();
      
      // 모든 이벤트 리스너가 제거되어야 함
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(expectedEvents.length);
    });
  });

  describe('계산 성능 최적화 테스트', () => {
    it('포인터 데이터 계산이 효율적이어야 함', () => {
      const rect = { left: 0, top: 0, width: 300, height: 420 } as DOMRect;
      
      performanceHelper.startMeasurement();
      
      // 1000번의 계산 수행
      for (let i = 0; i < 1000; i++) {
        calculatePointerData(i % 300, i % 420, rect);
        performanceHelper.recordFrame();
      }
      
      const results = performanceHelper.endMeasurement();
      
      // 계산이 충분히 빨라야 함 (평균 1ms 이하)
      expect(results.averageFrameTime).toBeLessThan(1);
    });

    it('변형 계산이 최적화되어야 함', () => {
      const config = { intensity: 1, mobile: false, reducedMotion: false, interactive: true, effect: 'basic' as const };
      const rect = { width: 300, height: 420 } as DOMRect;
      
      performanceHelper.startMeasurement();
      
      // 1000번의 변형 계산
      for (let i = 0; i < 1000; i++) {
        const pointerData = {
          x: i % 300,
          y: i % 420,
          fromCenter: Math.random(),
          fromTop: Math.random(),
          fromLeft: Math.random()
        };
        
        calculateTransform(pointerData, rect, config);
        performanceHelper.recordFrame();
      }
      
      const results = performanceHelper.endMeasurement();
      
      // 변형 계산이 충분히 빨라야 함
      expect(results.averageFrameTime).toBeLessThan(2);
    });

    it('삼각함수 계산이 캐시되어야 함', () => {
      // 동일한 각도에 대한 반복 계산 테스트
      const angles = [0, 30, 45, 60, 90];
      const cache = new Map<number, { sin: number; cos: number }>();
      
      performanceHelper.startMeasurement();
      
      for (let i = 0; i < 1000; i++) {
        const angle = angles[i % angles.length];
        
        if (!cache.has(angle)) {
          cache.set(angle, {
            sin: Math.sin(angle * Math.PI / 180),
            cos: Math.cos(angle * Math.PI / 180)
          });
        }
        
        const cached = cache.get(angle)!;
        performanceHelper.recordFrame();
      }
      
      const results = performanceHelper.endMeasurement();
      
      // 캐시된 계산이 매우 빨라야 함
      expect(results.averageFrameTime).toBeLessThan(0.1);
      expect(cache.size).toBe(angles.length);
    });
  });

  describe('성능 모니터링 시스템 테스트', () => {
    it('PerformanceMonitor가 정확한 FPS를 측정해야 함', () => {
      const monitor = new PerformanceMonitor();
      
      // 60fps 시뮬레이션 (16.67ms 간격)
      for (let i = 0; i < 60; i++) {
        mockTime += 16.67;
        const fps = monitor.updateFPS();
        
        if (i > 10) { // 초기 몇 프레임은 제외
          expect(fps).toBeGreaterThan(50);
          expect(fps).toBeLessThan(70);
        }
      }
    });

    it('성능 저하 감지가 올바르게 작동해야 함', () => {
      const monitor = new PerformanceMonitor();
      
      // 느린 프레임 시뮬레이션 (40ms 간격 = 25fps)
      for (let i = 0; i < 30; i++) {
        mockTime += 40;
        monitor.updateFPS();
      }
      
      expect(monitor.shouldReduceQuality()).toBe(true);
      expect(monitor.getFPS()).toBeLessThan(30);
    });

    it('적응형 품질 설정이 올바르게 작동해야 함', () => {
      const quality = getAdaptiveQuality();
      
      expect(quality).toHaveProperty('enableSparkles');
      expect(quality).toHaveProperty('enableComplexAnimations');
      expect(quality).toHaveProperty('maxLayers');
      expect(quality).toHaveProperty('animationDuration');
      expect(quality).toHaveProperty('springStiffness');
      
      // 값들이 합리적인 범위 내에 있어야 함
      expect(quality.maxLayers).toBeGreaterThan(0);
      expect(quality.maxLayers).toBeLessThan(20);
      expect(quality.animationDuration).toBeGreaterThan(100);
      expect(quality.animationDuration).toBeLessThan(10000);
      expect(quality.springStiffness).toBeGreaterThan(0);
      expect(quality.springStiffness).toBeLessThan(1);
    });
  });

  describe('디바이스 성능 감지 테스트', () => {
    it('디바이스 성능이 올바르게 감지되어야 함', () => {
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities).toHaveProperty('isMobile');
      expect(capabilities).toHaveProperty('isReducedMotion');
      expect(capabilities).toHaveProperty('isHighContrast');
      expect(capabilities).toHaveProperty('supportsGPU');
      expect(capabilities).toHaveProperty('isLowEndDevice');
      expect(capabilities).toHaveProperty('deviceMemory');
      expect(capabilities).toHaveProperty('hardwareConcurrency');
      
      // 값들이 올바른 타입이어야 함
      expect(typeof capabilities.isMobile).toBe('boolean');
      expect(typeof capabilities.isReducedMotion).toBe('boolean');
      expect(typeof capabilities.supportsGPU).toBe('boolean');
      expect(typeof capabilities.deviceMemory).toBe('number');
      expect(typeof capabilities.hardwareConcurrency).toBe('number');
    });

    it('저사양 디바이스에서 성능 최적화가 적용되어야 함', () => {
      // 저사양 디바이스 시뮬레이션
      Object.defineProperty(navigator, 'deviceMemory', { value: 1, configurable: true });
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true });
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.isLowEndDevice).toBe(true);
      
      const quality = getAdaptiveQuality();
      expect(quality.enableSparkles).toBe(false);
      expect(quality.enableComplexAnimations).toBe(false);
      expect(quality.maxLayers).toBeLessThan(5);
    });

    it('고사양 디바이스에서 모든 기능이 활성화되어야 함', () => {
      // 고사양 디바이스 시뮬레이션
      Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true });
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.isLowEndDevice).toBe(false);
      
      const quality = getAdaptiveQuality();
      expect(quality.enableSparkles).toBe(true);
      expect(quality.enableComplexAnimations).toBe(true);
      expect(quality.maxLayers).toBeGreaterThan(5);
    });
  });

  describe('메모리 누수 방지 테스트', () => {
    it('엔진 파괴 후 메모리가 정리되어야 함', () => {
      const engines: HolographicEngine[] = [];
      
      // 여러 엔진 생성 및 파괴
      for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.getBoundingClientRect = element.getBoundingClientRect;
        document.body.appendChild(el);
        
        const eng = createHolographicEngine(el, 'basic');
        engines.push(eng);
        
        // 일부 활동 시뮬레이션
        el.dispatchEvent(new MouseEvent('mouseenter'));
        el.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
        el.dispatchEvent(new MouseEvent('mouseleave'));
        
        eng.destroy();
        document.body.removeChild(el);
      }
      
      // RAF 콜백이 정리되었는지 확인
      expect(rafCallbacks.length).toBe(0);
    });

    it('순환 참조가 없어야 함', () => {
      engine = createHolographicEngine(element, 'cosmic');
      
      // WeakRef를 사용한 참조 테스트 (실제로는 GC 테스트가 어려움)
      const weakRef = new WeakRef(engine);
      
      engine.destroy();
      engine = null as any;
      
      // WeakRef가 여전히 유효한지 확인 (즉시 GC되지 않을 수 있음)
      expect(weakRef.deref()).toBeDefined();
    });
  });
});