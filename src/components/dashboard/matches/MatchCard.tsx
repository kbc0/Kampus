import React from 'react';
import { GraduationCap, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar } from '../../common/UserAvatar';

interface MatchCardProps {
  id: string;
  name: string;
  university: string;
  major?: string;
  minor?: string;
  avatar_url?: string;
  matchingSubjects: string[];
}

export const MatchCard: React.FC<MatchCardProps> = ({
  id,
  name,
  university,
  major,
  minor,
  avatar_url,
  matchingSubjects,
}) => {
  return (
    <div className="w-[280px] flex flex-col h-[320px] bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 
      hover:border-violet-500/30 hover:bg-gray-800/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start space-x-4">
        <Link to={`/profile/${id}`}>
          <UserAvatar 
            user={{ id, name, avatar_url }}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${id}`}
            className="hover:text-violet-400 transition-colors duration-200"
          >
            <h4 className="text-lg font-medium text-white truncate">{name}</h4>
          </Link>
          <div className="flex items-center text-sm text-gray-400 mt-1">
            <GraduationCap className="h-4 w-4 mr-1.5 text-violet-400 flex-shrink-0" />
            <span className="truncate">{university} University</span>
          </div>
        </div>
      </div>

      {/* Academic Info */}
      {(major || minor) && (
        <div className="mt-3 space-y-1">
          {major && (
            <p className="text-sm text-gray-300">
              Major: <span className="text-violet-300">{major}</span>
            </p>
          )}
          {minor && (
            <p className="text-sm text-gray-300">
              Minor: <span className="text-violet-300">{minor}</span>
            </p>
          )}
        </div>
      )}

      {/* Subjects */}
      <div className="mt-3 flex-1">
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <BookOpen className="h-4 w-4 mr-1.5 text-violet-400" />
          <span>Matching Subjects:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {matchingSubjects.map((subject) => (
            <span
              key={subject}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                bg-violet-500/20 text-violet-300 border border-violet-500/30"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* See Profile Button */}
      <Link
        to={`/profile/${id}`}
        className="mt-3 w-full flex items-center justify-center px-3 py-2 rounded-lg
          bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 
          border border-violet-500/30 hover:border-violet-500/50
          transition-all duration-300 text-sm font-medium"
      >
        <User className="h-4 w-4 mr-1.5" />
        See Profile
      </Link>
    </div>
  );
};