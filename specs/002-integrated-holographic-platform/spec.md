# Feature Specification: Integrated Holographic Platform

**Feature Branch**: `002-integrated-holographic-platform`
**Created**: 2025-10-07
**Status**: Draft
**Input**: Phase 1 (Enhanced Card), Phase 2 (Main Renewal), Phase 4 (Community)를 충돌 없이 통합한 종합 홀로그래픽 카드 플랫폼

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Holographic Card System (Priority: P1)

모든 화면(테스트, 메인, 갤러리, 커뮤니티)에서 일관된 고품질 홀로그래픽 카드 경험을 제공하여, 사용자가 어디서든 동일한 프리미엄 인터랙션을 경험할 수 있다.

**Why this priority**: 플랫폼의 핵심 가치 제안. 카드 시스템이 통합되지 않으면 다른 모든 기능이 의미 없음.

**Independent Test**: 사용자가 /test, /, /gallery 페이지에서 동일한 카드를 보았을 때 일관된 홀로그래픽 효과, 뒤집기 애니메이션, 터치 반응을 경험하면 성공.

**Acceptance Scenarios**:

1. **Given** 사용자가 Enhanced Card 기반 홀로그래픽 카드를 볼 때, **When** 마우스를 카드 위에서 움직이면, **Then** 시스템은 개선된 홀로그래픽 효과(overlay/soft-light 블렌드)를 적용하되 원본 이미지 가시성을 유지한다
2. **Given** 사용자가 카드를 클릭했을 때, **When** 카드가 뒤집히기 시작하면, **Then** 시스템은 Y축 180도 3D 회전 애니메이션(600ms)을 실행하고 뒷면 정보를 표시한다
3. **Given** 터치 디바이스 사용자가 카드를 조작할 때, **When** 손가락으로 카드를 드래그하면, **Then** 시스템은 터치 좌표에 따라 홀로그래픽 효과를 실시간 업데이트한다
4. **Given** 카드가 뒤집힌 상태일 때, **When** 사용자가 마우스를 움직이면, **Then** 시스템은 카드 뒷면에도 홀로그래픽 효과를 적용한다
5. **Given** 애니메이션이 진행 중일 때, **When** 사용자가 카드를 다시 클릭하면, **Then** 시스템은 중복 클릭을 방지하고 현재 애니메이션이 완료될 때까지 대기한다

---

### User Story 2 - Integrated Main Page with Collection Focus (Priority: P1)

포토카드 수집에 초점을 맞춘 메인 화면에서 사용자의 컬렉션, 커뮤니티 피드, 팀 섹션을 통합하여 한 곳에서 모든 활동을 관리할 수 있다.

**Why this priority**: 사용자의 첫 인상을 결정하는 메인 화면. MVP의 핵심 UX이므로 P1.

**Independent Test**: 사용자가 메인 페이지에 접속하여 자신의 최신 카드 3장, 컬렉션 진행도, 커뮤니티 피드를 한 화면에서 확인하고 각 섹션을 탐색할 수 있으면 성공.

**Acceptance Scenarios**:

1. **Given** 인증된 사용자가 메인 화면에 접속했을 때, **When** 페이지가 로드되면, **Then** 시스템은 CollectionDashboard에 최신 획득 카드 3장과 컬렉션 통계(총 카드 수, 희귀 카드 수, 완성도)를 표시한다
2. **Given** 사용자가 진행 중인 컬렉션을 볼 때, **When** CollectionDashboard를 스크롤하면, **Then** 시스템은 각 컬렉션의 완성도를 진행바(예: 15/30 카드, 50%)로 표시한다
3. **Given** 사용자가 자랑하고 싶은 카드가 있을 때, **When** "자랑하기" 버튼을 클릭하면, **Then** 시스템은 카드 선택 모달을 열고 선택한 카드를 커뮤니티에 게시할 수 있는 옵션을 제공한다
4. **Given** 사용자가 커뮤니티 활동을 보고 싶을 때, **When** 메인 화면을 스크롤하면, **Then** 시스템은 CommunityFeed를 Civitai 스타일 마소네리 그리드로 표시한다
5. **Given** 사용자가 특정 팀 팬일 때, **When** KBOTeamsSection에서 팀을 선택하면, **Then** 시스템은 해당 팀 컬러와 테마를 메인 화면에 적용하고 팀 관련 카드를 우선 표시한다

