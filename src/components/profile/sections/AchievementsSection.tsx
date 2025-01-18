import React from 'react';
import { Award, Plus } from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Achievement } from '../../../types/profile';
import { formatDate } from '../../../utils/dateUtils';

interface AchievementsSectionProps {
  achievements: Achievement[];
  isOwnProfile?: boolean;
  onAdd?: () => void;
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (achievement: Achievement) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  isOwnProfile,
  onAdd,
  onEdit,
  onDelete
}) => {
  const achievementTypes = {
    academic: {
      label: 'Academic',
      className: 'bg-violet-500/10 text-violet-300 border-violet-500/30'
    },
    award: {
      label: 'Award',
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    certification: {
      label: 'Certification',
      className: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
    },
    other: {
      label: 'Other',
      className: 'bg-gray-500/10 text-gray-300 border-gray-500/30'
    }
  };

  return (
    <Card
      title="Achievements"
      icon={Award}
      description="Academic and professional accomplishments"
    >
      {isOwnProfile && (
        <div className="mb-6">
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>
      )}

      {achievements.length === 0 ? (
        <p className="text-gray-400 text-center py-4">
          No achievements added yet
        </p>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-gray-700/30 rounded-lg border border-gray-700 p-4 
                hover:border-violet-500/30 transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-medium text-white">
                      {achievement.title}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${
                      achievementTypes[achievement.type].className
                    }`}>
                      {achievementTypes[achievement.type].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(achievement.date)}
                  </p>
                  <p className="text-gray-300 mt-2">
                    {achievement.description}
                  </p>
                </div>

                {isOwnProfile && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEdit?.(achievement)}
                      className="p-1 text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      <Award className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(achievement)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Award className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};