import { useState, useEffect, RefObject } from 'react';

export function useScrollPosition(
  scrollRef: RefObject<HTMLDivElement>,
  isAutoScrolling: boolean
) {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current || isAutoScrolling) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isAutoScrolling]);

  return { showScrollButton, handleScroll };
}