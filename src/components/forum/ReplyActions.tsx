import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReplyActionsProps {
  replyId: string;
  authorId: string;
  onEdit: () => void;
}

export const ReplyActions: React.FC<ReplyActionsProps> = ({ replyId, authorId, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  if (user?.id !== authorId) return null;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50
          transition-colors duration-200"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 border border-gray-700 
          shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onEdit();
              setShowMenu(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 
              hover:bg-gray-700/50 hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Reply
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 
              hover:bg-gray-700/50 hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Reply'}
          </button>
        </div>
      )}
    </div>
  );
};