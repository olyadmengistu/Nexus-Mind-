import React, { useState, useEffect } from 'react';
import { Badge, BadgeProgress } from '../types';
import { badgesApi } from '../lib/firebaseApi';
import { RARITY_COLORS, RARITY_BORDER, CATEGORY_ICONS } from '../constants/badges';

interface BadgeGridProps {
  userId: string;
  showProgress?: boolean;
  filterCategory?: 'all' | 'solving' | 'helping' | 'streaks' | 'expertise' | 'social' | 'special';
  onBadgeClick?: (badge: Badge) => void;
  showShareButton?: boolean;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ 
  userId, 
  showProgress = true,
  filterCategory = 'all',
  onBadgeClick,
  showShareButton = false
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        setLoading(true);
        const data = await badgesApi.getUserBadges(userId);
        setBadges(data.badges);
        setProgress(data.progress);
      } catch (error) {
        console.error('Error loading badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [userId]);

  const getBadgeProgress = (badgeId: string) => {
    return progress.find(p => p.badgeId === badgeId);
  };

  const getFilteredBadges = () => {
    if (filterCategory === 'all') return badges;
    return badges.filter(b => b.category === filterCategory);
  };

  const handleShareBadge = (badge: Badge) => {
    const shareText = `🎉 I just earned the "${badge.name}" badge on NexusMind! ${badge.description}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `I earned the ${badge.name} badge!`,
        text: shareText,
        url: shareUrl
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
        alert('Badge shared! Link copied to clipboard.');
      }).catch(() => {
        alert('Could not share badge. Please try again.');
      });
    }
  };

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    if (onBadgeClick) onBadgeClick(badge);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-square"></div>
          </div>
        ))}
      </div>
    );
  }

  const filteredBadges = getFilteredBadges();

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {filteredBadges.map((badge) => {
          const badgeProgress = getBadgeProgress(badge.id);
          const isUnlocked = badge.earnedAt !== undefined || badgeProgress?.unlocked;
          
          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`relative group cursor-pointer transition-all hover:scale-105 ${
                isUnlocked ? '' : 'opacity-50 grayscale'
              }`}
            >
              <div
                className={`aspect-square rounded-lg bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} border-2 ${RARITY_BORDER[badge.rarity]} flex flex-col items-center justify-center p-2 shadow-lg`}
              >
                <span className="text-3xl sm:text-4xl mb-1">{badge.icon}</span>
                <span className="text-xs font-bold text-white text-center leading-tight">
                  {badge.name}
                </span>
                {isUnlocked && (
                  <span className="absolute top-1 right-1 text-xs">✓</span>
                )}
              </div>
              
              {showProgress && badgeProgress && !isUnlocked && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.min((badgeProgress.currentProgress / badgeProgress.maxProgress) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {badgeProgress.currentProgress}/{badgeProgress.maxProgress}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        
        {filteredBadges.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p>No badges in this category yet.</p>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div
                className={`w-24 h-24 mx-auto rounded-lg bg-gradient-to-br ${RARITY_COLORS[selectedBadge.rarity]} border-4 ${RARITY_BORDER[selectedBadge.rarity]} flex items-center justify-center mb-4`}
              >
                <span className="text-5xl">{selectedBadge.icon}</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${RARITY_COLORS[selectedBadge.rarity]}`}>
                  {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                </span>
                <span className="text-gray-500 text-sm">
                  {CATEGORY_ICONS[selectedBadge.category]} {selectedBadge.category}
                </span>
              </div>
              
              {selectedBadge.earnedAt && (
                <p className="text-sm text-gray-500 mb-4">
                  Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </p>
              )}
              
              {showProgress && !selectedBadge.earnedAt && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.min(((selectedBadge.progress || 0) / (selectedBadge.maxProgress || 1)) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Progress: {selectedBadge.progress || 0}/{selectedBadge.maxProgress}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
              
              {showShareButton && selectedBadge.earnedAt && (
                <button
                  onClick={() => handleShareBadge(selectedBadge)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors mt-2"
                >
                  Share Badge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BadgeGrid;
