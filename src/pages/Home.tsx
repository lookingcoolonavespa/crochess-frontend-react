import { useState, useRef, useEffect, useContext } from 'react';
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
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { seekColor } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { setIdToCookie } from '../utils/misc';
import { Colors } from 'crochess-api/dist/types/types';

const Home = () => {
  const { user, socket } = useContext(UserContext);
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
  const [activeTab, setActiveTab] = useState('Create a game');

  const navigate = useNavigate();
  useEffect(
    function listenToAcceptedGameSeeks() {
      if (!socket || !user) return;
      const subscription = socket.subscribe(
        '/user/queue/gameseeks',
        (message) => {
          type GameIdMsg = {
            gameId: string;
            playerColor: 'W' | 'B';
          };
          const { gameId, playerColor } = JSON.parse(message.body) as GameIdMsg;
          setIdToCookie(gameId, playerColor.toLowerCase() as Colors, user);
          navigate(`/${gameId}`);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    },
    [navigate, user, socket]
  );

  function moveToTab(e: React.MouseEvent<HTMLElement>) {
    if (!e.currentTarget.dataset.tab) return;
    setActiveTab(e.currentTarget.dataset.tab);
  }
  return (
    <>
      <Layout className={styles.main}>
        <div className={styles['tabbed-content']}>
          <nav className={styles.tabs}>
            <ul>
              <li
                className={activeTab !== 'Create a game' ? styles.inactive : ''}
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
                  [popupInputValues.time_unit]: popupInputValues.time as number,
                });
                if (user && socket)
                  createGameSeek(
                    socket,
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
      </Layout>
    </>
  );
};

export default Home;
