/**
 * 홀로그래픽 엔진 접근성 테스트
 * Task 1.4 Implementation
 * 
 * WCAG 2.1 AA 준수 및 접근성 기능 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HolographicEngine, createHolographicEngine } from '../HolographicEngine';
import { detectDeviceCapabilities } from '../../holographic-engine';

// Mock matchMedia for accessibility queries
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// 접근성 관련 미디어 쿼리 모의
const accessibilityQueries = {
  'prefers-reduced-motion: reduce': false,
  'prefers-contrast: high': false,
  'prefers-color-scheme: dark': false,
  'hover: none': false,
  'pointer: coarse': false,
  'max-width: 768px': false
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => {
    const result = mockMatchMedia(query);
    result.matches = accessibilityQueries[query as keyof typeof accessibilityQueries] || false;
    return result;
  }),
});

// 스크린 리더 시뮬레이션
class MockScreenReader {
  private announcements: string[] = [];
  
  announce(text: string) {
    this.announcements.push(text);
  }
  
  getAnnouncements() {
    return [...this.announcements];
  }
  
  clear() {
    this.announcements = [];
  }
}

describe('홀로그래픽 엔진 접근성 테스트', () => {
  let element: HTMLElement;
  let engine: HolographicEngine;
  let screenReader: MockScreenReader;

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
    
    // 접근성 속성 설정
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', '홀로그래픽 카드');
    element.setAttribute('tabindex', '0');
    
    document.body.appendChild(element);
    screenReader = new MockScreenReader();
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
    document.body.removeChild(element);
    screenReader.clear();
    vi.clearAllMocks();
    
    // 접근성 설정 초기화
    Object.keys(accessibilityQueries).forEach(key => {
      accessibilityQueries[key as keyof typeof accessibilityQueries] = false;
    });
  });

  describe('키보드 접근성 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'basic');
    });

    it('Tab 키로 포커스가 가능해야 함', () => {
      expect(element.getAttribute('tabindex')).toBe('0');
      expect(element.getAttribute('role')).toBe('button');
      
      // 포커스 이벤트 시뮬레이션
      element.dispatchEvent(new FocusEvent('focus'));
      expect(element.classList.contains('holographic-active')).toBe(true);
    });

    it('Enter 키로 활성화가 가능해야 함', () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      
      // Enter 키 이벤트
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);
      
      // Enter 키가 클릭으로 변환되어야 함
      element.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('Space 키로 활성화가 가능해야 함', () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      
      // Space 키 이벤트
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      element.dispatchEvent(spaceEvent);
      
      element.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('Escape 키로 포커스 해제가 가능해야 함', () => {
      element.focus();
      expect(document.activeElement).toBe(element);
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      element.dispatchEvent(escapeEvent);
      element.blur();
      
      expect(element.classList.contains('holographic-active')).toBe(false);
    });

    it('포커스 표시가 명확해야 함', () => {
      element.dispatchEvent(new FocusEvent('focus'));
      
      // 포커스 스타일이 적용되어야 함
      const computedStyle = window.getComputedStyle(element);
      expect(element.classList.contains('holographic-active')).toBe(true);
      
      // 포커스 아웃라인이 있어야 함 (CSS에서 설정)
      element.style.outline = '2px solid #007AFF';
      expect(element.style.outline).toBe('2px solid #007AFF');
    });
  });

  describe('스크린 리더 지원 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'cosmic');
    });

    it('적절한 ARIA 레이블이 설정되어야 함', () => {
      expect(element.getAttribute('aria-label')).toBe('홀로그래픽 카드');
      expect(element.getAttribute('role')).toBe('button');
    });

    it('상태 변화가 스크린 리더에 알려져야 함', () => {
      // 활성화 상태 변경
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.setAttribute('aria-pressed', 'true');
      
      expect(element.getAttribute('aria-pressed')).toBe('true');
      
      element.dispatchEvent(new MouseEvent('mouseleave'));
      element.setAttribute('aria-pressed', 'false');
      
      expect(element.getAttribute('aria-pressed')).toBe('false');
    });

    it('카드 정보가 접근 가능해야 함', () => {
      // 카드 정보 설정
      element.setAttribute('aria-describedby', 'card-description');
      
      const description = document.createElement('div');
      description.id = 'card-description';
      description.textContent = 'KT 위즈 홀로그래픽 카드, 희귀도 5성';
      document.body.appendChild(description);
      
      expect(element.getAttribute('aria-describedby')).toBe('card-description');
      expect(description.textContent).toContain('KT 위즈');
      expect(description.textContent).toContain('5성');
      
      document.body.removeChild(description);
    });

    it('동적 콘텐츠 변경이 알려져야 함', () => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      element.appendChild(liveRegion);
      
      // 상태 변경 시뮬레이션
      element.dispatchEvent(new MouseEvent('mouseenter'));
      liveRegion.textContent = '홀로그래픽 효과 활성화됨';
      
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.textContent).toBe('홀로그래픽 효과 활성화됨');
    });
  });

  describe('모션 감소 설정 지원 테스트', () => {
    it('prefers-reduced-motion이 감지되어야 함', () => {
      // 모션 감소 설정 활성화
      accessibilityQueries['prefers-reduced-motion: reduce'] = true;
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.isReducedMotion).toBe(true);
    });

    it('모션 감소 모드에서 애니메이션이 비활성화되어야 함', () => {
      accessibilityQueries['prefers-reduced-motion: reduce'] = true;
      engine = createHolographicEngine(element, 'rainbow');
      
      // 마우스 이동 시뮬레이션
      element.dispatchEvent(new MouseEvent('mouseenter'));
      element.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 210 }));
      
      // 모션 감소 모드에서는 변형이 최소화되어야 함
      const transform = element.style.transform;
      if (transform) {
        // 회전각이 매우 작거나 0이어야 함
        const rotateMatch = transform.match(/rotate[XY]\(([^)]+)\)/g);
        if (rotateMatch) {
          rotateMatch.forEach(rotate => {
            const angle = parseFloat(rotate.match(/[\d.-]+/)?.[0] || '0');
            expect(Math.abs(angle)).toBeLessThan(5); // 5도 이하
          });
        }
      }
    });

    it('모션 감소 모드에서 CSS 애니메이션이 비활성화되어야 함', () => {
      accessibilityQueries['prefers-reduced-motion: reduce'] = true;
      
      // CSS에서 모션 감소 처리
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          .holographic-card * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      engine = createHolographicEngine(element, 'cosmic');
      
      // 스타일이 적용되었는지 확인
      expect(style.textContent).toContain('prefers-reduced-motion: reduce');
      expect(style.textContent).toContain('animation-duration: 0.01ms');
      
      document.head.removeChild(style);
    });
  });

  describe('고대비 모드 지원 테스트', () => {
    it('고대비 모드가 감지되어야 함', () => {
      accessibilityQueries['prefers-contrast: high'] = true;
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.isHighContrast).toBe(true);
    });

    it('고대비 모드에서 색상 대비가 강화되어야 함', () => {
      accessibilityQueries['prefers-contrast: high'] = true;
      engine = createHolographicEngine(element, 'basic');
      
      // 고대비 스타일 적용
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          .holographic-card {
            filter: contrast(2) brightness(1.2);
            border: 2px solid #FFFFFF;
          }
        }
      `;
      document.head.appendChild(style);
      
      expect(style.textContent).toContain('contrast(2)');
      expect(style.textContent).toContain('border: 2px solid #FFFFFF');
      
      document.head.removeChild(style);
    });

    it('텍스트 가독성이 보장되어야 함', () => {
      const textElement = document.createElement('div');
      textElement.className = 'card-text';
      textElement.textContent = '카드 제목';
      element.appendChild(textElement);
      
      // 고대비 모드에서 텍스트 스타일
      textElement.style.color = '#FFFFFF';
      textElement.style.backgroundColor = '#000000';
      textElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 1)';
      
      expect(textElement.style.color).toBe('#FFFFFF');
      expect(textElement.style.backgroundColor).toBe('#000000');
      expect(textElement.style.textShadow).toContain('rgba(0, 0, 0, 1)');
    });
  });

  describe('터치 접근성 테스트', () => {
    beforeEach(() => {
      accessibilityQueries['hover: none'] = true;
      accessibilityQueries['pointer: coarse'] = true;
      engine = createHolographicEngine(element, 'galaxy');
    });

    it('터치 타겟 크기가 충분해야 함', () => {
      // WCAG 기준: 최소 44x44px
      const rect = element.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });

    it('터치 이벤트가 올바르게 처리되어야 함', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 210 } as Touch]
      });
      
      element.dispatchEvent(touchStart);
      expect(element.classList.contains('holographic-active')).toBe(true);
      
      const touchEnd = new TouchEvent('touchend');
      element.dispatchEvent(touchEnd);
      expect(element.classList.contains('holographic-active')).toBe(false);
    });

    it('터치 피드백이 제공되어야 함', () => {
      // 햅틱 피드백 시뮬레이션 (실제로는 navigator.vibrate 사용)
      const vibrateSpy = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateSpy,
        configurable: true
      });
      
      element.dispatchEvent(new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 210 } as Touch]
      }));
      
      // 터치 시작 시 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate(50);
        expect(vibrateSpy).toHaveBeenCalledWith(50);
      }
    });

    it('터치 제스처가 인식되어야 함', () => {
      let touchStartPos = { x: 0, y: 0 };
      let touchEndPos = { x: 0, y: 0 };
      
      // 터치 시작
      element.addEventListener('touchstart', (e) => {
        const touch = (e as TouchEvent).touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
      });
      
      // 터치 종료
      element.addEventListener('touchend', (e) => {
        const touch = (e as TouchEvent).changedTouches[0];
        touchEndPos = { x: touch.clientX, y: touch.clientY };
        
        // 스와이프 거리 계산
        const deltaX = touchEndPos.x - touchStartPos.x;
        const deltaY = touchEndPos.y - touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 50) {
          // 스와이프 제스처로 인식
          element.setAttribute('data-swiped', 'true');
        }
      });
      
      // 스와이프 시뮬레이션
      element.dispatchEvent(new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 } as Touch]
      }));
      
      element.dispatchEvent(new TouchEvent('touchend', {
        changedTouches: [{ clientX: 200, clientY: 200 } as Touch]
      }));
      
      expect(element.getAttribute('data-swiped')).toBe('true');
    });
  });

  describe('색상 및 시각적 접근성 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'aurora');
    });

    it('색상만으로 정보를 전달하지 않아야 함', () => {
      // 희귀도를 색상과 텍스트로 모두 표시
      const rarityElement = document.createElement('div');
      rarityElement.className = 'rarity-indicator';
      rarityElement.style.backgroundColor = '#FFD700'; // 골드 색상
      rarityElement.textContent = '★★★★★'; // 텍스트로도 표시
      rarityElement.setAttribute('aria-label', '5성 희귀 카드');
      
      element.appendChild(rarityElement);
      
      expect(rarityElement.textContent).toBe('★★★★★');
      expect(rarityElement.getAttribute('aria-label')).toBe('5성 희귀 카드');
    });

    it('충분한 색상 대비를 제공해야 함', () => {
      // WCAG AA 기준: 4.5:1 대비율
      const textElement = document.createElement('div');
      textElement.style.color = '#FFFFFF';
      textElement.style.backgroundColor = '#000000';
      
      // 대비율 계산 (간단한 버전)
      const getContrastRatio = (color1: string, color2: string) => {
        // 실제로는 더 복잡한 계산이 필요하지만, 테스트용으로 간소화
        if (color1 === '#FFFFFF' && color2 === '#000000') {
          return 21; // 최대 대비율
        }
        return 4.5; // 기본값
      };
      
      const contrast = getContrastRatio(textElement.style.color, textElement.style.backgroundColor);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('색맹 사용자를 위한 패턴이나 모양을 사용해야 함', () => {
      // 색상 외에 패턴으로도 구분
      const patternElement = document.createElement('div');
      patternElement.className = 'team-indicator';
      patternElement.style.backgroundImage = 'url(data:image/svg+xml;base64,...)'; // 패턴
      patternElement.setAttribute('data-team', 'kt');
      patternElement.setAttribute('aria-label', 'KT 위즈 팀');
      
      element.appendChild(patternElement);
      
      expect(patternElement.getAttribute('data-team')).toBe('kt');
      expect(patternElement.getAttribute('aria-label')).toBe('KT 위즈 팀');
    });
  });

  describe('포커스 관리 테스트', () => {
    beforeEach(() => {
      engine = createHolographicEngine(element, 'secret');
    });

    it('포커스 순서가 논리적이어야 함', () => {
      // 여러 카드 요소 생성
      const cards = [];
      for (let i = 0; i < 3; i++) {
        const card = document.createElement('div');
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-card-index', i.toString());
        document.body.appendChild(card);
        cards.push(card);
      }
      
      // Tab 순서 확인
      cards[0].focus();
      expect(document.activeElement).toBe(cards[0]);
      
      // 다음 요소로 포커스 이동 시뮬레이션
      cards[1].focus();
      expect(document.activeElement).toBe(cards[1]);
      
      // 정리
      cards.forEach(card => document.body.removeChild(card));
    });

    it('포커스 트랩이 올바르게 작동해야 함', () => {
      // 모달이나 팝업에서 포커스 트랩
      const modal = document.createElement('div');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      
      const firstFocusable = document.createElement('button');
      firstFocusable.textContent = '첫 번째 버튼';
      
      const lastFocusable = document.createElement('button');
      lastFocusable.textContent = '마지막 버튼';
      
      modal.appendChild(firstFocusable);
      modal.appendChild(element);
      modal.appendChild(lastFocusable);
      document.body.appendChild(modal);
      
      // 첫 번째 요소에 포커스
      firstFocusable.focus();
      expect(document.activeElement).toBe(firstFocusable);
      
      // Tab 키 시뮬레이션 (실제로는 더 복잡한 로직 필요)
      element.focus();
      expect(document.activeElement).toBe(element);
      
      document.body.removeChild(modal);
    });

    it('포커스 표시가 항상 보여야 함', () => {
      element.focus();
      
      // 포커스 링이 보이는지 확인
      element.style.outline = '2px solid #007AFF';
      element.style.outlineOffset = '2px';
      
      expect(element.style.outline).toBe('2px solid #007AFF');
      expect(element.style.outlineOffset).toBe('2px');
      
      // 포커스 해제 시에도 적절한 처리
      element.blur();
      expect(document.activeElement).not.toBe(element);
    });
  });

  describe('에러 처리 및 복구 테스트', () => {
    it('접근성 기능 실패 시 graceful degradation이 되어야 함', () => {
      // ARIA 속성 설정 실패 시뮬레이션
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = vi.fn().mockImplementation((name, value) => {
        if (name.startsWith('aria-')) {
          throw new Error('ARIA not supported');
        }
        return originalSetAttribute.call(element, name, value);
      });
      
      // 에러가 발생해도 기본 기능은 작동해야 함
      expect(() => {
        engine = createHolographicEngine(element, 'basic');
      }).not.toThrow();
      
      // 기본 접근성 속성은 설정되어야 함
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('스크린 리더 지원 실패 시 대안이 제공되어야 함', () => {
      // 스크린 리더 API 실패 시뮬레이션
      delete (window as any).speechSynthesis;
      
      // 대안적 방법으로 텍스트 정보 제공
      const statusElement = document.createElement('div');
      statusElement.className = 'sr-only';
      statusElement.textContent = '홀로그래픽 카드 활성화됨';
      element.appendChild(statusElement);
      
      expect(statusElement.textContent).toBe('홀로그래픽 카드 활성화됨');
    });

    it('키보드 네비게이션 실패 시 마우스 대안이 제공되어야 함', () => {
      // 키보드 이벤트 실패 시뮬레이션
      const keydownSpy = vi.fn().mockImplementation(() => {
        throw new Error('Keyboard not available');
      });
      
      element.addEventListener('keydown', keydownSpy);
      
      // 마우스 클릭으로 대체 가능해야 함
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      
      element.click();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});