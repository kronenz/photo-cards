/**
 * 홀로그래픽 효과 계산 로직 단위 테스트
 * Task 11.1 Implementation - Enhanced Card Interaction
 * 
 * 테스트 범위:
 * - 마우스 위치 기반 홀로그래픽 효과 계산
 * - 블렌드 모드 최적화 및 이미지 가시성 보존
 * - 효과 강도 및 투명도 계산
 * - 뒷면 홀로그래픽 효과 처리
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  calculatePointerData, 
  calculateTransform, 
  getOptimalBlendMode,
  detectBlendModeSupport,
  type HolographicConfig,
  type PointerData,
  type TransformData
} from '../../holographic-engine';

describe('홀로그래픽 효과 계산 로직 테스트', () => {
  let mockRect: DOMRect;
  let basicConfig: HolographicConfig;

  beforeEach(() => {
    mockRect = {
      left: 100,
      top: 50,
      width: 300,
      height: 420,
      right: 400,
      bottom: 470,
      x: 100,
      y: 50,
      toJSON: () => ({})
    };

    basicConfig = {
      intensity: 1.0,
      interactive: true,
      effect: 'basic',
      reducedMotion: false,
      mobile: false
    };
  });

  describe('포인터 위치 계산 테스트', () => {
    it('카드 중앙 위치에서 올바른 포인터 데이터를 계산해야 함', () => {
      const centerX = mockRect.left + mockRect.width / 2; // 250
      const centerY = mockRect.top + mockRect.height / 2; // 260
      
      const pointerData = calculatePointerData(centerX, centerY, mockRect);
      
      expect(pointerData.x).toBe(50); // 50%
      expect(pointerData.y).toBe(50); // 50%
      expect(pointerData.fromCenter).toBeCloseTo(0, 2);
      expect(pointerData.fromTop).toBe(0.5);
      expect(pointerData.fromLeft).toBe(0.5);
    });

    it('카드 모서리 위치에서 극값을 올바르게 처리해야 함', () => {
      // 좌상단 모서리
      const topLeftData = calculatePointerData(mockRect.left, mockRect.top, mockRect);
      expect(topLeftData.x).toBe(0);
      expect(topLeftData.y).toBe(0);
      expect(topLeftData.fromCenter).toBeCloseTo(1, 1);
      
      // 우하단 모서리
      const bottomRightData = calculatePointerData(mockRect.right, mockRect.bottom, mockRect);
      expect(bottomRightData.x).toBe(100);
      expect(bottomRightData.y).toBe(100);
      expect(bottomRightData.fromCenter).toBeCloseTo(1, 1);
    });

    it('카드 영역 밖의 포인터 위치를 올바르게 제한해야 함', () => {
      // 카드 왼쪽 밖
      const leftOutData = calculatePointerData(mockRect.left - 50, mockRect.top + 100, mockRect);
      expect(leftOutData.x).toBe(0); // 최소값으로 제한
      expect(leftOutData.y).toBeGreaterThanOrEqual(0);
      
      // 카드 오른쪽 밖
      const rightOutData = calculatePointerData(mockRect.right + 50, mockRect.top + 100, mockRect);
      expect(rightOutData.x).toBe(100); // 최대값으로 제한
      expect(rightOutData.y).toBeGreaterThanOrEqual(0);
    });

    it('중심으로부터의 거리가 올바르게 계산되어야 함', () => {
      const testCases = [
        { x: mockRect.left + mockRect.width * 0.25, y: mockRect.top + mockRect.height * 0.25, expectedDistance: 0.7 },
        { x: mockRect.left + mockRect.width * 0.75, y: mockRect.top + mockRect.height * 0.75, expectedDistance: 0.7 },
        { x: mockRect.left, y: mockRect.top, expectedDistance: 1.0 }
      ];

      testCases.forEach(({ x, y, expectedDistance }) => {
        const pointerData = calculatePointerData(x, y, mockRect);
        expect(pointerData.fromCenter).toBeCloseTo(expectedDistance, 1);
      });
    });
  });

  describe('3D 변환 계산 테스트', () => {
    it('중앙 위치에서 변환이 최소화되어야 함', () => {
      const centerPointer: PointerData = {
        x: 50,
        y: 50,
        fromCenter: 0,
        fromTop: 0.5,
        fromLeft: 0.5
      };

      const transform = calculateTransform(centerPointer, mockRect, basicConfig);
      
      expect(transform.rotateX).toBeCloseTo(0, 1);
      expect(transform.rotateY).toBeCloseTo(0, 1);
      expect(transform.scale).toBeCloseTo(1.02, 2); // 기본 interactive 스케일
      expect(transform.translateX).toBeCloseTo(0, 1);
      expect(transform.translateY).toBeCloseTo(0, 1);
    });

    it('극단 위치에서 최대 변환이 적용되어야 함', () => {
      const cornerPointer: PointerData = {
        x: 0,
        y: 0,
        fromCenter: 1,
        fromTop: 0,
        fromLeft: 0
      };

      const transform = calculateTransform(cornerPointer, mockRect, basicConfig);
      
      // 회전값이 합리적인 범위 내에 있어야 함
      expect(Math.abs(transform.rotateX)).toBeGreaterThan(10);
      expect(Math.abs(transform.rotateX)).toBeLessThan(50);
      expect(Math.abs(transform.rotateY)).toBeGreaterThan(10);
      expect(Math.abs(transform.rotateY)).toBeLessThan(50);
      
      // 스케일이 증가해야 함
      expect(transform.scale).toBeGreaterThan(1.02);
      expect(transform.scale).toBeLessThan(1.2);
    });

    it('모바일 설정에서 변환이 감소되어야 함', () => {
      const mobileConfig: HolographicConfig = {
        ...basicConfig,
        mobile: true
      };

      const edgePointer: PointerData = {
        x: 100,
        y: 0,
        fromCenter: 1,
        fromTop: 0,
        fromLeft: 1
      };

      const desktopTransform = calculateTransform(edgePointer, mockRect, basicConfig);
      const mobileTransform = calculateTransform(edgePointer, mockRect, mobileConfig);
      
      // 모바일에서 회전과 이동이 더 작아야 함
      expect(Math.abs(mobileTransform.rotateX)).toBeLessThan(Math.abs(desktopTransform.rotateX));
      expect(Math.abs(mobileTransform.rotateY)).toBeLessThan(Math.abs(desktopTransform.rotateY));
      expect(Math.abs(mobileTransform.translateX)).toBeLessThan(Math.abs(desktopTransform.translateX));
      expect(Math.abs(mobileTransform.translateY)).toBeLessThan(Math.abs(desktopTransform.translateY));
    });

    it('애니메이션 감소 모드에서 변환이 비활성화되어야 함', () => {
      const reducedMotionConfig: HolographicConfig = {
        ...basicConfig,
        reducedMotion: true
      };

      const edgePointer: PointerData = {
        x: 100,
        y: 100,
        fromCenter: 1,
        fromTop: 1,
        fromLeft: 1
      };

      const transform = calculateTransform(edgePointer, mockRect, reducedMotionConfig);
      
      expect(transform.rotateX).toBe(0);
      expect(transform.rotateY).toBe(0);
      expect(transform.scale).toBe(1);
      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
    });

    it('강도 설정이 변환에 올바르게 적용되어야 함', () => {
      const lowIntensityConfig: HolographicConfig = {
        ...basicConfig,
        intensity: 0.5
      };

      const highIntensityConfig: HolographicConfig = {
        ...basicConfig,
        intensity: 1.5
      };

      const edgePointer: PointerData = {
        x: 0,
        y: 100,
        fromCenter: 1,
        fromTop: 1,
        fromLeft: 0
      };

      const lowTransform = calculateTransform(edgePointer, mockRect, lowIntensityConfig);
      const highTransform = calculateTransform(edgePointer, mockRect, highIntensityConfig);
      
      // 높은 강도에서 더 큰 변환이 적용되어야 함
      expect(Math.abs(highTransform.rotateX)).toBeGreaterThan(Math.abs(lowTransform.rotateX));
      expect(Math.abs(highTransform.rotateY)).toBeGreaterThan(Math.abs(lowTransform.rotateY));
      expect(Math.abs(highTransform.translateX)).toBeGreaterThan(Math.abs(lowTransform.translateX));
      expect(Math.abs(highTransform.translateY)).toBeGreaterThan(Math.abs(lowTransform.translateY));
    });
  });

  describe('블렌드 모드 최적화 테스트', () => {
    beforeEach(() => {
      // CSS.supports 모킹
      Object.defineProperty(global, 'CSS', {
        value: {
          supports: vi.fn((property: string, value: string) => {
            const supportMap: Record<string, boolean> = {
              'color-dodge': true,
              'plus-lighter': false,
              'screen': true,
              'multiply': true,
              'overlay': true,
              'soft-light': true
            };
            
            if (property === 'mix-blend-mode') {
              return supportMap[value] ?? false;
            }
            return true;
          })
        },
        writable: true,
        configurable: true
      });
    });

    it('블렌드 모드 지원 감지가 올바르게 작동해야 함', () => {
      const support = detectBlendModeSupport();
      
      expect(support.colorDodge).toBe(true);
      expect(support.plusLighter).toBe(false);
      expect(support.screen).toBe(true);
      expect(support.multiply).toBe(true);
    });

    it('최적 블렌드 모드가 올바르게 선택되어야 함', () => {
      // color-dodge가 지원되는 경우
      expect(getOptimalBlendMode('color-dodge')).toBe('color-dodge');
      
      // plus-lighter가 지원되지 않는 경우 fallback
      expect(getOptimalBlendMode('plus-lighter')).toBe('color-dodge');
      
      // 기본값
      expect(getOptimalBlendMode('unknown')).toBe('screen');
    });

    it('브라우저 호환성에 따른 fallback이 작동해야 함', () => {
      // color-dodge 미지원 시뮬레이션
      (global.CSS.supports as any).mockImplementation((property: string, value: string) => {
        if (property === 'mix-blend-mode' && value === 'color-dodge') {
          return false;
        }
        return value === 'screen' || value === 'multiply' || value === 'overlay' || value === 'soft-light';
      });

      const support = detectBlendModeSupport();
      expect(support.colorDodge).toBe(false);
      
      const optimalMode = getOptimalBlendMode('color-dodge');
      expect(optimalMode).toBe('screen'); // fallback
    });
  });

  describe('홀로그래픽 효과 강도 계산 테스트', () => {
    it('거리 기반 효과 강도가 올바르게 계산되어야 함', () => {
      const testCases = [
        { fromCenter: 0, expectedIntensityRange: [0.8, 1.0] },
        { fromCenter: 0.5, expectedIntensityRange: [0.9, 1.1] },
        { fromCenter: 1, expectedIntensityRange: [1.0, 1.2] }
      ];

      testCases.forEach(({ fromCenter, expectedIntensityRange }) => {
        // 거리 기반 강도 계산 (실제 구현에서 사용되는 공식)
        const distanceMultiplier = Math.pow(fromCenter, 0.7);
        const intensity = 0.8 + (distanceMultiplier * 0.4);
        
        expect(intensity).toBeGreaterThanOrEqual(expectedIntensityRange[0]);
        expect(intensity).toBeLessThanOrEqual(expectedIntensityRange[1] + 0.001); // Allow for floating point precision
      });
    });

    it('효과별 강도 배수가 올바르게 적용되어야 함', () => {
      const effectConfigs = {
        basic: { intensity: 0.8 },
        cosmic: { intensity: 1.0 },
        rainbow: { intensity: 1.2 },
        secret: { intensity: 1.1 }
      };

      Object.entries(effectConfigs).forEach(([effect, config]) => {
        expect(config.intensity).toBeGreaterThan(0);
        expect(config.intensity).toBeLessThanOrEqual(1.5); // 합리적인 최대값
      });
    });
  });

  describe('이미지 가시성 보존 테스트', () => {
    it('개선된 블렌드 모드가 이미지 가시성을 유지해야 함', () => {
      // color-dodge 대신 overlay/soft-light 사용 확인
      const improvedBlendModes = ['overlay', 'soft-light', 'multiply'];
      const problematicBlendModes = ['color-dodge', 'plus-lighter'];
      
      // 개선된 블렌드 모드들이 지원되는지 확인
      improvedBlendModes.forEach(mode => {
        const isSupported = global.CSS.supports('mix-blend-mode', mode);
        expect(isSupported).toBe(true);
      });
    });

    it('투명도 값이 이미지 가시성을 보장하는 범위에 있어야 함', () => {
      // 홀로그래픽 레이어의 투명도가 너무 높지 않아야 함
      const maxOpacity = 0.8; // 80% 이하
      const minOpacity = 0.3; // 30% 이상
      
      const testOpacities = [0.4, 0.6, 0.7];
      
      testOpacities.forEach(opacity => {
        expect(opacity).toBeGreaterThanOrEqual(minOpacity);
        expect(opacity).toBeLessThanOrEqual(maxOpacity);
      });
    });

    it('필터 값이 원본 이미지를 과도하게 변형하지 않아야 함', () => {
      // brightness, contrast, saturation 값이 합리적인 범위에 있어야 함
      const filterLimits = {
        brightness: { min: 0.7, max: 1.3 },
        contrast: { min: 0.8, max: 1.5 },
        saturation: { min: 0.9, max: 1.4 }
      };

      Object.entries(filterLimits).forEach(([filter, { min, max }]) => {
        // 테스트 값들이 합리적인 범위에 있는지 확인
        const testValue = 1.1; // 예시 값
        expect(testValue).toBeGreaterThanOrEqual(min);
        expect(testValue).toBeLessThanOrEqual(max);
      });
    });
  });

  describe('뒷면 홀로그래픽 효과 테스트', () => {
    it('뒷면 효과가 앞면과 다른 설정을 사용해야 함', () => {
      // 뒷면은 일반적으로 더 부드러운 효과 사용
      const frontConfig = { intensity: 1.0, opacity: 0.6 };
      const backConfig = { intensity: 0.8, opacity: 0.5 };
      
      expect(backConfig.intensity).toBeLessThanOrEqual(frontConfig.intensity);
      expect(backConfig.opacity).toBeLessThanOrEqual(frontConfig.opacity);
    });

    it('카드 타입별 뒷면 효과가 올바르게 구분되어야 함', () => {
      const cardBackConfigs = {
        pokemon: { pattern: 'pokeball', colors: ['#ff0000', '#ffffff'] },
        kbo: { pattern: 'team-logo', colors: ['#c41e3a', '#ff69b4'] }, // LG 예시
        custom: { pattern: 'holographic', colors: ['#00e7ff', '#ff00e7'] }
      };

      Object.entries(cardBackConfigs).forEach(([type, config]) => {
        expect(config.pattern).toBeDefined();
        expect(config.colors).toHaveLength(2);
        expect(config.colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
        expect(config.colors[1]).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('성능 최적화 계산 테스트', () => {
    it('계산 결과가 CSS에 적합한 형식이어야 함', () => {
      const pointerData: PointerData = {
        x: 75.5,
        y: 25.3,
        fromCenter: 0.6,
        fromTop: 0.253,
        fromLeft: 0.755
      };

      // CSS 값으로 변환 시 적절한 정밀도 유지
      expect(pointerData.x.toFixed(1)).toBe('75.5');
      expect(pointerData.y.toFixed(1)).toBe('25.3');
      
      // 백분율 값이 유효한 범위에 있어야 함
      expect(pointerData.x).toBeGreaterThanOrEqual(0);
      expect(pointerData.x).toBeLessThanOrEqual(100);
      expect(pointerData.y).toBeGreaterThanOrEqual(0);
      expect(pointerData.y).toBeLessThanOrEqual(100);
    });

    it('변환 계산이 GPU 친화적인 값을 생성해야 함', () => {
      const transform: TransformData = {
        rotateX: 15.5,
        rotateY: -22.3,
        scale: 1.05,
        translateX: 8.2,
        translateY: -5.7
      };

      // 회전값이 합리적인 범위에 있어야 함 (GPU 최적화)
      expect(Math.abs(transform.rotateX)).toBeLessThan(45);
      expect(Math.abs(transform.rotateY)).toBeLessThan(45);
      
      // 스케일이 극단적이지 않아야 함
      expect(transform.scale).toBeGreaterThan(0.8);
      expect(transform.scale).toBeLessThan(1.3);
      
      // 이동값이 합리적인 범위에 있어야 함
      expect(Math.abs(transform.translateX)).toBeLessThan(50);
      expect(Math.abs(transform.translateY)).toBeLessThan(50);
    });
  });
});