/**
 * Vitest 테스트 설정
 * Task 1.4 Implementation
 */

import { vi } from 'vitest';

// DOM 환경 설정
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver Mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// IntersectionObserver Mock
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// CSS.supports Mock
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn((property: string, value: string) => {
      const supportedProperties = [
        'transform', 'filter', 'backdrop-filter', 'mix-blend-mode',
        'animation', 'background', 'opacity'
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

// Performance API Mock
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

// RequestAnimationFrame Mock
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16.67);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Navigator Mock
Object.defineProperty(navigator, 'deviceMemory', {
  value: 4,
  configurable: true
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 4,
  configurable: true
});

Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  configurable: true
});

// Touch Events Mock
global.TouchEvent = class TouchEvent extends Event {
  touches: Touch[];
  changedTouches: Touch[];
  
  constructor(type: string, eventInitDict?: TouchEventInit) {
    super(type, eventInitDict);
    this.touches = eventInitDict?.touches || [];
    this.changedTouches = eventInitDict?.changedTouches || [];
  }
} as any;

// Console 경고 억제 (테스트 중 불필요한 로그 제거)
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('SvelteKit') || args[0]?.includes?.('Svelte')) {
    return;
  }
  originalWarn(...args);
};

// 테스트 환경에서 에러 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 전역 테스트 설정
beforeEach(() => {
  // 각 테스트 전에 DOM 정리
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Mock 함수들 초기화
  vi.clearAllMocks();
});

afterEach(() => {
  // 각 테스트 후 정리
  vi.restoreAllMocks();
});