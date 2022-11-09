interface TimerBarProps {
  time: number | null;
  maxTime: number;
}

export default function TimerBar({ time, maxTime }: TimerBarProps) {
  let timeLeft = (time || 0 / maxTime) * 100;
  if (isNaN(timeLeft)) timeLeft = 0;
  return (
    <div
      style={{
        width: `${timeLeft}%`,
        height: '3px',
        backgroundColor: 'red',
        maxWidth: '100%',
      }}
    ></div>
  );
}
