import { GameType } from '../types/types';
import axios from 'axios';
import { GameSeekInterface } from '../types/interfaces';
import { PieceType, Square, Colors } from 'crochess-api/dist/types/types';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { getRdmColor } from './misc';

export function createGameSeek(
  time: number,
  increment: number,
  color: Colors | 'random',
  seeker: string,
  gameType: GameType
) {
  fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/gameSeeks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ time, increment, color, gameType, seeker }),
  });
}

export async function createGame(
  challenger: string,
  gameSeek: GameSeekInterface
) {
  if (gameSeek.color === 'random') gameSeek.color = getRdmColor();

  let whitePlayer, blackPlayer;
  switch (gameSeek.color) {
    case 'w':
      whitePlayer = challenger;
      blackPlayer = gameSeek.seeker;
      break;
    case 'b':
      whitePlayer = gameSeek.seeker;
      blackPlayer = challenger;
      break;
  }

  const [res] = await Promise.all([
    axios.put(`${process.env.NEXT_PUBLIC_URL_BACKEND}/games`, {
      challenger,
      w: whitePlayer,
      b: blackPlayer,
      time: gameSeek.time,
      increment: gameSeek.increment,
      seeker: gameSeek.seeker,
    }),
    axios.delete(
      `${process.env.NEXT_PUBLIC_URL_BACKEND}/gameSeeks/${gameSeek._id}`
    ),
  ]);

  if (res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong fetching the game');

  return await res.data;
}

export async function fetchGame(gameId: string) {
  if (!gameId) return;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_URL_BACKEND}/games/${gameId}`
  );
  if (!res || res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong fetching game');

  return await res.data;
}

export async function sendMove(
  gameId: string,
  playerId: string,
  pieceToMove: Square,
  to: Square,
  promote: Exclude<PieceType, 'k' | 'p'> | '' = ''
) {
  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_URL_BACKEND}/games/${gameId}/move`,
    {
      playerId,
      to,
      promote,
      from: pieceToMove,
    }
  );

  if (!res || res.status !== 200 || res.statusText !== 'OK')
    throw new Error('something went wrong making move');
  const elapsed = await res.data;
  console.log(elapsed);
}

export async function offerDraw(
  gameId: string,
  playerId: string,
  offerer: Colors
) {
  const oppColor = OPP_COLOR[offerer];

  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_URL_BACKEND}/games/${gameId}/draw`,
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
    `${process.env.NEXT_PUBLIC_URL_BACKEND}/games/${gameId}/draw`,
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
    `${process.env.NEXT_PUBLIC_URL_BACKEND}/games/${gameId}/status`,
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
    `${process.env.NEXT_PUBLIC_URL_BACKEND}/games/${gameId}/status`,
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
