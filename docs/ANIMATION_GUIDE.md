# 홀로그래픽 카드 플랫폼 애니메이션 가이드

> SSGOI 스타일의 고급 페이지 전환 & 요소 애니메이션 구현

## 📋 개요

SSGOI 라이브러리는 Svelte 5 이상을 요구하지만, 현재 프로젝트는 Svelte 4를 사용합니다.
따라서 **Svelte 4의 네이티브 transition API**를 활용하여 SSGOI 스타일의 고급 애니메이션을 구현했습니다.

---

## 🎨 적용된 애니메이션 효과

### 1. **Hero 섹션** (첫 화면)

#### Hero 텍스트 콘텐츠
- **효과**: `fly` - 아래에서 위로 부드럽게 등장
- **타이밍**: 순차적 딜레이 (100ms → 200ms → 300ms → 400ms)
- **이징**: `quintOut` - 부드러운 감속
- **코드**:
  ```svelte
  <div in:fly={{ y: 30, duration: 800, easing: quintOut, delay: 100 }}>
    <h1 class="hero-title">
      <span class="text-gradient">홀로그래픽 카드</span>
    </h1>
  </div>
  ```

#### Hero 카드 캐러셀
- **효과**: `fly` - 아래에서 위로 stagger 애니메이션
- **타이밍**: 500ms 시작, 각 카드마다 100ms 지연
- **이징**: `cubicOut`
- **특징**: 3장의 카드가 순차적으로 등장하여 리듬감 있는 인트로
- **코드**:
  ```svelte
  {#each heroCards as card, i}
    <div in:fly={{ y: 50, duration: 700, easing: cubicOut, delay: staggerDelay(i, 500, 100) }}>
      <UnifiedCard {...cardProps} />
    </div>
  {/each}
  ```

### 2. **컬렉션 대시보드**

#### 통계 카드 (Stats Cards)
- **효과**: `scale` - 작은 크기에서 확대되며 등장
- **타이밍**: 1000ms 시작, 각 카드마다 80ms 지연
- **이징**: `cubicOut`
- **특징**: 4개의 통계 카드가 "펑펑" 튀어나오는 느낌
- **코드**:
  ```svelte
  <div in:scale={{ duration: 500, easing: cubicOut, delay: staggerDelay(i, 1000, 80) }}>
    <div class="stat-card">...</div>
  </div>
  ```

### 3. **나의 컬렉션 섹션**

#### 컬렉션 스택
- **효과**: `fly` - 좌측에서 우측으로 슬라이드
- **타이밍**: 1600ms 시작, 각 컬렉션마다 150ms 지연
- **이징**: `cubicOut`
- **특징**: 카드 더미가 옆에서 날아오는 듯한 효과
- **코드**:
  ```svelte
  <div in:fly={{ x: -30, duration: 600, easing: cubicOut, delay: staggerDelay(i, 1600, 150) }}>
    <CollectionStack {...props} />
  </div>
  ```

### 4. **커뮤니티 피드**

#### 피드 필터 버튼
- **효과**: `scale` - 작은 크기에서 확대
- **타이밍**: 2300ms 시작
- **특징**: 버튼들이 한번에 "팝" 하고 등장

#### 피드 카드
- **효과**: `fly` - 좌측에서 우측으로 슬라이드
- **타이밍**: 2500ms 시작, 각 카드마다 100ms 지연
- **이징**: `cubicOut`
- **특징**: 커뮤니티 게시물이 순차적으로 흐르듯 등장
- **코드**:
  ```svelte
  {#each filteredPosts as post, i}
    <div in:fly={{ x: -20, duration: 500, easing: cubicOut, delay: staggerDelay(i, 2500, 100) }}>
      <div class="feed-card">...</div>
    </div>
  {/each}
  ```

### 5. **모달 (Modal)**

#### 자랑하기 & 카드 만들기 모달
- **효과**: `fade` - 부드러운 페이드 인/아웃
- **타이밍**: 200ms (인), 150ms (아웃)
- **특징**: 빠르고 부드러운 전환으로 UX 개선
- **코드**:
  ```svelte
  {#if showoffModalOpen}
    <div in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
      <ShowoffModal />
    </div>
  {/if}
  ```

---

## 🛠 커스텀 트랜지션 라이브러리

### 파일 위치
`src/lib/transitions/page-transitions.ts`

### 제공하는 트랜지션

#### 1. `fadeScale()`
**Apple 스타일 페이드 + 스케일**
- 부드러운 페이드인과 약간의 확대 효과
- 기본 scale: 0.98 → 1.0
- 사용 예: 메인 페이지 전환

#### 2. `slideTransition()`
**슬라이드 전환**
- 페이지가 좌우/상하로 슬라이드
- `axis: 'x' | 'y'` 옵션 지원
- 사용 예: 갤러리 ↔ 상세 페이지

#### 3. `flyTransition()`
**개선된 Fly 효과**
- 특정 방향에서 날아오는 효과
- `x, y` 좌표 지정 가능
- 사용 예: 카드 등장 애니메이션

#### 4. `drillIn()` / `drillOut()`
**계층 진입/나가기 효과**
- 화면이 확대/축소되면서 전환
- 사용 예: 홈 → 카드 상세

#### 5. `heroExpand()`
**Hero 전환 (카드 확장)**
- 카드가 확대되면서 페이지로 전환
- 블러 효과 포함
- 사용 예: 카드 클릭 → 상세 페이지

#### 6. `scrollTransition()`
**스크롤 효과**
- 페이지가 위/아래로 스크롤되는 효과
- 사용 예: 홈 → 갤러리

#### 7. `bounceIn()`
**바운스 효과**
- 요소가 통통 튀면서 등장
- 커스텀 bounce easing 적용
- 사용 예: 버튼, 아이콘

