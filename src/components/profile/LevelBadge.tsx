import React from 'react';
import { Trophy } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  title: string;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  title,
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      bg-violet-500/10 text-violet-300 border border-violet-500/30 ${className}`}>
      <Trophy className="w-3.5 h-3.5 mr-1" />
      <span>Level {level} • {title}</span>
    </div>
  );
};