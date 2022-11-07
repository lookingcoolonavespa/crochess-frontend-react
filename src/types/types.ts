import {
  Colors,
  PieceType,
  Square,
  FenStr,
  MoveNotationList,
} from 'crochess-api/dist/types/types';
import { GameState } from './interfaces';

export type GameType = 'blitz' | 'bullet' | 'rapid' | 'classical';

export type ColorOptions = Colors | 'random';

export type PiecePos = {
  piece: PieceType;
  square: Square;
  color: Colors;
};

export type ClaimDrawRecord = Record<Colors, boolean>;

export type GameOverDetails = {
  winner: Colors;
  reason: string;
} | null;

export type TimeDetails = Record<
  Colors,
  {
    timeAtTurnStart: number;
    stampAtTurnStart: number;
  }
>;

export type ReducerActions =
  | {
      type: 'update on load/move';
      payload: {
        fen: FenStr;
        turn: Colors;
        claimDrawRecord: ClaimDrawRecord;
        moveList: MoveNotationList;
        time: Record<Colors, number>;
        gameOver: GameOverDetails;
      };
    }
  | {
      type: 'update time';
      payload: {
        color: Colors;
        time: number;
      };
    };
export type GameStateReducer = (s: GameState, a: ReducerActions) => GameState;
