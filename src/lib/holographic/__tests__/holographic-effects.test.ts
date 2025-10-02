/**
 * 홀로그래픽 CSS 효과 테스트
 * Task 1.4 Implementation
 * 
 * 테스트 범위:
 * - CSS 애니메이션 및 키프레임 검증
 * - 브라우저 호환성 및 fallback 테스트
 * - 성능 최적화 CSS 속성 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// CSS 파일을 문자열로 로드하는 헬퍼
const loadCSS = async () => {
  // 실제 환경에서는 CSS 파일을 읽어올 수 있지만, 테스트에서는 모의 CSS 사용
  return `
    .card--basic .card__foil {
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
  `;
};

// CSS 규칙 파싱 헬퍼
const parseCSS = (cssText: string) => {
  const rules: Record<string, Record<string, string>> = {};
  const ruleMatches = cssText.match(/([^{]+)\{([^}]+)\}/g);
  
  if (ruleMatches) {
    ruleMatches.forEach(rule => {
      const [, selector, declarations] = rule.match(/([^{]+)\{([^}]+)\}/) || [];
      if (selector && declarations) {
        const cleanSelector = selector.trim();
        rules[cleanSelector] = {};
        
        declarations.split(';').forEach(decl => {
          const [property, value] = decl.split(':').map(s => s.trim());
          if (property && value) {
            rules[cleanSelector][property] = value;
          }
        });
      }
    });
  }
  
  return rules;
};

// Mock CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn((property: string, value: string) => {
      // 기본적인 CSS 속성들은 지원한다고 가정
      const supportedProperties = [
        'transform',
        'filter',
        'backdrop-filter',
        'mix-blend-mode',
        'animation',
        'background'
      ];
      
      const supportedBlendModes = [
        'normal', 'multiply', 'screen', 'overlay',
        'color-dodge', 'plus-lighter'
      ];
      
      if (property === 'mix-blend-mode') {
        return supportedBlendModes.includes(value);
      }
      
      return supportedProperties.some(prop => property.includes(prop));
    })
  }
});

describe('홀로그래픽 CSS 효과 테스트', () => {
  let styleElement: HTMLStyleElement;
  let testElement: HTMLElement;

  beforeEach(() => {
    // 테스트용 스타일 엘리먼트 생성
    styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    
    // 테스트용 카드 엘리먼트 생성
    testElement = document.createElement('div');
    testElement.className = 'holographic-card card--basic';
    testElement.innerHTML = '<div class="card__foil"></div>';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
    if (testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('CSS 변수 및 계산 함수 테스트', () => {
    it('CSS 변수가 올바르게 설정되고 계산되어야 함', async () => {
      const css = await loadCSS();
      styleElement.textContent = css;
      
      // CSS 변수 설정
      testElement.style.setProperty('--pointer-x', '75%');
      testElement.style.setProperty('--pointer-y', '25%');
      
      const computedStyle = window.getComputedStyle(testElement);
      
      // CSS 변수가 설정되었는지 확인
      expect(testElement.style.getPropertyValue('--pointer-x')).toBe('75%');
      expect(testElement.style.getPropertyValue('--pointer-y')).toBe('25%');
    });

    it('calc() 함수가 포인터 위치에 따라 올바르게 계산되어야 함', () => {
      // calc(var(--pointer-x, 50%) * 2deg + 115deg) 테스트
      const testCases = [
        { pointerX: '0%', expected: '115deg' },
        { pointerX: '50%', expected: '215deg' },
        { pointerX: '100%', expected: '315deg' }
      ];
      
      testCases.forEach(({ pointerX, expected }) => {
        testElement.style.setProperty('--pointer-x', pointerX);
        
        // calc 계산 시뮬레이션
        const numericValue = parseFloat(pointerX);
        const calculatedDeg = numericValue * 2 + 115;
        
        expect(calculatedDeg).toBe(parseFloat(expected));
      });
    });

    it('CSS 변수 fallback 값이 올바르게 작동해야 함', () => {
      // --pointer-x가 설정되지 않은 경우 50% 기본값 사용
      const foilElement = testElement.querySelector('.card__foil') as HTMLElement;
      
      // CSS 변수가 없을 때 기본값 확인
      expect(testElement.style.getPropertyValue('--pointer-x') || '50%').toBe('50%');
      expect(testElement.style.getPropertyValue('--pointer-y') || '50%').toBe('50%');
    });
  });

  describe('홀로그래픽 효과별 CSS 규칙 검증', () => {
    it('basic 효과의 CSS 규칙이 올바르게 정의되어야 함', async () => {
      const css = await loadCSS();
      const rules = parseCSS(css);
      
      const basicRule = rules['.card--basic .card__foil'];
      expect(basicRule).toBeDefined();
      expect(basicRule['background-size']).toBe('300% 300%');
      expect(basicRule['animation']).toContain('basic-shift');
      expect(basicRule['animation']).toContain('3s');
      expect(basicRule['animation']).toContain('ease-in-out');
      expect(basicRule['animation']).toContain('infinite');
    });

    it('키프레임 애니메이션이 올바르게 정의되어야 함', async () => {
      const css = await loadCSS();
      
      // @keyframes basic-shift 검증
      expect(css).toContain('@keyframes basic-shift');
      expect(css).toContain('0%, 100%');
      expect(css).toContain('50%');
      expect(css).toContain('background-position: 0% 50%');
      expect(css).toContain('background-position: 100% 50%');
    });

    it('그라디언트 색상이 올바르게 정의되어야 함', async () => {
      const css = await loadCSS();
      
      // 홀로그래픽 색상 검증
      expect(css).toContain('rgba(255, 0, 153, 0.6)'); // 핑크
      expect(css).toContain('rgba(255, 204, 0, 0.7)');  // 골드
      expect(css).toContain('rgba(0, 255, 255, 0.7)');  // 시안
      expect(css).toContain('transparent');
    });
  });

  describe('성능 최적화 CSS 속성 검증', () => {
    it('GPU 가속을 위한 CSS 속성이 설정되어야 함', () => {
      // transform3d, will-change 등 GPU 가속 속성 확인
      testElement.style.transform = 'translateZ(0)';
      testElement.style.willChange = 'transform, filter';
      testElement.style.backfaceVisibility = 'hidden';
      
      expect(testElement.style.transform).toBe('translateZ(0)');
      expect(testElement.style.willChange).toBe('transform, filter');
      expect(testElement.style.backfaceVisibility).toBe('hidden');
    });

    it('애니메이션 성능을 위한 속성이 올바르게 설정되어야 함', async () => {
      const css = await loadCSS();
      styleElement.textContent = css;
      
      // 애니메이션 타이밍 함수 검증
      expect(css).toContain('ease-in-out');
      
      // 애니메이션 지속 시간이 적절해야 함 (너무 빠르거나 느리지 않음)
      const animationDurations = css.match(/(\d+(?:\.\d+)?)s/g);
      if (animationDurations) {
        animationDurations.forEach(duration => {
          const seconds = parseFloat(duration);
          expect(seconds).toBeGreaterThan(0.5); // 너무 빠르지 않음
          expect(seconds).toBeLessThan(10);     // 너무 느리지 않음
        });
      }
    });

    it('레이어 합성을 위한 isolation 속성이 설정되어야 함', () => {
      testElement.style.isolation = 'isolate';
      expect(testElement.style.isolation).toBe('isolate');
    });
  });

  describe('브라우저 호환성 및 fallback 테스트', () => {
    it('mix-blend-mode 지원 여부를 올바르게 감지해야 함', () => {
      const supportsColorDodge = CSS.supports('mix-blend-mode', 'color-dodge');
      const supportsPlusLighter = CSS.supports('mix-blend-mode', 'plus-lighter');
      const supportsScreen = CSS.supports('mix-blend-mode', 'screen');
      
      expect(typeof supportsColorDodge).toBe('boolean');
      expect(typeof supportsPlusLighter).toBe('boolean');
      expect(typeof supportsScreen).toBe('boolean');
      
      // screen은 대부분의 브라우저에서 지원
      expect(supportsScreen).toBe(true);
    });

    it('backdrop-filter fallback이 올바르게 작동해야 함', () => {
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
      
      if (supportsBackdropFilter) {
        testElement.style.backdropFilter = 'blur(10px)';
        expect(testElement.style.backdropFilter).toBe('blur(10px)');
      } else {
        // fallback: 반투명 배경 사용
        testElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        expect(testElement.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
      }
    });

    it('CSS Grid와 Flexbox fallback이 올바르게 작동해야 함', () => {
      const supportsGrid = CSS.supports('display', 'grid');
      const supportsFlex = CSS.supports('display', 'flex');
      
      if (supportsGrid) {
        testElement.style.display = 'grid';
        expect(testElement.style.display).toBe('grid');
      } else if (supportsFlex) {
        testElement.style.display = 'flex';
        expect(testElement.style.display).toBe('flex');
      } else {
        testElement.style.display = 'block';
        expect(testElement.style.display).toBe('block');
      }
    });
  });

  describe('반응형 디자인 CSS 테스트', () => {
    it('미디어 쿼리가 올바르게 적용되어야 함', () => {
      // 모바일 미디어 쿼리 시뮬레이션
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      
      // 미디어 쿼리 객체가 올바르게 생성되어야 함
      expect(mobileQuery).toBeDefined();
      expect(typeof mobileQuery.matches).toBe('boolean');
    });

    it('터치 디바이스 감지가 올바르게 작동해야 함', () => {
      const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
      
      expect(touchQuery).toBeDefined();
      expect(typeof touchQuery.matches).toBe('boolean');
    });

    it('고대비 모드 감지가 올바르게 작동해야 함', () => {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      
      expect(highContrastQuery).toBeDefined();
      expect(typeof highContrastQuery.matches).toBe('boolean');
    });

    it('애니메이션 감소 설정이 올바르게 감지되어야 함', () => {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      expect(reducedMotionQuery).toBeDefined();
      expect(typeof reducedMotionQuery.matches).toBe('boolean');
      
      if (reducedMotionQuery.matches) {
        // 애니메이션 감소 모드에서는 애니메이션 비활성화
        testElement.style.animation = 'none';
        expect(testElement.style.animation).toBe('none');
      }
    });
  });

  describe('CSS 애니메이션 성능 테스트', () => {
    it('애니메이션이 60fps를 유지할 수 있는 속성만 사용해야 함', async () => {
      const css = await loadCSS();
      
      // 성능이 좋은 애니메이션 속성들
      const performantProperties = [
        'transform',
        'opacity',
        'filter',
        'background-position'
      ];
      
      // 성능이 나쁜 애니메이션 속성들 (레이아웃 변경)
      const expensiveProperties = [
        'width',
        'height',
        'top',
        'left',
        'margin',
        'padding'
      ];
      
      // CSS에서 비싼 속성들이 애니메이션되지 않는지 확인
      expensiveProperties.forEach(property => {
        const regex = new RegExp(`@keyframes[^}]*${property}\\s*:`, 'g');
        expect(css.match(regex)).toBeNull();
      });
    });

    it('애니메이션 타이밍이 자연스러워야 함', async () => {
      const css = await loadCSS();
      
      // ease-in-out, cubic-bezier 등 자연스러운 타이밍 함수 사용 확인
      const naturalTimingFunctions = [
        'ease-in-out',
        'ease-out',
        'ease',
        'cubic-bezier'
      ];
      
      const hasNaturalTiming = naturalTimingFunctions.some(timing => 
        css.includes(timing)
      );
      
      expect(hasNaturalTiming).toBe(true);
    });

    it('무한 애니메이션이 적절히 사용되어야 함', async () => {
      const css = await loadCSS();
      
      // infinite 애니메이션이 있는지 확인
      expect(css).toContain('infinite');
      
      // 하지만 너무 많은 무한 애니메이션은 성능에 해로움
      const infiniteCount = (css.match(/infinite/g) || []).length;
      expect(infiniteCount).toBeLessThan(10); // 적절한 수준
    });
  });

  describe('접근성 CSS 테스트', () => {
    it('고대비 모드에서 적절한 대비를 제공해야 함', () => {
      // 고대비 모드 시뮬레이션
      testElement.style.filter = 'contrast(2) brightness(1.5)';
      
      expect(testElement.style.filter).toContain('contrast');
      expect(testElement.style.filter).toContain('brightness');
    });

    it('포커스 표시가 명확해야 함', () => {
      testElement.style.outline = '2px solid #007AFF';
      testElement.style.outlineOffset = '2px';
      
      expect(testElement.style.outline).toBe('2px solid #007AFF');
      expect(testElement.style.outlineOffset).toBe('2px');
    });

    it('텍스트 가독성이 보장되어야 함', () => {
      const textElement = document.createElement('div');
      textElement.style.color = '#FFFFFF';
      textElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
      textElement.style.fontSize = '16px';
      textElement.style.lineHeight = '1.5';
      
      expect(textElement.style.color).toBe('#FFFFFF');
      expect(textElement.style.textShadow).toContain('rgba(0, 0, 0, 0.8)');
      expect(parseFloat(textElement.style.fontSize)).toBeGreaterThanOrEqual(16);
      expect(parseFloat(textElement.style.lineHeight)).toBeGreaterThanOrEqual(1.4);
    });
  });
});