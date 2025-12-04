# Feature Specification: Production Service Integration

**Feature Branch**: `004-production-service-integration`
**Created**: 2025-12-01
**Status**: Draft
**Input**: User description: "백엔드 환경과 연동하여 실제 서비스를 위한 개발"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 사용자 인증 및 세션 관리 (Priority: P1)

사용자가 플랫폼에 가입하고 로그인하여 개인화된 카드 컬렉션을 관리할 수 있다. 세션이 유지되어 브라우저를 닫아도 다시 방문 시 로그인 상태가 유지된다.

**Why this priority**: 인증은 모든 개인화 기능의 기반이며, 사용자 데이터 보호와 개인 컬렉션 관리에 필수적이다.

**Independent Test**: 새 사용자로 가입하고, 로그인하고, 브라우저를 닫은 후 다시 열어 세션이 유지되는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 미가입 사용자가 회원가입 페이지에 있을 때, **When** 이메일과 비밀번호를 입력하고 가입 버튼을 클릭하면, **Then** 계정이 생성되고 자동으로 로그인된다.
2. **Given** 기존 사용자가 로그인 페이지에 있을 때, **When** 올바른 자격증명을 입력하면, **Then** 홈페이지로 이동하고 사용자 정보가 헤더에 표시된다.
3. **Given** 로그인된 사용자가 브라우저를 닫았을 때, **When** 24시간 이내에 다시 방문하면, **Then** 로그인 상태가 유지된다.
4. **Given** OAuth 버튼이 있는 로그인 페이지에서, **When** Google 또는 GitHub로 로그인을 선택하면, **Then** 해당 제공자의 인증 후 계정이 연결되거나 생성된다.

---

### User Story 2 - 카드 이미지 업로드 및 저장 (Priority: P1)

사용자가 카드 제작 페이지에서 이미지를 업로드하면 서버에 안전하게 저장되고, 어느 기기에서든 접근할 수 있다.

**Why this priority**: 카드 제작의 핵심 기능이며, 영구 저장 없이는 서비스 가치가 없다.

**Independent Test**: 이미지를 업로드하고, 다른 기기나 브라우저에서 로그인하여 같은 카드를 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 로그인한 사용자가 카드 제작 페이지에 있을 때, **When** 10MB 이하의 이미지를 업로드하면, **Then** 이미지가 서버에 저장되고 즉시 미리보기가 표시된다.
2. **Given** 이미지 업로드 중일 때, **When** 업로드가 진행되면, **Then** 진행률 표시와 함께 업로드 상태가 표시된다.
3. **Given** 카드가 저장된 후, **When** 다른 기기에서 컬렉션을 확인하면, **Then** 동일한 카드 이미지가 표시된다.

---

### User Story 3 - 카드 컬렉션 관리 (Priority: P2)

사용자가 생성한 카드를 컬렉션에 저장하고, 정렬, 필터링, 즐겨찾기 기능을 사용하여 관리할 수 있다.

**Why this priority**: 수집 경험의 핵심이지만, 기본 인증과 저장 기능이 먼저 필요하다.

**Independent Test**: 여러 카드를 생성하고 컬렉션에서 팀별 필터링, 등급별 정렬이 작동하는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 사용자가 컬렉션 페이지에 있을 때, **When** 팀 필터를 선택하면, **Then** 해당 팀의 카드만 표시된다.
2. **Given** 사용자가 컬렉션을 보고 있을 때, **When** 등급순 정렬을 선택하면, **Then** 레전더리부터 커먼 순으로 정렬된다.
3. **Given** 사용자가 카드를 클릭했을 때, **When** 즐겨찾기 버튼을 누르면, **Then** 즐겨찾기에 추가되고 아이콘이 변경된다.

---

### User Story 4 - 커뮤니티 소셜 기능 (Priority: P2)

사용자가 자신의 카드를 커뮤니티에 공유하고, 다른 사용자의 카드에 좋아요와 댓글을 남길 수 있다.

**Why this priority**: 커뮤니티 참여가 플랫폼의 장기적 가치이지만, 개인 기능이 먼저 안정화되어야 한다.

**Independent Test**: 카드를 공유하고 다른 사용자(테스트 계정)로 좋아요와 댓글이 표시되는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 로그인한 사용자가 자신의 카드를 보고 있을 때, **When** 커뮤니티 공유 버튼을 클릭하면, **Then** 카드가 갤러리 피드에 나타난다.
2. **Given** 사용자가 갤러리에서 다른 사용자의 카드를 보고 있을 때, **When** 좋아요 버튼을 클릭하면, **Then** 좋아요 수가 즉시 증가하고 좋아요 상태가 저장된다.
3. **Given** 사용자가 카드 상세 페이지에 있을 때, **When** 댓글을 작성하면, **Then** 댓글이 즉시 표시되고 다른 사용자도 볼 수 있다.

---

### User Story 5 - 가챠(뽑기) 시스템 결과 저장 (Priority: P2)

사용자가 가챠에서 뽑은 카드가 서버에 저장되어 컬렉션에 자동으로 추가된다.

**Why this priority**: 가챠 시스템의 결과가 저장되어야 수집 동기가 부여된다.

