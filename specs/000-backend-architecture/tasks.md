# 백엔드 아키텍처 구현 태스크

## 개요

프론트엔드와 백엔드 연계를 위한 PocketBase 스키마 설정 및 API 연동 작업입니다.

## 서버 환경

- **서버 IP**: 192.168.101.203
- **PocketBase**: http://192.168.101.203:8090
- **PocketBase Admin**: http://192.168.101.203:8090/_/
- **MinIO**: http://192.168.101.203:9000 (Console: 9001)
- **Redis**: 192.168.101.203:6379
- **Admin 계정**: admin@photo-cards.local / admin123456

## 현재 상태

### PocketBase 컬렉션 현황

| 컬렉션 | 상태 | 스키마 |
|--------|------|--------|
| users | ✅ 존재 | 기본 필드만 (name, avatar) |
| unified_cards | ✅ 완료 | 16개 필드 설정 완료 |
| unified_users | ✅ 완료 | 14개 필드 설정 완료 |
| kbo_teams | ✅ 완료 | 8개 필드 + 10개 팀 데이터 |
| fan_levels | ✅ 완료 | 5개 필드 + 5개 레벨 데이터 |
| collections | ✅ 완료 | 8개 필드 설정 완료 |
| templates | ✅ 완료 | 12개 필드 설정 완료 |
| community_posts | ✅ 완료 | 7개 필드 설정 완료 |
| reviews | ✅ 완료 | 5개 필드 설정 완료 |

---

## Phase 1: PocketBase 스키마 설정 ✅ 완료

### Task 1.1: unified_cards 컬렉션 스키마 설정 ✅
- [x] 1.1.1 title (text, required) - 카드 제목
- [x] 1.1.2 description (text) - 카드 설명
- [x] 1.1.3 holographic_image (file) - 홀로그래픽 이미지
- [x] 1.1.4 holographic_back_image (file) - 뒷면 이미지
- [x] 1.1.5 holographic_effect (select: overlay, soft-light, hard-light)
- [x] 1.1.6 holographic_intensity (number: 0-100)
- [x] 1.1.7 holographic_animation_duration (number: 100-2000)
- [x] 1.1.8 photocard_rarity (select: common, rare, epic, legendary)
- [x] 1.1.9 community_creator (relation -> unified_users)
- [x] 1.1.10 community_is_public (bool)
- [x] 1.1.11 community_tags (json)
- [x] 1.1.12 community_likes (number)
- [x] 1.1.13 community_downloads (number)
- [x] 1.1.14 community_rating (number)
- [x] 1.1.15 context (select: test, main, gallery, community)
- [x] 1.1.16 API 접근 규칙 설정 (listRule, viewRule, createRule, updateRule, deleteRule)

### Task 1.2: unified_users 컬렉션 스키마 설정 ✅
- [x] 1.2.1 user_id (relation -> users, unique)
- [x] 1.2.2 display_name (text)
- [x] 1.2.3 avatar_url (text)
- [x] 1.2.4 bio (text)
- [x] 1.2.5 theme (select: light, dark, auto, kbo-team)
- [x] 1.2.6 team_theme_color (text)
- [x] 1.2.7 fan_favorite_team (relation -> kbo_teams)
- [x] 1.2.8 fan_level (number: 1-5)
- [x] 1.2.9 fan_points (number)
- [x] 1.2.10 creator_followers (number)
- [x] 1.2.11 creator_following (number)
- [x] 1.2.12 stats_cards_created (number)
- [x] 1.2.13 stats_cards_collected (number)
- [x] 1.2.14 API 접근 규칙 설정

### Task 1.3: kbo_teams 컬렉션 스키마 설정 및 데이터 입력 ✅
- [x] 1.3.1 name (text, required) - 팀 이름 (한글)
- [x] 1.3.2 name_en (text) - 팀 이름 (영문)
- [x] 1.3.3 primary_color (text) - 주 색상
- [x] 1.3.4 secondary_color (text) - 보조 색상
- [x] 1.3.5 logo_url (file) - 로고
- [x] 1.3.6 mascot (text) - 마스코트
- [x] 1.3.7 stadium (text) - 홈구장
- [x] 1.3.8 10개 KBO 팀 데이터 입력

