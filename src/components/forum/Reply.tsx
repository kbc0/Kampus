import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Reply as ReplyType } from '../../types/forum';
import { useLike } from '../../hooks/useLike';
import { UserAvatar } from '../common/UserAvatar';
import { ReplyActions } from './ReplyActions';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReplyProps {
  reply: ReplyType;
}

export const Reply: React.FC<ReplyProps> = ({ reply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLiked, likeCount, toggleLike, isLoading } = useLike({
    type: 'reply',
    id: reply.id,
    initialIsLiked: reply.is_liked,
    initialCount: reply.likes_count
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_replies')
        .update({ content: editContent.trim() })
        .eq('id', reply.id);

      if (error) throw error;

      reply.content = editContent.trim();
      setIsEditing(false);
      toast.success('Reply updated successfully');
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6
      hover:bg-gray-800 hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <UserAvatar 
            user={{
              id: reply.author.id,
              name: reply.author.name,
              avatar_url: reply.author.avatar_url
            }}
            size="sm"
          />
          <div>
            <span className="text-white font-medium">{reply.author.name}</span>
            <div className="text-sm text-gray-400">
              {reply.author.university} University
            </div>
            <div className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <ReplyActions 
          replyId={reply.id}
          authorId={reply.author.id}
          onEdit={() => {
            setEditContent(reply.content);
            setIsEditing(true);
          }}
        />
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
              text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
            rows={4}
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!editContent.trim() || isSubmitting}
              className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg
                hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-white text-lg mb-4">
          {reply.content}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={toggleLike}
          disabled={isLoading}
          className={`flex items-center text-sm transition-colors duration-200 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isLiked ? 'text-violet-400' : 'text-gray-400 hover:text-violet-400'}`}
        >
          <ThumbsUp className="h-4 w-4 mr-1.5" />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
};