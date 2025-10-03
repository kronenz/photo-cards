# Design Document

## Overview

현재 /test 페이지의 포켓몬 카드 예제에서 발생하는 두 가지 주요 문제를 해결하는 향상된 카드 인터랙션 시스템을 설계합니다:

1. **홀로그래픽 효과 개선**: 마우스 오버시 이미지가 사라지는 문제 해결
2. **카드 뒤집기 기능**: 클릭시 Y축 회전으로 뒷면을 보여주는 3D 애니메이션 추가

이 시스템은 기존의 홀로그래픽 효과를 유지하면서 더 나은 사용자 경험을 제공합니다.

## Architecture

### 컴포넌트 구조

```
EnhancedCard
├── CardContainer (3D perspective wrapper)
├── CardInner (flip container)
│   ├── CardFront (기존 홀로그래픽 카드)
│   │   ├── CardImage (원본 이미지)
│   │   ├── HolographicLayer (개선된 홀로그래픽 효과)
│   │   └── SparkleLayer (반짝임 효과)
│   └── CardBack (뒷면 디자인)
│       ├── BackgroundPattern (구단/타입별 뒷면)
│       └── HolographicLayer (뒷면용 홀로그래픽 효과)
└── InteractionManager (이벤트 처리)
```

### 상태 관리

```typescript
interface CardState {
  isFlipped: boolean;
  isHovering: boolean;
  isAnimating: boolean;
  holographicIntensity: number;
  mousePosition: { x: number; y: number };
}
```

## Components and Interfaces

### 1. EnhancedCard 컴포넌트

**Props Interface:**
```typescript
interface EnhancedCardProps {
  frontImage: string;
  backImage?: string;
  cardType: 'pokemon' | 'kbo' | 'custom';
  teamOrType?: string;
  holographicStyle: 'basic' | 'cosmic' | 'rainbow' | 'aurora' | 'secret' | 'galaxy';
  enableFlip?: boolean;
  animationSpeed?: number;
}
```

**주요 기능:**
- 3D 카드 뒤집기 애니메이션
- 개선된 홀로그래픽 효과
- 터치/마우스 이벤트 통합 처리
- 반응형 디자인 지원

### 2. HolographicEffectManager

**개선된 홀로그래픽 효과 처리:**

```typescript
class HolographicEffectManager {
  // 이미지 가시성을 유지하는 개선된 블렌드 모드
  private improvedBlendMode = 'overlay'; // color-dodge 대신 사용
  
  // 마우스 위치 기반 효과 계산
  calculateHolographicEffect(mousePos: MousePosition, cardBounds: DOMRect): HolographicEffect;
  
  // 애니메이션 중 효과 조정
  adjustEffectDuringAnimation(animationProgress: number): void;
  
  // 뒷면용 홀로그래픽 효과
  applyBacksideEffect(cardElement: HTMLElement): void;
}
```

### 3. FlipAnimationController

**카드 뒤집기 애니메이션 관리:**

```typescript
class FlipAnimationController {
  private flipDuration = 600; // ms
  private flipEasing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
  
  // Y축 회전 애니메이션
  flipCard(direction: 'front-to-back' | 'back-to-front'): Promise<void>;
  
  // 애니메이션 중 상태 관리
  handleAnimationState(isAnimating: boolean): void;
  
  // 중복 클릭 방지
  preventDoubleClick(): boolean;
}
```

### 4. TouchInteractionHandler

**터치 및 마우스 이벤트 통합 처리:**

```typescript
class TouchInteractionHandler {
  // 터치/마우스 이벤트 통합
  handlePointerMove(event: PointerEvent): void;
  handlePointerDown(event: PointerEvent): void;
  handlePointerUp(event: PointerEvent): void;
  
  // 중복 이벤트 방지
  preventEventDuplication(): void;
  
  // 제스처 인식
  detectTapGesture(): boolean;
  detectHoverGesture(): boolean;
}
```

## Data Models

### CardConfiguration

```typescript
interface CardConfiguration {
  id: string;
  type: CardType;
  frontImage: string;
  backImage: string;
  holographicConfig: HolographicConfig;
  flipConfig: FlipConfig;
  touchConfig: TouchConfig;
}

interface HolographicConfig {
  style: HolographicStyle;
  intensity: number;
  blendMode: 'overlay' | 'soft-light' | 'multiply';
  preserveImageVisibility: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

interface FlipConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  axis: 'x' | 'y' | 'z';
  perspective: number;
}

interface TouchConfig {
  enableTouch: boolean;
  tapToFlip: boolean;
  touchToHover: boolean;
  preventDoubleTouch: boolean;
}
```

### CardBackDesigns

