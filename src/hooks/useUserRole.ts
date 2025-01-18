import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ForumRole } from '../types/forum';

export function useUserRole(userId: string) {
  const [role, setRole] = useState<ForumRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId) {
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        // Use RPC function to get role directly
        const { data: userRole, error } = await supabase.rpc('get_user_role', {
          user_id_param: userId
        });

        if (error) throw error;
        setRole(userRole || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userId]);

  return { role, loading };
}