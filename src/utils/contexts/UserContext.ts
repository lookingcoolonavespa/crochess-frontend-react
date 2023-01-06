import { Client } from '@stomp/stompjs';
import React, { createContext } from 'react';

export const UserContext = createContext<{
  user: string | undefined;
  setUser: React.Dispatch<React.SetStateAction<string | undefined>> | undefined;
  socket: Client | null;
}>({
  user: undefined,
  setUser: undefined,
  socket: null,
});
