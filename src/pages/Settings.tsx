import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userApi } from '../lib/firebaseApi';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    messages: true,
    replies: true,
    likes: true,
    follows: true,
    solutions: true,
    votes: true,
    system: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    allowMessages: true,
  });

  const handleSaveProfile = async () => {
    try {
      await userApi.updateUser(user.id, formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Load notification settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const profile = await userApi.getUser(user.id);
        if (profile.settings?.notifications) {
          setNotifications(profile.settings.notifications);
        }
        if (profile.settings?.privacy) {
          setPrivacy(profile.settings.privacy);
        }
      } catch (error) {
        console.error('Error loading settings from backend:', error);
      }
    };
    loadSettings();
  }, [user.id]);

  const handleSaveNotifications = async () => {
    try {
      await userApi.updateUser(user.id, {
        settings: {
          notifications: notifications
        }
      });
      alert('Notification settings saved!');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save notification settings. Please try again.');
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await userApi.updateUser(user.id, {
        settings: {
          privacy: privacy
        }
      });
      alert('Privacy settings saved!');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      alert('Failed to save privacy settings. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-2.5 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Settings</h1>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Profile Settings</h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm sm:text-base"
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Notification Settings</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Email Notifications</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Receive email updates about your activity</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.email ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.email ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Push Notifications</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Receive push notifications in browser</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.push ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.push ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
              <p className="text-[10px] sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Notification Types</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Mentions</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified when someone mentions you</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, mentions: !notifications.mentions })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.mentions ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.mentions ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Replies</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified when someone replies to your posts</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, replies: !notifications.replies })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.replies ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.replies ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Likes</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified when someone likes your content</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, likes: !notifications.likes })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.likes ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.likes ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Follows</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified when someone follows you</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, follows: !notifications.follows })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.follows ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.follows ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Solutions</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified when someone suggests a solution</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, solutions: !notifications.solutions })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.solutions ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.solutions ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Votes</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified when your content receives votes</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, votes: !notifications.votes })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.votes ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.votes ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Messages</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified for new messages</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, messages: !notifications.messages })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.messages ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.messages ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">System Notifications</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Get notified about system updates and announcements</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, system: !notifications.system })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${notifications.system ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${notifications.system ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <button
              onClick={handleSaveNotifications}
              className="bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm sm:text-base"
            >
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Privacy Settings</h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Show Email</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Allow others to see your email address</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${privacy.showEmail ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${privacy.showEmail ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Allow Messages</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Allow others to send you messages</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, allowMessages: !privacy.allowMessages })}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${privacy.allowMessages ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform transition-transform ${privacy.allowMessages ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`} />
              </button>
            </div>
            <button
              onClick={handleSavePrivacy}
              className="bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm sm:text-base"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Language & Region</h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Language</label>
              <select className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <button
              onClick={() => alert('Language settings saved!')}
              className="bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm sm:text-base"
            >
              Save Language Settings
            </button>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Accessibility</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">Reduce Motion</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Reduce animations and transitions</p>
              </div>
              <button
                onClick={() => alert('Reduce motion toggled!')}
                className="w-10 h-5 sm:w-12 sm:h-6 rounded-full bg-gray-300"
              >
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform translate-x-0.5 sm:translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs sm:text-sm">High Contrast</p>
                <p className="text-[10px] sm:text-sm text-gray-500">Increase contrast for better visibility</p>
              </div>
              <button
                onClick={() => alert('High contrast toggled!')}
                className="w-10 h-5 sm:w-12 sm:h-6 rounded-full bg-gray-300"
              >
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transform translate-x-0.5 sm:translate-x-1" />
              </button>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
            <button
              onClick={() => alert('Accessibility settings saved!')}
              className="bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm sm:text-base"
            >
              Save Accessibility Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
