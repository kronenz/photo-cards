# Gacha System - Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Gacha Page Layer                   │
│  (User Interface & Interaction Orchestration)       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Gacha     │  │  Animation   │  │ Particle  │ │
│  │   Engine    │  │  Controller  │  │  System   │ │
│  │             │  │              │  │           │ │
│  │ - Probability│  │ - Stage Mgmt │  │ - Emitter │ │
│  │ - Card Gen  │  │ - 3D Flip    │  │ - Effects │ │
│  │ - Guarantee │  │ - Timing     │  │ - Cleanup │ │
│  └─────────────┘  └──────────────┘  └───────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│                  State Management                   │
│              (Svelte Stores + Actions)              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Currency   │  │   History    │  │  Pity     │ │
│  │   Store     │  │    Store     │  │  System   │ │
│  └─────────────┘  └──────────────┘  └───────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   Data Layer                        │
│         (PocketBase + Local Storage)                │
└─────────────────────────────────────────────────────┘
```

### 1.2 Component Hierarchy

```
GachaPage.svelte
├── GachaHeader.svelte
│   ├── CurrencyDisplay.svelte
│   └── ProbabilityButton.svelte
│
├── GachaStage.svelte (Main Display Area)
│   ├── SummonCircle.svelte (Idle/Pulling)
│   ├── GachaCard.svelte[] (Mystery Cards)
│   │   ├── MysteryFace.svelte
│   │   └── RevealedFace.svelte (UnifiedCard)
│   ├── ParticleCanvas.svelte
│   └── SkipButton.svelte
│
├── GachaPullButtons.svelte
│   ├── SinglePullButton.svelte
│   └── MultiPullButton.svelte
│
├── GachaResultModal.svelte
│   ├── ResultGrid.svelte
│   ├── RarityStats.svelte
│   └── ActionButtons.svelte
│
└── GachaModals
    ├── ProbabilityModal.svelte
    ├── HistoryModal.svelte
    └── CurrencyShopModal.svelte
```

---

## 2. Data Models

### 2.1 Core Data Structures

```typescript
// ===== Gacha State =====
interface GachaState {
  // Current stage of the gacha process
  stage: GachaStage;

  // Type of pull being performed
  pullType: PullType;

  // Current card being revealed (for sequential animation)
  currentRevealIndex: number;

  // All pulled cards
  results: GachaCard[];

  // Animation control
  canSkip: boolean;
  isSkipping: boolean;

  // Error state
  error: string | null;
}

type GachaStage =
  | 'idle'       // Waiting for user input
  | 'pulling'    // Summon circle animation
  | 'revealing'  // Cards flipping
  | 'complete';  // Results displayed

type PullType = 1 | 10;

// ===== Gacha Card =====
interface GachaCard extends Card {
  // Additional gacha-specific data
  pullId: string;           // Unique pull session ID
  pullIndex: number;        // Position in the pull (0-9)
  pulledAt: Date;           // Timestamp
  isNew: boolean;           // First time acquiring
  isDuplicate: boolean;     // Already owned
  guaranteeType?: 'pity' | 'bonus'; // Special guarantee
}

// ===== Currency =====
interface Currency {
  tickets: number;          // Free/earned tickets
  premium: number;          // Paid currency
  lastFreeTicket: Date;     // For daily reset
  adTicketsToday: number;   // Ad-earned tickets today
}

// ===== Pull Costs =====
interface PullCost {
  tickets: number;
  premium: number;
}

const PULL_COSTS: Record<PullType, PullCost> = {
  1: { tickets: 1, premium: 100 },
  10: { tickets: 10, premium: 900 } // 10% discount
};

// ===== Probability Config =====
interface ProbabilityConfig {
  common: number;      // 0.60 (60%)
  rare: number;        // 0.25 (25%)
  epic: number;        // 0.12 (12%)
  legendary: number;   // 0.03 (3%)
}

// ===== Pity System =====
interface PityState {
  pullCount: number;           // Total pulls since last legendary
  guaranteeThreshold: number;  // 100 pulls
  isGuaranteed: boolean;       // Next pull is guaranteed legendary
}

