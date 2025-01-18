import React, { useState } from 'react';
import { BookOpen, HelpCircle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../common/Card';
import { MultiSelect } from '../../common/MultiSelect';
import { Button } from '../../common/Button';
import { subjects } from '../../../types/academic';
import { toast } from 'react-hot-toast';

export const SubjectsSection = () => {
  const { user, updateProfile } = useAuth();
  const [canHelp, setCanHelp] = useState<string[]>(
    user?.user_metadata?.subjects?.canHelp || []
  );
  const [needsHelp, setNeedsHelp] = useState<string[]>(
    user?.user_metadata?.subjects?.needsHelp || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        subjects: { canHelp, needsHelp }
      });
      toast.success('Subject preferences updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating subjects:', error);
      toast.error('Failed to update subject preferences');
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title="Subject Preferences"
      description="Select subjects you can help with and subjects you need help with"
      icon={BookOpen}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <MultiSelect
          label="Subjects I Can Help With"
          value={canHelp}
          onChange={setCanHelp}
          options={subjects}
          icon={Lightbulb}
          description="Select subjects you're confident in and can help others with"
          disabled={isSubmitting}
        />
        <MultiSelect
          label="Subjects I Need Help With"
          value={needsHelp}
          onChange={setNeedsHelp}
          options={subjects}
          icon={HelpCircle}
          description="Select subjects you'd like to receive help with"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};