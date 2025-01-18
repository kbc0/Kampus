import React from 'react';
import { Message } from '../../types/messages';
import { MessageGroup } from './MessageGroup';
import { ScrollButton } from './ScrollButton';
import { useMessageGroups } from '../../hooks/useMessageGroups';
import { useMessageScroll } from '../../hooks/useMessageScroll';

interface MessageScrollerProps {
  messages: Message[];
}

export const MessageScroller: React.FC<MessageScrollerProps> = ({ messages }) => {
  const messageGroups = useMessageGroups(messages);
  const { 
    scrollRef, 
    showScrollButton, 
    handleScroll, 
    scrollToBottom 
  } = useMessageScroll({ messages });

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto overscroll-y-contain 
          px-4 pb-4 scroll-smooth scrollbar-hide"
        style={{
          // Ensure content doesn't get hidden behind bottom bars
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)'
        }}
      >
        <div className="py-4 space-y-6">
          {messageGroups.map(([date, groupMessages]) => (
            <MessageGroup 
              key={date} 
              date={date} 
              messages={groupMessages} 
            />
          ))}
        </div>
      </div>

      <ScrollButton 
        show={showScrollButton} 
        onClick={() => scrollToBottom()} 
      />
    </div>
  );
};