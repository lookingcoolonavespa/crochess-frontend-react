import React, { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IStompSocket } from '@stomp/stompjs';
import { Socket } from '../../types/interfaces';
import { useNavigate } from 'react-router-dom';

let connected = false;

export default function useConnectToSocket(
  setUser: React.Dispatch<React.SetStateAction<undefined | string>>,
  user: string | undefined
) {
  const socketRef = useRef<Client | null>(null);
  const navigate = useNavigate();

  useEffect(
    function connectToSocket() {
      if (connected) return;

      const socket = new SockJS(
        `${process.env.REACT_APP_URL_BACKEND}/websocket`
      ) as Socket;

      const stompClient = new Client();
      stompClient.webSocketFactory = () => {
        return new SockJS(
          `${process.env.REACT_APP_URL_BACKEND}/websocket`
        ) as IStompSocket;
      };
      stompClient.activate();
      stompClient.onConnect = () => {
        connected = true;

        let url = socket._transport.url;
        url = url.replace(
          `ws://${process.env.REACT_APP_DOMAIN_BACKEND}/websocket/`,
          ''
        );
        url = url.replace('/websocket', '');
        url = url.replace(/^[0-9]+\//, '');
        setUser(url);

        stompClient.subscribe('/queue/gameseeks', (message) => {
          if (!user) return;
          const data = JSON.parse(message.body);
          sessionStorage.setItem(data.toString(), user); // used to identify user once they move into a game, useful for if they refresh or disconnect
          // setIdToCookie(data.gameId, data.color, data.cookieId);
          console.log('started game');
          navigate(`/${data.payload}`);
        });
      };

      socketRef.current = stompClient;

      return () => {
        stompClient.deactivate();
        connected = false;
        setUser(undefined);
      };
    },
    [setUser]
  );

  return socketRef;
}
