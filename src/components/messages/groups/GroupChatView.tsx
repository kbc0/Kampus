import React, { useState } from 'react';
import { ArrowLeft, Users, Plus, X } from 'lucide-react';
import { useGroupChat } from '../../../hooks/useGroupChat';
import { MessageContainer } from '../MessageContainer';
import { MessageInput } from '../MessageInput';
import { Button } from '../../common/Button';
import { AddMembersModal } from './AddMembersModal';
import { UserAvatar } from '../../common/UserAvatar';

interface GroupChatViewProps {
  groupId: string;
  onBack: () => void;
}

export const GroupChatView: React.FC<GroupChatViewProps> = ({
  groupId,
  onBack
}) => {
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const { 
    group,
    messages,
    loading,
    sendMessage,
    addMembers,
    removeMember
  } = useGroupChat(groupId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-400">Group not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="md:hidden text-gray-400 hover:text-white transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">{group.name}</h2>
              <p className="text-sm text-gray-400">
                {group.memberCount} members
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowMembers(!showMembers)}
              className={`h-9 ${showMembers ? 'bg-violet-500/20 text-violet-400' : ''}`}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex">
        {/* Messages */}
        <div className={`flex-1 min-w-0 ${showMembers ? 'hidden md:block' : ''}`}>
          <MessageContainer
            messages={messages}
            loading={loading}
            onCloseSafetyWarning={() => {}}
          />
        </div>

        {/* Members Sidebar */}
        {showMembers && (
          <div className={`w-full md:w-64 border-l border-gray-700 bg-gray-800 overflow-y-auto ${showMembers ? 'block' : 'hidden md:block'}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Members ({group.memberCount})
                </h3>
                <button
                  onClick={() => setShowMembers(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors md:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {group.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <UserAvatar 
                        user={{
                          id: member.id,
                          name: member.name,
                          avatar_url: member.avatar_url
                        }}
                        size="sm"
                      />
                      <div>
                        <span className="text-sm text-white">{member.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Remove member"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowAddMembers(true)}
                className="w-full mt-4 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 
                  border border-violet-500/30 hover:border-violet-500/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800/95 
        backdrop-blur-sm p-4 pb-safe">
        <MessageInput onSend={sendMessage} />
      </div>

      {/* Add Members Modal */}
      {showAddMembers && (
        <AddMembersModal
          groupId={groupId}
          onClose={() => setShowAddMembers(false)}
          onAdd={addMembers}
        />
      )}
    </div>
  );
};