import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  children, 
  isLoading, 
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className="relative w-full group"
    >
      {/* Gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff80b5] to-[#9089fc] rounded-xl blur opacity-75 
        group-hover:opacity-100 transition-all duration-300" />
      
      {/* Button content */}
      <div className="relative flex items-center justify-center px-8 py-3 bg-gray-900 rounded-xl">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-medium">Please wait...</span>
          </div>
        ) : (
          <span className="text-white font-medium">{children}</span>
        )}
      </div>
    </button>
  );
};