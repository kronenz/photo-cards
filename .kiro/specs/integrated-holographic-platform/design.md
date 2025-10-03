# 통합 홀로그래픽 카드 플랫폼 Design Document

## Overview

3개의 개별 스펙을 충돌 없이 통합한 종합적인 홀로그래픽 카드 플랫폼을 설계합니다. Enhanced Card Interaction의 검증된 홀로그래픽 시스템을 기반으로, Photocard Main Renewal의 메인 화면 UX와 Holographic Card Community의 고급 커뮤니티 기능을 단계적으로 통합합니다.

## 통합 아키텍처

### 기술 스택 통합
- **Frontend**: SvelteKit 4.2.12 + TypeScript (공통)
- **Styling**: Tailwind CSS 3.3.6 + Apple Design System (공통)
- **Backend**: PocketBase (실시간 데이터베이스) (공통)
- **Authentication**: @auth/sveltekit (공통)
- **Effects**: Enhanced Card Interaction 기반 홀로그래픽 시스템 확장
- **Build**: Vite 5.3.5 (공통)

### 컴포넌트 계층 구조

```
통합 플랫폼
├── Core Systems (Phase 1)
│   ├── EnhancedCard (기존 완성)
│   ├── HolographicEngine (기존 완성)
│   └── TouchInteraction (추가 필요)
├── Main Page (Phase 2)
│   ├── MainPageLayout
│   ├── CollectionDashboard (기존 완성)
│   ├── CommunityFeed
│   └── KBOTeamsSection
└── Advanced Community (Phase 3)
    ├── TemplateMarket
    ├── CreatorDashboard
    ├── TradingSystem
    └── AdvancedAnalytics
```

## 통합 전략

### Phase 1: 핵심 카드 시스템 완성
**목표**: Enhanced Card Interaction 완료
- 기존 완성된 홀로그래픽 효과 유지
- 터치 이벤트 통합 처리 추가
- 통합 테스트 완료

### Phase 2: 메인 화면 리뉴얼
**목표**: Photocard Main Renewal 구현
- Phase 1의 EnhancedCard 컴포넌트 활용
- 기존 CollectionDashboard 통합
- Civitai 스타일 커뮤니티 피드 구현
- KBO 팀 섹션 추가

### Phase 3: 커뮤니티 고도화
**목표**: Holographic Card Community 고급 기능
- 기존 구현된 기능들 통합
- 템플릿 마켓 및 거래 시스템
- AI 기반 추천 시스템
- 수익화 기능

## Components and Interfaces

### 1. 통합 홀로그래픽 카드 컴포넌트

#### UnifiedHolographicCard.svelte
```typescript
interface UnifiedHolographicCardProps {
  card: Card;
  size: 'small' | 'medium' | 'large' | 'featured';
  context: 'test' | 'main' | 'gallery' | 'community';
  interactive: boolean;
  showStats?: boolean;
  showFlip?: boolean;
  customTheme?: KBOTeamTheme;
  onFlip?: () => void;
  onHover?: (isHovering: boolean) => void;
  onInteraction?: (action: InteractionType) => void;
}
```

### 2. 통합 메인 페이지 레이아웃

#### IntegratedMainPage.svelte
```typescript
interface IntegratedMainPageProps {
  user?: User;
  collections: Collection[];
  featuredCards: Card[];
  communityFeed: CommunityPost[];
  kboTeams: KBOTeam[];
  userStats: UserStats;
  creatorStats?: CreatorStats;
}
```

### 3. 통합 커뮤니티 피드

#### UnifiedCommunityFeed.svelte
```typescript
interface UnifiedCommunityFeedProps {
  posts: CommunityPost[];
  layout: 'masonry' | 'grid' | 'list';
  filters: FeedFilter;
  showTemplateMarket?: boolean;
  showCreatorTools?: boolean;
  onFilterChange: (filter: FeedFilter) => void;
  onCardInteraction: (action: InteractionType, cardId: string) => void;
}
```

## Data Models 통합

### 통합 카드 모델
```typescript
interface UnifiedCard {
  // Enhanced Card Interaction 필드
  id: string;
  title: string;
  image: string;
  backImage?: string;
  holographicEffect: HolographicEffect;
  
  // Photocard Main Renewal 필드
  rarity: CardRarity;
  stats: CardStats;
  collections: string[];
  
  // Holographic Card Community 필드
  creator: string;
  template?: string;
  isPublic: boolean;
  tags: string[];
  metadata: CardMetadata;
  
  // 공통 필드
  createdAt: Date;
  updatedAt: Date;
}
```

### 통합 사용자 모델
```typescript
interface UnifiedUser {
  // 기본 정보
  id: string;
  username: string;
  email: string;
  avatar?: string;
  
  // KBO 팬 시스템
  fanLevel: FanLevel;
  favoriteTeam?: string;
  
  // 크리에이터 시스템
  creatorLevel?: CreatorLevel;
  creatorStats?: CreatorStats;
  
  // 컬렉션 시스템
  collections: Collection[];
  stats: UserStats;
  
  // 설정
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

## 충돌 해결 방안

### 1. 홀로그래픽 시스템 통합
- **기준**: Enhanced Card Interaction의 검증된 시스템 사용
- **확장**: Holographic Card Community의 60fps 최적화 적용
- **적용**: 모든 컴포넌트에서 동일한 홀로그래픽 엔진 사용

### 2. 갤러리/피드 시스템 통합
- **메인 화면**: Civitai 스타일 마소네리 그리드 (Photocard Main Renewal)
- **개인 갤러리**: Apple Photos 스타일 그리드 (Holographic Card Community)
- **구분**: context prop으로 레이아웃 결정

### 3. 사용자 시스템 통합
- **기본**: KBO 팬 등급 시스템 (모든 사용자)
- **확장**: 크리에이터 등급 시스템 (크리에이터만)
- **통합**: 단일 사용자 모델에서 두 시스템 모두 지원

### 4. 네비게이션 통합
- **메인 화면**: 포토카드 중심 레이아웃
- **테스트 페이지**: 기존 /test 경로 유지
- **커뮤니티**: 메인 화면 내 섹션으로 통합

## Error Handling 통합

### 통합 에러 처리 전략
```typescript
interface UnifiedErrorState {
  type: 'network' | 'validation' | 'auth' | 'server' | 'holographic' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
  context: 'card' | 'community' | 'collection' | 'user';
  timestamp: Date;
}

class UnifiedErrorHandler {
  static handleCardError(error: Error, context: string): UnifiedErrorState;
  static handleCommunityError(error: Error, context: string): UnifiedErrorState;
  static handleCollectionError(error: Error, context: string): UnifiedErrorState;
}
```

## Testing Strategy 통합

### 1. 단위 테스트
- Enhanced Card Interaction: 기존 테스트 유지
- 새로운 컴포넌트: 동일한 패턴으로 테스트 추가

### 2. 통합 테스트
- 컴포넌트 간 상호작용 테스트
- 데이터 흐름 검증
- 상태 관리 테스트

### 3. E2E 테스트
- 전체 사용자 여정 테스트
- 크로스 브라우저 호환성
- 성능 및 접근성 검증

이 통합 설계는 기존 완성된 기능들을 최대한 활용하면서, 충돌 없이 새로운 기능들을 단계적으로 추가할 수 있도록 구성되었습니다.