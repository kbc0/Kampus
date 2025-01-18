import { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '../types/messages';

interface UseMessageScrollOptions {
  messages: Message[];
  smoothScroll?: boolean;
}

export function useMessageScroll({ messages, smoothScroll = true }: UseMessageScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageCountRef = useRef(messages.length);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      setIsAutoScrolling(true);
      const scrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTo({
        top: scrollHeight,
        behavior
      });
      // Reset auto-scrolling flag after animation
      setTimeout(() => setIsAutoScrolling(false), 300);
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current || isAutoScrolling) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Handle initial scroll and new messages
  useEffect(() => {
    if (!scrollRef.current) return;

    const hasNewMessages = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (hasNewMessages) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

      if (isNearBottom || messages.length <= 1) {
        scrollToBottom(smoothScroll ? 'smooth' : 'auto');
      }
    }
  }, [messages, smoothScroll, scrollToBottom]);

  // Initial scroll on mount
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('auto');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    scrollRef,
    showScrollButton,
    handleScroll,
    scrollToBottom,
    isAutoScrolling
  };
}