import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  senderName: string;
  timestamp: string;
  isCurrentUser: boolean;
  showName?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  senderName,
  timestamp,
  isCurrentUser,
  showName = true,
}) => {
  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group 
        animate-in slide-in-from-bottom-2 duration-200`}
    >
      <div className={`max-w-[85%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {showName && !isCurrentUser && (
          <div className="ml-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{senderName}</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm ${
            isCurrentUser
              ? 'bg-violet-500 text-white rounded-br-sm shadow-violet-500/10'
              : 'bg-gray-700 text-gray-100 rounded-bl-sm shadow-gray-900/10'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          <div className={`flex items-center justify-end mt-1 text-xs ${
            isCurrentUser ? 'text-violet-200' : 'text-gray-400'
          }`}>
            <span>{format(new Date(timestamp), 'HH:mm')}</span>
            {isCurrentUser && (
              <CheckCheck className="h-3.5 w-3.5 ml-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};