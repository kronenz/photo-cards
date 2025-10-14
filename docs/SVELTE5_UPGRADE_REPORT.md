# Svelte 5 업그레이드 검토 보고서

> **프로젝트**: 홀로그래픽 카드 플랫폼 (Baseball Photo Cards)
> **현재 버전**: Svelte 4.2.12, SvelteKit 2.5.18
> **목표 버전**: Svelte 5.39.12 (최신 안정 버전)
> **검토 일자**: 2025-10-14

---

## 📊 요약

### ✅ 업그레이드 가능 여부
**네, 가능합니다!**

### 권장 사항
**점진적 마이그레이션 (Svelte 4 → 5 호환 모드)**
- Svelte 5는 Svelte 4 문법을 계속 지원
- 기존 컴포넌트를 점진적으로 마이그레이션 가능
- 새로운 기능(SSGOI, Runes 등)을 활용 가능

---

## 🔍 현재 프로젝트 분석

### 의존성 현황

#### 핵심 패키지
```json
{
  "svelte": "^4.2.12",                       // → 5.39.12
  "@sveltejs/kit": "^2.5.18",               // ✅ Svelte 5 호환
  "@sveltejs/vite-plugin-svelte": "^3.1.1"  // → 5.0.0+
}
```

#### 관련 라이브러리
```json
{
  "@auth/sveltekit": "^1.10.0",             // ✅ Svelte 5 호환
  "@supabase/supabase-js": "^2.75.0",       // ✅ 프레임워크 무관
  "@tanstack/svelte-virtual": "^3.13.12",   // ⚠️ Svelte 5 테스트 필요
  "bits-ui": "^0.22.0",                      // ⚠️ Svelte 5 테스트 필요
  "svelte-gestures": "^5.2.2"               // ✅ Svelte 5 호환 가능
}
```

### 코드베이스 분석

#### Svelte 4 패턴 사용량
- **`export let` (Props)**: 514개
- **`createEventDispatcher`**: 140개
- **`beforeUpdate/afterUpdate`**: 2개
- **`bind:` (양방향 바인딩)**: 298개
- **`writable/readable/derived` (Stores)**: 235개

#### 주요 컴포넌트 구조
- **총 컴포넌트 수**: 50+ (예상)
- **핵심 컴포넌트**:
  - `HolographicCardV2.svelte` - 홀로그래픽 효과
  - `UnifiedCard.svelte` - 통합 카드 컴포넌트
  - `CollectionStack.svelte` - 컬렉션 스택
  - Auth 관련 컴포넌트 (SignupForm, LoginForm)
  - Social 관련 컴포넌트 (Feed, Connections)

---

## 🔄 Svelte 5 주요 변경 사항

### 1. **Runes (새로운 반응성 시스템)**

#### Before (Svelte 4)
```svelte
<script>
  export let title = '';
  let count = 0;

  $: doubled = count * 2;

  function increment() {
    count += 1;
  }
</script>
```

#### After (Svelte 5)
```svelte
<script>
  let { title = '' } = $props();
  let count = $state(0);

  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
  }
</script>
```

### 2. **Props 선언 방식 변경**

| Svelte 4 | Svelte 5 (Runes Mode) |
|----------|----------------------|
| `export let prop` | `let { prop } = $props()` |
| `export let prop = default` | `let { prop = default } = $props()` |
| 모든 prop이 bindable | `$bindable()`로 명시 필요 |

### 3. **Event Dispatcher 제거**

#### Before (Svelte 4)
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('custom', { data: 'value' });
  }
</script>
```

#### After (Svelte 5)
```svelte
<script>
  let { oncustom } = $props();

  function handleClick() {
    oncustom?.({ data: 'value' });
  }
</script>