#### 8. `blurFade()`
**블러 + 페이드**
- 블러와 함께 페이드 인/아웃
- 사용 예: 모달 배경, 오버레이

#### 9. `staggerDelay()`
**Stagger 헬퍼 함수**
- 여러 요소를 순차적으로 애니메이션
- 파라미터: `(index, baseDelay, stagger)`
- 예시:
  ```typescript
  staggerDelay(0, 1000, 100) // 1000ms
  staggerDelay(1, 1000, 100) // 1100ms
  staggerDelay(2, 1000, 100) // 1200ms
  ```

---

## 🎯 애니메이션 타이밍 전략

### 페이지 로드 시 애니메이션 순서

```
0ms     - 페이지 로드
50ms    - mounted = true (애니메이션 시작)
100ms   - Hero 타이틀 등장
200ms   - Hero 부제목 등장
300ms   - Hero 설명 등장
400ms   - CTA 버튼 등장 (scale)
500ms   - 첫 번째 Hero 카드 등장
600ms   - 두 번째 Hero 카드 등장
700ms   - 세 번째 Hero 카드 등장
900ms   - 대시보드 헤더 등장
1000ms  - 첫 번째 통계 카드 등장
1080ms  - 두 번째 통계 카드 등장
1160ms  - 세 번째 통계 카드 등장
1240ms  - 네 번째 통계 카드 등장
1400ms  - 컬렉션 섹션 헤더 등장
1600ms  - 첫 번째 컬렉션 등장
1750ms  - 두 번째 컬렉션 등장
1900ms  - 세 번째 컬렉션 등장
2100ms  - 커뮤니티 피드 헤더 등장
2300ms  - 피드 필터 버튼 등장
2500ms  - 첫 번째 피드 카드 등장
2600ms  - 두 번째 피드 카드 등장
2700ms  - 세 번째 피드 카드 등장
```

### 타이밍 설계 원칙

1. **점진적 로딩**: 위에서 아래로 순차적으로 등장
2. **자연스러운 리듬**: 너무 빠르지도, 느리지도 않게
3. **시선 유도**: 중요한 콘텐츠(Hero)를 먼저 보여줌
4. **Stagger 효과**: 같은 종류의 요소들은 약간의 딜레이로 순차 등장
5. **2.7초 완료**: 대부분의 애니메이션이 3초 이내 완료

---

## 🚀 성능 최적화

### 1. CSS Transform 사용
- `transform`, `opacity`만 사용하여 GPU 가속 활용
- Reflow/Repaint 최소화

### 2. will-change 힌트
- 애니메이션 요소에 `will-change` 속성 적용 가능
  ```css
  .animated-element {
    will-change: transform, opacity;
  }
  ```

### 3. 조건부 렌더링
- `{#if mounted}` 블록으로 초기 렌더링 최적화
- 애니메이션이 필요한 요소만 조건부 렌더링

### 4. Easing 함수 선택
- `quintOut`: 부드러운 감속 (일반적인 용도)
- `cubicOut`: 빠른 감속 (카드, 버튼)
- `cubicInOut`: 자연스러운 가속/감속 (페이지 전환)

---

## 📱 반응형 고려사항

### 모바일 최적화
```svelte
<script>
  import { browser } from '$app/environment';

  // 모바일에서는 애니메이션 단순화
  const isMobile = browser && window.innerWidth < 768;
  const duration = isMobile ? 300 : 600;
</script>
```

### Reduced Motion 지원
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎨 향후 개선 사항

### 1. 페이지 전환 애니메이션
- SvelteKit의 `beforeNavigate`, `afterNavigate` 훅 활용
- 페이지 간 전환 시 커스텀 애니메이션 적용

### 2. Intersection Observer
- 스크롤 시 요소가 뷰포트에 들어올 때 애니메이션
- 성능을 위해 lazy loading과 결합

### 3. Gesture 기반 애니메이션
- 스와이프, 드래그 제스처 지원
- 모바일 UX 개선

### 4. Micro-interactions
- 버튼 호버/클릭 시 섬세한 피드백
- 카드 호버 시 3D 효과 강화

---

## 📚 참고 자료

- [Svelte Transitions Docs](https://svelte.dev/docs/svelte-transition)
- [SSGOI Official Docs](https://ssgoi.dev)
- [Apple Human Interface Guidelines - Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Material Design - Motion](https://m3.material.io/styles/motion/overview)

---

## 🎯 사용 가이드

### 새로운 페이지에 애니메이션 적용하기

1. **트랜지션 import**
   ```svelte
   <script>
     import { fly, fade, scale } from 'svelte/transition';
     import { quintOut, cubicOut } from 'svelte/easing';
     import { staggerDelay } from '$lib/transitions/page-transitions';
   </script>
   ```

2. **mounted 상태 추가**
   ```svelte
   <script>
     import { onMount } from 'svelte';

     let mounted = false;

     onMount(() => {
       setTimeout(() => mounted = true, 50);
     });
   </script>
   ```

3. **요소에 애니메이션 적용**
   ```svelte
   {#if mounted}
     <div in:fly={{ y: 30, duration: 600, easing: quintOut, delay: 100 }}>
       <!-- 콘텐츠 -->
     </div>
   {/if}
   ```

4. **리스트 아이템에 stagger 적용**
   ```svelte
   {#each items as item, i}
     <div in:fly={{ y: 20, duration: 500, delay: staggerDelay(i, 500, 100) }}>
       {item}
     </div>
   {/each}
   ```

---

**마지막 업데이트**: 2025-10-14
**작성자**: Claude (Baseball Holographic Card Platform)
**버전**: 1.0.0
