import { useRef, useEffect } from 'react';

export default function useScrollToBottom(list: any[]) {
  const scrollEndRef = useRef<HTMLElement>(null);

  function scrollToBottom() {
    scrollEndRef?.current?.scrollIntoView({
      behavior: 'auto',
      block: 'end',
      inline: 'center',
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, [list]);

  return {
    scrollEndRef: scrollEndRef,
  };
}
