# KBO 홀로그래픽 카드 플랫폼 - 프로젝트 개요

## 🎯 프로젝트 비전

KBO(한국프로야구) 팬들을 위한 프리미엄 홀로그래픽 카드 플랫폼으로, 야구 추억을 수집하고 공유하며 커뮤니티와 소통할 수 있는 종합 서비스를 제공합니다.

## 📊 Spec-Driven Development 구조

```
.kiro/specs/
├── 1. enhanced-card-interaction/      # Phase 1: 핵심 카드 시스템 (80% 완료)
├── 2. photocard-main-renewal/         # Phase 2: 메인 화면 리뉴얼 (30% 완료)
├── 3. integrated-holographic-platform/ # Phase 3: 통합 플랫폼 (계획)
└── 4. holographic-card-community/     # Phase 4: 커뮤니티 고도화 (60% 완료)
```

## 🔄 개발 단계별 전략

### Phase 1: Enhanced Card Interaction (핵심 카드 시스템) ✅ 80%
**목표**: 완벽한 홀로그래픽 카드 경험 구현

#### 완료된 기능 ✅
- [x] 홀로그래픽 효과 개선 (color-dodge → overlay/soft-light)
- [x] 3D 카드 뒤집기 (Y축 180도 회전)
- [x] 카드 뒷면 디자인 시스템 (포켓몬, KBO 구단별)
- [x] 마우스 오버 효과 개선
- [x] 뒷면 홀로그래픽 효과
- [x] 시각적 피드백 시스템
- [x] /test 페이지 적용

#### 진행중 🔄
- [ ] 터치 이벤트 통합 처리
- [ ] 통합 테스트 작성

#### 관련 파일
- `enhanced-card-interaction/requirements.md` - 기능 요구사항
- `enhanced-card-interaction/design.md` - 설계 문서
- `enhanced-card-interaction/tasks.md` - 작업 목록

---

### Phase 2: Photocard Main Renewal (메인 화면 리뉴얼) 🔄 30%
**목표**: 포토카드 중심의 수집/자랑 경험 제공

#### 완료된 기능 ✅
- [x] MainPageLayout 컴포넌트
- [x] 반응형 레이아웃 시스템
- [x] CollectionDashboard 기본 구현
- [x] 컬렉션 진행도 시각화

#### 진행중 🔄
- [ ] Civitai 스타일 커뮤니티 피드
- [ ] KBO 팀 섹션
- [ ] 자랑하기 모달
- [ ] 개인화 추천 시스템

#### 관련 파일
- `photocard-main-renewal/requirements.md` - 기능 요구사항
- `photocard-main-renewal/design.md` - 설계 문서
- `photocard-main-renewal/tasks.md` - 작업 목록

---

### Phase 3: Integrated Holographic Platform (통합 플랫폼) 📋 계획
**목표**: Phase 1, 2를 충돌 없이 통합

#### 통합 전략
- [ ] UnifiedHolographicCard 컴포넌트 생성
- [ ] Enhanced Card 마이그레이션
- [ ] IntegratedMainPage 구현
- [ ] 데이터 모델 통합
- [ ] 통합 테스트

#### 관련 파일
- `integrated-holographic-platform/requirements.md` - 통합 요구사항
- `integrated-holographic-platform/design.md` - 통합 설계
- `integrated-holographic-platform/tasks.md` - 통합 작업 목록

---

### Phase 4: Holographic Card Community (커뮤니티 고도화) 🔄 60%
**목표**: Civitai 스타일 프리미엄 커뮤니티 플랫폼

#### 완료된 기능 ✅
- [x] 60fps 홀로그래픽 엔진
- [x] 프리미엄 디자인 시스템
- [x] 야구 추억 카드 제작 시스템
- [x] Apple Photos 스타일 갤러리
- [x] KBO 팬 커뮤니티 피드
- [x] 소셜 인터랙션 (좋아요, 댓글)
- [x] 실시간 알림 시스템
- [x] OAuth 인증 & 프로필
- [x] 응원단 등급 시스템
- [x] 소셜 그래프 & 팔로우
- [x] 실시간 메시징 & 채팅

