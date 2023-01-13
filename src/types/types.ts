import { DrawRecord } from '@backend/types';
import {
  Colors,
  MoveNotation,
  PromotePieceType,
  Square,
  Tuple,
} from 'crochess-api/dist/types/types';
import {
  GameStateClient,
  UpdatedGameOverGameState,
  UpdatedState,
} from './interfaces';

export type seekColor = Colors | 'random';

export type TimeDetails = Record<
  Colors,
  {
    timeLeftAtTurnStart: number;
    stampAtTurnStart: number;
  }
>;

export type AllTimes = Record<Colors, number>;

export type Time = {
  color: Colors;
  time: number;
};

export type Move =
  | `${Square}${Square}`
  | `${Square}${Square}${PromotePieceType}`;

export type ReducerActions =
  | {
      type: 'init';
      payload: GameStateClient;
    }
  | {
      type: 'update on move';
      payload: UpdatedState;
    }
  | {
      type: 'game over';
      payload: UpdatedGameOverGameState;
    }
  | {
      type: 'update draw';
      payload: DrawRecord;
    }
  | {
      type: 'update time';
      payload: Time;
    };

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export type HistoryArr = Tuple<MoveNotation, 2>[];