// ===== History =====
interface PullHistory {
  id: string;
  pullType: PullType;
  cards: GachaCard[];
  pulledAt: Date;
  userId: string;
}

interface GachaStats {
  totalPulls: number;
  cardsByRarity: Record<RarityType, number>;
  averageRarity: number;
  legendaryCount: number;
  duplicateCount: number;
}
```

### 2.2 Animation Configuration

```typescript
interface AnimationConfig {
  // Duration for each stage (ms)
  duration: {
    pulling: 1000;      // Summon circle
    cardAppear: 400;    // Each card appearing
    cardFlip: 800;      // Card flip animation
    particle: 1200;     // Particle effect duration
    complete: 2000;     // Final result display
  };

  // Timing between cards
  stagger: {
    appear: 100;        // Time between card appearances
    reveal: 100;        // Time between card reveals
  };

  // Easing functions
  easing: {
    pullOut: string;    // 'cubic-bezier(0.34, 1.56, 0.64, 1)' // bounce
    flip: string;       // 'cubic-bezier(0.33, 1, 0.68, 1)'    // smooth
    particle: string;   // 'ease-out'
  };

  // Particle counts by rarity
  particles: {
    common: 10;
    rare: 20;
    epic: 40;
    legendary: 80;
  };

  // Special effects
  special: {
    legendaryScreenFlash: boolean;
    legendaryCameraZoom: number;  // 1.2x
    legendarySlowMotion: number;  // 0.5x speed
  };
}

const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  duration: {
    pulling: 1000,
    cardAppear: 400,
    cardFlip: 800,
    particle: 1200,
    complete: 2000
  },
  stagger: {
    appear: 100,
    reveal: 100
  },
  easing: {
    pullOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    flip: 'cubic-bezier(0.33, 1, 0.68, 1)',
    particle: 'ease-out'
  },
  particles: {
    common: 10,
    rare: 20,
    epic: 40,
    legendary: 80
  },
  special: {
    legendaryScreenFlash: true,
    legendaryCameraZoom: 1.2,
    legendarySlowMotion: 0.5
  }
};
```

---

## 3. System Components

### 3.1 Gacha Engine

**Responsibility**: 확률 계산 및 카드 생성

```typescript
/**
 * GachaEngine
 *
 * Core probability engine for gacha system.
 * Handles weighted random selection and guarantee logic.
 */
class GachaEngine {
  private probabilities: ProbabilityConfig;
  private pityState: PityState;

  constructor(config?: Partial<ProbabilityConfig>) {
    this.probabilities = {
      common: 0.60,
      rare: 0.25,
      epic: 0.12,
      legendary: 0.03,
      ...config
    };

    this.pityState = {
      pullCount: 0,
      guaranteeThreshold: 100,
      isGuaranteed: false
    };
  }

  /**
   * Pull a single card
   * @returns Generated gacha card
   */
  pullSingle(pullId: string, pullIndex: number): GachaCard {
    this.pityState.pullCount++;

    // Check pity guarantee
    if (this.pityState.pullCount >= this.pityState.guaranteeThreshold) {
      this.pityState.pullCount = 0;
      this.pityState.isGuaranteed = false;
      return this.generateCard('legendary', pullId, pullIndex, 'pity');
    }

    // Normal weighted random
    const rarity = this.rollRarity();
    const card = this.generateCard(rarity, pullId, pullIndex);

    // Reset pity on legendary
    if (rarity === 'legendary') {
      this.pityState.pullCount = 0;
    }

    return card;
  }