<!-- Usage -->
<Component oncustom={(e) => console.log(e)} />
```

### 4. **Lifecycle Hooks 변경**

| Svelte 4 | Svelte 5 |
|----------|----------|
| `beforeUpdate(() => {})` | `$effect.pre(() => {})` |
| `afterUpdate(() => {})` | `$effect(() => {}) + tick()` |
| `onMount(() => {})` | ✅ 동일 |
| `onDestroy(() => {})` | ✅ 동일 |

### 5. **Component 인스턴스화**

| Svelte 4 | Svelte 5 |
|----------|----------|
| `new Component()` | `mount(Component)` |
| `component.$set()` | `$state()` 사용 |

---

## 📋 마이그레이션 작업 항목

### Phase 1: 환경 준비 (1-2일)

#### 1.1 패키지 업데이트
```bash
npm install svelte@^5.39.12
npm install @sveltejs/vite-plugin-svelte@^5.0.0
npm install @sveltejs/kit@latest
```

#### 1.2 자동 마이그레이션 스크립트 실행
```bash
npx sv migrate svelte-5
```

**자동 변환되는 항목:**
- ✅ `export let` → `let { } = $props()`
- ✅ `$: reactive` → `$derived()`
- ✅ `let` → `$state()`
- ✅ 컴포넌트 import/export

**수동 변환 필요:**
- ⚠️ `createEventDispatcher` (140개)
- ⚠️ `beforeUpdate/afterUpdate` (2개)
- ⚠️ `bind:` 양방향 바인딩 (298개 중 일부)

### Phase 2: 수동 마이그레이션 (1-2주)

#### 2.1 createEventDispatcher 변환 (우선순위: 높음)
**예상 작업량**: 140개 컴포넌트
**작업 시간**: 3-5일

```typescript
// 변환 패턴
// Before:
const dispatch = createEventDispatcher();
dispatch('eventName', data);

// After:
let { oneventName } = $props();
oneventName?.(data);
```

**영향받는 주요 컴포넌트**:
- `HolographicCardV2.svelte`
- `UnifiedCard.svelte`
- `CollectionStack.svelte`
- `ShowoffModal.svelte`
- `CreateCardModal.svelte`

#### 2.2 beforeUpdate/afterUpdate 변환 (우선순위: 낮음)
**예상 작업량**: 2개
**작업 시간**: 1시간

```typescript
// Before:
beforeUpdate(() => {
  // 로직
});

// After:
$effect.pre(() => {
  // 로직
});
```

#### 2.3 Bindable Props 명시 (우선순위: 중간)
**예상 작업량**: 50-100개 (전체 298개 bind 중 prop bind)
**작업 시간**: 2-3일

```typescript
// Before:
export let value;

