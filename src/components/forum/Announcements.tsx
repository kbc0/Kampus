import React from 'react';
import { Bell, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_name: string;
  starts_at: string;
  ends_at?: string;
  created_at: string;
  category_id?: string;
  category_name?: string;
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

export const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  if (!announcements.length) return null;

  return (
    <div className="space-y-4 mb-6">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-violet-400 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{announcement.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-violet-200">
                      By {announcement.author_name}
                    </p>
                    {announcement.category_name && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-violet-300">
                          {announcement.category_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-violet-300 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                </div>
              </div>
              <p className="mt-2 text-gray-300 whitespace-pre-wrap">{announcement.content}</p>
              {announcement.ends_at && (
                <p className="mt-2 text-sm text-violet-300">
                  Expires {formatDistanceToNow(new Date(announcement.ends_at), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};