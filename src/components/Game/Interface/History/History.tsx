import React from 'react';

import Controls from './Controls';
import { createControlBtnObj } from '../../../../utils/misc';
import rewindIcon from '../../../../icons/rewind-fill.svg';
import speedIcon from '../../../../icons/speed-fill.svg';
import backIcon from '../../../../icons/skip-back-fill.svg';
import forwardIcon from '../../../../icons/skip-forward-fill.svg';
import flipIcon from '../../../../icons/flip-2.svg';

import styles from '../../../../styles/History.module.scss';
import Display from './Display';
import { HistoryArr } from '../../../../types/types';

interface HistoryProps {
  moveList: HistoryArr;
  controls: {
    goBackToStart: () => void;
    goBackOneMove: () => void;
    goForwardOneMove: () => void;
    goToCurrentMove: () => void;
  };
  flipBoard: () => void;
}

export default function History({
  moveList,
  controls,
  flipBoard,
}: HistoryProps) {
  return (
    <section className={styles.main}>
      <Controls
        className={styles['controls-ctn']}
        list={[
          createControlBtnObj(flipIcon, 'flip board', undefined, flipBoard),
          createControlBtnObj(
            rewindIcon,
            'go to start of game',
            undefined,
            controls.goBackToStart
          ),
          createControlBtnObj(
            backIcon,
            'last move',
            undefined,
            controls.goBackOneMove
          ),
          createControlBtnObj(
            forwardIcon,
            'next move',
            undefined,
            controls.goForwardOneMove
          ),
          createControlBtnObj(
            speedIcon,
            'go to end/current move',
            undefined,
            controls.goToCurrentMove
          ),
        ]}
      />
      <Display list={moveList} styles={styles} />
    </section>
  );
}

export const MemoizedHistory = React.memo(History);
