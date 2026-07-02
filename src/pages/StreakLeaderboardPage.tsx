import React from 'react';
import { User } from '../types';
import StreakLeaderboard from '../components/StreakLeaderboard';

interface StreakLeaderboardPageProps {
  user: User;
}

const StreakLeaderboardPage: React.FC<StreakLeaderboardPageProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-[800px] mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🔥 Streak Leaderboard</h1>
          <p className="text-gray-600">See who's on fire with the longest solving streaks!</p>
        </div>

        <StreakLeaderboard 
          limit={50} 
          showCurrentUser={true} 
          currentUserId={user.id} 
        />

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">How Streaks Work</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-semibold">Daily Activity</p>
                <p className="text-sm">Solve a problem or contribute a solution each day to maintain your streak.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❄️</span>
              <div>
                <p className="font-semibold">Streak Freezes</p>
                <p className="text-sm">Use streak freezes to protect your streak if you miss a day (max 3 freezes).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold">Longest Streak</p>
                <p className="text-sm">Your personal best is tracked separately from your current streak.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Milestones</p>
                <p className="text-sm">Celebrate when you hit 7, 14, 30, 50, and 100-day streaks!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakLeaderboardPage;
