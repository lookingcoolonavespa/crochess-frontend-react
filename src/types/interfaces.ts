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
  GameState as FetchedState,
  GameSeekInterface as GameSeek,
} from '@backend/interfaces';
import { GameType, ClaimDrawRecord } from '@backend/types';
import { TimeDetails, GameOverDetails, Optional } from './types';
import { Dispatch, SetStateAction, HTMLInputTypeAttribute } from 'react';
import { GameState as FenState } from 'crochess-api/dist/types/interfaces';

export interface GameSeekInterface extends GameSeek {
  id: number;
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
