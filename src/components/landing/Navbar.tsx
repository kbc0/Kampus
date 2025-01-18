import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="relative bg-gray-900 border-b border-gray-800">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-violet-500/5" />
      
      {/* Glass effect */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <GraduationCap className="relative h-8 w-8 text-violet-400 group-hover:text-violet-300 transition-colors duration-300" />
            </div>
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-fuchsia-200">
              Kampus<span className="text-base">.chat</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-violet-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-violet-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};