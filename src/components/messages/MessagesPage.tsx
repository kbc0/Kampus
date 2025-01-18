import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { MessageContainer } from './MessageContainer';
import { ConversationHeader } from './ConversationHeader';
import { useMessages } from '../../hooks/useMessages';
import { useMessageReadStatus } from '../../hooks/useMessageReadStatus';
import { MessageCircle, Users, UserPlus } from 'lucide-react';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { Button } from '../common/Button';
import { CreateGroupModal } from './groups/CreateGroupModal';
import { useGroupChats } from '../../hooks/useGroupChats';
import { GroupChatView } from './groups/GroupChatView';
import { NewMessageModal } from './NewMessageModal';

export const MessagesPage = () => {
  const { conversationId, groupId } = useParams();
  const [showConversations, setShowConversations] = useState(!conversationId && !groupId);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const { messages, sendMessage, loading: messagesLoading } = useMessages(conversationId);
  const { groups, loading: groupsLoading, createGroup } = useGroupChats();
  const navigate = useNavigate();

  useMessageReadStatus(conversationId);

  const handleCreateGroup = async (name: string, description: string, memberIds: string[]) => {
    await createGroup(name, description, memberIds);
    setShowCreateGroup(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-900">
      <DashboardHeader />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full bg-gray-800 border-gray-700 md:border md:rounded-lg md:m-6 md:shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            {/* Conversations List */}
            <div 
              className={`${
                showConversations ? 'block' : 'hidden'
              } md:block md:col-span-4 md:border-r border-gray-700 h-full overflow-hidden`}
            >
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowNewMessage(true)}
                        className="p-2 rounded-lg bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 
                          border border-violet-500/30 hover:border-violet-500/50 transition-all duration-200"
                        title="New Direct Message"
                      >
                        <UserPlus className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="p-2 rounded-lg bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 
                          border border-violet-500/30 hover:border-violet-500/50 transition-all duration-200"
                        title="New Group Chat"
                      >
                        <Users className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <MessageList 
                    onConversationSelect={() => setShowConversations(false)}
                    groups={groups}
                    groupsLoading={groupsLoading}
                  />
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              className={`${
                !showConversations ? 'flex' : 'hidden'
              } md:flex md:col-span-8 h-full flex-col bg-gray-800 relative`}
            >
              {conversationId ? (
                <>
                  <div className="flex-shrink-0 border-b border-gray-700 p-4">
                    <ConversationHeader onBack={() => setShowConversations(true)} />
                  </div>

                  <div className="flex-1 min-h-0">
                    <MessageContainer 
                      messages={messages} 
                      loading={messagesLoading}
                      onCloseSafetyWarning={() => {}}
                    />
                  </div>

                  <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800/95 
                    backdrop-blur-sm p-4 pb-safe">
                    <MessageInput onSend={sendMessage} />
                  </div>
                </>
              ) : groupId ? (
                <GroupChatView
                  groupId={groupId}
                  onBack={() => setShowConversations(true)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="bg-violet-500/10 rounded-full p-4 mb-4">
                    <MessageCircle className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    Welcome to Messages
                  </h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    Select a conversation or start a new one to begin messaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
        />
      )}
    </div>
  );
};