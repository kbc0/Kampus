import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { markMessagesAsRead } from '../services/messageService';

export function useMessageReadStatus(conversationId?: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) return;

    // Mark messages as read when entering the conversation
    const markAsRead = async () => {
      try {
        await markMessagesAsRead(conversationId, user.id);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [conversationId, user]);
}