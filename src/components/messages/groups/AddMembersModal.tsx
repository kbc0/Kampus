import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../common/Button';
import { useFriends } from '../../../hooks/useFriends';
import { useAuth } from '../../../contexts/AuthContext';
import { UserAvatar } from '../../common/UserAvatar';

interface AddMembersModalProps {
  groupId: string;
  onClose: () => void;
  onAdd: (memberIds: string[]) => Promise<void>;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
  groupId,
  onClose,
  onAdd
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { friends } = useFriends(user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) return;

    setSubmitting(true);
    try {
      await onAdd(selectedMembers);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Add Members</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => toggleMember(friend.id)}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors
                  ${selectedMembers.includes(friend.id)
                    ? 'bg-violet-500/20 border border-violet-500/30'
                    : 'hover:bg-gray-700/50'
                  }`}
              >
                <UserAvatar user={friend} size="sm" />
                <span className="ml-3 text-white">{friend.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              disabled={selectedMembers.length === 0}
            >
              Add Members
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};