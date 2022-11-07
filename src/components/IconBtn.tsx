interface IconBtnProps {
  className?: string;
  icon?: string;
  altText?: string;
  btnText?: string;
  onClick?: () => void;
}

export default function IconBtn({
  className,
  icon,
  altText,
  btnText,
  onClick,
}: IconBtnProps) {
  const rootClasses = ['icon-btn', 'btn', 'hover-highlight'];
  if (className) rootClasses.push(className);

  return (
    <div className={rootClasses.join(' ')} onClick={onClick}>
      {icon && <img src={icon} alt={altText} />}
      {btnText && <p>{btnText}</p>}
    </div>
  );
}
