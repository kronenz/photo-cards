# 데이터 모델 스펙

## 📋 개요

홀로그래픽 카드 커뮤니티 프로젝트의 데이터 모델에 대한 상세한 스펙 문서입니다.

## 🎯 설계 원칙

### 1. 정규화
- 데이터 중복 최소화
- 일관성 보장
- 저장 공간 효율성

### 2. 확장성
- 새로운 기능 추가 용이
- 성능 최적화 고려
- 마이그레이션 지원

### 3. 유연성
- 다양한 카드 타입 지원
- 커스터마이징 가능
- API 호환성 유지

## 🗄️ 핵심 엔티티

### 1. users (사용자)
```typescript
interface User {
  id: string;                    // 고유 식별자
  email: string;                 // 이메일 (고유)
  name: string;                  // 사용자 이름
  avatar: string;                // 프로필 이미지 URL
  emailVisibility: boolean;      // 이메일 공개 여부
  verified: boolean;             // 이메일 인증 여부
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `email` (고유)
- `created` (정렬용)

### 2. unified_cards (통합 카드)
```typescript
interface UnifiedCard {
  // 기본 정보
  id: string;                    // 고유 식별자
  title: string;                 // 카드 제목
  description?: string;          // 카드 설명
  
  // 홀로그래픽 효과 (Phase 1)
  holographic_image: string;     // 홀로그래픽 이미지 URL
  holographic_back_image?: string; // 뒷면 홀로그래픽 이미지
  holographic_effect: 'overlay' | 'soft-light' | 'hard-light'; // 효과 타입
  holographic_intensity: number; // 홀로그래픽 강도 (0-100)
  holographic_animation_duration: number; // 애니메이션 지속시간 (100-2000ms)
  
  // 포토카드 (Phase 2)
  photocard_rarity: 'common' | 'rare' | 'epic' | 'legendary'; // 희귀도
  photocard_season: string;      // 시즌
  photocard_total_views: number; // 총 조회수
  photocard_unique_collectors: number; // 고유 수집자 수
  photocard_completion_rate: number; // 완성도 (0-100)
  photocard_collections: any[];  // 수집 정보 (JSON)
  
  // 커뮤니티 (Phase 4)
  community_creator: string;     // 생성자 ID (users 테이블 참조)
  community_is_public: boolean;  // 공개 여부
  community_tags: string[];      // 태그 목록 (JSON)
  community_likes: number;       // 좋아요 수
  community_downloads: number;   // 다운로드 수
  community_rating: number;      // 평점 (0-5)
  community_rating_count: number; // 평점 평가자 수
  
  // 컨텍스트
  context: 'test' | 'main' | 'gallery' | 'community'; // 사용 컨텍스트
  
