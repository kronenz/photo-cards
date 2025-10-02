/**
 * 홀로그래픽 효과 라이브러리 메인 엔트리 포인트
 * KBO 홀로그래픽 카드 커뮤니티 - 60fps 보장 프리미엄 효과 시스템
 */

// 메인 엔진 및 컴포넌트 import/export
import { 
  HolographicEngine, 
  createHolographicEngine, 
  createOptimizedHolographicEngine,
  SPRING_PRESETS,
  KBO_TEAM_CONFIGS
} from './HolographicEngine.js';
export { HolographicEngine, createHolographicEngine, createOptimizedHolographicEngine, SPRING_PRESETS, KBO_TEAM_CONFIGS };
export type { HolographicType, HolographicParams, PointerPosition, CardPhysics, SpringConfig } from './HolographicEngine.js';

// 유틸리티 함수들 import/export
import { 
  detectDeviceCapabilities, 
  optimizeHolographicParams,
  PerformanceMonitor,
  ColorUtils,
  MathUtils,
  DOMUtils,
  AnimationUtils,
  globalPerformanceMonitor,
  deviceCapabilities
} from './utils.js';
export { 
  detectDeviceCapabilities, 
  optimizeHolographicParams,
  PerformanceMonitor,
  ColorUtils,
  MathUtils,
  DOMUtils,
  AnimationUtils,
  globalPerformanceMonitor,
  deviceCapabilities
};
export type { DeviceCapabilities } from './utils.js';

// Svelte 컴포넌트 export
export { default as HolographicCard } from './HolographicCard.svelte';

/**
 * 홀로그래픽 라이브러리 버전
 */
export const VERSION = '1.0.0';

/**
 * 지원되는 홀로그래픽 효과 타입들
 */
export const HOLOGRAPHIC_TYPES = [
  'basic', 'cosmic', 'rainbow', 'aurora', 'secret', 'galaxy',
  'lg', 'doosan', 'kt', 'samsung', 'lotte', 'kia', 'nc', 'hanwha', 'ssg', 'kiwoom'
] as const;

/**
 * KBO 구단 정보
 */
export const KBO_TEAMS = [
  { id: 'lg', name: 'LG 트윈스', color: '#c41e3a', accent: '#ff69b4' },
  { id: 'doosan', name: '두산 베어스', color: '#131230', accent: '#4169e1' },
  { id: 'kt', name: 'KT 위즈', color: '#000000', accent: '#ff0000' },
  { id: 'samsung', name: '삼성 라이온즈', color: '#074ca1', accent: '#87ceeb' },
  { id: 'lotte', name: '롯데 자이언츠', color: '#041e42', accent: '#c41e3a' },
  { id: 'kia', name: 'KIA 타이거즈', color: '#ea002c', accent: '#000000' },
  { id: 'nc', name: 'NC 다이노스', color: '#315288', accent: '#c4a484' },
  { id: 'hanwha', name: '한화 이글스', color: '#ff6600', accent: '#000000' },
  { id: 'ssg', name: 'SSG 랜더스', color: '#ce0e2d', accent: '#ffd700' },
  { id: 'kiwoom', name: '키움 히어로즈', color: '#570514', accent: '#ffd700' }
] as const;

/**
 * 라이브러리 초기화 함수
 * 전역 설정 및 성능 모니터링 시작
 */
export function initializeHolographicLibrary(options?: {
  enablePerformanceMonitoring?: boolean;
  autoOptimize?: boolean;
  debugMode?: boolean;
}) {
  const {
    enablePerformanceMonitoring = true,
    autoOptimize = true,
    debugMode = false
  } = options || {};
  
  if (debugMode) {
    console.log('🌟 KBO 홀로그래픽 카드 라이브러리 초기화');
    console.log('📊 디바이스 성능:', deviceCapabilities);
  }
  
  // 성능 모니터링 시작 (클라이언트에서만)
  if (enablePerformanceMonitoring && globalPerformanceMonitor) {
    globalPerformanceMonitor.subscribe((fps: number, frameTime: number) => {
      if (debugMode && fps < 50) {
        console.warn(`⚠️ 성능 경고: FPS ${fps}, 프레임 시간 ${frameTime}ms`);
      }
    });
  }
  
  // CSS 변수 초기화
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--holographic-library-version', `"${VERSION}"`);
    
    if (autoOptimize && !deviceCapabilities.isHighPerformance) {
      document.documentElement.classList.add('holographic-optimized');
      if (debugMode) {
        console.log('🔧 저성능 디바이스 감지: 자동 최적화 모드 활성화');
      }
    }
  }
  
  return {
    version: VERSION,
    deviceCapabilities,
    performanceMonitor: globalPerformanceMonitor
  };
}

/**
 * 라이브러리 정리 함수
 */
export function destroyHolographicLibrary() {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.destroy();
  }
  
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('holographic-optimized');
  }
}

/**
 * 홀로그래픽 효과 유틸리티 함수들
 */
export const HolographicUtils = {
  /**
   * 홀로그래픽 타입이 KBO 구단인지 확인
   */
  isKBOTeam: (type: string): boolean => {
    return KBO_TEAMS.some(team => team.id === type);
  },
  
  /**
   * KBO 구단 정보 가져오기
   */
  getKBOTeamInfo: (teamId: string) => {
    return KBO_TEAMS.find(team => team.id === teamId);
  },
  
  /**
   * 홀로그래픽 타입 유효성 검사
   */
  isValidHolographicType: (type: string): boolean => {
    return HOLOGRAPHIC_TYPES.includes(type as any);
  },
  
  /**
   * 랜덤 홀로그래픽 타입 생성
   */
  getRandomHolographicType: (): string => {
    const randomIndex = Math.floor(Math.random() * HOLOGRAPHIC_TYPES.length);
    return HOLOGRAPHIC_TYPES[randomIndex];
  },
  
  /**
   * 랜덤 KBO 구단 선택
   */
  getRandomKBOTeam: () => {
    const randomIndex = Math.floor(Math.random() * KBO_TEAMS.length);
    return KBO_TEAMS[randomIndex];
  }
};

// 기본 export
export default {
  VERSION,
  HOLOGRAPHIC_TYPES,
  KBO_TEAMS,
  HolographicEngine,
  createHolographicEngine,
  createOptimizedHolographicEngine,
  HolographicUtils,
  initializeHolographicLibrary,
  destroyHolographicLibrary,
  deviceCapabilities,
  globalPerformanceMonitor
};