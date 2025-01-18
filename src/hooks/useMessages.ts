import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types/messages';
import { toast } from 'react-hot-toast';
import { markMessagesAsRead } from '../services/messageService';

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read
      await markMessagesAsRead(conversationId, user.id);

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();

    let channel: RealtimeChannel | null = null;
    
    if (conversationId) {
      channel = supabase.channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        }, async (payload) => {
          const { data: newMessage } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, name, avatar_url)')
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            setMessages(current => [...current, newMessage]);
            // Mark message as read immediately if we're in the conversation
            if (newMessage.sender_id !== user?.id) {
              await markMessagesAsRead(conversationId, user?.id || '');
            }
          }
        })
        .subscribe();
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [conversationId, fetchMessages, user?.id]);

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  return { messages, sendMessage, loading };
}