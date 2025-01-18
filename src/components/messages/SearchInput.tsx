import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  return (
    <div className="relative">
      <input
        type="text"
        {...props}
        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2
          text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
};