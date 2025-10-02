/**
 * 홀로그래픽 효과 유틸리티 함수들
 * 60fps 보장과 성능 최적화를 위한 헬퍼 함수들
 */

import type { HolographicType, HolographicParams } from './HolographicEngine.js';

/**
 * 디바이스 성능 감지
 */
export interface DeviceCapabilities {
  isHighPerformance: boolean;
  supportsBlendModes: boolean;
  supportsBackdropFilter: boolean;
  supportsWillChange: boolean;
  isMobile: boolean;
  isLowPowerMode: boolean;
  maxTextureSize: number;
  devicePixelRatio: number;
}

/**
 * 디바이스 성능 및 기능 감지
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // SSR 환경 체크
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      isHighPerformance: false,
      supportsBlendModes: false,
      supportsBackdropFilter: false,
      supportsWillChange: false,
      isMobile: false,
      isLowPowerMode: false,
      maxTextureSize: 2048,
      devicePixelRatio: 1
    };
  }
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  
  return {
    // 고성능 디바이스 감지 (코어 수, 메모리 등)
    isHighPerformance: (navigator.hardwareConcurrency || 2) >= 4 && 
                      ((navigator as any).deviceMemory || 2) >= 4,
    
    // 블렌드 모드 지원 감지
    supportsBlendModes: typeof CSS !== 'undefined' && 
                       (CSS.supports('mix-blend-mode', 'color-dodge') ||
                        CSS.supports('mix-blend-mode', 'screen')),
    
    // 백드롭 필터 지원
    supportsBackdropFilter: typeof CSS !== 'undefined' &&
                           (CSS.supports('backdrop-filter', 'blur(10px)') ||
                            CSS.supports('-webkit-backdrop-filter', 'blur(10px)')),
    
    // will-change 지원
    supportsWillChange: typeof CSS !== 'undefined' && 
                       CSS.supports('will-change', 'transform'),
    
    // 모바일 디바이스 감지
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
              window.innerWidth <= 768,
    
    // 저전력 모드 감지 (추정)
    isLowPowerMode: (navigator as any).connection?.saveData === true ||
                   window.innerWidth <= 480,
    
    // 최대 텍스처 크기
    maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048,
    
    // 디바이스 픽셀 비율
    devicePixelRatio: window.devicePixelRatio || 1
  };
}

/**
 * 성능 기반 홀로그래픽 설정 최적화
 */
export function optimizeHolographicParams(
  baseParams: HolographicParams,
  capabilities: DeviceCapabilities
): HolographicParams {
  let optimized = { ...baseParams };
  
  // 저성능 디바이스 최적화
  if (!capabilities.isHighPerformance || capabilities.isLowPowerMode) {
    optimized.intensity *= 0.7;
    optimized.animationSpeed *= 0.8;
    optimized.brightness = Math.min(optimized.brightness, 1.1);
    optimized.saturation = Math.min(optimized.saturation, 1.2);
    optimized.contrast = Math.min(optimized.contrast, 1.1);
  }
  
  // 모바일 최적화
  if (capabilities.isMobile) {
    optimized.intensity *= 0.8;
    optimized.animationSpeed *= 0.9;
  }
  
  // 블렌드 모드 미지원 시 보정
  if (!capabilities.supportsBlendModes) {
    optimized.intensity *= 1.5;
    optimized.brightness *= 1.2;
    optimized.contrast *= 1.1;
  }
  
  return optimized;
}

/**
 * 60fps 보장을 위한 프레임 레이트 모니터링
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 16.67;
  private callbacks: Array<(fps: number, frameTime: number) => void> = [];
  private rafId: number | null = null;
  private isClient = false;
  
  constructor() {
    // SSR 환경 체크
    this.isClient = typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined';
    
    if (this.isClient) {
      this.lastTime = performance.now();
      this.startMonitoring();
    }
  }
  
  private startMonitoring(): void {
    if (!this.isClient) return;
    
    const monitor = () => {
      const now = performance.now();
      const deltaTime = now - this.lastTime;
      
      this.frameCount++;
      
      // 1초마다 FPS 계산
      if (deltaTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.frameTime = Math.round((deltaTime / this.frameCount) * 100) / 100;
        
        // 콜백 실행
        this.callbacks.forEach(callback => callback(this.fps, this.frameTime));
        
        this.frameCount = 0;
        this.lastTime = now;
      }
      
      if (this.isClient) {
        this.rafId = requestAnimationFrame(monitor);
      }
    };
    
    monitor();
  }
  
  public subscribe(callback: (fps: number, frameTime: number) => void): () => void {
    this.callbacks.push(callback);
    
    // 구독 해제 함수 반환
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
  
  public getCurrentFPS(): number {
    return this.fps;
  }
  
  public getCurrentFrameTime(): number {
    return this.frameTime;
  }
  
  public destroy(): void {
    if (this.isClient && this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.callbacks = [];
  }
}

/**
 * 색상 유틸리티 함수들
 */
