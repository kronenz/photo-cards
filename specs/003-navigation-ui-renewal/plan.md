# Implementation Plan: Navigation & UI Renewal

**Branch**: `003-navigation-ui-renewal` | **Date**: 2025-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-navigation-ui-renewal/spec.md`

## Summary

Navigation & UI Renewal은 Baseball 홀로그래픽 카드 플랫폼의 **전체 사용자 인터페이스를 Apple Design System 기반으로 통합하고 현대화**하는 작업입니다. 일관된 디자인 언어, 향상된 접근성, 최적화된 성능을 통해 프리미엄 사용자 경험을 제공합니다.

**MVP Scope (P1)**:
- **US1**: 통합 네비게이션 시스템 (auto-hide, 활성 상태 표시, 모바일 메뉴)
- **US2**: 카드 제작 페이지 리뉴얼 (실시간 미리보기, 드래그 앤 드롭)
- **US3**: 컬렉션 페이지 리뉴얼 (Apple Photos 스타일 그리드)
- **US6**: 반응형 & 접근성 (모든 화면 크기, WCAG 2.1 AA)

**Technical Approach**:
- 기존 페이지 컴포넌트 점진적 리팩토링 (한번에 한 페이지씩)
- Apple Design System 기반 공유 컴포넌트 라이브러리 구축
- CSS 커스텀 프로퍼티로 디자인 토큰 관리
- Intersection Observer API for 스크롤 애니메이션
- CSS Grid + Flexbox for 반응형 레이아웃

## Technical Context

**Language/Version**: TypeScript 5.x, SvelteKit 4.2.12
**Primary Dependencies**:
- **Existing**: Tailwind CSS 3.3.6, @tanstack/svelte-virtual
- **New**:
  - `@radix-ui/primitives` (접근성 컴포넌트) - NEEDS RESEARCH
  - `lottie-web` (벡터 애니메이션) - OPTIONAL
  - `vanilla-tilt` (3D 틸트 효과) - NEEDS RESEARCH

**Storage**:
- No new storage requirements (UI-only changes)
- LocalStorage for theme preferences (existing)
- SessionStorage for navigation state

**Testing**:
- Vitest (컴포넌트 단위 테스트)
- Playwright (E2E 네비게이션 플로우, 반응형 테스트)
- axe-core (접근성 자동 검증)
- Percy/Chromatic (비주얼 리그레션 테스트) - NEEDS RESEARCH

**Target Platform**: Web (모바일 반응형), iOS 15+ Safari, Chrome/Firefox/Edge
**Project Type**: Single web application (SvelteKit)
**Performance Goals**:
- Lighthouse Performance: >90 (모바일), >95 (데스크톱)
- First Contentful Paint: <1.5초
- Time to Interactive: <3초
- 60fps 애니메이션 (NON-NEGOTIABLE per Constitution III)
- Bundle size per route: <500KB gzipped

**Constraints**:
- 기존 라우팅 구조 유지 (페이지 경로 변경 불가)
- 기존 백엔드 API 유지 (UI만 변경)
- 다크 모드 필수 지원
- 모바일 우선 (Mobile-first) 설계
- 60fps 보장 (Constitution III)

**Scale/Scope**:
- 10개 주요 페이지 리뉴얼 (홈, 갤러리, 커뮤니티, 마켓플레이스, 카드 제작, 컬렉션, 로그인, 회원가입, 도움말, 약관)
- 20+ 공유 컴포넌트 생성
- 3개 브레이크포인트 (mobile, tablet, desktop)
- 2개 테마 (light, dark)
- 3주 개발 기간

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Spec-Driven Development

**Compliance**: PASS

- ✅ spec.md exists with User Stories and Acceptance Criteria
- ✅ This plan.md provides architectural guidance
- ✅ data-model.md will define component interfaces
- ✅ tasks.md will be generated with Requirements traceability
- ✅ No implementation started before spec completion

### ✅ Principle II: Phase-Based Architecture

**Compliance**: PASS WITH NOTES

- ✅ This is a new phase (003-navigation-ui-renewal)
- ✅ Clear interfaces: Only modifies UI components, not business logic
- ✅ Independent testing: UI tests don't affect Phase 1/2/4 functionality
- ⚠️ **Cross-phase dependency**: Must preserve existing Phase 1 HolographicCard API
- ⚠️ **Cross-phase dependency**: Must not break Phase 4 gallery/community layouts
- ✅ Backward compatibility: All existing pages continue to work during rollout

**Mitigation Strategy**:
1. Test existing Phase 1/2/4 features after each page refactor
2. Use feature flags to enable new UI per page
3. Maintain parallel implementations until visual QA complete

### ✅ Principle III: 60fps Performance Standard

**Compliance**: PASS

- ✅ CSS transforms only for animations (no layout property animation)
- ✅ `will-change` for GPU acceleration on hover/transition states
- ✅ Intersection Observer for scroll-triggered animations (no scroll listener)
- ✅ Performance budget enforced: Bundle size <500KB per route
- ✅ Lighthouse CI validation in GitHub Actions
- ✅ Chrome DevTools validation for holographic effects

**Performance Validation Plan**:
- Before/after Lighthouse score comparison
- DevTools Performance profiling for critical animations
- FPS meter during navigation transitions
- Long task detection (>50ms blocked)

### ✅ Principle IV: Component Reusability

**Compliance**: PASS

- ✅ Design system components in `src/lib/components/design-system/`
- ✅ TypeScript interfaces for all props
- ✅ Zero cross-phase knowledge (UI components are phase-agnostic)
- ✅ Variants via props (e.g., `<Button variant="primary" | "secondary" />`)
- ✅ JSDoc comments for component API documentation

**Reusable Components to Create**:
- Button, Input, Select, Textarea (form elements)
- Modal, Drawer, Popover (overlays)
- Card, CardGrid (layout)
- Navigation, Breadcrumb (navigation)
- LoadingSpinner, Skeleton (loading states)
- Toast, Alert (notifications)

### ✅ Principle V: User-Centric Design

**Compliance**: PASS

- ✅ Apple-level UX: Smooth animations, clear hierarchy, micro-interactions
- ✅ Mobile-first: Touch-optimized (44px minimum tap targets)
- ✅ Korean baseball culture: 기존 팀 테마 유지
- ✅ Accessibility: WCAG 2.1 AA (ARIA labels, keyboard navigation)
- ✅ Usability testing: 베타 테스터 SUS 점수 >80 목표

**UX Validation**:
- Manual keyboard navigation testing (Tab, Enter, Esc)
- Screen reader testing (VoiceOver on macOS/iOS)
- Touch target size validation (Chrome DevTools mobile emulation)
- Color contrast checker (4.5:1 minimum)

### 🚨 Constitution Violations: NONE

All principles aligned. No justifications required.

---

## Phase 0: Research & Unknowns

### Research Tasks

#### R001: Radix UI vs Headless UI Selection
**Unknown**: Which headless UI library provides better Svelte support?
**Research Task**: Compare Radix UI Primitives and Headless UI for:
- Svelte compatibility (native support vs adapters)
- Bundle size impact
- Accessibility out-of-the-box
- Customization flexibility
- Community support & maintenance

**Output**: Decision matrix in research.md with recommendation

#### R002: 3D Tilt Effect Implementation
**Unknown**: Best practice for 3D tilt hover effects in Svelte
**Research Task**: Evaluate:
- vanilla-tilt.js (jQuery-free port)
- Custom CSS transform approach
- Performance impact on 60fps requirement
- Mobile/touch compatibility

**Output**: Code sample + performance benchmark in research.md

#### R003: Visual Regression Testing Tool
**Unknown**: Percy vs Chromatic for visual regression
**Research Task**: Compare:
- Pricing for our usage (10 pages * 2 themes * 3 breakpoints = 60 snapshots)
- CI/CD integration
- Svelte/Vite compatibility
- Review UI/workflow

**Output**: Cost-benefit analysis in research.md

#### R004: Animation Library Decision
**Unknown**: Do we need Lottie for animations?
**Research Task**: Evaluate:
- Can we achieve all desired animations with CSS?
- Lottie bundle size impact
- Designer workflow (Figma → Lottie)
- Performance on mobile devices

**Output**: Animation strategy in research.md

#### R005: Scroll Auto-Hide Navigation Pattern
**Unknown**: Best practice for auto-hide header on scroll
**Research Task**: Research:
- Intersection Observer vs scroll event listener
- Handling scroll direction (up/down)
- Preventing jank during rapid scrolling
- Accessibility considerations (focus management)

**Output**: Implementation pattern in research.md

---

## Phase 1: Design & Contracts

### Data Models

#### DM-001: Design System Token Interface
```typescript
interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    background: { primary: string; secondary: string; tertiary: string };
    surface: { primary: string; secondary: string; border: string };
    text: { primary: string; secondary: string; tertiary: string };
  };
  typography: {
    fontFamily: { sans: string; mono: string };
    fontSize: Record<string, string>; // display, title1, title2, etc.
    fontWeight: Record<string, number>;
    lineHeight: Record<string, string>;
  };
  spacing: Record<string, string>; // xs, sm, md, lg, xl, 2xl, 3xl
  borderRadius: Record<string, string>; // sm, md, lg, xl, full
  shadows: Record<string, string>; // sm, md, lg, xl
  transitions: Record<string, string>; // fast, smooth, slow
}
```

#### DM-002: Component Prop Interfaces
```typescript
// Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ComponentType;
  onClick?: () => void;
}