---

### User Story 3 - Fan Culture Integration (Priority: P2)

한국 야구 문화가 반영된 특별한 경험을 통해 팬으로서의 정체성을 표현하고, 구단별 커뮤니티에서 동료 팬들과 교류할 수 있다.

**Why this priority**: 차별화 요소이지만 MVP 핵심 기능(카드 + 메인)이 먼저 완성되어야 의미 있음.

**Independent Test**: 사용자가 자신의 응원 구단(예: LG 트윈스)을 선택하고, 메인 화면이 팀 컬러(보라색)로 변경되며, 팬 등급(예: 외야석 팬 → 응원단 멤버)이 활동에 따라 업그레이드되는 것을 확인할 수 있으면 성공.

**Acceptance Scenarios**:

1. **Given** 사용자가 설정에서 응원 구단을 선택했을 때, **When** 메인 화면으로 돌아오면, **Then** 시스템은 해당 팀의 공식 컬러(예: LG 보라색, 두산 네이비)를 헤더와 액센트에 적용한다
2. **Given** 사용자가 카드를 생성하고 커뮤니티에 참여할 때, **When** 활동 점수가 임계값을 넘으면, **Then** 시스템은 팬 등급을 업데이트하고 새 등급 해금 알림을 표시한다 (야구 입문자 → 외야석 팬 → 응원단 멤버 → 시즌권 홀더 → 구단 레전드)
3. **Given** 정규 시즌 중일 때, **When** 사용자가 메인 화면을 방문하면, **Then** 시스템은 응원 구단의 오늘 경기 정보(상대팀, 시간, 현재 스코어)를 배너로 표시한다
4. **Given** 한국시리즈, 올스타전 등 특별 이벤트 기간일 때, **When** 사용자가 플랫폼에 접속하면, **Then** 시스템은 이벤트 배너와 한정 카드 이벤트를 메인 화면 상단에 표시한다
5. **Given** 사용자가 KBOTeamsSection에서 구단 로고를 클릭했을 때, **When** 구단별 팬클럽 페이지로 이동하면, **Then** 시스템은 해당 구단 팬들의 전용 커뮤니티 공간(팀 색상, 응원가, 팬 랭킹)을 제공한다

---

### User Story 4 - Unified Community System (Priority: P2)

카드 제작, 공유, 평가, 템플릿 거래를 하나의 통합된 커뮤니티 시스템에서 경험하여, 여러 페이지를 오가지 않고도 소셜 활동을 완료할 수 있다.

**Why this priority**: 커뮤니티 기능은 중요하지만, 카드 시스템과 메인 화면이 먼저 작동해야 함.

**Independent Test**: 사용자가 메인 화면 커뮤니티 피드에서 카드를 업로드하고, 다른 사용자의 카드에 좋아요/댓글을 달고, 크리에이터를 팔로우하여 개인화된 피드를 받을 수 있으면 성공.

**Acceptance Scenarios**:

1. **Given** 사용자가 새로운 카드를 제작했을 때, **When** "커뮤니티에 공유" 버튼을 클릭하면, **Then** 시스템은 카드를 CommunityFeed에 게시하고 팔로워들에게 알림을 발송한다
2. **Given** 다른 사용자의 카드를 보고 있을 때, **When** 좋아요 버튼을 클릭하면, **Then** 시스템은 좋아요 수를 즉시 업데이트하고 카드 작성자에게 실시간 알림을 발송한다
3. **Given** 사용자가 특정 크리에이터의 작품을 좋아할 때, **When** 프로필에서 "팔로우" 버튼을 클릭하면, **Then** 시스템은 팔로우 관계를 저장하고 해당 크리에이터의 새 카드를 개인화된 피드 상단에 표시한다
4. **Given** 실시간으로 커뮤니티 활동이 발생할 때, **When** 사용자가 알림 아이콘을 클릭하면, **Then** 시스템은 새 좋아요, 댓글, 팔로우, 카드 업로드 등을 시간순으로 정렬하여 표시한다
5. **Given** 크리에이터가 자신이 만든 템플릿을 공유하고 싶을 때, **When** "템플릿으로 저장" 버튼을 클릭하면, **Then** 시스템은 템플릿을 템플릿 마켓에 게시하고 다른 사용자가 다운로드할 수 있게 한다

---

