import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { useClickOutside } from '../../hooks/useClickOutside';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed right-4 top-16 w-80 max-h-[32rem] overflow-y-auto rounded-lg bg-gray-800 border border-gray-700 shadow-lg z-50">
          <NotificationList notifications={notifications} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};