  /**
   * Pull 10 cards with guarantee
   * @returns Array of 10 gacha cards
   */
  pullMulti(): GachaCard[] {
    const pullId = this.generatePullId();
    const cards: GachaCard[] = [];

    // Pull 10 cards
    for (let i = 0; i < 10; i++) {
      cards.push(this.pullSingle(pullId, i));
    }

    // Guarantee: At least 1 Epic or higher
    const hasRare = cards.some(c =>
      c.rarity === 'epic' || c.rarity === 'legendary'
    );

    if (!hasRare) {
      // Replace last card with Epic (80%) or Legendary (20%)
      const guaranteedRarity = Math.random() < 0.8 ? 'epic' : 'legendary';
      cards[9] = this.generateCard(guaranteedRarity, pullId, 9, 'bonus');

      if (guaranteedRarity === 'legendary') {
        this.pityState.pullCount = 0;
      }
    }

    return cards;
  }

  /**
   * Weighted random selection
   */
  private rollRarity(): RarityType {
    const rand = Math.random();
    let cumulative = 0;

    for (const [rarity, prob] of Object.entries(this.probabilities)) {
      cumulative += prob;
      if (rand < cumulative) {
        return rarity as RarityType;
      }
    }

    return 'common'; // Fallback
  }

  /**
   * Generate a card with given rarity
   */
  private generateCard(
    rarity: RarityType,
    pullId: string,
    pullIndex: number,
    guaranteeType?: 'pity' | 'bonus'
  ): GachaCard {
    const teams: TeamId[] = [
      'lg', 'doosan', 'kt', 'samsung', 'nc',
      'kia', 'lotte', 'ssg', 'hanwha', 'kiwoom'
    ];

    const team = teams[Math.floor(Math.random() * teams.length)];

    return {
      id: `${pullId}-${pullIndex}`,
      pullId,
      pullIndex,
      title: this.getRandomPlayerName(team),
      subtitle: this.getRandomPosition(),
      number: String(Math.floor(Math.random() * 99) + 1),
      team,
      rarity,
      image: this.getRandomImage(team, rarity),
      createdAt: new Date().toISOString(),
      pulledAt: new Date(),
      stats: { likes: 0, views: 0 },
      isFavorite: false,
      isNew: true, // Will be checked against existing collection
      isDuplicate: false,
      guaranteeType
    };
  }

  private generatePullId(): string {
    return `pull-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRandomPlayerName(team: TeamId): string {
    // Mock player names by team
    const players: Record<TeamId, string[]> = {
      lg: ['오지환', '고영표', '박해민', '문보경', '임찬규'],
      doosan: ['양의지', '김재환', '정수빈', '박계범', '김승회'],
      kt: ['강백호', '김민혁', '황재균', '박병호', '위즈'],
      samsung: ['구자욱', '김헌곤', '이재현', '강민호', '원태인'],
      nc: ['박민우', '나성범', '손아섭', '박석민', '이재학'],
      kia: ['김도영', '최형우', '박찬호', '김선빈', '양현종'],
      lotte: ['손아섭', '이대호', '전준우', '한동희', '박세웅'],
      ssg: ['최정', '추신수', '박성한', '한유섬', '김광현'],
      hanwha: ['노시환', '채은성', '이진영', '안치홍', '주현상'],
      kiwoom: ['이정후', '김혜성', '송성문', '로하스', '서건창']
    };

    const teamPlayers = players[team] || players.lg;
    return teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
  }

  private getRandomPosition(): string {
    const positions = ['투수', '포수', '내야수', '외야수', '지명타자'];
    return positions[Math.floor(Math.random() * positions.length)];
  }

  private getRandomImage(team: TeamId, rarity: RarityType): string {
    // In production, use actual player images
    return `https://picsum.photos/400/560?random=${team}-${rarity}-${Date.now()}`;
  }

  /**
   * Get current pity status
   */
  getPityStatus(): PityState {
    return { ...this.pityState };
  }

  /**
   * Load pity state from storage
   */
  loadPityState(state: PityState): void {
    this.pityState = { ...state };
  }
}

export default GachaEngine;
```

### 3.2 Animation Controller

**Responsibility**: 애니메이션 오케스트레이션 및 타이밍 관리

```typescript
/**
 * GachaAnimationController
 *
 * Orchestrates all gacha animations with proper timing and skip support.
 */
