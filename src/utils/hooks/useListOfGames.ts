import { Client } from '@stomp/stompjs';
import { useEffect, useRef, useState } from 'react';
import { GameSeekInterface } from '../../types/interfaces';

export default function useListOfGames(stompClient: Client) {
  const [listOfGames, setListOfGames] = useState<GameSeekInterface[]>([]);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(
    function subscribeToGameSeeks() {
      if (!stompClient) return;
      const subscription = stompClient.subscribe(
        '/app/api/gameseeks',
        (message) => {
          if (!message.body) return;
          const data = JSON.parse(message.body);
          setListOfGames(data);
        }
      );

      stompClient.subscribe('/topic/api/gameseeks', (message) => {
        if (!message.body) return;
        type MessageBody = insert | deleteGs;

        interface insert {
          event: 'insert';
          payload: GameSeekInterface;
        }
        interface deleteGs {
          event: 'delete';
          payload: number[];
        }

        const data: MessageBody = JSON.parse(message.body);
        switch (data.event) {
          case 'insert': {
            setListOfGames((prev) => prev.concat(data.payload));
            break;
          }
          case 'delete': {
            setListOfGames((prev) =>
              prev.filter((v) => !data.payload.includes(v.id))
            );
            break;
          }
        }
      });

      return () => subscription.unsubscribe();
    },
    [stompClient]
  );

  return { listOfGames };
}
