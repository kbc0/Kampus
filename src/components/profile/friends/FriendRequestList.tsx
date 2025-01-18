import React from 'react';
import { Check, X } from 'lucide-react';
import { FriendRequest } from '../../../types/friends';
import { UserAvatar } from '../../common/UserAvatar';

interface FriendRequestListProps {
  requests: FriendRequest[];
  onRespond: (requestId: string, accept: boolean) => Promise<void>;
}

export const FriendRequestList: React.FC<FriendRequestListProps> = ({ 
  requests,
  onRespond
}) => {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start space-x-4">
            <UserAvatar 
              user={{
                id: request.sender_id,
                name: request.sender?.name || '',
                avatar_url: request.sender?.avatar_url
              }}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">
                    {request.sender?.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {request.sender?.university} University
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRespond(request.id, true)}
                    className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                    title="Accept"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onRespond(request.id, false)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Decline"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {request.message && (
                <p className="mt-2 text-sm text-gray-300">
                  "{request.message}"
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};