class GachaAnimationController {
  private config: AnimationConfig;
  private skipRequested: boolean = false;
  private currentStage: GachaStage = 'idle';

  constructor(config: AnimationConfig = DEFAULT_ANIMATION_CONFIG) {
    this.config = config;
  }

  /**
   * Play complete gacha sequence
   */
  async playFullSequence(
    cards: GachaCard[],
    callbacks: AnimationCallbacks
  ): Promise<void> {
    this.skipRequested = false;

    try {
      // Stage 1: Pulling
      this.currentStage = 'pulling';
      callbacks.onStageChange?.('pulling');
      await this.playPullingStage(cards.length);

      if (this.skipRequested) {
        return this.skipToEnd(cards, callbacks);
      }

      // Stage 2: Revealing
      this.currentStage = 'revealing';
      callbacks.onStageChange?.('revealing');
      await this.playRevealingStage(cards, callbacks);

      if (this.skipRequested) {
        return this.skipToEnd(cards, callbacks);
      }

      // Stage 3: Complete
      this.currentStage = 'complete';
      callbacks.onStageChange?.('complete');
      callbacks.onComplete?.(cards);

    } catch (error) {
      callbacks.onError?.(error);
    }
  }

  /**
   * Stage 1: Summon circle and cards appearing
   */
  private async playPullingStage(cardCount: number): Promise<void> {
    // Summon circle animation
    await this.animateSummonCircle();

    // Cards fly in
    const appearPromises = [];
    for (let i = 0; i < cardCount; i++) {
      if (this.skipRequested) break;

      appearPromises.push(
        this.delay(i * this.config.stagger.appear).then(() =>
          this.animateCardAppear(i)
        )
      );
    }

    await Promise.all(appearPromises);
    await this.delay(200); // Pause before revealing
  }

  /**
   * Stage 2: Cards flipping and revealing
   */
  private async playRevealingStage(
    cards: GachaCard[],
    callbacks: AnimationCallbacks
  ): Promise<void> {
    for (let i = 0; i < cards.length; i++) {
      if (this.skipRequested) break;

      const card = cards[i];

      // Notify current reveal index
      callbacks.onRevealStart?.(card, i);

      // Play card flip animation
      await this.animateCardFlip(i);

      // Emit particles based on rarity
      this.emitParticles(card.rarity, i);

      // Special legendary effect
      if (card.rarity === 'legendary') {
        await this.playLegendaryEffect(i);
      }

      // Notify reveal complete
      callbacks.onRevealComplete?.(card, i);

      // Stagger delay
      if (i < cards.length - 1) {
        await this.delay(this.config.stagger.reveal);
      }
    }

    await this.delay(this.config.duration.complete);
  }

  /**
   * Summon circle animation
   */
  private async animateSummonCircle(): Promise<void> {
    const circle = document.querySelector('.summon-circle');
    if (!circle) return;

    circle.classList.add('active');
    await this.delay(this.config.duration.pulling);
    circle.classList.remove('active');
  }

  /**
   * Card appear animation
   */
  private async animateCardAppear(index: number): Promise<void> {
    const card = document.querySelector(`[data-card-index="${index}"]`);
    if (!card) return;

    card.classList.add('appearing');
    await this.delay(this.config.duration.cardAppear);
    card.classList.add('appeared');
    card.classList.remove('appearing');
  }

  /**
   * Card flip animation (Y-axis 180deg)
   */
  private async animateCardFlip(index: number): Promise<void> {
    const card = document.querySelector(`[data-card-index="${index}"]`);
    if (!card) return;

    card.classList.add('flipping');
    await this.delay(this.config.duration.cardFlip);
    card.classList.add('flipped');
    card.classList.remove('flipping');
  }

  /**
   * Emit particle effect
   */
  private emitParticles(rarity: RarityType, cardIndex: number): void {
    const count = this.config.particles[rarity];
    const card = document.querySelector(`[data-card-index="${cardIndex}"]`);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Emit particles (delegated to ParticleSystem)
    window.dispatchEvent(new CustomEvent('gacha:emitParticles', {
      detail: { rarity, count, x: centerX, y: centerY }
    }));
  }

