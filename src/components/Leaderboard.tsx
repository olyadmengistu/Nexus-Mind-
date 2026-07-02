import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '../lib/backendApi';
import { EXPERTISE_DOMAINS } from '../constants/expertise';

interface LeaderboardEntry {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  score: number;
  streak?: number;
  badges?: number;
  problemsSolved?: number;
  solutionsProvided?: number;
  helpfulVotes?: number;
}

interface LeaderboardProps {
  type: 'global' | 'domain' | 'streaks' | 'badges';
  domainId?: string;
  limit?: number;
  timeFrame?: 'all' | 'weekly' | 'monthly';
  currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  type, 
  domainId, 
  limit = 20, 
  timeFrame = 'all',
  currentUserId 
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'all' | 'weekly' | 'monthly'>(timeFrame);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        let data;
        
        switch (type) {
          case 'global':
            data = await leaderboardApi.getGlobal(limit, selectedTimeFrame);
            setLeaderboard(data.leaderboard);
            break;
          case 'domain':
            if (domainId) {
              data = await leaderboardApi.getDomain(domainId, limit);
              setLeaderboard(data.leaderboard);
            }
            break;
          case 'streaks':
            data = await leaderboardApi.getStreaks(limit);
            setLeaderboard(data.leaderboard);
            break;
          case 'badges':
            data = await leaderboardApi.getBadges(limit);
            setLeaderboard(data.leaderboard);
            break;
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [type, domainId, limit, selectedTimeFrame]);

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

  const getDomainInfo = () => {
    if (domainId) {
      return EXPERTISE_DOMAINS.find(d => d.id === domainId);
    }
    return null;
  };

  const getScoreLabel = () => {
    switch (type) {
      case 'global':
        return 'Reputation';
      case 'domain':
        return 'Expertise Score';
      case 'streaks':
        return 'Streak Days';
      case 'badges':
        return 'Badges';
      default:
        return 'Score';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {type === 'streaks' && <span>🔥</span>}
            {type === 'badges' && <span>🏆</span>}
            {type === 'domain' && getDomainInfo()?.icon}
            {type === 'global' && <span>⭐</span>}
            {type === 'domain' ? `${getDomainInfo()?.name} Leaderboard` : `${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`}
          </h2>
          
          {type === 'global' && (
            <select
              value={selectedTimeFrame}
              onChange={(e) => setSelectedTimeFrame(e.target.value as 'all' | 'weekly' | 'monthly')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
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
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No leaderboard data available yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {leaderboard.map((entry, index) => (
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
                <p className="text-xl font-bold text-blue-600">{entry.score}</p>
                <p className="text-xs text-gray-500">{getScoreLabel()}</p>
              </div>
              
              {type === 'domain' && (
                <div className="text-right text-xs text-gray-600">
                  <div>📝 {entry.problemsSolved}</div>
                  <div>💡 {entry.solutionsProvided}</div>
                </div>
              )}
              
              {type === 'global' && entry.streak !== undefined && (
                <div className="text-right text-xs text-gray-600">
                  <div>🔥 {entry.streak} day streak</div>
                  <div>🏆 {entry.badges} badges</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