### Task 1.4: fan_levels 컬렉션 스키마 설정 및 데이터 입력 ✅
- [x] 1.4.1 level (number, unique)
- [x] 1.4.2 name (text)
- [x] 1.4.3 required_points (number)
- [x] 1.4.4 perks (json)
- [x] 1.4.5 5개 레벨 데이터 입력

### Task 1.5: collections 컬렉션 스키마 설정 ✅
- [x] 1.5.1 name (text, required)
- [x] 1.5.2 description (text)
- [x] 1.5.3 owner (relation -> unified_users)
- [x] 1.5.4 cards (relation -> unified_cards, multiple)
- [x] 1.5.5 is_public (bool)
- [x] 1.5.6 total_cards (number)
- [x] 1.5.7 completion_rate (number)
- [x] 1.5.8 API 접근 규칙 설정

### Task 1.6: templates 컬렉션 스키마 설정 ✅
- [x] 1.6.1 name (text, required)
- [x] 1.6.2 description (text)
- [x] 1.6.3 category (text)
- [x] 1.6.4 price (number)
- [x] 1.6.5 creator (relation -> unified_users)
- [x] 1.6.6 rating (number)
- [x] 1.6.7 rating_count (number)
- [x] 1.6.8 downloads (number)
- [x] 1.6.9 is_public (bool)
- [x] 1.6.10 template_data (json)
- [x] 1.6.11 preview_image (file)
- [x] 1.6.12 API 접근 규칙 설정

### Task 1.7: community_posts 컬렉션 스키마 설정 ✅
- [x] 1.7.1 card (relation -> unified_cards)
- [x] 1.7.2 author (relation -> unified_users)
- [x] 1.7.3 caption (text)
- [x] 1.7.4 visibility (select: public, fanclub, followers)
- [x] 1.7.5 likes (number)
- [x] 1.7.6 comments_count (number)
- [x] 1.7.7 API 접근 규칙 설정

### Task 1.8: reviews 컬렉션 스키마 설정 ✅
- [x] 1.8.1 template (relation -> templates)
- [x] 1.8.2 user (relation -> users)
- [x] 1.8.3 rating (number: 1-5)
- [x] 1.8.4 comment (text)
- [x] 1.8.5 API 접근 규칙 설정

---

## Phase 2: 프론트엔드 연동 ✅ 완료

### Task 2.1: PocketBase 클라이언트 설정 업데이트 ✅
- [x] 2.1.1 src/lib/pocketbase.ts 타입 정의 업데이트
- [x] 2.1.2 원격 서버 URL로 .env 설정 확인
- [x] 2.1.3 연결 테스트

### Task 2.2: 카드 API 서비스 구현 ✅
- [x] 2.2.1 getCards() - 카드 목록 조회
- [x] 2.2.2 getCard(id) - 카드 상세 조회
- [x] 2.2.3 createCard(data) - 카드 생성
- [x] 2.2.4 updateCard(id, data) - 카드 수정
- [x] 2.2.5 deleteCard(id) - 카드 삭제
- [x] 2.2.6 likeCard(id) - 좋아요
- [x] 2.2.7 searchCards(query) - 검색

### Task 2.3: 사용자 API 서비스 구현 ✅
- [x] 2.3.1 getCurrentUser() - 현재 사용자 조회
- [x] 2.3.2 getProfile(id) - 프로필 조회
- [x] 2.3.3 updateProfile(data) - 프로필 수정
- [x] 2.3.4 getUserCards(userId) - 사용자 카드 조회
- [x] 2.3.5 getUserCollections(userId) - 사용자 컬렉션 조회

### Task 2.4: 컬렉션 API 서비스 구현 ✅
- [x] 2.4.1 getCollections() - 컬렉션 목록
- [x] 2.4.2 getCollection(id) - 컬렉션 상세
- [x] 2.4.3 createCollection(data) - 컬렉션 생성
- [x] 2.4.4 addCardToCollection(collectionId, cardId) - 카드 추가
- [x] 2.4.5 removeCardFromCollection(collectionId, cardId) - 카드 제거

### Task 2.5: 팀/레벨 API 서비스 구현 ✅
- [x] 2.5.1 getKboTeams() - KBO 팀 목록
- [x] 2.5.2 getFanLevels() - 팬 레벨 목록
- [x] 2.5.3 updateUserTeam(teamId) - 선호 팀 설정

---

## Phase 3: 기존 페이지 연동 ✅ 완료

