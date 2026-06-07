import React, { useState, useEffect } from 'react';
import { User } from '../types';

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

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('nexus_activity_log') || '[]');
    const userActivities = stored.filter((activity: Activity) => activity.id.startsWith(user.id));
    setActivities(userActivities);
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
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
      case 'post': return 'text-blue-500';
      case 'vote': return 'text-green-500';
      case 'comment': return 'text-purple-500';
      case 'save': return 'text-yellow-500';
      case 'login': return 'text-gray-500';
      case 'profile_update': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[56px]">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Activity Log</h1>
        
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fa-solid fa-clock-rotate-left text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No activity yet</h2>
            <p className="text-gray-500">Your activity will appear here as you use NexusMind.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="space-y-4">
                {activities.map((activity) => (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
