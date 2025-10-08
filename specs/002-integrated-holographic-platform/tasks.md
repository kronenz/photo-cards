---
description: "Implementation tasks for Integrated Holographic Platform"
---

# Tasks: Integrated Holographic Platform

**Feature**: 002-integrated-holographic-platform
**Input**: Design documents from `/specs/002-integrated-holographic-platform/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are included as this feature requires validation of 60fps performance (NON-NEGOTIABLE) and cross-phase integration.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions
- **Project Type**: SvelteKit 4.2.12 web application (single project)
- **Paths**: `src/` at repository root
- **Tests**: `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the integration layer

- [x] T001 [P] Install @tanstack/svelte-virtual dependency for virtual scrolling
- [x] T002 [P] Install svelte-gestures dependency for unified pointer events
- [x] T003 [P] Install @vitest/ui for test development (if not present)
- [x] T004 Create `src/lib/types/unified.ts` with UnifiedCard and UnifiedUser TypeScript interfaces
- [x] T005 Create `src/lib/components/unified/` directory for integration layer components
- [x] T006 Create `src/lib/stores/unified.ts` for global state management
- [x] T007 [P] Update `tailwind.config.js` to safelist holographic blend modes
- [x] T008 [P] Create `src/lib/types/svelte-gestures.d.ts` type declaration file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create `src/lib/utils/migration.ts` with data migration helper functions (Phase 1→Unified, Phase 2→Unified, Phase 4→Unified)
- [x] T010 [P] Create `src/lib/utils/performance.ts` with 60fps monitoring utilities (Chrome DevTools Performance API wrapper)
- [x] T011 [P] Create `src/lib/stores/unified.ts` with unifiedCards, currentUser, and teamTheme derived stores
- [x] T012 Update `src/lib/types/unified.ts` with Collection, CommunityPost, KBOTeam, FanLevel interfaces
- [x] T013 Create `src/lib/components/adapters/` directory for backward compatibility adapters
- [x] T014 [P] Setup PocketBase migration script template in `pocketbase/migrations/002_unified_platform.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Unified Holographic Card System (Priority: P1) 🎯 MVP

**Goal**: Provide consistent holographic card experience across all contexts (test, main, gallery, community)

**Independent Test**: User views same card on /test, /, /gallery pages and experiences identical holographic effects, flip animations, and touch responsiveness

### Tests for User Story 1 (Performance & Cross-Phase Validation)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] Create `tests/unit/UnifiedHolographicCard.test.ts` - Test flip state transitions, holographic param calculations, context prop behavior
- [x] T016 [P] [US1] Create `tests/integration/phase-integration.test.ts` - Test UnifiedHolographicCard renders consistently across /test, /, /gallery routes
- [x] T017 [P] [US1] Create `tests/e2e/unified-experience.spec.ts` - Test user can flip cards and see holographic effects on all pages
- [x] T018 [US1] Create `tests/e2e/performance.spec.ts` - Test 60fps validation using Playwright (measure frame times during card interactions)

### Implementation for User Story 1

- [x] T019 [P] [US1] Create `src/lib/components/unified/UnifiedHolographicCard.svelte` - Implement card component with context prop ('test'|'main'|'gallery'|'community')
- [x] T020 [US1] Implement holographic effect logic in UnifiedHolographicCard (overlay/soft-light blend modes, intensity control)
- [x] T021 [US1] Implement card flip animation (Y-axis 180deg rotation, 600ms duration, isAnimating state)
- [x] T022 [US1] Implement pointer events handling (unified mouse/touch using Pointer Events API or svelte-gestures)
- [x] T023 [US1] Add Svelte context API for card state (isFlipped, isAnimating, holographicParams stores)
- [x] T024 [US1] Implement size variants (small, medium, large, featured) with responsive CSS classes
- [x] T025 [US1] Add accessibility features (ARIA attributes, keyboard navigation: Tab/Enter/Space/Esc, focus indicators)
- [x] T026 [P] [US1] Create `src/lib/components/adapters/EnhancedCardAdapter.svelte` - Wrap legacy Phase 1 Enhanced Card for backward compatibility
- [x] T027 [US1] Update `src/routes/test/+page.svelte` to showcase UnifiedHolographicCard alongside legacy EnhancedCard
- [x] T028 [US1] Add error handling for image load failures in UnifiedHolographicCard

**Checkpoint**: At this point, User Story 1 should be fully functional - cards work consistently across all pages with 60fps performance

---

## Phase 4: User Story 2 - Integrated Main Page with Collection Focus (Priority: P1) 🎯 MVP

**Goal**: Unified main page combining CollectionDashboard, CommunityFeed, KBOTeamsSection

**Independent Test**: User accesses main page, sees latest 3 cards, collection progress, community feed, and can navigate all sections

### Tests for User Story 2 (Layout Integration)

- [x] T029 [P] [US2] Create `tests/unit/IntegratedMainPage.test.ts` - Test section visibility, layout rendering, user prop handling ✅
- [x] T030 [P] [US2] Create `tests/integration/state-sync.test.ts` - Test stores synchronize between CollectionDashboard and CommunityFeed ✅
- [x] T031 [US2] Create `tests/e2e/main-page-navigation.spec.ts` - Test user can navigate from main page to collections, feed, teams ✅

### Implementation for User Story 2

- [x] T032 [P] [US2] Create `src/lib/components/unified/IntegratedMainPage.svelte` - Main layout component with sections (hero, collection-dashboard, kbo-teams, community-feed, recommendations) ✅
- [x] T033 [US2] Integrate existing CollectionDashboard component into IntegratedMainPage ✅
- [x] T034 [US2] Implement CollectionDashboard configuration (latestCardsCount: 3, showProgress: true, showStats: true, maxCollections: 5) ✅
- [x] T035 [US2] Integrate existing CommunityFeed component (Phase 4) into IntegratedMainPage ✅
- [x] T036 [US2] Implement CommunityFeed configuration (layout: 'masonry', columns: 3, postsPerPage: 20, filter: 'following', infiniteScroll: true) ✅
- [x] T037 [P] [US2] Create `src/lib/components/unified/ShowoffModal.svelte` - Modal for selecting and posting cards to community ✅
- [x] T038 [US2] Implement "자랑하기" button in CollectionDashboard that opens ShowoffModal ✅
- [x] T039 [US2] Update `src/routes/+page.svelte` to use IntegratedMainPage component ✅
- [x] T040 [US2] Implement responsive breakpoints (mobile: 1 col, tablet: 2 col, desktop: 3 col) in IntegratedMainPage ✅
- [x] T041 [US2] Add infinite scroll loading indicator and loadmore event handler ✅

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - cards display consistently, main page integrates all sections

---

## Phase 5: User Story 5 - Performance & Accessibility Optimization (Priority: P1) 🎯 MVP

**Goal**: Ensure 60fps, keyboard navigation, screen reader support, mobile optimization

**Independent Test**: Chrome DevTools shows 60+ FPS during interactions, Lighthouse accessibility score ≥90, mobile touch responds in <16ms

### Tests for User Story 5 (Performance Validation - NON-NEGOTIABLE)

- [x] T042 [P] [US5] Create `tests/performance/fps-validation.test.ts` - Automated FPS measurement using Chrome DevTools Performance API ✅
- [x] T043 [P] [US5] Create `tests/accessibility/keyboard-nav.test.ts` - Test Tab/Enter/Space/Esc navigation with axe-core ✅
- [x] T044 [P] [US5] Create `tests/accessibility/screen-reader.test.ts` - Test ARIA labels and announcements ✅
- [ ] T045 [US5] Create `tests/e2e/mobile-touch.spec.ts` - Test touch responsiveness on mobile viewport

### Implementation for User Story 5

- [x] T046 [P] [US5] Implement virtual scrolling in IntegratedMainPage using @tanstack/svelte-virtual for 100+ cards ✅
- [x] T047 [US5] Add CSS GPU acceleration hints (will-change: transform, translateZ(0)) to UnifiedHolographicCard ✅
- [ ] T048 [US5] Implement throttled mouse move handler (16ms throttle) in UnifiedHolographicCard
- [ ] T049 [US5] Add performance monitoring in dev mode (FPS counter overlay) using src/lib/utils/performance.ts
- [ ] T050 [US5] Optimize Tailwind CSS bundle with PurgeCSS configuration
- [ ] T051 [US5] Add lazy loading for card images with loading="lazy" attribute
- [ ] T052 [US5] Implement keyboard focus trap in ShowoffModal
- [ ] T053 [US5] Add skip links for main page sections (Skip to collection, Skip to feed, Skip to teams)
- [ ] T054 [US5] Test cross-browser rendering (Chrome, Safari, Firefox) and fix inconsistencies

**Checkpoint**: All P1 user stories (1, 2, 5) complete - MVP is ready with guaranteed 60fps performance

---

## Phase 6: User Story 3 - KBO Fan Culture Integration (Priority: P2)

**Goal**: Korean baseball culture integration with team themes, fan levels, special events

**Independent Test**: User selects favorite team (LG Twins), main page changes to purple theme, fan level upgrades from "외야석 팬" to "응원단 멤버" after activity

### Tests for User Story 3 (Theme & Leveling System)

- [x] T055 [P] [US3] Create `tests/unit/KBOTeamsSection.test.ts` - Test team selection, theme application, fan level calculations
- [x] T056 [P] [US3] Create `tests/integration/team-theme.test.ts` - Test theme changes propagate to all components
- [x] T057 [US3] Create `tests/e2e/fan-level-progression.spec.ts` - Test user activity increases fan level with visual feedback

### Implementation for User Story 3

- [x] T058 [P] [US3] Create `src/lib/components/unified/KBOTeamsSection.svelte` - Display 10 KBO teams with team colors and logos
- [x] T059 [US3] Implement team selection handler that updates currentUser.fanProfile.favoriteTeam in stores
- [x] T060 [US3] Update `src/routes/+layout.svelte` to apply teamTheme from unified stores (CSS variables for primary/secondary colors)
- [x] T061 [P] [US3] Create `src/lib/data/kbo-teams.ts` - Static data for 10 KBO teams (LG, Doosan, KIA, Samsung, Lotte, SSG, NC, Hanwha, KT, Kiwoom) with colors, logos, mascots
- [x] T062 [P] [US3] Create `src/lib/data/fan-levels.ts` - Static data for 5 fan levels (야구 입문자, 외야석 팬, 응원단 멤버, 시즌권 홀더, 구단 레전드) with requiredPoints and perks
- [x] T063 [US3] Implement fan level calculation logic in `src/lib/utils/fan-level.ts` - Check user points and upgrade level
- [x] T064 [US3] Add fan level upgrade notification component (toast/modal) with celebration animation
- [x] T065 [P] [US3] Create `src/lib/components/unified/TodayGameBanner.svelte` - Display today's game info (opponent, time, score) for user's favorite team
- [x] T066 [US3] Integrate TodayGameBanner into IntegratedMainPage hero section
- [x] T067 [US3] Add special event banner support in IntegratedMainPage (Korean Series, All-Star Game) with conditional rendering
- [x] T068 [P] [US3] Create `src/routes/fanclub/[teamId]/+page.svelte` - Team-specific fanclub page with team theme, fan rankings, team cards

**Checkpoint**: User Story 3 complete - KBO fan culture features integrated, main page supports team themes

---

## Phase 7: User Story 4 - Unified Community System (Priority: P2)

**Goal**: Integrated community features (card sharing, likes, comments, follow, templates) in main page

**Independent Test**: User uploads card to community feed, likes another user's card, follows creator, sees personalized feed

### Tests for User Story 4 (Social Features)

- [x] T069 [P] [US4] Create `tests/unit/UnifiedCommunityFeed.test.ts` - Test post rendering, filter logic, pagination
- [x] T070 [P] [US4] Create `tests/integration/social-actions.test.ts` - Test like/comment/follow actions update stores and trigger notifications
- [x] T071 [US4] Create `tests/e2e/community-workflow.spec.ts` - Test user shares card, receives like notification, follows creator

### Implementation for User Story 4

- [x] T072 [P] [US4] Create `src/lib/components/unified/UnifiedCommunityFeed.svelte` - Wrapper for Phase 4 CommunityFeed with unified stores
- [x] T073 [US4] Implement card sharing flow: ShowoffModal → create CommunityPost → update unifiedCards store → trigger PocketBase realtime notification
- [x] T074 [US4] Implement like action: update card.community.metadata.likes → save to PocketBase → send notification to creator
- [x] T075 [US4] Implement comment system: add comment to CommunityPost → update PocketBase → notify creator
- [x] T076 [US4] Implement follow system: update UnifiedUser.creatorProfile.stats.followers → save to PocketBase → send notification
- [x] T077 [US4] Implement personalized feed algorithm: prioritize followed creators' cards in CommunityFeed
- [x] T078 [P] [US4] Create `src/lib/components/unified/NotificationCenter.svelte` - Display realtime notifications (likes, comments, follows, new cards)
- [x] T079 [US4] Add NotificationCenter to IntegratedMainPage header with notification count badge
- [x] T080 [US4] Implement "템플릿으로 저장" button in card detail view that creates template entry in PocketBase
- [x] T081 [US4] Update ShowoffModal to support visibility options (public, fanclub, followers)

**Checkpoint**: All user stories (1, 2, 3, 4, 5) complete - Full integrated platform functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T082 [P] Run Lighthouse performance audit on all pages (/, /test, /gallery, /fanclub/*)- ensure score ≥90
- [ ] T083 [P] Run Lighthouse accessibility audit - ensure score ≥90 across all pages
- [ ] T084 [P] Create `docs/integration-guide.md` - Document how to use UnifiedHolographicCard and IntegratedMainPage
- [ ] T085 Validate quickstart.md by following all steps from scratch
- [ ] T086 [P] Add error boundaries to all unified components (UnifiedHolographicCard, IntegratedMainPage, UnifiedCommunityFeed)
- [ ] T087 [P] Add loading states for async operations (collection loading, feed loading, team data loading)
- [ ] T088 Implement data migration script execution: migrate Phase 1 test data to UnifiedCard format
- [ ] T089 [P] Add analytics tracking for user interactions (card flip, team selection, community actions)
- [ ] T090 Run full E2E test suite and fix any failures
- [ ] T091 [P] Performance optimization pass: bundle size analysis, code splitting, lazy loading
- [ ] T092 Security review: XSS prevention in community posts, CSRF protection, rate limiting
- [ ] T093 [P] Update CLAUDE.md with Phase 3 integration status and file locations
- [ ] T094 Create deployment checklist (PocketBase migration, environment variables, Vercel config)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
  - **User Story 2 (P1)**: Can start after Foundational - Depends on US1 for UnifiedHolographicCard
  - **User Story 5 (P1)**: Can start after US1, US2 - Optimizes existing components
  - **User Story 3 (P2)**: Can start after US1, US2 - Extends IntegratedMainPage
  - **User Story 4 (P2)**: Can start after US1, US2 - Extends community features
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
       ↓
   ┌───┴───┐
   ↓       ↓
  US1 ──→ US2 ──→ US5 (P1 stories - MVP)
   │       │
   └───┬───┘
       ↓
   ┌───┴───┐
   ↓       ↓
  US3     US4 (P2 stories - enhancements)
```

