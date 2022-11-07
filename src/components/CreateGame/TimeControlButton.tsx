type TimeControlButtonProps = {
  time: number | null;
  increment: number | null;
  type: 'blitz' | 'bullet' | 'rapid' | 'classical' | 'custom';
  className: string;
  search: boolean;
  onClick: () => void;
};

const TimeControlButton = ({
  time,
  increment,
  type,
  className,
  search,
  onClick,
}: TimeControlButtonProps) => {
  return (
    <div
      className={
        'hover-highlight outline ' +
        ((search && 'no-hover sm-box-shadow ') || '') +
        (className || '')
      }
      onClick={onClick}
    >
      <h3 className="title">
        {type === 'custom' ? type : `${time} + ${increment}`}
      </h3>
      {search ? (
        <div className="sm-loader"></div>
      ) : (
        type !== 'custom' && <p className="caption">{type}</p>
      )}
    </div>
  );
};

export default TimeControlButton;