### User Story 5 - Performance & Accessibility Optimization (Priority: P1)

모든 홀로그래픽 효과가 60fps를 유지하고, 키보드 네비게이션과 스크린 리더를 지원하며, 모바일에서도 부드럽게 작동하여 모든 사용자가 프리미엄 경험을 누릴 수 있다.

**Why this priority**: Constitution에서 60fps는 NON-NEGOTIABLE. 성능 기준을 충족하지 못하면 출시 불가.

**Independent Test**: Chrome DevTools Performance 패널에서 홀로그래픽 카드 인터랙션 중 FPS가 60 이상 유지되고, Lighthouse 접근성 점수가 90+ 이며, 모바일 터치가 16ms 이내 반응하면 성공.

**Acceptance Scenarios**:

1. **Given** 사용자가 홀로그래픽 카드와 상호작용할 때, **When** Chrome DevTools Performance 패널로 측정하면, **Then** 시스템은 마우스 이동, 카드 뒤집기, 터치 이벤트 모두에서 60fps(16.67ms/frame)를 유지한다
2. **Given** 키보드만 사용하는 사용자가 플랫폼을 탐색할 때, **When** Tab 키로 네비게이션하고 Enter/Space로 카드를 선택하면, **Then** 시스템은 포커스 인디케이터를 명확히 표시하고 모든 인터랙티브 요소에 접근할 수 있게 한다
3. **Given** 메인 페이지가 로딩될 때, **When** Lighthouse로 측정하면, **Then** 시스템은 Time to Interactive가 3초 이내이고 First Contentful Paint가 1.5초 이내다
4. **Given** 모바일 사용자가 카드를 터치할 때, **When** 손가락으로 카드를 조작하면, **Then** 시스템은 터치 입력을 16ms 이내에 감지하고 홀로그래픽 효과를 즉시 업데이트한다
5. **Given** 사용자가 Chrome, Safari, Firefox에서 플랫폼을 방문할 때, **When** 각 브라우저에서 카드 인터랙션을 테스트하면, **Then** 시스템은 동일한 홀로그래픽 효과와 애니메이션을 일관되게 렌더링한다

---

### Edge Cases

- **컴포넌트 충돌**: Phase 1의 Enhanced Card와 Phase 4의 Holographic Card가 동일 페이지에 렌더링될 때 어떻게 처리하는가?
- **데이터 모델 마이그레이션**: 기존 Phase 1 테스트 데이터를 통합 UnifiedCard 모델로 어떻게 변환하는가?
- **상태 관리 충돌**: CollectionDashboard와 CommunityFeed가 동일한 카드 데이터를 수정할 때 동기화는 어떻게 보장하는가?
- **테마 우선순위**: 사용자가 팀 테마와 다크모드를 동시에 설정했을 때 어떤 스타일이 우선하는가?
- **성능 저하**: 메인 화면에 100개 이상의 카드가 동시에 표시될 때 60fps를 유지할 수 있는가?
- **네비게이션 충돌**: 사용자가 /test, /, /gallery를 빠르게 전환할 때 상태가 올바르게 유지되는가?
- **API 의존성**: PocketBase 실시간 구독이 끊겼을 때 커뮤니티 피드는 어떻게 동작하는가?

## Requirements *(mandatory)*

### Functional Requirements

**Unified Holographic Card System**
- **FR-001**: 시스템은 UnifiedHolographicCard 컴포넌트를 생성하여 모든 컨텍스트(test, main, gallery, community)에서 일관된 홀로그래픽 효과를 제공해야 한다
- **FR-002**: 시스템은 카드 크기(small, medium, large, featured)를 props로 받아 각 컨텍스트에 맞게 렌더링해야 한다
- **FR-003**: 시스템은 Enhanced Card Interaction의 검증된 홀로그래픽 효과(overlay/soft-light)를 기본값으로 사용해야 한다
- **FR-004**: 시스템은 Y축 180도 3D 카드 뒤집기 애니메이션(600ms, ease-in-out)을 지원해야 한다
- **FR-005**: 시스템은 터치 이벤트(touchstart, touchmove, touchend)를 감지하고 홀로그래픽 효과를 실시간 업데이트해야 한다

