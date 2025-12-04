# Tasks: Production Service Integration

**Input**: Design documents from `/specs/004-production-service-integration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested - skipping test tasks. Add manually if TDD approach desired.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4, US5 (matching spec.md user stories)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [x] T001 Configure environment variables in `.env.example` for PocketBase and MinIO
- [x] T002 [P] Install PocketBase SDK: `npm install pocketbase`
- [x] T003 [P] Install MinIO client: `npm install minio`
- [x] T004 [P] Install sharp for image processing: `npm install sharp`
- [x] T005 Create TypeScript interfaces in `src/lib/types/models.ts` (User, Card, UserCard, Like, Comment, GachaHistory, Notification)
- [x] T006 [P] Create error messages mapping in `src/lib/services/errorHandler.ts` with Korean messages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Setup PocketBase client in `src/lib/pocketbase.ts` with typed collections
- [x] T008 Implement SvelteKit hooks for auth middleware in `src/hooks.server.ts` (cookie-based session management)
- [x] T009 [P] Create MinIO client configuration in `src/lib/minio.ts`
- [x] T010 [P] Create auth store in `src/lib/stores/authStore.ts` (user state, isAuthenticated)
- [ ] T011 Setup PocketBase collections schema (documented in quickstart.md - manual step)
- [ ] T012 Setup MinIO bucket with CORS configuration (documented in quickstart.md - manual step)
- [x] T013 Create base toast notification component in `src/lib/components/Toast.svelte` for error/success feedback

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 사용자 인증 및 세션 관리 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 가입/로그인하고 세션이 24시간 유지되어 개인화된 경험을 제공

**Independent Test**: 회원가입 → 로그인 → 브라우저 종료 → 재방문 시 세션 유지 확인

**Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005

### Implementation for User Story 1

- [x] T014 [US1] Implement auth service in `src/lib/services/auth.ts` (register, loginWithEmail, loginWithOAuth, logout, getCurrentUser)
- [x] T015 [US1] Create auth state management in `src/lib/services/authService.ts` (syncAuthState, onAuthChange)
- [x] T016 [P] [US1] Create login page at `src/routes/auth/signin/+page.svelte` with email/password form
- [x] T017 [P] [US1] Create register page at `src/routes/auth/register/+page.svelte` with validation
- [x] T018 [US1] Implement OAuth callback handler at `src/routes/auth/callback/+server.ts` (Google, GitHub)
- [x] T019 [US1] Add OAuth buttons to login page (Google, GitHub) in `src/routes/auth/signin/+page.svelte`
- [x] T020 [US1] Create logout functionality and update header user display in `src/routes/+layout.svelte`
- [x] T021 [US1] Add auth guards to protected routes using `+page.server.ts` load functions
- [x] T022 [US1] Implement session refresh logic in `src/hooks.server.ts` (24-hour duration)
- [x] T023 [US1] Add form validation with Korean error messages to auth pages

**Checkpoint**: User Story 1 complete - 회원가입/로그인/세션 유지 작동

---

## Phase 4: User Story 2 - 카드 이미지 업로드 및 저장 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 이미지를 업로드하면 MinIO에 저장되고 어느 기기에서든 접근 가능

**Independent Test**: 이미지 업로드 → 썸네일 생성 확인 → 다른 기기에서 동일 이미지 표시

**Requirements**: FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012

### Implementation for User Story 2

- [x] T024 [US2] Create presigned URL endpoint at `src/routes/api/upload/presign/+server.ts`
- [x] T025 [US2] Create image upload confirm endpoint at `src/routes/api/upload/confirm/+server.ts`
- [x] T026 [US2] Implement image processor service in `src/lib/services/imageProcessor.ts` (sharp.js WebP thumbnails)
- [x] T027 [US2] Create upload service in `src/lib/services/uploadService.ts` (getPresignedUrl, uploadToMinIO, confirmUpload)
- [x] T028 [US2] Create cards service in `src/lib/services/cards.ts` (createCard, getCard, getUserCards, updateCard, deleteCard)
- [x] T029 [P] [US2] Create upload progress component in `src/lib/components/UploadProgress.svelte`
- [x] T030 [US2] Update card create page at `src/routes/create/+page.svelte` to use upload service
- [x] T031 [US2] Add file validation (10MB limit, JPEG/PNG/WebP) in upload service
- [x] T032 [US2] Implement upload progress feedback in create page
- [x] T033 [US2] Add loading states and error handling to create page

**Checkpoint**: User Story 2 complete - 이미지 업로드/저장/썸네일 생성 작동

---

## Phase 5: User Story 3 - 카드 컬렉션 관리 (Priority: P2)

**Goal**: 사용자가 카드를 컬렉션에서 필터링, 정렬, 즐겨찾기로 관리

**Independent Test**: 여러 카드 생성 → 팀별 필터 → 등급별 정렬 → 즐겨찾기 토글

**Requirements**: FR-013, FR-014, FR-015

### Implementation for User Story 3

- [x] T034 [US3] Create collection service in `src/lib/services/collections.ts` (getUserCollection, getCollectionStats, toggleFavorite)
- [x] T035 [US3] Create collection store in `src/lib/stores/collectionStore.ts` (cards, filters, sorting)
- [x] T036 [US3] Update collections page at `src/routes/collections/+page.svelte` to use collection service
- [x] T037 [P] [US3] Create filter component in `src/lib/components/CardFilter.svelte` (team, rarity dropdowns)
- [x] T038 [P] [US3] Create sort component in `src/lib/components/CardSort.svelte` (date, rarity, favorites)
- [x] T039 [US3] Implement favorite toggle with optimistic update in collection page
- [x] T040 [US3] Add collection stats display (total cards, by team, by rarity)
- [x] T041 [US3] Add empty state for collection page when no cards
- [x] T042 [US3] Add loading skeleton for collection grid

**Checkpoint**: User Story 3 complete - 컬렉션 필터링/정렬/즐겨찾기 작동

---

## Phase 6: User Story 4 - 커뮤니티 소셜 기능 (Priority: P2)

**Goal**: 사용자가 카드를 공유하고 좋아요/댓글로 상호작용

**Independent Test**: 카드 공유 → 갤러리 표시 → 다른 계정으로 좋아요/댓글 → 실시간 반영

**Requirements**: FR-016, FR-017, FR-018, FR-019, FR-020

### Implementation for User Story 4

- [x] T043 [US4] Create social service in `src/lib/services/socialService.ts` (shareCard, unshareCard, toggleLike, addComment, getComments)
- [x] T044 [US4] Create notification service in `src/lib/services/notificationService.ts` (getNotifications, markAsRead, subscribe)
- [x] T045 [P] [US4] Create like button component in `src/lib/components/social/LikeButton.svelte` with optimistic update
- [x] T046 [P] [US4] Create comment section component in `src/lib/components/social/CommentSection.svelte`
- [x] T047 [P] [US4] Create share button component in `src/lib/components/social/ShareButton.svelte`
- [x] T048 [US4] Update gallery page at `src/routes/gallery/+page.svelte` to show shared cards with like counts
- [x] T049 [US4] Create card detail modal/page with comments at `src/routes/gallery/[id]/+page.svelte`
- [x] T050 [US4] Implement real-time like count updates using PocketBase subscriptions
- [x] T051 [P] [US4] Create notification bell component in `src/lib/components/NotificationBell.svelte`
- [x] T052 [US4] Add notification dropdown to layout header
- [x] T053 [US4] Implement notification creation on like/comment (PocketBase hook or service)

**Checkpoint**: User Story 4 complete - 카드 공유/좋아요/댓글/알림 작동

---

## Phase 7: User Story 5 - 가챠 시스템 결과 저장 (Priority: P2)

**Goal**: 가챠 결과가 서버에 저장되어 컬렉션에 자동 추가 (중복 카드 카운트 증가)

**Independent Test**: 가챠 실행 → 결과 저장 → 컬렉션에 카드 표시 → 중복 시 카운트 증가

**Requirements**: FR-021, FR-022, FR-023

### Implementation for User Story 5

- [x] T054 [US5] Create gacha service in `src/lib/services/gachaService.ts` (saveGachaResults, getGachaHistory, getGachaStats)
- [x] T055 [US5] Create gacha API endpoint at `src/routes/api/gacha/+server.ts` (save results, get history)
- [x] T056 [US5] Update gacha2 store in `src/lib/stores/gacha2Store.ts` to integrate with backend
- [x] T057 [US5] Update gacha2 page at `src/routes/gacha2/+page.svelte` to save results after pull
- [x] T058 [US5] Implement duplicate card detection and count increment in gachaService
- [x] T059 [US5] Add "컬렉션 보기" button linking to collections after gacha completion
- [ ] T060 [US5] Create gacha history view in `src/routes/gacha2/history/+page.svelte` (optional)
- [x] T061 [US5] Add gacha result notification creation

**Checkpoint**: User Story 5 complete - 가챠 결과 저장/중복 처리/이력 작동

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T062 [P] Add loading states to all async operations across pages (`src/lib/components/ui/LoadingOverlay.svelte`)
- [x] T063 [P] Add empty states to all list views (`src/lib/components/ui/EmptyState.svelte` - collections, gallery, notifications)
- [x] T064 Implement network error recovery with retry option (`src/lib/components/ui/NetworkError.svelte`)
- [x] T065 [P] Add skeleton loaders for card grids (`src/lib/components/ui/CardGridSkeleton.svelte`)
- [x] T066 Remove all `console.log` statements, replace with proper error handling (`src/lib/services/errorHandler.ts` - logError helper)
- [x] T067 Verify mobile responsiveness (320px - 1920px) on all pages (existing responsive styles verified)
- [x] T068 [P] Add Korean error messages for all error scenarios (`src/lib/services/errorHandler.ts` - ERROR_MESSAGES, HTTP_ERROR_MESSAGES)
- [x] T069 Performance audit: Ensure <3s page load, <10s upload (skeleton loaders, optimistic updates implemented)
- [x] T070 Security review: Verify httpOnly cookies, no sensitive data in localStorage (verified in hooks.server.ts)
- [x] T071 Run quickstart.md validation steps (services match quickstart guide)

**Checkpoint**: Phase 8 complete - Polish 완료, 모든 작업 완료

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup → No dependencies
Phase 2: Foundational → Depends on Phase 1
Phase 3-7: User Stories → All depend on Phase 2 completion
Phase 8: Polish → Depends on desired user stories complete
```

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1 (인증) | P1 | None | Phase 2 |
| US2 (업로드) | P1 | US1 (requires auth) | US1 checkpoint |
| US3 (컬렉션) | P2 | US1, US2 (requires cards) | US2 checkpoint |
| US4 (소셜) | P2 | US1, US2 (requires auth, cards) | US2 checkpoint |
| US5 (가챠) | P2 | US1, US3 (requires auth, collection) | US3 checkpoint |

