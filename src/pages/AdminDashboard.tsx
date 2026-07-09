import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../lib/firebaseApi';

interface AnalyticsOverview {
  activeUsers: number;
  totalUsers: number;
  totalSessions: number;
  peakActiveUsers: number;
  peakTime: string | null;
  messagesSent: number;
  notificationsSent: number;
  timestamp: string;
}

interface ActiveUser {
  userId: string;
  deviceInfo: { type: string; browser: string };
  geographicInfo: { country: string; city: string };
  joinTime: string;
  lastActive: string;
  pagesVisited: number;
  messagesSent: number;
}

interface HourlyStats {
  hour: string;
  users: number;
  sessions: number;
  messages: number;
  notifications: number;
  pageViews: number;
  peakUsers: number;
}

interface GeographicData {
  country: string;
  count: number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface PageViewData {
  page: string;
  count: number;
}

interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'analytics' | 'events'>('overview');

  useEffect(() => {
    // Connect to socket for real-time updates
    const socket = socketClient.connect();
    
    // Listen for analytics updates
    socketClient.on('analytics_update', (data) => {
      if (overview) {
        setOverview(prev => prev ? { ...prev, ...data } : null);
      }
      fetchOverview();
    });

    socketClient.on('analytics_event', (event: RealtimeEvent) => {
      setRealtimeEvents(prev => [event, ...prev].slice(0, 50));
    });

    socketClient.on('user_online', (data) => {
      fetchActiveUsers();
      fetchOverview();
    });

    socketClient.on('user_offline', (data) => {
      fetchActiveUsers();
      fetchOverview();
    });

    // Initial data fetch
    fetchAllData();

    // Set up auto-refresh for analytics
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
      socketClient.off('analytics_update');
      socketClient.off('analytics_event');
      socketClient.off('user_online');
      socketClient.off('user_offline');
    };
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchOverview(),
        fetchActiveUsers(),
        fetchHourlyStats(),
        fetchGeographicData(),
        fetchDeviceData(),
        fetchPageViews(),
        fetchRealtimeEvents()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const data = await analyticsApi.getOverview();
      setOverview(data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const data = await analyticsApi.getActiveUsers();
      setActiveUsers(data);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const fetchHourlyStats = async () => {
    try {
      const data = await analyticsApi.getHourlyStats(24);
      setHourlyStats(data);
    } catch (error) {
      console.error('Error fetching hourly stats:', error);
    }
  };

  const fetchGeographicData = async () => {
    try {
      const data = await analyticsApi.getGeographicData();
      setGeographicData(data);
    } catch (error) {
      console.error('Error fetching geographic data:', error);
    }
  };

  const fetchDeviceData = async () => {
    try {
      const data = await analyticsApi.getDeviceData();
      setDeviceData(data);
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  const fetchPageViews = async () => {
    try {
      const data = await analyticsApi.getPageViews();
      setPageViews(data);
    } catch (error) {
      console.error('Error fetching page views:', error);
    }
  };

  const fetchRealtimeEvents = async () => {
    try {
      const data = await analyticsApi.getRealtimeEvents(50);
      setRealtimeEvents(data);
    } catch (error) {
      console.error('Error fetching realtime events:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'user_join': return 'bg-green-500';
      case 'user_disconnect': return 'bg-red-500';
      case 'message_sent': return 'bg-blue-500';
      case 'notification_sent': return 'bg-purple-500';
      case 'page_view': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-400 font-semibold"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">NexusMind Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time user tracking and platform analytics</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Updates Active</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'overview' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'users' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Active Users
          </button>
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'analytics' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setSelectedTab('events')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'events' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Live Events
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && overview && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Active Users</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold text-green-400">{formatNumber(overview.activeUsers)}</div>
                <div className="text-xs text-gray-500 mt-1">Currently online</div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Users</span>
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-blue-400">{formatNumber(overview.totalUsers)}</div>
                <div className="text-xs text-gray-500 mt-1">Registered users</div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Sessions</span>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-purple-400">{formatNumber(overview.totalSessions)}</div>
                <div className="text-xs text-gray-500 mt-1">All time sessions</div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Peak Users</span>
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{formatNumber(overview.peakActiveUsers)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {overview.peakTime ? formatDuration(overview.peakTime) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <span className="text-gray-400 text-sm block mb-2">Messages Sent</span>
                <div className="text-2xl font-bold text-blue-400">{formatNumber(overview.messagesSent)}</div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <span className="text-gray-400 text-sm block mb-2">Notifications Sent</span>
                <div className="text-2xl font-bold text-purple-400">{formatNumber(overview.notificationsSent)}</div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <span className="text-gray-400 text-sm block mb-2">Last Updated</span>
                <div className="text-2xl font-bold text-gray-300">{overview.timestamp ? formatTime(overview.timestamp) : 'N/A'}</div>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Geographic Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {geographicData.slice(0, 12).map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(item.count)}</div>
                    <div className="text-sm text-gray-400">{item.country}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Device Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {deviceData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{formatNumber(item.count)}</div>
                    <div className="text-sm text-gray-400 capitalize">{item.device}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Users Tab */}
        {selectedTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Active Users ({activeUsers.length})</h3>
                <button
                  onClick={fetchActiveUsers}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
              
              {activeUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No active users</div>
              ) : (
                <div className="space-y-3">
                  {activeUsers.map((user, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          {user.userId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{user.userId}</div>
                          <div className="text-sm text-gray-400">
                            {user.deviceInfo.type} • {user.geographicInfo.country}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-400">Joined: {formatDuration(user.joinTime)}</div>
                        <div className="text-gray-400">Active: {formatDuration(user.lastActive)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            {/* Hourly Stats Chart */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Hourly Activity (Last 24 Hours)</h3>
              <div className="h-64 flex items-end gap-1">
                {hourlyStats.map((stat, index) => {
                  const maxUsers = Math.max(...hourlyStats.map(s => s.users));
                  const height = maxUsers > 0 ? (stat.users / maxUsers) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-600 hover:bg-blue-500 transition-colors rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${stat.hour}: ${stat.users} users`}
                      />
                      <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-left">
                        {stat.hour.split('-').pop()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Page Views */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Top Pages</h3>
              <div className="space-y-3">
                {pageViews.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-300">{item.page}</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">{formatNumber(item.count)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Events Tab */}
        {selectedTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Live Events Feed</h3>
                <button
                  onClick={fetchRealtimeEvents}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {realtimeEvents.map((event, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{event.type.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-400">{formatDuration(event.timestamp)}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {JSON.stringify(event.data).substring(0, 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
