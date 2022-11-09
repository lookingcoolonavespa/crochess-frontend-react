import React from 'react';

import Controls from './Controls';
import { createControlBtnObj } from '../../../../utils/misc';
import rewindIcon from '../../../../../public/icons/rewind-fill.svg';
import speedIcon from '../../public/icons/speed-fill.svg';
import backIcon from '../../public/icons/skip-back-fill.svg';
import forwardIcon from '../../public/icons/skip-forward-fill.svg';
import flipIcon from '../../public/icons/flip-2.svg';

import styles from '../../styles/History.module.scss';
import Display from './Display';
import { MoveNotationList } from 'crochess-api/dist/types/types';

interface MoveListProps {
  moveList: MoveNotationList;
  controls: {
    goBackToStart: () => void;
    goBackOneMove: () => void;
    goForwardOneMove: () => void;
    goToCurrentMove: () => void;
  };
  flipBoard: () => void;
}

export default function MoveList({
  moveList,
  controls,
  flipBoard,
}: MoveListProps) {
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

export const MemoizedMoveList = React.memo(MoveList);
