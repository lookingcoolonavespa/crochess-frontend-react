import { HistoryType } from 'crochess-api/dist/types/types';
import useScrollOnLoad from '../../utils/hooks/useScrollToBottom';

interface HistoryDisplayProps {
  moves: HistoryType;
  styles: { [key: string]: string };
}

export default function HistoryDisplay({ moves, styles }: HistoryDisplayProps) {
  const { scrollEndRef } = useScrollOnLoad(moves);

  return (
    <div className={styles.moves_ctn}>
      <ol>
        {moves &&
          moves.map((pair, i) => {
            const [whiteMove, blackMove] = pair;

            return (
              <li key={i} className={styles.list_item}>
                <p className={styles.move_no}>{i + 1}</p>
                <div className={styles.moves_wrapper}>
                  <p>{whiteMove}</p>
                  {blackMove && <p>{blackMove}</p>}
                </div>
              </li>
            );
          })}
      </ol>
      <span ref={scrollEndRef}></span>
    </div>
  );
}
