import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { GroupChat } from '../../../types/messages';
import { Button } from '../../common/Button';

interface GroupChatListProps {
  groups: GroupChat[];
  loading: boolean;
  onCreateGroup: () => void;
  onSelectGroup: () => void;
}

export const GroupChatList: React.FC<GroupChatListProps> = ({
  groups,
  loading,
  onCreateGroup,
  onSelectGroup
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-700/50 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Group Chats</h2>
          <Button onClick={onCreateGroup}>
            <Plus className="h-5 w-5 mr-2" />
            New Group
          </Button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2
              text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-400">No groups found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/messages/group/${group.id}`}
                onClick={onSelectGroup}
                className="block p-4 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium truncate">{group.name}</h3>
                      {group.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(group.lastMessage.created_at), { 
                            addSuffix: true 
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {group.memberCount} members
                    </p>
                    {group.lastMessage && (
                      <p className="text-sm text-gray-300 mt-1 truncate">
                        <span className="font-medium">{group.lastMessage.sender_name}:</span>
                        {' '}
                        {group.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};