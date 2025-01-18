import React from 'react';
import { GraduationCap, BookOpen, Award, Calendar } from 'lucide-react';
import { Card } from '../../common/Card';
import { formatDate } from '../../../utils/dateUtils';

interface ProfileAcademicInfoProps {
  profile: {
    university: string;
    major?: string;
    minor?: string;
    created_at: string;
  };
}

export const ProfileAcademicInfo: React.FC<ProfileAcademicInfoProps> = ({ profile }) => {
  return (
    <Card
      title="Academic Information"
      icon={GraduationCap}
      description="Educational background"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-5 w-5 text-violet-400" />
            <div>
              <p className="text-sm text-gray-400">University</p>
              <p className="text-white">{profile.university} University</p>
            </div>
          </div>
          {profile.major && (
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-violet-400" />
              <div>
                <p className="text-sm text-gray-400">Major</p>
                <p className="text-white">{profile.major}</p>
              </div>
            </div>
          )}
          {profile.minor && (
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-violet-400" />
              <div>
                <p className="text-sm text-gray-400">Minor</p>
                <p className="text-white">{profile.minor}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-violet-400" />
            <div>
              <p className="text-sm text-gray-400">Joined</p>
              <p className="text-white">{formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};