#### 진행중 🔄
- [ ] 템플릿 마켓플레이스
- [ ] 카드 거래 시스템
- [ ] KBO 시즌 이벤트
- [ ] 통합 검색 시스템

#### 미구현 ⏳
- [ ] AI 기반 추천
- [ ] 수익화 시스템
- [ ] 실물 카드 제작
- [ ] 프로덕션 배포

#### 관련 파일
- `holographic-card-community/requirements.md` - 커뮤니티 요구사항
- `holographic-card-community/design.md` - 커뮤니티 설계
- `holographic-card-community/tasks.md` - 작업 목록 (상세)
- `holographic-card-community/how2code.md` - 구현 가이드
- `holographic-card-community/legal-compliance.md` - 법적 준수
- `holographic-card-community/print-partnership.md` - 인쇄 파트너십

---

## 🛠 기술 스택

### Core Technologies
- **Framework**: SvelteKit 4.2.12
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.3.6 + Apple Design System
- **Build**: Vite 5.3.5

### Backend & Data
- **Database**: PocketBase (SQLite → PostgreSQL)
- **Auth**: @auth/sveltekit (Google/GitHub OAuth)
- **Realtime**: PocketBase WebSocket
- **Email**: Gmail SMTP / Resend / SendGrid

### Effects & Animation
- **Holographic**: 60fps CSS 기반 엔진
- **Physics**: Svelte Spring
- **3D**: CSS transform-style: preserve-3d

### Testing & Quality
- **Unit**: Vitest (48/88 통과)
- **E2E**: Playwright
- **Accessibility**: axe-core (WCAG 2.1 AA)
- **Browser Testing**: Chrome DevTools MCP

---

## 📈 현재 진행 상황

### 전체 진행률: ~55%

| Phase | 진행률 | 상태 |
|-------|--------|------|
| Phase 1: Enhanced Card | 80% | 🔄 진행중 |
| Phase 2: Main Renewal | 30% | 🔄 진행중 |
| Phase 3: Integration | 0% | 📋 계획 |
| Phase 4: Community | 60% | 🔄 진행중 |

### 핵심 마일스톤

#### ✅ 완료
- [x] 홀로그래픽 카드 시스템 구축
- [x] 3D 카드 뒤집기 구현
- [x] 커뮤니티 소셜 기능
- [x] 실시간 알림 시스템
- [x] KBO 팬 등급 시스템

#### 🔄 진행중
- [ ] 터치 이벤트 통합
- [ ] 메인 화면 커뮤니티 피드
- [ ] KBO 팀 섹션
- [ ] 통합 플랫폼 구축

#### ⏳ 예정
- [ ] 템플릿 마켓
- [ ] 카드 거래 시스템
- [ ] AI 추천 시스템
- [ ] 프로덕션 배포

---

## 🎯 다음 단계 (우선순위)

### 1단계: Phase 1 완료 (1-2주)
1. ✅ 터치 이벤트 통합 처리
2. ✅ 통합 테스트 작성
3. ✅ 크로스 브라우저 테스트

### 2단계: Phase 2 핵심 기능 (2-3주)
1. 🔄 CommunityFeed 컴포넌트
2. 🔄 KBOTeamsSection 컴포넌트
3. 🔄 자랑하기 모달
4. 🔄 개인화 추천 기본 구현

### 3단계: Phase 3 통합 (2주)
1. ⏳ UnifiedHolographicCard 생성
2. ⏳ IntegratedMainPage 구현
3. ⏳ 데이터 모델 통합
4. ⏳ 통합 테스트

### 4단계: Phase 4 고급 기능 (선택사항, 3-4주)
1. ⏳ 템플릿 마켓
2. ⏳ 카드 거래 시스템
3. ⏳ AI 추천
4. ⏳ 수익화

