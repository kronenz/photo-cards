# Implementation Plan: Integrated Holographic Platform

**Branch**: `002-integrated-holographic-platform` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-integrated-holographic-platform/spec.md`

## Summary

**Primary Requirement**: Integrate Phase 1 (Enhanced Card Interaction), Phase 2 (Photocard Main Renewal), and Phase 4 (Holographic Card Community) into a unified platform without breaking existing functionality, while maintaining 60fps performance and providing consistent holographic card experience across all contexts.

**Technical Approach**:
1. Create UnifiedHolographicCard component that wraps Phase 1's Enhanced Card with context-aware rendering
2. Build IntegratedMainPage layout that combines CollectionDashboard (Phase 2) with CommunityFeed (Phase 4)
3. Define UnifiedCard and UnifiedUser data models that merge fields from all three phases
4. Implement Svelte stores for cross-component state synchronization
5. Use Pointer Events API for unified mouse/touch handling
6. Apply virtual scrolling for performance when rendering 100+ cards
7. Maintain backward compatibility by preserving /test and /gallery routes

## Technical Context

**Language/Version**: TypeScript 5.x with SvelteKit 4.2.12
**Primary Dependencies**:
- SvelteKit 4.2.12 (SSR framework)
- Svelte 4.x (reactive UI)
- Tailwind CSS 3.3.6 (styling)
- PocketBase (realtime database, auth, WebSocket)
- Vitest (unit testing)
- Playwright (E2E testing)

**Storage**: PocketBase (SQLite in dev, PostgreSQL in production)
**Testing**: Vitest (unit), Playwright (E2E), axe-core (accessibility), Chrome DevTools MCP (visual validation)
**Target Platform**: Web (Chrome, Safari, Firefox), Mobile Web (iOS Safari, Chrome Android)
**Project Type**: Web application (SvelteKit fullstack)
**Performance Goals**: 60fps holographic animations (16.67ms/frame), <3s Time to Interactive, <100MB memory
**Constraints**:
- 60fps NON-NEGOTIABLE (Constitution Principle III)
- Backward compatibility 100% (existing /test, /gallery pages must work)
- No layout thrashing (CSS transform/opacity only)
- WCAG 2.1 AA accessibility

**Scale/Scope**:
- 3 phases to integrate (Phase 1, 2, 4)
- 5-10 core components to refactor
- 6 data entities to merge (UnifiedCard, UnifiedUser, Collection, CommunityPost, KBOTeam, FanLevel)
- 100+ cards renderable simultaneously without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development ✅ PASS
- ✅ spec.md exists with User Stories, Requirements, Success Criteria
- ✅ plan.md (this file) defines technical approach
- ✅ tasks.md will be generated via `/speckit.tasks`
- **Status**: Compliant

### Principle II: Phase-Based Architecture ✅ PASS
- ✅ Phase 3 explicitly integrates Phase 1, 2, 4
- ✅ Dependencies documented in spec.md (Phase 1: holographic engine, Phase 2: CollectionDashboard, Phase 4: community)
- ✅ Backward compatibility requirement ensures existing phases remain independently testable
- ✅ Integration strategy uses UnifiedHolographicCard with context props to isolate phase-specific behavior
- **Status**: Compliant

### Principle III: 60fps Performance Standard (NON-NEGOTIABLE) ✅ PASS
- ✅ FR-021: "60fps(16.67ms/frame) 이상"
- ✅ SC-002: "평균 FPS 60 이상" (measured with Chrome DevTools)
- ✅ SC-009: "100개 카드 표시 시 60fps 유지"
- ✅ Technical approach uses CSS transforms, virtual scrolling, will-change optimization
- ✅ Chrome DevTools MCP validation required (Constitution)
- **Status**: Compliant - performance gates enforced

### Principle IV: Component Reusability ✅ PASS
- ✅ UnifiedHolographicCard designed with context prop ('test' | 'main' | 'gallery' | 'community')
- ✅ Props explicitly typed (TypeScript interfaces in spec.md Key Entities)
- ✅ Zero cross-phase knowledge (context prop isolates behavior)
- **Status**: Compliant

### Principle V: User-Centric Design ✅ PASS
- ✅ KBO fan culture integration (US3: team themes, fan levels, 응원 구단)
- ✅ Accessibility requirements (FR-022, FR-023: keyboard nav, WCAG 2.1 AA, Lighthouse 90+)
- ✅ Mobile-first (FR-025: 터치 입력 16ms 이내)
- **Status**: Compliant

### Performance Standards Check ✅ PASS
- ✅ Animation: 60fps (FR-021, SC-002)
- ✅ Initial Load: <3s Time to Interactive (FR-024, SC-003)
- ✅ Memory: <100MB (Constitution standard)
- ✅ Bundle Size: <500KB gzipped (Constitution standard)
- **Status**: All mandatory performance requirements addressed

### **Overall Gate Status: ✅ PASS** - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```
specs/002-integrated-holographic-platform/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── UnifiedHolographicCard.interface.ts
│   ├── IntegratedMainPage.interface.ts
│   └── data-migration.schema.json
├── checklists/
│   └── requirements.md  # Quality validation (completed)
└── tasks.md             # Phase 2 output (via /speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   ├── components/
│   │   ├── unified/                    # NEW: Integration layer
│   │   │   ├── UnifiedHolographicCard.svelte
│   │   │   ├── IntegratedMainPage.svelte
│   │   │   └── UnifiedCommunityFeed.svelte
│   │   ├── holographic/                # Phase 1 (existing)
│   │   │   └── HolographicCard.svelte
│   │   ├── CollectionDashboard.svelte  # Phase 2 (existing)
│   │   └── social/                     # Phase 4 (existing)
│   ├── stores/
│   │   ├── unified.ts                  # NEW: Unified state management
│   │   ├── cards.ts                    # Existing
│   │   └── user.ts                     # Existing
│   ├── types/
│   │   ├── unified.ts                  # NEW: UnifiedCard, UnifiedUser
│   │   └── [existing types]
│   └── utils/
│       ├── migration.ts                # NEW: Data migration helpers
│       └── performance.ts              # NEW: Virtual scrolling, 60fps monitoring
│
├── routes/
│   ├── +page.svelte                    # UPDATED: Use IntegratedMainPage
│   ├── +layout.svelte                  # UPDATED: Unified theme system
│   ├── test/+page.svelte               # PRESERVED: Phase 1 test page (backward compat)
│   └── gallery/+page.svelte            # PRESERVED: Phase 4 gallery (backward compat)
│
└── app.css                              # UPDATED: Unified theme variables