// Input Component
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onInput?: (value: string) => void;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  onClose: () => void;
  children: Snippet;
}
```

#### DM-003: Navigation State
```typescript
interface NavigationState {
  currentPath: string;
  isMenuOpen: boolean;
  isHeaderVisible: boolean; // for auto-hide
  theme: 'light' | 'dark';
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number; // for notifications
  requiresAuth?: boolean;
}
```

### API Contracts

**No new API endpoints** - This is a UI-only refactor.

**Existing API dependencies**:
- User authentication state (from @auth/sveltekit)
- Card data (from Phase 1/4 APIs)
- Collection data (from existing PocketBase collections)

### Component Architecture

```
src/lib/components/
├── design-system/
│   ├── Button/
│   │   ├── Button.svelte
│   │   ├── Button.test.ts
│   │   └── Button.stories.ts (optional Storybook)
│   ├── Input/
│   ├── Modal/
│   ├── Card/
│   └── ...
├── navigation/
│   ├── MainNav.svelte (refactored from +layout.svelte)
│   ├── MobileMenu.svelte
│   ├── Breadcrumb.svelte
│   └── NavigationStore.ts (Svelte store)
├── pages/
│   ├── create/
│   │   ├── CreateForm.svelte
│   │   ├── LivePreview.svelte
│   │   └── TemplateSelector.svelte
│   ├── collections/
│   │   ├── CollectionGrid.svelte
│   │   ├── CollectionCard.svelte
│   │   ├── StatsCard.svelte
│   │   └── EmptyState.svelte
│   └── auth/
│       ├── LoginForm.svelte
│       ├── SignupForm.svelte
│       └── PasswordStrength.svelte
└── unified/ (existing from Phase 3)
    └── (preserve existing components)
