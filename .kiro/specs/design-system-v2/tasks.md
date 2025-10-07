# Design System V2 - Implementation Tasks

## Overview

Design System V2의 생동감 있고 화려한 KBO 홀로그래픽 카드 플랫폼을 단계적으로 구현합니다. Pokemon 카드의 프리미엄 홀로그래픽 효과와 KBO 10개 구단의 강렬한 컬러를 중심으로 한 완전히 새로운 디자인 시스템입니다.

## Phase 1: Foundation (1주차)

### 1.1 색상 시스템 구축
- [ ] KBO 10개 구단 컬러 CSS 변수 정의
  - LG, 두산, KT, 삼성, NC 구단 컬러 추가
  - KIA, 롯데, SSG, 한화, 키움 구단 컬러 추가
  - Primary, Secondary, Gradient 변수 세트 생성
  - _Requirements: 1.1, 1.3_

- [ ] 홀로그래픽 스펙트럼 컬러 시스템 구현
  - Rainbow, Cosmic, Aurora 그라디언트 정의
  - Neon 액센트 컬러 추가 (Blue, Pink, Purple, Green, Orange)
  - 다크모드 배경 및 표면 컬러 정의
  - _Requirements: 1.2, 6.1, 6.2_

- [ ] 디자인 토큰 TypeScript 정의
  - `design-tokens.ts` 파일 생성
  - 모든 컬러, 타이포그래피, 애니메이션 상수 export
  - Type-safe 디자인 토큰 시스템 구축
  - _Requirements: 모든 요구사항_

### 1.2 타이포그래피 시스템 구축
- [ ] 폰트 패밀리 설정
  - Pretendard Variable 폰트 로드 (Display 용도)
  - Pretendard 폰트 로드 (Body 용도)
  - JetBrains Mono 폰트 로드 (Mono 용도)
  - Jalnan/GmarketSans 폰트 로드 (Special 용도)
  - _Requirements: 4.1, 4.2_

- [ ] 타입 스케일 시스템 구현
  - Display 크기 (XL, LG, MD) CSS 변수 정의
  - Heading 크기 (XL, LG, MD, SM) CSS 변수 정의
  - Body 크기 (LG, MD, SM, XS) CSS 변수 정의
  - Line height 변수 정의
  - _Requirements: 4.1, 4.2_

- [ ] 텍스트 효과 유틸리티 클래스 구현
  - `.text-gradient` - 무지개 그라디언트 텍스트
  - `.text-neon` - 네온 글로우 텍스트
  - `.text-stadium` - 야구장 전광판 스타일 텍스트
  - _Requirements: 4.4, 4.5_

### 1.3 기본 컴포넌트 스타일 구축
- [ ] Glass Morphism 스타일 구현
  - `.glass-surface` 유틸리티 클래스
  - 반투명 배경 + 블러 효과
  - 미묘한 테두리 및 그림자
  - _Requirements: 6.4_

- [ ] 버튼 기본 스타일 구현
  - Primary, Secondary, Outline 버튼 스타일
  - Ripple 효과 CSS/JS 구현
  - 구단별 테마 버튼 스타일
  - _Requirements: 5.1_

- [ ] 입력 필드 기본 스타일 구현
  - Input, Textarea, Select 스타일
  - Focus 상태 네온 글로우 효과
  - Validation 상태 스타일
  - _Requirements: 5.1_

## Phase 2: Holographic Card System (2주차)

### 2.1 홀로그래픽 효과 CSS 구현
- [ ] 기본 카드 3D 구조 CSS
  - `.card-container` 3D perspective 구조
  - `.card-3d-wrapper` transform-style preserve-3d
  - `.card-face` 앞/뒷면 구조 및 backface-visibility
  - _Requirements: 2.1, 2.2_

- [ ] 홀로그래픽 레이어 시스템 구현
  - `.holo-rainbow` - 무지개 스펙트럼 효과 (from how2code_v2.md)
  - `.holo-sparkle` - 반짝임 효과
  - `.holo-gradient` - 동적 그라디언트 효과
  - `.holo-cosmic` - 우주 성운 효과
  - `.holo-aurora` - 오로라 효과
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 희귀도별 홀로그래픽 효과 구현
  - Common - 기본 광택
  - Rare - 블루 그라디언트 + 글로우
  - Epic - 버건디 그라디언트 + 강한 글로우
  - Legendary - 레인보우 애니메이션 + 골드 글로우
  - _Requirements: 2.3_

