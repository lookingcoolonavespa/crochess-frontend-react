import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSeekInterface } from '../../types/interfaces';
import axios from 'axios';
import { setIdToCookie } from '../misc';
import { CompatClient } from '@stomp/stompjs';

export default function useListOfGames(
  stompClient: CompatClient,
  user: number
) {
  const [listOfGames, setListOfGames] = useState<GameSeekInterface[]>([]);
  const navigate = useNavigate();

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(function subscribeToGameSeeks() {
    if (!stompClient) return;
    const subscription = stompClient.subscribe(
      '/topics/api/gameseeks',
      (message) => {
        if (!message.body) return;
        type MessageBody = init | newGameSeek | deleteGameSeeks | startGame;
        interface init {
          event: 'init';
          payload: GameSeekInterface[];
        }
        interface newGameSeek {
          event: 'newGameSeek';
          payload: GameSeekInterface;
        }
        interface deleteGameSeeks {
          event: 'deleteGameSeeks';
          payload: number[];
        }
        interface startGame {
          event: 'startGame';
          payload: number;
        }

        const data: MessageBody = JSON.parse(message.body);
        switch (data.event) {
          case 'init': {
            setListOfGames(data.payload);
            break;
          }
          case 'newGameSeek': {
            setListOfGames((prev) => prev.concat(data.payload));
            break;
          }
          case 'deleteGameSeeks': {
            setListOfGames((prev) =>
              prev.filter((v) => !data.payload.includes(v.id))
            );
            break;
          }
          case 'startGame': {
            sessionStorage.setItem(data.payload.toString(), user.toString()); // used to identify user once they move into a game, useful for if they refresh or disconnect
            // setIdToCookie(data.gameId, data.color, data.cookieId);
            console.log('started game');
            navigate(`/${data.payload}`);
          }
        }
      }
    );

    (async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL_BACKEND}/gameSeeks`
        );
        if (!res || res.status !== 200 || res.statusText !== 'OK')
          throw new Error('something went wrong fetching games');

        const games = await res.data;

        setListOfGames(games);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  useEffect(
    function connectToSocket() {
      if (!socket) return;
      socket.on('newGameSeek', (game) => {
        if (mounted.current)
          setListOfGames((prev) => {
            const newList = [...prev, game].reduce((acc, curr) => {
              // push current seeker to top of the list
              if (curr.seeker === socket.id) acc.unshift(curr);
              else acc.push(curr);
              return acc;
            }, []);

            return newList;
          });
      });

      socket.on('startGame', (data) => {
        sessionStorage.setItem(data.gameId, socket.id); // used to identify user once they move into a game, useful for if they refresh or disconnect
        setIdToCookie(data.gameId, data.color, data.cookieId);
        console.log('started game');
        navigate(`/${data.gameId}`);
      });

      socket.on('deletedGameSeek', (d) => {
        if (mounted.current)
          setListOfGames((prev) => prev.filter((g) => g._id !== d._id));
      });

      return () => {
        socket.disconnect();
      };
    },
    [socket, navigate]
  );

  return { listOfGames };
}
