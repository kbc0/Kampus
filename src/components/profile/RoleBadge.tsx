import React from 'react';
import { Shield, Award, User } from 'lucide-react';
import { ForumRole } from '../../types/forum';

interface RoleBadgeProps {
  role: ForumRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const badges = {
    admin: {
      icon: Shield,
      text: 'Admin',
      classes: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    moderator: {
      icon: Award,
      text: 'Moderator',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    user: {
      icon: User,
      text: 'Member',
      classes: 'bg-violet-500/10 text-violet-300 border-violet-500/30'
    }
  };

  const { icon: Icon, text, classes } = badges[role];

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      border ${classes} ${className}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {text}
    </div>
  );
};