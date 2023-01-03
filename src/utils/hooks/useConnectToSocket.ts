import React, { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getRdmInt } from '../misc';

export default function useConnectToSocket(
  setUser: React.Dispatch<React.SetStateAction<undefined | number>>
) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(
    function connectToSocket() {
      const sessionId = getRdmInt();
      const socket = new SockJS(`${process.env.REACT_APP_URL_BACKEND}/games`, {
        sessionId: () => {
          return sessionId;
        },
      });

      const stompClient = Stomp.over(socket);
      stompClient.connect({}, () => {
        setUser(sessionId);
      });
    },
    [setUser]
  );

  return socketRef;
}