### 2.2 카드 인터랙션 JavaScript 구현
- [ ] 마우스 오버 3D 틸트 효과
  - `handleMouseMove` 함수 개선
  - 마우스 위치 기반 rotateX/rotateY 계산
  - `--mouse-x`, `--mouse-y` CSS 변수 업데이트
  - _Requirements: 5.2_

- [ ] 카드 뒤집기 애니메이션 통합
  - 기존 Enhanced Card Interaction 로직 활용
  - Y축 180도 회전 애니메이션
  - 뒷면에도 홀로그래픽 효과 적용
  - _Requirements: 2.1, 2.2_

- [ ] 터치 이벤트 지원 추가
  - 터치 시 홀로그래픽 효과 적용
  - 탭 제스처로 카드 뒤집기
  - 마우스/터치 이벤트 중복 방지
  - _Requirements: 7.1, 7.3_

### 2.3 카드 컴포넌트 구현
- [ ] `UnifiedHolographicCard.svelte` 생성
  - Props 인터페이스 정의 (card, size, context, interactive 등)
  - 카드 앞면 구조 구현 (이미지, 정보, 홀로그래픽 레이어)
  - 카드 뒷면 구조 구현 (구단별 디자인)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 카드 사이즈 시스템 구현
  - Small (200x280px) - 썸네일용
  - Medium (280x392px) - 갤러리용
  - Large (360x504px) - 상세 보기용
  - Featured (480x672px) - 히어로 섹션용
  - _Requirements: 2.4_

- [ ] 구단별 카드 뒷면 디자인 구현
  - 10개 구단별 고유 뒷면 디자인 CSS
  - 구단 로고 + 컬러 + 홀로그래픽 효과 조합
  - `data-team` 속성 기반 스타일 분기
  - _Requirements: 1.3, 2.2_

## Phase 3: Main Page Layout (3주차)

### 3.1 히어로 섹션 구현
- [ ] 히어로 배경 애니메이션
  - 다중 radial-gradient 배경
  - `hero-gradient-shift` 애니메이션 구현
  - 파티클 배경 효과 추가
  - _Requirements: 3.1, 3.5_

- [ ] 3D 카드 캐러셀 구현
  - `HeroCarousel.svelte` 컴포넌트 생성
  - 3개 카드 3D 배치 (perspective 2000px)
  - 자동 로테이션 애니메이션
  - 카드 호버 시 확대 및 Z축 이동
  - _Requirements: 3.1_

- [ ] 히어로 타이틀 애니메이션
  - 그라디언트 텍스트 효과
  - 타이핑 또는 Reveal 애니메이션
  - 스크롤 인디케이터 추가
  - _Requirements: 3.1, 4.5_

### 3.2 사용자 대시보드 섹션 구현
- [ ] 사용자 통계 카드
  - 최신 획득 카드 3장 표시 (UnifiedHolographicCard 사용)
  - 컬렉션 완성도 통계
  - 애니메이션 숫자 카운터
  - _Requirements: 3.1_

- [ ] 컬렉션 진행 상황 표시
  - 진행 중인 컬렉션 목록
  - 각 컬렉션별 진행 바 (퍼센트 표시)
  - "자랑하기" 버튼 추가
  - _Requirements: 3.1_

- [ ] 빠른 액션 버튼
  - "뽑기", "컬렉션", "거래소" 버튼
  - 구단별 테마 컬러 적용
  - Ripple 효과 추가
  - _Requirements: 5.1_

### 3.3 KBO 팀 쇼케이스 섹션 구현
- [ ] 팀 그리드 레이아웃
  - 5열 그리드 (반응형: 3열 → 2열 → 1열)
  - `TeamsGrid.svelte` 컴포넌트 생성
  - Gap 및 패딩 조정
  - _Requirements: 3.1, 7.4_

- [ ] 팀 카드 디자인
  - Glass morphism 카드 배경
  - 구단 로고 + 구단명
  - 호버 시 3D 회전 효과
  - _Requirements: 3.1, 5.2_

- [ ] 팀별 글로우 효과
  - 각 팀 컬러 기반 box-shadow
  - 호버 시 네온 글로우 강화
  - Border 컬러 변경 애니메이션
  - _Requirements: 1.3, 1.5_

### 3.4 커뮤니티 피드 섹션 구현
- [ ] Masonry 그리드 레이아웃
  - CSS column-count 기반 레이아웃
  - 반응형 컬럼 수 조정 (4열 → 3열 → 2열 → 1열)
  - `MasonryFeed.svelte` 컴포넌트 생성
  - _Requirements: 3.3, 7.4_

- [ ] 피드 아이템 카드
  - Glass morphism 카드
  - 카드 이미지 + 정보 + 통계
  - 호버 시 translateY + 네온 테두리
  - _Requirements: 3.3_

