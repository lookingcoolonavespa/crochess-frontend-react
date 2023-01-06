import {
  PromotePieceType,
  Square,
  Colors,
  Board,
  SquareIdx,
  PieceType,
} from 'crochess-api/dist/types/types';
import { isPromote } from 'crochess-api';
import { convertIdxToSquare } from 'crochess-api/dist/utils/square';

import React, { useState } from 'react';
import styles from '../../styles/Gameboard.module.scss';
import Piece from './Piece';
import Promotion from './Promotion';

const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const rows = [1, 2, 3, 4, 5, 6, 7, 8];
const squares: Square[] = cols.reduce((acc: Square[], curr) => {
  rows.forEach((r) => acc.push((curr + r) as Square));
  return acc;
}, []);

interface GameboardProps {
  view: Colors;
  board: Board;
  makeMove: (square: Square, promote?: PromotePieceType) => void;
  squareToMove: Square | null;
  setSquareToMove: React.Dispatch<React.SetStateAction<Square | null>>;
  getLegalMoves: (square: Square) => Square[] | undefined;
  activePlayer: Colors | null;
  validateMove: (square: Square) => boolean;
}

export default React.memo(function Gameboard({
  view,
  board,
  makeMove,
  squareToMove,
  setSquareToMove,
  getLegalMoves,
  activePlayer,
  validateMove,
}: GameboardProps) {
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [promotePopupSquare, setPromotePopupSquare] = useState<Square | null>(
    null
  );

  function resetSquareToMove() {
    setSquareToMove(null);
    setHighlightedSquares([]);
  }
  return (
    <div className={`${styles.main} ${styles[view]}`}>
      {squares.map((s, i) => {
        const [col, row] = s.split('');

        // board needs to be flipped for black
        const evenColumn = cols.indexOf(col) % 2 === 0;
        const startRow = view === 'w' ? row === '1' : row === '8';
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
              resetSquareToMove();
              makeMove(s);
            }}
          >
            {startRow && <div className={`${styles.file} label`}>{col}</div>}
            {endCol && <div className={`${styles.rank} label`}>{row}</div>}
            {promotePopupSquare === s && (
              <Promotion
                onPromote={(e) => {
                  e.stopPropagation();
                  const pieceSelectNode = e.currentTarget as HTMLElement;

                  makeMove(
                    promotePopupSquare as Square,
                    pieceSelectNode.dataset.piece as PromotePieceType
                  );
                  setPromotePopupSquare(null);
                  resetSquareToMove();
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
        board &&
          board.reduce<JSX.Element[]>((acc, p, i) => {
            const square = convertIdxToSquare(i as SquareIdx);
            if (!p) return acc;
            acc.push(
              <Piece
                key={i}
                color={p[0] as Colors}
                square={square}
                type={p[1] as PieceType}
                onClick={
                  !promotePopupSquare
                    ? () => {
                        if (activePlayer !== null && p[0] !== activePlayer) {
                          // if player is not spectator and piece doesnt belong to active player
                          if (!squareToMove) return; // means its not a capture

                          if (validateMove(square) && isPromote(p, square))
                            return setPromotePopupSquare(square);

                          resetSquareToMove();
                          makeMove(square);
                          return;
                        }

                        if (square === squareToMove) {
                          resetSquareToMove();
                        } else {
                          // display legal moves
                          setSquareToMove(square);
                          setHighlightedSquares(getLegalMoves(square) || []);
                        }
                      }
                    : undefined
                }
              />
            );
            return acc;
          }, [])
      }
    </div>
  );
});
