import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { useFriends } from '../../hooks/useFriends';
import { findExistingConversation, createConversation } from '../../services/conversationService';

interface NewMessageModalProps {
  onClose: () => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { friends } = useFriends(user?.id);
  const navigate = useNavigate();

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFriend = async (friendId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check for existing conversation
      const existingConv = await findExistingConversation(user.id, friendId);
      let conversationId = existingConv?.id;

      // Create new conversation if none exists
      if (!conversationId) {
        const newConv = await createConversation(user.id, friendId);
        conversationId = newConv.id;
      }

      navigate(`/messages/${conversationId}`);
      onClose();
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Focus search input on mount
  useEffect(() => {
    const input = document.getElementById('new-message-search');
    if (input) {
      input.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">New Message</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            id="new-message-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2
              text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400">
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend.id)}
                  disabled={loading}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700/50 
                    transition-colors duration-200 disabled:opacity-50"
                >
                  <UserAvatar user={friend} size="sm" />
                  <div className="ml-3 text-left">
                    <p className="text-white font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-400">
                      {friend.university} University
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};