import React, { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IStompSocket } from '@stomp/stompjs';
import { getRdmInt } from '../misc';

export default function useConnectToSocket(
  setUser: React.Dispatch<React.SetStateAction<undefined | string>>,
  user: string | undefined
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

      const userId = getRdmInt().toString();

      stompClient.connectHeaders = { name: userId };
      stompClient.activate();
      stompClient.onConnect = () => {
        setUser(userId);
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
