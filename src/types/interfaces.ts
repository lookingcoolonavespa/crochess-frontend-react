import { GameSeekInterface as GameSeek } from '@backend/interfaces';
import { DrawRecord } from '@backend/types';
import { GameState as FenState } from 'crochess-api/dist/types/interfaces';
import { Colors } from 'crochess-api/dist/types/types';
import { Dispatch, HTMLInputTypeAttribute, SetStateAction } from 'react';
import { HistoryArr, Move } from './types';

export interface Socket extends WebSocket {
  _transport: {
    url: string;
  };
}

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

export interface GameOverDetails {
  winner: Colors | null;
  result: 'mate' | 'draw' | 'time' | null;
}

export interface GameOverGameState extends GameStateSchema, GameOverDetails {}

export interface GameStateSchema {
  time_stamp_at_turn_start: number;
  fen: string;
  w_time: number;
  b_time: number;
  history: string | null;
  moves: string;
}
export interface GameSchema {
  w_id: string;
  b_id: string;
  time: number;
  increment: number;
  details: GameOverDetails;
  gameState: GameStateSchema;
  drawRecord: DrawRecord;
}

export interface GameStateClient
  extends Omit<FenState, 'halfmoves' | 'fullmoves'> {
  time: Record<Colors, number | null>;
  drawRecord: DrawRecord;
  gameOverDetails: GameOverDetails;
  history: HistoryArr;
  moves: Move[];
}

export interface UpdatedState
  extends Omit<GameStateClient, 'drawRecord' | 'gameOverDetails'> {}

export interface UpdatedGameOverGameState
  extends Omit<GameStateClient, 'drawRecord'> {}

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
