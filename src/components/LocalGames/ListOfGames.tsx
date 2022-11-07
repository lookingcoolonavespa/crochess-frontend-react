import { useContext } from 'react';
import GameDoor from './GameDoor';

import useListOfGames from '../../utils/hooks/useListOfGames';

import styles from '../../styles/ListOfGames.module.scss';
import { UserContext } from '../../utils/contexts/UserContext';

interface ListOfGamesProps {
  active: boolean;
}

export default function ListOfGames({ active }: ListOfGamesProps) {
  const { listOfGames } = useListOfGames(useContext(UserContext).socket);

  const rootClasses = [styles.main];
  if (!active) rootClasses.push('inactive');

  return (
    <div className={rootClasses.join(' ')}>
      <header className="section-header">
        <ul className="space-evenly">
          {['Color', 'Time Control', 'Game Type'].map((t, i) => (
            <li key={i} className="text-center">
              {t}
            </li>
          ))}
        </ul>
      </header>
      <section className={styles['game_door-ctn']}>
        <div className="scroller">
          {listOfGames.map((gs) => (
            <GameDoor key={gs._id} gameSeek={gs} />
          ))}
        </div>
      </section>
    </div>
  );
}
