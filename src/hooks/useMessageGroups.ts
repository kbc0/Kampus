import { useMemo } from 'react';
import { format } from 'date-fns';
import { Message } from '../types/messages';

export function useMessageGroups(messages: Message[]) {
  return useMemo(() => {
    const groups = messages.reduce((acc, message) => {
      const date = format(new Date(message.created_at), 'PP');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {} as Record<string, Message[]>);

    return Object.entries(groups);
  }, [messages]);
}