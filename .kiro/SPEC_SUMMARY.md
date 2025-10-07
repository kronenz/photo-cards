# KBO 홀로그래픽 카드 플랫폼 - 스펙 요약

> Claude Code Spec-Driven Development 방식으로 구성된 종합 스펙 문서

## 📑 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [스펙 구조](#스펙-구조)
3. [Phase별 상세 스펙](#phase별-상세-스펙)
4. [통합 요구사항](#통합-요구사항)
5. [기술 아키텍처](#기술-아키텍처)
6. [개발 로드맵](#개발-로드맵)

---

## 프로젝트 개요

### 비전
KBO 팬들을 위한 **프리미엄 홀로그래픽 카드 수집 & 커뮤니티 플랫폼**

### 핵심 가치
- 🎨 **실물 카드 같은 경험**: 60fps 홀로그래픽 효과
- ⚾ **한국 야구 문화**: KBO 구단별 테마, 응원단 시스템
- 🤝 **커뮤니티**: Civitai 스타일 소셜 기능
- 📱 **모바일 퍼스트**: 터치 최적화, 반응형 디자인

---

## 스펙 구조

### Spec-Driven Development 원칙

각 Phase는 다음 3가지 문서로 구성:

1. **requirements.md** - User Story 기반 기능 요구사항
2. **design.md** - 아키텍처, 컴포넌트, 인터페이스 설계
3. **tasks.md** - 구현 작업 체크리스트

### Phase 구성

```
.kiro/specs/
│
├── 1. enhanced-card-interaction/         [80% 완료]
│   ├── requirements.md                   ✅ 6개 요구사항
│   ├── design.md                         ✅ 아키텍처 설계
│   └── tasks.md                          🔄 12개 작업 (10개 완료)
│
├── 2. photocard-main-renewal/            [30% 완료]
│   ├── requirements.md                   ✅ 9개 요구사항
│   ├── design.md                         ✅ 컴포넌트 설계
│   └── tasks.md                          🔄 10개 섹션 (2개 완료)
│
├── 3. integrated-holographic-platform/   [계획]
│   ├── requirements.md                   ✅ 5개 통합 요구사항
│   ├── design.md                         ✅ 통합 아키텍처
│   └── tasks.md                          📋 9개 통합 작업
│
└── 4. holographic-card-community/        [60% 완료]
    ├── requirements.md                   ✅ 19개 요구사항
    ├── design.md                         ✅ 상세 설계 (파일 너무 커서 읽기 제한)
    ├── tasks.md                          🔄 15개 섹션 (5개 완료)
    ├── how2code.md                       📚 구현 가이드
    ├── how2code_v2.md                    📚 구현 가이드 v2
    ├── legal-compliance.md               ⚖️ 법적 준수
    └── print-partnership.md              🤝 인쇄 파트너십
```

---

## Phase별 상세 스펙

### Phase 1: Enhanced Card Interaction (80% ✅)

#### 목표
완벽한 홀로그래픽 카드 인터랙션 구현

#### 요구사항 (6개)

**Requirement 1**: 마우스 오버시 이미지 가시성 유지
- ✅ 홀로그래픽 효과 + 원본 이미지 선명도
- ✅ overlay/soft-light 블렌드 모드
- ✅ 부드러운 상태 전환

**Requirement 2**: 3D 카드 뒤집기
- ✅ Y축 180도 회전 애니메이션
- ✅ 앞면/뒷면 전환
- ✅ 애니메이션 중 중복 클릭 방지

**Requirement 3**: 홀로그래픽 효과 통합
- ✅ 뒷면 홀로그래픽 효과
- ✅ 애니메이션 중 효과 조정
- 🔄 자연스러운 상호작용

**Requirement 4**: 터치 디바이스 지원
- 🔄 터치 홀로그래픽 효과
- 🔄 탭 제스처 카드 뒤집기
- 🔄 중복 이벤트 방지

**Requirement 5**: 카드 뒷면 디자인
- ✅ 포켓몬 카드 전용 뒷면
- ✅ KBO 구단별 뒷면
- ✅ 커스텀 홀로그래픽 뒷면

**Requirement 6**: 시각적 피드백
- ✅ 커서 변경
- ✅ 로딩 상태 표시
- ✅ 상태 구분 표시

#### 핵심 컴포넌트

```typescript
// EnhancedCard.svelte
interface EnhancedCardProps {
  frontImage: string;
  backImage?: string;
  cardType: 'pokemon' | 'kbo' | 'custom';
  holographicStyle: 'basic' | 'cosmic' | 'rainbow' | 'aurora';
  enableFlip?: boolean;
}
```

#### 진행 상황
- ✅ 10/12 작업 완료
- 🔄 터치 이벤트 통합
- 🔄 통합 테스트 작성

---

### Phase 2: Photocard Main Renewal (30% 🔄)

#### 목표
포토카드 중심 메인 화면으로 수집/자랑 경험 제공

#### 요구사항 (9개)

**Requirement 1**: 컬렉션 하이라이트
- ✅ 최신 획득 카드 3장 표시
- ✅ 총 컬렉션 수, 희귀도별 통계
- ✅ 상세 페이지 이동

**Requirement 2**: 시즌별 컬렉션 관리
- ✅ 진행도 진행바 표시
- ✅ 보유/미보유 구분
- 🔄 완성 축하 애니메이션

**Requirement 3**: 자랑하기 기능
- 🔄 카드 선택 모달
- 🔄 홀로그래픽 효과 게시
- 🔄 좋아요, 댓글, 부러워요

**Requirement 4**: 실시간 활동 피드
- 🔄 실시간 활동 표시
- 🔄 희귀 카드 획득 알림
- 🔄 "지금 핫한 카드" 섹션

**Requirement 5**: 통합 카드 시스템
- 🔄 기존 홀로그래픽 효과 유지
- 🔄 Y축 180도 뒤집기
- 🔄 터치 디바이스 지원

**Requirement 6**: 개인화 추천
- 🔄 사용자 패턴 분석
- 🔄 관심 카드 추천
- 🔄 컬렉션 완성 도움

**Requirement 7**: Civitai 스타일 피드
- 🔄 마소네리 그리드
- 🔄 호버 미리보기
- 🔄 실시간 필터링

**Requirement 8**: KBO 팬 문화
- 🔄 10개 구단 바로가기
- 🔄 실시간 경기 정보
- 🔄 구단별 테마 적용

**Requirement 9**: 크리에이터 시스템
- 🔄 대시보드 위젯
- 🔄 템플릿 마켓
- 🔄 레벨 & 배지

#### 핵심 컴포넌트

```typescript
// MainPageLayout.svelte
interface MainPageProps {
  user?: User;
  collections: Collection[];
  featuredCards: Card[];
  communityFeed: CommunityPost[];
  kboTeams: KBOTeam[];
}

// CollectionDashboard.svelte
interface CollectionDashboardProps {
  recentCards: Card[];
  collectionProgress: CollectionProgress[];
  seasonCollections: SeasonCollection[];
}
```

#### 진행 상황
- ✅ 4/10 섹션 완료
- 🔄 커뮤니티 피드 구현
- 🔄 KBO 팀 섹션 구현

---

### Phase 3: Integrated Holographic Platform (계획 📋)

#### 목표
Phase 1, 2를 충돌 없이 통합

#### 요구사항 (5개)

**Requirement 1**: 통합 홀로그래픽 시스템
- 📋 모든 화면 일관된 경험
- 📋 개선된 효과 적용
- 📋 3D 뒤집기
- 📋 터치 지원

**Requirement 2**: 포토카드 중심 메인 화면
- 📋 컬렉션 + 커뮤니티 통합
- 📋 진행도 표시
- 📋 자랑하기 기능

**Requirement 3**: KBO 팬 문화 통합
- 📋 구단별 테마
- 📋 팬 등급 시스템
- 📋 실시간 경기 정보

**Requirement 4**: 통합 커뮤니티
- 📋 카드 업로드 & 평가
- 📋 팔로우 & 개인화 피드
- 📋 실시간 알림
- 📋 템플릿 마켓

**Requirement 5**: 성능 & UX 최적화
- 📋 60fps 유지
- 📋 접근성 지원
- 📋 3초 로딩
- 📋 크로스 브라우저

#### 통합 전략

1. **UnifiedHolographicCard**
   - Enhanced Card 기반
   - context prop으로 다양한 화면 대응
   - 모든 기능 유지

2. **IntegratedMainPage**
   - 기존 컴포넌트 재사용
   - 새로운 피드 통합
   - KBO 섹션 추가

3. **데이터 모델 통합**
   - UnifiedCard
   - UnifiedUser
   - 충돌 방지

#### 진행 상황
- 📋 설계 완료
- 📋 구현 대기

---

### Phase 4: Holographic Card Community (60% 🔄)

#### 목표
Civitai 스타일 프리미엄 커뮤니티 플랫폼

#### 요구사항 (19개)

**카테고리별 요구사항**

**1. 카드 제작 시스템** (Requirements 1)
- ✅ 미디어 업로드 (사진, 영상, 음악)
- ✅ "영광의 순간" 템플릿
- ✅ 스토리텔링 도구
- ✅ 프리미엄 편집 도구
- ✅ 실시간 미리보기

**2. 갤러리 시스템** (Requirements 2)
- ✅ 그리드 레이아웃
- ✅ 상세 보기 & 편집
- ✅ 공개/비공개 설정
- ✅ 정렬 & 필터링

**3. 커뮤니티 소셜** (Requirements 3)
- ✅ 공개 & 피드
- ✅ 좋아요, 댓글
- ✅ 트렌딩 섹션
- ✅ 실시간 알림

**4. 사용자 등급** (Requirements 4)
- ✅ KBO 팬 등급 (신인 → 레전드)
- ✅ 활동 점수 계산
- ✅ 구단별 배지
- ✅ 시즌별 혜택

**5. SNS 기능** (Requirements 5)
- ✅ 팔로우/팔로잉
- ✅ 실시간 채팅
- ✅ 커뮤니티 이벤트
- ✅ 프로필 관리
- 🔄 통합 검색

**6. Civitai 스타일** (Requirements 6)
- ✅ 마소네리 그리드
- ✅ 다크 테마
- ✅ 호버 미리보기
- ✅ 상세 통계
- ✅ 팔로우/DM

**7. 템플릿 공유** (Requirements 7)
- 🔄 템플릿 업로드
- 🔄 다운로드 통계
- 🔄 파생 작품 추적
- 🔄 품질 관리
- 🔄 수익화

**8. 고급 리뷰** (Requirements 8)
- 🔄 다차원 평가
- 🔄 상세 리뷰
- 🔄 크리에이터 평판
- 🔄 성장 지원
- 🔄 특별 혜택

**9. KBO 이벤트** (Requirements 9)
- 🔄 시즌 챌린지
- 🔄 덕후 인증
- 🔄 팬 커미션
- 🔄 KBO 어워즈

**10. 카드 등급** (Requirements 10)
- 🔄 희소성 등급 (베이스 → 원오브원)
- 🔄 KBO 이벤트 연동
- 🔄 한정 카드 발행
- 🔄 빈티지 가치

**11. 거래 시스템** (Requirements 11)
- 🔄 잠실 카드샵 스타일
- 🔄 신뢰도 시스템
- 🔄 안전 거래
- 🔄 실시간 시세

**12. 팬 커뮤니티** (Requirements 12)
- ✅ 구단별 팬클럽
- ✅ 응원가 라이브러리
- 🔄 시즌 토너먼트
- 🔄 협업 프로젝트

**13. AI 고도화** (Requirements 13)
- 🔄 자동 태깅
- 🔄 개인화 추천
- 🔄 자동 모더레이션
- 🔄 트렌드 분석

**14. 역사 아카이브** (Requirements 14)
- 🔄 1982년부터 KBO 역사
- 🔄 선수 스토리
- 🔄 통계 시각화
- 🔄 감동 스토리

**15. 수익화** (Requirements 15)
- 🔄 멤버십 시스템
- 🔄 디지털 마켓
- 🔄 실물 카드 제작
- 🔄 Stripe 결제

**16. AI 발견** (Requirements 16)
- 🔄 AI 추천 엔진
- 🔄 고급 필터링
- 🔄 실시간 트렌드
- 🔄 지능형 검색

**17. 법적 준수** (Requirements 17)
- 🔄 저작권 검증
- 🔄 DMCA 처리
- 🔄 사용자 교육
- 🔄 안전한 수익 모델

**18. 실물 제작** (Requirements 18)
- 🔄 온라인 인쇄 API
- 🔄 구장 파트너십
- 🔄 통합 주문 관리
- 🔄 품질 보증

**19. 검증 프로세스** (Requirements 19)
- 🔄 Chrome DevTools MCP
- 🔄 실시간 검증
- 🔄 증거 기반 보고
- 🔄 품질 보증

#### 주요 작업 섹션 (15개)

1. ✅ 프리미엄 프로젝트 기반 (완료)
2. ✅ 야구 추억 카드 제작 (완료)
3. ✅ Civitai 갤러리 (완료)
4. ✅ KBO 팬 커뮤니티 (완료)
5. ✅ 사용자 등급 시스템 (완료)
6. 🔄 KBO SNS 기능 (진행중)
7. 🔄 카드 등급 & 거래 (진행중)
8. 🔄 역사 아카이브 (대기)
9. 🔄 수익화 시스템 (대기)
10. 🔄 AI 기반 고도화 (대기)
11. 🔄 성능 최적화 (대기)
12. 🔄 프로덕션 배포 (대기)
13. 🔄 템플릿 & 모델 공유 (대기)
14. 🔄 고급 리뷰 시스템 (대기)
15. 🔄 AI 콘텐츠 발견 (대기)

#### 진행 상황
- ✅ 5/15 섹션 완료
- 🔄 6개 섹션 진행중
- 📋 4개 섹션 대기

---

## 통합 요구사항

### 기능적 요구사항

#### 1. 홀로그래픽 카드 (Phase 1)
- ✅ 60fps 성능
- ✅ 이미지 가시성 유지
- ✅ 3D 뒤집기
- 🔄 터치 지원

#### 2. 메인 화면 (Phase 2)
- ✅ 컬렉션 대시보드
- 🔄 커뮤니티 피드
- 🔄 KBO 팀 섹션
- 🔄 자랑하기

#### 3. 커뮤니티 (Phase 4)
- ✅ 소셜 인터랙션
- ✅ 실시간 알림
- ✅ 팔로우 시스템
- 🔄 템플릿 마켓

#### 4. KBO 특화 (All Phases)
- ✅ 응원단 등급
- ✅ 구단별 테마
- 🔄 실시간 경기
- 🔄 팬 문화 반영

### 비기능적 요구사항

#### 1. 성능
- ✅ 60fps 애니메이션 (Phase 1 완료)
- 🔄 3초 이내 로딩
- 🔄 메모리 최적화
- 🔄 배터리 효율

#### 2. 접근성
- ✅ WCAG 2.1 AA (Phase 1 일부)
- 🔄 키보드 네비게이션
- 🔄 스크린 리더
- 🔄 고대비 모드

#### 3. 호환성
- ✅ Chrome 최적화
- 🔄 Safari/Firefox/Edge
- 🔄 모바일 iOS/Android
- 🔄 반응형 디자인

#### 4. 보안
- ✅ OAuth 인증 (Phase 4)
- 🔄 저작권 보호
- 🔄 DMCA 준수
- 🔄 개인정보 보호

---

## 기술 아키텍처

### 전체 아키텍처

```
┌─────────────────────────────────────────────┐
│           Frontend (SvelteKit)              │
├─────────────────────────────────────────────┤
│  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Phase 1   │  │ Phase 2  │  │ Phase 4  │ │
│  │ Enhanced  │→ │   Main   │→ │Community │ │
│  │   Card    │  │  Renewal │  │          │ │
│  └───────────┘  └──────────┘  └──────────┘ │
│         ↓              ↓             ↓      │
│  ┌─────────────────────────────────────┐   │
│  │      Phase 3: Integrated Platform   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│      Backend (PocketBase + PostgreSQL)      │
├─────────────────────────────────────────────┤
│  Auth │ Realtime │ Storage │ Collections   │
└─────────────────────────────────────────────┘
```

### 컴포넌트 계층

```
App
├── Phase 1: Core Card System
│   ├── EnhancedCard
│   ├── HolographicEngine
│   └── FlipAnimation
│
├── Phase 2: Main Page
│   ├── MainPageLayout
│   ├── CollectionDashboard
│   ├── CommunityFeed
│   └── KBOTeamsSection
│
├── Phase 3: Integration
│   ├── UnifiedHolographicCard
│   └── IntegratedMainPage
│
└── Phase 4: Advanced Community
    ├── TemplateMarket
    ├── TradingSystem
    ├── CreatorDashboard
    └── AIRecommendation
```

### 데이터 모델

```typescript
// 통합 카드 모델
interface UnifiedCard {
  // Phase 1
  frontImage: string;
  backImage?: string;
  holographicEffect: HolographicEffect;

  // Phase 2
  rarity: CardRarity;
  stats: CardStats;
  collections: string[];

  // Phase 4
  creator: string;
  template?: string;
  tags: string[];
  metadata: CardMetadata;
}

// 통합 사용자 모델
interface UnifiedUser {
  // 기본
  id: string;
  username: string;

  // Phase 2 & 4
  fanLevel: FanLevel;
  favoriteTeam?: string;

  // Phase 4
  creatorLevel?: CreatorLevel;
  creatorStats?: CreatorStats;
  collections: Collection[];
}
```

---

## 개발 로드맵

### Q4 2024 - Q1 2025

#### ✅ 2024 Q4 (완료)
- [x] Phase 1 기본 구현
- [x] Phase 4 커뮤니티 기반
- [x] Phase 2 레이아웃 구현

#### 🔄 2025 Q1 (현재)
**1월**
- [ ] Phase 1 터치 이벤트 완료
- [ ] Phase 1 통합 테스트
- [ ] Phase 2 커뮤니티 피드

**2월**
- [ ] Phase 2 KBO 팀 섹션
- [ ] Phase 2 자랑하기 기능
- [ ] Phase 3 통합 시작

**3월**
- [ ] Phase 3 완료
- [ ] Phase 4 템플릿 마켓
- [ ] Phase 4 거래 시스템

#### 📋 2025 Q2 (예정)
**4월**
- [ ] Phase 4 AI 추천
- [ ] Phase 4 수익화
- [ ] 성능 최적화

**5월-6월**
- [ ] 프로덕션 준비
- [ ] 보안 강화
- [ ] 배포 및 런칭

### 마일스톤

```
MVP (v0.8) ────────────── 2025.02
  ↓ Phase 1, 2 완료

Beta (v0.9) ───────────── 2025.03
  ↓ Phase 3 통합 완료

v1.0 Release ──────────── 2025.06
  ↓ 전체 기능 완성

v1.x Updates ──────────── 2025.07~
  ↓ 지속적 개선
```

---

## 다음 단계

### 즉시 진행 (이번 주)
1. ✅ Phase 1 터치 이벤트 통합
2. ✅ Phase 1 통합 테스트 작성
3. 🔄 Phase 2 커뮤니티 피드 시작

### 1-2주 내
1. 🔄 Phase 2 KBO 팀 섹션
2. 🔄 Phase 2 자랑하기 모달
3. 🔄 Phase 2 개인화 추천

### 1개월 내
1. 📋 Phase 3 통합 시작
2. 📋 UnifiedHolographicCard
3. 📋 IntegratedMainPage

### 2-3개월 내
1. 📋 Phase 4 템플릿 마켓
2. 📋 Phase 4 거래 시스템
3. 📋 Phase 4 AI 추천

---

## 참고 문서

### Phase별 스펙 문서
- [Phase 1: Enhanced Card Interaction](./specs/enhanced-card-interaction/)
- [Phase 2: Photocard Main Renewal](./specs/photocard-main-renewal/)
- [Phase 3: Integrated Platform](./specs/integrated-holographic-platform/)
- [Phase 4: Community](./specs/holographic-card-community/)

### 프로젝트 문서
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 프로젝트 개요
- [../CLAUDE.md](../CLAUDE.md) - 전체 요약

### 구현 가이드
- [Phase 4 How2Code](./specs/holographic-card-community/how2code.md)
- [Phase 4 How2Code v2](./specs/holographic-card-community/how2code_v2.md)

### 법적 & 파트너십
- [Legal Compliance](./specs/holographic-card-community/legal-compliance.md)
- [Print Partnership](./specs/holographic-card-community/print-partnership.md)

---

**작성일**: 2025-01-07
**버전**: 1.0.0
**작성자**: Claude AI Assistant
**업데이트**: Spec-Driven Development 방식으로 전체 재구성
