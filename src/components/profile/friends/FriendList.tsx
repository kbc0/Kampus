import React from 'react';
import { Link } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { Friend } from '../../../types/friends';
import { UserAvatar } from '../../common/UserAvatar';
import { useFriends } from '../../../hooks/useFriends';
import { useAuth } from '../../../contexts/AuthContext';

interface FriendListProps {
  friends: Friend[];
  loading: boolean;
  showRemoveButton?: boolean;
}

export const FriendList: React.FC<FriendListProps> = ({ 
  friends, 
  loading,
  showRemoveButton = false
}) => {
  const { user } = useAuth();
  const { removeFriend } = useFriends(user?.id);

  const handleRemoveFriend = async (friendshipId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendshipId);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No friends yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <div 
          key={friend.id} 
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <Link 
              to={`/profile/${friend.id}`}
              className="flex items-center space-x-3 group flex-1 min-w-0"
            >
              <UserAvatar user={friend} size="md" />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate group-hover:text-violet-400 transition-colors">
                  {friend.name}
                </h4>
                <p className="text-sm text-gray-400 truncate">
                  {friend.university} University
                </p>
              </div>
            </Link>
            
            {showRemoveButton && friend.friendship_id && (
              <button
                onClick={() => handleRemoveFriend(friend.friendship_id!)}
                className="ml-2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Remove friend"
              >
                <UserX className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};