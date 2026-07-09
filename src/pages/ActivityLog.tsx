import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { activityApi } from '../lib/firebaseApi';

interface ActivityLogProps {
  user: User;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ user }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'posts' | 'interactions' | 'profile'>('all');

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await activityApi.getUserActivities(user.id);
        const formattedActivities = data.map((log: any) => ({
          id: log.id,
          type: log.action,
          description: getActivityDescription(log.action, log.details),
          timestamp: log.timestamp
        }));
        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error loading activities from backend:', error);
        setActivities([]);
      }
    };
    loadActivities();
  }, [user.id]);

  const getActivityDescription = (action: string, metadata: any) => {
    switch (action) {
      case 'created_post': return 'Created a new post';
      case 'deleted_post': return 'Deleted a post';
      case 'added_solution': return 'Added a solution to a problem';
      case 'created_group': return 'Created a new group';
      case 'joined_group': return 'Joined a group';
      case 'updated_profile': return 'Updated profile information';
      default: return `Performed action: ${action}`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created_post': return 'fa-pen-to-square';
      case 'deleted_post': return 'fa-trash';
      case 'added_solution': return 'fa-lightbulb';
      case 'created_group': return 'fa-users';
      case 'joined_group': return 'fa-user-plus';
      case 'updated_profile': return 'fa-user-pen';
      case 'post': return 'fa-pen-to-square';
      case 'vote': return 'fa-arrow-up';
      case 'comment': return 'fa-comment';
      case 'save': return 'fa-bookmark';
      case 'login': return 'fa-right-to-bracket';
      case 'profile_update': return 'fa-user-pen';
      default: return 'fa-circle-info';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created_post': return 'text-blue-500';
      case 'deleted_post': return 'text-red-500';
      case 'added_solution': return 'text-yellow-500';
      case 'created_group': return 'text-purple-500';
      case 'joined_group': return 'text-green-500';
      case 'updated_profile': return 'text-indigo-500';
      case 'post': return 'text-blue-500';
      case 'vote': return 'text-green-500';
      case 'comment': return 'text-purple-500';
      case 'save': return 'text-yellow-500';
      case 'login': return 'text-gray-500';
      case 'profile_update': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'posts') return activity.type.includes('post') || activity.type.includes('solution');
    if (filter === 'interactions') return activity.type.includes('vote') || activity.type.includes('comment') || activity.type.includes('save');
    if (filter === 'profile') return activity.type.includes('profile') || activity.type.includes('group');
    return true;
  });

  const analytics = {
    totalActivities: activities.length,
    postsCreated: activities.filter(a => a.type === 'created_post').length,
    solutionsAdded: activities.filter(a => a.type === 'added_solution').length,
    groupsJoined: activities.filter(a => a.type === 'joined_group').length,
    profileUpdates: activities.filter(a => a.type === 'updated_profile').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[#1877F2] font-semibold"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
            <span>Back</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Activity Log</h1>
        
        {/* Analytics Cards */}
        {activities.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{analytics.totalActivities}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{analytics.postsCreated}</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">{analytics.solutionsAdded}</p>
              <p className="text-sm text-gray-600">Solutions</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-3xl font-bold text-purple-500">{analytics.groupsJoined}</p>
              <p className="text-sm text-gray-600">Groups</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-3xl font-bold text-indigo-500">{analytics.profileUpdates}</p>
              <p className="text-sm text-gray-600">Updates</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {activities.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6 p-2">
            <div className="flex gap-2">
              {(['all', 'posts', 'interactions', 'profile'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold capitalize transition-colors ${
                    filter === f ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fa-solid fa-clock-rotate-left text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No activity yet</h2>
            <p className="text-gray-500">Your activity will appear here as you use NexusMind.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <i className={`fa-solid ${getActivityIcon(activity.type)}`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {filteredActivities.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No activities match the selected filter.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