```

### File Structure

```
specs/003-navigation-ui-renewal/
├── spec.md (✅ exists)
├── plan.md (this file)
├── research.md (Phase 0 output)
├── data-model.md (Phase 1 output - component interfaces)
├── contracts/ (empty - no API changes)
│   └── README.md (explains no API contracts)
├── quickstart.md (integration scenarios)
├── tasks.md (Phase 2 output - implementation checklist)
└── checklists/
    ├── design-review.md (Figma mockup checklist)
    ├── accessibility.md (WCAG 2.1 checklist)
    └── performance.md (Lighthouse checklist)
```

---

## Phase 2: Task Breakdown

*Tasks will be generated after Phase 0/1 completion using `/speckit.tasks`*

### Preliminary Task Estimate

**Phase 1: Design System Foundation** (Week 1)
- T001-T010: Core design system components (Button, Input, Modal, etc.)
- T011-T015: CSS custom properties for design tokens
- T016-T020: Storybook setup (optional)

**Phase 2: Navigation Refactor** (Week 1)
- T021-T025: MainNav component with auto-hide
- T026-T030: Mobile menu + hamburger animation
- T031-T035: Breadcrumb navigation
- T036-T040: Theme switcher integration

**Phase 3: Page-by-Page Refactor** (Week 2)
- T041-T050: Card create page (form + live preview)
- T051-T060: Collections page (grid + stats)
- T061-T070: Auth pages (login + signup)
- T071-T080: Info pages (help, contact, terms, privacy)

**Phase 4: Responsive & Accessibility** (Week 2)
- T081-T090: Breakpoint testing (mobile, tablet, desktop)
- T091-T100: Keyboard navigation
- T101-T110: ARIA labels & screen reader testing
- T111-T120: Dark mode refinement

**Phase 5: Performance & Testing** (Week 3)
- T121-T130: Bundle size optimization
- T131-T140: Lighthouse audits
- T141-T150: Visual regression tests
- T151-T160: E2E test suite

**Total Estimated Tasks**: 160 tasks

---

## Integration & Testing Strategy

### Integration Points

1. **Phase 1 (Enhanced Card Interaction)**
   - Preserve `HolographicCard.svelte` API
   - Test holographic effects after nav changes
   - Ensure 60fps maintained

2. **Phase 2 (Photocard Main Renewal)**
   - Keep `CollectionDashboard` component working
   - Test main page layout with new nav
   - Verify responsive breakpoints

3. **Phase 4 (Holographic Card Community)**
   - Preserve gallery grid layout
   - Test community feed with new nav
   - Check notification integration

### Testing Checklist

**Unit Tests (Vitest)**
- [ ] All design system components render correctly
- [ ] Props validation works
- [ ] Event handlers fire appropriately
- [ ] Theme switching updates styles
- [ ] Accessibility attributes present

**Integration Tests**
- [ ] Navigation state syncs across pages
- [ ] Theme persists across page loads
- [ ] Mobile menu opens/closes smoothly
- [ ] Form validation triggers correctly

**E2E Tests (Playwright)**
- [ ] Full user journey: Home → Create → Collections
- [ ] Login flow works with new auth UI
- [ ] Mobile navigation full workflow
- [ ] Keyboard-only navigation
- [ ] Dark mode toggle persists

**Visual Regression (Percy/Chromatic)**
- [ ] All pages screenshot in light/dark mode
- [ ] Mobile/tablet/desktop breakpoints
- [ ] Hover states captured
- [ ] Animation keyframes

**Performance Tests**
- [ ] Lighthouse score >90 on all pages
- [ ] Bundle size <500KB per route
- [ ] 60fps animations verified
- [ ] No long tasks >50ms

**Accessibility Tests**
- [ ] axe-core 0 violations
- [ ] Keyboard navigation complete
- [ ] Screen reader announces correctly
- [ ] Color contrast passes (4.5:1)
- [ ] Focus indicators visible

---

## Deployment Strategy

### Feature Flag Rollout

```typescript
// Feature flag configuration
const UI_RENEWAL_FLAGS = {
  navigation: false, // Enable new nav first
  createPage: false,
  collectionsPage: false,
  authPages: false,
  infoPages: false,
};

