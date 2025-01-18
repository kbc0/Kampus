import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await onSend(message);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl pl-4 pr-12 
            py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500
            resize-none overflow-hidden"
          style={{
            minHeight: '48px',
            maxHeight: '120px'
          }}
        />
        <button
          type="button"
          className="absolute right-3 bottom-3 text-gray-400 hover:text-violet-400 
            transition-colors duration-200"
        >
          <Smile className="h-5 w-5" />
        </button>
      </div>
      <button
        type="submit"
        disabled={!message.trim() || sending}
        className="flex-shrink-0 bg-violet-500 text-white p-3 rounded-full h-12 w-12
          hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500
          focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50
          disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
};