export class ColorUtils {
  /**
   * HSL을 RGB로 변환
   */
  static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  /**
   * RGB를 HSL로 변환
   */
  static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      
      h /= 6;
    }
    
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }
  
  /**
   * 홀로그래픽 효과를 위한 무지개 색상 생성
   */
  static generateRainbowColors(steps: number = 7): string[] {
    const colors: string[] = [];
    
    for (let i = 0; i < steps; i++) {
      const hue = (i / steps) * 360;
      const [r, g, b] = this.hslToRgb(hue, 100, 50);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  }
  
  /**
   * KBO 구단 색상 팔레트 생성
   */
  static getTeamColorPalette(team: string): { primary: string; secondary: string; accent: string } {
    const palettes: Record<string, { primary: string; secondary: string; accent: string }> = {
      lg: { primary: '#c41e3a', secondary: '#ff69b4', accent: '#ffffff' },
      doosan: { primary: '#131230', secondary: '#4169e1', accent: '#87ceeb' },
      kt: { primary: '#000000', secondary: '#ff0000', accent: '#ffffff' },
      samsung: { primary: '#074ca1', secondary: '#87ceeb', accent: '#ffffff' },
      lotte: { primary: '#041e42', secondary: '#c41e3a', accent: '#ffffff' },
      kia: { primary: '#ea002c', secondary: '#000000', accent: '#ffd700' },
      nc: { primary: '#315288', secondary: '#c4a484', accent: '#ffffff' },
      hanwha: { primary: '#ff6600', secondary: '#000000', accent: '#ffffff' },
      ssg: { primary: '#ce0e2d', secondary: '#ffd700', accent: '#ffffff' },
      kiwoom: { primary: '#570514', secondary: '#ffd700', accent: '#ffffff' }
    };
    
    return palettes[team] || palettes.lg;
  }
}

/**
 * 수학 유틸리티 함수들
 */
export class MathUtils {
  /**
   * 값을 범위 내로 제한
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * 선형 보간
   */
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }
  
  /**
   * 값을 한 범위에서 다른 범위로 매핑
   */
  static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
  
  /**
   * 부드러운 단계 함수 (smoothstep)
   */
  static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }
  
  /**
   * 이징 함수들
   */
  static easing = {
    // Apple 스타일 이징
    appleSmooth: (t: number) => t * t * (3 - 2 * t),
    appleSpring: (t: number) => 1 - Math.pow(1 - t, 3),
    appleBounce: (t: number) => {
      if (t < 1/2.75) {
        return 7.5625 * t * t;
      } else if (t < 2/2.75) {
        return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
      } else if (t < 2.5/2.75) {
        return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
      }
    },
    
    // 표준 이징
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number) => t * (2 - t),
    easeIn: (t: number) => t * t
  };
  
  /**
   * 각도를 라디안으로 변환
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * 라디안을 각도로 변환
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }
  
  /**
   * 두 점 사이의 거리 계산
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 두 점 사이의 각도 계산
   */
  static angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }
}

/**
 * DOM 유틸리티 함수들
 */
export class DOMUtils {
  /**
   * 요소가 뷰포트에 보이는지 확인
   */
  static isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * 요소의 중심점 계산
   */
  static getElementCenter(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }
  
  /**
   * 마우스 위치를 요소 내 상대 좌표로 변환
   */
  static getRelativeMousePosition(
    event: MouseEvent | Touch, 
    element: HTMLElement
  ): { x: number; y: number; normalizedX: number; normalizedY: number } {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    return {
      x,
      y,
      normalizedX: MathUtils.clamp(x / rect.width, 0, 1),
      normalizedY: MathUtils.clamp(y / rect.height, 0, 1)
    };
  }
  
  /**
   * CSS 변수 설정
   */
  static setCSSVariable(element: HTMLElement, name: string, value: string): void {
    element.style.setProperty(name, value);
  }
  
  /**
   * 여러 CSS 변수 일괄 설정
   */
  static setCSSVariables(element: HTMLElement, variables: Record<string, string>): void {
    Object.entries(variables).forEach(([name, value]) => {
      element.style.setProperty(name, value);
    });
  }
}

/**
 * 애니메이션 유틸리티
 */
export class AnimationUtils {
  /**
   * requestAnimationFrame을 Promise로 래핑 (SSR 안전)
   */
  static nextFrame(): Promise<number> {
    if (typeof requestAnimationFrame === 'undefined') {
      return Promise.resolve(0);
    }
    
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  }
  
  /**
   * 지연 실행
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  
  /**
   * 애니메이션 시퀀스 실행
   */
  static async sequence(animations: Array<() => Promise<void>>): Promise<void> {
    for (const animation of animations) {
      await animation();
    }
  }
  
  /**
   * 병렬 애니메이션 실행
   */
  static parallel(animations: Array<() => Promise<void>>): Promise<void[]> {
    return Promise.all(animations.map(animation => animation()));
  }
}

/**
 * 전역 성능 모니터 인스턴스 (SSR 안전)
 */
export const globalPerformanceMonitor = typeof window !== 'undefined' 
  ? new PerformanceMonitor() 
  : null as any as PerformanceMonitor;

/**
 * 전역 디바이스 성능 정보 (SSR 안전)
 */
export const deviceCapabilities = detectDeviceCapabilities();