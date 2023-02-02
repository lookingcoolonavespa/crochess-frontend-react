import { useEffect, useMemo } from 'react';
import { dayjs, formatTime } from '../../../utils/timerStuff';

export interface TimerProps {
  timeLeftAtStart: number;
  timeStampAtStart: number | null;
  time: number | null;
  className: string;
  active: boolean;
  setTime: (time: number) => void;
}

export default function Timer({
  className,
  timeLeftAtStart,
  timeStampAtStart,
  time,
  setTime,
  active,
}: TimerProps) {
  const classNames = [className];

  if (active) classNames.push('active');

  useEffect(() => {
    /*
      if active, start timer 
      subtract elapsed time from playerTime to get clock 
    */
    if (!active || !time || !timeStampAtStart) return;
    const interval: number = window.setInterval(() => {
      const elapsed = Date.now() - timeStampAtStart;
      const timeLeft = timeLeftAtStart - elapsed;
      if (timeLeft < 0) return clearInterval(interval);
      setTime(timeLeft);
      if (!timeLeft) return clearInterval(interval);
    }, 1);

    return () => clearInterval(interval);
  }, [active, time, setTime, timeLeftAtStart, timeStampAtStart]);

  const strArr = time === null ? '-:--:--' : formatTime(time).split(':');

  return (
    <div className={classNames.join(' ')}>
      <span>{strArr[0]}</span>:<span>{strArr[1]}</span>
      {strArr[2] && (
        <>
          :
          <span
            style={{
              fontSize: '0.6em',
              marginBottom: '0.1em',
            }}
          >
            {strArr[2]}
          </span>
        </>
      )}
    </div>
  );
}