  // 마이그레이션 메타데이터
  migrated_from?: 'phase1' | 'phase2' | 'phase4' | 'unified'; // 마이그레이션 출처
  legacy_id?: string;            // 레거시 ID
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `community_creator` (관계 조회용)
- `community_is_public` (공개 카드 필터링)
- `context` (컨텍스트별 조회)
- `community_likes` (인기순 정렬)
- `community_rating` (평점순 정렬)
- `created` (최신순 정렬)
- `community_tags` (태그 검색용)

### 3. unified_users (통합 사용자)
```typescript
interface UnifiedUser {
  id: string;                    // 고유 식별자
  user_id: string;               // users 테이블 참조
  
  // 기본 정보
  display_name: string;          // 표시 이름
  avatar_url?: string;           // 아바타 URL
  bio?: string;                  // 자기소개
  
  // 테마 설정
  theme: 'light' | 'dark' | 'auto' | 'kbo-team'; // 테마
  team_theme_color?: string;     // 팀 테마 색상
  
  // 팬 프로필
  fan_favorite_team?: string;    // 선호 팀
  fan_level: number;             // 팬 레벨 (1-5)
  fan_points: number;            // 팬 포인트
  fan_joined_date?: string;      // 팬 가입일
  
  // 크리에이터 프로필
  creator_bio?: string;          // 크리에이터 소개
  creator_followers: number;     // 팔로워 수
  creator_following: number;     // 팔로잉 수
  creator_total_likes: number;   // 총 받은 좋아요
  creator_total_downloads: number; // 총 다운로드
  
  // 통계
  stats_cards_created: number;   // 생성한 카드 수
  stats_cards_collected: number; // 수집한 카드 수
  stats_collections: number;     // 컬렉션 수
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `user_id` (고유, users 테이블 참조)
- `fan_favorite_team` (팀별 조회)
- `fan_level` (레벨별 조회)
- `creator_followers` (인기순 정렬)

### 4. collections (컬렉션)
```typescript
interface Collection {
  id: string;                    // 고유 식별자
  name: string;                  // 컬렉션 이름
  description?: string;          // 컬렉션 설명
  owner: string;                 // 소유자 ID (unified_users 테이블 참조)
  cards: string[];               // 카드 ID 목록 (JSON)
  is_public: boolean;            // 공개 여부
  total_cards: number;           // 총 카드 수
  completion_rate: number;       // 완성도 (0-100)
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `owner` (소유자별 조회)
- `is_public` (공개 컬렉션 필터링)
- `total_cards` (카드 수순 정렬)
- `completion_rate` (완성도순 정렬)

### 5. templates (템플릿)
```typescript
interface Template {
  id: string;                    // 고유 식별자
  name: string;                  // 템플릿 이름
  description?: string;          // 템플릿 설명
  category: string;              // 카테고리
  price: number;                 // 가격
  creator: string;               // 생성자 ID (unified_users 테이블 참조)
  rating: number;                // 평점 (0-5)
  rating_count: number;          // 평점 평가자 수
  downloads: number;             // 다운로드 수
  is_public: boolean;            // 공개 여부
  template_data: any;            // 템플릿 데이터 (JSON)
  preview_image: string;         // 미리보기 이미지 URL
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `creator` (생성자별 조회)
- `category` (카테고리별 조회)
- `price` (가격순 정렬)
- `rating` (평점순 정렬)
- `downloads` (다운로드순 정렬)
- `is_public` (공개 템플릿 필터링)

### 6. community_posts (커뮤니티 게시물)
```typescript
interface CommunityPost {
  id: string;                    // 고유 식별자
  card: string;                  // 카드 ID (unified_cards 테이블 참조)
  author: string;                // 작성자 ID (unified_users 테이블 참조)
  caption?: string;              // 게시물 설명
  visibility: 'public' | 'fanclub' | 'followers'; // 공개 범위
  likes: number;                 // 좋아요 수
  comments_count: number;        // 댓글 수
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `card` (카드별 조회)
- `author` (작성자별 조회)
- `visibility` (공개 범위별 조회)
- `likes` (인기순 정렬)
- `created` (최신순 정렬)

### 7. kbo_teams (팀)
```typescript
interface KboTeam {
  id: string;                    // 고유 식별자
  name: string;                  // 팀 이름 (한글)
  name_en: string;               // 팀 이름 (영문)
  primary_color: string;         // 주 색상 (HEX)
  secondary_color: string;       // 보조 색상 (HEX)
  logo_url?: string;             // 로고 URL
  mascot?: string;               // 마스코트 이름
  stadium?: string;              // 홈구장
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `name` (팀명 검색용)
- `name_en` (영문명 검색용)

### 8. fan_levels (팬 레벨)
```typescript
interface FanLevel {
  id: string;                    // 고유 식별자
  level: number;                 // 레벨 (1-5)
  name: string;                  // 레벨 이름
  required_points: number;       // 필요 포인트
  perks: string[];               // 혜택 목록 (JSON)
  
