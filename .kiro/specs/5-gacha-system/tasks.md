# Gacha System - Implementation Tasks

## Sprint Overview

**Total Estimated Time**: 9 days
**Priority**: High
**Dependencies**: Phase 1 (Enhanced Card), UnifiedCard

---

## Sprint 1: Core Foundation (3 days)

### Task 1.1: Setup Gacha Project Structure ⏱️ 0.5 day

_Requirements: Setup_

**Objective**: 프로젝트 구조 및 기본 파일 생성

**Subtasks**:
- [ ] 디렉토리 구조 생성
  ```
  src/
  ├── routes/gacha/
  │   └── +page.svelte
  ├── lib/gacha/
  │   ├── GachaEngine.ts
  │   ├── AnimationController.ts
  │   └── ParticleSystem.ts
  ├── lib/components/gacha/
  │   ├── GachaHeader.svelte
  │   ├── GachaStage.svelte
  │   ├── GachaCard.svelte
  │   ├── SummonCircle.svelte
  │   ├── SkipButton.svelte
  │   └── GachaPullButtons.svelte
  └── lib/stores/gachaStore.ts
  ```
- [ ] TypeScript 인터페이스 정의
- [ ] Svelte stores 초기화
- [ ] 라우팅 설정 (`/gacha`)

**Acceptance Criteria**:
- WHEN `/gacha` 접속 시 THEN 빈 페이지가 로드된다
- WHEN 콘솔 확인 시 THEN 에러가 없다

---

### Task 1.2: Implement Gacha Engine ⏱️ 1 day

_Requirements: FR-GACHA-001 (뽑기 시스템)_

**Objective**: 확률 기반 카드 생성 엔진 구현

**Subtasks**:
- [ ] `GachaEngine` 클래스 구현
  - [ ] 가중치 랜덤 알고리즘 (`rollRarity()`)
  - [ ] 단일 뽑기 (`pullSingle()`)
  - [ ] 10장 뽑기 (`pullMulti()`)
  - [ ] Epic 보장 로직
- [ ] 카드 생성 로직 (`generateCard()`)
  - [ ] 랜덤 팀 선택
  - [ ] 랜덤 선수/포지션 선택
  - [ ] 이미지 URL 생성
- [ ] Pity 시스템 기초
  - [ ] 카운터 관리
  - [ ] 100회 보장 로직
- [ ] Unit Tests 작성
  - [ ] 10,000회 시뮬레이션 (확률 검증)
  - [ ] Epic 보장 테스트
  - [ ] Pity 시스템 테스트

**Acceptance Criteria**:
- WHEN `pullSingle()` 호출 시 THEN 1장의 카드가 생성된다
- WHEN `pullMulti()` 호출 시 THEN 10장 중 최소 1장은 Epic 이상이다
- WHEN 10,000회 시뮬레이션 시 THEN 확률이 ±2% 오차 내에 있다
- WHEN 100회 연속 뽑기 시 THEN Legendary가 1장 이상 나온다

**Test Code**:
```typescript
// GachaEngine.test.ts
describe('GachaEngine', () => {
  it('should respect probability distribution', () => {
    const engine = new GachaEngine();
    const results = { common: 0, rare: 0, epic: 0, legendary: 0 };

    for (let i = 0; i < 10000; i++) {
      const card = engine.pullSingle('test', i);
      results[card.rarity]++;
    }

    expect(results.common).toBeCloseTo(6000, -2); // ±100
    expect(results.rare).toBeCloseTo(2500, -2);
    expect(results.epic).toBeCloseTo(1200, -2);
    expect(results.legendary).toBeCloseTo(300, -1);
  });

  it('should guarantee epic in multi pull', () => {
    const engine = new GachaEngine();

    for (let i = 0; i < 100; i++) {
      const cards = engine.pullMulti();
      const hasEpicOrHigher = cards.some(c =>
        c.rarity === 'epic' || c.rarity === 'legendary'
      );

      expect(hasEpicOrHigher).toBe(true);
    }
  });
});
```

---

### Task 1.3: Create Gacha Stores ⏱️ 0.5 day

_Requirements: State Management_

**Objective**: Svelte stores를 통한 상태 관리

**Subtasks**:
- [ ] `gachaState` store 구현
- [ ] `currency` store 구현
- [ ] `pullHistory` store 구현
- [ ] `pityState` store 구현
- [ ] Derived stores
  - [ ] `canAffordPull`
  - [ ] `gachaStats`
