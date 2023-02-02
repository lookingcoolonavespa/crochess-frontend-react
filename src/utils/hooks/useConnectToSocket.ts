import React, { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IStompSocket } from '@stomp/stompjs';
import { getRdmInt } from '../misc';

export default function useConnectToSocket(
  setUser: React.Dispatch<React.SetStateAction<undefined | string>>
) {
  const socketRef = useRef<Client | null>(null);

  useEffect(
    function connectToSocket() {
      if (socketRef.current?.active) return;

      const stompClient = new Client();
      stompClient.webSocketFactory = () => {
        return new SockJS(
          `${process.env.REACT_APP_URL_BACKEND}/websocket`
        ) as IStompSocket;
      };

      const userId = sessionStorage.getItem('user') || getRdmInt().toString();
      stompClient.connectHeaders = { name: userId };
      stompClient.activate();
      stompClient.onConnect = () => {
        console.log(userId);
        setUser(userId);
        sessionStorage.setItem('user', userId);
        // used to identify user if they refresh or disconnect
      };

      socketRef.current = stompClient;

      return () => {
        stompClient.deactivate();
        setUser(undefined);
      };
    },
    [setUser]
  );

  return socketRef;
}
