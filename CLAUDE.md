# KBO 홀로그래픽 카드 플랫폼

> Claude Code Spec-Driven Development 프로젝트

## 🎯 프로젝트 개요

KBO(한국프로야구) 팬들을 위한 **프리미엄 홀로그래픽 카드 수집 & 커뮤니티 플랫폼**

### 핵심 가치
- 🎨 **60fps 홀로그래픽 카드**: 실물 카드 같은 경험
- ⚾ **한국 야구 문화**: KBO 구단별 테마, 응원단 시스템
- 🤝 **Civitai 스타일 커뮤니티**: 소셜 기능, 템플릿 공유
- 📱 **모바일 퍼스트**: 터치 최적화, 반응형 디자인

---

## 📊 Spec 구조

### `.kiro/specs/` 디렉토리

```
.kiro/specs/
├── 1. enhanced-card-interaction/      [██████████] 80% ✅
│   ├── requirements.md                # 6개 요구사항
│   ├── design.md                      # 아키텍처 설계
│   └── tasks.md                       # 12개 작업 (10개 완료)
│
├── 2. photocard-main-renewal/         [███░░░░░░░] 30% 🔄
│   ├── requirements.md                # 9개 요구사항
│   ├── design.md                      # 컴포넌트 설계
│   └── tasks.md                       # 10개 섹션 (2개 완료)
│
├── 3. integrated-holographic-platform/ [░░░░░░░░░░]  0% 📋
│   ├── requirements.md                # 5개 통합 요구사항
│   ├── design.md                      # 통합 아키텍처
│   └── tasks.md                       # 9개 통합 작업
│
└── 4. holographic-card-community/     [██████░░░░] 60% 🔄
    ├── requirements.md                # 19개 요구사항
    ├── design.md                      # 상세 설계
    ├── tasks.md                       # 15개 섹션 (5개 완료)
    ├── how2code.md                    # 구현 가이드
    └── legal-compliance.md            # 법적 준수
```

### 각 Spec의 구성

각 Phase는 **Claude Code의 Spec-Driven Development** 방식을 따릅니다:

1. **requirements.md** - User Story 기반 기능 요구사항
   - WHEN-THEN 형식의 Acceptance Criteria
   - 명확한 검수 기준

2. **design.md** - 상세 설계 문서
   - 컴포넌트 인터페이스
   - 데이터 모델
   - 에러 처리 전략

3. **tasks.md** - 구현 작업 체크리스트
   - 단계별 작업 목록
   - 요구사항과 연결 (`_Requirements: X.X_`)
   - 진행 상황 추적 (✅ 완료, 🔄 진행중, 📋 대기)

---

## 🚀 빠른 시작

### 개발 환경 설정

```bash
# 1. 저장소 클론
git clone [repository-url]
cd photo-cards

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env

# 4. PocketBase 실행
./pocketbase serve

# 5. 개발 서버 실행
npm run dev
```

### 주요 경로

- 🏠 메인 앱: http://localhost:5173
- 🧪 Phase 1 테스트: http://localhost:5173/test
- 🖼️ Phase 4 갤러리: http://localhost:5173/gallery
- 🗄️ PocketBase Admin: http://localhost:8090

---

## 📈 Phase별 진행 상황

### Phase 1: Enhanced Card Interaction (80% ✅)

**목표**: 완벽한 홀로그래픽 카드 인터랙션 구현

#### 완료된 기능 ✅
- [x] 홀로그래픽 효과 개선 (overlay/soft-light 블렌드)
- [x] 3D 카드 뒤집기 (Y축 180도 회전)
- [x] 카드 뒷면 디자인 시스템
- [x] 마우스 오버 효과
- [x] 시각적 피드백

#### 진행중 🔄
- [ ] 터치 이벤트 통합 처리
- [ ] 통합 테스트 작성

#### 관련 파일
- 📄 Spec: [`.kiro/specs/enhanced-card-interaction/`](.kiro/specs/enhanced-card-interaction/)
- 💻 코드: `src/lib/holographic/HolographicCard.svelte`
- 🧪 테스트: `src/routes/test/+page.svelte`

---

### Phase 2: Photocard Main Renewal (30% 🔄)

**목표**: 포토카드 중심 메인 화면으로 리뉴얼