**Independent Test**: 가챠를 실행하고 컬렉션 페이지에서 뽑은 카드가 추가되었는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 로그인한 사용자가 가챠 페이지에서 뽑기를 완료했을 때, **When** 결과가 표시되면, **Then** 뽑은 카드가 서버에 저장된다.
2. **Given** 가챠 결과가 저장된 후, **When** 컬렉션 페이지로 이동하면, **Then** 방금 뽑은 카드가 목록에 표시된다.
3. **Given** 중복 카드를 뽑았을 때, **When** 컬렉션에 이미 존재하면, **Then** 중복 표시와 함께 카드 카운트가 증가한다.

---

### Edge Cases

- 네트워크 연결이 끊긴 상태에서 이미지 업로드 시 어떻게 처리되는가?
  - 로컬에 임시 저장하고 연결 복구 시 자동 업로드 시도
- 동시에 같은 카드에 좋아요를 누르면 어떻게 되는가?
  - 낙관적 업데이트 후 서버 응답으로 실제 카운트 동기화
- 세션이 만료된 상태에서 API 호출 시 어떻게 되는가?
  - 401 응답 시 로그인 페이지로 리다이렉트하며 원래 페이지 기억
- 업로드 제한(파일 크기, 형식)을 초과한 경우 어떻게 되는가?
  - 업로드 전 클라이언트에서 검증하고 친화적인 오류 메시지 표시
- 서버 오류 발생 시 사용자에게 어떻게 알리는가?
  - 토스트 메시지로 오류 표시하고 재시도 옵션 제공

## Requirements *(mandatory)*

### Functional Requirements

**인증 관련**
- **FR-001**: System MUST allow users to create accounts with email and password
- **FR-002**: System MUST authenticate users with email/password or OAuth (Google, GitHub)
- **FR-003**: System MUST maintain user sessions for 24 hours after last activity
- **FR-004**: System MUST securely store authentication tokens (httpOnly cookies)
- **FR-005**: Users MUST be able to log out and clear their session

**파일 저장 관련**
- **FR-006**: System MUST accept image uploads up to 10MB in size
- **FR-007**: System MUST support JPEG, PNG, and WebP image formats
- **FR-008**: System MUST generate thumbnails for uploaded images
- **FR-009**: System MUST provide upload progress feedback to users
- **FR-010**: System MUST store files in persistent cloud storage

**카드/컬렉션 관련**
- **FR-011**: System MUST save card metadata (title, team, rarity, stats) to database
- **FR-012**: System MUST associate cards with user accounts
- **FR-013**: Users MUST be able to filter cards by team and rarity
- **FR-014**: Users MUST be able to sort cards by creation date, rarity, or favorites
- **FR-015**: Users MUST be able to mark cards as favorites

**소셜 기능 관련**
- **FR-016**: Users MUST be able to share cards to the community gallery
- **FR-017**: Users MUST be able to like other users' shared cards
- **FR-018**: Users MUST be able to comment on shared cards
- **FR-019**: System MUST display real-time like counts
- **FR-020**: System MUST notify users of new likes/comments on their cards

**가챠 관련**
- **FR-021**: System MUST save gacha results to user's collection
- **FR-022**: System MUST track duplicate cards with count
- **FR-023**: System MUST record gacha history with timestamps

### Key Entities

- **User**: 계정 정보, 인증 상태, 프로필 데이터. 카드 컬렉션과 1:N 관계
- **Card**: 카드 메타데이터(제목, 팀, 등급, 번호), 이미지 URL, 생성일. User와 N:1 관계
- **Collection**: 사용자의 카드 목록, 즐겨찾기 상태, 중복 카운트
- **Like**: 사용자-카드 간 좋아요 관계, 생성 시간
- **Comment**: 카드에 대한 댓글, 작성자, 내용, 생성 시간
- **GachaHistory**: 뽑기 기록, 결과 카드 목록, 시간

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 사용자가 회원가입을 2분 이내에 완료할 수 있다
- **SC-002**: 이미지 업로드가 10초 이내에 완료된다 (5MB 기준)
- **SC-003**: 페이지 로드 시 3초 이내에 사용자 데이터가 표시된다
- **SC-004**: 좋아요/댓글이 클릭 후 1초 이내에 UI에 반영된다
- **SC-005**: 가챠 결과가 100% 정확하게 컬렉션에 저장된다
- **SC-006**: 서버 오류 발생 시 95%의 경우 사용자 친화적 메시지가 표시된다
- **SC-007**: 1000명의 동시 사용자를 지원한다
- **SC-008**: 세션 기반 기능의 99.5% 가용성을 유지한다

## Assumptions

- PocketBase를 백엔드로 사용하며 SQLite(개발) → PostgreSQL(프로덕션)으로 마이그레이션 예정
- MinIO를 파일 저장소로 사용하며 S3 호환 API 제공
- 모든 API 호출은 src/lib/services/ 내 서비스 레이어를 통해 수행
- 한국어가 기본 언어이며 오류 메시지도 한국어로 제공
- OAuth 제공자로 Google과 GitHub만 지원 (확장 가능)
- 이미지는 WebP 형식으로 최적화하여 저장
