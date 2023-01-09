import { useState, useContext } from 'react';
import { createGameSeek } from '../../utils/game';

import TimeControlButton from './TimeControlButton';
import styles from '../../styles/GameGrid.module.scss';
import timeControls from '../../utils/timeControls';
import { UserContext } from '../../utils/contexts/UserContext';
import { toMilliseconds } from '../../utils/timerStuff';

interface GameGridProps {
  active: boolean;
  className?: string;
  createCustomGame: () => void;
}

const GameGrid = ({ active, className, createCustomGame }: GameGridProps) => {
  const [activeSearch, setActiveSearch] = useState<null | number>(null);
  const { user, socket } = useContext(UserContext);

  const rootClasses = [styles.main, 'foreground'];
  if (className) rootClasses.push(className);
  if (!active) rootClasses.push('inactive');

  return (
    <div className={rootClasses.join(' ')}>
      {timeControls.map((tc, i) => {
        let className;
        if (typeof activeSearch === 'number') {
          className = activeSearch === i ? 'searching' : 'passive';
        }
        return (
          <TimeControlButton
            key={i}
            time={tc.time}
            increment={tc.increment}
            type={tc.type}
            className={styles['tc-btn'] + ' ' + (className || '')}
            search={activeSearch === i}
            onClick={() => {
              if (
                typeof tc.time !== 'number' ||
                typeof tc.increment !== 'number' ||
                tc.type === 'custom'
              ) {
                createCustomGame();
                return;
              }
              setActiveSearch(i);
              const time = toMilliseconds({ minutes: tc.time });
              try {
                if (!user) return;
                createGameSeek(socket!, time, tc.increment, 'random', user);
              } catch (err) {
                console.log(err);
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default GameGrid;
