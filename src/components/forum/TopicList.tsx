import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Trash2, Pin, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Topic } from '../../types/forum';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  category_name?: string;
}

interface TopicListProps {
  topics: Topic[];
  loading: boolean;
  announcements?: Announcement[];
}

export const TopicList: React.FC<TopicListProps> = ({ 
  topics, 
  loading,
  announcements = []
}) => {
  const { user } = useAuth();
  const { role } = useUserRole(user?.id || '');

  const handleDelete = async (topicId: string) => {
    if (!user || role !== 'admin') return;

    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        const { error } = await supabase
          .from('forum_topics')
          .delete()
          .eq('id', topicId);

        if (error) throw error;
        toast.success('Topic deleted successfully');
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast.error('Failed to delete topic');
      }
    }
  };

  if (loading) {
    return (
      <div className="divide-y divide-gray-700/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-5 bg-gray-700 rounded w-3/4" />
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-700 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/4" />
                  <div className="h-4 bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!topics.length && !announcements.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">No discussions found</p>
      </div>
    );
  }

  // Sort topics to show pinned ones first
  const sortedTopics = [...topics].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="divide-y divide-gray-700/50">
      {/* Announcements */}
      {announcements.map((announcement) => (
        <div 
          key={announcement.id}
          className="p-4 bg-violet-500/10 border-l-4 border-violet-500"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {announcement.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                    <span>{announcement.author_name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                    </span>
                    {announcement.category_name && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-violet-400">{announcement.category_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-gray-300 line-clamp-2">
                {announcement.content}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Topics */}
      {sortedTopics.map((topic) => (
        <div 
          key={topic.id} 
          className={`p-4 hover:bg-gray-800/50 transition-colors duration-200 ${
            topic.is_pinned ? 'bg-violet-500/5' : ''
          }`}
        >
          <div className="flex items-start space-x-4">
            <UserAvatar 
              user={{
                id: topic.author.id,
                name: topic.author.name,
                avatar_url: topic.author.avatar_url
              }}
              size="sm"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <Link
                  to={`/forum/topic/${topic.id}`}
                  className="block group"
                >
                  <div className="flex items-center gap-2">
                    {topic.is_pinned && (
                      <Pin className="h-4 w-4 text-violet-400" />
                    )}
                    <h3 className="text-lg font-medium text-white group-hover:text-violet-400 
                      transition-colors duration-200">
                      {topic.title}
                    </h3>
                  </div>
                </Link>

                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                    title="Delete topic"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                <Link 
                  to={`/profile/${topic.author.id}`}
                  className="hover:text-violet-400 transition-colors duration-200"
                >
                  {topic.author.name}
                </Link>
                <span className="hidden sm:inline">•</span>
                <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-violet-400">{topic.subject}</span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  <span>{topic.replies_count}</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1.5" />
                  <span>{topic.likes_count}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span>{topic.views_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};