- [ ] Actions 구현
  - [ ] `gachaActions.pull()`
  - [ ] `gachaActions.skip()`
  - [ ] `gachaActions.reset()`
  - [ ] `gachaActions.claimFreeTicket()`

**Acceptance Criteria**:
- WHEN `pull(1)` 호출 시 THEN `gachaState.stage`가 'pulling'으로 변경된다
- WHEN 재화가 부족하면 THEN 에러가 발생한다
- WHEN 뽑기 후 THEN `pullHistory`에 기록된다
- WHEN 일일 티켓 수령 시 THEN 24시간 후에만 재수령 가능하다

---

### Task 1.4: Build Basic UI Layout ⏱️ 1 day

_Requirements: UI Layout_

**Objective**: 갓챠 페이지 기본 레이아웃 구성

**Subtasks**:
- [ ] `GachaPage.svelte` 메인 레이아웃
  ```svelte
  <GachaHeader />
  <GachaStage />
  <GachaPullButtons />
  ```
- [ ] `GachaHeader.svelte` 구현
  - [ ] 재화 표시 (티켓/프리미엄)
  - [ ] 확률 정보 버튼
  - [ ] 히스토리 버튼
- [ ] `GachaStage.svelte` 구현
  - [ ] 중앙 연출 영역
  - [ ] 반응형 레이아웃
- [ ] `GachaPullButtons.svelte` 구현
  - [ ] "1장 뽑기" 버튼
  - [ ] "10장 뽑기" 버튼
  - [ ] 재화 부족 시 비활성화
  - [ ] 비용 표시

**Acceptance Criteria**:
- WHEN 페이지 로드 시 THEN 헤더, 스테이지, 버튼이 표시된다
- WHEN 재화가 부족하면 THEN 버튼이 비활성화된다
- WHEN 모바일에서 THEN 레이아웃이 세로로 변경된다

**CSS Structure**:
```css
.gacha-page {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
}

.gacha-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

@media (max-width: 768px) {
  .gacha-page {
    grid-template-rows: auto 1fr 120px;
  }
}
```

---

## Sprint 2: Animation System (4 days)

### Task 2.1: Implement Summon Circle Animation ⏱️ 0.5 day

_Requirements: FR-GACHA-002-01 (Pulling Stage)_

**Objective**: 소환진 회전 애니메이션

**Subtasks**:
- [ ] `SummonCircle.svelte` 컴포넌트 생성
- [ ] SVG 소환진 디자인
  - [ ] 외부 원 (회전)
  - [ ] 중앙 마법진 패턴
  - [ ] 빛 효과
- [ ] CSS 애니메이션
  ```css
  @keyframes summonRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes summonGlow {
    0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 20px #667eea); }
    50% { opacity: 1; filter: drop-shadow(0 0 40px #764ba2); }
  }
  ```
- [ ] 활성화 상태 관리

**Acceptance Criteria**:
- WHEN 뽑기 시작 시 THEN 소환진이 1초간 회전한다
- WHEN 회전 중 THEN 빛 효과가 깜빡인다
- WHEN 완료 시 THEN 페이드아웃된다

---

### Task 2.2: Create Mystery Card Component ⏱️ 0.5 day

_Requirements: UI Component_

**Objective**: 물음표 카드 컴포넌트

**Subtasks**:
- [ ] `GachaCard.svelte` 컴포넌트 생성
- [ ] 물음표 면 디자인
  ```svelte
  <div class="card-mystery">
    <div class="mystery-icon">?</div>
    <div class="mystery-glow"></div>
  </div>
  ```
- [ ] Float 애니메이션
  ```css
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  ```
- [ ] 카드 등장 애니메이션
  ```css
  @keyframes cardAppear {
    from {
      opacity: 0;
      transform: scale(0) translateY(100px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  ```

**Acceptance Criteria**:
- WHEN 카드가 나타날 때 THEN 아래에서 위로 튀어나온다
- WHEN Idle 상태 시 THEN 위아래로 부드럽게 움직인다
- WHEN 그라데이션 배경 THEN 보라/파랑 그라데이션이 적용된다

---

### Task 2.3: Implement Card Flip Animation ⏱️ 1 day

_Requirements: FR-GACHA-002-02 (Revealing Stage)_

**Objective**: 3D 카드 회전 애니메이션

