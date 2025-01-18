import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { universityPrograms } from '../../types/academic';

export const AcademicInfoSection = () => {
  const { user, updateProfile } = useAuth();
  const university = user?.user_metadata?.university as keyof typeof universityPrograms;
  const [major, setMajor] = React.useState(user?.user_metadata?.major || '');
  const [minor, setMinor] = React.useState(user?.user_metadata?.minor || '');

  const programs = university ? universityPrograms[university] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ major, minor });
  };

  if (!programs) return null;

  return (
    <Card title="Academic Information">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Major"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          options={programs.majors.map(m => ({ value: m, label: m }))}
          required
        />
        <Select
          label="Minor (Optional)"
          value={minor}
          onChange={(e) => setMinor(e.target.value)}
          options={programs.minors.map(m => ({ value: m, label: m }))}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Card>
  );
};