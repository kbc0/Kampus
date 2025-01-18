import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SafetyWarningProps {
  onClose: () => void;
  className?: string;
}

export const SafetyWarning: React.FC<SafetyWarningProps> = ({ onClose, className = '' }) => {
  return (
    <div className={`bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="ml-3 text-sm text-yellow-300">
            While we strive to ensure your safety, please avoid sharing personal information 
            or meeting outside campus. Stay safe!
          </p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-yellow-500 hover:text-yellow-400 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};