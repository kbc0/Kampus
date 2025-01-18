import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { GroupChatList } from './groups/GroupChatList';
import { GroupChatView } from './groups/GroupChatView';
import { CreateGroupModal } from './groups/CreateGroupModal';
import { useGroupChats } from '../../hooks/useGroupChats';

export const GroupChatPage = () => {
  const { groupId } = useParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileList, setShowMobileList] = useState(!groupId);
  const { groups, loading, createGroup } = useGroupChats();

  const handleCreateGroup = async (name: string, description: string, memberIds: string[]) => {
    await createGroup(name, description, memberIds);
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-900">
      <DashboardHeader />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full bg-gray-800 border-gray-700 md:border md:rounded-lg md:m-6 md:shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            {/* Group List */}
            <div 
              className={`${
                showMobileList ? 'block' : 'hidden'
              } md:block md:col-span-4 md:border-r border-gray-700 h-full overflow-hidden`}
            >
              <GroupChatList
                groups={groups}
                loading={loading}
                onCreateGroup={() => setShowCreateModal(true)}
                onSelectGroup={() => setShowMobileList(false)}
              />
            </div>

            {/* Chat Area */}
            <div 
              className={`${
                !showMobileList ? 'flex' : 'hidden'
              } md:flex md:col-span-8 h-full flex-col bg-gray-800 relative`}
            >
              {groupId ? (
                <GroupChatView
                  groupId={groupId}
                  onBack={() => setShowMobileList(true)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <h3 className="text-xl font-medium text-white mb-2">
                    Welcome to Group Chats
                  </h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    Select a group chat to start messaging or create a new group.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
};