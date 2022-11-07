import {
  Board,
  Square,
  Colors,
  CastleRights,
  MoveNotationList,
  AllPieceMap,
  FenStr,
} from 'crochess-api/dist/types/types';
import {
  GameType,
  ClaimDrawRecord,
  TimeDetails,
  GameOverDetails,
} from './types';
import { Dispatch, SetStateAction, HTMLInputTypeAttribute } from 'react';

export interface GameSeekInterface {
  color: Colors | 'random';
  time: number;
  increment: number;
  gameType: GameType;
  seeker: string;
  _id: string;
}

export interface TimeObjInterface {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export interface ControlBtnObj {
  src?: string;
  alt?: string;
  text?: string;
  onClick?: () => void;
  className?: string;
}

interface Player {
  player: string;
  timeLeft: number;
}
export interface ActiveGameInterface {
  w: Player;
  b: Player;
  // board: Board;
  // scoreSheet: string[];
  time: number;
  increment: number;
  turn: Colors;
  turnStart: number;
}

export interface FormProps {
  fields: FieldsInterface[];
  inputValues: { [key: string]: string | number };
  actionBtnText?: string;
  noCancelBtn: boolean;
  cancelBtnText?: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  submitAction: (() => Promise<void>) | (() => void);
  cleanUp?: () => void;
  close: () => void;
  setError: Dispatch<SetStateAction<string>>;
}

export interface SelectOptionsInterface {
  value: string;
  display?: string;
}

export interface FieldsInterface {
  label: string;
  name: string;
  type: HTMLInputTypeAttribute | 'dropdown' | 'radioList';
  defaultValue?: string | number;
  options?: { value: string; display?: string }[];
  unitsDisplay?: {
    label?: string;
    name?: string;
    type?: 'text' | 'dropdown';
    options?: SelectOptionsInterface[];
  };
}

export interface GameState {
  time: Record<Colors, number>;
  turn: Colors;
  fen: FenStr;
  claimDrawRecord: ClaimDrawRecord;
  gameOver: GameOverDetails;
  moveList: MoveNotationList;
}

export interface GameInterface {
  w: Player;
  b: Player;
  board: Board;
  checks: Square[];
  castle: Record<Colors, CastleRights>;
  history: MoveNotationList;
  time: number;
  increment: number;
  turn: Colors;
  turnStart?: number;
  active: boolean;
  winner: Colors | null;
  causeOfDeath: string;
  claimDraw: ClaimDrawRecord;
}

export interface FetchGameStateUpdaters {
  setGameOverDetails: React.Dispatch<
    React.SetStateAction<
      | {
          winner: Colors | null;
          reason: string;
        }
      | undefined
    >
  >;

  setGameboardView: React.Dispatch<React.SetStateAction<Colors>>;
  setBoardState: React.Dispatch<
    React.SetStateAction<{
      board: Board;
      checks: Square[];
      castleRights: Record<Colors, CastleRights>;
    }>
  >;
  setMoveHistory: React.Dispatch<React.SetStateAction<string[][]>>;
  setWhiteTime: React.Dispatch<React.SetStateAction<number>>;
  setBlackTime: React.Dispatch<React.SetStateAction<number>>;
  setCurrentPieceMapIdx: React.Dispatch<React.SetStateAction<number>>;
  setClaimDrawRecord: React.Dispatch<React.SetStateAction<ClaimDrawRecord>>;
  setTurn: React.Dispatch<React.SetStateAction<Colors>>;
}

export interface FetchGameGameDetails {
  timeDetails: TimeDetails;
  activePlayerRef: React.MutableRefObject<Colors | null>;
  maxTimeRef: React.MutableRefObject<number>;
}

export interface UpdateGameGameDetails {
  timeDetailsRef: React.MutableRefObject<{
    white: {
      startTime: number;
      turnStart: number;
    };
    black: {
      startTime: number;
      turnStart: number;
    };
    maxTime: number;
  }>;
  pieceMapsRef: React.MutableRefObject<AllPieceMap[]>;
}

export interface UpdateGameStateUpdaters {
  setGameOverDetails: React.Dispatch<
    React.SetStateAction<
      | {
          winner: Colors | null;
          reason: string;
        }
      | undefined
    >
  >;
  setBoardState: React.Dispatch<
    React.SetStateAction<{
      board: Board;
      checks: Square[];
      castleRights: Record<Colors, CastleRights>;
    }>
  >;
  setMoveHistory: React.Dispatch<React.SetStateAction<string[][]>>;
  setWhiteTime: React.Dispatch<React.SetStateAction<number>>;
  setBlackTime: React.Dispatch<React.SetStateAction<number>>;
  setCurrentPieceMapIdx: React.Dispatch<React.SetStateAction<number>>;
  setClaimDrawRecord: React.Dispatch<React.SetStateAction<ClaimDrawRecord>>;
  setTurn: React.Dispatch<React.SetStateAction<Colors>>;
}

export interface GameStatusInterface {
  type:
    | 'gameOver'
    | 'offeredDraw'
    | 'claimDraw'
    | 'offerDrawConfirmation'
    | 'resignConfirmation';
  payload: GameOverDetailsInterface | undefined;
  close: (() => void) | undefined;
}
