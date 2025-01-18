import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const ForumHeader = () => {
  return (
    <>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-violet-500" />
                <span className="ml-2 text-xl font-bold text-white">StudyBuddy</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </>
  );
};