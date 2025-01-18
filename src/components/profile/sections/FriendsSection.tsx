import React from 'react';
import { Users, UserX } from 'lucide-react';
import { useFriends } from '../../../hooks/useFriends';
import { Card } from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';

interface FriendsSectionProps {
  userId: string;
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({ userId }) => {
  const { user } = useAuth();
  const { friends, loading, removeFriend } = useFriends(userId);
  const isOwnProfile = userId === user?.id;

  return (
    <Card
      title="Friends"
      description={`${friends.length} ${friends.length === 1 ? 'friend' : 'friends'}`}
      icon={Users}
    >
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-700/50 h-16 rounded-lg" />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400">No friends yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div 
                key={friend.id} 
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 
                  hover:bg-gray-800 hover:border-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <img
                    src={friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}`}
                    alt={friend.name}
                    className="h-10 w-10 rounded-lg object-cover bg-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <a 
                      href={`/profile/${friend.id}`}
                      className="text-white hover:text-violet-400 font-medium truncate block transition-colors"
                    >
                      {friend.name}
                    </a>
                    <p className="text-sm text-gray-400 truncate">
                      {friend.university} University
                    </p>
                  </div>
                </div>
                {isOwnProfile && friend.friendship_id && (
                  <button
                    onClick={() => removeFriend(friend.friendship_id!)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove friend"
                  >
                    <UserX className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};