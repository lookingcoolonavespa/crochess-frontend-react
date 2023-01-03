import { useState, useRef, useEffect } from 'react';
import { UserContext } from '../utils/contexts/UserContext';

import Layout from '../components/Layout';
import GameGrid from '../components/CreateGame/GameGrid';
import ListOfGames from '../components/LocalGames/ListOfGames';

import styles from '../styles/Home.module.scss';

import Popup from '../components/Popup';
import useInputValues from '../utils/hooks/useInputValues';
import { createGameSeek } from '../utils/game';
import Modal from '../components/Modal';
import { toMilliseconds } from '../utils/timerStuff';
import { getGameType } from '../utils/misc';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { seekColor } from '../types/types';
import useConnectToSocket from '../utils/hooks/useConnectToSocket';

const Home = () => {
  const [user, setUser] = useState<undefined | number>();
  const [popup, setPopup] = useState(false);
  const [error, setError] = useState<string>('');
  const {
    inputValues: popupInputValues,
    handleInputChange,
    handleSelectChange,
    resetInputValues,
  } = useInputValues<{
    increment: number;
    time_unit: 'seconds' | 'minutes' | 'hours';
    color: seekColor;
    time: number;
  }>({
    increment: 0,
    time_unit: 'minutes',
    color: 'random',
    time: 5,
  });
  const socketRef = useConnectToSocket(setUser);
  const [activeTab, setActiveTab] = useState('Create a game');

  function moveToTab(e: React.MouseEvent<HTMLElement>) {
    if (!e.currentTarget.dataset.tab) return;
    setActiveTab(e.currentTarget.dataset.tab);
  }
  return (
    <>
      <Layout className={styles.main}>
        <UserContext.Provider
          value={{ user, setUser, socket: socketRef.current }}
        >
          <div className={styles['tabbed-content']}>
            <nav className={styles.tabs}>
              <ul>
                <li
                  className={
                    activeTab !== 'Create a game' ? styles.inactive : ''
                  }
                  onClick={moveToTab}
                  data-tab="Create a game"
                >
                  <span>Create a game</span>
                </li>
                <li
                  className={activeTab !== 'Game list' ? styles.inactive : ''}
                  onClick={moveToTab}
                  data-tab="Game list"
                >
                  <span>Game list</span>
                </li>
              </ul>
            </nav>
            <div className={styles.content}>
              <GameGrid
                active={activeTab === 'Create a game'}
                createCustomGame={() => setPopup(true)}
              />
              <ListOfGames active={activeTab === 'Game list'} />
            </div>
          </div>
          {popup && (
            <Modal
              close={() => {
                resetInputValues();
                setPopup(false);
              }}
            >
              <Popup
                title="Create a game"
                fields={[
                  {
                    label: 'Time',
                    name: 'time',
                    type: 'number',
                    unitsDisplay: {
                      label: '',
                      name: 'time_unit',
                      type: 'dropdown',
                      options: [
                        { value: 'seconds', display: 'seconds' },
                        {
                          value: 'minutes',
                          display: 'minutes',
                        },
                        { value: 'hours', display: 'hours' },
                      ],
                    },
                  },
                  {
                    label: 'Increment',
                    name: 'increment',
                    type: 'number',
                    unitsDisplay: { label: 'seconds' },
                  },
                  {
                    label: 'Choose your color',
                    name: 'color',
                    type: 'radioList',
                    options: [
                      { value: 'black' },
                      { value: 'random' },
                      { value: 'white' },
                    ],
                  },
                ]}
                close={() => {
                  resetInputValues();
                  setPopup(false);
                }}
                inputValues={popupInputValues}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                isMobile={false}
                actionBtnText="Create game"
                noCancelBtn={false}
                submitAction={() => {
                  const gameTime = toMilliseconds({
                    [popupInputValues.time_unit]:
                      popupInputValues.time as number,
                  });
                  if (user)
                    createGameSeek(
                      gameTime,
                      popupInputValues.increment as number,
                      popupInputValues.color === 'random'
                        ? 'random'
                        : OPP_COLOR[popupInputValues.color],
                      user
                    );
                }}
                setError={setError}
              />
            </Modal>
          )}
        </UserContext.Provider>
      </Layout>
    </>
  );
};

export default Home;
