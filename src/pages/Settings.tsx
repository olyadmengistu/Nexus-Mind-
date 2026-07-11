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

  const handleSaveProfile = async () => {
    try {
      await userApi.updateUser(user.id, formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-2.5 sm:p-6">
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

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Profile Settings</h1>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="bg-blue-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base sm:text-lg font-medium"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
