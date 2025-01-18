import React from 'react';
import { BookOpen } from 'lucide-react';

interface SubjectSectionProps {
  title: string;
  subjects: string[];
  emptyMessage: string;
  type: 'canHelp' | 'needsHelp';
}

export const SubjectSection: React.FC<SubjectSectionProps> = ({
  title,
  subjects,
  emptyMessage,
  type,
}) => {
  return (
    <div className="bg-gray-700/30 overflow-hidden shadow-lg rounded-lg border border-gray-700">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <BookOpen className="h-6 w-6 text-violet-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-300 truncate">
                {title}
              </dt>
              <dd className="mt-3">
                {subjects.length === 0 ? (
                  <p className="text-sm text-gray-400">{emptyMessage}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                          text-xs font-medium bg-violet-500/20 text-violet-300 
                          border border-violet-500/30"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};