```typescript
interface CardBackDesign {
  type: 'pokemon' | 'kbo' | 'custom';
  teamOrCategory: string;
  backgroundImage: string;
  pattern: BackgroundPattern;
  holographicOverlay: HolographicConfig;
}

interface BackgroundPattern {
  type: 'gradient' | 'texture' | 'logo' | 'pattern';
  colors: string[];
  opacity: number;
  blendMode: string;
}
```

## Error Handling

### 1. 애니메이션 오류 처리

```typescript
class AnimationErrorHandler {
  // CSS 애니메이션 지원 확인
  checkAnimationSupport(): boolean;
  
  // 애니메이션 실패 시 폴백
  handleAnimationFailure(): void;
  
  // 성능 저하 시 효과 감소
  handlePerformanceIssues(): void;
}
```

### 2. 터치 이벤트 오류 처리

```typescript
class TouchErrorHandler {
  // 터치 이벤트 지원 확인
  checkTouchSupport(): boolean;
  
  // 이벤트 중복 발생 처리
  handleEventDuplication(): void;
  
  // 제스처 인식 실패 처리
  handleGestureFailure(): void;
}
```

### 3. 이미지 로딩 오류 처리

```typescript
class ImageErrorHandler {
  // 이미지 로딩 실패 시 폴백
  handleImageLoadError(imageSrc: string): string;
  
  // 뒷면 이미지 없을 시 기본값
  getDefaultBackImage(cardType: CardType): string;
  
  // 이미지 최적화
  optimizeImageForPerformance(imageSrc: string): string;
}
```

## Testing Strategy

### 1. 단위 테스트

**HolographicEffectManager 테스트:**
- 마우스 위치 계산 정확성
- 블렌드 모드 적용 확인
- 이미지 가시성 유지 검증

**FlipAnimationController 테스트:**
- 애니메이션 타이밍 정확성
- 상태 전환 검증
- 중복 클릭 방지 확인

### 2. 통합 테스트

**카드 인터랙션 플로우:**
```typescript
describe('Enhanced Card Interaction', () => {
  test('hover -> holographic effect without image loss', async () => {
    // 마우스 오버 시 홀로그래픽 효과 활성화
    // 원본 이미지 가시성 유지 확인
  });
  
  test('click -> flip animation -> back side display', async () => {
    // 클릭 시 뒤집기 애니메이션 실행
    // 뒷면 표시 확인
    // 다시 클릭 시 앞면 복원 확인
  });
  
  test('hover during flip animation', async () => {
    // 애니메이션 중 마우스 오버 처리
    // 애니메이션 완료 후 홀로그래픽 효과 적용
  });
});
```

### 3. 성능 테스트

**애니메이션 성능:**
- 60fps 유지 확인
- 메모리 사용량 모니터링
- 배터리 소모 최적화

**모바일 성능:**
- 터치 반응성 테스트
- 저사양 기기 호환성
- 배터리 효율성

### 4. 크로스 브라우저 테스트

**브라우저별 호환성:**
- Chrome/Safari: WebKit 최적화
- Firefox: Gecko 엔진 호환성
- Edge: Chromium 기반 최적화
- 모바일 브라우저: 터치 이벤트 처리

### 5. 접근성 테스트

**접근성 준수:**
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 고대비 모드 지원
- 애니메이션 감소 설정 준수

## Implementation Details

### CSS 개선사항

**홀로그래픽 효과 개선:**
```css
/* 이미지 가시성을 유지하는 개선된 블렌드 모드 */
.enhanced-card:before {
  mix-blend-mode: overlay; /* color-dodge 대신 */
  opacity: 0.6; /* 투명도 조정 */
  filter: brightness(0.8) contrast(1.2); /* 대비 개선 */
}

.enhanced-card:after {
  mix-blend-mode: soft-light; /* 부드러운 효과 */
  opacity: 0.8;
  filter: brightness(1.1) saturate(1.3);
}
```

**3D 뒤집기 애니메이션:**
```css
.card-container {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.card-inner {
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-back {
  transform: rotateY(180deg);
  backface-visibility: hidden;
}
```

### JavaScript 핵심 로직

**이벤트 처리 최적화:**
```typescript
// 디바운싱된 마우스 이벤트 처리
const debouncedMouseMove = debounce((e: MouseEvent) => {
  updateHolographicEffect(e);
}, 16); // 60fps

// 터치와 마우스 이벤트 통합
const handlePointerEvent = (e: PointerEvent) => {
  if (e.pointerType === 'touch') {
    handleTouchInteraction(e);
  } else {
    handleMouseInteraction(e);
  }
};
```

이 설계는 기존 홀로그래픽 효과의 장점을 유지하면서 사용자가 요청한 개선사항을 모두 포함합니다. 특히 이미지 가시성 문제와 카드 뒤집기 기능을 중점적으로 해결하도록 설계되었습니다.