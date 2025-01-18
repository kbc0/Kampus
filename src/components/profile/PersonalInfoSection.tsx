import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const PersonalInfoSection = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = React.useState(user?.user_metadata?.name || '');
  const [bio, setBio] = React.useState(user?.user_metadata?.bio || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, bio });
  };

  return (
    <Card title="Personal Information">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 
              text-white shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </Card>
  );
};