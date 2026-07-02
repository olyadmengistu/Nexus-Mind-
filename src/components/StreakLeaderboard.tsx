import React, { useState, useEffect } from 'react';
import { streakApi } from '../lib/backendApi';
import StreakBadge from './StreakBadge';

interface LeaderboardEntry {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  streak: number;
  longestStreak: number;
}

interface StreakLeaderboardProps {
  limit?: number;
  showCurrentUser?: boolean;
  currentUserId?: string;
}

const StreakLeaderboard: React.FC<StreakLeaderboardProps> = ({ 
  limit = 50, 
  showCurrentUser = true,
  currentUserId 
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await streakApi.getLeaderboard(limit);
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error('Error loading streak leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [limit]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-600';
  };

  const currentUserRank = leaderboard.findIndex(entry => entry.userId === currentUserId);
  const currentUserEntry = currentUserRank >= 0 ? leaderboard[currentUserRank] : null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🔥</span>
          Streak Leaderboard
        </h2>
      </div>

      {showCurrentUser && currentUserEntry && currentUserRank > 2 && (
        <div className="bg-blue-50 p-4 border-b border-blue-200">
          <div className="flex items-center gap-4">
            <span className={`text-lg font-bold ${getRankColor(currentUserRank + 1)}`}>
              {getRankIcon(currentUserRank + 1)}
            </span>
            <img src={currentUserEntry.avatar} className="w-10 h-10 rounded-full" alt={currentUserEntry.name} />
            <div className="flex-1">
              <p className="font-semibold">{currentUserEntry.name}</p>
              <p className="text-sm text-gray-500">@{currentUserEntry.username}</p>
            </div>
            <StreakBadge streak={currentUserEntry.streak} size="small" />
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {leaderboard.slice(0, 10).map((entry, index) => (
          <div 
            key={entry.userId}
            className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
              entry.userId === currentUserId ? 'bg-blue-50' : ''
            }`}
          >
            <span className={`text-lg font-bold w-8 ${getRankColor(index + 1)}`}>
              {getRankIcon(index + 1)}
            </span>
            <img src={entry.avatar} className="w-10 h-10 rounded-full" alt={entry.name} />
            <div className="flex-1">
              <p className="font-semibold">{entry.name}</p>
              <p className="text-sm text-gray-500">@{entry.username}</p>
            </div>
            <div className="text-right">
              <StreakBadge streak={entry.streak} size="small" />
              {entry.longestStreak > entry.streak && (
                <p className="text-xs text-gray-500 mt-1">Best: {entry.longestStreak}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No streak data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default StreakLeaderboard;
