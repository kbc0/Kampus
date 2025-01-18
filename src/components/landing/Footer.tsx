import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-400 hover:text-violet-400">
            About Us
          </a>
          <a href="#" className="text-gray-400 hover:text-violet-400">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-violet-400">
            Contact
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-violet-500" />
            <p className="ml-2 text-center text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} Kampüs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};