import React from 'react';
import { Message } from '../../types/messages';
import { MessageBubble } from './MessageBubble';
import { DateDivider } from './DateDivider';
import { useAuth } from '../../contexts/AuthContext';

interface MessageGroupProps {
  date: string;
  messages: Message[];
}

export const MessageGroup: React.FC<MessageGroupProps> = ({ date, messages }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-3">
      <DateDivider date={date} />
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          senderName={message.sender?.name || 'Unknown'}
          timestamp={message.created_at}
          isCurrentUser={message.sender?.id === user?.id}
          showName={index === 0 || messages[index - 1]?.sender?.id !== message.sender?.id}
        />
      ))}
    </div>
  );
};