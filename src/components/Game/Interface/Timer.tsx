import { useEffect } from 'react';
import { formatTime } from '../../../utils/timerStuff';

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
  console.table({
    className,
    timeLeftAtStart,
    timeStampAtStart,
    time,
    setTime,
    active,
  });
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
      // if (!timeLeft) return clearInterval(interval);
    }, 1);

    return () => clearInterval(interval);
  }, [active, time, setTime, timeLeftAtStart, timeStampAtStart]);

  return (
    <div className={classNames.join(' ')}>
      {time === null ? '-:--:--' : formatTime(time)}
    </div>
  );
}