#### 완료된 기능 ✅
- [x] MainPageLayout 컴포넌트
- [x] 반응형 레이아웃
- [x] CollectionDashboard 기본 구현
- [x] 컬렉션 진행도 시각화

#### 진행중 🔄
- [ ] Civitai 스타일 커뮤니티 피드
- [ ] KBO 팀 섹션
- [ ] 자랑하기 모달
- [ ] 개인화 추천

#### 관련 파일
- 📄 Spec: [`.kiro/specs/photocard-main-renewal/`](.kiro/specs/photocard-main-renewal/)
- 💻 코드: `src/routes/+page.svelte`
- 🧩 컴포넌트: `src/lib/components/CollectionDashboard.svelte`

---

### Phase 3: Integrated Platform (계획 📋)

**목표**: Phase 1, 2를 충돌 없이 통합

#### 통합 전략
1. **UnifiedHolographicCard**: Enhanced Card 기반 통합 컴포넌트
2. **IntegratedMainPage**: 메인 화면 통합 레이아웃
3. **데이터 모델 통합**: UnifiedCard, UnifiedUser

#### 다음 단계
- [ ] UnifiedHolographicCard 컴포넌트 생성
- [ ] Enhanced Card 마이그레이션
- [ ] IntegratedMainPage 구현
- [ ] 통합 테스트

#### 관련 파일
- 📄 Spec: [`.kiro/specs/integrated-holographic-platform/`](.kiro/specs/integrated-holographic-platform/)

---

### Phase 4: Holographic Card Community (60% 🔄)

**목표**: Civitai 스타일 프리미엄 커뮤니티

#### 완료된 기능 ✅
- [x] 60fps 홀로그래픽 엔진
- [x] 야구 추억 카드 제작 시스템
- [x] Apple Photos 스타일 갤러리
- [x] KBO 팬 커뮤니티 피드
- [x] 소셜 인터랙션 (좋아요, 댓글, 팔로우)
- [x] 실시간 알림 시스템
- [x] OAuth 인증 & 프로필
- [x] 응원단 등급 시스템
- [x] 실시간 메시징

#### 진행중 🔄
- [ ] 템플릿 마켓플레이스
- [ ] 카드 거래 시스템
- [ ] KBO 시즌 이벤트
- [ ] 통합 검색

#### 미구현 ⏳
- [ ] AI 기반 추천
- [ ] 수익화 시스템
- [ ] 실물 카드 제작
- [ ] 프로덕션 배포

#### 관련 파일
- 📄 Spec: [`.kiro/specs/holographic-card-community/`](.kiro/specs/holographic-card-community/)
- 💻 코드: `src/routes/gallery/+page.svelte`
- 🧩 컴포넌트: `src/lib/components/social/`

---

## 🛠 기술 스택

### Frontend
- **Framework**: SvelteKit 4.2.12
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.3.6 + Apple Design System
- **Build**: Vite 5.3.5

### Backend
- **Database**: PocketBase (SQLite → PostgreSQL)
- **Auth**: @auth/sveltekit (Google/GitHub OAuth)
- **Realtime**: PocketBase WebSocket

### Effects & Testing
- **Holographic**: 60fps CSS 기반 엔진
- **Unit Tests**: Vitest (48/88 통과)
- **E2E Tests**: Playwright
- **Browser Testing**: Chrome DevTools MCP

---

## 📋 개발 워크플로우

### Spec-Driven Development

1. **요구사항 확인** (`requirements.md`)
   ```markdown
   **User Story**: As a 사용자, I want to...
   - WHEN 조건 THEN 기대 결과
   ```

2. **설계 검토** (`design.md`)
   ```typescript
   interface ComponentProps { ... }
   ```

3. **작업 진행** (`tasks.md`)
   ```markdown
   - [x] 작업 완료
   - 🔄 진행중
   - [ ] 대기
   _Requirements: 1.1, 1.2_
   ```

4. **테스트 & 검증**
   ```bash
   npm run test
   npm run test:e2e
   ```

5. **문서 업데이트**
   - tasks.md 체크 표시
   - design.md 실제 구현 반영

---

## 🎯 다음 단계

### 우선순위 1: Phase 1 완료 (1주)
- [ ] 터치 이벤트 통합
- [ ] 통합 테스트 작성
- [ ] 크로스 브라우저 테스트

