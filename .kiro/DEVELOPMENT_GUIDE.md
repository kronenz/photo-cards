# KBO 홀로그래픽 카드 플랫폼 - 개발 가이드

> Claude Code Spec-Driven Development 기반 개발 가이드

## 📚 목차

1. [시작하기](#시작하기)
2. [Spec-Driven Development 워크플로우](#spec-driven-development-워크플로우)
3. [프로젝트 구조](#프로젝트-구조)
4. [Phase별 개발 가이드](#phase별-개발-가이드)
5. [컴포넌트 개발](#컴포넌트-개발)
6. [테스트 전략](#테스트-전략)
7. [스타일 가이드](#스타일-가이드)
8. [배포 프로세스](#배포-프로세스)

---

## 시작하기

### 필수 도구

```bash
# Node.js 18+ 필요
node --version  # v18.0.0 이상

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### 개발 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# PocketBase 실행
./pocketbase serve

# 테스트 실행
npm run test
npm run test:ui  # Vitest UI
```

### 주요 경로

```
http://localhost:5173          # 메인 앱
http://localhost:5173/test     # Phase 1: Enhanced Card 테스트
http://localhost:5173/gallery  # Phase 4: 갤러리
http://localhost:8090          # PocketBase Admin
```

---

## Spec-Driven Development 워크플로우

### 1. 스펙 확인

새로운 기능을 구현하기 전에 해당 Phase의 스펙 문서를 확인합니다:

```bash
# 예: Phase 2 커뮤니티 피드 구현
1. .kiro/specs/photocard-main-renewal/requirements.md 읽기
2. .kiro/specs/photocard-main-renewal/design.md 검토
3. .kiro/specs/photocard-main-renewal/tasks.md 체크
```

### 2. 요구사항 분석

```markdown
# requirements.md에서 확인할 항목
- User Story: 사용자 관점의 기능 설명
- Acceptance Criteria: 구체적인 검수 기준
- WHEN-THEN 조건: 동작 조건과 기대 결과
```

### 3. 설계 검토

```markdown
# design.md에서 확인할 항목
- Component Interface: Props, Events
- Data Models: TypeScript 인터페이스
- Architecture: 컴포넌트 계층 구조
- Error Handling: 에러 처리 전략
```

### 4. 작업 진행

```markdown
# tasks.md 활용
1. [ ] 작업 항목 확인
2. 🔄 진행중으로 마킹
3. ✅ 완료 후 체크
4. _Requirements: X.X_ 연결 확인
```

### 5. 테스트 & 검증

```bash
# 단위 테스트
npm run test -- ComponentName

# E2E 테스트
npm run test:e2e

# 접근성 테스트
npm run test:a11y

# Chrome DevTools MCP 검증 (요구사항 19)
# 실제 브라우저 렌더링 확인
```

### 6. 문서 업데이트

```bash
# tasks.md 업데이트
- [x] 작업 항목 완료 표시

# 필요시 design.md 업데이트
- 실제 구현과 다른 부분 수정
```

---

## 프로젝트 구조

### 디렉토리 구조

```
photo-cards/
├── .kiro/                           # Spec 문서
│   ├── specs/                       # Phase별 스펙
│   │   ├── enhanced-card-interaction/
│   │   ├── photocard-main-renewal/
│   │   ├── integrated-holographic-platform/
│   │   └── holographic-card-community/
│   ├── settings/                    # 설정
│   │   └── mcp.json                # Chrome DevTools MCP
│   ├── PROJECT_OVERVIEW.md         # 프로젝트 개요
│   ├── SPEC_SUMMARY.md             # 스펙 요약
│   └── DEVELOPMENT_GUIDE.md        # 이 문서
│
├── src/
│   ├── lib/
│   │   ├── components/             # 공용 컴포넌트
│   │   │   ├── ui/                # UI 기본 컴포넌트
│   │   │   ├── social/            # 소셜 기능
│   │   │   └── [Phase별 컴포넌트]
│   │   ├── holographic/           # Phase 1: 홀로그래픽 시스템
│   │   │   └── HolographicCard.svelte
│   │   ├── stores/                # Svelte Stores
│   │   ├── utils/                 # 유틸리티
│   │   └── types/                 # TypeScript 타입
│   │
│   ├── routes/
│   │   ├── +page.svelte           # 메인 페이지 (Phase 2, 3 통합)
│   │   ├── test/                  # Phase 1: Enhanced Card 테스트
│   │   ├── gallery/               # Phase 4: 갤러리
│   │   ├── community-demo/        # Phase 4: 커뮤니티 데모
│   │   └── [기타 라우트]
│   │
│   ├── app.html
│   └── app.css
│
├── tests/
│   ├── unit/                      # 단위 테스트
│   ├── integration/               # 통합 테스트
│   └── e2e/                       # E2E 테스트
│
├── pocketbase/                    # PocketBase 데이터
├── static/                        # 정적 파일
├── CLAUDE.md                      # 프로젝트 요약 (루트)
└── package.json
```

### 주요 컴포넌트 매핑

| 컴포넌트 | 위치 | Phase | 상태 |
|---------|------|-------|------|
| HolographicCard | `lib/holographic/` | 1 | ✅ 완료 |
| CollectionDashboard | `lib/components/` | 2 | ✅ 완료 |
| CommunityFeed | `lib/components/` | 2, 4 | 🔄 진행중 |
| KBOTeamsSection | TBD | 2 | 📋 대기 |
| UnifiedHolographicCard | TBD | 3 | 📋 대기 |
| TemplateMarket | TBD | 4 | 📋 대기 |

---

## Phase별 개발 가이드

### Phase 1: Enhanced Card Interaction

#### 핵심 파일
```
src/lib/holographic/HolographicCard.svelte
src/routes/test/+page.svelte
```

#### 개발 워크플로우

1. **홀로그래픽 효과 수정**
```svelte
<!-- HolographicCard.svelte -->
<style>
  .enhanced-card:before {
    mix-blend-mode: overlay;  /* color-dodge → overlay */
    opacity: 0.6;
  }
</style>
```

2. **카드 뒤집기 구현**
```typescript
let isFlipped = false;
let isAnimating = false;

function handleFlip() {
  if (isAnimating) return;
  isAnimating = true;
  isFlipped = !isFlipped;
  setTimeout(() => isAnimating = false, 600);
}
```

3. **터치 이벤트 추가**
```typescript
function handleTouch(e: TouchEvent) {
  e.preventDefault();
  const touch = e.touches[0];
  updateHolographicEffect(touch.clientX, touch.clientY);
}
```

4. **테스트**
```bash
# /test 페이지에서 확인
npm run dev
# http://localhost:5173/test
```

#### 체크리스트
- [ ] 홀로그래픽 효과 이미지 가시성 확인
- [ ] 카드 뒤집기 애니메이션 부드러움
- [ ] 터치 디바이스 동작 확인
- [ ] 60fps 성능 유지
- [ ] 단위 테스트 작성

---

### Phase 2: Photocard Main Renewal

#### 핵심 파일
```
src/routes/+page.svelte              # 메인 페이지
src/lib/components/CollectionDashboard.svelte
src/lib/components/CommunityFeed.svelte  # 구현 필요
src/lib/components/KBOTeamsSection.svelte  # 구현 필요
```

#### 개발 워크플로우

1. **메인 레이아웃 구조**
```svelte
<!-- +page.svelte -->
<script lang="ts">
  import CollectionDashboard from '$lib/components/CollectionDashboard.svelte';
  import CommunityFeed from '$lib/components/CommunityFeed.svelte';
  import KBOTeamsSection from '$lib/components/KBOTeamsSection.svelte';
</script>

<div class="main-layout">
  <CollectionDashboard />
  <CommunityFeed />
  <KBOTeamsSection />
</div>
```

2. **커뮤니티 피드 구현**
```svelte
<!-- CommunityFeed.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import HolographicCard from '$lib/holographic/HolographicCard.svelte';

  let posts: CommunityPost[] = [];
  let layout: 'masonry' | 'grid' = 'masonry';

  onMount(async () => {
    posts = await fetchCommunityPosts();
  });
</script>

<div class="masonry-grid">
  {#each posts as post}
    <HolographicCard card={post.card} />
  {/each}
</div>
```

3. **KBO 팀 섹션**
```svelte
<!-- KBOTeamsSection.svelte -->
<script lang="ts">
  const kboTeams = [
    { id: 'lg', name: 'LG 트윈스', color: '#C30452' },
    { id: 'doosan', name: '두산 베어스', color: '#131230' },
    // ... 10개 구단
  ];
</script>

<section class="kbo-teams">
  {#each kboTeams as team}
    <button class="team-card" style="--team-color: {team.color}">
      {team.name}
    </button>
  {/each}
</section>
```

#### 체크리스트
- [ ] CollectionDashboard 통합
- [ ] CommunityFeed 마소네리 그리드
- [ ] KBOTeamsSection 10개 구단
- [ ] 반응형 레이아웃
- [ ] 자랑하기 모달

---

### Phase 3: Integrated Holographic Platform

#### 통합 전략

1. **UnifiedHolographicCard 생성**
```svelte
<!-- UnifiedHolographicCard.svelte -->
<script lang="ts">
  export let card: UnifiedCard;
  export let context: 'test' | 'main' | 'gallery' | 'community';
  export let size: 'small' | 'medium' | 'large' | 'featured' = 'medium';

  // context별 동작 분기
  $: displayMode = getDisplayMode(context);
</script>
```

2. **기존 컴포넌트 마이그레이션**
```bash
# HolographicCard → UnifiedHolographicCard
# 기능 유지하면서 확장
```

3. **데이터 모델 통합**
```typescript
// src/lib/types/unified.ts
interface UnifiedCard {
  // Phase 1
  frontImage: string;
  backImage?: string;
  holographicEffect: HolographicEffect;

  // Phase 2
  rarity: CardRarity;
  stats: CardStats;

  // Phase 4
  creator: string;
  tags: string[];
}
```

#### 체크리스트
- [ ] UnifiedHolographicCard 컴포넌트
- [ ] 기존 카드 마이그레이션
- [ ] IntegratedMainPage 구현
- [ ] 통합 테스트
- [ ] 성능 검증

---

### Phase 4: Holographic Card Community

#### 주요 기능

1. **갤러리 시스템**
```bash
# 경로: src/routes/gallery/+page.svelte
# 이미 구현됨 ✅
```

2. **소셜 인터랙션**
```bash
# 경로: src/lib/components/social/
# FollowButton.svelte ✅
# PersonalizedFeed.svelte ✅
# UserConnectionsList.svelte ✅
```

3. **템플릿 마켓** (구현 필요)
```svelte
<!-- TemplateMarket.svelte -->
<script lang="ts">
  import { pb } from '$lib/pocketbase';

  let templates: Template[] = [];

  async function fetchTemplates() {
    templates = await pb.collection('templates').getFullList({
      sort: '-downloads',
    });
  }
</script>
```

4. **실시간 메시징** (구현됨 ✅)
```bash
# 경로: src/lib/components/messaging/
```

#### 체크리스트
- [x] 갤러리 시스템
- [x] 소셜 인터랙션
- [x] 실시간 알림
- [ ] 템플릿 마켓
- [ ] 카드 거래 시스템

---

## 컴포넌트 개발

### Svelte 컴포넌트 구조

```svelte
<!-- ComponentName.svelte -->
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';
  import type { ComponentProps } from './types';

  // 2. Props
  export let prop1: string;
  export let prop2: number = 0;

  // 3. State
  let internalState = false;

  // 4. Reactive Statements
  $: computedValue = prop1 + prop2;

  // 5. Functions
  function handleAction() {
    // ...
  }

  // 6. Lifecycle
  onMount(() => {
    // ...
  });
</script>

<!-- 7. Template -->
<div class="component-name">
  <!-- ... -->
</div>

<!-- 8. Styles (Scoped) -->
<style>
  .component-name {
    /* ... */
  }
</style>
```

### TypeScript 인터페이스

```typescript
// src/lib/types/card.ts
export interface Card {
  id: string;
  title: string;
  image: string;
  rarity: CardRarity;
}

export enum CardRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}
```

### Svelte Store 사용

```typescript
// src/lib/stores/cards.ts
import { writable } from 'svelte/store';
import type { Card } from '$lib/types';

export const cards = writable<Card[]>([]);

export async function loadCards() {
  const response = await fetch('/api/cards');
  const data = await response.json();
  cards.set(data);
}
```

---

## 테스트 전략

### 1. 단위 테스트 (Vitest)

```typescript
// tests/unit/HolographicCard.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import HolographicCard from '$lib/holographic/HolographicCard.svelte';

describe('HolographicCard', () => {
  test('should render with image', () => {
    const { getByRole } = render(HolographicCard, {
      props: {
        frontImage: '/test.jpg',
        cardType: 'pokemon',
      },
    });

    expect(getByRole('img')).toBeInTheDocument();
  });

  test('should flip on click', async () => {
    const { getByTestId } = render(HolographicCard, {
      props: {
        frontImage: '/test.jpg',
        enableFlip: true,
      },
    });

    const card = getByTestId('card-container');
    await fireEvent.click(card);

    expect(card).toHaveClass('flipped');
  });
});
```

### 2. 통합 테스트

```typescript
// tests/integration/MainPage.test.ts
import { render } from '@testing-library/svelte';
import MainPage from '../../src/routes/+page.svelte';

describe('MainPage Integration', () => {
  test('should load and display collection dashboard', async () => {
    const { getByTestId } = render(MainPage);

    expect(getByTestId('collection-dashboard')).toBeInTheDocument();
    expect(getByTestId('community-feed')).toBeInTheDocument();
  });
});
```

### 3. E2E 테스트 (Playwright)

```typescript
// tests/e2e/card-interaction.spec.ts
import { test, expect } from '@playwright/test';

test('user can interact with holographic card', async ({ page }) => {
  await page.goto('/test');

  // 카드 호버
  await page.hover('[data-testid="holographic-card"]');
  await expect(page.locator('.holographic-active')).toBeVisible();

  // 카드 클릭 & 뒤집기
  await page.click('[data-testid="holographic-card"]');
  await expect(page.locator('.card-flipped')).toBeVisible();
});
```

### 4. Chrome DevTools MCP 검증

```bash
# Chrome DevTools MCP 설정 확인
cat .kiro/settings/mcp.json

# 실제 브라우저에서 렌더링 확인
# - 스크린샷 캡처
# - 콘솔 오류 확인
# - 네트워크 요청 분석
# - 성능 메트릭 측정
```

---

## 스타일 가이드

### Tailwind CSS

```svelte
<!-- Good -->
<div class="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
  <!-- ... -->
</div>

<!-- Avoid inline styles unless dynamic -->
<div style="color: {dynamicColor}">
  <!-- OK: dynamic value -->
</div>
```

### CSS 커스텀 속성

```css
/* Apple Design System Variables */
:root {
  --apple-blue: #007aff;
  --apple-spacing-md: 16px;
  --apple-transition-smooth: 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.component {
  color: var(--apple-blue);
  padding: var(--apple-spacing-md);
  transition: all var(--apple-transition-smooth);
}
```

### 홀로그래픽 효과

```css
.holographic-card {
  position: relative;
  transform-style: preserve-3d;
}

.holographic-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%);
  mix-blend-mode: overlay;
  opacity: 0.6;
  pointer-events: none;
}
```

---

## 배포 프로세스

### 개발 환경

```bash
npm run dev
# http://localhost:5173
```

### 빌드

```bash
npm run build
npm run preview  # 빌드 미리보기
```

### 테스트

```bash
# 전체 테스트
npm run test

# 특정 테스트
npm run test -- HolographicCard

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:coverage
```

### Vercel 배포

```bash
# vercel.json 설정 확인
cat vercel.json

# 배포
vercel deploy

# 프로덕션 배포
vercel --prod
```

---

## 문제 해결

### 자주 발생하는 이슈

#### 1. 홀로그래픽 효과가 보이지 않음
```bash
# CSS 블렌드 모드 확인
# mix-blend-mode가 부모 요소에서 차단되는지 확인
```

#### 2. 카드 뒤집기 애니메이션 끊김
```bash
# will-change 속성 추가
.card-inner {
  will-change: transform;
}
```

#### 3. PocketBase 연결 실패
```bash
# PocketBase 서버 실행 확인
ps aux | grep pocketbase

# 포트 확인
lsof -i :8090
```

#### 4. 테스트 실패
```bash
# 캐시 삭제
rm -rf node_modules/.vite
npm run test -- --clearCache
```

---

## 유용한 명령어

```bash
# 개발
npm run dev                 # 개발 서버
npm run build              # 프로덕션 빌드
npm run preview            # 빌드 미리보기

# 테스트
npm run test               # 단위 테스트
npm run test:ui            # Vitest UI
npm run test:e2e           # E2E 테스트
npm run test:coverage      # 커버리지

# 린팅 & 포맷팅
npm run lint               # ESLint
npm run format             # Prettier

# 타입 체크
npm run check              # svelte-check
```

---

## 참고 자료

### 내부 문서
- [PROJECT_OVERVIEW.md](.kiro/PROJECT_OVERVIEW.md)
- [SPEC_SUMMARY.md](.kiro/SPEC_SUMMARY.md)
- [CLAUDE.md](../CLAUDE.md)

### Phase별 스펙
- [Phase 1 Spec](.kiro/specs/enhanced-card-interaction/)
- [Phase 2 Spec](.kiro/specs/photocard-main-renewal/)
- [Phase 3 Spec](.kiro/specs/integrated-holographic-platform/)
- [Phase 4 Spec](.kiro/specs/holographic-card-community/)

### 외부 문서
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PocketBase Docs](https://pocketbase.io/docs/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

**작성일**: 2025-01-07
**버전**: 1.0.0
**다음 업데이트**: Phase 3 통합 시작 시
