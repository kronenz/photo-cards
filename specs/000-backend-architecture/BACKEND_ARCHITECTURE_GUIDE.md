# 백엔드 아키텍처 가이드

## 📋 개요

이 문서는 홀로그래픽 카드 커뮤니티 프로젝트의 백엔드 아키텍처와 구성 요소에 대한 상세한 가이드입니다. Claude가 프로젝트를 이해하고 효율적으로 작업할 수 있도록 작성되었습니다.

## 🏗️ 전체 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Storage       │
│   (SvelteKit)   │◄──►│   (PocketBase)  │◄──►│   (MinIO)       │
│   Port: 5173    │    │   Port: 8090    │    │   Port: 9000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Cache         │
                       │   (Redis)       │
                       │   Port: 6379    │
                       └─────────────────┘
```

## 🐳 Docker 구성

### 개발 환경 (docker-compose.dev.yml)
- **PocketBase**: Alpine Linux 기반, v0.30.1
- **MinIO**: 단일 디스크 모드 (개발용)
- **Redis**: 세션 및 캐싱

### 프로덕션 환경 (docker-compose.yml)
- **PocketBase**: Alpine Linux 기반, v0.30.1
- **MinIO**: 4디스크 erasure set (데이터 보호)
- **Redis**: 세션 및 캐싱

### 클러스터 환경 (docker-compose.minio-cluster.yml)
- **MinIO**: 4노드 클러스터 (고가용성)
- **Nginx**: 로드 밸런서

## 🗄️ 데이터베이스 스키마 (PocketBase)

### 핵심 컬렉션

#### 1. users (기본 인증)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created: string;
  updated: string;
}
```

#### 2. unified_cards (통합 카드)
```typescript
interface UnifiedCard {
  // 기본 정보
  title: string;
  
  // 홀로그래픽 효과 (Phase 1)
  holographic_image: string;
  holographic_back_image?: string;
  holographic_effect: 'overlay' | 'soft-light' | 'hard-light';
  holographic_intensity: number; // 0-100
  holographic_animation_duration: number; // 100-2000ms
  
  // 포토카드 (Phase 2)
  photocard_rarity: 'common' | 'rare' | 'epic' | 'legendary';
  photocard_season: string;
  photocard_total_views: number;
  photocard_unique_collectors: number;
  photocard_completion_rate: number; // 0-100
  photocard_collections: any[]; // JSON
  
  // 커뮤니티 (Phase 4)
  community_creator: string; // relation to unified_users
  community_is_public: boolean;
  community_tags: string[]; // JSON
  community_likes: number;
  community_downloads: number;
  community_rating: number; // 0-5
  community_rating_count: number;
  
  // 컨텍스트
  context: 'test' | 'main' | 'gallery' | 'community';
  
  // 마이그레이션 메타데이터
  migrated_from?: 'phase1' | 'phase2' | 'phase4' | 'unified';
  legacy_id?: string;
}
```

#### 3. unified_users (통합 사용자)
```typescript
interface UnifiedUser {
  // 기본 정보
  display_name: string;
  avatar_url?: string;
  
  // 테마 설정
  theme: 'light' | 'dark' | 'auto' | 'kbo-team';
  team_theme_color?: string;
  
  // 팬 프로필
  fan_favorite_team?: string;
  fan_level: number; // 1-5
  fan_points: number;
  fan_joined_date?: string;
  
  // 크리에이터 프로필
  creator_bio?: string;
  creator_followers: number;
  creator_following: number;
  creator_total_likes: number;
  creator_total_downloads: number;
  
  // 통계
  stats_cards_created: number;
  stats_cards_collected: number;
  stats_collections: number;
}
```

#### 4. collections (컬렉션)
```typescript
interface Collection {
  name: string;
  description?: string;
  owner: string; // relation to unified_users
  cards: any[]; // JSON
  is_public: boolean;
  total_cards: number;
  completion_rate: number; // 0-100
}
```

#### 5. community_posts (커뮤니티 게시물)
```typescript
interface CommunityPost {
  card: string; // relation to unified_cards
  author: string; // relation to unified_users
  caption?: string;
  visibility: 'public' | 'fanclub' | 'followers';
  likes: number;
  comments_count: number;
}
```

