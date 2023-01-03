import { Colors } from 'crochess-api/dist/types/types';
import { GameState } from './interfaces';

export type seekColor = Colors | 'random';

export type GameOverDetails = {
  winner: Colors | null;
  reason: string;
} | null;

export type TimeDetails = Record<
  Colors,
  {
    timeLeftAtTurnStart: number;
    stampAtTurnStart: number;
  }
>;

export type AllTimes = Record<Colors, number>;

export type ReducerActions =
  | {
      type: 'update on load/move';
      payload: GameState;
    }
  | {
      type: 'update time';
      payload: {
        color: Colors;
        time: number;
      };
    };

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
