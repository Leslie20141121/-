export type GameMode = 'classic' | 'time';

export interface BlockData {
  id: string;
  value: number;
  row: number;
  col: number;
  isRemoving?: boolean;
}

export interface GameState {
  blocks: BlockData[];
  targetSum: number;
  currentSum: number;
  selectedIds: string[];
  score: number;
  level: number;
  isGameOver: boolean;
  mode: GameMode;
  timeLeft: number;
  status: 'menu' | 'playing' | 'gameover';
}
