import axios from 'axios';
import { GameSeekInterface } from '../types/interfaces';
import {
  PieceType,
  Square,
  Colors,
  PromotePieceType,
} from 'crochess-api/dist/types/types';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { getRdmColor, setIdToCookie } from './misc';
import { Client } from '@stomp/stompjs';

export function createGameSeek(
  stompClient: Client,
  time: number,
  increment: number,
  color: Colors | 'random',
  seeker: string
) {
  stompClient.publish({
    destination: '/app/api/gameseeks',
    body: JSON.stringify({
      time,
      increment,
      color,
      seeker,
    }),
  });
}

export function createGame(
  stompClient: Client,
  challenger: string,
  gameSeek: GameSeekInterface
): void {
  if (gameSeek.color.toLowerCase() === 'random') gameSeek.color = getRdmColor();

  let whitePlayer, blackPlayer;
  switch (gameSeek.color.toLowerCase()) {
    case 'w':
      whitePlayer = challenger;
      blackPlayer = gameSeek.seeker;
      break;
    case 'b':
      whitePlayer = gameSeek.seeker;
      blackPlayer = challenger;
      break;
  }

  stompClient.publish({
    destination: '/app/api/game',
    body: JSON.stringify({
      w_id: whitePlayer,
      b_id: blackPlayer,
      time: gameSeek.time,
      increment: gameSeek.increment,
    }),
  });
}

export function sendMove(
  stompClient: Client,
  gameId: string,
  playerId: string,
  move: `${Square}${Square}` | `${Square}${Square}${PromotePieceType}`
) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}`,
    body: JSON.stringify({
      playerId,
      move,
    }),
  });
}

export async function offerDraw(
  gameId: string,
  playerId: string,
  offerer: Colors
) {
  const oppColor = OPP_COLOR[offerer];

  const res = await axios.patch(
    `${process.env.REACT_APP_URL_BACKEND}/game/${gameId}/draw`,
    {
      playerId,
      claimDraw: {
        [offerer]: false,
        [oppColor]: true,
      },
    }
  );

  if (!res || res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong offering draw');
}

export async function denyDraw(gameId: string, playerId: string) {
  const res = await axios.patch(
    `${process.env.REACT_APP_URL_BACKEND}/game/${gameId}/draw`,
    {
      playerId,
      claimDraw: {
        w: false,
        b: false,
      },
    }
  );

  if (!res || res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong claiming draw');
}

export async function claimDraw(gameId: string, playerId: string) {
  const res = await axios.patch(
    `${process.env.REACT_APP_URL_BACKEND}/games/${gameId}/status`,
    {
      playerId,
      winner: null,
      causeOfDeath: 'agreement',
    }
  );

  if (!res || res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong claiming draw');
}

export async function resign(
  gameId: string,
  playerId: string,
  resigning: Colors
) {
  const winner = OPP_COLOR[resigning];

  const res = await axios.patch(
    `${process.env.REACT_APP_URL_BACKEND}/game/${gameId}/status`,
    {
      playerId,
      winner,
      causeOfDeath: 'resignation',
    }
  );

  console.log(res);

  if (!res || res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong resigning');
}
