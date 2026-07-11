import React, { useState } from 'react';
import { User } from '../types';
import Leaderboard from '../components/Leaderboard';
import { EXPERTISE_DOMAINS } from '../constants/expertise';

interface LeaderboardPageProps {
  user: User;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'domain' | 'streaks' | 'badges'>('global');
  const [selectedDomain, setSelectedDomain] = useState('technology');

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-[800px] mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Leaderboards</h1>
          <p className="text-gray-600">See who's leading the pack across different categories.</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === 'global' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⭐ Global
            </button>
            <button
              onClick={() => setActiveTab('domain')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === 'domain' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎯 Domain
            </button>
            <button
              onClick={() => setActiveTab('streaks')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === 'streaks' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔥 Streaks
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === 'badges' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏆 Badges
            </button>
          </div>

          {/* Domain Selector */}
          {activeTab === 'domain' && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Select a domain:</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {EXPERTISE_DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                      selectedDomain === domain.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {domain.icon} {domain.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Content */}
        <Leaderboard
          type={activeTab}
          domainId={activeTab === 'domain' ? selectedDomain : undefined}
          limit={50}
          timeFrame="all"
          currentUserId={user.id}
        />

        {/* How Rankings Work */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">How Rankings Work</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-semibold">Global Leaderboard</p>
                <p className="text-sm">Ranked by overall reputation points earned from solving problems, providing solutions, and receiving helpful votes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Domain Leaderboard</p>
                <p className="text-sm">Ranked by expertise scores in specific domains like Technology, Science, Engineering, and more.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-semibold">Streak Leaderboard</p>
                <p className="text-sm">Ranked by consecutive days of activity. Maintain your streak to climb higher!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold">Badge Leaderboard</p>
                <p className="text-sm">Ranked by total number of achievement badges earned. Collect them all!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