**Subtasks**:
- [ ] 3D perspective 설정
  ```css
  .gacha-card {
    perspective: 1000px;
    transform-style: preserve-3d;
  }
  ```
- [ ] Y축 180도 회전 애니메이션
  ```css
  .gacha-card.flipping {
    animation: flipCard 0.8s cubic-bezier(0.33, 1, 0.68, 1);
  }

  @keyframes flipCard {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(180deg); }
  }
  ```
- [ ] 앞면/뒷면 전환 로직
  ```svelte
  <script>
    let flipped = false;

    $: frontVisible = !flipped;
    $: backVisible = flipped;
  </script>

  <div class="card-front" style:visibility={frontVisible ? 'visible' : 'hidden'}>
    <!-- Mystery -->
  </div>
  <div class="card-back" style:visibility={backVisible ? 'visible' : 'hidden'}>
    <UnifiedCard {...card} />
  </div>
  ```
- [ ] 순차 공개 로직 (stagger)

**Acceptance Criteria**:
- WHEN 카드 공개 시 THEN Y축으로 180도 회전한다
- WHEN 회전 중 THEN 앞면이 사라지고 뒷면이 나타난다
- WHEN 10장 뽑기 시 THEN 0.1초 간격으로 순차 공개된다
- WHEN 회전 완료 시 THEN UnifiedCard가 표시된다

---

### Task 2.4: Build Animation Controller ⏱️ 1 day

_Requirements: FR-GACHA-002 (Animation System)_

**Objective**: 애니메이션 오케스트레이션

**Subtasks**:
- [ ] `AnimationController.ts` 클래스 구현
- [ ] Stage 관리
  - [ ] `playPullingStage()`
  - [ ] `playRevealingStage()`
  - [ ] `skipToEnd()`
- [ ] 타이밍 관리
  - [ ] Duration 설정
  - [ ] Stagger delay 계산
  - [ ] Promise 체인
- [ ] Callback 시스템
  ```typescript
  interface AnimationCallbacks {
    onStageChange?: (stage: GachaStage) => void;
    onRevealStart?: (card: GachaCard, index: number) => void;
    onRevealComplete?: (card: GachaCard, index: number) => void;
    onComplete?: (cards: GachaCard[]) => void;
    onError?: (error: any) => void;
  }
  ```
- [ ] Svelte에 통합
  ```svelte
  <script>
    import AnimationController from '$lib/gacha/AnimationController';

    const controller = new AnimationController();

    async function startGacha() {
      const cards = await gachaActions.pull(10);

      await controller.playFullSequence(cards, {
        onStageChange: (stage) => gachaState.update(s => ({ ...s, stage })),
        onRevealComplete: (card, i) => revealedCards[i] = card,
        onComplete: () => showResults()
      });
    }
  </script>
  ```

**Acceptance Criteria**:
- WHEN `playFullSequence()` 호출 시 THEN 전체 애니메이션이 순차 실행된다
- WHEN 각 Stage 완료 시 THEN 콜백이 호출된다
- WHEN 에러 발생 시 THEN `onError` 콜백이 호출된다

---

### Task 2.5: Implement Skip Functionality ⏱️ 0.5 day

_Requirements: FR-GACHA-002-04 (Skip)_

**Objective**: 애니메이션 스킵 기능

**Subtasks**:
- [ ] `SkipButton.svelte` 컴포넌트
  ```svelte
  {#if $gachaState.canSkip && $gachaState.stage !== 'complete'}
    <button class="skip-button" on:click={handleSkip}>
      Skip ⏩
    </button>
  {/if}
  ```
- [ ] Skip 로직 구현
  ```typescript
  function handleSkip() {
    controller.skip();
    gachaActions.skip();
  }
  ```
- [ ] 키보드 단축키
  ```svelte
  <svelte:window on:keydown={handleKeydown} />

  <script>
    function handleKeydown(e: KeyboardEvent) {
      if ((e.key === 'Escape' || e.key === ' ') && $gachaState.canSkip) {
        handleSkip();
      }
    }
  </script>
  ```
- [ ] 즉시 결과 표시

**Acceptance Criteria**:
- WHEN "Skip" 버튼 클릭 시 THEN 애니메이션이 즉시 종료된다
- WHEN ESC 키 누를 시 THEN Skip과 동일하게 동작한다
- WHEN Space 키 누를 시 THEN Skip과 동일하게 동작한다
- WHEN 결과 화면 시 THEN Skip 버튼이 숨겨진다

