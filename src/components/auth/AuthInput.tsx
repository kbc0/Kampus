import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ 
  icon: Icon, 
  label, 
  error,
  className = '',
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
        
        {/* Input background with glass effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gray-800/50 rounded-xl backdrop-blur-sm" />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-[#ff80b5] transition-colors duration-300" />
          </div>
          <input
            {...props}
            className={`relative block w-full pl-10 pr-3 py-2.5 bg-transparent border border-gray-700
              text-white rounded-xl placeholder-gray-400
              focus:outline-none focus:border-transparent
              transition-all duration-300 ${className}`}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};