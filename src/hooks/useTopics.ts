import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Topic } from '../types/forum';
import { toast } from 'react-hot-toast';

interface UseTopicsOptions {
  sort: 'latest' | 'trending';
  categoryId: string | null;
}

export function useTopics({ sort, categoryId }: UseTopicsOptions) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.rpc('get_forum_topics', {
          category_id_param: categoryId,
          subject_param: null,
          sort_by: sort
        });

        if (error) throw error;

        if (isMounted) {
          setTopics(data.map((topic: any) => ({
            ...topic,
            author: {
              id: topic.author_id,
              name: topic.author_name,
              university: topic.author_university,
              avatar_url: topic.author_avatar_url
            },
            category: {
              name: topic.category_name,
              is_private: topic.category_is_private
            }
          })));
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        if (isMounted) {
          setError(error as Error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchTopics, 1000 * retryCount);
          } else {
            toast.error('Failed to load topics');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTopics();

    // Subscribe to topic changes
    const channel = supabase
      .channel('forum_topics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_topics',
          filter: categoryId ? `category_id=eq.${categoryId}` : undefined
        },
        () => {
          if (isMounted) {
            fetchTopics();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [sort, categoryId]);

  return { topics, loading, error };
}