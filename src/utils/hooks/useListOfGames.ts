import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { GameSeekInterface } from '../../types/interfaces';
import axios from 'axios';
import { setIdToCookie } from '../misc';

export default function useListOfGames(socket: Socket) {
  const [listOfGames, setListOfGames] = useState<GameSeekInterface[]>([]);
  const navigate = useNavigate();

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(function getGamesOnMount() {
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
