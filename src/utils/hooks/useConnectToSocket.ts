import React, { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IStompSocket } from '@stomp/stompjs';
import { Socket } from '../../types/interfaces';
import { useNavigate } from 'react-router-dom';
import { getRdmInt } from '../misc';

export default function useConnectToSocket(
  setUser: React.Dispatch<React.SetStateAction<undefined | string>>,
  user: string | undefined
) {
  const socketRef = useRef<Client | null>(null);
  const navigate = useNavigate();

  useEffect(
    function connectToSocket() {
      if (socketRef.current?.active) return;

      const socket = new SockJS(
        `${process.env.REACT_APP_URL_BACKEND}/websocket`
      ) as Socket;

      const stompClient = new Client();
      stompClient.webSocketFactory = () => {
        return new SockJS(
          `${process.env.REACT_APP_URL_BACKEND}/websocket`
        ) as IStompSocket;
      };

      const userId = getRdmInt().toString();

      stompClient.connectHeaders = { name: userId };
      stompClient.activate();
      stompClient.onConnect = () => {
        setUser(userId);

        stompClient.subscribe('/user/queue/gameseeks', (message) => {
          const gameId = message.body;
          sessionStorage.setItem(gameId, userId); // used to identify user once they move into a game, useful for if they refresh or disconnect
          // setIdToCookie(data.gameId, data.color, data.cookieId);
          console.log('started game');
          navigate(`/${gameId}`);
        });
      };

      socketRef.current = stompClient;

      return () => {
        stompClient.deactivate();
        setUser(undefined);
      };
    },
    [setUser, navigate]
  );

  return socketRef;
}
