
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NOTIFICATIONS } from '../constants';
import { Notification, User } from '../types';
import { notificationsApi, socketClient } from '../lib/api';

interface NotificationsProps {
  user: User;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const userId = user.id;

  // Load notifications from backend API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const apiNotifications = await notificationsApi.getNotifications(userId);
        if (apiNotifications.length > 0) {
          setNotifications(apiNotifications as Notification[]);
          return;
        }
      } catch (error) {
        console.warn('Backend unavailable for notifications, using local data:', error);
      }

      const stored = localStorage.getItem('nexus_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(NOTIFICATIONS);
        localStorage.setItem('nexus_notifications', JSON.stringify(NOTIFICATIONS));
      }
    };

    loadNotifications();

    // Initialize WebSocket for real-time notifications
    socketClient.connect();
    socketClient.join(userId);

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socketClient.on('notification', handleNotification);

    return () => {
      socketClient.off('notification', handleNotification);
    };
  }, [userId]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('nexus_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead(userId);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Fallback to local state update
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  // Mark individual notification as read
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Fallback to local state update
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setDropdownOpen(null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Fallback to local state update
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setDropdownOpen(null);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    const readFilter = filter === 'all' || 
      (filter === 'unread' && !notif.read) || 
      (filter === 'read' && notif.read);
    
    const typeFilterMatch = typeFilter === 'all' || notif.type === typeFilter;
    
    return readFilter && typeFilterMatch;
  });

  // Sort by createdAt (newest first)
  const sortedNotifications = filteredNotifications.sort((a, b) => b.createdAt - a.createdAt);

  // Separate into new (unread) and earlier (read)
  const newNotifications = sortedNotifications.filter(n => !n.read);
  const earlierNotifications = sortedNotifications.filter(n => n.read);

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      mention: 'fa-at',
      reply: 'fa-reply',
      like: 'fa-heart',
      follow: 'fa-user-plus',
      solution: 'fa-lightbulb',
      vote: 'fa-star',
      system: 'fa-bell'
    };
    return icons[type] || 'fa-bell';
  };

  // Get notification type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mention: 'bg-purple-500',
      reply: 'bg-blue-500',
      like: 'bg-red-500',
      follow: 'bg-green-500',
      solution: 'bg-yellow-500',
      vote: 'bg-orange-500',
      system: 'bg-gray-500'
    };
    return colors[type] || 'bg-blue-500';
  };

  return (
    <div className="max-w-[800px] mx-auto p-4 bg-white min-h-screen shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="mention">Mentions</option>
            <option value="reply">Replies</option>
            <option value="like">Likes</option>
            <option value="follow">Follows</option>
            <option value="solution">Solutions</option>
            <option value="vote">Votes</option>
            <option value="system">System</option>
          </select>
          <button 
            onClick={markAllAsRead}
            className="text-blue-500 hover:bg-blue-50 p-2 rounded-full font-semibold"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {newNotifications.length > 0 && (
          <>
            <h3 className="font-bold text-[17px] py-2 px-2">New</h3>
            {newNotifications.map(notif => (
              <div 
                key={notif.id}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.actionUrl) {
                    // Navigate to actionUrl (would use router in real app)
                    console.log('Navigate to:', notif.actionUrl);
                  }
                }}
              >
                <div className="relative">
                  <img src={notif.avatar} className="w-14 h-14 rounded-full" alt="Notif" />
                  <div className={`absolute bottom-0 right-0 w-6 h-6 ${getTypeColor(notif.type)} border-4 border-white rounded-full flex items-center justify-center text-white text-[10px]`}>
                    <i className={`fa-solid ${getTypeIcon(notif.type)}`}></i>
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-[15px] ${!notif.read ? 'font-bold' : ''}`}>{notif.text}</p>
                  <p className="text-xs text-blue-500 font-semibold">{notif.time}</p>
                </div>
                {!notif.read && (
                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(dropdownOpen === notif.id ? null : notif.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full"
                  >
                    <i className="fa-solid fa-ellipsis"></i>
                  </button>
                  {dropdownOpen === notif.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                          setDropdownOpen(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Mark as read
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        
        {earlierNotifications.length > 0 && (
          <>
            <h3 className="font-bold text-[17px] py-2 px-2 mt-4 border-t border-gray-200">Earlier</h3>
            {earlierNotifications.map(notif => (
              <div 
                key={notif.id}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  if (notif.actionUrl) {
                    console.log('Navigate to:', notif.actionUrl);
                  }
                }}
              >
                <div className="relative">
                  <img src={notif.avatar} className="w-14 h-14 rounded-full" alt="Notif" />
                  <div className={`absolute bottom-0 right-0 w-6 h-6 ${getTypeColor(notif.type)} border-4 border-white rounded-full flex items-center justify-center text-white text-[10px]`}>
                    <i className={`fa-solid ${getTypeIcon(notif.type)}`}></i>
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-[15px] ${!notif.read ? 'font-bold' : ''}`}>{notif.text}</p>
                  <p className="text-xs text-blue-500 font-semibold">{notif.time}</p>
                </div>
                {!notif.read && (
                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(dropdownOpen === notif.id ? null : notif.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full"
                  >
                    <i className="fa-solid fa-ellipsis"></i>
                  </button>
                  {dropdownOpen === notif.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {sortedNotifications.length === 0 && (
          <p className="text-center text-gray-500 py-8 italic">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
