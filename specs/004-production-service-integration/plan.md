# Implementation Plan: Production Service Integration

**Branch**: `004-production-service-integration` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-production-service-integration/spec.md`

## Summary

백엔드 환경(PocketBase + MinIO)과 연동하여 실제 서비스를 위한 프로덕션 개발. 사용자 인증, 파일 업로드, 카드 컬렉션 관리, 소셜 기능, 가챠 결과 저장 등 핵심 기능의 백엔드 통합 구현.

## Technical Context

**Language/Version**: TypeScript 5.x, Svelte 4.x, SvelteKit 2.x
**Primary Dependencies**: PocketBase SDK, MinIO (S3-compatible), @auth/sveltekit
**Storage**: PocketBase (SQLite → PostgreSQL), MinIO for files
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (Mobile-first responsive)
**Project Type**: Web application (SvelteKit fullstack)
**Performance Goals**: 60fps animations, <3s initial load, <10s upload (5MB)
**Constraints**: <100MB heap, 1000 concurrent users, 99.5% availability
**Scale/Scope**: 6 core service pages, 23 functional requirements, 5 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | spec.md created with requirements, acceptance criteria |
| II. Phase-Based Architecture | ✅ PASS | Integrates with existing Phase 4 community features |
| III. 60fps Performance | ✅ PASS | No new animations, existing holographic effects maintained |
| IV. Component Reusability | ✅ PASS | Service layer pattern ensures reusable API functions |
| V. User-Centric Design | ✅ PASS | Korean error messages, mobile-first approach |
| VI. Backend Integration | ✅ PASS | PocketBase + MinIO architecture specified |
| VII. Production Readiness | ✅ PASS | Loading states, error handling, empty states required |

**Gate Status**: ✅ PASSED - All principles satisfied

## Project Structure

### Documentation (this feature)

```
specs/004-production-service-integration/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth.yaml        # Authentication endpoints
│   ├── cards.yaml       # Card CRUD endpoints
│   ├── collections.yaml # Collection management
│   ├── social.yaml      # Social features (likes, comments)
│   └── gacha.yaml       # Gacha system endpoints
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec validation (complete)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```
src/
├── lib/
│   ├── services/           # Service layer (API calls)
│   │   ├── auth.ts         # Authentication logic
│   │   ├── authService.ts  # Auth state management
│   │   ├── cards.ts        # Card CRUD operations
│   │   ├── collections.ts  # Collection management
│   │   ├── socialService.ts # Likes, comments, shares
│   │   ├── uploadService.ts # File upload handling
│   │   ├── upload.ts       # MinIO integration
│   │   └── gachaService.ts # Gacha result saving (NEW)
│   ├── stores/             # Svelte stores
│   │   ├── authStore.ts    # Auth state
│   │   ├── gacha2Store.ts  # Gacha state
│   │   └── collectionStore.ts # Collection state (NEW)
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Auth-related components
│   │   ├── cards/          # Card display components
│   │   └── social/         # Social interaction components
│   └── pocketbase.ts       # PocketBase client setup
├── routes/
│   ├── api/                # Server-side API endpoints
│   │   ├── upload/         # File upload endpoints
│   │   │   ├── image/+server.ts
│   │   │   ├── base64/+server.ts
│   │   │   └── presign/+server.ts
│   │   └── gacha/+server.ts # Gacha results endpoint (NEW)
│   ├── auth/               # Authentication pages
│   │   ├── signin/+page.svelte
│   │   ├── register/+page.svelte
│   │   └── callback/+server.ts
│   ├── collections/+page.svelte
│   ├── community/+page.svelte
│   ├── create/+page.svelte
│   ├── gallery/+page.svelte
│   └── gacha2/+page.svelte
└── hooks.server.ts         # Auth middleware

tests/
├── unit/                   # Vitest unit tests
│   ├── services/
│   └── stores/
├── integration/            # Integration tests
│   └── api/
└── e2e/                    # Playwright E2E tests
    ├── auth.spec.ts
    ├── upload.spec.ts
    └── gacha.spec.ts
```

**Structure Decision**: Web application structure using SvelteKit's fullstack capabilities. Service layer pattern enforced per Constitution Principle VI. All API calls go through `src/lib/services/` with typed interfaces.

## Complexity Tracking

*No violations - all Constitution principles satisfied*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