#### 6. kbo_teams (팀)
```typescript
interface KboTeam {
  name: string;
  name_en: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  mascot?: string;
  stadium?: string;
}
```

#### 7. fan_levels (팬 레벨)
```typescript
interface FanLevel {
  level: number; // 1-5
  name: string;
  required_points: number;
  perks: string[]; // JSON
}
```

## 🔧 API 엔드포인트

### PocketBase API (http://localhost:8090/api/)

#### 인증
- `POST /api/collections/users/auth-with-password` - 로그인
- `POST /api/collections/users/auth-refresh` - 토큰 갱신
- `POST /api/collections/users/request-password-reset` - 비밀번호 재설정
- `POST /api/collections/users/confirm-password-reset` - 비밀번호 재설정 확인

#### 컬렉션 CRUD
- `GET /api/collections/{collection}/records` - 레코드 목록
- `GET /api/collections/{collection}/records/{id}` - 레코드 조회
- `POST /api/collections/{collection}/records` - 레코드 생성
- `PATCH /api/collections/{collection}/records/{id}` - 레코드 수정
- `DELETE /api/collections/{collection}/records/{id}` - 레코드 삭제

#### 파일 업로드
- `POST /api/files/{collection}/{recordId}/{field}` - 파일 업로드

### 커스텀 API 엔드포인트

#### 템플릿 관련
- `GET /api/templates/search` - 템플릿 검색
- `GET /api/templates/trending` - 인기 템플릿
- `GET /api/templates/recommended` - 추천 템플릿
- `GET /api/templates/{id}/rating` - 템플릿 평점
- `GET /api/templates/{id}/reviews` - 템플릿 리뷰

#### 리뷰 관련
- `POST /api/reviews` - 리뷰 생성
- `GET /api/reviews` - 리뷰 목록

## 📁 파일 구조

```
src/
├── lib/
│   ├── pocketbase.ts          # PocketBase 클라이언트 설정
│   ├── config.ts              # 앱 설정
│   ├── services/              # 비즈니스 로직
│   │   ├── auth.ts
│   │   ├── cards.ts
│   │   ├── collections.ts
│   │   ├── templates.ts
│   │   └── reviews.ts
│   ├── types/                 # TypeScript 타입 정의
│   │   ├── user.ts
│   │   ├── card.ts
│   │   ├── collection.ts
│   │   └── template.ts
│   └── utils/                 # 유틸리티 함수
│       ├── migration.ts
│       └── debounce.ts
├── routes/
│   ├── api/                   # API 라우트
│   │   ├── templates/
│   │   ├── reviews/
│   │   └── auth/
│   └── auth/                  # 인증 페이지
└── pocketbase/
    ├── pb_data/              # PocketBase 데이터
    ├── pb_public/            # 공개 파일
    └── migrations/           # 데이터베이스 마이그레이션
        └── 002_unified_platform.js
```

## 🔐 인증 및 권한

### 사용자 인증
- **PocketBase 기본 인증**: 이메일/비밀번호
- **OAuth 지원**: Google, GitHub (설정 가능)
- **JWT 토큰**: 자동 갱신

### 권한 시스템
- **공개 접근**: 모든 사용자
- **인증 필요**: 로그인한 사용자
- **소유자만**: 레코드 소유자
- **관리자**: 슈퍼유저

### 보안 설정
- **CORS**: 개발 환경에서 모든 오리진 허용
- **Rate Limiting**: API 호출 제한
- **파일 업로드**: MIME 타입 검증

## 💾 파일 저장소 (MinIO)

### 버킷 구조
```
holographic-cards/
├── cards/                     # 카드 이미지
│   ├── holographic/          # 홀로그래픽 이미지
│   ├── photocard/            # 포토카드 이미지
│   └── community/            # 커뮤니티 이미지
├── avatars/                  # 사용자 아바타
├── templates/                # 템플릿 파일
└── uploads/                  # 임시 업로드
```

