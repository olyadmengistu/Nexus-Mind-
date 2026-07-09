
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NOTIFICATIONS } from '../constants';
import { Notification, User } from '../types';
import { notificationsApi } from '../lib/firebaseApi';

interface NotificationsProps {
  user: User;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userId = user.id;

  // Load notifications from backend
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const apiNotifications = await notificationsApi.getNotifications(50);
        // Transform backend data to match frontend Notification type
        const transformedNotifications = apiNotifications.map((notif: any) => ({
          id: notif.id,
          userId: notif.userId,
          type: notif.type || 'system',
          text: notif.text || 'New notification',
          avatar: notif.avatar || 'https://picsum.photos/seed/default/100/100',
          read: notif.read || false,
          time: notif.createdAt ? formatTime(new Date(notif.createdAt).getTime()) : 'Just now',
          createdAt: notif.createdAt ? new Date(notif.createdAt).getTime() : Date.now(),
          actionUrl: notif.actionUrl || null
        })) as Notification[];
        
        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Error loading notifications from backend:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
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

  function formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }


  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
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
      system: 'fa-bell',
      streak_reminder: 'fa-fire',
      streak_milestone: 'fa-trophy',
      streak_warning: 'fa-triangle-exclamation',
      badge_earned: 'fa-medal'
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
      system: 'bg-gray-500',
      streak_reminder: 'bg-orange-500',
      streak_milestone: 'bg-yellow-500',
      streak_warning: 'bg-red-500',
      badge_earned: 'bg-purple-500'
    };
    return colors[type] || 'bg-blue-500';
  };

  return (
    <div className="max-w-[800px] mx-auto p-2.5 sm:p-4 bg-white min-h-screen sm:shadow">
      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center mb-2.5 sm:mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[#1877F2] font-semibold"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
          <span>Back</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-2.5 sm:mb-4">
        <h1 className="text-lg sm:text-xl sm:text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="px-2 sm:px-3 py-1 sm:py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button 
            onClick={markAllAsRead}
            className="text-blue-500 hover:bg-blue-50 p-1 sm:p-1.5 sm:p-2 rounded-full font-semibold text-[10px] sm:text-xs sm:text-sm"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Type filter - horizontal scroll on mobile */}
      <div className="mb-2.5 sm:mb-4 overflow-x-auto scrollbar-hide -mx-2.5 sm:-mx-3 px-2.5 sm:px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs sm:text-sm whitespace-nowrap ${typeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('mention')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs sm:text-sm whitespace-nowrap ${typeFilter === 'mention' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Mentions
          </button>
          <button
            onClick={() => setTypeFilter('reply')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs sm:text-sm whitespace-nowrap ${typeFilter === 'reply' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Replies
          </button>
          <button
            onClick={() => setTypeFilter('like')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs sm:text-sm whitespace-nowrap ${typeFilter === 'like' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Likes
          </button>
          <button
            onClick={() => setTypeFilter('solution')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs sm:text-sm whitespace-nowrap ${typeFilter === 'solution' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Solutions
          </button>
          <button
            onClick={() => setTypeFilter('badge_earned')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs sm:text-sm whitespace-nowrap ${typeFilter === 'badge_earned' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Badges
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading notifications...</p>
        ) : sortedNotifications.length === 0 ? (
          <p className="text-center text-gray-500 py-8 italic">No notifications found.</p>
        ) : (
          <>
            {newNotifications.length > 0 && (
              <>
                <h3 className="font-bold text-[13px] sm:text-[15px] sm:text-[17px] py-1.5 sm:py-2 px-2">New</h3>
                {newNotifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`flex items-center gap-2 sm:gap-3 sm:gap-4 p-2 sm:p-2.5 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.actionUrl) {
                        console.log('Navigate to:', notif.actionUrl);
                      }
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={notif.avatar} className="w-9 h-9 sm:w-11 sm:w-14 sm:h-11 sm:h-14 rounded-full" alt="Notif" />
                      <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:w-6 sm:h-5 sm:h-6 ${getTypeColor(notif.type)} border-3 sm:border-4 border-white rounded-full flex items-center justify-center text-white text-[8px] sm:text-[9px] sm:text-[10px]`}>
                        <i className={`fa-solid ${getTypeIcon(notif.type)} text-[8px] sm:text-[9px] sm:text-[10px]`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] sm:text-[13px] sm:text-[15px] ${!notif.read ? 'font-bold' : ''} line-clamp-2`}>{notif.text}</p>
                      <p className="text-[10px] sm:text-xs text-blue-500 font-semibold">{notif.time}</p>
                    </div>
                    {!notif.read && (
                       <div className="w-2 h-2 sm:w-2.5 sm:w-3 sm:h-2.5 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                    <div className="relative flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === notif.id ? null : notif.id);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full"
                      >
                        <i className="fa-solid fa-ellipsis text-sm sm:text-base"></i>
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
                <h3 className="font-bold text-[13px] sm:text-[15px] sm:text-[17px] py-1.5 sm:py-2 px-2 mt-3 sm:mt-4 border-t border-gray-200">Earlier</h3>
                {earlierNotifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`flex items-center gap-2 sm:gap-3 sm:gap-4 p-2 sm:p-2.5 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      if (notif.actionUrl) {
                        console.log('Navigate to:', notif.actionUrl);
                      }
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={notif.avatar} className="w-9 h-9 sm:w-11 sm:w-14 sm:h-11 sm:h-14 rounded-full" alt="Notif" />
                      <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:w-6 sm:h-5 sm:h-6 ${getTypeColor(notif.type)} border-3 sm:border-4 border-white rounded-full flex items-center justify-center text-white text-[8px] sm:text-[9px] sm:text-[10px]`}>
                        <i className={`fa-solid ${getTypeIcon(notif.type)} text-[8px] sm:text-[9px] sm:text-[10px]`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] sm:text-[13px] sm:text-[15px] ${!notif.read ? 'font-bold' : ''} line-clamp-2`}>{notif.text}</p>
                      <p className="text-[10px] sm:text-xs text-blue-500 font-semibold">{notif.time}</p>
                    </div>
                    {!notif.read && (
                       <div className="w-2 h-2 sm:w-2.5 sm:w-3 sm:h-2.5 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                    <div className="relative flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === notif.id ? null : notif.id);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full"
                      >
                        <i className="fa-solid fa-ellipsis text-sm sm:text-base"></i>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
