# API 레퍼런스

## 📋 개요

이 문서는 홀로그래픽 카드 커뮤니티 프로젝트의 모든 API 엔드포인트에 대한 상세한 레퍼런스입니다.

## 🔗 기본 정보

- **Base URL**: `http://localhost:8090/api`
- **Content-Type**: `application/json`
- **인증**: Bearer Token (JWT)

## 🔐 인증 API

### 사용자 로그인
```http
POST /api/collections/users/auth-with-password
Content-Type: application/json

{
  "identity": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "record": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "avatar_url"
  }
}
```

### 사용자 등록
```http
POST /api/collections/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "name": "User Name"
}
```

### 토큰 갱신
```http
POST /api/collections/users/auth-refresh
Authorization: Bearer {token}
```

### 비밀번호 재설정 요청
```http
POST /api/collections/users/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 🃏 카드 API

### 통합 카드 목록 조회
```http
GET /api/collections/unified_cards/records
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `perPage`: 페이지당 항목 수 (기본값: 30)
- `sort`: 정렬 필드 (예: `-created`)
- `filter`: 필터 조건 (예: `context = "community"`)
- `expand`: 관련 데이터 확장 (예: `community_creator`)

**응답:**
```json
{
  "page": 1,
  "perPage": 30,
  "totalItems": 100,
  "totalPages": 4,
  "items": [
    {
      "id": "card_id",
      "title": "Card Title",
      "holographic_image": "image_url",
      "holographic_effect": "overlay",
      "holographic_intensity": 75,
      "photocard_rarity": "rare",
      "community_creator": "user_id",
      "community_likes": 42,
      "community_rating": 4.5,
      "created": "2024-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 통합 카드 상세 조회
```http
GET /api/collections/unified_cards/records/{id}
```

### 통합 카드 생성
```http
POST /api/collections/unified_cards/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Card",
  "holographic_image": "image_url",
  "holographic_effect": "overlay",
  "holographic_intensity": 75,
  "photocard_rarity": "common",
  "community_creator": "user_id",
  "community_is_public": true,
  "community_tags": ["kbo", "baseball"],
  "community_likes": 0,
  "community_downloads": 0,
  "community_rating": 0,
  "community_rating_count": 0,
  "context": "community"
}
```

### 통합 카드 수정
```http
PATCH /api/collections/unified_cards/records/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Card Title",
  "community_likes": 43
}
```

### 통합 카드 삭제
```http
DELETE /api/collections/unified_cards/records/{id}
Authorization: Bearer {token}
```

## 👥 사용자 API

### 통합 사용자 목록 조회
```http
GET /api/collections/unified_users/records
```

### 통합 사용자 상세 조회
```http
GET /api/collections/unified_users/records/{id}
```

### 통합 사용자 수정
```http
PATCH /api/collections/unified_users/records/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_name": "New Display Name",
  "fan_favorite_team": "LG 트윈스",
  "fan_level": 2,
  "fan_points": 150
}
```

## 📚 컬렉션 API

### 컬렉션 목록 조회
```http
GET /api/collections/collections/records
```

### 컬렉션 상세 조회
```http
GET /api/collections/collections/records/{id}
```

### 컬렉션 생성
```http
POST /api/collections/collections/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Collection",
  "description": "Collection description",
  "owner": "user_id",
  "cards": ["card_id_1", "card_id_2"],
  "is_public": true,
  "total_cards": 2,
  "completion_rate": 100
}
```

## 🏢 팀 API

### 팀 목록 조회
```http
GET /api/collections/kbo_teams/records
```

**응답:**
```json
{
  "items": [
    {
      "id": "team_id",
      "name": "LG 트윈스",
      "name_en": "LG Twins",
      "primary_color": "#C30452",
      "secondary_color": "#000000",
      "mascot": "트윈돌이",
      "stadium": "잠실야구장"
    }
  ]
}
```

## 🎖️ 팬 레벨 API

### 팬 레벨 목록 조회
```http
GET /api/collections/fan_levels/records
```

**응답:**
```json
{
  "items": [
    {
      "id": "level_id",
      "level": 1,
      "name": "야구 입문자",
      "required_points": 0,
      "perks": ["기본 카드 제작", "공개 갤러리 조회"]
    }
  ]
}
```

## 💬 커뮤니티 API

### 커뮤니티 게시물 목록 조회
```http
GET /api/collections/community_posts/records
```

### 커뮤니티 게시물 생성
```http
POST /api/collections/community_posts/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "card": "card_id",
  "author": "user_id",
  "caption": "Check out my new card!",
  "visibility": "public",
  "likes": 0,
  "comments_count": 0
}
```

## 🛍️ 템플릿 API

### 템플릿 검색
```http
GET /api/templates/search
```

**쿼리 파라미터:**
- `q`: 검색어
- `category`: 카테고리
- `minPrice`: 최소 가격
- `maxPrice`: 최대 가격
- `sort`: 정렬 (price, rating, downloads, created)

**응답:**
```json
{
  "templates": [
    {
      "id": "template_id",
      "name": "Template Name",
      "description": "Template description",
      "category": "holographic",
      "price": 9.99,
      "creator": "user_id",
      "rating": 4.5,
      "downloads": 100,
      "is_public": true
    }
  ],
  "total": 50,
  "page": 1,
  "perPage": 20
}
```

### 인기 템플릿
```http
GET /api/templates/trending
```

### 추천 템플릿
```http
GET /api/templates/recommended
Authorization: Bearer {token}
```

### 템플릿 평점 조회
```http
GET /api/templates/{id}/rating
```

### 템플릿 리뷰 조회
```http
GET /api/templates/{id}/reviews
```

## ⭐ 리뷰 API

### 리뷰 생성
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_id": "template_id",
  "rating": 5,
  "comment": "Great template!",
  "user_id": "user_id"
}
```

