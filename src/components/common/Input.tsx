import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`block w-full rounded-lg bg-gray-700 border-gray-600 
            text-white shadow-sm placeholder:text-gray-400
            focus:border-violet-500 focus:ring-violet-500
            disabled:opacity-60 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 ${className}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600'}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};