// After:
let { value = $bindable() } = $props();
```

### Phase 3: 테스트 및 검증 (3-5일)

#### 3.1 단위 테스트
- [ ] Vitest 테스트 실행 (48/88 통과 → 전체 통과 목표)
- [ ] 컴포넌트별 단위 테스트

#### 3.2 E2E 테스트
- [ ] Playwright 테스트 실행
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 터치 테스트

#### 3.3 성능 테스트
- [ ] 홀로그래픽 효과 60fps 유지 확인
- [ ] 페이지 로드 시간 측정
- [ ] 번들 사이즈 비교

### Phase 4: 프로덕션 배포 (1-2일)

#### 4.1 Staging 배포
- [ ] Vercel Preview 배포
- [ ] QA 테스트

#### 4.2 Production 배포
- [ ] 점진적 롤아웃 (Canary)
- [ ] 모니터링 및 롤백 준비

---

## ⚠️ 잠재적 이슈 및 리스크

### 높은 리스크 (즉시 대응 필요)

#### 1. **createEventDispatcher (140개)**
- **문제**: 자동 마이그레이션 불가, 수동 변환 필요
- **영향도**: 높음 (컴포넌트 간 통신 전반)
- **해결책**:
  - Callback props 패턴으로 변환
  - 점진적 마이그레이션 (Svelte 4 문법 유지 가능)

#### 2. **Third-party 라이브러리 호환성**
- **문제**: `@tanstack/svelte-virtual`, `bits-ui` Svelte 5 테스트 필요
- **영향도**: 중간 (일부 기능 사용 불가 가능성)
- **해결책**:
  - 라이브러리 최신 버전 확인
  - 필요시 대체 라이브러리 검토
  - Issue tracker 확인

### 중간 리스크 (주의 필요)

#### 3. **양방향 바인딩 (298개)**
- **문제**: Runes 모드에서 기본 동작 변경
- **영향도**: 중간 (일부 바인딩은 props 바인딩)
- **해결책**:
  - `$bindable()` 명시
  - 필요한 경우 단방향 데이터 흐름으로 리팩토링

#### 4. **테스트 라이브러리 호환성**
- **문제**: `@testing-library/svelte` Svelte 5 호환성
- **영향도**: 낮음 (v5.2.8은 Svelte 5 지원)
- **해결책**: 패키지 업데이트 시 함께 업데이트

### 낮은 리스크 (모니터링)

#### 5. **번들 사이즈 변화**
- **문제**: Svelte 5는 더 작은 번들 생성
- **영향도**: 긍정적 (15-30% 감소 예상)
- **대응**: 번들 분석 도구로 확인

#### 6. **성능 변화**
- **문제**: 런타임 반응성으로 인한 성능 변화
- **영향도**: 긍정적 (일반적으로 향상)
- **대응**: 성능 벤치마크 실행

---

## 💰 비용-편익 분석

### 업그레이드 비용
- **개발 시간**: 2-3주 (1명 기준)
- **테스트 시간**: 1주
- **리스크 관리**: 3-5일
- **총 예상 시간**: 4-5주

### 업그레이드 이점

#### 1. **SSGOI 라이브러리 사용 가능** 🎯
- 현재 Svelte 4로 인해 사용 불가
- 고급 페이지 전환 애니메이션 구현
- UX 대폭 개선

#### 2. **성능 향상**
- **번들 사이즈**: 15-30% 감소
- **런타임 성능**: 신호 기반 반응성으로 최적화
- **Tree-shaking**: 개선된 코드 제거

#### 3. **개발자 경험 개선**
- **Universal Reactivity**: `.svelte.ts`에서도 반응성 사용
- **명시적 API**: Runes로 더 명확한 코드
- **더 나은 TypeScript 지원**

#### 4. **미래 지향성**
- Svelte 5가 새로운 표준
- 커뮤니티 및 라이브러리 생태계 이동
- 장기적 유지보수 용이

#### 5. **버그 수정 및 개선사항**
- Svelte 5는 4의 많은 버그 수정 포함
- 더 안정적인 빌드 시스템
- 향상된 에러 메시지

---

## 🎯 권장 마이그레이션 전략

### Option 1: 점진적 마이그레이션 (추천) ⭐

#### 장점
- ✅ 낮은 리스크
- ✅ 기존 코드 유지하면서 새 기능 활용
- ✅ 팀원들이 Svelte 5 학습 시간 확보
- ✅ 프로덕션 영향 최소화

#### 진행 방식
1. **Week 1**: Svelte 5 설치 + 자동 마이그레이션
2. **Week 2-3**: 새로운 컴포넌트는 Runes로 작성
3. **Week 4-6**: 기존 컴포넌트 점진적 변환 (우선순위 기반)
4. **Week 7**: 테스트 및 프로덕션 배포

#### 타임라인
```
Week 1: 환경 설정
├── Svelte 5 설치
├── 자동 마이그레이션 스크립트 실행
└── 빌드 확인

Week 2-3: 새 컴포넌트 작성
├── SSGOI 통합
├── 새로운 페이지 Runes로 작성
└── 병렬 개발 (기존 코드 유지)

Week 4-6: 기존 코드 마이그레이션
├── 핵심 컴포넌트 우선 변환
├── createEventDispatcher 제거
├── Props 및 바인딩 업데이트
└── 점진적 테스트

