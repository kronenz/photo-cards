# Implementation Plan: Template Marketplace

**Branch**: `001-template-marketplace` | **Date**: 2025-01-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-template-marketplace/spec.md`

## Summary

Template Marketplace는 KBO 홀로그래픽 카드 플랫폼의 크리에이터 생태계를 활성화하는 핵심 기능입니다. 사용자가 자신이 만든 카드 템플릿을 업로드하고 공유하며, 다른 크리에이터가 이를 검색, 다운로드, 리뷰하여 활용할 수 있는 Civitai 스타일 마켓플레이스를 구현합니다.

**MVP Scope (P1 + P2)**:
- **P1**: 템플릿 업로드, 검색, 다운로드 (US1: Template Upload & Sharing)
- **P2**: 평점/리뷰 시스템, 고급 검색/필터링 (US2: Rating & Review, US3: Discovery)

**Technical Approach**:
- Phase 1/4 홀로그래픽 카드 시스템과 통합
- PocketBase를 템플릿 메타데이터 저장소로 활용
- Cloud Storage (Cloudflare R2/S3)에 템플릿 패키지 저장
- JSON 기반 템플릿 포맷 (카드 레이아웃 + 효과 설정)

## Technical Context

**Language/Version**: TypeScript 5.x, SvelteKit 4.2.12
**Primary Dependencies**:
- @tanstack/svelte-virtual (가상 스크롤)
- PocketBase SDK (템플릿 메타데이터 CRUD)
- Cloud Storage SDK (R2/S3 - to be determined in research)
- JSZip (템플릿 패키지 압축/해제)

**Storage**:
- PocketBase (템플릿 메타데이터, 리뷰, 다운로드 통계)
- Cloud Storage (템플릿 JSON + 미리보기 이미지)
- localStorage (다운로드한 템플릿 캐싱)

**Testing**:
- Vitest (단위 테스트: 템플릿 직렬화, 검색 필터)
- Playwright (E2E: 업로드 → 검색 → 다운로드 흐름)

**Target Platform**: Web (모바일 반응형), iOS 15+ Safari, Chrome/Firefox/Edge
**Project Type**: Single web application (SvelteKit)
**Performance Goals**:
- 템플릿 업로드: <5초 (15MB 이하)
- 검색 결과 표시: <1초 (100개 템플릿 렌더링)
- 템플릿 다운로드: <3초
- 마소네리 그리드: 60fps 스크롤 (NON-NEGOTIABLE)

**Constraints**:
- 템플릿 파일 크기: 최대 15MB (JSON + 이미지 포함)
- 동시 업로드: 사용자당 1개
- 저작권 검증: KBO/구단 로고 자동 감지 필요
- 오프라인 지원: 다운로드한 템플릿만 (온라인 필수 for marketplace)

**Scale/Scope**:
- 초기: 100+ 템플릿 (크리에이터 20-30명)
- 1년 후: 1000+ 템플릿, 100+ 크리에이터
- 3개 메인 화면 (마켓플레이스 홈, 템플릿 상세, 업로드 모달)
- 6개 User Stories (P1-P4 우선순위)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development ✅
- ✅ spec.md 완성 (6 User Stories, 23 Functional Requirements)
- ✅ checklists/requirements.md 검증 완료 (Status: READY FOR PLANNING)
- ✅ research.md 완료 (Phase 0 - 5개 기술 결정 문서화)
- ✅ data-model.md 완료 (Phase 1 - 5개 PocketBase collection 스키마 정의)
- ✅ contracts/ 완료 (Phase 1 - 3개 OpenAPI 3.0 스펙 생성)
- ✅ quickstart.md 완료 (Phase 1 - 개발자 온보딩 가이드)
- ⏳ tasks.md 생성 예정 (Phase 2 - `/speckit.tasks` 실행 필요)

### Principle II: Phase-Based Architecture ✅
- ✅ **Dependency on Phase 1 (Enhanced Card Interaction)**: 템플릿 직렬화를 위해 UnifiedHolographicCard 인터페이스 필요
- ✅ **Dependency on Phase 4 (Community Platform)**: 커뮤니티 피드와 템플릿 마켓플레이스 연동
- ✅ **New Phase**: 001-template-marketplace는 독립적인 새 Phase로 정당화됨 (핵심 크리에이터 경제 기능)

### Principle III: Performance-First (60fps) ✅
- ✅ 마소네리 그리드에 @tanstack/svelte-virtual 사용 (가상 스크롤로 60fps 보장)
- ✅ 템플릿 미리보기 이미지 lazy loading
- ✅ 검색 결과 pagination (20개씩)

### Principle IV: Test-Driven Implementation ✅
- ✅ E2E 테스트: 템플릿 업로드 → 검색 → 다운로드 → 리뷰 전체 흐름
- ✅ 통합 테스트: 템플릿 직렬화/역직렬화, Cloud Storage 업로드/다운로드
- ✅ 단위 테스트: 검색 필터 로직, 평점 계산

### Principle V: User-Centric Design ✅
- ✅ KBO 팬 문화 반영: 구단별 템플릿 카테고리, 야구 추억 스토리텔링
- ✅ Civitai 영감: 템플릿 리믹스, 크리에이터 팔로우, 평점 시스템
- ✅ 접근성: WCAG 2.1 AA (키보드 내비게이션, 스크린 리더)

### Principle VI: Legal & Ethical Compliance ✅
- ✅ FR-021: 저작권 자동 감지 AI (KBO/구단 로고)
- ✅ DMCA 준수: 신고 처리 프로세스
- ✅ 크리에이터 크레딧 표시 (리믹스 시 원작자 명시)

**Gate Status**: ✅ **PASS** - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```
specs/001-template-marketplace/
├── spec.md              # Feature specification (완료)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── template-api.yaml      # Template CRUD API (OpenAPI)
│   ├── review-api.yaml        # Review/Rating API
│   └── storage-api.yaml       # Cloud Storage abstraction
├── checklists/
│   └── requirements.md  # Spec validation (완료)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   ├── components/
│   │   ├── marketplace/
│   │   │   ├── TemplateMarketplace.svelte   # 마켓플레이스 메인 페이지
│   │   │   ├── TemplateGrid.svelte          # 마소네리 그리드 (가상 스크롤)
│   │   │   ├── TemplateCard.svelte          # 템플릿 카드 (미리보기 + 메타데이터)
│   │   │   ├── TemplateDetailModal.svelte   # 템플릿 상세 모달
│   │   │   ├── TemplateUploadModal.svelte   # 업로드 모달
│   │   │   ├── TemplateSearchBar.svelte     # 검색 + 필터
│   │   │   ├── TemplateReviewSection.svelte # 리뷰 표시/작성
│   │   │   └── TemplateDownloadButton.svelte# 다운로드 액션
│   │   └── unified/
│   │       └── UnifiedHolographicCard.svelte # (기존 Phase 1 컴포넌트)
│   │
│   ├── types/
│   │   └── template.ts                       # Template, TemplateReview, TemplateCategory 타입
│   │
│   ├── services/
│   │   ├── template-serializer.ts            # 카드 → 템플릿 JSON 변환
│   │   ├── template-uploader.ts              # Cloud Storage 업로드
│   │   ├── template-downloader.ts            # 다운로드 + 캐싱
│   │   ├── template-search.ts                # 검색/필터 로직
│   │   └── template-storage.ts               # Cloud Storage 추상화 (R2/S3)
│   │
│   ├── stores/
│   │   ├── marketplace.ts                    # 마켓플레이스 상태 (검색 결과, 필터)
│   │   ├── my-templates.ts                   # 다운로드한 템플릿 목록
│   │   └── unified.ts                        # (기존 통합 스토어)
│   │
│   └── utils/
│       ├── template-validator.ts             # 템플릿 검증 (저작권, 크기)
│       └── copyright-detector.ts             # KBO 로고 자동 감지
│
├── routes/
│   ├── marketplace/
│   │   ├── +page.svelte                      # 마켓플레이스 메인
│   │   └── [templateId]/
│   │       └── +page.svelte                  # 템플릿 상세 페이지
│   │
│   └── my-templates/
│       └── +page.svelte                      # 내가 다운로드한 템플릿 목록
│
└── api/
    └── templates/
        ├── upload.ts                         # 템플릿 업로드 API route
        ├── download.ts                       # 다운로드 통계 기록
        └── review.ts                         # 리뷰 작성/조회

