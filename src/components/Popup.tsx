import IconBtn from './IconBtn';
import Form from './Form';

import closeSVG from '../public/icons/close-line.svg';
import styles from '../styles/Popup.module.scss';
import { FormProps } from '../types/interfaces';

interface PopupProps extends FormProps {
  className?: string;
  title: string;
  subheader?: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
  close: () => void;
  isMobile: boolean;
}

export default function Popup({
  className,
  title,
  subheader,
  fields,
  children,
  footerContent,
  close,
  isMobile,
  ...props
}: PopupProps) {
  const baseClass = [styles.main];
  if (className) baseClass.push(className);

  return (
    <div className={baseClass.join(' ')} onClick={(e) => e.stopPropagation()}>
      <header>
        <h3>{title}</h3>
        {subheader && (
          <div className="subheader">
            <span>{subheader}</span>
          </div>
        )}
        <IconBtn icon={closeSVG} onClick={close} className="close-btn" />
      </header>
      {fields && <Form fields={fields} close={close} {...props} />}
      {children && (
        <>
          <div className="content">{children}</div>
          {footerContent && <footer>{footerContent}</footer>}
        </>
      )}
    </div>
  );
}