tests/
├── unit/
│   ├── UnifiedHolographicCard.test.ts  # NEW
│   ├── IntegratedMainPage.test.ts      # NEW
│   └── migration.test.ts               # NEW
├── integration/
│   ├── phase-integration.test.ts       # NEW: Cross-phase interaction tests
│   └── state-sync.test.ts              # NEW: Store synchronization tests
└── e2e/
    ├── unified-experience.spec.ts      # NEW: Consistent UX across pages
    └── performance.spec.ts             # NEW: 60fps validation
```

**Structure Decision**: Web application structure selected. Integration layer (`src/lib/components/unified/`) wraps existing Phase 1, 2, 4 components without modifying them directly, ensuring backward compatibility. Unified stores (`src/lib/stores/unified.ts`) provide single source of truth for card and user state across all phases.

## Complexity Tracking

*This section documents Constitution Check violations that require justification. Current status: NO VIOLATIONS.*

All Constitution principles are satisfied:
- Spec-Driven Development: Full spec → plan → tasks workflow
- Phase-Based Architecture: Explicit Phase 1+2+4 integration with documented dependencies
- 60fps Performance: Enforced via FR-021, SC-002, technical approach uses CSS transforms + virtual scrolling
- Component Reusability: UnifiedHolographicCard with context prop design
- User-Centric Design: KBO culture, accessibility, mobile-first requirements

**No complexity justifications required** - Plan aligns with all Constitution principles.
