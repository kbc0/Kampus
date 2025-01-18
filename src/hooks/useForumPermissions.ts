import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ForumRole } from '../types/forum';

export function useForumPermissions() {
  const { user } = useAuth();

  const checkPermission = async (requiredRole: ForumRole): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase.rpc('has_permission', {
      user_id_param: user.id,
      required_role: requiredRole
    });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data;
  };

  const isAdmin = async (): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase.rpc('is_admin', {
      user_id_param: user.id
    });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data;
  };

  const isModerator = async (categoryId?: string): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase.rpc('is_moderator', {
      user_id_param: user.id,
      category_id: categoryId
    });

    if (error) {
      console.error('Error checking moderator status:', error);
      return false;
    }

    return data;
  };

  return {
    checkPermission,
    isAdmin,
    isModerator
  };
}