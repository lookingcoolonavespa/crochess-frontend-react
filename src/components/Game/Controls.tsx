import React from 'react';

import IconBtn from '../IconBtn';
import { ControlBtnObj } from '../../types/interfaces';

interface ControlsProps {
  className?: string;
  list: ControlBtnObj[];
}

export default function Controls({ className, list }: ControlsProps) {
  return (
    <div className={className}>
      {list.map((c, i) => {
        return (
          <IconBtn
            key={i}
            className={c.className}
            icon={c.src}
            altText={c.alt}
            btnText={c.text}
            onClick={c.onClick}
          />
        );
      })}
    </div>
  );
}
export const MemoizedControls = React.memo(Controls);
