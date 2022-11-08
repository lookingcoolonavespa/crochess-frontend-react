import {
  Board,
  Square,
  Colors,
  CastleRights,
  MoveNotationList,
  AllPieceMap,
  FenStr,
  SquareIdx,
} from 'crochess-api/dist/types/types';
import {
  GameType,
  ClaimDrawRecord,
  TimeDetails,
  GameOverDetails,
  Optional,
} from './types';
import { Dispatch, SetStateAction, HTMLInputTypeAttribute } from 'react';
import { GameState as FenState } from 'crochess-api/dist/types/interfaces';

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

// export interface ActiveGameInterface {
//   w: Player;
//   b: Player;
//   time: number;
//   increment: number;
//   turn: Colors;
//   turnStart: number;
// }

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

export interface GameState extends Omit<FenState, 'halfmoves' | 'fullmoves'> {
  time: Record<Colors, number | null>;
  claimDrawRecord: ClaimDrawRecord;
  gameOverDetails: GameOverDetails;
  moveList: MoveNotationList;
}

export interface FetchedState<
  T extends true | false,
  S extends number | undefined
> {
  turnStart: S;
  active: T;
  fen: FenStr;
  moveList: MoveNotationList;
  wTime: number;
  bTime: number;
}

export interface FetchedGameInterface {
  wId: string;
  bId: string;
  history: FenStr[];
  time: number;
  increment: number;
  state: FetchedState<true | false, number | undefined>;
  winner: Colors | null;
  causeOfDeath: string;
  claimDrawRecord: ClaimDrawRecord;
}

interface GameOver extends FetchedState<false, number> {
  gameOverDetails: Exclude<GameOverDetails, null>;
  claimDrawRecord?: ClaimDrawRecord;
}
interface GameActive extends FetchedState<true, number> {
  wTime: number;
  bTime: number;
  gameOverDetails?: null;
  claimDrawRecord?: ClaimDrawRecord;
}
export type UpdatedGameInterface = GameActive | GameOver;
export interface GameStatusInterface {
  type:
    | 'gameOver'
    | 'offeredDraw'
    | 'claimDraw'
    | 'offerDrawConfirmation'
    | 'resignConfirmation';
  payload: GameOverDetails | undefined;
  close: (() => void) | undefined;
}
