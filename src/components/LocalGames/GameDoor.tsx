import { useContext } from 'react';
import { UserContext } from '../../utils/contexts/UserContext';
import styles from '../../styles/GameDoor.module.scss';
import { GameSeekInterface } from '../../types/interfaces';
import { fromMillisecondsToMinutes } from '../../utils/timerStuff';
import { createGame } from '../../utils/game';

interface GameDoorProps {
  gameSeek: GameSeekInterface;
}

export default function GameDoor({ gameSeek }: GameDoorProps) {
  const { user } = useContext(UserContext);

  const rootClasses = [
    styles.main,
    'foreground',
    'hover-highlight',
    'space-evenly',
  ];
  if (gameSeek.seeker === user) rootClasses.push(styles.my_seek);

  return (
    <div
      className={rootClasses.join(' ')}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await createGame(user, gameSeek);
        } catch (err) {
          console.log(err);
        }
      }}
    >
      {[
        gameSeek.color,
        `${fromMillisecondsToMinutes(gameSeek.time)}+${gameSeek.increment}`,
        gameSeek.gameType,
      ].map((t, i) => (
        <p key={i} className="text-center">
          {t}
        </p>
      ))}
    </div>
  );
}