  /**
   * Legendary special effect
   */
  private async playLegendaryEffect(cardIndex: number): Promise<void> {
    // Screen flash
    if (this.config.special.legendaryScreenFlash) {
      document.body.classList.add('legendary-flash');
      await this.delay(200);
      document.body.classList.remove('legendary-flash');
    }

    // Camera zoom
    const stage = document.querySelector('.gacha-stage');
    if (stage) {
      stage.style.transform = `scale(${this.config.special.legendaryCameraZoom})`;
      await this.delay(600);
      stage.style.transform = 'scale(1)';
    }

    // Sound (if enabled)
    window.dispatchEvent(new CustomEvent('gacha:playSound', {
      detail: { type: 'legendary' }
    }));
  }

  /**
   * Skip to end
   */
  private skipToEnd(cards: GachaCard[], callbacks: AnimationCallbacks): void {
    // Instantly reveal all cards
    cards.forEach((card, index) => {
      const cardEl = document.querySelector(`[data-card-index="${index}"]`);
      if (cardEl) {
        cardEl.classList.add('appeared', 'flipped');
        cardEl.classList.remove('appearing', 'flipping');
      }

      callbacks.onRevealComplete?.(card, index);
    });

    this.currentStage = 'complete';
    callbacks.onStageChange?.('complete');
    callbacks.onComplete?.(cards);
  }

  /**
   * Request skip
   */
  skip(): void {
    this.skipRequested = true;
  }

  /**
   * Utility: Promise-based delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current stage
   */
  getCurrentStage(): GachaStage {
    return this.currentStage;
  }
}

interface AnimationCallbacks {
  onStageChange?: (stage: GachaStage) => void;
  onRevealStart?: (card: GachaCard, index: number) => void;
  onRevealComplete?: (card: GachaCard, index: number) => void;
  onComplete?: (cards: GachaCard[]) => void;
  onError?: (error: any) => void;
}

export default GachaAnimationController;
```

### 3.3 Particle System

**Responsibility**: 파티클 효과 렌더링

```typescript
/**
 * ParticleSystem
 *
 * GPU-accelerated particle effects for gacha reveals.
 * Uses Canvas API with requestAnimationFrame for 60fps performance.
 */
