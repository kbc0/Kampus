import React from 'react';
import { ArrowDown } from 'lucide-react';

interface ScrollButtonProps {
  show: boolean;
  onClick: () => void;
}

export const ScrollButton: React.FC<ScrollButtonProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 p-2 bg-violet-500 text-white rounded-full 
        shadow-lg hover:bg-violet-600 transition-all duration-200 z-10
        animate-in fade-in slide-in-from-bottom-2"
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="h-5 w-5" />
    </button>
  );
};