- [ ] 필터 및 검색 헤더
  - 구단별, 희귀도별, 최신순 필터
  - 실시간 검색 입력 필드
  - 필터 변경 시 부드러운 전환
  - _Requirements: 3.3_

### 3.5 통계 대시보드 섹션 구현
- [ ] 글로벌 통계 카드
  - 전체 사용자 수, 카드 수, 거래 수
  - 애니메이션 숫자 카운터
  - 도넛/원형 차트 추가
  - _Requirements: 3.1_

- [ ] 리더보드 미리보기
  - 상위 크리에이터 3명
  - 프로필 이미지 + 닉네임 + 통계
  - "전체 보기" 버튼
  - _Requirements: 3.1_

## Phase 4: Animation System (4주차)

### 4.1 기본 애니메이션 구현
- [ ] Entrance 애니메이션
  - `fade-in-up` - 페이드 인 + 위로 이동
  - `fade-in-scale` - 페이드 인 + 스케일
  - `slide-in-left/right` - 좌우 슬라이드 인
  - _Requirements: 3.2, 5.3_

- [ ] Stagger 애니메이션 시스템
  - `.stagger-item` 클래스
  - nth-child 기반 animation-delay
  - 카드 그리드, 팀 그리드에 적용
  - _Requirements: 3.3_

- [ ] 페이지 전환 애니메이션
  - SvelteKit 페이지 전환 트랜지션
  - Fade + Slide 조합
  - 로딩 상태 Shimmer 효과
  - _Requirements: 3.4, 5.4_

### 4.2 인터랙티브 애니메이션 구현
- [ ] Ripple 효과 시스템
  - 버튼 클릭 시 물결 효과
  - `::after` 가상 요소 활용
  - 동적 위치 계산 (클릭 좌표)
  - _Requirements: 5.1_

- [ ] Glow Pulse 애니메이션
  - 중요 요소에 주기적 글로우 효과
  - "신규" 배지, 알림 아이콘 등에 적용
  - `glow-pulse` keyframe 애니메이션
  - _Requirements: 3.1, 5.5_

- [ ] Shimmer 로딩 효과
  - 이미지 로딩 중 Shimmer 플레이스홀더
  - 선형 그라디언트 이동 애니메이션
  - `.shimmer` 유틸리티 클래스
  - _Requirements: 5.4_

### 4.3 특수 효과 구현
- [ ] Confetti 효과
  - 성공 액션 시 Confetti 터트리기
  - `confetti-fall` 애니메이션
  - 다중 컬러 파티클 생성
  - _Requirements: 5.5_

- [ ] Lightning Flash 효과
  - 희귀 카드 획득 시 번개 효과
  - 전체 화면 플래시 애니메이션
  - `lightning-flash` keyframe
  - _Requirements: 5.5_

- [ ] Particle Burst 효과
  - 카드 클릭 시 파티클 폭발
  - 방사형 파티클 이동 애니메이션
  - CSS 변수 기반 위치 제어
  - _Requirements: 5.5_

### 4.4 성능 최적화
- [ ] GPU 가속 적용
  - `transform: translateZ(0)` 추가
  - `will-change: transform` 적용
  - `backface-visibility: hidden` 최적화
  - _Requirements: 5.5, 7.5_

- [ ] 애니메이션 프레임 최적화
  - requestAnimationFrame 활용
  - 60fps 유지 검증
  - 저사양 기기 감지 및 효과 감소
  - _Requirements: 7.5_

## Phase 5: Responsive & Accessibility (5주차)

### 5.1 반응형 디자인 구현
- [ ] 브레이크포인트 시스템 정의
  - Mobile: < 640px
  - Tablet: 640px ~ 1024px
  - Desktop: 1024px ~ 1536px
  - Wide: > 1536px
  - _Requirements: 7.1, 7.4_

- [ ] 모바일 레이아웃 최적화
  - 히어로 섹션 단일 카드 표시
  - 팀 그리드 2열 → 1열
  - Masonry 피드 2열 → 1열
  - 폰트 크기 축소 (clamp 활용)
  - _Requirements: 7.1, 7.4_

- [ ] 터치 인터랙션 최적화
  - 터치 영역 최소 44x44px 보장
  - 스와이프 제스처 추가
  - 터치 피드백 햅틱 지원 (가능한 경우)
  - _Requirements: 7.1, 7.3_

### 5.2 접근성 구현
- [ ] 명도 대비 검증
  - WCAG 2.1 AA 기준 충족 (4.5:1)
  - 모든 텍스트-배경 조합 검증
  - 고대비 모드 지원 추가
  - _Requirements: Accessibility_