---

## 📋 주요 요구사항

### 기능적 요구사항
1. **홀로그래픽 카드**: 60fps, 이미지 가시성 유지, 3D 뒤집기
2. **메인 화면**: 컬렉션 대시보드, 커뮤니티 피드, KBO 테마
3. **커뮤니티**: 자랑하기, 소셜 인터랙션, 실시간 알림
4. **KBO 특화**: 응원단 등급, 구단별 테마, 팬 문화 반영

### 비기능적 요구사항
1. **성능**: 60fps, 3초 로딩, 메모리 최적화
2. **접근성**: WCAG 2.1 AA, 키보드 네비게이션, 스크린 리더
3. **호환성**: 크로스 브라우저, 모바일 최적화, 반응형
4. **보안**: OAuth, 저작권 보호, DMCA 준수, 개인정보 보호

---

## 🔍 개발 원칙

### 1. Spec-Driven Development
- 각 기능은 requirements → design → tasks 순서로 문서화
- 구현 전 스펙 검토 및 승인
- 테스트 주도 개발 (TDD)

### 2. 모듈화 & 재사용
- 독립적인 Phase 구성
- 공통 컴포넌트 추출
- 명확한 인터페이스 정의

### 3. 점진적 개선
- MVP 우선 구현
- 단계별 기능 추가
- 지속적 테스트 및 검증

### 4. 사용자 중심
- Apple 수준 UX
- 직관적 인터랙션
- 한국 야구 문화 반영

---

## 🧪 품질 관리

### 테스트 전략
1. **Unit Tests**: 각 컴포넌트/함수 단위 테스트
2. **Integration Tests**: 컴포넌트 간 상호작용 테스트
3. **E2E Tests**: 전체 사용자 여정 테스트
4. **Performance Tests**: 60fps, 로딩 시간, 메모리
5. **Accessibility Tests**: WCAG 2.1 AA 준수

### Chrome DevTools MCP 활용
- 실제 브라우저 렌더링 검증
- 인터랙션 시뮬레이션
- 콘솔 오류 모니터링
- 네트워크 요청 분석
- 성능 메트릭 측정

---

## 🚨 주의사항

### 저작권
- KBO/구단 로고 자동 감지
- 공식 사진/영상 필터링
- DMCA 준수 처리
- 사용자 교육 제공

### 성능
- 60fps 보장 필수
- 모바일 최적화
- 메모리 관리
- 배터리 효율

### 보안
- OAuth 인증
- XSS/CSRF 방지
- 데이터 암호화
- 개인정보 보호

---

## 📚 문서 구조

### Spec 문서 (각 Phase별)
- `requirements.md` - User Story 기반 요구사항
- `design.md` - 아키텍처 및 컴포넌트 설계
- `tasks.md` - 구현 작업 체크리스트

### 추가 문서
- `how2code.md` - 구현 가이드 (Phase 4)
- `legal-compliance.md` - 법적 준수 (Phase 4)
- `print-partnership.md` - 파트너십 (Phase 4)

### 프로젝트 루트
- `CLAUDE.md` - 전체 프로젝트 요약
- `PROJECT_OVERVIEW.md` - 이 문서

---

## 🔗 유용한 링크

### 내부 문서
- [Phase 1: Enhanced Card Interaction](.kiro/specs/enhanced-card-interaction/)
- [Phase 2: Photocard Main Renewal](.kiro/specs/photocard-main-renewal/)
- [Phase 3: Integrated Platform](.kiro/specs/integrated-holographic-platform/)
- [Phase 4: Community](.kiro/specs/holographic-card-community/)

### 기술 참조
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PocketBase](https://pocketbase.io/)
- [Vitest](https://vitest.dev/)

---

**프로젝트 시작**: 2024
**현재 버전**: 0.5.5 (MVP 진행중)
**목표 버전**: 1.0.0 (통합 플랫폼 완성)
**작성일**: 2025-10-07