### 리뷰 목록 조회
```http
GET /api/reviews
```

**쿼리 파라미터:**
- `template_id`: 템플릿 ID
- `user_id`: 사용자 ID
- `rating`: 평점 필터

## 📁 파일 업로드 API

### 이미지 업로드
```http
POST /api/files/{collection}/{recordId}/{field}
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
```

**예시:**
```http
POST /api/files/unified_cards/card_id/holographic_image
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [image binary data]
```

**응답:**
```json
{
  "id": "file_id",
  "collectionId": "unified_cards",
  "collectionName": "unified_cards",
  "recordId": "card_id",
  "filename": "image.jpg",
  "url": "http://localhost:8090/api/files/unified_cards/card_id/image.jpg"
}
```

## 🔍 고급 쿼리

### 필터링
```http
GET /api/collections/unified_cards/records?filter=context = "community" && community_is_public = true
```

### 정렬
```http
GET /api/collections/unified_cards/records?sort=-community_likes,created
```

### 확장 (관련 데이터 포함)
```http
GET /api/collections/unified_cards/records?expand=community_creator
```

### 필드 선택
```http
GET /api/collections/unified_cards/records?fields=id,title,holographic_image,community_likes
```

## 📊 통계 API

### 사용자 통계
```http
GET /api/users/{id}/stats
Authorization: Bearer {token}
```

**응답:**
```json
{
  "cards_created": 25,
  "cards_collected": 150,
  "collections": 5,
  "total_likes": 500,
  "total_downloads": 200
}
```

### 템플릿 통계
```http
GET /api/templates/{id}/stats
```

## 🚨 에러 응답

### 일반적인 에러 코드
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `422`: 유효성 검사 실패
- `500`: 서버 오류

### 에러 응답 형식
```json
{
  "code": 400,
  "message": "Validation failed",
  "data": {
    "title": {
      "code": "validation_required",
      "message": "The title field is required."
    }
  }
}
```

## 🔧 개발 도구

### API 테스트
```bash
# curl 예시
curl -X GET "http://localhost:8090/api/collections/unified_cards/records" \
  -H "Authorization: Bearer your_token_here"

# 인증이 필요한 요청
curl -X POST "http://localhost:8090/api/collections/unified_cards/records" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Card", "context": "test"}'
```

### Postman 컬렉션
- 환경 변수 설정: `{{base_url}} = http://localhost:8090/api`
- 인증: Bearer Token 사용
- 공통 헤더: `Content-Type: application/json`

## 📚 추가 리소스

- [PocketBase 공식 API 문서](https://pocketbase.io/docs/api-records/)
- [PocketBase JavaScript SDK](https://pocketbase.io/docs/js-sdk/)
- [SvelteKit API 라우트](https://kit.svelte.dev/docs/routing#server)

---

이 API 레퍼런스를 통해 모든 엔드포인트를 효과적으로 사용할 수 있습니다. 추가 질문이나 특정 API에 대한 상세한 설명이 필요한 경우 언제든지 문의해주세요.