**Integrated Main Page**
- **FR-006**: 시스템은 IntegratedMainPage 레이아웃을 생성하여 CollectionDashboard, CommunityFeed, KBOTeamsSection을 통합해야 한다
- **FR-007**: 시스템은 CollectionDashboard에서 사용자의 최신 카드 3장과 컬렉션 통계를 표시해야 한다
- **FR-008**: 시스템은 컬렉션 완성도를 진행바 UI로 시각화해야 한다 (예: 15/30 카드, 50%)
- **FR-009**: 시스템은 "자랑하기" 버튼 클릭 시 카드 선택 모달을 열고 커뮤니티 게시 기능을 제공해야 한다
- **FR-010**: 시스템은 CommunityFeed를 Civitai 스타일 마소네리 그리드로 렌더링해야 한다

**Fan Culture**
- **FR-011**: 시스템은 사용자가 선택한 응원 구단의 공식 컬러를 메인 화면 테마로 적용해야 한다
- **FR-012**: 시스템은 사용자 활동 점수에 따라 팬 등급(5단계)을 자동 업데이트해야 한다
- **FR-013**: 시스템은 정규 시즌 중 응원 구단의 오늘 경기 정보를 메인 화면 배너로 표시해야 한다
- **FR-014**: 시스템은 한국시리즈, 올스타전 등 특별 이벤트 배너를 자동으로 게시해야 한다
- **FR-015**: 시스템은 구단별 팬클럽 페이지를 생성하고 팀 색상, 응원가, 팬 랭킹을 표시해야 한다

**Unified Community**
- **FR-016**: 시스템은 카드 업로드 시 커뮤니티 피드에 자동 게시하고 팔로워에게 알림을 발송해야 한다
- **FR-017**: 시스템은 좋아요, 댓글, 평점 기능을 제공하고 실시간으로 업데이트해야 한다
- **FR-018**: 시스템은 팔로우 기능을 지원하고 팔로우한 크리에이터의 카드를 개인화된 피드에 우선 표시해야 한다
- **FR-019**: 시스템은 실시간 알림 시스템을 통해 새 좋아요, 댓글, 팔로우 활동을 즉시 전달해야 한다
- **FR-020**: 시스템은 템플릿 저장 기능을 제공하고 템플릿 마켓에 게시할 수 있어야 한다

**Performance & Accessibility**
- **FR-021**: 시스템은 모든 홀로그래픽 애니메이션을 60fps(16.67ms/frame) 이상으로 실행해야 한다
- **FR-022**: 시스템은 키보드 네비게이션(Tab, Enter, Space, Arrow keys)을 완전히 지원해야 한다
- **FR-023**: 시스템은 WCAG 2.1 AA 수준의 접근성을 충족해야 한다 (Lighthouse 접근성 점수 90+)
- **FR-024**: 시스템은 메인 페이지 Time to Interactive를 3초 이내로 유지해야 한다
- **FR-025**: 시스템은 터치 입력을 16ms 이내에 감지하고 반응해야 한다
- **FR-026**: 시스템은 Chrome, Safari, Firefox에서 동일한 홀로그래픽 효과를 렌더링해야 한다

### Key Entities

- **UnifiedCard**: 통합 카드 모델 (Enhanced Card + Photocard + Community 필드 통합)
  - Enhanced Card 필드: id, title, image, backImage, holographicEffect
  - Photocard 필드: rarity, stats, collections
  - Community 필드: creator, template, isPublic, tags, metadata
  - 공통: createdAt, updatedAt

- **UnifiedUser**: 통합 사용자 모델
  - 기본: id, username, email, avatar
  - 팬: fanLevel (5단계), favoriteTeam
  - 크리에이터: creatorLevel, creatorStats
  - 컬렉션: collections[], stats
  - 설정: preferences

- **Collection**: 카드 컬렉션
  - id, name, description, cards[], totalCards, completedCards, progress%

- **CommunityPost**: 커뮤니티 게시물
  - id, card, author, content, likes, comments, createdAt

- **KBOTeam**: 구단 정보
  - id, name, color (hex), logo, mascot, fanCount

- **FanLevel**: 팬 등급
  - level (1-5), name (야구 입문자 ~ 구단 레전드), requiredPoints, perks[]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 사용자가 /test, /, /gallery 페이지를 방문했을 때 동일한 카드가 일관된 홀로그래픽 효과를 표시한다 (시각적 일관성 테스트 통과율 100%)
