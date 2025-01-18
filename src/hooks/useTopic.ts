import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Topic } from '../types/forum';
import { toast } from 'react-hot-toast';

export function useTopic(topicId?: string) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!topicId) {
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      try {
        // Increment view count
        await supabase.rpc('increment_topic_views', { topic_id_param: topicId });

        const { data, error } = await supabase
          .from('forum_topics')
          .select(`
            *,
            author:profiles!forum_topics_author_id_fkey (
              id,
              name,
              university,
              avatar_url
            ),
            is_liked:forum_likes(id)
          `)
          .eq('id', topicId)
          .single();

        if (error) throw error;

        setTopic({
          ...data,
          author: data.author,
          is_liked: data.is_liked.length > 0
        });
      } catch (error) {
        console.error('Error fetching topic:', error);
        setError(error as Error);
        toast.error('Failed to load topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  return { topic, loading, error };
}