- [ ] 키보드 네비게이션 구현
  - `:focus-visible` 스타일 추가
  - Tab 순서 논리적 구성
  - "Skip to content" 링크 추가
  - _Requirements: Accessibility_

- [ ] 스크린 리더 지원
  - 적절한 ARIA 라벨 추가
  - `alt` 텍스트 모든 이미지에 추가
  - 랜드마크 역할 정의 (role="main", "navigation" 등)
  - _Requirements: Accessibility_

- [ ] 애니메이션 감소 옵션
  - `prefers-reduced-motion` 미디어 쿼리 구현
  - 애니메이션 비활성화 또는 단축
  - 홀로그래픽 레이어 숨김
  - _Requirements: Accessibility_

### 5.3 성능 검증 및 최적화
- [ ] Core Web Vitals 측정
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
  - _Requirements: Performance_

- [ ] 이미지 최적화
  - WebP/AVIF 포맷 전환
  - Progressive 로딩 구현
  - Lazy loading 적용
  - Responsive images (srcset)
  - _Requirements: Performance, 7.5_

- [ ] 번들 크기 최적화
  - 코드 스플리팅 적용
  - Tree shaking 검증
  - gzip 압축 후 < 500KB 목표
  - Critical CSS 인라인화
  - _Requirements: Performance_

## Phase 6: Testing & Documentation (6주차)

### 6.1 단위 테스트 작성
- [ ] 컴포넌트 단위 테스트
  - `UnifiedHolographicCard.test.ts`
  - `HeroCarousel.test.ts`
  - `MasonryFeed.test.ts`
  - _Requirements: 모든 컴포넌트_

- [ ] 유틸리티 함수 테스트
  - 홀로그래픽 효과 계산 로직
  - 컬러 변환 함수
  - 애니메이션 타이밍 함수
  - _Requirements: 모든 요구사항_

### 6.2 통합 테스트 작성
- [ ] 페이지 레벨 테스트
  - 메인 페이지 렌더링 테스트
  - 사용자 플로우 테스트
  - 상태 관리 테스트
  - _Requirements: 모든 요구사항_

- [ ] 크로스 브라우저 테스트
  - Chrome 90+
  - Safari 14+
  - Firefox 88+
  - Edge 90+
  - iOS Safari 14+
  - Android Chrome 90+
  - _Requirements: Browser Support_

### 6.3 E2E 테스트 작성
- [ ] 사용자 시나리오 테스트
  - 카드 뽑기 → 컬렉션 추가 → 자랑하기
  - 팀 선택 → 테마 변경 → 카드 확인
  - 커뮤니티 피드 → 필터링 → 상세 보기
  - _Requirements: 전체 사용자 플로우_

- [ ] 성능 테스트
  - Lighthouse CI 통합
  - 90+ 점수 목표
  - 각 페이지별 성능 검증
  - _Requirements: Performance_

### 6.4 문서화
- [ ] 디자인 시스템 문서 업데이트
  - Storybook 스토리 작성
  - 컴포넌트 Props 문서화
  - 사용 예제 추가
  - _Requirements: 모든 컴포넌트_

- [ ] 개발자 가이드 작성
  - 새로운 구단 컬러 추가 방법
  - 커스텀 홀로그래픽 효과 생성 방법
  - 애니메이션 커스터마이징 가이드
  - _Requirements: 유지보수성_

- [ ] 사용자 가이드 작성
  - 구단 선택 및 테마 변경 방법
  - 카드 인터랙션 설명
  - 접근성 기능 안내
  - _Requirements: 사용자 경험_

## Success Metrics

### 사용자 경험 지표
- [ ] 첫인상 "와" 반응 유도 (사용자 피드백)
- [ ] 카드 인터랙션 시간 30초+ 유지 (Analytics)
- [ ] 재방문률 30% 증가 (Analytics)
- [ ] 체류 시간 50% 증가 (Analytics)
- [ ] SNS 공유율 2배 증가 (Analytics)

### 기술 지표
- [ ] Core Web Vitals 모두 녹색
- [ ] 애니메이션 프레임 드롭 < 1%
- [ ] 메모리 사용량 < 200MB
- [ ] 번들 크기 < 500KB (gzip)
- [ ] API 응답 시간 < 200ms

---

**예상 완료 기간**: 6주 (완벽한 구현)
**우선순위**: Phase 1-3 (핵심 기능) → Phase 4-5 (고도화) → Phase 6 (검증)
**스타일**: 생동감/화려함
**타겟**: KBO 야구 팬, 카드 수집가
