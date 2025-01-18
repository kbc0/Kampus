import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useConversation } from '../../hooks/useConversation';
import { UserAvatar } from '../common/UserAvatar';
import { ArrowLeft } from 'lucide-react';

interface ConversationHeaderProps {
  onBack: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({ onBack }) => {
  const { conversationId } = useParams();
  const { otherUser, loading } = useConversation(conversationId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="h-10 w-10 bg-gray-700 rounded-lg" />
        <div className="h-4 w-32 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!otherUser) return null;

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onBack}
        className="md:hidden text-gray-400 hover:text-white"
        aria-label="Back to conversations"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      
      <button onClick={() => navigate(`/profile/${otherUser.id}`)}>
        <UserAvatar 
          user={{
            id: otherUser.id,
            name: otherUser.name,
            avatar_url: otherUser.avatar_url
          }}
          size="md" 
        />
      </button>
      
      <div className="flex-1 min-w-0">
        <button 
          onClick={() => navigate(`/profile/${otherUser.id}`)}
          className="block text-left"
        >
          <h3 className="text-lg font-medium text-white truncate">
            {otherUser.name}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {otherUser.university} University
          </p>
        </button>
      </div>
      
      <Link
        to={`/profile/${otherUser.id}`}
        className="text-sm text-violet-400 hover:text-violet-300 transition-colors duration-200 hidden md:block"
      >
        View Profile
      </Link>
    </div>
  );
};