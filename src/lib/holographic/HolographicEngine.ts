/**
 * KBO 홀로그래픽 카드 커뮤니티 - 60fps 보장 프리미엄 홀로그래픽 엔진
 * Apple 수준의 부드러운 애니메이션과 GPU 가속을 활용한 홀로그래픽 효과 시스템
 */

import { spring } from 'svelte/motion';
import type { Spring } from 'svelte/motion';
import { writable, derived, type Writable, type Readable } from 'svelte/store';

// 홀로그래픽 효과 타입 정의
export type HolographicType = 
  | 'basic' | 'cosmic' | 'rainbow' | 'aurora' | 'secret' | 'galaxy'
  | 'lg' | 'doosan' | 'kt' | 'samsung' | 'lotte' 
  | 'kia' | 'nc' | 'hanwha' | 'ssg' | 'kiwoom';

// 물리학 기반 Spring 설정 (Apple 스타일)
export interface SpringConfig {
  stiffness: number;
  damping: number;
  precision: number;
}

// 홀로그래픽 효과 매개변수
export interface HolographicParams {
  intensity: number;        // 효과 강도 (0-1)
  colorShift: number;       // 색상 변화 (0-360deg)
  reflectionAngle: number;  // 반사각 (0-360deg)
  animationSpeed: number;   // 애니메이션 속도 (0.1-3.0)
  brightness: number;       // 밝기 (0.5-2.0)
  saturation: number;       // 채도 (0.5-2.0)
  contrast: number;         // 대비 (0.5-2.0)
}

// 마우스/터치 포인터 위치
export interface PointerPosition {
  x: number;
  y: number;
  normalizedX: number;  // 0-1 범위
  normalizedY: number;  // 0-1 범위
}

// 카드 물리학 상태
export interface CardPhysics {
  rotateX: number;      // X축 회전 (-30 ~ 30deg)
  rotateY: number;      // Y축 회전 (-30 ~ 30deg)
  translateZ: number;   // Z축 이동 (0-20px)
  scale: number;        // 스케일 (0.95-1.05)
}

// Apple 스타일 Spring 설정 프리셋
export const SPRING_PRESETS: Record<string, SpringConfig> = {
  // Apple iOS 스타일 부드러운 스프링
  smooth: { stiffness: 0.15, damping: 0.8, precision: 0.01 },
  // Apple macOS 스타일 반응형 스프링
  responsive: { stiffness: 0.3, damping: 0.7, precision: 0.01 },
  // 홀로그래픽 전용 물리학
  holographic: { stiffness: 0.2, damping: 0.75, precision: 0.005 },
  // 빠른 반응 (버튼 등)
  quick: { stiffness: 0.4, damping: 0.6, precision: 0.01 },
  // 느린 부드러운 효과
  gentle: { stiffness: 0.1, damping: 0.9, precision: 0.01 }
};

// KBO 구단별 홀로그래픽 설정
export const KBO_TEAM_CONFIGS: Record<string, HolographicParams> = {
  lg: {
    intensity: 0.8,
    colorShift: 0,
    reflectionAngle: 45,
    animationSpeed: 1.2,
    brightness: 1.1,
    saturation: 1.3,
    contrast: 1.2
  },
  doosan: {
    intensity: 0.9,
    colorShift: 240,
    reflectionAngle: 60,
    animationSpeed: 1.0,
    brightness: 1.0,
    saturation: 1.4,
    contrast: 1.3
  },
  kt: {
    intensity: 1.0,
    colorShift: 0,
    reflectionAngle: 90,
    animationSpeed: 1.5,
    brightness: 1.2,
    saturation: 1.5,
    contrast: 1.4
  },
  samsung: {
    intensity: 0.7,
    colorShift: 210,
    reflectionAngle: 30,
    animationSpeed: 0.8,
    brightness: 1.0,
    saturation: 1.2,
    contrast: 1.1
  },
  lotte: {
    intensity: 0.8,
    colorShift: 15,
    reflectionAngle: 75,
    animationSpeed: 1.1,
    brightness: 1.1,
    saturation: 1.3,
    contrast: 1.2
  },
  kia: {
    intensity: 0.9,
    colorShift: 0,
    reflectionAngle: 45,
    animationSpeed: 1.3,
    brightness: 1.2,
    saturation: 1.4,
    contrast: 1.3
  },
  nc: {
    intensity: 0.7,
    colorShift: 200,
    reflectionAngle: 50,
    animationSpeed: 0.9,
    brightness: 1.0,
    saturation: 1.1,
    contrast: 1.1
  },
  hanwha: {
    intensity: 0.8,
    colorShift: 30,
    reflectionAngle: 60,
    animationSpeed: 1.2,
    brightness: 1.1,
    saturation: 1.3,
    contrast: 1.2
  },
  ssg: {
    intensity: 0.9,
    colorShift: 45,
    reflectionAngle: 45,
    animationSpeed: 1.1,
    brightness: 1.1,
    saturation: 1.3,
    contrast: 1.2
  },
  kiwoom: {
    intensity: 0.8,
    colorShift: 320,
    reflectionAngle: 70,
    animationSpeed: 1.0,
    brightness: 1.0,
    saturation: 1.2,
    contrast: 1.1
  }
};

