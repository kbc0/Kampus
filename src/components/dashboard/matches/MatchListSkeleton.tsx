import React from 'react';

export const MatchListSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="mb-4">
        <div className="h-6 bg-gray-700 rounded w-1/4" />
        <div className="h-4 bg-gray-700 rounded w-3/4 mt-2" />
      </div>
      
      <div className="flex space-x-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-80 flex-shrink-0 bg-gray-800/50 rounded-xl border border-gray-700/50 p-5"
          >
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-gray-700 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-700 rounded w-3/4" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/3" />
              <div className="flex flex-wrap gap-2">
                {[1, 2].map((j) => (
                  <div key={j} className="h-6 w-20 bg-gray-700 rounded-full" />
                ))}
              </div>
            </div>
            <div className="h-10 bg-gray-700 rounded-lg mt-5" />
          </div>
        ))}
      </div>
    </div>
  );
};