class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrame: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Listen for emit events
    window.addEventListener('gacha:emitParticles', (e: Event) => {
      const { rarity, count, x, y } = (e as CustomEvent).detail;
      this.emit(rarity, count, x, y);
    });
  }

  /**
   * Emit particles
   */
  emit(rarity: RarityType, count: number, x: number, y: number): void {
    const config = this.getParticleConfig(rarity);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        life: 1.0,
        decay: config.decay,
        size: config.size * (0.5 + Math.random() * 0.5),
        color: config.color,
        shape: config.shape
      });
    }

    if (!this.animationFrame) {
      this.startLoop();
    }
  }

  /**
   * Get particle config by rarity
   */
  private getParticleConfig(rarity: RarityType): ParticleConfig {
    const configs: Record<RarityType, ParticleConfig> = {
      common: {
        color: 'rgba(255, 255, 255, ${alpha})',
        size: 4,
        speed: 3,
        decay: 0.02,
        shape: 'circle'
      },
      rare: {
        color: 'rgba(59, 130, 246, ${alpha})',
        size: 6,
        speed: 4,
        decay: 0.015,
        shape: 'star'
      },
      epic: {
        color: 'rgba(168, 85, 247, ${alpha})',
        size: 8,
        speed: 5,
        decay: 0.012,
        shape: 'diamond'
      },
      legendary: {
        color: 'rgba(251, 191, 36, ${alpha})',
        size: 10,
        speed: 6,
        decay: 0.01,
        shape: 'burst'
      }
    };

    return configs[rarity];
  }

  /**
   * Animation loop
   */
  private startLoop(): void {
    const animate = () => {
      this.update();
      this.render();

      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
      }
    };

    animate();
  }

  /**
   * Update particles
   */
  private update(): void {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life -= p.decay;

      return p.life > 0;
    });
  }

  /**
   * Render particles
   */
  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;

      switch (p.shape) {
        case 'circle':
          this.drawCircle(p);
          break;
        case 'star':
          this.drawStar(p);
          break;
        case 'diamond':
          this.drawDiamond(p);
          break;
        case 'burst':
          this.drawBurst(p);
          break;
      }

      this.ctx.restore();
    });
  }

  private drawCircle(p: Particle): void {
    this.ctx.fillStyle = p.color.replace('${alpha}', String(p.life));
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawStar(p: Particle): void {
    this.ctx.fillStyle = p.color.replace('${alpha}', String(p.life));
    this.ctx.beginPath();

    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? p.size : p.size / 2;
      const x = p.x + Math.cos(angle) * radius;
      const y = p.y + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawDiamond(p: Particle): void {
    this.ctx.fillStyle = p.color.replace('${alpha}', String(p.life));
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y - p.size);
    this.ctx.lineTo(p.x + p.size, p.y);
    this.ctx.lineTo(p.x, p.y + p.size);
    this.ctx.lineTo(p.x - p.size, p.y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawBurst(p: Particle): void {
    this.ctx.strokeStyle = p.color.replace('${alpha}', String(p.life));
    this.ctx.lineWidth = 2;

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = p.x + Math.cos(angle) * p.size * 0.3;
      const y1 = p.y + Math.sin(angle) * p.size * 0.3;
      const x2 = p.x + Math.cos(angle) * p.size;
      const y2 = p.y + Math.sin(angle) * p.size;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
    window.removeEventListener('gacha:emitParticles', () => {});
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
  shape: 'circle' | 'star' | 'diamond' | 'burst';
}

interface ParticleConfig {
  color: string;
  size: number;
  speed: number;
  decay: number;
  shape: 'circle' | 'star' | 'diamond' | 'burst';
}

export default ParticleSystem;
```

---

## 4. State Management

### 4.1 Svelte Stores

```typescript
// stores/gachaStore.ts
import { writable, derived, get } from 'svelte/store';
import GachaEngine from '$lib/gacha/GachaEngine';

// ===== Main Gacha State =====
export const gachaState = writable<GachaState>({
  stage: 'idle',
  pullType: 1,
  currentRevealIndex: 0,
  results: [],
  canSkip: false,
  isSkipping: false,
  error: null
});

// ===== Currency Store =====
export const currency = writable<Currency>({
  tickets: 10,
  premium: 1000,
  lastFreeTicket: new Date(),
  adTicketsToday: 0
});

// ===== History Store =====
export const pullHistory = writable<PullHistory[]>([]);

// ===== Pity Store =====
export const pityState = writable<PityState>({
  pullCount: 0,
  guaranteeThreshold: 100,
  isGuaranteed: false
});

// ===== Derived: Can Afford Pull =====
export const canAffordPull = derived(
  [currency],
  ([$currency]) => ({
    single: $currency.tickets >= 1 || $currency.premium >= 100,
    multi: $currency.tickets >= 10 || $currency.premium >= 900
  })
);

// ===== Derived: Stats =====
export const gachaStats = derived(
  [pullHistory],
  ([$history]): GachaStats => {
    const allCards = $history.flatMap(h => h.cards);

    return {
      totalPulls: $history.length,
      cardsByRarity: {
        common: allCards.filter(c => c.rarity === 'common').length,
        rare: allCards.filter(c => c.rarity === 'rare').length,
        epic: allCards.filter(c => c.rarity === 'epic').length,
        legendary: allCards.filter(c => c.rarity === 'legendary').length
      },
      averageRarity: calculateAverageRarity(allCards),
      legendaryCount: allCards.filter(c => c.rarity === 'legendary').length,
      duplicateCount: allCards.filter(c => c.isDuplicate).length
    };
  }
);

function calculateAverageRarity(cards: GachaCard[]): number {
  const rarityValues = { common: 1, rare: 2, epic: 3, legendary: 4 };
  const sum = cards.reduce((acc, c) => acc + rarityValues[c.rarity], 0);
  return cards.length > 0 ? sum / cards.length : 0;
}

// ===== Actions =====
export const gachaActions = {
  /**
   * Perform a pull
   */
  async pull(type: PullType): Promise<GachaCard[]> {
    const $currency = get(currency);
    const cost = PULL_COSTS[type];

    // Check currency
    if ($currency.tickets < cost.tickets && $currency.premium < cost.premium) {
      gachaState.update(s => ({ ...s, error: '재화가 부족합니다' }));
      throw new Error('Insufficient currency');
    }

    // Deduct currency (prefer tickets)
    if ($currency.tickets >= cost.tickets) {
      currency.update(c => ({ ...c, tickets: c.tickets - cost.tickets }));
    } else {
      currency.update(c => ({ ...c, premium: c.premium - cost.premium }));
    }

    // Generate cards
    const engine = new GachaEngine();
    engine.loadPityState(get(pityState));

    const cards = type === 1 ? [engine.pullSingle('', 0)] : engine.pullMulti();

    // Update pity state
    pityState.set(engine.getPityStatus());

    // Update gacha state
    gachaState.update(s => ({
      ...s,
      pullType: type,
      results: cards,
      stage: 'pulling',
      canSkip: true,
      error: null
    }));

    // Save to history
    pullHistory.update(h => [
      {
        id: `history-${Date.now()}`,
        pullType: type,
        cards,
        pulledAt: new Date(),
        userId: 'current-user' // TODO: Get from auth
      },
      ...h
    ].slice(0, 100)); // Keep last 100

    return cards;
  },

  /**
   * Skip animation
   */
  skip(): void {
    gachaState.update(s => ({ ...s, isSkipping: true, canSkip: false }));
  },

  /**
   * Reset to idle
   */
  reset(): void {
    gachaState.set({
      stage: 'idle',
      pullType: 1,
      currentRevealIndex: 0,
      results: [],
      canSkip: false,
      isSkipping: false,
      error: null
    });
  },

  /**
   * Claim daily free ticket
   */
  claimFreeTicket(): boolean {
    const $currency = get(currency);
    const now = new Date();
    const lastClaim = new Date($currency.lastFreeTicket);

    // Check if 24 hours passed
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastClaim >= 24) {
      currency.update(c => ({
        ...c,
        tickets: c.tickets + 1,
        lastFreeTicket: now
      }));
      return true;
    }

    return false;
  }
};
```

---

## 5. API Integration

### 5.1 PocketBase Schema

```typescript
// collections/gacha_pulls.json
{
  "id": "gacha_pulls",
  "name": "gacha_pulls",
  "type": "base",
  "schema": [
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": false
      }
    },
    {
      "name": "pullType",
      "type": "number",
      "required": true
    },
    {
      "name": "cards",
      "type": "json",
      "required": true
    },
    {
      "name": "cost",
      "type": "json",
      "required": true
    },
    {
      "name": "pityCount",
      "type": "number",
      "required": false
    }
  ],
  "indexes": [
    "CREATE INDEX idx_user_created ON gacha_pulls(user, created)"
  ]
}