/**
 * 60fps 보장 프리미엄 홀로그래픽 엔진
 * Apple 수준의 부드러운 물리학 기반 인터랙션 시스템
 */
export class HolographicEngine {
  private element: HTMLElement;
  private isActive = false;
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;
  
  // Svelte Spring 기반 물리학 시스템
  private pointerSpring: Spring<PointerPosition>;
  private physicsSpring: Spring<CardPhysics>;
  private paramsSpring: Spring<HolographicParams>;
  
  // 반응형 스토어
  public pointer: Writable<PointerPosition>;
  public physics: Writable<CardPhysics>;
  public params: Writable<HolographicParams>;
  public performance: Writable<{ fps: number; frameTime: number }>;
  
  // CSS 변수 스토어 (자동 업데이트)
  public cssVars: Readable<Record<string, string>>;
  
  constructor(
    element: HTMLElement,
    type: HolographicType = 'basic',
    springConfig: SpringConfig = SPRING_PRESETS.holographic
  ) {
    this.element = element;
    
    // 초기 상태 설정
    const initialPointer: PointerPosition = { x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 };
    const initialPhysics: CardPhysics = { rotateX: 0, rotateY: 0, translateZ: 0, scale: 1 };
    const initialParams = this.getTypeConfig(type);
    
    // Svelte Spring 초기화 (Apple 스타일 물리학)
    this.pointerSpring = spring(initialPointer, springConfig);
    this.physicsSpring = spring(initialPhysics, springConfig);
    this.paramsSpring = spring(initialParams, SPRING_PRESETS.gentle);
    
    // 반응형 스토어 생성
    this.pointer = writable(initialPointer);
    this.physics = writable(initialPhysics);
    this.params = writable(initialParams);
    this.performance = writable({ fps: 60, frameTime: 16.67 });
    
    // CSS 변수 자동 업데이트 스토어
    this.cssVars = derived(
      [this.pointer, this.physics, this.params],
      ([pointer, physics, params]) => this.generateCSSVars(pointer, physics, params)
    );
    
    // 스프링 값을 스토어에 연결
    this.pointerSpring.subscribe(value => this.pointer.set(value));
    this.physicsSpring.subscribe(value => this.physics.set(value));
    this.paramsSpring.subscribe(value => this.params.set(value));
    
    // CSS 변수 자동 적용
    this.cssVars.subscribe(vars => this.applyCSSVars(vars));
    
    this.init();
  }
  
  /**
   * 홀로그래픽 엔진 초기화
   */
  private init(): void {
    // GPU 가속 활성화
    this.element.style.transform = 'translateZ(0)';
    this.element.style.willChange = 'transform, filter';
    this.element.style.backfaceVisibility = 'hidden';
    this.element.style.perspective = '1000px';
    
    // 이벤트 리스너 등록
    this.bindEvents();
    
    // 성능 모니터링 시작
    this.startPerformanceMonitoring();
  }
  