- **US1 (P1)**: No dependencies beyond Foundational
- **US2 (P1)**: Uses UnifiedHolographicCard from US1
- **US5 (P1)**: Optimizes US1 and US2 components
- **US3 (P2)**: Extends US2 (IntegratedMainPage) with KBO features
- **US4 (P2)**: Extends US2 (IntegratedMainPage) with community features

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Models/Types → Stores → Components → Integration
3. Core functionality → Edge cases → Error handling
4. Story validated independently before next story

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T001, T002, T003 (npm installs)
- T007, T008 (config files)

**Foundational Phase (Phase 2)**:
- T009, T010 (utils)
- T011, T012 (stores & types)

**User Story 1 Tests (Phase 3)**:
- T015, T016, T017, T018 (all tests in parallel)

**User Story 1 Implementation (Phase 3)**:
- T019, T026 (UnifiedHolographicCard, EnhancedCardAdapter - different files)

**User Story 2 Tests (Phase 4)**:
- T029, T030 (unit & integration tests in parallel)

**User Story 2 Implementation (Phase 4)**:
- T032, T037 (IntegratedMainPage, ShowoffModal - different files)

**User Story 3 Implementation (Phase 6)**:
- T058, T061, T062, T065 (component + data files in parallel)

**User Story 4 Implementation (Phase 7)**:
- T072, T078 (UnifiedCommunityFeed, NotificationCenter - different files)

