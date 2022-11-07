import { useEffect } from 'react';
import { formatTime } from '../../utils/timerStuff';

interface TimerProps {
  startTime: number;
  turnStart: number | null;
  time: number;
  className: string;
  active: boolean;
  setTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function Timer({
  className,
  startTime,
  turnStart,
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
    if (!active || !time || !turnStart) return;
    const interval: number = window.setInterval(() => {
      const elapsed = Date.now() - turnStart;
      const timeLeft = startTime - elapsed;
      if (timeLeft < 0) return clearInterval(interval);
      setTime(timeLeft);
      // if (!timeLeft) return clearInterval(interval);
    }, 1);

    return () => clearInterval(interval);
  }, [active, time, setTime, startTime, turnStart]);

  return <div className={classNames.join(' ')}>{formatTime(time)}</div>;
}
