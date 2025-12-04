/**
 * Gacha2 Store - 단순하고 직관적인 가챠 상태 관리
 * Feature: 004-production-service-integration (T056)
 */
import { writable, derived, get } from 'svelte/store';
import { saveGachaResults } from '$lib/services/gachaService';
import { pb } from '$lib/pocketbase';

// 카드 타입
export interface Gacha2Card {
  id: string;
  title: string;
  subtitle: string;
  team: string;
  number: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  isNew: boolean;
  isDuplicate?: boolean;
  cardCount?: number;
}

// 상태 타입
export type Gacha2Stage = 'idle' | 'pulling' | 'result' | 'saving' | 'saved';

// 스토어 상태
interface Gacha2State {
  stage: Gacha2Stage;
  cards: Gacha2Card[];
  pullCount: number;
  saveResult: {
    newCards: number;
    duplicates: number;
    historyId?: string;
  } | null;
  error: string | null;
}

// 초기 상태
const initialState: Gacha2State = {
  stage: 'idle',
  cards: [],
  pullCount: 0,
  saveResult: null,
  error: null
};

// 메인 스토어
export const gacha2Store = writable<Gacha2State>(initialState);

// 파생 스토어
export const gacha2Stage = derived(gacha2Store, ($store) => $store.stage);
export const gacha2Cards = derived(gacha2Store, ($store) => $store.cards);
export const gacha2Error = derived(gacha2Store, ($store) => $store.error);
export const gacha2SaveResult = derived(gacha2Store, ($store) => $store.saveResult);

// 팀 목록
const TEAMS = ['lg', 'doosan', 'kt', 'samsung', 'nc', 'kia', 'lotte', 'ssg', 'hanwha', 'kiwoom'];

// 선수 이름 풀
const PLAYER_NAMES = [
  '김현수', '박병호', '이정후', '양의지', '나성범',
  '최정', '김하성', '오재일', '고우석', '박건우',
  '이의리', '김광현', '문보경', '노시환', '강백호',
  '유희관', '구자욱', '소형준', '정우영', '박해민'
];

// 포지션 풀
const POSITIONS = ['투수', '포수', '내야수', '외야수', '지명타자'];

// 랜덤 카드 생성
function generateRandomCard(index: number): Gacha2Card {
  const rand = Math.random();
  let rarity: Gacha2Card['rarity'];

  if (rand < 0.03) rarity = 'legendary';
  else if (rand < 0.15) rarity = 'epic';
  else if (rand < 0.40) rarity = 'rare';
  else rarity = 'common';

  const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  const name = PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const number = String(Math.floor(Math.random() * 99) + 1);

  return {
    id: `card-${Date.now()}-${index}`,
    title: name,
    subtitle: position,
    team,
    number,
    rarity,
    image: `https://picsum.photos/400/560?random=${Date.now() + index}`,
    isNew: true
  };
}

// 액션
export const gacha2Actions = {
  pull: (count: 1 | 10) => {
    gacha2Store.update((state) => ({
      ...state,
      stage: 'pulling',
      pullCount: count,
      cards: [],
      saveResult: null,
      error: null
    }));

    setTimeout(() => {
      const cards = Array.from({ length: count }, (_, i) => generateRandomCard(i));
      gacha2Store.update((state) => ({
        ...state,
        stage: 'result',
        cards
      }));
    }, 1500);
  },

  /**
   * Save gacha results to backend (T058 - duplicate detection)
   */
  saveResults: async () => {
    const state = get(gacha2Store);

    if (state.cards.length === 0) {
      return;
    }

    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      gacha2Store.update((s) => ({
        ...s,
        error: '로그인이 필요합니다.'
      }));
      return;
    }

    gacha2Store.update((s) => ({
      ...s,
      stage: 'saving',
      error: null
    }));

    try {
      const result = await saveGachaResults(
        state.cards.map((card) => ({
          title: card.title,
          subtitle: card.subtitle,
          team: card.team,
          number: card.number,
          rarity: card.rarity,
          image: card.image
        }))
      );

      // Update cards with duplicate info
      const updatedCards = state.cards.map((card) => {
        const savedResult = result.results.find(
          (r) => r.title === card.title && r.team === card.team && r.rarity === card.rarity
        );
        return {
          ...card,
          isNew: savedResult ? !savedResult.is_duplicate : true,
          isDuplicate: savedResult?.is_duplicate || false,
          cardCount: savedResult?.new_count || 1
        };
      });

      gacha2Store.update((s) => ({
        ...s,
        stage: 'saved',
        cards: updatedCards,
        saveResult: {
          newCards: result.stats.new_cards,
          duplicates: result.stats.duplicates,
          historyId: result.history_id
        }
      }));
    } catch (err: any) {
      gacha2Store.update((s) => ({
        ...s,
        stage: 'result',
        error: err.message || '결과 저장에 실패했습니다.'
      }));
    }
  },

  reset: () => {
    gacha2Store.set(initialState);
  },

  clearError: () => {
    gacha2Store.update((s) => ({ ...s, error: null }));
  }
};