---

### Task 2.6: Create Particle System ⏱️ 1.5 day

_Requirements: FR-GACHA-002-03 (Particle Effects)_

**Objective**: 희귀도별 파티클 효과

**Subtasks**:
- [ ] `ParticleSystem.ts` 클래스 구현
- [ ] Canvas 초기화
  ```typescript
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }
  ```
- [ ] 파티클 생성 (`emit()`)
  - [ ] 개수 설정 (Common: 10, Rare: 20, Epic: 40, Legendary: 80)
  - [ ] 초기 속도 랜덤
  - [ ] Life/Decay 설정
- [ ] 파티클 업데이트 (`update()`)
  - [ ] 위치 갱신
  - [ ] 중력 적용
  - [ ] Life 감소
  - [ ] 죽은 파티클 제거
- [ ] 파티클 렌더링 (`render()`)
  - [ ] Circle (Common)
  - [ ] Star (Rare)
  - [ ] Diamond (Epic)
  - [ ] Burst (Legendary)
- [ ] 60fps 루프 (requestAnimationFrame)
- [ ] 이벤트 리스너 (`gacha:emitParticles`)

**Acceptance Criteria**:
- WHEN 카드 공개 시 THEN 희귀도별 파티클이 방출된다
- WHEN Common 시 THEN 10개의 흰색 원이 나타난다
- WHEN Legendary 시 THEN 80개의 금색 폭발 효과가 나타난다
- WHEN 애니메이션 종료 시 THEN 파티클이 모두 사라진다
- WHEN 성능 측정 시 THEN 60fps가 유지된다

**Performance Test**:
```typescript
// ParticleSystem.test.ts
it('should maintain 60fps with 80 particles', () => {
  const system = new ParticleSystem(canvas);
  const fps: number[] = [];

  system.emit('legendary', 80, 400, 300);

  // Measure FPS for 3 seconds
  const startTime = performance.now();
  let frameCount = 0;

  function measureFrame() {
    frameCount++;
    const elapsed = performance.now() - startTime;

    if (elapsed < 3000) {
      requestAnimationFrame(measureFrame);
    } else {
      const avgFps = (frameCount / elapsed) * 1000;
      expect(avgFps).toBeGreaterThan(58); // 60fps with margin
    }
  }

  measureFrame();
});
```

---

## Sprint 3: Polish & Integration (2 days)

### Task 3.1: Add Legendary Special Effects ⏱️ 0.5 day

_Requirements: FR-GACHA-002-03 (Legendary Effects)_

**Objective**: Legendary 카드 특수 연출

**Subtasks**:
- [ ] 화면 플래시 효과
  ```css
  @keyframes legendaryFlash {
    0%, 100% { background: transparent; }
    50% { background: rgba(251, 191, 36, 0.3); }
  }

  body.legendary-flash {
    animation: legendaryFlash 0.2s;
  }
  ```
- [ ] 카메라 줌인
  ```typescript
  async playLegendaryEffect(cardIndex: number) {
    const stage = document.querySelector('.gacha-stage');
    stage.style.transform = 'scale(1.2)';
    await this.delay(600);
    stage.style.transform = 'scale(1)';
  }
  ```
- [ ] 금색 광선 효과
  ```svelte
  {#if card.rarity === 'legendary'}
    <div class="legendary-rays">
      {#each Array(12) as _, i}
        <div class="ray" style:transform="rotate({i * 30}deg)" />
      {/each}
    </div>
  {/if}
  ```
- [ ] 사운드 트리거 (optional)

**Acceptance Criteria**:
- WHEN Legendary 공개 시 THEN 화면이 금색으로 깜빡인다
- WHEN 카메라가 줌인되었다가 THEN 다시 줌아웃된다
- WHEN 광선 효과 THEN 중앙에서 방사형으로 퍼진다

---

### Task 3.2: Build Result Modal ⏱️ 0.5 day

_Requirements: UI Component_

**Objective**: 뽑기 결과 화면

**Subtasks**:
- [ ] `GachaResultModal.svelte` 컴포넌트
- [ ] 카드 그리드 레이아웃
  ```svelte
  <div class="result-grid">
    {#each results as card, i}
      <div class="result-card" use:scrollScale={{ delay: i * 50 }}>
        <UnifiedCard {...card} size="medium" />
        {#if card.isNew}
          <div class="new-badge">NEW</div>
        {/if}
        {#if card.isDuplicate}
          <div class="duplicate-badge">중복</div>
        {/if}
      </div>
    {/each}
  </div>
  ```
