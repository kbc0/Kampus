import React from 'react';
import { MessageScroller } from './MessageScroller';
import { SafetyWarning } from './SafetyWarning';
import { Message } from '../../types/messages';
import { MessageCircle } from 'lucide-react';

interface MessageContainerProps {
  messages: Message[];
  loading?: boolean;
  onCloseSafetyWarning: () => void;
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  messages,
  loading,
  onCloseSafetyWarning
}) => {
  const shouldShowSafetyWarning = messages.length === 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
          <p className="text-gray-400 mt-4">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {shouldShowSafetyWarning && (
        <div className="sticky top-0 left-0 right-0 z-20 p-4 bg-gray-800">
          <SafetyWarning onClose={onCloseSafetyWarning} />
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-violet-500/10 rounded-full p-4 mb-4 inline-block">
              <MessageCircle className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        </div>
      ) : (
        <MessageScroller messages={messages} />
      )}
    </div>
  );
};