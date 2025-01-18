import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  children 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-6 w-6 text-violet-400" />}
          <div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-400">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
};