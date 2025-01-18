import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Reply } from '../types/forum';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export function useReplies(topicId: string) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_replies')
          .select(`
            *,
            author:profiles (
              id,
              name,
              university,
              avatar_url
            ),
            likes:forum_likes!left(id, user_id)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setReplies(data.map(reply => ({
          ...reply,
          author: reply.author,
          is_liked: reply.likes.some(like => like.user_id === user?.id)
        })));
      } catch (error) {
        console.error('Error fetching replies:', error);
        toast.error('Failed to load replies');
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();

    // Subscribe to all changes (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel(`topic:${topicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_replies',
          filter: `topic_id=eq.${topicId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the complete reply with author info
            const { data: newReply } = await supabase
              .from('forum_replies')
              .select(`
                *,
                author:profiles (
                  id,
                  name,
                  university,
                  avatar_url
                ),
                likes:forum_likes!left(id, user_id)
              `)
              .eq('id', payload.new.id)
              .single();

            if (newReply) {
              setReplies(current => [...current, {
                ...newReply,
                author: newReply.author,
                is_liked: newReply.likes.some(like => like.user_id === user?.id)
              }]);
            }
          } else if (payload.eventType === 'DELETE') {
            setReplies(current => current.filter(reply => reply.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setReplies(current => current.map(reply => 
              reply.id === payload.new.id 
                ? { ...reply, content: payload.new.content }
                : reply
            ));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [topicId, user?.id]);

  return { replies, loading };
}