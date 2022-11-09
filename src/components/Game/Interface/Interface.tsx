import { useState, useEffect, useRef, useMemo } from 'react';
import { MemoizedControls } from './MoveList/Controls';
import Timer, { TimerProps } from './Timer';
import { MemoizedMoveList } from './MoveList/MoveList';
import styles from '../../../styles/GameInterface.module.scss';
import { createControlBtnObj } from '../../../utils/misc';
import flagIcon from '../../../icons/flag-fill.svg';
import TimerBar from './TimerBar';
import { MemoizedGameStatusDisplay } from '../GameStatusDisplay';
import { GameOverDetails } from '../../../types/types';
import { Colors, MoveNotationList } from 'crochess-api/dist/types/types';

interface InterfaceProps {
  activePlayer: Colors | null;
  whiteDetails: TimeDetails;
  blackDetails: TimeDetails;
  moveList: MoveNotationList;
  moveListControls: {
    goBackToStart: () => void;
    goBackOneMove: () => void;
    goForwardOneMove: () => void;
    goToCurrentMove: () => void;
  };
  view: Colors;
  flipBoard: () => void;
  gameOverDetails?: GameOverDetails;
  offeredDraw: boolean;
  claimDraw: boolean;
}

interface TimeDetails extends Omit<TimerProps, 'className'> {
  maxTime: number;
}

export default function Interface({
  activePlayer,
  whiteDetails,
  blackDetails,
  view,
  flipBoard,
  moveList,
  moveListControls,
  gameOverDetails,
  offeredDraw,
  claimDraw,
}: InterfaceProps) {
  const [status, setStatus] = useState<{
    type:
      | 'gameOver'
      | 'offeredDraw'
      | 'claimDraw'
      | 'offerDrawConfirmation'
      | 'resignConfirmation';
    payload: GameOverDetails | undefined;
    close: (() => void) | undefined;
  }>();
  const [resignConfirmation, setResignConfirmation] = useState(false);
  const [offerDrawConfirmation, setOfferDrawConfirmation] = useState(false);

  const oldVariablesRef = useRef({
    gameOver: !!gameOverDetails,
    offeredDraw,
    claimDraw,
    resignConfirmation,
    offerDrawConfirmation,
  });
  useEffect(() => {
    const currentVariables = {
      gameOver: !!gameOverDetails,
      offeredDraw,
      claimDraw,
      resignConfirmation,
      offerDrawConfirmation,
    };

    function getChangedVariableThatsTruthy() {
      let key: keyof typeof oldVariablesRef.current;
      for (key in oldVariablesRef.current) {
        if (oldVariablesRef.current[key] === currentVariables[key]) continue;
        if (!currentVariables[key]) continue;
        return key;
      }
    }
    const statusType = getChangedVariableThatsTruthy();

    oldVariablesRef.current = currentVariables; // need to update before function exits

    if (!statusType) return setStatus(undefined);
    if (!activePlayer && statusType !== 'gameOver') {
      return;
    }

    let close;
    switch (statusType) {
      case 'resignConfirmation':
        close = cancelResign;
        break;
      case 'offerDrawConfirmation':
        close = cancelDraw;
        break;
    }

    setStatus({
      close,
      type: statusType,
      payload: statusType === 'gameOver' ? gameOverDetails : undefined,
    });
  }, [
    gameOverDetails,
    resignConfirmation,
    offerDrawConfirmation,
    claimDraw,
    offeredDraw,
    activePlayer,
  ]);

  useEffect(() => {});

  const topTimer = view === 'w' ? blackDetails : whiteDetails;
  const bottomTimer = view === 'w' ? whiteDetails : blackDetails;

  function resign() {
    setResignConfirmation(true);
  }
  function cancelResign() {
    setResignConfirmation(false);
  }

  function offerDraw() {
    setOfferDrawConfirmation(true);
  }
  function cancelDraw() {
    setOfferDrawConfirmation(false);
  }

  const mainControls = useMemo(
    () => [
      createControlBtnObj(
        undefined,
        'offer a draw',
        '1/2',
        offerDraw,
        offeredDraw ? 'background-action-secondary no_events' : ''
      ),
      createControlBtnObj(flagIcon, 'resign game', undefined, resign),
    ],
    [offeredDraw]
  );

  return (
    <div className={styles.main}>
      <Timer className={`${styles.timer} ${styles.top}`} {...topTimer} />
      <TimerBar maxTime={topTimer.maxTime} time={topTimer.time} />
      <div>
        {status && (
          <MemoizedGameStatusDisplay
            setStatus={setStatus}
            styles={styles}
            status={status}
            activePlayer={activePlayer as Colors}
          />
        )}
        <MemoizedMoveList
          moveList={moveList}
          flipBoard={flipBoard}
          controls={moveListControls}
        />
      </div>
      {activePlayer && !gameOverDetails && (
        <MemoizedControls
          className={styles.main_controls}
          list={mainControls}
        />
      )}
      <TimerBar maxTime={bottomTimer.maxTime} time={bottomTimer.time} />
      <Timer className={`${styles.timer} ${styles.bottom}`} {...bottomTimer} />
    </div>
  );
}
