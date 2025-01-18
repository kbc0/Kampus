import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useConversations } from '../../hooks/useConversations';
import { UserAvatar } from '../common/UserAvatar';
import { Search, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GroupChat } from '../../types/messages';

interface MessageListProps {
  onConversationSelect: () => void;
  groups: GroupChat[];
  groupsLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  onConversationSelect,
  groups,
  groupsLoading
}) => {
  const { conversations, loading } = useConversations();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user } = useAuth();

  const filteredItems = [
    ...conversations.map(conv => ({
      type: 'direct' as const,
      id: conv.id,
      name: conv.otherUser.name,
      avatar: conv.otherUser.avatar_url,
      lastMessage: conv.lastMessage?.content,
      lastMessageTime: conv.lastMessage?.created_at,
      unreadCount: conv.unreadCount
    })),
    ...groups.map(group => ({
      type: 'group' as const,
      id: group.id,
      name: group.name,
      memberCount: group.memberCount,
      lastMessage: group.lastMessage?.content,
      lastMessageTime: group.lastMessage?.created_at,
      lastMessageSender: group.lastMessage?.sender_name
    }))
  ].filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    const aTime = a.lastMessageTime || '';
    const bTime = b.lastMessageTime || '';
    return bTime.localeCompare(aTime);
  });

  if (loading || groupsLoading) {
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
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2
              text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-400">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredItems.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.type === 'direct' ? `/messages/${item.id}` : `/messages/group/${item.id}`}
                onClick={onConversationSelect}
                className="block p-4 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-start space-x-4">
                  {item.type === 'direct' ? (
                    <UserAvatar 
                      user={{
                        id: item.id,
                        name: item.name,
                        avatar_url: item.avatar
                      }}
                      size="md"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-violet-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-sm font-medium truncate ${
                          item.type === 'direct' && item.unreadCount ? 'text-violet-400' : 'text-white'
                        }`}>
                          {item.name}
                        </p>
                        {item.type === 'group' && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.memberCount} members
                          </p>
                        )}
                      </div>
                      {item.lastMessageTime && (
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(item.lastMessageTime), { 
                              addSuffix: true 
                            })}
                          </p>
                          {item.type === 'direct' && item.unreadCount > 0 && (
                            <span className="flex h-5 min-w-[1.25rem] items-center justify-center 
                              rounded-full bg-violet-500 px-1.5 text-xs font-medium text-white">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {item.lastMessage && (
                      <p className={`text-sm truncate mt-1 ${
                        item.type === 'direct' && item.unreadCount ? 'text-violet-300 font-medium' : 'text-gray-300'
                      }`}>
                        {item.type === 'group' && item.lastMessageSender && (
                          <span className="font-medium">{item.lastMessageSender}: </span>
                        )}
                        {item.lastMessage}
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