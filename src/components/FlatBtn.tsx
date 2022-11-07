import styles from '../styles/FlatBtn.module.scss';

interface FlatBtnProps {
  className?: string;
  type?: 'button' | 'submit' | 'reset' | undefined;
  text?: string;
  underline?: boolean;
  filled?: boolean;
  hollow?: boolean;
  size: 'small' | 'medium';
  onClick?: () => void;
  icon?: { src: string; alt: string };
}

export default function FlatBtn({
  className,
  type,
  text,
  underline,
  filled,
  hollow,
  size,
  onClick,
  icon,
}: FlatBtnProps) {
  const classes = [styles.main, styles[size]];
  if (className) classes.push(className);
  if (filled) classes.push(styles.filled);
  if (hollow) classes.push(styles.hollow);

  return (
    <button
      type={type || 'button'}
      className={classes.join(' ')}
      onClick={onClick}
    >
      {text && (
        <span className={underline ? styles['underline-hover'] : ''}>
          {text}
        </span>
      )}
      {icon && <img src={icon.src} alt={icon.alt} />}
    </button>
  );
}
