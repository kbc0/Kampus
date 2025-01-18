import React from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MessageHeader = () => {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <MessageCircle className="h-6 w-6 mr-2 text-violet-400" />
                Messages
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Chat with your study buddies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};