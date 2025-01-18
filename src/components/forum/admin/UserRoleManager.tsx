import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { UserRole, ForumRole } from '../../../types/forum';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { toast } from 'react-hot-toast';

interface UserRoleManagerProps {
  userId: string;
  onUpdate?: () => void;
}

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ 
  userId,
  onUpdate 
}) => {
  const [currentRole, setCurrentRole] = useState<ForumRole>('user');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*, role:forum_roles(role)')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        if (data?.role?.role) {
          setCurrentRole(data.role.role as ForumRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userId]);

  const handleRoleChange = async (newRole: ForumRole) => {
    setUpdating(true);
    try {
      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('forum_roles')
        .select('id')
        .eq('role', newRole)
        .single();

      if (roleError) throw roleError;

      // Update user role
      const { error: updateError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleData.id
        });

      if (updateError) throw updateError;

      setCurrentRole(newRole);
      toast.success('User role updated successfully');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Select
        label="User Role"
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as ForumRole)}
        options={[
          { value: 'user', label: 'User' },
          { value: 'moderator', label: 'Moderator' },
          { value: 'admin', label: 'Admin' }
        ]}
        disabled={updating}
      />
    </div>
  );
};