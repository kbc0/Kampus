import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, MessageSquare, UserPlus, Check, UserCheck, Trash2, AlertTriangle } from 'lucide-react';
import { Notification } from '../../types/notifications';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications,
  onClose
}) => {
  const navigate = useNavigate();
  const { markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const hasUnread = notifications.some(n => !n.read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5" />;
      case 'reply':
        return <MessageSquare className="h-5 w-5" />;
      case 'friend_request':
        return <UserPlus className="h-5 w-5" />;
      case 'friend_request_accepted':
        return <UserCheck className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'hover:bg-gray-700/50';
    }
  };

  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'message': {
        const unreadCount = notification.data.unread_count || 1;
        return (
          <>
            <span className="font-medium">{notification.data.sender_name}</span>
            {unreadCount > 1 ? (
              <> sent you {unreadCount} new messages</>
            ) : (
              <> sent you a message: <span className="text-gray-400">"{notification.data.content}"</span></>
            )}
          </>
        );
      }
      case 'reply':
        return (
          <>
            <span className="font-medium">{notification.data.author_name}</span>
            {' replied to your topic '}
            <span className="text-gray-400">"{notification.data.topic_title}"</span>
          </>
        );
      case 'friend_request':
        return (
          <>
            <span className="font-medium">{notification.data.sender_name}</span>
            {' sent you a friend request'}
            {notification.data.message && (
              <>: <span className="text-gray-400">"{notification.data.message}"</span></>
            )}
          </>
        );
      case 'friend_request_accepted':
        return (
          <>
            <span className="font-medium">{notification.data.receiver_name}</span>
            {' accepted your friend request'}
          </>
        );
      case 'warning':
        return (
          <div className="space-y-1">
            <p>
              <span className="font-medium text-yellow-400">Warning from {notification.data.warned_by}</span>
            </p>
            <p className="text-sm text-gray-400">"{notification.data.message}"</p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    switch (notification.type) {
      case 'message':
        navigate(`/messages/${notification.data.conversation_id}`);
        break;
      case 'reply':
        navigate(`/forum/topic/${notification.data.topic_id}`);
        break;
      case 'friend_request':
      case 'friend_request_accepted':
        navigate(`/profile/${notification.data.sender_id || notification.data.receiver_id}`);
        break;
      case 'warning':
        // Warnings don't navigate anywhere, just mark as read
        break;
    }

    onClose();
  };

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">No notifications</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">Notifications</span>
        <div className="flex items-center space-x-3">
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm text-violet-400 hover:text-violet-300 transition-colors duration-200"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </button>
          )}
          <button
            onClick={deleteAllNotifications}
            className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-700">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`relative group ${!notification.read ? 'bg-violet-500/10' : ''} ${getNotificationStyle(notification.type)}`}
          >
            <button
              onClick={() => handleClick(notification)}
              className="w-full text-left p-4 transition-colors duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 mt-1 ${
                  !notification.read ? 'text-violet-400' : 'text-gray-400'
                } ${notification.type === 'warning' ? 'text-yellow-400' : ''}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {getNotificationContent(notification)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => deleteNotification(notification.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 
                hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Delete notification"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};