# 스크롤 애니메이션 가이드

SSGOI에서 영감을 받은 스크롤 기반 애니메이션 시스템

---

## 🎯 개요

이 프로젝트는 **Intersection Observer API**를 활용하여 스크롤 위치에 따라 요소가 부드럽게 나타나는 애니메이션을 구현합니다. SSGOI 라이브러리의 철학을 따라 자연스럽고 세련된 사용자 경험을 제공합니다.

### 주요 특징

✅ **성능 최적화**: Intersection Observer 사용으로 효율적인 스크롤 감지
✅ **Apple 스타일**: 부드러운 cubic-bezier 이징으로 프리미엄 느낌
✅ **유연한 옵션**: 딜레이, 속도, threshold 등 세밀한 제어
✅ **원샷 애니메이션**: 기본적으로 한 번만 실행 (성능 향상)
✅ **다양한 전환**: Fade, Scale, Blur, 방향별 Slide

---

## 📦 설치 및 사용

### 1. Import

```svelte
<script>
  import {
    scrollFadeUp,
    scrollFadeLeft,
    scrollFadeRight,
    scrollScale,
    scrollBlur
  } from '$lib/transitions/scroll-animations';
</script>
```

### 2. 기본 사용법

```svelte
<!-- Fade up on scroll -->
<div use:scrollFadeUp>
  <h2>제목이 아래에서 올라옵니다</h2>
</div>

<!-- Scale on scroll -->
<div use:scrollScale>
  <p>커지면서 나타납니다</p>
</div>

<!-- Blur fade on scroll -->
<div use:scrollBlur>
  <img src="..." alt="..." />
</div>
```

### 3. 옵션 설정

```svelte
<!-- 커스텀 duration과 delay -->
<div use:scrollFadeUp={{ duration: 800, delay: 200 }}>
  <h2>더 천천히 나타납니다</h2>
</div>

<!-- Threshold 조정 (요소가 얼마나 보일 때 트리거) -->
<div use:scrollScale={{ threshold: 0.3 }}>
  <p>요소의 30%가 보이면 애니메이션 시작</p>
</div>

<!-- 반복 애니메이션 (스크롤할 때마다) -->
<div use:scrollFadeLeft={{ once: false }}>
  <p>스크롤할 때마다 다시 애니메이션</p>
</div>
```

---

## 🎨 애니메이션 종류

### 1. `scrollFadeUp`

아래에서 위로 페이드 인

```svelte
<div use:scrollFadeUp>
  <h1>제목</h1>
</div>
```

**효과**: `opacity: 0 → 1`, `translateY(30px) → translateY(0)`

**용도**: 제목, 섹션 헤더, 텍스트 블록

---

### 2. `scrollFadeLeft`

오른쪽에서 왼쪽으로 슬라이드

```svelte
<div use:scrollFadeLeft>
  <div class="card">...</div>
</div>
```

**효과**: `opacity: 0 → 1`, `translateX(-30px) → translateX(0)`

**용도**: 카드, 리스트 아이템, 사이드바 콘텐츠

---

### 3. `scrollFadeRight`

왼쪽에서 오른쪽으로 슬라이드

```svelte
<div use:scrollFadeRight>
  <div class="image">...</div>
</div>
```

**효과**: `opacity: 0 → 1`, `translateX(30px) → translateX(0)`

**용도**: 이미지, 오른쪽 정렬 콘텐츠

---

### 4. `scrollScale`

작게 시작해서 원래 크기로

```svelte
<div use:scrollScale>
  <img src="..." alt="..." />
</div>
```

**효과**: `opacity: 0 → 1`, `scale(0.9) → scale(1)`

**용도**: 이미지, 카드, 아이콘, 중요한 요소

---

### 5. `scrollBlur`

블러와 함께 페이드 인

```svelte
<div use:scrollBlur>
  <div class="feature">...</div>
</div>
```

**효과**: `opacity: 0 → 1`, `blur(10px) → blur(0)`, `translateY(20px) → translateY(0)`

**용도**: 프리미엄 효과가 필요한 콘텐츠, 갤러리, 피처

---

## ⚙️ 옵션 상세

### `ScrollAnimationOptions`

```typescript
interface ScrollAnimationOptions {
  threshold?: number;      // 0.0 ~ 1.0, 요소가 얼마나 보일 때 트리거
  rootMargin?: string;     // CSS margin 형식, 감지 영역 조정
  once?: boolean;          // true: 한 번만, false: 반복
  delay?: number;          // ms, 애니메이션 지연
  duration?: number;       // ms, 애니메이션 속도
}
```

### 기본값

```typescript
{
  threshold: 0.1,                      // 10% 보이면 트리거
  rootMargin: '0px 0px -50px 0px',    // 하단 50px 여유
  once: true,                          // 한 번만 실행
  delay: 0,                            // 즉시 실행
  duration: 600                        // 600ms
}
```

---

## 📋 실전 예제

### 1. 섹션 헤더