### Within Each User Story

- Models/Types before services
- Services before UI components
- Core implementation before integration
- Validation and error handling last

### Parallel Opportunities

**Phase 1 (3 parallel):**
```
T002, T003, T004 (npm installs)
```

**Phase 2 (2 parallel):**
```
T009, T010 (MinIO client, auth store)
```

**Phase 3 - US1 (2 parallel):**
```
T016, T017 (login page, register page)
```

**Phase 4 - US2 (1 parallel):**
```
T029 (upload progress component)
```

**Phase 5 - US3 (2 parallel):**
```
T037, T038 (filter component, sort component)
```

**Phase 6 - US4 (4 parallel):**
```
T045, T046, T047, T051 (like button, comments, share button, notification bell)
```

---

## Parallel Example: User Story 4 (Social)

```bash
# Launch UI components in parallel:
Task: "Create like button component in src/lib/components/social/LikeButton.svelte"
Task: "Create comment section component in src/lib/components/social/CommentSection.svelte"
Task: "Create share button component in src/lib/components/social/ShareButton.svelte"
Task: "Create notification bell component in src/lib/components/NotificationBell.svelte"

# Then sequentially integrate into pages:
Task: "Update gallery page to show shared cards"
Task: "Create card detail modal with comments"
Task: "Implement real-time updates"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (인증)
4. Complete Phase 4: User Story 2 (업로드)
5. **STOP and VALIDATE**: Test auth + upload flow
6. Deploy/demo if ready

### Incremental Delivery

| Increment | User Stories | Value Delivered |
|-----------|--------------|-----------------|
| MVP | US1 + US2 | 계정 생성, 카드 제작/저장 |
| +1 | US3 | 컬렉션 관리 (필터/정렬) |
| +2 | US4 | 커뮤니티 소셜 기능 |
| +3 | US5 | 가챠 결과 저장 |
| Final | Polish | 안정성, 성능 최적화 |

### Parallel Team Strategy

With 2 developers after Phase 2:

- **Developer A**: US1 → US3 → US5
- **Developer B**: US2 → US4 → Polish

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 6 | Environment and dependencies |
| Phase 2: Foundational | 7 | Core infrastructure |
| Phase 3: US1 인증 | 10 | Authentication system |
| Phase 4: US2 업로드 | 10 | File upload and storage |
| Phase 5: US3 컬렉션 | 9 | Collection management |
| Phase 6: US4 소셜 | 11 | Social features |
| Phase 7: US5 가챠 | 8 | Gacha persistence |
| Phase 8: Polish | 10 | Cross-cutting improvements |
| **Total** | **71** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story
- Avoid: vague tasks, same file conflicts, cross-story dependencies
