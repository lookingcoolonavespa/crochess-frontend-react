import { Colors } from 'crochess-api/dist/types/types';
import { toMilliseconds } from './timerStuff';

export function createControlBtnObj(
  src?: string,
  alt?: string,
  text?: string,
  onClick?: () => void,
  className?: string
) {
  return { src, alt, text, onClick, className };
}

export function getKeyByValue(
  obj: {
    [key: string]: any;
  },
  val: any
) {
  return Object.keys(obj).find((key) => obj[key] === val);
}

export function setIdToCookie(gameId: string, color: Colors, id: string) {
  document.cookie = `${gameId}(${color})=${id};max-age=${
    60 * 60 * 24
  };samesite=strict`;
}

export function parseCookies(cookie: string): { [key: string]: string } {
  const cookies = cookie.split('; ');
  return cookies
    .map((c) => c.split('='))
    .reduce<{ [key: string]: string }>((acc, curr) => {
      const [key, value] = curr;
      acc[key] = value;
      return acc;
    }, {});
}

export function getActivePlayer(
  gameId: string,
  whiteId: string,
  blackId: string
): Colors | null {
  const cookieObj = parseCookies(document.cookie);

  switch (true) {
    case cookieObj[`${gameId}(w)`] === whiteId &&
      cookieObj[`${gameId}(b)`] === blackId: {
      const user = sessionStorage.getItem(gameId);
      if (user === whiteId) return 'w';
      if (user === blackId) return 'b';
      return null;
    }
    case cookieObj[`${gameId}(w)`] === whiteId: {
      return 'w';
    }
    case cookieObj[`${gameId}(b)`] === blackId: {
      return 'b';
    }
    default:
      return null;
  }
}

export function getGameType(ms: number) {
  switch (true) {
    case toMilliseconds({ minutes: 2 }) >= ms:
      return 'bullet';

    case toMilliseconds({ minutes: 5 }) >= ms:
      return 'blitz';

    case toMilliseconds({ minutes: 30 }) >= ms:
      return 'rapid';

    default:
      return 'classical';
  }
}

export function getRdmColor(): Colors {
  const rdm = Math.random();
  return rdm >= 0.5 ? 'w' : 'b';
}
