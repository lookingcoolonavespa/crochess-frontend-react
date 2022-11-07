import React, { MouseEvent } from 'react';
import { Square } from 'crochess-api/dist/types/types';
import Piece from './Piece';
import { PieceType } from '../../types/types';
import styles from '../../styles/Promotion.module.scss';

interface PromotionProps {
  onPromote: (e: MouseEvent<HTMLDivElement>) => void;
  square: Square;
  view: Colors;
}

export default function Promotion({ onPromote, square, view }: PromotionProps) {
  const promotePieces: PieceType[] = ['queen', 'rook', 'knight', 'bishop'];
  const color = square[1] === '8' ? 'white' : 'black';
  const positioning: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  } = view === 'white' ? { left: '100%' } : { right: '100%' };
  if (color === 'white') {
    if (view === 'black') positioning.bottom = '0';
  } else {
    if (view === 'white') positioning.bottom = '0';
  }
  return (
    <div className={styles.main} style={positioning}>
      {promotePieces.map((p, i) => {
        return (
          <div
            className={styles['piece-wrapper'] + ' hover-highlight'}
            key={i}
            onClick={onPromote}
            data-piece={p}
          >
            <Piece color={color} type={p} />
          </div>
        );
      })}
    </div>
  );
}