// collections/user_currency.json
{
  "id": "user_currency",
  "name": "user_currency",
  "type": "base",
  "schema": [
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "unique": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": true
      }
    },
    {
      "name": "tickets",
      "type": "number",
      "required": true,
      "min": 0
    },
    {
      "name": "premium",
      "type": "number",
      "required": true,
      "min": 0
    },
    {
      "name": "lastFreeTicket",
      "type": "date",
      "required": true
    },
    {
      "name": "adTicketsToday",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 5
    }
  ]
}
```

### 5.2 API Service

```typescript
// services/gachaService.ts
import pb from '$lib/pocketbase';

export const gachaService = {
  /**
   * Server-side pull (secure)
   */
  async performPull(pullType: PullType): Promise<GachaCard[]> {
    const response = await pb.send('/api/gacha/pull', {
      method: 'POST',
      body: JSON.stringify({ pullType })
    });

    return response.cards;
  },

  /**
   * Get user currency
   */
  async getCurrency(userId: string): Promise<Currency> {
    const record = await pb.collection('user_currency').getFirstListItem(
      `user="${userId}"`
    );

    return {
      tickets: record.tickets,
      premium: record.premium,
      lastFreeTicket: new Date(record.lastFreeTicket),
      adTicketsToday: record.adTicketsToday
    };
  },

  /**
   * Get pull history
   */
  async getHistory(userId: string, limit = 10): Promise<PullHistory[]> {
    const records = await pb.collection('gacha_pulls').getList(1, limit, {
      filter: `user="${userId}"`,
      sort: '-created'
    });

    return records.items.map(r => ({
      id: r.id,
      pullType: r.pullType,
      cards: r.cards,
      pulledAt: new Date(r.created),
      userId: r.user
    }));
  },

  /**
   * Claim free ticket
   */
  async claimFreeTicket(userId: string): Promise<boolean> {
    try {
      await pb.send('/api/gacha/claim-free-ticket', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      return true;
    } catch (error) {
      return false;
    }
  }
};
```

---

## 6. Performance Optimization

### 6.1 Animation Performance

- **GPU 가속**: `transform: translateZ(0)` 사용
- **Will-change**: `will-change: transform, opacity` 선언
- **RequestAnimationFrame**: 파티클 렌더링에 RAF 사용
- **동적 파티클 조정**: 디바이스 성능에 따라 파티클 개수 감소

### 6.2 메모리 관리

- 파티클 풀링 (Particle Pooling)
- 애니메이션 완료 후 리소스 정리
- 이미지 lazy loading

### 6.3 네트워크 최적화

- 뽑기 결과 서버 검증 (보안)
- 오프라인 큐잉 (네트워크 끊김 대응)
- 낙관적 UI 업데이트

---

## 7. Error Handling

### 7.1 에러 시나리오

| Error | Cause | Handling |
|-------|-------|----------|
| Insufficient Currency | 재화 부족 | 에러 메시지 + 구매 유도 |
| Network Error | 서버 통신 실패 | 재시도 + 오프라인 큐잉 |
| Animation Error | 렌더링 실패 | 스킵 강제 + 결과만 표시 |
| Invalid Pull Result | 서버 응답 이상 | 재뽑기 또는 보상 |

### 7.2 에러 복구

```typescript
try {
  await gachaActions.pull(10);
} catch (error) {
  if (error.message === 'Insufficient currency') {
    // Show purchase modal
    showCurrencyShop();
  } else if (error.name === 'NetworkError') {
    // Queue for retry
    queueOfflinePull(10);
  } else {
    // Generic error
    showErrorToast('뽑기에 실패했습니다. 다시 시도해주세요.');
  }
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

- GachaEngine 확률 테스트 (10,000회 시뮬레이션)
- AnimationController 타이밍 테스트
- ParticleSystem 렌더링 테스트
- Store actions 테스트

### 8.2 Integration Tests

- 전체 뽑기 플로우 테스트
- 스킵 기능 테스트
- 재화 차감 및 환급 테스트
- 서버 통신 모킹 테스트

### 8.3 E2E Tests

- 사용자 시나리오 테스트
- 크로스 브라우저 테스트
- 모바일 디바이스 테스트
- 성능 벤치마크 (60fps 유지)

---

## 9. Security Considerations

### 9.1 클라이언트-서버 분리

- **클라이언트**: 애니메이션만 담당
- **서버**: 확률 계산 및 카드 생성
- **검증**: 뽑기 결과 해시 검증

### 9.2 어뷰징 방지

- Rate limiting (분당 뽑기 횟수 제한)
- 재화 변조 탐지
- 비정상 패턴 감지

---

**문서 버전**: 1.0
**작성일**: 2025-10-14
**최종 수정일**: 2025-10-14
**작성자**: Claude (with User)
**리뷰 대기중**: Tech Lead