**Polish Phase (Phase 8)**:
- T082, T083, T084 (audits and docs in parallel)
- T086, T087, T089, T091, T092, T093 (independent improvements)

---

## Parallel Example: User Story 1 (MVP Core)

```bash
# Step 1: Launch all tests for User Story 1 together:
Task: "Create tests/unit/UnifiedHolographicCard.test.ts"
Task: "Create tests/integration/phase-integration.test.ts"
Task: "Create tests/e2e/unified-experience.spec.ts"
Task: "Create tests/e2e/performance.spec.ts"

# Step 2: Verify all tests FAIL

# Step 3: Launch parallel implementation tasks:
Task: "Create UnifiedHolographicCard.svelte"
Task: "Create EnhancedCardAdapter.svelte"

# Step 4: Complete sequential tasks:
Task: "Implement holographic effect logic"
Task: "Implement card flip animation"
Task: "Implement pointer events handling"
Task: "Add Svelte context API"
Task: "Implement size variants"
Task: "Add accessibility features"
Task: "Update test page to use adapter"
Task: "Add error handling"

# Step 5: Verify all tests PASS
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 5 Only - P1 Stories)

1. ✅ Complete Phase 1: Setup (T001-T008)
2. ✅ Complete Phase 2: Foundational (T009-T014) - CRITICAL BLOCKER
3. ✅ Complete Phase 3: User Story 1 (T015-T028) - Unified card system
4. ✅ Complete Phase 4: User Story 2 (T029-T041) - Integrated main page
5. ✅ Complete Phase 5: User Story 5 (T042-T054) - Performance & accessibility
6. **STOP and VALIDATE**: Test P1 stories independently, run Lighthouse, measure FPS
7. Deploy/demo MVP if ready (60fps guaranteed, main page functional)

### Incremental Delivery

1. **Foundation**: Setup + Foundational (T001-T014)
2. **MVP Release v1.0**: US1 + US2 + US5 (T015-T054)
   - Unified cards work across pages at 60fps
   - Main page integrates collection + community
   - Keyboard accessible, Lighthouse ≥90
3. **Enhancement Release v1.1**: US3 (T055-T068)
   - Add KBO fan culture (team themes, fan levels)
4. **Social Release v1.2**: US4 (T069-T081)
   - Add unified community features (sharing, following)
5. **Production Release v1.3**: Polish (T082-T094)
   - Performance tuning, security hardening, deployment

### Parallel Team Strategy

With 3 developers after Foundational phase complete:

- **Developer A**: User Story 1 (T015-T028) - Card system
- **Developer B**: User Story 2 (T029-T041) - Main page (waits for T019 from Dev A)
- **Developer C**: User Story 5 tests (T042-T045) - Performance validation

Then all 3 converge on User Story 5 implementation (T046-T054).

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] label**: Maps task to specific user story for traceability
- **60fps NON-NEGOTIABLE**: Tests T018, T042 validate this Constitution requirement
- **Independent testing**: Each user story has acceptance criteria from spec.md
- **Backward compatibility**: Tasks T026, T027 ensure /test page still works
- **Commit strategy**: Commit after each task or logical group (e.g., all US1 tests)
- **Checkpoints**: Stop at each checkpoint to validate story independently
- **Constitution compliance**: All P1 stories must pass before P2 stories begin

## Performance Gates (NON-NEGOTIABLE)

- [ ] **Gate 1** (After T018): Performance tests pass - 60fps validated during card interactions
- [ ] **Gate 2** (After T042): Automated FPS measurement confirms ≥55 avg FPS, <5% frame drops
- [ ] **Gate 3** (After T054): Cross-browser testing shows consistent 60fps on Chrome, Safari, Firefox
- [ ] **Gate 4** (After T082): Lighthouse Performance score ≥90 on all pages

**If any gate fails**: Stop, optimize, re-test. Do NOT proceed to next phase until 60fps is achieved.

---

**Total Tasks**: 94
**MVP Tasks (P1)**: T001-T054 (54 tasks)
**Enhancement Tasks (P2)**: T055-T081 (27 tasks)
**Polish Tasks**: T082-T094 (13 tasks)

**Parallel Opportunities**: 22 tasks marked [P] can run concurrently
**Estimated MVP Duration**: 2-3 weeks (1 week foundation + 1-2 weeks P1 stories)
**Estimated Full Feature Duration**: 4-6 weeks (MVP + P2 stories + polish)
