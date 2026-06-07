import React, { useState, useEffect } from 'react';
import { User } from '../types';

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
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    allowMessages: true,
  });

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('nexus_users', JSON.stringify(users));
    }
    alert('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('nexus_notifications', JSON.stringify(notifications));
    alert('Notification settings saved!');
  };

  const handleSavePrivacy = () => {
    localStorage.setItem('nexus_privacy', JSON.stringify(privacy));
    alert('Privacy settings saved!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[56px]">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email updates about your activity</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`w-12 h-6 rounded-full transition-colors ${notifications.email ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${notifications.email ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications in browser</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                className={`w-12 h-6 rounded-full transition-colors ${notifications.push ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${notifications.push ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mentions</p>
                <p className="text-sm text-gray-500">Get notified when someone mentions you</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, mentions: !notifications.mentions })}
                className={`w-12 h-6 rounded-full transition-colors ${notifications.mentions ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${notifications.mentions ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-sm text-gray-500">Get notified for new messages</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, messages: !notifications.messages })}
                className={`w-12 h-6 rounded-full transition-colors ${notifications.messages ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${notifications.messages ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <button
              onClick={handleSaveNotifications}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Email</p>
                <p className="text-sm text-gray-500">Allow others to see your email address</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                className={`w-12 h-6 rounded-full transition-colors ${privacy.showEmail ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${privacy.showEmail ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Messages</p>
                <p className="text-sm text-gray-500">Allow others to send you messages</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, allowMessages: !privacy.allowMessages })}
                className={`w-12 h-6 rounded-full transition-colors ${privacy.allowMessages ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${privacy.allowMessages ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <button
              onClick={handleSavePrivacy}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Language & Region</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <button
              onClick={() => alert('Language settings saved!')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Language Settings
            </button>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Accessibility</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reduce Motion</p>
                <p className="text-sm text-gray-500">Reduce animations and transitions</p>
              </div>
              <button
                onClick={() => alert('Reduce motion toggled!')}
                className="w-12 h-6 rounded-full bg-gray-300"
              >
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">High Contrast</p>
                <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
              </div>
              <button
                onClick={() => alert('High contrast toggled!')}
                className="w-12 h-6 rounded-full bg-gray-300"
              >
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-1" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
            <button
              onClick={() => alert('Accessibility settings saved!')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
