import React, { MouseEvent } from 'react';
import { Square } from 'crochess-api/dist/types/types';
import Piece from './Piece';
import styles from '../../styles/Promotion.module.scss';
import { PromotePieceType, Colors } from 'crochess-api/dist/types/types';

interface PromotionProps {
  onPromote: (e: MouseEvent<HTMLDivElement>) => void;
  square: Square;
  view: Colors;
}

export default function Promotion({ onPromote, square, view }: PromotionProps) {
  const promotePieces: PromotePieceType[] = ['q', 'r', 'n', 'b'];
  const color = square[1] === '8' ? 'w' : 'b';
  const positioning: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  } = view === 'w' ? { left: '100%' } : { right: '100%' };
  if (color === 'w') {
    if (view === 'b') positioning.bottom = '0';
  } else {
    if (view === 'w') positioning.bottom = '0';
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
