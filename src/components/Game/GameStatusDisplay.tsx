import React from 'react';

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

interface GameStatusDisplayProps {
  styles: { [key: string]: string };
  setStatus: React.Dispatch<SetStateAction<GameStatusInterface | undefined>>;
  status: GameStatusInterface;
  activePlayer: Colors;
}

async function asyncErrorHandler(
  cb:
    | ((gameId: string, playerId: string) => Promise<void>)
    | ((
        gameId: string,
        playerId: string,
        activePlayer: Colors
      ) => Promise<void>),
  params: {
    gameId: string;
    playerId: string;
    activePlayer?: Colors;
  },
  close?: () => void
) {
  const { gameId, playerId, activePlayer } = params;
  try {
    await cb(gameId, playerId, activePlayer as Colors);
    close && close();
  } catch (err) {
    console.log(err);
  }
}

export default function GameStatusDisplay({
  setStatus,
  styles,
  status,
  activePlayer,
}: GameStatusDisplayProps) {
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
                        {status.payload.winner} won by {status.payload.reason}
                      </p>
                    )}
                    {!status.payload.winner && (
                      <p>Draw by {status.payload.reason}</p>
                    )}
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
                    onClick={() =>
                      asyncErrorHandler(resign, {
                        activePlayer,
                        playerId,
                        gameId: gameId as string,
                      })
                    }
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
                      asyncErrorHandler(
                        denyDraw,
                        { playerId, gameId: gameId as string },
                        () => setStatus(undefined)
                      );
                    }}
                  />
                  <FlatBtn
                    icon={{ src: checkSVG, alt: 'confirm' }}
                    size="small"
                    onClick={() => {
                      asyncErrorHandler(claimDraw, {
                        playerId,
                        gameId: gameId as string,
                      });
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
                      asyncErrorHandler(offerDraw, {
                        playerId,
                        activePlayer,
                        gameId: gameId as string,
                      });
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