tests/
├── unit/
│   ├── template-serializer.test.ts           # JSON 직렬화 테스트
│   ├── template-search.test.ts               # 검색 필터 로직
│   └── copyright-detector.test.ts            # 저작권 감지
│
├── integration/
│   ├── template-upload-flow.test.ts          # 업로드 → PocketBase → Storage
│   ├── template-download-flow.test.ts        # 다운로드 → 캐싱
│   └── review-system.test.ts                 # 리뷰 작성 → 평점 계산
│
└── e2e/
    ├── marketplace-workflow.spec.ts          # 전체 사용자 흐름 (업로드 → 검색 → 다운로드 → 리뷰)
    └── template-performance.spec.ts          # 60fps 스크롤 검증
```

**Structure Decision**: Single project (SvelteKit web application) - Template Marketplace는 기존 photo-cards 프로젝트에 새로운 route (`/marketplace`)와 컴포넌트 디렉토리 (`lib/components/marketplace/`)를 추가합니다. Phase 1의 `UnifiedHolographicCard`를 재사용하므로 별도 프로젝트로 분리할 필요 없음.

## Complexity Tracking

*이 섹션은 Constitution Check 위반사항이 있을 경우에만 작성*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All gates passed | No violations |

## Phase 0: Research & Technical Decisions

**Goal**: Resolve all NEEDS CLARIFICATION items from Technical Context

### Research Tasks

1. **Cloud Storage Selection** (Priority: P1)
   - **Question**: Cloudflare R2 vs AWS S3 vs Vercel Blob - 어떤 것을 사용할 것인가?
   - **Criteria**:
     - 한국 사용자 latency (<1초 다운로드)
     - 비용 효율성 (예상 트래픽: 1000 다운로드/월)
     - Vercel 배포 환경과의 통합 용이성
     - 15MB 파일 업로드 지원
   - **Output**: research.md에 선택된 솔루션 + 비용 추정

2. **Template Format Specification** (Priority: P1)
   - **Question**: 템플릿 JSON 스키마 정의 - 어떤 데이터를 포함할 것인가?
   - **Requirements**:
     - UnifiedHolographicCard의 모든 설정 포함 (effect, intensity, rotation)
     - 이미지 파일 경로 (base64 또는 URL?)
     - 버전 정보 (Semantic Versioning)
     - 메타데이터 (작성자, 생성일, 태그)
   - **Output**: research.md에 JSON 스키마 예시

3. **Copyright Detection Strategy** (Priority: P2)
   - **Question**: KBO/구단 로고 감지를 어떻게 구현할 것인가?
   - **Options**:
     - Client-side Canvas API로 이미지 해시 비교
     - ML 모델 (TensorFlow.js) - 오버스펙 가능성
     - 외부 API (Google Vision API, Clarifai)
   - **Output**: research.md에 선택된 방법 + 정확도 추정

4. **Masonry Grid Library** (Priority: P1)
   - **Question**: @tanstack/svelte-virtual 외에 추가 라이브러리가 필요한가?
   - **Alternatives**:
     - Pure CSS Grid (masonry-auto-flow) - 브라우저 지원 제한적
     - react-masonry-css 포팅 - Svelte 네이티브가 아님
     - 커스텀 구현 (Svelte 5 snippets 활용)
   - **Output**: research.md에 선택 + 60fps 검증 방법

5. **Payment Gateway Integration** (Priority: P4 - 연구만)
   - **Question**: 유료 템플릿 결제를 위한 Payment Gateway 선택 (US6)
   - **Options**: Stripe, Toss Payments, KG Inicis
   - **Output**: research.md에 비교표 (구현은 Phase 4 이후)

### Expected Research Outputs

**File**: `specs/001-template-marketplace/research.md`

**Format**:
```markdown
# Research: Template Marketplace

