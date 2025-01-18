import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  depth?: number;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: LucideIcon;
  error?: string;
  description?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = '',
  placeholder = 'Select an option',
  required,
  icon: Icon,
  error,
  description,
  ...props
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-400 mb-2">{description}</p>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <select
          className={`block w-full rounded-lg bg-gray-700 
            text-white shadow-sm 
            disabled:opacity-60 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 ${className}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-violet-500 focus:ring-violet-500'}`}
          required={required}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="py-2 px-3 hover:bg-gray-600 cursor-pointer"
              style={{ 
                paddingLeft: option.depth ? `${option.depth * 1.5}rem` : '0.75rem',
                backgroundColor: '#374151',
                color: 'white'
              }}
            >
              {option.depth ? (
                <>
                  {option.depth > 0 && (
                    <span className="text-gray-400">
                      {'└'.repeat(option.depth)}{'─ '}
                    </span>
                  )}
                  {option.label}
                </>
              ) : (
                option.label
              )}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};