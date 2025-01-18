import React from 'react';
import { X, LucideIcon } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: readonly string[];
  icon?: LucideIcon;
  description?: string;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  description,
  error,
}) => {
  const handleSelect = (option: string) => {
    if (!value.includes(option)) {
      onChange([...value, option]);
    }
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

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
          onChange={(e) => handleSelect(e.target.value)}
          value=""
          className={`block w-full rounded-lg bg-gray-700 
            text-white shadow-sm focus:border-violet-500 focus:ring-violet-500
            ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5
            ${error ? 'border-red-500' : 'border-gray-600'}`}
        >
          <option value="" disabled>Select subjects...</option>
          {options.filter(o => !value.includes(o)).map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map(item => (
          <span
            key={item}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm
              bg-violet-500/20 text-violet-300 border border-violet-500/30"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="ml-2 inline-flex items-center p-0.5 hover:bg-violet-500/30 
                rounded-full transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};