Week 7: 최종 검증
├── 통합 테스트
├── 성능 테스트
└── 프로덕션 배포
```

### Option 2: 일괄 마이그레이션

#### 장점
- ✅ 빠른 완료
- ✅ 코드베이스 일관성
- ✅ 기술 부채 해소

#### 단점
- ⚠️ 높은 리스크
- ⚠️ 프로덕션 영향 가능성
- ⚠️ 집중적인 작업 필요

#### 진행 방식
1. **Week 1**: 환경 설정 + 자동 마이그레이션
2. **Week 2-3**: 전체 코드 수동 변환
3. **Week 4**: 전체 테스트
4. **Week 5**: 프로덕션 배포

---

## 📝 체크리스트

### 사전 준비
- [ ] Git 브랜치 생성: `feature/svelte-5-upgrade`
- [ ] 현재 상태 스냅샷 (테스트 결과, 성능 메트릭)
- [ ] 팀원 Svelte 5 학습 자료 공유
- [ ] 마이그레이션 일정 확정

### 마이그레이션 단계
- [ ] Svelte 5 설치
- [ ] 자동 마이그레이션 스크립트 실행
- [ ] 빌드 성공 확인
- [ ] `createEventDispatcher` 변환
- [ ] `beforeUpdate/afterUpdate` 변환
- [ ] `$bindable` 추가
- [ ] Third-party 라이브러리 업데이트
- [ ] SSGOI 통합

### 테스트
- [ ] 단위 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 테스트
- [ ] 성능 테스트
- [ ] 번들 사이즈 확인

### 배포
- [ ] Staging 배포
- [ ] QA 승인
- [ ] 프로덕션 배포 (Canary)
- [ ] 모니터링 설정
- [ ] 롤백 계획 준비

---

## 📚 참고 자료

### 공식 문서
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/runes)
- [SvelteKit 2 Docs](https://kit.svelte.dev/docs)

### 커뮤니티 경험담
- [Upgrading a Large Application to Svelte 5](https://codepeer.com/blog/svelte-5-upgrade)
- [My Experience Upgrading to Svelte 5](https://blog.willbraun.dev/upgrading-to-svelte-5)
- [Experiences and Caveats of Svelte 5 Migration](https://dev.to/kvetoslavnovak/experiences-and-caveats-of-svelte-5-migration-27cp)

### 도구
- [Svelte 5 Migration Script](https://svelte.dev/docs/cli/sv-migrate)
- [Bundle Size Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

---

## 🚀 다음 단계

### 즉시 실행 가능
1. **Svelte 5 학습**
   - 팀원들과 Runes 개념 공유
   - 샘플 프로젝트로 실험

2. **마이그레이션 계획 승인**
   - 이 보고서 리뷰
   - 일정 조율

3. **실험 브랜치 생성**
   - 위험 없이 Svelte 5 테스트
   - SSGOI 통합 시험

### 권장 순서
1. ✅ **이 보고서 리뷰 및 승인**
2. 🔄 **실험 브랜치에서 Svelte 5 설치 테스트**
3. 📅 **마이그레이션 일정 수립**
4. 🚀 **점진적 마이그레이션 시작**

---

## 💭 결론

### 업그레이드 가능 여부
**✅ 가능하며, 권장합니다.**

### 최적 전략
**점진적 마이그레이션 (4-5주)**

### 핵심 이유
1. **SSGOI 사용 가능** - UX 대폭 개선
2. **성능 향상** - 번들 사이즈 감소, 런타임 최적화
3. **낮은 리스크** - Svelte 4 문법 계속 지원
4. **미래 지향성** - 생태계 이동

### 최종 권장사항
**지금 시작하세요!** Svelte 5의 이점이 마이그레이션 비용을 충분히 상회합니다. 특히 SSGOI 라이브러리를 활용한 고급 애니메이션은 프로젝트의 프리미엄 이미지를 크게 향상시킬 것입니다.

---

**작성자**: Claude (Baseball Holographic Card Platform)
**최종 업데이트**: 2025-10-14
**버전**: 1.0.0
