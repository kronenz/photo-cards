# Claude 개발 가이드

## 🎯 Claude를 위한 프로젝트 이해 가이드

이 문서는 Claude가 홀로그래픽 카드 커뮤니티 프로젝트를 효과적으로 이해하고 개발할 수 있도록 작성된 가이드입니다.

## 📋 프로젝트 개요

### 프로젝트명
**홀로그래픽 카드 커뮤니티** (Holographic Card Community)

### 핵심 기능
1. **홀로그래픽 카드 제작**: CSS 기반 홀로그래픽 효과
2. **포토카드 시스템**: 선수 카드 수집
3. **커뮤니티 플랫폼**: 사용자 간 카드 공유 및 소통
4. **템플릿 마켓플레이스**: 카드 템플릿 거래

### 기술 스택
- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: PocketBase (Go 기반)
- **Storage**: MinIO (S3 호환)
- **Cache**: Redis
- **Container**: Docker + Docker Compose

## 🏗️ 아키텍처 이해

### 전체 구조
```
Frontend (SvelteKit) ←→ Backend (PocketBase) ←→ Storage (MinIO)
                              ↓
                         Cache (Redis)
```

### 개발 환경
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8090/api/
- **PocketBase Admin**: http://localhost:8090/_/
- **MinIO Console**: http://localhost:9001/
- **Redis**: localhost:6379

## 📁 핵심 디렉토리 구조

```
photo-cards/
├── src/
│   ├── lib/
│   │   ├── components/          # Svelte 컴포넌트
│   │   │   ├── unified/         # 통합 컴포넌트
│   │   │   ├── marketplace/     # 마켓플레이스 컴포넌트
│   │   │   └── holographic/     # 홀로그래픽 효과 컴포넌트
│   │   ├── services/            # 비즈니스 로직
│   │   ├── types/               # TypeScript 타입
│   │   ├── utils/               # 유틸리티 함수
│   │   └── pocketbase.ts        # PocketBase 클라이언트
│   ├── routes/                  # SvelteKit 라우트
│   │   ├── api/                 # API 엔드포인트
│   │   ├── auth/                # 인증 페이지
│   │   ├── marketplace/         # 마켓플레이스
│   │   └── community/           # 커뮤니티
│   └── statics/                 # 정적 파일
├── pocketbase/
│   ├── pb_data/                 # PocketBase 데이터
│   ├── pb_public/               # 공개 파일
│   └── migrations/              # 데이터베이스 마이그레이션
├── docker-compose.dev.yml       # 개발 환경
├── docker-compose.yml           # 프로덕션 환경
└── BACKEND_ARCHITECTURE_GUIDE.md # 백엔드 가이드
```

## 🎨 컴포넌트 아키텍처

### 통합 컴포넌트 (src/lib/components/unified/)
- **UnifiedHolographicCard.svelte**: 통합 홀로그래픽 카드
- **ShowoffModal.svelte**: 카드 공유 모달
- **CardEditor.svelte**: 카드 편집기

### 마켓플레이스 컴포넌트 (src/lib/components/marketplace/)
- **TemplateDetailModal.svelte**: 템플릿 상세 모달
- **TemplateFilters.svelte**: 템플릿 필터
- **RatingStats.svelte**: 평점 통계
- **RecommendedTemplates.svelte**: 추천 템플릿

### 홀로그래픽 컴포넌트 (src/lib/components/holographic/)
- **HolographicEffect.svelte**: 홀로그래픽 효과
- **CardRenderer.svelte**: 카드 렌더러

## 🗄️ 데이터 모델 이해

### 핵심 엔티티

#### 1. User (사용자)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  // 통합 사용자 정보는 unified_users 컬렉션에 저장
}
```

#### 2. UnifiedCard (통합 카드)
```typescript
interface UnifiedCard {
  // 기본 정보
  title: string;
  
  // 홀로그래픽 효과 (Phase 1)
  holographic_image: string;
  holographic_effect: 'overlay' | 'soft-light' | 'hard-light';
  holographic_intensity: number;
  
  // 포토카드 (Phase 2)
  photocard_rarity: 'common' | 'rare' | 'epic' | 'legendary';
  photocard_season: string;
  
  // 커뮤니티 (Phase 4)
  community_creator: string;
  community_is_public: boolean;
  community_tags: string[];
  community_likes: number;
  community_rating: number;
  
  // 컨텍스트
  context: 'test' | 'main' | 'gallery' | 'community';
}
```

#### 3. Template (템플릿)
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  creator: string;
  rating: number;
  downloads: number;
  is_public: boolean;
}
```

## 🔧 개발 워크플로우

### 1. 로컬 개발 환경 설정
```bash
# Docker 서비스 시작
npm run docker:setup

# 개발 서버 시작
npm run dev

# 로그 확인
npm run docker:logs
```

### 2. 데이터베이스 작업
```bash
# PocketBase Admin 접속
# http://localhost:8090/_/

# 컬렉션 생성 및 관리
# 마이그레이션 실행
```

### 3. 컴포넌트 개발
```bash
# 새 컴포넌트 생성
# src/lib/components/ 디렉토리에 추가

# 타입 정의
# src/lib/types/ 디렉토리에 추가

# 서비스 로직
# src/lib/services/ 디렉토리에 추가
```

