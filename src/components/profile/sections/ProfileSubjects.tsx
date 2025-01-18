import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card } from '../../common/Card';

interface ProfileSubjectsProps {
  profile: {
    subjects?: {
      canHelp: string[];
      needsHelp: string[];
    };
  };
}

export const ProfileSubjects: React.FC<ProfileSubjectsProps> = ({ profile }) => {
  return (
    <div className="space-y-4">
      <Card
        title="Subjects I Can Help With"
        icon={BookOpen}
        description="Subjects they're confident in teaching others"
      >
        <div className="space-y-2">
          {profile.subjects?.canHelp?.length === 0 ? (
            <p className="text-gray-400 text-sm">No subjects added yet</p>
          ) : (
            profile.subjects?.canHelp?.map((subject) => (
              <div
                key={subject}
                className="px-3 py-2 rounded-lg text-sm
                  bg-violet-500/20 text-violet-300 border border-violet-500/30
                  hover:bg-violet-500/30 transition-colors duration-200"
              >
                {subject}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card
        title="Subjects I Need Help With"
        icon={BookOpen}
        description="Subjects they're looking to improve in"
      >
        <div className="space-y-2">
          {profile.subjects?.needsHelp?.length === 0 ? (
            <p className="text-gray-400 text-sm">No subjects added yet</p>
          ) : (
            profile.subjects?.needsHelp?.map((subject) => (
              <div
                key={subject}
                className="px-3 py-2 rounded-lg text-sm
                  bg-violet-500/20 text-violet-300 border border-violet-500/30
                  hover:bg-violet-500/30 transition-colors duration-200"
              >
                {subject}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};