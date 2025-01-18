import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface AuthSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon: LucideIcon;
  label: string;
  options: { value: string; label: string }[];
}

export const AuthSelect: React.FC<AuthSelectProps> = ({ 
  icon: Icon, 
  label, 
  options,
  ...props 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative group">
        {/* Gradient border on focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff80b5] to-[#9089fc] rounded-xl opacity-0 
          group-focus-within:opacity-100 blur-sm transition-all duration-300" />
        
        {/* Select background with glass effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gray-800/50 rounded-xl backdrop-blur-sm" />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-[#ff80b5] transition-colors duration-300" />
          </div>
          <select
            {...props}
            className="relative block w-full pl-10 pr-10 py-2.5 bg-transparent border border-gray-700
              text-white rounded-xl appearance-none cursor-pointer
              focus:outline-none focus:border-transparent
              transition-all duration-300"
          >
            <option value="" disabled className="bg-gray-800">Select your university</option>
            {options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-gray-800"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};