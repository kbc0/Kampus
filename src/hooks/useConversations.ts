import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, fetchUserConversations } from '../services/messageService';
import { toast } from 'react-hot-toast';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        const data = await fetchUserConversations(user.id);
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe to conversation changes
    const channel = supabase.channel(`user_conversations:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async () => {
        const data = await fetchUserConversations(user.id);
        setConversations(data);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return { conversations, loading };
}