- **SC-002**: 홀로그래픽 카드 인터랙션 중 평균 FPS가 60 이상이다 (Chrome DevTools Performance 측정)
- **SC-003**: 메인 페이지 로딩 시간이 3초 이내다 (Lighthouse Time to Interactive)
- **SC-004**: 키보드만 사용하여 모든 카드에 접근하고 상호작용할 수 있다 (키보드 네비게이션 완전 지원)
- **SC-005**: Lighthouse 접근성 점수가 90 이상이다 (WCAG 2.1 AA 준수)
- **SC-006**: 사용자가 응원 구단을 선택한 후 5초 이내에 메인 화면이 팀 테마로 변경된다
- **SC-007**: 팬 등급이 활동 점수 임계값 도달 시 즉시(1초 이내) 업데이트된다
- **SC-008**: 커뮤니티 피드에서 좋아요 버튼 클릭 후 2초 이내에 카드 작성자에게 알림이 도착한다
- **SC-009**: 메인 페이지에 100개 카드가 표시될 때도 60fps를 유지한다 (성능 저하 없음)
- **SC-010**: 사용자가 Phase 1, 2, 4 기능을 사용할 때 기존 기능이 정상 작동한다 (하위 호환성 100%)
- **SC-011**: 크로스 브라우저 테스트에서 Chrome, Safari, Firefox 모두 동일한 렌더링 결과를 보인다 (시각적 차이 <5%)
- **SC-012**: 사용자 만족도 조사에서 "일관되고 부드러운 경험"에 85% 이상 긍정 응답

## Assumptions

- **Phase 의존성**: Phase 1 (Enhanced Card)의 홀로그래픽 엔진이 완성되어 있고, Phase 2의 CollectionDashboard가 구현되어 있으며, Phase 4의 커뮤니티 기본 기능이 작동한다고 가정
- **컴포넌트 재사용**: 기존 Enhanced Card 컴포넌트를 UnifiedHolographicCard로 리팩토링하되, 기존 /test 페이지는 하위 호환성 유지
- **데이터 마이그레이션**: Phase 1 테스트 데이터를 UnifiedCard 모델로 변환하는 마이그레이션 스크립트 필요
- **상태 관리**: Svelte Stores를 사용하여 컴포넌트 간 카드 상태 동기화
- **테마 우선순위**: 팀 테마가 다크모드보다 우선하며, 사용자가 팀을 선택하지 않으면 기본 테마 사용
- **성능 최적화**: 가상 스크롤(Virtual Scrolling)로 대량 카드 렌더링 시 성능 유지
- **실시간 기능**: PocketBase WebSocket을 통한 실시간 알림 및 커뮤니티 업데이트
- **모바일 지원**: 터치 이벤트는 Pointer Events API로 통일하여 마우스/터치 동시 지원
- **API**: 실시간 경기 정보는 공식 API 또는 크롤링으로 수집 (법적 검토 필요)

## Dependencies

- **Phase 1 (Enhanced Card Interaction)**: 홀로그래픽 엔진, 카드 뒤집기 애니메이션, 터치 이벤트 핸들러
- **Phase 2 (Photocard Main Renewal)**: CollectionDashboard 컴포넌트, 컬렉션 데이터 모델
- **Phase 4 (Holographic Card Community)**: 커뮤니티 피드, 좋아요/댓글 시스템, 템플릿 마켓 기본 구조
- **PocketBase**: 실시간 데이터베이스, WebSocket 구독, 사용자 인증
- **Tailwind CSS + Apple Design System**: 일관된 스타일링
- **Svelte Stores**: 전역 상태 관리 (카드 상태, 사용자 정보, 팔로우 관계)
- **API**: 실시간 경기 정보, 구단 데이터 (외부 API 또는 크롤링)

## Out of Scope

- **레거시 코드 완전 제거**: Phase 1, 2, 4의 기존 독립 컴포넌트는 당분간 유지 (점진적 마이그레이션)
- **고급 AI 추천**: 초기 통합 버전에서는 단순 인기도 기반 추천만 제공, AI 기반 추천은 이후 단계
- **실시간 경기 연동**: 초기에는 수동 업데이트된 경기 정보만 표시, 실시간 스코어 업데이트는 Phase 5 고려
- **모바일 앱**: 웹 플랫폼 통합 완료 후 React Native/Flutter 앱 개발 고려
- **다국어 지원**: 초기 한국어만 지원, 영어는 통합 안정화 후 추가
