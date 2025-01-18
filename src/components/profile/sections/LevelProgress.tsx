import React from 'react';
import { Trophy } from 'lucide-react';
import { Card } from '../../common/Card';

interface LevelProgressProps {
  level: number;
  levelTitle: string;
  xp: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ 
  level,
  levelTitle,
  xp
}) => {
  // Calculate XP needed for next level (100 XP per level)
  const xpPerLevel = 100;
  const nextLevelXp = level * xpPerLevel;
  const currentLevelXp = xp % xpPerLevel;
  const progressPercentage = (currentLevelXp / xpPerLevel) * 100;

  return (
    <Card
      title="Level Progress"
      icon={Trophy}
      description={`Level ${level} - ${levelTitle}`}
    >
      <div className="space-y-4">
        {/* XP Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{currentLevelXp} XP</span>
            <span>{nextLevelXp} XP</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {nextLevelXp - currentLevelXp} XP until next level
          </p>
        </div>

        {/* Level Info */}
        <div className="bg-violet-500/10 rounded-lg border border-violet-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-white">
                {levelTitle}
              </h4>
              <p className="text-sm text-gray-400">
                Level {level}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-violet-400" />
          </div>
        </div>

        {/* XP Breakdown */}
        <div className="text-sm text-gray-400">
          <p className="mb-2">How to earn XP:</p>
          <ul className="space-y-1">
            <li>• Create a topic: 10 XP</li>
            <li>• Post a reply: 5 XP</li>
            <li>• Receive a like: 2 XP</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};