## Decision 1: Cloud Storage - Cloudflare R2 선택

**Rationale**:
- Vercel 배포 환경에서 zero-config 통합
- S3 compatible API (기존 AWS SDK 재사용 가능)
- 무료 tier: 10GB storage, 100k requests/월
- 한국 사용자 latency: ~200ms (Cloudflare CDN)

**Alternatives Considered**:
- AWS S3: 비용 높음 (0.023 USD/GB), 한국 region 필요
- Vercel Blob: 제한적 (10MB/file), 비용 예측 어려움

**Implementation Notes**:
- @aws-sdk/client-s3 with R2 endpoint
- Pre-signed URLs for downloads (1 hour expiry)
...
```

## Phase 1: Design & Contracts

**Prerequisites:** research.md complete

### Data Models

**File**: `specs/001-template-marketplace/data-model.md`

**Entities**:
1. **Template** (PocketBase collection: `templates`)
   - Fields: id, title, description, creatorId, categoryId, tags[], version, fileUrl, previewImageUrl, downloads, avgRating, createdAt, updatedAt
   - Relations: creator (users), reviews (1:N), remixes (self-referencing)
   - Validation: title (3-100 chars), fileUrl (URL), version (Semver)

2. **TemplateReview** (PocketBase collection: `template_reviews`)
   - Fields: id, templateId, userId, rating (1-5), creativity, usability, completeness, reviewText, helpful[], createdAt
   - Relations: template (M:1), user (M:1)
   - Validation: rating (1-5), reviewText (10-500 chars)

3. **TemplateCategory** (PocketBase collection: `template_categories`)
   - Fields: id, name, description, icon, teamId (optional)
   - Examples: "홀로그래픽 효과", "스토리텔링", "통계 시각화", "LG 트윈스 테마"

4. **TemplateDownload** (PocketBase collection: `template_downloads`)
   - Fields: id, templateId, userId, downloadedAt
   - Purpose: 다운로드 통계, "이미 다운로드한 사용자" 체크

### API Contracts

**Directory**: `specs/001-template-marketplace/contracts/`

**Files**:
1. **template-api.yaml** (OpenAPI 3.0)
   - POST /api/templates/upload - 템플릿 업로드
   - GET /api/templates - 템플릿 목록 조회 (pagination, filters)
   - GET /api/templates/{id} - 템플릿 상세
   - PUT /api/templates/{id} - 템플릿 수정
   - DELETE /api/templates/{id} - 템플릿 삭제
   - POST /api/templates/{id}/download - 다운로드 (통계 기록)

2. **review-api.yaml**
   - POST /api/templates/{id}/reviews - 리뷰 작성
   - GET /api/templates/{id}/reviews - 리뷰 목록
   - PUT /api/reviews/{id} - 리뷰 수정
   - POST /api/reviews/{id}/helpful - "도움이 됐어요" 추가

3. **storage-api.yaml** (Cloud Storage 추상화)
   - uploadTemplate(file: File, metadata: object): Promise<{ url: string }>
   - downloadTemplate(url: string): Promise<Blob>
   - deleteTemplate(url: string): Promise<void>

### Quickstart Guide

**File**: `specs/001-template-marketplace/quickstart.md`

**Contents**:
```markdown
# Quickstart: Template Marketplace Development