```svelte
<section>
  <div class="section-header" use:scrollFadeUp={{ duration: 600 }}>
    <h2>나의 컬렉션</h2>
    <p>최근 획득한 카드</p>
  </div>
</section>
```

---

### 2. 카드 그리드 (Stagger)

```svelte
<div class="card-grid">
  {#each cards as card, i}
    <div use:scrollScale={{ duration: 500, delay: i * 100 }}>
      <Card {...card} />
    </div>
  {/each}
</div>
```

**효과**: 카드가 순차적으로 나타남 (100ms 간격)

---

### 3. 좌우 교차 레이아웃

```svelte
<div class="features">
  <div use:scrollFadeLeft>
    <Feature title="왼쪽" />
  </div>
  <div use:scrollFadeRight>
    <Feature title="오른쪽" />
  </div>
  <div use:scrollFadeLeft>
    <Feature title="왼쪽" />
  </div>
</div>
```

---

### 4. 프리미엄 갤러리

```svelte
<div class="gallery">
  {#each images as image, i}
    <div use:scrollBlur={{ duration: 800, delay: Math.min(i * 80, 400) }}>
      <img src={image} alt="" />
    </div>
  {/each}
</div>
```

**효과**: 블러 효과로 고급스러운 느낌, 최대 지연 400ms

---

### 5. CTA 섹션

```svelte
<section class="cta">
  <div use:scrollScale={{ duration: 800 }}>
    <h2>지금 시작하세요</h2>
    <button>시작하기</button>
  </div>
</section>
```

---

## 🎯 홈페이지 적용 예시

### 현재 프로젝트 적용 상황

#### 1. 대시보드 섹션
```svelte
<div class="section-header" use:scrollFadeUp={{ duration: 600 }}>
  <h2>나의 컬렉션 대시보드</h2>
</div>

<div class="dashboard-grid">
  {#each stats as stat, i}
    <div class="stat-card" use:scrollScale={{ duration: 500, delay: i * 100 }}>
      <!-- 통계 카드 -->
    </div>
  {/each}
</div>
```

#### 2. 컬렉션 그리드
```svelte
<div class="collections-grid">
  {#each collections as collection, i}
    <div use:scrollFadeLeft={{ duration: 600, delay: i * 100 }}>
      <CollectionStack {...collection} />
    </div>
  {/each}
</div>
```

#### 3. 커뮤니티 피드
```svelte
<div class="feed-filters" use:scrollScale={{ duration: 400 }}>
  <!-- 필터 버튼 -->
</div>

<div class="feed-grid">
  {#each posts as post, i}
    <div class="feed-card" use:scrollBlur={{ duration: 600, delay: Math.min(i * 50, 300) }}>
      <!-- 피드 카드 -->
    </div>
  {/each}
</div>
```

#### 4. 팀 선택
```svelte
<div class="team-selection-grid">
  {#each teams as team, i}
    <button use:scrollFadeUp={{ duration: 500, delay: i * 50 }}>
      <!-- 팀 카드 -->
    </button>
  {/each}
</div>
```

#### 5. 팀 쇼케이스
```svelte
<div class="teams-grid">
  {#each showcaseCards as card, i}
    <div use:scrollScale={{ duration: 600, delay: i * 80 }}>
      <UnifiedCard {...card} />
    </div>
  {/each}
</div>
```

#### 6. 기능 소개
```svelte
<div class="features-grid">
  {#each features as feature, i}
    <div class="feature-card" use:scrollFadeUp={{ duration: 600, delay: i * 80 }}>
      <!-- 기능 카드 -->
    </div>
  {/each}
</div>
```

---

## 🔧 커스터마이징

### 이징 함수 변경

현재 `cubic-bezier(0.33, 1, 0.68, 1)` 사용 (Apple 스타일)

다른 이징을 원하면 `scroll-animations.ts`에서 수정:

```typescript
node.style.transition = `opacity ${opts.duration}ms ease-out, ...`;
// 또는
node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), ...`;
```

### Threshold 조정 팁

```typescript
threshold: 0.0   // 요소가 조금만 보여도 트리거 (빠름)
threshold: 0.1   // 10% 보이면 트리거 (기본값)
threshold: 0.5   // 절반 보이면 트리거 (느림)
threshold: 1.0   // 완전히 보이면 트리거 (매우 느림)
```

### RootMargin 활용

```typescript
rootMargin: '0px'                    // 정확한 뷰포트
rootMargin: '0px 0px -50px 0px'      // 하단 50px 일찍 트리거 (기본값)
rootMargin: '-100px 0px'             // 상하단 100px 여유
rootMargin: '200px 0px -200px 0px'   // 미리 로드, 늦게 언로드
```

---

## 🎨 디자인 가이드라인

### 1. 애니메이션 지속 시간

```
- 작은 요소 (아이콘, 버튼): 300-400ms
- 중간 요소 (카드, 리스트): 500-600ms
- 큰 요소 (섹션, 이미지): 700-800ms
- 프리미엄 효과 (블러, 복잡한 전환): 800-1000ms
```

### 2. Stagger 딜레이

```
- 밀집된 그리드: 50-80ms
- 일반 리스트: 100-150ms
- 큰 요소: 150-200ms
```

### 3. 애니메이션 선택 가이드

| 콘텐츠 타입 | 추천 애니메이션 | 이유 |
|------------|---------------|------|
| 제목, 헤더 | `scrollFadeUp` | 자연스럽고 읽기 쉬움 |
| 카드 그리드 | `scrollScale` | 눈에 띄는 효과 |
| 리스트 | `scrollFadeLeft` | 순차적 흐름 |
| 이미지 갤러리 | `scrollBlur` | 프리미엄 느낌 |
| CTA | `scrollScale` | 주목 유도 |
| 통계, 숫자 | `scrollScale` | 강조 효과 |

---

## ⚡ 성능 최적화

### Intersection Observer 장점

✅ **Passive 리스너**: 스크롤 성능 저하 없음
✅ **브라우저 최적화**: 네이티브 API로 효율적
✅ **한 번 실행 후 해제**: 메모리 절약 (`once: true`)

### 최적화 팁

1. **Stagger 딜레이 제한**
   ```svelte
   <!-- ❌ 나쁜 예: 무제한 딜레이 -->
   <div use:scrollScale={{ delay: i * 100 }}>

   <!-- ✅ 좋은 예: 최대값 제한 -->
   <div use:scrollScale={{ delay: Math.min(i * 100, 500) }}>
   ```

2. **한 번만 실행** (기본값)
   ```svelte
   <!-- 대부분의 경우 once: true (기본값) 사용 -->
   <div use:scrollFadeUp>
   ```

3. **적절한 Threshold**
   ```typescript
   // 빠른 애니메이션: threshold 낮게
   threshold: 0.1

   // 정확한 타이밍: threshold 높게
   threshold: 0.3
   ```

---

## 🆚 SSGOI vs 커스텀 스크롤 애니메이션

### 커스텀 스크롤 애니메이션 (현재)

**장점**:
- ✅ Intersection Observer로 성능 최적화
- ✅ 가볍고 빠름 (의존성 없음)
- ✅ 완전한 커스터마이징 가능
- ✅ 스크롤 위치 기반 트리거

**단점**:
- ❌ 페이지 전환 애니메이션 없음
- ❌ 복잡한 전환 효과 제한적

### SSGOI (라이브러리)

**장점**:
- ✅ 페이지 간 전환 애니메이션
- ✅ 다양한 프리셋 (scroll, drill, film, etc.)
- ✅ 요소 간 공유 전환

**단점**:
- ❌ 추가 라이브러리 크기
- ❌ 페이지 전환에 특화 (스크롤 애니메이션 아님)

### 결론

**현재 구현**: 스크롤 기반 애니메이션 (Intersection Observer)
**SSGOI 사용 권장**: 페이지 전환 애니메이션 (SPA 라우팅)

두 가지를 **함께 사용**하면 최상의 UX:
- 페이지 전환: SSGOI
- 스크롤 애니메이션: 커스텀 (현재 구현)

---

## 🐛 트러블슈팅

### 1. 애니메이션이 실행되지 않음

**원인**: Threshold가 너무 높음

**해결**:
```svelte
<div use:scrollFadeUp={{ threshold: 0.05 }}>
```

---

### 2. 애니메이션이 너무 빠름

**원인**: RootMargin 설정

**해결**:
```svelte
<div use:scrollFadeUp={{ rootMargin: '0px 0px -200px 0px' }}>
```

---

### 3. 스크롤 올릴 때도 반복되길 원함

**원인**: `once: true` (기본값)

**해결**:
```svelte
<div use:scrollFadeUp={{ once: false }}>
```

---

### 4. 모바일에서 버벅임

**원인**: 너무 많은 동시 애니메이션

**해결**:
- Stagger 딜레이 제한
- Duration 줄이기
- 간단한 애니메이션 사용 (blur 대신 fade)

```svelte
<!-- 모바일 최적화 -->
<div use:scrollFadeUp={{ duration: 400, delay: Math.min(i * 50, 200) }}>
```

---

## 📚 참고 자료

- [Intersection Observer API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [SSGOI 공식 문서](https://ssgoi.dev)
- [Apple Human Interface Guidelines - Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Cubic-bezier.com](https://cubic-bezier.com)

---

## 🎉 요약

✅ **5가지 스크롤 애니메이션**: FadeUp, FadeLeft, FadeRight, Scale, Blur
✅ **Intersection Observer**: 고성능 스크롤 감지
✅ **커스터마이징**: Duration, Delay, Threshold, RootMargin
✅ **Stagger 지원**: 순차적 애니메이션
✅ **Apple 스타일**: 부드러운 cubic-bezier 이징

**사용법**: `use:scrollFadeUp={{ duration: 600, delay: 100 }}`

---

**작성일**: 2025-10-14
**버전**: 1.0.0
**업데이트**: Svelte 5 upgrade 후 스크롤 애니메이션 시스템 도입
