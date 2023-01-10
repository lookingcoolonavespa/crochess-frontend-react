import { Client } from '@stomp/stompjs';
import axios from 'axios';
import {
  Colors,
  PromotePieceType,
  Square,
} from 'crochess-api/dist/types/types';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { GameSeekInterface } from '../types/interfaces';
import { getRdmColor } from './misc';

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

export function offerDraw(
  stompClient: Client,
  gameId: string,
  offerer: Colors
) {
  const oppColor = OPP_COLOR[offerer];
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw/update`,
    body: JSON.stringify({
      [offerer]: false,
      [oppColor]: true,
    }),
  });
}

export async function denyDraw(stompClient: Client, gameId: string) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw/update`,
    body: JSON.stringify({
      w: false,
      b: false,
    }),
  });
}

export async function claimDraw(stompClient: Client, gameId: string) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw/claim`,
  });
}

export async function resign(
  stompClient: Client,
  gameId: string,
  resigning: Colors
) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw/update`,
    body: JSON.stringify({
      w: false,
      b: false,
    }),
  });
}
