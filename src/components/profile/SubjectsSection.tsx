import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { MultiSelect } from '../common/MultiSelect';
import { Button } from '../common/Button';
import { subjects } from '../../types/academic';

export const SubjectsSection = () => {
  const { user, updateProfile } = useAuth();
  const [canHelp, setCanHelp] = React.useState<string[]>(
    user?.user_metadata?.subjects?.canHelp || []
  );
  const [needsHelp, setNeedsHelp] = React.useState<string[]>(
    user?.user_metadata?.subjects?.needsHelp || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      subjects: { canHelp, needsHelp }
    });
  };

  return (
    <Card title="Subjects">
      <form onSubmit={handleSubmit} className="space-y-6">
        <MultiSelect
          label="Subjects I Can Help With"
          value={canHelp}
          onChange={setCanHelp}
          options={subjects}
        />
        <MultiSelect
          label="Subjects I Need Help With"
          value={needsHelp}
          onChange={setNeedsHelp}
          options={subjects}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Card>
  );
};