- [ ] 통계 섹션
  ```svelte
  <div class="result-stats">
    <div class="stat">
      <span>🏆 Legendary</span>
      <span>{legendaryCount}</span>
    </div>
    <!-- ... -->
  </div>
  ```
- [ ] 액션 버튼
  - [ ] "컬렉션에 추가" (자동)
  - [ ] "다시 뽑기"
  - [ ] "확인"

**Acceptance Criteria**:
- WHEN 뽑기 완료 시 THEN 모달이 열린다
- WHEN 새 카드 시 THEN "NEW" 뱃지가 표시된다
- WHEN 중복 카드 시 THEN "중복" 뱃지가 표시된다
- WHEN "다시 뽑기" 클릭 시 THEN 모달이 닫히고 초기화된다

---

### Task 3.3: Implement Probability Modal ⏱️ 0.5 day

_Requirements: FR-GACHA-001-03, NFR-GACHA-004-01_

**Objective**: 확률 정보 공개 모달

**Subtasks**:
- [ ] `ProbabilityModal.svelte` 컴포넌트
- [ ] 확률 표 디자인
  ```svelte
  <table class="probability-table">
    <thead>
      <tr>
        <th>희귀도</th>
        <th>확률</th>
        <th>예상 획득</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>⚪ Common</td>
        <td>60.0%</td>
        <td>10장당 6장</td>
      </tr>
      <!-- ... -->
    </tbody>
  </table>
  ```
- [ ] 보장 정보
  ```svelte
  <div class="guarantee-info">
    <h3>보장 시스템</h3>
    <ul>
      <li>10장 뽑기 시 최소 1장 Epic 이상 보장</li>
      <li>100회 누적 뽑기 시 Legendary 1장 보장</li>
    </ul>
  </div>
  ```
- [ ] 법적 고지
  ```svelte
  <div class="legal-notice">
    <p>본 확률은 자율 규제 가이드라인을 준수합니다.</p>
    <p>실제 결과는 확률에 따라 달라질 수 있습니다.</p>
  </div>
  ```

**Acceptance Criteria**:
- WHEN "확률 정보" 버튼 클릭 시 THEN 모달이 열린다
- WHEN 모달 내 THEN 60/25/12/3% 확률이 표시된다
- WHEN 보장 정보 THEN Epic 보장 및 Pity 설명이 표시된다

---

### Task 3.4: Create History Modal ⏱️ 0.5 day

_Requirements: FR-GACHA-004-02_

**Objective**: 뽑기 히스토리 및 통계

**Subtasks**:
- [ ] `HistoryModal.svelte` 컴포넌트
- [ ] 히스토리 목록
  ```svelte
  {#each $pullHistory as history}
    <div class="history-item">
      <div class="history-header">
        <span>{history.pullType}장 뽑기</span>
        <span>{formatDate(history.pulledAt)}</span>
      </div>
      <div class="history-cards">
        {#each history.cards as card}
          <div class="mini-card" class:legendary={card.rarity === 'legendary'}>
            <UnifiedCard {...card} size="mini" />
          </div>
        {/each}
      </div>
    </div>
  {/each}
  ```
- [ ] 통계 차트
  ```svelte
  <div class="stats-chart">
    <h3>희귀도별 획득 현황</h3>
    <div class="chart-bars">
      {#each Object.entries($gachaStats.cardsByRarity) as [rarity, count]}
        <div class="bar" style:height="{(count / totalCards) * 100}%">
          <span>{rarity}: {count}</span>
        </div>
      {/each}
    </div>
  </div>
  ```
- [ ] Pity 카운터
  ```svelte
  <div class="pity-counter">
    <h3>천장 카운터</h3>
    <div class="pity-progress">
      <div class="pity-fill" style:width="{($pityState.pullCount / 100) * 100}%"></div>
    </div>
    <p>{100 - $pityState.pullCount}회 남음</p>
  </div>
  ```

**Acceptance Criteria**:
- WHEN "히스토리" 버튼 클릭 시 THEN 모달이 열린다
- WHEN 최근 10회 뽑기 THEN 각 회차별 카드가 표시된다
- WHEN 통계 섹션 THEN 희귀도별 비율이 차트로 표시된다
- WHEN Pity 카운터 THEN 100회까지 남은 횟수가 표시된다

