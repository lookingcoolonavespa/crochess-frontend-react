import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  close: () => void;
  children: React.ReactNode;
}

export default function Modal({ close, children }: ModalProps) {
  return ReactDOM.createPortal(
    <div className="modal" onClick={close}>
      {children}
    </div>,
    document.querySelector('body') as Element
  );
}