  /**
   * 이벤트 리스너 바인딩
   */
  private bindEvents(): void {
    // 마우스 이벤트
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    
    // 터치 이벤트 (모바일)
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // 포커스 이벤트 (접근성)
    this.element.addEventListener('focus', this.handleFocus.bind(this));
    this.element.addEventListener('blur', this.handleBlur.bind(this));
    
    // 리사이즈 이벤트
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * 홀로그래픽 타입별 설정 가져오기
   */
  private getTypeConfig(type: HolographicType): HolographicParams {
    // KBO 구단별 설정
    if (type in KBO_TEAM_CONFIGS) {
      return { ...KBO_TEAM_CONFIGS[type] };
    }
    
    // 기본 홀로그래픽 효과 설정
    const baseConfigs: Record<string, HolographicParams> = {
      basic: {
        intensity: 0.6,
        colorShift: 0,
        reflectionAngle: 45,
        animationSpeed: 1.0,
        brightness: 1.0,
        saturation: 1.2,
        contrast: 1.1
      },
      cosmic: {
        intensity: 0.8,
        colorShift: 120,
        reflectionAngle: 60,
        animationSpeed: 1.5,
        brightness: 1.1,
        saturation: 1.4,
        contrast: 1.2
      },
      rainbow: {
        intensity: 1.0,
        colorShift: 0,
        reflectionAngle: 90,
        animationSpeed: 2.0,
        brightness: 1.2,
        saturation: 1.6,
        contrast: 1.3
      },
      aurora: {
        intensity: 0.7,
        colorShift: 180,
        reflectionAngle: 30,
        animationSpeed: 0.8,
        brightness: 1.0,
        saturation: 1.1,
        contrast: 1.0
      },
      secret: {
        intensity: 0.9,
        colorShift: 45,
        reflectionAngle: 45,
        animationSpeed: 1.2,
        brightness: 1.3,
        saturation: 1.5,
        contrast: 1.4
      },
      galaxy: {
        intensity: 0.8,
        colorShift: 270,
        reflectionAngle: 75,
        animationSpeed: 0.6,
        brightness: 1.0,
        saturation: 1.3,
        contrast: 1.2
      }
    };
    
    return baseConfigs[type] || baseConfigs.basic;
  }
  
  /**
   * CSS 변수 생성
   */
  private generateCSSVars(
    pointer: PointerPosition,
    physics: CardPhysics,
    params: HolographicParams
  ): Record<string, string> {
    return {
      '--pointer-x': `${pointer.normalizedX * 100}%`,
      '--pointer-y': `${pointer.normalizedY * 100}%`,
      '--pointer-from-center-x': `${(pointer.normalizedX - 0.5) * 100}%`,
      '--pointer-from-center-y': `${(pointer.normalizedY - 0.5) * 100}%`,
      '--rotate-x': `${physics.rotateX}deg`,
      '--rotate-y': `${physics.rotateY}deg`,
      '--translate-z': `${physics.translateZ}px`,
      '--scale': `${physics.scale}`,
      '--holographic-intensity': `${params.intensity}`,
      '--holographic-hue': `${params.colorShift}deg`,
      '--holographic-brightness': `${params.brightness}`,
      '--holographic-saturation': `${params.saturation}`,
      '--holographic-contrast': `${params.contrast}`,
      '--reflection-angle': `${params.reflectionAngle}deg`,
      '--animation-speed': `${params.animationSpeed}s`
    };
  }
  
  /**
   * CSS 변수 적용
   */
  private applyCSSVars(vars: Record<string, string>): void {
    Object.entries(vars).forEach(([key, value]) => {
      this.element.style.setProperty(key, value);
    });
  }
  
  /**
   * 마우스 진입 이벤트
   */
  private handleMouseEnter(event: MouseEvent): void {
    this.isActive = true;
    this.element.classList.add('holographic-active');
    this.updatePointer(event.clientX, event.clientY);
  }
  
  /**
   * 마우스 이동 이벤트
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isActive) return;
    this.updatePointer(event.clientX, event.clientY);
  }
  
  /**
   * 마우스 이탈 이벤트
   */
  private handleMouseLeave(): void {
    this.isActive = false;
    this.element.classList.remove('holographic-active');
    this.resetToCenter();
  }
  
  /**
   * 터치 시작 이벤트
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.isActive = true;
      this.element.classList.add('holographic-active');
      const touch = event.touches[0];
      this.updatePointer(touch.clientX, touch.clientY);
    }
  }
  
  /**
   * 터치 이동 이벤트
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.isActive || event.touches.length === 0) return;
    const touch = event.touches[0];
    this.updatePointer(touch.clientX, touch.clientY);
  }
  
  /**
   * 터치 종료 이벤트
   */
  private handleTouchEnd(): void {
    this.isActive = false;
    this.element.classList.remove('holographic-active');
    this.resetToCenter();
  }
  
  /**
   * 포커스 이벤트 (접근성)
   */
  private handleFocus(): void {
    this.isActive = true;
    this.element.classList.add('holographic-active');
    // 포커스 시 중앙에서 약간의 효과
    this.updatePointer(
      this.element.offsetLeft + this.element.offsetWidth * 0.6,
      this.element.offsetTop + this.element.offsetHeight * 0.4
    );
  }
  
  /**
   * 블러 이벤트 (접근성)
   */
  private handleBlur(): void {
    this.isActive = false;
    this.element.classList.remove('holographic-active');
    this.resetToCenter();
  }
  
  /**
   * 리사이즈 이벤트
   */
  private handleResize(): void {
    // 리사이즈 시 중앙으로 리셋
    this.resetToCenter();
  }
  
  /**
   * 포인터 위치 업데이트
   */
  private updatePointer(clientX: number, clientY: number): void {
    const rect = this.element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const normalizedX = Math.max(0, Math.min(1, x / rect.width));
    const normalizedY = Math.max(0, Math.min(1, y / rect.height));
    
    // Spring을 통한 부드러운 업데이트
    this.pointerSpring.set({
      x,
      y,
      normalizedX,
      normalizedY
    });
    
    // 물리학 계산 업데이트
    this.updatePhysics(normalizedX, normalizedY);
  }
  
  /**
   * 카드 물리학 업데이트
   */
  private updatePhysics(normalizedX: number, normalizedY: number): void {
    // Apple 스타일 자연스러운 3D 회전 계산
    const centerX = normalizedX - 0.5;
    const centerY = normalizedY - 0.5;
    
    // 회전각 계산 (최대 ±15도)
    const rotateY = centerX * 30;  // 좌우 회전
    const rotateX = -centerY * 15; // 상하 회전 (반전)
    
    // 리프팅 효과 (마우스에 가까울수록 들어올림)
    const distance = Math.sqrt(centerX * centerX + centerY * centerY);
    const translateZ = Math.max(0, (0.5 - distance) * 20);
    
    // 스케일 효과 (미묘한 확대)
    const scale = 1 + (0.5 - distance) * 0.05;
    
    this.physicsSpring.set({
      rotateX,
      rotateY,
      translateZ,
      scale: Math.max(0.95, Math.min(1.05, scale))
    });
  }
  
  /**
   * 중앙으로 리셋
   */
  private resetToCenter(): void {
    this.pointerSpring.set({
      x: this.element.offsetWidth / 2,
      y: this.element.offsetHeight / 2,
      normalizedX: 0.5,
      normalizedY: 0.5
    });
    
    this.physicsSpring.set({
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      scale: 1
    });
  }
  
  /**
   * 홀로그래픽 타입 변경
   */
  public setType(type: HolographicType): void {
    const newParams = this.getTypeConfig(type);
    this.paramsSpring.set(newParams);
    
    // CSS 클래스 업데이트
    this.element.className = this.element.className.replace(/holographic-\w+/g, '');
    this.element.classList.add(`holographic-${type}`);
  }
  
  /**
   * 매개변수 업데이트
   */
  public updateParams(params: Partial<HolographicParams>): void {
    this.params.update(current => ({ ...current, ...params }));
  }
  
  /**
   * 성능 모니터링 시작
   */
  private startPerformanceMonitoring(): void {
    const monitor = () => {
      const now = performance.now();
      const deltaTime = now - this.lastFrameTime;
      
      if (deltaTime >= 16.67) { // 60fps 기준
        this.frameCount++;
        this.fps = 1000 / deltaTime;
        
        // 성능 정보 업데이트
        this.performance.set({
          fps: Math.round(this.fps),
          frameTime: Math.round(deltaTime * 100) / 100
        });
        
        this.lastFrameTime = now;
      }
      
      this.rafId = requestAnimationFrame(monitor);
    };
    
    monitor();
  }
  
  /**
   * 엔진 정리
   */
  public destroy(): void {
    // 애니메이션 프레임 취소
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // 이벤트 리스너 제거
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('focus', this.handleFocus);
    this.element.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);
    
    // CSS 정리
    this.element.style.willChange = 'auto';
    this.element.classList.remove('holographic-active');
    
    // 상태 리셋
    this.isActive = false;
  }
}

/**
 * 홀로그래픽 엔진 팩토리 함수
 */
export function createHolographicEngine(
  element: HTMLElement,
  type: HolographicType = 'basic',
  springConfig?: SpringConfig
): HolographicEngine {
  return new HolographicEngine(element, type, springConfig);
}

/**
 * 성능 최적화된 홀로그래픽 엔진 (저사양 기기용)
 */
export function createOptimizedHolographicEngine(
  element: HTMLElement,
  type: HolographicType = 'basic'
): HolographicEngine {
  const optimizedConfig: SpringConfig = {
    stiffness: 0.1,
    damping: 0.9,
    precision: 0.02
  };
  
  return new HolographicEngine(element, type, optimizedConfig);
}