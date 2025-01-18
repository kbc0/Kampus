import React from 'react';
import { AlertTriangle, Lock, Pin, Trash2, Flag } from 'lucide-react';
import { Button } from '../../common/Button';
import { useForumPermissions } from '../../../hooks/useForumPermissions';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ModeratorToolsProps {
  topicId: string;
  categoryId: string;
  isPinned: boolean;
  isLocked: boolean;
  onStatusChange: () => void;
}

export const ModeratorTools: React.FC<ModeratorToolsProps> = ({
  topicId,
  categoryId,
  isPinned,
  isLocked,
  onStatusChange
}) => {
  const { isModerator } = useForumPermissions();
  const [canModerate, setCanModerate] = React.useState(false);

  React.useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await isModerator(categoryId);
      setCanModerate(hasPermission);
    };

    checkPermissions();
  }, [categoryId, isModerator]);

  const handlePin = async () => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !isPinned })
        .eq('id', topicId);

      if (error) throw error;

      await supabase.rpc('log_moderation_action', {
        action_type: isPinned ? 'unpin_topic' : 'pin_topic',
        resource_type: 'topic',
        resource_id: topicId
      });

      onStatusChange();
      toast.success(isPinned ? 'Topic unpinned' : 'Topic pinned');
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  const handleLock = async () => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: !isLocked })
        .eq('id', topicId);

      if (error) throw error;

      await supabase.rpc('log_moderation_action', {
        action_type: isLocked ? 'unlock_topic' : 'lock_topic',
        resource_type: 'topic',
        resource_id: topicId
      });

      onStatusChange();
      toast.success(isLocked ? 'Topic unlocked' : 'Topic locked');
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  if (!canModerate) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handlePin}
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <Pin className="h-4 w-4" />
        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
      </Button>

      <Button
        onClick={handleLock}
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <Lock className="h-4 w-4" />
        <span>{isLocked ? 'Unlock' : 'Lock'}</span>
      </Button>

      <Button
        variant="secondary"
        className="flex items-center space-x-2 text-red-400 hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </Button>

      <Button
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <Flag className="h-4 w-4" />
        <span>Reports</span>
      </Button>

      <Button
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Warnings</span>
      </Button>
    </div>
  );
};