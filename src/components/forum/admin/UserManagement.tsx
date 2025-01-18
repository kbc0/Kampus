import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, AlertTriangle, Ban } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { UserRoleManager } from './UserRoleManager';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  university: string;
  role: string;
  created_at: string;
  banned: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          university,
          created_at,
          user_roles!left (
            forum_roles (
              role
            )
          ),
          bans:user_bans!user_bans_user_id_fkey (
            id,
            lifted_at
          )
        `);

      if (error) throw error;

      const formattedUsers = profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.name,
        university: profile.university,
        role: profile.user_roles?.[0]?.forum_roles?.role || 'user',
        created_at: profile.created_at,
        banned: profile.bans?.some((ban: any) => ban.lifted_at === null) || false
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    const duration = parseInt(prompt('Enter ban duration in days (leave empty for permanent):', '') || '0');

    try {
      await supabase.rpc('ban_user', {
        user_id_param: userId,
        reason_param: reason,
        duration_days: duration || null
      });

      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleWarnUser = async (userId: string) => {
    const warning = prompt('Enter warning message:');
    if (!warning) return;

    try {
      await supabase.rpc('warn_user', {
        user_id_param: userId,
        warning_message: warning
      });

      toast.success('Warning sent successfully');
    } catch (error) {
      console.error('Error warning user:', error);
      toast.error('Failed to send warning');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-full max-w-md" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            label=""
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label=""
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            icon={Filter}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admins' },
              { value: 'moderator', label: 'Moderators' },
              { value: 'user', label: 'Users' }
            ]}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.university}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                        user.role === 'moderator' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-violet-500/10 text-violet-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.university}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.banned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user.id);
                          setShowRoleModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-violet-400 transition-colors"
                        title="Manage Role"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleWarnUser(user.id)}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Warn User"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Ban User"
                        disabled={user.banned}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Manage User Role</h3>
            <UserRoleManager 
              userId={selectedUser}
              onUpdate={() => {
                setShowRoleModal(false);
                fetchUsers();
              }}
            />
            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};