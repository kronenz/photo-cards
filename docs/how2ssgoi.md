# SSGOI 완전 가이드

SSGOI는 웹에서 네이티브 앱과 같은 자연스러운 페이지 전환 애니메이션을 구현할 수 있게 해주는 라이브러리입니다.

## 목차
1. [시작하기](#시작하기)
2. [핵심 개념](#핵심-개념)
3. [페이지 전환](#페이지-전환)
4. [요소 전환](#요소-전환)
5. [Svelte 사용법](#svelte-사용법)
6. [React 사용법](#react-사용법)

---

## 시작하기

### 소개

SSGOI는 "쓰고이"라고 읽으며, 하여튼 좋다는 뜻입니다!

#### 주요 특징
- **모든 브라우저에서 동작**: Chrome, Firefox, Safari 어디서든 동일한 애니메이션 보장
- **서버사이드 렌더링 완벽 지원**: SSR/SSG 호환, SEO 친화적
- **프레임워크 라우팅 그대로 사용**: 기존 라우팅 시스템과 완벽 호환

### 빠른 시작

#### 패키지 설치

```bash
# Svelte
npm install @ssgoi/svelte

# React
npm install @ssgoi/react 
# 또는 yarn add @ssgoi/react 
# 또는 pnpm add @ssgoi/react
```

---

## 핵심 개념

### 요소 애니메이션

개별 요소에 애니메이션을 적용하는 방법

```typescript
import { animate } from "@ssgoi/svelte/element-transitions";

// 요소 애니메이션
animate(element, {
  keyframes: [
    { opacity: 0, transform: "scale(0.8)" },
    { opacity: 1, transform: "scale(1)" }
  ],
  duration: 300
});
```

### 페이지 전환

페이지 간 전환 애니메이션을 구현하는 방법

```typescript
import { Ssgoi } from "@ssgoi/svelte";
import { fade } from "@ssgoi/svelte/view-transitions";

const config = {
  defaultTransition: fade(),
  transitions: [
    {
      from: '/home',
      to: '/about',
      transition: scroll({ direction: 'up' })
    }
  ]
};
```

### 스프링 프리셋

스프링 기반 애니메이션의 프리셋

```typescript
import { spring } from "@ssgoi/svelte/spring";

// 기본 스프링
const basicSpring = spring();

// 커스텀 스프링
const customSpring = spring({
  stiffness: 300,
  damping: 30,
  mass: 1
});
```

---

## 페이지 전환

### 페이드 (Fade)

부드러운 페이드 인/아웃 효과

```typescript
import { fade } from "@ssgoi/svelte/view-transitions";

// 기본 페이드
const basicFade = fade();

// 커스텀 페이드
const customFade = fade({
  duration: 500,
  easing: "ease-in-out"
});
```

### 스크롤 (Scroll)

스크롤을 활용한 전환 효과

```typescript
import { scroll } from "@ssgoi/svelte/view-transitions";

// 위로 스크롤
const scrollUp = scroll({ direction: "up" });

// 아래로 스크롤
const scrollDown = scroll({ direction: "down" });

// 좌우 스크롤
const scrollLeft = scroll({ direction: "left" });
const scrollRight = scroll({ direction: "right" });
```

### 히어로 (Hero)

공유 요소를 활용한 히어로 전환 효과

```typescript
import { hero } from "@ssgoi/svelte/view-transitions";

const heroTransition = hero({
  sharedElement: ".hero-image",
  duration: 600
});
```

### 핀터레스트 (Pinterest)

Pinterest 스타일의 전환 효과

```typescript
import { pinterest } from "@ssgoi/svelte/view-transitions";

const pinterestTransition = pinterest({
  direction: "expand",
  duration: 400
});
```

### 드릴 (Drill)

계층적 이동을 위한 전환 효과

```typescript
import { drill } from "@ssgoi/svelte/view-transitions";

// 진입
const drillEnter = drill({ direction: "enter" });

// 나가기
const drillExit = drill({ direction: "exit" });
```

### 슬라이드 (Slide)

방향성 있는 슬라이드 전환 효과

```typescript
import { slide } from "@ssgoi/svelte/view-transitions";

const slideLeft = slide({ direction: "left" });
const slideRight = slide({ direction: "right" });
const slideUp = slide({ direction: "up" });
const slideDown = slide({ direction: "down" });
```

### 블라인드 (Blind)

블라인드 효과를 활용한 전환

```typescript
import { blind } from "@ssgoi/svelte/view-transitions";

const blindTransition = blind({
  direction: "vertical",
  duration: 500
});
```

### 필름 (Film)

필름 롤링 효과

```typescript
import { film } from "@ssgoi/svelte/view-transitions";

const filmTransition = film({
  direction: "left",
  duration: 600
});
```

### 재민 (Jamin)

특정한 전환 효과

```typescript
import { jamin } from "@ssgoi/svelte/view-transitions";

const jaminTransition = jamin({
  duration: 400
});
```

### 스트립 (Strip)

스트립 형태의 전환 효과

```typescript
import { strip } from "@ssgoi/svelte/view-transitions";

const stripTransition = strip({
  direction: "horizontal",
  strips: 8
});
```

---

## 요소 전환

### 페이드 (Fade)

요소에 페이드 인/아웃 애니메이션 적용

```typescript
import { fade } from "@ssgoi/svelte/element-transitions";

const fadeIn = fade({ direction: "in" });
const fadeOut = fade({ direction: "out" });
```

### 스케일 (Scale)

요소의 크기를 조절하는 스케일 애니메이션

```typescript
import { scale } from "@ssgoi/svelte/element-transitions";

const scaleIn = scale({ direction: "in" });
const scaleOut = scale({ direction: "out" });
```

### 블러 (Blur)

블러 효과를 활용한 애니메이션

```typescript
import { blur } from "@ssgoi/svelte/element-transitions";

const blurIn = blur({ direction: "in" });
const blurOut = blur({ direction: "out" });
```

### 슬라이드 (Slide)

요소를 슬라이드시키는 애니메이션

```typescript
import { slide } from "@ssgoi/svelte/element-transitions";

const slideLeft = slide({ direction: "left" });
const slideRight = slide({ direction: "right" });
```

### 플라이 (Fly)

요소가 날아가는 듯한 애니메이션

```typescript
import { fly } from "@ssgoi/svelte/element-transitions";

const flyIn = fly({ 
  direction: "in",
  x: 100,
  y: -100
});
```

### 회전 (Rotate)

요소의 회전 애니메이션

```typescript
import { rotate } from "@ssgoi/svelte/element-transitions";

const rotateIn = rotate({ 
  direction: "in",
  angle: 180
});
```

### 바운스 (Bounce)

요소가 튕기는 듯한 애니메이션

```typescript
import { bounce } from "@ssgoi/svelte/element-transitions";

const bounceIn = bounce({ direction: "in" });
```

### 마스크 (Mask)

마스크 효과를 활용한 애니메이션

```typescript
import { mask } from "@ssgoi/svelte/element-transitions";

const maskIn = mask({ 
  direction: "in",
  type: "circle"
});
```

---

## Svelte 사용법

### 기본 설정

```svelte
<!-- App.svelte -->
<script>
  import { Ssgoi } from "@ssgoi/svelte";
  import { fade } from "@ssgoi/svelte/view-transitions";
  
  const config = {
    defaultTransition: fade(),
    transitions: [
      {
        from: '/',
        to: '/about',
        transition: scroll({ direction: 'up' })
      }
    ]
  };
</script>

<Ssgoi {config}>
  <!-- ⚠️ 중요: position: relative 필수! -->
  <div style="position: relative; min-height: 100vh;">
    <slot />
  </div>
</Ssgoi>
```

### 페이지 래핑

```svelte
<!-- pages/Home.svelte -->
<script>
  import { SsgoiTransition } from "@ssgoi/svelte";
</script>

<SsgoiTransition id="/">
  <main>
    <h1>홈 페이지</h1>
    <!-- 페이지 내용 -->
  </main>
</SsgoiTransition>
```

### 요소 애니메이션

```svelte
<!-- components/AnimatedCard.svelte -->
<script>
  import { fly, fade } from "@ssgoi/svelte/element-transitions";
  import { onMount } from "svelte";
  
  let visible = false;
  
  onMount(() => {
    visible = true;
  });
</script>

<div 
  class="card"
  in:fly={{ x: 100, duration: 500 }}
  out:fade={{ duration: 300 }}
  class:visible
>
  <h2>애니메이션 카드</h2>
  <p>이 카드는 애니메이션과 함께 나타납니다.</p>
</div>

<style>
  .card {
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
  }
  
  .card.visible {
    opacity: 1;
    transform: translateX(0);
  }
</style>
```

---

## React 사용법

### 기본 설정 (Next.js App Router)

```tsx
// app/layout.tsx
import { Ssgoi } from "@ssgoi/react";
import { fade } from "@ssgoi/react/view-transitions";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Ssgoi config={{ defaultTransition: fade() }}>
          {/* ⚠️ 중요: position: relative 필수! */}
          <div style={{ position: "relative", minHeight: "100vh" }}>
            {children}
          </div>
        </Ssgoi>
      </body>
    </html>
  );
}
```

### 페이지 래핑

```tsx
// app/page.tsx
import { SsgoiTransition } from "@ssgoi/react";

export default function HomePage() {
  return (
    <SsgoiTransition id="/">
      <main>
        <h1>홈 페이지</h1>
        {/* 페이지 내용 */}
      </main>
    </SsgoiTransition>
  );
}

// app/about/page.tsx
export default function AboutPage() {
  return (
    <SsgoiTransition id="/about">
      <main>
        <h1>소개 페이지</h1>
        {/* 페이지 내용 */}
      </main>
    </SsgoiTransition>
  );
}
```

### 다양한 트랜지션 적용

```tsx
// app/layout.tsx
import { scroll, fade, drill } from "@ssgoi/react/view-transitions";

const ssgoiConfig = {
  transitions: [
    // 홈 → 소개: 위로 스크롤
    { from: "/", to: "/about", transition: scroll({ direction: "up" }) },
    // 소개 → 홈: 아래로 스크롤
    { from: "/about", to: "/", transition: scroll({ direction: "down" }) },
    // 목록 → 상세: 드릴 (진입)
    { from: "/list", to: "/detail/*", transition: drill({ direction: "enter" }) },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Ssgoi config={ssgoiConfig}>
          <div style={{ position: "relative", minHeight: "100vh" }}>
            {children}
          </div>
        </Ssgoi>
      </body>
    </html>
  );
}
```

### 요소 애니메이션 (React)

```tsx
import { useElementTransition } from "@ssgoi/react/element-transitions";
import { fly, fade } from "@ssgoi/react/element-transitions";

function AnimatedCard() {
  const [visible, setVisible] = useState(false);
  
  const { ref, in: flyIn, out: fadeOut } = useElementTransition({
    in: fly({ x: 100, duration: 500 }),
    out: fade({ duration: 300 })
  });
  
  useEffect(() => {
    setVisible(true);
  }, []);
  
  return (
    <div 
      ref={ref}
      className={`card ${visible ? 'visible' : ''}`}
      {...flyIn}
    >
      <h2>애니메이션 카드</h2>
      <p>이 카드는 애니메이션과 함께 나타납니다.</p>
    </div>
  );
}
```

---

## 고급 설정

### 커스텀 스프링 설정

```typescript
import { spring } from "@ssgoi/svelte/spring";

const customSpring = spring({
  stiffness: 300,    // 강성 (높을수록 빠름)
  damping: 30,       // 감쇠 (높을수록 부드러움)
  mass: 1,           // 질량
  precision: 0.01    // 정밀도
});
```

### 조건부 트랜지션

```typescript
const config = {
  defaultTransition: fade(),
  transitions: [
    {
      from: '/',
      to: '/about',
      transition: (context) => {
        // 조건에 따라 다른 트랜지션 적용
        if (context.userAgent.includes('Mobile')) {
          return slide({ direction: 'up' });
        }
        return scroll({ direction: 'up' });
      }
    }
  ]
};
```

### 성능 최적화

```typescript
const config = {
  defaultTransition: fade(),
  // GPU 가속 사용
  useGPU: true,
  // 애니메이션 중 스크롤 비활성화
  disableScrollDuringTransition: true,
  // 메모리 사용량 최적화
  optimizeMemory: true
};
```

---

## 주의사항

### position: relative 필수

페이지가 out 애니메이션될 때 position: absolute가 적용됩니다. 상위 요소에 position: relative가 없으면 페이지가 잘못된 위치로 이동할 수 있습니다.

### SSR/SSG 호환성

SSGOI는 서버사이드 렌더링과 완벽하게 호환되며, 하이드레이션 문제가 없습니다.

### 브라우저 지원

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

---

## 참고 자료

- [공식 문서](https://ssgoi.dev/ko/docs/)
- [GitHub 저장소](https://github.com/ssgoi/ssgoi)
- [데모 쇼케이스](https://ssgoi.dev/demo)