### 파일 정책
- **이미지**: JPEG, PNG, WebP, SVG
- **최대 크기**: 10MB
- **CDN**: CloudFront 연동 가능

## 🚀 캐싱 전략 (Redis)

### 캐시 키 패턴
```
user:{id}                     # 사용자 정보
card:{id}                     # 카드 정보
templates:trending            # 인기 템플릿
templates:recommended:{id}    # 추천 템플릿
collections:{id}              # 컬렉션 정보
```

### 캐시 TTL
- **사용자 정보**: 1시간
- **카드 정보**: 30분
- **템플릿 목록**: 15분
- **통계 데이터**: 5분

## 🔄 마이그레이션 전략

### Phase 1 → Phase 2 → Phase 4 → Unified
1. **데이터 백업**: 기존 데이터 보존
2. **스키마 변환**: 통합 스키마로 변환
3. **데이터 검증**: 무결성 확인
4. **점진적 전환**: 단계별 마이그레이션

### 롤백 계획
- **데이터 보존**: 레거시 컬렉션 유지
- **버전 관리**: 마이그레이션 히스토리
- **자동 롤백**: 오류 시 자동 복구

## 📊 모니터링 및 로깅

### 로그 레벨
- **ERROR**: 시스템 오류
- **WARN**: 경고 메시지
- **INFO**: 일반 정보
- **DEBUG**: 디버깅 정보

### 메트릭
- **API 응답 시간**: 평균, 95th percentile
- **에러율**: 4xx, 5xx 응답 비율
- **사용자 활동**: DAU, MAU
- **파일 업로드**: 용량, 빈도

## 🛠️ 개발 도구

### 로컬 개발
```bash
# 개발 환경 시작
npm run docker:setup

# 로그 확인
npm run docker:logs

# 서비스 중지
npm run docker:stop
```

### 프로덕션 배포
```bash
# 프로덕션 환경 시작
npm run docker:setup:prod

# 클러스터 환경 시작
npm run docker:minio:cluster
```

### 데이터베이스 관리
- **PocketBase Admin**: http://localhost:8090/_/
- **MinIO Console**: http://localhost:9001/
- **Redis CLI**: `docker exec -it photo-cards-redis-dev redis-cli`

## 🔧 환경 변수

### 필수 설정
```env
POCKETBASE_ENCRYPTION_KEY=your-32-char-encryption-key-here
POCKETBASE_URL=http://localhost:8090
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
REDIS_PASSWORD=redis123
```

### 선택적 설정
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
```

## 📈 성능 최적화

### 데이터베이스
- **인덱스**: 자주 조회되는 필드에 인덱스 생성
- **쿼리 최적화**: N+1 문제 방지
- **연결 풀**: 데이터베이스 연결 재사용

### 캐싱
- **Redis**: 자주 조회되는 데이터 캐싱
- **CDN**: 정적 파일 캐싱
- **브라우저 캐싱**: 적절한 Cache-Control 헤더

### 파일 처리
- **이미지 최적화**: WebP 변환, 리사이징
- **지연 로딩**: 필요할 때만 로드
- **압축**: Gzip, Brotli 압축

## 🚨 문제 해결

### 일반적인 문제
1. **PocketBase 연결 실패**: 포트 충돌 확인
2. **MinIO 업로드 실패**: 버킷 존재 여부 확인
3. **Redis 연결 실패**: 비밀번호 확인
4. **마이그레이션 오류**: 스키마 호환성 확인

### 디버깅 도구
- **Docker 로그**: `docker-compose logs -f`
- **PocketBase 로그**: Admin UI에서 확인
- **네트워크 확인**: `curl` 명령어 사용

## 📚 참고 자료

- [PocketBase 공식 문서](https://pocketbase.io/docs/)
- [MinIO 공식 문서](https://min.io/docs/)
- [Redis 공식 문서](https://redis.io/docs/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)

---

이 가이드는 프로젝트의 백엔드 아키텍처를 이해하고 효율적으로 작업할 수 있도록 작성되었습니다. 추가 질문이나 업데이트가 필요한 경우 언제든지 문의해주세요.
