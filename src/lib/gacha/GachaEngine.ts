/**
 * GachaEngine
 *
 * Core probability engine for gacha system.
 * Handles weighted random selection and guarantee logic.
 */

import type {
  GachaCard,
  ProbabilityConfig,
  PityState,
  PullType
} from './types';
import { DEFAULT_PROBABILITIES } from './types';
import type { RarityType, TeamId } from '$lib/types/card';

export class GachaEngine {
  private probabilities: ProbabilityConfig;
  private pityState: PityState;

  constructor(config?: Partial<ProbabilityConfig>) {
    this.probabilities = {
      ...DEFAULT_PROBABILITIES,
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
    const hasRare = cards.some(
      (c) => c.rarity === 'epic' || c.rarity === 'legendary'
    );

    if (!hasRare) {
      // Replace last card with Epic (80%) or Legendary (20%)
      const guaranteedRarity: RarityType =
        Math.random() < 0.8 ? 'epic' : 'legendary';
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
      'lg',
      'doosan',
      'kt',
      'samsung',
      'nc',
      'kia',
      'lotte',
      'ssg',
      'hanwha',
      'kiwoom'
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
      kt: ['강백호', '김민혁', '황재균', '박병호', '쿠에바스'],
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
    const seed = `${team}-${rarity}-${Date.now()}`;
    return `https://picsum.photos/400/560?random=${seed}`;
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