### 우선순위 2: Phase 2 핵심 (2주)
- [ ] CommunityFeed 컴포넌트
- [ ] KBOTeamsSection 컴포넌트
- [ ] 자랑하기 모달
- [ ] 개인화 추천

### 우선순위 3: Phase 3 통합 (2주)
- [ ] UnifiedHolographicCard
- [ ] IntegratedMainPage
- [ ] 데이터 모델 통합
- [ ] 통합 테스트

### 우선순위 4: Phase 4 고급 기능 (선택)
- [ ] 템플릿 마켓
- [ ] 카드 거래 시스템
- [ ] AI 추천
- [ ] 수익화

---

## 📚 주요 문서

### Spec 문서
- 📋 [PROJECT_OVERVIEW.md](.kiro/PROJECT_OVERVIEW.md) - 프로젝트 개요
- 📊 [SPEC_SUMMARY.md](.kiro/SPEC_SUMMARY.md) - 스펙 요약
- 🛠 [DEVELOPMENT_GUIDE.md](.kiro/DEVELOPMENT_GUIDE.md) - 개발 가이드

### Phase별 Spec
- 🎴 [Phase 1: Enhanced Card](.kiro/specs/enhanced-card-interaction/)
- 🏠 [Phase 2: Main Renewal](.kiro/specs/photocard-main-renewal/)
- 🔗 [Phase 3: Integration](.kiro/specs/integrated-holographic-platform/)
- 🌟 [Phase 4: Community](.kiro/specs/holographic-card-community/)

### 외부 문서
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PocketBase](https://pocketbase.io/)
- [Vitest](https://vitest.dev/)

---

## 🧪 테스트 실행

```bash
# 단위 테스트
npm run test

# 특정 컴포넌트 테스트
npm run test -- HolographicCard

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:coverage

# Vitest UI
npm run test:ui
```

---

## 📊 프로젝트 통계

### 전체 진행률
```
[██████████████░░░░░░] 55%
```

### Phase별 진행률
- Phase 1: 80% (10/12 작업 완료)
- Phase 2: 30% (2/10 섹션 완료)
- Phase 3: 0% (계획 단계)
- Phase 4: 60% (5/15 섹션 완료)

### 요구사항 통계
- **총 요구사항**: 39개
- **완료**: 23개 ✅
- **진행중**: 10개 🔄
- **대기**: 6개 📋

---

## ⚠️ 주의사항

### 저작권
- KBO/구단 로고 자동 감지 AI
- DMCA 준수 신고 처리
- 저작권 교육 시스템

### 성능
- 60fps 애니메이션 필수
- 3초 이내 로딩
- 모바일 최적화

### 보안
- OAuth 인증
- XSS/CSRF 방지
- 개인정보 보호

---

## 🤝 기여 가이드

1. **Spec 먼저 확인**
   - 해당 Phase의 requirements.md 읽기
   - design.md에서 인터페이스 확인

2. **작업 전 tasks.md 업데이트**
   - 작업 항목을 🔄 진행중으로 변경

3. **구현 후 테스트 작성**
   - 단위 테스트 필수
   - E2E 테스트 권장

4. **완료 후 체크**
   - tasks.md에 ✅ 표시
   - design.md 업데이트 (필요시)

---

## 📞 문의

프로젝트 관련 문의는 Spec 문서를 먼저 확인해주세요:
- 기능 요구사항: `requirements.md`
- 설계 문서: `design.md`
- 작업 목록: `tasks.md`

---

**프로젝트 시작**: 2024
**현재 버전**: 0.5.5 (MVP 진행중)
**목표 버전**: 1.0.0 (통합 플랫폼)
**마지막 업데이트**: 2025-01-07

---

## 🚀 Claude Code Spec-Driven Development

이 프로젝트는 **Claude Code의 Spec-Driven Development** 방식을 따릅니다:

1. ✅ **명확한 Spec 정의** - requirements → design → tasks
2. 🔄 **점진적 구현** - Phase별 단계적 개발
3. 🧪 **테스트 주도** - 구현과 동시에 테스트 작성
4. 📝 **문서화 우선** - 코드보다 Spec이 먼저
5. 🔍 **지속적 검증** - Chrome DevTools MCP 활용

**Spec 문서를 통해 프로젝트의 모든 것을 이해할 수 있습니다.**
