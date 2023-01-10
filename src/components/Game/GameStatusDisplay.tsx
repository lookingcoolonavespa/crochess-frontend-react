import React, { useContext } from 'react';

import closeSVG from '../../icons/close-line.svg';
import checkSVG from '../../icons/check-line.svg';
import { GameStatusInterface } from '../../types/interfaces';
import IconBtn from '../IconBtn';
import FlatBtn from '../FlatBtn';
import { resign, claimDraw, offerDraw, denyDraw } from '../../utils/game';
import { SetStateAction } from 'react';
import { parseCookies } from '../../utils/misc';
import { Colors } from 'crochess-api/dist/types/types';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../utils/contexts/UserContext';

interface GameStatusDisplayProps {
  styles: { [key: string]: string };
  setStatus: React.Dispatch<SetStateAction<GameStatusInterface | undefined>>;
  status: GameStatusInterface;
  activePlayer: Colors;
}

export default function GameStatusDisplay({
  setStatus,
  styles,
  status,
  activePlayer,
}: GameStatusDisplayProps) {
  const { socket, user } = useContext(UserContext);
  const { gameId } = useParams();

  const playerId = parseCookies(document.cookie)[`${gameId}(${activePlayer})`];

  return (
    <div className={styles.game_over_display}>
      <IconBtn
        className="close-btn"
        icon={closeSVG}
        altText="hide game over message"
        onClick={status.close || (() => setStatus(undefined))}
      />
      <div>
        {status &&
          {
            gameOver: (
              <>
                {status.payload && (
                  <>
                    <p>Game over</p>
                    {status.payload.winner && (
                      <p>
                        {status.payload.winner === 'w' ? 'White' : 'Black'} won
                        by {status.payload.result}
                      </p>
                    )}
                    {!status.payload.winner && <p>Game is a draw</p>}
                  </>
                )}
              </>
            ),
            resignConfirmation: (
              <>
                <p>Are you sure you want to resign?</p>
                <div className={styles.btn_ctn}>
                  <FlatBtn
                    icon={{ src: closeSVG, alt: 'cancel' }}
                    size="small"
                    onClick={status.close}
                  />
                  <FlatBtn
                    icon={{ src: checkSVG, alt: 'confirm' }}
                    size="small"
                    onClick={() => {
                      try {
                        resign();
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  />
                </div>
              </>
            ),
            claimDraw: (
              <>
                <p>Claim draw?</p>
                <div className={styles.btn_ctn}>
                  <FlatBtn
                    icon={{ src: closeSVG, alt: 'cancel' }}
                    size="small"
                    onClick={() => {
                      try {
                        denyDraw(socket!, gameId!);
                        setStatus(undefined);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  />
                  <FlatBtn
                    icon={{ src: checkSVG, alt: 'confirm' }}
                    size="small"
                    onClick={() => {
                      try {
                        claimDraw(socket!, gameId!);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  />
                </div>
              </>
            ),
            offeredDraw: <p>You have offered a draw</p>,
            offerDrawConfirmation: (
              <>
                <p>Are you sure you want to offer a draw?</p>
                <div className={styles.btn_ctn}>
                  <FlatBtn
                    icon={{ src: closeSVG, alt: 'cancel' }}
                    size="small"
                    onClick={status.close}
                  />
                  <FlatBtn
                    icon={{ src: checkSVG, alt: 'confirm' }}
                    size="small"
                    onClick={() => {
                      try {
                        offerDraw(socket!, gameId!, activePlayer);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  />
                </div>
              </>
            ),
          }[status.type]}
      </div>
    </div>
  );
}

export const MemoizedGameStatusDisplay = React.memo(GameStatusDisplay);
