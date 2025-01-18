import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, MessageCircle, UserPlus, UserX, UserCheck, Edit, Camera } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { RoleBadge } from './RoleBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';
import { useFriends } from '../../hooks/useFriends';
import { ProfileDetails } from '../../types/profile';
import { Button } from '../common/Button';

interface ProfileHeaderProps {
  profile: ProfileDetails;
  isOwnProfile?: boolean;
  onEditCover?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  onEditCover
}) => {
  const { user } = useAuth();
  const { role: viewerRole } = useUserRole(user?.id || '');
  const { role: profileRole } = useUserRole(profile.id);
  const { friends, pendingRequests, sentRequests, sendFriendRequest, removeFriend } = useFriends(user?.id);

  const isFriend = friends.some(f => f.id === profile.id);
  const hasPendingRequest = pendingRequests.some(r => r.sender_id === profile.id);
  const hasSentRequest = sentRequests.some(r => r.receiver_id === profile.id);

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gray-800">
        {profile.cover_image_url ? (
          <img
            src={profile.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-gray-800/50" />
        )}
        
        {isOwnProfile && (
          <button
            onClick={onEditCover}
            className="absolute bottom-4 right-4 p-2 rounded-lg bg-gray-900/80 
              text-white hover:bg-gray-900/90 transition-colors duration-200"
          >
            <Camera className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4 -mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <UserAvatar user={profile} size="lg" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                      <RoleBadge role={profileRole} />
                    </div>
                    <div className="mt-1 text-violet-400">
                      {profile.university} University
                      {profile.major && ` • ${profile.major}`}
                      {profile.minor && ` • Minor in ${profile.minor}`}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile ? (
                    <div className="flex flex-wrap gap-2">
                      {isFriend ? (
                        <>
                          <Link
                            to={`/messages/${profile.id}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg
                              bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 
                              border border-violet-500/30 hover:border-violet-500/50
                              transition-all duration-300"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Link>
                          <Button
                            variant="secondary"
                            onClick={() => removeFriend(profile.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Unfriend
                          </Button>
                        </>
                      ) : hasPendingRequest ? (
                        <Button variant="secondary" disabled>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Request Pending
                        </Button>
                      ) : hasSentRequest ? (
                        <Button variant="secondary" disabled>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Request Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() => sendFriendRequest(profile.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/settings"
                      className="inline-flex items-center px-4 py-2 rounded-lg
                        bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 
                        border border-violet-500/30 hover:border-violet-500/50
                        transition-all duration-300"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-4 text-gray-300 text-lg">{profile.bio}</p>
                )}

                {/* Stats */}
                {profile.stats && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {profile.stats.topicsCount}
                      </div>
                      <div className="text-sm text-gray-400">Topics</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {profile.stats.repliesCount}
                      </div>
                      <div className="text-sm text-gray-400">Replies</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {profile.stats.likesReceivedCount}
                      </div>
                      <div className="text-sm text-gray-400">Likes Received</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {profile.stats.likesGivenCount}
                      </div>
                      <div className="text-sm text-gray-400">Likes Given</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {profile.stats.friendsCount}
                      </div>
                      <div className="text-sm text-gray-400">Friends</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};