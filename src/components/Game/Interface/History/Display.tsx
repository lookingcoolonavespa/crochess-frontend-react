import { HistoryArr } from '../../../../types/types';
import useScrollOnLoad from '../../../../utils/hooks/useScrollToBottom';

interface HistoryDisplayProps {
  list: HistoryArr;
  styles: { [key: string]: string };
}

export default function Display({ list, styles }: HistoryDisplayProps) {
  const { scrollEndRef } = useScrollOnLoad(list);

  return (
    <div className={styles.moves_ctn}>
      <ol>
        {list &&
          list.map((move, i) => {
            const [wMove, bMove] = move;
            return (
              <li key={i} className={styles.list_item}>
                <p className={styles.move_no}>{i + 1}</p>
                <div className={styles.moves_wrapper}>
                  <p>{wMove}</p>
                  {bMove && <p>{bMove}</p>}
                </div>
              </li>
            );
          })}
      </ol>
      <span ref={scrollEndRef}></span>
    </div>
  );
}
