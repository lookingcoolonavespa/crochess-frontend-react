import { Moves, Square } from 'crochess-api/dist/types/types';

import React, { useState, MouseEvent } from 'react';
import styles from '../../styles/Gameboard.module.scss';
import { PiecePos } from '../../types/types';
import Piece from './Piece';
import Promotion from './Promotion';

const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const rows = [1, 2, 3, 4, 5, 6, 7, 8];
const squares: string[] = cols.reduce((acc: string[], curr) => {
  rows.forEach((r) => acc.push(curr + r));
  return acc;
}, []);

interface GameboardProps {
  view: Colors;
  piecePos: PiecePos[];
  makeMove: (square: Square) => void;
  pieceToMove: Square | null;
  setPieceToMove: React.Dispatch<React.SetStateAction<Square | null>>;
  getLegalMoves: (square: Square) => Moves;
  activePlayer: Colors | null;
  checkPromotion: (square: Square) => boolean;
  promotePopupSquare: Square | null;
  setPromotePopupSquare: React.Dispatch<React.SetStateAction<Square | null>>;
  onPromote: (e: MouseEvent<HTMLDivElement>) => void;
}

export default React.memo(function Gameboard({
  view,
  piecePos,
  makeMove,
  pieceToMove,
  setPieceToMove,
  getLegalMoves,
  activePlayer,
  checkPromotion,
  promotePopupSquare,
  setPromotePopupSquare,
  onPromote,
}: GameboardProps) {
  const [highlightedSquares, setHighlightedSquares] = useState<Moves>([]);

  function resetPieceToMove() {
    setPieceToMove(null);
    setHighlightedSquares([]);
  }
  return (
    <div className={`${styles.main} ${styles[view]}`}>
      {squares.map((s, i) => {
        const [col, row] = s.split('');

        // board needs to be flipped for black
        const evenColumn = cols.indexOf(col) % 2 === 0;
        const startRow = view === 'white' ? row === '1' : row === '8';
        const endCol = col === 'h';

        const classNames = [styles.boardSquare];
        if (evenColumn) classNames.push(styles['col-even']);
        else classNames.push(styles['col-odd']);
        if (highlightedSquares.includes(s)) classNames.push(styles.active);

        return (
          <div
            key={i}
            className={classNames.join(' ')}
            style={{
              gridArea: s,
            }}
            onClick={() => {
              resetPieceToMove();
              makeMove(s);
            }}
          >
            {startRow && <div className={`${styles.file} label`}>{col}</div>}
            {endCol && <div className={`${styles.rank} label`}>{row}</div>}
            {promotePopupSquare === s && (
              <Promotion
                onPromote={(e) => {
                  onPromote(e);
                  resetPieceToMove();
                }}
                square={promotePopupSquare}
                view={view}
              />
            )}
          </div>
        );
      })}
      {
        // pieces
        piecePos &&
          piecePos.map((p, i) => {
            return (
              <Piece
                key={i}
                color={p.color}
                square={p.square}
                type={p.piece}
                onClick={
                  !promotePopupSquare
                    ? () => {
                        if (activePlayer !== null && p.color !== activePlayer) {
                          // if player is not spectator and piece doesnt belong to active player
                          if (!pieceToMove) return; // means its not a capture

                          if (checkPromotion(p.square))
                            return setPromotePopupSquare(p.square);

                          resetPieceToMove();
                          makeMove(p.square);
                          return;
                        }

                        if (p.square === pieceToMove) {
                          resetPieceToMove();
                        } else {
                          // display legal moves
                          setPieceToMove(p.square);
                          setHighlightedSquares(getLegalMoves(p.square));
                        }
                      }
                    : undefined
                }
              />
            );
          })
      }
    </div>
  );
});
