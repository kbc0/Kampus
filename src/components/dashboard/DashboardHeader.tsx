import React, { useState, useRef, useEffect } from 'react';
import { LogOut, GraduationCap, User, MessageCircle, Users, MessageSquare, ChevronDown, Settings, Search, Rocket, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { NotificationBell } from '../common/NotificationBell';
import { GlobalSearch } from './GlobalSearch';

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const socialDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (socialDropdownRef.current && !socialDropdownRef.current.contains(event.target as Node)) {
        setIsSocialOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const socialLinks = [
    { to: '/dashboard', icon: MessageSquare, label: 'Forum' },
    { to: '/matches', icon: Users, label: 'Matches' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <GraduationCap className="relative h-8 w-8 text-violet-400 group-hover:text-violet-300 transition-colors duration-300" />
            </div>
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-fuchsia-200">
              Kampus<span className="text-base">.chat</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* StartHub Button */}
            <Link
              to="/starthub"
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium
                bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white
                hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-200"
            >
              <Rocket className="h-5 w-5 mr-2" />
              StartHub
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/20">
                Beta
              </span>
            </Link>

            {/* Social Dropdown */}
            <div className="relative" ref={socialDropdownRef}>
              <button
                onClick={() => setIsSocialOpen(!isSocialOpen)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSocialOpen 
                    ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/20' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Users className="h-5 w-5 mr-2" />
                Social
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isSocialOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSocialOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 border border-gray-700 shadow-lg py-1 z-50">
                  {socialLinks.map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center px-4 py-2 text-sm ${
                        location.pathname === to
                          ? 'text-violet-400 bg-violet-500/10'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => setIsSocialOpen(false)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isProfileOpen 
                    ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/20' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 border border-gray-700 shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <NotificationBell />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 border-b border-gray-700">
            {/* StartHub */}
            <Link
              to="/starthub"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium
                bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Rocket className="h-5 w-5 mr-2" />
              StartHub
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/20">
                Beta
              </span>
            </Link>

            {/* Social Links */}
            {socialLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === to
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </Link>
            ))}

            {/* Search */}
            <button
              onClick={() => {
                setShowSearch(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>

            {/* Profile Links */}
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                signOut();
              }}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Global Search Overlay */}
      {showSearch && (
        <GlobalSearch onClose={() => setShowSearch(false)} />
      )}
    </nav>
  );
};