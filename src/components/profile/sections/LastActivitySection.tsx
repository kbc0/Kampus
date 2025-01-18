import React from 'react';
import { History, MessageSquare, ThumbsUp, Trophy, Hash } from 'lucide-react';
import { Card } from '../../common/Card';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'topic' | 'reply' | 'like' | 'level_up';
  title?: string;
  content?: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
  data?: {
    old_level?: number;
    new_level?: number;
    level_title?: string;
  };
}

interface LastActivitySectionProps {
  activities: Activity[];
  loading?: boolean;
}

export const LastActivitySection: React.FC<LastActivitySectionProps> = ({
  activities,
  loading
}) => {
  if (loading) {
    return (
      <Card
        title="Last Activity"
        icon={History}
        description="Recent actions and achievements"
      >
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-700/50 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Last Activity"
      icon={History}
      description="Recent actions and achievements"
    >
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 
                hover:bg-gray-800 hover:border-gray-600 transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                {activity.type === 'topic' && (
                  <MessageSquare className="h-5 w-5 text-violet-400 mt-1 flex-shrink-0" />
                )}
                {activity.type === 'reply' && (
                  <MessageSquare className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                )}
                {activity.type === 'like' && (
                  <ThumbsUp className="h-5 w-5 text-pink-400 mt-1 flex-shrink-0" />
                )}
                {activity.type === 'level_up' && (
                  <Trophy className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  {activity.type === 'level_up' ? (
                    <div>
                      <p className="text-white">
                        Reached Level {activity.data?.new_level} - {activity.data?.level_title}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        {activity.title && (
                          <Link
                            to={`/forum/topic/${activity.id}`}
                            className="text-white hover:text-violet-400 transition-colors duration-200 font-medium"
                          >
                            {activity.title}
                          </Link>
                        )}
                        {activity.category && (
                          <>
                            <span className="text-gray-500">•</span>
                            <Link
                              to={`/forum?category=${activity.category.id}`}
                              className="flex items-center text-sm text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              <Hash className="h-3.5 w-3.5 mr-0.5" />
                              {activity.category.name}
                            </Link>
                          </>
                        )}
                      </div>
                      {activity.content && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {activity.content}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};