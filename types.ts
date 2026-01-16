export enum GameState {
  AUTH = 'AUTH',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  RANKING = 'RANKING',
  MULTIPLAYER_LOBBY = 'MULTIPLAYER_LOBBY',
  MULTIPLAYER = 'MULTIPLAYER'
}

export enum MoveDirection {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  LEFT = 'left',
  RIGHT = 'right'
}

export type MapTheme = 'normal' | 'volcano';

export interface PlayerData {
  email: string; // Google Email simulation
  name: string;
  coins: number;
  highScore: number;
  hasTimeFreeze: boolean;
  hasAxe: boolean;
  unlockedSkins: string[];
  currentSkin: string;
}

export interface RankingEntry {
  name: string;
  score: number;
  isPlayer: boolean;
  skin?: string;
}