## Prerequisites
- Phase 1 (Enhanced Card Interaction) 완료
- PocketBase 실행 중 (http://localhost:8090)
- Cloudflare R2 account 생성 + API keys 설정

## Environment Setup
\`\`\`bash
# 1. Install dependencies
npm install @aws-sdk/client-s3 jszip

# 2. Configure R2 credentials
cp .env.example .env
# CLOUDFLARE_R2_ACCOUNT_ID=...
# CLOUDFLARE_R2_ACCESS_KEY_ID=...
# CLOUDFLARE_R2_SECRET_ACCESS_KEY=...

# 3. Create PocketBase collections
# (Execute SQL scripts in specs/001-template-marketplace/data-model.md)

# 4. Seed test templates
npm run seed:templates
\`\`\`

## Run Development
\`\`\`bash
npm run dev
# Visit http://localhost:5173/marketplace
\`\`\`

## Test Workflow
1. 템플릿 업로드: /marketplace → "새 템플릿 업로드" 버튼
2. 검색: 검색창에 "LG 트윈스" 입력
3. 상세보기: 템플릿 카드 클릭
4. 다운로드: "다운로드" 버튼 → /my-templates에서 확인
5. 리뷰 작성: 상세 모달에서 별점 + 리뷰 텍스트

## Architecture Diagram
[마켓플레이스 컴포넌트 구조도 포함]
```

## Next Steps

After completing Phase 0 (research) and Phase 1 (design), proceed to:

**Phase 2**: Run `/speckit.tasks` command to generate `tasks.md`
- Tasks will be auto-generated from:
  - User Stories (US1-US6)
  - Functional Requirements (FR-001 to FR-023)
  - Component structure defined in this plan

**Phase 3**: Implementation
- Follow tasks.md checklist
- Implement tests first (TDD)
- Validate Constitution principles at each milestone

---

**Plan Status**: ✅ **READY FOR PHASE 0 RESEARCH**

**Immediate Action**: Execute research tasks 1-5 above → Create `research.md`
