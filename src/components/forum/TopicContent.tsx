import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import type { Topic } from '../../types/forum';
import { useLike } from '../../hooks/useLike';
import { UserAvatar } from '../common/UserAvatar';
import { TopicActions } from './TopicActions';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';

interface TopicContentProps {
  topic: Topic;
}

export const TopicContent: React.FC<TopicContentProps> = ({ topic }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(topic.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { role } = useUserRole(user?.id || '');
  const navigate = useNavigate();
  const { isLiked, likeCount, toggleLike } = useLike({
    type: 'topic',
    id: topic.id,
    initialIsLiked: topic.is_liked,
    initialCount: topic.likes_count
  });

  const handleDelete = async () => {
    if (!user || (role !== 'admin' && user.id !== topic.author.id)) return;

    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        const { error } = await supabase
          .from('forum_topics')
          .delete()
          .eq('id', topic.id);

        if (error) throw error;
        toast.success('Topic deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast.error('Failed to delete topic');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ content: editContent.trim() })
        .eq('id', topic.id);

      if (error) throw error;

      topic.content = editContent.trim();
      setIsEditing(false);
      toast.success('Topic updated successfully');
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">{topic.title}</h1>
          <div className="flex items-center space-x-2">
            <TopicActions topicId={topic.id} authorId={topic.author.id} />
            {(role === 'admin' || user?.id === topic.author.id) && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                title="Delete topic"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-400 mb-6">
          <Link 
            to={`/profile/${topic.author.id}`}
            className="flex items-center hover:text-violet-400 transition-colors duration-200"
          >
            <UserAvatar 
              user={{
                id: topic.author.id,
                name: topic.author.name,
                avatar_url: topic.author.avatar_url
              }}
              size="sm"
            />
            <span className="ml-2 font-medium text-white">{topic.author.name}</span>
          </Link>
          <span className="hidden sm:inline">·</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
          <span className="hidden sm:inline">·</span>
          <span className="text-violet-400">{topic.subject}</span>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
              rows={6}
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
          <div className="text-white text-base sm:text-lg mb-6 break-words">
            {topic.content}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-400">
          <button
            onClick={toggleLike}
            className={`flex items-center hover:text-violet-400 transition-colors duration-200 ${
              isLiked ? 'text-violet-400' : ''
            }`}
          >
            <ThumbsUp className="h-4 w-4 mr-1.5" />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            <span>{topic.replies_count}</span>
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1.5" />
            <span>{topic.views_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};