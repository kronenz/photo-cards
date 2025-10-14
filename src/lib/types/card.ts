/**
 * Card Type Definitions
 */

// Team IDs
export type TeamId =
  | 'lg'
  | 'doosan'
  | 'kt'
  | 'samsung'
  | 'nc'
  | 'kia'
  | 'lotte'
  | 'ssg'
  | 'hanwha'
  | 'kiwoom';

// Rarity
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

// Base Card interface
export interface Card {
  id: string;
  title: string; // Player name
  subtitle: string; // Position
  number: string; // Jersey number
  team: TeamId;
  rarity: RarityType;
  image: string; // Card image URL
  createdAt: string; // ISO date string
  stats: {
    likes: number;
    views: number;
  };
  isFavorite: boolean;
}
