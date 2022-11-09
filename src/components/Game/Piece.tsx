import styles from '../../styles/Piece.module.scss';
import KingB from '../../public/icons/chess_pieces/king-b.svg';
import QueenB from '../../public/icons/chess_pieces/queen-b.svg';
import RookB from '../../public/icons/chess_pieces/rook-b.svg';
import BishopB from '../../public/icons/chess_pieces/bishop-b.svg';
import KnightB from '../../public/icons/chess_pieces/knight-b.svg';
import PawnB from '../../public/icons/chess_pieces/pawn-b.svg';
import KingW from '../../public/icons/chess_pieces/king-w.svg';
import QueenW from '../../public/icons/chess_pieces/queen-w.svg';
import RookW from '../../public/icons/chess_pieces/rook-w.svg';
import BishopW from '../../public/icons/chess_pieces/bishop-w.svg';
import KnightW from '../../public/icons/chess_pieces/knight-w.svg';
import PawnW from '../../public/icons/chess_pieces/pawn-w.svg';
import { Colors, PieceType, Square } from 'crochess-api/dist/types/types';

const piecesSVG = {
  w: {
    k: KingW,
    q: QueenW,
    r: RookW,
    b: BishopW,
    n: KnightW,
    p: PawnW,
  },
  b: {
    k: KingB,
    q: QueenB,
    r: RookB,
    b: BishopB,
    n: KnightB,
    p: PawnB,
  },
};

interface PieceProps {
  type: PieceType;
  color: Colors;
  square?: Square;
  onClick?: () => void;
}

export default function Piece({ type, color, square, onClick }: PieceProps) {
  return (
    <div
      className={`${styles.main} ${styles[type]} ${styles[color]}`}
      style={{ gridArea: square }}
      onClick={onClick}
    >
      <img src={piecesSVG[color][type]} alt={`${type} ${color}`} />
    </div>
  );
}