// Rollout schedule
Week 1: navigation: true → 10% users
Week 2: navigation: 100%, createPage: 50%
Week 3: All flags: 100%
```

### Rollback Plan

If critical bugs found:
1. Toggle feature flag to `false` in Vercel environment variables
2. Revert to old UI immediately (no deployment needed)
3. Fix bugs on feature branch
4. Re-enable flag after QA

### Monitoring

**Metrics to Track**:
- Page load times (RUM via Vercel Analytics)
- Error rates (Sentry)
- User session duration (GA4)
- Bounce rate by page
- Conversion rate (signup, card creation)

**Alerts**:
- Lighthouse score drops below 85
- Error rate > 1%
- Page load time > 5 seconds (p95)

---

## Success Criteria

### Quantitative Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Lighthouse Performance | 75 | >90 | CI/CD |
| First Contentful Paint | 2.5s | <1.5s | Lighthouse |
| Time to Interactive | 4.5s | <3s | Lighthouse |
| Bundle Size (main) | 650KB | <500KB | Webpack Analyzer |
| axe-core Violations | 15 | 0 | CI/CD |
| Test Coverage | 45% | >70% | Vitest |
| Mobile Usability | 82 | >95 | Lighthouse |

### Qualitative Metrics

- [ ] SUS score from 10 beta testers: >80 (Excellent)
- [ ] Design consistency score: 10/10 (all pages use design system)
- [ ] Accessibility audit: WCAG 2.1 AA compliant
- [ ] User feedback: "feels premium" mentioned in >70% of surveys

---

## Risks & Mitigation

### Risk 1: 60fps Performance Regression
**Probability**: Medium
**Impact**: Critical (Constitution violation)
**Mitigation**:
- Performance budgets enforced in CI/CD
- Chrome DevTools profiling before each merge
- Fallback to simpler animations if needed

### Risk 2: Breaking Existing Phase 1/4 Features
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Integration tests for cross-phase components
- Feature flags for gradual rollout
- Parallel implementations until validated

### Risk 3: Accessibility Regressions
**Probability**: Low
**Impact**: High (legal + UX)
**Mitigation**:
- axe-core in CI/CD blocks merge
- Manual testing with screen readers
- Keyboard navigation E2E tests

### Risk 4: Bundle Size Increase
**Probability**: High
**Impact**: Medium
**Mitigation**:
- Code splitting per route
- Tree-shaking unused components
- Dynamic imports for heavy features
- Bundle analyzer in CI/CD

### Risk 5: Scope Creep
**Probability**: High
**Impact**: Medium
**Mitigation**:
- Strict adherence to spec.md (no new features)
- Design review approval required
- Time-boxed development (3 weeks hard limit)

---

## Timeline

**Week 1: Foundation**
- Day 1-2: Phase 0 Research (R001-R005)
- Day 3-5: Design system components (10 core components)

**Week 2: Pages**
- Day 1-2: Navigation refactor
- Day 3-4: Create + Collections pages
- Day 5: Auth pages

**Week 3: Polish**
- Day 1-2: Info pages + responsive fixes
- Day 3-4: Accessibility + performance audits
- Day 5: QA + bug fixes

**Week 4: Rollout**
- Day 1: Feature flag 10% (navigation only)
- Day 2-3: Monitor + fix critical bugs
- Day 4: Feature flag 100% (all pages)
- Day 5: Post-launch monitoring

---

## Dependencies

### Blocked By
- None (can start immediately)

### Blocks
- SEO optimization (needs final URLs and page structure)
- Analytics instrumentation (needs final page events)
- Marketing screenshots (needs final UI)

### Parallel Work
- Backend API improvements (separate work stream)
- Content creation (can start with wireframes)
- Legal review of privacy policy (no UI dependency)

---

## Notes

### Design Inspiration Sources
- **Apple**: macOS Big Sur, iOS 15 Human Interface Guidelines
- **Glassmorphism**: Windows 11 Fluent Design, iOS Control Center
- **Holographic Effects**: Stripe gradient animations, Linear app
- **Micro-interactions**: Framer Motion examples, Principle app

### Known Technical Debt
- Existing `+layout.svelte` has mixed concerns (nav + global state)
- Some pages use inline styles (will migrate to design tokens)
- Inconsistent TypeScript types (will standardize)
- Missing prop types on older components (will add)

### Future Enhancements (Out of Scope)
- Component library as separate npm package
- Design system documentation site (Storybook hosted)
- A/B testing framework for UI experiments
- Advanced animations (Lottie, Rive)
- Internationalization (i18n)

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Ready for Phase 0 Research
