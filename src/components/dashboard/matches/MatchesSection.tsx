import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '../../common/Card';
import { MatchList } from './MatchList';
import { useAuth } from '../../../contexts/AuthContext';

export const MatchesSection = () => {
  const { user } = useAuth();
  const userSubjects = user?.user_metadata?.subjects;

  return (
    <Card
      title="Your Matches"
      description="Connect with students who can help you or need your help"
      icon={Users}
    >
      <div className="space-y-4 sm:space-y-6 -mx-4 sm:mx-0">
        <MatchList
          title="Matches you can help"
          description="Students who need help with subjects you're good at"
          type="canHelp"
          subjects={userSubjects?.canHelp || []}
        />
        
        <div className="border-t border-gray-700" />
        
        <MatchList
          title="Matches that can help you"
          description="Students who can help you with subjects you need help with"
          type="needsHelp"
          subjects={userSubjects?.needsHelp || []}
        />
      </div>
    </Card>
  );
};