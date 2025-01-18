import React from 'react';

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-lg',
    md: 'h-10 w-10 text-xl',
    lg: 'h-24 w-24 text-4xl'
  };

  // Safely get the first character of the name, defaulting to '?' if name is missing
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex-shrink-0">
      {user?.avatar_url ? (
        <img 
          src={user.avatar_url}
          alt={user.name || 'User avatar'}
          className={`${sizeClasses[size]} rounded-lg object-cover border border-violet-500/30`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-violet-500/20 rounded-lg 
          border border-violet-500/30 flex items-center justify-center`}>
          <span className="font-bold text-violet-300">
            {initial}
          </span>
        </div>
      )}
    </div>
  );
};