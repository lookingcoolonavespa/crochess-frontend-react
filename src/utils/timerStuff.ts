import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { TimeObjInterface } from '../types/interfaces';

dayjs.extend(duration);

export function toMilliseconds(timeObj: TimeObjInterface) {
  return dayjs.duration(timeObj).asMilliseconds();
}

export function fromMillisecondsToMinutes(ms: number) {
  return dayjs.duration(ms).asMinutes();
}

export function formatTime(ms: number) {
  const duration = dayjs.duration(ms);

  const atLeastAnHour = duration.asHours() >= 1;
  const belowTwentySeconds = duration.asSeconds() <= 20;

  switch (true) {
    case atLeastAnHour: {
      return duration.format('HH:mm:ss');
    }
    case belowTwentySeconds: {
      return duration.format('mm:ss:SSS');
    }
    default: {
      return duration.format('mm:ss');
    }
  }
}

export { dayjs };