---

## Sprint 4: Server Integration & Testing (2 days)

### Task 4.1: PocketBase Schema Setup ⏱️ 0.5 day

_Requirements: API Integration_

**Objective**: 데이터베이스 스키마 생성

**Subtasks**:
- [ ] `gacha_pulls` 컬렉션 생성
  ```json
  {
    "name": "gacha_pulls",
    "schema": [
      { "name": "user", "type": "relation", "required": true },
      { "name": "pullType", "type": "number", "required": true },
      { "name": "cards", "type": "json", "required": true },
      { "name": "cost", "type": "json", "required": true },
      { "name": "pityCount", "type": "number" }
    ]
  }
  ```
- [ ] `user_currency` 컬렉션 생성
  ```json
  {
    "name": "user_currency",
    "schema": [
      { "name": "user", "type": "relation", "required": true, "unique": true },
      { "name": "tickets", "type": "number", "required": true, "min": 0 },
      { "name": "premium", "type": "number", "required": true, "min": 0 },
      { "name": "lastFreeTicket", "type": "date", "required": true },
      { "name": "adTicketsToday", "type": "number", "min": 0, "max": 5 }
    ]
  }
  ```
- [ ] 인덱스 추가
  ```sql
  CREATE INDEX idx_user_created ON gacha_pulls(user, created);
  CREATE UNIQUE INDEX idx_user_currency ON user_currency(user);
  ```

**Acceptance Criteria**:
- WHEN PocketBase Admin 접속 시 THEN 두 컬렉션이 존재한다
- WHEN 테스트 데이터 입력 시 THEN 제약조건이 작동한다

---

### Task 4.2: Implement Gacha API Service ⏱️ 0.5 day

_Requirements: API Integration, NFR-GACHA-003 (Security)_

**Objective**: 서버 통신 서비스

**Subtasks**:
- [ ] `gachaService.ts` 생성
- [ ] `performPull()` 구현
  ```typescript
  async performPull(pullType: PullType): Promise<GachaCard[]> {
    const response = await pb.send('/api/gacha/pull', {
      method: 'POST',
      body: JSON.stringify({ pullType })
    });
    return response.cards;
  }
  ```
- [ ] `getCurrency()` 구현
- [ ] `getHistory()` 구현
- [ ] `claimFreeTicket()` 구현
- [ ] 에러 핸들링
  ```typescript
  try {
    return await pb.send(...);
  } catch (error) {
    if (error.status === 400) {
      throw new Error('Insufficient currency');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    throw error;
  }
  ```

**Acceptance Criteria**:
- WHEN `performPull()` 호출 시 THEN 서버에서 카드가 생성된다
- WHEN 재화 부족 시 THEN 400 에러가 발생한다
- WHEN 네트워크 에러 시 THEN 적절한 에러 메시지가 표시된다

---

### Task 4.3: Server-Side Gacha Logic ⏱️ 0.5 day

_Requirements: NFR-GACHA-003 (Security)_

**Objective**: 서버에서 확률 계산 (보안)

**Subtasks**:
- [ ] PocketBase hook 생성 (`pb_hooks/gacha.pb.js`)
  ```javascript
  routerAdd('POST', '/api/gacha/pull', (c) => {
    const data = $apis.requestInfo(c).data;
    const userId = $apis.requestInfo(c).authRecord.id;

    // Check currency
    const currency = $app.dao().findFirstRecordByFilter(
      'user_currency',
      `user = "${userId}"`
    );

    const cost = data.pullType === 1 ?
      { tickets: 1, premium: 100 } :
      { tickets: 10, premium: 900 };

    if (currency.tickets < cost.tickets && currency.premium < cost.premium) {
      throw new BadRequestError('Insufficient currency');
    }

    // Deduct currency (prefer tickets)
    if (currency.tickets >= cost.tickets) {
      currency.set('tickets', currency.tickets - cost.tickets);
    } else {
      currency.set('premium', currency.premium - cost.premium);
    }
    $app.dao().saveRecord(currency);

    // Generate cards (use GachaEngine port)
    const cards = generateCards(data.pullType);

    // Save pull record
    const pull = new Record($app.dao().findCollectionByNameOrId('gacha_pulls'));
    pull.set('user', userId);
    pull.set('pullType', data.pullType);
    pull.set('cards', cards);
    pull.set('cost', cost);
    $app.dao().saveRecord(pull);

    return c.json(200, { cards });
  });
  ```