  // 시스템 필드
  created: string;               // 생성일시
  updated: string;               // 수정일시
}
```

**인덱스:**
- `level` (고유, 레벨별 조회)

## 🔗 관계형 모델

### 1. 사용자 관계
```
users (1) ←→ (1) unified_users
users (1) ←→ (N) unified_cards (community_creator)
users (1) ←→ (N) templates (creator)
users (1) ←→ (N) collections (owner)
users (1) ←→ (N) community_posts (author)
```

### 2. 카드 관계
```
unified_cards (1) ←→ (N) community_posts (card)
unified_cards (N) ←→ (N) collections (cards)
```

### 3. 템플릿 관계
```
templates (1) ←→ (N) reviews (template)
templates (1) ←→ (N) downloads (template)
```

## 📊 데이터 타입 정의

### 1. 열거형 (Enum)
```typescript
// 홀로그래픽 효과 타입
type HolographicEffect = 'overlay' | 'soft-light' | 'hard-light';

// 포토카드 희귀도
type PhotocardRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 사용 컨텍스트
type CardContext = 'test' | 'main' | 'gallery' | 'community';

// 테마 타입
type Theme = 'light' | 'dark' | 'auto' | 'kbo-team';

// 공개 범위
type Visibility = 'public' | 'fanclub' | 'followers';
```

### 2. JSON 스키마
```typescript
// 포토카드 수집 정보
interface PhotocardCollection {
  collector_id: string;
  collected_at: string;
  condition: 'mint' | 'near_mint' | 'good' | 'fair';
  notes?: string;
}

// 템플릿 데이터
interface TemplateData {
  version: string;
  components: {
    background: {
      type: 'image' | 'gradient' | 'solid';
      value: string;
    };
    holographic: {
      enabled: boolean;
      intensity: number;
      effect: HolographicEffect;
    };
    text: {
      content: string;
      font: string;
      size: number;
      color: string;
    };
  };
  metadata: {
    author: string;
    created: string;
    tags: string[];
  };
}
```

## 🔍 검색 및 필터링

### 1. 텍스트 검색
```sql
-- 카드 제목 검색
SELECT * FROM unified_cards 
WHERE title ILIKE '%검색어%';

-- 태그 검색
SELECT * FROM unified_cards 
WHERE community_tags @> '["태그"]';
```

### 2. 범위 검색
```sql
-- 평점 범위 검색
SELECT * FROM templates 
WHERE rating >= 4.0 AND rating <= 5.0;

-- 가격 범위 검색
SELECT * FROM templates 
WHERE price >= 0 AND price <= 100;
```

### 3. 정렬
```sql
-- 인기순 정렬
SELECT * FROM unified_cards 
ORDER BY community_likes DESC;

-- 최신순 정렬
SELECT * FROM unified_cards 
ORDER BY created DESC;
```

## 📈 성능 최적화

### 1. 인덱스 전략
- **단일 컬럼 인덱스**: 자주 조회되는 컬럼
- **복합 인덱스**: 여러 조건으로 조회하는 경우
- **부분 인덱스**: 특정 조건의 데이터만 인덱싱

### 2. 쿼리 최적화
- **EXPLAIN ANALYZE**: 쿼리 실행 계획 분석
- **N+1 문제 해결**: JOIN 또는 배치 조회
- **페이지네이션**: LIMIT/OFFSET 사용

### 3. 캐싱 전략
- **Redis 캐싱**: 자주 조회되는 데이터
- **CDN**: 정적 자원 캐싱
- **애플리케이션 캐싱**: 메모리 내 캐싱

## 🔄 마이그레이션 전략

### 1. 스키마 변경
```sql
-- 컬럼 추가
ALTER TABLE unified_cards 
ADD COLUMN new_field VARCHAR(255);

-- 컬럼 수정
ALTER TABLE unified_cards 
ALTER COLUMN existing_field TYPE INTEGER;

-- 인덱스 추가
CREATE INDEX idx_new_field ON unified_cards(new_field);
```

### 2. 데이터 마이그레이션
```sql
-- 데이터 변환
UPDATE unified_cards 
SET new_field = CONCAT('prefix_', old_field);

-- 데이터 검증
SELECT COUNT(*) FROM unified_cards 
WHERE new_field IS NULL;
```

### 3. 롤백 계획
- **백업 생성**: 마이그레이션 전 데이터 백업
- **단계별 실행**: 작은 단위로 나누어 실행
- **모니터링**: 마이그레이션 후 성능 모니터링

## 📚 참고 자료

- [PocketBase 공식 문서](https://pocketbase.io/docs/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Redis 공식 문서](https://redis.io/docs/)

---

이 데이터 모델 스펙을 통해 일관성 있고 확장 가능한 데이터베이스를 구축할 수 있습니다. 추가 질문이나 특정 엔티티에 대한 상세한 설명이 필요한 경우 언제든지 문의해주세요.
