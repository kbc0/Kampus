import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface UseLikeOptions {
  type: 'topic' | 'reply';
  id: string;
  initialIsLiked: boolean;
  initialCount: number;
}

export function useLike({ type, id, initialIsLiked, initialCount }: UseLikeOptions) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const lastClickTime = useRef(0);
  const pendingOperation = useRef<Promise<void> | null>(null);

  const toggleLike = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    // Prevent rapid clicks (debounce)
    const now = Date.now();
    if (now - lastClickTime.current < 500) { // 500ms debounce
      return;
    }
    lastClickTime.current = now;

    // Prevent concurrent operations
    if (isLoading || pendingOperation.current) {
      return;
    }

    setIsLoading(true);
    
    try {
      const operation = async () => {
        if (isLiked) {
          // Unlike
          const { error } = await supabase
            .from('forum_likes')
            .delete()
            .match({
              user_id: user.id,
              [type === 'topic' ? 'topic_id' : 'reply_id']: id
            });

          if (error) {
            if (error.code === '23503') { // Foreign key violation
              return; // Item was already deleted
            }
            throw error;
          }

          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          // Like
          const { error } = await supabase
            .from('forum_likes')
            .insert({
              user_id: user.id,
              [type === 'topic' ? 'topic_id' : 'reply_id']: id
            });

          if (error) {
            if (error.code === '23505') { // Unique constraint violation
              return; // Already liked
            }
            throw error;
          }

          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      };

      pendingOperation.current = operation();
      await pendingOperation.current;
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
      
      // Revert UI state on error
      setIsLiked(initialIsLiked);
      setLikeCount(initialCount);
    } finally {
      setIsLoading(false);
      pendingOperation.current = null;
    }
  }, [user, isLiked, isLoading, type, id, initialIsLiked, initialCount]);

  return { isLiked, likeCount, toggleLike, isLoading };
}