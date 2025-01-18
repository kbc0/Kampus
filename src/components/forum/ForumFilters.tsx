import React from 'react';
import { Filter, TrendingUp, Clock } from 'lucide-react';
import { subjects } from '../../types/academic';

interface ForumFiltersProps {
  sort: 'latest' | 'trending';
  selectedSubject: string;
  onSortChange: (sort: 'latest' | 'trending') => void;
  onSubjectChange: (subject: string) => void;
}

export const ForumFilters: React.FC<ForumFiltersProps> = ({
  sort,
  selectedSubject,
  onSortChange,
  onSubjectChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Sort Buttons */}
      <div className="flex rounded-lg bg-gray-700/50 p-1">
        <button
          onClick={() => onSortChange('latest')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 ${
            sort === 'latest'
              ? "bg-violet-500 text-white shadow-lg"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4 mr-2" />
          Latest
        </button>
        <button
          onClick={() => onSortChange('trending')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 ${
            sort === 'trending'
              ? "bg-violet-500 text-white shadow-lg"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending
        </button>
      </div>

      {/* Subject Filter */}
      <div className="relative flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="bg-gray-700/50 border-0 rounded-lg text-sm py-2 pl-2 pr-8
            text-white focus:ring-2 focus:ring-violet-500 cursor-pointer
            appearance-none"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option 
              key={subject} 
              value={subject.toLowerCase().replace(/\s+/g, '-')}
              className="bg-gray-800"
            >
              {subject}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};