## 🎯 주요 기능별 개발 가이드

### 1. 홀로그래픽 효과 개발
- **위치**: `src/lib/components/holographic/`
- **핵심 파일**: `HolographicEffect.svelte`
- **CSS 파일**: `holographic-effects.css`, `enhanced-holographic-effects.css`

### 2. 카드 시스템 개발
- **위치**: `src/lib/components/unified/`
- **핵심 파일**: `UnifiedHolographicCard.svelte`
- **데이터**: `unified_cards` 컬렉션

### 3. 마켓플레이스 개발
- **위치**: `src/lib/components/marketplace/`
- **라우트**: `src/routes/marketplace/`
- **API**: `src/routes/api/templates/`

### 4. 커뮤니티 기능 개발
- **위치**: `src/routes/community/`
- **컴포넌트**: `src/lib/components/community/`
- **데이터**: `community_posts` 컬렉션

## 🔍 코드 패턴 이해

### 1. PocketBase 사용 패턴
```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';
import { config } from './config.js';

export const pb = new PocketBase(config.pocketbaseUrl);

// 사용 예시
const cards = await pb.collection('unified_cards').getFullList();
```

### 2. Svelte 컴포넌트 패턴
```svelte
<script lang="ts">
  import { pb } from '$lib/pocketbase';
  import type { UnifiedCard } from '$lib/types/card';
  
  let cards: UnifiedCard[] = [];
  
  async function loadCards() {
    cards = await pb.collection('unified_cards').getFullList();
  }
</script>

<div class="card-grid">
  {#each cards as card}
    <div class="card">{card.title}</div>
  {/each}
</div>
```

### 3. API 라우트 패턴
```typescript
// src/routes/api/templates/+server.ts
import { json } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';

export async function GET() {
  const templates = await pb.collection('templates').getFullList();
  return json(templates);
}
```

## 🚀 성능 최적화 가이드

### 1. 이미지 최적화
- **WebP 변환**: 자동 변환
- **지연 로딩**: Intersection Observer 사용
- **캐싱**: Redis + 브라우저 캐싱

### 2. 데이터 로딩 최적화
- **페이지네이션**: 대용량 데이터 처리
- **인덱싱**: 자주 조회되는 필드
- **캐싱**: Redis 캐시 활용

### 3. 컴포넌트 최적화
- **Svelte 반응성**: 효율적인 상태 관리
- **가상화**: 대용량 리스트 처리
- **메모이제이션**: 계산 비용이 높은 작업

## 🧪 테스트 전략

### 1. 단위 테스트
- **위치**: `tests/unit/`
- **도구**: Vitest
- **범위**: 유틸리티 함수, 서비스 로직

### 2. 통합 테스트
- **위치**: `tests/integration/`
- **도구**: Vitest
- **범위**: API 엔드포인트, 데이터베이스 연동

### 3. E2E 테스트
- **위치**: `tests/e2e/`
- **도구**: Playwright
- **범위**: 사용자 시나리오

## 🔧 디버깅 가이드

### 1. 개발자 도구
- **브라우저**: Chrome DevTools
- **네트워크**: Network 탭에서 API 호출 확인
- **콘솔**: JavaScript 오류 확인

### 2. 백엔드 디버깅
- **PocketBase 로그**: Admin UI에서 확인
- **Docker 로그**: `docker-compose logs -f`
- **Redis 모니터링**: `redis-cli monitor`

### 3. 일반적인 문제
- **CORS 오류**: PocketBase 설정 확인
- **인증 실패**: 토큰 만료 확인
- **파일 업로드 실패**: MinIO 버킷 확인

## 📚 참고 자료

### 프로젝트 문서
- `BACKEND_ARCHITECTURE_GUIDE.md`: 백엔드 아키텍처
- `DOCKER_README.md`: Docker 사용법
- `MINIO_ERASURE_SET_GUIDE.md`: MinIO 설정

### 외부 문서
- [SvelteKit 공식 문서](https://kit.svelte.dev/)
- [PocketBase 공식 문서](https://pocketbase.io/docs/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

## 🎯 Claude 작업 가이드

### 1. 코드 수정 시 주의사항
- **타입 안전성**: TypeScript 타입 정의 확인
- **반응성**: Svelte 반응성 시스템 이해
- **성능**: 불필요한 리렌더링 방지
- **접근성**: 웹 접근성 가이드라인 준수

### 2. 새 기능 개발 시
- **컴포넌트 분리**: 재사용 가능한 컴포넌트로 분리
- **타입 정의**: TypeScript 인터페이스 정의
- **에러 처리**: 적절한 에러 핸들링
- **테스트 작성**: 단위 테스트 포함

### 3. 버그 수정 시
- **재현**: 문제 상황 재현
- **원인 분석**: 로그 및 디버깅 도구 활용
- **테스트**: 수정 후 테스트 실행
- **문서화**: 변경 사항 문서화

---

이 가이드를 통해 Claude가 프로젝트를 효과적으로 이해하고 개발할 수 있습니다. 추가 질문이나 특정 기능에 대한 상세한 설명이 필요한 경우 언제든지 문의해주세요.