### Task 3.1: 갤러리 페이지 백엔드 연동 ✅
- [x] 3.1.1 src/routes/gallery/+page.svelte API 연동
- [x] 3.1.2 카드 목록 실시간 조회
- [x] 3.1.3 필터/정렬 기능 연동
- [x] 3.1.4 좋아요 기능 연동

### Task 3.2: 컬렉션 페이지 백엔드 연동 ✅
- [x] 3.2.1 src/routes/collections/+page.svelte API 연동
- [x] 3.2.2 사용자 컬렉션 조회
- [x] 3.2.3 컬렉션 CRUD 연동

### Task 3.3: 프로필 페이지 백엔드 연동 ✅
- [x] 3.3.1 프로필 조회 연동 (UserService.getProfile)
- [x] 3.3.2 프로필 수정 연동 (UserService.updateUnifiedUser)
- [x] 3.3.3 사용자 통계 표시 (UnifiedUser stats fields)

### Task 3.4: 인증 플로우 연동 ✅
- [x] 3.4.1 로그인 페이지 PocketBase 연동 (AuthService.login)
- [x] 3.4.2 회원가입 페이지 연동 (AuthService.register)
- [x] 3.4.3 OAuth 연동 (PocketBase OAuth support)
- [x] 3.4.4 세션 관리 (pb.authStore)

---

## Phase 4: 파일 업로드 연동 ✅ 완료

### Task 4.1: MinIO 연동 ✅
- [x] 4.1.1 MinIO 클라이언트 설정 (src/lib/server/minio.ts)
- [x] 4.1.2 holographic-cards 버킷 자동 생성 (ensureBucket)
- [x] 4.1.3 이미지 업로드 API 구현 (src/routes/api/upload/)
  - /api/upload/image - FormData 파일 업로드
  - /api/upload/base64 - Base64 이미지 업로드
  - /api/upload/presign - Presigned URL 생성
- [x] 4.1.4 이미지 URL 생성 (getPublicUrl, getPresignedUrl)

### Task 4.2: 카드 이미지 업로드 ✅
- [x] 4.2.1 홀로그래픽 이미지 업로드 (uploadCardFrontImage)
- [x] 4.2.2 뒷면 이미지 업로드 (uploadCardBackImage)
- [x] 4.2.3 이미지 미리보기 (uploadCardThumbnail)
- [x] 4.2.4 이미지 최적화 (uploadResizedImage)

### 구현된 파일
- `src/lib/server/minio.ts` - MinIO 서버 클라이언트
- `src/lib/services/upload.ts` - 클라이언트 업로드 서비스
- `src/lib/services/pocketbase-extended.ts` - 확장된 PocketBase 서비스 (CardService, CollectionService 등)
- `src/routes/api/upload/image/+server.ts` - FormData 업로드 API
- `src/routes/api/upload/base64/+server.ts` - Base64 업로드 API
- `src/routes/api/upload/presign/+server.ts` - Presigned URL API

### 사용 예시

```typescript
// MinIO를 통한 이미지 업로드 (클라이언트)
import { uploadCardFrontImage, uploadCardBackImage } from '$lib/services/upload';

const result = await uploadCardFrontImage(cardId, file);
if (result.success) {
  console.log('Uploaded to:', result.url);
}

// PocketBase 확장 서비스 사용
import { CardService, CollectionService, getFileUrl } from '$lib/services/pocketbase-extended';

// 카드 생성 (파일 포함)
const card = await CardService.createCardWithFiles({
  title: '새 카드',
  holographic_image: imageFile,
  community_is_public: true
});

// 파일 URL 가져오기
const imageUrl = getFileUrl(card, card.holographic_image);
```

---

## 검증 체크리스트

### API 연동 검증
- [ ] PocketBase API 연결 확인
- [ ] 인증 토큰 발급 확인
- [ ] CRUD 작업 정상 동작
- [ ] 파일 업로드 동작 확인

### 프론트엔드 검증
- [ ] 갤러리 페이지 데이터 표시
- [ ] 컬렉션 페이지 데이터 표시
- [ ] 인증 플로우 정상 동작
- [ ] 실시간 업데이트 동작

---

## 참고 자료

- [PocketBase 공식 문서](https://pocketbase.io/docs/)
- [specs/000-backend-architecture/data-model.md](./data-model.md)
- [specs/000-backend-architecture/API_REFERENCE.md](./API_REFERENCE.md)
- [specs/000-backend-architecture/quickstart.md](./quickstart.md)
