import React from 'react';

interface DateDividerProps {
  date: string;
}

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  return (
    <div className="sticky top-2 z-10 flex items-center justify-center">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
        <span className="text-xs font-medium text-gray-300">{date}</span>
      </div>
    </div>
  );
};