- [ ] Rate limiting 추가
- [ ] 어뷰징 탐지

**Acceptance Criteria**:
- WHEN 클라이언트가 요청하면 THEN 서버에서 카드가 생성된다
- WHEN 재화가 차감되면 THEN DB에 반영된다
- WHEN 1분에 10회 이상 요청 시 THEN Rate limit 에러가 발생한다

---

### Task 4.4: Write Integration Tests ⏱️ 0.5 day

_Requirements: Testing_

**Objective**: 통합 테스트 작성

**Subtasks**:
- [ ] 전체 뽑기 플로우 테스트
  ```typescript
  it('should complete full gacha flow', async () => {
    // 1. Check initial currency
    const initialCurrency = get(currency);
    expect(initialCurrency.tickets).toBeGreaterThan(0);

    // 2. Perform pull
    const cards = await gachaActions.pull(1);
    expect(cards).toHaveLength(1);

    // 3. Verify currency deducted
    const newCurrency = get(currency);
    expect(newCurrency.tickets).toBe(initialCurrency.tickets - 1);

    // 4. Verify history saved
    const history = get(pullHistory);
    expect(history).toHaveLength(1);
    expect(history[0].cards).toEqual(cards);
  });
  ```
- [ ] 스킵 기능 테스트
- [ ] 에러 핸들링 테스트
- [ ] Pity 시스템 테스트

**Acceptance Criteria**:
- WHEN 모든 테스트 실행 시 THEN 통과한다
- WHEN 커버리지 측정 시 THEN 80% 이상이다

---

## Optional Tasks (Future Enhancements)

### Task 5.1: Add Sound Effects ⏱️ 1 day

_Requirements: Polish_

- [ ] 사운드 파일 준비 (royalty-free)
- [ ] SoundManager 클래스 구현
- [ ] 사운드 트리거 (뽑기/공개/레전더리)
- [ ] 볼륨 조절
- [ ] 음소거 토글

### Task 5.2: Mobile Optimization ⏱️ 1 day

_Requirements: NFR-GACHA-002 (Responsive)_

- [ ] 터치 이벤트 최적화
- [ ] 모바일 레이아웃 조정
- [ ] 파티클 개수 감소 (성능)
- [ ] 햅틱 피드백 (진동)

### Task 5.3: Daily Free Ticket System ⏱️ 0.5 day

_Requirements: FR-GACHA-003-01_

- [ ] 일일 리셋 로직 (00:00 KST)
- [ ] 수령 UI
- [ ] 남은 시간 카운트다운

---

## Definition of Done

### 필수 체크리스트

- [ ] 모든 User Stories의 Acceptance Criteria 충족
- [ ] 단위 테스트 작성 및 통과 (80% 커버리지)
- [ ] 통합 테스트 통과
- [ ] 60fps 애니메이션 성능 검증
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Firefox)
- [ ] 모바일 반응형 테스트
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 (README, API docs)
- [ ] PO 승인

### 성능 기준

- [ ] 페이지 로딩: 2초 이내
- [ ] 애니메이션 FPS: 평균 58fps 이상
- [ ] 파티클 렌더링: 60fps 유지
- [ ] API 응답 시간: 500ms 이내

### 보안 기준

- [ ] 서버 사이드 확률 계산
- [ ] 재화 검증
- [ ] Rate limiting 적용
- [ ] 어뷰징 탐지

---

## Risk Mitigation

### High Risk

**Risk 1: 애니메이션 성능 저하**
- 현상: 저사양 디바이스에서 버벅임
- 대응: 파티클 개수 동적 조정, 저사양 모드 제공

**Risk 2: 확률 조작 의심**
- 현상: 사용자가 확률 조작을 의심
- 대응: 확률 명시, 히스토리 공개, 피티 시스템

### Medium Risk

**Risk 3: 서버 부하**
- 현상: 동시 다발적 뽑기 시 서버 과부하
- 대응: 큐잉, 캐싱, 서버 스케일링

---

**문서 버전**: 1.0
**작성일**: 2025-10-14
**최종 수정일**: 2025-10-14
**작성자**: Claude (with User)
**Sprint 시작일**: TBD
